# Apotek Mandiri Sehat — Web ERP & Storefront Apotek Modern

> Sistem Informasi Manajemen Farmasi (ERP) dan E-Commerce Apotek Terintegrasi berbasis **Laravel 12, Inertia.js, React 19, TailwindCSS, dan MySQL**. Dilengkapi integrasi Payment Gateway **Midtrans Snap**, alur verifikasi resep dokter, manajemen inventori FEFO/Batch, pembukuan kas otomatis, serta analitik penjualan.

---

## 🌟 Fitur Utama Sistem

### 🛒 1. Storefront & E-Commerce Pelanggan
- **Katalog Obat Lengkap**: Filter kategori obat, golongan obat (*Obat Bebas, Bebas Terbatas, Obat Keras/Wajib Resep, Herbal, Suplemen*), rentang harga, dan status wajib resep dokter.
- **Pencarian Cepat & Sorting**: Pengurutan berdasarkan popularitas, produk terbaru, dan harga terendah/tertinggi.
- **Keranjang Belanja & Wishlist**: Validasi stok real-time, penyesuaian kuantitas langsung, dan tanda peringatan obat resep dokter.
- **Alamat & Kalkulasi Ongkir**: Pengelolaan alamat bertingkat dan perhitungan ongkos kirim otomatis berdasarkan berat produk (*ShippingService*).
- **Checkout & Unggah Resep Dokter**: Wajib melampirkan foto resep dokter asli saat memesan obat keras.
- **Opsi Pembayaran Ganda**:
  - **Midtrans Snap Popup**: Virtual Account (BCA, BNI, BRI, Mandiri), GoPay, QRIS, dan Kartu Kredit.
  - **Cash on Delivery (COD)**: Bayar tunai di tempat saat kurir apotek mengantarkan pesanan.
- **Lacak Pesanan Publik**: Pelacakan status pengiriman dan nomor resi secara publik tanpa harus login.
- **Portal Akun Customer**: Riwayat pesanan, timeline pengiriman real-time, pembatalan pesanan pending, dan form pengajuan retur/penukaran barang dengan bukti foto.
- **Konten Edukasi & Interaksi**: Artikel Blog Kesehatan, Halaman Promo & Diskon Voucher, Testimoni Pelanggan, FAQ, serta Formulir Kontak Apotek.

### 🏢 2. Back-Office ERP & Farmasi (Admin & Apoteker)
- **Dashboard KPI Eksekutif**: Ringkasan omzet harian, total order, peringatan stok kritis, resep menunggu verifikasi, dan grafik tren pendapatan Recharts.
- **Katalog & Master Obat**: CRUD kategori obat, pengelolaan satuan, harga beli/jual, komposisi, indikasi, dan klasifikasi BPOM.
- **Inventori & Stok Opname**:
  - Penyesuaian stok fisik manual (*Stock Movement Audit Trail*).
  - Monitoring nomor batch dan tanggal kedaluwarsa obat (*Expiring Soon Alert*).
  - Peringatan stok menipis (*Low Stock Alert*).
- **Pembelian Supplier (PO)**: Manajemen pemasok distributor obat, pembuatan Purchase Order, dan penerimaan barang masuk yang otomatis menambah stok dan mencatat pengeluaran kas.
- **Operasional Pesanan**: Perubahan tahapan pesanan (*Paid → Processing → Shipped → Delivered → Completed*).
- **Verifikasi Resep Apoteker**: Telaah foto resep dokter oleh apoteker berwenang (*Approve* untuk memproses pesanan, atau *Reject* untuk membatalkan pesanan dan otomatis memulihkan stok).
- **Pengiriman & Ekspedisi**: Input nomor resi kurir, pembaruan status logistik, dan pelacakan paket.
- **Konfirmasi Pembayaran COD**: Verifikasi serah terima uang COD yang otomatis menyelesaikan pesanan dan membukukan pendapatan kas.
- **Manajemen Retur**: Verifikasi pengembalian barang yang otomatis memulihkan stok fisik dan mencatat beban refund.
- **Keuangan & Laba-Rugi**:
  - Jurnal transaksi pendapatan (*sales*) dan beban operasional (*expenses*).
  - Laporan laba kotor & laba bersih.
  - Ekspor seluruh mutasi kas ke format **CSV**.
- **Laporan Penjualan & Analitik**: Laporan penjualan harian/bulanan, grafik performa Recharts, analitik pengunjung web (*Page Visits*), dan produk terlaris.
- **CRM (Customer Relationship Management)**: Manajemen prospek (*Leads*), tahapan pipeline, serta riwayat interaksi pelanggan via WhatsApp/Telepon/Email.
- **Manajemen Akses & Pengguna**: Pembagian hak akses berbasis Role (*Admin*, *Pharmacist/Apoteker*, *Customer*).
- **Pengaturan Website & CMS**: Pengaturan logo, kontak, jam buka, syarat & ketentuan, serta CMS FAQ, Banner Promo, Blog, dan Inbox Pesan.
- **Pencadangan Database Otomatis**: CLI Command `php artisan app:backup-db` yang mengekspor schema dan seluruh data ke `database/dump/apotek_erp.sql`.

