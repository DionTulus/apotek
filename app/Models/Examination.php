<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Examination extends Model
{
    protected $fillable = [
        'user_id',
        'appointment_id',
        'bidan_id',
        'tanggal',
        'keluhan',
        'riwayat',
        'hasil',
        'diagnosis',
        'tindakan',
        'catatan',
        'jadwal_kontrol',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jadwal_kontrol' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function bidan(): BelongsTo
    {
        return $this->belongsTo(User::class, 'bidan_id');
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(ClinicalPrescription::class);
    }
}
