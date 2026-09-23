<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\Cart;
use App\Models\Promo;
use App\Models\ShippingMethod;
use App\Services\CheckoutService;
use Exception;
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

        $shippingMethods = ShippingMethod::active()->get();

        $subtotal = 0;
        $totalWeightGram = 0;
        $hasPrescriptionProducts = false;

        foreach ($cart->items as $item) {
            if ($item->product) {
                $subtotal += $item->product->price * $item->qty;
                $totalWeightGram += $item->product->weight_gram * $item->qty;
                if ($item->product->requires_prescription) {
                    $hasPrescriptionProducts = true;
                }
            }
        }

        $activePromos = Promo::active()->get();

        return Inertia::render('store/checkout', [
            'cartItems' => $cart->items,
            'addresses' => $addresses,
            'shippingMethods' => $shippingMethods,
            'subtotal' => $subtotal,
            'totalWeightGram' => $totalWeightGram,
            'hasPrescriptionProducts' => $hasPrescriptionProducts,
            'activePromos' => $activePromos,
        ]);
    }

    public function store(Request $request, CheckoutService $checkoutService): RedirectResponse
    {
        $request->validate([
            'address_id' => 'nullable|exists:addresses,id',
            'recipient_name' => 'required_without:address_id|nullable|string|max:100',
            'recipient_phone' => 'required_without:address_id|nullable|string|max:20',
            'full_address' => 'required_without:address_id|nullable|string|max:500',
            'shipping_method_id' => 'required|exists:shipping_methods,id',
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
            ];
        } else {
            $addressData = [
                'recipient_name' => $request->input('recipient_name'),
                'recipient_phone' => $request->input('recipient_phone'),
                'full_address' => $request->input('full_address'),
            ];
        }

        try {
            $order = $checkoutService->placeOrder(
                user: $user,
                addressData: $addressData,
                shippingMethodId: (int) $request->input('shipping_method_id'),
                paymentMethodStr: $request->input('payment_method'),
                promoCode: $request->input('promo_code'),
                prescriptionFile: $request->file('prescription_file'),
                note: $request->input('note')
            );

            return redirect()->route('payment.show', $order->order_number)
                ->with('success', 'Pesanan berhasil dibuat!');
        } catch (Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
