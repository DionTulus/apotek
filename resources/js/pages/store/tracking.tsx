import StoreLayout from '@/layouts/store-layout';
import { Head, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    MapPin,
    PackageCheck,
    Pill,
    Search,
    Truck,
} from 'lucide-react';
import React from 'react';

interface OrderItem {
    id: number;
    product_name: string;
    qty: number;
    price: number;
}

interface StatusHistory {
    id: number;
    status: string;
    note: string;
    created_at: string;
}

interface OrderResult {
    id: number;
    order_number: string;
    status: string;
    recipient_name: string;
    recipient_phone: string;
    shipping_address: string;
    grand_total: number;
    created_at: string;
    items: OrderItem[];
    shippingMethod?: { name: string; est_days: string };
    shipment?: { tracking_number?: string; status?: string };
    statusHistories: StatusHistory[];
}

interface TrackingProps {
    orderResult: OrderResult | null;
    error: string | null;
    searchedOrderNumber: string;
    searchedContact: string;
}

export default function Tracking({
    orderResult = null,
    error = null,
    searchedOrderNumber = '',
    searchedContact = '',
}: TrackingProps) {
    const formatRp = (num: number) => `Rp ${num.toLocaleString('id-ID')}`;

    const { data, setData, post, processing } = useForm({
        order_number: searchedOrderNumber,
        contact: searchedContact,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        post('/lacak-pesanan', { preserveScroll: true });
    };

    return (
        <StoreLayout>
            <Head title="Lacak Pesanan Kamu - Klinik Premisys Medika" />

            {/* Header Banner */}
            <div className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                <div className="max-w-3xl mx-auto text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#8CA9FF]/20 border border-[#8CA9FF]/30 text-[#8CA9FF] flex items-center justify-center mx-auto">
                        <PackageCheck className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">Lacak Status Pengiriman Pesanan</h1>
                    <p className="text-xs sm:text-sm text-slate-400">
                        Masukkan Nomor Pesanan dan Nomor Telepon / Email yang terdaftar saat membuat pesanan.
                    </p>

                    {/* Search Box */}
                    <form onSubmit={handleSearch} className="bg-white p-3 rounded-3xl shadow-xl space-y-3 sm:space-y-0 sm:flex items-center gap-2 max-w-xl mx-auto text-slate-900">
                        <input
                            type="text"
                            placeholder="No. Order (contoh: ORD-20260923-XXXXX)"
                            value={data.order_number}
                            onChange={(e) => setData('order_number', e.target.value)}
                            className="flex-1 p-3 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Email / No. Telepon Penerima"
                            value={data.contact}
                            onChange={(e) => setData('contact', e.target.value)}
                            className="flex-1 p-3 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white"
                            required
                        />
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#8CA9FF] hover:bg-blue-500 text-white font-extrabold text-xs shadow transition flex items-center justify-center gap-1.5 shrink-0"
                        >
                            <Search className="w-4 h-4" /> Lacak
                        </button>
                    </form>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {error && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 max-w-xl mx-auto">
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {orderResult && (
                    <div className="space-y-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            <div>
                                <span className="text-xs text-slate-400">Nomor Pesanan</span>
                                <h2 className="text-xl font-black text-slate-900 font-mono">#{orderResult.order_number}</h2>
                            </div>

                            <span className="px-4 py-1.5 rounded-full bg-[#8CA9FF]/10 text-[#8CA9FF] border border-[#8CA9FF]/30 text-xs font-extrabold uppercase">
                                {orderResult.status.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Shipment Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                            <div>
                                <span className="text-slate-400 text-[10px] block">Penerima & Alamat</span>
                                <p className="font-bold text-slate-900">{orderResult.recipient_name} ({orderResult.recipient_phone})</p>
                                <p className="text-slate-500">{orderResult.shipping_address}</p>
                            </div>
                            <div>
                                <span className="text-slate-400 text-[10px] block">Kurir & Resi</span>
                                <p className="font-bold text-slate-900">{orderResult.shippingMethod?.name || 'Kurir Apotek'}</p>
                                <p className="font-mono text-blue-600 font-bold">
                                    Resi: {orderResult.shipment?.tracking_number || 'Belum di-generate'}
                                </p>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-4">
                            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#8CA9FF]" /> Kronologi Status Pengiriman
                            </h3>

                            <div className="relative pl-6 border-l-2 border-[#8CA9FF]/40 space-y-6 my-2">
                                {orderResult.statusHistories.map((sh) => (
                                    <div key={sh.id} className="relative">
                                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#8CA9FF] border-2 border-white shadow" />
                                        <div>
                                            <span className="text-xs font-extrabold text-slate-900 uppercase">
                                                {sh.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-[11px] text-slate-400 block">
                                                {new Date(sh.created_at).toLocaleString('id-ID')}
                                            </span>
                                            {sh.note && <p className="text-xs text-slate-600 mt-0.5">{sh.note}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Product Items */}
                        <div className="pt-4 border-t border-slate-100">
                            <h4 className="font-bold text-xs text-slate-700 mb-3">Produk yang Dibeli</h4>
                            <div className="space-y-2">
                                {orderResult.items.map((it) => (
                                    <div key={it.id} className="flex justify-between items-center text-xs">
                                        <span className="text-slate-800">
                                            {it.product_name} <strong className="text-slate-500">x{it.qty}</strong>
                                        </span>
                                        <span className="font-bold text-slate-900">{formatRp(it.price * it.qty)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
