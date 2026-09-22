# PROGRESS LOG
Agent: tambahkan entri baru di bagian atas setiap selesai satu fase.

## Status Fase
| Fase | Status | Catatan |
|---|---|---|
| 0 Setup | ✅ | MySQL terhubung, package terinstall, middleware `role` siap |
| 1 Database | ✅ | Migrasi (27+ tabel), 13 Enums, 29 Models, Seeder (42 produk, 110 order) |
| 2 Auth & Role | ⬜ | |
| 3 Storefront Konten | ⬜ | |
| 4 Katalog & Cart | ⬜ | |
| 5 Checkout & Midtrans | ⬜ | |
| 6 Akun Customer | ⬜ | |
| 7 Admin Inventori | ⬜ | |
| 8 Admin Penjualan | ⬜ | |
| 9 Keuangan/CRM/Laporan | ⬜ | |
| 10 Pengguna/Pengaturan/Konten | ⬜ | |
| 11 QA & Dokumentasi | ⬜ | |

## Log

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
