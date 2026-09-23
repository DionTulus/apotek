import AdminLayout from '@/layouts/admin-layout';
import { Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    DollarSign,
    Eye,
    Package,
    RefreshCw,
    Search,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface OrderReturn {
    id: number;
    order_id: number;
    user_id: number;
    order_item_id: number;
    reason: string;
    type: 'refund' | 'replacement';
    status: 'requested' | 'approved' | 'rejected' | 'completed';
    qty: number;
    proof_image?: string;
    admin_note?: string;
    created_at: string;
    resolved_at?: string;
    user?: {
        name: string;
        email: string;
        phone?: string;
    };
    order?: {
        id: number;
        order_number: string;
    };
    order_item?: {
        id: number;
        price: number;
        product?: {
            id: number;
            name: string;
            sku: string;
            stock: number;
        };
    };
}

interface Props {
    returns: {
        data: OrderReturn[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    statusList: { value: string; label: string }[];
    filters: {
        status?: string;
    };
}

export default function ReturnsIndex({ returns, statusList, filters }: Props) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [actionModal, setActionModal] = useState<{
        type: 'approve' | 'reject';
        item: OrderReturn;
    } | null>(null);

    const actionForm = useForm({
        admin_note: '',
    });

    const handleFilterStatus = (status: string) => {
        router.get('/admin/retur', { status }, { preserveState: true });
    };

    const submitAction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!actionModal) return;

        const url = `/admin/retur/${actionModal.item.id}/${actionModal.type}`;
        actionForm.post(url, {
            onSuccess: () => {
                setActionModal(null);
                actionForm.reset();
            },
        });
    };

    return (
        <AdminLayout title="Manajemen Retur & Pengembalian Dana">
            <div className="space-y-6">
                {/* Header & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Pengajuan Retur & Refund</h1>
                        <p className="text-xs text-slate-500">
                            Persetujuan retur obat secara otomatis mengembalikan stok ke inventori dan mencatat refund di jurnal keuangan.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleFilterStatus('')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                !filters.status
                                    ? 'bg-[#8CA9FF] text-white shadow-xs'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Menunggu Review
                        </button>
                        {statusList.map((st) => (
                            <button
                                key={st.value}
                                onClick={() => handleFilterStatus(st.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                                    filters.status === st.value
                                        ? 'bg-[#8CA9FF] text-white shadow-xs'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {st.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Returns Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">No. Order / Tanggal</th>
                                    <th className="px-4 py-3">Pelanggan</th>
                                    <th className="px-4 py-3">Produk Retur</th>
                                    <th className="px-4 py-3">Tipe & Alasan</th>
                                    <th className="px-4 py-3">Bukti Foto</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {returns.data.length > 0 ? (
                                    returns.data.map((ret) => {
                                        const isRefund = ret.type === 'refund';
                                        const refundNominal =
                                            (ret.order_item?.price || 0) * ret.qty;

                                        return (
                                            <tr key={ret.id} className="hover:bg-slate-50/80 transition">
                                                <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                                                    {ret.order ? (
                                                        <Link
                                                            href={`/admin/pesanan/${ret.order.id}`}
                                                            className="text-[#6587e6] hover:underline"
                                                        >
                                                            #{ret.order.order_number}
                                                        </Link>
                                                    ) : (
                                                        '-'
                                                    )}
                                                    <p className="text-[10px] text-slate-400 font-normal">
                                                        {new Date(ret.created_at).toLocaleDateString('id-ID')}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <p className="font-semibold text-slate-800">
                                                        {ret.user?.name || 'Customer'}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400">
                                                        {ret.user?.phone || ret.user?.email || '-'}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <p className="font-semibold text-slate-800">
                                                        {ret.order_item?.product?.name || 'Produk'}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500">
                                                        Qty: <span className="font-bold">{ret.qty} pcs</span> &bull; Rp{' '}
                                                        {Number(refundNominal).toLocaleString('id-ID')}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3.5 max-w-[220px]">
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block mb-1 ${
                                                            isRefund
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                        }`}
                                                    >
                                                        {ret.type}
                                                    </span>
                                                    <p className="text-slate-600 line-clamp-2">"{ret.reason}"</p>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    {ret.proof_image ? (
                                                        <button
                                                            onClick={() => setSelectedImage(ret.proof_image || null)}
                                                            className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative group block"
                                                        >
                                                            <img
                                                                src={ret.proof_image}
                                                                alt="Bukti"
                                                                className="w-full h-full object-cover group-hover:scale-110 transition"
                                                            />
                                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white">
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </div>
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-400 italic">Tanpa Foto</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span
                                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                            ret.status === 'approved'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : ret.status === 'rejected'
                                                                ? 'bg-rose-100 text-rose-800'
                                                                : 'bg-amber-100 text-amber-800'
                                                        }`}
                                                    >
                                                        {ret.status}
                                                    </span>
                                                    {ret.admin_note && (
                                                        <p className="text-[10px] text-slate-500 italic mt-0.5">
                                                            Note: {ret.admin_note}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5 text-right space-x-2">
                                                    {ret.status === 'requested' ? (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    setActionModal({ type: 'approve', item: ret })
                                                                }
                                                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition inline-flex items-center gap-1"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Setujui
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    setActionModal({ type: 'reject', item: ret })
                                                                }
                                                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[11px] font-bold transition inline-flex items-center gap-1"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" /> Tolak
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-400 text-[11px] italic">
                                                            Selesai diproses
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                            Tidak ada data pengajuan retur.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {returns.links && returns.links.length > 3 && (
                        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
                            <p className="text-slate-500">Total {returns.total} Pengajuan</p>
                            <div className="flex gap-1">
                                {returns.links.map((link, idx) => (
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

                {/* Modal View Large Image */}
                {selectedImage && (
                    <div
                        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-xl overflow-hidden p-2">
                            <img
                                src={selectedImage}
                                alt="Bukti Retur"
                                className="max-h-[80vh] w-auto object-contain mx-auto"
                            />
                        </div>
                    </div>
                )}

                {/* Modal Approve / Reject */}
                {actionModal && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                            <div
                                className={`flex items-center gap-2 ${
                                    actionModal.type === 'approve' ? 'text-emerald-600' : 'text-rose-600'
                                }`}
                            >
                                {actionModal.type === 'approve' ? (
                                    <CheckCircle2 className="w-5 h-5" />
                                ) : (
                                    <AlertCircle className="w-5 h-5" />
                                )}
                                <h3 className="text-base font-bold text-slate-800">
                                    {actionModal.type === 'approve'
                                        ? 'Setujui Pengajuan Retur'
                                        : 'Tolak Pengajuan Retur'}
                                </h3>
                            </div>

                            <p className="text-xs text-slate-600">
                                {actionModal.type === 'approve'
                                    ? `Menyetujui retur akan mengembalikan stok produk (${actionModal.item.qty} pcs) kembali ke inventori${
                                          actionModal.item.type === 'refund'
                                              ? ' dan mencatat transaksi pengeluaran refund pada laporan keuangan.'
                                              : '.'
                                      }`
                                    : 'Masukkan alasan penolakan retur agar pembeli mendapatkan penjelasan.'}
                            </p>

                            <form onSubmit={submitAction} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Catatan Admin {actionModal.type === 'reject' ? '(Wajib)' : '(Opsional)'}
                                    </label>
                                    <textarea
                                        value={actionForm.data.admin_note}
                                        onChange={(e) => actionForm.setData('admin_note', e.target.value)}
                                        placeholder={
                                            actionModal.type === 'approve'
                                                ? 'Contoh: Barang retur telah diterima di gudang...'
                                                : 'Contoh: Kerusakan bukan akibat kesalahan pengiriman / segel obat terbuka...'
                                        }
                                        rows={3}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required={actionModal.type === 'reject'}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setActionModal(null)}
                                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition font-semibold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionForm.processing}
                                        className={`px-4 py-2 text-white rounded-lg transition font-bold ${
                                            actionModal.type === 'approve'
                                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                                : 'bg-rose-600 hover:bg-rose-700'
                                        }`}
                                    >
                                        {actionForm.processing
                                            ? 'Memproses...'
                                            : actionModal.type === 'approve'
                                            ? 'Ya, Setujui & Kembalikan Stok'
                                            : 'Tolak Pengajuan'}
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
