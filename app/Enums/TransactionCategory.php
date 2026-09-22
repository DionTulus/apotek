<?php

namespace App\Enums;

enum TransactionCategory: string
{
    case SALES = 'sales';
    case REFUND = 'refund';
    case PURCHASE = 'purchase';
    case OPERATIONAL = 'operational';
    case SALARY = 'salary';
    case OTHER = 'other';
}
