<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ShippingController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| REST API — aplikasi pasien (e-commerce)
|--------------------------------------------------------------------------
|
| Kontrak JSON untuk aplikasi pasien mobile-first. Autentikasi memakai
| token Sanctum (header Authorization: Bearer <token>).
|
*/

// --- Publik: katalog & konten ---
Route::get('/home', [ContentController::class, 'home']);
Route::get('/settings', [ContentController::class, 'settings']);
Route::get('/promos', [ContentController::class, 'promos']);
Route::post('/promos/validate', [ContentController::class, 'validatePromo']);
Route::get('/faqs', [ContentController::class, 'faqs']);
Route::get('/blogs', [ContentController::class, 'blogs']);
Route::get('/blogs/{slug}', [ContentController::class, 'blogShow']);

Route::get('/categories', [CatalogController::class, 'categories']);
Route::get('/drug-classes', [CatalogController::class, 'drugClasses']);
Route::get('/products', [CatalogController::class, 'products']);
Route::get('/products/{slug}', [CatalogController::class, 'show']);

Route::get('/shipping-methods', [ShippingController::class, 'methods']);
Route::post('/shipping/calculate', [ShippingController::class, 'calculate']);

// --- Auth ---
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// --- Butuh login (Sanctum token) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::patch('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/password', [AuthController::class, 'changePassword']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::patch('/cart/items/{cartItem}', [CartController::class, 'update']);
    Route::delete('/cart/items/{cartItem}', [CartController::class, 'remove']);
    Route::delete('/cart', [CartController::class, 'clear']);

    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{address}', [AddressController::class, 'update']);
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);
    Route::post('/addresses/{address}/default', [AddressController::class, 'setDefault']);

    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::get('/wishlist/ids', [WishlistController::class, 'ids']);
    Route::post('/wishlist/{product}', [WishlistController::class, 'toggle']);

    Route::get('/checkout/summary', [CheckoutController::class, 'summary']);
    Route::post('/checkout', [CheckoutController::class, 'store']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
    Route::post('/orders/{orderNumber}/cancel', [OrderController::class, 'cancel']);
    Route::post('/orders/{orderNumber}/returns', [OrderController::class, 'storeReturn']);
    Route::get('/prescriptions', [OrderController::class, 'prescriptions']);

    Route::get('/orders/{orderNumber}/payment', [PaymentController::class, 'show']);
    Route::post('/orders/{orderNumber}/payment/check', [PaymentController::class, 'checkStatus']);
});
