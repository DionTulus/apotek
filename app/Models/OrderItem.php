<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read Product|null $product
 */
class OrderItem extends Model
{
    /** @use HasFactory<Factory<static>> */
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'sku',
        'price',
        'cost_price',
        'qty',
        'subtotal',
    ];

    protected $casts = [
        'price' => 'integer',
        'cost_price' => 'integer',
        'qty' => 'integer',
        'subtotal' => 'integer',
    ];

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
