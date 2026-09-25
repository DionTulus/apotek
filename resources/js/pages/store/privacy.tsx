import StoreLayout from '@/layouts/store-layout';
import { Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';

interface PrivacyProps {
    privacy?: string;
}

export default function Privacy({ privacy }: PrivacyProps) {
    return (
        <StoreLayout>
            <Head title="Kebijakan Privasi - Klinik Premisys Medika" />

            <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white py-12 px-4 text-center">
                <h1 className="text-3xl font-black">Kebijakan Privasi</h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2">Komitmen kami menjaga kerahasiaan data medis & pribadi Anda</p>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <ShieldCheck className="w-6 h-6 text-[#8CA9FF]" />
                        <h2 className="text-lg font-bold text-slate-900">Perlindungan Data Pribadi & Resep Medis</h2>
                    </div>

                    <div className="whitespace-pre-line">
                        {privacy ||
                            `1. Pengumpulan Informasi:
Kami mengumpulkan informasi pribadi berupa nama, nomor telepon, alamat pengiriman, email, dan foto resep medis hanya untuk keperluan pemrosesan pesanan obat dan konsultasi kefarmasian.

2. Kerahasiaan Rekam Resep Medis:
Foto resep dokter dan riwayat kesehatan yang Anda unggah disimpan secara aman pada server terenkripsi. Informasi medis ini hanya dapat diakses oleh Apoteker Penanggung Jawab dan tim medis berwenang.

3. Kerahasiaan Transaksi Pembayaran:
Seluruh transaksi keuangan online diproses menggunakan enkripsi standar industri oleh pihak Payment Gateway Midtrans. Kami tidak menyimpan informasi kartu kredit atau PIN Anda.

4. Penggunaan Cookie & Analitik:
Kami menggunakan cookie dan sistem analitik internal untuk meningkatkan pengalaman belanja dan kecepatan akses halaman website.

5. Hak Pengguna:
Anda berhak memperbarui, mengedit, atau meminta penghapusan akun data pribadi Anda kapan saja melalui Pengaturan Akun atau menghubungi Layanan Pelanggan.`}
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
