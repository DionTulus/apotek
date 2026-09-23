<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AddressController extends Controller
{
    public function index(Request $request): Response
    {
        $addresses = Address::where('user_id', $request->user()->id)
            ->orderBy('is_default', 'desc')
            ->latest()
            ->get();

        return Inertia::render('store/addresses', [
            'addresses' => $addresses,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'label' => 'required|string|max:50',
            'recipient_name' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'province' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'postal_code' => 'required|string|max:10',
            'address_line' => 'required|string|max:255',
            'is_default' => 'nullable|boolean',
        ]);

        $user = $request->user();

        if (! empty($validated['is_default'])) {
            Address::where('user_id', $user->id)->update(['is_default' => false]);
        } else {
            // If user has no addresses yet, make this default
            if (Address::where('user_id', $user->id)->count() === 0) {
                $validated['is_default'] = true;
            }
        }

        Address::create([
            'user_id' => $user->id,
            ...$validated,
        ]);

        return back()->with('success', 'Alamat pengiriman berhasil ditambahkan.');
    }

    public function update(Request $request, Address $address): RedirectResponse
    {
        if ($address->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'label' => 'required|string|max:50',
            'recipient_name' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'province' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'postal_code' => 'required|string|max:10',
            'address_line' => 'required|string|max:255',
            'is_default' => 'nullable|boolean',
        ]);

        if (! empty($validated['is_default'])) {
            Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
        }

        $address->update($validated);

        return back()->with('success', 'Alamat pengiriman berhasil diperbarui.');
    }

    public function destroy(Request $request, Address $address): RedirectResponse
    {
        if ($address->user_id !== $request->user()->id) {
            abort(403);
        }

        $address->delete();

        return back()->with('success', 'Alamat pengiriman berhasil dihapus.');
    }

    public function setDefault(Request $request, Address $address): RedirectResponse
    {
        if ($address->user_id !== $request->user()->id) {
            abort(403);
        }

        Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return back()->with('success', 'Alamat utama berhasil diubah.');
    }
}
