import AdminLayout from '@/layouts/admin-layout';
import { Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Mail,
    MailOpen,
    MessageCircle,
    MessageSquare,
    Phone,
    Trash2,
    User,
} from 'lucide-react';

interface MessageItem {
    id: number;
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

interface Props {
    messages: {
        data: MessageItem[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    unreadCount: number;
    filters: {
        unread?: string;
    };
}

export default function MessagesIndex({ messages, unreadCount, filters }: Props) {
    const handleFilterUnread = (unreadOnly: boolean) => {
        router.get('/admin/konten/pesan', unreadOnly ? { unread: '1' } : {}, { preserveState: true });
    };

    const handleMarkRead = (msg: MessageItem) => {
        router.post(`/admin/konten/pesan/${msg.id}/read`);
    };

    const handleDelete = (msg: MessageItem) => {
        if (confirm(`Hapus pesan dari ${msg.name}?`)) {
            router.delete(`/admin/konten/pesan/${msg.id}`);
        }
    };

    return (
        <AdminLayout title="Kotak Masuk Pesan Kontak Pelanggan">
            <div className="space-y-6">
                {/* Header & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Inbox Pesan Masuk</h1>
                        <p className="text-xs text-slate-500">
                            Pertanyaan, kritik, dan saran dari pengunjung melalui formulir kontak storefront apotek.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleFilterUnread(false)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                !filters.unread
                                    ? 'bg-[#8CA9FF] text-white shadow-xs'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Semua Pesan ({messages.total})
                        </button>
                        <button
                            onClick={() => handleFilterUnread(true)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                                filters.unread
                                    ? 'bg-[#8CA9FF] text-white shadow-xs'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <span>Belum Dibaca</span>
                            {unreadCount > 0 && (
                                <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Messages List */}
                <div className="space-y-3">
                    {messages.data.length > 0 ? (
                        messages.data.map((msg) => (
                            <div
                                key={msg.id}
                                className={`bg-white rounded-xl border p-5 shadow-xs transition space-y-3 ${
                                    !msg.is_read
                                        ? 'border-[#8CA9FF] bg-blue-50/20'
                                        : 'border-slate-200'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                                                !msg.is_read
                                                    ? 'bg-[#8CA9FF] text-white'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {msg.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-slate-800 text-xs">{msg.name}</h3>
                                                {!msg.is_read && (
                                                    <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-rose-100 text-rose-700">
                                                        BARU
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-400">
                                                {msg.email} {msg.phone ? `• ${msg.phone}` : ''}
                                            </p>
                                        </div>
                                    </div>

                                    <span className="text-[11px] text-slate-400">
                                        {new Date(msg.created_at).toLocaleString('id-ID')}
                                    </span>
                                </div>

                                {msg.subject && (
                                    <p className="text-xs font-bold text-slate-800">
                                        Subjek: <span className="text-slate-700">{msg.subject}</span>
                                    </p>
                                )}

                                <p className="text-xs text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-slate-100 leading-relaxed whitespace-pre-line">
                                    {msg.message}
                                </p>

                                <div className="flex items-center justify-between pt-1 text-xs">
                                    <div className="flex items-center gap-2">
                                        {msg.phone && (
                                            <a
                                                href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition inline-flex items-center gap-1 text-[11px]"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" /> Balas WhatsApp
                                            </a>
                                        )}
                                        <a
                                            href={`mailto:${msg.email}`}
                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition inline-flex items-center gap-1 text-[11px]"
                                        >
                                            <Mail className="w-3.5 h-3.5" /> Balas Email
                                        </a>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!msg.is_read && (
                                            <button
                                                onClick={() => handleMarkRead(msg)}
                                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition inline-flex items-center gap-1 text-[11px]"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Tandai Dibaca
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(msg)}
                                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                                            title="Hapus Pesan"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                            Tidak ada pesan masuk.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {messages.links && messages.links.length > 3 && (
                    <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-xs">
                        <p className="text-slate-500">Total {messages.total} Pesan</p>
                        <div className="flex gap-1">
                            {messages.links.map((link, idx) => (
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
