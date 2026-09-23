<?php

namespace App\Http\Controllers\Store;

use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function show(Request $request, string $orderNumber, PaymentService $paymentService): Response
    {
        $user = $request->user();

        $order = Order::with(['items.product', 'payment', 'shippingMethod', 'prescription', 'promo'])
            ->where('order_number', $orderNumber)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $snapToken = null;
        if ($order->payment_method === PaymentMethod::MIDTRANS && $order->payment_status->value === 'unpaid') {
            try {
                $snapToken = $paymentService->createSnapToken($order);
            } catch (\Exception $e) {
                // Token error fallback handled in PaymentService
            }
        }

        return Inertia::render('store/payment', [
            'order' => $order,
            'snapToken' => $snapToken,
            'midtransClientKey' => config('midtrans.client_key'),
        ]);
    }

    public function checkStatus(Request $request, string $orderNumber, PaymentService $paymentService): RedirectResponse
    {
        $user = $request->user();

        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $paymentService->checkStatus($order);

        return back()->with('success', 'Status pembayaran berhasil diperbarui.');
    }
}
