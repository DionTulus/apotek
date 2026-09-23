import AdminLayout from '@/layouts/admin-layout';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Image as ImageIcon, Save } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface Product {
    id: number;
    name: string;
    sku: string;
    category_id: number;
    description: string | null;
    composition: string | null;
    dosage: string | null;
    manufacturer: string | null;
    drug_class: string;
    requires_prescription: boolean;
    unit: string;
    price: number;
    cost_price: number;
    stock: number;
    min_stock: number;
    weight_gram: number;
    is_active: boolean;
    is_featured: boolean;
    image: string | null;
}

interface Props {
    product: Product | null;
    categories: { id: number; name: string }[];
    drugClasses: { value: string; label: string }[];
}

export default function ProductForm({ product, categories, drugClasses }: Props) {
    const isEdit = !!product;
    const fileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(
        product?.image ? `/storage/${product.image}` : null,
    );

    const form = useForm<{
        category_id: string;
        name: string;
        sku: string;
        description: string;
        composition: string;
        dosage: string;
        manufacturer: string;
        drug_class: string;
        requires_prescription: boolean;
        unit: string;
        price: string;
        cost_price: string;
        stock: string;
        min_stock: string;
        weight_gram: string;
        is_active: boolean;
        is_featured: boolean;
        image: File | null;
        _method?: string;
    }>({
        category_id: String(product?.category_id ?? ''),
        name: product?.name ?? '',
        sku: product?.sku ?? '',
        description: product?.description ?? '',
        composition: product?.composition ?? '',
        dosage: product?.dosage ?? '',
        manufacturer: product?.manufacturer ?? '',
        drug_class: product?.drug_class ?? drugClasses[0]?.value ?? '',
        requires_prescription: product?.requires_prescription ?? false,
        unit: product?.unit ?? 'tablet',
        price: String(product?.price ?? ''),
        cost_price: String(product?.cost_price ?? ''),
        stock: String(product?.stock ?? '0'),
        min_stock: String(product?.min_stock ?? '10'),
        weight_gram: String(product?.weight_gram ?? ''),
        is_active: product?.is_active ?? true,
        is_featured: product?.is_featured ?? false,
        image: null,
        _method: isEdit ? 'PUT' : undefined,
    });

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        form.setData('image', file);
        if (file) setPreview(URL.createObjectURL(file));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEdit ? `/admin/produk/${product!.id}` : '/admin/produk';
        form.post(url, { forceFormData: true });
    };

    const Field = ({
        label,
        required,
        error,
        children,
        className = '',
    }: {
        label: string;
        required?: boolean;
        error?: string;
        children: React.ReactNode;
        className?: string;
    }) => (
        <div className={className}>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );

    const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300';

    return (
        <AdminLayout title={isEdit ? 'Edit Produk' : 'Tambah Produk'}>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Back */}
                <Link
                    href="/admin/produk"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Produk
                </Link>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Image + Active toggles */}
                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                <p className="text-xs font-bold text-slate-700 mb-3">Gambar Produk</p>
                                <div
                                    className="border-2 border-dashed border-slate-200 rounded-xl h-48 flex items-center justify-center cursor-pointer hover:border-indigo-400 transition relative overflow-hidden"
                                    onClick={() => fileRef.current?.click()}
                                >
                                    {preview ? (
                                        <img src={preview} className="w-full h-full object-cover" alt="preview" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <ImageIcon className="w-10 h-10" />
                                            <span className="text-xs text-center">Klik untuk unggah<br />JPG, PNG, WebP (maks. 3MB)</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileRef}
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFile}
                                    />
                                </div>
                                {form.errors.image && <p className="text-xs text-red-500 mt-1">{form.errors.image}</p>}
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                                <p className="text-xs font-bold text-slate-700">Status & Visibilitas</p>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_active}
                                        onChange={(e) => form.setData('is_active', e.target.checked)}
                                        className="w-4 h-4 accent-indigo-600"
                                        id="chk-is-active"
                                    />
                                    <span className="text-sm text-slate-700 font-medium">Produk Aktif</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_featured}
                                        onChange={(e) => form.setData('is_featured', e.target.checked)}
                                        className="w-4 h-4 accent-indigo-600"
                                        id="chk-is-featured"
                                    />
                                    <span className="text-sm text-slate-700 font-medium">Produk Unggulan</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.data.requires_prescription}
                                        onChange={(e) => form.setData('requires_prescription', e.target.checked)}
                                        className="w-4 h-4 accent-red-500"
                                        id="chk-prescription"
                                    />
                                    <span className="text-sm text-slate-700 font-medium">Wajib Resep Dokter</span>
                                </label>
                            </div>
                        </div>

                        {/* Right: Main fields */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Basic Info */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                <p className="text-xs font-bold text-slate-700 mb-4">Informasi Dasar</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Nama Produk" required error={form.errors.name} className="sm:col-span-2">
                                        <input type="text" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className={inputCls} placeholder="cth: Paracetamol 500mg" id="input-product-name" />
                                    </Field>
                                    <Field label="SKU" required error={form.errors.sku}>
                                        <input type="text" value={form.data.sku} onChange={(e) => form.setData('sku', e.target.value)} className={inputCls} placeholder="cth: PCM-500" id="input-product-sku" />
                                    </Field>
                                    <Field label="Satuan" required error={form.errors.unit}>
                                        <input type="text" value={form.data.unit} onChange={(e) => form.setData('unit', e.target.value)} className={inputCls} placeholder="cth: tablet, botol, sachet" />
                                    </Field>
                                    <Field label="Kategori" required error={form.errors.category_id}>
                                        <select value={form.data.category_id} onChange={(e) => form.setData('category_id', e.target.value)} className={inputCls}>
                                            <option value="">Pilih kategori...</option>
                                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Golongan Obat" required error={form.errors.drug_class}>
                                        <select value={form.data.drug_class} onChange={(e) => form.setData('drug_class', e.target.value)} className={inputCls}>
                                            {drugClasses.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Pabrik / Produsen" error={form.errors.manufacturer}>
                                        <input type="text" value={form.data.manufacturer} onChange={(e) => form.setData('manufacturer', e.target.value)} className={inputCls} />
                                    </Field>
                                    <Field label="Berat (gram)" required error={form.errors.weight_gram}>
                                        <input type="number" min={0} value={form.data.weight_gram} onChange={(e) => form.setData('weight_gram', e.target.value)} className={inputCls} />
                                    </Field>
                                </div>
                            </div>

                            {/* Pricing & Stock */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                <p className="text-xs font-bold text-slate-700 mb-4">Harga & Stok</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <Field label="Harga Beli (Rp)" required error={form.errors.cost_price}>
                                        <input type="number" min={0} value={form.data.cost_price} onChange={(e) => form.setData('cost_price', e.target.value)} className={inputCls} />
                                    </Field>
                                    <Field label="Harga Jual (Rp)" required error={form.errors.price}>
                                        <input type="number" min={0} value={form.data.price} onChange={(e) => form.setData('price', e.target.value)} className={inputCls} />
                                    </Field>
                                    {!isEdit && (
                                        <Field label="Stok Awal" required error={form.errors.stock}>
                                            <input type="number" min={0} value={form.data.stock} onChange={(e) => form.setData('stock', e.target.value)} className={inputCls} />
                                        </Field>
                                    )}
                                    <Field label="Min. Stok (Alert)" required error={form.errors.min_stock}>
                                        <input type="number" min={0} value={form.data.min_stock} onChange={(e) => form.setData('min_stock', e.target.value)} className={inputCls} />
                                    </Field>
                                </div>
                            </div>

                            {/* Pharmacy Details */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                <p className="text-xs font-bold text-slate-700 mb-4">Detail Farmasi</p>
                                <div className="space-y-4">
                                    <Field label="Deskripsi Produk" error={form.errors.description}>
                                        <textarea rows={3} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} className={`${inputCls} resize-none`} />
                                    </Field>
                                    <Field label="Komposisi / Kandungan" error={form.errors.composition}>
                                        <textarea rows={2} value={form.data.composition} onChange={(e) => form.setData('composition', e.target.value)} className={`${inputCls} resize-none`} />
                                    </Field>
                                    <Field label="Dosis & Aturan Pakai" error={form.errors.dosage}>
                                        <textarea rows={2} value={form.data.dosage} onChange={(e) => form.setData('dosage', e.target.value)} className={`${inputCls} resize-none`} />
                                    </Field>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3">
                        <Link href="/admin/produk" className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200">
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60"
                            id="btn-submit-product"
                        >
                            <Save className="w-4 h-4" />
                            {form.processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
