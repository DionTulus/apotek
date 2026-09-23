import AdminLayout from '@/layouts/admin-layout';
import { Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Ban,
    CheckCircle2,
    Clock,
    CreditCard,
    FileCheck,
    FileText,
    MapPin,
    Package,
    RefreshCw,
    Send,
    Truck,
    User,
} from 'lucide-react';
import { useState } from 'react';

interface OrderItem {
    id: number;
    product_id: number;
    qty: number;
    price: number;
    subtotal: number;
    product?: {
        name: string;
        sku: string;
        unit: string;
        image?: string;
    };
}

interface Payment {
    id: number;
    method: string;
    amount: number;
    status: string;
    transaction_id?: string;
    created_at: string;
    paid_at?: string;
}

interface Shipment {
    id: number;
    courier: string;
    service: string;
    tracking_number: string;
    status: string;
    shipped_at?: string;
    delivered_at?: string;
}

interface Prescription {
    id: number;
    prescription_number: string;
    doctor_name?: string;
    patient_name?: string;
    image_url: string;
    status: string;
    note?: string;
}

interface StatusHistory {
    id: number;
    status: string;
    note?: string;
    created_at: string;
    creator?: {
        name: string;
    };
}

interface OrderReturn {
    id: number;
    reason: string;
    type: string;
    qty: number;
    status: string;
    admin_note?: string;
    order_item?: {
        product?: {
            name: string;
        };
    };
}

