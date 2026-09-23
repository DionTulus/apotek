import StoreLayout from '@/layouts/store-layout';
import { Head } from '@inertiajs/react';
import { Calendar, Check, Copy, Percent, Tag } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PromoItem {
    id: number;
    code: string;
    name: string;
    description: string;
    type: string;
    value: number;
    min_purchase: number;
    max_discount?: number;
    starts_at?: string;
    ends_at?: string;
}

interface PromoProps {
    promos: PromoItem[];
}

export default function PromoPage({ promos = [] }: PromoProps) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success(`Kode promo ${code} berhasil disalin!`);
        setTimeout(() => setCopiedCode(null), 3000);
    };

    const formatRp = (num: number) => `Rp ${num.toLocaleString('id-ID')}`;

    return (
        <StoreLayout>
            <Head title="Promo & Voucher Diskon - Klinik Premisys Medika" />

            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white py-12 px-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3">
                    <Tag className="w-3.5 h-3.5" /> PENAWARAN TERBATAS
                </div>
                <h1 className="text-3xl font-black">Voucher & Promo Hemat Klinik Premisys Medika</h1>
                <p className="text-xs sm:text-sm text-blue-100 mt-2">
                    Gunakan kode kupon diskon saat Checkout untuk potongan harga pembelian obat Anda
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {promos.map((promo) => (
                        <div
                            key={promo.id}
                            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
                        >
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 rounded-full bg-blue-50 text-[#8CA9FF] text-xs font-extrabold border border-blue-100 flex items-center gap-1">
                                        <Percent className="w-3.5 h-3.5" />
                                        {(promo.type === 'percent' || promo.type === 'percentage') ? `Diskon ${promo.value}%` : `Potongan ${formatRp(promo.value)}`}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">Aktif</span>
                                </div>

                                <div>
                                    <h3 className="font-extrabold text-slate-900 text-lg">{promo.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{promo.description}</p>
                                </div>

                                <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1 text-slate-600 border border-slate-100">
                                    <p>Min. Belanja: <strong className="text-slate-900">{formatRp(promo.min_purchase)}</strong></p>
                                    {promo.max_discount && (
                                        <p>Maks. Diskon: <strong className="text-slate-900">{formatRp(promo.max_discount)}</strong></p>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 pt-0">
                                <div className="p-2 rounded-2xl bg-blue-50/70 border border-dashed border-[#8CA9FF] flex items-center justify-between">
                                    <span className="font-mono font-black text-sm text-blue-900 tracking-wider pl-2">
                                        {promo.code}
                                    </span>
                                    <button
                                        onClick={() => handleCopyCode(promo.code)}
                                        className="px-4 py-2 rounded-xl bg-[#8CA9FF] hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                                    >
                                        {copiedCode === promo.code ? (
                                            <>
                                                <Check className="w-3.5 h-3.5" /> Tersalin
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" /> Salin Kode
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </StoreLayout>
    );
}
