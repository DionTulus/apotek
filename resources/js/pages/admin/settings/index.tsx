import AdminLayout from '@/layouts/admin-layout';
import { useForm } from '@inertiajs/react';
import {
    Building2,
    Check,
    CreditCard,
    FileText,
    Globe,
    Mail,
    MapPin,
    Phone,
    Save,
    Settings,
    Shield,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    settings: Record<string, string>;
}

export default function SettingsIndex({ settings }: Props) {
    const [activeTab, setActiveTab] = useState<'profile' | 'legal' | 'payment'>('profile');

    const form = useForm({
        site_name: settings.site_name || '',
        site_tagline: settings.site_tagline || '',
        phone: settings.phone || '',
        whatsapp: settings.whatsapp || '',
        email: settings.email || '',
        address: settings.address || '',
        operating_hours: settings.operating_hours || '',
        maps_embed: settings.maps_embed || '',
        vision: settings.vision || '',
        mission: settings.mission || '',
        terms_content: settings.terms_content || '',
        privacy_content: settings.privacy_content || '',
        bank_bca: settings.bank_bca || '',
        bank_mandiri: settings.bank_mandiri || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/pengaturan');
    };

    return (
        <AdminLayout title="Pengaturan & Konfigurasi Website Apotek">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Pengaturan Sistem & Website</h1>
                    <p className="text-xs text-slate-500">
                        Kelola profil apotek, jam operasional, kontak darurat WhatsApp, visi-misi, dan rekening bank.
                    </p>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`pb-3 border-b-2 flex items-center gap-2 transition ${
                            activeTab === 'profile'
                                ? 'border-[#8CA9FF] text-[#6587e6] font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Building2 className="w-4 h-4" /> Profil & Kontak Apotek
                    </button>
                    <button
                        onClick={() => setActiveTab('legal')}
                        className={`pb-3 border-b-2 flex items-center gap-2 transition ${
                            activeTab === 'legal'
                                ? 'border-[#8CA9FF] text-[#6587e6] font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <FileText className="w-4 h-4" /> Visi, Misi & Konten Legal
                    </button>
                    <button
                        onClick={() => setActiveTab('payment')}
                        className={`pb-3 border-b-2 flex items-center gap-2 transition ${
                            activeTab === 'payment'
                                ? 'border-[#8CA9FF] text-[#6587e6] font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <CreditCard className="w-4 h-4" /> Rekening Pembayaran Manual
                    </button>
                </div>

                {/* Settings Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tab 1: Profile & Contact */}
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Nama Apotek</label>
                                    <input
                                        type="text"
                                        value={form.data.site_name}
                                        onChange={(e) => form.setData('site_name', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Tagline Apotek</label>
                                    <input
                                        type="text"
                                        value={form.data.site_tagline}
                                        onChange={(e) => form.setData('site_tagline', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon</label>
                                    <input
                                        type="text"
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">WhatsApp CS (628...)</label>
                                    <input
                                        type="text"
                                        value={form.data.whatsapp}
                                        onChange={(e) => form.setData('whatsapp', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Email Resmi</label>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Jam Operasional</label>
                                <input
                                    type="text"
                                    value={form.data.operating_hours}
                                    onChange={(e) => form.setData('operating_hours', e.target.value)}
                                    placeholder="Senin - Minggu: 08:00 - 22:00 WIB"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap Apotek</label>
                                <textarea
                                    value={form.data.address}
                                    onChange={(e) => form.setData('address', e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                    Google Maps Embed URL (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={form.data.maps_embed}
                                    onChange={(e) => form.setData('maps_embed', e.target.value)}
                                    placeholder="https://maps.google.com/maps?..."
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF] font-mono text-[11px]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Vision, Mission & Legal */}
                    {activeTab === 'legal' && (
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Visi Apotek</label>
                                <textarea
                                    value={form.data.vision}
                                    onChange={(e) => form.setData('vision', e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Misi Apotek</label>
                                <textarea
                                    value={form.data.mission}
                                    onChange={(e) => form.setData('mission', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                    Syarat & Ketentuan Pembelian Obat
                                </label>
                                <textarea
                                    value={form.data.terms_content}
                                    onChange={(e) => form.setData('terms_content', e.target.value)}
                                    rows={5}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                    Kebijakan Privasi & Perlindungan Data Medis
                                </label>
                                <textarea
                                    value={form.data.privacy_content}
                                    onChange={(e) => form.setData('privacy_content', e.target.value)}
                                    rows={5}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Payment Accounts */}
                    {activeTab === 'payment' && (
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
                            <p className="text-slate-500">
                                Nomor rekening bank untuk pelanggan yang memilih metode <strong>Transfer Bank Manual</strong> di halaman checkout:
                            </p>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Rekening Bank BCA</label>
                                <input
                                    type="text"
                                    value={form.data.bank_bca}
                                    onChange={(e) => form.setData('bank_bca', e.target.value)}
                                    placeholder="Contoh: 123-456-7890 a/n PT Apotek ERP Sehat"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF] font-mono"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Rekening Bank Mandiri</label>
                                <input
                                    type="text"
                                    value={form.data.bank_mandiri}
                                    onChange={(e) => form.setData('bank_mandiri', e.target.value)}
                                    placeholder="Contoh: 987-654-3210 a/n PT Apotek ERP Sehat"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF] font-mono"
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit Bar */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="px-6 py-2.5 bg-[#8CA9FF] hover:bg-[#7292eb] text-white text-xs font-bold rounded-lg transition flex items-center gap-2 shadow-xs"
                        >
                            <Save className="w-4 h-4" />
                            {form.processing ? 'Menyimpan Pengaturan...' : 'Simpan Semua Pengaturan'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
