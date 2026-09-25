# Integrasi Backend Apotek dengan Dashboard Admin & Aplikasi Pasien

Dokumen ini menjelaskan bagaimana **satu backend Laravel** (repositori ini,
`apotek`) melayani **dua front-end** sekaligus: aplikasi pasien (e-commerce) dan
dashboard admin klinik **Premysis Medika**.

---

## 1. Latar belakang

Dashboard admin Premysis Medika sebelumnya memakai server Node in-memory
(`server/index.js`). Akibatnya:

| Masalah | Dampak |
|---|---|
| Data hilang saat server di-restart | Tidak bisa dipakai kerja nyata |
| Basis data terpisah dari apotek | Pesanan pasien tidak muncul di dashboard |
| Perubahan stok di admin tak terlihat pasien | Melanggar PRD N-05 (satu sumber data) |

Setelah integrasi, kedua front-end membaca/menulis ke backend ini:

```
        ┌──────────────────┐        ┌──────────────────┐
        │ Dashboard Admin  │        │  Aplikasi Pasien │
        │   :5173          │        │    :5174         │
        └────────┬─────────┘        └────────┬─────────┘
                 │  /api/admin (proxy Vite)  │  /api (proxy Vite)
                 └───────────┬───────────────┘
                             ▼
                 ┌───────────────────────────┐
                 │  Laravel apotek  :8000    │  ← satu basis data
                 │  /api        → pasien     │
                 │  /api/admin  → dashboard  │
                 └───────────────────────────┘
```

---

## 2. Perbedaan domain (dan cara menjembataninya)

Repositori ini dimodelkan sebagai **apotek e-commerce**: nama kolom berbahasa
Inggris (`name`, `price`, `stock`, `requires_prescription`), status enum teknis
(`pending_payment`, `paid`, `processing`, ...).

Dashboard admin klinik memakai kontrak lain: nama kolom **Indonesia** (`nama`,
`harga`, `stok`, `wajib_resep`), alur kerja bidan yang lebih rinci (`Siap
Diambil`), serta entitas klinis yang tidak ada di skema apotek (bayi, imunisasi,
janji temu, pemeriksaan, resep klinis, notifikasi, log aktivitas).

Jembatan ditaruh di **satu tempat saja**: trait
`app/Http/Controllers/Api/Concerns/PresentsClinic.php`, yang berisi:

- `present*()` — model apotek ➜ bentuk JSON dashboard
- `apply*` / builder — input dashboard ➜ kolom model apotek

Controller (`AdminClinicController`) hanya memanggilnya, sehingga tidak ada
duplikasi logika dan kontrak dashboard tetap stabil walau skema apotek berubah.

### Pemetaan status pesanan

Enum apotek tidak punya padanan "Siap Diambil", sehingga:

- kolom `orders.status` (enum) **tetap diperbarui** agar aplikasi pasien ikut berubah;
- kolom `orders.status_clinic` menyimpan status alur klinik apa adanya.

| Status klinik (dashboard) | Enum apotek (`orders.status`) |
|---|---|
| Menunggu Pembayaran | `pending_payment` |
| Dibayar | `paid` |
| Diproses | `processing` |
| Siap Diambil | `processing` (+ `status_clinic`) |
| Dikirim | `shipped` |
| Selesai | `completed` |
| Dibatalkan | `cancelled` |

### Pemetaan peran

| Peran dashboard | Enum apotek (`users.role`) |
|---|---|
| bidan | `admin` |
| asisten | `pharmacist` |

---

## 3. Skema klinis yang ditambahkan

### 3.1 Migrasi

| Berkas | Isi |
|---|---|
| `database/migrations/2026_09_25_000001_create_clinic_tables.php` | Kolom klinis pada `users` (nik, tanggal_lahir, jenis_kelamin, no_wa, alamat, status_aktif) + tabel `babies`, `vaccine_types`, `vaccine_schedules`, `appointments`, `examinations`, `clinical_prescriptions`, `clinical_prescription_items`, `notifications`, `activity_logs` |
| `database/migrations/2026_09_25_000002_add_clinic_columns_to_orders.php` | Kolom `orders.status_clinic`, `bukti_bayar`, `catatan_bayar`, `alasan_tolak`, `nominal_bayar` |

Semua tabel baru memakai prefiks domain klinis dan **tidak mengubah** tabel apotek
yang sudah ada (kecuali penambahan kolom nullable pada `users` & `orders`).

### 3.2 Model

Model baru: `Baby`, `VaccineType`, `VaccineSchedule`, `Appointment`,
`Examination`, `ClinicalPrescription`, `ClinicalPrescriptionItem`,
`Notification`, `ActivityLog`.

