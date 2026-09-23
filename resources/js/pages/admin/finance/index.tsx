import AdminLayout from '@/layouts/admin-layout';
import { Link, router, useForm } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Calendar,
    DollarSign,
    Download,
    Filter,
    Plus,
    Search,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

interface FinancialTransactionItem {
    id: number;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    transaction_date: string;
    description: string;
    reference_type?: string;
    reference_id?: number;
    creator?: {
        name: string;
    };
}

interface Props {
    summary: {
        total_income: number;
        total_expense: number;
        net_profit: number;
    };
    transactions: {
        data: FinancialTransactionItem[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    categories: { value: string; label: string }[];
    types: { value: string; label: string }[];
    filters: {
        start_date: string;
        end_date: string;
        type: string;
        category: string;
        search: string;
    };
}

export default function FinanceIndex({
    summary,
    transactions,
    categories,
    types,
    filters,
}: Props) {
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [type, setType] = useState(filters.type);
    const [category, setCategory] = useState(filters.category);
    const [search, setSearch] = useState(filters.search);

    const expenseForm = useForm({
        category: 'operational',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        description: '',
    });

    const formatRp = (val: number) => `Rp ${Number(val).toLocaleString('id-ID')}`;

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/keuangan',
            { start_date: startDate, end_date: endDate, type, category, search },
            { preserveState: true }
        );
    };

    const submitExpense = (e: React.FormEvent) => {
        e.preventDefault();
        expenseForm.post('/admin/keuangan/pengeluaran', {
            onSuccess: () => {
                setIsExpenseModalOpen(false);
                expenseForm.reset();
            },
        });
    };

    const getExportUrl = () => {
        const params = new URLSearchParams({
            start_date: startDate,
            end_date: endDate,
            type: type || '',
            category: category || '',
            search: search || '',
        });
        return `/admin/keuangan/export?${params.toString()}`;
    };

    return (
        <AdminLayout title="Laporan Keuangan & Laba Rugi">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Jurnal & Laporan Keuangan</h1>
                        <p className="text-xs text-slate-500">
                            Pencatatan mutasi kas pemasukan penjualan, pengeluaran pembelian & operasional apotek.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={getExportUrl()}
                            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                        >
                            <Download className="w-4 h-4 text-slate-500" /> Export CSV
                        </a>
                        <button
                            onClick={() => setIsExpenseModalOpen(true)}
                            className="px-3.5 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                            <Plus className="w-4 h-4" /> Catat Pengeluaran
                        </button>
                    </div>
                </div>

                {/* 3 Summary Cards: Income, Expense, Net Profit */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Income */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500">Total Pemasukan (Income)</span>
                            <p className="text-xl font-extrabold text-emerald-600 mt-1">
                                {formatRp(summary.total_income)}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Penjualan produk & kas masuk</p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Expense */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500">Total Pengeluaran (Expense)</span>
                            <p className="text-xl font-extrabold text-rose-600 mt-1">
                                {formatRp(summary.total_expense)}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Pembelian stok, operasional & refund</p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Net Profit */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500">Laba Bersih (Net Profit)</span>
                            <p
                                className={`text-xl font-extrabold mt-1 ${
                                    summary.net_profit >= 0 ? 'text-[#6587e6]' : 'text-rose-700'
                                }`}
                            >
                                {formatRp(summary.net_profit)}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Pemasukan dikurangi Pengeluaran</p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#8CA9FF] flex items-center justify-center">
                            <Wallet className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Dari Tanggal</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tipe Mutasi</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                            >
                                <option value="">Semua Tipe</option>
                                <option value="income">Pemasukan (Income)</option>
                                <option value="expense">Pengeluaran (Expense)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Kategori</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Cari Keterangan</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Gaji / Listrik / Order..."
                                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full py-1.5 bg-[#8CA9FF] hover:bg-[#7292eb] text-white text-xs font-bold rounded-lg transition"
                            >
                                Terapkan Filter
                            </button>
                        </div>
                    </form>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">Tanggal</th>
                                    <th className="px-4 py-3">Tipe</th>
                                    <th className="px-4 py-3">Kategori</th>
                                    <th className="px-4 py-3">Keterangan</th>
                                    <th className="px-4 py-3">Dicatat Oleh</th>
                                    <th className="px-4 py-3 text-right">Nominal (Rp)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.data.length > 0 ? (
                                    transactions.data.map((item) => {
                                        const isIncome = item.type === 'income';
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/80 transition">
                                                <td className="px-4 py-3 text-slate-600 font-mono">
                                                    {item.transaction_date}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                                                            isIncome
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-rose-100 text-rose-800'
                                                        }`}
                                                    >
                                                        {isIncome ? (
                                                            <ArrowUpRight className="w-3 h-3" />
                                                        ) : (
                                                            <ArrowDownRight className="w-3 h-3" />
                                                        )}
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-slate-800">
                                                    {item.description}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">
                                                    {item.creator?.name || 'Sistem'}
                                                </td>
                                                <td
                                                    className={`px-4 py-3 text-right font-extrabold ${
                                                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                                                    }`}
                                                >
                                                    {isIncome ? '+' : '-'} {formatRp(item.amount)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                            Tidak ada transaksi keuangan pada periode ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transactions.links && transactions.links.length > 3 && (
                        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
                            <p className="text-slate-500">Total {transactions.total} Mutasi Jurnal</p>
                            <div className="flex gap-1">
                                {transactions.links.map((link, idx) => (
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

                {/* Modal Record Expense */}
                {isExpenseModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-2 text-rose-600">
                                <DollarSign className="w-5 h-5" />
                                <h3 className="text-base font-bold text-slate-800">Catat Pengeluaran Apotek</h3>
                            </div>
                            <form onSubmit={submitExpense} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Kategori Pengeluaran</label>
                                    <select
                                        value={expenseForm.data.category}
                                        onChange={(e) => expenseForm.setData('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    >
                                        <option value="operational">Operasional (Listrik, Sewa, Plastik, dll)</option>
                                        <option value="salary">Gaji Karyawan / Apoteker</option>
                                        <option value="purchase">Pembelian Alat / Inventori Tambahan</option>
                                        <option value="other">Pengeluaran Lainnya</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Nominal (Rp)</label>
                                    <input
                                        type="number"
                                        value={expenseForm.data.amount}
                                        onChange={(e) => expenseForm.setData('amount', e.target.value)}
                                        placeholder="Contoh: 1500000"
                                        min="1000"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Tanggal Transaksi</label>
                                    <input
                                        type="date"
                                        value={expenseForm.data.transaction_date}
                                        onChange={(e) => expenseForm.setData('transaction_date', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Keterangan Lengkap</label>
                                    <textarea
                                        value={expenseForm.data.description}
                                        onChange={(e) => expenseForm.setData('description', e.target.value)}
                                        placeholder="Contoh: Pembayaran tagihan listrik PLN bulan Mei 2026"
                                        rows={3}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsExpenseModalOpen(false)}
                                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition font-semibold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={expenseForm.processing}
                                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition font-bold"
                                    >
                                        {expenseForm.processing ? 'Menyimpan...' : 'Simpan Pengeluaran'}
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
