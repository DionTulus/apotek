# 07 — Pembagian Peran, Timeline & Laporan Tim

## 1. Pembagian Peran & Tanggung Jawab
| Peran | Tanggung Jawab Utama | Deliverable yang Diselesaikan |
|---|---|---|
| **Project Manager & System Analyst** | Manajemen timeline 8 minggu, perancangan SRS, Use Case, BPMN flow, koordinasi rapat, penyusunan dokumentasi akhir & skrip demo. | Dokumen SRS, Use Case, Checklist Fase 0–11, Laporan Tim & Skrip Presentasi. |
| **Software & Database Engineer** | Perancangan ERD (27+ tabel), migrasi database, model Eloquent, relasi & scopes, logika bisnis ERP (stok, batch, pembelian, keuangan), integrasi Payment Gateway Midtrans Snap & Webhook, command pencadangan database. | 27+ Tabel DB, 29 Models, 13 Enums, DatabaseSeeder, Service Classes (`CheckoutService`, `PaymentService`, `FinanceService`, `ShippingService`), Command `app:backup-db`, Dump SQL. |
| **Frontend & UI/UX Developer** | Desain UI/UX sistem storefront & admin modern (palet `#8CA9FF`, font modern, dark/light mode), halaman React 19 + Inertia.js responsif, visualisasi grafik Recharts, drawer mobile filter, form validasi interaktif. | 20+ Halaman Storefront (Katalog, Checkout, Payment, Lacak, Profil), 15+ Halaman Admin ERP (Dashboard KPI, Inventori, Pesanan, Resep, Keuangan, CMS). |
| **Quality Assurance (QA) Specialist** | Perancangan Test Plan, penulisan automated feature tests (Pest/PHPUnit), pengujian skenario manual TC-01 s/d TC-22, regresi penuh alur belanja, validasi respon mobile (375px & 768px), dan pemeriksaan pesan kesalahan Bahasa Indonesia. | 81 Feature Tests (100% Passed, 257 assertions), Dokumen `06-TESTING-QA.md`, Validasi Zero Bug Critical/High. |

---

## 2. Timeline Pelaksanaan Proyek (8 Minggu)
| Minggu | Fokus Kegiatan | Status | Hasil Deliverable |
|---|---|:---:|---|
| **Minggu 1** | Analisis kebutuhan sistem apotek, SRS, Use Case, perancangan ERD, inisialisasi environment Laravel 12 + React + MySQL. | Selesai | Dokumen kebutuhan, setup repo, `.env`, koneksi DB MySQL, paket Midtrans & Recharts terpasang. |
| **Minggu 2** | Pembuatan 27+ tabel migrasi, model, enum, relasi database, seeder realistis 40+ obat & 110 order historis, custom auth, RBAC middleware. | Selesai | Migrasi, Seeder, `EnsureRole` middleware, redirect dashboard berbasis role. |
| **Minggu 3** | Pembangunan storefront statis & konten apotek (Beranda, Tentang Kami, FAQ, S&K, Privasi, Testimoni, Blog, Promo, Kontak, middleware TrackVisit). | Selesai | Seluruh halaman informasi publik apotek aktif dan responsif. |
| **Minggu 4** | Modul katalog obat interaktif dengan filter kategori & golongan BPOM, pencarian, detail dosis/komposisi, keranjang belanja, dan wishlist. | Selesai | Halaman katalog, keranjang belanja real-time, badge resep dokter. |
| **Minggu 5** | Alamat bertingkat, kalkulasi ongkos kirim kurir, alur checkout, integrasi Midtrans Snap & Webhook callback, Cash on Delivery (COD), auto-cancel scheduler. | Selesai | Transaksi pembayaran berhasil end-to-end dengan pemulihan stok jika kedaluwarsa. |
| **Minggu 6** | Portal akun pelanggan (riwayat order, pembatalan, ajukan retur, resep saya, lacak publik), admin inventori, batch expiry, dan pembelian PO supplier. | Selesai | Alur pelanggan terhubung ke admin inventori fisik & pembelian barang. |
| **Minggu 7** | Admin operasional pesanan, verifikasi resep apoteker, pengiriman & input resi kurir, konfirmasi COD, pembukuan kas, laba-rugi, analitik, dan CRM leads. | Selesai | Alur operasional penjualan terhubung otomatis ke jurnal keuangan dan analitik Recharts. |
| **Minggu 8** | Admin pengaturan apotek, CMS konten, backup database CLI, penulisan 81 automated tests, QA matrix TC-01 s/d TC-22, dan finalisasi dokumentasi. | Selesai | Sistem 100% siap demo & produksi; `php artisan test` 81 passed; build assets bersih. |

