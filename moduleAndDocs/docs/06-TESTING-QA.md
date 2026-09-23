# 06 — Testing & QA

## Test Plan
- Ruang lingkup: autentikasi, katalog, keranjang, checkout, Midtrans webhook, stok, keuangan, laporan, hak akses, halaman admin.
- Alat: Pest/PHPUnit (otomatis), Postman (API/webhook), manual (UI di Chrome + mode mobile).
- Waktu: per fase (developer) + regresi penuh minggu 7–8 (QA).

## Test Otomatis (tests/Feature)
**Status**: 81 passed (100%), 257 assertions.

| File / Test Suite | Kasus yang Diuji | Status |
|---|---|:---:|
| `AuthAndRoleTest` | Register, login, logout, role redirect, customer 403 di `/admin`, Google OAuth fallback | PASSED |
| `StorefrontPagesTest` | Beranda, Tentang Kami, FAQ, S&K, Privasi, Testimoni, Blog, Promo, Kontak | PASSED |
| `CheckoutAndPaymentTest` | Tambah keranjang, validasi stok max, perhitungan ongkir kurir, place order Midtrans Snap, simulasi settlement, expire restore stok, COD payment | PASSED |
| `CustomerAccountTest` | Riwayat pesanan user, batalkan pesanan pending, proteksi data antar customer, lacak pesanan publik | PASSED |
| `AdminCatalogAndInventoryTest` | CRUD kategori, CRUD produk (validasi golongan & harga), stock adjustment manual, penerimaan purchase order supplier | PASSED |
| `AdminOrderAndPrescriptionTest` | Ubah status order, verifikasi & approve resep, tolak resep & batalkan order + restore stok, input resi pengiriman, konfirmasi COD & catat income, approve retur | PASSED |
| `AdminFinanceAndReportsTest` | Ringkasan laba-rugi, pencatatan biaya operasional, ekspor CSV keuangan, laporan penjualan harian & bulanan, analitik performa | PASSED |
| `AdminManagementAndContentTest` | Manajemen pengguna & role (Admin/Apoteker/Customer), update settings toko, CRUD FAQ, Promo, Blog, Testimoni, Contact Messages | PASSED |

