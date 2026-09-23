import AdminLayout from '@/layouts/admin-layout';
import { Link, router, useForm } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    DollarSign,
    Edit3,
    Percent,
    Plus,
    Search,
    Tag,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface PromoItem {
    id: number;
    code: string;
    name: string;
    description?: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_purchase: number;
    max_discount?: number;
    quota?: number;
    used_count: number;
    starts_at?: string;
    ends_at?: string;
    is_active: boolean;
    created_at: string;
}

interface Props {
    promos: {
        data: PromoItem[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function PromosIndex({ promos, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoItem | null>(null);

    const addForm = useForm({
        code: '',
        name: '',
        description: '',
        type: 'percentage',
        value: '',
        min_purchase: 0,
        max_discount: '',
        quota: '',
        starts_at: '',
        ends_at: '',
        is_active: true,
    });

    const editForm = useForm({
        code: '',
        name: '',
        description: '',
        type: 'percentage',
        value: '',
        min_purchase: 0,
        max_discount: '',
        quota: '',
        starts_at: '',
        ends_at: '',
        is_active: true,
    });

    const formatRp = (val: number) => `Rp ${Number(val).toLocaleString('id-ID')}`;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/konten/promo', { search }, { preserveState: true });
    };

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/admin/konten/promo', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                addForm.reset();
            },
        });
    };

    const openEdit = (p: PromoItem) => {
        setEditingPromo(p);
        editForm.setData({
            code: p.code,
            name: p.name,
            description: p.description || '',
            type: p.type,
            value: p.value.toString(),
            min_purchase: p.min_purchase || 0,
            max_discount: p.max_discount ? p.max_discount.toString() : '',
            quota: p.quota ? p.quota.toString() : '',
            starts_at: p.starts_at ? p.starts_at.slice(0, 10) : '',
            ends_at: p.ends_at ? p.ends_at.slice(0, 10) : '',
            is_active: p.is_active,
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPromo) return;

        editForm.put(`/admin/konten/promo/${editingPromo.id}`, {
            onSuccess: () => {
                setEditingPromo(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (p: PromoItem) => {
        if (confirm(`Hapus voucher promo ${p.code} (${p.name})?`)) {
            router.delete(`/admin/konten/promo/${p.id}`);
        }
    };

    return (
        <AdminLayout title="Manajemen Promo & Kupon Diskon">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Voucher Promo & Diskon</h1>
                        <p className="text-xs text-slate-500">
                            Kelola kode kupon promosi, diskon persentase/potongan langsung, kuota pemakaian, dan masa aktif.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-3.5 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                        <Plus className="w-4 h-4" /> Buat Kupon Baru
                    </button>
                </div>

                {/* Filter Search */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari kode kupon / nama promo..."
                                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white text-xs font-bold rounded-lg transition"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* Promos Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">Kode Voucher</th>
                                    <th className="px-4 py-3">Nama Promo</th>
                                    <th className="px-4 py-3">Nilai Diskon</th>
                                    <th className="px-4 py-3">Min. Belanja</th>
                                    <th className="px-4 py-3">Kuota Terpakai</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {promos.data.length > 0 ? (
                                    promos.data.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50 transition">
                                            <td className="px-4 py-3.5">
                                                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100 text-xs tracking-wider">
                                                    {p.code}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <p className="font-bold text-slate-800">{p.name}</p>
                                                {p.description && (
                                                    <p className="text-[10px] text-slate-400 line-clamp-1">{p.description}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 font-extrabold text-emerald-600">
                                                {p.type === 'percentage' ? `${p.value}%` : formatRp(p.value)}
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-600">
                                                {p.min_purchase > 0 ? formatRp(p.min_purchase) : 'Tanpa Min.'}
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-700 font-medium">
                                                {p.used_count} / {p.quota ? `${p.quota} kuota` : '∞'}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                        p.is_active
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-slate-100 text-slate-500'
                                                    }`}
                                                >
                                                    {p.is_active ? 'AKTIF' : 'NONAKTIF'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right space-x-1.5">
                                                <button
                                                    onClick={() => openEdit(p)}
                                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition inline-block"
                                                    title="Edit Promo"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p)}
                                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition inline-block"
                                                    title="Hapus Promo"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                            Tidak ada kupon promo ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {promos.links && promos.links.length > 3 && (
                        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
                            <p className="text-slate-500">Total {promos.total} Promo</p>
                            <div className="flex gap-1">
                                {promos.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition ${
                                            link.active
                                                ? 'bg-[#8CA9FF] text-white font-bold'
                                                : link.url
                                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                : 'text-slate-300 pointer-events-none'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Add Promo */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <Tag className="w-5 h-5" />
                                <h3 className="text-base font-bold text-slate-800">Buat Kupon Promo Baru</h3>
                            </div>
                            <form onSubmit={submitAdd} className="space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Kode Voucher</label>
                                        <input
                                            type="text"
                                            value={addForm.data.code}
                                            onChange={(e) => addForm.setData('code', e.target.value.toUpperCase())}
                                            placeholder="Contoh: SEHATHEMAT"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF] font-mono font-bold"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Nama Promo</label>
                                        <input
                                            type="text"
                                            value={addForm.data.name}
                                            onChange={(e) => addForm.setData('name', e.target.value)}
                                            placeholder="Promo Gajian Sehat"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Tipe Diskon</label>
                                        <select
                                            value={addForm.data.type}
                                            onChange={(e) => addForm.setData('type', e.target.value as any)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        >
                                            <option value="percentage">Persentase (%)</option>
                                            <option value="fixed">Potongan Nominal (Rp)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Nilai Diskon ({addForm.data.type === 'percentage' ? '%' : 'Rp'})
                                        </label>
                                        <input
                                            type="number"
                                            value={addForm.data.value}
                                            onChange={(e) => addForm.setData('value', e.target.value)}
                                            placeholder={addForm.data.type === 'percentage' ? '15' : '20000'}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Min. Belanja (Rp)</label>
                                        <input
                                            type="number"
                                            value={addForm.data.min_purchase}
                                            onChange={(e) => addForm.setData('min_purchase', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Maks. Diskon (Rp)</label>
                                        <input
                                            type="number"
                                            value={addForm.data.max_discount}
                                            onChange={(e) => addForm.setData('max_discount', e.target.value)}
                                            placeholder="50000"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Kuota Pakai</label>
                                        <input
                                            type="number"
                                            value={addForm.data.quota}
                                            onChange={(e) => addForm.setData('quota', e.target.value)}
                                            placeholder="100"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                                        <input
                                            type="date"
                                            value={addForm.data.starts_at}
                                            onChange={(e) => addForm.setData('starts_at', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                                        <input
                                            type="date"
                                            value={addForm.data.ends_at}
                                            onChange={(e) => addForm.setData('ends_at', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
                                    <textarea
                                        value={addForm.data.description}
                                        onChange={(e) => addForm.setData('description', e.target.value)}
                                        placeholder="Syarat & ketentuan pemakaian kupon..."
                                        rows={2}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition font-semibold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={addForm.processing}
                                        className="px-4 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white rounded-lg transition font-bold"
                                    >
                                        {addForm.processing ? 'Menyimpan...' : 'Simpan Voucher'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Edit Promo */}
                {editingPromo && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <Edit3 className="w-5 h-5" />
                                <h3 className="text-base font-bold text-slate-800">Edit Voucher: {editingPromo.code}</h3>
                            </div>
                            <form onSubmit={submitEdit} className="space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Kode Voucher</label>
                                        <input
                                            type="text"
                                            value={editForm.data.code}
                                            onChange={(e) => editForm.setData('code', e.target.value.toUpperCase())}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF] font-mono font-bold"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Nama Promo</label>
                                        <input
                                            type="text"
                                            value={editForm.data.name}
                                            onChange={(e) => editForm.setData('name', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Tipe Diskon</label>
                                        <select
                                            value={editForm.data.type}
                                            onChange={(e) => editForm.setData('type', e.target.value as any)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        >
                                            <option value="percentage">Persentase (%)</option>
                                            <option value="fixed">Potongan Nominal (Rp)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Nilai Diskon ({editForm.data.type === 'percentage' ? '%' : 'Rp'})
                                        </label>
                                        <input
                                            type="number"
                                            value={editForm.data.value}
                                            onChange={(e) => editForm.setData('value', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Min. Belanja (Rp)</label>
                                        <input
                                            type="number"
                                            value={editForm.data.min_purchase}
                                            onChange={(e) => editForm.setData('min_purchase', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Maks. Diskon (Rp)</label>
                                        <input
                                            type="number"
                                            value={editForm.data.max_discount}
                                            onChange={(e) => editForm.setData('max_discount', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Kuota Pakai</label>
                                        <input
                                            type="number"
                                            value={editForm.data.quota}
                                            onChange={(e) => editForm.setData('quota', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                                        <input
                                            type="date"
                                            value={editForm.data.starts_at}
                                            onChange={(e) => editForm.setData('starts_at', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                                        <input
                                            type="date"
                                            value={editForm.data.ends_at}
                                            onChange={(e) => editForm.setData('ends_at', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingPromo(null)}
                                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition font-semibold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="px-4 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white rounded-lg transition font-bold"
                                    >
                                        {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
