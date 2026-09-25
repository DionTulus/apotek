<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VaccineType extends Model
{
    protected $fillable = [
        'nama_vaksin',
        'usia_bulan',
        'deskripsi',
    ];

    protected $casts = [
        'usia_bulan' => 'integer',
    ];

    public function schedules(): HasMany
    {
        return $this->hasMany(VaccineSchedule::class);
    }
}
