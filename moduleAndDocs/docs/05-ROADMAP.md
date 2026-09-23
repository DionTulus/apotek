# 05 — Roadmap & Checklist Fase (SUMBER KEBENARAN PROGRES)

Agent: kerjakan berurutan. Centang `[x]` saat selesai, lalu update `docs/PROGRESS.md`.
Setiap fase diakhiri: `php artisan migrate:fresh --seed`, `php artisan test`, `npm run build` harus sukses.

## Fase 0 — Setup (Minggu 1)
- [ ] Konfigurasi `.env`: `APP_NAME=Apotek ERP`, `APP_URL=http://erp-apotek.test`, `DB_CONNECTION=mysql`, `DB_DATABASE=apotek_erp`, `APP_LOCALE=id`
- [ ] Buat database MySQL `apotek_erp`; aktifkan site di Herd; jalankan `php artisan migrate`
- [ ] Install package tambahan: `midtrans/midtrans-php`, `laravel/socialite`; jalankan `php artisan storage:link`
- [ ] Install npm package tambahan: `recharts`
- [ ] Buat folder `app/Services`, `app/Enums`; middleware `EnsureRole` (alias `role`)
- [ ] Update `APP_NAME` di `.env`, ubah tema warna ke `#8CA9FF` di CSS/Tailwind config
- [ ] `README.md` cara instalasi; pastikan folder `moduleAndDocs/` sudah di repo  
**DoD**: halaman welcome/login tampil di `http://erp-apotek.test`, DB MySQL terhubung.

## Fase 1 — Database, Model, Seeder (Minggu 1–2)
- [x] Semua migrasi di `docs/02-DATABASE.md` (+ `order_status_histories`) dengan FK/index/constraint
- [x] Enum & Model + relasi + casts + scope (`active`, `lowStock`, `expiringSoon`)
- [x] Factory + Seeder: admin & customer, 10 kategori, ≥40 obat realistis (golongan campur, sebagian `requires_prescription`), batch, supplier, shipping methods, promo, FAQ, testimoni, blog, settings, ≥100 order historis 60 hari (+ items, payments, financial_transactions, page_visits)
- [x] Gambar produk placeholder (SVG/generated) agar UI tidak kosong
**DoD**: `migrate:fresh --seed` sukses, data konsisten (stok ≥0, total order = jumlah item).

## Fase 2 — Auth & Role (Minggu 2)
- [x] Kolom role & phone di register; redirect setelah login (admin → `/admin`, customer → `/`)
- [x] Middleware `role`; guard route admin; policy kepemilikan order/alamat
- [x] Login Google (Socialite) + tombol di halaman login/register (nonaktif elegan bila env kosong)
- [x] Rate limit login; halaman Pengaturan Akun (profil, ganti password, preferensi notifikasi) → **F11, F12**
**DoD**: test Auth + Role hijau; customer tidak bisa akses `/admin` (403).

## Fase 3 — Storefront Statis & Konten (Minggu 2–3)
- [x] StoreLayout (navbar, footer, responsif), AdminLayout kerangka
- [x] F1 Beranda, F2 Tentang Kami (visi-misi dari settings), F3 Kontak (form + peta + info), F4 FAQ, F5 S&K, F6 Privasi, F7 Testimoni (+form), F8 Blog (+detail), F9 Promo
- [x] Middleware `TrackVisit` (page_visits)
**DoD**: semua halaman terbuka, data dari DB, mobile OK.

## Fase 4 — Katalog, Wishlist, Keranjang (Minggu 3–4)
- [x] F16 Katalog: filter kategori/golongan/harga, search, sort, pagination, halaman detail (deskripsi, komposisi, dosis, badge "Resep Dokter", disclaimer, stok)
- [x] F10 Wishlist (toggle AJAX/Inertia)
- [x] F17 Keranjang: add/update/remove, validasi stok, total, tombol checkout; badge jumlah di navbar
**DoD**: test Cart (stok tidak boleh melebihi), UI responsif.

