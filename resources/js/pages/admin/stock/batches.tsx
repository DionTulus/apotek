import AdminLayout from '@/layouts/admin-layout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Box } from 'lucide-react';

interface Batch {
    id: number;
    batch_no: string;
    expiry_date: string | null;
    qty_in: number;
    qty_remaining: number;
    created_at: string;
}

interface PaginatedBatches {
    data: Batch[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface Props {
    product: { id: number; name: string; sku: string; stock: number };
    batches: PaginatedBatches;
}

export default function StockBatches({ product, batches }: Props) {
    const isExpired = (date: string | null) => date && new Date(date) < new Date();
    const isExpiringSoon = (date: string | null) => {
        if (!date) return false;
        const d = new Date(date);
        const in90 = new Date();
        in90.setDate(in90.getDate() + 90);
        return d >= new Date() && d <= in90;
    };

    const fmt = (d: string | null) =>
        d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

    return (
        <AdminLayout title={`Batch — ${product.name}`}>
            <div className="max-w-4xl mx-auto space-y-5">
                <Link
                    href="/admin/stok"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Stok
                </Link>

                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 rounded-xl">
                        <Box className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{product.name}</h2>
                        <p className="text-xs text-slate-500">SKU: {product.sku} · Stok total: <strong>{product.stock}</strong> — {batches.total} batch</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">No. Batch</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Tanggal Masuk</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Tanggal Kadaluarsa</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Qty Awal</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Sisa Stok</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {batches.data.length === 0 ? (
                                <tr><td colSpan={6} className="py-16 text-center text-slate-400">Belum ada data batch.</td></tr>
                            ) : batches.data.map((b) => (
                                <tr key={b.id} className="hover:bg-slate-50/60">
                                    <td className="px-4 py-3 font-mono font-semibold text-slate-800 text-xs">{b.batch_no}</td>
                                    <td className="px-4 py-3 text-center text-xs text-slate-500">{fmt(b.created_at)}</td>
                                    <td className="px-4 py-3 text-center text-xs">
                                        <span className={isExpired(b.expiry_date) ? 'text-red-600 font-bold' : isExpiringSoon(b.expiry_date) ? 'text-orange-600 font-semibold' : 'text-slate-600'}>
                                            {fmt(b.expiry_date)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-xs font-semibold text-slate-700">{b.qty_in}</td>
                                    <td className="px-4 py-3 text-center text-xs font-bold text-slate-800">{b.qty_remaining}</td>
                                    <td className="px-4 py-3 text-center">
                                        {isExpired(b.expiry_date) ? (
                                            <span className="text-[11px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Kadaluarsa</span>
                                        ) : isExpiringSoon(b.expiry_date) ? (
                                            <span className="text-[11px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Segera Exp.</span>
                                        ) : b.qty_remaining === 0 ? (
                                            <span className="text-[11px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Habis</span>
                                        ) : (
                                            <span className="text-[11px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Aktif</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {batches.links.length > 3 && (
                    <div className="flex gap-1 flex-wrap">
                        {batches.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                    link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
