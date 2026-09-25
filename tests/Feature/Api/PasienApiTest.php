<?php

use App\Enums\OrderStatus;
use App\Enums\Role;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Promo;
use App\Models\ShippingMethod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

function apiCustomer(): User
{
    return User::create([
        'name' => 'Pelanggan API',
        'email' => 'api-'.uniqid().'@apotek.test',
        'phone' => '081200000000',
        'password' => Hash::make('rahasia123'),
        'role' => Role::CUSTOMER,
        'email_verified_at' => now(),
    ]);
}

function apiProduct(array $overrides = []): Product
{
    $category = Category::create([
        'name' => 'Kategori '.uniqid(),
        'slug' => 'kategori-'.uniqid(),
        'is_active' => true,
    ]);

    return Product::create(array_merge([
        'category_id' => $category->id,
        'sku' => 'SKU-'.uniqid(),
        'name' => 'Produk Uji',
        'slug' => 'produk-uji-'.uniqid(),
        'price' => 10000,
        'cost_price' => 7000,
        'stock' => 50,
        'min_stock' => 5,
        'weight_gram' => 100,
        'unit' => 'strip',
        'drug_class' => 'bebas',
        'requires_prescription' => false,
        'is_active' => true,
    ], $overrides));
}

it('katalog publik bisa diakses tanpa login', function () {
    apiProduct(['name' => 'Paracetamol Uji']);

    $this->getJson('/api/categories')->assertOk()->assertJsonStructure(['data']);
    $this->getJson('/api/products')->assertOk()->assertJsonStructure(['data', 'meta']);
    $this->getJson('/api/home')->assertOk()->assertJsonStructure(['categories', 'featured_products', 'promos']);
    $this->getJson('/api/shipping-methods')->assertOk()->assertJsonStructure(['data']);
});

it('registrasi mengembalikan token dan bisa mengakses endpoint terlindungi', function () {
    $res = $this->postJson('/api/auth/register', [
        'name' => 'Pasien Baru',
        'email' => 'baru@apotek.test',
        'phone' => '081211112222',
        'password' => 'rahasia123',
        'password_confirmation' => 'rahasia123',
    ])->assertCreated()->assertJsonStructure(['token', 'user']);

    $token = $res->json('token');

    $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/auth/me')
        ->assertOk()
        ->assertJsonPath('user.email', 'baru@apotek.test');
});

it('login menolak kredensial salah dan menerima yang benar', function () {
    $user = apiCustomer();
    $user->update(['email' => 'login@apotek.test', 'password' => Hash::make('rahasia123')]);

    $this->postJson('/api/auth/login', ['email' => 'login@apotek.test', 'password' => 'salah'])
        ->assertStatus(422);

    $this->postJson('/api/auth/login', ['email' => 'login@apotek.test', 'password' => 'rahasia123'])
        ->assertOk()
        ->assertJsonStructure(['token']);
});

it('endpoint terlindungi menolak permintaan tanpa token', function () {
    $this->getJson('/api/cart')->assertStatus(401);
    $this->getJson('/api/orders')->assertStatus(401);
});

it('keranjang menambah, membatasi stok, dan menghitung subtotal', function () {
    $user = apiCustomer();
    $product = apiProduct(['price' => 10000, 'stock' => 3]);

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/cart/add', ['product_id' => $product->id, 'qty' => 2])
        ->assertOk()
        ->assertJsonPath('total_qty', 2)
        ->assertJsonPath('subtotal', 20000);

    // Melebihi stok harus ditolak
    $this->actingAs($user, 'sanctum')
        ->postJson('/api/cart/add', ['product_id' => $product->id, 'qty' => 5])
        ->assertStatus(422);
});

it('checkout membuat pesanan, memotong stok, dan mengosongkan keranjang', function () {
    $user = apiCustomer();
    $product = apiProduct(['price' => 10000, 'stock' => 10]);
    $shipping = ShippingMethod::create([
        'name' => 'Kurir Uji', 'code' => 'UJI', 'base_cost' => 5000,
        'cost_per_kg' => 1000, 'est_days' => '1 hari', 'is_cod_available' => false, 'is_active' => true,
    ]);

    $cart = Cart::create(['user_id' => $user->id]);
    CartItem::create(['cart_id' => $cart->id, 'product_id' => $product->id, 'qty' => 2]);

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/checkout', [
            'recipient_name' => 'Pelanggan API',
            'recipient_phone' => '081200000000',
            'full_address' => 'Jl. Uji 1, Bandung',
            'shipping_method_id' => $shipping->id,
            'payment_method' => 'midtrans',
        ])
        ->assertCreated()
        ->assertJsonPath('data.status', OrderStatus::PENDING_PAYMENT->value)
        ->assertJsonPath('data.grand_total', 20000 + 6000);

    expect($product->fresh()->stock)->toBe(8);
    expect(CartItem::where('cart_id', $cart->id)->count())->toBe(0);
});

