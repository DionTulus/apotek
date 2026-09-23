<?php

namespace App\Http\Controllers\Store;

use App\Enums\DrugClass;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::active()->with('category');

        // Search query
        if ($request->filled('q')) {
            $search = $request->input('q');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('composition', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filter by Category
        if ($request->filled('category')) {
            $categoryParam = $request->input('category');
            $query->whereHas('category', function ($q) use ($categoryParam) {
                $q->where('slug', $categoryParam)->orWhere('id', $categoryParam);
            });
        }

        // Filter by Drug Class
        if ($request->filled('drug_class')) {
            $query->where('drug_class', $request->input('drug_class'));
        }

        // Filter by Prescription
        if ($request->boolean('requires_prescription')) {
            $query->where('requires_prescription', true);
        }

        // Filter by Price range
        if ($request->filled('min_price')) {
            $query->where('price', '>=', (int) $request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', (int) $request->input('max_price'));
        }

        // Sorting
        $sort = $request->input('sort', 'latest');
        match ($sort) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'name_asc' => $query->orderBy('name', 'asc'),
            'popular' => $query->orderBy('sold_count', 'desc'),
            default => $query->latest(),
        };

        $products = $query->paginate(12)->withQueryString();

        $categories = Category::active()->select('id', 'name', 'slug')->get();

        $drugClasses = array_map(fn ($class) => [
            'value' => $class->value,
            'label' => $class->label(),
        ], DrugClass::cases());

        $userWishlistProductIds = [];
        if ($request->user()) {
            $userWishlistProductIds = Wishlist::where('user_id', $request->user()->id)
                ->pluck('product_id')
                ->toArray();
        }

        return Inertia::render('store/catalog', [
            'products' => $products,
            'categories' => $categories,
            'drugClasses' => $drugClasses,
            'userWishlistProductIds' => $userWishlistProductIds,
            'filters' => (object) $request->only([
                'q',
                'category',
                'drug_class',
                'requires_prescription',
                'min_price',
                'max_price',
                'sort',
            ]),
        ]);
    }

    public function show(Request $request, string $slug): Response
    {
        $product = Product::active()
            ->with('category')
            ->where('slug', $slug)
            ->firstOrFail();

        $relatedProducts = Product::active()
            ->with('category')
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->take(4)
            ->get();

        $isWishlisted = false;
        if ($request->user()) {
            $isWishlisted = Wishlist::where('user_id', $request->user()->id)
                ->where('product_id', $product->id)
                ->exists();
        }

        return Inertia::render('store/product-detail', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'isWishlisted' => $isWishlisted,
        ]);
    }
}
