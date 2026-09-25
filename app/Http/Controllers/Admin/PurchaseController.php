<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PurchaseStatus;
use App\Enums\StockMovementType;
use App\Enums\TransactionCategory;
use App\Enums\TransactionType;
use App\Http\Controllers\Controller;
use App\Models\FinancialTransaction;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\Purchase;
use App\Models\StockMovement;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Purchase::with('supplier', 'creator')
            ->withCount('items')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when($request->filled('search'), fn ($q) => $q->where('purchase_number', 'like', "%{$request->input('search')}%")
                ->orWhereHas('supplier', fn ($s) => $s->where('name', 'like', "%{$request->input('search')}%")));

        $purchases = $query->latest('purchase_date')->paginate(20)->withQueryString();

        $statusList = array_map(fn ($s) => ['value' => $s->value, 'label' => ucfirst($s->value)], PurchaseStatus::cases());

        return Inertia::render('admin/purchases/index', [
            'purchases'  => $purchases,
            'statusList' => $statusList,
            'filters'    => (object) $request->only('status', 'search'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/purchases/create', [
            'suppliers' => Supplier::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'products'  => Product::where('is_active', true)->orderBy('name')->get(['id', 'name', 'sku', 'cost_price', 'unit']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'supplier_id'           => 'required|exists:suppliers,id',
            'purchase_date'         => 'required|date',
            'note'                  => 'nullable|string|max:500',
            'items'                 => 'required|array|min:1',
            'items.*.product_id'    => 'required|exists:products,id',
            'items.*.qty'           => 'required|integer|min:1',
            'items.*.unit_cost'     => 'required|integer|min:0',
            'items.*.batch_no'      => 'nullable|string|max:50',
            'items.*.expiry_date'   => 'nullable|date|after:today',
        ]);

        DB::transaction(function () use ($data, $request) {
            $total = collect($data['items'])->sum(fn ($i) => $i['qty'] * $i['unit_cost']);

            $purchase = Purchase::create([
                'purchase_number' => 'PO-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -5)),
                'supplier_id'     => $data['supplier_id'],
                'purchase_date'   => $data['purchase_date'],
                'total'           => $total,
                'status'          => PurchaseStatus::DRAFT,
                'note'            => $data['note'] ?? null,
                'created_by'      => $request->user()->id,
            ]);

            foreach ($data['items'] as $item) {
                $purchase->items()->create([
                    'product_id'  => $item['product_id'],
                    'qty'         => $item['qty'],
                    'unit_cost'   => $item['unit_cost'],
                    'subtotal'    => $item['qty'] * $item['unit_cost'],
                    'batch_no'    => $item['batch_no'] ?? null,
                    'expiry_date' => $item['expiry_date'] ?? null,
                ]);
            }
        });

        return redirect()->route('admin.purchases.index')->with('success', 'Purchase Order berhasil dibuat.');
    }

    public function show(Purchase $purchase): Response
    {
        $purchase->load('supplier', 'items.product', 'creator');

        return Inertia::render('admin/purchases/show', [
            'purchase' => $purchase,
        ]);
    }

    public function receive(Request $request, Purchase $purchase): RedirectResponse
    {
        if ($purchase->status !== PurchaseStatus::DRAFT) {
            return back()->with('error', 'Pembelian ini sudah pernah diproses.');
        }

        DB::transaction(function () use ($purchase, $request) {
            $purchase->load('items.product');

            foreach ($purchase->items as $item) {
                $product   = $item->product;
                $newStock  = $product->stock + $item->qty;

                // Update stock
                $product->update(['stock' => $newStock]);

                // Create batch
                $batch = ProductBatch::create([
                    'product_id'      => $product->id,
                    'batch_no'        => $item->batch_no ?? ('B-' . now()->format('YmdHis')),
                    'expiry_date'     => $item->expiry_date,
                    'qty_in'          => $item->qty,
                    'qty_remaining'   => $item->qty,
                    'purchase_item_id' => $item->id,
                ]);

                // Stock movement
                StockMovement::create([
                    'product_id'     => $product->id,
                    'batch_id'       => $batch->id,
                    'type'           => StockMovementType::PURCHASE,
                    'qty'            => $item->qty,
                    'stock_after'    => $newStock,
                    'reference_type' => Purchase::class,
                    'reference_id'   => $purchase->id,
                    'note'           => "Penerimaan barang PO #{$purchase->purchase_number}",
                    'created_by'     => $request->user()->id,
                ]);
            }

            // Record finance expense
            FinancialTransaction::create([
                'type'             => TransactionType::EXPENSE,
                'category'         => TransactionCategory::PURCHASE,
                'amount'           => $purchase->total,
                'transaction_date' => now()->toDateString(),
                'description'      => "Pembelian dari {$purchase->supplier->name} — {$purchase->purchase_number}",
                'reference_type'   => Purchase::class,
                'reference_id'     => $purchase->id,
                'created_by'       => $request->user()->id,
            ]);

            // Mark as received
            $purchase->update(['status' => PurchaseStatus::RECEIVED]);
        });

        return back()->with('success', 'Barang berhasil diterima. Stok dan keuangan telah diperbarui.');
    }
}
