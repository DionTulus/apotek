import AdminLayout from '@/layouts/admin-layout';
import { Link, router } from '@inertiajs/react';
import {
    BarChart3,
    Calendar,
    DollarSign,
    Download,
    Package,
    Percent,
    ShoppingBag,
    ShoppingCart,
} from 'lucide-react';
import { useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface ChartItem {
    date: string;
    label: string;
    total_sales: number;
    total_orders: number;
}

interface ProductSalesItem {
    product_id: number;
    total_qty: number;
    total_revenue: number;
    product?: {
        name: string;
        sku: string;
        category?: {
            name: string;
        };
    };
}

interface OrderItem {
    id: number;
    order_number: string;
    grand_total: number;
    discount_total: number;
    payment_method: string;
    status: string;
    created_at: string;
    user?: {
        name: string;
    };
    items?: {
        id: number;
        qty: number;
        product?: {
            name: string;
        };
    }[];
}

interface Props {
    summary: {
        total_sales: number;
        total_orders_count: number;
        total_qty_sold: number;
        total_discounts: number;
        aov: number;
    };
    chartData: ChartItem[];
    productSales: ProductSalesItem[];
    orders: {
        data: OrderItem[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: {
        range: string;
        start_date: string;
        end_date: string;
    };
}

export default function SalesReport({
    summary,
    chartData,
    productSales,
    orders,
    filters,
}: Props) {
    const [range, setRange] = useState(filters.range);
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const formatRp = (val: number) => `Rp ${Number(val).toLocaleString('id-ID')}`;

    const handleRangeChange = (newRange: string) => {
        setRange(newRange);
        if (newRange !== 'custom') {
            router.get('/admin/laporan/penjualan', { range: newRange }, { preserveState: true });
        }
    };

    const handleCustomFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/laporan/penjualan',
            { range: 'custom', start_date: startDate, end_date: endDate },
            { preserveState: true }
        );
    };

    const getExportUrl = () => {
        const params = new URLSearchParams({
            start_date: startDate,
            end_date: endDate,
        });
        return `/admin/laporan/penjualan/export?${params.toString()}`;
    };

    return (
        <AdminLayout title="Laporan & Rekap Penjualan">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Laporan Penjualan Obat</h1>
                        <p className="text-xs text-slate-500">
                            Analisis omset penjualan, rata-rata transaksi (AOV), rincian produk terlaris, dan export CSV.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={getExportUrl()}
                            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                        >
                            <Download className="w-4 h-4 text-slate-500" /> Export Laporan (CSV)
                        </a>
                    </div>
                </div>

                {/* Range Filter Buttons */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {[
                            { id: 'today', label: 'Hari Ini' },
                            { id: '7d', label: '7 Hari Terakhir' },
                            { id: '30d', label: '30 Hari Terakhir' },
                            { id: 'this_month', label: 'Bulan Ini' },
                            { id: 'custom', label: 'Rentang Kustom' },
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => handleRangeChange(btn.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                    range === btn.id
                                        ? 'bg-[#8CA9FF] text-white shadow-xs'
                                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                                }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    {range === 'custom' && (
                        <form onSubmit={handleCustomFilter} className="flex items-center gap-2 text-xs">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                required
                            />
                            <span className="text-slate-400">s/d</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                required
                            />
                            <button
                                type="submit"
                                className="px-3 py-1.5 bg-[#8CA9FF] hover:bg-[#7292eb] text-white font-bold rounded-lg transition"
                            >
                                Terapkan
                            </button>
                        </form>
                    )}
                </div>

                {/* 5 KPI Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Total Sales */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[11px] font-semibold text-slate-500">Total Omset Penjualan</span>
                        <p className="text-lg font-extrabold text-slate-800 mt-1">
                            {formatRp(summary.total_sales)}
                        </p>
                    </div>

                    {/* Total Orders */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[11px] font-semibold text-slate-500">Jumlah Transaksi</span>
                        <p className="text-lg font-extrabold text-slate-800 mt-1">
                            {summary.total_orders_count} Pesanan
                        </p>
                    </div>

                    {/* Qty Sold */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[11px] font-semibold text-slate-500">Total Unit Terjual</span>
                        <p className="text-lg font-extrabold text-slate-800 mt-1">
                            {summary.total_qty_sold} Pcs
                        </p>
                    </div>

                    {/* AOV */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[11px] font-semibold text-slate-500">Rata-rata Keranjang (AOV)</span>
                        <p className="text-lg font-extrabold text-[#6587e6] mt-1">
                            {formatRp(summary.aov)}
                        </p>
                    </div>

                    {/* Total Discounts */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[11px] font-semibold text-slate-500">Total Diskon Diberikan</span>
                        <p className="text-lg font-extrabold text-emerald-600 mt-1">
                            {formatRp(summary.total_discounts)}
                        </p>
                    </div>
                </div>

                {/* Daily Trend Chart */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-bold text-slate-800">Grafik Penjualan Harian</h2>
                            <p className="text-xs text-slate-400">Tren nilai omset per hari pada periode yang dipilih</p>
                        </div>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                                    formatter={(value: any) => [formatRp(Number(value) || 0), 'Omset']}
                                    labelStyle={{ fontWeight: 'bold', color: '#1E293B', fontSize: 12 }}
                                    contentStyle={{
                                        borderRadius: 8,
                                        border: '1px solid #E2E8F0',
                                        fontSize: 12,
                                    }}
                                />
                                <Bar dataKey="total_sales" fill="#8CA9FF" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Two Columns: Product Sales Breakdown & Orders Table */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 1 Col: Top Products in Period */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                        <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Package className="w-4 h-4 text-[#8CA9FF]" />
                            Penjualan per Produk (Top 10)
                        </h2>
                        <div className="space-y-3">
                            {productSales.length > 0 ? (
                                productSales.map((item, idx) => (
                                    <div
                                        key={item.product_id}
                                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="font-bold text-slate-400 text-[11px]">#{idx + 1}</span>
                                            <div>
                                                <p className="font-bold text-slate-800 line-clamp-1">
                                                    {item.product?.name || `Produk #${item.product_id}`}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    {item.product?.category?.name || 'Obat'} &bull; {item.total_qty} pcs
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-extrabold text-slate-800">
                                            {formatRp(item.total_revenue)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic">Belum ada data penjualan produk.</p>
                            )}
                        </div>
                    </div>

                    {/* Right 2 Cols: Orders Table */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-[#8CA9FF]" />
                                Transaksi Pesanan dalam Periode
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">No. Order</th>
                                        <th className="px-4 py-3">Pelanggan</th>
                                        <th className="px-4 py-3">Metode</th>
                                        <th className="px-4 py-3">Total</th>
                                        <th className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orders.data.length > 0 ? (
                                        orders.data.map((order) => (
                                            <tr key={order.id} className="hover:bg-slate-50 transition">
                                                <td className="px-4 py-3 font-mono font-bold text-slate-800">
                                                    #{order.order_number}
                                                    <p className="text-[10px] text-slate-400 font-normal">
                                                        {new Date(order.created_at).toLocaleString('id-ID')}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-slate-700">
                                                    {order.user?.name || 'Guest'}
                                                </td>
                                                <td className="px-4 py-3 uppercase font-semibold text-slate-600">
                                                    {order.payment_method}
                                                </td>
                                                <td className="px-4 py-3 font-bold text-slate-800">
                                                    {formatRp(order.grand_total)}
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
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                                Tidak ada transaksi pesanan pada rentang tanggal ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {orders.links && orders.links.length > 3 && (
                            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
                                <p className="text-slate-500">Total {orders.total} Transaksi</p>
                                <div className="flex gap-1">
                                    {orders.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1.5 rounded-lg font-medium transition ${
                                                link.active
                                                    ? 'bg-[#8CA9FF] text-white font-bold'
                                                    : link.url
                                                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    : 'text-slate-300 pointer-events-none'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
