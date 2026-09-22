<?php

namespace App\Models;

use App\Enums\DrugClass;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'sku',
        'name',
        'slug',
        'description',
        'composition',
        'dosage',
        'manufacturer',
        'drug_class',
        'requires_prescription',
        'unit',
        'price',
        'cost_price',
        'stock',
        'min_stock',
        'weight_gram',
        'image',
        'is_active',
        'is_featured',
        'sold_count',
    ];

    protected $casts = [
        'drug_class' => DrugClass::class,
        'requires_prescription' => 'boolean',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'price' => 'integer',
        'cost_price' => 'integer',
        'stock' => 'integer',
        'min_stock' => 'integer',
        'weight_gram' => 'integer',
        'sold_count' => 'integer',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereColumn('stock', '<=', 'min_stock');
    }

    public function scopeExpiringSoon(Builder $query, int $days = 90): Builder
    {
        return $query->whereHas('batches', function ($q) use ($days) {
            $q->where('qty_remaining', '>', 0)
                ->where('expiry_date', '<=', now()->addDays($days))
                ->where('expiry_date', '>=', now());
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function batches(): HasMany
    {
        return $this->hasMany(ProductBatch::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }
}
