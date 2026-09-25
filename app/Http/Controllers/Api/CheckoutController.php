<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\PresentsResources;
use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\Cart;
use App\Models\Promo;
use App\Models\ShippingMethod;
use App\Services\CheckoutService;
use App\Services\ShippingService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Checkout: ringkasan pesanan (preview) + pembuatan pesanan.
 * Semua aturan bisnis (stok, COD, resep, promo, ongkir) ditegakkan
 * oleh CheckoutService yang sama dengan storefront web.
 */
class CheckoutController extends Controller
{
    use PresentsResources;

    public function __construct(
        protected CheckoutService $checkoutService,
        protected ShippingService $shippingService,
    ) {}

    /**
     * Ringkasan sebelum memesan: item, subtotal, berat, metode kirim,
     * alamat, dan bendera produk wajib resep.
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        $cart = Cart::with(['items.product.category'])->where('user_id', $user->id)->first();

        if (! $cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Keranjang belanja Anda kosong.'], 422);
        }

        $subtotal = 0;
        $weight = 0;
        $hasPrescription = false;
        foreach ($cart->items as $item) {
            if (! $item->product) {
                continue;
            }
            $subtotal += $item->product->price * $item->qty;
            $weight += $item->product->weight_gram * $item->qty;
            $hasPrescription = $hasPrescription || $item->product->requires_prescription;
        }

        $shippingMethods = ShippingMethod::active()->get();

        return response()->json([
            'items' => $cart->items->map(fn ($i) => $this->presentCartItem($i))->values()->all(),
            'subtotal' => $subtotal,
            'total_weight_gram' => $weight,
            'has_prescription_products' => $hasPrescription,
            'addresses' => Address::where('user_id', $user->id)->orderByDesc('is_default')->get()
                ->map(fn ($a) => $this->presentAddress($a))->values()->all(),
            'shipping_methods' => $shippingMethods->map(fn ($m) => $this->presentShippingMethod($m))->values()->all(),
            'promos' => Promo::active()->get()->map(fn ($p) => $this->presentPromo($p))->values()->all(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'address_id' => ['nullable', 'exists:addresses,id'],
            'recipient_name' => ['required_without:address_id', 'nullable', 'string', 'max:100'],
            'recipient_phone' => ['required_without:address_id', 'nullable', 'string', 'max:20'],
            'full_address' => ['required_without:address_id', 'nullable', 'string', 'max:500'],
            'shipping_method_id' => ['required', 'exists:shipping_methods,id'],
            'payment_method' => ['required', 'in:midtrans,cod'],
            'promo_code' => ['nullable', 'string', 'max:50'],
            'prescription_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $user = $request->user();

        if ($request->filled('address_id')) {
            $address = Address::where('user_id', $user->id)->where('id', $data['address_id'])->firstOrFail();
            $addressData = [
                'recipient_name' => $address->recipient_name,
                'recipient_phone' => $address->phone,
                'full_address' => trim("{$address->address_line}, {$address->district}, {$address->city}, {$address->province} {$address->postal_code}", ', '),
            ];
        } else {
            $addressData = [
                'recipient_name' => $data['recipient_name'],
                'recipient_phone' => $data['recipient_phone'],
                'full_address' => $data['full_address'],
            ];
        }

        try {
            $order = $this->checkoutService->placeOrder(
                user: $user,
                addressData: $addressData,
                shippingMethodId: (int) $data['shipping_method_id'],
                paymentMethodStr: $data['payment_method'],
                promoCode: $data['promo_code'] ?? null,
                prescriptionFile: $request->file('prescription_file'),
                note: $data['note'] ?? null,
            );
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Pesanan berhasil dibuat.',
            'data' => $this->presentOrder($order->fresh(), true),
        ], 201);
    }
}
