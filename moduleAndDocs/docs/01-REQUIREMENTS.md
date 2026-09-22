# 01 — Requirements (SRS Sederhana) + Checklist Wajib dari PDF

## A. Kebutuhan Fungsional Minimal (PDF: "Fitur Minimal")
- [ ] Manajemen Produk: CRUD barang, stok, kategori
- [ ] Manajemen Pengguna & Customer: register, login, role admin & user
- [ ] Transaksi Penjualan: shopping cart, checkout, pembayaran
- [ ] Inventory: update stok otomatis setelah pembelian
- [ ] Keuangan: pencatatan transaksi penjualan
- [ ] Laporan: ringkasan penjualan harian/bulanan
- [ ] Integrasi sederhana ERP (backend): order → stok → keuangan → laporan dalam satu alur

## B. Halaman FRONTEND WAJIB (Storefront)
Route publik di `/`, semua responsif. UI Bahasa Indonesia.

| # | Halaman | Route | Isi wajib | Done |
|---|---|---|---|---|
| F1 | Beranda | `/` | Hero, kategori, produk terlaris/terbaru, promo, testimoni singkat, CTA | [ ] |
| F2 | Tentang Kami | `/tentang-kami` | **Visi & Misi** perusahaan, profil apotek, tim/apoteker | [ ] |
| F3 | Kontak Kami | `/kontak` | **Form kontak** (simpan ke DB), alamat, no. telepon, email, **peta lokasi** | [ ] |
| F4 | FAQ | `/faq` | Daftar tanya-jawab (accordion), dari DB | [ ] |
| F5 | Syarat & Ketentuan | `/syarat-ketentuan` | Aturan penggunaan website | [ ] |
| F6 | Kebijakan Privasi | `/kebijakan-privasi` | Kebijakan data pribadi | [ ] |
| F7 | Testimoni Pelanggan | `/testimoni` | Daftar testimoni (rating bintang) + form kirim testimoni (login) | [ ] |
| F8 | Blog / Berita | `/blog`, `/blog/{slug}` | Daftar artikel kesehatan + detail | [ ] |
| F9 | Promo / Diskon | `/promo` | Daftar promo/kode diskon yang berlaku | [ ] |
| F10 | Wishlist | `/wishlist` | Produk tersimpan user (toggle hati di kartu produk) | [ ] |
| F11 | Register & Login | `/register`, `/login` | Form + **opsi login media sosial (Google)** | [ ] |
| F12 | Pengaturan Akun | `/akun/pengaturan` | Profil, ganti password, preferensi notifikasi | [ ] |
| F13 | Riwayat Pesanan | `/akun/pesanan`, `/akun/pesanan/{no}` | Daftar + detail pesanan user, filter status | [ ] |
| F14 | Halaman Pembayaran | `/pembayaran/{order}` | Metode pembayaran tersedia + info pembayaran (Midtrans Snap / instruksi COD) | [ ] |
| F15 | Pengaturan Pengiriman | `/akun/alamat`, di checkout | Alamat pengiriman (CRUD, default), metode pengiriman, biaya | [ ] |
| F16 | Katalog Produk | `/produk`, `/produk/{slug}` | Daftar + deskripsi + harga + tombol **Add to Cart**, filter kategori/golongan, search, sort, pagination | [ ] |
| F17 | Keranjang | `/keranjang` | Daftar item, ubah qty, hapus, total harga, tombol Checkout | [ ] |
| F18 | Payment | `/checkout/payment` | Metode pembayaran + info (bisa satu alur dengan F14, tetap ada halamannya) | [ ] |
| F19 | Delivery / COD | `/checkout/pengiriman` | Metode pengiriman, alamat, biaya; opsi COD | [ ] |
| F20 | Checkout | `/checkout` | Form checkout, metode bayar, alamat, unggah resep (jika perlu), kode promo, tombol Checkout | [ ] |
| F21 | Lacak Pesanan (Pengguna) | `/lacak-pesanan` | Form nomor pesanan (+ email/telp) → status & timeline | [ ] |

## C. Halaman BACKEND / ERP WAJIB (Admin, prefix `/admin`)

