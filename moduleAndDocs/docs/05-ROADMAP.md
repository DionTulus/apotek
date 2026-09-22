# 05 — Roadmap & Checklist Fase (SUMBER KEBENARAN PROGRES)

Agent: kerjakan berurutan. Centang `[x]` saat selesai, lalu update `docs/PROGRESS.md`.
Setiap fase diakhiri: `php artisan migrate:fresh --seed`, `php artisan test`, `npm run build` harus sukses.

## Fase 0 — Setup (Minggu 1)
- [ ] Proyek Laravel 12 + React starter kit berjalan di Herd (`apotek-erp.test`), git init + `.gitignore`
- [ ] `.env` MySQL (`DB_DATABASE=apotek_erp`), buat DB, `php artisan migrate`
- [ ] Install: `midtrans/midtrans-php`, `laravel/socialite`, `recharts`; `php artisan storage:link`
- [ ] Buat folder `app/Services`, `app/Enums`; middleware `EnsureRole` (alias `role`)
- [ ] `README.md` cara instalasi; salin folder `docs/` ke repo
**DoD**: halaman welcome/login tampil, DB terhubung.

## Fase 1 — Database, Model, Seeder (Minggu 1–2)
- [ ] Semua migrasi di `docs/02-DATABASE.md` (+ `order_status_histories`) dengan FK/index/constraint
- [ ] Enum & Model + relasi + casts + scope (`active`, `lowStock`, `expiringSoon`)
- [ ] Factory + Seeder: admin & customer, 10 kategori, ≥40 obat realistis (golongan campur, sebagian `requires_prescription`), batch, supplier, shipping methods, promo, FAQ, testimoni, blog, settings, ≥100 order historis 60 hari (+ items, payments, financial_transactions, page_visits)
- [ ] Gambar produk placeholder (SVG/generated) agar UI tidak kosong
**DoD**: `migrate:fresh --seed` sukses, data konsisten (stok ≥0, total order = jumlah item).

## Fase 2 — Auth & Role (Minggu 2)
- [ ] Kolom role & phone di register; redirect setelah login (admin → `/admin`, customer → `/`)
- [ ] Middleware `role`; guard route admin; policy kepemilikan order/alamat
- [ ] Login Google (Socialite) + tombol di halaman login/register (nonaktif elegan bila env kosong)
- [ ] Rate limit login; halaman Pengaturan Akun (profil, ganti password, preferensi notifikasi) → **F11, F12**
**DoD**: test Auth + Role hijau; customer tidak bisa akses `/admin` (403).

## Fase 3 — Storefront Statis & Konten (Minggu 2–3)
- [ ] StoreLayout (navbar, footer, responsif), AdminLayout kerangka
- [ ] F1 Beranda, F2 Tentang Kami (visi-misi dari settings), F3 Kontak (form + peta + info), F4 FAQ, F5 S&K, F6 Privasi, F7 Testimoni (+form), F8 Blog (+detail), F9 Promo
- [ ] Middleware `TrackVisit` (page_visits)
**DoD**: semua halaman terbuka, data dari DB, mobile OK.

## Fase 4 — Katalog, Wishlist, Keranjang (Minggu 3–4)
- [ ] F16 Katalog: filter kategori/golongan/harga, search, sort, pagination, halaman detail (deskripsi, komposisi, dosis, badge "Resep Dokter", disclaimer, stok)
- [ ] F10 Wishlist (toggle AJAX/Inertia)
- [ ] F17 Keranjang: add/update/remove, validasi stok, total, tombol checkout; badge jumlah di navbar
**DoD**: test Cart (stok tidak boleh melebihi), UI responsif.

