<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $qty
 * @property-read Product|null $product
 */
class CartItem extends Model
{
    /** @use HasFactory<Factory<static>> */
    use HasFactory;

    protected $fillable = ['cart_id', 'product_id', 'qty'];

    protected $casts = ['qty' => 'integer'];

    /** @return BelongsTo<Cart, $this> */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
