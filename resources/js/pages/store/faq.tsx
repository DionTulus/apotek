import StoreLayout from '@/layouts/store-layout';
import { Head } from '@inertiajs/react';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';
import { useState } from 'react';

interface FaqItem {
    id: number;
    question: string;
    answer: string;
}

interface FaqProps {
    faqs: FaqItem[];
}

export default function FaqPage({ faqs = [] }: FaqProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFaqs = faqs.filter(
        (f) =>
            f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <StoreLayout>
            <Head title="Pertanyaan Sering Diajukan (FAQ) - Klinik Premisys Medika" />

            <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white py-12 px-4 text-center">
                <h1 className="text-3xl font-black">Pertanyaan Sering Diajukan (FAQ)</h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg mx-auto">
                    Temukan jawaban cepat seputar pemesanan obat, resep dokter, pembayaran Midtrans, dan pengiriman.
                </p>

                {/* Search Bar FAQ */}
                <div className="max-w-md mx-auto mt-6 relative">
                    <input
                        type="text"
                        placeholder="Cari pertanyaan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-full bg-white text-slate-800 text-xs font-medium border-0 focus:ring-2 focus:ring-[#8CA9FF]"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {filteredFaqs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-700">Pertanyaan tidak ditemukan</p>
                        <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredFaqs.map((faq, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <div
                                    key={faq.id}
                                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition"
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : index)}
                                        className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:text-blue-600 transition"
                                    >
                                        <span className="flex items-center gap-3">
                                            <HelpCircle className="w-5 h-5 text-[#8CA9FF] shrink-0" />
                                            {faq.question}
                                        </span>
                                        <ChevronDown
                                            className={`w-4 h-4 text-slate-400 transition-transform ${
                                                isOpen ? 'rotate-180 text-blue-600' : ''
                                            }`}
                                        />
                                    </button>

                                    {isOpen && (
                                        <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
