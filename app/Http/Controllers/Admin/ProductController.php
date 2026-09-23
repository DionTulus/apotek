<?php

namespace App\Http\Controllers\Admin;

use App\Enums\DrugClass;
use App\Enums\StockMovementType;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with('category')
            ->when($request->filled('search'), fn ($q) => $q->where(function ($sub) use ($request) {
                $sub->where('name', 'like', "%{$request->input('search')}%")
                    ->orWhere('sku', 'like', "%{$request->input('search')}%");
            }))
            ->when($request->filled('category'), fn ($q) => $q->where('category_id', $request->input('category')))
            ->when($request->filled('drug_class'), fn ($q) => $q->where('drug_class', $request->input('drug_class')))
            ->when($request->input('stock_alert') === 'low', fn ($q) => $q->lowStock())
            ->when($request->input('stock_alert') === 'out', fn ($q) => $q->where('stock', '<=', 0));

        $sort = $request->input('sort', 'name');
        $dir  = $request->input('dir', 'asc');
        $allowedSorts = ['name', 'sku', 'price', 'stock', 'created_at'];
        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $dir === 'desc' ? 'desc' : 'asc');
        }

        $products   = $query->paginate(20)->withQueryString();
        $categories = Category::orderBy('name')->get(['id', 'name']);
        $drugClasses = array_map(fn ($d) => ['value' => $d->value, 'label' => $d->label()], DrugClass::cases());

        return Inertia::render('admin/products/index', [
            'products'   => $products,
            'categories' => $categories,
            'drugClasses' => $drugClasses,
            'filters'    => $request->only('search', 'category', 'drug_class', 'stock_alert', 'sort', 'dir'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/form', [
            'categories'  => Category::orderBy('name')->get(['id', 'name']),
            'drugClasses' => array_map(fn ($d) => ['value' => $d->value, 'label' => $d->label()], DrugClass::cases()),
            'product'     => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'category_id'           => 'required|exists:categories,id',
            'name'                  => 'required|string|max:200',
            'sku'                   => 'required|string|max:50|unique:products,sku',
            'description'           => 'nullable|string',
            'composition'           => 'nullable|string',
            'dosage'                => 'nullable|string',
            'manufacturer'          => 'nullable|string|max:150',
            'drug_class'            => 'required|in:' . implode(',', array_column(DrugClass::cases(), 'value')),
            'requires_prescription' => 'boolean',
            'unit'                  => 'required|string|max:30',
            'price'                 => 'required|integer|min:0',
            'cost_price'            => 'required|integer|min:0',
            'stock'                 => 'required|integer|min:0',
            'min_stock'             => 'required|integer|min:0',
            'weight_gram'           => 'required|integer|min:0',
            'is_active'             => 'boolean',
            'is_featured'           => 'boolean',
            'image'                 => 'nullable|image|mimes:jpg,jpeg,png,webp|max:3072',
        ]);

        $data['slug'] = Str::slug($data['name']);
        $initialStock = (int) $data['stock'];

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        DB::transaction(function () use ($data, $initialStock, $request) {
            $product = Product::create($data);

            if ($initialStock > 0) {
                StockMovement::create([
                    'product_id'    => $product->id,
                    'type'          => StockMovementType::ADJUSTMENT,
                    'qty'           => $initialStock,
                    'stock_after'   => $initialStock,
                    'note'          => 'Stok awal saat produk dibuat.',
                    'created_by'    => $request->user()->id,
                ]);
            }
        });

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('admin/products/form', [
            'categories'  => Category::orderBy('name')->get(['id', 'name']),
            'drugClasses' => array_map(fn ($d) => ['value' => $d->value, 'label' => $d->label()], DrugClass::cases()),
            'product'     => $product,
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'category_id'           => 'required|exists:categories,id',
            'name'                  => 'required|string|max:200',
            'sku'                   => 'required|string|max:50|unique:products,sku,' . $product->id,
            'description'           => 'nullable|string',
            'composition'           => 'nullable|string',
            'dosage'                => 'nullable|string',
            'manufacturer'          => 'nullable|string|max:150',
            'drug_class'            => 'required|in:' . implode(',', array_column(DrugClass::cases(), 'value')),
            'requires_prescription' => 'boolean',
            'unit'                  => 'required|string|max:30',
            'price'                 => 'required|integer|min:0',
            'cost_price'            => 'required|integer|min:0',
            'min_stock'             => 'required|integer|min:0',
            'weight_gram'           => 'required|integer|min:0',
            'is_active'             => 'boolean',
            'is_featured'           => 'boolean',
            'image'                 => 'nullable|image|mimes:jpg,jpeg,png,webp|max:3072',
        ]);

        $data['slug'] = Str::slug($data['name']);

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data);

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();
        return back()->with('success', 'Produk berhasil dihapus (soft delete).');
    }
}