it('checkout menolak COD untuk metode kirim tanpa dukungan COD', function () {
    $user = apiCustomer();
    $product = apiProduct();
    $shipping = ShippingMethod::create([
        'name' => 'Kurir Tanpa COD', 'code' => 'NOCOD', 'base_cost' => 5000,
        'cost_per_kg' => 0, 'est_days' => '1 hari', 'is_cod_available' => false, 'is_active' => true,
    ]);

    $cart = Cart::create(['user_id' => $user->id]);
    CartItem::create(['cart_id' => $cart->id, 'product_id' => $product->id, 'qty' => 1]);

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/checkout', [
            'recipient_name' => 'Pelanggan API',
            'recipient_phone' => '081200000000',
            'full_address' => 'Jl. Uji 2, Bandung',
            'shipping_method_id' => $shipping->id,
            'payment_method' => 'cod',
        ])
        ->assertStatus(422);
});

it('promo persentase (percent) dihitung benar dengan batas maksimum', function () {
    apiCustomer();
    Promo::create([
        'code' => 'PCT10', 'name' => 'Diskon 10%', 'type' => 'percent', 'value' => 10,
        'min_purchase' => 50000, 'max_discount' => 20000, 'is_active' => true,
    ]);

    // 200.000 * 10% = 20.000 (menyentuh batas maksimum)
    $this->postJson('/api/promos/validate', ['code' => 'PCT10', 'subtotal' => 200000])
        ->assertOk()
        ->assertJsonPath('discount', 20000);

    // 100.000 * 10% = 10.000
    $this->postJson('/api/promos/validate', ['code' => 'PCT10', 'subtotal' => 100000])
        ->assertOk()
        ->assertJsonPath('discount', 10000);

    // Di bawah minimum belanja
    $this->postJson('/api/promos/validate', ['code' => 'PCT10', 'subtotal' => 10000])
        ->assertStatus(422);
});

it('pelanggan hanya bisa melihat pesanannya sendiri', function () {
    $userA = apiCustomer();
    $userB = apiCustomer();
    $shipping = ShippingMethod::create([
        'name' => 'Kurir Uji', 'code' => 'UJI', 'base_cost' => 0,
        'cost_per_kg' => 0, 'est_days' => '1 hari', 'is_cod_available' => true, 'is_active' => true,
    ]);

    $order = Order::create([
        'order_number' => 'ORD-UJI-001',
        'user_id' => $userA->id,
        'status' => OrderStatus::PENDING_PAYMENT,
        'payment_method' => 'midtrans',
        'payment_status' => 'unpaid',
        'subtotal' => 10000, 'discount_total' => 0, 'shipping_cost' => 0, 'grand_total' => 10000,
        'shipping_method_id' => $shipping->id,
        'recipient_name' => 'A', 'recipient_phone' => '08', 'shipping_address' => 'Jl. A',
    ]);

    $this->actingAs($userB, 'sanctum')
        ->getJson('/api/orders/'.$order->order_number)
        ->assertStatus(404);

    $this->actingAs($userA, 'sanctum')
        ->getJson('/api/orders/'.$order->order_number)
        ->assertOk()
        ->assertJsonPath('data.order_number', 'ORD-UJI-001');
});

it('membatalkan pesanan pending mengembalikan stok', function () {
    $user = apiCustomer();
    $product = apiProduct(['stock' => 10]);
    $shipping = ShippingMethod::create([
        'name' => 'Kurir Uji', 'code' => 'UJI', 'base_cost' => 0,
        'cost_per_kg' => 0, 'est_days' => '1 hari', 'is_cod_available' => true, 'is_active' => true,
    ]);

    $cart = Cart::create(['user_id' => $user->id]);
    CartItem::create(['cart_id' => $cart->id, 'product_id' => $product->id, 'qty' => 3]);

    $orderNumber = $this->actingAs($user, 'sanctum')
        ->postJson('/api/checkout', [
            'recipient_name' => 'Pelanggan API',
            'recipient_phone' => '081200000000',
            'full_address' => 'Jl. Uji 3',
            'shipping_method_id' => $shipping->id,
            'payment_method' => 'midtrans',
        ])->json('data.order_number');

    expect($product->fresh()->stock)->toBe(7);

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/orders/'.$orderNumber.'/cancel')
        ->assertOk()
        ->assertJsonPath('data.status', OrderStatus::CANCELLED->value);

    expect($product->fresh()->stock)->toBe(10);
});

it('logout mencabut token yang dipakai', function () {
    $user = apiCustomer();
    $token = $user->createToken('test')->plainTextToken;

    expect($user->tokens()->count())->toBe(1);

    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/auth/logout')
        ->assertOk();

    // Token benar-benar dihapus dari basis data.
    expect($user->tokens()->count())->toBe(0);
});
