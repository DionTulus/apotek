<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\ShipmentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shipment;
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
            'orders'  => $orders,
            'filters' => (object) $request->only('search', 'status'),
        ]);
    }

    public function ship(Request $request, Order $order): RedirectResponse
    {
        $request->validate([
            'courier'          => 'required|string|max:50',
            'service'          => 'required|string|max:50',
            'tracking_number'  => 'required|string|max:100',
            'note'             => 'nullable|string|max:300',
        ]);

        if ($order->status !== OrderStatus::PROCESSING) {
            return back()->with('error', 'Pesanan harus dalam status "Sedang Diproses" untuk dikirim.');
        }

        DB::transaction(function () use ($order, $request) {
            // Upsert shipment record
            Shipment::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'courier'          => $request->input('courier'),
                    'service'          => $request->input('service'),
                    'tracking_number'  => $request->input('tracking_number'),
                    'cost'             => $order->shipping_cost,
                    'status'           => ShipmentStatus::SHIPPED,
                    'shipped_at'       => now(),
                    'note'             => $request->input('note'),
                ]
            );

            $order->update(['status' => OrderStatus::SHIPPED]);

            $order->statusHistories()->create([
                'status'     => OrderStatus::SHIPPED,
                'note'       => "Paket dikirim via {$request->input('courier')} — Resi: {$request->input('tracking_number')}",
                'created_by' => $request->user()->id,
            ]);
        });

        return back()->with('success', 'Pesanan berhasil ditandai sebagai dikirim.');
    }

    public function deliver(Request $request, Order $order): RedirectResponse
    {
        if ($order->status !== OrderStatus::SHIPPED) {
            return back()->with('error', 'Pesanan belum dalam status "Dalam Pengiriman".');
        }

        DB::transaction(function () use ($order, $request) {
            if ($order->shipment) {
                $order->shipment->update([
                    'status'       => ShipmentStatus::DELIVERED,
                    'delivered_at' => now(),
                ]);
            }

            $order->update(['status' => OrderStatus::DELIVERED]);

            $order->statusHistories()->create([
                'status'     => OrderStatus::DELIVERED,
                'note'       => 'Paket telah diterima oleh pelanggan (dikonfirmasi Admin).',
                'created_by' => $request->user()->id,
            ]);
        });

        return back()->with('success', 'Pesanan berhasil ditandai sebagai diterima.');
    }
}
