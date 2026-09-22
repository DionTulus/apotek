import StoreLayout from '@/layouts/store-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Heart,
    Minus,
    Pill,
    Plus,
    ShieldAlert,
    ShieldCheck,
    ShoppingCart,
    Truck,
} from 'lucide-react';
import React, { useState } from 'react';

interface ProductDetailProps {
    product: {
        id: number;
        name: string;
        slug: string;
        sku: string;
        description: string;
        composition: string;
        dosage: string;
        manufacturer: string;
        drug_class: string;
        requires_prescription: boolean;
        unit: string;
        price: number;
        stock: number;
        weight_gram: number;
        category?: { id: number; name: string; slug: string };
    };
    relatedProducts: {
        id: number;
        name: string;
        slug: string;
        price: number;
        unit: string;
        requires_prescription: boolean;
        category?: { name: string };
    }[];
    isWishlisted: boolean;
}

export default function ProductDetail({
    product,
    relatedProducts = [],
    isWishlisted = false,
}: ProductDetailProps) {
    const { auth } = usePage<{ auth?: { user?: unknown } }>().props;
    const user = auth?.user;

    const [qty, setQty] = useState(1);

    const formatRp = (num: number) => `Rp ${num.toLocaleString('id-ID')}`;

    const handleWishlistToggle = () => {
        if (!user) {
            router.get('/login');
            return;
        }
        router.post(`/wishlist/${product.id}`, {}, { preserveScroll: true });
    };

    const handleAddToCart = () => {
        if (!user) {
            router.get('/login');
            return;
        }
        router.post(`/keranjang/add/${product.id}`, { qty }, { preserveScroll: true });
    };

    return (
        <StoreLayout>
            <Head title={`${product.name} - Detail Produk`} />

            {/* Breadcrumbs */}
            <div className="bg-slate-100 border-b border-slate-200 py-3">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex items-center gap-2 overflow-x-auto">
                    <Link href="/" className="hover:text-slate-900">
                        Beranda
                    </Link>
                    <span>/</span>
                    <Link href="/produk" className="hover:text-slate-900">
                        Katalog
                    </Link>
                    {product.category && (
                        <>
                            <span>/</span>
                            <Link href={`/produk?category=${product.category.slug}`} className="hover:text-slate-900">
                                {product.category.name}
                            </Link>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 lg:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Image Column */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="w-full h-80 sm:h-96 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center relative p-6">
                                {product.requires_prescription && (
                                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-extrabold border border-rose-200 flex items-center gap-1">
                                        <ShieldAlert className="w-4 h-4" /> Wajib Resep Dokter
                                    </span>
                                )}
                                <Pill className="w-32 h-32 text-[#8CA9FF]/40" />
                            </div>

                            {/* Trust badges */}
                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center gap-2 text-blue-900">
                                    <ShieldCheck className="w-5 h-5 text-[#8CA9FF] shrink-0" />
                                    <span>100% Original BPOM</span>
                                </div>
                                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-2 text-emerald-900">
                                    <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
                                    <span>Pengiriman Cepat</span>
                                </div>
                            </div>
                        </div>

                        {/* Details Column */}
                        <div className="lg:col-span-7 space-y-6">
                            <div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-2">
                                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold uppercase">
                                        {product.category?.name || 'Obat'}
                                    </span>
                                    <span>SKU: {product.sku}</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                                    {product.name}
                                </h1>
                                <p className="text-xs text-slate-500 mt-1">Produsen: <strong className="text-slate-800">{product.manufacturer || '-'}</strong></p>
                            </div>

                            {/* Prescription Warning Box */}
                            {product.requires_prescription && (
                                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                                    <div className="flex items-center gap-2 font-extrabold text-rose-700">
                                        <AlertTriangle className="w-4 h-4" /> Obat Keras (Resep Dokter Wajib)
                                    </div>
                                    <p className="text-rose-800 leading-relaxed">
                                        Produk ini termasuk kategori obat keras. Pembelian memerlukan pengunggahan resep resmi dokter saat checkout yang akan diverifikasi oleh Apoteker kami.
                                    </p>
                                </div>
                            )}

                            {/* Price & Stock */}
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <span className="text-xs text-slate-400 block">Harga Per {product.unit}</span>
                                    <span className="text-3xl font-black text-slate-900">{formatRp(product.price)}</span>
                                </div>

                                <div className="text-right">
                                    <span className="text-xs text-slate-400 block mb-1">Status Ketersediaan</span>
                                    {product.stock > 0 ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                            <CheckCircle className="w-3.5 h-3.5" /> Stok Tersedia ({product.stock})
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                                            Stok Habis
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Quantity & Actions */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-slate-700">Jumlah:</span>
                                    <div className="flex items-center rounded-xl border border-slate-300 bg-white">
                                        <button
                                            onClick={() => setQty(Math.max(1, qty - 1))}
                                            disabled={qty <= 1}
                                            className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="px-4 text-sm font-bold text-slate-900">{qty}</span>
                                        <button
                                            onClick={() => setQty(Math.min(product.stock, qty + 1))}
                                            disabled={qty >= product.stock}
                                            className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <span className="text-xs text-slate-400">Total: <strong>{formatRp(product.price * qty)}</strong></span>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.stock <= 0}
                                        className={`flex-1 py-3.5 px-6 rounded-2xl font-extrabold text-sm text-white shadow-lg transition flex items-center justify-center gap-2 ${
                                            product.stock > 0
                                                ? 'bg-[#8CA9FF] hover:bg-blue-500 shadow-[#8CA9FF]/30'
                                                : 'bg-slate-300 cursor-not-allowed shadow-none'
                                        }`}
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        Tambah ke Keranjang
                                    </button>

                                    <button
                                        onClick={handleWishlistToggle}
                                        className={`p-3.5 rounded-2xl border transition flex items-center justify-center ${
                                            isWishlisted
                                                ? 'bg-rose-50 border-rose-200 text-rose-600'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                        title={isWishlisted ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'}
                                    >
                                        <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Tabbed Specs */}
                            <div className="pt-6 border-t border-slate-200 space-y-4">
                                <div>
                                    <h3 className="text-sm font-extrabold text-slate-900 mb-1">Deskripsi Produk</h3>
                                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                                        {product.description || 'Tidak ada deskripsi tambahan.'}
                                    </p>
                                </div>

                                {product.composition && (
                                    <div>
                                        <h3 className="text-sm font-extrabold text-slate-900 mb-1">Komposisi</h3>
                                        <p className="text-xs text-slate-600 leading-relaxed">{product.composition}</p>
                                    </div>
                                )}

                                {product.dosage && (
                                    <div>
                                        <h3 className="text-sm font-extrabold text-slate-900 mb-1">Dosis & Aturan Pakai</h3>
                                        <p className="text-xs text-slate-600 leading-relaxed">{product.dosage}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12 space-y-6">
                        <h2 className="text-xl font-black text-slate-900">Produk Serupa</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                            {relatedProducts.map((p) => (
                                <Link
                                    key={p.id}
                                    href={`/produk/${p.slug}`}
                                    className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-lg transition flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="w-full h-28 bg-slate-50 rounded-xl flex items-center justify-center mb-3">
                                            <Pill className="w-10 h-10 text-[#8CA9FF]/40" />
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-xs line-clamp-2 hover:text-blue-600">
                                            {p.name}
                                        </h4>
                                        <p className="text-[11px] text-slate-500 mt-1">Per {p.unit}</p>
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-xs font-black text-slate-900">{formatRp(p.price)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
