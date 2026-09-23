<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Category::withCount('products')
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', "%{$request->input('search')}%"));

        $sort = $request->input('sort', 'name');
        $dir  = $request->input('dir', 'asc');
        $allowedSorts = ['name', 'products_count', 'created_at'];

        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $dir === 'desc' ? 'desc' : 'asc');
        }

        $categories = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
            'filters'    => (object) $request->only('search', 'sort', 'dir'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100|unique:categories,name',
            'description' => 'nullable|string|max:500',
            'image'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $data['slug'] = Str::slug($data['name']);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        Category::create($data);

        return back()->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100|unique:categories,name,' . $category->id,
            'description' => 'nullable|string|max:500',
            'image'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $data['slug'] = Str::slug($data['name']);

        if ($request->hasFile('image')) {
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        $category->update($data);

        return back()->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->products()->whereNull('deleted_at')->exists()) {
            return back()->with('error', 'Kategori tidak dapat dihapus karena masih memiliki produk aktif.');
        }

        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();

        return back()->with('success', 'Kategori berhasil dihapus.');
    }
}
