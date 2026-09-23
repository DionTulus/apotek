<?php

namespace App\Services;

use App\Models\ShippingMethod;

class ShippingService
{
    public function calculateCost(ShippingMethod $method, int $weightGram): int
    {
        $weightKg = max(1, (int) ceil($weightGram / 1000));

        return $method->base_cost + ($weightKg * $method->cost_per_kg);
    }
}