| # | Halaman | Route | Isi wajib | Done |
|---|---|---|---|---|
| B1 | Dashboard | `/admin` | KPI: penjualan hari ini, pesanan baru, stok menipis, produk hampir kedaluwarsa, grafik 30 hari | [ ] |
| B2 | Manajemen Produk | `/admin/produk` | Daftar, tambah/edit/hapus, kategori, **gambar produk**, golongan obat, resep, harga jual/beli | [ ] |
| B3 | Manajemen Pelanggan | `/admin/pelanggan` | Daftar, tambah/edit/hapus, **riwayat pesanan pelanggan** | [ ] |
| B4 | Manajemen Pengiriman | `/admin/pengiriman` | Daftar pengiriman, tambah/edit/hapus, input resi, status, **biaya pengiriman** (master metode/tarif) | [ ] |
| B5 | Manajemen Pembayaran | `/admin/pembayaran` | Daftar pembayaran, tambah/edit/hapus (manual/COD), **metode pembayaran**, status dari Midtrans | [ ] |
| B6 | Manajemen Stok | `/admin/stok` | Daftar stok, tambah/edit/hapus (penyesuaian, stok masuk, batch/expiry), **peringatan stok habis/menipis** | [ ] |
| B7 | Manajemen Kategori | `/admin/kategori` | Daftar, tambah/edit/hapus, **gambar kategori** | [ ] |
| B8 | Manajemen Pesanan | `/admin/pesanan` | Daftar, **status pesanan**, detail, verifikasi resep, ubah status | [ ] |
| B9 | Pengembalian & Penukaran | `/admin/retur` | Daftar, status (diajukan/disetujui/ditolak/selesai), detail | [ ] |
| B10 | Manajemen Pengguna/Administrator | `/admin/pengguna` | Daftar, tambah/edit/hapus, **pengaturan hak akses (role)** | [ ] |
| B11 | Pengaturan Website | `/admin/pengaturan` | Pengaturan umum, **logo, favicon**, informasi kontak, visi-misi | [ ] |
| B12 | Laporan Keuangan | `/admin/keuangan` | Daftar transaksi, **laporan pendapatan**, **laporan pengeluaran**, laba-rugi, input pengeluaran manual, export CSV | [ ] |
| B13 | CRM | `/admin/crm` | **Leads/pelanggan**, **riwayat interaksi**, **analisis pelanggan** (segmentasi, top spender) | [ ] |
| B14 | Analitik & Statistik | `/admin/analitik` | **Laporan pengunjung**, **laporan penjualan** (harian/bulanan), **produk terlaris** | [ ] |
| B15 | Laporan Bisnis | `/admin/laporan` | Ringkasan penjualan harian/bulanan (filter tanggal, tabel + grafik + export) | [ ] |
| B16 | Master Tambahan | `/admin/supplier`, `/admin/pembelian` | Supplier & pembelian stok (mengisi stok + mencatat pengeluaran) | [ ] |
| B17 | Konten | `/admin/konten/*` | CRUD FAQ, testimoni (moderasi), blog, promo, pesan kontak | [ ] |
| B18 | Verifikasi Resep | `/admin/resep` | Daftar resep unggahan, lihat gambar, approve/reject + catatan | [ ] |

## D. Fitur Tambahan Apotek (nilai plus, kerjakan setelah semua wajib)
- [ ] Peringatan kedaluwarsa ≤ 90 hari & blokir penjualan batch kedaluwarsa
- [ ] Kode promo saat checkout (persen/nominal, min. belanja, periode)
- [ ] Email notifikasi pesanan (log driver cukup)
- [ ] Export laporan CSV/PDF
- [ ] Dark mode (bawaan starter kit)

## E. Kebutuhan Non-Fungsional
| Kode | Kebutuhan |
|---|---|
| NF1 | Responsif (HP & PC), konsisten warna/font/layout |
| NF2 | Keamanan: hash password, CSRF, validasi input, otorisasi role, verifikasi signature Midtrans, upload aman |
| NF3 | Integritas data: transaksi DB atomik, stok tidak negatif, tidak ada double-order/double-payment (idempotent webhook) |
| NF4 | Performa: index DB pada FK/slug/status/tanggal; pagination; eager loading (hindari N+1) |
| NF5 | Maintainability: service layer, dokumentasi, seed data |
| NF6 | Usability: notifikasi sukses/error, flow belanja ≤ 5 langkah |
| NF7 | Backup DB: perintah `php artisan app:backup-db` + jadwal harian di scheduler |

## F. Aktor & Use Case Ringkas
- **Pengunjung**: lihat beranda/katalog/blog/FAQ, kirim pesan kontak, register/login.
- **Customer**: kelola akun/alamat, wishlist, keranjang, checkout, bayar, unggah resep, lacak pesanan, ajukan retur, kirim testimoni.
- **Admin**: semua modul ERP (B1–B18).
- **Apoteker (opsional role)**: verifikasi resep, kelola stok.
- **Midtrans (sistem eksternal)**: kirim notifikasi pembayaran.
Diagram use case & flowchart: dibuat System Analyst di `docs/diagrams/` (Mermaid/draw.io).
