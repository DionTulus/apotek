<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Enums\ReturnStatus;
use App\Http\Controllers\Api\Concerns\PresentsResources;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderReturn;
use App\Models\Prescription;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Pesanan pelanggan: riwayat, detail + linimasa, pembatalan,
 * pengajuan retur, dan daftar resep yang pernah diunggah.
 */
class OrderController extends Controller
{
    use PresentsResources;

    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['items.product', 'payment', 'shippingMethod', 'promo'])
            ->where('user_id', $request->user()->id);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $perPage = min(max((int) $request->input('per_page', 10), 1), 50);
        $orders = $query->latest()->paginate($perPage)->withQueryString();

        return response()->json([
            'data' => collect($orders->items())->map(fn ($o) => $this->presentOrder($o))->values()->all(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $order = $this->findOwn($request, $orderNumber);

        return response()->json(['data' => $this->presentOrder($order, true)]);
    }

    public function cancel(Request $request, string $orderNumber, PaymentService $paymentService): JsonResponse
    {
        $order = $this->findOwn($request, $orderNumber);

        if ($order->status !== OrderStatus::PENDING_PAYMENT) {
            return response()->json(['message' => 'Hanya pesanan yang menunggu pembayaran dapat dibatalkan.'], 422);
        }

        $order->update(['status' => OrderStatus::CANCELLED, 'cancelled_at' => now()]);
        $paymentService->restoreOrderStock($order, 'Dibatalkan oleh pelanggan');
        $order->statusHistories()->create([
            'status' => OrderStatus::CANCELLED,
            'note' => 'Pesanan dibatalkan oleh pelanggan.',
            'created_by' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Pesanan dibatalkan.', 'data' => $this->presentOrder($order->fresh(), true)]);
    }

    public function storeReturn(Request $request, string $orderNumber): JsonResponse
    {
        $order = $this->findOwn($request, $orderNumber);

        $data = $request->validate([
            'order_item_id' => ['required', 'exists:order_items,id'],
            'type' => ['required', 'in:refund,exchange'],
            'qty' => ['required', 'integer', 'min:1'],
            'reason' => ['required', 'string', 'max:500'],
            'evidence_image' => ['required', 'file', 'mimes:jpg,jpeg,png', 'max:5120'],
        ]);

        $item = $order->items()->where('id', $data['order_item_id'])->firstOrFail();

        if ((int) $data['qty'] > $item->qty) {
            return response()->json(['message' => 'Jumlah retur melebihi jumlah yang dibeli.'], 422);
        }

        $path = $request->file('evidence_image')->store('returns', 'public');

        $return = OrderReturn::create([
            'order_id' => $order->id,
            'order_item_id' => $item->id,
            'user_id' => $request->user()->id,
            'type' => $data['type'],
            'qty' => (int) $data['qty'],
            'reason' => $data['reason'],
            'evidence_image' => $path,
            'status' => ReturnStatus::PENDING,
        ]);

        return response()->json([
            'message' => 'Pengajuan retur terkirim. Tim kami akan meninjaunya.',
            'data' => ['id' => $return->id, 'status' => $return->status->value],
        ], 201);
    }

    public function prescriptions(Request $request): JsonResponse
    {
        $items = Prescription::with('reviewer')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn ($p) => $this->presentPrescription($p))
            ->values()
            ->all();

        return response()->json(['data' => $items]);
    }

    protected function findOwn(Request $request, string $orderNumber): Order
    {
        return Order::with(['items.product', 'payment', 'shippingMethod', 'promo', 'statusHistories', 'shipment', 'prescription', 'returns'])
            ->where('order_number', $orderNumber)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
    }
}
