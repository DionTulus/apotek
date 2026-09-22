# Paket Modul: ERP E-Commerce Apotek (Laravel + React + Midtrans)

Isi paket ini disalin ke **root proyek Laravel** Anda:

```
AGENTS.md                 ← konteks utama untuk agent (Antigravity/VS Code/Cursor/dll)
GEMINI.md, CLAUDE.md      ← penunjuk ke AGENTS.md (Antigravity/Gemini, Claude)
.github/copilot-instructions.md   ← penunjuk untuk GitHub Copilot di VS Code
docs/
  00-PROJECT-BRIEF.md     konteks bisnis & alur
  01-REQUIREMENTS.md      SRS + checklist F1–F21 & B1–B18 (dari PDF)
  02-DATABASE.md          ERD & skema
  03-ARCHITECTURE.md      struktur, route, logika bisnis
  04-MIDTRANS.md          integrasi payment gateway
  05-ROADMAP.md           fase kerja (checklist progres)
  06-TESTING-QA.md        test plan & test case
  07-TEAM-REPORT.md       peran, timeline 8 minggu, struktur laporan, skrip demo
  PROMPTS.md              prompt siap pakai untuk agent
  PROGRESS.md             log progres (diisi agent)
```

## Langkah Cepat
1. `laravel new apotek-erp` (React starter kit) di folder Herd → buka `http://apotek-erp.test`.
2. Salin seluruh isi paket ini ke root proyek, `git commit`.
3. Buat DB MySQL `apotek_erp`, isi `.env` + kunci Midtrans Sandbox.
4. Buka di Antigravity/VS Code, tempel **Prompt Awal** dari `docs/PROMPTS.md`.
5. Pantau `docs/PROGRESS.md`; uji manual tiap fase; review kode sebelum commit.

> Tips: AI agent bisa salah. Selalu jalankan `php artisan test`, cek alur bayar Midtrans sendiri, dan pahami kodenya — Anda yang presentasi.
