import StoreLayout from '@/layouts/store-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { MessageSquare, Send, Star, UserCheck } from 'lucide-react';
import React from 'react';

interface TestimonialItem {
    id: number;
    name: string;
    rating: number;
    content: string;
    created_at?: string;
}

interface TestimonialsProps {
    testimonials: {
        data: TestimonialItem[];
        links: any[];
    };
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
    const { auth } = usePage<any>().props;
    const user = auth?.user;

    const { data, setData, post, processing, errors, reset } = useForm({
        rating: 5,
        content: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/testimoni', {
            onSuccess: () => reset(),
        });
    };

    return (
        <StoreLayout>
            <Head title="Testimoni Pelanggan - Apotek Sehat Sentosa" />

            <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white py-12 px-4 text-center">
                <h1 className="text-3xl font-black">Testimoni & Ulasan Pelanggan</h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2">
                    Pengalaman nyata pelanggan dalam berbelanja obat & suplemen di Apotek ERP
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Testimonials List */}
                <div className="lg:col-span-8 space-y-6">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-[#8CA9FF]" /> Ulasan Pembeli ({testimonials?.data?.length || 0})
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {testimonials?.data?.map((t) => (
                            <div key={t.id} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="flex text-amber-400 gap-1">
                                        {[...Array(t.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-700 leading-relaxed italic">"{t.content}"</p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-900">{t.name}</span>
                                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                        <UserCheck className="w-3 h-3" /> Terverifikasi
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Form Sidebar */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 sticky top-24">
                        <h3 className="text-base font-extrabold text-slate-900">Kirimkan Ulasan Anda</h3>

                        {user ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Rating Kepuasan (1-5 Bintang)</label>
                                    <div className="flex gap-2 text-amber-400">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setData('rating', star)}
                                                className="focus:outline-none"
                                            >
                                                <Star
                                                    className={`w-6 h-6 ${
                                                        star <= data.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Ulasan Pengalaman Belanja *</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        placeholder="Tuliskan ulasan jujur Anda tentang pelayanan dan obat yang dibeli..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#8CA9FF] focus:outline-none"
                                    />
                                    {errors.content && <p className="text-[11px] text-rose-500 mt-1">{errors.content}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3 rounded-xl bg-[#8CA9FF] hover:bg-blue-500 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" /> {processing ? 'Mengirim...' : 'Kirim Testimoni'}
                                </button>
                                <p className="text-[10px] text-slate-400 text-center">Ulasan akan ditinjau admin sebelum ditampilkan publik.</p>
                            </form>
                        ) : (
                            <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                <p className="text-xs text-slate-600 font-medium">Silakan masuk ke akun Anda terlebih dahulu untuk memberikan ulasan.</p>
                                <Link
                                    href="/login"
                                    className="inline-block px-5 py-2 rounded-full bg-[#8CA9FF] hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition"
                                >
                                    Masuk Akun
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
