<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\PresentsResources;
use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Buku alamat pelanggan (CRUD + penanda alamat utama).
 */
class AddressController extends Controller
{
    use PresentsResources;

    public function index(Request $request): JsonResponse
    {
        $addresses = Address::where('user_id', $request->user()->id)
            ->orderByDesc('is_default')
            ->latest()
            ->get();

        return response()->json([
            'data' => $addresses->map(fn ($a) => $this->presentAddress($a))->values()->all(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        if (! empty($data['is_default'])) {
            Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
        }

        $address = Address::create([
            ...$data,
            'user_id' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Alamat ditambahkan.', 'data' => $this->presentAddress($address)], 201);
    }

    public function update(Request $request, Address $address): JsonResponse
    {
        $this->authorizeOwner($request, $address);

        $data = $this->validated($request, false);

        if (! empty($data['is_default'])) {
            Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
        }

        $address->update($data);

        return response()->json(['message' => 'Alamat diperbarui.', 'data' => $this->presentAddress($address->fresh())]);
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        $this->authorizeOwner($request, $address);
        $address->delete();

        return response()->json(['message' => 'Alamat dihapus.']);
    }

    public function setDefault(Request $request, Address $address): JsonResponse
    {
        $this->authorizeOwner($request, $address);

        Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return response()->json(['message' => 'Alamat utama diperbarui.', 'data' => $this->presentAddress($address->fresh())]);
    }

    protected function authorizeOwner(Request $request, Address $address): void
    {
        if ($address->user_id !== $request->user()->id) {
            abort(403, 'Alamat ini bukan milik Anda.');
        }
    }

    protected function validated(Request $request, bool $required = true): array
    {
        $rule = $required ? 'required' : 'sometimes';

        return $request->validate([
            'label' => ['nullable', 'string', 'max:50'],
            'recipient_name' => [$rule, 'string', 'max:100'],
            'phone' => [$rule, 'string', 'max:20'],
            'province' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'address_line' => [$rule, 'string', 'max:500'],
            'is_default' => ['nullable', 'boolean'],
        ]);
    }
}
