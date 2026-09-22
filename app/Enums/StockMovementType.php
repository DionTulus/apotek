<?php

namespace App\Enums;

enum StockMovementType: string
{
    case PURCHASE = 'purchase';
    case SALE = 'sale';
    case RETURN = 'return';
    case ADJUSTMENT = 'adjustment';
    case CANCEL_RESTORE = 'cancel_restore';
    case EXPIRED_WRITEOFF = 'expired_writeoff';
}
