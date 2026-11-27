<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ShipmentStatus;
use App\Models\Order;
use App\Models\Shipment;
use App\Models\ShippingMethod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BiteshipWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_biteship_webhook_updates_delivery_and_records_duplicate_safe_tracking_history(): void
    {
        config([
            'services.biteship.webhook_header' => 'X-Biteship-Secret',
            'services.biteship.webhook_secret' => 'webhook-secret',
        ]);

        $customer = User::factory()->create();
        $shippingMethod = ShippingMethod::create([
            'name' => 'Legacy shipping',
            'code' => 'LEGACY',
            'base_cost' => 10000,
            'cost_per_kg' => 0,
            'est_days' => '2-3 days',
            'is_cod_available' => false,
            'is_active' => true,
        ]);
        $order = Order::create([
            'order_number' => 'ORD-BITESHIP-01',
            'user_id' => $customer->id,
            'status' => OrderStatus::SHIPPED,
            'payment_method' => 'midtrans',
            'payment_status' => PaymentStatus::PAID,
            'subtotal' => 15000,
            'discount_total' => 0,
            'shipping_cost' => 10000,
            'grand_total' => 25000,
            'shipping_method_id' => $shippingMethod->id,
            'recipient_name' => 'Budi',
            'recipient_phone' => '08123456789',
            'shipping_address' => 'Jl Dago',
        ]);
        Shipment::create([
            'order_id' => $order->id,
            'courier' => 'jne',
            'service' => 'reg',
            'tracking_number' => 'WB-OLD',
            'cost' => 10000,
            'status' => ShipmentStatus::SHIPPED,
            'biteship_order_id' => 'biteship-order-01',
            'biteship_tracking_id' => 'biteship-tracking-01',
        ]);

        $payload = [
            'event' => 'order.status',
            'order_id' => 'biteship-order-01',
            'courier_tracking_id' => 'biteship-tracking-01',
            'courier_waybill_id' => 'WB-DELIVERED',
            'courier_company' => 'jne',
            'courier_type' => 'reg',
            'status' => 'delivered',
        ];
        $headers = [
            'X-Biteship-Secret' => 'webhook-secret',
            'X-Biteship-Delivery-Id' => 'delivery-unique-01',
        ];

        $this->postJson('/biteship/webhook', $payload, $headers)->assertOk();
        $this->postJson('/biteship/webhook', $payload, $headers)->assertOk();

        $this->assertEquals(OrderStatus::DELIVERED, $order->refresh()->status);
        $this->assertDatabaseHas('shipments', [
            'order_id' => $order->id,
            'tracking_number' => 'WB-DELIVERED',
            'biteship_status' => 'delivered',
            'status' => ShipmentStatus::DELIVERED->value,
        ]);
        $this->assertDatabaseCount('shipment_tracking_events', 1);
        $this->assertDatabaseHas('order_status_histories', [
            'order_id' => $order->id,
            'status' => OrderStatus::DELIVERED->value,
        ]);
    }

    public function test_biteship_webhook_requires_the_configured_secret_and_accepts_setup_probe(): void
    {
        config([
            'services.biteship.webhook_header' => 'X-Biteship-Secret',
            'services.biteship.webhook_secret' => 'webhook-secret',
        ]);

        $this->postJson('/biteship/webhook', ['event' => 'order.status'])
            ->assertUnauthorized();

        $this->call('POST', '/biteship/webhook', [], [], [], [
            'HTTP_X_BITESHIP_SECRET' => 'webhook-secret',
            'CONTENT_TYPE' => 'application/json',
        ])->assertOk();
    }
}
