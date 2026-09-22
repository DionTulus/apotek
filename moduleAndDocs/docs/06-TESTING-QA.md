# 06 — Testing & QA

## Test Plan
- Ruang lingkup: autentikasi, katalog, keranjang, checkout, Midtrans webhook, stok, keuangan, laporan, hak akses, halaman admin.
- Alat: Pest/PHPUnit (otomatis), Postman (API/webhook), manual (UI di Chrome + mode mobile).
- Waktu: per fase (developer) + regresi penuh minggu 7–8 (QA).

## Test Otomatis Wajib (tests/Feature)
| File | Kasus |
|---|---|
| AuthTest | register, login, logout, role redirect, customer 403 di `/admin` |
| CartTest | tambah, qty > stok ditolak, produk nonaktif ditolak |
| CheckoutTest | order sukses → stok berkurang + movement; stok kurang → gagal tanpa perubahan; harga dari client diabaikan; promo valid/invalid; obat keras tanpa resep ditolak |
| StockTest | tidak bisa negatif, adjust, FEFO, restore saat cancel |
| MidtransWebhookTest | signature valid settlement → paid + income tercatat; signature salah 403; expire/deny → stok kembali; duplikat idempotent; gross_amount tidak cocok ditolak |
| OrderFlowTest | transisi sah & tidak sah; COD delivered → income |
| FinanceTest | recordSale idempotent, refund, laba-rugi |
| ReportTest | penjualan harian/bulanan sesuai data seed |
| PolicyTest | user lain tidak bisa lihat order/alamat/resep orang lain |

## Test Case Manual (isi kolom Actual & Status saat pengujian)
| ID | Skenario | Input | Expected | Actual | Status |
|---|---|---|---|---|---|
| TC-01 | Register valid | data lengkap | akun dibuat, masuk beranda | | |
| TC-02 | Register email duplikat | email terpakai | pesan error validasi | | |
| TC-03 | Login salah password | pw salah | error, tidak login | | |
| TC-04 | Add to cart | produk stok 10, qty 2 | masuk cart, badge +2 | | |
| TC-05 | Qty > stok | qty 999 | ditolak + pesan stok | | |
| TC-06 | Checkout Midtrans | kartu sandbox | popup Snap, sukses → order paid, stok berkurang, transaksi income muncul | | |
| TC-07 | Pembayaran kedaluwarsa | simulasi expire | order expired, stok kembali | | |
| TC-08 | Checkout COD | pilih COD | order dibuat tanpa Snap, status processing/awaiting | | |
| TC-09 | Obat keras tanpa resep | keranjang obat keras | wajib unggah resep | | |
| TC-10 | Verifikasi resep | admin approve | order lanjut diproses | | |
| TC-11 | Tolak resep | admin reject | order dibatalkan, stok kembali | | |
| TC-12 | Admin CRUD produk | tambah/edit/hapus + gambar | tersimpan, tampil di katalog | | |
| TC-13 | Stok negatif | adjust −999 | ditolak | | |
| TC-14 | Peringatan stok menipis | stok ≤ min | tampil di dashboard & halaman stok | | |
| TC-15 | Input resi & kirim | resi JNE123 | status shipped, tampil di lacak | | |
| TC-16 | Lacak pesanan | no. pesanan + email | timeline status | | |
| TC-17 | Retur disetujui | ajukan → approve → selesai | stok kembali, refund tercatat | | |
| TC-18 | Laporan harian/bulanan | filter tanggal | angka sama dengan data order | | |
| TC-19 | Akses admin oleh customer | buka `/admin` | 403/redirect | | |
| TC-20 | Responsif | 375px | tidak ada overflow, menu mobile | | |
| TC-21 | Form kontak | isi valid | pesan tersimpan, tampil di admin | | |
| TC-22 | Pengaturan website | ganti logo/kontak | berubah di storefront | | |

## Prioritas Bug
Critical (alur bayar/stok/keuangan salah, data bocor) → High (fitur wajib tidak jalan) → Medium (UI/validasi) → Low (kosmetik).

## Template Laporan Bug
```
ID: BUG-xxx | Prioritas: | Modul:
Langkah reproduksi:
Expected:
Actual:
Screenshot/log:
Status: Open / Fixed / Verified
```

## Regression Checklist (setelah tiap perbaikan besar)
Login → tambah cart → checkout → bayar sandbox → cek stok → cek keuangan → cek laporan → admin ubah status → lacak pesanan.

## Perintah
```
php artisan test
php artisan test --filter=MidtransWebhookTest
./vendor/bin/pint        # format kode
npm run build && npm run types
```
