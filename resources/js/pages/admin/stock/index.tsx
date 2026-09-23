import AdminLayout from '@/layouts/admin-layout';
import { Link, router, useForm } from '@inertiajs/react';
import { AlertTriangle, BarChart3, Box, CheckCircle2, ChevronRight, Filter, Search, Settings2, X } from 'lucide-react';
import React, { useState } from 'react';

interface Product {
    id: number;
    name: string;
    sku: string;
    stock: number;
    min_stock: number;
    unit: string;
    expiring_soon_count: number;
    category: { name: string } | null;
}

interface PaginatedProducts {
    data: Product[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface Props {
    products: PaginatedProducts;
    filters: { search?: string; alert?: string };
}

const AdjustModal = ({ product, onClose }: { product: Product; onClose: () => void }) => {
    const form = useForm({ type: 'in', qty: '', note: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/admin/stok/${product.id}/adjust`, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <p className="text-base font-bold text-slate-800">Sesuaikan Stok</p>
                        <p className="text-xs text-slate-500">{product.name} — Stok saat ini: <strong>{product.stock}</strong></p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Jenis Penyesuaian *</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['in', 'out'] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => form.setData('type', t)}
                                    className={`py-2.5 rounded-xl text-sm font-bold border transition ${
                                        form.data.type === t
                                            ? t === 'in' ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500'
                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    {t === 'in' ? '+ Tambah Stok' : '− Kurangi Stok'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Jumlah *</label>
                        <input
                            type="number"
                            min={1}
                            value={form.data.qty}
                            onChange={(e) => form.setData('qty', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            id="input-adjust-qty"
                        />
                        {form.errors.qty && <p className="text-xs text-red-500 mt-1">{form.errors.qty}</p>}
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Catatan *</label>
                        <textarea
                            rows={2}
                            value={form.data.note}
                            onChange={(e) => form.setData('note', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                            placeholder="Alasan penyesuaian stok..."
                            id="input-adjust-note"
                        />
                        {form.errors.note && <p className="text-xs text-red-500 mt-1">{form.errors.note}</p>}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">Batal</button>
                        <button type="submit" disabled={form.processing} className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">
                            {form.processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function StockIndex({ products, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);

    const doFilter = (alert?: string) => {
        router.get('/admin/stok', { search, alert: alert ?? filters.alert ?? '' }, { preserveState: true });
    };

    const alertBtns = [
        { label: 'Semua', value: '' },
        { label: 'Stok Habis', value: 'out', color: 'bg-red-50 text-red-700 border-red-200' },
        { label: 'Stok Rendah', value: 'low', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
        { label: 'Hampir Kadaluarsa', value: 'expiring', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    ];

    return (
        <AdminLayout title="Manajemen Stok">
            {adjustProduct && <AdjustModal product={adjustProduct} onClose={() => setAdjustProduct(null)} />}

            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Manajemen Stok & Batch</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{products.total} produk</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                    <form onSubmit={(e) => { e.preventDefault(); doFilter(); }} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari produk / SKU..."
                                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 w-52"
                                id="input-stock-search"
                            />
                        </div>
                        <button type="submit" className="px-3 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl">Cari</button>
                    </form>
                    <div className="flex gap-2 flex-wrap">
                        {alertBtns.map((btn) => (
                            <button
                                key={btn.value}
                                onClick={() => doFilter(btn.value)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                                    filters.alert === btn.value
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : (btn.color ?? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')
                                }`}
                            >
                                <Filter className="w-3 h-3 inline mr-1" />
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
                    <table className="w-full text-sm min-w-[800px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Produk</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Kategori</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Stok</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Min. Stok</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {products.data.length === 0 ? (
                                <tr><td colSpan={6} className="py-16 text-center text-slate-400">Tidak ada produk ditemukan.</td></tr>
                            ) : products.data.map((p) => {
                                const isOut = p.stock <= 0;
                                const isLow = p.stock > 0 && p.stock <= p.min_stock;
                                return (
                                    <tr key={p.id} className="hover:bg-slate-50/60 transition">
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-slate-800 text-xs">{p.name}</p>
                                            <p className="text-[11px] text-slate-400 font-mono">{p.sku}</p>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">{p.category?.name ?? '-'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="font-bold text-slate-800">{p.stock}</span>
                                            <span className="text-xs text-slate-400 ml-1">{p.unit}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-xs text-slate-500">{p.min_stock}</td>
                                        <td className="px-4 py-3 text-center">
                                            {isOut ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">
                                                    <AlertTriangle className="w-3 h-3" /> Habis
                                                </span>
                                            ) : isLow ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full">
                                                    <AlertTriangle className="w-3 h-3" /> Rendah
                                                </span>
                                            ) : p.expiring_soon_count > 0 ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">
                                                    <AlertTriangle className="w-3 h-3" /> Akan Exp.
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full">
                                                    <CheckCircle2 className="w-3 h-3" /> OK
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => setAdjustProduct(p)}
                                                    className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                                    title="Sesuaikan Stok"
                                                    id={`btn-adjust-${p.id}`}
                                                >
                                                    <Settings2 className="w-3.5 h-3.5" /> Sesuaikan
                                                </button>
                                                <Link
                                                    href={`/admin/stok/${p.id}/batches`}
                                                    className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100"
                                                    title="Lihat Batch"
                                                >
                                                    <Box className="w-3.5 h-3.5" /> Batch
                                                </Link>
                                                <Link
                                                    href={`/admin/stok/${p.id}/movements`}
                                                    className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100"
                                                    title="Lihat Histori"
                                                >
                                                    <BarChart3 className="w-3.5 h-3.5" /> Histori
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {products.links.length > 3 && (
                    <div className="flex gap-1 flex-wrap">
                        {products.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                    link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
