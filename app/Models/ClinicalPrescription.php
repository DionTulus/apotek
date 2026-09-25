<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClinicalPrescription extends Model
{
    protected $fillable = [
        'examination_id',
        'user_id',
        'bidan_id',
        'tanggal',
        'status',
        'catatan',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];

    public function examination(): BelongsTo
    {
        return $this->belongsTo(Examination::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bidan(): BelongsTo
    {
        return $this->belongsTo(User::class, 'bidan_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ClinicalPrescriptionItem::class);
    }
}
