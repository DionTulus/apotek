<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Api\Concerns\PresentsResources;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Pembayaran: menyediakan Snap token Midtrans untuk pesanan transfer,
 * dan endpoint cek status (memakai PaymentService yang sama dengan web).
 */
class PaymentController extends Controller
{
    use PresentsResources;

    public function show(Request $request, string $orderNumber, PaymentService $paymentService): JsonResponse
    {
        $order = $this->findOwn($request, $orderNumber);

        $snapToken = null;
        if ($order->payment_method === PaymentMethod::MIDTRANS && $order->payment_status === PaymentStatus::UNPAID) {
            try {
                $snapToken = $paymentService->createSnapToken($order);
            } catch (\Exception $e) {
                // Fallback token ditangani di dalam PaymentService.
            }
        }

        return response()->json([
            'order' => $this->presentOrder($order, true),
            'snap_token' => $snapToken,
            'midtrans_client_key' => config('midtrans.client_key'),
            'is_production' => (bool) config('midtrans.is_production', false),
        ]);
    }

    public function checkStatus(Request $request, string $orderNumber, PaymentService $paymentService): JsonResponse
    {
        $order = $this->findOwn($request, $orderNumber);
        $paymentService->checkStatus($order);

        return response()->json([
            'message' => 'Status pembayaran diperbarui.',
            'order' => $this->presentOrder($order->fresh(), true),
        ]);
    }

    protected function findOwn(Request $request, string $orderNumber): Order
    {
        return Order::with(['items.product', 'payment', 'shippingMethod', 'promo', 'prescription'])
            ->where('order_number', $orderNumber)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
    }
}
