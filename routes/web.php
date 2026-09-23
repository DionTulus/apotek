<?php

use App\Http\Controllers\Admin\AdminAnalyticsController;
use App\Http\Controllers\Admin\AdminCrmController;
use App\Http\Controllers\Admin\AdminCustomerController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminFinanceController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminPaymentController;
use App\Http\Controllers\Admin\AdminReportController;
use App\Http\Controllers\Admin\AdminReturnController;
use App\Http\Controllers\Admin\AdminShipmentController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\PrescriptionVerificationController;
use App\Http\Controllers\Admin\PurchaseController as AdminPurchaseController;
use App\Http\Controllers\Admin\StockController as AdminStockController;
use App\Http\Controllers\Admin\SupplierController as AdminSupplierController;
use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\Store\AddressController;
use App\Http\Controllers\Store\BlogController;
use App\Http\Controllers\Store\CartController;
use App\Http\Controllers\Store\CheckoutController;
use App\Http\Controllers\Store\CustomerOrderController;
use App\Http\Controllers\Store\HomeController;
use App\Http\Controllers\Store\MyPrescriptionController;
use App\Http\Controllers\Store\PageController;
use App\Http\Controllers\Store\PaymentController;
use App\Http\Controllers\Store\ProductController;
use App\Http\Controllers\Store\PromoController;
use App\Http\Controllers\Store\TestimonialController;
use App\Http\Controllers\Store\TrackingController;
use App\Http\Controllers\Store\WishlistController;
use App\Http\Controllers\Webhook\MidtransWebhookController;
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

// --- Catalog & Tracking Public Routes ---
Route::get('/produk', [ProductController::class, 'index'])->name('products.index');
Route::get('/produk/{slug}', [ProductController::class, 'show'])->name('products.show');
Route::get('/lacak-pesanan', [TrackingController::class, 'index'])->name('tracking.index');
Route::post('/lacak-pesanan', [TrackingController::class, 'index'])->name('tracking.search');

// --- Webhook Routes ---
Route::post('/midtrans/notification', [MidtransWebhookController::class, 'handleNotification'])->name('webhook.midtrans');

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

    // Address Routes
    Route::get('/alamat', [AddressController::class, 'index'])->name('addresses.index');
    Route::post('/alamat', [AddressController::class, 'store'])->name('addresses.store');
    Route::put('/alamat/{address}', [AddressController::class, 'update'])->name('addresses.update');
    Route::delete('/alamat/{address}', [AddressController::class, 'destroy'])->name('addresses.destroy');
    Route::post('/alamat/{address}/default', [AddressController::class, 'setDefault'])->name('addresses.default');

    // Checkout Routes
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');

    // Payment Routes
    Route::get('/pembayaran/{orderNumber}', [PaymentController::class, 'show'])->name('payment.show');
    Route::post('/pembayaran/{orderNumber}/cek-status', [PaymentController::class, 'checkStatus'])->name('payment.check-status');

    // Customer Account Routes
    Route::get('/akun/pesanan', [CustomerOrderController::class, 'index'])->name('account.orders');
    Route::get('/akun/pesanan/{orderNumber}', [CustomerOrderController::class, 'show'])->name('account.orders.show');
    Route::post('/akun/pesanan/{orderNumber}/batal', [CustomerOrderController::class, 'cancel'])->name('account.orders.cancel');
    Route::post('/akun/pesanan/{orderNumber}/retur', [CustomerOrderController::class, 'storeReturn'])->name('account.orders.return');
    Route::get('/akun/resep', [MyPrescriptionController::class, 'index'])->name('account.prescriptions');
});

