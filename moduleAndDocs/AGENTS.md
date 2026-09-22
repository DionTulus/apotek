# AGENTS.md — Konteks Utama Proyek (BACA DULU)

> File ini dibaca otomatis oleh agent (Antigravity, VS Code Copilot/Claude/Gemini, Cursor, dll).
> Tujuan: agent membangun **ERP E-Commerce Apotek "Apotek ERP"** sampai SELESAI, fase demi fase.

## 1. Ringkasan Proyek
Tugas kuliah ERP: sistem informasi e-commerce + modul ERP sederhana (Inventori, Penjualan, Keuangan, CRM, Laporan) untuk **apotek yang menjual obat**.
Dua sisi aplikasi:
- **Storefront (Frontend user/customer)**: katalog obat, keranjang, checkout, pembayaran Midtrans / COD, riwayat & lacak pesanan.
- **Back Office (ERP Admin)**: produk, stok, kategori, pelanggan, pesanan, pembayaran, pengiriman, retur, keuangan, CRM, analitik, pengaturan.

**Semua fitur di `docs/01-REQUIREMENTS.md` (checklist dari PDF dosen) WAJIB selesai.** Tidak ada yang boleh dilewati.

## 2. Tech Stack (sudah terpasang di mesin user)
- Laravel Herd (PHP, Composer, Node) — app berjalan di `http://erp-apotek.test`
- Laravel 13 + **React starter kit (Inertia.js + React + TypeScript + Tailwind v4 + shadcn/ui)**
- Database: **MySQL** (fallback: SQLite untuk dev cepat; migrasi harus kompatibel keduanya)
- Payment gateway: **Midtrans Snap (Sandbox)** — paket `midtrans/midtrans-php`
- Chart: `recharts`. Ikon: `lucide-react`. Peta: iframe Google Maps embed. Login sosial: Laravel Socialite (Google) — opsional dikonfigurasi lewat .env.
- Testing: Pest / PHPUnit (feature test backend). Manual QA: `docs/06-TESTING-QA.md`.

> Proyek sudah di-download dari Herd dan terinstall di `c:\Users\Asus\Herd\erp_apotek` dengan Laravel 13 + React starter kit. Hanya perlu konfigurasi `.env` (MySQL, domain Herd) dan jalankan migrasi.

## 3. Dokumen yang HARUS dibaca (urut)
1. `docs/00-PROJECT-BRIEF.md` — konteks bisnis apotek & aturan domain
2. `docs/01-REQUIREMENTS.md` — SRS + checklist halaman wajib dari PDF
3. `docs/02-DATABASE.md` — ERD & skema tabel
4. `docs/03-ARCHITECTURE.md` — struktur folder, route, alur bisnis, service
5. `docs/04-MIDTRANS.md` — integrasi payment gateway
6. `docs/05-ROADMAP.md` — fase kerja + checklist (SUMBER KEBENARAN progres)
7. `docs/06-TESTING-QA.md`, `docs/07-TEAM-REPORT.md`, `docs/PROMPTS.md`

## 4. Cara Kerja Agent (WAJIB)
1. Buka `docs/05-ROADMAP.md`, ambil **fase pertama yang belum selesai**.
2. Kerjakan semua item di fase itu sampai "Definition of Done" terpenuhi.
3. Jalankan: `php artisan migrate:fresh --seed`, `php artisan test`, `npm run build` (atau `npm run types` / lint jika ada). Perbaiki error sebelum lanjut.
4. Centang item di `docs/05-ROADMAP.md`, tulis ringkasan di `docs/PROGRESS.md` (apa yang dibuat, file penting, masalah, keputusan).
5. Lanjut ke fase berikutnya tanpa menunggu, **kecuali** terblokir (butuh API key, keputusan bisnis). Kalau terblokir: tulis di `docs/PROGRESS.md` bagian "Blocker", pilih asumsi paling masuk akal, lanjut.
6. Jangan mengubah struktur DB tanpa memperbarui `docs/02-DATABASE.md`.

## 5. Aturan Kode
- Bahasa UI: **Bahasa Indonesia**. Nama kode/tabel/kolom/route: **Inggris**.
- Backend: Form Request untuk validasi, **Service class** untuk logika bisnis (`app/Services`), Policy/Middleware untuk otorisasi, Eloquent Resource / array props untuk Inertia. Controller tipis.
- Uang: simpan integer rupiah (`unsignedBigInteger`), tanpa desimal. Format di UI: `Rp 12.500`.
- Semua operasi yang mengubah stok/uang **wajib** dalam `DB::transaction` dan (untuk stok) `lockForUpdate()`.
- Stok tidak boleh negatif: validasi aplikasi + constraint DB (`CHECK stock >= 0` bila didukung).
- Role: `admin` dan `customer` (opsional `pharmacist` untuk verifikasi resep). Route admin di prefix `/admin` dengan middleware `role:admin`.
- Keamanan: jangan simpan Server Key di frontend; verifikasi signature webhook Midtrans; rate-limit login; upload file divalidasi (mime, ukuran); jangan percayai harga dari client — hitung ulang di server.
- Frontend: komponen shadcn/ui, responsif (HP & PC), konsisten warna (biru apotek `#8CA9FF` + putih), loading/empty/error state, toast notifikasi sukses/error.
- Commit kecil per fitur (Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`).
- Jangan menghapus fitur kerangka starter kit (auth, settings) — extend saja.

## 6. Aturan Domain Apotek (ringkas; detail di brief)
- Golongan obat: `bebas`, `bebas_terbatas`, `keras` (wajib resep), `herbal`, `suplemen`, `alkes`.
- Produk `requires_prescription = true` → checkout wajib unggah resep, status resep harus `approved` oleh admin/apoteker sebelum pesanan diproses.
- Ada tanggal kedaluwarsa (batch). Obat kedaluwarsa tidak boleh dijual; tampilkan peringatan expiry ≤ 90 hari di admin.
- Disclaimer di halaman produk: "Konsultasikan dengan apoteker/dokter sebelum menggunakan obat."

## 7. Akun Seed (dev)
- Admin: `admin@apotek.test` / `password`
- Customer: `budi@apotek.test` / `password`
- Seeder juga membuat ±10 kategori, ≥40 produk, promo, FAQ, testimoni, blog, supplier, dan riwayat transaksi 60 hari (untuk grafik laporan).

## 8. Definition of Done (keseluruhan)
- Semua checklist di `docs/01-REQUIREMENTS.md` tercentang.
- Alur end-to-end jalan: daftar → pilih obat → keranjang → checkout → bayar (Midtrans sandbox) → stok berkurang otomatis → transaksi keuangan tercatat → admin proses & kirim → user lacak → laporan harian/bulanan tampil.
- `php artisan test` hijau, `npm run build` sukses, `migrate:fresh --seed` sukses.
- `README.md` berisi cara instalasi; `docs/` up-to-date.
