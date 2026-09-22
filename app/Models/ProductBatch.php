<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'batch_no',
        'expiry_date',
        'qty_in',
        'qty_remaining',
        'purchase_item_id',
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'qty_in' => 'integer',
        'qty_remaining' => 'integer',
    ];

    public function scopeExpiringSoon(Builder $query, int $days = 90): Builder
    {
        return $query->where('qty_remaining', '>', 0)
            ->where('expiry_date', '<=', now()->addDays($days))
            ->where('expiry_date', '>=', now());
    }

    public function scopeExpired(Builder $query): Builder
    {
        return $query->where('qty_remaining', '>', 0)
            ->where('expiry_date', '<', now());
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function purchaseItem(): BelongsTo
    {
        return $this->belongsTo(PurchaseItem::class);
    }
}
