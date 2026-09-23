import AdminLayout from '@/layouts/admin-layout';
import { Link, router, useForm } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    Edit3,
    FileText,
    Image,
    Plus,
    Search,
    Trash2,
    User,
} from 'lucide-react';
import { useState } from 'react';

interface BlogPostItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    cover_image?: string;
    is_published: boolean;
    published_at?: string;
    created_at: string;
    author?: {
        name: string;
    };
}

interface Props {
    posts: {
        data: BlogPostItem[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function BlogsIndex({ posts, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPostItem | null>(null);

    const addForm = useForm({
        title: '',
        excerpt: '',
        content: '',
        cover_image: '',
        is_published: true,
    });

    const editForm = useForm({
        title: '',
        excerpt: '',
        content: '',
        cover_image: '',
        is_published: true,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/konten/blog', { search }, { preserveState: true });
    };

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/admin/konten/blog', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                addForm.reset();
            },
        });
    };

    const openEdit = (post: BlogPostItem) => {
        setEditingPost(post);
        editForm.setData({
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            cover_image: post.cover_image || '',
            is_published: post.is_published,
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPost) return;

        editForm.put(`/admin/konten/blog/${editingPost.id}`, {
            onSuccess: () => {
                setEditingPost(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (post: BlogPostItem) => {
        if (confirm(`Hapus artikel blog "${post.title}"?`)) {
            router.delete(`/admin/konten/blog/${post.id}`);
        }
    };

    return (
        <AdminLayout title="Manajemen Blog & Artikel Kesehatan">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Artikel Blog & Edukasi Obat</h1>
                        <p className="text-xs text-slate-500">
                            Publikasikan artikel kesehatan, tips farmasi, dan panduan penggunaan obat bagi masyarakat.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-3.5 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                        <Plus className="w-4 h-4" /> Tulis Artikel Baru
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
                                placeholder="Cari judul artikel blog..."
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

                {/* Blog Posts Grid / Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">Artikel</th>
                                    <th className="px-4 py-3">Penulis</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Tanggal Terbit</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {posts.data.length > 0 ? (
                                    posts.data.map((post) => (
                                        <tr key={post.id} className="hover:bg-slate-50 transition">
                                            <td className="px-4 py-3.5 max-w-[340px]">
                                                <p className="font-bold text-slate-800 text-xs line-clamp-1">{post.title}</p>
                                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{post.excerpt}</p>
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-600 font-medium">
                                                {post.author?.name || 'Admin'}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                        post.is_published
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {post.is_published ? 'TERBIT' : 'DRAFT'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-500">
                                                {post.published_at
                                                    ? new Date(post.published_at).toLocaleDateString('id-ID')
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-3.5 text-right space-x-1.5">
                                                <button
                                                    onClick={() => openEdit(post)}
                                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition inline-block"
                                                    title="Edit Artikel"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post)}
                                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition inline-block"
                                                    title="Hapus Artikel"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                            Belum ada artikel blog diterbitkan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {posts.links && posts.links.length > 3 && (
                        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
                            <p className="text-slate-500">Total {posts.total} Artikel</p>
                            <div className="flex gap-1">
                                {posts.links.map((link, idx) => (
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

                {/* Modal Add Blog */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center gap-2 text-[#6587e6]">
                                <BookOpen className="w-5 h-5" />
                                <h3 className="text-base font-bold text-slate-800">Tulis Artikel Blog Baru</h3>
                            </div>
                            <form onSubmit={submitAdd} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Judul Artikel</label>
                                    <input
                                        type="text"
                                        value={addForm.data.title}
                                        onChange={(e) => addForm.setData('title', e.target.value)}
                                        placeholder="Contoh: 5 Tips Minum Antibiotik yang Benar dan Aman"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Ringkasan Singkat (Excerpt)</label>
                                    <textarea
                                        value={addForm.data.excerpt}
                                        onChange={(e) => addForm.setData('excerpt', e.target.value)}
                                        placeholder="Ringkasan 1-2 kalimat untuk preview..."
                                        rows={2}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Konten Lengkap</label>
                                    <textarea
                                        value={addForm.data.content}
                                        onChange={(e) => addForm.setData('content', e.target.value)}
                                        placeholder="Tuliskan isi artikel edukasi lengkap..."
                                        rows={8}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">URL Cover Image (Opsional)</label>
                                    <input
                                        type="text"
                                        value={addForm.data.cover_image}
                                        onChange={(e) => addForm.setData('cover_image', e.target.value)}
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={addForm.data.is_published}
                                            onChange={(e) => addForm.setData('is_published', e.target.checked)}
                                            className="rounded border-slate-300 text-[#8CA9FF] focus:ring-[#8CA9FF]"
                                        />
                                        Langsung Terbitkan (Publish)
                                    </label>
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
                                        {addForm.processing ? 'Menerbitkan...' : 'Terbitkan Artikel'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Edit Blog */}
                {editingPost && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center gap-2 text-[#6587e6]">
                                <Edit3 className="w-5 h-5" />
                                <h3 className="text-base font-bold text-slate-800">Edit Artikel: {editingPost.title}</h3>
                            </div>
                            <form onSubmit={submitEdit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Judul Artikel</label>
                                    <input
                                        type="text"
                                        value={editForm.data.title}
                                        onChange={(e) => editForm.setData('title', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Ringkasan Singkat (Excerpt)</label>
                                    <textarea
                                        value={editForm.data.excerpt}
                                        onChange={(e) => editForm.setData('excerpt', e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Konten Lengkap</label>
                                    <textarea
                                        value={editForm.data.content}
                                        onChange={(e) => editForm.setData('content', e.target.value)}
                                        rows={8}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">URL Cover Image (Opsional)</label>
                                    <input
                                        type="text"
                                        value={editForm.data.cover_image}
                                        onChange={(e) => editForm.setData('cover_image', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={editForm.data.is_published}
                                            onChange={(e) => editForm.setData('is_published', e.target.checked)}
                                            className="rounded border-slate-300 text-[#8CA9FF] focus:ring-[#8CA9FF]"
                                        />
                                        Status Terbit (Publish)
                                    </label>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingPost(null)}
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
