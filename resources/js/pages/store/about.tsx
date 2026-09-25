import StoreLayout from '@/layouts/store-layout';
import { Head } from '@inertiajs/react';
import { Award, CheckCircle2, HeartHandshake, ShieldCheck, Target, Users } from 'lucide-react';

interface AboutProps {
    vision?: string;
    mission?: string;
    about?: string;
}

export default function About({ vision, mission, about }: AboutProps) {
    return (
        <StoreLayout>
            <Head title="Tentang Kami - Klinik Premisys Medika" />

            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white py-12 px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-3xl font-black">Tentang Klinik Premisys Medika</h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto">
                    Melayani kebutuhan kesehatan keluarga Indonesia dengan obat legal, berkualitas, dan profesional sejak 2020.
                </p>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                {/* Profile Overview */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Award className="w-6 h-6 text-[#8CA9FF]" /> Profil Klinik
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {about ||
                            'Klinik Premisys Medika berdiri sejak tahun 2020 di Kota Bandung. Kami berkomitmen menyediakan layanan kesehatan modern terintegrasi yang memudahkan masyarakat mendapatkan obat-obatan legal, suplemen kesehatan, dan alat medis secara online maupun langsung.'}
                    </p>
                </div>

                {/* Vision & Mission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 space-y-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#8CA9FF] text-white flex items-center justify-center font-bold">
                            <Target className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Visi Kami</h3>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                            {vision ||
                                'Menjadi jaringan apotek e-commerce terdepan di Indonesia yang memberikan pelayanan kefarmasian profesional, cepat, dan amanah.'}
                        </p>
                    </div>

                    <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-3 shadow-md">
                        <div className="w-10 h-10 rounded-2xl bg-[#8CA9FF] text-slate-950 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Misi Kami</h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                            {mission ||
                                "1. Menyediakan obat-obatan legal BPOM.\n2. Memberikan konsultasi obat yang ramah & terpercaya.\n3. Mengirimkan pesanan secara cepat dan terjamin keamanannya."}
                        </p>
                    </div>
                </div>

                {/* Values */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                    <div className="p-6 bg-white rounded-2xl border border-slate-200">
                        <ShieldCheck className="w-8 h-8 text-[#8CA9FF] mx-auto mb-3" />
                        <h4 className="font-bold text-slate-900 text-sm">Legalitas Terjamin</h4>
                        <p className="text-xs text-slate-500 mt-1">Seluruh obat berasal dari PBF resmi dan berizin BPOM</p>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-slate-200">
                        <Users className="w-8 h-8 text-[#8CA9FF] mx-auto mb-3" />
                        <h4 className="font-bold text-slate-900 text-sm">Tim Apoteker Profesional</h4>
                        <p className="text-xs text-slate-500 mt-1">Ditinjau langsung oleh Apoteker Penanggung Jawab berpengalaman</p>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-slate-200">
                        <HeartHandshake className="w-8 h-8 text-[#8CA9FF] mx-auto mb-3" />
                        <h4 className="font-bold text-slate-900 text-sm">Pelayanan Ramah</h4>
                        <p className="text-xs text-slate-500 mt-1">Siap mendampingi konsultasi penggunaan dan dosis obat</p>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
