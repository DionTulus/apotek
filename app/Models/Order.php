<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    /** @use HasFactory<Factory<static>> */
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'status',
        'payment_method',
        'payment_status',
        'subtotal',
        'discount_total',
        'shipping_cost',
        'grand_total',
        'promo_id',
        'shipping_method_id',
        'recipient_postal_code',
        'biteship_courier_company',
        'biteship_courier_type',
        'biteship_courier_name',
        'biteship_service_name',
        'biteship_delivery_duration',
        'prescription_id',
        'recipient_name',
        'recipient_phone',
        'shipping_address',
        'note',
        'expires_at',
        'paid_at',
        'completed_at',
        'cancelled_at',
    ];

    protected $casts = [
        'status' => OrderStatus::class,
        'payment_method' => PaymentMethod::class,
        'payment_status' => PaymentStatus::class,
        'subtotal' => 'integer',
        'discount_total' => 'integer',
        'shipping_cost' => 'integer',
        'grand_total' => 'integer',
        'expires_at' => 'datetime',
        'paid_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<OrderItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** @return BelongsTo<Promo, $this> */
    public function promo(): BelongsTo
    {
        return $this->belongsTo(Promo::class);
    }

    /** @return BelongsTo<ShippingMethod, $this> */
    public function shippingMethod(): BelongsTo
    {
        return $this->belongsTo(ShippingMethod::class);
    }

    /** @return BelongsTo<Prescription, $this> */
    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }

    /** @return HasOne<Payment, $this> */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    /** @return HasOne<Shipment, $this> */
    public function shipment(): HasOne
    {
        return $this->hasOne(Shipment::class);
    }

    /** @return HasMany<OrderReturn, $this> */
    public function returns(): HasMany
    {
        return $this->hasMany(OrderReturn::class);
    }

    /** @return HasMany<OrderStatusHistory, $this> */
    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class);
    }
}
