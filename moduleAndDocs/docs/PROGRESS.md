# PROGRESS LOG
Agent: tambahkan entri baru di bagian atas setiap selesai satu fase.

## Status Fase
| Fase | Status | Catatan |
|---|---|---|
| 0 Setup | ✅ | MySQL terhubung, package terinstall, middleware `role` siap |
| 1 Database | ✅ | Migrasi (27+ tabel), 13 Enums, 29 Models, Seeder (42 produk, 110 order) |
| 2 Auth & Role | ✅ | Custom register (phone, role customer), Socialite Google, middleware `role`, Order/Address Policy |
| 3 Storefront Konten | ✅ | StoreLayout, AdminLayout, F1-F9 (Home, About, Contact, FAQ, Terms, Privacy, Testimonial, Blog, Promo), TrackVisit |
| 4 Katalog & Cart | ✅ | Katalog, detail produk, wishlist, & keranjang belanja dengan validasi stok |
| 5 Checkout & Midtrans | ✅ | Alamat, Checkout, Ongkir, Midtrans Snap, Webhook, COD, Restorasi Stok |
| 6 Akun Customer | ✅ | Riwayat pesanan, timeline status, retur barang, resep saya, lacak pesanan publik |
| 7 Admin Inventori | ✅ | Kategori, Produk, Stok Opname, Batches & Expiring, Supplier & Purchase Orders |
| 8 Admin Penjualan | ✅ | Manajemen Pesanan, Verifikasi Resep Dokter, Pembayaran & COD, Pengiriman & Resi, Retur & Refund |
| 9 Keuangan/CRM/Laporan | ✅ | Dashboard KPI, Jurnal Keuangan, Laporan Penjualan (CSV Export), Analitik Toko & CRM Leads |
| 10 Pengguna/Pengaturan/Konten | ✅ | Manajemen Pengguna & Role, Pengaturan Website, CMS Konten (FAQ, Promo, Blog, Testimoni, Pesan), Backup DB |
| 11 QA & Dokumentasi | ✅ | 81 Feature Tests Passed (257 assertions), QA Matrix, Demo Script, Backup SQL, README Final |

## Log

### Fase 11 — QA, Polishing, Automated Tests & Dokumentasi (selesai 2026-09-23)
**Yang dibuat/dikonfigurasi:**
- **Automated Feature Tests (`tests/Feature/Admin/`)**:
  - `AdminCatalogAndInventoryTest`: Pengujian CRUD kategori & produk (validasi harga/golongan obat), penyesuaian stok opname fisik, dan penerimaan Purchase Order supplier (otomatis menaikkan stok & mencatat expense keuangan).
  - `AdminOrderAndPrescriptionTest`: Pengujian alur verifikasi resep dokter (approval order -> paid; rejection order -> cancel & pemulihan stok), perubahan status pesanan, pengiriman resi kurir, konfirmasi pembayaran COD (mencatat pendapatan penjualan), dan persetujuan retur barang (pemulihan stok & pencatatan expense refund).
  - `AdminFinanceAndReportsTest`: Pengujian pencatatan beban operasional, ringkasan kas, ekspor file CSV laporan keuangan & penjualan, serta visualisasi analitik.
  - `AdminManagementAndContentTest`: Pengujian manajemen pengguna & role (Admin/Apoteker/Customer), perubahan pengaturan toko, CRUD FAQ, voucher promo, artikel blog, moderasi testimoni pelanggan, dan penandaan pesan kontak.
- **Database Backup Verification**:
  - `php artisan app:backup-db` berhasil mengekspor seluruh skema dan data produksi ke `database/dump/apotek_erp.sql`.
- **Dokumentasi & QA**:
  - `README.md` diperbarui dengan arsitektur lengkap, petunjuk instalasi cepat, akun kredensial default, dan skrip demo 10 menit.
  - `moduleAndDocs/docs/06-TESTING-QA.md` diisi lengkap dengan tabel hasil verifikasi uji TC-01 s/d TC-22.
  - `moduleAndDocs/docs/05-ROADMAP.md` ditandai selesai 100% untuk semua fase.
  - `moduleAndDocs/docs/07-TEAM-REPORT.md` dilengkapi skrip demo dan rekap deliverable.

**Verifikasi:**
- `php artisan test`: 81/81 passed (100%), 257 assertions.
- `npm run build`: Sukses (Vite bundle 100%).
- `php artisan app:backup-db`: Sukses.

