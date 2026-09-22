<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'base_cost',
        'cost_per_kg',
        'est_days',
        'is_cod_available',
        'is_active',
    ];

    protected $casts = [
        'base_cost' => 'integer',
        'cost_per_kg' => 'integer',
        'is_cod_available' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
