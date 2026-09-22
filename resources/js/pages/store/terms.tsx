import StoreLayout from '@/layouts/store-layout';
import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';

interface TermsProps {
    terms?: string;
}

export default function Terms({ terms }: TermsProps) {
    return (
        <StoreLayout>
            <Head title="Syarat & Ketentuan - Apotek Sehat Sentosa" />

            <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white py-12 px-4 text-center">
                <h1 className="text-3xl font-black">Syarat & Ketentuan</h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2">Ketentuan penggunaan layanan dan transaksi di Apotek ERP</p>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <FileText className="w-6 h-6 text-[#8CA9FF]" />
                        <h2 className="text-lg font-bold text-slate-900">Aturan Penggunaan & Pembelian</h2>
                    </div>

                    <div className="whitespace-pre-line">
                        {terms ||
                            `1. Pembelian Obat Bebas & Bebas Terbatas:
Dapat dilakukan langsung tanpa memerlukan resep dokter. Pembeli dianjurkan membaca petunjuk dosis pada kemasan.

2. Pembelian Obat Keras (Resep Dokter):
Wajib mengunggah foto/scan resep dokter sah yang masih berlaku. Pesanan obat keras hanya akan diproses setelah diverifikasi dan disetujui oleh Apoteker Penanggung Jawab.

3. Pembayaran:
Pembayaran dapat dilakukan melalui Midtrans Payment Gateway (Virtual Account, E-Wallet, QRIS) atau COD (Bayar di Tempat) untuk wilayah yang didukung.

4. Pengiriman:
Waktu pengiriman mengikuti metode ekspedisi / kurir instant yang dipilih. Kerusakan akibat kesalahan pihak kurir akan ditangani sesuai aturan klaim garansi.

5. Retur & Pengembalian:
Pengajuan retur dapat dilakukan maksimal 2x24 jam setelah barang diterima dengan bukti unboxing video yang jelas.`}
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
