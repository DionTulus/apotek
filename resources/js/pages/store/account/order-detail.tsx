import StoreLayout from '@/layouts/store-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    CreditCard,
    FileText,
    MapPin,
    PackageCheck,
    Pill,
    RefreshCw,
    RotateCcw,
    ShieldAlert,
    Truck,
    Upload,
    X,
} from 'lucide-react';
import React, { useState } from 'react';

interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    sku: string;
    price: number;
    qty: number;
    subtotal: number;
}

interface StatusHistory {
    id: number;
    status: string;
    note: string;
    created_at: string;
}

interface OrderReturn {
    id: number;
    order_item_id: number;
    type: string;
    qty: number;
    reason: string;
    status: string;
    created_at: string;
}

interface OrderDetailProps {
    order: {
        id: number;
        order_number: string;
        status: string;
        payment_method: string;
        payment_status: string;
        subtotal: number;
        discount_total: number;
        shipping_cost: number;
        grand_total: number;
        recipient_name: string;
        recipient_phone: string;
        shipping_address: string;
        note?: string;
        created_at: string;
        items: OrderItem[];
        shippingMethod?: { name: string; est_days: string };
        shipment?: { tracking_number?: string; status?: string };
        prescription?: { file_path: string; status: string };
        statusHistories: StatusHistory[];
        returns: OrderReturn[];
    };
}

