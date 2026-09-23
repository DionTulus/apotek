import AdminLayout from '@/layouts/admin-layout';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface Supplier {
    id: number;
    name: string;
}

interface ProductOption {
    id: number;
    name: string;
    sku: string;
    cost_price: number;
    unit: string;
}

interface Props {
    suppliers: Supplier[];
    products: ProductOption[];
}

interface POItem {
    product_id: string;
    qty: string;
    unit_cost: string;
    batch_no: string;
    expiry_date: string;
}

export default function PurchaseCreate({ suppliers, products }: Props) {
    const [items, setItems] = useState<POItem[]>([
        { product_id: '', qty: '1', unit_cost: '', batch_no: '', expiry_date: '' },
    ]);

    const form = useForm<{
        supplier_id: string;
        purchase_date: string;
        note: string;
        items: POItem[];
    }>({
        supplier_id: '',
        purchase_date: new Date().toISOString().split('T')[0],
        note: '',
        items,
    });

    const addItem = () => {
        const next = [...items, { product_id: '', qty: '1', unit_cost: '', batch_no: '', expiry_date: '' }];
        setItems(next);
        form.setData('items', next);
    };

    const removeItem = (idx: number) => {
        const next = items.filter((_, i) => i !== idx);
        setItems(next);
        form.setData('items', next);
    };

    const updateItem = (idx: number, field: keyof POItem, value: string) => {
        const next = items.map((item, i) => {
            if (i !== idx) return item;
            const updated = { ...item, [field]: value };
            if (field === 'product_id') {
                const prod = products.find((p) => String(p.id) === value);
                if (prod) updated.unit_cost = String(prod.cost_price);
            }
            return updated;
        });
        setItems(next);
        form.setData('items', next);
    };

    const total = items.reduce((sum, item) => {
        const qty = parseInt(item.qty) || 0;
        const cost = parseInt(item.unit_cost) || 0;
        return sum + qty * cost;
    }, 0);

    const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/pembelian');
    };

    const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300';

    return (
        <AdminLayout title="Buat Purchase Order">
            <div className="max-w-5xl mx-auto space-y-6">
                <Link href="/admin/pembelian" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800">
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar PO
                </Link>

                <form onSubmit={submit} className="space-y-6">
                    {/* Header Info */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <p className="text-sm font-bold text-slate-700 mb-4">Informasi Purchase Order</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Supplier *</label>
                                <select
                                    value={form.data.supplier_id}
                                    onChange={(e) => form.setData('supplier_id', e.target.value)}
                                    className={inputCls}
                                    id="select-supplier"
                                >
                                    <option value="">Pilih supplier...</option>
                                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                {form.errors.supplier_id && <p className="text-xs text-red-500 mt-1">{form.errors.supplier_id}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Tanggal Pembelian *</label>
                                <input
                                    type="date"
                                    value={form.data.purchase_date}
                                    onChange={(e) => form.setData('purchase_date', e.target.value)}
                                    className={inputCls}
                                />
                                {form.errors.purchase_date && <p className="text-xs text-red-500 mt-1">{form.errors.purchase_date}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Catatan</label>
                                <input
                                    type="text"
                                    value={form.data.note}
                                    onChange={(e) => form.setData('note', e.target.value)}
                                    placeholder="Catatan opsional..."
                                    className={inputCls}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-bold text-slate-700">Item Produk</p>
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                id="btn-add-item"
                            >
                                <Plus className="w-3.5 h-3.5" /> Tambah Baris
                            </button>
                        </div>

                        {form.errors.items && (
                            <p className="text-xs text-red-500 mb-3">{form.errors.items}</p>
                        )}

                        <div className="space-y-3">
                            {items.map((item, idx) => {
                                const subtotal = (parseInt(item.qty) || 0) * (parseInt(item.unit_cost) || 0);
                                const selectedProduct = products.find((p) => String(p.id) === item.product_id);
                                return (
                                    <div key={idx} className="grid grid-cols-12 gap-3 items-start p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                                        {/* Product */}
                                        <div className="col-span-4">
                                            {idx === 0 && <label className="text-xs font-semibold text-slate-500 mb-1 block">Produk *</label>}
                                            <select
                                                value={item.product_id}
                                                onChange={(e) => updateItem(idx, 'product_id', e.target.value)}
                                                className={inputCls}
                                            >
                                                <option value="">Pilih produk...</option>
                                                {products.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* Qty */}
                                        <div className="col-span-1">
                                            {idx === 0 && <label className="text-xs font-semibold text-slate-500 mb-1 block">Qty</label>}
                                            <input
                                                type="number"
                                                min={1}
                                                value={item.qty}
                                                onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                                                className={inputCls}
                                            />
                                        </div>
                                        {/* Unit Cost */}
                                        <div className="col-span-2">
                                            {idx === 0 && <label className="text-xs font-semibold text-slate-500 mb-1 block">Harga Beli</label>}
                                            <input
                                                type="number"
                                                min={0}
                                                value={item.unit_cost}
                                                onChange={(e) => updateItem(idx, 'unit_cost', e.target.value)}
                                                className={inputCls}
                                            />
                                        </div>
                                        {/* Batch No */}
                                        <div className="col-span-2">
                                            {idx === 0 && <label className="text-xs font-semibold text-slate-500 mb-1 block">No. Batch</label>}
                                            <input
                                                type="text"
                                                value={item.batch_no}
                                                onChange={(e) => updateItem(idx, 'batch_no', e.target.value)}
                                                placeholder="Opsional"
                                                className={inputCls}
                                            />
                                        </div>
                                        {/* Expiry */}
                                        <div className="col-span-2">
                                            {idx === 0 && <label className="text-xs font-semibold text-slate-500 mb-1 block">Kadaluarsa</label>}
                                            <input
                                                type="date"
                                                value={item.expiry_date}
                                                onChange={(e) => updateItem(idx, 'expiry_date', e.target.value)}
                                                className={inputCls}
                                            />
                                        </div>
                                        {/* Subtotal + Remove */}
                                        <div className="col-span-1 flex flex-col items-end justify-end gap-1">
                                            {idx === 0 && <label className="text-xs font-semibold text-slate-500 mb-1 block w-full text-right">Subtotal</label>}
                                            <p className="text-xs font-bold text-slate-700 text-right">{fmt(subtotal)}</p>
                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(idx)}
                                                    className="p-1 rounded-lg hover:bg-red-50 text-red-500"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Total */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                            <div className="text-right">
                                <p className="text-xs text-slate-500">Total PO</p>
                                <p className="text-xl font-bold text-slate-800">{fmt(total)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Link href="/admin/pembelian" className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200">
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60"
                            id="btn-submit-po"
                        >
                            {form.processing ? 'Menyimpan...' : 'Simpan Purchase Order'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
