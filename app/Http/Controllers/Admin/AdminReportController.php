<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminReportController extends Controller
{
    public function sales(Request $request): Response
    {
        $range = $request->input('range', 'this_month');
        $now = Carbon::now();

        switch ($range) {
            case 'today':
                $startDate = Carbon::today()->toDateString();
                $endDate = Carbon::today()->toDateString();
                break;
            case '7d':
                $startDate = Carbon::now()->subDays(6)->toDateString();
                $endDate = Carbon::now()->toDateString();
                break;
            case '30d':
                $startDate = Carbon::now()->subDays(29)->toDateString();
                $endDate = Carbon::now()->toDateString();
                break;
            case 'custom':
                $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
                $endDate = $request->input('end_date', Carbon::now()->toDateString());
                break;
            case 'this_month':
            default:
                $startDate = Carbon::now()->startOfMonth()->toDateString();
                $endDate = Carbon::now()->endOfMonth()->toDateString();
                $range = 'this_month';
                break;
        }

        $validStatuses = [
            OrderStatus::PAID,
            OrderStatus::PROCESSING,
            OrderStatus::SHIPPED,
            OrderStatus::DELIVERED,
            OrderStatus::COMPLETED,
        ];

        // 1. Overall Totals
        $baseOrdersQuery = Order::whereBetween('created_at', [
            Carbon::parse($startDate)->startOfDay(),
            Carbon::parse($endDate)->endOfDay(),
        ])->whereIn('status', $validStatuses);

        $totalSales = (clone $baseOrdersQuery)->sum('grand_total');
        $totalOrdersCount = (clone $baseOrdersQuery)->count();
        $totalDiscounts = (clone $baseOrdersQuery)->sum('discount_total');
        $aov = $totalOrdersCount > 0 ? round($totalSales / $totalOrdersCount) : 0;

        $totalQtySold = OrderItem::whereHas('order', function ($q) use ($startDate, $endDate, $validStatuses) {
            $q->whereBetween('created_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ])->whereIn('status', $validStatuses);
        })->sum('qty');

        // 2. Chart: Daily Sales Aggregations
        $dailyDataRaw = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(grand_total) as total_sales'),
            DB::raw('COUNT(*) as total_orders')
        )
            ->whereBetween('created_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ])
            ->whereIn('status', $validStatuses)
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->keyBy('date');

        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $chartData = [];

        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            $dStr = $date->format('Y-m-d');
            $row = $dailyDataRaw->get($dStr);

            $chartData[] = [
                'date'         => $dStr,
                'label'        => $date->locale('id')->isoFormat('D MMM'),
                'total_sales'  => $row ? (int) $row->total_sales : 0,
                'total_orders' => $row ? (int) $row->total_orders : 0,
            ];
        }

        // 3. Top Products Breakdown
        $productSales = OrderItem::select(
            'product_id',
            DB::raw('SUM(qty) as total_qty'),
            DB::raw('SUM(subtotal) as total_revenue')
        )
            ->with(['product.category'])
            ->whereHas('order', function ($q) use ($startDate, $endDate, $validStatuses) {
                $q->whereBetween('created_at', [
                    Carbon::parse($startDate)->startOfDay(),
                    Carbon::parse($endDate)->endOfDay(),
                ])->whereIn('status', $validStatuses);
            })
            ->groupBy('product_id')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        // 4. Paginated Order Breakdown
        $orders = (clone $baseOrdersQuery)
            ->with(['user', 'items.product', 'payment'])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/reports/sales', [
            'summary' => [
                'total_sales'        => (int) $totalSales,
                'total_orders_count' => $totalOrdersCount,
                'total_qty_sold'     => (int) $totalQtySold,
                'total_discounts'    => (int) $totalDiscounts,
                'aov'                => (int) $aov,
            ],
            'chartData'    => $chartData,
            'productSales' => $productSales,
            'orders'       => $orders,
            'filters'      => [
                'range'      => $range,
                'start_date' => $startDate,
                'end_date'   => $endDate,
            ],
        ]);
    }

    public function exportSalesCsv(Request $request): StreamedResponse
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        $orders = Order::with(['user', 'payment', 'items.product'])
            ->whereBetween('created_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ])
            ->whereIn('status', [
                OrderStatus::PAID,
                OrderStatus::PROCESSING,
                OrderStatus::SHIPPED,
                OrderStatus::DELIVERED,
                OrderStatus::COMPLETED,
            ])
            ->latest()
            ->get();

        $filename = "laporan-penjualan-{$startDate}-sd-{$endDate}.csv";

        return response()->streamDownload(function () use ($orders) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'No. Order',
                'Tanggal',
                'Nama Pelanggan',
                'Status Pesanan',
                'Metode Pembayaran',
                'Subtotal (Rp)',
                'Diskon (Rp)',
                'Ongkir (Rp)',
                'Grand Total (Rp)',
                'Rincian Produk (Qty)',
            ]);

            foreach ($orders as $order) {
                $itemsStr = $order->items->map(function ($item) {
                    $prodName = $item->product ? $item->product->name : 'Item';
                    return "{$prodName} (x{$item->qty})";
                })->implode('; ');

                fputcsv($handle, [
                    $order->order_number,
                    $order->created_at->format('Y-m-d H:i'),
                    $order->user ? $order->user->name : 'Guest',
                    $order->status->value,
                    strtoupper($order->payment_method),
                    $order->subtotal,
                    $order->discount_total,
                    $order->shipping_cost,
                    $order->grand_total,
                    $itemsStr,
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
