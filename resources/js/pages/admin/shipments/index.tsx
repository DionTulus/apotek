import AdminLayout from '@/layouts/admin-layout';
import { Link, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    MapPin,
    Package,
    Search,
    Send,
    Truck,
} from 'lucide-react';
import { useState } from 'react';

interface Shipment {
    id: number;
    courier: string;
    service: string;
    tracking_number: string;
    status: string;
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
    shipping_address?: {
        recipient_name?: string;
        phone?: string;
        address_line?: string;
        district?: string;
        city?: string;
        province?: string;
        postal_code?: string;
    };
    shipment?: Shipment;
    shipping_method?: {
        name: string;
        code: string;
    };
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
    const [shippingOrder, setShippingOrder] = useState<Order | null>(null);

    const shipForm = useForm({
        courier: 'JNE',
        service: 'REG',
        tracking_number: '',
        note: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/pengiriman', { search, status: filters.status }, { preserveState: true });
    };

    const handleFilterStatus = (status: string) => {
        router.get('/admin/pengiriman', { search, status }, { preserveState: true });
    };

    const handleOpenShipModal = (order: Order) => {
        setShippingOrder(order);
        shipForm.setData({
            courier: order.shipping_method?.name || 'JNE',
            service: 'REG',
            tracking_number: '',
            note: '',
        });
    };

    const submitShip = (e: React.FormEvent) => {
        e.preventDefault();
        if (!shippingOrder) return;

        shipForm.post(`/admin/pengiriman/${shippingOrder.id}/kirim`, {
            onSuccess: () => {
                setShippingOrder(null);
                shipForm.reset();
            },
        });
    };

    const handleMarkDelivered = (order: Order) => {
        if (
            confirm(
                `Tandai pesanan #${order.order_number} telah sampai dan diterima oleh pelanggan?`
            )
        ) {
            router.post(`/admin/pengiriman/${order.id}/terima`);
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
                            Kelola pesanan siap kirim, input nomor resi kurir, dan konfirmasi barang telah sampai.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleFilterStatus('')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                !filters.status
                                    ? 'bg-[#8CA9FF] text-white shadow-xs'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Semua Aktif
                        </button>
                        <button
                            onClick={() => handleFilterStatus('processing')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                filters.status === 'processing'
                                    ? 'bg-[#8CA9FF] text-white shadow-xs'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Siap Kirim (Processing)
                        </button>
                        <button
                            onClick={() => handleFilterStatus('shipped')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                filters.status === 'shipped'
                                    ? 'bg-[#8CA9FF] text-white shadow-xs'
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
                                                        className="text-[#6587e6] hover:underline"
                                                    >
                                                        #{order.order_number}
                                                    </Link>
                                                    <p className="text-[10px] text-slate-400 font-normal">
                                                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <p className="font-semibold text-slate-800">
                                                        {order.shipping_address?.recipient_name || order.user?.name}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 line-clamp-1">
                                                        {order.shipping_address?.city}, {order.shipping_address?.province}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="font-semibold text-slate-700">
                                                        {order.shipment?.courier || order.shipping_method?.name || 'Reguler'}
                                                    </span>
                                                    {order.shipment?.service && (
                                                        <span className="text-[10px] text-slate-400 block">
                                                            Layanan: {order.shipment.service}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    {order.shipment?.tracking_number ? (
                                                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                                            {order.shipment.tracking_number}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 italic">Belum diinput</span>
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
                                                        {order.status === 'processing' ? 'SIAP KIRIM' : 'DIKIRIM'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-right space-x-2">
                                                    {order.status === 'processing' && (
                                                        <button
                                                            onClick={() => handleOpenShipModal(order)}
                                                            className="px-3 py-1 bg-[#8CA9FF] hover:bg-[#7292eb] text-white rounded text-[11px] font-bold transition inline-flex items-center gap-1 shadow-xs"
                                                        >
                                                            <Send className="w-3 h-3" /> Input Resi & Kirim
                                                        </button>
                                                    )}

                                                    {order.status === 'shipped' && (
                                                        <button
                                                            onClick={() => handleMarkDelivered(order)}
                                                            className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[11px] font-bold transition inline-flex items-center gap-1"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Tandai Sampai
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

                {/* Modal Input Resi */}
                {shippingOrder && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <Truck className="w-5 h-5" />
                                <h3 className="text-base font-bold text-slate-800">
                                    Input Resi Pengiriman #{shippingOrder.order_number}
                                </h3>
                            </div>
                            <p className="text-xs text-slate-600">
                                Masukkan nomor resi ekspedisi untuk menandai pesanan sebagai dikirim ke pelanggan.
                            </p>
                            <form onSubmit={submitShip} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Nama Kurir / Ekspedisi</label>
                                    <input
                                        type="text"
                                        value={shipForm.data.courier}
                                        onChange={(e) => shipForm.setData('courier', e.target.value)}
                                        placeholder="Contoh: JNE / J&T / SiCepat / Kurir Apotek"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Layanan Ekspedisi</label>
                                    <input
                                        type="text"
                                        value={shipForm.data.service}
                                        onChange={(e) => shipForm.setData('service', e.target.value)}
                                        placeholder="Contoh: REG / YES / BEST / Instant"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Nomor Resi / AWB</label>
                                    <input
                                        type="text"
                                        value={shipForm.data.tracking_number}
                                        onChange={(e) => shipForm.setData('tracking_number', e.target.value)}
                                        placeholder="Contoh: JNE01928374619"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF] font-mono"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Catatan Pengiriman (Opsional)</label>
                                    <textarea
                                        value={shipForm.data.note}
                                        onChange={(e) => shipForm.setData('note', e.target.value)}
                                        placeholder="Contoh: Paket diserahkan ke drop point..."
                                        rows={2}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShippingOrder(null)}
                                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition font-semibold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={shipForm.processing}
                                        className="px-4 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white rounded-lg transition font-bold"
                                    >
                                        {shipForm.processing ? 'Menyimpan...' : 'Kirim Paket'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
