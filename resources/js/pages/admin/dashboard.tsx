import AdminLayout from '@/layouts/admin-layout';
import { Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Box,
    CheckCircle2,
    Clock,
    DollarSign,
    FileCheck,
    Package,
    ShoppingBag,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface MetricData {
    today_sales: number;
    this_month_sales: number;
    sales_growth: number;
    new_orders: number;
    completed_orders: number;
    low_stock_count: number;
    expiring_batches_count: number;
    pending_prescriptions: number;
}

interface SalesChartItem {
    date: string;
    label: string;
    total_amount: number;
    order_count: number;
}

interface TopProductItem {
    product_id: number;
    total_qty: number;
    total_sales: number;
    product?: {
        id: number;
        name: string;
        sku: string;
        stock: number;
        unit: string;
    };
}

interface RecentOrder {
    id: number;
    order_number: string;
    grand_total: number;
    status: string;
    payment_method: string;
    created_at: string;
    user?: {
        name: string;
    };
}

interface CriticalStockProduct {
    id: number;
    name: string;
    sku: string;
    stock: number;
    min_stock: number;
    unit: string;
}

interface Props {
    metrics: MetricData;
    salesChart: SalesChartItem[];
    topProducts: TopProductItem[];
    recentOrders: RecentOrder[];
    criticalStockProducts: CriticalStockProduct[];
}

export default function AdminDashboard({
    metrics,
    salesChart,
    topProducts,
    recentOrders,
    criticalStockProducts,
}: Props) {
    const formatRp = (val: number) => `Rp ${Number(val).toLocaleString('id-ID')}`;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_payment':
                return 'bg-amber-100 text-amber-800';
            case 'awaiting_prescription':
                return 'bg-purple-100 text-purple-800';
            case 'paid':
                return 'bg-blue-100 text-blue-800';
            case 'processing':
                return 'bg-cyan-100 text-cyan-800';
            case 'shipped':
                return 'bg-indigo-100 text-indigo-800';
            case 'delivered':
                return 'bg-teal-100 text-teal-800';
            case 'completed':
                return 'bg-emerald-100 text-emerald-800';
            case 'cancelled':
                return 'bg-rose-100 text-rose-800';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <AdminLayout title="Dashboard KPI & Analisis Apotek">
            <div className="space-y-6">
                {/* Top Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Panel Kontrol Utama (KPI)</h1>
                        <p className="text-xs text-slate-500">
                            Ringkasan performa penjualan, perputaran obat, antrian resep, dan status operasional hari ini.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/admin/laporan/penjualan"
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                        >
                            <BarChart3 className="w-3.5 h-3.5 text-[#8CA9FF]" /> Laporan Detail
                        </Link>
                        <Link
                            href="/admin/keuangan"
                            className="px-3 py-1.5 bg-[#8CA9FF] hover:bg-[#7292eb] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                            <DollarSign className="w-3.5 h-3.5" /> Jurnal Keuangan
                        </Link>
                    </div>
                </div>

                {/* 4 Primary KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Omset Bulan Ini */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Omset Bulan Ini</span>
                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#8CA9FF] flex items-center justify-center">
                                <DollarSign className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-xl font-extrabold text-slate-800">
                                {formatRp(metrics.this_month_sales)}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 text-xs">
                                {metrics.sales_growth >= 0 ? (
                                    <span className="text-emerald-600 font-bold flex items-center">
                                        <ArrowUpRight className="w-4 h-4" /> +{metrics.sales_growth}%
                                    </span>
                                ) : (
                                    <span className="text-rose-600 font-bold flex items-center">
                                        <ArrowDownRight className="w-4 h-4" /> {metrics.sales_growth}%
                                    </span>
                                )}
                                <span className="text-slate-400 text-[11px]">vs bulan lalu</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Penjualan Hari Ini */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Penjualan Hari Ini</span>
                            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-xl font-extrabold text-slate-800">
                                {formatRp(metrics.today_sales)}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">
                                {metrics.completed_orders} pesanan selesai bulan ini
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Pesanan Perlu Tindakan */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Antrian Pesanan Baru</span>
                            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-xl font-extrabold text-slate-800">
                                {metrics.new_orders} Pesanan
                            </p>
                            <Link
                                href="/admin/pesanan"
                                className="text-[11px] font-semibold text-[#6587e6] hover:underline mt-1 inline-block"
                            >
                                Proses pesanan sekarang &rarr;
                            </Link>
                        </div>
                    </div>

                    {/* Card 4: Verifikasi Resep Dokter */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Resep Butuh Validasi</span>
                            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                <FileCheck className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-xl font-extrabold text-slate-800">
                                {metrics.pending_prescriptions} Resep
                            </p>
                            <Link
                                href="/admin/resep"
                                className="text-[11px] font-semibold text-purple-600 hover:underline mt-1 inline-block"
                            >
                                Periksa antrian resep &rarr;
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Charts & Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: 14-Day Sales Trend Chart */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">Tren Pendapatan 14 Hari Terakhir</h2>
                                <p className="text-xs text-slate-400">Total nominal transaksi sukses per hari</p>
                            </div>
                            <span className="px-2.5 py-1 bg-blue-50 text-[#6587e6] rounded-lg text-xs font-bold">
                                14 Hari
                            </span>
                        </div>

                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8CA9FF" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#8CA9FF" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fontSize: 10, fill: '#64748B' }}
                                        tickLine={false}
                                        axisLine={{ stroke: '#E2E8F0' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: '#64748B' }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => `Rp ${(val / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [formatRp(Number(value) || 0), 'Pendapatan']}
                                        labelStyle={{ fontWeight: 'bold', color: '#1E293B', fontSize: 12 }}
                                        contentStyle={{
                                            borderRadius: 8,
                                            border: '1px solid #E2E8F0',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            fontSize: 12,
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total_amount"
                                        stroke="#6587e6"
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill="url(#salesGrad)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right 1 Col: Top 5 Best Selling Products */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-slate-800">5 Obat Terlaris</h2>
                                <Link
                                    href="/admin/laporan/penjualan"
                                    className="text-[11px] font-semibold text-[#6587e6] hover:underline"
                                >
                                    Selengkapnya
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {topProducts.map((item, idx) => (
                                    <div
                                        key={item.product_id}
                                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/70 border border-slate-100"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-6 h-6 rounded-full bg-[#8CA9FF]/20 text-[#6587e6] font-bold text-xs flex items-center justify-center">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 line-clamp-1">
                                                    {item.product?.name || `Produk #${item.product_id}`}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    Terjual: {item.total_qty} {item.product?.unit || 'pcs'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-extrabold text-slate-700">
                                            {formatRp(item.total_sales)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stock Warnings Shortcut */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                            <span className="flex items-center gap-1">
                                <Box className="w-3.5 h-3.5 text-amber-500" />
                                Stok Menipis: <strong className="text-amber-700">{metrics.low_stock_count}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-rose-500" />
                                Hampir Exp: <strong className="text-rose-700">{metrics.expiring_batches_count}</strong>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Recent Orders & Stock Alert */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Recent Orders Table */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-[#8CA9FF]" />
                                Pesanan Terbaru
                            </h2>
                            <Link
                                href="/admin/pesanan"
                                className="text-xs font-semibold text-[#6587e6] hover:underline"
                            >
                                Lihat Semua Pesanan &rarr;
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">No. Order</th>
                                        <th className="px-4 py-3">Pelanggan</th>
                                        <th className="px-4 py-3">Total</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50 transition">
                                            <td className="px-4 py-3 font-mono font-bold text-slate-800">
                                                #{order.order_number}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700 font-medium">
                                                {order.user?.name || 'Guest'}
                                            </td>
                                            <td className="px-4 py-3 font-bold text-slate-800">
                                                {formatRp(order.grand_total)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${getStatusBadge(
                                                        order.status
                                                    )}`}
                                                >
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={`/admin/pesanan/${order.id}`}
                                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition"
                                                >
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right 1 Col: Critical Stock Alerts */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-amber-600">
                                <AlertTriangle className="w-5 h-5" />
                                <h2 className="text-sm font-bold text-slate-800">Peringatan Stok Kritis</h2>
                            </div>
                            <p className="text-xs text-slate-500 mb-3">
                                Produk dengan sisa stok di bawah batas minimal (min_stock) apotek:
                            </p>

                            <div className="space-y-2.5">
                                {criticalStockProducts.map((prod) => (
                                    <div
                                        key={prod.id}
                                        className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 flex items-center justify-between text-xs"
                                    >
                                        <div>
                                            <p className="font-bold text-slate-800 line-clamp-1">{prod.name}</p>
                                            <p className="text-[10px] text-slate-500">SKU: {prod.sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-extrabold text-rose-600">
                                                {prod.stock} {prod.unit}
                                            </span>
                                            <p className="text-[10px] text-slate-400">Min: {prod.min_stock}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Link
                            href="/admin/pembelian/create"
                            className="w-full mt-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition text-center block shadow-xs"
                        >
                            + Buat Purchase Order (PO) Baru
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
