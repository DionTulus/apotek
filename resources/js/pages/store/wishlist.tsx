import StoreLayout from '@/layouts/store-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Heart, Pill, ShoppingCart, Trash2 } from 'lucide-react';
import React from 'react';

interface WishlistItem {
    id: number;
    user_id: number;
    product_id: number;
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

interface PaginatedWishlist {
    data: WishlistItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface WishlistProps {
    wishlistItems: PaginatedWishlist;
}

export default function Wishlist({ wishlistItems }: WishlistProps) {
    const formatRp = (num: number) => `Rp ${num.toLocaleString('id-ID')}`;

    const handleRemove = (productId: number) => {
        router.post(`/wishlist/${productId}`, {}, { preserveScroll: true });
    };

    const handleAddToCart = (productId: number) => {
        router.post(`/keranjang/add/${productId}`, { qty: 1 }, { preserveScroll: true });
    };

    return (
        <StoreLayout>
            <Head title="Wishlist Saya - Apotek ERP" />

            <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                <div className="max-w-7xl mx-auto flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                        <Heart className="w-5 h-5 fill-rose-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Wishlist Saya</h1>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Daftar obat dan suplemen impian yang Anda simpan.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {wishlistItems.data.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto">
                        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                            <Heart className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Wishlist Anda Masih Kosong</h3>
                        <p className="text-xs text-slate-500">
                            Simpan produk-produk pilihan Anda untuk dibeli di kemudian hari.
                        </p>
                        <Link
                            href="/produk"
                            className="inline-block px-6 py-3 rounded-full bg-[#8CA9FF] text-white text-xs font-bold hover:bg-blue-500 transition shadow"
                        >
                            Jelajahi Katalog Obat
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wishlistItems.data.map((item) => {
                                const p = item.product;
                                if (!p) return null;

                                return (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition flex flex-col justify-between"
                                    >
                                        <div className="flex gap-4">
                                            <div className="w-24 h-24 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center shrink-0">
                                                <Pill className="w-10 h-10 text-[#8CA9FF]/40" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                    {p.category?.name || 'Obat'}
                                                </span>
                                                <Link href={`/produk/${p.slug}`}>
                                                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 hover:text-blue-600">
                                                        {p.name}
                                                    </h3>
                                                </Link>
                                                <p className="text-xs text-slate-500">Per {p.unit}</p>
                                                <p className="text-sm font-black text-slate-900 pt-1">
                                                    {formatRp(p.price)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                            <button
                                                onClick={() => handleRemove(p.id)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                                                title="Hapus dari wishlist"
                                            >
                                                <Trash2 className="w-4 h-4" /> Hapus
                                            </button>

                                            <button
                                                onClick={() => handleAddToCart(p.id)}
                                                disabled={p.stock <= 0}
                                                className={`px-4 py-2 rounded-xl text-xs font-extrabold text-white flex items-center gap-1.5 transition ${
                                                    p.stock > 0
                                                        ? 'bg-[#8CA9FF] hover:bg-blue-500'
                                                        : 'bg-slate-300 cursor-not-allowed'
                                                }`}
                                            >
                                                <ShoppingCart className="w-3.5 h-3.5" />
                                                + Keranjang
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {wishlistItems.links.length > 3 && (
                            <div className="pt-6 flex justify-center items-center gap-1">
                                {wishlistItems.links.map((link, idx) => (
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
