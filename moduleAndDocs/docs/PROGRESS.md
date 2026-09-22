# PROGRESS LOG
Agent: tambahkan entri baru di bagian atas setiap selesai satu fase.

## Status Fase
| Fase | Status | Catatan |
|---|---|---|
| 0 Setup | ✅ | MySQL terhubung, package terinstall, middleware `role` siap |
| 1 Database | ✅ | Migrasi (27+ tabel), 13 Enums, 29 Models, Seeder (42 produk, 110 order) |
| 2 Auth & Role | ✅ | Custom register (phone, role customer), Socialite Google, middleware `role`, Order/Address Policy |
| 3 Storefront Konten | ✅ | StoreLayout, AdminLayout, F1-F9 (Home, About, Contact, FAQ, Terms, Privacy, Testimonial, Blog, Promo), TrackVisit |
| 4 Katalog & Cart | ⬜ | |
| 5 Checkout & Midtrans | ⬜ | |
| 6 Akun Customer | ⬜ | |
| 7 Admin Inventori | ⬜ | |
| 8 Admin Penjualan | ⬜ | |
| 9 Keuangan/CRM/Laporan | ⬜ | |
| 10 Pengguna/Pengaturan/Konten | ⬜ | |
| 11 QA & Dokumentasi | ⬜ | |

## Log

### Fase 3 — Storefront Statis & Konten (selesai 2026-09-22)
**Yang dibuat/dikonfigurasi:**
- **Shared Props & Middleware**: `HandleInertiaRequests` membagikan `settings`, `cartCount`, `wishlistCount`, dan `flash` (success/error). `TrackVisit` middleware mencatat analitik `page_visits` publik.
- **Layouts**:
  - `StoreLayout` (`resources/js/layouts/store-layout.tsx`): Navbar responsif dengan brand biru `#8CA9FF`, search bar obat, badge keranjang/wishlist, menu navigasi, topbar kontak & WhatsApp, footer lengkap.
  - `AdminLayout` (`resources/js/layouts/admin-layout.tsx`): Sidebar navigasi ERP untuk seluruh 16 modul admin + header profile & logout.
- **Storefront Pages (F1 – F9)**:
  - **F1 Beranda** (`/`): Hero banner, keunggulan BPOM & instant delivery, grid kategori, produk terlaris & rekomendasi, promo banner, testimoni pembeli.
  - **F2 Tentang Kami** (`/tentang-kami`): Visi & Misi dari DB `settings`, profil apotek, nilai keunggulan.
  - **F3 Kontak Kami** (`/kontak`): Detail kontak, form kirim pesan (`POST /kontak` dengan rate limit & simpan DB), Google Maps embed iframe.
  - **F4 FAQ** (`/faq`): Accordion tanya jawab interaktif dengan filter pencarian.
  - **F5 Syarat & Ketentuan** (`/syarat-ketentuan`) & **F6 Kebijakan Privasi** (`/kebijakan-privasi`).
  - **F7 Testimoni Pelanggan** (`/testimoni`): Grid rating bintang & form submit testimoni untuk user terotentikasi.
  - **F8 Blog / Berita** (`/blog` & `/blog/{slug}`): Daftar artikel kesehatan terpublikasi & detail artikel.
  - **F9 Promo / Diskon** (`/promo`): Kupon voucher aktif dengan tombol salin kode otomatis.

**Verifikasi:**
- `php artisan test`: 53/53 passed (100%), termasuk `StorefrontPagesTest`.
- `npm run build`: Sukses (Vite bundle 100%).

### Fase 2 — Auth & Role (selesai 2026-09-22)
**Yang dibuat/dikonfigurasi:**
- **Custom Registration**: `CreateNewUser` diperbarui untuk memvalidasi `phone` dan menetapkan role default `Role::CUSTOMER`.
- **Socialite Google Login**: `SocialiteController` (`/auth/google/redirect` & `/auth/google/callback`) terintegrasi dengan penanganan gracefully jika kredensial `.env` kosong. `config/services.php` diperbarui.
- **Role-based Redirection & Middleware**: `EnsureRole` middleware bekerja dengan Enum/string `role:admin`. Akses `/admin` dibatasi hanya untuk admin (403 jika customer).
- **Policies**: `OrderPolicy` & `AddressPolicy` dibuat untuk otorisasi kepemilikan pesanan dan alamat.
- **Admin Dashboard Page**: `resources/js/pages/admin/dashboard.tsx` komponen React awal dibuat.

**Verifikasi:**
- `php artisan test`: 44/44 passed (100%), termasuk test khusus `AuthAndRoleTest`.
- `npm run build`: Sukses.

### Fase 1 — Database, Model, Seeder (selesai 2026-09-22)
**Yang dibuat/dikonfigurasi:**
- **13 Enums** (`Role`, `DrugClass`, `StockMovementType`, `OrderStatus`, `PaymentStatus`, `PaymentMethod`, `PrescriptionStatus`, `ShipmentStatus`, `ReturnStatus`, `TransactionType`, `TransactionCategory`, `CrmLeadStatus`, `PurchaseStatus`).
- **7 File Migrasi Utama** (27+ tabel): `users`, `addresses`, `categories`, `suppliers`, `products`, `purchases`, `purchase_items`, `product_batches`, `stock_movements`, `carts`, `cart_items`, `wishlists`, `shipping_methods`, `promos`, `prescriptions`, `orders`, `order_items`, `order_status_histories`, `payments`, `shipments`, `order_returns`, `financial_transactions`, `crm_leads`, `crm_interactions`, `testimonials`, `blog_posts`, `faqs`, `contact_messages`, `settings`, `page_visits`.
- **29 Models** di `app/Models/` lengkap dengan relasi, fillable, casts, & scopes (`active`, `lowStock`, `expiringSoon`, `featured`, dll).
- **DatabaseSeeder**: Admin, Apoteker, 15 Pelanggan, 10 Kategori, 42 Produk obat nyata Indonesia + batches & stock movement, 4 Metode pengiriman, 2 Promo, 110 Order historis 60 hari + items/payments/shipments/incomes, biaya operasional (expenses), CRM, FAQ, Testimoni, Blog, & Page visits.

**Verifikasi:**
- `php artisan migrate:fresh --seed`: Sukses.
- `php artisan test`: 39/39 passed (100%).
- `npm run build`: Sukses.

### Fase 0 — Setup (selesai 2026-09-22)
**Yang dibuat/dikonfigurasi:**
- `.env` dikonfigurasi: MySQL (`apotek_erp`), `APP_URL=http://erp-apotek.test`, `APP_LOCALE=id`, placeholder Midtrans & Google Socialite
- `php artisan migrate` dijalankan (tabel bawaan starter kit: users, cache, jobs, passkeys, dll)
- `php artisan storage:link` — symlink `public/storage` dibuat
- Package terinstall: `midtrans/midtrans-php` v2.6.2, `laravel/socialite` v5.31.0
- npm: `recharts` terinstall
- Folder `app/Services/`, `app/Enums/` dibuat
- `app/Http/Middleware/EnsureRole.php` dibuat + didaftarkan alias `role` di `bootstrap/app.php`

**File penting:**
- `app/Http/Middleware/EnsureRole.php` — cek role user, support multi-role
- `bootstrap/app.php` — alias `role` terdaftar
- `.env` — konfigurasi lengkap

**Keputusan teknis:** Tidak ada perubahan DB schema di Fase 0 (tabel bawaan starter kit dipakai apa adanya; kolom `role` akan ditambah di Fase 2).

## Keputusan Teknis
(kosong)

## Blocker
(kosong)
