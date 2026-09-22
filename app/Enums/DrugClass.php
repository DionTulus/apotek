<?php

namespace App\Enums;

enum DrugClass: string
{
    case BEBAS = 'bebas';
    case BEBAS_TERBATAS = 'bebas_terbatas';
    case KERAS = 'keras';
    case HERBAL = 'herbal';
    case SUPLEMEN = 'suplemen';
    case ALKES = 'alkes';

    public function label(): string
    {
        return match ($this) {
            self::BEBAS => 'Obat Bebas',
            self::BEBAS_TERBATAS => 'Obat Bebas Terbatas',
            self::KERAS => 'Obat Keras (Wajib Resep)',
            self::HERBAL => 'Obat Herbal / Jamu',
            self::SUPLEMEN => 'Vitamin & Suplemen',
            self::ALKES => 'Alat Kesehatan',
        };
    }
}