---

## 3. Integrasi Antar Modul ERP (Siklus Bisnis Apotek)

```
[Storefront / Customer]
        │
        ▼ (Checkout Obat Keras + Resep)
[Prescription Verification (Apoteker)] ──Reject──► Pesanan Batal & Stok Dipulihkan
        │ Approve
        ▼
[Pembayaran (Midtrans / COD)] ──────────────────► Jurnal Kas: Pendapatan Penjualan
        │
        ▼
[Pengiriman & Logistik] ────────────────────────► Input Resi Kurir & Lacak Pesanan
        │
        ▼
[Penerimaan / Retur Barang] ────────────────────► Stok Fisik Dipulihkan + Beban Refund
        ▲
        │ (Pengadaan Barang Masuk)
[Purchase Order Supplier] ──────────────────────► Stok Fisik Bertambah + Beban Pembelian
```

---

## 4. Skrip Panduan Presentasi & Demo (10–15 Menit)

1. **Pembukaan & Latar Belakang (PM / 2 Menit)**:
   - Sampaikan masalah operasional apotek tradisional (resep menumpuk, stok kedaluwarsa tidak terpantau, pencatatan kas manual).
   - Tunjukkan solusi terintegrasi: Web ERP Apotek Mandiri Sehat.
2. **E-Commerce & Storefront Pelanggan (Frontend Dev / 3 Menit)**:
   - Jelaskan halaman Beranda, Banner Promo, dan Testimoni.
   - Peragakan filter katalog obat (kategori, golongan obat *Bebas* vs *Obat Keras/Wajib Resep*).
   - Masukkan produk ke keranjang, tunjukkan validasi kuantitas vs stok fisik.
3. **Checkout, Unggah Resep Dokter & Midtrans Snap (Fullstack Dev / 3 Menit)**:
   - Buka halaman checkout, pilih alamat tersimpan dan kurir pengiriman.
   - Unggah foto resep dokter untuk obat golongan keras.
   - Tunjukkan popup Midtrans Snap dan selesaikan transaksi di sandbox.
   - Tunjukkan pengurangan stok otomatis dan pembuatan riwayat status pesanan.
4. **Verifikasi Resep & Pengiriman Admin (Backend Dev / 3 Menit)**:
   - Login ke portal admin `/admin/resep`.
   - Buka foto resep, klik **Setujui Resep**.
   - Buka menu Pengiriman, input nomor resi pengiriman JNE.
   - Buka halaman publik `/lacak-pesanan` untuk melihat timeline status paket.
5. **Inventori, Keuangan, Laporan & Backup (DB / QA / 3 Menit)**:
   - Buka menu Stok: tunjukkan indikator obat menipis (*Low Stock*) dan batch kedaluwarsa.
   - Buka menu Keuangan: tunjukkan pendapatan penjualan yang otomatis masuk ke buku kas, input biaya operasional, dan lakukan ekspor file CSV.
   - Peragakan grafik performa di Dashboard KPI dan Laporan Penjualan.
   - Jalankan `php artisan test` (81 feature tests passed) dan `php artisan app:backup-db` di terminal.
6. **Sesi Tanya Jawab (Seluruh Tim / 2 Menit)**.

---

## 5. Ringkasan Hasil Pengujian Kualitas (QA)
- **Total Test Suites**: 8 Feature Test Files.
- **Total Unit & Feature Tests**: 81 tests, 257 assertions (100% Passed).
- **Frontend Asset Bundle**: `npm run build` sukses dalam waktu <15 detik dengan chunking rapi dan zero warning/error.
- **Tingkat Responsivitas**: Telah diuji pada resolusi 375px (smartphone), 768px (tablet), dan 1280px+ (desktop).
- **Integritas Database**: Relasi Foreign Key dengan cascade/restrict yang tepat, mutasi pergerakan stok selalu seimbang, dan pencatatan kas pendapatan/beban akurat.
