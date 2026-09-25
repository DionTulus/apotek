<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule as ValidationRule;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::withCount('orders')
            ->when($request->filled('role'), fn ($q) => $q->where('role', $request->input('role')))
            ->when($request->filled('search'), fn ($q) => $q->where(function ($sub) use ($request) {
                $sub->where('name', 'like', "%{$request->input('search')}%")
                    ->orWhere('email', 'like', "%{$request->input('search')}%")
                    ->orWhere('phone', 'like', "%{$request->input('search')}%");
            }));

        $users = $query->latest()->paginate(20)->withQueryString();

        $roles = array_map(fn ($r) => ['value' => $r->value, 'label' => $r->label()], Role::cases());

        $stats = [
            'total'      => User::count(),
            'admin'      => User::where('role', Role::ADMIN)->count(),
            'pharmacist' => User::where('role', Role::PHARMACIST)->count(),
            'customer'   => User::where('role', Role::CUSTOMER)->count(),
        ];

        return Inertia::render('admin/users/index', [
            'users'   => $users,
            'roles'   => $roles,
            'stats'   => $stats,
            'filters' => (object) $request->only('role', 'search'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|max:100|unique:users,email',
            'password' => 'required|string|min:8',
            'phone'    => 'nullable|string|max:30',
            'role'     => ['required', ValidationRule::in(array_column(Role::cases(), 'value'))],
        ]);

        User::create([
            'name'     => $request->input('name'),
            'email'    => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'phone'    => $request->input('phone'),
            'role'     => Role::from($request->input('role')),
        ]);

        return back()->with('success', 'Pengguna baru berhasil ditambahkan.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => ['required', 'email', 'max:100', ValidationRule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'phone'    => 'nullable|string|max:30',
            'role'     => ['required', ValidationRule::in(array_column(Role::cases(), 'value'))],
        ]);

        $payload = [
            'name'  => $request->input('name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'role'  => Role::from($request->input('role')),
        ];

        if ($request->filled('password')) {
            $payload['password'] = Hash::make($request->input('password'));
        }

        $user->update($payload);

        return back()->with('success', "Data pengguna {$user->name} berhasil diperbarui.");
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.');
        }

        // Protect admin users count if only 1 exists
        if ($user->role === Role::ADMIN && User::where('role', Role::ADMIN)->count() <= 1) {
            return back()->with('error', 'Tidak dapat menghapus administrator terakhir dalam sistem.');
        }

        $user->delete();

        return back()->with('success', 'Pengguna berhasil dihapus.');
    }
}
