import AdminLayout from '@/layouts/admin-layout';
import { Link, router, useForm } from '@inertiajs/react';
import { Edit2, Plus, Search, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';

interface Supplier {
    id: number;
    name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    is_active: boolean;
    purchases_count: number;
}

interface PaginatedSuppliers {
    data: Supplier[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface Props {
    suppliers: PaginatedSuppliers;
    filters: { search?: string };
}

const SupplierModal = ({ open, onClose, supplier }: { open: boolean; onClose: () => void; supplier: Supplier | null }) => {
    const form = useForm<{
        name: string;
        contact_person: string;
        phone: string;
        email: string;
        address: string;
        is_active: boolean;
        _method?: string;
    }>({
        name: supplier?.name ?? '',
        contact_person: supplier?.contact_person ?? '',
        phone: supplier?.phone ?? '',
        email: supplier?.email ?? '',
        address: supplier?.address ?? '',
        is_active: supplier?.is_active ?? true,
        _method: supplier ? 'PUT' : undefined,
    });

    React.useEffect(() => {
        form.setData({
            name: supplier?.name ?? '',
            contact_person: supplier?.contact_person ?? '',
            phone: supplier?.phone ?? '',
            email: supplier?.email ?? '',
            address: supplier?.address ?? '',
            is_active: supplier?.is_active ?? true,
            _method: supplier ? 'PUT' : undefined,
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supplier, open]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = supplier ? `/admin/supplier/${supplier.id}` : '/admin/supplier';
        form.post(url, { onSuccess: () => onClose() });
    };

    if (!open) return null;

    const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-800">{supplier ? 'Edit Supplier' : 'Tambah Supplier'}</h2>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">Nama Supplier *</label>
                            <input type="text" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className={inputCls} id="input-supplier-name" />
                            {form.errors.name && <p className="text-xs text-red-500 mt-1">{form.errors.name}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">Kontak Person</label>
                            <input type="text" value={form.data.contact_person} onChange={(e) => form.setData('contact_person', e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">Telepon</label>
                            <input type="text" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} className={inputCls} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">Email</label>
                            <input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} className={inputCls} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">Alamat</label>
                            <textarea rows={2} value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} className={`${inputCls} resize-none`} />
                        </div>
                        {supplier && (
                            <div className="col-span-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} className="w-4 h-4 accent-indigo-600" />
                                    <span className="text-sm text-slate-700 font-medium">Supplier Aktif</span>
                                </label>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">Batal</button>
                        <button type="submit" disabled={form.processing} className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">
                            {form.processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function SuppliersIndex({ suppliers, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Supplier | null>(null);

    const doSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/supplier', { search }, { preserveState: true });
    };

    const confirmDelete = (s: Supplier) => {
        if (confirm(`Hapus supplier "${s.name}"?`)) {
            router.delete(`/admin/supplier/${s.id}`);
        }
    };

    return (
        <AdminLayout title="Supplier & Pembelian">
            <SupplierModal open={modalOpen} onClose={() => setModalOpen(false)} supplier={editing} />

            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Supplier</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{suppliers.total} supplier terdaftar</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/pembelian"
                            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition"
                        >
                            Daftar PO
                        </Link>
                        <button
                            onClick={() => { setEditing(null); setModalOpen(true); }}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
                            id="btn-add-supplier"
                        >
                            <Plus className="w-4 h-4" /> Tambah Supplier
                        </button>
                    </div>
                </div>

                <form onSubmit={doSearch} className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama supplier..."
                            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 w-64"
                            id="input-supplier-search"
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl">Cari</button>
                </form>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Nama</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Kontak</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Email</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Total PO</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {suppliers.data.length === 0 ? (
                                <tr><td colSpan={6} className="py-16 text-center text-slate-400">Belum ada supplier.</td></tr>
                            ) : suppliers.data.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50/60">
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-slate-800 text-xs">{s.name}</p>
                                        <p className="text-[11px] text-slate-400">{s.contact_person ?? ''}</p>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-600">{s.phone ?? '-'}</td>
                                    <td className="px-4 py-3 text-xs text-slate-600">{s.email ?? '-'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-block bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{s.purchases_count}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {s.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => { setEditing(s); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600" title="Edit">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => confirmDelete(s)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Hapus">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {suppliers.links.length > 3 && (
                    <div className="flex gap-1">
                        {suppliers.links.map((link, i) => (
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