// --- Admin ERP Group (Middleware role:admin) ---
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Fase 9: Dashboard KPI
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Fase 7: Katalog & Inventori
    Route::get('/kategori', [AdminCategoryController::class, 'index'])->name('categories.index');
    Route::post('/kategori', [AdminCategoryController::class, 'store'])->name('categories.store');
    Route::put('/kategori/{category}', [AdminCategoryController::class, 'update'])->name('categories.update');
    Route::delete('/kategori/{category}', [AdminCategoryController::class, 'destroy'])->name('categories.destroy');

    Route::get('/produk', [AdminProductController::class, 'index'])->name('products.index');
    Route::get('/produk/create', [AdminProductController::class, 'create'])->name('products.create');
    Route::post('/produk', [AdminProductController::class, 'store'])->name('products.store');
    Route::get('/produk/{product}/edit', [AdminProductController::class, 'edit'])->name('products.edit');
    Route::put('/produk/{product}', [AdminProductController::class, 'update'])->name('products.update');
    Route::delete('/produk/{product}', [AdminProductController::class, 'destroy'])->name('products.destroy');

    Route::get('/stok', [AdminStockController::class, 'index'])->name('stock.index');
    Route::post('/stok/{product}/adjust', [AdminStockController::class, 'adjust'])->name('stock.adjust');
    Route::get('/stok/{product}/batches', [AdminStockController::class, 'batches'])->name('stock.batches');
    Route::get('/stok/{product}/movements', [AdminStockController::class, 'movements'])->name('stock.movements');

    Route::get('/supplier', [AdminSupplierController::class, 'index'])->name('suppliers.index');
    Route::post('/supplier', [AdminSupplierController::class, 'store'])->name('suppliers.store');
    Route::put('/supplier/{supplier}', [AdminSupplierController::class, 'update'])->name('suppliers.update');
    Route::delete('/supplier/{supplier}', [AdminSupplierController::class, 'destroy'])->name('suppliers.destroy');

    Route::get('/pembelian', [AdminPurchaseController::class, 'index'])->name('purchases.index');
    Route::get('/pembelian/create', [AdminPurchaseController::class, 'create'])->name('purchases.create');
    Route::post('/pembelian', [AdminPurchaseController::class, 'store'])->name('purchases.store');
    Route::get('/pembelian/{purchase}', [AdminPurchaseController::class, 'show'])->name('purchases.show');
    Route::post('/pembelian/{purchase}/receive', [AdminPurchaseController::class, 'receive'])->name('purchases.receive');

    // Fase 8: Penjualan & Operasional
    Route::get('/pesanan', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::get('/pesanan/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
    Route::post('/pesanan/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status');
    Route::post('/pesanan/{order}/batal', [AdminOrderController::class, 'cancel'])->name('orders.cancel');

    Route::get('/resep', [PrescriptionVerificationController::class, 'index'])->name('prescriptions.index');
    Route::post('/resep/{prescription}/approve', [PrescriptionVerificationController::class, 'approve'])->name('prescriptions.approve');
    Route::post('/resep/{prescription}/reject', [PrescriptionVerificationController::class, 'reject'])->name('prescriptions.reject');

    Route::get('/pembayaran', [AdminPaymentController::class, 'index'])->name('payments.index');
    Route::post('/pembayaran/{order}/cod', [AdminPaymentController::class, 'confirmCod'])->name('payments.cod');
    Route::post('/pembayaran/{payment}/manual', [AdminPaymentController::class, 'confirmManual'])->name('payments.manual');

    Route::get('/pengiriman', [AdminShipmentController::class, 'index'])->name('shipments.index');
    Route::post('/pengiriman/{order}/kirim', [AdminShipmentController::class, 'ship'])->name('shipments.ship');
    Route::post('/pengiriman/{order}/terima', [AdminShipmentController::class, 'deliver'])->name('shipments.deliver');

    Route::get('/retur', [AdminReturnController::class, 'index'])->name('returns.index');
    Route::post('/retur/{return}/approve', [AdminReturnController::class, 'approve'])->name('returns.approve');
    Route::post('/retur/{return}/reject', [AdminReturnController::class, 'reject'])->name('returns.reject');

    Route::get('/pelanggan', [AdminCustomerController::class, 'index'])->name('customers.index');
    Route::get('/pelanggan/{user}', [AdminCustomerController::class, 'show'])->name('customers.show');

    // Fase 9: Keuangan, Laporan, Analitik & CRM
    Route::get('/keuangan', [AdminFinanceController::class, 'index'])->name('finance.index');
    Route::post('/keuangan/pengeluaran', [AdminFinanceController::class, 'storeExpense'])->name('finance.store-expense');
    Route::get('/keuangan/export', [AdminFinanceController::class, 'exportCsv'])->name('finance.export');

    Route::get('/laporan/penjualan', [AdminReportController::class, 'sales'])->name('reports.sales');
    Route::get('/laporan/penjualan/export', [AdminReportController::class, 'exportSalesCsv'])->name('reports.sales.export');

    Route::get('/analitik', [AdminAnalyticsController::class, 'index'])->name('analytics.index');

    Route::get('/crm', [AdminCrmController::class, 'index'])->name('crm.index');
    Route::post('/crm/lead', [AdminCrmController::class, 'storeLead'])->name('crm.store-lead');
    Route::get('/crm/{lead}', [AdminCrmController::class, 'show'])->name('crm.show');
    Route::put('/crm/{lead}/status', [AdminCrmController::class, 'updateLeadStatus'])->name('crm.update-status');
    Route::post('/crm/{lead}/interaksi', [AdminCrmController::class, 'storeInteraction'])->name('crm.store-interaction');
});

require __DIR__.'/settings.php';
