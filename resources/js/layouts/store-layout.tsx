import { Link, usePage } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ChevronDown,
    Heart,
    LogOut,
    Mail,
    Menu,
    PackageCheck,
    Phone,
    Search,
    ShieldCheck,
    ShoppingCart,
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

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const {
        auth,
        cartCount = 0,
        wishlistCount = 0,
        settings = {},
        flash = {},
    } = usePage<SharedProps>().props;
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
        <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-800">
            <Toaster position="top-right" richColors />

            {/* Topbar Info */}
            <div className="border-b border-emerald-950 bg-emerald-950 px-4 py-2 text-xs text-slate-200">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5 text-emerald-300" />
                            {settings.phone || '022-7654321'}
                        </span>
                        <span className="flex hidden items-center gap-1 sm:inline-flex">
                            <Mail className="h-3.5 w-3.5 text-emerald-300" />
                            {settings.email || 'info@klinikpremysismedika.test'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 font-medium text-emerald-300">
                            <ShieldCheck className="h-3.5 w-3.5" /> 100% Obat
                            Asli & Terdaftar BPOM
                        </span>
                        <Link
                            href="/lacak-pesanan"
                            className="flex items-center gap-1 transition hover:text-white"
                        >
                            <PackageCheck className="h-3.5 w-3.5" /> Lacak
                            Pesanan
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Header / Navbar */}
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
                    {/* Brand Logo */}
                    <Link href="/" className="group flex items-center gap-2.5">
                        <img
                            src="/logo_klinik2.png"
                            alt="Logo Klinik Premysis Medika"
                            className="h-10 w-10 object-contain transition-transform group-hover:scale-105"
                        />
                        <div>
                            <span className="bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-600 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
                                {settings.site_name || 'Klinik Premysis Medika'}
                            </span>
                            <span className="-mt-1 block text-[10px] font-medium text-slate-500">
                                Solusi Kesehatan Terpercaya
                            </span>
                        </div>
                    </Link>

                    {/* Search Bar */}
                    <form
                        onSubmit={handleSearchSubmit}
                        className="relative hidden max-w-md flex-1 md:flex"
                    >
                        <input
                            type="text"
                            placeholder="Cari nama obat, vitamin, merk..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-full border border-slate-200 bg-slate-100 py-2 pr-10 pl-4 text-sm transition focus:bg-white focus:ring-2 focus:ring-[#065f46] focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="absolute top-1/2 right-1 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#065f46] text-white transition hover:bg-emerald-700"
                        >
                            <Search className="h-4 w-4" />
                        </button>
                    </form>

                    {/* Quick Actions (Wishlist, Cart, Profile) */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/wishlist"
                            className="relative rounded-full p-2 text-slate-700 transition hover:bg-slate-100"
                            title="Wishlist"
                        >
                            <Heart className="h-6 w-6" />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white shadow">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        <Link
                            href="/keranjang"
                            className="relative rounded-full p-2 text-slate-700 transition hover:bg-slate-100"
                            title="Keranjang Belanja"
                        >
                            <ShoppingCart className="h-6 w-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#065f46] text-[11px] font-bold text-white shadow">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 rounded-full border border-slate-200 p-1.5 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#065f46] focus-visible:outline-none">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#065f46] text-xs font-bold text-white">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="hidden max-w-[100px] truncate text-xs font-semibold text-slate-700 sm:inline">
                                            {user.name}
                                        </span>
                                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    sideOffset={8}
                                    className="z-50 w-56 overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-xl"
                                >
                                    <DropdownMenuLabel className="px-3 py-2 font-normal">
                                        <p className="truncate text-xs font-bold text-slate-800">
                                            {user.name}
                                        </p>
                                        <p className="truncate text-[11px] text-slate-500">
                                            {user.email}
                                        </p>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-slate-100" />
                                    {(user.role === 'admin' ||
                                        user.role === 'pharmacist') && (
                                        <DropdownMenuItem
                                            asChild
                                            className="cursor-pointer rounded-lg px-3 py-2 text-xs text-emerald-600 focus:bg-slate-50 focus:text-emerald-700"
                                        >
                                            <Link
                                                href={
                                                    user.role === 'admin'
                                                        ? '/admin'
                                                        : '/admin/pesanan'
                                                }
                                            >
                                                {user.role === 'admin'
                                                    ? 'Panel Admin ERP'
                                                    : 'Panel Apoteker'}
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        asChild
                                        className="cursor-pointer rounded-lg px-3 py-2 text-xs text-slate-700 focus:bg-slate-800"
                                    >
                                        <Link href="/akun/pesanan">
                                            Riwayat Pesanan
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        asChild
                                        className="cursor-pointer rounded-lg px-3 py-2 text-xs text-slate-700 focus:bg-slate-800"
                                    >
                                        <Link href="/settings/profile">
                                            Profil Saya
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-100" />
                                    <DropdownMenuItem
                                        asChild
                                        className="cursor-pointer rounded-lg px-3 py-2 text-xs text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                                    >
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                        >
                                            <LogOut className="mr-1.5 h-3.5 w-3.5" />{' '}
                                            Keluar
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:text-[#065f46]"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-full bg-[#065f46] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                                >
                                    Daftar
                                </Link>
                            </div>
                        )}

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Sub Navigation Links */}
                <div className="hidden border-t border-slate-200 bg-slate-100 md:block">
                    <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-4 py-2.5 text-xs font-semibold text-slate-700 sm:px-6 lg:px-8">
                        <Link
                            href="/produk"
                            className="py-1 transition hover:text-[#065f46]"
                        >
                            Katalog Obat
                        </Link>
                        <Link
                            href="/promo"
                            className="flex items-center gap-1 py-1 font-bold text-rose-600 transition hover:text-[#065f46]"
                        >
                            🔥 Promo & Diskon
                        </Link>
                        <Link
                            href="/tentang-kami"
                            className="py-1 transition hover:text-[#065f46]"
                        >
                            Tentang Kami
                        </Link>
                        <Link
                            href="/blog"
                            className="py-1 transition hover:text-[#065f46]"
                        >
                            Artikel Kesehatan
                        </Link>
                        <Link
                            href="/faq"
                            className="py-1 transition hover:text-[#065f46]"
                        >
                            FAQ
                        </Link>
                        <Link
                            href="/testimoni"
                            className="py-1 transition hover:text-[#065f46]"
                        >
                            Testimoni
                        </Link>
                        <Link
                            href="/kontak"
                            className="py-1 transition hover:text-[#065f46]"
                        >
                            Kontak Kami
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="space-y-2 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative mb-3"
                        >
                            <input
                                type="text"
                                placeholder="Cari obat..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2 pr-10 pl-4 text-sm"
                            />
                            <button
                                type="submit"
                                className="absolute top-1/2 right-2 -translate-y-1/2 text-slate-500"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                        </form>
                        <Link
                            href="/produk"
                            className="block py-2 text-sm font-medium text-slate-700"
                        >
                            Katalog Obat
                        </Link>
                        <Link
                            href="/promo"
                            className="block py-2 text-sm font-bold text-rose-600"
                        >
                            Promo & Diskon
                        </Link>
                        <Link
                            href="/tentang-kami"
                            className="block py-2 text-sm font-medium text-slate-700"
                        >
                            Tentang Kami
                        </Link>
                        <Link
                            href="/blog"
                            className="block py-2 text-sm font-medium text-slate-700"
                        >
                            Artikel Kesehatan
                        </Link>
                        <Link
                            href="/faq"
                            className="block py-2 text-sm font-medium text-slate-700"
                        >
                            FAQ
                        </Link>
                        <Link
                            href="/testimoni"
                            className="block py-2 text-sm font-medium text-slate-700"
                        >
                            Testimoni
                        </Link>
                        <Link
                            href="/kontak"
                            className="block py-2 text-sm font-medium text-slate-700"
                        >
                            Kontak Kami
                        </Link>
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="border-t border-slate-800 bg-slate-900 text-slate-300">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <img
                                src="/logo_klinik2.png"
                                alt="Logo Klinik Premysis Medika"
                                className="h-9 w-9 rounded-lg bg-white p-1 object-contain"
                            />
                            <span className="text-lg font-bold text-white">
                                {settings.site_name || 'Klinik Premysis Medika'}
                            </span>
                        </div>
                        <p className="mb-4 text-xs leading-relaxed text-slate-400">
                            {settings.site_tagline ||
                                'Solusi Obat Lengkap, Cepat & Terpercaya'}
                        </p>
                        <p className="text-xs text-slate-500">
                            {settings.address ||
                                'Jl. Merdeka No. 45, Bandung, Jawa Barat'}
                        </p>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-bold text-white">
                            Menu Utama
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link
                                    href="/produk"
                                    className="transition hover:text-[#065f46]"
                                >
                                    Katalog Obat
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/promo"
                                    className="transition hover:text-[#065f46]"
                                >
                                    Promo Diskon
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/blog"
                                    className="transition hover:text-[#065f46]"
                                >
                                    Blog Kesehatan
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/lacak-pesanan"
                                    className="transition hover:text-[#065f46]"
                                >
                                    Lacak Pesanan
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-bold text-white">
                            Informasi & Bantuan
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link
                                    href="/tentang-kami"
                                    className="transition hover:text-[#065f46]"
                                >
                                    Tentang Kami
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/kontak"
                                    className="transition hover:text-[#065f46]"
                                >
                                    Kontak Kami
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/faq"
                                    className="transition hover:text-[#065f46]"
                                >
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/syarat-ketentuan"
                                    className="transition hover:text-[#065f46]"
                                >
                                    Syarat & Ketentuan
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/kebijakan-privasi"
                                    className="transition hover:text-[#065f46]"
                                >
                                    Kebijakan Privasi
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-bold text-white">
                            Metode Pembayaran
                        </h4>
                        <p className="mb-3 text-xs text-slate-400">
                            Mendukung Pembayaran Online Otomatis via Midtrans
                            (BCA, Mandiri, BRI, QRIS, GoPay) & Cash on Delivery
                            (COD).
                        </p>
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-800">
                            <span className="rounded bg-white px-2 py-1">
                                Midtrans
                            </span>
                            <span className="rounded bg-white px-2 py-1">
                                QRIS
                            </span>
                            <span className="rounded bg-white px-2 py-1">
                                COD
                            </span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
                    © {new Date().getFullYear()}{' '}
                    {settings.site_name || 'Klinik Premysis Medika'}. All rights
                    reserved. Klinik Premysis Medika.
                </div>
            </footer>
        </div>
    );
}