## Fase 5 — Checkout, Pengiriman, Pembayaran (Minggu 4–5)
- [ ] F15 CRUD alamat (default), `ShippingService` hitung ongkir
- [ ] F20 Checkout + F19 Delivery/COD + F18 Payment: pilih alamat, pengiriman, metode bayar (Midtrans/COD), kode promo, unggah resep (bila perlu)
- [ ] `CheckoutService::placeOrder` (transaksi, kurangi stok, movement, order_status_histories)
- [ ] `PaymentService` + Snap token + F14 halaman pembayaran (snap.js) sesuai `docs/04-MIDTRANS.md`
- [ ] Webhook `/midtrans/notification` + mapper status + fallback cek status
- [ ] Command `orders:expire` + scheduler (restore stok)
- [ ] `FinanceService::recordSale` otomatis
**DoD**: alur beli sandbox sukses end-to-end; test Checkout & Midtrans (settlement, expire, deny, signature salah, duplikat) hijau.

## Fase 6 — Akun Customer (Minggu 5)
- [ ] F13 Riwayat pesanan + detail (timeline status, tombol bayar ulang/batal, ajukan retur), F21 Lacak Pesanan (publik: no. pesanan + email/telp)
- [ ] Ajukan retur/penukaran (form + bukti foto), halaman resep saya
**DoD**: user hanya melihat pesanan sendiri; lacak pesanan menampilkan timeline.

## Fase 7 — Admin: Katalog & Inventori (Minggu 5–6)
- [ ] B7 Kategori (gambar), B2 Produk (gambar, golongan, harga beli/jual, validasi), B6 Stok (daftar, penyesuaian, batch/expiry, peringatan menipis/habis/kedaluwarsa, riwayat movement), B16 Supplier & Pembelian (received → stok naik + expense)
- [ ] Tabel reusable: search, filter, sort, pagination, konfirmasi hapus, toast
**DoD**: pembelian menaikkan stok & mencatat pengeluaran; stok tak bisa negatif.

## Fase 8 — Admin: Penjualan & Operasional (Minggu 6)
- [ ] B8 Pesanan (filter status, detail, ubah status via `OrderService`), B18 Verifikasi Resep (approve/reject → lanjutkan/ batalkan order)
- [ ] B5 Pembayaran (daftar, metode, cek status Midtrans, konfirmasi COD/manual), B4 Pengiriman (resi, status, master metode & biaya), B9 Retur & Penukaran (approve → stok kembali + refund tercatat), B3 Pelanggan (CRUD + riwayat pesanan)
**DoD**: order dapat diproses dari paid → completed; COD delivered mencatat income.

## Fase 9 — Keuangan, CRM, Analitik, Laporan (Minggu 6–7)
- [ ] B12 Keuangan (transaksi, laporan pendapatan & pengeluaran, laba-rugi, input pengeluaran, export CSV)
- [ ] B15 Laporan penjualan harian/bulanan (filter, tabel, grafik recharts, export)
- [ ] B14 Analitik (pengunjung, penjualan, produk terlaris), B13 CRM (leads, interaksi, segmentasi/analisis pelanggan), B1 Dashboard KPI
**DoD**: angka laporan cocok dengan data order (ada test ReportService).

## Fase 10 — Admin: Pengguna, Pengaturan, Konten (Minggu 7)
- [ ] B10 Pengguna & hak akses (role), B11 Pengaturan website (logo, favicon, kontak, visi-misi, S&K, privasi), B17 CRUD FAQ/blog/promo/testimoni/pesan kontak
- [ ] Command `app:backup-db` + scheduler
**DoD**: perubahan pengaturan langsung tercermin di storefront.

## Fase 11 — QA, Polishing, Dokumentasi (Minggu 7–8)
- [ ] Jalankan semua skenario `docs/06-TESTING-QA.md`, isi tabel hasil; perbaiki bug Critical/High
- [ ] Feature test lengkap; N+1 check; index; validasi & pesan error Bahasa Indonesia
- [ ] Responsif diperiksa (375px, 768px, 1280px); empty/loading/error states; aksesibilitas dasar
- [ ] Dokumentasi: README, ERD final, use case, flowchart (`docs/diagrams/`), panduan demo (`docs/07-TEAM-REPORT.md` bagian skrip demo), dump DB `database/dump/apotek_erp.sql`
**DoD**: seluruh checklist `docs/01-REQUIREMENTS.md` tercentang; siap demo.
