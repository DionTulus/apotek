<?php

namespace App\Http\Controllers\Api;

use App\Enums\DrugClass;
use App\Http\Controllers\Api\Concerns\PresentsResources;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Katalog publik: kategori, daftar produk (filter/sort/paginasi),
 * dan detail produk. Tidak butuh login.
 */
class CatalogController extends Controller
{
    use PresentsResources;

    public function categories(): JsonResponse
    {
        $categories = Category::active()
            ->withCount(['products' => fn ($q) => $q->where('is_active', true)])
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $categories->map(fn ($c) => $this->presentCategory($c))->values()->all(),
        ]);
    }

    public function drugClasses(): JsonResponse
    {
        $classes = array_map(fn (DrugClass $c) => [
            'value' => $c->value,
            'label' => $c->label(),
        ], DrugClass::cases());

        return response()->json(['data' => $classes]);
    }

    public function products(Request $request): JsonResponse
    {
        $query = Product::active()->with('category');

        if ($request->filled('q')) {
            $search = $request->input('q');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('composition', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $categoryParam = $request->input('category');
            $query->whereHas('category', function ($q) use ($categoryParam) {
                $q->where('slug', $categoryParam)->orWhere('id', $categoryParam);
            });
        }

        if ($request->filled('drug_class')) {
            $query->where('drug_class', $request->input('drug_class'));
        }

        if ($request->boolean('requires_prescription')) {
            $query->where('requires_prescription', true);
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (int) $request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', (int) $request->input('max_price'));
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        match ($request->input('sort', 'latest')) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'name_asc' => $query->orderBy('name', 'asc'),
            'popular' => $query->orderBy('sold_count', 'desc'),
            default => $query->latest(),
        };

        $perPage = min(max((int) $request->input('per_page', 12), 1), 50);
        $products = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'data' => collect($products->items())->map(fn ($p) => $this->presentProduct($p))->values()->all(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::active()->with('category')->where('slug', $slug)->firstOrFail();

        $related = Product::active()
            ->with('category')
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->take(6)
            ->get();

        return response()->json([
            'data' => $this->presentProduct($product),
            'related' => $related->map(fn ($p) => $this->presentProduct($p))->values()->all(),
        ]);
    }
}
