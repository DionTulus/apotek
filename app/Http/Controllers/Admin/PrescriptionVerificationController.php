<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PrescriptionStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Prescription;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PrescriptionVerificationController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Prescription::with(['user', 'order' => fn ($q) => $q->with('items.product')])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')));

        // If no status filter, default show pending
        if (!$request->filled('status')) {
            $query->where('status', PrescriptionStatus::PENDING);
        }

        $prescriptions = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('admin/prescriptions/index', [
            'prescriptions' => $prescriptions,
            'filters'       => $request->only('status'),
        ]);
    }

    public function approve(Request $request, Prescription $prescription): RedirectResponse
    {
        if ($prescription->status !== PrescriptionStatus::PENDING) {
            return back()->with('error', 'Resep ini sudah diproses sebelumnya.');
        }

        DB::transaction(function () use ($prescription, $request) {
            $prescription->update([
                'status'      => PrescriptionStatus::APPROVED,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
                'note'        => $request->input('note'),
            ]);

            $order = Order::where('prescription_id', $prescription->id)
                ->lockForUpdate()
                ->first();
            if ($order && $order->status === OrderStatus::AWAITING_PRESCRIPTION) {
                $nextStatus = $order->payment_method === PaymentMethod::COD
                    ? OrderStatus::PROCESSING
                    : OrderStatus::PENDING_PAYMENT;

                $order->update([
                    'status' => $nextStatus,
                    'expires_at' => now()->addHours(24),
                ]);
                $order->statusHistories()->create([
                    'status'     => $nextStatus,
                    'note'       => $order->payment_method === PaymentMethod::COD
                        ? 'Resep disetujui. Pesanan siap diproses dengan pembayaran COD.'
                        : 'Resep disetujui. Pelanggan dapat melanjutkan pembayaran.',
                    'created_by' => $request->user()->id,
                ]);
            }
        });

        return back()->with('success', 'Resep disetujui. Pesanan dapat dilanjutkan sesuai metode pembayaran.');
    }

    public function reject(Request $request, Prescription $prescription, PaymentService $paymentService): RedirectResponse
    {
        $request->validate([
            'note' => 'required|string|max:500',
        ]);

        if ($prescription->status !== PrescriptionStatus::PENDING) {
            return back()->with('error', 'Resep ini sudah diproses sebelumnya.');
        }

        DB::transaction(function () use ($prescription, $request, $paymentService) {
            $prescription->update([
                'status'      => PrescriptionStatus::REJECTED,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
                'note'        => $request->input('note'),
            ]);

            // Cancel related order and restore stock
            $order = \App\Models\Order::where('prescription_id', $prescription->id)->first();
            if ($order && $order->status === OrderStatus::AWAITING_PRESCRIPTION) {
                $order->update([
                    'status'       => OrderStatus::CANCELLED,
                    'cancelled_at' => now(),
                ]);
                $paymentService->restoreOrderStock($order, 'Resep dokter ditolak oleh Apoteker');
                $order->statusHistories()->create([
                    'status'     => OrderStatus::CANCELLED,
                    'note'       => "Pesanan dibatalkan karena resep ditolak: {$request->input('note')}",
                    'created_by' => $request->user()->id,
                ]);
            }
        });

        return back()->with('success', 'Resep ditolak. Pesanan terkait telah dibatalkan.');
    }
}