Model `User` dan `Order` ditambah kolom klinis pada `$fillable`/`$casts`.

---

## 4. API admin (`routes/api.php`, prefiks `/api/admin`)

| Metode | Jalur | Kegunaan |
|---|---|---|
| POST | `/api/admin/auth/login-admin` | Login petugas (verifikasi password) |
| GET | `/api/admin/state` | Snapshot seluruh koleksi (dipanggil sekali saat dashboard dimuat) |
| GET | `/api/admin/{koleksi}` | Daftar koleksi |
| POST | `/api/admin/{koleksi}` | Tambah data |
| PATCH | `/api/admin/{koleksi}/{id}` | Ubah data |
| DELETE | `/api/admin/{koleksi}/{id}` | Hapus (khusus `kategori`) |
| PATCH | `/api/admin/pesanan/{id}/status` | Mesin status pesanan (**BR-02**) |
| POST | `/api/admin/pesanan/{id}/pembayaran` | Konfirmasi / tolak bukti bayar (**BR-03**) |
| PATCH | `/api/admin/appointment/{id}/status` | Ubah status janji temu (**BR-08**) |
| POST | `/api/admin/bayi/{id}/generate-jadwal` | Generate jadwal imunisasi (**BR-07**) |

Koleksi yang dikenali: `users`, `pasien`, `bayi`, `jenisVaksin`, `jadwalVaksin`,
`appointment`, `pemeriksaan`, `kategori`, `produk`, `stokMutasi`, `resep`,
`pesanan`, `pembayaran`, `notifikasi`, `logAktivitas`.

Detail kontrak JSON per endpoint ada di [`API_ADMIN.md`](./API_ADMIN.md).

---

## 5. Aturan bisnis yang ditegakkan di API admin

- **BR-02** mesin status: transisi ilegal ditolak `409`.
- **BR-03** pembayaran: konfirmasi hanya saat pesanan berstatus "Menunggu
  Pembayaran"; penolakan menyimpan `alasan_tolak` dan mengirim notifikasi.
- **BR-04** stok: pembatalan pesanan mengembalikan stok (`restoreOrderStock`);
  catat stok masuk/keluar memperbarui `products.stock` + `stock_movements`.
- **BR-07** jadwal vaksin dibuat dari master `vaccine_types` + tanggal lahir bayi.
- **BR-08** notifikasi otomatis ke pasien saat status pesanan/janji temu berubah.
- **BR-09** audit trail: setiap aksi tulis tercatat di `activity_logs`.

---

## 6. Seeder

`database/seeders/ClinicSeeder.php` — idempoten (`updateOrCreate`), mengisi akun
petugas, pasien klinis, bayi, master & jadwal vaksin, janji temu, pemeriksaan,
resep klinis, notifikasi, dan log aktivitas.

```bash
php artisan migrate --force
php artisan db:seed --class=ClinicSeeder --force
```

---

## 7. Menjalankan

```bash
cd apotek
composer install
cp .env.example .env        # sesuaikan kredensial basis data
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force                       # katalog apotek
php artisan db:seed --class=ClinicSeeder --force  # data klinis + akun petugas
php artisan serve --host=127.0.0.1 --port=8000
```

Front-end (repositori `Premysis-Medika`):

```bash
npm --prefix admin install && npm --prefix admin run dev     # :5173
npm --prefix pasien install && npm --prefix pasien run dev   # :5174
```

---

## 8. Akun demo

| Peran | Email | Password |
|---|---|---|
| Bidan (owner) | `siska@premysismedika.id` | `demo1234` |
| Asisten bidan | `rina@premysismedika.id` | `demo1234` |
| Asisten (nonaktif) | `ayu@premysismedika.id` | `demo1234` |
| Admin apotek | `admin@apotek.test` | `password` |

Akun nonaktif ditolak saat login (`403 Akun tidak aktif`).

---

## 9. Catatan & batasan

- **Autentikasi token.** Login admin memverifikasi email+password terhadap tabel
  `users`, tetapi belum menerbitkan token Sanctum. Aplikasi pasien sudah memakai
  token Bearer. Menambahkan token untuk dashboard dapat dilakukan tanpa mengubah
  kontrak JSON (hanya menambah header `Authorization`).
- **Status pembayaran manual.** Skema apotek memakai Midtrans; dashboard klinik
  memakai verifikasi bukti transfer manual. Keduanya disatukan lewat kolom
  `bukti_bayar` & `alasan_tolak`.
- **Data lama.** Tabel apotek yang sudah ada (katalog produk, pesanan) langsung
  tampil di dashboard. Entitas klinis diisi `ClinicSeeder`.
