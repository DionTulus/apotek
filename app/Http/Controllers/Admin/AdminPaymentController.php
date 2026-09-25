<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\FinanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminPaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::with(['user', 'payment'])
            ->when($request->filled('method'), fn ($q) => $q->where('payment_method', $request->input('method')))
            ->when($request->filled('payment_status'), fn ($q) => $q->where('payment_status', $request->input('payment_status')))
            ->when($request->filled('search'), fn ($q) => $q->where('order_number', 'like', "%{$request->input('search')}%")
                ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$request->input('search')}%")));

        $orders = $query->whereIn('status', [
            OrderStatus::PENDING_PAYMENT,
            OrderStatus::PAID,
            OrderStatus::PROCESSING,
            OrderStatus::DELIVERED,
        ])->latest()->paginate(20)->withQueryString();

        return Inertia::render('admin/payments/index', [
            'orders'  => $orders,
            'filters' => (object) $request->only('method', 'payment_status', 'search'),
        ]);
    }

    /**
     * Confirm COD payment when goods are delivered.
     * Marks order as completed and records income.
     */
    public function confirmCod(Request $request, Order $order, FinanceService $financeService): RedirectResponse
    {
        if ($order->payment_method !== PaymentMethod::COD) {
            return back()->with('error', 'Pesanan ini bukan metode COD.');
        }

        if (!in_array($order->status, [OrderStatus::DELIVERED, OrderStatus::SHIPPED])) {
            return back()->with('error', 'Pesanan belum dalam status dikirim/diterima.');
        }

        DB::transaction(function () use ($order, $request, $financeService) {
            $order->update([
                'status'         => OrderStatus::COMPLETED,
                'payment_status' => PaymentStatus::PAID,
                'paid_at'        => now(),
                'completed_at'   => now(),
            ]);

            $order->statusHistories()->create([
                'status'     => OrderStatus::COMPLETED,
                'note'       => 'Pembayaran COD dikonfirmasi oleh Admin.',
                'created_by' => $request->user()->id,
            ]);

            $financeService->recordSale($order);
        });

        return back()->with('success', 'Pembayaran COD berhasil dikonfirmasi. Pesanan selesai.');
    }

    /**
     * Confirm manual transfer payment (bank transfer outside Midtrans).
     */
    public function confirmManual(Request $request, Payment $payment): RedirectResponse
    {
        $order = $payment->order;

        if ($order->status !== OrderStatus::PENDING_PAYMENT) {
            return back()->with('error', 'Pesanan tidak dalam status menunggu pembayaran.');
        }

        DB::transaction(function () use ($payment, $order, $request) {
            $payment->update([
                'status'  => PaymentStatus::PAID,
                'paid_at' => now(),
            ]);

            $order->update([
                'status'         => OrderStatus::PROCESSING,
                'payment_status' => PaymentStatus::PAID,
                'paid_at'        => now(),
            ]);

            $order->statusHistories()->create([
                'status'     => OrderStatus::PROCESSING,
                'note'       => 'Transfer manual dikonfirmasi oleh Admin.',
                'created_by' => $request->user()->id,
            ]);
        });

        return back()->with('success', 'Pembayaran manual berhasil dikonfirmasi. Pesanan masuk ke proses.');
    }
}
