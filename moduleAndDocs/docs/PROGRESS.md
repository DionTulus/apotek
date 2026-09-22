# PROGRESS LOG
Agent: tambahkan entri baru di bagian atas setiap selesai satu fase.

## Status Fase
| Fase | Status | Catatan |
|---|---|---|
| 0 Setup | ✅ | MySQL terhubung, package terinstall, middleware `role` siap |
| 1 Database | ⬜ | |
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
