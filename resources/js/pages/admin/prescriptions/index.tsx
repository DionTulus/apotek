import AdminLayout from '@/layouts/admin-layout';
import { Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Eye,
    FileCheck,
    Filter,
    Package,
    Search,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface PrescriptionItem {
    id: number;
    prescription_number: string;
    doctor_name?: string;
    patient_name?: string;
    image_url: string;
    status: 'pending' | 'approved' | 'rejected';
    note?: string;
    created_at: string;
    user?: {
        name: string;
        email: string;
        phone?: string;
    };
    order?: {
        id: number;
        order_number: string;
        grand_total: number;
        items?: {
            id: number;
            qty: number;
            product?: {
                name: string;
                sku: string;
            };
        }[];
    };
}

interface Props {
    prescriptions: {
        data: PrescriptionItem[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: {
        status?: string;
    };
}

export default function PrescriptionsIndex({ prescriptions, filters }: Props) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [rejectingItem, setRejectingItem] = useState<PrescriptionItem | null>(null);

    const rejectForm = useForm({
        note: '',
    });

    const handleFilterStatus = (status: string) => {
        router.get('/admin/resep', { status }, { preserveState: true });
    };

    const handleApprove = (prescription: PrescriptionItem) => {
        if (confirm(`Setujui resep dokter #${prescription.prescription_number}? Pesanan akan otomatis dilanjutkan.`)) {
            router.post(`/admin/resep/${prescription.id}/approve`);
        }
    };

    const submitReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectingItem) return;

        rejectForm.post(`/admin/resep/${rejectingItem.id}/reject`, {
            onSuccess: () => {
                setRejectingItem(null);
                rejectForm.reset();
            },
        });
    };

    return (
        <AdminLayout title="Verifikasi Resep Dokter">
            <div className="space-y-6">
                {/* Header & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Verifikasi Resep Dokter</h1>
                        <p className="text-xs text-slate-500">
                            Validasi keaslian resep dokter sebelum obat resep dapat diproses dan dikirim ke pelanggan.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {['pending', 'approved', 'rejected'].map((st) => {
                            const isActive = (filters.status || 'pending') === st;
                            return (
                                <button
                                    key={st}
                                    onClick={() => handleFilterStatus(st)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                                        isActive
                                            ? 'bg-[#8CA9FF] text-white shadow-xs'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {st === 'pending' ? 'Menunggu Review' : st === 'approved' ? 'Disetujui' : 'Ditolak'}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Prescriptions List Grid */}
                {prescriptions.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {prescriptions.data.map((rx) => (
                            <div
                                key={rx.id}
                                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                            >
                                <div>
                                    {/* Prescription Image Preview Header */}
                                    <div className="relative h-48 bg-slate-100 group overflow-hidden">
                                        <img
                                            src={rx.image_url}
                                            alt={`Resep ${rx.prescription_number}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                        />
                                        <button
                                            onClick={() => setSelectedImage(rx.image_url)}
                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white gap-2 transition text-xs font-bold"
                                        >
                                            <Eye className="w-5 h-5" /> Perbesar Foto
                                        </button>
                                        <span
                                            className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                rx.status === 'approved'
                                                    ? 'bg-emerald-500 text-white'
                                                    : rx.status === 'rejected'
                                                    ? 'bg-rose-500 text-white'
                                                    : 'bg-amber-500 text-white'
                                            }`}
                                        >
                                            {rx.status}
                                        </span>
                                    </div>

                                    {/* Info Body */}
                                    <div className="p-4 space-y-3 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-slate-500 font-semibold">
                                                #{rx.prescription_number}
                                            </span>
                                            <span className="text-slate-400">
                                                {new Date(rx.created_at).toLocaleDateString('id-ID')}
                                            </span>
                                        </div>

                                        <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                            <p className="text-slate-700">
                                                <span className="font-semibold text-slate-800">Pasien:</span>{' '}
                                                {rx.patient_name || rx.user?.name || '-'}
                                            </p>
                                            <p className="text-slate-700">
                                                <span className="font-semibold text-slate-800">Dokter:</span>{' '}
                                                {rx.doctor_name || 'Tidak tercantum'}
                                            </p>
                                            <p className="text-slate-700">
                                                <span className="font-semibold text-slate-800">User:</span>{' '}
                                                {rx.user?.name} ({rx.user?.phone || rx.user?.email})
                                            </p>
                                        </div>

                                        {rx.order && (
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-slate-700">
                                                    <span className="font-semibold">Order Terkait:</span>
                                                    <Link
                                                        href={`/admin/pesanan/${rx.order.id}`}
                                                        className="text-[#6587e6] hover:underline font-mono font-bold"
                                                    >
                                                        #{rx.order.order_number}
                                                    </Link>
                                                </div>
                                                <div className="text-[11px] text-slate-500 line-clamp-2">
                                                    Obat:{' '}
                                                    {rx.order.items?.map((i) => i.product?.name).filter(Boolean).join(', ') || '-'}
                                                </div>
                                            </div>
                                        )}

                                        {rx.note && (
                                            <p className="text-[11px] text-slate-600 bg-amber-50 p-2 rounded border border-amber-200">
                                                <span className="font-semibold">Catatan:</span> {rx.note}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {rx.status === 'pending' && (
                                    <div className="p-4 pt-0 flex items-center gap-2">
                                        <button
                                            onClick={() => handleApprove(rx)}
                                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Setujui
                                        </button>
                                        <button
                                            onClick={() => setRejectingItem(rx)}
                                            className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                                        >
                                            <XCircle className="w-4 h-4" /> Tolak
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
                        <FileCheck className="w-12 h-12 text-slate-300 mx-auto" />
                        <h3 className="text-sm font-bold text-slate-700">Tidak Ada Resep Ditemukan</h3>
                        <p className="text-xs text-slate-500">
                            Tidak ada antrian resep dokter untuk filter status ini.
                        </p>
                    </div>
                )}

                {/* Modal View Large Image */}
                {selectedImage && (
                    <div
                        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-xl overflow-hidden p-2">
                            <img
                                src={selectedImage}
                                alt="Resep Full View"
                                className="max-h-[85vh] w-auto object-contain mx-auto"
                            />
                        </div>
                    </div>
                )}

                {/* Modal Reject Prescription */}
                {rejectingItem && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-2 text-rose-600">
                                <AlertCircle className="w-5 h-5" />
                                <h3 className="text-base font-bold text-slate-800">
                                    Tolak Resep #{rejectingItem.prescription_number}
                                </h3>
                            </div>
                            <p className="text-xs text-slate-600">
                                Menolak resep ini akan otomatis membatalkan pesanan terkait (#{rejectingItem.order?.order_number}) dan mengembalikan stok produk yang telah direservasi.
                            </p>
                            <form onSubmit={submitReject} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Alasan Penolakan (Wajib)
                                    </label>
                                    <textarea
                                        value={rejectForm.data.note}
                                        onChange={(e) => rejectForm.setData('note', e.target.value)}
                                        placeholder="Contoh: Resep tidak terbaca jelas / Masa berlaku resep sudah kadaluarsa..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setRejectingItem(null)}
                                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition font-semibold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={rejectForm.processing}
                                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition font-bold"
                                    >
                                        {rejectForm.processing ? 'Menolak...' : 'Tolak & Batalkan Order'}
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
