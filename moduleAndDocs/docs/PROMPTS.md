# PROMPTS — Salin ke chat Antigravity / VS Code (Copilot Chat / Claude / Gemini)

## 0. Persiapan manual (sekali, di terminal)
```bash
# Herd sudah terpasang. Di folder Herd Anda (mis. ~/Herd):
laravel new apotek-erp        # pilih: React starter kit, Laravel auth, Pest, MySQL
cd apotek-erp
# salin isi paket modul ini (AGENTS.md, GEMINI.md, CLAUDE.md, .github/, docs/) ke root proyek
git init && git add . && git commit -m "chore: init project + docs"
code .                        # atau buka folder di Antigravity
```
Buat database `apotek_erp` (Herd Pro/DBngin/TablePlus) dan isi `.env`. Pilih model AI terkuat + mode agent/agentic.

## 1. Prompt Awal (jalankan sekali)
```
Baca AGENTS.md dan seluruh file di folder docs/ dengan teliti. Kamu akan membangun proyek
ERP E-Commerce Apotek sampai selesai. Mulai dari fase pertama yang belum selesai di
docs/05-ROADMAP.md. Kerjakan semua item fase itu, jalankan migrate:fresh --seed, php artisan test
dan npm run build, perbaiki error, centang roadmap, update docs/PROGRESS.md, lalu lanjut ke fase
berikutnya. Berhenti hanya jika terblokir. Jangan melewati halaman/fitur wajib di docs/01-REQUIREMENTS.md.
```

## 2. Prompt Lanjut (jika sesi terputus / konteks penuh)
```
Lanjutkan proyek. Baca AGENTS.md, docs/PROGRESS.md dan docs/05-ROADMAP.md, cari fase pertama yang
belum selesai, verifikasi kondisi kode saat ini (jalankan test), lalu lanjutkan pekerjaan.
```

## 3. Prompt per Fase (bila ingin dikerjakan bertahap)
- **Fase 0**: `Kerjakan Fase 0 di docs/05-ROADMAP.md. Proyek sudah dibuat dengan React starter kit; lengkapi setup, instal paket, buat middleware role dan struktur folder.`
- **Fase 1**: `Kerjakan Fase 1: semua migrasi sesuai docs/02-DATABASE.md, model + relasi, enum, factory, seeder realistis (obat-obatan Indonesia: Paracetamol, Amoxicillin, Vitamin C, Betadine, dll).`
- **Fase 2**: `Kerjakan Fase 2: role, redirect, Google login, halaman pengaturan akun, test Auth.`
- **Fase 3**: `Kerjakan Fase 3: layout store & admin, halaman F1–F9, tracking kunjungan.`
- **Fase 4**: `Kerjakan Fase 4: katalog, detail produk, wishlist, keranjang.`
- **Fase 5**: `Kerjakan Fase 5 dengan sangat hati-hati mengikuti docs/03-ARCHITECTURE.md dan docs/04-MIDTRANS.md. Tulis test webhook.`
- **Fase 6–10**: `Kerjakan Fase N di docs/05-ROADMAP.md sesuai requirement B/F terkait.`
- **Fase 11**: `Kerjakan Fase 11: jalankan seluruh test case di docs/06-TESTING-QA.md, perbaiki bug, lengkapi README dan dokumentasi, buat diagram Mermaid use case & flowchart di docs/diagrams/.`

## 4. Prompt Audit (sebelum demo)
```
Audit proyek terhadap docs/01-REQUIREMENTS.md: untuk setiap item F1–F21 dan B1–B18 buka route/halamannya,
verifikasi fungsionalitas, dan tandai yang belum lengkap. Perbaiki semua yang kurang. Lalu jalankan
alur end-to-end: daftar → beli → bayar sandbox → stok berkurang → transaksi keuangan → proses admin → lacak → laporan.
```

## 5. Prompt Bantuan
- Midtrans webhook lokal: `Bantu saya menguji webhook Midtrans di lokal via tunnel dan tulis skrip curl yang menghitung signature_key.`
- Dokumen: `Buatkan Use Case Diagram, Flowchart order→bayar→kirim→laporan, dan ERD dalam Mermaid di docs/diagrams/ sesuai kode aktual.`
- Laporan: `Susun draft laporan akhir sesuai struktur di docs/07-TEAM-REPORT.md berdasarkan kondisi proyek.`
