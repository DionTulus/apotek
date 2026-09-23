<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrackingController extends Controller
{
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
                $orderResult = $order;
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
