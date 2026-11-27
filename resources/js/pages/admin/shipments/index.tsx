import AdminLayout from '@/layouts/admin-layout';
import { Link, router } from '@inertiajs/react';
import { Search, Send } from 'lucide-react';
import { useState } from 'react';

interface Shipment {
    id: number;
    courier: string;
    service?: string;
    tracking_number?: string;
    status: string;
    biteship_status?: string;
    biteship_order_id?: string;
    tracking_url?: string;
    shipped_at?: string;
    delivered_at?: string;
}

interface Order {
    id: number;
    order_number: string;
    status: 'processing' | 'shipped' | 'delivered';
    shipping_cost: number;
    created_at: string;
    user?: {
        name: string;
        email: string;
        phone?: string;
    };
    recipient_name?: string;
    recipient_phone?: string;
    shipping_address?: string | null;
    shipment?: Shipment;
    shipping_method?: {
        name: string;
        code: string;
    };
    biteship_courier_name?: string;
    biteship_service_name?: string;
    biteship_delivery_duration?: string;
}

interface Props {
    orders: {
        data: Order[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function ShipmentsIndex({ orders, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/pengiriman', { search, status: filters.status }, { preserveState: true });
    };

    const handleFilterStatus = (status: string) => {
        router.get('/admin/pengiriman', { search, status }, { preserveState: true });
    };

    const handleCreateShipment = (order: Order) => {
        if (confirm(`Buat pengiriman Biteship untuk pesanan #${order.order_number}?`)) {
            router.post(`/admin/pengiriman/${order.id}/kirim`);
        }
    };

    return (
        <AdminLayout title="Manajemen Pengiriman & Resi">
            <div className="space-y-6">
                {/* Header & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Manajemen Pengiriman & Resi</h1>
                        <p className="text-xs text-slate-500">
                            Buat pengiriman melalui Biteship dan pantau pembaruan status dari webhook kurir.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleFilterStatus('')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                !filters.status
                                    ? 'bg-[#065f46] text-white shadow-xs'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Semua Aktif
                        </button>
                        <button
                            onClick={() => handleFilterStatus('processing')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                filters.status === 'processing'
                                    ? 'bg-[#065f46] text-white shadow-xs'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Siap Kirim (Processing)
                        </button>
                        <button
                            onClick={() => handleFilterStatus('shipped')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                filters.status === 'shipped'
                                    ? 'bg-[#065f46] text-white shadow-xs'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Dalam Perjalanan (Shipped)
                        </button>
                    </div>
                </div>

                {/* Filter Search */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari No. Order / Nama Penerima..."
                                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#065f46]"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#065f46] hover:bg-[#047857] text-white text-xs font-bold rounded-lg transition"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* Shipments Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">No. Order</th>
                                    <th className="px-4 py-3">Penerima & Alamat</th>
                                    <th className="px-4 py-3">Kurir & Layanan</th>
                                    <th className="px-4 py-3">No. Resi</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.data.length > 0 ? (
                                    orders.data.map((order) => {
                                        return (
                                            <tr key={order.id} className="hover:bg-slate-50/80 transition">
                                                <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                                                    <Link
                                                        href={`/admin/pesanan/${order.id}`}
                                                        className="text-[#047857] hover:underline"
                                                    >
                                                        #{order.order_number}
                                                    </Link>
                                                    <p className="text-[10px] text-slate-400 font-normal">
                                                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <p className="font-semibold text-slate-800">
                                                        {order.recipient_name || order.user?.name}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 line-clamp-1">
                                                        {order.shipping_address}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="font-semibold text-slate-700">
                                                        {order.shipment?.courier || order.biteship_courier_name || 'Biteship'}
                                                    </span>
                                                    {(order.shipment?.service || order.biteship_service_name) && (
                                                        <span className="text-[10px] text-slate-400 block">
                                                            Layanan: {order.shipment?.service || order.biteship_service_name}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    {order.shipment?.tracking_number ? (
                                                        <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                                            {order.shipment.tracking_number}
                                                        </span>
                                                    ) : order.shipment?.biteship_order_id ? (
                                                        <span className="text-slate-400 italic">Menunggu nomor resi</span>
                                                    ) : (
                                                        <span className="text-slate-400 italic">Dibuat saat dikirim</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span
                                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                            order.status === 'processing'
                                                                ? 'bg-cyan-100 text-cyan-800'
                                                                : 'bg-indigo-100 text-indigo-800'
                                                        }`}
                                                    >
                                                        {order.status === 'processing'
                                                            ? 'SIAP KIRIM'
                                                            : order.shipment?.biteship_status || 'PENGIRIMAN DIBUAT'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-right space-x-2">
                                                    {(order.status === 'processing' ||
                                                        (order.status === 'shipped' && !order.shipment?.biteship_order_id)) && (
                                                        <button
                                                            onClick={() => handleCreateShipment(order)}
                                                            className="px-3 py-1 bg-[#065f46] hover:bg-[#047857] text-white rounded text-[11px] font-bold transition inline-flex items-center gap-1 shadow-xs"
                                                        >
                                                            <Send className="w-3 h-3" />
                                                            {order.status === 'processing' ? 'Buat Pengiriman' : 'Kirim ke Biteship'}
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
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                            Tidak ada data pengiriman sesuai filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {orders.links && orders.links.length > 3 && (
                        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
                            <p className="text-slate-500">Total {orders.total} Pengiriman</p>
                            <div className="flex gap-1">
                                {orders.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition ${
                                            link.active
                                                ? 'bg-[#065f46] text-white font-bold'
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
