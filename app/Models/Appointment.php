<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    protected $fillable = [
        'user_id',
        'bidan_id',
        'jenis_layanan',
        'tanggal',
        'waktu',
        'keluhan',
        'catatan',
        'status',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bidan(): BelongsTo
    {
        return $this->belongsTo(User::class, 'bidan_id');
    }
}
