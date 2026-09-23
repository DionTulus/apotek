<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PrescriptionStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Prescription;
use App\Models\Product;
use App\Models\ProductBatch;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
        $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth();

        // 1. KPI Omset & Penjualan
        $todaySales = Order::whereDate('created_at', $today)
            ->whereIn('status', [OrderStatus::PAID, OrderStatus::PROCESSING, OrderStatus::SHIPPED, OrderStatus::DELIVERED, OrderStatus::COMPLETED])
            ->sum('grand_total');

        $thisMonthSales = Order::whereBetween('created_at', [$startOfMonth, Carbon::now()])
            ->whereIn('status', [OrderStatus::PAID, OrderStatus::PROCESSING, OrderStatus::SHIPPED, OrderStatus::DELIVERED, OrderStatus::COMPLETED])
            ->sum('grand_total');

        $lastMonthSales = Order::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->whereIn('status', [OrderStatus::PAID, OrderStatus::PROCESSING, OrderStatus::SHIPPED, OrderStatus::DELIVERED, OrderStatus::COMPLETED])
            ->sum('grand_total');

        $salesGrowth = $lastMonthSales > 0
            ? round((($thisMonthSales - $lastMonthSales) / $lastMonthSales) * 100, 1)
            : 0;

        // 2. KPI Pesanan
        $newOrdersCount = Order::whereIn('status', [OrderStatus::PENDING_PAYMENT, OrderStatus::PAID, OrderStatus::PROCESSING])->count();
        $completedThisMonth = Order::where('status', OrderStatus::COMPLETED)
            ->whereBetween('created_at', [$startOfMonth, Carbon::now()])
            ->count();

        // 3. KPI Inventori & Resep
        $lowStockCount = Product::whereColumn('stock', '<=', 'min_stock')->count();
        $expiringBatchesCount = ProductBatch::expiringSoon(90)->count();

        $pendingPrescriptionsCount = Prescription::where('status', PrescriptionStatus::PENDING)->count();

        // 4. Sales Time-series 14 Hari Terakhir
        $fourteenDaysAgo = Carbon::now()->subDays(13)->startOfDay();
        $dailySalesRaw = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(grand_total) as total_amount'),
            DB::raw('COUNT(*) as order_count')
        )
            ->where('created_at', '>=', $fourteenDaysAgo)
            ->whereIn('status', [OrderStatus::PAID, OrderStatus::PROCESSING, OrderStatus::SHIPPED, OrderStatus::DELIVERED, OrderStatus::COMPLETED])
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->keyBy('date');

        $salesChart = [];
        for ($i = 0; $i < 14; $i++) {
            $date = Carbon::now()->subDays(13 - $i)->format('Y-m-d');
            $label = Carbon::parse($date)->locale('id')->isoFormat('D MMM');
            $record = $dailySalesRaw->get($date);

            $salesChart[] = [
                'date'         => $date,
                'label'        => $label,
                'total_amount' => $record ? (int) $record->total_amount : 0,
                'order_count'  => $record ? (int) $record->order_count : 0,
            ];
        }

        // 5. Top 5 Produk Terlaris
        $topProducts = OrderItem::select(
            'product_id',
            DB::raw('SUM(qty) as total_qty'),
            DB::raw('SUM(subtotal) as total_sales')
        )
            ->with(['product' => fn ($q) => $q->select('id', 'name', 'sku', 'stock', 'unit')])
            ->whereHas('order', function ($q) {
                $q->whereIn('status', [OrderStatus::PAID, OrderStatus::PROCESSING, OrderStatus::SHIPPED, OrderStatus::DELIVERED, OrderStatus::COMPLETED]);
            })
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        // 6. 5 Pesanan Terbaru
        $recentOrders = Order::with(['user', 'payment'])
            ->latest()
            ->limit(5)
            ->get();

        // 7. Peringatan Stok Kritis (Maks 5 item)
        $criticalStockProducts = Product::whereColumn('stock', '<=', 'min_stock')
            ->orderBy('stock', 'ASC')
            ->limit(5)
            ->get(['id', 'name', 'sku', 'stock', 'min_stock', 'unit']);

        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'today_sales'            => (int) $todaySales,
                'this_month_sales'       => (int) $thisMonthSales,
                'sales_growth'           => $salesGrowth,
                'new_orders'             => $newOrdersCount,
                'completed_orders'       => $completedThisMonth,
                'low_stock_count'        => $lowStockCount,
                'expiring_batches_count' => $expiringBatchesCount,
                'pending_prescriptions'  => $pendingPrescriptionsCount,
            ],
            'salesChart'            => $salesChart,
            'topProducts'           => $topProducts,
            'recentOrders'          => $recentOrders,
            'criticalStockProducts' => $criticalStockProducts,
        ]);
    }
}
