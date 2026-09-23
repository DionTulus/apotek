<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ShippingMethod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerAccountTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected User $otherUser;
    protected Product $product;
    protected ShippingMethod $shippingMethod;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['role' => Role::CUSTOMER]);
        $this->otherUser = User::factory()->create(['role' => Role::CUSTOMER]);

        $category = Category::create([
            'name' => 'Obat Test',
            'slug' => 'obat-test',
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'category_id' => $category->id,
            'sku' => 'TEST-001',
            'name' => 'Amoxicillin 500mg',
            'slug' => 'amoxicillin-500mg',
            'price' => 15000,
            'cost_price' => 8000,
            'unit' => 'Strip',
            'stock' => 30,
            'min_stock' => 5,
            'weight_gram' => 100,
            'is_active' => true,
        ]);

        $this->shippingMethod = ShippingMethod::create([
            'name' => 'Reguler Bandung',
            'code' => 'REG',
            'base_cost' => 10000,
            'cost_per_kg' => 2000,
            'est_days' => '1-2 Hari',
            'is_cod_available' => true,
            'is_active' => true,
        ]);
    }

    public function test_customer_can_list_own_orders()
    {
        Order::create([
            'order_number' => 'ORD-USER-01',
            'user_id' => $this->user->id,
            'status' => OrderStatus::PENDING_PAYMENT,
            'payment_method' => 'midtrans',
            'payment_status' => PaymentStatus::UNPAID,
            'subtotal' => 15000,
            'discount_total' => 0,
            'shipping_cost' => 10000,
            'grand_total' => 25000,
            'shipping_method_id' => $this->shippingMethod->id,
            'recipient_name' => 'Budi',
            'recipient_phone' => '0812345',
            'shipping_address' => 'Jl Dago',
        ]);

        $response = $this->actingAs($this->user)->get('/akun/pesanan');
        $response->assertStatus(200);
    }

    public function test_customer_cannot_view_other_user_order()
    {
        Order::create([
            'order_number' => 'ORD-OTHER-01',
            'user_id' => $this->otherUser->id,
            'status' => OrderStatus::PENDING_PAYMENT,
            'payment_method' => 'midtrans',
            'payment_status' => PaymentStatus::UNPAID,
            'subtotal' => 15000,
            'discount_total' => 0,
            'shipping_cost' => 10000,
            'grand_total' => 25000,
            'shipping_method_id' => $this->shippingMethod->id,
            'recipient_name' => 'Siti',
            'recipient_phone' => '0898765',
            'shipping_address' => 'Jl Riau',
        ]);

        $response = $this->actingAs($this->user)->get('/akun/pesanan/ORD-OTHER-01');
        $response->assertStatus(404);
    }

    public function test_customer_can_cancel_pending_order()
    {
        $order = Order::create([
            'order_number' => 'ORD-CANCEL-01',
            'user_id' => $this->user->id,
            'status' => OrderStatus::PENDING_PAYMENT,
            'payment_method' => 'midtrans',
            'payment_status' => PaymentStatus::UNPAID,
            'subtotal' => 15000,
            'discount_total' => 0,
            'shipping_cost' => 10000,
            'grand_total' => 25000,
            'shipping_method_id' => $this->shippingMethod->id,
            'recipient_name' => 'Budi',
            'recipient_phone' => '0812345',
            'shipping_address' => 'Jl Dago',
        ]);

        $order->items()->create([
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'sku' => $this->product->sku,
            'price' => $this->product->price,
            'cost_price' => $this->product->cost_price,
            'qty' => 2,
            'subtotal' => 30000,
        ]);

        $response = $this->actingAs($this->user)->post('/akun/pesanan/ORD-CANCEL-01/batal');
        $response->assertRedirect();

        $order->refresh();
        $this->assertEquals(OrderStatus::CANCELLED, $order->status);

        // Stock restored (30 + 2 = 32)
        $this->product->refresh();
        $this->assertEquals(32, $this->product->stock);
    }

    public function test_public_track_order_with_valid_credentials()
    {
        Order::create([
            'order_number' => 'ORD-TRACK-01',
            'user_id' => $this->user->id,
            'status' => OrderStatus::SHIPPED,
            'payment_method' => 'midtrans',
            'payment_status' => PaymentStatus::PAID,
            'subtotal' => 15000,
            'discount_total' => 0,
            'shipping_cost' => 10000,
            'grand_total' => 25000,
            'shipping_method_id' => $this->shippingMethod->id,
            'recipient_name' => 'Budi',
            'recipient_phone' => '08123456789',
            'shipping_address' => 'Jl Dago',
        ]);

        $response = $this->post('/lacak-pesanan', [
            'order_number' => 'ORD-TRACK-01',
            'contact' => '08123456789',
        ]);

        $response->assertStatus(200);
    }
}
