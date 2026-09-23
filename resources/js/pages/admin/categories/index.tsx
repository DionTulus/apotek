import AdminLayout from '@/layouts/admin-layout';
import { Link, router, useForm } from '@inertiajs/react';
import { Edit2, Image as ImageIcon, Plus, Search, Trash2, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    products_count: number;
}

interface PaginatedCategories {
    data: Category[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number;
    to: number;
    total: number;
}

interface Props {
    categories: PaginatedCategories;
    filters: { search?: string };
}

const CategoryModal = ({
    open,
    onClose,
    category,
}: {
    open: boolean;
    onClose: () => void;
    category: Category | null;
}) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(
        category?.image ? `/storage/${category.image}` : null,
    );

    const form = useForm<{
        name: string;
        description: string;
        image: File | null;
        _method?: string;
    }>({
        name: category?.name ?? '',
        description: category?.description ?? '',
        image: null,
        _method: category ? 'PUT' : undefined,
    });

    React.useEffect(() => {
        form.setData({
            name: category?.name ?? '',
            description: category?.description ?? '',
            image: null,
            _method: category ? 'PUT' : undefined,
        });
        setPreview(category?.image ? `/storage/${category.image}` : null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, open]);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        form.setData('image', file);
        if (file) setPreview(URL.createObjectURL(file));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = category ? `/admin/kategori/${category.id}` : '/admin/kategori';
        form.post(url, {
            forceFormData: true,
            onSuccess: () => onClose(),
        });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-800">
                        {category ? 'Edit Kategori' : 'Tambah Kategori'}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-4">
                    {/* Image */}
                    <div
                        className="border-2 border-dashed border-slate-200 rounded-xl h-36 flex items-center justify-center cursor-pointer hover:border-indigo-400 transition relative overflow-hidden"
                        onClick={() => fileRef.current?.click()}
                    >
                        {preview ? (
                            <img src={preview} className="w-full h-full object-cover" alt="preview" />
                        ) : (
                            <div className="flex flex-col items-center gap-1 text-slate-400">
                                <ImageIcon className="w-8 h-8" />
                                <span className="text-xs">Klik untuk unggah gambar</span>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileRef}
                            accept="image/*"
                            className="hidden"
                            onChange={handleFile}
                        />
                    </div>
                    {form.errors.image && <p className="text-xs text-red-500">{form.errors.image}</p>}

                    {/* Name */}
                    <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Nama Kategori *</label>
                        <input
                            type="text"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            placeholder="cth: Antibiotik"
                        />
                        {form.errors.name && <p className="text-xs text-red-500 mt-1">{form.errors.name}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Deskripsi</label>
                        <textarea
                            rows={3}
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {form.processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function CategoriesIndex({ categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);

    const doSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/kategori', { search }, { preserveState: true });
    };

    const confirmDelete = (cat: Category) => {
        if (confirm(`Hapus kategori "${cat.name}"?`)) {
            router.delete(`/admin/kategori/${cat.id}`);
        }
    };

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (cat: Category) => {
        setEditing(cat);
        setModalOpen(true);
    };

    return (
        <AdminLayout title="Kategori Obat">
            <CategoryModal open={modalOpen} onClose={() => setModalOpen(false)} category={editing} />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Kategori Obat</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{categories.total} kategori terdaftar</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
                        id="btn-add-category"
                    >
                        <Plus className="w-4 h-4" /> Tambah Kategori
                    </button>
                </div>

                {/* Search */}
                <form onSubmit={doSearch} className="flex gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari kategori..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            id="input-search-category"
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-700">
                        Cari
                    </button>
                </form>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Gambar</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Nama</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Slug</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Produk</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {categories.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-slate-400 text-sm">
                                        Belum ada kategori.
                                    </td>
                                </tr>
                            ) : (
                                categories.data.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-slate-50/60 transition">
                                        <td className="px-4 py-3">
                                            {cat.image ? (
                                                <img
                                                    src={`/storage/${cat.image}`}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                    alt={cat.name}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                                    <ImageIcon className="w-4 h-4 text-slate-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-slate-800">{cat.name}</td>
                                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{cat.slug}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                                {cat.products_count}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(cat)}
                                                    className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(cat)}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {categories.links.length > 3 && (
                    <div className="flex gap-1">
                        {categories.links.map((link, i) => (
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
