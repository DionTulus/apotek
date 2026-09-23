import StoreLayout from '@/layouts/store-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronRight, Clock, Filter, Package, ShoppingBag } from 'lucide-react';
import React from 'react';

interface OrderItem {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    grand_total: number;
    created_at: string;
    items: {
        id: number;
        product_name: string;
        qty: number;
        price: number;
    }[];
}

interface StatusOption {
    value: string;
    label: string;
}

interface PaginatedOrders {
    data: OrderItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface OrdersProps {
    orders: PaginatedOrders;
    statusList: StatusOption[];
    currentStatus: string;
}

export default function Orders({ orders, statusList = [], currentStatus = '' }: OrdersProps) {
    const formatRp = (num: number) => `Rp ${num.toLocaleString('id-ID')}`;

    const handleFilterStatus = (statusVal: string) => {
        router.get('/akun/pesanan', { status: statusVal || undefined }, { preserveState: true });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
            case 'delivered':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'shipped':
            case 'processing':
            case 'paid':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'awaiting_prescription':
            case 'pending_payment':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'cancelled':
            case 'expired':
            case 'refunded':
                return 'bg-rose-100 text-rose-800 border-rose-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <StoreLayout>
            <Head title="Riwayat Pesanan Saya" />

            <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                <div className="max-w-7xl mx-auto flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#8CA9FF]/20 border border-[#8CA9FF]/30 text-[#8CA9FF] flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Riwayat Pesanan</h1>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Daftar seluruh transaksi obat dan produk kesehatan yang pernah Anda beli.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
                {/* Filter Tabs */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
                    <span className="text-xs font-bold text-slate-500 mr-2 shrink-0 flex items-center gap-1">
                        <Filter className="w-3.5 h-3.5 text-[#8CA9FF]" /> Filter Status:
                    </span>

                    <button
                        onClick={() => handleFilterStatus('')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                            currentStatus === ''
                                ? 'bg-[#8CA9FF] text-white shadow'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Semua
                    </button>

                    {statusList.map((st) => (
                        <button
                            key={st.value}
                            onClick={() => handleFilterStatus(st.value)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                                currentStatus === st.value
                                    ? 'bg-[#8CA9FF] text-white shadow'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {st.label}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {orders.data.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto">
                        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#8CA9FF] flex items-center justify-center mx-auto">
                            <Package className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Belum Ada Pesanan</h3>
                        <p className="text-xs text-slate-500">
                            Anda belum pernah melakukan pemesanan obat dengan filter status ini.
                        </p>
                        <Link
                            href="/produk"
                            className="inline-block px-6 py-3 rounded-full bg-[#8CA9FF] text-white text-xs font-bold hover:bg-blue-500 transition shadow"
                        >
                            Mulai Belanja Obat
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.data.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 hover:shadow-md transition space-y-4"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs font-extrabold text-[#8CA9FF]">
                                            #{order.order_number}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>

                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-extrabold border uppercase ${getStatusBadge(
                                            order.status
                                        )}`}
                                    >
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </div>

                                {/* Items Brief */}
                                <div className="space-y-2">
                                    {order.items.slice(0, 2).map((item) => (
                                        <div key={item.id} className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-slate-800">
                                                {item.product_name} <span className="text-slate-400 font-normal">x{item.qty}</span>
                                            </span>
                                            <span className="text-slate-600 font-semibold">{formatRp(item.price * item.qty)}</span>
                                        </div>
                                    ))}
                                    {order.items.length > 2 && (
                                        <p className="text-[11px] text-slate-400 italic">
                                            +{order.items.length - 2} produk lainnya...
                                        </p>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Total Belanja</span>
                                        <span className="text-base font-black text-slate-900">{formatRp(order.grand_total)}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {order.status === 'pending_payment' && (
                                            <Link
                                                href={`/pembayaran/${order.order_number}`}
                                                className="px-4 py-2 rounded-xl bg-[#8CA9FF] hover:bg-blue-500 text-white text-xs font-extrabold shadow-sm transition"
                                            >
                                                Bayar Sekarang
                                            </Link>
                                        )}
                                        <Link
                                            href={`/akun/pesanan/${order.order_number}`}
                                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                                        >
                                            Detail Pesanan <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {orders.links.length > 3 && (
                            <div className="pt-6 flex justify-center items-center gap-1">
                                {orders.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveScroll
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
                                            link.active
                                                ? 'bg-[#8CA9FF] text-white border-[#8CA9FF]'
                                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
