import AdminLayout from '@/layouts/admin-layout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, TrendingDown, TrendingUp } from 'lucide-react';

interface Movement {
    id: number;
    type: string;
    qty: number;
    stock_after: number;
    note: string | null;
    reference_type: string | null;
    created_at: string;
    creator: { name: string } | null;
}

interface PaginatedMovements {
    data: Movement[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface Props {
    product: { id: number; name: string; sku: string; stock: number };
    movements: PaginatedMovements;
}

const typeLabel: Record<string, { label: string; color: string }> = {
    purchase:       { label: 'Pembelian', color: 'bg-blue-50 text-blue-700' },
    sale:           { label: 'Penjualan', color: 'bg-indigo-50 text-indigo-700' },
    return:         { label: 'Retur', color: 'bg-yellow-50 text-yellow-700' },
    adjustment:     { label: 'Penyesuaian', color: 'bg-purple-50 text-purple-700' },
    cancel_restore: { label: 'Batal Order', color: 'bg-orange-50 text-orange-700' },
    expired_writeoff:{ label: 'Hapus Buku', color: 'bg-red-50 text-red-700' },
};

export default function StockMovements({ product, movements }: Props) {
    const fmt = (d: string) => new Date(d).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    return (
        <AdminLayout title={`Histori Stok — ${product.name}`}>
            <div className="max-w-4xl mx-auto space-y-5">
                <Link href="/admin/stok" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800">
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Stok
                </Link>

                <div>
                    <h2 className="text-xl font-bold text-slate-800">Histori Pergerakan Stok</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{product.name} · {product.sku} · Stok saat ini: <strong>{product.stock}</strong></p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
                    <table className="w-full text-sm min-w-[700px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Waktu</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Tipe</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Qty</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Stok Setelah</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Catatan</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Oleh</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {movements.data.length === 0 ? (
                                <tr><td colSpan={6} className="py-16 text-center text-slate-400">Belum ada histori pergerakan stok.</td></tr>
                            ) : movements.data.map((m) => {
                                const isIn = m.qty > 0;
                                const info = typeLabel[m.type] ?? { label: m.type, color: 'bg-slate-100 text-slate-600' };
                                return (
                                    <tr key={m.id} className="hover:bg-slate-50/60">
                                        <td className="px-4 py-3 text-xs text-slate-500">{fmt(m.created_at)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${info.color}`}>
                                                {info.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 font-bold text-sm ${isIn ? 'text-green-600' : 'text-red-600'}`}>
                                                {isIn ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                                {isIn ? '+' : ''}{m.qty}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-slate-800">{m.stock_after}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">{m.note ?? '-'}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500">{m.creator?.name ?? 'Sistem'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {movements.links.length > 3 && (
                    <div className="flex gap-1 flex-wrap">
                        {movements.links.map((link, i) => (
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
