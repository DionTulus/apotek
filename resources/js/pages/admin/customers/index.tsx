import AdminLayout from '@/layouts/admin-layout';
import { Link, router } from '@inertiajs/react';
import {
    CreditCard,
    Mail,
    Phone,
    Search,
    ShoppingBag,
    User,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone?: string;
    created_at: string;
    orders_count: number;
    orders_sum_grand_total?: number;
}

interface Props {
    customers: {
        data: Customer[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function CustomersIndex({ customers, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/pelanggan', { search }, { preserveState: true });
    };

    return (
        <AdminLayout title="Daftar Pelanggan Apotek">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Manajemen Pelanggan</h1>
                        <p className="text-xs text-slate-500">
                            Daftar pembeli terdaftar, statistik transaksi, riwayat pesanan, dan profil pelanggan.
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari berdasarkan nama, email, atau nomor telepon..."
                                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white text-xs font-bold rounded-lg transition"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* Customers Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">Pelanggan</th>
                                    <th className="px-4 py-3">Kontak</th>
                                    <th className="px-4 py-3">Total Pesanan</th>
                                    <th className="px-4 py-3">Total Belanja (LTV)</th>
                                    <th className="px-4 py-3">Bergabung Sejak</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {customers.data.length > 0 ? (
                                    customers.data.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-slate-50/80 transition">
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#8CA9FF]/20 text-[#6587e6] font-bold flex items-center justify-center text-xs">
                                                        {customer.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={`/admin/pelanggan/${customer.id}`}
                                                            className="font-bold text-slate-800 hover:text-[#6587e6] transition"
                                                        >
                                                            {customer.name}
                                                        </Link>
                                                        <p className="text-[11px] text-slate-400">ID #{customer.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="space-y-0.5 text-[11px] text-slate-600">
                                                    <p className="flex items-center gap-1.5">
                                                        <Mail className="w-3 h-3 text-slate-400" />
                                                        {customer.email}
                                                    </p>
                                                    {customer.phone && (
                                                        <p className="flex items-center gap-1.5">
                                                            <Phone className="w-3 h-3 text-slate-400" />
                                                            {customer.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 font-semibold text-slate-800">
                                                <span className="inline-flex items-center gap-1">
                                                    <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                                                    {customer.orders_count} pesanan
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 font-bold text-slate-800">
                                                Rp {Number(customer.orders_sum_grand_total || 0).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-500">
                                                {new Date(customer.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <Link
                                                    href={`/admin/pelanggan/${customer.id}`}
                                                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition"
                                                >
                                                    Lihat Profil
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                            Tidak ada pelanggan ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {customers.links && customers.links.length > 3 && (
                        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
                            <p className="text-slate-500">Total {customers.total} Pelanggan</p>
                            <div className="flex gap-1">
                                {customers.links.map((link, idx) => (
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
        </AdminLayout>
    );
}
