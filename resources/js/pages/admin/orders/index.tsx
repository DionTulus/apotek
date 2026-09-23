import AdminLayout from '@/layouts/admin-layout';
import { Link, router } from '@inertiajs/react';
import { ClipboardList, Search } from 'lucide-react';
import { useState } from 'react';

interface Order {
    id: number;
    order_number: string;
    created_at: string;
    grand_total: number;
    status: string;
    payment_method: string;
    payment_status: string;
    user: { name: string; email: string } | null;
    payment: { payment_type: string | null } | null;
}

interface PaginatedOrders {
    data: Order[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface Props {
    orders: PaginatedOrders;
    statusList: { value: string; label: string }[];
    filters: { search?: string; status?: string; method?: string };
}

const statusColors: Record<string, string> = {
    pending_payment:        'bg-yellow-100 text-yellow-800',
    awaiting_prescription:  'bg-purple-100 text-purple-800',
    paid:                   'bg-blue-100 text-blue-800',
    processing:             'bg-indigo-100 text-indigo-800',
    shipped:                'bg-cyan-100 text-cyan-800',
    delivered:              'bg-teal-100 text-teal-800',
    completed:              'bg-green-100 text-green-800',
    cancelled:              'bg-red-100 text-red-800',
    expired:                'bg-slate-100 text-slate-600',
    refunded:               'bg-orange-100 text-orange-800',
};

const statusLabels: Record<string, string> = {
    pending_payment:       'Menunggu Bayar',
    awaiting_prescription: 'Verifikasi Resep',
    paid:                  'Sudah Dibayar',
    processing:            'Diproses',
    shipped:               'Dikirim',
    delivered:             'Diterima',
    completed:             'Selesai',
    cancelled:             'Dibatalkan',
    expired:               'Kedaluwarsa',
    refunded:              'Direfund',
};

export default function AdminOrdersIndex({ orders, statusList, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const doFilter = (extra: Record<string, string> = {}) => {
        router.get('/admin/pesanan', { search, ...filters, ...extra }, { preserveState: true });
    };

    const fmt = (n: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
    const fmtDate = (d: string) =>
        new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <AdminLayout title="Manajemen Pesanan">
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Pesanan</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{orders.total} total pesanan</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                    <form onSubmit={(e) => { e.preventDefault(); doFilter(); }} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="No. pesanan / Nama pelanggan..."
                                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 w-60"
                                id="input-order-search"
                            />
                        </div>
                        <button type="submit" className="px-3 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl">
                            Cari
                        </button>
                    </form>

                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => doFilter({ status: '' })}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${!filters.status ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            Semua
                        </button>
                        {statusList.map((s) => (
                            <button
                                key={s.value}
                                onClick={() => doFilter({ status: s.value })}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                                    filters.status === s.value
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : `${statusColors[s.value] ?? 'bg-white text-slate-600'} border-transparent`
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
                    <table className="w-full text-sm min-w-[900px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">No. Pesanan</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Pelanggan</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Tanggal</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Total</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Metode</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {orders.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-slate-400">
                                        <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        Tidak ada pesanan.
                                    </td>
                                </tr>
                            ) : orders.data.map((o) => (
                                <tr key={o.id} className="hover:bg-slate-50/60 transition">
                                    <td className="px-4 py-3 font-mono font-semibold text-xs text-slate-800">{o.order_number}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-slate-800 text-xs">{o.user?.name ?? '-'}</p>
                                        <p className="text-[11px] text-slate-400">{o.user?.email}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center text-xs text-slate-500">{fmtDate(o.created_at)}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-slate-800 text-xs">{fmt(o.grand_total)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${o.payment_method === 'cod' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'}`}>
                                            {o.payment_method === 'cod' ? 'COD' : 'Midtrans'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusColors[o.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {statusLabels[o.status] ?? o.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/admin/pesanan/${o.id}`}
                                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                        >
                                            Detail
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {orders.links.length > 3 && (
                    <div className="flex gap-1 flex-wrap">
                        {orders.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                    link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
