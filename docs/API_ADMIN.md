# Referensi API Admin — `/api/admin`

API ini dipakai oleh **dashboard admin klinik Premysis Medika** (React, port 5173).
Basis: `http://127.0.0.1:8000/api/admin`. Semua respons berformat JSON.

> Untuk gambaran besar integrasi (pemetaan domain, aturan bisnis), lihat
> [`INTEGRASI_BACKEND.md`](./INTEGRASI_BACKEND.md).

---

## 1. Autentikasi

### `POST /api/admin/auth/login-admin`

Memverifikasi email + password petugas. Peran dipetakan: `admin` ➜ `bidan`,
`pharmacist` ➜ `asisten`. Akun dengan `status_aktif = false` ditolak.

**Body**

```json
{ "email": "siska@premysismedika.id", "password": "demo1234" }
```

**200**

```json
{
  "pengguna": {
    "id": 24,
    "nama": "Siska Mariawati, S.Tr.Keb.",
    "email": "siska@premysismedika.id",
    "peran": "bidan",
    "no_hp": "0812-1111-2222",
    "status_aktif": true
  }
}
```

**401** kredensial salah · **403** `{ "pesan": "Akun tidak aktif. Hubungi Bidan." }`

---

## 2. Snapshot

### `GET /api/admin/state`

Mengembalikan **seluruh koleksi** dalam satu panggilan. Dashboard memanggil ini
sekali saat dimuat, lalu menyimpannya di `DataContext`.

**200** — objek dengan kunci berikut (nilai = array):

| Kunci | Isi | Contoh field |
|---|---|---|
| `users` | Akun petugas | `id, nama, email, peran, no_hp, status_aktif` |
| `pasien` | Data pasien | `id, nama, nik, email, tanggal_lahir, jenis_kelamin, no_wa, alamat, tanggal_registrasi, status_aktif` |
| `bayi` | Data bayi | `id, id_pasien, nama, nik, tanggal_lahir, jenis_kelamin, nama_orang_tua` |
| `jenisVaksin` | Master vaksin | `id, nama_vaksin, usia_bulan, deskripsi` |
| `jadwalVaksin` | Jadwal imunisasi | `id, id_bayi, id_jenis_vaksin, nama_vaksin, tanggal_terjadwal, tanggal_diberikan, status` |
| `appointment` | Janji temu | `id, id_pasien, id_bidan, jenis_layanan, tanggal, waktu, keluhan, catatan, status, created_at` |
| `pemeriksaan` | Rekam medis | `id, id_pasien, id_appointment, id_bidan, tanggal, keluhan, riwayat, hasil, diagnosis, tindakan, catatan, jadwal_kontrol, resep[]` |
| `kategori` | Kategori produk | `id, nama, deskripsi` |
| `produk` | Katalog obat | `id, id_kategori, nama, deskripsi, harga, stok, satuan, stok_minimum, status, wajib_resep` |
| `stokMutasi` | Mutasi stok | `id, id_produk, jenis, jumlah, tanggal, keterangan, sumber, id_pengguna` |
| `resep` | Resep klinis | `id, id_pemeriksaan, id_pasien, id_bidan, tanggal, status, catatan, detail[]` |
| `pesanan` | Pesanan | `id, nomor_pesanan, id_pasien, total, biaya_kirim, alamat_pengiriman, metode_ambil, metode_bayar, status, waktu_pemesanan, status_pembayaran, bukti_bayar, catatan_bayar, alasan_tolak, detail[]` |
| `pembayaran` | Pembayaran | `id, id_pesanan, jumlah, metode, bukti, status, waktu, id_pengguna` |
| `notifikasi` | Notifikasi pasien | `id, id_pasien, judul, pesan, jenis, status_baca, tanggal` |
| `logAktivitas` | Audit trail | `id, id_pengguna, aksi, entitas, id_entitas, waktu` |

**Detail bersarang**

- `pesanan[].detail[]` → `{ id, id_produk, nama_produk, jumlah, harga_satuan }`
- `resep[].detail[]` → `{ id, id_produk, nama_obat, dosis, jumlah, aturan_pakai }`

---

## 3. CRUD generik

Pola: `/api/admin/{koleksi}[/{id}]`.

| Metode | Jalur | Kegunaan |
|---|---|---|
| `GET` | `/api/admin/{koleksi}` | Daftar |
| `POST` | `/api/admin/{koleksi}` | Tambah |
| `PATCH` | `/api/admin/{koleksi}/{id}` | Ubah |
| `DELETE` | `/api/admin/{koleksi}/{id}` | Hapus |