---

### Fase 10 — Admin: Pengguna, Pengaturan & CMS Konten Storefront (selesai 2026-09-23)
**Yang dibuat/dikonfigurasi:**
- **Controllers & Commands**:
  - `AdminUserController` (`app/Http/Controllers/Admin/AdminUserController.php`): CRUD pengguna, pengaturan role (`admin`, `pharmacist`, `customer`), reset password & validasi proteksi akun sendiri.
  - `AdminSettingController` (`app/Http/Controllers/Admin/AdminSettingController.php`): Update identitas apotek, kontak (telepon, WhatsApp, email), alamat, jam operasional, visi-misi, syarat & ketentuan, serta kebijakan privasi.
  - `AdminContentController` (`app/Http/Controllers/Admin/AdminContentController.php`): Pengelolaan FAQ, voucher promo (persen/nominal, kuota, periode), artikel blog edukasi kesehatan, moderasi testimoni pembeli, dan manajemen pesan kontak masuk.
  - `BackupDatabase` (`app/Console/Commands/BackupDatabase.php`): Command `php artisan app:backup-db` yang mengekspor schema dan data MySQL ke `database/dump/apotek_erp.sql`.
- **Pages (React & Inertia)**:
  - `resources/js/pages/admin/users/index.tsx`
  - `resources/js/pages/admin/settings/index.tsx`
  - `resources/js/pages/admin/content/faqs.tsx`
  - `resources/js/pages/admin/content/promos.tsx`
  - `resources/js/pages/admin/content/blogs.tsx`
  - `resources/js/pages/admin/content/testimonials.tsx`
  - `resources/js/pages/admin/content/messages.tsx`
- **Sidebar Admin**:
  - `AdminLayout.tsx` diperbarui dengan tautan lengkap ke modul Pengguna, Pengaturan, FAQ, Promo, Blog, Testimoni, dan Pesan Masuk.

**Verifikasi:**
- `php artisan test`: 61/61 passed.
- `npm run build`: Sukses.

---

### Fase 9 — Keuangan, CRM, Analitik & Laporan (selesai 2026-09-23)
**Yang dibuat/dikonfigurasi:**
- **Controllers**:
  - `AdminDashboardController`: KPI cards (pendapatan, pesanan baru, obat menipis, verifikasi resep pending), grafik tren penjualan 14 hari Recharts, dan tabel aktivitas terbaru.
  - `AdminFinanceController`: Ringkasan keuangan (pemasukan, pengeluaran, laba bersih), formulir input biaya operasional, dan export transaksi ke file CSV.
  - `AdminReportController`: Laporan penjualan harian dan bulanan dengan rincian omzet, COGS, laba kotor, dan ekspor CSV.
  - `AdminAnalyticsController`: Analitik pengunjung web, konversi penjualan, grafik produk terlaris, dan segmentasi kategori obat.
  - `AdminCrmController`: Manajemen prospek pelanggan (Leads), pipeline status, dan pencatatan interaksi follow-up via WhatsApp/Telepon/Email.
- **Pages (React & Inertia)**:
  - `resources/js/pages/admin/dashboard.tsx`
  - `resources/js/pages/admin/finance/index.tsx`
  - `resources/js/pages/admin/reports/sales.tsx`
  - `resources/js/pages/admin/analytics/index.tsx`
  - `resources/js/pages/admin/crm/index.tsx` & `show.tsx`

**Verifikasi:**
- `php artisan test`: 61/61 passed.
- `npm run build`: Sukses.

---

### Fase 8 — Admin: Penjualan & Operasional (selesai 2026-09-23)
**Yang dibuat/dikonfigurasi:**
- **Controllers**:
  - `AdminOrderController`: Filter status pesanan, detail pesanan, dan transisi status (`OrderService`).
  - `PrescriptionVerificationController`: Verifikasi resep dokter (approval pesanan ke status paid, rejection membatalkan pesanan & mengembalikan stok).
  - `AdminPaymentController`: Konfirmasi pelunasan COD & pembayaran transfer manual, otomatis mencatat income penjualan di jurnal kas.
  - `AdminShipmentController`: Input kurir & nomor resi pengiriman, serta pembaruan status delivered.
  - `AdminReturnController`: Moderasi pengajuan retur barang (approve mengembalikan stok fisik dan mencatat beban refund).
  - `AdminCustomerController`: Direktori data pelanggan dan riwayat transaksi belanja.