---

## 🛠️ Arsitektur & Teknologi

| Lapisan | Teknologi |
|---|---|
| **Backend Framework** | Laravel 12 (PHP 8.2+) |
| **Frontend Framework** | React 19 + Inertia.js v2 |
| **Styling & Design System** | TailwindCSS 4, Lucide React Icons, Palet `#8CA9FF` |
| **Visualisasi Grafik** | Recharts v3.10 |
| **Database** | MySQL 8.0+ |
| **Payment Gateway** | Midtrans PHP SDK (Snap API & Webhook Handler) |
| **Autentikasi & RBAC** | Laravel Starter Kit, Custom EnsureRole Middleware, Policies |
| **Testing Engine** | Pest PHP / PHPUnit (81 Feature Tests Passed) |

---

## 🔗 Integrasi Dashboard Admin Klinik (Premysis Medika)

Backend ini juga melayani **dashboard admin klinik Premysis Medika** dan **aplikasi
pasien** sekaligus, sehingga keduanya berbagi satu basis data (PRD N-05). Permukaan
API khusus dashboard ada di prefiks **`/api/admin`**.

| Dokumen | Isi |
|---|---|
| [`docs/INTEGRASI_BACKEND.md`](docs/INTEGRASI_BACKEND.md) | Latar belakang, pemetaan domain apotek ➜ kontrak dashboard, skema klinis, aturan bisnis, cara menjalankan |
| [`docs/API_ADMIN.md`](docs/API_ADMIN.md) | Referensi lengkap endpoint `/api/admin`: autentikasi, snapshot, CRUD, aksi khusus, kode status |

```bash
# Siapkan skema klinis + akun petugas & data klinis
php artisan migrate --force
php artisan db:seed --class=ClinicSeeder --force
```

---

## 🚀 Panduan Instalasi Cepat

