import StoreLayout from '@/layouts/store-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    CreditCard,
    FileText,
    MapPin,
    PackageCheck,
    Pill,
    ShieldAlert,
    Truck,
    Upload,
} from 'lucide-react';
import React, { useState } from 'react';

interface CartItem {
    id: number;
    qty: number;
    product: {
        id: number;
        name: string;
        price: number;
        unit: string;
        weight_gram: number;
        requires_prescription: boolean;
    };
}

interface AddressItem {
    id: number;
    label: string;
    recipient_name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    postal_code: string;
    address_line: string;
    is_default: boolean;
}

interface ShippingMethodItem {
    id: number;
    name: string;
    code: string;
    base_cost: number;
    cost_per_kg: number;
    est_days: string;
    is_cod_available: boolean;
}

interface PromoItem {
    id: number;
    code: string;
    name: string;
    type: string;
    value: number;
    min_purchase: number;
}

interface CheckoutProps {
    cartItems: CartItem[];
    addresses: AddressItem[];
    shippingMethods: ShippingMethodItem[];
    subtotal: number;
    totalWeightGram: number;
    hasPrescriptionProducts: boolean;
    activePromos: PromoItem[];
}

export default function Checkout({
    cartItems = [],
    addresses = [],
    shippingMethods = [],
    subtotal = 0,
    totalWeightGram = 0,
    hasPrescriptionProducts = false,
    activePromos = [],
}: CheckoutProps) {
    const defaultAddress = addresses.find((a) => a.is_default) || addresses[0];

    const { data, setData, post, processing, errors } = useForm({
        address_id: defaultAddress ? String(defaultAddress.id) : '',
        recipient_name: defaultAddress ? defaultAddress.recipient_name : '',
        recipient_phone: defaultAddress ? defaultAddress.phone : '',
        full_address: defaultAddress
            ? `${defaultAddress.address_line}, ${defaultAddress.district}, ${defaultAddress.city}, ${defaultAddress.province} ${defaultAddress.postal_code}`
            : '',
        shipping_method_id: shippingMethods[0] ? String(shippingMethods[0].id) : '',
        payment_method: 'midtrans',
        promo_code: '',
        prescription_file: null as File | null,
        note: '',
    });

    const [selectedAddressId, setSelectedAddressId] = useState<string>(
        defaultAddress ? String(defaultAddress.id) : ''
    );
    const [useManualAddress, setUseManualAddress] = useState(!defaultAddress);

    const formatRp = (num: number) => `Rp ${num.toLocaleString('id-ID')}`;

    // Calculate shipping cost
    const selectedShipping = shippingMethods.find(
        (sm) => String(sm.id) === data.shipping_method_id
    );

    const weightKg = Math.max(1, Math.ceil(totalWeightGram / 1000));
    const shippingCost = selectedShipping
        ? selectedShipping.base_cost + weightKg * selectedShipping.cost_per_kg
        : 0;

    // Calculate promo discount
    const activePromo = activePromos.find(
        (p) => p.code.toUpperCase() === data.promo_code.trim().toUpperCase()
    );

    let discountTotal = 0;
    if (activePromo && subtotal >= activePromo.min_purchase) {
        if (activePromo.type === 'percentage' || activePromo.type === 'percent') {
            discountTotal = Math.round((subtotal * activePromo.value) / 100);
        } else {
            discountTotal = activePromo.value;
        }
        discountTotal = Math.min(discountTotal, subtotal);
    }

    const grandTotal = Math.max(0, subtotal + shippingCost - discountTotal);

    const handleSelectAddress = (addr: AddressItem) => {
        setSelectedAddressId(String(addr.id));
        setUseManualAddress(false);
        setData((prev) => ({
            ...prev,
            address_id: String(addr.id),
            recipient_name: addr.recipient_name,
            recipient_phone: addr.phone,
            full_address: `${addr.address_line}, ${addr.district}, ${addr.city}, ${addr.province} ${addr.postal_code}`,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/checkout');
    };

    return (
        <StoreLayout>
            <Head title="Checkout Pesanan - Klinik Premisys Medika" />

            {/* Header */}
            <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                <div className="max-w-7xl mx-auto flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#8CA9FF]/20 border border-[#8CA9FF]/30 text-[#8CA9FF] flex items-center justify-center">
                        <PackageCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Checkout Pesanan</h1>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Lengkapi rincian pengiriman dan pembayaran pesanan Anda.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column (Inputs) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Prescription Warning & File Upload */}
                        {hasPrescriptionProducts && (
                            <div className="bg-white rounded-3xl border border-rose-200 p-6 shadow-sm space-y-4">
                                <div className="flex items-center gap-2 font-extrabold text-sm text-rose-700">
                                    <ShieldAlert className="w-5 h-5" /> Unggah Resep Dokter (Wajib untuk Obat Keras)
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Keranjang Anda berisi produk obat keras. Apoteker kami wajib memverifikasi resep dokter resmi sebelum pesanan diproses.
                                </p>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2">
                                        Pilih Berkas Resep (JPG, PNG, PDF maks 5MB)
                                    </label>
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) =>
                                            setData('prescription_file', e.target.files ? e.target.files[0] : null)
                                        }
                                        className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer"
                                    />
                                    {errors.prescription_file && (
                                        <p className="text-rose-500 text-[11px] mt-1">{errors.prescription_file}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Address Selection */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-[#8CA9FF]" /> Alamat Pengiriman
                                </h3>
                                <Link
                                    href="/alamat"
                                    className="text-xs font-bold text-[#8CA9FF] hover:text-blue-700"
                                >
                                    + Kelola Alamat
                                </Link>
                            </div>

                            {addresses.length > 0 && !useManualAddress ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {addresses.map((addr) => {
                                            const isSelected = selectedAddressId === String(addr.id);

                                            return (
                                                <div
                                                    key={addr.id}
                                                    onClick={() => handleSelectAddress(addr)}
                                                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                                                        isSelected
                                                            ? 'border-[#8CA9FF] bg-blue-50/40 ring-2 ring-[#8CA9FF]/30'
                                                            : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[11px] font-bold text-slate-800">
                                                            {addr.label}
                                                        </span>
                                                        {isSelected && (
                                                            <CheckCircle2 className="w-4 h-4 text-[#8CA9FF]" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-900">
                                                        {addr.recipient_name} ({addr.phone})
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                                                        {addr.address_line}, {addr.district}, {addr.city}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUseManualAddress(true);
                                            setData('address_id', '');
                                        }}
                                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                                    >
                                        Gunakan Alamat Baru / Manual
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 text-xs">
                                    {addresses.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUseManualAddress(false);
                                                if (defaultAddress) handleSelectAddress(defaultAddress);
                                            }}
                                            className="text-xs font-bold text-[#8CA9FF] mb-2 block"
                                        >
                                            ← Pilih dari Alamat Tersimpan
                                        </button>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">
                                                Nama Penerima
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Nama Penerima"
                                                value={data.recipient_name}
                                                onChange={(e) => setData('recipient_name', e.target.value)}
                                                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                                            />
                                            {errors.recipient_name && (
                                                <p className="text-rose-500 text-[11px] mt-1">{errors.recipient_name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">
                                                No. Telepon Penerima
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="08123456789"
                                                value={data.recipient_phone}
                                                onChange={(e) => setData('recipient_phone', e.target.value)}
                                                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                                            />
                                            {errors.recipient_phone && (
                                                <p className="text-rose-500 text-[11px] mt-1">{errors.recipient_phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Jl. Merdeka No. 45, Bandung"
                                            value={data.full_address}
                                            onChange={(e) => setData('full_address', e.target.value)}
                                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                                        />
                                        {errors.full_address && (
                                            <p className="text-rose-500 text-[11px] mt-1">{errors.full_address}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Shipping Method */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                            <h3 className="font-extrabold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-[#8CA9FF]" /> Pilih Kurir Pengiriman
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {shippingMethods.map((sm) => {
                                    const cost = sm.base_cost + weightKg * sm.cost_per_kg;
                                    const isSelected = data.shipping_method_id === String(sm.id);

                                    return (
                                        <label
                                            key={sm.id}
                                            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                                                isSelected
                                                    ? 'border-[#8CA9FF] bg-blue-50/40 ring-2 ring-[#8CA9FF]/30'
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="shipping_method_id"
                                                value={sm.id}
                                                checked={isSelected}
                                                onChange={(e) => setData('shipping_method_id', e.target.value)}
                                                className="sr-only"
                                            />
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-extrabold text-slate-900 text-xs">
                                                        {sm.name}
                                                    </span>
                                                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#8CA9FF]" />}
                                                </div>
                                                <p className="text-[11px] text-slate-500">Estimasi: {sm.est_days}</p>
                                            </div>
                                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                                <span className="text-slate-400 text-[10px]">Ongkir</span>
                                                <span className="font-bold text-slate-900">{formatRp(cost)}</span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                            <h3 className="font-extrabold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#8CA9FF]" /> Metode Pembayaran
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label
                                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                                        data.payment_method === 'midtrans'
                                            ? 'border-[#8CA9FF] bg-blue-50/40 ring-2 ring-[#8CA9FF]/30'
                                            : 'border-slate-200'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="midtrans"
                                        checked={data.payment_method === 'midtrans'}
                                        onChange={(e) => setData('payment_method', e.target.value)}
                                        className="mt-1 text-[#8CA9FF]"
                                    />
                                    <div>
                                        <h4 className="font-extrabold text-xs text-slate-900">Pembayaran Online (Midtrans)</h4>
                                        <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                                            Transfer Bank (BCA, Mandiri, BRI), QRIS, GoPay, atau Kartu Kredit. Verifikasi otomatis.
                                        </p>
                                    </div>
                                </label>

                                <label
                                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                                        data.payment_method === 'cod'
                                            ? 'border-[#8CA9FF] bg-blue-50/40 ring-2 ring-[#8CA9FF]/30'
                                            : 'border-slate-200'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="cod"
                                        checked={data.payment_method === 'cod'}
                                        onChange={(e) => setData('payment_method', e.target.value)}
                                        className="mt-1 text-[#8CA9FF]"
                                    />
                                    <div>
                                        <h4 className="font-extrabold text-xs text-slate-900">Cash on Delivery (COD)</h4>
                                        <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                                            Bayar tunai di tempat saat kurir menyerahkan pesanan obat Anda.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Order Summary) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                            <h3 className="font-extrabold text-sm text-slate-900 pb-3 border-b border-slate-100">
                                Ringkasan Order
                            </h3>

                            {/* Cart Items Quick List */}
                            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-xs">
                                        <div className="truncate max-w-[170px]">
                                            <p className="font-bold text-slate-800 truncate">{item.product?.name}</p>
                                            <p className="text-[10px] text-slate-400">{item.qty} x {formatRp(item.product?.price)}</p>
                                        </div>
                                        <span className="font-extrabold text-slate-900">
                                            {formatRp(item.product?.price * item.qty)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Promo Input */}
                            <div className="pt-3 border-t border-slate-100 space-y-2">
                                <label className="block text-xs font-bold text-slate-700">Kode Promo / Voucher</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="KODE PROMO"
                                        value={data.promo_code}
                                        onChange={(e) => setData('promo_code', e.target.value.toUpperCase())}
                                        className="w-full p-2 text-xs rounded-xl border border-slate-200 font-mono font-bold"
                                    />
                                </div>
                                {activePromo && subtotal >= activePromo.min_purchase && (
                                    <p className="text-emerald-600 text-[11px] font-bold">
                                        ✓ Voucher {activePromo.name} berhasil dipasang!
                                    </p>
                                )}
                            </div>

                            {/* Note */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan untuk Apoteker / Kurir</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Titipkan di satpam"
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                    className="w-full p-2 text-xs rounded-xl border border-slate-200"
                                />
                            </div>

                            {/* Price Breakdown */}
                            <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal Produk:</span>
                                    <span className="font-bold text-slate-900">{formatRp(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Ongkos Kirim ({weightKg} kg):</span>
                                    <span className="font-bold text-slate-900">{formatRp(shippingCost)}</span>
                                </div>
                                {discountTotal > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                        <span>Diskon Promo:</span>
                                        <span>-{formatRp(discountTotal)}</span>
                                    </div>
                                )}
                                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-900">
                                    <span>Total Bayar:</span>
                                    <span className="text-xl text-[#8CA9FF]">{formatRp(grandTotal)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 rounded-2xl bg-[#8CA9FF] hover:bg-blue-500 text-white font-extrabold text-sm shadow-lg shadow-[#8CA9FF]/30 transition flex items-center justify-center gap-2 group"
                            >
                                {processing ? 'Memproses Pesanan...' : 'Buat Pesanan & Bayar'}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </StoreLayout>
    );
}