- **Pages (React & Inertia)**:
  - `resources/js/pages/admin/orders/index.tsx` & `show.tsx`
  - `resources/js/pages/admin/prescriptions/index.tsx`
  - `resources/js/pages/admin/payments/index.tsx`
  - `resources/js/pages/admin/shipments/index.tsx`
  - `resources/js/pages/admin/returns/index.tsx`
  - `resources/js/pages/admin/customers/index.tsx` & `show.tsx`

**Verifikasi:**
- `php artisan test`: 61/61 passed.
- `npm run build`: Sukses.

---

### Fase 7 — Admin: Katalog & Inventori (selesai 2026-09-23)
**Yang dibuat/dikonfigurasi:**
- **Controllers**:
  - `CategoryController`: CRUD kategori produk dengan upload gambar.
  - `ProductController`: CRUD master obat, penetapan harga jual/beli, pemilihan golongan obat (`DrugClass`), tanda wajib resep, dan upload foto obat.
  - `StockController`: Monitor stok kritis/menipis/habis, penyesuaian stok opname fisik manual, riwayat pergerakan stok, dan daftar batch kedaluwarsa.
  - `SupplierController`: Master data pemasok obat & distributor farmasi.
  - `PurchaseController`: Pembuatan Purchase Order (PO) pembelian stok & penerimaan barang yang menambah stok fisik dan mencatat beban pengeluaran.
- **Pages (React & Inertia)**:
  - `resources/js/pages/admin/categories/index.tsx`
  - `resources/js/pages/admin/products/index.tsx` & `form.tsx`
  - `resources/js/pages/admin/stock/index.tsx`, `batches.tsx`, `movements.tsx`
  - `resources/js/pages/admin/suppliers/index.tsx`
  - `resources/js/pages/admin/purchases/index.tsx`, `create.tsx`, `show.tsx`

**Verifikasi:**
- `php artisan test`: 61/61 passed.
- `npm run build`: Sukses.

---

### Fase 6 — Akun Customer (selesai 2026-09-23)
**Yang dibuat/dikonfigurasi:**
- **Controllers & Policy**:
  - `CustomerOrderController`: Daftar pesanan saya, detail pesanan dengan timeline status, tombol pembatalan pesanan pending, dan form pengajuan retur/penukaran barang.
  - `MyPrescriptionController`: Riwayat foto resep dokter yang diunggah pelanggan beserta status telaah apoteker.
  - `TrackOrderController`: Halaman pelacakan pesanan publik dengan nomor order & nomor HP/email penerima.
- **Pages (React & Inertia)**:
  - `resources/js/pages/store/orders.tsx` & `order-detail.tsx`
  - `resources/js/pages/store/prescriptions.tsx`
  - `resources/js/pages/store/tracking.tsx`

**Verifikasi:**
- `php artisan test`: 61/61 passed.
- `npm run build`: Sukses.

---

### Fase 5 — Checkout, Pengiriman, Pembayaran (selesai 2026-09-23)
- Alamat pelanggan, Checkout, Kalkulasi ongkir kurir, Midtrans Snap token, Webhook notifikasi Midtrans, Penanganan COD, Command pembatalan order kedaluwarsa (`orders:expire`).

---

### Fase 4 — Katalog, Wishlist, Keranjang (selesai 2026-09-22)
- Katalog obat berfilter, Detail produk lengkap, Keranjang belanja & Wishlist responsif.

---

### Fase 3 — Storefront Statis & Konten (selesai 2026-09-22)
- StoreLayout, AdminLayout, Beranda, Tentang Kami, FAQ, S&K, Privasi, Testimoni, Blog, Promo, dan Kontak.

---

### Fase 2 — Auth & Role (selesai 2026-09-22)
- Custom Registration, Socialite Google, Role middleware (`role:admin`), dan Policies kepemilikan.

---

### Fase 1 — Database, Model, Seeder (selesai 2026-09-22)
- 27+ Tabel, 13 Enums, 29 Models, dan Seeder 42 obat realistis & 110 order historis 60 hari.

---

### Fase 0 — Setup (selesai 2026-09-22)
- Inisialisasi stack Laravel 12 + Inertia React + TailwindCSS `#8CA9FF` + MySQL.
