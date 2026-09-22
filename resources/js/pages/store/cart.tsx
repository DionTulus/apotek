import StoreLayout from '@/layouts/store-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Minus,
    Pill,
    Plus,
    ShieldAlert,
    ShoppingCart,
    Trash2,
} from 'lucide-react';
import React from 'react';

interface CartItem {
    id: number;
    cart_id: number;
    product_id: number;
    qty: number;
    product: {
        id: number;
        name: string;
        slug: string;
        price: number;
        unit: string;
        stock: number;
        requires_prescription: boolean;
        category?: { name: string };
    };
}

interface CartProps {
    cartItems: CartItem[];
    subtotal: number;
}

export default function Cart({ cartItems = [], subtotal = 0 }: CartProps) {
    const formatRp = (num: number) => `Rp ${num.toLocaleString('id-ID')}`;

    const handleUpdateQty = (cartItemId: number, currentQty: number, newQty: number, maxStock: number) => {
        if (newQty < 1 || newQty > maxStock) return;
        router.put(`/keranjang/update/${cartItemId}`, { qty: newQty }, { preserveScroll: true });
    };

    const handleRemoveItem = (cartItemId: number) => {
        router.delete(`/keranjang/remove/${cartItemId}`, { preserveScroll: true });
    };

    const hasPrescriptionItems = cartItems.some((item) => item.product?.requires_prescription);

    return (
        <StoreLayout>
            <Head title="Keranjang Belanja - Apotek ERP" />

            {/* Header */}
            <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                <div className="max-w-7xl mx-auto flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#8CA9FF]/20 border border-[#8CA9FF]/30 text-[#8CA9FF] flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Keranjang Belanja</h1>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Periksa item pesanan Anda sebelum melanjutkan ke proses checkout.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto">
                        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#8CA9FF] flex items-center justify-center mx-auto">
                            <ShoppingCart className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Keranjang Belanja Anda Kosong</h3>
                        <p className="text-xs text-slate-500">
                            Anda belum menambahkan produk obat atau suplemen ke keranjang.
                        </p>
                        <Link
                            href="/produk"
                            className="inline-block px-6 py-3 rounded-full bg-[#8CA9FF] text-white text-xs font-bold hover:bg-blue-500 transition shadow"
                        >
                            Mulai Belanja Sekarang
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Cart Items List */}
                        <div className="lg:col-span-8 space-y-4">
                            {/* Prescription Notice if applicable */}
                            {hasPrescriptionItems && (
                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-extrabold text-amber-800">Perhatian: Ada Obat Beresep Dokter</h4>
                                        <p className="text-amber-700 leading-relaxed mt-0.5">
                                            Keranjang Anda berisi produk obat keras yang memerlukan resep dokter. Anda wajib mengunggah file resep saat checkout.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="font-extrabold text-sm text-slate-900">
                                        Daftar Produk ({cartItems.length} Item)
                                    </h3>
                                    <Link href="/produk" className="text-xs font-bold text-[#8CA9FF] hover:text-blue-600">
                                        + Tambah Produk Lain
                                    </Link>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {cartItems.map((item) => {
                                        const p = item.product;
                                        if (!p) return null;

                                        return (
                                            <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                <div className="flex gap-4 items-center flex-1">
                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center shrink-0">
                                                        <Pill className="w-8 h-8 text-[#8CA9FF]/40" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        {p.requires_prescription && (
                                                            <span className="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-extrabold">
                                                                Butuh Resep
                                                            </span>
                                                        )}
                                                        <Link href={`/produk/${p.slug}`}>
                                                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 hover:text-blue-600">
                                                                {p.name}
                                                            </h4>
                                                        </Link>
                                                        <p className="text-xs text-slate-400">
                                                            {formatRp(p.price)} / {p.unit}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Controls */}
                                                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                                    {/* Qty Selector */}
                                                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">
                                                        <button
                                                            onClick={() => handleUpdateQty(item.id, item.qty, item.qty - 1, p.stock)}
                                                            disabled={item.qty <= 1}
                                                            className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                                                        >
                                                            <Minus className="w-3.5 h-3.5" />
                                                        </button>
                                                        <span className="px-3 text-xs font-bold text-slate-900">{item.qty}</span>
                                                        <button
                                                            onClick={() => handleUpdateQty(item.id, item.qty, item.qty + 1, p.stock)}
                                                            disabled={item.qty >= p.stock}
                                                            className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    {/* Subtotal */}
                                                    <div className="text-right min-w-[90px]">
                                                        <span className="text-[10px] text-slate-400 block sm:hidden">Total</span>
                                                        <span className="text-xs sm:text-sm font-black text-slate-900">
                                                            {formatRp(p.price * item.qty)}
                                                        </span>
                                                    </div>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                                                        title="Hapus item"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Summary Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                                <h3 className="font-extrabold text-sm text-slate-900 pb-3 border-b border-slate-100">
                                    Ringkasan Belanja
                                </h3>

                                <div className="space-y-3 text-xs">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Total Subtotal ({cartItems.length} barang):</span>
                                        <span className="font-bold text-slate-900">{formatRp(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Biaya Pengiriman:</span>
                                        <span className="italic text-slate-400">Dihitung saat checkout</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Potongan Promo:</span>
                                        <span className="text-emerald-600 font-bold">-</span>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-900">
                                        <span>Estimasi Total:</span>
                                        <span className="text-lg text-slate-900">{formatRp(subtotal)}</span>
                                    </div>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="w-full py-4 rounded-2xl bg-[#8CA9FF] hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-[#8CA9FF]/30 transition flex items-center justify-center gap-2 group"
                                >
                                    Lanjut ke Checkout
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>

                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1">
                                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                                        <AlertCircle className="w-3.5 h-3.5 text-[#8CA9FF]" /> Garansi Apotek
                                    </div>
                                    <p>Stok produk dikunci setelah Anda membuat pesanan di checkout.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
