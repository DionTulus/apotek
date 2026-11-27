<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Enums\ShipmentStatus;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderReturn;
use App\Models\Product;
use App\Models\Prescription;
use App\Models\Shipment;
use App\Models\ShippingMethod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia;
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
        $order = Order::create([
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

    public function test_customer_can_submit_return_request_with_evidence_image(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-RETURN-01',
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
            'recipient_phone' => '0812345',
            'shipping_address' => 'Jl Dago',
        ]);
        $item = $order->items()->create([
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'sku' => $this->product->sku,
            'price' => $this->product->price,
            'cost_price' => $this->product->cost_price,
            'qty' => 1,
            'subtotal' => $this->product->price,
        ]);
        Storage::fake('public');

        $this->actingAs($this->user)
            ->post(route('account.orders.return', $order->order_number), [
                'order_item_id' => $item->id,
                'type' => 'refund',
                'qty' => 1,
                'reason' => 'Produk rusak.',
                'evidence_image' => UploadedFile::fake()->image('return-proof.jpg'),
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Pengajuan retur produk berhasil dikirim. Tim kami akan segera memproses.');

        $return = OrderReturn::where('order_id', $order->id)->firstOrFail();
        $this->assertSame('requested', $return->status->value);
        Storage::disk('public')->assertExists($return->evidence_image);
    }

    public function test_public_track_order_with_valid_credentials()
    {
        $order = Order::create([
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

        Shipment::create([
            'order_id' => $order->id,
            'courier' => 'JNE',
            'service' => 'REG',
            'tracking_number' => 'RESI-TRACK-01',
            'cost' => 10000,
            'status' => ShipmentStatus::SHIPPED,
            'shipped_at' => now(),
        ]);

        $order->statusHistories()->create([
            'status' => OrderStatus::SHIPPED,
            'note' => 'Paket telah diserahkan ke kurir.',
        ]);

        $response = $this->post('/lacak-pesanan', [
            'order_number' => 'ORD-TRACK-01',
            'contact' => '08123456789',
        ]);

        $response->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
            ->component('store/tracking')
            ->where('orderResult.order_number', 'ORD-TRACK-01')
            ->where('orderResult.shipment.tracking_number', 'RESI-TRACK-01')
            ->has('orderResult.statusHistories', 1));
    }

    public function test_customer_can_optionally_confirm_received_delivery_without_changing_payment_status(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-RECEIVED-01',
            'user_id' => $this->user->id,
            'status' => OrderStatus::DELIVERED,
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
        $shipment = Shipment::create([
            'order_id' => $order->id,
            'courier' => 'JNE',
            'service' => 'REG',
            'tracking_number' => 'RESI-RECEIVED-01',
            'cost' => 10000,
            'status' => ShipmentStatus::DELIVERED,
            'delivered_at' => now(),
        ]);

        $this->actingAs($this->user)
            ->post(route('account.orders.confirm-received', $order->order_number))
            ->assertRedirect();

        $this->assertNotNull($shipment->refresh()->customer_received_at);
        $this->assertEquals(OrderStatus::DELIVERED, $order->refresh()->status);
        $this->assertEquals(PaymentStatus::PAID, $order->payment_status);

        $this->actingAs($this->otherUser)
            ->post(route('account.orders.confirm-received', $order->order_number))
            ->assertNotFound();
    }

    public function test_prescription_file_is_only_available_to_owner_or_staff(): void
    {
        Storage::fake('local');
        Storage::fake('public');
        Storage::disk('local')->put('prescriptions/private.jpg', 'private image');

        $prescription = Prescription::create([
            'user_id' => $this->user->id,
            'file_path' => 'prescriptions/private.jpg',
        ]);

        $this->actingAs($this->otherUser)
            ->get(route('prescriptions.file', $prescription))
            ->assertForbidden();

        $this->actingAs($this->user)
            ->get(route('prescriptions.file', $prescription))
            ->assertOk();

        $pharmacist = User::factory()->create(['role' => Role::PHARMACIST]);
        $this->actingAs($pharmacist)
            ->get(route('prescriptions.file', $prescription))
            ->assertOk();
    }

    public function test_checkout_requires_prescription_file_for_prescription_product(): void
    {
        $this->product->update(['requires_prescription' => true]);
        config([
            'services.biteship.api_key' => 'biteship_test_key',
            'services.biteship.origin.postal_code' => '40111',
        ]);
        Http::fake([
            'api.biteship.com/v1/rates/couriers' => Http::response([
                'success' => true,
                'pricing' => [[
                    'company' => 'jne',
                    'courier_name' => 'JNE',
                    'courier_service_name' => 'Reguler',
                    'courier_service_code' => 'reg',
                    'type' => 'reg',
                    'duration' => '2 - 3 days',
                    'price' => 10000,
                    'available_for_cash_on_delivery' => true,
                ]],
            ]),
        ]);

        $cart = Cart::create(['user_id' => $this->user->id]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'qty' => 1,
        ]);

        $this->actingAs($this->user)
            ->post(route('checkout.store'), [
                'recipient_name' => 'Budi',
                'recipient_phone' => '08123456789',
                'recipient_postal_code' => '40132',
                'full_address' => 'Jl Dago',
                'courier_company' => 'jne',
                'courier_type' => 'reg',
                'shipping_cost' => 10000,
                'payment_method' => 'midtrans',
            ])
            ->assertRedirect()
            ->assertSessionHas('error', 'Unggah resep dokter untuk melanjutkan pesanan obat keras.');

        $this->assertDatabaseMissing('orders', ['user_id' => $this->user->id]);
    }
}
