<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\ShipmentStatus;
use App\Exceptions\BiteshipException;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shipment;
use App\Services\BiteshipService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminShipmentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::with(['user', 'shipment', 'shippingMethod'])
            ->whereIn('status', [OrderStatus::PROCESSING, OrderStatus::SHIPPED])
            ->when($request->filled('search'), fn ($q) => $q->where('order_number', 'like', "%{$request->input('search')}%")
                ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$request->input('search')}%")))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')));

        $orders = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('admin/shipments/index', [
            'orders' => $orders,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function ship(Request $request, Order $order, BiteshipService $biteshipService): RedirectResponse
    {
        $wasAlreadyShipped = $order->status === OrderStatus::SHIPPED;
        if ($order->status !== OrderStatus::PROCESSING && ! $wasAlreadyShipped) {
            return back()->with('error', 'Pesanan harus dalam status "Sedang Diproses" atau sudah dikirim tanpa data Biteship.');
        }

        if ($order->shipment()->whereNotNull('biteship_order_id')->exists()) {
            return back()->with('error', 'Pengiriman Biteship untuk pesanan ini sudah dibuat.');
        }

        try {
            $biteshipOrder = $biteshipService->createOrder($order);
        } catch (BiteshipException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        $courier = is_array($biteshipOrder['courier'] ?? null) ? $biteshipOrder['courier'] : [];
        $trackingUrl = $courier['link'] ?? $biteshipOrder['courier_link'] ?? null;
        $waybillId = $courier['waybill_id'] ?? null;
        $trackingId = $courier['tracking_id'] ?? null;

        DB::transaction(function () use ($order, $request, $biteshipOrder, $courier, $trackingUrl, $waybillId, $trackingId, $wasAlreadyShipped) {
            Shipment::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'courier' => $courier['company'] ?? $order->biteship_courier_name,
                    'service' => $order->biteship_service_name ?: $order->biteship_courier_type,
                    'tracking_number' => is_string($waybillId) ? $waybillId : null,
                    'cost' => (int) ($biteshipOrder['price'] ?? $order->shipping_cost),
                    'status' => ShipmentStatus::SHIPPED,
                    'biteship_order_id' => $biteshipOrder['id'],
                    'biteship_tracking_id' => is_string($trackingId) ? $trackingId : null,
                    'biteship_status' => is_string($biteshipOrder['status'] ?? null) ? $biteshipOrder['status'] : 'confirmed',
                    'tracking_url' => is_string($trackingUrl) ? $trackingUrl : null,
                    'shipped_at' => now(),
                    'note' => 'Pengiriman dibuat melalui Biteship.',
                ]
            );

            if (! $wasAlreadyShipped) {
                $order->update(['status' => OrderStatus::SHIPPED]);
            }
            $order->statusHistories()->create([
                'status' => OrderStatus::SHIPPED,
                'note' => "Pesanan dibuat sebagai pengiriman Biteship via {$order->biteship_courier_name} ({$order->biteship_service_name}).",
                'created_by' => $request->user()->id,
            ]);
        });

        return back()->with('success', 'Pengiriman berhasil dibuat melalui Biteship.');
    }

    public function updateTrackingNumber(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'tracking_number' => 'required|string|max:255',
        ]);

        if ($order->status !== OrderStatus::SHIPPED) {
            return back()->with('error', 'Nomor resi hanya dapat diisi setelah pesanan dikirim.');
        }

        $shipment = $order->shipment;
        if (! $shipment) {
            return back()->with('error', 'Data pengiriman belum tersedia untuk pesanan ini.');
        }

        $shipment->update([
            'tracking_number' => trim($validated['tracking_number']),
        ]);

        return back()->with('success', 'Nomor resi berhasil disimpan.');
    }

    public function deliver(Request $request, Order $order): RedirectResponse
    {
        if ($order->status !== OrderStatus::SHIPPED) {
            return back()->with('error', 'Pesanan belum dalam status "Dalam Pengiriman".');
        }

        DB::transaction(function () use ($order, $request) {
            if ($order->shipment) {
                $order->shipment->update([
                    'status' => ShipmentStatus::DELIVERED,
                    'delivered_at' => now(),
                ]);
            }

            $order->update(['status' => OrderStatus::DELIVERED]);

            $order->statusHistories()->create([
                'status' => OrderStatus::DELIVERED,
                'note' => 'Paket telah diterima oleh pelanggan (dikonfirmasi Admin).',
                'created_by' => $request->user()->id,
            ]);
        });

        return back()->with('success', 'Pesanan berhasil ditandai sebagai diterima.');
    }
}
