import AdminLayout from '@/layouts/admin-layout';
import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Ban,
    Calendar,
    CheckCircle2,
    DollarSign,
    Mail,
    MapPin,
    Package,
    Phone,
    ShoppingBag,
    User,
} from 'lucide-react';

interface Address {
    id: number;
    recipient_name: string;
    phone: string;
    address_line: string;
    district: string;
    city: string;
    province: string;
    postal_code: string;
    is_primary: boolean;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    payment_method: string;
    payment_status: string;
    grand_total: number;
    created_at: string;
    shipping_method?: {
        name: string;
    };
}

interface Customer {
    id: number;
    name: string;
    email: string;
    phone?: string;
    created_at: string;
    addresses?: Address[];
}

interface Props {
    customer: Customer;
    orders: {
        data: Order[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    stats: {
        total_orders: number;
        total_spent: number;
        completed: number;
        cancelled: number;
    };
}

export default function CustomerShow({ customer, orders, stats }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-100 text-emerald-800';
            case 'cancelled':
                return 'bg-rose-100 text-rose-800';
            case 'paid':
                return 'bg-blue-100 text-blue-800';
            case 'processing':
                return 'bg-cyan-100 text-cyan-800';
            case 'shipped':
                return 'bg-indigo-100 text-indigo-800';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <AdminLayout title={`Profil Pelanggan - ${customer.name}`}>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Back */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/pelanggan"
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">{customer.name}</h1>
                        <p className="text-xs text-slate-500">
                            Bergabung sejak {new Date(customer.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                </div>

                {/* KPI Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#8CA9FF] flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Total Pesanan</p>
                            <p className="text-lg font-bold text-slate-800">{stats.total_orders}</p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Total Belanja (LTV)</p>
                            <p className="text-lg font-bold text-slate-800">
                                Rp {Number(stats.total_spent).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Pesanan Selesai</p>
                            <p className="text-lg font-bold text-slate-800">{stats.completed}</p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                            <Ban className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Dibatalkan</p>
                            <p className="text-lg font-bold text-slate-800">{stats.cancelled}</p>
                        </div>
                    </div>
                </div>

                {/* Customer Details & Addresses */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Contact & Addresses */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <User className="w-4 h-4 text-[#8CA9FF]" />
                                Informasi Kontak
                            </h2>
                            <div className="space-y-3 text-xs">
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Nama Lengkap</span>
                                    <span className="font-semibold text-slate-800">{customer.name}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Email</span>
                                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        {customer.email}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Nomor Telepon / WA</span>
                                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        {customer.phone || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Addresses */}
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#8CA9FF]" />
                                Daftar Alamat Tersimpan ({customer.addresses?.length || 0})
                            </h2>
                            {customer.addresses && customer.addresses.length > 0 ? (
                                <div className="space-y-3">
                                    {customer.addresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            className={`p-3 rounded-lg border text-xs space-y-1 ${
                                                addr.is_primary
                                                    ? 'border-[#8CA9FF] bg-blue-50/40'
                                                    : 'border-slate-200 bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-slate-800">
                                                    {addr.recipient_name}
                                                </span>
                                                {addr.is_primary && (
                                                    <span className="px-1.5 py-0.5 bg-[#8CA9FF] text-white text-[9px] font-bold rounded">
                                                        UTAMA
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-500">{addr.phone}</p>
                                            <p className="text-slate-600">{addr.address_line}</p>
                                            <p className="text-slate-600">
                                                {addr.district}, {addr.city}, {addr.province} {addr.postal_code}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500 italic">Belum ada alamat tersimpan.</p>
                            )}
                        </div>
                    </div>

                    {/* Right: Order History */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-[#8CA9FF]" />
                                    Riwayat Pesanan Pelanggan
                                </h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3">No. Order</th>
                                            <th className="px-4 py-3">Tanggal</th>
                                            <th className="px-4 py-3">Total</th>
                                            <th className="px-4 py-3">Metode</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {orders.data.length > 0 ? (
                                            orders.data.map((order) => (
                                                <tr key={order.id} className="hover:bg-slate-50/80 transition">
                                                    <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                                                        #{order.order_number}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-slate-500">
                                                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                                                    </td>
                                                    <td className="px-4 py-3.5 font-bold text-slate-800">
                                                        Rp {Number(order.grand_total).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="px-4 py-3.5 uppercase font-semibold text-slate-600">
                                                        {order.payment_method}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${getStatusBadge(
                                                                order.status
                                                            )}`}
                                                        >
                                                            {order.status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        <Link
                                                            href={`/admin/pesanan/${order.id}`}
                                                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition"
                                                        >
                                                            Lihat
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                                    Pelanggan belum pernah melakukan pesanan.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {orders.links && orders.links.length > 3 && (
                                <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
                                    <p className="text-slate-500">Total {orders.total} Pesanan</p>
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
            </div>
        </AdminLayout>
    );
}
