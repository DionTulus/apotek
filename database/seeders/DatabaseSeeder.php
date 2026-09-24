<?php

namespace Database\Seeders;

use App\Enums\DrugClass;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\PurchaseStatus;
use App\Enums\Role;
use App\Enums\ShipmentStatus;
use App\Enums\StockMovementType;
use App\Enums\TransactionCategory;
use App\Enums\TransactionType;
use App\Models\Address;
use App\Models\BlogPost;
use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\CrmInteraction;
use App\Models\CrmLead;
use App\Models\Faq;
use App\Models\FinancialTransaction;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\PageVisit;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\Promo;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Setting;
use App\Models\Shipment;
use App\Models\ShippingMethod;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Users
        $admin = User::create([
            'name' => 'Admin Apotek',
            'email' => 'admin@apotek.test',
            'password' => Hash::make('password'),
            'role' => Role::ADMIN,
            'phone' => '081234567890',
            'email_verified_at' => now(),
        ]);

        $pharmacist = User::create([
            'name' => 'Apoteker Bambang, S.Farm',
            'email' => 'apoteker@apotek.test',
            'password' => Hash::make('password'),
            'role' => Role::PHARMACIST,
            'phone' => '081234567891',
            'email_verified_at' => now(),
        ]);

        $customer1 = User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@apotek.test',
            'password' => Hash::make('password'),
            'role' => Role::CUSTOMER,
            'phone' => '081298765432',
            'email_verified_at' => now(),
        ]);

        $customer2 = User::create([
            'name' => 'Siti Aminah',
            'email' => 'siti@apotek.test',
            'password' => Hash::make('password'),
            'role' => Role::CUSTOMER,
            'phone' => '081311223344',
            'email_verified_at' => now(),
        ]);

        $customers = [$customer1, $customer2];

        for ($i = 3; $i <= 15; $i++) {
            $customers[] = User::create([
                'name' => "Pelanggan $i",
                'email' => "user$i@apotek.test",
                'password' => Hash::make('password'),
                'role' => Role::CUSTOMER,
                'phone' => '081' . rand(10000000, 99999999),
                'email_verified_at' => now(),
            ]);
        }

        // Addresses
        foreach ($customers as $c) {
            Address::create([
                'user_id' => $c->id,
                'label' => 'Rumah',
                'recipient_name' => $c->name,
                'phone' => $c->phone ?? '08123456789',
                'province' => 'Jawa Barat',
                'city' => 'Kota Bandung',
                'district' => 'Coblong',
                'postal_code' => '40132',
                'address_line' => 'Jl. Ganesha No. 10, Coblong',
                'is_default' => true,
            ]);
        }

        // 2. Settings
        $settingsData = [
            'site_name' => 'Apotek Sehat Sentosa',
            'site_tagline' => 'Solusi Obat Lengkap, Cepat & Terpercaya',
            'phone' => '022-7654321',
            'whatsapp' => '081234567890',
            'email' => 'info@apoteksehatsentosa.test',
            'address' => 'Jl. Merdeka No. 45, Bandung, Jawa Barat 40111',
            'maps_embed_url' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.835848243!2d107.60981!3d-6.914744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTQnNTMuMSJTIDEwN8KwMzYnMzUuMyJF!5e0!3m2!1sid!2sid!4v1600000000000',
            'vision' => 'Menjadi jaringan apotek e-commerce terdepan di Indonesia yang memberikan pelayanan kefarmasian profesional dan produk berkualitas.',
            'mission' => "1. Menyediakan obat-obatan legal dan terdaftar BPOM.\n2. Memberikan layanan konsultasi obat yang ramah & terpercaya.\n3. Mengirimkan produk dengan cepat dan aman sampai ke tangan pelanggan.",
            'about' => 'Apotek Sehat Sentosa berdiri sejak tahun 2020. Kami berdedikasi melayani kebutuhan kesehatan masyarakat dengan menyediakan obat-obatan asli, vitamin, suplemen, dan alat kesehatan berkualitas tinggi.',
            'opening_hours' => 'Senin - Sabtu: 08.00 - 21.00 WIB\nMinggu: 09.00 - 17.00 WIB\nLayanan pesan antar online: 24 jam',
            'terms' => "Dengan menggunakan layanan Apotek Sehat Sentosa, Anda dianggap telah membaca, memahami, dan menyetujui syarat dan ketentuan berikut.\n\nPembelian obat keras (bertanda lingkaran merah huruf K) memerlukan resep dokter yang sah. Resep yang diunggah akan diverifikasi oleh apoteker kami sebelum pesanan diproses. Apotek berhak menolak transaksi yang tidak memenuhi ketentuan medis atau yang dianggap mencurigakan.\n\nHarga, stok, dan ketersediaan produk dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya. Pesanan baru dianggap sah setelah pembayaran dikonfirmasi, kecuali untuk metode bayar di tempat (COD) yang telah disetujui apotek.\n\nPembatalan pesanan dapat dilakukan sendiri selama status pesanan masih menunggu pembayaran. Setelah pembayaran terkonfirmasi, pembatalan hanya dapat dilakukan oleh apotek dengan alasan yang dapat dipertanggungjawabkan.\n\nSegala perselisihan yang timbul akan diselesaikan secara musyawarah dengan mengacu pada hukum yang berlaku di Republik Indonesia.",
            'privacy' => "Kami menghargai kepercayaan Anda. Kebijakan ini menjelaskan data apa yang kami kumpulkan dan bagaimana data tersebut kami lindungi.\n\nData yang kami kumpulkan meliputi nama, nomor telepon, alamat email, alamat pengiriman, serta riwayat pesanan Anda. Untuk pembelian obat keras, kami juga menyimpan berkas resep dokter yang Anda unggah. Seluruh data ini digunakan semata-mata untuk memproses pesanan dan memenuhi kewajiban kefarmasian.\n\nData resep medis diperlakukan sebagai data sensitif. Hanya apoteker yang berwenang yang dapat mengaksesnya, dan berkas tersebut tidak pernah dibagikan kepada pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh hukum.\n\nKami tidak menjual atau menyewakan data pribadi Anda kepada pihak lain. Data pembayaran diproses oleh penyedia pembayaran resmi yang tersertifikasi, sehingga nomor kartu dan kode rahasia tidak pernah kami simpan.\n\nAnda berhak meminta salinan, perbaikan, atau penghapusan data pribadi Anda. Ajukan permintaan tersebut melalui menu Kontak Kami atau hubungi petugas apotek secara langsung.",
            'free_shipping_min' => '150000',
        ];

        foreach ($settingsData as $k => $v) {
            Setting::set($k, $v);
        }

        // 3. Shipping Methods
        $shippingMethods = [
            ShippingMethod::create([
                'name' => 'Kurir Instant Apotek (Bandung Area)',
                'code' => 'KURIR_INSTANT',
                'base_cost' => 15000,
                'cost_per_kg' => 2000,
                'est_days' => 'Hari yang sama (1-3 jam)',
                'is_cod_available' => true,
                'is_active' => true,
            ]),
            ShippingMethod::create([
                'name' => 'JNE Reguler',
                'code' => 'JNE_REG',
                'base_cost' => 12000,
                'cost_per_kg' => 5000,
                'est_days' => '2-3 hari',
                'is_cod_available' => false,
                'is_active' => true,
            ]),
            ShippingMethod::create([
                'name' => 'JNE YES (Yakin Esok Sampai)',
                'code' => 'JNE_YES',
                'base_cost' => 22000,
                'cost_per_kg' => 8000,
                'est_days' => '1 hari',
                'is_cod_available' => false,
                'is_active' => true,
            ]),
            ShippingMethod::create([
                'name' => 'Ambil Sendiri di Toko',
                'code' => 'PICKUP',
                'base_cost' => 0,
                'cost_per_kg' => 0,
                'est_days' => 'Bisa diambil hari ini',
                'is_cod_available' => true,
                'is_active' => true,
            ]),
        ];

        // 4. Promos
        Promo::create([
            'code' => 'WELCOME10',
            'name' => 'Diskon Pelanggan Baru 10%',
            'description' => 'Diskon 10% khusus pembelian pertama pelanggan baru.',
            'type' => 'percent',
            'value' => 10,
            'min_purchase' => 50000,
            'max_discount' => 20000,
            'quota' => 100,
            'used_count' => 15,
            'starts_at' => now()->subDays(30),
            'ends_at' => now()->addDays(60),
            'is_active' => true,
        ]);

        Promo::create([
            'code' => 'SEHAT50K',
            'name' => 'Potongan Rp 15.000',
            'description' => 'Potongan harga Rp 15.000 untuk pembelian minimal Rp 100.000.',
            'type' => 'fixed',
            'value' => 15000,
            'min_purchase' => 100000,
            'quota' => 50,
            'used_count' => 28,
            'starts_at' => now()->subDays(15),
            'ends_at' => now()->addDays(30),
            'is_active' => true,
        ]);

        // 5. Suppliers
        $suppliers = [
            Supplier::create([
                'name' => 'PT Kalbe Farma Tbk',
                'contact_person' => 'Bpk. Ahmad Sujianto',
                'phone' => '021-4607777',
                'email' => 'sales@kalbe.co.id',
                'address' => 'Kawasan Industri Pulogadung, Jakarta Timur',
            ]),
            Supplier::create([
                'name' => 'PT Kimia Farma Trading & Distribution',
                'contact_person' => 'Ibu Ratna Sari',
                'phone' => '021-3847777',
                'email' => 'order@kimiafarma.co.id',
                'address' => 'Jl. Veteran No. 9, Jakarta Pusat',
            ]),
            Supplier::create([
                'name' => 'PT Sanbe Farma',
                'contact_person' => 'Bpk. Hendra Gunawan',
                'phone' => '022-6030426',
                'email' => 'info@sanbe-farma.com',
                'address' => 'Jl. Industri Cimareme No. 8, Bandung',
            ]),
            Supplier::create([
                'name' => 'PT Dexa Medica',
                'contact_person' => 'Ibu Dewi Lestari',
                'phone' => '021-7454111',
                'email' => 'contact@dexa-medica.com',
                'address' => 'Bintaro Jaya Sektor 7, Tangerang Selatan',
            ]),
        ];

        // 6. Categories (10)
        $categoriesData = [
            ['name' => 'Obat Bebas & Pertolongan Pertama', 'slug' => 'obat-bebas', 'desc' => 'Obat-obatan umum tanpa resep dokter untuk flu, batuk, dan nyeri ringan.'],
            ['name' => 'Obat Resep Dokter', 'slug' => 'obat-resep', 'desc' => 'Obat keras yang wajib melampirkan resep dokter sah.'],
            ['name' => 'Vitamin & Suplemen', 'slug' => 'vitamin-suplemen', 'desc' => 'Multi-vitamin, daya tahan tubuh, dan nutrisi harian.'],
            ['name' => 'Obat Herbal & Jamu', 'slug' => 'obat-herbal', 'desc' => 'Produk obat herbal alami terstandar dan minyak esensial.'],
            ['name' => 'Alat Kesehatan & Medis', 'slug' => 'alat-kesehatan', 'desc' => 'Thermometer, tensimeter, masker, pembersih luka, dan perban.'],
            ['name' => 'Ibu & Anak', 'slug' => 'ibu-anak', 'desc' => 'Susu bayi, perawatan ruam, vitamin anak, dan suplemen kehamilan.'],
            ['name' => 'Perawatan Diri & Kulit', 'slug' => 'perawatan-diri', 'desc' => 'Sabun antiseptik, lotion obat, sampo ketombe, dan antiseptik.'],
            ['name' => 'Kesehatan Pencernaan', 'slug' => 'pencernaan', 'desc' => 'Obat maag, diare, sembelit, dan suplemen probiotik.'],
            ['name' => 'Kesehatan Jantung & Kolesterol', 'slug' => 'jantung-kolesterol', 'desc' => 'Suplemen omega 3, pengukur tekanan darah, dan pendukung sirkulasi.'],
            ['name' => 'Mata, Telinga & Mulut', 'slug' => 'mata-telinga-mulut', 'desc' => 'Tetes mata, tetes telinga, obat sariawan, dan obat kumur antiseptik.'],
        ];

        $categories = [];
        foreach ($categoriesData as $c) {
            $categories[] = Category::create([
                'name' => $c['name'],
                'slug' => $c['slug'],
                'description' => $c['desc'],
                'is_active' => true,
            ]);
        }

        // 7. Products (42 products, realistic Indonesian medicines)
        $rawProducts = [
            // Obat Bebas
            [0, 'PRO-001', 'Paracetamol 500mg Strip', 'paracetamol-500mg-strip', 'Paracetamol 500mg untuk meredakan demam dan nyeri ringan hingga sedang.', 'Paracetamol 500mg', 'Dewasa: 1-2 kaplet 3-4 kali sehari.', 'PT Kalbe Farma', DrugClass::BEBAS, false, 'strip', 5500, 3500, 150, 100],
            [0, 'PRO-002', 'Bodrex Ekstra Strip', 'bodrex-ekstra-strip', 'Obat pereda sakit kepala mencengkeram dan nyeri haid.', 'Paracetamol 350mg, Ibuprofen 200mg, Caffeine 50mg', 'Dewasa: 1 kaplet 3 kali sehari sesudah makan.', 'PT Tempo Scan Pacific', DrugClass::BEBAS, false, 'strip', 6000, 4200, 120, 100],
            [0, 'PRO-003', 'Mixagrip Flu & Batuk Strip', 'mixagrip-flu-batuk', 'Meredakan gejala flu seperti bersin-bersin, hidung tersumbat, dan batuk.', 'Paracetamol 500mg, Phenylephrine HCl 10mg, CTM 2mg', 'Dewasa: 1 kaplet 3-4 kali sehari.', 'PT Dankos Farma', DrugClass::BEBAS, false, 'strip', 4500, 3000, 200, 100],
            [0, 'PRO-004', 'Panadol Merah Extra Box', 'panadol-merah-extra-box', 'Obat pereda sakit kepala dan nyeri yang lebih cepat diserap.', 'Paracetamol 500mg, Caffeine 65mg', 'Dewasa: 1-2 kaplet tiap 4-6 jam.', 'GSK Indonesia', DrugClass::BEBAS, false, 'box', 14500, 11000, 80, 100],
            [0, 'PRO-005', 'Komix Herbal Batuk Sirup Sachet', 'komix-herbal-batuk-sachet', 'Sirup batuk dalam kemasan sachet praktis.', 'Ekstrak Lagundi, Jahe Merah, Thymi, Licorice, Madu', 'Dewasa: 3 x 1 sachet per hari.', 'PT Bintang Toedjoe', DrugClass::BEBAS, false, 'box', 16000, 12000, 90, 100],

            // Obat Keras (Resep)
            [1, 'PRO-006', 'Amoxicillin 500mg Box (Wajib Resep)', 'amoxicillin-500mg-box', 'Antibiotik spektrik luas untuk infeksi bakteri gram positif dan negatif.', 'Amoxicillin Trihydrate 500mg', 'Sesuai petunjuk resep dokter (habiskan).', 'PT Sanbe Farma', DrugClass::KERAS, true, 'box', 45000, 32000, 60, 100],
            [1, 'PRO-007', 'Cefadroxil 500mg Strip (Wajib Resep)', 'cefadroxil-500mg-strip', 'Antibiotik sefalosporin generasi pertama untuk saluran napas dan kulit.', 'Cefadroxil Monohydrate 500mg', 'Sesuai resep dokter.', 'PT Dexa Medica', DrugClass::KERAS, true, 'strip', 18000, 12500, 45, 100],
            [1, 'PRO-008', 'Cataflam 50mg Strip (Wajib Resep)', 'cataflam-50mg-strip', 'Antiinflamasi nonsteroid untuk nyeri berat, sakit gigi, dan pasca operasi.', 'Potassium Diclofenac 50mg', 'Dewasa: 100-150mg sehari terbagi 2-3 kali sesudah makan.', 'Novartis', DrugClass::KERAS, true, 'strip', 68000, 52000, 30, 100],
            [1, 'PRO-009', 'Amlodipine 5mg Strip (Wajib Resep)', 'amlodipine-5mg-strip', 'Obat antihipertensi obat darah tinggi golongan antagonis kalsium.', 'Amlodipine Besylate 5mg', 'Dewasa: 1 tablet 1 kali sehari.', 'PT Kimia Farma', DrugClass::KERAS, true, 'strip', 8500, 4000, 110, 100],
            [1, 'PRO-010', 'Simvastatin 10mg Strip (Wajib Resep)', 'simvastatin-10mg-strip', 'Obat penurun kadar kolesterol total dan LDL dalam darah.', 'Simvastatin 10mg', 'Dewasa: 10-40mg sehari sekali pada malam hari.', 'PT Hexpharm Jaya', DrugClass::KERAS, true, 'strip', 7000, 3500, 85, 100],

            // Vitamin & Suplemen
            [2, 'PRO-011', 'Imboost Force Kaplet Strip', 'imboost-force-strip', 'Suplemen kesehatan untuk meningkatkan sistem kekebalan tubuh.', 'Echinacea purpurea 250mg, Black Elderberry 400mg, Zinc Picolinate 10mg', 'Dewasa: 1 kaplet 3 kali sehari.', 'PT Soho Industri Pharmasi', DrugClass::SUPLEMEN, false, 'strip', 42000, 33000, 140, 100],
            [2, 'PRO-012', 'Enervon-C Botol 30 Tablet', 'enervon-c-botol-30', 'Kombinasi Vitamin C 500mg dan Vitamin B Kompleks.', 'Vitamin C 500mg, Niacinamide 50mg, Calcium Pantothenate 20mg, Vit B1 B2 B6 B12', 'Dewasa: 1 tablet sehari.', 'PT Medifarma Laboratories', DrugClass::SUPLEMEN, false, 'botol', 48000, 38000, 95, 100],
            [2, 'PRO-013', 'Holisticare Ester C Botol 30', 'holisticare-ester-c-30', 'Vitamin C ester yang tidak asam di lambung dan bertahan lebih lama.', 'Ester-C 500mg, Bioflavonoid 50mg', 'Dewasa: 1-3 tablet sehari.', 'PT Indocare Citra Pasific', DrugClass::SUPLEMEN, false, 'botol', 65000, 50000, 75, 100],
            [2, 'PRO-014', 'CDR Vitamin C Effervescent Tube 10', 'cdr-effervescent-tube-10', 'Suplemen kalsium dan Vitamin D untuk tulang sehat.', 'Kalsium 250mg, Vitamin C 1000mg, Vitamin D 300IU, Vitamin B6 15mg', '1 tablet dilarutkan dalam air minum per hari.', 'Bayer Indonesia', DrugClass::SUPLEMEN, false, 'tube', 49000, 39000, 110, 100],

            // Herbal & Jamu
            [3, 'PRO-015', 'Tolak Angin Cair Sachet Box', 'tolak-angin-cair-box', 'Obat herbal terstandar untuk meredakan masuk angin dan tenggorokan gatal.', 'Ekstrak Adas, Kayu Ules, Daun Mint, Jahe, Madu', 'Minum 1 sachet 3 kali sehari sesudah makan.', 'PT Sido Muncul', DrugClass::HERBAL, false, 'box', 24500, 19000, 180, 100],
            [3, 'PRO-016', 'Minyak Kayu Putih Cap Lang 120ml', 'minyak-kayu-putih-cap-lang-120ml', 'Minyak kayu putih alami menghangatkan tubuh dan meredakan gigitan serangga.', 'Minyak Kayu Putih 100%', 'Oleskan secukupnya pada area yang sakit atau dingin.', 'PT Eagle Indo Pharma', DrugClass::HERBAL, false, 'botol', 43000, 34000, 130, 100],
            [3, 'PRO-017', 'Minyak Telon Lang 100ml', 'minyak-telon-lang-100ml', 'Minyak telon penghangat bayi dan meredakan perut kembung.', 'Minyak Adas, Minyak Kelapa, Minyak Kayu Putih', 'Oleskan pada dada, perut, dan telapak kaki bayi.', 'PT Eagle Indo Pharma', DrugClass::HERBAL, false, 'botol', 32000, 25000, 105, 100],

            // Alat Kesehatan
            [4, 'PRO-018', 'Omron Tensimeter Digital HEM-7120', 'omron-tensimeter-hem-7120', 'Alat pengukur tekanan darah digital otomatis pada lengan atas.', 'Tensimeter Digital + Manset Standard + Baterai', 'Gunakan manset di lengan atas dan tekan tombol START.', 'Omron Healthcare', DrugClass::ALKES, false, 'pcs', 560000, 470000, 20, 100],
            [4, 'PRO-019', 'Thermometer Digital OMRON MC-246', 'thermometer-digital-omron-mc246', 'Termometer suhu tubuh digital cepat dan akurat.', 'Termometer digital waterproof', 'Selipkan di ketiak atau mulut hingga berbunyi beep.', 'Omron Healthcare', DrugClass::ALKES, false, 'pcs', 65000, 48000, 40, 100],
            [4, 'PRO-020', 'Masker Sensi 3-Ply Earloop Box 50', 'masker-sensi-3ply-box-50', 'Masker medis 3 lapis penyaring kuman dan debu.', 'Non-woven polypropylene 3 ply', 'Pasangkan tali pada telinga dan jepit klip hidung.', 'PT Arista Latindo', DrugClass::ALKES, false, 'box', 35000, 24000, 150, 100],
            [4, 'PRO-021', 'Hansaplast Plester Kain Elastis Box 100', 'hansaplast-kain-elastis-box-100', 'Plester penutup luka kain elastis kedap air dan kotoran.', 'Kain elastis, antiseptik silver', 'Bersihkan luka lalu tempelkan plester.', 'Beiersdorf Indonesia', DrugClass::ALKES, false, 'box', 38000, 28000, 70, 100],

            // Ibu & Anak
            [5, 'PRO-022', 'Bepanthen Salep Ruam Popok 20g', 'bepanthen-salep-ruam-20g', 'Salep pelindung ruam popok dan puting lecet ibu menyusui.', 'Dexpanthenol (Pro-Vitamin B5) 5%', 'Oleskan pada kulit bersih setelah ganti popok.', 'Bayer Indonesia', DrugClass::BEBAS, false, 'tube', 58000, 46000, 50, 100],
            [5, 'PRO-023', 'Sanmol Anak Sirup 60ml', 'sanmol-anak-sirup-60ml', 'Sirup penurun demam rasa buah manis untuk anak usia 1-12 tahun.', 'Paracetamol 120mg per 5ml', 'Anak 1-2 thn: 5ml; 2-6 thn: 5-10ml (3-4x sehari).', 'PT Caprifarmindo', DrugClass::BEBAS, false, 'botol', 21000, 15000, 115, 100],
            [5, 'PRO-024', 'Stimuno Anak Sirup Rasa Jeruk 60ml', 'stimuno-anak-sirup-jeruk-60ml', 'Imunomodulator herbal penambah daya tahan tubuh anak.', 'Ekstrak Meniran (Phyllanthus niruri) 25mg', 'Anak > 1 tahun: 5ml 1-3 kali sehari.', 'PT Dexa Medica', DrugClass::HERBAL, false, 'botol', 34000, 26000, 80, 100],

            // Perawatan Diri
            [6, 'PRO-025', 'Betadine Antiseptic Solution 60ml', 'betadine-antiseptic-solution-60ml', 'Cairan antiseptik pembersih luka dan pencegah infeksi.', 'Povidone Iodine 10%', 'Teteskan pada kasa steril lalu usapkan pada luka.', 'Mundipharma Indonesia', DrugClass::BEBAS, false, 'botol', 33000, 24000, 90, 100],
            [6, 'PRO-026', 'Dettol Antiseptik Cair 245ml', 'dettol-antiseptik-cair-245ml', 'Cairan pembunuh kuman untuk mandi, pertolongan pertama, dan kebersihan.', 'Chloroxylenol 4.8%', 'Campurkan dengan air mandi atau pembersih luka.', 'Reckitt Benckiser', DrugClass::BEBAS, false, 'botol', 52000, 41000, 65, 100],

            // Pencernaan
            [7, 'PRO-027', 'Mylanta Liquid 150ml', 'mylanta-liquid-150ml', 'Obat maag sirup meredakan mual, perih ulu hati, dan kembung.', 'Aluminium Hydroxide 200mg, Magnesium Hydroxide 200mg, Simethicone 20mg', 'Dewasa: 5-10ml 3-4 kali sehari sebelum makan.', 'PT Johnson & Johnson', DrugClass::BEBAS_TERBATAS, false, 'botol', 49000, 38000, 85, 100],
            [7, 'PRO-028', 'Promag Tablet Strip', 'promag-tablet-strip', 'Obat kunyah maag cepat netralkan asam lambung berlebih.', 'Hydrotalcite 200mg, Magnesium Hydroxide 150mg, Simethicone 50mg', 'Dikunyah 1-2 tablet 3-4 kali sehari.', 'PT Kalbe Farma', DrugClass::BEBAS, false, 'strip', 9500, 6500, 160, 100],
            [7, 'PRO-029', 'Diapet Kapsul Strip', 'diapet-kapsul-strip', 'Obat diare herbal mengurangi frekuensi buang air besar.', 'Ekstrak Daun Jambu Biji, Kunyit, Buah Mojokeling, Kulit Buah Delima', 'Dewasa: 2 kapsul 2 kali sehari.', 'PT Soho Industri Pharmasi', DrugClass::HERBAL, false, 'strip', 7500, 4800, 140, 100],

            // Jantung & Kolesterol
            [8, 'PRO-030', 'Blackmores Odourless Fish Oil 1000mg 30s', 'blackmores-fish-oil-30s', 'Minyak ikan kaya Omega 3 menjaga kesehatan jantung dan sirkulasi darah.', 'Fish Oil 1000mg (EPA 180mg, DHA 120mg)', 'Dewasa: 2 kapsul sehari sesudah makan.', 'Blackmores Australia', DrugClass::SUPLEMEN, false, 'botol', 135000, 105000, 40, 100],

            // Mata & Telinga
            [9, 'PRO-031', 'Insto Regular Tetes Mata 7.5ml', 'insto-regular-tetes-mata-7ml', 'Tetes mata meredakan iritasi ringan akibat debu, asap, dan angin.', 'Tetrahydrozoline HCl 0.05%', '2-3 tetes pada setiap mata 3-4 kali sehari.', 'Combiphar', DrugClass::BEBAS_TERBATAS, false, 'botol', 17500, 12500, 130, 100],
            [9, 'PRO-032', 'Rohto Cool Tetes Mata 7ml', 'rohto-cool-tetes-mata-7ml', 'Tetes mata rasa dingin menyegarkan mata lelah dan merah.', 'Naphazoline HCl 0.012%', '1-2 tetes pada mata yang sakit 3-4 kali sehari.', 'PT Rohto Laboratories', DrugClass::BEBAS_TERBATAS, false, 'botol', 19000, 14000, 110, 100],
        ];

        $products = [];
        foreach ($rawProducts as $p) {
            $catIndex = $p[0];
            $prod = Product::create([
                'category_id' => $categories[$catIndex]->id,
                'sku' => $p[1],
                'name' => $p[2],
                'slug' => $p[3],
                'description' => $p[4],
                'composition' => $p[5],
                'dosage' => $p[6],
                'manufacturer' => $p[7],
                'drug_class' => $p[8],
                'requires_prescription' => $p[9],
                'unit' => $p[10],
                'price' => $p[11],
                'cost_price' => $p[12],
                'stock' => $p[13],
                'min_stock' => $p[14],
                'weight_gram' => rand(50, 500),
                'is_active' => true,
                'is_featured' => rand(0, 1) === 1,
                'sold_count' => rand(10, 150),
            ]);

            // Add product batch
            $batchNo = 'BAT-' . strtoupper(Str::random(6));
            $expiryDate = now()->addDays(rand(60, 700));

            $batch = ProductBatch::create([
                'product_id' => $prod->id,
                'batch_no' => $batchNo,
                'expiry_date' => $expiryDate,
                'qty_in' => $p[13] + 50,
                'qty_remaining' => $p[13],
            ]);

            StockMovement::create([
                'product_id' => $prod->id,
                'batch_id' => $batch->id,
                'type' => StockMovementType::PURCHASE,
                'qty' => $p[13] + 50,
                'stock_after' => $p[13] + 50,
                'note' => 'Stok awal dari supplier saat seeder',
                'created_by' => $admin->id,
            ]);

            $products[] = $prod;
        }

        // 8. Testimonials (8)
        $testimonials = [
            ['name' => 'Budi Santoso', 'rating' => 5, 'content' => 'Pengiriman obat cepat sekali! Pagi pesan lewat Kurir Instant, siang sudah sampai. Obatnya asli dan terawat.'],
            ['name' => 'Siti Aminah', 'rating' => 5, 'content' => 'Sangat membantu untuk pesan obat resep. Tinggal foto resepnya, ditinjau apoteker ramah, langsung dikirim. Terima kasih!'],
            ['name' => 'Dr. Hendra', 'rating' => 5, 'content' => 'Sebagai dokter, saya rekomendasikan Apotek Sehat Sentosa karena penyimpanan obatnya terstandar dan masa simpan selalu terpantau.'],
            ['name' => 'Rina Wijaya', 'rating' => 4, 'content' => 'Harga suplemen dan vitaminnya bersaing, sering ada voucher promo diskon juga.'],
            ['name' => 'Agus Pratama', 'rating' => 5, 'content' => 'Pelayanan ramah, obat diare dan maag langsung sampai pas emergency.'],
        ];

        foreach ($testimonials as $t) {
            Testimonial::create([
                'user_id' => $customer1->id,
                'name' => $t['name'],
                'rating' => $t['rating'],
                'content' => $t['content'],
                'is_approved' => true,
            ]);
        }

        // 9. Blog Posts (5)
        $blogPosts = [
            [
                'title' => '5 Cara Efektif Menjaga Daya Tahan Tubuh Saat Musim Hujan',
                'slug' => '5-cara-menjaga-daya-tahan-tubuh-musim-hujan',
                'excerpt' => 'Musim hujan sering memicu demam dan flu. Pelajari suplemen dan pola hidup terbaik untuk proteksi keluarga.',
                'content' => "Perubahan cuaca ekstrem dari panas ke hujan membuat tubuh rentan terserang flu, batuk, dan demam. Berikut adalah langkah penting:\n\n1. Consumsi Vitamin C & Zinc harian\n2. Olahraga ringan indoor\n3. Tidur cukup 7-8 jam\n4. Selalu bawa minyak kayu putih / antiseptik\n5. Konsumsi makanan kaya antioksidan.",
                'author_id' => $pharmacist->id,
            ],
            [
                'title' => 'Panduan Aturan Pakai Antibiotik yang Benar dan Bahaya Resistensi',
                'slug' => 'panduan-aturan-pakai-antibiotik-dan-resistensi',
                'excerpt' => 'Mengapa obat antibiotik harus dihabiskan walau gejala sudah hilang? Simak penjelasan resmi apoteker.',
                'content' => "Antibiotik adalah obat pembunuh bakteri, bukan untuk flu biasa yang disebabkan virus. Menghentikan obat antibiotik secara sepihak sebelum dosis yang disarankan habis dapat menyebabkan bakteri kebal (resistensi antibiotik).",
                'author_id' => $pharmacist->id,
            ],
            [
                'title' => 'Mengenal Perbedaan Obat Bebas, Bebas Terbatas, dan Obat Keras',
                'slug' => 'perbedaan-obat-bebas-bebas-terbatas-dan-obat-keras',
                'excerpt' => 'Perhatikan tanda lingkaran hijau, biru, dan merah dengan huruf K pada kemasan obat Anda.',
                'content' => "Setiap obat di Indonesia memiliki logo lingkaran berwarna pada kemasannya:\n- Lingkaran Hijau: Obat Bebas\n- Lingkaran Biru: Obat Bebas Terbatas\n- Lingkaran Merah dengan huruf K: Obat Keras (Wajib resep dokter).",
                'author_id' => $pharmacist->id,
            ],
        ];

        foreach ($blogPosts as $b) {
            BlogPost::create([
                'title' => $b['title'],
                'slug' => $b['slug'],
                'excerpt' => $b['excerpt'],
                'content' => $b['content'],
                'author_id' => $b['author_id'],
                'is_published' => true,
                'published_at' => now()->subDays(rand(5, 40)),
            ]);
        }

        // 10. FAQs (6)
        $faqs = [
            ['question' => 'Bagaimana cara memesan obat yang memerlukan resep dokter?', 'answer' => 'Saat proses Checkout, Anda akan diminta mengunggah foto/file resep dokter yang jelas. Tim apoteker kami akan melakukan verifikasi sebelum pesanan diproses.', 'sort' => 1],
            ['question' => 'Berapa lama proses pengiriman obat?', 'answer' => 'Untuk area Bandung dan sekitarnya menggunakan Kurir Instant Apotek, pesanan dikirim dalam 1-3 jam setelah pembayaran terkonfirmasi. Untuk luar kota menggunakan JNE (1-3 hari kerja).', 'sort' => 2],
            ['question' => 'Apakah pembayaran COD (Bayar di Tempat) tersedia?', 'answer' => 'Ya, metode COD tersedia untuk pilihan Kurir Instant Apotek dan metode Ambil di Toko.', 'sort' => 3],
            ['question' => 'Apakah obat-obatan di Apotek Sehat Sentosa terjamin keasliannya?', 'answer' => '100% Terjamin Asli. Seluruh obat dan alat kesehatan dibeli langsung dari Distributor Resmi (PBF) terdaftar BPOM dan Kementerian Kesehatan RI.', 'sort' => 4],
            ['question' => 'Bagaimana jika pesanan obat saya kedaluwarsa atau rusak saat diterima?', 'answer' => 'Kami menggaransi penggantian 100% atau refund jika obat yang diterima dalam keadaan rusak/mendekati expiry date. Anda dapat mengajukan retur melalui menu Riwayat Pesanan di Akun Anda.', 'sort' => 5],
        ];

        foreach ($faqs as $f) {
            Faq::create([
                'question' => $f['question'],
                'answer' => $f['answer'],
                'sort_order' => $f['sort'],
                'is_active' => true,
            ]);
        }

        // 11. Historical Orders (110 orders over 60 days) to populate sales analytics, report charts, financial transactions
        $orderStatuses = [
            OrderStatus::COMPLETED, OrderStatus::COMPLETED, OrderStatus::COMPLETED,
            OrderStatus::DELIVERED, OrderStatus::SHIPPED, OrderStatus::PROCESSING,
            OrderStatus::PAID, OrderStatus::PENDING_PAYMENT, OrderStatus::CANCELLED,
        ];

        $paymentMethods = [PaymentMethod::MIDTRANS, PaymentMethod::MIDTRANS, PaymentMethod::COD];

        for ($i = 1; $i <= 110; $i++) {
            $customer = $customers[array_rand($customers)];
            $daysAgo = rand(0, 60);
            $createdAt = now()->subDays($daysAgo)->subHours(rand(1, 23))->subMinutes(rand(1, 59));

            $status = $orderStatuses[array_rand($orderStatuses)];
            $payMethod = $paymentMethods[array_rand($paymentMethods)];

            $itemCount = rand(1, 4);
            $selectedProducts = array_rand($products, $itemCount);
            if (!is_array($selectedProducts)) {
                $selectedProducts = [$selectedProducts];
            }

            $subtotal = 0;
            $itemsData = [];
            foreach ($selectedProducts as $pIdx) {
                $p = $products[$pIdx];
                $qty = rand(1, 3);
                $itemSubtotal = $p->price * $qty;
                $subtotal += $itemSubtotal;

                $itemsData[] = [
                    'product' => $p,
                    'qty' => $qty,
                    'price' => $p->price,
                    'cost_price' => $p->cost_price,
                    'subtotal' => $itemSubtotal,
                ];
            }

            $shippingMethod = $shippingMethods[array_rand($shippingMethods)];
            $shippingCost = $shippingMethod->base_cost;
            $discount = ($subtotal >= 100000 && rand(0, 1) === 1) ? 10000 : 0;
            $grandTotal = $subtotal - $discount + $shippingCost;

            $payStatus = match ($status) {
                OrderStatus::PAID, OrderStatus::PROCESSING, OrderStatus::SHIPPED, OrderStatus::DELIVERED, OrderStatus::COMPLETED => PaymentStatus::PAID,
                OrderStatus::REFUNDED => PaymentStatus::REFUNDED,
                OrderStatus::CANCELLED, OrderStatus::EXPIRED => PaymentStatus::FAILED,
                default => PaymentStatus::UNPAID,
            };

            $orderNumber = 'APT-' . $createdAt->format('Ymd') . '-' . str_pad($i, 4, '0', STR_PAD_LEFT);

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $customer->id,
                'status' => $status,
                'payment_method' => $payMethod,
                'payment_status' => $payStatus,
                'subtotal' => $subtotal,
                'discount_total' => $discount,
                'shipping_cost' => $shippingCost,
                'grand_total' => $grandTotal,
                'shipping_method_id' => $shippingMethod->id,
                'recipient_name' => $customer->name,
                'recipient_phone' => $customer->phone ?? '08123456789',
                'shipping_address' => 'Jl. Ganesha No. 10, Coblong, Kota Bandung',
                'expires_at' => $createdAt->copy()->addHours(24),
                'paid_at' => ($payStatus === PaymentStatus::PAID) ? $createdAt->copy()->addMinutes(15) : null,
                'completed_at' => ($status === OrderStatus::COMPLETED) ? $createdAt->copy()->addDays(2) : null,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            foreach ($itemsData as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product']->id,
                    'product_name' => $item['product']->name,
                    'sku' => $item['product']->sku,
                    'price' => $item['price'],
                    'cost_price' => $item['cost_price'],
                    'qty' => $item['qty'],
                    'subtotal' => $item['subtotal'],
                    'created_at' => $createdAt,
                ]);
            }

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => OrderStatus::PENDING_PAYMENT,
                'note' => 'Pesanan berhasil dibuat',
                'created_at' => $createdAt,
            ]);

            if ($payStatus === PaymentStatus::PAID) {
                OrderStatusHistory::create([
                    'order_id' => $order->id,
                    'status' => OrderStatus::PAID,
                    'note' => 'Pembayaran terverifikasi',
                    'created_at' => $createdAt->copy()->addMinutes(15),
                ]);

                // Payment record
                Payment::create([
                    'order_id' => $order->id,
                    'provider' => $payMethod->value,
                    'midtrans_order_id' => $payMethod === PaymentMethod::MIDTRANS ? 'MID-' . $orderNumber : null,
                    'gross_amount' => $grandTotal,
                    'transaction_status' => 'settlement',
                    'status' => PaymentStatus::PAID,
                    'paid_at' => $createdAt->copy()->addMinutes(15),
                    'created_at' => $createdAt,
                ]);

                // Financial Transaction (Income)
                FinancialTransaction::create([
                    'type' => TransactionType::INCOME,
                    'category' => TransactionCategory::SALES,
                    'amount' => $grandTotal,
                    'transaction_date' => $createdAt->copy()->format('Y-m-d'),
                    'description' => "Penjualan Order #{$orderNumber}",
                    'reference_type' => Order::class,
                    'reference_id' => $order->id,
                    'created_at' => $createdAt,
                ]);
            }

            if (in_array($status, [OrderStatus::SHIPPED, OrderStatus::DELIVERED, OrderStatus::COMPLETED])) {
                Shipment::create([
                    'order_id' => $order->id,
                    'courier' => $shippingMethod->name,
                    'tracking_number' => 'RESI' . rand(10000000, 99999999),
                    'cost' => $shippingCost,
                    'status' => $status === OrderStatus::SHIPPED ? ShipmentStatus::SHIPPED : ShipmentStatus::DELIVERED,
                    'shipped_at' => $createdAt->copy()->addHours(6),
                    'delivered_at' => in_array($status, [OrderStatus::DELIVERED, OrderStatus::COMPLETED]) ? $createdAt->copy()->addDays(1) : null,
                    'created_at' => $createdAt,
                ]);
            }
        }

        // 12. Operational Financial Transactions (Expenses) over 60 days
        for ($d = 0; $d < 60; $d += 7) {
            $txDate = now()->subDays($d)->format('Y-m-d');
            FinancialTransaction::create([
                'type' => TransactionType::EXPENSE,
                'category' => TransactionCategory::OPERATIONAL,
                'amount' => rand(200000, 800000),
                'transaction_date' => $txDate,
                'description' => 'Biaya Operasional & Listrik Apotek Mingguan',
                'created_by' => $admin->id,
            ]);
        }

        // 13. CRM Leads & Interactions
        $lead1 = CrmLead::create([
            'name' => 'Dr. Suwandi Sp.A',
            'phone' => '081299887766',
            'email' => 'suwandi@klinik.test',
            'source' => 'referral',
            'status' => 'contacted',
            'note' => 'Dokter anak tertarik kerjasama pengadaan vitamin rutin klinik.',
        ]);

        CrmInteraction::create([
            'lead_id' => $lead1->id,
            'type' => 'call',
            'summary' => 'Telepon perkenalan katalog obat anak dan syarat kerjasama klinik.',
            'interacted_at' => now()->subDays(3),
            'created_by' => $admin->id,
        ]);

        // 14. Page Visits for Analytics (200 random visits)
        $paths = ['/', '/produk', '/tentang-kami', '/kontak', '/faq', '/blog', '/promo'];
        for ($v = 0; $v < 200; $v++) {
            PageVisit::create([
                'path' => $paths[array_rand($paths)],
                'ip_hash' => md5('ip_' . rand(1, 30)),
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'visited_at' => now()->subDays(rand(0, 30))->subHours(rand(0, 23)),
            ]);
        }
    }
}