## Test Case Manual & QA Matrix
| ID | Skenario | Input | Expected | Actual | Status |
|---|---|---|---|---|:---:|
| TC-01 | Register valid | Nama, Email, Telp, Password | Akun dibuat, role customer, redirect ke Beranda | Akun terdaftar dan diarahkan ke beranda | PASSED |
| TC-02 | Register email duplikat | Email sudah terdaftar | Muncul pesan validasi Bahasa Indonesia | Validasi 'Email sudah digunakan' tampil | PASSED |
| TC-03 | Login salah password | Password keliru | Gagal login, notifikasi error | Gagal login dengan notifikasi kredensial salah | PASSED |
| TC-04 | Add to cart | Klik Tambah Keranjang | Item masuk cart, badge navbar update | Badge bertambah sesuai jumlah item | PASSED |
| TC-05 | Qty > stok | Qty melebihi batas stok | Ditolak dengan pesan stok tidak mencukupi | Muncul toast peringatan stok maksimal | PASSED |
| TC-06 | Checkout Midtrans | Pilih alamat, Midtrans, bayar | Snap token terbit, bayar sukses, order PAID, stok berkurang, income tercatat | Transaksi selesai, tercatat di laporan keuangan | PASSED |
| TC-07 | Pembayaran kedaluwarsa | Simulasi webhook cancel/expire | Order expired, stok barang otomatis kembali | Stok produk bertambah kembali utuh | PASSED |
| TC-08 | Checkout COD | Pilih kurir COD | Order dibuat tanpa Snap, status pending/shipped | Order COD tersimpan dengan flag COD | PASSED |
| TC-09 | Obat keras tanpa resep | Checkout obat golongan keras | Wajib unggah resep dokter | Form upload resep dokter muncul & wajib diisi | PASSED |
| TC-10 | Verifikasi resep | Admin klik Approve Resep | Status resep approved, order lanjut diproses | Status order berlanjut ke PAID / Siap Kirim | PASSED |
| TC-11 | Tolak resep | Admin tolak resep + catatan | Resep rejected, order dibatalkan, stok dikembalikan | Order dibatalkan dan stok dikembalikan | PASSED |
| TC-12 | Admin CRUD produk | Tambah produk baru + upload foto | Produk tersimpan di database dan katalog publik | Produk langsung tampil di katalog toko | PASSED |
| TC-13 | Stok negatif | Penyesuaian stok keluar melebihi stok | Ditolak sistem | Validasi error mencegah stok negatif | PASSED |
| TC-14 | Peringatan stok menipis | Filter stok ≤ batas minimum | Muncul di badge peringatan stok | Ditampilkan di KPI dashboard & tabel stok | PASSED |
| TC-15 | Input resi & kirim | Masukkan kurir & no resi | Status shipped, timeline status terupdate | Tracking number tersimpan di pengiriman | PASSED |
| TC-16 | Lacak pesanan | No pesanan + email/no HP | Menampilkan timeline riwayat pesanan | Timeline pelacakan tampil informatif | PASSED |
| TC-17 | Retur disetujui | Admin klik Setujui Retur | Status disetujui, stok bertambah, expense refund tercatat | Stok produk pulih, refund tercatat di finance | PASSED |
| TC-18 | Laporan harian/bulanan | Filter rentang tanggal | Angka penjualan & laba sesuai mutasi transaksi | Angka akurat dan file CSV berhasil diunduh | PASSED |
| TC-19 | Akses admin oleh customer | Customer mengakses `/admin` | HTTP 403 Forbidden | Akses diblokir dengan halaman 403 | PASSED |
| TC-20 | Responsif seluler | Viewport 375px (iPhone) & 768px (iPad) | Tidak ada horizontal overflow, drawer menu mobile | Tampilan responsif dan proporsional | PASSED |
| TC-21 | Form kontak | Kirim form pesan kontak | Pesan tersimpan, tampil di inbox admin | Pesan masuk ke menu Pesan Admin | PASSED |
| TC-22 | Pengaturan website | Ganti nama apotek & no WA | Berubah langsung di storefront & footer | Identitas apotek di header & footer langsung berubah | PASSED |

## Prioritas Bug & Resolution
- **Critical (0)**: Tidak ada bug blocking pada alur pembayaran, integritas stok, dan laporan keuangan.
- **High (0)**: Seluruh hak akses, upload resep dokter, dan webhook Midtrans berfungsi dengan aman.
- **Medium (0)**: Format mata uang Rupiah (`Rp`), penomoran dokumen, dan validasi Bahasa Indonesia terpasang seragam.
- **Low (0)**: Empty states dan loading skeletons tersedia di semua halaman.

## Regression Checklist (Final Verification)
1. Autentikasi Customer & Admin (Role guard 403 aktif).
2. Storefront browsing: Katalog obat, filter golongan, pencarian, detail dosis & kontraindikasi.
3. Keranjang & Wishlist: Validasi kuantitas vs stok fisik.
4. Checkout: Alamat pengiriman, kupon promo, upload resep dokter jika ada obat keras, kalkulasi ongkir.
5. Pembayaran: Midtrans Snap & Cash on Delivery (COD).
6. Admin Farmasi: Verifikasi resep dokter (Setujui / Tolak).
7. Admin Operasional: Pengiriman pesanan, input resi, konfirmasi COD.
8. Admin Gudang & Stok: Stock opname, batch expiry, penerimaan PO supplier.
9. Admin Keuangan & Eksekutif: Jurnal pendapatan/pengeluaran, laba-rugi, grafik performa, ekspor CSV.
10. Admin Master & CMS: Pengguna, pengaturan apotek, FAQ, Blog, Promo, Testimoni, dan Inbox Pesan.
