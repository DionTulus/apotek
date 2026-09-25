<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClinicalPrescriptionItem extends Model
{
    protected $fillable = [
        'clinical_prescription_id',
        'product_id',
        'nama_obat',
        'dosis',
        'jumlah',
        'aturan_pakai',
    ];

    protected $casts = [
        'jumlah' => 'integer',
    ];

    public function prescription(): BelongsTo
    {
        return $this->belongsTo(ClinicalPrescription::class, 'clinical_prescription_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
