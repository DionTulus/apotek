<?php

namespace App\Enums;

enum Role: string
{
    case ADMIN = 'admin';
    case PHARMACIST = 'pharmacist';
    case CUSTOMER = 'customer';

    public function label(): string
    {
        return match ($this) {
            self::ADMIN => 'Administrator',
            self::PHARMACIST => 'Apoteker',
            self::CUSTOMER => 'Pelanggan',
        };
    }
}
