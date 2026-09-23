import AdminLayout from '@/layouts/admin-layout';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock, Package, Truck } from 'lucide-react';
import { useState } from 'react';

interface PurchaseItem {
    id: number;
    qty: number;
    unit_cost: number;
    subtotal: number;
    batch_no: string | null;
    expiry_date: string | null;
    product: { name: string; sku: string } | null;
}

interface Purchase {
    id: number;
    purchase_number: string;
    purchase_date: string;
    total: number;
    status: string;
    note: string | null;
    supplier: { name: string; contact_person: string | null; phone: string | null } | null;
    creator: { name: string } | null;
    items: PurchaseItem[];
    created_at: string;
}

interface Props {
    purchase: Purchase;
}

const statusInfo: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    draft: { label: 'Draft / Dipesan', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    received: { label: 'Barang Diterima', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800', icon: Package },
};

export default function PurchaseShow({ purchase }: Props) {
    const [confirming, setConfirming] = useState(false);
    const [processing, setProcessing] = useState(false);

    const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
    const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

    const handleReceive = () => {
        setProcessing(true);
        router.post(`/admin/pembelian/${purchase.id}/receive`, {}, {
            onFinish: () => { setProcessing(false); setConfirming(false); },
        });
    };

    const info = statusInfo[purchase.status] ?? statusInfo.draft;
    const StatusIcon = info.icon;
    const isDraft = purchase.status === 'draft';

    return (
        <AdminLayout title={`Detail PO — ${purchase.purchase_number}`}>
            {/* Confirm Modal */}
            {confirming && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 text-center">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Truck className="w-7 h-7 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Konfirmasi Penerimaan Barang</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Tindakan ini akan menambah stok semua produk dalam PO ini, membuat batch baru, dan mencatat pengeluaran keuangan sebesar <strong>{fmt(purchase.total)}</strong>.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setConfirming(false)} className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200">
                                Batal
                            </button>
                            <button onClick={handleReceive} disabled={processing} className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60">
                                {processing ? 'Memproses...' : 'Ya, Terima Barang'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link href="/admin/pembelian" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800">
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar PO
                    </Link>
                    {isDraft && (
                        <button
                            onClick={() => setConfirming(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl transition"
                            id="btn-receive-po"
                        >
                            <Truck className="w-4 h-4" /> Terima Barang
                        </button>
                    )}
                </div>

                {/* Header Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Purchase Order</p>
                            <h2 className="text-2xl font-extrabold text-slate-800 mt-0.5">{purchase.purchase_number}</h2>
                            <p className="text-sm text-slate-500 mt-1">Dibuat oleh <strong>{purchase.creator?.name ?? '-'}</strong> · {fmtDate(purchase.created_at)}</p>
                        </div>
                        <span className={`inline-flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-full ${info.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {info.label}
                        </span>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                        <div>
                            <p className="text-xs text-slate-500 font-semibold mb-1">Supplier</p>
                            <p className="text-sm font-bold text-slate-800">{purchase.supplier?.name ?? '-'}</p>
                            {purchase.supplier?.contact_person && <p className="text-xs text-slate-500">{purchase.supplier.contact_person}</p>}
                            {purchase.supplier?.phone && <p className="text-xs text-slate-500">{purchase.supplier.phone}</p>}
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold mb-1">Tanggal Pembelian</p>
                            <p className="text-sm font-bold text-slate-800">{fmtDate(purchase.purchase_date)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold mb-1">Catatan</p>
                            <p className="text-sm text-slate-600">{purchase.note ?? '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-700">Daftar Item ({purchase.items.length} produk)</p>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Produk</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Qty</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Harga Beli</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Subtotal</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">No. Batch</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Kadaluarsa</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {purchase.items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/60">
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-slate-800 text-xs">{item.product?.name ?? '-'}</p>
                                        <p className="text-[11px] font-mono text-slate-400">{item.product?.sku}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold text-slate-700">{item.qty}</td>
                                    <td className="px-4 py-3 text-right text-xs text-slate-600">{fmt(item.unit_cost)}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{fmt(item.subtotal)}</td>
                                    <td className="px-4 py-3 text-center text-xs font-mono text-slate-600">{item.batch_no ?? '-'}</td>
                                    <td className="px-4 py-3 text-center text-xs text-slate-600">{fmtDate(item.expiry_date)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-200">
                            <tr>
                                <td colSpan={3} className="px-4 py-4 text-right text-sm font-bold text-slate-700">Total PO</td>
                                <td className="px-4 py-4 text-right text-lg font-extrabold text-slate-900">{fmt(purchase.total)}</td>
                                <td colSpan={2} />
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
