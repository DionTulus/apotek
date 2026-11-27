<?php

namespace App\Models;

use App\Enums\ShipmentStatus;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property Carbon|null $customer_received_at
 */
class Shipment extends Model
{
    /** @use HasFactory<Factory<static>> */
    use HasFactory;

    protected $fillable = [
        'order_id',
        'courier',
        'service',
        'tracking_number',
        'cost',
        'status',
        'biteship_order_id',
        'biteship_tracking_id',
        'biteship_status',
        'tracking_url',
        'customer_received_at',
        'shipped_at',
        'delivered_at',
        'note',
    ];

    protected $casts = [
        'cost' => 'integer',
        'status' => ShipmentStatus::class,
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'customer_received_at' => 'datetime',
    ];

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** @return HasMany<ShipmentTrackingEvent, $this> */
    public function trackingEvents(): HasMany
    {
        return $this->hasMany(ShipmentTrackingEvent::class);
    }
}
