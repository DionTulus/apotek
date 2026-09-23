<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PageVisit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminAnalyticsController extends Controller
{
    public function index(Request $request): Response
    {
        $days = (int) $request->input('days', 30);
        $startDate = Carbon::now()->subDays($days - 1)->startOfDay();
        $endDate = Carbon::now()->endOfDay();

        // 1. Daily Visits vs Orders Chart
        $visitsRaw = PageVisit::select(
            DB::raw('DATE(visited_at) as date'),
            DB::raw('COUNT(*) as total_visits'),
            DB::raw('COUNT(DISTINCT ip_hash) as unique_visitors')
        )
            ->whereBetween('visited_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->keyBy('date');

        $ordersRaw = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as total_orders')
        )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('status', [OrderStatus::PAID, OrderStatus::PROCESSING, OrderStatus::SHIPPED, OrderStatus::DELIVERED, OrderStatus::COMPLETED])
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->keyBy('date');

        $trafficChart = [];
        for ($i = 0; $i < $days; $i++) {
            $d = Carbon::now()->subDays($days - 1 - $i)->format('Y-m-d');
            $v = $visitsRaw->get($d);
            $o = $ordersRaw->get($d);

            $trafficChart[] = [
                'date'            => $d,
                'label'           => Carbon::parse($d)->locale('id')->isoFormat('D MMM'),
                'page_views'      => $v ? (int) $v->total_visits : 0,
                'unique_visitors' => $v ? (int) $v->unique_visitors : 0,
                'orders_placed'   => $o ? (int) $o->total_orders : 0,
            ];
        }

        // 2. Top Visited Pages
        $topPages = PageVisit::select('path', DB::raw('COUNT(*) as total_views'))
            ->whereBetween('visited_at', [$startDate, $endDate])
            ->groupBy('path')
            ->orderByDesc('total_views')
            ->limit(10)
            ->get();

        // 3. Category Sales Distribution (Pie data)
        $categorySales = DB::table('categories')
            ->leftJoin('products', 'categories.id', '=', 'products.category_id')
            ->leftJoin('order_items', 'products.id', '=', 'order_items.product_id')
            ->leftJoin('orders', 'order_items.order_id', '=', 'orders.id')
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('orders.created_at', [$startDate, $endDate])
                  ->whereIn('orders.status', [OrderStatus::PAID->value, OrderStatus::PROCESSING->value, OrderStatus::SHIPPED->value, OrderStatus::DELIVERED->value, OrderStatus::COMPLETED->value])
                  ->orWhereNull('orders.id');
            })
            ->select(
                'categories.id',
                'categories.name',
                DB::raw('COALESCE(SUM(order_items.subtotal), 0) as total_revenue'),
                DB::raw('COALESCE(SUM(order_items.qty), 0) as total_qty')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_revenue')
            ->get();

        // 4. Payment Method Distribution
        $paymentMethods = Order::select(
            'payment_method',
            DB::raw('COUNT(*) as count'),
            DB::raw('SUM(grand_total) as total_amount')
        )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('status', [OrderStatus::PAID, OrderStatus::PROCESSING, OrderStatus::SHIPPED, OrderStatus::DELIVERED, OrderStatus::COMPLETED])
            ->groupBy('payment_method')
            ->get();

        // 5. Customer Retention & Conversion Metrics
        $totalCustomers = User::where('role', Role::CUSTOMER)->count();
        $repeatCustomers = User::where('role', Role::CUSTOMER)
            ->has('orders', '>=', 2)
            ->count();
        $repeatRate = $totalCustomers > 0 ? round(($repeatCustomers / $totalCustomers) * 100, 1) : 0;

        $totalVisitsCount = PageVisit::whereBetween('visited_at', [$startDate, $endDate])->count();
        $totalOrdersInPeriod = Order::whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('status', [OrderStatus::PAID, OrderStatus::PROCESSING, OrderStatus::SHIPPED, OrderStatus::DELIVERED, OrderStatus::COMPLETED])
            ->count();
        $conversionRate = $totalVisitsCount > 0 ? round(($totalOrdersInPeriod / $totalVisitsCount) * 100, 2) : 0;

        return Inertia::render('admin/analytics/index', [
            'metrics' => [
                'total_page_views'  => $totalVisitsCount,
                'total_orders'      => $totalOrdersInPeriod,
                'conversion_rate'   => $conversionRate,
                'total_customers'   => $totalCustomers,
                'repeat_customers'  => $repeatCustomers,
                'repeat_rate'       => $repeatRate,
            ],
            'trafficChart'   => $trafficChart,
            'topPages'       => $topPages,
            'categorySales'  => $categorySales,
            'paymentMethods' => $paymentMethods,
            'filters'        => [
                'days' => $days,
            ],
        ]);
    }
}
