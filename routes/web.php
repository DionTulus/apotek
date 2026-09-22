<?php

use App\Http\Controllers\Auth\SocialiteController;
use Illuminate\Support\Facades\Route;

// Public Home
Route::inertia('/', 'welcome')->name('home');

// Google Socialite Login Routes
Route::get('/auth/google/redirect', [SocialiteController::class, 'redirectToGoogle'])->name('auth.google.redirect');
Route::get('/auth/google/callback', [SocialiteController::class, 'handleGoogleCallback'])->name('auth.google.callback');

// Customer / Verified Auth Group
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        if (request()->user()?->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
        return inertia('dashboard');
    })->name('dashboard');
});

// Admin ERP Group (Middleware role:admin)
Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/', function () {
        return inertia('admin/dashboard');
    })->name('admin.dashboard');
});

require __DIR__.'/settings.php';