Nilai `{koleksi}`: `users`, `pasien`, `bayi`, `jenisVaksin`, `jadwalVaksin`,
`appointment`, `pemeriksaan`, `kategori`, `produk`, `stokMutasi`, `resep`,
`pesanan`, `pembayaran`, `notifikasi`, `logAktivitas`.

**Contoh — tambah kategori**

```bash
curl -X POST http://127.0.0.1:8000/api/admin/kategori \
  -H 'Content-Type: application/json' \
  -d '{"nama":"Vitamin","deskripsi":"Suplemen & vitamin"}'
```

**200** `{ "data": { "id": 11, "nama": "Vitamin", "deskripsi": "Suplemen & vitamin" } }`

**Catatan**

- `DELETE` hanya diizinkan untuk koleksi `kategori`; selain itu `400`.
- Koleksi tak dikenal ➜ `404 { "pesan": "Koleksi \"...\" tidak dikenal." }`
- Field masukan memakai **nama kontrak dashboard** (Indonesia); trait
  `PresentsClinic` yang memetakannya ke kolom apotek.

---

## 4. Aksi khusus

### `PATCH /api/admin/pesanan/{id}/status` — mesin status (BR-02)

**Body** `{ "status": "Siap Diambil" }`

Transisi yang sah:

```
Menunggu Pembayaran ─▶ Dibayar ─▶ Diproses ─▶ Siap Diambil ─▶ Dikirim ─▶ Selesai
        │                │           │             │            │
        └────────────────┴───────────┴─────────────┴────────────┴──▶ Dibatalkan
```

- Transisi ilegal ➜ `409 { "pesan": "Transisi ... tidak diizinkan (BR-02)." }`
- Ke **Dibatalkan** memicu pemulihan stok (BR-04) + notifikasi (BR-08)
- Setiap perubahan tercatat di `activity_logs` (BR-09)

### `POST /api/admin/pesanan/{id}/pembayaran` — verifikasi bukti (BR-03)

**Body konfirmasi** (tanpa `tolak`)

```json
{ "metode": "Transfer Bank" }
```

**Body tolak** (`tolak: true`)

```json
{ "tolak": true, "alasan": "Bukti tidak terbaca" }
```

- Konfirmasi hanya sah saat pesanan "Menunggu Pembayaran" ➜ selain itu `409`
- Konfirmasi: `status_clinic` ➜ "Dibayar", `payment_status` ➜ `PAID`, `paid_at` diisi
- Tolak: menyimpan `alasan_tolak` + mengirim notifikasi ke pasien

### `PATCH /api/admin/appointment/{id}/status` — status janji temu (BR-08)

**Body** `{ "status": "Dikonfirmasi", "id_bidan": 24 }`

Nilai: `Menunggu`, `Dikonfirmasi`, `Selesai`, `Dibatalkan`, `Tidak Hadir`.
Perubahan status mengirim notifikasi ke pasien (BR-08).

### `POST /api/admin/bayi/{id}/generate-jadwal` — jadwal imunisasi (BR-07)

Membuat baris `jadwalVaksin` dari master `vaccine_types` berdasarkan tanggal
lahir bayi. Idempoten: jadwal yang sudah ada tidak diduplikasi.

**200** `{ "dibuat": 7, "jadwal": [ { "id": 12, "id_bayi": 1, ... } ] }`

---

## 5. Aturan bisnis (ringkas)

| Kode | Aturan | Ditegakkan di |
|---|---|---|
| BR-02 | Mesin status pesanan; transisi ilegal `409` | `ubahStatusPesanan` |
| BR-03 | Konfirmasi bayar hanya saat "Menunggu Pembayaran" | `pembayaran` |
| BR-04 | Batal/koreksi mengembalikan stok; mutasi dicatat | `ubahStatusPesanan`, `create/update` stok |
| BR-07 | Jadwal vaksin dari master + tanggal lahir | `generateJadwalVaksin` |
| BR-08 | Notifikasi otomatis ke pasien | status pesanan & appointment |
| BR-09 | Audit trail setiap aksi tulis | `activity_logs` |

---

## 6. Kode status

| Kode | Arti |
|---|---|
| `200` | Sukses |
| `400` | Operasi tidak diizinkan (mis. hapus selain `kategori`) |
| `401` | Kredensial salah |
| `403` | Akun nonaktif |
| `404` | Koleksi / data tidak ditemukan |
| `409` | Melanggar aturan bisnis (transisi status / konfirmasi bayar) |
| `422` | Validasi gagal |