## Fase 5 — Checkout, Pengiriman, Pembayaran (Minggu 4–5)
- [x] F15 CRUD alamat (default), `ShippingService` hitung ongkir
- [x] F20 Checkout + F19 Delivery/COD + F18 Payment: pilih alamat, pengiriman, metode bayar (Midtrans/COD), kode promo, unggah resep (bila perlu)
- [x] `CheckoutService::placeOrder` (transaksi, kurangi stok, movement, order_status_histories)
- [x] `PaymentService` + Snap token + F14 halaman pembayaran (snap.js) sesuai `docs/04-MIDTRANS.md`
- [x] Webhook `/midtrans/notification` + mapper status + fallback cek status
- [x] Command `orders:expire` + scheduler (restore stok)
- [x] `FinanceService::recordSale` otomatis
**DoD**: alur beli sandbox sukses end-to-end; test Checkout & Midtrans (settlement, expire, deny, signature salah, duplikat) hijau.

## Fase 6 — Akun Customer (Minggu 5)
- [x] F13 Riwayat pesanan + detail (timeline status, tombol bayar ulang/batal, ajukan retur), F21 Lacak Pesanan (publik: no. pesanan + email/telp)
- [x] Ajukan retur/penukaran (form + bukti foto), halaman resep saya
**DoD**: user hanya melihat pesanan sendiri; lacak pesanan menampilkan timeline.

## Fase 7 — Admin: Katalog & Inventori (Minggu 5–6)
- [x] B7 Kategori (gambar), B2 Produk (gambar, golongan, harga beli/jual, validasi), B6 Stok (daftar, penyesuaian, batch/expiry, peringatan menipis/habis/kedaluwarsa, riwayat movement), B16 Supplier & Pembelian (received → stok naik + expense)
- [x] Tabel reusable: search, filter, sort, pagination, konfirmasi hapus, toast
**DoD**: pembelian menaikkan stok & mencatat pengeluaran; stok tak bisa negatif.

## Fase 8 — Admin: Penjualan & Operasional (Minggu 6)
- [x] B8 Pesanan (filter status, detail, ubah status via `OrderService`), B18 Verifikasi Resep (approve/reject → lanjutkan/ batalkan order)
- [x] B5 Pembayaran (daftar, metode, cek status Midtrans, konfirmasi COD/manual), B4 Pengiriman (resi, status, master metode & biaya), B9 Retur & Penukaran (approve → stok kembali + refund tercatat), B3 Pelanggan (CRUD + riwayat pesanan)
**DoD**: order dapat diproses dari paid → completed; COD delivered mencatat income.

## Fase 9 — Keuangan, CRM, Analitik, Laporan (Minggu 6–7)
- [x] B12 Keuangan (transaksi, laporan pendapatan & pengeluaran, laba-rugi, input pengeluaran, export CSV)
- [x] B15 Laporan penjualan harian/bulanan (filter, tabel, grafik recharts, export)
- [x] B14 Analitik (pengunjung, penjualan, produk terlaris), B13 CRM (leads, interaksi, segmentasi/analisis pelanggan), B1 Dashboard KPI
**DoD**: angka laporan cocok dengan data order (ada test ReportService).

## Fase 10 — Admin: Pengguna, Pengaturan, Konten (Minggu 7)
- [x] B10 Pengguna & hak akses (role), B11 Pengaturan website (logo, favicon, kontak, visi-misi, S&K, privasi), B17 CRUD FAQ/blog/promo/testimoni/pesan kontak
- [x] Command `app:backup-db` + scheduler
**DoD**: perubahan pengaturan langsung tercermin di storefront.

## Fase 11 — QA, Polishing, Dokumentasi (Minggu 7–8)
- [ ] Jalankan semua skenario `docs/06-TESTING-QA.md`, isi tabel hasil; perbaiki bug Critical/High
- [ ] Feature test lengkap; N+1 check; index; validasi & pesan error Bahasa Indonesia
- [ ] Responsif diperiksa (375px, 768px, 1280px); empty/loading/error states; aksesibilitas dasar
- [ ] Dokumentasi: README, ERD final, use case, flowchart (`docs/diagrams/`), panduan demo (`docs/07-TEAM-REPORT.md` bagian skrip demo), dump DB `database/dump/apotek_erp.sql`
**DoD**: seluruh checklist `docs/01-REQUIREMENTS.md` tercentang; siap demo.
