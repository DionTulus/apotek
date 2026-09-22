import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Box,
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

    React.useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const navItems = [
        { label: 'Dashboard KPI', href: '/admin', icon: LayoutDashboard },
        { label: 'Manajemen Produk', href: '/admin/produk', icon: Package },
        { label: 'Kategori Obat', href: '/admin/kategori', icon: Layers },
        { label: 'Stok & Batch', href: '/admin/stok', icon: Box },
        { label: 'Supplier & Pembelian', href: '/admin/supplier', icon: Store },
        { label: 'Verifikasi Resep', href: '/admin/resep', icon: FileCheck },
        { label: 'Pesanan Masuk', href: '/admin/pesanan', icon: ShoppingBag },
        { label: 'Pembayaran', href: '/admin/pembayaran', icon: DollarSign },
        { label: 'Pengiriman & Resi', href: '/admin/pengiriman', icon: Truck },
        { label: 'Retur & Refund', href: '/admin/retur', icon: RefreshCw },
        { label: 'Pelanggan', href: '/admin/pelanggan', icon: Users },
        { label: 'Laporan Keuangan', href: '/admin/keuangan', icon: FileText },
        { label: 'CRM & Leads', href: '/admin/crm', icon: MessageSquare },
        { label: 'Analitik & Statistik', href: '/admin/analitik', icon: BarChart3 },
        { label: 'Pengguna & Akses', href: '/admin/pengguna', icon: Shield },
        { label: 'Pengaturan Website', href: '/admin/pengaturan', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-100 flex text-slate-800 font-sans">
            <Toaster position="top-right" richColors />

            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#8CA9FF] text-white flex items-center justify-center font-bold">
                            ERP
                        </div>
                        <span className="font-extrabold text-white text-base tracking-tight">Admin Apotek</span>
                    </Link>
                </div>

                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = window.location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                                    isActive
                                        ? 'bg-[#8CA9FF] text-white shadow-sm'
                                        : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-slate-800">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    >
                        <Home className="w-4 h-4 text-[#8CA9FF]" /> Lihat Storefront
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
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

                <main className="flex-1 p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
