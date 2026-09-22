# 07 — Pembagian Peran, Timeline & Laporan

> Sesuaikan jumlah anggota (PDF memberi contoh 4 orang; slide PM menyebut 8 minggu / 8 anggota). Isi nama pada tabel.

## Peran (contoh 4 orang)
| Peran | Nama | Tanggung jawab | Fase dominan |
|---|---|---|---|
| PM / System Analyst | ______ | Timeline & koordinasi, rapat mingguan + notulen, analisis kebutuhan, SRS, Use Case, Flowchart/BPMN, komunikasi dengan dosen, laporan akhir & presentasi | Awal & akhir |
| Software / Database Engineer | ______ | ERD & skema, migrasi, query laporan/optimasi, API & logika bisnis, modul ERP (inventori, transaksi, keuangan), Midtrans, backup DB | Awal & coding |
| UI/UX & Frontend Developer | ______ | Desain Figma, halaman React storefront & admin, integrasi ke backend, validasi form & UX, responsif | Coding |
| Quality Assurance | ______ | Test plan, test case, uji manual + Postman, bug tracking, regression, laporan QA, dokumentasi proses | Akhir |

Rotasi: Fase awal semua terlibat (Analyst & DB dominan) → Coding (Backend & Frontend dominan) → Akhir (QA & PM dominan).

## Timeline 8 Minggu
| Minggu | Kegiatan | Fase Roadmap |
|---|---|---|
| 1 | Analisis kebutuhan, SRS, use case, ERD, setup repo & environment | 0–1 |
| 2 | Database + seeder, auth & role, layout | 1–3 |
| 3 | Halaman konten, katalog | 3–4 |
| 4 | Keranjang, checkout, pengiriman | 4–5 |
| 5 | Midtrans + akun customer | 5–6 |
| 6 | Admin inventori, penjualan, operasional | 7–8 |
| 7 | Keuangan, CRM, analitik, laporan, pengaturan | 9–10 |
| 8 | QA, perbaikan, dokumentasi, latihan presentasi | 11 |
Presentasi: pertemuan setelah UTS. Alat: Trello/Notion (board), GitHub (branch per fitur: `feature/nama`, PR + review), WhatsApp/Telegram grup.

## Struktur Laporan Akhir (30% nilai)
1. Pendahuluan (latar belakang apotek, tujuan, ruang lingkup/batasan)
2. Analisis kebutuhan (fungsional & non-fungsional), aktor
3. Perancangan: Use Case Diagram, Flowchart/BPMN order→bayar→kirim→laporan, ERD, struktur tabel
4. Implementasi: teknologi, arsitektur, integrasi ERP (inventori↔penjualan↔keuangan), integrasi Midtrans, screenshot tiap modul
5. Pengujian: test plan, test case, bug list, kesimpulan QA
6. Manajemen proyek: pembagian tugas, timeline, notulen rapat, kendala & solusi
7. Kesimpulan & saran; lampiran (SRS, dump DB, tautan repo)

## Skrip Demo (±10–15 menit)
1. Beranda & halaman info (PM) — konteks bisnis apotek
2. Register/login, cari obat, wishlist, keranjang (Frontend)
3. Checkout obat bebas → bayar Midtrans sandbox → tunjukkan **stok berkurang otomatis** (DB Engineer)
4. Checkout obat keras → unggah resep → admin verifikasi
5. Admin: pesanan → input resi → status shipped → user lacak pesanan
6. Keuangan: transaksi penjualan otomatis tercatat; laporan harian/bulanan; produk terlaris; CRM
7. Retur → stok kembali; peringatan stok menipis/kedaluwarsa
8. QA: ringkas hasil pengujian & bug
9. Tanya jawab — tiap anggota paparkan perannya

## Catatan Rapat (template)
```
Tanggal:            Hadir:
Agenda:
Progres per divisi (Frontend / Backend / DB / QA):
Keputusan:
Pembagian tugas & deadline:
Kendala:
```
