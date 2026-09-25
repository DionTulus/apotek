<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(Request $request): Response
    {
        $suppliers = Supplier::withCount('purchases')
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', "%{$request->input('search')}%"))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/suppliers/index', [
            'suppliers' => $suppliers,
            'filters'   => (object) $request->only('search'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'           => 'required|string|max:150|unique:suppliers,name',
            'contact_person' => 'nullable|string|max:100',
            'phone'          => 'nullable|string|max:20',
            'email'          => 'nullable|email|max:150',
            'address'        => 'nullable|string|max:500',
        ]);

        Supplier::create($request->only('name', 'contact_person', 'phone', 'email', 'address') + ['is_active' => true]);

        return back()->with('success', 'Supplier berhasil ditambahkan.');
    }

    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $request->validate([
            'name'           => 'required|string|max:150|unique:suppliers,name,' . $supplier->id,
            'contact_person' => 'nullable|string|max:100',
            'phone'          => 'nullable|string|max:20',
            'email'          => 'nullable|email|max:150',
            'address'        => 'nullable|string|max:500',
            'is_active'      => 'boolean',
        ]);

        $supplier->update($request->only('name', 'contact_person', 'phone', 'email', 'address', 'is_active'));

        return back()->with('success', 'Supplier berhasil diperbarui.');
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        if ($supplier->purchases()->exists()) {
            return back()->with('error', 'Supplier tidak dapat dihapus karena sudah memiliki riwayat pembelian.');
        }

        $supplier->delete();

        return back()->with('success', 'Supplier berhasil dihapus.');
    }
}
