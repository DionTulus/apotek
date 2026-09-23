<?php

namespace App\Http\Controllers\Store;

use App\Enums\OrderStatus;
use App\Enums\ReturnStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderReturn;
use App\Services\PaymentService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Order::with(['items.product', 'payment'])
            ->where('user_id', $user->id);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $orders = $query->latest()->paginate(10)->withQueryString();

        $statusList = array_map(fn ($s) => [
            'value' => $s->value,
            'label' => $s->label(),
        ], OrderStatus::cases());

        return Inertia::render('store/account/orders', [
            'orders' => $orders,
            'statusList' => $statusList,
            'currentStatus' => $request->input('status', ''),
        ]);
    }

    public function show(Request $request, string $orderNumber): Response
    {
        $user = $request->user();

        $order = Order::with([
            'items.product',
            'payment',
            'shippingMethod',
            'shipment',
            'prescription',
            'statusHistories',
            'returns',
        ])
            ->where('order_number', $orderNumber)
            ->where('user_id', $user->id)
            ->firstOrFail();

        return Inertia::render('store/account/order-detail', [
            'order' => $order,
        ]);
    }

    public function cancel(Request $request, string $orderNumber, PaymentService $paymentService): RedirectResponse
    {
        $user = $request->user();

        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', $user->id)
            ->firstOrFail();

        if ($order->status !== OrderStatus::PENDING_PAYMENT) {
            return back()->with('error', 'Hanya pesanan pending yang dapat dibatalkan.');
        }

        $order->update([
            'status' => OrderStatus::CANCELLED,
            'cancelled_at' => now(),
        ]);

        $paymentService->restoreOrderStock($order, 'Dibatalkan oleh pelanggan');

        $order->statusHistories()->create([
            'status' => OrderStatus::CANCELLED,
            'note' => 'Pesanan dibatalkan oleh pelanggan.',
            'created_by' => $user->id,
        ]);

        return back()->with('success', 'Pesanan berhasil dibatalkan.');
    }

    public function storeReturn(Request $request, string $orderNumber): RedirectResponse
    {
        $user = $request->user();

        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $request->validate([
            'order_item_id' => 'required|exists:order_items,id',
            'type' => 'required|in:refund,exchange',
            'qty' => 'required|integer|min:1',
            'reason' => 'required|string|max:500',
            'evidence_image' => 'required|file|mimes:jpg,jpeg,png|max:5120',
        ]);

        $item = $order->items()->where('id', $request->input('order_item_id'))->firstOrFail();

        if ($request->integer('qty') > $item->qty) {
            return back()->with('error', 'Jumlah retur melebihi jumlah yang dibeli.');
        }

        $filePath = $request->file('evidence_image')->store('returns', 'public');

        OrderReturn::create([
            'order_id' => $order->id,
            'order_item_id' => $item->id,
            'user_id' => $user->id,
            'type' => $request->input('type'),
            'qty' => $request->integer('qty'),
            'reason' => $request->input('reason'),
            'evidence_image' => $filePath,
            'status' => ReturnStatus::PENDING,
        ]);

        return back()->with('success', 'Pengajuan retur produk berhasil dikirim. Tim kami akan segera memproses.');
    }
}
