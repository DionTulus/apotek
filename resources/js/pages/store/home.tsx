import StoreLayout from '@/layouts/store-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    Clock,
    FileText,
    Heart,
    Percent,
    Pill,
    ShieldCheck,
    ShoppingCart,
    Star,
    Truck,
} from 'lucide-react';
import React from 'react';

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    description: string;
    image?: string;
}

interface ProductItem {
    id: number;
    name: string;
    slug: string;
    price: number;
    cost_price: number;
    unit: string;
    requires_prescription: boolean;
    drug_class: string;
    stock: number;
    image?: string;
    category?: { name: string };
}

interface PromoItem {
    id: number;
    code: string;
    name: string;
    description: string;
    type: string;
    value: number;
    min_purchase: number;
}

interface TestimonialItem {
    id: number;
    name: string;
    rating: number;
    content: string;
}

interface HomeProps {
    categories: CategoryItem[];
    featuredProducts: ProductItem[];
    latestProducts: ProductItem[];
    promos: PromoItem[];
    testimonials: TestimonialItem[];
}

export default function Home({
    categories = [],
    featuredProducts = [],
    latestProducts = [],
    promos = [],
    testimonials = [],
}: HomeProps) {
    const formatRp = (num: number) => `Rp ${num.toLocaleString('id-ID')}`;

    return (
        <StoreLayout>
            <Head title="Beranda - Klinik Premisys Medika" />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-16 lg:py-24">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#8CA9FF]/20 via-transparent to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8CA9FF]/20 border border-[#8CA9FF]/30 text-[#8CA9FF] text-xs font-bold tracking-wide">
                            <ShieldCheck className="w-4 h-4" /> Apotek Resmi Berizin BPOM & Kemenkes
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                            Solusi Kesehatan & Beli Obat Terpercaya Dari Rumah
                        </h1>
                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                            Dapatkan obat bebas, obat dengan resep dokter, vitamin daya tahan tubuh, dan alat kesehatan berkualitas dengan garansi 100% Asli. Pengiriman cepat 1-3 jam via Kurir Instant.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <Link
                                href="/produk"
                                className="px-6 py-3.5 rounded-full bg-[#8CA9FF] hover:bg-blue-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-[#8CA9FF]/30 transition-all flex items-center gap-2 group"
                            >
                                Belanja Obat Sekarang
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/promo"
                                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm transition"
                            >
                                🔥 Lihat Promo Diskon
                            </Link>
                        </div>

                        {/* Badges */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-xs">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-[#8CA9FF]" />
                                <span>100% Produk Asli</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Truck className="w-5 h-5 text-[#8CA9FF]" />
                                <span>Kirim 1-3 Jam</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#8CA9FF]" />
                                <span>Upload Resep Mudah</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero Card Visual */}
                    <div className="lg:col-span-5 hidden lg:block">
                        <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl space-y-4">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#8CA9FF] text-white flex items-center justify-center font-bold text-xl">
                                    <Pill className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Klinik Premisys Medika</h3>
                                    <p className="text-xs text-slate-300">Siap Melayani 24/7</p>
                                </div>
                            </div>

                            <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
                                <div className="flex justify-between text-slate-300">
                                    <span>Status Apoteker:</span>
                                    <span className="text-emerald-400 font-bold">● Standby Verifikasi</span>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                    <span>Metode Bayar:</span>
                                    <span className="font-semibold text-white">Midtrans & COD</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Banner */}
            <section className="bg-white border-b border-slate-200 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-900">Jaminan Original</h4>
                            <p className="text-[11px] text-slate-500">Obat resmi dari PBF terdaftar</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-900">Pengiriman Cepat</h4>
                            <p className="text-[11px] text-slate-500">Instant area Kota Bandung</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-900">Verifikasi Resep</h4>
                            <p className="text-[11px] text-slate-500">Oleh apoteker berpengalaman</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                            <Percent className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-900">Harga Hemat</h4>
                            <p className="text-[11px] text-slate-500">Promo & voucher diskon harian</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">Kategori Pilihan</h2>
                        <p className="text-xs sm:text-sm text-slate-500">Cari produk kesehatan berdasarkan kategori kebutuhan Anda</p>
                    </div>
                    <Link href="/produk" className="text-xs font-bold text-[#8CA9FF] hover:text-blue-700 flex items-center gap-1">
                        Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/produk?kategori=${cat.slug}`}
                            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#8CA9FF] hover:shadow-md transition text-center group flex flex-col items-center justify-center"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#8CA9FF] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Pill className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-600">
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-12 bg-slate-100 border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Produk Terlaris & Rekomendasi</h2>
                            <p className="text-xs sm:text-sm text-slate-500">Obat dan suplemen paling favorit pilihan pelanggan</p>
                        </div>
                        <Link href="/produk" className="text-xs font-bold text-[#8CA9FF] hover:text-blue-700 flex items-center gap-1">
                            Lihat Katalog Lengkap <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {featuredProducts.map((p) => (
                            <div
                                key={p.id}
                                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
                            >
                                <div className="p-4 relative">
                                    {p.requires_prescription && (
                                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-extrabold border border-rose-200">
                                            Wajib Resep
                                        </span>
                                    )}
                                    <div className="w-full h-36 bg-slate-50 rounded-xl flex items-center justify-center my-2 text-slate-400">
                                        <Pill className="w-16 h-16 text-[#8CA9FF]/40" />
                                    </div>
                                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        {p.category?.name || 'Obat'}
                                    </p>
                                    <Link href={`/produk/${p.slug}`} className="block">
                                        <h3 className="font-bold text-slate-900 text-sm line-clamp-2 hover:text-blue-600 transition my-1">
                                            {p.name}
                                        </h3>
                                    </Link>
                                    <p className="text-xs text-slate-500">Per {p.unit}</p>
                                </div>

                                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-slate-400 block">Harga</span>
                                        <span className="text-base font-black text-slate-900">{formatRp(p.price)}</span>
                                    </div>
                                    <Link
                                        href={`/produk/${p.slug}`}
                                        className="p-2.5 rounded-full bg-[#8CA9FF] hover:bg-blue-500 text-white shadow-sm transition"
                                        title="Lihat Detail"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Active Promo Banner */}
            {promos.length > 0 && (
                <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-[#8CA9FF] text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-xl z-10">
                            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold tracking-wider">
                                VOUCHER PROMO AKTIF
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-black">{promos[0].name}</h2>
                            <p className="text-xs sm:text-sm text-blue-100">{promos[0].description}</p>
                            <div className="flex items-center gap-3 pt-2">
                                <span className="px-4 py-2 rounded-xl bg-white text-blue-900 font-mono font-bold text-sm tracking-wider shadow">
                                    KODE: {promos[0].code}
                                </span>
                            </div>
                        </div>

                        <Link
                            href="/promo"
                            className="px-8 py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-xl transition shrink-0"
                        >
                            Gunakan Voucher Sekarang
                        </Link>
                    </div>
                </section>
            )}

            {/* Testimonials */}
            {testimonials.length > 0 && (
                <section className="py-12 bg-white border-t border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-xl mx-auto mb-10">
                            <h2 className="text-2xl font-black text-slate-900">Apa Kata Pelanggan Kami?</h2>
                            <p className="text-xs text-slate-500 mt-1">Ulasan jujur dari pembeli yang mempercayakan kebutuhan obatnya di Klinik Premisys Medika</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {testimonials.map((t) => (
                                <div key={t.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                                    <div className="space-y-3">
                                        <div className="flex text-amber-400 gap-1">
                                            {[...Array(t.rating)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-amber-400" />
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-700 italic leading-relaxed">"{t.content}"</p>
                                    </div>
                                    <p className="text-xs font-bold text-slate-900 mt-4 pt-3 border-t border-slate-200">
                                        — {t.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </StoreLayout>
    );
}
