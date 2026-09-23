import StoreLayout from '@/layouts/store-layout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Clock, FileText, Pill, ShieldAlert, XCircle } from 'lucide-react';
import React from 'react';

interface PrescriptionItem {
    id: number;
    file_path: string;
    doctor_name?: string;
    status: string;
    note?: string;
    reviewed_at?: string;
    created_at: string;
    reviewer?: { name: string };
}

interface PaginatedPrescriptions {
    data: PrescriptionItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface PrescriptionsProps {
    prescriptions: PaginatedPrescriptions;
}

export default function MyPrescriptions({ prescriptions }: PrescriptionsProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'rejected':
                return 'bg-rose-100 text-rose-800 border-rose-200';
            default:
                return 'bg-amber-100 text-amber-800 border-amber-200';
        }
    };

    return (
        <StoreLayout>
            <Head title="Resep Saya - Apotek ERP" />

            <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                <div className="max-w-7xl mx-auto flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#8CA9FF]/20 border border-[#8CA9FF]/30 text-[#8CA9FF] flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Resep Saya</h1>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Riwayat berkas resep dokter yang Anda unggah untuk pembelian obat keras.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {prescriptions.data.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto">
                        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#8CA9FF] flex items-center justify-center mx-auto">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Belum Ada Resep Dokter</h3>
                        <p className="text-xs text-slate-500">
                            Berkas resep dokter yang Anda unggah saat checkout akan tersimpan di sini.
                        </p>
                        <Link
                            href="/produk"
                            className="inline-block px-6 py-3 rounded-full bg-[#8CA9FF] text-white text-xs font-bold hover:bg-blue-500 transition shadow"
                        >
                            Jelajahi Katalog Obat
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {prescriptions.data.map((p) => (
                                <div
                                    key={p.id}
                                    className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition space-y-4"
                                >
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <span className="text-xs text-slate-400">
                                            Diunggah:{' '}
                                            {new Date(p.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </span>

                                        <span
                                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold border uppercase ${getStatusBadge(
                                                p.status
                                            )}`}
                                        >
                                            {p.status}
                                        </span>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <a
                                            href={`/storage/${p.file_path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-20 h-20 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#8CA9FF] shrink-0 overflow-hidden"
                                        >
                                            <FileText className="w-8 h-8" />
                                        </a>

                                        <div className="space-y-1 text-xs">
                                            <p className="font-bold text-slate-900">
                                                Dokter: {p.doctor_name || 'Tidak dicantumkan'}
                                            </p>
                                            {p.reviewer && (
                                                <p className="text-[11px] text-slate-500">
                                                    Ditinjau oleh: <strong>{p.reviewer.name} (Apoteker)</strong>
                                                </p>
                                            )}
                                            {p.note && (
                                                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-2 border border-slate-100">
                                                    Catatan: {p.note}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {prescriptions.links.length > 3 && (
                            <div className="pt-6 flex justify-center items-center gap-1">
                                {prescriptions.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveScroll
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
                                            link.active
                                                ? 'bg-[#8CA9FF] text-white border-[#8CA9FF]'
                                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
