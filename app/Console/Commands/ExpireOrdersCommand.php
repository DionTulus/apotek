<?php

namespace App\Console\Commands;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\PaymentService;
use Illuminate\Console\Command;

class ExpireOrdersCommand extends Command
{
    protected $signature = 'orders:expire';

    protected $description = 'Batalkan pesanan pending yang sudah melewati batas waktu 24 jam dan kembalikan stok';

    public function handle(PaymentService $paymentService): int
    {
        $expiredOrders = Order::where('status', OrderStatus::PENDING_PAYMENT)
            ->where('expires_at', '<=', now())
            ->get();

        $count = 0;
        foreach ($expiredOrders as $order) {
            $order->update([
                'status' => OrderStatus::EXPIRED,
                'cancelled_at' => now(),
            ]);

            $paymentService->restoreOrderStock($order, 'Restorasi stok pesanan kedaluwarsa (24 jam)');
            $count++;
        }

        $this->info("Berhasil meng-kedaluwarsa-kan {$count} pesanan.");

        return Command::SUCCESS;
    }
}
