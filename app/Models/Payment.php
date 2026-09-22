<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'provider',
        'midtrans_order_id',
        'snap_token',
        'transaction_id',
        'payment_type',
        'bank_or_va_number',
        'gross_amount',
        'transaction_status',
        'fraud_status',
        'status',
        'raw_response',
        'paid_at',
    ];

    protected $casts = [
        'gross_amount' => 'integer',
        'status' => PaymentStatus::class,
        'raw_response' => 'array',
        'paid_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
