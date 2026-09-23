import AdminLayout from '@/layouts/admin-layout';
import { Link, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    Mail,
    MessageSquare,
    Phone,
    Plus,
    Search,
    User,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface LeadItem {
    id: number;
    name: string;
    phone: string;
    email?: string;
    source: string;
    status: 'new' | 'contacted' | 'converted' | 'lost';
    note?: string;
    created_at: string;
    interactions_count: number;
    user?: {
        name: string;
        email: string;
    };
}

interface Props {
    leads: {
        data: LeadItem[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    statuses: { value: string; label: string }[];
    stats: {
        total: number;
        new: number;
        contacted: number;
        converted: number;
        lost: number;
    };
    filters: {
        status?: string;
        source?: string;
        search?: string;
    };
}

export default function CrmIndex({ leads, statuses, stats, filters }: Props) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [source, setSource] = useState(filters.source || '');

    const leadForm = useForm({
        name: '',
        phone: '',
        email: '',
        source: 'Form Kontak Website',
        note: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/crm',
            { status: filters.status, source, search },
            { preserveState: true }
        );
    };

    const handleFilterStatus = (statusVal: string) => {
        router.get(
            '/admin/crm',
            { status: statusVal, source, search },
            { preserveState: true }
        );
    };

    const submitLead = (e: React.FormEvent) => {
        e.preventDefault();
        leadForm.post('/admin/crm/lead', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                leadForm.reset();
            },
        });
    };

    const getStatusBadge = (st: string) => {
        switch (st) {
            case 'new':
                return 'bg-blue-100 text-blue-800';
            case 'contacted':
                return 'bg-amber-100 text-amber-800';
            case 'converted':
                return 'bg-emerald-100 text-emerald-800';
            case 'lost':
                return 'bg-rose-100 text-rose-800';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <AdminLayout title="CRM & Manajemen Prospek Pelanggan">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">CRM & Pipeline Prospek</h1>
                        <p className="text-xs text-slate-500">
                            Kelola calon pembeli potensial, follow-up pertanyaan resep, dan rekam histori interaksi.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-3.5 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                        <Plus className="w-4 h-4" /> Tambah Prospek
                    </button>
                </div>

                {/* Pipeline Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div
                        onClick={() => handleFilterStatus('new')}
                        className={`p-4 rounded-xl border cursor-pointer transition shadow-xs ${
                            filters.status === 'new'
                                ? 'bg-blue-50 border-[#8CA9FF]'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-blue-600">Prospek Baru</span>
                        <p className="text-xl font-extrabold text-slate-800 mt-1">{stats.new}</p>
                    </div>

                    <div
                        onClick={() => handleFilterStatus('contacted')}
                        className={`p-4 rounded-xl border cursor-pointer transition shadow-xs ${
                            filters.status === 'contacted'
                                ? 'bg-amber-50 border-amber-300'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-amber-600">Sudah Dihubungi</span>
                        <p className="text-xl font-extrabold text-slate-800 mt-1">{stats.contacted}</p>
                    </div>

                    <div
                        onClick={() => handleFilterStatus('converted')}
                        className={`p-4 rounded-xl border cursor-pointer transition shadow-xs ${
                            filters.status === 'converted'
                                ? 'bg-emerald-50 border-emerald-300'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-emerald-600">Berhasil Jadi Pembeli</span>
                        <p className="text-xl font-extrabold text-slate-800 mt-1">{stats.converted}</p>
                    </div>

                    <div
                        onClick={() => handleFilterStatus('lost')}
                        className={`p-4 rounded-xl border cursor-pointer transition shadow-xs ${
                            filters.status === 'lost'
                                ? 'bg-rose-50 border-rose-300'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-rose-600">Batal / Tidak Tertarik</span>
                        <p className="text-xl font-extrabold text-slate-800 mt-1">{stats.lost}</p>
                    </div>
                </div>

                {/* Filter Search Bar */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama, no. WhatsApp, atau email..."
                                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                            />
                        </div>

                        <select
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                        >
                            <option value="">Semua Sumber (Source)</option>
                            <option value="Form Kontak Website">Form Kontak Website</option>
                            <option value="WhatsApp Direct">WhatsApp Direct</option>
                            <option value="Tanya Obat Storefront">Tanya Obat Storefront</option>
                            <option value="Walk-in Offline">Walk-in Offline</option>
                        </select>

                        {filters.status && (
                            <button
                                type="button"
                                onClick={() => handleFilterStatus('')}
                                className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg transition"
                            >
                                Reset Status Filter
                            </button>
                        )}

                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white text-xs font-bold rounded-lg transition"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* Leads Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">Nama Calon Pembeli</th>
                                    <th className="px-4 py-3">Kontak</th>
                                    <th className="px-4 py-3">Sumber (Source)</th>
                                    <th className="px-4 py-3">Status Pipeline</th>
                                    <th className="px-4 py-3">Follow-up</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {leads.data.length > 0 ? (
                                    leads.data.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-slate-50 transition">
                                            <td className="px-4 py-3.5">
                                                <Link
                                                    href={`/admin/crm/${lead.id}`}
                                                    className="font-bold text-slate-800 hover:text-[#6587e6] transition"
                                                >
                                                    {lead.name}
                                                </Link>
                                                {lead.note && (
                                                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                                        "{lead.note}"
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <p className="font-mono text-slate-800 font-semibold">
                                                    {lead.phone}
                                                </p>
                                                {lead.email && (
                                                    <p className="text-[11px] text-slate-400">{lead.email}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                                    {lead.source}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(
                                                        lead.status
                                                    )}`}
                                                >
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-600">
                                                <span className="inline-flex items-center gap-1">
                                                    <MessageSquare className="w-3 h-3 text-slate-400" />
                                                    {lead.interactions_count} kali interaksi
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <Link
                                                    href={`/admin/crm/${lead.id}`}
                                                    className="px-3 py-1 bg-[#8CA9FF] hover:bg-[#7292eb] text-white rounded text-[11px] font-bold transition shadow-xs"
                                                >
                                                    Detail & Follow Up
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                            Tidak ada data prospek sesuai kriteria pencarian.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {leads.links && leads.links.length > 3 && (
                        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
                            <p className="text-slate-500">Total {leads.total} Prospek</p>
                            <div className="flex gap-1">
                                {leads.links.map((link, idx) => (
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

                {/* Modal Add Lead */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-2 text-[#6587e6]">
                                <User className="w-5 h-5" />
                                <h3 className="text-base font-bold text-slate-800">Tambah Prospek Baru</h3>
                            </div>
                            <form onSubmit={submitLead} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={leadForm.data.name}
                                        onChange={(e) => leadForm.setData('name', e.target.value)}
                                        placeholder="Contoh: Bpk. Bambang Sutrisno"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                                    <input
                                        type="text"
                                        value={leadForm.data.phone}
                                        onChange={(e) => leadForm.setData('phone', e.target.value)}
                                        placeholder="Contoh: 081234567890"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Email (Opsional)</label>
                                    <input
                                        type="email"
                                        value={leadForm.data.email}
                                        onChange={(e) => leadForm.setData('email', e.target.value)}
                                        placeholder="Contoh: bambang@example.com"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Sumber Prospek</label>
                                    <select
                                        value={leadForm.data.source}
                                        onChange={(e) => leadForm.setData('source', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                    >
                                        <option value="Form Kontak Website">Form Kontak Website</option>
                                        <option value="WhatsApp Direct">WhatsApp Direct</option>
                                        <option value="Tanya Obat Storefront">Tanya Obat Storefront</option>
                                        <option value="Walk-in Offline">Walk-in Offline</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Catatan Kebutuhan Obat</label>
                                    <textarea
                                        value={leadForm.data.note}
                                        onChange={(e) => leadForm.setData('note', e.target.value)}
                                        placeholder="Contoh: Mencari obat resep hipertensi Amlodipine untuk terapi rutin..."
                                        rows={3}
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
                                        disabled={leadForm.processing}
                                        className="px-4 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white rounded-lg transition font-bold"
                                    >
                                        {leadForm.processing ? 'Menyimpan...' : 'Simpan Prospek'}
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
