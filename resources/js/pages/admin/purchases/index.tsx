import AdminLayout from '@/layouts/admin-layout';
import { Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

interface Purchase {
    id: number;
    purchase_number: string;
    purchase_date: string;
    total: number;
    status: string;
    items_count: number;
    supplier: { name: string } | null;
    creator: { name: string } | null;
}

interface PaginatedPurchases {
    data: Purchase[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface Props {
    purchases: PaginatedPurchases;
    statusList: { value: string; label: string }[];
    filters: { status?: string; search?: string };
}

const statusColors: Record<string, string> = {
    draft: 'bg-yellow-50 text-yellow-700',
    received: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-700',
};

const statusLabels: Record<string, string> = {
    draft: 'Draft / Dipesan',
    received: 'Diterima',
    cancelled: 'Dibatalkan',
};

export default function PurchasesIndex({ purchases, statusList, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const doSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/pembelian', { search, status: filters.status ?? '' }, { preserveState: true });
    };

    const filterStatus = (status: string) => {
        router.get('/admin/pembelian', { search, status }, { preserveState: true });
    };

    const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <AdminLayout title="Pembelian / Purchase Order">
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Purchase Order</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{purchases.total} PO terdaftar</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/admin/supplier" className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200">
                            Kelola Supplier
                        </Link>
                        <Link
                            href="/admin/pembelian/create"
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
                            id="btn-create-po"
                        >
                            <Plus className="w-4 h-4" /> Buat PO Baru
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                    <form onSubmit={doSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="No. PO / Nama Supplier..."
                                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 w-56"
                                id="input-po-search"
                            />
                        </div>
                        <button type="submit" className="px-3 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl">Cari</button>
                    </form>
                    <div className="flex gap-2">
                        <button
                            onClick={() => filterStatus('')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${!filters.status ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            Semua
                        </button>
                        {statusList.map((s) => (
                            <button
                                key={s.value}
                                onClick={() => filterStatus(s.value)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                                    filters.status === s.value ? 'bg-indigo-600 text-white border-indigo-600' : `${statusColors[s.value] ?? 'bg-white text-slate-600'} border-slate-200`
                                }`}
                            >
                                {statusLabels[s.value] ?? s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
                    <table className="w-full text-sm min-w-[700px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">No. PO</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Supplier</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Tanggal</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Item</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Total</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {purchases.data.length === 0 ? (
                                <tr><td colSpan={7} className="py-16 text-center text-slate-400">Belum ada Purchase Order.</td></tr>
                            ) : purchases.data.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/60">
                                    <td className="px-4 py-3 font-mono font-semibold text-xs text-slate-800">{p.purchase_number}</td>
                                    <td className="px-4 py-3 text-xs text-slate-700 font-medium">{p.supplier?.name ?? '-'}</td>
                                    <td className="px-4 py-3 text-center text-xs text-slate-500">{fmtDate(p.purchase_date)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{p.items_count}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-slate-800 text-xs">{fmt(p.total)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusColors[p.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {statusLabels[p.status] ?? p.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/admin/pembelian/${p.id}`}
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

                {purchases.links.length > 3 && (
                    <div className="flex gap-1 flex-wrap">
                        {purchases.links.map((link, i) => (
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
