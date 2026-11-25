import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Box,
    ChevronDown,
    DollarSign,
    FileCheck,
    FileText,
    HelpCircle,
    Home,
    Layers,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Package,
    RefreshCw,
    Settings,
    Shield,
    ShoppingBag,
    Store,
    Truck,
    UserRound,
    Users,
} from 'lucide-react';
import React from 'react';
import { Toaster, toast } from 'sonner';

interface SharedProps {
    auth?: {
        user?: {
            name: string;
            email: string;
            role: string;
        } | null;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

export default function AdminLayout({ children, title }: { children: React.ReactNode; title?: string }) {
    const { auth, flash } = usePage<SharedProps>().props;
    const user = auth?.user;
    const isPharmacist = user?.role === 'pharmacist';

    React.useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const navGroups = [
        {
            label: 'Ringkasan',
            items: [{ label: 'Dashboard KPI', href: '/admin', icon: LayoutDashboard }],
        },
        {
            label: 'Persediaan',
            items: [
                { label: 'Manajemen Produk', href: '/admin/produk', icon: Package },
                { label: 'Kategori Obat', href: '/admin/kategori', icon: Layers },
                { label: 'Stok & Batch', href: '/admin/stok', icon: Box },
                { label: 'Supplier & Pembelian', href: '/admin/supplier', icon: Store },
            ],
        },
        {
            label: 'Operasional',
            items: [
                { label: 'Verifikasi Resep', href: '/admin/resep', icon: FileCheck },
                { label: 'Pesanan Masuk', href: '/admin/pesanan', icon: ShoppingBag },
                { label: 'Pembayaran', href: '/admin/pembayaran', icon: DollarSign },
                { label: 'Pengiriman & Resi', href: '/admin/pengiriman', icon: Truck },
                { label: 'Retur & Refund', href: '/admin/retur', icon: RefreshCw },
            ],
        },
        {
            label: 'Pelanggan & Konten',
            items: [
                { label: 'Pelanggan', href: '/admin/pelanggan', icon: Users },
                { label: 'CRM & Leads', href: '/admin/crm', icon: MessageSquare },
                { label: 'FAQ Apotek', href: '/admin/konten/faq', icon: HelpCircle },
                { label: 'Promo & Voucher', href: '/admin/konten/promo', icon: DollarSign },
                { label: 'Blog & Artikel', href: '/admin/konten/blog', icon: FileText },
                { label: 'Moderasi Testimoni', href: '/admin/konten/testimoni', icon: MessageSquare },
                { label: 'Pesan Kontak Masuk', href: '/admin/konten/pesan', icon: MessageSquare },
            ],
        },
        {
            label: 'Laporan',
            items: [
                { label: 'Laporan Keuangan', href: '/admin/keuangan', icon: FileText },
                { label: 'Analitik & Statistik', href: '/admin/analitik', icon: BarChart3 },
            ],
        },
        {
            label: 'Pengaturan',
            items: [
                { label: 'Pengguna & Akses', href: '/admin/pengguna', icon: Shield },
                { label: 'Pengaturan Website', href: '/admin/pengaturan', icon: Settings },
                { label: 'Profil Saya', href: '/settings/profile', icon: UserRound },
            ],
        },
    ];
    const pharmacistRoutes = new Set([
        '/admin/resep',
        '/admin/pesanan',
        '/admin/pembayaran',
        '/admin/pengiriman',
        '/admin/retur',
        '/settings/profile',
    ]);
    const visibleNavGroups = navGroups
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => !isPharmacist || pharmacistRoutes.has(item.href)),
        }))
        .filter((group) => group.items.length > 0);
    const isNavItemActive = (href: string) =>
        window.location.pathname === href ||
        (href !== '/admin' && window.location.pathname.startsWith(`${href}/`)) ||
        (href === '/admin/supplier' && window.location.pathname.startsWith('/admin/pembelian'));

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
            <Toaster position="top-right" richColors />

            {/* Sidebar */}
            <aside className="sticky top-0 flex h-screen w-64 flex-shrink-0 flex-col border-r border-emerald-900 bg-emerald-950 text-slate-200">
                <div className="p-4 border-b border-emerald-900 flex items-center justify-between">
                    <Link href={isPharmacist ? '/admin/pesanan' : '/admin'} className="flex items-center gap-2">
                        <img
                            src="/logo_klinik2.png"
                            alt="Logo Klinik Premysis Medika"
                            className="h-9 w-9 rounded-lg bg-white p-1 object-contain"
                        />
                        <span className="font-extrabold text-white text-base tracking-tight">
                            {isPharmacist ? 'Panel Apoteker' : 'Admin Apotek'}
                        </span>
                    </Link>
                </div>

                <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
                    {visibleNavGroups.map((group) => (
                        <details
                            key={group.label}
                            open={group.items.some((item) => isNavItemActive(item.href))}
                            className="group"
                        >
                            <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-200/75 hover:bg-emerald-900 hover:text-white [&::-webkit-details-marker]:hidden">
                                {group.label}
                                <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                            </summary>
                            <div className="space-y-1 pt-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = isNavItemActive(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                                isActive
                                                    ? 'bg-emerald-700 text-white shadow-sm'
                                                    : 'text-slate-200 hover:bg-emerald-900 hover:text-white'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </details>
                    ))}
                </nav>

                <div className="p-3 border-t border-emerald-900">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-emerald-900 transition"
                    >
                        <Home className="w-4 h-4 text-emerald-300" /> Lihat Storefront
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                {/* Header Topbar */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
                    <h1 className="text-lg font-bold text-slate-800">{title || 'Panel Kontrol ERP Apotek'}</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-800">{user?.name || 'Admin User'}</p>
                            <p className="text-[10px] text-slate-500 capitalize">{user?.role || 'Administrator'}</p>
                        </div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition"
                            title="Keluar"
                        >
                            <LogOut className="w-5 h-5" />
                        </Link>
                    </div>
                </header>

                <main className="min-h-0 flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}
