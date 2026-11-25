import AdminLayout from '@/layouts/admin-layout';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface CriticalStockProduct {
    id: number;
    name: string;
    sku: string;
    stock: number;
    min_stock: number;
    unit: string;
    cost_price: number;
}

interface Props {
    suppliers: Supplier[];
    products: ProductOption[];
    criticalStockProducts: CriticalStockProduct[];
}

interface POItem {
    product_id: string;
    qty: string;
    unit_cost: string;
    batch_no: string;
    expiry_date: string;
}

export default function PurchaseCreate({ suppliers, products, criticalStockProducts }: Props) {
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

    const addCriticalStockProduct = (product: CriticalStockProduct) => {
        const productId = String(product.id);
        const existingIndex = items.findIndex((item) => item.product_id === productId);

        if (existingIndex !== -1) {
            const existingQty = Number.parseInt(items[existingIndex].qty, 10) || 0;
            updateItem(existingIndex, 'qty', String(existingQty + 1));
            return;
        }

        const emptyIndex = items.findIndex((item) => !item.product_id);
        if (emptyIndex !== -1) {
            updateItem(emptyIndex, 'product_id', productId);
            return;
        }

        const next = [
            ...items,
            {
                product_id: productId,
                qty: '1',
                unit_cost: String(product.cost_price),
                batch_no: '',
                expiry_date: '',
            },
        ];
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

    const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300';

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
                                <Select
                                    value={form.data.supplier_id}
                                    onValueChange={(value) => form.setData('supplier_id', value)}
                                >
                                    <SelectTrigger id="select-supplier" className={`${inputCls} bg-white text-slate-800`}>
                                        <SelectValue placeholder="Pilih supplier..." />
                                    </SelectTrigger>
                                    <SelectContent className="border-slate-200 bg-white text-slate-800">
                                        {suppliers.map((supplier) => (
                                            <SelectItem
                                                key={supplier.id}
                                                value={String(supplier.id)}
                                                className="focus:bg-emerald-100 focus:text-emerald-950"
                                            >
                                                {supplier.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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

                    {criticalStockProducts.length > 0 && (
                        <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm">
                            <div className="mb-4">
                                <h2 className="text-sm font-bold text-slate-800">Produk Stok Kritis</h2>
                                <p className="mt-1 text-xs text-slate-600">
                                    Tambahkan produk yang stoknya perlu segera diisi ke Purchase Order.
                                </p>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {criticalStockProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white p-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold text-slate-800">{product.name}</p>
                                            <p className="text-[10px] text-slate-500">
                                                SKU: {product.sku} · Stok: {product.stock} {product.unit} (min. {product.min_stock})
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => addCriticalStockProduct(product)}
                                            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-2 text-[11px] font-semibold text-white transition hover:bg-emerald-800"
                                            aria-label={`Tambahkan ${product.name} ke Purchase Order`}
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Tambahkan
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Items */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-bold text-slate-700">Item Produk</p>
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
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
                                            <Select
                                                value={item.product_id}
                                                onValueChange={(value) => updateItem(idx, 'product_id', value)}
                                            >
                                                <SelectTrigger className={`${inputCls} bg-white text-slate-800`}>
                                                    <SelectValue placeholder="Pilih produk..." />
                                                </SelectTrigger>
                                                <SelectContent className="border-slate-200 bg-white text-slate-800">
                                                    {products.map((product) => (
                                                        <SelectItem
                                                            key={product.id}
                                                            value={String(product.id)}
                                                            className="focus:bg-emerald-100 focus:text-emerald-950"
                                                        >
                                                            {product.name} ({product.sku})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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
                            className="px-6 py-2.5 bg-emerald-700 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-60"
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
