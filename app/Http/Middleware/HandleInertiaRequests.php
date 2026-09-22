<?php

namespace App\Http\Middleware;

use App\Models\CartItem;
use App\Models\Setting;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        $cartCount = 0;
        $wishlistCount = 0;

        if ($user) {
            $cartCount = CartItem::whereHas('cart', fn ($q) => $q->where('user_id', $user->id))->sum('qty');
            $wishlistCount = Wishlist::where('user_id', $user->id)->count();
        }

        $settings = Setting::all()->pluck('value', 'key')->toArray();

        return [
            ...parent::share($request),
            'appName' => config('app.name', 'Apotek ERP'),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role instanceof \App\Enums\Role ? $user->role->value : $user->role,
                    'avatar' => $user->avatar,
                ] : null,
            ],
            'cartCount' => (int) $cartCount,
            'wishlistCount' => (int) $wishlistCount,
            'settings' => $settings,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