### 1. Kebutuhan Sistem
- PHP >= 8.2 (dengan ekstensi `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `gd`/`imagick`)
- Composer >= 2.x
- Node.js >= 20.x & npm
- MySQL Server >= 8.0 (atau Laravel Herd / XAMPP)

### 2. Langkah Clone & Setup Environment
```bash
# 1. Masuk ke direktori proyek
cd erp_apotek

# 2. Salin environment file bila belum ada
cp .env.example .env

# 3. Install dependensi PHP & JavaScript
composer install
npm install

# 4. Generate application key & storage symlink
php artisan key:generate
php artisan storage:link
```

### 3. Konfigurasi Database & Midtrans (`.env`)
Pastikan konfigurasi `.env` sesuai dengan database MySQL lokal Anda:
```env
APP_NAME="Apotek Mandiri Sehat"
APP_URL=http://localhost:8000
APP_LOCALE=id

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=apotek_erp
DB_USERNAME=root
DB_PASSWORD=

# Kunci Midtrans Sandbox (Ganti dengan akun Anda jika perlu)
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false
```

### 4. Migrasi & Seeding Data Awal
Jalankan migrasi database dan pengisian data uji realistis (40+ produk obat, batch stok, 110 order historis, laporan keuangan, artikel blog, dan testimoni):
```bash
php artisan migrate:fresh --seed
```

### 5. Kompilasi Frontend & Menjalankan Server
```bash
# Kompilasi asset frontend (Production Build)
npm run build

# Atau jalankan Vite dev server untuk pengembangan
npm run dev

# Jalankan server aplikasi Laravel
php artisan serve
```
Buka browser Anda di `http://localhost:8000` atau domain lokal Herd Anda `http://erp-apotek.test`.

---

## 🔑 Akun Uji Coba Default (Kredensial)

| Role Akun | Email Login | Password | Akses & URL |
|---|---|---|---|
| **Super Admin** | `admin@apotek.test` | `password` | Akses penuh ERP (`/admin`) |
| **Apoteker (Pharmacist)** | `apoteker@apotek.test` | `password` | Verifikasi resep & stok farmasi (`/admin`) |
| **Pelanggan (Customer)** | `budi@example.com` | `password` | Storefront & Akun Saya (`/`) |
| **Pelanggan Baru** | Daftar via `/register` | Sesuai input | Otomatis mendapat role `customer` |

---

## 🧪 Pengujian Otomatis (Feature Tests)

Seluruh modul telah divalidasi dengan pengujian otomatis Pest/PHPUnit:
```bash
# Jalankan seluruh test suite (81 tests, 257 assertions)
php artisan test
```

Hasil verifikasi:
```text
✓ tests/Feature/Admin/AdminCatalogAndInventoryTest.php
✓ tests/Feature/Admin/AdminOrderAndPrescriptionTest.php
✓ tests/Feature/Admin/AdminFinanceAndReportsTest.php
✓ tests/Feature/Admin/AdminManagementAndContentTest.php
✓ tests/Feature/AuthAndRoleTest.php
✓ tests/Feature/CheckoutAndPaymentTest.php
✓ tests/Feature/CustomerAccountTest.php
✓ tests/Feature/StorefrontPagesTest.php

Tests:    81 passed (257 assertions)
Duration: 4.20s
```

---

## 💾 Pencadangan & Pemulihan Database

### Cadangkan Database Saat Ini:
```bash
php artisan app:backup-db
```
File SQL akan tersimpan di:
- `database/dump/apotek_erp.sql` (file dump utama)
- `database/dump/backup_YYYY_MM_DD_HHMMSS.sql` (arsip bertanggal)

### Pulihkan Database dari Dump:
```bash
mysql -u root -p apotek_erp < database/dump/apotek_erp.sql
```

---

## 🎬 Skrip Panduan Demo Sistem (10–15 Menit)

Gunakan skenario berikut saat mempresentasikan sistem:

1. **Pengenalan Storefront & Katalog (2 Menit)**:
   - Buka Beranda (`/`), jelaskan banner promo, kategori obat, dan testimoni pelanggan.
   - Buka Katalog Obat (`/produk`), peragakan filter golongan obat (*Bebas* vs *Obat Keras/Wajib Resep*), pencarian obat, dan drawer filter.
   - Buka detail produk, perhatikan badge *"Wajib Resep Dokter"*, informasi komposisi obat, dan batas stok tersedia.
2. **Pemesanan Obat Bebas & Midtrans Sandbox (3 Menit)**:
   - Tambah obat bebas ke keranjang belanja (`/keranjang`).
   - Lanjutkan ke Checkout (`/checkout`), pilih alamat dan kurir pengiriman.
   - Pilih metode pembayaran **Midtrans Payment Gateway** dan klik Bayar Sekarang.
   - Popup Midtrans Snap akan muncul; simulasikan pembayaran sukses.
   - Tunjukkan bahwa stok obat berkurang otomatis, transaksi tercatat sebagai *PAID*, dan pemasukan tercatat di kas.
3. **Pemesanan Obat Keras & Verifikasi Resep Apoteker (3 Menit)**:
   - Pesan obat keras (misal: *Amoxicillin* atau *Cefixime*).
   - Di checkout, sistem mewajibkan unggah foto resep dokter.
   - Selesaikan pesanan; status pesanan menjadi `Menunggu Verifikasi Resep`.
   - Login sebagai Admin/Apoteker di `/admin/resep`.
   - Periksa foto resep dokter, klik **Setujui Resep** (pesanan berlanjut) atau **Tolak Resep** (pesanan batal dan stok obat otomatis dipulihkan).
4. **Operasional Pengiriman & Lacak Pesanan (2 Menit)**:
   - Buka `/admin/pesanan` dan `/admin/pengiriman`.
   - Klik Kirim Pesanan, masukkan nama kurir dan nomor resi pengiriman.
   - Buka halaman publik Lacak Pesanan (`/lacak-pesanan`), masukkan nomor pesanan dan no HP untuk melihat timeline pengiriman.
5. **Inventori, Batch & Stok Opname (2 Menit)**:
   - Buka `/admin/stok` untuk melihat indikator stok kritis (*Low Stock*) dan tanggal kedaluwarsa (*Expiring Batches*).
   - Lakukan penyesuaian stok (*Stock Opname*) manual, periksa riwayat pergerakan stok (*Stock Movements*).
   - Buka modul Pembelian PO (`/admin/pembelian`), terima barang masuk dari supplier untuk melihat stok bertambah dan beban kas tercatat.
6. **Laporan Keuangan, Ekspor CSV & Analitik (2 Menit)**:
   - Buka `/admin/keuangan` untuk melihat buku kas, input biaya operasional, dan klik tombol **Ekspor CSV**.
   - Buka `/admin/laporan/penjualan` dan `/admin/analitik` untuk melihat visualisasi omzet dan produk terlaris berbasis Recharts.
   - Tunjukkan modul Pengaturan Toko (`/admin/pengaturan`) dan bagaimana perubahannya langsung tampil di storefront.
7. **Pencadangan Database & Penutup**:
   - Jalankan `php artisan app:backup-db` di terminal dan tunjukkan file SQL tersimpan aman di `database/dump/apotek_erp.sql`.
