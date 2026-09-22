<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $cart = Cart::with(['items.product.category'])
            ->where('user_id', $user->id)
            ->first();

        $items = $cart ? $cart->items : [];
        $subtotal = 0;
        foreach ($items as $item) {
            if ($item->product) {
                $subtotal += $item->product->price * $item->qty;
            }
        }

        return Inertia::render('store/cart', [
            'cartItems' => $items,
            'subtotal' => $subtotal,
        ]);
    }

    public function add(Request $request, Product $product): RedirectResponse
    {
        $request->validate([
            'qty' => 'nullable|integer|min:1',
        ]);

        $addQty = $request->integer('qty', 1);

        if (! $product->is_active) {
            return back()->with('error', 'Produk ini sedang tidak aktif.');
        }

        if ($product->stock <= 0) {
            return back()->with('error', 'Stok produk ini habis.');
        }

        $user = $request->user();

        $cart = Cart::firstOrCreate([
            'user_id' => $user->id,
        ]);

        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->first();

        $existingQty = $cartItem ? $cartItem->qty : 0;
        $totalQty = $existingQty + $addQty;

        if ($totalQty > $product->stock) {
            return back()->with('error', "Stok tidak mencukupi. Stok yang tersedia: {$product->stock}, di keranjang Anda sudah ada {$existingQty}.");
        }

        if ($cartItem) {
            $cartItem->update(['qty' => $totalQty]);
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'qty' => $addQty,
            ]);
        }

        return back()->with('success', "{$product->name} berhasil ditambahkan ke keranjang.");
    }

    public function update(Request $request, CartItem $cartItem): RedirectResponse
    {
        $request->validate([
            'qty' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        if ($cartItem->cart->user_id !== $user->id) {
            abort(403);
        }

        $newQty = $request->integer('qty');
        $product = $cartItem->product;

        if ($newQty > $product->stock) {
            return back()->with('error', "Stok tidak mencukupi. Maksimal {$product->stock} item.");
        }

        $cartItem->update(['qty' => $newQty]);

        return back()->with('success', 'Jumlah produk berhasil diperbarui.');
    }

    public function remove(Request $request, CartItem $cartItem): RedirectResponse
    {
        $user = $request->user();
        if ($cartItem->cart->user_id !== $user->id) {
            abort(403);
        }

        $cartItem->delete();

        return back()->with('success', 'Item berhasil dihapus dari keranjang.');
    }
}
