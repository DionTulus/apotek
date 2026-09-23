<?php

namespace App\Http\Controllers\Admin;

use App\Enums\StockMovementType;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with(['category'])
            ->withCount(['batches as expiring_soon_count' => function ($q) {
                $q->expiringSoon(90);
            }])
            ->when($request->filled('search'), fn ($q) => $q->where(function ($sub) use ($request) {
                $sub->where('name', 'like', "%{$request->input('search')}%")
                    ->orWhere('sku', 'like', "%{$request->input('search')}%");
            }))
            ->when($request->input('alert') === 'out',     fn ($q) => $q->where('stock', '<=', 0))
            ->when($request->input('alert') === 'low',     fn ($q) => $q->lowStock()->where('stock', '>', 0))
            ->when($request->input('alert') === 'expiring', fn ($q) => $q->expiringSoon(90));

        $products = $query->orderBy('stock')->paginate(25)->withQueryString();

        return Inertia::render('admin/stock/index', [
            'products' => $products,
            'filters'  => (object) $request->only('search', 'alert'),
        ]);
    }

    public function adjust(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'type'  => 'required|in:in,out',
            'qty'   => 'required|integer|min:1',
            'note'  => 'required|string|max:300',
        ]);

        $qty = (int) $data['qty'];
        if ($data['type'] === 'out' && $product->stock < $qty) {
            return back()->with('error', 'Jumlah penyesuaian melebihi stok saat ini.');
        }

        DB::transaction(function () use ($product, $data, $qty, $request) {
            $newStock = $data['type'] === 'in'
                ? $product->stock + $qty
                : $product->stock - $qty;

            $product->update(['stock' => $newStock]);

            StockMovement::create([
                'product_id'  => $product->id,
                'type'        => StockMovementType::ADJUSTMENT,
                'qty'         => $data['type'] === 'in' ? $qty : -$qty,
                'stock_after' => $newStock,
                'note'        => "[Penyesuaian {$data['type']}] {$data['note']}",
                'created_by'  => $request->user()->id,
            ]);
        });

        return back()->with('success', 'Stok berhasil disesuaikan.');
    }

    public function batches(Product $product): Response
    {
        $batches = $product->batches()->orderBy('expiry_date')->paginate(20);

        return Inertia::render('admin/stock/batches', [
            'product' => $product->only('id', 'name', 'sku', 'stock'),
            'batches' => $batches,
        ]);
    }

    public function movements(Request $request, Product $product): Response
    {
        $movements = $product->stockMovements()
            ->with('creator')
            ->latest()
            ->paginate(25);

        return Inertia::render('admin/stock/movements', [
            'product'   => $product->only('id', 'name', 'sku', 'stock'),
            'movements' => $movements,
        ]);
    }
}
