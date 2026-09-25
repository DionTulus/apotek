<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VaccineSchedule extends Model
{
    protected $fillable = [
        'baby_id',
        'vaccine_type_id',
        'nama_vaksin',
        'tanggal_terjadwal',
        'tanggal_diberikan',
        'status',
    ];

    protected $casts = [
        'tanggal_terjadwal' => 'date',
        'tanggal_diberikan' => 'date',
    ];

    public function baby(): BelongsTo
    {
        return $this->belongsTo(Baby::class);
    }

    public function vaccineType(): BelongsTo
    {
        return $this->belongsTo(VaccineType::class);
    }
}
