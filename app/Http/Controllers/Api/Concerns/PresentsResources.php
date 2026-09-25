<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\Address;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Prescription;
use App\Models\Product;
use App\Models\Promo;
use App\Models\ShippingMethod;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

/**
 * Presenter bersama untuk lapisan REST API.
 *
 * Semua controller API memakai bentuk JSON yang sama supaya aplikasi
 * pasien (dan klien lain) bisa mengandalkan satu kontrak data. Bentuk
 * ini adalah *representasi publik*: kolom internal seperti cost_price,
 * min_stock, dan relasi sensitif tidak pernah ikut dikirim.
 */
trait PresentsResources
{
    protected function presentProduct(Product $p): array
    {
        $p->loadMissing('category');

        return [
            'id' => $p->id,
            'sku' => $p->sku,
            'name' => $p->name,
            'slug' => $p->slug,
            'description' => $p->description,
            'composition' => $p->composition,
            'dosage' => $p->dosage,
            'manufacturer' => $p->manufacturer,
            'drug_class' => $p->drug_class->value,
            'drug_class_label' => $p->drug_class->label(),
            'requires_prescription' => (bool) $p->requires_prescription,
            'unit' => $p->unit,
            'price' => (int) $p->price,
            'stock' => (int) $p->stock,
            'in_stock' => $p->stock > 0,
            'weight_gram' => (int) $p->weight_gram,
            'image' => $p->image ? $this->fileUrl($p->image) : null,
            'is_featured' => (bool) $p->is_featured,
            'sold_count' => (int) $p->sold_count,
            'category' => $p->category ? $this->presentCategory($p->category) : null,
        ];
    }

    protected function presentCategory(Category $c): array
    {
        return [
            'id' => $c->id,
            'name' => $c->name,
            'slug' => $c->slug,
            'description' => $c->description,
            'image' => $c->image ? $this->fileUrl($c->image) : null,
            'products_count' => $c->products_count ?? null,
        ];
    }

    protected function presentCartItem(CartItem $item): array
    {
        $item->loadMissing('product.category');
        $product = $item->product;

        return [
            'id' => $item->id,
            'qty' => (int) $item->qty,
            'subtotal' => $product ? (int) $product->price * (int) $item->qty : 0,
            'product' => $product ? $this->presentProduct($product) : null,
        ];
    }

    protected function presentAddress(Address $a): array
    {
        return [
            'id' => $a->id,
            'label' => $a->label,
            'recipient_name' => $a->recipient_name,
            'phone' => $a->phone,
            'province' => $a->province,
            'city' => $a->city,
            'district' => $a->district,
            'postal_code' => $a->postal_code,
            'address_line' => $a->address_line,
            'is_default' => (bool) $a->is_default,
            'full_address' => trim("{$a->address_line}, {$a->district}, {$a->city}, {$a->province} {$a->postal_code}", ', '),
        ];
    }

    protected function presentShippingMethod(ShippingMethod $m): array
    {
        return [
            'id' => $m->id,
            'name' => $m->name,
            'code' => $m->code,
            'base_cost' => (int) $m->base_cost,
            'cost_per_kg' => (int) $m->cost_per_kg,
            'est_days' => $m->est_days,
            'is_cod_available' => (bool) $m->is_cod_available,
        ];
    }

    protected function presentPromo(Promo $p): array
    {
        return [
            'id' => $p->id,
            'code' => $p->code,
            'name' => $p->name,
            'description' => $p->description,
            'type' => $p->type,
            'value' => (int) $p->value,
            'min_purchase' => (int) $p->min_purchase,
            'max_discount' => $p->max_discount !== null ? (int) $p->max_discount : null,
            'ends_at' => optional($p->ends_at)->toIso8601String(),
        ];
    }

    protected function presentOrderItem(OrderItem $i): array
    {
        return [
            'id' => $i->id,
            'product_id' => $i->product_id,
            'product_name' => $i->product_name,
            'sku' => $i->sku,
            'price' => (int) $i->price,
            'qty' => (int) $i->qty,
            'subtotal' => (int) $i->subtotal,
            'product' => $i->relationLoaded('product') && $i->product ? $this->presentProduct($i->product) : null,
        ];
    }

    protected function presentPrescription(?Prescription $prescription): ?array
    {
        if (! $prescription) {
            return null;
        }

        return [
            'id' => $prescription->id,
            'file_url' => $this->fileUrl($prescription->file_path),
            'doctor_name' => $prescription->doctor_name,
            'status' => $prescription->status->value,
            'note' => $prescription->note,
            'reviewed_at' => optional($prescription->reviewed_at)->toIso8601String(),
        ];
    }

    protected function presentOrder(Order $order, bool $withDetail = false): array
    {
        $order->loadMissing(['items.product', 'payment', 'shippingMethod', 'promo']);

        $data = [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status->value,
            'status_label' => $order->status->label(),
            'payment_method' => $order->payment_method->value,
            'payment_status' => $order->payment_status->value,
            'subtotal' => (int) $order->subtotal,
            'discount_total' => (int) $order->discount_total,
            'shipping_cost' => (int) $order->shipping_cost,
            'grand_total' => (int) $order->grand_total,
            'recipient_name' => $order->recipient_name,
            'recipient_phone' => $order->recipient_phone,
            'shipping_address' => $order->shipping_address,
            'note' => $order->note,
            'items_count' => $order->items->sum('qty'),
            'shipping_method' => $order->shippingMethod ? $this->presentShippingMethod($order->shippingMethod) : null,
            'promo' => $order->promo ? $this->presentPromo($order->promo) : null,
            'created_at' => optional($order->created_at)->toIso8601String(),
            'expires_at' => optional($order->expires_at)->toIso8601String(),
            'paid_at' => optional($order->paid_at)->toIso8601String(),
            'items' => $order->items->map(fn ($i) => $this->presentOrderItem($i))->values()->all(),
        ];

        if ($withDetail) {
            $order->loadMissing(['statusHistories', 'shipment', 'prescription', 'returns']);
            $data['timeline'] = $order->statusHistories
                ->sortBy('created_at')
                ->map(fn ($h) => [
                    'status' => $h->status->value,
                    'status_label' => $h->status->label(),
                    'note' => $h->note,
                    'at' => optional($h->created_at)->toIso8601String(),
                ])->values()->all();
            $data['prescription'] = $this->presentPrescription($order->prescription);
            $data['shipment'] = $order->shipment ? [
                'courier' => $order->shipment->courier,
                'tracking_number' => $order->shipment->tracking_number,
                'status' => $order->shipment->status?->value,
            ] : null;
            $data['payment'] = $order->payment ? [
                'provider' => $order->payment->provider,
                'status' => $order->payment->status->value,
                'snap_token' => $order->payment->snap_token,
                'payment_type' => $order->payment->payment_type,
                'bank_or_va_number' => $order->payment->bank_or_va_number,
            ] : null;
        }

        return $data;
    }

    protected function presentUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role->value,
            'avatar' => $user->avatar ? $this->fileUrl($user->avatar) : null,
            'notify_email' => (bool) $user->notify_email,
            'notify_promo' => (bool) $user->notify_promo,
            'created_at' => optional($user->created_at)->toIso8601String(),
        ];
    }

    /**
     * Ubah path penyimpanan relatif menjadi URL yang bisa dibuka klien.
     * Nilai yang sudah berupa URL absolut (http/https) dibiarkan apa adanya.
     */
    protected function fileUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }
}
