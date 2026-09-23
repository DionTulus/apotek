import AdminLayout from '@/layouts/admin-layout';
import { Link, router } from '@inertiajs/react';
import {
    Banknote,
    CheckCircle2,
    CreditCard,
    DollarSign,
    Filter,
    HelpCircle,
    Search,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';

interface Payment {
    id: number;
    method: string;
    amount: number;
    status: string;
    transaction_id?: string;
    payment_type?: string;
    paid_at?: string;
    created_at: string;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    payment_method: string;
    payment_status: string;
    grand_total: number;
    created_at: string;
    user?: {
        name: string;
        email: string;
        phone?: string;
    };
    payment?: Payment;
}

interface Props {
    orders: {
        data: Order[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: {
        method?: string;
        payment_status?: string;
        search?: string;
    };
}

export default function PaymentsIndex({ orders, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [method, setMethod] = useState(filters.method || '');
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/pembayaran',
            { search, method, payment_status: paymentStatus },
            { preserveState: true }
        );
    };

    const handleConfirmCod = (order: Order) => {
        if (
            confirm(
                `Konfirmasi penerimaan pembayaran COD sebesar Rp ${Number(
                    order.grand_total
                ).toLocaleString('id-ID')} untuk order #${order.order_number}? Status pesanan akan menjadi "Selesai" dan pendapatan kas akan dicatat.`
            )
        ) {
            router.post(`/admin/pembayaran/${order.id}/cod`);
        }
    };

    const handleConfirmManual = (order: Order) => {
        if (!order.payment) return;
        if (
            confirm(
                `Konfirmasi pembayaran transfer manual untuk order #${order.order_number}? Pesanan akan dipindahkan ke status "Sedang Diproses".`
            )
        ) {
            router.post(`/admin/pembayaran/${order.payment.id}/manual`);
        }
    };

    return (
        <AdminLayout title="Manajemen Pembayaran & Konfirmasi">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Manajemen Pembayaran</h1>
                        <p className="text-xs text-slate-500">
                            Monitor transaksi Midtrans, verifikasi transfer manual, dan konfirmasi pembayaran COD di tempat.
                        </p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari No. Order / Nama Pembeli..."
                                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                            />
                        </div>

                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                        >
                            <option value="">Semua Metode</option>
                            <option value="midtrans">Midtrans (Online Gateway)</option>
                            <option value="bank_transfer">Transfer Manual</option>
                            <option value="cod">Cash on Delivery (COD)</option>
                        </select>

                        <select
                            value={paymentStatus}
                            onChange={(e) => setPaymentStatus(e.target.value)}
                            className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                        >
                            <option value="">Semua Status Bayar</option>
                            <option value="unpaid">Belum Bayar (Unpaid)</option>
                            <option value="paid">Lunas (Paid)</option>
                        </select>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white text-xs font-bold rounded-lg transition"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">No. Order</th>
                                    <th className="px-4 py-3">Pelanggan</th>
                                    <th className="px-4 py-3">Metode Bayar</th>
                                    <th className="px-4 py-3">Total Tagihan</th>
                                    <th className="px-4 py-3">Status Bayar</th>
                                    <th className="px-4 py-3">Status Order</th>
                                    <th className="px-4 py-3 text-right">Aksi Konfirmasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.data.length > 0 ? (
                                    orders.data.map((order) => {
                                        const isCodDeliverable =
                                            order.payment_method === 'cod' &&
                                            ['shipped', 'delivered'].includes(order.status) &&
                                            order.payment_status !== 'paid';

                                        const isManualPending =
                                            order.payment_method === 'bank_transfer' &&
                                            order.status === 'pending_payment';

                                        return (
                                            <tr key={order.id} className="hover:bg-slate-50/80 transition">
                                                <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                                                    <Link
                                                        href={`/admin/pesanan/${order.id}`}
                                                        className="text-[#6587e6] hover:underline"
                                                    >
                                                        #{order.order_number}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <p className="font-semibold text-slate-800">
                                                        {order.user?.name || 'Guest'}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400">
                                                        {order.user?.phone || order.user?.email || '-'}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 uppercase">
                                                        {order.payment_method}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 font-bold text-slate-800">
                                                    Rp {Number(order.grand_total).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span
                                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                            order.payment_status === 'paid'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-amber-100 text-amber-800'
                                                        }`}
                                                    >
                                                        {order.payment_status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="capitalize text-slate-600 font-medium">
                                                        {order.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-right space-x-2">
                                                    {isCodDeliverable && (
                                                        <button
                                                            onClick={() => handleConfirmCod(order)}
                                                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition inline-flex items-center gap-1"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Konfirmasi COD
                                                        </button>
                                                    )}

                                                    {isManualPending && (
                                                        <button
                                                            onClick={() => handleConfirmManual(order)}
                                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold transition inline-flex items-center gap-1"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Konfirmasi Transfer
                                                        </button>
                                                    )}

                                                    <Link
                                                        href={`/admin/pesanan/${order.id}`}
                                                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition"
                                                    >
                                                        Detail
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                            Tidak ada data pembayaran sesuai filter.
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
        </AdminLayout>
    );
}
