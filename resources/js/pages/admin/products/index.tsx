import AdminLayout from '@/layouts/admin-layout';
import { Link, router, useForm } from '@inertiajs/react';
import { AlertTriangle, Filter, Package, Plus, Search, Trash2, Edit2 } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    sku: string;
    slug: string;
    image: string | null;
    price: number;
    cost_price: number;
    stock: number;
    min_stock: number;
    is_active: boolean;
    is_featured: boolean;
    drug_class: string;
    requires_prescription: boolean;
    category: { id: number; name: string } | null;
}

interface PaginatedProducts {
    data: Product[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    from: number;
    to: number;
}

interface Props {
    products: PaginatedProducts;
    categories: { id: number; name: string }[];
    drugClasses: { value: string; label: string }[];
    filters: {
        search?: string;
        category?: string;
        drug_class?: string;
        stock_alert?: string;
    };
}

const drugClassColors: Record<string, string> = {
    bebas: 'bg-green-50 text-green-700',
    bebas_terbatas: 'bg-blue-50 text-blue-700',
    keras: 'bg-red-50 text-red-700',
    herbal: 'bg-emerald-50 text-emerald-700',
    suplemen: 'bg-yellow-50 text-yellow-700',
    alkes: 'bg-purple-50 text-purple-700',
};

export default function ProductsIndex({ products, categories, drugClasses, filters }: Props) {
    const form = useForm({
        search: filters.search ?? '',
        category: filters.category ?? '',
        drug_class: filters.drug_class ?? '',
        stock_alert: filters.stock_alert ?? '',
    });

    const doFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/produk', form.data as Record<string, string>, { preserveState: true });
    };

    const confirmDelete = (p: Product) => {
        if (confirm(`Hapus produk "${p.name}"? Produk akan di-soft-delete.`)) {
            router.delete(`/admin/produk/${p.id}`);
        }
    };

    const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

    return (
        <AdminLayout title="Manajemen Produk">
            <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Manajemen Produk</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{products.total} produk terdaftar</p>
                    </div>
                    <Link
                        href="/admin/produk/create"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
                        id="btn-add-product"
                    >
                        <Plus className="w-4 h-4" /> Tambah Produk
                    </Link>
                </div>

                {/* Filter Bar */}
                <form onSubmit={doFilter} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-48">
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Cari</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={form.data.search}
                                onChange={(e) => form.setData('search', e.target.value)}
                                placeholder="Nama / SKU..."
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                id="input-product-search"
                            />
                        </div>
                    </div>

                    <div className="min-w-40">
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Kategori</label>
                        <select
                            value={form.data.category}
                            onChange={(e) => form.setData('category', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                            <option value="">Semua</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-44">
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Golongan</label>
                        <select
                            value={form.data.drug_class}
                            onChange={(e) => form.setData('drug_class', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                            <option value="">Semua</option>
                            {drugClasses.map((d) => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-36">
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Peringatan Stok</label>
                        <select
                            value={form.data.stock_alert}
                            onChange={(e) => form.setData('stock_alert', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                            <option value="">Semua</option>
                            <option value="low">Stok Rendah</option>
                            <option value="out">Stok Habis</option>
                        </select>
                    </div>

                    <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-700">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <Link href="/admin/produk" className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200">
                        Reset
                    </Link>
                </form>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
                    <table className="w-full text-sm min-w-[900px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Produk</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Kategori</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Golongan</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Harga Jual</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Stok</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {products.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-slate-400">
                                        <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        Tidak ada produk ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                products.data.map((p) => {
                                    const isLow = p.stock > 0 && p.stock <= p.min_stock;
                                    const isOut = p.stock <= 0;
                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50/60 transition">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                                        {p.image ? (
                                                            <img src={`/storage/${p.image}`} className="w-full h-full object-cover" alt={p.name} />
                                                        ) : (
                                                            <Package className="w-5 h-5 m-2.5 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 text-xs leading-tight">{p.name}</p>
                                                        <p className="text-[11px] text-slate-400 font-mono">{p.sku}</p>
                                                        {p.requires_prescription && (
                                                            <span className="inline-block bg-red-50 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5">
                                                                ℞ Resep
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600">{p.category?.name ?? '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${drugClassColors[p.drug_class] ?? 'bg-slate-100 text-slate-600'}`}>
                                                    {p.drug_class.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-slate-800 text-xs">{fmt(p.price)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                                                    isOut ? 'bg-red-100 text-red-700' :
                                                    isLow ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-50 text-green-700'
                                                }`}>
                                                    {(isOut || isLow) && <AlertTriangle className="w-3 h-3" />}
                                                    {p.stock}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                                    p.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {p.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/produk/${p.id}/edit`}
                                                        className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => confirmDelete(p)}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
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
                                    link.active
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
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
