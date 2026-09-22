import StoreLayout from '@/layouts/store-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, User } from 'lucide-react';

interface PostItem {
    id: number;
    title: string;
    slug: string;
    content: string;
    published_at: string;
    author?: { name: string };
}

interface BlogShowProps {
    post: PostItem;
    relatedPosts: PostItem[];
}

export default function BlogShow({ post, relatedPosts = [] }: BlogShowProps) {
    return (
        <StoreLayout>
            <Head title={`${post.title} - Apotek Sehat Sentosa`} />

            <div className="bg-slate-900 text-white py-12 px-4">
                <div className="max-w-4xl mx-auto space-y-4">
                    <Link href="/blog" className="inline-flex items-center gap-1 text-xs text-[#8CA9FF] hover:underline font-bold">
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Artikel
                    </Link>
                    <h1 className="text-2xl sm:text-4xl font-black leading-tight">{post.title}</h1>
                    <div className="flex items-center gap-6 text-xs text-slate-400 border-t border-slate-800 pt-4">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-[#8CA9FF]" />
                            {new Date(post.published_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </span>
                        <span className="flex items-center gap-1">
                            <User className="w-4 h-4 text-[#8CA9FF]" />
                            {post.author?.name || 'Apoteker Penanggung Jawab'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 gap-12">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 text-slate-800 leading-relaxed text-sm whitespace-pre-line">
                    {post.content}
                </div>

                {/* Related Articles */}
                {relatedPosts.length > 0 && (
                    <div className="space-y-4 pt-6 border-t border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900">Artikel Kesehatan Terkait</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {relatedPosts.map((r) => (
                                <Link
                                    key={r.id}
                                    href={`/blog/${r.slug}`}
                                    className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-[#8CA9FF] shadow-xs transition space-y-2"
                                >
                                    <h4 className="font-bold text-xs text-slate-900 line-clamp-2 hover:text-blue-600">{r.title}</h4>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
