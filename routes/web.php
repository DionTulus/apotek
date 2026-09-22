<?php

use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\Store\BlogController;
use App\Http\Controllers\Store\CartController;
use App\Http\Controllers\Store\HomeController;
use App\Http\Controllers\Store\PageController;
use App\Http\Controllers\Store\ProductController;
use App\Http\Controllers\Store\PromoController;
use App\Http\Controllers\Store\TestimonialController;
use App\Http\Controllers\Store\WishlistController;
use Illuminate\Support\Facades\Route;

// --- Storefront Public Routes ---
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/tentang-kami', [PageController::class, 'about'])->name('about');
Route::get('/kontak', [PageController::class, 'contact'])->name('contact');
Route::post('/kontak', [PageController::class, 'storeContact'])->middleware('throttle:5,1')->name('contact.store');
Route::get('/faq', [PageController::class, 'faq'])->name('faq');
Route::get('/syarat-ketentuan', [PageController::class, 'terms'])->name('terms');
Route::get('/kebijakan-privasi', [PageController::class, 'privacy'])->name('privacy');
Route::get('/testimoni', [TestimonialController::class, 'index'])->name('testimonials');
Route::post('/testimoni', [TestimonialController::class, 'store'])->middleware('auth')->name('testimonials.store');
Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}', [BlogController::class, 'show'])->name('blog.show');
Route::get('/promo', [PromoController::class, 'index'])->name('promo.index');

// --- Catalog Public Routes ---
Route::get('/produk', [ProductController::class, 'index'])->name('products.index');
Route::get('/produk/{slug}', [ProductController::class, 'show'])->name('products.show');

// --- Google Socialite Login Routes ---
Route::get('/auth/google/redirect', [SocialiteController::class, 'redirectToGoogle'])->name('auth.google.redirect');
Route::get('/auth/google/callback', [SocialiteController::class, 'handleGoogleCallback'])->name('auth.google.callback');

// --- Customer Auth Group ---
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        if (request()->user()?->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
        return inertia('dashboard');
    })->name('dashboard');

    // Wishlist Routes
    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/wishlist/{product}', [WishlistController::class, 'toggle'])->name('wishlist.toggle');

    // Cart Routes
    Route::get('/keranjang', [CartController::class, 'index'])->name('cart.index');
    Route::post('/keranjang/add/{product}', [CartController::class, 'add'])->name('cart.add');
    Route::put('/keranjang/update/{cartItem}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/keranjang/remove/{cartItem}', [CartController::class, 'remove'])->name('cart.remove');
});

// --- Admin ERP Group (Middleware role:admin) ---
Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/', function () {
        return inertia('admin/dashboard');
    })->name('admin.dashboard');
});

require __DIR__.'/settings.php';
