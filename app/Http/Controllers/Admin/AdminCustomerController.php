<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminCustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::where('role', Role::CUSTOMER)
            ->withCount('orders')
            ->withSum('orders', 'grand_total')
            ->when($request->filled('search'), fn ($q) => $q->where(function ($sub) use ($request) {
                $sub->where('name', 'like', "%{$request->input('search')}%")
                    ->orWhere('email', 'like', "%{$request->input('search')}%")
                    ->orWhere('phone', 'like', "%{$request->input('search')}%");
            }));

        $customers = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('admin/customers/index', [
            'customers' => $customers,
            'filters'   => (object) $request->only('search'),
        ]);
    }

    public function show(User $user): Response
    {
        $orders = $user->orders()
            ->with('payment', 'shippingMethod')
            ->latest()
            ->paginate(10);

        $stats = [
            'total_orders'  => $user->orders()->count(),
            'total_spent'   => $user->orders()->sum('grand_total'),
            'completed'     => $user->orders()->where('status', 'completed')->count(),
            'cancelled'     => $user->orders()->where('status', 'cancelled')->count(),
        ];

        return Inertia::render('admin/customers/show', [
            'customer' => $user->load('addresses'),
            'orders'   => $orders,
            'stats'    => $stats,
        ]);
    }
}
