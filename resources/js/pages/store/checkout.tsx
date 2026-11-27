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
import React, { useEffect, useState } from 'react';

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

interface BiteshipRate {
    company: string;
    courier_name: string;
    courier_type: string;
    service_name: string;
    duration: string;
    price: number;
    available_for_cash_on_delivery: boolean;
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
    subtotal: number;
    hasPrescriptionProducts: boolean;
    activePromos: PromoItem[];
}

export default function Checkout({
    cartItems = [],
    addresses = [],
    subtotal = 0,
    hasPrescriptionProducts = false,
    activePromos = [],
}: CheckoutProps) {
    const defaultAddress = addresses.find((a) => a.is_default) || addresses[0];

    const { data, setData, post, processing, errors } = useForm({
        address_id: defaultAddress ? String(defaultAddress.id) : '',
        recipient_name: defaultAddress ? defaultAddress.recipient_name : '',
        recipient_phone: defaultAddress ? defaultAddress.phone : '',
        recipient_postal_code: defaultAddress ? defaultAddress.postal_code : '',
        full_address: defaultAddress
            ? `${defaultAddress.address_line}, ${defaultAddress.district}, ${defaultAddress.city}, ${defaultAddress.province} ${defaultAddress.postal_code}`
            : '',
        courier_company: '',
        courier_type: '',
        shipping_cost: 0,
        payment_method: 'midtrans',
        promo_code: '',
        prescription_file: null as File | null,
        note: '',
    });

    const [selectedAddressId, setSelectedAddressId] = useState<string>(
        defaultAddress ? String(defaultAddress.id) : ''
    );
    const [useManualAddress, setUseManualAddress] = useState(!defaultAddress);
    const [shippingRates, setShippingRates] = useState<BiteshipRate[]>([]);
    const [ratesLoading, setRatesLoading] = useState(false);
    const [ratesError, setRatesError] = useState('');
    const [ratesPaymentMethod, setRatesPaymentMethod] = useState('');

    const formatRp = (num: number) => `Rp ${num.toLocaleString('id-ID')}`;

    const availableRates = data.payment_method === 'cod'
        ? shippingRates.filter((rate) => rate.available_for_cash_on_delivery)
        : shippingRates;
    const selectedShipping = availableRates.find(
        (rate) => rate.company === data.courier_company && rate.courier_type === data.courier_type
    );
    const shippingCost = selectedShipping?.price ?? 0;
    const codAvailable = shippingRates.some((rate) => rate.available_for_cash_on_delivery);

    // Calculate promo discount
    const activePromo = activePromos.find(
        (p) => p.code.toUpperCase() === data.promo_code.trim().toUpperCase()
    );

    let discountTotal = 0;
    if (activePromo && subtotal >= activePromo.min_purchase) {
        if (activePromo.type === 'percentage') {
            discountTotal = Math.round((subtotal * activePromo.value) / 100);
        } else {
            discountTotal = activePromo.value;
        }
        discountTotal = Math.min(discountTotal, subtotal);
    }

    const grandTotal = Math.max(0, subtotal + shippingCost - discountTotal);

    useEffect(() => {
        const postalCode = data.recipient_postal_code.trim();
        if (!data.address_id && !/^\d{5,10}$/.test(postalCode)) {
            setShippingRates([]);
            setRatesError('');
            setRatesPaymentMethod('');
            return;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setRatesLoading(true);
            setRatesError('');

            const params = new URLSearchParams({
                payment_method: data.payment_method,
                promo_code: data.promo_code,
            });
            if (data.address_id) {
                params.set('address_id', data.address_id);
            } else {
                params.set('recipient_postal_code', postalCode);
            }

            try {
                const response = await fetch(`/checkout/shipping-rates?${params.toString()}`, {
                    headers: { Accept: 'application/json' },
                    signal: controller.signal,
                });
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'Tarif Biteship tidak dapat dimuat.');
                }

                const nextRates = Array.isArray(result.rates) ? result.rates as BiteshipRate[] : [];
                const eligibleRates = data.payment_method === 'cod'
                    ? nextRates.filter((rate) => rate.available_for_cash_on_delivery)
                    : nextRates;
                const selected = eligibleRates.find(
                    (rate) => rate.company === data.courier_company && rate.courier_type === data.courier_type
                ) ?? eligibleRates[0];

                setShippingRates(nextRates);
                setRatesPaymentMethod(data.payment_method);
                setData((current) => ({
                    ...current,
                    courier_company: selected?.company ?? '',
                    courier_type: selected?.courier_type ?? '',
                    shipping_cost: selected?.price ?? 0,
                }));
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') return;
                setShippingRates([]);
                setRatesError(error instanceof Error ? error.message : 'Tarif Biteship tidak dapat dimuat.');
                setData((current) => ({ ...current, courier_company: '', courier_type: '', shipping_cost: 0 }));
            } finally {
                if (!controller.signal.aborted) setRatesLoading(false);
            }
        }, 400);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [data.address_id, data.recipient_postal_code, data.payment_method, data.promo_code]);

    const handleSelectAddress = (addr: AddressItem) => {
        setSelectedAddressId(String(addr.id));
        setUseManualAddress(false);
        setData((prev) => ({
            ...prev,
            address_id: String(addr.id),
            recipient_name: addr.recipient_name,
            recipient_phone: addr.phone,
            recipient_postal_code: addr.postal_code,
            full_address: `${addr.address_line}, ${addr.district}, ${addr.city}, ${addr.province} ${addr.postal_code}`,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedShipping) {
            setRatesError('Pilih layanan kurir yang tersedia sebelum melanjutkan.');
            return;
        }
        post('/checkout');
    };

    return (
        <StoreLayout>
            <Head title="Checkout Pesanan - Apotek Premysis Medika" />

            {/* Header */}
            <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                <div className="max-w-7xl mx-auto flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#065f46]/20 border border-[#065f46]/30 text-[#065f46] flex items-center justify-center">
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
                                    Keranjang Anda berisi obat yang memerlukan resep. Apoteker atau admin akan memeriksa resep terlebih dahulu; pembayaran baru tersedia setelah resep disetujui.
                                </p>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2">
                                        Pilih Berkas Resep (JPG, PNG, PDF maks 5MB)
                                    </label>
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        required={hasPrescriptionProducts}
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
                                    <MapPin className="w-4 h-4 text-[#065f46]" /> Alamat Pengiriman
                                </h3>
                                <Link
                                    href="/alamat"
                                    className="text-xs font-bold text-[#065f46] hover:text-emerald-700"
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
                                                            ? 'border-[#065f46] bg-emerald-50/40 ring-2 ring-[#065f46]/30'
                                                            : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[11px] font-bold text-slate-800">
                                                            {addr.label}
                                                        </span>
                                                        {isSelected && (
                                                            <CheckCircle2 className="w-4 h-4 text-[#065f46]" />
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
                                            setSelectedAddressId('');
                                            setData((current) => ({
                                                ...current,
                                                address_id: '',
                                                recipient_postal_code: '',
                                                courier_company: '',
                                                courier_type: '',
                                                shipping_cost: 0,
                                            }));
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
                                            className="text-xs font-bold text-[#065f46] mb-2 block"
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
                                        <label className="block font-bold text-slate-700 mb-1">Kode Pos</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={10}
                                            placeholder="Contoh: 40132"
                                            value={data.recipient_postal_code}
                                            onChange={(e) => setData('recipient_postal_code', e.target.value.replace(/\D/g, ''))}
                                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                                            required
                                        />
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

                        {/* Biteship courier rates */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                            <h3 className="font-extrabold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-[#065f46]" /> Pilih Tarif Kurir Biteship
                            </h3>
                            <p className="text-[11px] text-slate-500">
                                Tarif dan estimasi dihitung dari layanan yang tersedia untuk kode pos tujuan.
                            </p>
                            {ratesLoading && <p className="text-xs text-slate-500">Memuat tarif kurir...</p>}
                            {ratesError && <p className="text-xs text-rose-600">{ratesError}</p>}
                            {!ratesLoading && !ratesError && availableRates.length === 0 && (
                                <p className="text-xs text-slate-500">
                                    {ratesPaymentMethod === 'cod'
                                        ? 'Tidak ada layanan kurir yang mendukung COD untuk tujuan ini.'
                                        : 'Masukkan atau pilih alamat dengan kode pos yang valid untuk melihat tarif kurir.'}
                                </p>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {availableRates.map((rate) => {
                                    const isSelected = selectedShipping?.company === rate.company
                                        && selectedShipping?.courier_type === rate.courier_type;

                                    return (
                                        <label
                                            key={`${rate.company}:${rate.courier_type}`}
                                            className={`p-4 rounded-2xl border cursor-pointer transition ${
                                                isSelected
                                                    ? 'border-[#065f46] bg-emerald-50/40 ring-2 ring-[#065f46]/30'
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="biteship_rate"
                                                checked={isSelected}
                                                onChange={() => setData((current) => ({
                                                    ...current,
                                                    courier_company: rate.company,
                                                    courier_type: rate.courier_type,
                                                    shipping_cost: rate.price,
                                                }))}
                                                className="sr-only"
                                            />
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="font-extrabold text-slate-900 text-xs">
                                                        {rate.courier_name} - {rate.service_name}
                                                    </span>
                                                    <p className="text-[11px] text-slate-500 mt-1">
                                                        Estimasi: {rate.duration || 'Tidak tersedia'}
                                                    </p>
                                                </div>
                                                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#065f46] shrink-0" />}
                                            </div>
                                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                                <span className="text-slate-400 text-[10px]">Ongkir</span>
                                                <span className="font-bold text-slate-900">{formatRp(rate.price)}</span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                            <h3 className="font-extrabold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#065f46]" /> Metode Pembayaran
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label
                                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                                        data.payment_method === 'midtrans'
                                            ? 'border-[#065f46] bg-emerald-50/40 ring-2 ring-[#065f46]/30'
                                            : 'border-slate-200'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="midtrans"
                                        checked={data.payment_method === 'midtrans'}
                                        onChange={(e) => setData('payment_method', e.target.value)}
                                        className="mt-1 text-[#065f46]"
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
                                            ? 'border-[#065f46] bg-emerald-50/40 ring-2 ring-[#065f46]/30'
                                            : 'border-slate-200'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="cod"
                                        checked={data.payment_method === 'cod'}
                                        disabled={ratesPaymentMethod === 'cod' && !codAvailable && !ratesLoading}
                                        onChange={(e) => setData('payment_method', e.target.value)}
                                        className="mt-1 text-[#065f46]"
                                    />
                                    <div>
                                        <h4 className="font-extrabold text-xs text-slate-900">Cash on Delivery (COD)</h4>
                                        <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                                            Bayar ke kurir jika layanan terpilih mendukung COD.
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
                                    <span>Ongkos Kirim:</span>
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
                                    <span className="text-xl text-[#065f46]">{formatRp(grandTotal)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing || !selectedShipping || ratesLoading}
                                className="w-full py-4 rounded-2xl bg-[#065f46] hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-[#065f46]/30 transition flex items-center justify-center gap-2 group"
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
