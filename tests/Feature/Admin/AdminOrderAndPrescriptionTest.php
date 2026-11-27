<?php

namespace Tests\Feature\Admin;

use App\Enums\DrugClass;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\PrescriptionStatus;
use App\Enums\ReturnStatus;
use App\Enums\Role;
use App\Enums\ShipmentStatus;
use App\Enums\TransactionCategory;
use App\Enums\TransactionType;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderReturn;
use App\Models\Prescription;
use App\Models\Product;
use App\Models\Shipment;
use App\Models\ShippingMethod;
use App\Models\User;
use App\Services\BiteshipService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AdminOrderAndPrescriptionTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $customer;

    protected Product $product;

    protected ShippingMethod $shippingMethod;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => Role::ADMIN]);
        $this->customer = User::factory()->create(['role' => Role::CUSTOMER]);

        $category = Category::create([
            'name' => 'Antibiotik',
            'slug' => 'antibiotik',
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'category_id' => $category->id,
            'name' => 'Cefixime 200mg',
            'slug' => 'cefixime-200mg',
            'sku' => 'CFX-200',
            'drug_class' => DrugClass::KERAS->value,
            'price' => 35000,
            'cost_price' => 20000,
            'unit' => 'Kapsul',
            'stock' => 50,
            'min_stock' => 5,
            'weight_gram' => 50,
            'requires_prescription' => true,
            'is_active' => true,
        ]);

        $this->shippingMethod = ShippingMethod::create([
            'name' => 'Kurir Apotek Instant',
            'code' => 'INSTANT',
            'base_cost' => 15000,
            'cost_per_kg' => 0,
            'est_days' => '3 Jam',
            'is_cod_available' => true,
            'is_active' => true,
        ]);
    }

    public function test_admin_can_view_orders_and_update_status(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-ADMIN-001',
            'user_id' => $this->customer->id,
            'status' => OrderStatus::PAID,
            'payment_method' => PaymentMethod::MIDTRANS,
            'payment_status' => PaymentStatus::PAID,
            'subtotal' => 70000,
            'discount_total' => 0,
            'shipping_cost' => 15000,
            'grand_total' => 85000,
            'shipping_method_id' => $this->shippingMethod->id,
            'recipient_name' => 'Andi',
            'recipient_phone' => '0812345678',
            'shipping_address' => 'Jl Sukajadi No 1',
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.orders.index'));
        $response->assertOk();

        // Update status to processing
        $statusResponse = $this->actingAs($this->admin)->post(route('admin.orders.status', $order->id), [
            'status' => OrderStatus::PROCESSING->value,
            'notes' => 'Pesanan sedang disiapkan di instalasi farmasi',
        ]);
        $statusResponse->assertRedirect();

        $order->refresh();
        $this->assertEquals(OrderStatus::PROCESSING, $order->status);
    }

    public function test_admin_can_approve_prescription_and_enable_payment(): void
    {
        $prescription = Prescription::create([
            'user_id' => $this->customer->id,
            'file_path' => 'prescriptions/rx-sample.jpg',
            'status' => PrescriptionStatus::PENDING,
            'doctor_name' => 'dr. Andi Santoso, Sp.A',
        ]);

        $order = Order::create([
            'order_number' => 'ORD-RX-001',
            'user_id' => $this->customer->id,
            'prescription_id' => $prescription->id,
            'status' => OrderStatus::AWAITING_PRESCRIPTION,
            'payment_method' => PaymentMethod::MIDTRANS,
            'payment_status' => PaymentStatus::UNPAID,
            'subtotal' => 35000,
            'discount_total' => 0,
            'shipping_cost' => 15000,
            'grand_total' => 50000,
            'shipping_method_id' => $this->shippingMethod->id,
            'recipient_name' => 'Andi',
            'recipient_phone' => '0812345678',
            'shipping_address' => 'Jl Sukajadi No 1',
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.prescriptions.approve', $prescription->id), [
            'note' => 'Resep valid sesuai SIP dokter',
        ]);
        $response->assertRedirect();

        $prescription->refresh();
        $order->refresh();
        $this->assertEquals(PrescriptionStatus::APPROVED, $prescription->status);
        $this->assertEquals(OrderStatus::PENDING_PAYMENT, $order->status);
        $this->assertEquals(PaymentStatus::UNPAID, $order->payment_status);
        $this->assertNull($order->paid_at);
    }

    public function test_pharmacist_can_approve_prescription_and_enable_payment(): void
    {
        /** @var User $pharmacist */
        $pharmacist = User::factory()->create(['role' => Role::PHARMACIST]);
        $prescription = Prescription::create([
            'user_id' => $this->customer->id,
            'file_path' => 'prescriptions/rx-pharmacist.jpg',
            'status' => PrescriptionStatus::PENDING,
        ]);
        $order = Order::create([
            'order_number' => 'ORD-RX-PHARM-001',
            'user_id' => $this->customer->id,
            'prescription_id' => $prescription->id,
            'status' => OrderStatus::AWAITING_PRESCRIPTION,
            'payment_method' => PaymentMethod::MIDTRANS,
            'payment_status' => PaymentStatus::UNPAID,
            'subtotal' => 35000,
            'discount_total' => 0,
            'shipping_cost' => 15000,
            'grand_total' => 50000,
            'shipping_method_id' => $this->shippingMethod->id,
            'recipient_name' => 'Andi',
            'recipient_phone' => '0812345678',
            'shipping_address' => 'Jl Sukajadi No 1',
        ]);

        $this->actingAs($pharmacist)
            ->post(route('admin.prescriptions.approve', $prescription->id))
            ->assertRedirect();

        $this->assertEquals(OrderStatus::PENDING_PAYMENT, $order->refresh()->status);
        $this->assertEquals(PrescriptionStatus::APPROVED, $prescription->refresh()->status);
    }

    public function test_approved_prescription_allows_cod_order_to_continue_without_marking_it_paid(): void
    {
        $prescription = Prescription::create([
            'user_id' => $this->customer->id,
            'file_path' => 'prescriptions/rx-cod.jpg',
            'status' => PrescriptionStatus::PENDING,
        ]);

        $order = Order::create([
            'order_number' => 'ORD-RX-COD-001',
            'user_id' => $this->customer->id,
            'prescription_id' => $prescription->id,
            'status' => OrderStatus::AWAITING_PRESCRIPTION,
            'payment_method' => PaymentMethod::COD,
            'payment_status' => PaymentStatus::UNPAID,
            'subtotal' => 35000,
            'discount_total' => 0,
            'shipping_cost' => 15000,
            'grand_total' => 50000,
            'shipping_method_id' => $this->shippingMethod->id,
            'recipient_name' => 'Andi',
            'recipient_phone' => '0812345678',
            'shipping_address' => 'Jl Sukajadi No 1',
        ]);

        $this->actingAs($this->admin)
            ->post(route('admin.prescriptions.approve', $prescription->id))
            ->assertRedirect();

        $order->refresh();
        $this->assertEquals(OrderStatus::PROCESSING, $order->status);
        $this->assertEquals(PaymentStatus::UNPAID, $order->payment_status);
        $this->assertNull($order->paid_at);
    }

    public function test_prescription_queue_includes_its_order_and_image_url(): void
    {
        $prescription = Prescription::create([
            'user_id' => $this->customer->id,
            'file_path' => 'prescriptions/rx-queue.jpg',
            'status' => PrescriptionStatus::PENDING,
        ]);

        $order = Order::create([
            'order_number' => 'ORD-RX-QUEUE-001',
            'user_id' => $this->customer->id,
            'prescription_id' => $prescription->id,
            'status' => OrderStatus::AWAITING_PRESCRIPTION,
            'payment_method' => PaymentMethod::MIDTRANS,
            'payment_status' => PaymentStatus::UNPAID,
            'subtotal' => 35000,
            'discount_total' => 0,
            'shipping_cost' => 15000,
            'grand_total' => 50000,
            'shipping_method_id' => $this->shippingMethod->id,
            'recipient_name' => 'Andi',
            'recipient_phone' => '0812345678',
            'shipping_address' => 'Jl Sukajadi No 1',
        ]);

        $this->actingAs($this->admin)
            ->get(route('admin.prescriptions.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('admin/prescriptions/index')
                ->where('prescriptions.data.0.order.order_number', $order->order_number)
                ->where('prescriptions.data.0.prescription_number', 'RX-'.str_pad((string) $prescription->id, 6, '0', STR_PAD_LEFT))
                ->where('prescriptions.data.0.image_url', route('prescriptions.file', $prescription->id)));
    }

    public function test_admin_can_reject_prescription_which_cancels_order_and_restores_stock(): void
    {
        $this->product->update(['stock' => 48]); // 2 booked

        $prescription = Prescription::create([
            'user_id' => $this->customer->id,
            'file_path' => 'prescriptions/rx-invalid.jpg',
            'status' => PrescriptionStatus::PENDING,
            'doctor_name' => 'dr. Budi',
        ]);

        $order = Order::create([
            'order_number' => 'ORD-RX-REJECT-01',
            'user_id' => $this->customer->id,
            'prescription_id' => $prescription->id,
            'status' => OrderStatus::AWAITING_PRESCRIPTION,
            'payment_method' => PaymentMethod::MIDTRANS,
            'payment_status' => PaymentStatus::UNPAID,
            'subtotal' => 70000,
            'discount_total' => 0,
            'shipping_cost' => 15000,
            'grand_total' => 85000,
            'shipping_method_id' => $this->shippingMethod->id,
            'recipient_name' => 'Andi',
            'recipient_phone' => '0812345678',
            'shipping_address' => 'Jl Sukajadi No 1',
        ]);

        $order->items()->create([
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'sku' => $this->product->sku,
            'price' => $this->product->price,
            'cost_price' => $this->product->cost_price,
            'qty' => 2,
            'subtotal' => 70000,
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.prescriptions.reject', $prescription->id), [
            'note' => 'Foto resep buram dan tidak terbaca jelas',
        ]);
        $response->assertRedirect();

        $prescription->refresh();
        $order->refresh();
        $this->product->refresh();

        $this->assertEquals(PrescriptionStatus::REJECTED, $prescription->status);
        $this->assertEquals(OrderStatus::CANCELLED, $order->status);
        $this->assertEquals(50, $this->product->stock); // 48 + 2 restored
    }

    public function test_admin_can_ship_order_with_tracking_number(): void
    {
        config([
            'services.biteship.api_key' => 'biteship_test_key',
            'services.biteship.origin.contact_name' => 'Apotek',
            'services.biteship.origin.contact_phone' => '08123456789',
            'services.biteship.origin.address' => 'Jl. Apotek No. 1',
            'services.biteship.origin.postal_code' => '40111',
        ]);
        Http::fake([
            'api.biteship.com/v1/orders' => Http::response([
                'success' => true,
                'id' => 'biteship-order-001',
                'courier' => [
                    'tracking_id' => 'biteship-tracking-001',
                    'waybill_id' => 'RESI-BITESHIP-999',
                    'company' => 'jne',
                    'type' => 'reg',
                    'link' => 'https://tracking.example.test/order-001',
                ],
                'price' => 18000,
                'status' => 'confirmed',
            ]),
        ]);

        $order = Order::create([
            'order_number' => 'ORD-SHIP-01',
            'user_id' => $this->customer->id,
            'status' => OrderStatus::PROCESSING,
            'payment_method' => PaymentMethod::MIDTRANS,
            'payment_status' => PaymentStatus::PAID,
            'subtotal' => 35000,
            'discount_total' => 0,
            'shipping_cost' => 15000,
            'grand_total' => 50000,
            'recipient_postal_code' => '40132',
            'biteship_courier_company' => 'jne',
            'biteship_courier_type' => 'reg',
            'biteship_courier_name' => 'JNE',
            'biteship_service_name' => 'Reguler',
            'biteship_delivery_duration' => '2 - 3 days',
            'recipient_name' => 'Andi',
            'recipient_phone' => '0812345678',
            'shipping_address' => 'Jl Sukajadi No 1',
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.shipments.ship', $order->id));
        $response->assertRedirect();

        $order->refresh();
        $this->assertEquals(OrderStatus::SHIPPED, $order->status);
        $this->assertDatabaseHas('shipments', [
            'order_id' => $order->id,
            'biteship_order_id' => 'biteship-order-001',
            'biteship_tracking_id' => 'biteship-tracking-001',
            'tracking_number' => 'RESI-BITESHIP-999',
            'courier' => 'jne',
        ]);
        Http::assertSent(fn ($request) => str_ends_with($request->url(), '/orders')
            && ! isset($request['items'][0]['category']));
    }

    public function test_admin_can_create_biteship_shipment_for_legacy_shipped_order_without_shipment_record(): void
    {
        config([
            'services.biteship.api_key' => 'biteship_test_key',
            'services.biteship.origin.contact_name' => 'Apotek',
            'services.biteship.origin.contact_phone' => '08123456789',
            'services.biteship.origin.address' => 'Jl. Apotek No. 1',
            'services.biteship.origin.postal_code' => '40111',
        ]);
        Http::fake([
            'api.biteship.com/v1/orders' => Http::response([
                'success' => true,
                'id' => 'biteship-recovery-order-001',
                'courier' => [
                    'tracking_id' => 'biteship-recovery-tracking-001',
                    'waybill_id' => 'RESI-RECOVERY-001',
                    'company' => 'jne',
                    'type' => 'reg',
                ],
                'price' => 18000,
                'status' => 'confirmed',
            ]),
        ]);

        $order = Order::create([
            'order_number' => 'ORD-RECOVER-SHIP-01',
            'user_id' => $this->customer->id,
            'status' => OrderStatus::SHIPPED,
            'payment_method' => PaymentMethod::MIDTRANS,
            'payment_status' => PaymentStatus::PAID,
            'subtotal' => 35000,
            'discount_total' => 0,
            'shipping_cost' => 15000,
            'grand_total' => 50000,
            'shipping_method_id' => $this->shippingMethod->id,
            'recipient_postal_code' => '40132',
            'biteship_courier_company' => 'jne',
            'biteship_courier_type' => 'reg',
            'biteship_courier_name' => 'JNE',
            'biteship_service_name' => 'Reguler',
            'recipient_name' => 'Andi',
            'recipient_phone' => '0812345678',
            'shipping_address' => 'Jl Sukajadi No 1',
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.shipments.ship', $order));

        $response->assertRedirect();
        $this->assertDatabaseHas('shipments', [
            'order_id' => $order->id,
            'biteship_order_id' => 'biteship-recovery-order-001',
            'tracking_number' => 'RESI-RECOVERY-001',
        ]);
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderStatus::SHIPPED->value,
        ]);
    }

    public function test_admin_cannot_mark_processing_order_shipped_without_biteship_booking(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-BLOCK-MANUAL-SHIP-01',
            'user_id' => $this->customer->id,
            'status' => OrderStatus::PROCESSING,
            'payment_method' => PaymentMethod::MIDTRANS,
            'payment_status' => PaymentStatus::PAID,
            'subtotal' => 35000,
            'discount_total' => 0,
            'shipping_cost' => 15000,
            'grand_total' => 50000,
            'shipping_method_id' => $this->shippingMethod->id,
            'recipient_name' => 'Andi',
            'recipient_phone' => '0812345678',
            'shipping_address' => 'Jl Sukajadi No 1',
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.orders.status', $order), [
            'status' => OrderStatus::SHIPPED->value,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderStatus::PROCESSING->value,
        ]);
        $this->assertDatabaseMissing('shipments', ['order_id' => $order->id]);
    }

    public function test_biteship_cod_shipment_uses_discounted_item_total_as_cod_amount(): void
    {
        config([
            'services.biteship.api_key' => 'biteship_test_key',
            'services.biteship.origin.contact_name' => 'Apotek',
            'services.biteship.origin.contact_phone' => '08123456789',
            'services.biteship.origin.address' => 'Jl. Apotek No. 1',
            'services.biteship.origin.postal_code' => '40111',
        ]);
        Http::fake([
            'api.biteship.com/v1/rates/couriers' => Http::response([
                'success' => true,
                'pricing' => [],
            ]),
            'api.biteship.com/v1/orders' => Http::response([
                'success' => true,
                'id' => 'biteship-cod-order-001',
            ]),
        ]);

        $order = Order::create([
            'order_number' => 'ORD-COD-SHIP-01',
            'user_id' => $this->customer->id,
            'status' => OrderStatus::PROCESSING,
            'payment_method' => PaymentMethod::COD,
            'payment_status' => PaymentStatus::UNPAID,
            'subtotal' => 35000,
            'discount_total' => 5000,
            'shipping_cost' => 15000,
            'grand_total' => 45000,
            'recipient_postal_code' => '40132',
            'biteship_courier_company' => 'jne',
            'biteship_courier_type' => 'reg',
            'recipient_name' => 'Andi',
            'recipient_phone' => '0812345678',
            'shipping_address' => 'Jl Sukajadi No 1',
        ]);
        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'sku' => $this->product->sku,
            'price' => 35000,
            'cost_price' => 20000,
            'qty' => 1,
            'subtotal' => 35000,
        ]);

        $biteship = app(BiteshipService::class);
        $biteship->rates(40132, [[
            'name' => $this->product->name,
            'value' => 35000,
            'quantity' => 1,
            'weight' => 100,
        ]], 30000);
        $biteship->createOrder($order);

        Http::assertSent(fn ($request) => str_ends_with($request->url(), '/rates/couriers')
            && $request['destination_cash_on_delivery'] === 30000);
        Http::assertSent(fn ($request) => str_ends_with($request->url(), '/orders')
            && $request['destination_cash_on_delivery'] === 30000);
    }

    public function test_admin_can_manually_save_tracking_number_for_shipped_order(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-MANUAL-TRACKING-01',
            'user_id' => $this->customer->id,
            'status' => OrderStatus::SHIPPED,
            'payment_method' => PaymentMethod::MIDTRANS,
            'payment_status' => PaymentStatus::PAID,
            'subtotal' => 35000,
            'discount_total' => 0,
            'shipping_cost' => 15000,
            'grand_total' => 50000,
            'shipping_method_id' => $this->shippingMethod->id,
            'recipient_name' => 'Andi',
            'recipient_phone' => '0812345678',
            'shipping_address' => 'Jl Sukajadi No 1',
        ]);
        Shipment::create([
            'order_id' => $order->id,
            'courier' => 'SiCepat',
            'service' => 'REG',
            'status' => ShipmentStatus::SHIPPED,
        ]);

        $response = $this->actingAs($this->admin)->put(route('admin.shipments.tracking-number', $order), [
            'tracking_number' => 'SICEPAT-123456',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('shipments', [
            'order_id' => $order->id,
            'tracking_number' => 'SICEPAT-123456',
        ]);
    }

    public function test_admin_cannot_manually_save_tracking_number_before_order_is_shipped(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-MANUAL-TRACKING-02',
            'user_id' => $this->customer->id,
            'status' => OrderStatus::PROCESSING,
            'payment_method' => PaymentMethod::MIDTRANS,
            'payment_status' => PaymentStatus::PAID,
            'subtotal' => 35000,
            'discount_total' => 0,
            'shipping_cost' => 15000,
            'grand_total' => 50000,
            'shipping_method_id' => $this->shippingMethod->id,
            'recipient_name' => 'Andi',
            'recipient_phone' => '0812345678',
            'shipping_address' => 'Jl Sukajadi No 1',
        ]);
        Shipment::create([
            'order_id' => $order->id,
            'courier' => 'SiCepat',
            'service' => 'REG',
            'status' => ShipmentStatus::PENDING,
        ]);

        $response = $this->actingAs($this->admin)->put(route('admin.shipments.tracking-number', $order), [
            'tracking_number' => 'SICEPAT-123456',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseMissing('shipments', [
            'order_id' => $order->id,
            'tracking_number' => 'SICEPAT-123456',
        ]);
    }

    public function test_admin_can_confirm_cod_payment_and_record_income(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-COD-CONFIRM-01',
            'user_id' => $this->customer->id,
            'status' => OrderStatus::SHIPPED,
            'payment_method' => PaymentMethod::COD,
            'payment_status' => PaymentStatus::UNPAID,
            'subtotal' => 70000,
            'discount_total' => 0,
            'shipping_cost' => 15000,
            'grand_total' => 85000,
            'shipping_method_id' => $this->shippingMethod->id,
            'recipient_name' => 'Andi',
            'recipient_phone' => '0812345678',
            'shipping_address' => 'Jl Sukajadi No 1',
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.payments.cod', $order->id));
        $response->assertRedirect();

        $order->refresh();
        $this->assertEquals(PaymentStatus::PAID, $order->payment_status);
        $this->assertEquals(OrderStatus::COMPLETED, $order->status);

        $this->assertDatabaseHas('financial_transactions', [
            'type' => TransactionType::INCOME->value,
            'category' => TransactionCategory::SALES->value,
            'amount' => 85000,
        ]);
    }

    public function test_admin_can_approve_return_and_restore_stock(): void
    {
        $this->product->update(['stock' => 45]);

        $order = Order::create([
            'order_number' => 'ORD-RETURN-01',
            'user_id' => $this->customer->id,
            'status' => OrderStatus::COMPLETED,
            'payment_method' => PaymentMethod::MIDTRANS,
            'payment_status' => PaymentStatus::PAID,
            'subtotal' => 70000,
            'discount_total' => 0,
            'shipping_cost' => 15000,
            'grand_total' => 85000,
            'shipping_method_id' => $this->shippingMethod->id,
            'recipient_name' => 'Andi',
            'recipient_phone' => '0812345678',
            'shipping_address' => 'Jl Sukajadi No 1',
        ]);

        $orderItem = $order->items()->create([
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'sku' => $this->product->sku,
            'price' => $this->product->price,
            'cost_price' => $this->product->cost_price,
            'qty' => 2,
            'subtotal' => 70000,
        ]);

        $orderReturn = OrderReturn::create([
            'order_id' => $order->id,
            'user_id' => $this->customer->id,
            'order_item_id' => $orderItem->id,
            'type' => 'refund',
            'reason' => 'Salah varian obat',
            'qty' => 2,
            'status' => ReturnStatus::REQUESTED,
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.returns.approve', $orderReturn->id), [
            'admin_note' => 'Retur disetujui dan dana di-refund',
        ]);
        $response->assertRedirect();

        $orderReturn->refresh();
        $this->product->refresh();

        $this->assertEquals(ReturnStatus::APPROVED, $orderReturn->status);
        $this->assertEquals(47, $this->product->stock); // 45 + 2

        $this->assertDatabaseHas('financial_transactions', [
            'type' => TransactionType::EXPENSE->value,
            'category' => TransactionCategory::REFUND->value,
            'amount' => 70000,
        ]);
    }

    public function test_pharmacist_can_manage_sales_operations_but_not_admin_pages(): void
    {
        /** @var User $pharmacist */
        $pharmacist = User::factory()->create(['role' => Role::PHARMACIST]);

        foreach ([
            'admin.orders.index',
            'admin.prescriptions.index',
            'admin.payments.index',
            'admin.shipments.index',
            'admin.returns.index',
        ] as $routeName) {
            $this->actingAs($pharmacist)->get(route($routeName))->assertOk();
        }

        $this->actingAs($pharmacist)->get(route('admin.dashboard'))->assertForbidden();
        $this->actingAs($pharmacist)->get(route('admin.products.index'))->assertForbidden();

        $order = Order::create([
            'order_number' => 'ORD-PHARMACIST-001',
            'user_id' => $this->customer->id,
            'status' => OrderStatus::PAID,
            'payment_method' => PaymentMethod::MIDTRANS,
            'payment_status' => PaymentStatus::PAID,
            'subtotal' => 35000,
            'discount_total' => 0,
            'shipping_cost' => 15000,
            'grand_total' => 50000,
            'shipping_method_id' => $this->shippingMethod->id,
            'recipient_name' => 'Andi',
            'recipient_phone' => '0812345678',
            'shipping_address' => 'Jl Sukajadi No 1',
        ]);

        $this->actingAs($pharmacist)
            ->post(route('admin.orders.status', $order->id), [
                'status' => OrderStatus::PROCESSING->value,
                'notes' => 'Pesanan sedang disiapkan',
            ])
            ->assertRedirect();

        $this->assertEquals(OrderStatus::PROCESSING, $order->refresh()->status);
    }
}
