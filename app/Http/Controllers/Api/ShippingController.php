<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\PresentsResources;
use App\Http\Controllers\Controller;
use App\Models\ShippingMethod;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Ongkos kirim: daftar metode aktif dan kalkulasi biaya berdasarkan
 * berat total belanja (memakai ShippingService yang sama dengan checkout).
 */
class ShippingController extends Controller
{
    use PresentsResources;

    public function __construct(protected ShippingService $shippingService) {}

    public function methods(): JsonResponse
    {
        $methods = ShippingMethod::active()->get();

        return response()->json([
            'data' => $methods->map(fn ($m) => $this->presentShippingMethod($m))->values()->all(),
        ]);
    }

    public function calculate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'shipping_method_id' => ['required', 'exists:shipping_methods,id'],
            'weight_gram' => ['required', 'integer', 'min:0'],
        ]);

        $method = ShippingMethod::active()->findOrFail($data['shipping_method_id']);
        $cost = $this->shippingService->calculateCost($method, (int) $data['weight_gram']);

        return response()->json([
            'shipping_method' => $this->presentShippingMethod($method),
            'weight_gram' => (int) $data['weight_gram'],
            'cost' => $cost,
        ]);
    }
}
