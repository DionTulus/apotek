<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\PresentsResources;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Wishlist (daftar keinginan) pelanggan.
 */
class WishlistController extends Controller
{
    use PresentsResources;

    public function index(Request $request): JsonResponse
    {
        $items = Wishlist::with('product.category')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->filter(fn ($w) => $w->product !== null)
            ->map(fn ($w) => [
                'id' => $w->id,
                'product' => $this->presentProduct($w->product),
            ])
            ->values()
            ->all();

        return response()->json(['data' => $items]);
    }

    public function toggle(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();
        $existing = Wishlist::where('user_id', $user->id)->where('product_id', $product->id)->first();

        if ($existing) {
            $existing->delete();

            return response()->json(['wishlisted' => false, 'message' => 'Dihapus dari wishlist.']);
        }

        Wishlist::create(['user_id' => $user->id, 'product_id' => $product->id]);

        return response()->json(['wishlisted' => true, 'message' => 'Ditambahkan ke wishlist.']);
    }

    public function ids(Request $request): JsonResponse
    {
        $ids = Wishlist::where('user_id', $request->user()->id)->pluck('product_id');

        return response()->json(['data' => $ids]);
    }
}
