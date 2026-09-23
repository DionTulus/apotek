<?php

namespace App\Services;

use App\Enums\TransactionCategory;
use App\Enums\TransactionType;
use App\Models\FinancialTransaction;
use App\Models\Order;

class FinanceService
{
    public function recordSale(Order $order): FinancialTransaction
    {
        return FinancialTransaction::create([
            'type' => TransactionType::INCOME,
            'category' => TransactionCategory::SALES,
            'amount' => $order->grand_total,
            'transaction_date' => now()->toDateString(),
            'description' => "Penjualan Order #{$order->order_number}",
            'reference_type' => Order::class,
            'reference_id' => $order->id,
            'created_by' => $order->user_id,
        ]);
    }
}
