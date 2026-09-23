import AdminLayout from '@/layouts/admin-layout';
import { Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Eye,
    EyeOff,
    MessageSquare,
    Star,
    Trash2,
    User,
} from 'lucide-react';

interface TestimonialItem {
    id: number;
    name: string;
    rating: number;
    content: string;
    is_approved: boolean;
    photo?: string;
    created_at: string;
    user?: {
        name: string;
        email: string;
    };
}

interface Props {
    testimonials: {
        data: TestimonialItem[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
}

export default function TestimonialsIndex({ testimonials }: Props) {
    const handleToggle = (t: TestimonialItem) => {
        router.post(`/admin/konten/testimoni/${t.id}/toggle`);
    };

    const handleDelete = (t: TestimonialItem) => {
        if (confirm(`Hapus ulasan/testimoni dari ${t.name}?`)) {
            router.delete(`/admin/konten/testimoni/${t.id}`);
        }
    };

    return (
        <AdminLayout title="Moderasi Testimoni & Ulasan Pelanggan">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Moderasi Ulasan & Testimoni</h1>
                        <p className="text-xs text-slate-500">
                            Validasi ulasan pengalaman belanja dari pelanggan sebelum ditampilkan di halaman beranda.
                        </p>
                    </div>
                </div>

                {/* Testimonials List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testimonials.data.length > 0 ? (
                        testimonials.data.map((t) => (
                            <div
                                key={t.id}
                                className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col justify-between transition ${
                                    t.is_approved ? 'border-slate-200' : 'border-amber-200 bg-amber-50/20'
                                }`}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-amber-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${
                                                        i < t.rating
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-slate-200'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                t.is_approved
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}
                                        >
                                            {t.is_approved ? 'DISETUJUI' : 'TERSEMBUNYI'}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-700 italic">"{t.content}"</p>

                                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-[#8CA9FF]/20 text-[#6587e6] font-bold text-xs flex items-center justify-center">
                                            {t.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-xs">{t.name}</p>
                                            <p className="text-[10px] text-slate-400">
                                                {new Date(t.created_at).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <button
                                        onClick={() => handleToggle(t)}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                            t.is_approved
                                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        }`}
                                    >
                                        {t.is_approved ? (
                                            <>
                                                <EyeOff className="w-3.5 h-3.5" /> Sembunyikan
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Tampilkan di Beranda
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(t)}
                                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                                        title="Hapus Testimoni"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                            Belum ada ulasan testimoni dari pelanggan.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {testimonials.links && testimonials.links.length > 3 && (
                    <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-xs">
                        <p className="text-slate-500">Total {testimonials.total} Ulasan</p>
                        <div className="flex gap-1">
                            {testimonials.links.map((link, idx) => (
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
        </AdminLayout>
    );
}