export default function OrderDetail({ order }: OrderDetailProps) {
    const safeOrder = {
        ...order,
        items: Array.isArray(order.items) ? order.items : [],
        statusHistories: Array.isArray(order.statusHistories) ? order.statusHistories : [],
        returns: Array.isArray(order.returns) ? order.returns : [],
        shippingMethod: order.shippingMethod ?? undefined,
        shipment: order.shipment ?? undefined,
        prescription: order.prescription ?? undefined,
    };

    const formatRp = (num: number) => `Rp ${num.toLocaleString('id-ID')}`;

    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<number>(safeOrder.items[0]?.id ?? 0);

    const { data, setData, post, processing, errors, reset } = useForm({
        order_item_id: selectedItemId,
        type: 'refund',
        qty: 1,
        reason: '',
        evidence_image: null as File | null,
    });

    const handleCancelOrder = () => {
        if (confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
            router.post(`/akun/pesanan/${safeOrder.order_number}/batal`);
        }
    };

    const handleReturnSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/akun/pesanan/${safeOrder.order_number}/retur`, {
            onSuccess: () => {
                setIsReturnModalOpen(false);
                reset();
            },
        });
    };

    const canCancel = safeOrder.status === 'pending_payment';
    const canReturn = ['shipped', 'delivered', 'completed'].includes(safeOrder.status);

    return (
        <StoreLayout>
            <Head title={`Detail Order #${safeOrder.order_number}`} />

            {/* Header */}
            <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Link
                            href="/akun/pesanan"
                            className="text-xs font-bold text-[#8CA9FF] hover:text-white flex items-center gap-1 mb-2"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Riwayat Pesanan
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                            Detail Order <span className="font-mono text-[#8CA9FF]">#{safeOrder.order_number}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {canCancel && (
                            <button
                                onClick={handleCancelOrder}
                                className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition"
                            >
                                Batalkan Pesanan
                            </button>
                        )}
                        {canCancel && (
                            <Link
                                href={`/pembayaran/${safeOrder.order_number}`}
                                className="px-4 py-2 rounded-xl bg-[#8CA9FF] hover:bg-blue-500 text-white text-xs font-extrabold shadow transition"
                            >
                                Bayar Sekarang
                            </Link>
                        )}
                        {canReturn && (
                            <button
                                onClick={() => setIsReturnModalOpen(true)}
                                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5"
                            >
                                <RotateCcw className="w-4 h-4" /> Ajukan Retur Produk
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Timeline & Items */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Status Timeline */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                            <h3 className="font-extrabold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#8CA9FF]" /> Timeline Status Pesanan
                            </h3>

                            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 my-4">
                                {safeOrder.statusHistories.map((sh) => (
                                    <div key={sh.id} className="relative">
                                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#8CA9FF] border-2 border-white shadow" />
                                        <div>
                                            <span className="text-xs font-extrabold text-slate-900 capitalize">
                                                {sh.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-[11px] text-slate-400 block">
                                                {new Date(sh.created_at).toLocaleString('id-ID')}
                                            </span>
                                            {sh.note && (
                                                <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                    {sh.note}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Returns List if exists */}
                        {safeOrder.returns.length > 0 && (
                            <div className="bg-amber-50 rounded-3xl border border-amber-200 p-6 space-y-4">
                                <h3 className="font-extrabold text-sm text-amber-900 flex items-center gap-2">
                                    <RotateCcw className="w-4 h-4 text-amber-600" /> Riwayat Pengajuan Retur
                                </h3>
                                <div className="space-y-3">
                                    {safeOrder.returns.map((ret) => (
                                        <div
                                            key={ret.id}
                                            className="p-3.5 bg-white rounded-2xl border border-amber-100 text-xs flex items-center justify-between"
                                        >
                                            <div>
                                                <span className="font-bold text-slate-900 uppercase">
                                                    Tipe: {ret.type} ({ret.qty} item)
                                                </span>
                                                <p className="text-slate-500 mt-0.5">{ret.reason}</p>
                                            </div>
                                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px] uppercase">
                                                {ret.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Items List */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                            <h3 className="font-extrabold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                                <PackageCheck className="w-4 h-4 text-[#8CA9FF]" /> Rincian Produk
                            </h3>

                            <div className="divide-y divide-slate-100">
                                {safeOrder.items.map((item) => (
                                    <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                                <Pill className="w-5 h-5 text-[#8CA9FF]" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{item.product_name}</p>
                                                <p className="text-[11px] text-slate-400">
                                                    {item.qty} x {formatRp(item.price)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-extrabold text-slate-900">{formatRp(item.subtotal)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Address & Payment Summary */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                            <h3 className="font-extrabold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#8CA9FF]" /> Informasi Pengiriman
                            </h3>

                            <div className="text-xs space-y-2 text-slate-600">
                                <p className="font-bold text-slate-900">{safeOrder.recipient_name}</p>
                                <p className="font-semibold">{safeOrder.recipient_phone}</p>
                                <p className="leading-relaxed text-slate-500">{safeOrder.shipping_address}</p>
                                {safeOrder.shippingMethod && (
                                    <p className="pt-2 text-[11px] text-[#8CA9FF] font-bold">
                                        Kurir: {safeOrder.shippingMethod.name} ({safeOrder.shippingMethod.est_days})
                                    </p>
                                )}
                                {safeOrder.shipment?.tracking_number && (
                                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 mt-2">
                                        <span className="text-[10px] text-slate-400 block">No. Resi Pengiriman</span>
                                        <span className="font-mono font-bold text-sm">{safeOrder.shipment.tracking_number}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal Produk:</span>
                                    <span className="font-bold text-slate-900">{formatRp(safeOrder.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Ongkos Kirim:</span>
                                    <span className="font-bold text-slate-900">{formatRp(safeOrder.shipping_cost)}</span>
                                </div>
                                {safeOrder.discount_total > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                        <span>Diskon Promo:</span>
                                        <span>-{formatRp(safeOrder.discount_total)}</span>
                                    </div>
                                )}
                                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-900">
                                    <span>Total Bayar:</span>
                                    <span className="text-xl text-[#8CA9FF]">{formatRp(safeOrder.grand_total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Return Modal */}
            {isReturnModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                                <RotateCcw className="w-5 h-5 text-amber-500" /> Form Pengajuan Retur Produk
                            </h3>
                            <button onClick={() => setIsReturnModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Pilih Produk yang Di-retur</label>
                                <select
                                    value={data.order_item_id}
                                    onChange={(e) => {
                                        const id = Number(e.target.value);
                                        setSelectedItemId(id);
                                        setData('order_item_id', id);
                                    }}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                                >
                                    {safeOrder.items.map((it) => (
                                        <option key={it.id} value={it.id}>
                                            {it.product_name} ({it.qty} item)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Jenis Pengajuan</label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                                    >
                                        <option value="refund">Pengembalian Dana (Refund)</option>
                                        <option value="exchange">Penukaran Produk</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Jumlah Item Retur</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={data.qty}
                                        onChange={(e) => setData('qty', Number(e.target.value))}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Alasan Retur / Masalah Produk</label>
                                <textarea
                                    rows={3}
                                    placeholder="Jelaskan alasan kemasan rusak, obat kadaluwarsa, atau barang tidak sesuai..."
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                                />
                                {errors.reason && <p className="text-rose-500 text-[11px] mt-1">{errors.reason}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Unggah Foto Bukti (Wajib)</label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={(e) => setData('evidence_image', e.target.files ? e.target.files[0] : null)}
                                    className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                                />
                                {errors.evidence_image && (
                                    <p className="text-rose-500 text-[11px] mt-1">{errors.evidence_image}</p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsReturnModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold shadow"
                                >
                                    {processing ? 'Kirim Retur...' : 'Kirim Pengajuan Retur'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </StoreLayout>
    );
}
