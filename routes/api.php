<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AdminClinicController;
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
Route::get('/pages', [ContentController::class, 'pages']);
Route::get('/contact', [ContentController::class, 'contact']);
Route::post('/contact', [ContentController::class, 'storeContact']);
Route::get('/testimonials', [ContentController::class, 'testimonials']);
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
Route::get('/auth/google/redirect', [AuthController::class, 'googleRedirect']);
Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);

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

/*
|--------------------------------------------------------------------------
| REST API — dashboard admin klinik (Premysis Medika)
|--------------------------------------------------------------------------
|
| Kontrak JSON untuk dashboard admin (React, port 5173). Menyajikan
| basis data apotek dalam bentuk yang dipakai dashboard klinik, supaya
| satu basis data melayani aplikasi pasien DAN dashboard admin.
|
| Autentikasi dashboard masih memakai email+password terhadap tabel
| `users` (lihat loginAdmin); token Sanctum akan ditambahkan menyusul
| tanpa mengubah kontrak di bawah.
|
*/
Route::prefix('admin')->group(function () {
    // Login petugas (bidan = admin, asisten = pharmacist).
    Route::post('/auth/login-admin', [AdminClinicController::class, 'loginAdmin']);

    // Snapshot seluruh data: dipanggil sekali saat dashboard dimuat.
    Route::get('/state', [AdminClinicController::class, 'state']);

    // Aksi beraturan bisnis (BR-02, BR-03, BR-07, BR-08).
    Route::patch('/pesanan/{id}/status', [AdminClinicController::class, 'ubahStatusPesanan']);
    Route::post('/pesanan/{id}/pembayaran', [AdminClinicController::class, 'pembayaran']);
    Route::patch('/appointment/{id}/status', [AdminClinicController::class, 'ubahStatusAppointment']);
    Route::post('/bayi/{id}/generate-jadwal', [AdminClinicController::class, 'generateJadwalVaksin']);

    // CRUD generik untuk seluruh koleksi dashboard.
    Route::get('/{koleksi}', [AdminClinicController::class, 'list']);
    Route::post('/{koleksi}', [AdminClinicController::class, 'create']);
    Route::patch('/{koleksi}/{id}', [AdminClinicController::class, 'update']);
    Route::delete('/{koleksi}/{id}', [AdminClinicController::class, 'remove']);
});
