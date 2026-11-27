<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $biteship_status
 * @property string|null $note
 * @property Carbon|null $occurred_at
 */
class ShipmentTrackingEvent extends Model
{
    protected $fillable = [
        'shipment_id',
        'delivery_id',
        'biteship_status',
        'note',
        'occurred_at',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
    ];

    /** @return BelongsTo<Shipment, $this> */
    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }
}
