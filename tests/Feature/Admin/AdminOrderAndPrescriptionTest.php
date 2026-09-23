<?php

namespace Tests\Feature\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\PrescriptionStatus;
use App\Enums\Role;
use App\Models\Category;
use App\Models\Order;
use App\Models\Prescription;
use App\Models\Product;
use App\Models\ReturnRequest;
use App\Models\ShippingMethod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
            'payment_method' => 'midtrans',
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

    public function test_admin_can_approve_prescription_and_move_order_to_pending_payment(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-RX-001',
            'user_id' => $this->customer->id,
            'status' => OrderStatus::WAITING_PRESCRIPTION,
            'payment_method' => 'midtrans',
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

        $prescription = Prescription::create([
            'user_id' => $this->customer->id,
            'order_id' => $order->id,
            'image_path' => 'prescriptions/rx-sample.jpg',
            'status' => PrescriptionStatus::PENDING,
            'patient_name' => 'Andi Santoso',
            'patient_age' => 30,
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.prescriptions.approve', $prescription->id), [
            'pharmacist_notes' => 'Resep valid sesuai SIP dokter',
        ]);
        $response->assertRedirect();

        $prescription->refresh();
        $order->refresh();
        $this->assertEquals(PrescriptionStatus::APPROVED, $prescription->status);
        $this->assertEquals(OrderStatus::PENDING_PAYMENT, $order->status);
    }

    public function test_admin_can_reject_prescription_which_cancels_order_and_restores_stock(): void
    {
        $this->product->update(['stock' => 48]); // 2 booked

        $order = Order::create([
            'order_number' => 'ORD-RX-REJECT-01',
            'user_id' => $this->customer->id,
            'status' => OrderStatus::WAITING_PRESCRIPTION,
            'payment_method' => 'midtrans',
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

        $prescription = Prescription::create([
            'user_id' => $this->customer->id,
            'order_id' => $order->id,
            'image_path' => 'prescriptions/rx-invalid.jpg',
            'status' => PrescriptionStatus::PENDING,
            'patient_name' => 'Andi',
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.prescriptions.reject', $prescription->id), [
            'notes' => 'Foto resep buram dan tidak terbaca jelas',
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
        $order = Order::create([
            'order_number' => 'ORD-SHIP-01',
            'user_id' => $this->customer->id,
            'status' => OrderStatus::PROCESSING,
            'payment_method' => 'midtrans',
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

        $response = $this->actingAs($this->admin)->post(route('admin.shipments.ship', $order->id), [
            'tracking_number' => 'RESI-APOTEK-999',
        ]);
        $response->assertRedirect();

        $order->refresh();
        $this->assertEquals(OrderStatus::SHIPPED, $order->status);
        $this->assertEquals('RESI-APOTEK-999', $order->tracking_number);
    }

    public function test_admin_can_confirm_cod_payment_and_record_income(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-COD-CONFIRM-01',
            'user_id' => $this->customer->id,
            'status' => OrderStatus::SHIPPED,
            'payment_method' => 'cod',
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
            'type' => 'income',
            'order_id' => $order->id,
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
            'payment_method' => 'midtrans',
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

        $returnReq = ReturnRequest::create([
            'order_id' => $order->id,
            'user_id' => $this->customer->id,
            'reason' => 'Salah varian obat',
            'status' => 'pending',
            'refund_amount' => 70000,
        ]);

        $returnReq->items()->create([
            'product_id' => $this->product->id,
            'qty' => 2,
            'reason' => 'Barang tersegel utuh',
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.returns.approve', $returnReq->id), [
            'admin_notes' => 'Retur disetujui dan dana di-refund',
        ]);
        $response->assertRedirect();

        $returnReq->refresh();
        $this->product->refresh();

        $this->assertEquals('approved', $returnReq->status);
        $this->assertEquals(47, $this->product->stock); // 45 + 2

        $this->assertDatabaseHas('financial_transactions', [
            'type' => 'expense',
            'category' => 'refund_retur',
            'amount' => 70000,
        ]);
    }
}
