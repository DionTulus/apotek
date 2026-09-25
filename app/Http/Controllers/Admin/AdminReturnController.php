<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReturnStatus;
use App\Enums\StockMovementType;
use App\Enums\TransactionCategory;
use App\Enums\TransactionType;
use App\Http\Controllers\Controller;
use App\Models\FinancialTransaction;
use App\Models\OrderReturn;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminReturnController extends Controller
{
    public function index(Request $request): Response
    {
        $query = OrderReturn::with([
            'order',
            'user',
            'orderItem.product',
        ])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')));

        // Default: show pending/requested
        if (!$request->filled('status')) {
            $query->whereIn('status', [ReturnStatus::REQUESTED, ReturnStatus::APPROVED]);
        }

        $returns = $query->latest()->paginate(20)->withQueryString();

        $statusList = array_map(fn ($s) => ['value' => $s->value, 'label' => ucfirst($s->value)], ReturnStatus::cases());

        return Inertia::render('admin/returns/index', [
            'returns'    => $returns,
            'statusList' => $statusList,
            'filters'    => (object) $request->only('status'),
        ]);
    }

    public function approve(Request $request, OrderReturn $return): RedirectResponse
    {
        if ($return->status !== ReturnStatus::REQUESTED) {
            return back()->with('error', 'Pengajuan retur ini sudah diproses.');
        }

        DB::transaction(function () use ($return, $request) {
            $return->update([
                'status'      => ReturnStatus::APPROVED,
                'admin_note'  => $request->input('admin_note'),
                'resolved_at' => now(),
            ]);

            $product = $return->orderItem->product;

            // Restore stock
            $newStock = $product->stock + $return->qty;
            $product->update(['stock' => $newStock]);

            StockMovement::create([
                'product_id'     => $product->id,
                'type'           => StockMovementType::RETURN,
                'qty'            => $return->qty,
                'stock_after'    => $newStock,
                'reference_type' => OrderReturn::class,
                'reference_id'   => $return->id,
                'note'           => "Retur disetujui — Order #{$return->order->order_number}",
                'created_by'     => $request->user()->id,
            ]);

            // Record refund to finance if type = refund
            if ($return->type === 'refund') {
                $refundAmount = $return->orderItem->price * $return->qty;
                FinancialTransaction::create([
                    'type'             => TransactionType::EXPENSE,
                    'category'         => TransactionCategory::REFUND,
                    'amount'           => $refundAmount,
                    'transaction_date' => now()->toDateString(),
                    'description'      => "Refund retur Order #{$return->order->order_number}",
                    'reference_type'   => OrderReturn::class,
                    'reference_id'     => $return->id,
                    'created_by'       => $request->user()->id,
                ]);
            }
        });

        return back()->with('success', 'Retur disetujui. Stok telah dikembalikan' . ($return->type === 'refund' ? ' dan refund dicatat.' : '.'));
    }

    public function reject(Request $request, OrderReturn $return): RedirectResponse
    {
        $request->validate([
            'admin_note' => 'required|string|max:500',
        ]);

        if ($return->status !== ReturnStatus::REQUESTED) {
            return back()->with('error', 'Pengajuan retur ini sudah diproses.');
        }

        $return->update([
            'status'      => ReturnStatus::REJECTED,
            'admin_note'  => $request->input('admin_note'),
            'resolved_at' => now(),
        ]);

        return back()->with('success', 'Pengajuan retur telah ditolak.');
    }
}
