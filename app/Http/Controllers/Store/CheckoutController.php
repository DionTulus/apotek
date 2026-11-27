<?php

namespace App\Http\Controllers\Store;

use App\Exceptions\BiteshipException;
use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\Cart;
use App\Models\Promo;
use App\Models\User;
use App\Services\BiteshipService;
use App\Services\CheckoutService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        $cart = Cart::with(['items.product.category'])
            ->where('user_id', $user->id)
            ->first();

        if (! $cart || $cart->items->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Keranjang belanja Anda kosong.');
        }

        $addresses = Address::where('user_id', $user->id)
            ->orderBy('is_default', 'desc')
            ->get();

        $subtotal = 0;
        $hasPrescriptionProducts = false;

        foreach ($cart->items as $item) {
            if ($item->product) {
                $subtotal += $item->product->price * $item->qty;
                if ($item->product->requires_prescription) {
                    $hasPrescriptionProducts = true;
                }
            }
        }

        $activePromos = Promo::active()->get();

        return Inertia::render('store/checkout', [
            'cartItems' => $cart->items,
            'addresses' => $addresses,
            'subtotal' => $subtotal,
            'hasPrescriptionProducts' => $hasPrescriptionProducts,
            'activePromos' => $activePromos,
        ]);
    }

    public function rates(Request $request, BiteshipService $biteshipService): JsonResponse
    {
        $validated = $request->validate([
            'address_id' => 'nullable|integer',
            'recipient_postal_code' => 'required_without:address_id|digits_between:5,10',
            'payment_method' => 'required|in:midtrans,cod',
            'promo_code' => 'nullable|string|max:50',
        ]);

        $postalCode = $this->destinationPostalCode($request, $validated);

        try {
            return response()->json([
                'rates' => $this->quoteRates(
                    $request->user(),
                    $postalCode,
                    $validated['payment_method'],
                    $validated['promo_code'] ?? null,
                    $biteshipService
                ),
            ]);
        } catch (BiteshipException $exception) {
            return response()->json(['message' => $exception->getMessage()], 502);
        }
    }

    public function store(Request $request, BiteshipService $biteshipService, CheckoutService $checkoutService): RedirectResponse
    {
        $validated = $request->validate([
            'address_id' => 'nullable|exists:addresses,id',
            'recipient_name' => 'required_without:address_id|nullable|string|max:100',
            'recipient_phone' => 'required_without:address_id|nullable|string|max:20',
            'full_address' => 'required_without:address_id|nullable|string|max:500',
            'recipient_postal_code' => 'required_without:address_id|digits_between:5,10',
            'courier_company' => 'required|string|max:50',
            'courier_type' => 'required|string|max:50',
            'shipping_cost' => 'required|integer|min:0',
            'payment_method' => 'required|in:midtrans,cod',
            'promo_code' => 'nullable|string|max:50',
            'prescription_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'note' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        if ($request->filled('address_id')) {
            $address = Address::where('user_id', $user->id)
                ->where('id', $request->input('address_id'))
                ->firstOrFail();

            $addressData = [
                'recipient_name' => $address->recipient_name,
                'recipient_phone' => $address->phone,
                'full_address' => "{$address->address_line}, {$address->district}, {$address->city}, {$address->province} {$address->postal_code}",
                'recipient_postal_code' => $address->postal_code,
            ];
        } else {
            $addressData = [
                'recipient_name' => $request->input('recipient_name'),
                'recipient_phone' => $request->input('recipient_phone'),
                'full_address' => $request->input('full_address'),
                'recipient_postal_code' => $request->input('recipient_postal_code'),
            ];
        }

        try {
            $rates = $this->quoteRates(
                $user,
                (int) $addressData['recipient_postal_code'],
                $validated['payment_method'],
                $validated['promo_code'] ?? null,
                $biteshipService
            );
            $selectedRate = collect($rates)->first(fn (array $rate) => $rate['company'] === $validated['courier_company']
                && $rate['courier_type'] === $validated['courier_type']);

            if (! $selectedRate || $selectedRate['price'] !== (int) $validated['shipping_cost']) {
                return back()->with('error', 'Tarif pengiriman berubah atau layanan tidak tersedia. Muat ulang pilihan kurir sebelum melanjutkan.');
            }

            if ($validated['payment_method'] === 'cod' && ! $selectedRate['available_for_cash_on_delivery']) {
                return back()->with('error', 'Layanan kurir yang dipilih tidak mendukung pembayaran COD.');
            }

            $order = $checkoutService->placeOrder(
                user: $user,
                addressData: $addressData,
                shippingCost: $selectedRate['price'],
                shippingOption: $selectedRate,
                paymentMethodStr: $request->input('payment_method'),
                promoCode: $request->input('promo_code'),
                prescriptionFile: $request->file('prescription_file'),
                note: $request->input('note')
            );

            return redirect()->route('payment.show', $order->order_number)
                ->with('success', 'Pesanan berhasil dibuat!');
        } catch (BiteshipException $e) {
            return back()->with('error', $e->getMessage());
        } catch (Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function destinationPostalCode(Request $request, array $validated): int
    {
        if (! empty($validated['address_id'])) {
            return (int) Address::where('user_id', $request->user()->id)
                ->whereKey($validated['address_id'])
                ->firstOrFail()
                ->postal_code;
        }

        return (int) $validated['recipient_postal_code'];
    }

    /**
     * @return array<int, array{company: string, courier_name: string, courier_type: string, service_name: string, duration: string, price: int, available_for_cash_on_delivery: bool}>
     */
    private function quoteRates(
        User $user,
        int $destinationPostalCode,
        string $paymentMethod,
        ?string $promoCode,
        BiteshipService $biteshipService
    ): array {
        $cart = Cart::with('items.product')->where('user_id', $user->id)->first();
        $items = $cart?->items
            ->filter(fn ($item) => $item->product !== null)
            ->map(fn ($item) => [
                'name' => $item->product->name,
                'description' => $item->product->name,
                'sku' => $item->product->sku,
                'value' => (int) $item->product->price,
                'quantity' => (int) $item->qty,
                'weight' => max(1, (int) $item->product->weight_gram),
            ])
            ->values()
            ->all() ?? [];

        $subtotal = (int) ($cart?->items
            ->sum(fn ($item) => ($item->product->price ?? 0) * $item->qty) ?? 0);
        $discount = $this->promoDiscount($promoCode, $subtotal);

        return $biteshipService->rates(
            $destinationPostalCode,
            $items,
            $paymentMethod === 'cod' ? max(0, $subtotal - $discount) : null
        );
    }

    private function promoDiscount(?string $promoCode, int $subtotal): int
    {
        if (! $promoCode) {
            return 0;
        }

        $promo = Promo::active()->where('code', strtoupper($promoCode))->first();
        if (! $promo || $subtotal < $promo->min_purchase) {
            return 0;
        }

        $discount = $promo->type === 'percentage'
            ? (int) round(($subtotal * $promo->value) / 100)
            : (int) $promo->value;

        if ($promo->type === 'percentage' && $promo->max_discount) {
            $discount = min($discount, $promo->max_discount);
        }

        return min($discount, $subtotal);
    }
}
