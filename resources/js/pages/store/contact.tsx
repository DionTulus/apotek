import StoreLayout from '@/layouts/store-layout';
import { Head, useForm } from '@inertiajs/react';
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';

interface ContactProps {
    phone?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    mapsEmbedUrl?: string;
}

export default function Contact({ phone, whatsapp, email, address, mapsEmbedUrl }: ContactProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/kontak', {
            onSuccess: () => reset(),
        });
    };

    return (
        <StoreLayout>
            <Head title="Kontak Kami - Apotek Sehat Sentosa" />

            <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white py-12 px-4 text-center">
                <h1 className="text-3xl font-black">Hubungi Apotek Kami</h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2">
                    Punya pertanyaan seputar stok obat, resep, atau pengiriman? Tim kami siap membantu.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Contact Info & Details */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                        <h2 className="text-lg font-bold text-slate-900">Informasi Kontak</h2>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#8CA9FF] flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase">Alamat Apotek</h3>
                                <p className="text-xs font-bold text-slate-800 mt-0.5">
                                    {address || 'Jl. Merdeka No. 45, Bandung, Jawa Barat 40111'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#8CA9FF] flex items-center justify-center shrink-0">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase">Telepon & WhatsApp</h3>
                                <p className="text-xs font-bold text-slate-800 mt-0.5">
                                    Telp: {phone || '022-7654321'} | WA: {whatsapp || '081234567890'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#8CA9FF] flex items-center justify-center shrink-0">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase">Email Layanan</h3>
                                <p className="text-xs font-bold text-slate-800 mt-0.5">
                                    {email || 'info@apoteksehatsentosa.test'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#8CA9FF] flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase">Jam Operasional</h3>
                                <p className="text-xs font-bold text-slate-800 mt-0.5">
                                    Senin – Minggu: 07:00 – 22:00 WIB
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Google Maps Embed */}
                    <div className="bg-white rounded-3xl p-4 border border-slate-200 overflow-hidden shadow-sm">
                        <h3 className="text-xs font-bold text-slate-700 mb-3 px-2">Peta Lokasi Apotek</h3>
                        <div className="w-full h-64 rounded-2xl overflow-hidden bg-slate-100">
                            <iframe
                                title="Peta Lokasi Apotek Sehat Sentosa"
                                src={
                                    mapsEmbedUrl ||
                                    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.835848243!2d107.60981!3d-6.914744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTQnNTMuMSJTIDEwN8KwMzYnMzUuMyJF!5e0!3m2!1sid!2sid!4v1600000000000'
                                }
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-7">
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Kirim Pesan</h2>
                            <p className="text-xs text-slate-500 mt-1">Isi formulir di bawah ini untuk mengirimkan pertanyaan ke tim kami</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="cth. Budi Santoso"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#8CA9FF] focus:outline-none"
                                    />
                                    {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="cth. budi@example.com"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#8CA9FF] focus:outline-none"
                                    />
                                    {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">No. Telepon / WhatsApp</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="cth. 081234567890"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#8CA9FF] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Subjek Pesan</label>
                                    <input
                                        type="text"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        placeholder="cth. Tanya Stok Obat"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#8CA9FF] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Isi Pesan *</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Tuliskan pesan atau pertanyaan Anda di sini..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#8CA9FF] focus:outline-none"
                                />
                                {errors.message && <p className="text-[11px] text-rose-500 mt-1">{errors.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 rounded-xl bg-[#8CA9FF] hover:bg-blue-500 text-white text-xs font-extrabold shadow-md transition flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" /> {processing ? 'Mengirim...' : 'Kirim Pesan'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
