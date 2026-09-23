import AdminLayout from '@/layouts/admin-layout';
import { router } from '@inertiajs/react';
import {
    BarChart3,
    CreditCard,
    Eye,
    Globe,
    Layers,
    Repeat,
    ShoppingBag,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import {
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface TrafficChartItem {
    date: string;
    label: string;
    page_views: number;
    unique_visitors: number;
    orders_placed: number;
}

interface CategorySalesItem {
    id: number;
    name: string;
    total_revenue: number;
    total_qty: number;
}

interface PaymentMethodItem {
    payment_method: string;
    count: number;
    total_amount: number;
}

interface Props {
    metrics: {
        total_page_views: number;
        total_orders: number;
        conversion_rate: number;
        total_customers: number;
        repeat_customers: number;
        repeat_rate: number;
    };
    trafficChart: TrafficChartItem[];
    topPages: { path: string; total_views: number }[];
    categorySales: CategorySalesItem[];
    paymentMethods: PaymentMethodItem[];
    filters: {
        days: number;
    };
}

const COLORS = ['#8CA9FF', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6', '#14B8A6'];

export default function AnalyticsIndex({
    metrics,
    trafficChart,
    topPages,
    categorySales,
    paymentMethods,
    filters,
}: Props) {
    const [days, setDays] = useState(filters.days);

    const handleDaysChange = (newDays: number) => {
        setDays(newDays);
        router.get('/admin/analitik', { days: newDays }, { preserveState: true });
    };

    const formatRp = (val: number) => `Rp ${Number(val).toLocaleString('id-ID')}`;

    return (
        <AdminLayout title="Analitik & Statistik Apotek">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Analitik Web & Perilaku Pembeli</h1>
                        <p className="text-xs text-slate-500">
                            Monitoring traffic pengunjung storefront, konversi transaksi, dan perputaran kategori obat.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {[7, 14, 30, 60].map((d) => (
                            <button
                                key={d}
                                onClick={() => handleDaysChange(d)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                    days === d
                                        ? 'bg-[#8CA9FF] text-white shadow-xs'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {d} Hari
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4 Analytics Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Page Views */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#8CA9FF] flex items-center justify-center">
                            <Eye className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-slate-500">Total Kunjungan Halaman</span>
                            <p className="text-lg font-extrabold text-slate-800">{metrics.total_page_views}</p>
                        </div>
                    </div>

                    {/* Conversion Rate */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-slate-500">Rasio Konversi (CR)</span>
                            <p className="text-lg font-extrabold text-emerald-600">
                                {metrics.conversion_rate}%
                            </p>
                            <p className="text-[10px] text-slate-400">{metrics.total_orders} transaksi sukses</p>
                        </div>
                    </div>

                    {/* Total Customers */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-slate-500">Total Pelanggan Terdaftar</span>
                            <p className="text-lg font-extrabold text-slate-800">{metrics.total_customers}</p>
                        </div>
                    </div>

                    {/* Repeat Buyer Rate */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Repeat className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-slate-500">Repeat Buyer (Loyalitas)</span>
                            <p className="text-lg font-extrabold text-amber-600">{metrics.repeat_rate}%</p>
                            <p className="text-[10px] text-slate-400">{metrics.repeat_customers} pelanggan &ge; 2 pesanan</p>
                        </div>
                    </div>
                </div>

                {/* Line Chart: Visitors vs Orders */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-bold text-slate-800">Tren Pengunjung vs Pesanan Masuk</h2>
                            <p className="text-xs text-slate-400">Hubungan antara lonjakan pengunjung dan konversi order</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1.5 text-slate-600">
                                <span className="w-3 h-3 rounded-full bg-[#8CA9FF]" /> Kunjungan (Pageviews)
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-600">
                                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Pesanan
                            </span>
                        </div>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trafficChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: 8,
                                        border: '1px solid #E2E8F0',
                                        fontSize: 12,
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="page_views"
                                    name="Kunjungan"
                                    stroke="#8CA9FF"
                                    strokeWidth={2.5}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="orders_placed"
                                    name="Pesanan"
                                    stroke="#10B981"
                                    strokeWidth={2.5}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bottom 3 Columns: Category Share, Payment Methods & Top Pages */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Category Distribution */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-[#8CA9FF]" />
                                Omset per Kategori Obat
                            </h2>

                            <div className="space-y-2.5 text-xs">
                                {categorySales.slice(0, 5).map((cat, idx) => (
                                    <div key={cat.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                            />
                                            <span className="font-semibold text-slate-700">{cat.name}</span>
                                        </div>
                                        <span className="font-extrabold text-slate-800">{formatRp(cat.total_revenue)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Share */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#8CA9FF]" />
                                Metode Pembayaran Favorit
                            </h2>

                            <div className="space-y-3 text-xs">
                                {paymentMethods.map((pm) => (
                                    <div key={pm.payment_method} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                                        <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                                            <span className="uppercase">{pm.payment_method}</span>
                                            <span>{pm.count} transaksi</span>
                                        </div>
                                        <div className="flex items-center justify-between text-slate-500 text-[11px]">
                                            <span>Total Nilai</span>
                                            <span className="font-semibold text-slate-700">{formatRp(pm.total_amount)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Visited Pages */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-[#8CA9FF]" />
                                Halaman Paling Ramai
                            </h2>

                            <div className="space-y-2 text-xs">
                                {topPages.slice(0, 6).map((page) => (
                                    <div key={page.path} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                                        <span className="font-mono text-slate-700 line-clamp-1 text-[11px]">
                                            {page.path}
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-800 text-[10px]">
                                            {page.total_views} views
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
