<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\PresentsResources;
use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Keranjang belanja milik pelanggan yang sedang login.
 * Validasi stok dilakukan di sini agar tidak bisa dilewati klien.
 */
class CartController extends Controller
{
    use PresentsResources;

    protected function cartFor(Request $request, bool $create = false): ?Cart
    {
        $query = Cart::where('user_id', $request->user()->id);

        return $create ? $query->firstOrCreate(['user_id' => $request->user()->id]) : $query->first();
    }

    protected function payload(?Cart $cart): array
    {
        if (! $cart) {
            return ['items' => [], 'subtotal' => 0, 'total_qty' => 0, 'total_weight_gram' => 0, 'has_prescription_products' => false];
        }

        $cart->load(['items.product.category']);

        $subtotal = 0;
        $qty = 0;
        $weight = 0;
        $hasPrescription = false;

        foreach ($cart->items as $item) {
            if (! $item->product) {
                continue;
            }
            $subtotal += $item->product->price * $item->qty;
            $qty += $item->qty;
            $weight += $item->product->weight_gram * $item->qty;
            if ($item->product->requires_prescription) {
                $hasPrescription = true;
            }
        }

        return [
            'items' => $cart->items->map(fn ($i) => $this->presentCartItem($i))->values()->all(),
            'subtotal' => $subtotal,
            'total_qty' => $qty,
            'total_weight_gram' => $weight,
            'has_prescription_products' => $hasPrescription,
        ];
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->payload($this->cartFor($request)));
    }

    public function add(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'qty' => ['nullable', 'integer', 'min:1', 'max:99'],
        ]);

        $addQty = (int) ($data['qty'] ?? 1);
        $product = Product::findOrFail($data['product_id']);

        if (! $product->is_active) {
            return response()->json(['message' => 'Produk ini sedang tidak aktif.'], 422);
        }

        if ($product->stock <= 0) {
            return response()->json(['message' => 'Stok produk ini habis.'], 422);
        }

        $cart = $this->cartFor($request, true);

        $item = CartItem::where('cart_id', $cart->id)->where('product_id', $product->id)->first();
        $existingQty = $item ? $item->qty : 0;
        $totalQty = $existingQty + $addQty;

        if ($totalQty > $product->stock) {
            return response()->json([
                'message' => "Stok tidak mencukupi. Tersedia {$product->stock}, di keranjang sudah ada {$existingQty}.",
            ], 422);
        }

        if ($item) {
            $item->update(['qty' => $totalQty]);
        } else {
            CartItem::create(['cart_id' => $cart->id, 'product_id' => $product->id, 'qty' => $addQty]);
        }

        return response()->json([
            'message' => "{$product->name} ditambahkan ke keranjang.",
            ...$this->payload($cart),
        ]);
    }

    public function update(Request $request, CartItem $cartItem): JsonResponse
    {
        $data = $request->validate([
            'qty' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        if ($cartItem->cart->user_id !== $request->user()->id) {
            abort(403, 'Keranjang ini bukan milik Anda.');
        }

        $product = $cartItem->product;
        if ((int) $data['qty'] > $product->stock) {
            return response()->json(['message' => "Stok tidak mencukupi. Maksimal {$product->stock} item."], 422);
        }

        $cartItem->update(['qty' => (int) $data['qty']]);

        return response()->json([
            'message' => 'Jumlah produk diperbarui.',
            ...$this->payload($cartItem->cart),
        ]);
    }

    public function remove(Request $request, CartItem $cartItem): JsonResponse
    {
        if ($cartItem->cart->user_id !== $request->user()->id) {
            abort(403, 'Keranjang ini bukan milik Anda.');
        }

        $cart = $cartItem->cart;
        $cartItem->delete();

        return response()->json([
            'message' => 'Item dihapus dari keranjang.',
            ...$this->payload($cart),
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->cartFor($request);
        if ($cart) {
            $cart->items()->delete();
        }

        return response()->json(['message' => 'Keranjang dikosongkan.', ...$this->payload($cart)]);
    }
}
