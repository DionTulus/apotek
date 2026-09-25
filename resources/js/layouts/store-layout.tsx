import { Link, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    Heart,
    LogOut,
    Mail,
    Menu,
    PackageCheck,
    Phone,
    Pill,
    Search,
    ShieldCheck,
    ShoppingCart,
    User as UserIcon,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import { Toaster, toast } from 'sonner';

interface SharedProps {
    appName?: string;
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
            phone?: string;
            role: string;
            avatar?: string;
        } | null;
    };
    cartCount?: number;
    wishlistCount?: number;
    settings?: Record<string, string>;
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
    const { auth, cartCount = 0, wishlistCount = 0, settings = {}, flash = {} } = usePage<SharedProps>().props;
    const user = auth?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    React.useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/produk?search=${encodeURIComponent(searchQuery.trim())}`;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
            <Toaster position="top-right" richColors />

            {/* Topbar Info */}
            <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-[#8CA9FF]" />
                            {settings.phone || '022-7654321'}
                        </span>
                        <span className="flex items-center gap-1 hidden sm:inline-flex">
                            <Mail className="w-3.5 h-3.5 text-[#8CA9FF]" />
                            {settings.email || 'info@klinikpremisysmedika.test'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-[#8CA9FF] font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" /> 100% Obat Asli & Terdaftar BPOM
                        </span>
                        <Link href="/lacak-pesanan" className="hover:text-white transition flex items-center gap-1">
                            <PackageCheck className="w-3.5 h-3.5" /> Lacak Pesanan
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Header / Navbar */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8CA9FF] to-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                            <Pill className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-[#8CA9FF]">
                                {settings.site_name || 'Klinik Premisys Medika'}
                            </span>
                            <span className="block text-[10px] text-slate-500 font-medium -mt-1">
                                Solusi Kesehatan Terpercaya
                            </span>
                        </div>
                    </Link>

                    {/* Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
                        <input
                            type="text"
                            placeholder="Cari nama obat, vitamin, merk..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-4 pr-10 py-2 text-sm rounded-full bg-slate-100 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#8CA9FF] focus:bg-white transition"
                        />
                        <button
                            type="submit"
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#8CA9FF] hover:bg-blue-500 text-white flex items-center justify-center transition"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                    </form>

                    {/* Quick Actions (Wishlist, Cart, Profile) */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/wishlist"
                            className="relative p-2 rounded-full hover:bg-slate-100 text-slate-700 transition"
                            title="Wishlist"
                        >
                            <Heart className="w-6 h-6" />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center shadow">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        <Link
                            href="/keranjang"
                            className="relative p-2 rounded-full hover:bg-slate-100 text-slate-700 transition"
                            title="Keranjang Belanja"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#8CA9FF] text-white text-[11px] font-bold flex items-center justify-center shadow">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        {user ? (
                            <div className="relative group">
                                <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition border border-slate-200">
                                    <div className="w-7 h-7 rounded-full bg-[#8CA9FF] text-white flex items-center justify-center text-xs font-bold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate hidden sm:inline">
                                        {user.name}
                                    </span>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 hidden group-hover:block z-50">
                                    <div className="px-4 py-2 border-b border-slate-100">
                                        <p className="text-xs font-bold text-slate-800">{user.name}</p>
                                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                                    </div>
                                    {user.role === 'admin' && (
                                        <Link
                                            href="/admin"
                                            className="block px-4 py-2 text-xs text-blue-600 font-bold hover:bg-slate-50"
                                        >
                                            Panel Admin ERP
                                        </Link>
                                    )}
                                    <Link href="/akun/pesanan" className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50">
                                        Riwayat Pesanan
                                    </Link>
                                    <Link href="/akun/pengaturan" className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50">
                                        Pengaturan Akun
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
                                    >
                                        <LogOut className="w-3.5 h-3.5" /> Keluar
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#8CA9FF] transition"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#8CA9FF] hover:bg-blue-500 rounded-full shadow-sm transition"
                                >
                                    Daftar
                                </Link>
                            </div>
                        )}

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Sub Navigation Links */}
                <div className="hidden md:block bg-slate-100 border-t border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 text-xs font-semibold text-slate-700 overflow-x-auto py-2.5">
                        <Link href="/produk" className="hover:text-[#8CA9FF] transition py-1">
                            Katalog Obat
                        </Link>
                        <Link href="/promo" className="hover:text-[#8CA9FF] transition py-1 text-rose-600 font-bold flex items-center gap-1">
                            🔥 Promo & Diskon
                        </Link>
                        <Link href="/tentang-kami" className="hover:text-[#8CA9FF] transition py-1">
                            Tentang Kami
                        </Link>
                        <Link href="/blog" className="hover:text-[#8CA9FF] transition py-1">
                            Artikel Kesehatan
                        </Link>
                        <Link href="/faq" className="hover:text-[#8CA9FF] transition py-1">
                            FAQ
                        </Link>
                        <Link href="/testimoni" className="hover:text-[#8CA9FF] transition py-1">
                            Testimoni
                        </Link>
                        <Link href="/kontak" className="hover:text-[#8CA9FF] transition py-1">
                            Kontak Kami
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2">
                        <form onSubmit={handleSearchSubmit} className="relative mb-3">
                            <input
                                type="text"
                                placeholder="Cari obat..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-4 pr-10 py-2 text-sm rounded-lg bg-slate-100 border border-slate-200"
                            />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">
                                <Search className="w-4 h-4" />
                            </button>
                        </form>
                        <Link href="/produk" className="block py-2 text-sm font-medium text-slate-700">Katalog Obat</Link>
                        <Link href="/promo" className="block py-2 text-sm font-bold text-rose-600">Promo & Diskon</Link>
                        <Link href="/tentang-kami" className="block py-2 text-sm font-medium text-slate-700">Tentang Kami</Link>
                        <Link href="/blog" className="block py-2 text-sm font-medium text-slate-700">Artikel Kesehatan</Link>
                        <Link href="/faq" className="block py-2 text-sm font-medium text-slate-700">FAQ</Link>
                        <Link href="/testimoni" className="block py-2 text-sm font-medium text-slate-700">Testimoni</Link>
                        <Link href="/kontak" className="block py-2 text-sm font-medium text-slate-700">Kontak Kami</Link>
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-[#8CA9FF] flex items-center justify-center text-white">
                                <Pill className="w-5 h-5" />
                            </div>
                            <span className="text-lg font-bold text-white">{settings.site_name || 'Klinik Premisys Medika'}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                            {settings.site_tagline || 'Solusi Obat Lengkap, Cepat & Terpercaya'}
                        </p>
                        <p className="text-xs text-slate-500">
                            {settings.address || 'Jl. Merdeka No. 45, Bandung, Jawa Barat'}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-white mb-4">Menu Utama</h4>
                        <ul className="space-y-2 text-xs">
                            <li><Link href="/produk" className="hover:text-[#8CA9FF] transition">Katalog Obat</Link></li>
                            <li><Link href="/promo" className="hover:text-[#8CA9FF] transition">Promo Diskon</Link></li>
                            <li><Link href="/blog" className="hover:text-[#8CA9FF] transition">Blog Kesehatan</Link></li>
                            <li><Link href="/lacak-pesanan" className="hover:text-[#8CA9FF] transition">Lacak Pesanan</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-white mb-4">Informasi & Bantuan</h4>
                        <ul className="space-y-2 text-xs">
                            <li><Link href="/tentang-kami" className="hover:text-[#8CA9FF] transition">Tentang Kami</Link></li>
                            <li><Link href="/kontak" className="hover:text-[#8CA9FF] transition">Kontak Kami</Link></li>
                            <li><Link href="/faq" className="hover:text-[#8CA9FF] transition">FAQ</Link></li>
                            <li><Link href="/syarat-ketentuan" className="hover:text-[#8CA9FF] transition">Syarat & Ketentuan</Link></li>
                            <li><Link href="/kebijakan-privasi" className="hover:text-[#8CA9FF] transition">Kebijakan Privasi</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-white mb-4">Metode Pembayaran</h4>
                        <p className="text-xs text-slate-400 mb-3">
                            Mendukung Pembayaran Online Otomatis via Midtrans (BCA, Mandiri, BRI, QRIS, GoPay) & Cash on Delivery (COD).
                        </p>
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-800">
                            <span className="px-2 py-1 bg-white rounded">Midtrans</span>
                            <span className="px-2 py-1 bg-white rounded">QRIS</span>
                            <span className="px-2 py-1 bg-white rounded">COD</span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
                    © {new Date().getFullYear()} {settings.site_name || 'Klinik Premisys Medika'}. All rights reserved. Klinik Premisys Medika.
                </div>
            </footer>
        </div>
    );
}