interface Order {
    id: number;
    order_number: string;
    user_id: number;
    status: string;
    payment_method: string;
    payment_status: string;
    subtotal: number;
    discount_amount: number;
    shipping_cost: number;
    grand_total: number;
    customer_notes?: string;
    created_at: string;
    paid_at?: string;
    completed_at?: string;
    cancelled_at?: string;
    user?: {
        id: number;
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
    items?: OrderItem[];
    payment?: Payment;
    shipment?: Shipment;
    prescription?: Prescription;
    status_histories?: StatusHistory[];
    returns?: OrderReturn[];
    promo?: {
        code: string;
        name: string;
    };
}

interface Props {
    order: Order;
    statusList: { value: string; label: string }[];
}

export default function OrderShow({ order, statusList }: Props) {
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const statusForm = useForm({
        status: '',
        note: '',
    });

    const cancelForm = useForm({
        note: '',
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_payment':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'awaiting_prescription':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'paid':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'processing':
                return 'bg-cyan-100 text-cyan-800 border-cyan-200';
            case 'shipped':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'delivered':
                return 'bg-teal-100 text-teal-800 border-teal-200';
            case 'completed':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'cancelled':
                return 'bg-rose-100 text-rose-800 border-rose-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getNextAllowedStatus = (currentStatus: string) => {
        switch (currentStatus) {
            case 'paid':
                return { value: 'processing', label: 'Proses Pesanan' };
            case 'processing':
                return { value: 'shipped', label: 'Kirim Pesanan' };
            case 'shipped':
                return { value: 'delivered', label: 'Tandai Sampai' };
            case 'delivered':
                return { value: 'completed', label: 'Selesaikan Pesanan' };
            default:
                return null;
        }
    };

    const nextAction = getNextAllowedStatus(order.status);
    const canCancel = ['pending_payment', 'paid', 'processing'].includes(order.status);

    const handleQuickAdvance = (targetStatus: string) => {
        if (confirm(`Ubah status pesanan ke "${targetStatus}"?`)) {
            router.post(`/admin/pesanan/${order.id}/status`, {
                status: targetStatus,
                note: `Diubah ke ${targetStatus} oleh admin`,
            });
        }
    };

    const submitStatusChange = (e: React.FormEvent) => {
        e.preventDefault();
        statusForm.post(`/admin/pesanan/${order.id}/status`, {
            onSuccess: () => {
                setIsStatusModalOpen(false);
                statusForm.reset();
            },
        });
    };

    const submitCancelOrder = (e: React.FormEvent) => {
        e.preventDefault();
        cancelForm.post(`/admin/pesanan/${order.id}/batal`, {
            onSuccess: () => {
                setIsCancelModalOpen(false);
                cancelForm.reset();
            },
        });
    };

    return (
        <AdminLayout title={`Detail Pesanan #${order.order_number}`}>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Back & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/pesanan"
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-slate-800">Order #{order.order_number}</h1>
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                                        order.status
                                    )}`}
                                >
                                    {order.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                Dibuat pada {new Date(order.created_at).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {nextAction && (
                            <button
                                onClick={() => handleQuickAdvance(nextAction.value)}
                                className="px-4 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" /> {nextAction.label}
                            </button>
                        )}

                        <button
                            onClick={() => {
                                statusForm.setData('status', nextAction?.value || '');
                                setIsStatusModalOpen(true);
                            }}
                            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition"
                        >
                            Ubah Status Khusus
                        </button>

                        {canCancel && (
                            <button
                                onClick={() => setIsCancelModalOpen(true)}
                                className="px-3 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                            >
                                <Ban className="w-4 h-4" /> Batalkan Pesanan
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Columns: Items, Status Timeline, Prescription, Returns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Package className="w-4 h-4 text-[#8CA9FF]" />
                                Produk yang Dipesan ({order.items?.length || 0})
                            </h2>
                            <div className="divide-y divide-slate-100">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">
                                                {item.product?.name ? item.product.name.slice(0, 2).toUpperCase() : 'RX'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {item.product?.name || 'Produk'}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    SKU: {item.product?.sku || '-'} &bull; {item.qty} {item.product?.unit || 'pcs'} &times; Rp {Number(item.price).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800">
                                            Rp {Number(item.subtotal).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Summary Totals */}
                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal Produk</span>
                                    <span>Rp {Number(order.subtotal).toLocaleString('id-ID')}</span>
                                </div>
                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Diskon Promo {order.promo?.code ? `(${order.promo.code})` : ''}</span>
                                        <span>-Rp {Number(order.discount_amount).toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-slate-600">
                                    <span>Ongkos Kirim</span>
                                    <span>Rp {Number(order.shipping_cost).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-slate-800 pt-2 border-t border-slate-200">
                                    <span>Total Pembayaran</span>
                                    <span className="text-[#6587e6]">Rp {Number(order.grand_total).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Prescription Information if applicable */}
                        {order.prescription && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                                <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <FileCheck className="w-4 h-4 text-purple-600" />
                                    Verifikasi Resep Dokter Terlampir
                                </h2>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="w-32 h-32 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                                        <img
                                            src={order.prescription.image_url}
                                            alt="Resep Dokter"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="space-y-1.5 text-xs text-slate-600">
                                        <p><span className="font-semibold text-slate-800">No. Resep:</span> {order.prescription.prescription_number}</p>
                                        <p><span className="font-semibold text-slate-800">Dokter:</span> {order.prescription.doctor_name || '-'}</p>
                                        <p><span className="font-semibold text-slate-800">Pasien:</span> {order.prescription.patient_name || '-'}</p>
                                        <p><span className="font-semibold text-slate-800">Status Resep:</span> <span className="capitalize font-bold text-purple-700">{order.prescription.status}</span></p>
                                        {order.prescription.note && (
                                            <p className="p-2 bg-slate-50 rounded border border-slate-200 mt-2 text-slate-700 italic">
                                                Catatan: "{order.prescription.note}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Status Timeline History */}
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-600" />
                                Riwayat Transisi Status
                            </h2>
                            {order.status_histories && order.status_histories.length > 0 ? (
                                <div className="relative border-l-2 border-slate-200 ml-3 space-y-4 py-2">
                                    {order.status_histories.map((hist) => (
                                        <div key={hist.id} className="relative pl-6">
                                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#8CA9FF]" />
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-800 uppercase">
                                                    {hist.status.replace('_', ' ')}
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    {new Date(hist.created_at).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            {hist.note && (
                                                <p className="text-xs text-slate-600 mt-0.5">{hist.note}</p>
                                            )}
                                            {hist.creator && (
                                                <p className="text-[10px] text-slate-400">Oleh: {hist.creator.name}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500 italic">Belum ada catatan riwayat status.</p>
                            )}
                        </div>

                        {/* Return Request if any */}
                        {order.returns && order.returns.length > 0 && (
                            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 shadow-xs">
                                <h2 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 text-amber-700" />
                                    Pengajuan Retur / Refund
                                </h2>
                                <div className="space-y-3">
                                    {order.returns.map((ret) => (
                                        <div key={ret.id} className="bg-white p-3 rounded-lg border border-amber-200 text-xs space-y-1">
                                            <div className="flex items-center justify-between font-bold text-slate-800">
                                                <span>Produk: {ret.order_item?.product?.name || 'Item'} (x{ret.qty})</span>
                                                <span className="capitalize px-2 py-0.5 rounded bg-amber-100 text-amber-800">{ret.status}</span>
                                            </div>
                                            <p className="text-slate-600"><span className="font-semibold">Alasan:</span> {ret.reason}</p>
                                            <p className="text-slate-600"><span className="font-semibold">Tipe:</span> <span className="uppercase">{ret.type}</span></p>
                                            {ret.admin_note && (
                                                <p className="text-slate-700 italic bg-slate-50 p-2 rounded border">Catatan Admin: {ret.admin_note}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right 1 Column: Customer Info, Shipping Address, Payment Details */}
                    <div className="space-y-6">
                        {/* Customer Info Card */}
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <User className="w-4 h-4 text-[#8CA9FF]" />
                                Informasi Pelanggan
                            </h2>
                            {order.user ? (
                                <div className="space-y-2 text-xs">
                                    <div>
                                        <p className="font-semibold text-slate-800">{order.user.name}</p>
                                        <p className="text-slate-500">{order.user.email}</p>
                                        {order.user.phone && <p className="text-slate-500">{order.user.phone}</p>}
                                    </div>
                                    <Link
                                        href={`/admin/pelanggan/${order.user.id}`}
                                        className="inline-block text-xs font-semibold text-[#6587e6] hover:underline pt-1"
                                    >
                                        Lihat Profil Pelanggan &rarr;
                                    </Link>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500">Tamu (Tanpa Akun)</p>
                            )}
                        </div>

                        {/* Shipping Address & Courier Card */}
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-[#8CA9FF]" />
                                Pengiriman & Alamat
                            </h2>
                            <div className="space-y-3 text-xs">
                                {order.shipping_address ? (
                                    <div className="space-y-1 text-slate-600">
                                        <p className="font-semibold text-slate-800">
                                            {order.shipping_address.recipient_name} ({order.shipping_address.phone})
                                        </p>
                                        <p>{order.shipping_address.address_line}</p>
                                        <p>
                                            {order.shipping_address.district}, {order.shipping_address.city}
                                        </p>
                                        <p>
                                            {order.shipping_address.province}, {order.shipping_address.postal_code}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-slate-500 italic">Alamat belum ditentukan.</p>
                                )}

                                {order.shipment ? (
                                    <div className="pt-3 border-t border-slate-100 space-y-1">
                                        <p className="font-bold text-slate-800 flex items-center justify-between">
                                            <span>Kurir: {order.shipment.courier} ({order.shipment.service})</span>
                                            <span className="capitalize px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700">
                                                {order.shipment.status}
                                            </span>
                                        </p>
                                        <p className="text-slate-600 font-mono text-xs bg-slate-50 p-2 rounded border">
                                            Resi: {order.shipment.tracking_number}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="pt-3 border-t border-slate-100">
                                        <p className="text-slate-400 italic">Resi pengiriman belum diinput.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Details Card */}
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#8CA9FF]" />
                                Status Pembayaran
                            </h2>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Metode</span>
                                    <span className="font-bold text-slate-800 uppercase">{order.payment_method}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Status Bayar</span>
                                    <span
                                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                            order.payment_status === 'paid'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}
                                    >
                                        {order.payment_status.toUpperCase()}
                                    </span>
                                </div>
                                {order.paid_at && (
                                    <div className="flex justify-between items-center text-slate-500">
                                        <span>Waktu Bayar</span>
                                        <span>{new Date(order.paid_at).toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Customer Notes */}
                        {order.customer_notes && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                                <h2 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-500" />
                                    Catatan Pembeli
                                </h2>
                                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                                    "{order.customer_notes}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Update Status */}
                {isStatusModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                            <h3 className="text-base font-bold text-slate-800">Perbarui Status Pesanan</h3>
                            <form onSubmit={submitStatusChange} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Status Baru</label>
                                    <select
                                        value={statusForm.data.status}
                                        onChange={(e) => statusForm.setData('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    >
                                        <option value="">-- Pilih Status --</option>
                                        {statusList.map((st) => (
                                            <option key={st.value} value={st.value}>
                                                {st.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                                    <textarea
                                        value={statusForm.data.note}
                                        onChange={(e) => statusForm.setData('note', e.target.value)}
                                        placeholder="Contoh: Paket telah diambil kurir SiCepat..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsStatusModalOpen(false)}
                                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition font-semibold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={statusForm.processing}
                                        className="px-4 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white rounded-lg transition font-bold"
                                    >
                                        {statusForm.processing ? 'Menyimpan...' : 'Simpan Status'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Cancel Order */}
                {isCancelModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-2 text-rose-600">
                                <AlertCircle className="w-5 h-5" />
                                <h3 className="text-base font-bold text-slate-800">Batalkan Pesanan #{order.order_number}</h3>
                            </div>
                            <p className="text-xs text-slate-600">
                                Membatalkan pesanan ini akan otomatis mengembalikan kuantitas stok produk yang dipesan kembali ke inventori.
                            </p>
                            <form onSubmit={submitCancelOrder} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Alasan Pembatalan</label>
                                    <textarea
                                        value={cancelForm.data.note}
                                        onChange={(e) => cancelForm.setData('note', e.target.value)}
                                        placeholder="Contoh: Stok obat rusak saat pengemasan / Permintaan pembeli..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCancelModalOpen(false)}
                                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition font-semibold"
                                    >
                                        Tutup
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={cancelForm.processing}
                                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition font-bold"
                                    >
                                        {cancelForm.processing ? 'Memproses...' : 'Ya, Batalkan Pesanan'}
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
