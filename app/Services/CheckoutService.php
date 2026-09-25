<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\PrescriptionStatus;
use App\Enums\StockMovementType;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Payment;
use App\Models\Prescription;
use App\Models\Product;
use App\Models\Promo;
use App\Models\ShippingMethod;
use App\Models\StockMovement;
use App\Models\User;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutService
{
    public function __construct(
        protected ShippingService $shippingService
    ) {}

    public function placeOrder(
        User $user,
        array $addressData,
        int $shippingMethodId,
        string $paymentMethodStr,
        ?string $promoCode = null,
        ?UploadedFile $prescriptionFile = null,
        ?string $note = null
    ): Order {
        return DB::transaction(function () use (
            $user,
            $addressData,
            $shippingMethodId,
            $paymentMethodStr,
            $promoCode,
            $prescriptionFile,
            $note
        ) {
            $cart = Cart::with(['items.product'])->where('user_id', $user->id)->first();

            if (! $cart || $cart->items->isEmpty()) {
                throw new Exception('Keranjang belanja Anda kosong.');
            }

            $shippingMethod = ShippingMethod::active()->findOrFail($shippingMethodId);

            $paymentMethod = PaymentMethod::from($paymentMethodStr);
            if ($paymentMethod === PaymentMethod::COD && ! $shippingMethod->is_cod_available) {
                throw new Exception('Metode pengiriman yang dipilih tidak mendukung COD.');
            }

            $subtotal = 0;
            $totalWeightGram = 0;
            $hasPrescriptionProducts = false;

            // Validate stock and compute totals
            foreach ($cart->items as $item) {
                /** @var Product $product */
                $product = Product::where('id', $item->product_id)->lockForUpdate()->first();

                if (! $product || ! $product->is_active) {
                    throw new Exception("Produk {$item->product?->name} sedang tidak aktif.");
                }

                if ($product->stock < $item->qty) {
                    throw new Exception("Stok produk {$product->name} tidak mencukupi (tersedia: {$product->stock}).");
                }

                if ($product->requires_prescription) {
                    $hasPrescriptionProducts = true;
                }

                $subtotal += $product->price * $item->qty;
                $totalWeightGram += $product->weight_gram * $item->qty;
            }

            // Calculate shipping cost
            $shippingCost = $this->shippingService->calculateCost($shippingMethod, $totalWeightGram);

            // Promo discount
            $discountTotal = 0;
            $promoId = null;
            if ($promoCode) {
                $promo = Promo::active()
                    ->where('code', strtoupper($promoCode))
                    ->first();

                if ($promo && $subtotal >= $promo->min_purchase) {
                    $promoId = $promo->id;
                    $discountTotal = $promo->discountFor($subtotal);
                }
            }

            $grandTotal = max(0, $subtotal + $shippingCost - $discountTotal);

            // Handle Prescription
            $prescriptionId = null;
            if ($prescriptionFile) {
                $filePath = $prescriptionFile->store('prescriptions', 'public');
                $prescription = Prescription::create([
                    'user_id' => $user->id,
                    'file_path' => $filePath,
                    'status' => PrescriptionStatus::PENDING,
                ]);
                $prescriptionId = $prescription->id;
            }

            // Initial status logic
            if ($hasPrescriptionProducts) {
                $initialStatus = OrderStatus::AWAITING_PRESCRIPTION;
            } elseif ($paymentMethod === PaymentMethod::COD) {
                $initialStatus = OrderStatus::PROCESSING;
            } else {
                $initialStatus = OrderStatus::PENDING_PAYMENT;
            }

            // Generate unique Order Number
            $orderNumber = 'ORD-'.now()->format('Ymd').'-'.strtoupper(Str::random(5));

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $user->id,
                'status' => $initialStatus,
                'payment_method' => $paymentMethod,
                'payment_status' => PaymentStatus::UNPAID,
                'subtotal' => $subtotal,
                'discount_total' => $discountTotal,
                'shipping_cost' => $shippingCost,
                'grand_total' => $grandTotal,
                'promo_id' => $promoId,
                'shipping_method_id' => $shippingMethod->id,
                'prescription_id' => $prescriptionId,
                'recipient_name' => $addressData['recipient_name'],
                'recipient_phone' => $addressData['recipient_phone'],
                'shipping_address' => $addressData['full_address'],
                'note' => $note,
                'expires_at' => now()->addHours(24),
            ]);

            // Save items and deduct stock
            foreach ($cart->items as $item) {
                $product = Product::find($item->product_id);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'price' => $product->price,
                    'cost_price' => $product->cost_price,
                    'qty' => $item->qty,
                    'subtotal' => $product->price * $item->qty,
                ]);

                // Deduct stock
                $product->decrement('stock', $item->qty);

                // Record stock movement
                StockMovement::create([
                    'product_id' => $product->id,
                    'type' => StockMovementType::SALE,
                    'qty' => -$item->qty,
                    'stock_after' => $product->stock,
                    'reference_type' => Order::class,
                    'reference_id' => $order->id,
                    'note' => "Penjualan Order #{$order->order_number}",
                    'created_by' => $user->id,
                ]);
            }

            // Create initial OrderStatusHistory
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => $initialStatus,
                'note' => 'Pesanan berhasil dibuat oleh pelanggan.',
                'created_by' => $user->id,
            ]);

            // Create initial Payment record
            Payment::create([
                'order_id' => $order->id,
                'provider' => $paymentMethodStr === 'cod' ? 'cod' : 'midtrans',
                'gross_amount' => $grandTotal,
                'status' => PaymentStatus::UNPAID,
            ]);

            // Clear Cart
            $cart->items()->delete();

            return $order;
        });
    }
}
