# 00 — Project Brief: Apotek ERP

## Identitas Tugas
- Mata kuliah: ERP — Dosen: Dery Satya Pramdhana, M.Kom
- Tugas: Membuat Sistem Informasi UMKM/PT berdasarkan Modul ERP (e-commerce terintegrasi ERP sederhana)
- Presentasi: pertemuan setelah UTS (simulasi aplikasi + paparan peran masing-masing). Bobot laporan akhir: **30% nilai matakuliah**.
- Studi kasus kelompok kami: **E-commerce apotek untuk penjualan obat**.

## Tujuan Pembelajaran (dari PDF)
1. Memahami integrasi modul ERP (keuangan, inventori, penjualan, pelanggan) dalam e-commerce.
2. Menerapkan teori ERP ke implementasi nyata.
3. Menganalisis alur bisnis digital: order → pembayaran → pengiriman → laporan keuangan.
4. Menguasai tools/framework (Laravel, React, MySQL, Midtrans).
5. Kolaborasi tim & manajemen proyek; soft skills; kesiapan industri.

## Profil Bisnis (fiktif, dapat diganti)
- Nama: **Apotek Sehat Sentosa** (nama app: "Apotek ERP").
- Menjual: obat bebas, bebas terbatas, obat keras (dengan resep), herbal, vitamin/suplemen, alat kesehatan, perawatan ibu & anak.
- Pelanggan: umum (online). Pengiriman: kurir lokal/ekspedisi (tarif manual di sistem) + COD area tertentu.
- Pain point: stok manual sering selisih, pencatatan penjualan/keuangan terpisah, obat kedaluwarsa tidak terpantau, pelanggan sulit lacak pesanan.

## Solusi (Integrasi ERP)
| Modul ERP | Implementasi |
|---|---|
| Inventori | Produk, kategori, stok, batch & kedaluwarsa, stock movement, peringatan stok minimum, pembelian dari supplier |
| Penjualan | Katalog, cart, checkout, promo, pesanan, retur/penukaran |
| Keuangan | Pencatatan pendapatan otomatis dari penjualan, pengeluaran (pembelian stok/operasional), laporan laba-rugi sederhana |
| CRM | Data pelanggan, riwayat pesanan & interaksi, leads, segmentasi (pelanggan setia/baru/tidak aktif) |
| Laporan/Analitik | Penjualan harian/bulanan, produk terlaris, pengunjung, stok menipis |

## Alur Bisnis Utama
```
Customer daftar/login → cari obat → (obat keras: unggah resep) → keranjang → checkout
 → pilih alamat & pengiriman → pilih pembayaran (Midtrans / COD)
 → [Sistem] buat order + KURANGI STOK + catat stock_movement
 → Midtrans webhook "settlement" → payment paid → catat TRANSAKSI KEUANGAN (income)
 → Admin verifikasi resep (jika ada) → proses → input resi → kirim → delivered → completed
 → Retur/penukaran (opsional) → stok kembali + transaksi refund
 → Laporan harian/bulanan otomatis dari data transaksi
```
Pembayaran gagal/kedaluwarsa → order `cancelled`/`expired` → **stok dikembalikan otomatis**.

## Batasan Sistem (Scope)
Dikerjakan: semua halaman di PDF, Midtrans Snap sandbox, COD, tarif ongkir manual, upload resep, laporan.
Tidak dikerjakan: integrasi API kurir real-time (RajaOngkir), telemedicine, integrasi BPJS/SATUSEHAT, aplikasi Android, multi-cabang.
