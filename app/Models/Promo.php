<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'min_purchase',
        'max_discount',
        'quota',
        'used_count',
        'starts_at',
        'ends_at',
        'banner',
        'is_active',
    ];

    protected $casts = [
        'value' => 'integer',
        'min_purchase' => 'integer',
        'max_discount' => 'integer',
        'quota' => 'integer',
        'used_count' => 'integer',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            });
    }

    /**
     * Benar bila promo bertipe persentase.
     *
     * Seeder lama menulis 'percent' sedangkan formulir admin menulis
     * 'percentage'; keduanya harus dikenali agar diskon tidak salah
     * dihitung sebagai nominal tetap.
     */
    public function isPercentage(): bool
    {
        return in_array($this->type, ['percentage', 'percent'], true);
    }

    /**
     * Hitung nilai diskon untuk subtotal tertentu.
     */
    public function discountFor(int $subtotal): int
    {
        if ($this->isPercentage()) {
            $discount = (int) round(($subtotal * $this->value) / 100);
            if ($this->max_discount) {
                $discount = min($discount, (int) $this->max_discount);
            }
        } else {
            $discount = (int) $this->value;
        }

        return min($discount, $subtotal);
    }
}
