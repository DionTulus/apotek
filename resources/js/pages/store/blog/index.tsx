import StoreLayout from '@/layouts/store-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Calendar, User } from 'lucide-react';

interface PostItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    published_at: string;
    author?: { name: string };
}

interface BlogIndexProps {
    posts: {
        data: PostItem[];
        links: any[];
    };
}

export default function BlogIndex({ posts }: BlogIndexProps) {
    return (
        <StoreLayout>
            <Head title="Artikel & Berita Kesehatan - Klinik Premisys Medika" />

            <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white py-12 px-4 text-center">
                <h1 className="text-3xl font-black">Artikel & Edukasi Kesehatan</h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2">
                    Informasi seputar gaya hidup sehat, panduan penggunaan obat, dan penanganan penyakit dari apoteker.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts?.data?.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition flex flex-col justify-between"
                        >
                            <div className="p-6 space-y-3">
                                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-[#8CA9FF]" />
                                        {new Date(post.published_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <User className="w-3.5 h-3.5 text-[#8CA9FF]" />
                                        {post.author?.name || 'Apoteker'}
                                    </span>
                                </div>

                                <Link href={`/blog/${post.slug}`}>
                                    <h2 className="font-extrabold text-slate-900 text-base line-clamp-2 hover:text-blue-600 transition">
                                        {post.title}
                                    </h2>
                                </Link>
                                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                            </div>

                            <div className="p-6 pt-0">
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8CA9FF] hover:text-blue-700 transition"
                                >
                                    Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </StoreLayout>
    );
}
