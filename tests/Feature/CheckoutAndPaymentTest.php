<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\FinancialTransaction;
use App\Models\Order;
use App\Models\Product;
use App\Models\Prescription;
use App\Models\ShippingMethod;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class CheckoutAndPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Product $product;
    protected ShippingMethod $shippingMethod;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'role' => Role::CUSTOMER,
        ]);

        $category = Category::create([
            'name' => 'Obat Bebas Test',
            'slug' => 'obat-bebas-test',
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'category_id' => $category->id,
            'sku' => 'TEST-MED-01',
            'name' => 'Paracetamol 500mg Test',
            'slug' => 'paracetamol-500mg-test',
            'price' => 10000,
            'cost_price' => 5000,
            'unit' => 'Strip',
            'stock' => 50,
            'min_stock' => 5,
            'weight_gram' => 100,
            'is_active' => true,
        ]);

        $this->shippingMethod = ShippingMethod::create([
            'name' => 'Kurir Instant Bandung',
            'code' => 'INSTANT',
            'base_cost' => 15000,
            'cost_per_kg' => 2000,
            'est_days' => '1-3 Jam',
            'is_cod_available' => true,
            'is_active' => true,
        ]);
    }

    public function test_user_can_create_address()
    {
        $response = $this->actingAs($this->user)->post('/alamat', [
            'label' => 'Rumah',
            'recipient_name' => 'Budi Santoso',
            'phone' => '08123456789',
            'province' => 'Jawa Barat',
            'city' => 'Bandung',
            'district' => 'Coblong',
            'postal_code' => '40132',
            'address_line' => 'Jl. Dago No. 45',
            'is_default' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('addresses', [
            'user_id' => $this->user->id,
            'recipient_name' => 'Budi Santoso',
            'is_default' => true,
        ]);
    }

    public function test_user_can_checkout_order_and_stock_is_deducted()
    {
        $cart = Cart::create(['user_id' => $this->user->id]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'qty' => 3,
        ]);

        $address = Address::create([
            'user_id' => $this->user->id,
            'label' => 'Rumah',
            'recipient_name' => 'Budi Santoso',
            'phone' => '08123456789',
            'province' => 'Jawa Barat',
            'city' => 'Bandung',
            'district' => 'Coblong',
            'postal_code' => '40132',
            'address_line' => 'Jl. Dago No. 45',
            'is_default' => true,
        ]);

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
                    'price' => 17000,
                    'available_for_cash_on_delivery' => true,
                ]],
            ]),
        ]);

        $response = $this->actingAs($this->user)->post('/checkout', [
            'address_id' => $address->id,
            'courier_company' => 'jne',
            'courier_type' => 'reg',
            'shipping_cost' => 17000,
            'payment_method' => 'midtrans',
        ]);

        $response->assertRedirect();

        // Product stock deducted from 50 to 47
        $this->product->refresh();
        $this->assertEquals(47, $this->product->stock);

        // Order created in DB
        $order = Order::where('user_id', $this->user->id)->first();
        $this->assertNotNull($order);
        $this->assertEquals(OrderStatus::PENDING_PAYMENT, $order->status);
        $this->assertEquals(17000, $order->shipping_cost);
        $this->assertEquals('40132', $order->recipient_postal_code);
        $this->assertEquals('jne', $order->biteship_courier_company);

        // Cart items cleared
        $this->assertDatabaseCount('cart_items', 0);

        // Stock movement recorded
        $this->assertDatabaseHas('stock_movements', [
            'product_id' => $this->product->id,
            'qty' => -3,
        ]);

        Http::assertSent(fn (HttpRequest $request) => $request->url() === 'https://api.biteship.com/v1/rates/couriers'
            && $request['origin_postal_code'] === 40111
            && $request['destination_postal_code'] === 40132
            && $request['items'][0]['weight'] === 100
            && $request['items'][0]['quantity'] === 3);
    }

    public function test_midtrans_webhook_settlement_updates_order_to_paid_and_records_finance()
    {
        $order = Order::create([
            'order_number' => 'ORD-20260923-TEST1',
            'user_id' => $this->user->id,
            'status' => OrderStatus::PENDING_PAYMENT,
            'payment_method' => 'midtrans',
            'payment_status' => PaymentStatus::UNPAID,
            'subtotal' => 30000,
            'discount_total' => 0,
            'shipping_cost' => 17000,
            'grand_total' => 47000,
            'shipping_method_id' => $this->shippingMethod->id,
            'recipient_name' => 'Budi',
            'recipient_phone' => '0812345',
            'shipping_address' => 'Jl Dago',
        ]);

        $order->payment()->create([
            'provider' => 'midtrans',
            'midtrans_order_id' => 'ORD-20260923-TEST1-123456',
            'gross_amount' => 47000,
            'status' => PaymentStatus::UNPAID,
        ]);

        $serverKey = config('midtrans.server_key');
        $midtransOrderId = 'ORD-20260923-TEST1-123456';
        $statusCode = '200';
        $grossAmount = '47000.00';
        $signature = hash('sha512', $midtransOrderId.$statusCode.$grossAmount.$serverKey);

        $payload = [
            'order_id' => $midtransOrderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'signature_key' => $signature,
            'transaction_status' => 'settlement',
        ];

        $response = $this->postJson('/midtrans/notification', $payload);
        $response->assertStatus(200);

        $order->refresh();
        $this->assertEquals(OrderStatus::PAID, $order->status);
        $this->assertEquals(PaymentStatus::PAID, $order->payment_status);

        // Sales income recorded in financial transactions
        $this->assertDatabaseHas('financial_transactions', [
            'amount' => 47000,
            'reference_id' => $order->id,
        ]);
    }

    public function test_prescription_order_cannot_be_paid_before_approval()
    {
        $prescription = Prescription::create([
            'user_id' => $this->user->id,
            'file_path' => 'prescriptions/rx-pending.jpg',
            'status' => 'pending',
        ]);

        $order = Order::create([
            'order_number' => 'ORD-RX-PENDING-001',
            'user_id' => $this->user->id,
            'status' => OrderStatus::AWAITING_PRESCRIPTION,
            'payment_method' => 'midtrans',
            'payment_status' => PaymentStatus::UNPAID,
            'subtotal' => 35000,
            'discount_total' => 0,
            'shipping_cost' => 15000,
            'grand_total' => 50000,
            'shipping_method_id' => $this->shippingMethod->id,
            'prescription_id' => $prescription->id,
            'recipient_name' => 'Budi',
            'recipient_phone' => '0812345',
            'shipping_address' => 'Jl Dago',
        ]);

        $midtransOrderId = $order->order_number.'-123456';
        $order->payment()->create([
            'provider' => 'midtrans',
            'midtrans_order_id' => $midtransOrderId,
            'gross_amount' => 50000,
            'status' => PaymentStatus::UNPAID,
        ]);

        $this->actingAs($this->user)
            ->get(route('payment.show', $order->order_number))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('snapToken', null)
                ->where('order.status', OrderStatus::AWAITING_PRESCRIPTION->value)
                ->where('order.prescription.status', 'pending'));

        $statusCode = '200';
        $grossAmount = '50000.00';
        $payload = [
            'order_id' => $midtransOrderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'signature_key' => hash(
                'sha512',
                $midtransOrderId.$statusCode.$grossAmount.config('midtrans.server_key')
            ),
            'transaction_status' => 'settlement',
        ];

        $this->postJson('/midtrans/notification', $payload)->assertNotFound();

        $this->assertEquals(OrderStatus::AWAITING_PRESCRIPTION, $order->refresh()->status);
        $this->assertEquals(PaymentStatus::UNPAID, $order->payment->refresh()->status);
        $this->assertDatabaseCount('financial_transactions', 0);
    }

    public function test_expire_orders_command_restores_stock()
    {
        $order = Order::create([
            'order_number' => 'ORD-EXPIRED-01',
            'user_id' => $this->user->id,
            'status' => OrderStatus::PENDING_PAYMENT,
            'payment_method' => 'midtrans',
            'payment_status' => PaymentStatus::UNPAID,
            'subtotal' => 10000,
            'discount_total' => 0,
            'shipping_cost' => 15000,
            'grand_total' => 25000,
            'shipping_method_id' => $this->shippingMethod->id,
            'recipient_name' => 'Budi',
            'recipient_phone' => '0812345',
            'shipping_address' => 'Jl Dago',
            'expires_at' => now()->subHour(),
        ]);

        $order->items()->create([
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'sku' => $this->product->sku,
            'price' => $this->product->price,
            'cost_price' => $this->product->cost_price,
            'qty' => 5,
            'subtotal' => 50000,
        ]);

        // Stock before expire = 50
        $this->artisan('orders:expire')->assertExitCode(0);

        $order->refresh();
        $this->assertEquals(OrderStatus::EXPIRED, $order->status);

        // Stock restored from 50 to 55
        $this->product->refresh();
        $this->assertEquals(55, $this->product->stock);
    }
}
