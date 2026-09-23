import StoreLayout from '@/layouts/store-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    CreditCard,
    FileText,
    MapPin,
    Package,
    Pill,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
    Truck,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { toast } from 'sonner';

interface OrderItem {
    id: number;
    product_name: string;
    price: number;
    qty: number;
    subtotal: number;
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
        expires_at?: string;
        paid_at?: string;
        items: OrderItem[];
        payment?: {
            snap_token?: string;
            status?: string;
            midtrans_order_id?: string;
        };
        shippingMethod?: { name: string; est_days: string };
        prescription?: { status: string };
    };
    snapToken: string | null;
    midtransClientKey: string;
}

export default function Payment({ order, snapToken, midtransClientKey }: OrderDetailProps) {
    const formatRp = (num: number) => `Rp ${num.toLocaleString('id-ID')}`;

    useEffect(() => {
        if (snapToken && order.payment_status === 'unpaid') {
            const script = document.createElement('script');
            script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
            script.setAttribute('data-client-key', midtransClientKey || 'SB-Mid-client-placeholder');
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        }
    }, [snapToken, midtransClientKey, order.payment_status]);

    const handlePaySnap = () => {
        if (window.snap && snapToken) {
            window.snap.pay(snapToken, {
                onSuccess: () => {
                    toast.success('Pembayaran berhasil!');
                    router.reload();
                },
                onPending: () => {
                    toast.info('Menunggu penyelesaian pembayaran.');
                    router.reload();
                },
                onError: () => {
                    toast.error('Pembayaran gagal atau dibatalkan.');
                    router.reload();
                },
                onClose: () => {
                    toast.info('Anda menutup jendela pembayaran.');
                },
            });
        } else {
            toast.error('Gagal memuat popup Midtrans Snap. Silakan coba tombol Cek Status.');
        }
    };

    const handleCheckStatus = () => {
        router.post(`/pembayaran/${order.order_number}/cek-status`, {}, { preserveScroll: true });
    };

    const isPaid = order.payment_status === 'paid';
    const isCod = order.payment_method === 'cod';

    return (
        <StoreLayout>
            <Head title={`Pembayaran Order #${order.order_number}`} />

            {/* Header */}
            <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <span className="text-xs text-[#8CA9FF] font-mono font-bold"># {order.order_number}</span>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Status Pembayaran & Order</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {isPaid ? (
                            <span className="px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sudah Dibayar
                            </span>
                        ) : isCod ? (
                            <span className="px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1.5">
                                <Truck className="w-4 h-4 text-[#8CA9FF]" /> Pembayaran COD
                            </span>
                        ) : (
                            <span className="px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-amber-400" /> Menunggu Pembayaran
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Payment Card */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Prescription Status if exists */}
                        {order.prescription && (
                            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-3">
                                <FileText className="w-5 h-5 text-[#8CA9FF] shrink-0" />
                                <div>
                                    <h4 className="font-extrabold text-blue-900">Resep Dokter Terlampir</h4>
                                    <p className="text-blue-700 leading-relaxed mt-0.5">
                                        Status Verifikasi Apoteker:{' '}
                                        <strong className="uppercase">{order.prescription.status}</strong>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Midtrans Snap Action Box */}
                        {!isPaid && !isCod && (
                            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-[#8CA9FF]/10 text-[#8CA9FF] flex items-center justify-center mx-auto">
                                    <CreditCard className="w-8 h-8" />
                                </div>

                                <div>
                                    <h3 className="text-lg font-black text-slate-900">Selesaikan Pembayaran Anda</h3>
                                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                                        Bayar secara aman via Midtrans Snap (Transfer Bank, QRIS, GoPay, atau Kartu Kredit).
                                    </p>
                                    <p className="text-2xl font-black text-slate-900 mt-3">{formatRp(order.grand_total)}</p>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
                                    <button
                                        onClick={handlePaySnap}
                                        className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#8CA9FF] hover:bg-blue-500 text-white font-extrabold text-sm shadow-lg shadow-[#8CA9FF]/30 transition"
                                    >
                                        💳 Bayar Sekarang via Midtrans
                                    </button>

                                    <button
                                        onClick={handleCheckStatus}
                                        className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Cek Status Pembayaran
                                    </button>
                                </div>

                                <p className="text-[11px] text-slate-400">
                                    Setelah pembayaran berhasil, status order akan otomatis berubah menjadi "Sudah Dibayar".
                                </p>
                            </div>
                        )}

                        {/* COD Notice Box */}
                        {isCod && (
                            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                                    <Truck className="w-5 h-5 text-[#8CA9FF]" /> Pembayaran Cash on Delivery (COD)
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Pesanan Anda telah diterima dan akan segera disiapkan oleh Apoteker. Siapkan uang pas sebesar{' '}
                                    <strong className="text-slate-900">{formatRp(order.grand_total)}</strong> saat kurir menyerahkan pesanan di alamat Anda.
                                </p>
                            </div>
                        )}

                        {/* Paid Success Box */}
                        {isPaid && (
                            <div className="bg-emerald-50 rounded-3xl border border-emerald-200 p-6 sm:p-8 text-center space-y-3">
                                <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-black text-emerald-900">Pembayaran Diterima!</h3>
                                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                                    Terima kasih atas pembayaran Anda. Tim Apotek kami sedang menyiapkan paket produk obat Anda untuk dikirimkan.
                                </p>
                            </div>
                        )}

                        {/* Items Breakdown */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                            <h3 className="font-extrabold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                                <Package className="w-4 h-4 text-[#8CA9FF]" /> Rincian Barang
                            </h3>

                            <div className="divide-y divide-slate-100">
                                {order.items.map((item) => (
                                    <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                                        <div>
                                            <p className="font-bold text-slate-800">{item.product_name}</p>
                                            <p className="text-[11px] text-slate-400">
                                                {item.qty} x {formatRp(item.price)}
                                            </p>
                                        </div>
                                        <span className="font-extrabold text-slate-900">{formatRp(item.subtotal)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Shipping & Payment Summary) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                            <h3 className="font-extrabold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#8CA9FF]" /> Tujuan Pengiriman
                            </h3>

                            <div className="text-xs space-y-2 text-slate-600">
                                <p className="font-bold text-slate-900">{order.recipient_name}</p>
                                <p className="font-semibold">{order.recipient_phone}</p>
                                <p className="leading-relaxed text-slate-500">{order.shipping_address}</p>
                                {order.shippingMethod && (
                                    <p className="pt-2 text-[11px] text-[#8CA9FF] font-bold">
                                        Kurir: {order.shippingMethod.name} ({order.shippingMethod.est_days})
                                    </p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal:</span>
                                    <span className="font-bold text-slate-900">{formatRp(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Ongkos Kirim:</span>
                                    <span className="font-bold text-slate-900">{formatRp(order.shipping_cost)}</span>
                                </div>
                                {order.discount_total > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                        <span>Diskon Promo:</span>
                                        <span>-{formatRp(order.discount_total)}</span>
                                    </div>
                                )}
                                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-900">
                                    <span>Total Tagihan:</span>
                                    <span className="text-xl text-slate-900">{formatRp(order.grand_total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
