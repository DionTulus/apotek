import AdminLayout from '@/layouts/admin-layout';
import { Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Mail,
    MessageCircle,
    MessageSquare,
    Phone,
    Plus,
    Send,
    ShoppingBag,
    User,
    Video,
} from 'lucide-react';
import { useState } from 'react';

interface Interaction {
    id: number;
    type: string;
    summary: string;
    interacted_at: string;
    creator?: {
        name: string;
    };
}

interface Order {
    id: number;
    order_number: string;
    grand_total: number;
    status: string;
    created_at: string;
}

interface Lead {
    id: number;
    name: string;
    phone: string;
    email?: string;
    source: string;
    status: string;
    note?: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
        orders?: Order[];
    };
    interactions?: Interaction[];
}

interface Props {
    lead: Lead;
    statuses: { value: string; label: string }[];
}

export default function CrmShow({ lead, statuses }: Props) {
    const statusForm = useForm({
        status: lead.status,
    });

    const interactionForm = useForm({
        type: 'whatsapp',
        summary: '',
        interacted_at: new Date().toISOString().split('T')[0],
    });

    const submitStatus = (e: React.FormEvent) => {
        e.preventDefault();
        statusForm.put(`/admin/crm/${lead.id}/status`);
    };

    const submitInteraction = (e: React.FormEvent) => {
        e.preventDefault();
        interactionForm.post(`/admin/crm/${lead.id}/interaksi`, {
            onSuccess: () => {
                interactionForm.reset('summary');
            },
        });
    };

    const getInteractionIcon = (type: string) => {
        switch (type) {
            case 'whatsapp':
                return <MessageCircle className="w-4 h-4 text-emerald-500" />;
            case 'phone':
                return <Phone className="w-4 h-4 text-blue-500" />;
            case 'email':
                return <Mail className="w-4 h-4 text-amber-500" />;
            case 'consultation':
            case 'meeting':
                return <Video className="w-4 h-4 text-purple-500" />;
            default:
                return <MessageSquare className="w-4 h-4 text-slate-500" />;
        }
    };

    return (
        <AdminLayout title={`Detail Prospek - ${lead.name}`}>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Back */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/crm"
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-slate-800">{lead.name}</h1>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-800">
                                    {lead.status}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                Sumber: <strong className="text-slate-700">{lead.source}</strong> &bull; Terdaftar pada {new Date(lead.created_at).toLocaleDateString('id-ID')}
                            </p>
                        </div>
                    </div>

                    {/* Quick WhatsApp Action */}
                    <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-xs"
                    >
                        <MessageCircle className="w-4 h-4" /> Hubungi via WhatsApp
                    </a>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Lead Info & Status Updater */}
                    <div className="space-y-6">
                        {/* Profile Info */}
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <User className="w-4 h-4 text-[#8CA9FF]" />
                                Informasi Kontak Prospek
                            </h2>
                            <div className="space-y-3 text-xs">
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Nama Lengkap</span>
                                    <span className="font-semibold text-slate-800">{lead.name}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">No. Telepon / WA</span>
                                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5 font-mono">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        {lead.phone}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Email</span>
                                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        {lead.email || '-'}
                                    </span>
                                </div>
                                {lead.note && (
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Catatan Kebutuhan</span>
                                        <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1 italic">
                                            "{lead.note}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pipeline Status Form */}
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#8CA9FF]" />
                                Update Status Pipeline
                            </h2>
                            <form onSubmit={submitStatus} className="space-y-3 text-xs">
                                <div>
                                    <select
                                        value={statusForm.data.status}
                                        onChange={(e) => statusForm.setData('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                    >
                                        {statuses.map((st) => (
                                            <option key={st.value} value={st.value}>
                                                {st.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={statusForm.processing}
                                    className="w-full py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white rounded-lg font-bold transition shadow-xs"
                                >
                                    {statusForm.processing ? 'Menyimpan...' : 'Simpan Perubahan Status'}
                                </button>
                            </form>
                        </div>

                        {/* Customer Account Connection */}
                        {lead.user && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                                <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                                    Akun Pelanggan Terhubung
                                </h2>
                                <p className="text-xs text-slate-600 mb-2">
                                    Prospek ini telah terdaftar sebagai user aktif apotek.
                                </p>
                                <Link
                                    href={`/admin/pelanggan/${lead.user.id}`}
                                    className="text-xs font-semibold text-[#6587e6] hover:underline"
                                >
                                    Lihat Riwayat Belanja Pelanggan &rarr;
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Right 2 Columns: Add Interaction & History Timeline */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Record New Interaction Form */}
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-[#8CA9FF]" />
                                Catat Interaksi / Follow-up Baru
                            </h2>
                            <form onSubmit={submitInteraction} className="space-y-4 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Kanal Interaksi
                                        </label>
                                        <select
                                            value={interactionForm.data.type}
                                            onChange={(e) => interactionForm.setData('type', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        >
                                            <option value="whatsapp">WhatsApp Chat</option>
                                            <option value="phone">Panggilan Telepon</option>
                                            <option value="email">Email</option>
                                            <option value="consultation">Konsultasi Apoteker</option>
                                            <option value="meeting">Pertemuan Langsung</option>
                                            <option value="other">Lainnya</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Tanggal Follow-up
                                        </label>
                                        <input
                                            type="date"
                                            value={interactionForm.data.interacted_at}
                                            onChange={(e) => interactionForm.setData('interacted_at', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Rangkuman Hasil Follow-up
                                    </label>
                                    <textarea
                                        value={interactionForm.data.summary}
                                        onChange={(e) => interactionForm.setData('summary', e.target.value)}
                                        placeholder="Contoh: Sudah dikonfirmasi membutuhkan resep antibiotik, diarahkan untuk mengunggah resep di website..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={interactionForm.processing}
                                        className="px-4 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white rounded-lg font-bold transition flex items-center gap-1.5 shadow-xs"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        {interactionForm.processing ? 'Menyimpan...' : 'Simpan Catatan Follow-up'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Interaction Timeline */}
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-600" />
                                Riwayat Interaksi ({lead.interactions?.length || 0})
                            </h2>

                            {lead.interactions && lead.interactions.length > 0 ? (
                                <div className="relative border-l-2 border-slate-200 ml-3 space-y-4 py-2">
                                    {lead.interactions.map((act) => (
                                        <div key={act.id} className="relative pl-6">
                                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#8CA9FF] flex items-center justify-center">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#8CA9FF]" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 font-bold text-slate-800 uppercase text-xs">
                                                    {getInteractionIcon(act.type)}
                                                    <span>{act.type}</span>
                                                </div>
                                                <span className="text-[11px] text-slate-400">
                                                    {new Date(act.interacted_at).toLocaleDateString('id-ID')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-700 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                {act.summary}
                                            </p>
                                            {act.creator && (
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    Dicatat oleh: {act.creator.name}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">
                                    Belum ada catatan interaksi follow-up untuk prospek ini.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
