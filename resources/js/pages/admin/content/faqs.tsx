import AdminLayout from '@/layouts/admin-layout';
import { Link, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    Edit3,
    HelpCircle,
    Plus,
    Search,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface FaqItem {
    id: number;
    question: string;
    answer: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
}

interface Props {
    faqs: {
        data: FaqItem[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function FaqsIndex({ faqs, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);

    const addForm = useForm({
        question: '',
        answer: '',
        sort_order: 0,
        is_active: true,
    });

    const editForm = useForm({
        question: '',
        answer: '',
        sort_order: 0,
        is_active: true,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/konten/faq', { search }, { preserveState: true });
    };

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/admin/konten/faq', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                addForm.reset();
            },
        });
    };

    const openEdit = (faq: FaqItem) => {
        setEditingFaq(faq);
        editForm.setData({
            question: faq.question,
            answer: faq.answer,
            sort_order: faq.sort_order,
            is_active: faq.is_active,
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFaq) return;

        editForm.put(`/admin/konten/faq/${editingFaq.id}`, {
            onSuccess: () => {
                setEditingFaq(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (faq: FaqItem) => {
        if (confirm(`Hapus FAQ: "${faq.question}"?`)) {
            router.delete(`/admin/konten/faq/${faq.id}`);
        }
    };

    return (
        <AdminLayout title="Manajemen FAQ Apotek">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Manajemen Tanya Jawab (FAQ)</h1>
                        <p className="text-xs text-slate-500">
                            Kelola daftar pertanyaan yang sering diajukan seputar pemesanan obat, resep, dan pengiriman.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-3.5 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                        <Plus className="w-4 h-4" /> Tambah FAQ Baru
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
                                placeholder="Cari pertanyaan FAQ..."
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

                {/* FAQs Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 w-16">Urutan</th>
                                    <th className="px-4 py-3">Pertanyaan</th>
                                    <th className="px-4 py-3">Jawaban</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {faqs.data.length > 0 ? (
                                    faqs.data.map((faq) => (
                                        <tr key={faq.id} className="hover:bg-slate-50 transition">
                                            <td className="px-4 py-3.5 font-bold text-slate-500 font-mono">
                                                #{faq.sort_order}
                                            </td>
                                            <td className="px-4 py-3.5 font-bold text-slate-800 max-w-[240px]">
                                                {faq.question}
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-600 max-w-[360px] line-clamp-2">
                                                {faq.answer}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                        faq.is_active
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-slate-100 text-slate-500'
                                                    }`}
                                                >
                                                    {faq.is_active ? 'AKTIF' : 'NONAKTIF'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right space-x-1.5">
                                                <button
                                                    onClick={() => openEdit(faq)}
                                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition inline-block"
                                                    title="Edit FAQ"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(faq)}
                                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition inline-block"
                                                    title="Hapus FAQ"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                            Belum ada pertanyaan FAQ dibuat.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {faqs.links && faqs.links.length > 3 && (
                        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
                            <p className="text-slate-500">Total {faqs.total} FAQ</p>
                            <div className="flex gap-1">
                                {faqs.links.map((link, idx) => (
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

                {/* Modal Add FAQ */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-2 text-[#6587e6]">
                                <HelpCircle className="w-5 h-5" />
                                <h3 className="text-base font-bold text-slate-800">Tambah FAQ Baru</h3>
                            </div>
                            <form onSubmit={submitAdd} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Pertanyaan</label>
                                    <input
                                        type="text"
                                        value={addForm.data.question}
                                        onChange={(e) => addForm.setData('question', e.target.value)}
                                        placeholder="Contoh: Bagaimana cara memesan obat resep?"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Jawaban Lengkap</label>
                                    <textarea
                                        value={addForm.data.answer}
                                        onChange={(e) => addForm.setData('answer', e.target.value)}
                                        placeholder="Tuliskan jawaban yang jelas dan ramah..."
                                        rows={4}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Urutan Tampil (Sort)</label>
                                        <input
                                            type="number"
                                            value={addForm.data.sort_order}
                                            onChange={(e) => addForm.setData('sort_order', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        />
                                    </div>
                                    <div className="flex items-center pt-5">
                                        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={addForm.data.is_active}
                                                onChange={(e) => addForm.setData('is_active', e.target.checked)}
                                                className="rounded border-slate-300 text-[#8CA9FF] focus:ring-[#8CA9FF]"
                                            />
                                            Status Aktif (Tampil)
                                        </label>
                                    </div>
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
                                        {addForm.processing ? 'Menyimpan...' : 'Simpan FAQ'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Edit FAQ */}
                {editingFaq && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-2 text-[#6587e6]">
                                <Edit3 className="w-5 h-5" />
                                <h3 className="text-base font-bold text-slate-800">Edit FAQ</h3>
                            </div>
                            <form onSubmit={submitEdit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Pertanyaan</label>
                                    <input
                                        type="text"
                                        value={editForm.data.question}
                                        onChange={(e) => editForm.setData('question', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Jawaban Lengkap</label>
                                    <textarea
                                        value={editForm.data.answer}
                                        onChange={(e) => editForm.setData('answer', e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Urutan Tampil (Sort)</label>
                                        <input
                                            type="number"
                                            value={editForm.data.sort_order}
                                            onChange={(e) => editForm.setData('sort_order', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        />
                                    </div>
                                    <div className="flex items-center pt-5">
                                        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={editForm.data.is_active}
                                                onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                                className="rounded border-slate-300 text-[#8CA9FF] focus:ring-[#8CA9FF]"
                                            />
                                            Status Aktif (Tampil)
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingFaq(null)}
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
