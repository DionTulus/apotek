<?php

namespace App\Http\Controllers\Auth;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    public function redirectToGoogle(): RedirectResponse
    {
        if (empty(config('services.google.client_id'))) {
            return redirect()->route('login')->with('error', 'Login Google belum dikonfigurasi di .env');
        }

        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback(): RedirectResponse
    {
        if (empty(config('services.google.client_id'))) {
            return redirect()->route('login')->with('error', 'Login Google belum dikonfigurasi di .env');
        }

        try {
            $googleUser = Socialite::driver('google')->user();

            $user = User::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            if (! $user) {
                $user = User::create([
                    'name' => $googleUser->getName() ?? $googleUser->getNickname() ?? 'Pengguna Google',
                    'email' => $googleUser->getEmail(),
                    'password' => Hash::make(Str::random(24)),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'role' => Role::CUSTOMER,
                    'email_verified_at' => now(),
                ]);
            } else {
                if (! $user->google_id) {
                    $user->update(['google_id' => $googleUser->getId()]);
                }
            }

            Auth::login($user, true);

            if ($user->isAdmin()) {
                return redirect()->intended('/admin');
            }

            return redirect()->intended('/');
        } catch (\Exception $e) {
            return redirect()->route('login')->with('error', 'Gagal login via Google: ' . $e->getMessage());
        }
    }
}
