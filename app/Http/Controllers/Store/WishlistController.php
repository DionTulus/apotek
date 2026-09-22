<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function index(Request $request): Response
    {
        $wishlistItems = Wishlist::with(['product.category'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(12);

        return Inertia::render('store/wishlist', [
            'wishlistItems' => $wishlistItems,
        ]);
    }

    public function toggle(Request $request, Product $product): RedirectResponse
    {
        $user = $request->user();

        $existing = Wishlist::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $message = 'Produk berhasil dihapus dari wishlist.';
        } else {
            Wishlist::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ]);
            $message = 'Produk berhasil ditambahkan ke wishlist.';
        }

        return back()->with('success', $message);
    }
}
