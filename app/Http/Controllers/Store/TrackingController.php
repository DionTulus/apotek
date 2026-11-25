<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrackingController extends Controller
{
    public function search(Request $request): Response
    {
        return $this->index($request);
    }

    public function index(Request $request): Response
    {
        $orderNumber = $request->input('order_number');
        $contact = $request->input('contact');

        $orderResult = null;
        $error = null;

        if ($request->isMethod('POST') || ($orderNumber && $contact)) {
            $request->validate([
                'order_number' => 'required|string',
                'contact' => 'required|string',
            ]);

            $searchContact = trim($contact);

            $order = Order::with([
                'items.product',
                'shippingMethod',
                'shipment',
                'statusHistories',
            ])
                ->where('order_number', trim($orderNumber))
                ->where(function ($q) use ($searchContact) {
                    $q->where('recipient_phone', 'like', "%{$searchContact}%")
                        ->orWhereHas('user', fn ($u) => $u->where('email', $searchContact)->orWhere('phone', $searchContact));
                })
                ->first();

            if ($order) {
                $orderResult = [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status->value,
                    'recipient_name' => $order->recipient_name,
                    'recipient_phone' => $order->recipient_phone,
                    'shipping_address' => $order->shipping_address,
                    'grand_total' => $order->grand_total,
                    'created_at' => $order->created_at->toISOString(),
                    'items' => $order->items->map(fn ($item) => [
                        'id' => $item->id,
                        'product_name' => $item->product_name,
                        'qty' => $item->qty,
                        'price' => $item->price,
                    ])->values(),
                    'shippingMethod' => $order->shippingMethod ? [
                        'name' => $order->shippingMethod->name,
                        'est_days' => $order->shippingMethod->est_days,
                    ] : null,
                    'shipment' => $order->shipment ? [
                        'tracking_number' => $order->shipment->tracking_number,
                        'status' => $order->shipment->status->value,
                    ] : null,
                    'statusHistories' => $order->statusHistories->map(fn ($history) => [
                        'id' => $history->id,
                        'status' => $history->status->value,
                        'note' => $history->note,
                        'created_at' => $history->created_at->toISOString(),
                    ])->values(),
                ];
            } else {
                $error = 'Pesanan tidak ditemukan. Pastikan Nomor Pesanan dan Nomor Telepon / Email cocok.';
            }
        }

        return Inertia::render('store/tracking', [
            'orderResult' => $orderResult,
            'error' => $error,
            'searchedOrderNumber' => $orderNumber ?? '',
            'searchedContact' => $contact ?? '',
        ]);
    }
}
