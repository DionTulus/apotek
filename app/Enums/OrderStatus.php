<?php

namespace App\Enums;

enum OrderStatus: string
{
    case PENDING_PAYMENT = 'pending_payment';
    case AWAITING_PRESCRIPTION = 'awaiting_prescription';
    case PAID = 'paid';
    case PROCESSING = 'processing';
    case SHIPPED = 'shipped';
    case DELIVERED = 'delivered';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';
    case EXPIRED = 'expired';
    case REFUNDED = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::PENDING_PAYMENT => 'Menunggu Pembayaran',
            self::AWAITING_PRESCRIPTION => 'Menunggu Verifikasi Resep',
            self::PAID => 'Sudah Dibayar',
            self::PROCESSING => 'Sedang Diproses',
            self::SHIPPED => 'Dalam Pengiriman',
            self::DELIVERED => 'Pesanan Diterima',
            self::COMPLETED => 'Selesai',
            self::CANCELLED => 'Dibatalkan',
            self::EXPIRED => 'Kedaluwarsa',
            self::REFUNDED => 'Dikembalikan (Refund)',
        };
    }
}
