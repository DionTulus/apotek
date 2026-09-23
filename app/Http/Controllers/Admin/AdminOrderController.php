<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\FinanceService;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::with(['user', 'payment', 'shippingMethod'])
            ->when($request->filled('search'), fn ($q) => $q->where(function ($sub) use ($request) {
                $sub->where('order_number', 'like', "%{$request->input('search')}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$request->input('search')}%")
                        ->orWhere('email', 'like', "%{$request->input('search')}%"));
            }))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when($request->filled('method'), fn ($q) => $q->where('payment_method', $request->input('method')));

        $orders = $query->latest()->paginate(20)->withQueryString();

        $statusList = array_map(fn ($s) => ['value' => $s->value, 'label' => $s->label()], OrderStatus::cases());

        return Inertia::render('admin/orders/index', [
            'orders'     => $orders,
            'statusList' => $statusList,
            'filters'    => $request->only('search', 'status', 'method'),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load([
            'user',
            'items.product',
            'payment',
            'shippingMethod',
            'shipment',
            'prescription',
            'statusHistories.creator',
            'returns.orderItem.product',
            'promo',
        ]);

        $statusList = array_map(fn ($s) => ['value' => $s->value, 'label' => $s->label()], OrderStatus::cases());

        return Inertia::render('admin/orders/show', [
            'order'      => $order,
            'statusList' => $statusList,
        ]);
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:' . implode(',', array_column(OrderStatus::cases(), 'value')),
            'note'   => 'nullable|string|max:500',
        ]);

        $newStatus = OrderStatus::from($request->input('status'));

        $allowedTransitions = [
            OrderStatus::PAID->value        => [OrderStatus::PROCESSING],
            OrderStatus::PROCESSING->value  => [OrderStatus::SHIPPED],
            OrderStatus::SHIPPED->value     => [OrderStatus::DELIVERED],
            OrderStatus::DELIVERED->value   => [OrderStatus::COMPLETED],
        ];

        $allowed = $allowedTransitions[$order->status->value] ?? [];
        if (!in_array($newStatus, $allowed)) {
            return back()->with('error', "Transisi status dari {$order->status->label()} ke {$newStatus->label()} tidak diizinkan.");
        }

        DB::transaction(function () use ($order, $newStatus, $request) {
            $updates = ['status' => $newStatus];

            if ($newStatus === OrderStatus::COMPLETED) {
                $updates['completed_at'] = now();
                // Record income if not yet recorded (COD scenario)
                if ($order->payment_status !== PaymentStatus::PAID) {
                    $updates['payment_status'] = PaymentStatus::PAID;
                    $updates['paid_at'] = now();
                }
                app(FinanceService::class)->recordSale($order);
            }

            $order->update($updates);

            $order->statusHistories()->create([
                'status'     => $newStatus,
                'note'       => $request->input('note') ?? "Status diubah ke {$newStatus->label()} oleh admin.",
                'created_by' => $request->user()->id,
            ]);
        });

        return back()->with('success', "Status pesanan berhasil diperbarui ke \"{$newStatus->label()}\".");
    }

    public function cancel(Request $request, Order $order, PaymentService $paymentService): RedirectResponse
    {
        $cancellable = [OrderStatus::PENDING_PAYMENT, OrderStatus::PAID, OrderStatus::PROCESSING];
        if (!in_array($order->status, $cancellable)) {
            return back()->with('error', 'Pesanan ini tidak dapat dibatalkan pada status saat ini.');
        }

        DB::transaction(function () use ($order, $request, $paymentService) {
            $order->update([
                'status'       => OrderStatus::CANCELLED,
                'cancelled_at' => now(),
            ]);

            $paymentService->restoreOrderStock($order, 'Dibatalkan oleh Admin');

            $order->statusHistories()->create([
                'status'     => OrderStatus::CANCELLED,
                'note'       => $request->input('note', 'Dibatalkan oleh Administrator.'),
                'created_by' => $request->user()->id,
            ]);
        });

        return back()->with('success', 'Pesanan berhasil dibatalkan dan stok dikembalikan.');
    }
}
