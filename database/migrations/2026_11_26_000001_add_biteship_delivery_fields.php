<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('shipping_method_id')->nullable()->change();
            $table->string('recipient_postal_code', 10)->nullable();
            $table->string('biteship_courier_company')->nullable();
            $table->string('biteship_courier_type')->nullable();
            $table->string('biteship_courier_name')->nullable();
            $table->string('biteship_service_name')->nullable();
            $table->string('biteship_delivery_duration')->nullable();
        });

        Schema::table('shipments', function (Blueprint $table) {
            $table->string('biteship_order_id')->nullable()->unique();
            $table->string('biteship_tracking_id')->nullable();
            $table->string('biteship_status')->nullable();
            $table->text('tracking_url')->nullable();
            $table->timestamp('customer_received_at')->nullable();
        });

        Schema::create('shipment_tracking_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained()->cascadeOnDelete();
            $table->string('delivery_id')->nullable()->unique();
            $table->string('biteship_status');
            $table->text('note')->nullable();
            $table->timestamp('occurred_at')->nullable();
            $table->timestamps();

            $table->index(['shipment_id', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipment_tracking_events');

        Schema::table('shipments', function (Blueprint $table) {
            $table->dropUnique(['biteship_order_id']);
            $table->dropColumn([
                'biteship_order_id',
                'biteship_tracking_id',
                'biteship_status',
                'tracking_url',
                'customer_received_at',
            ]);
        });

        $fallbackShippingMethodId = DB::table('shipping_methods')->value('id');
        if ($fallbackShippingMethodId !== null) {
            DB::table('orders')
                ->whereNull('shipping_method_id')
                ->update(['shipping_method_id' => $fallbackShippingMethodId]);
        }

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'recipient_postal_code',
                'biteship_courier_company',
                'biteship_courier_type',
                'biteship_courier_name',
                'biteship_service_name',
                'biteship_delivery_duration',
            ]);
            $table->foreignId('shipping_method_id')->nullable(false)->change();
        });
    }
};
