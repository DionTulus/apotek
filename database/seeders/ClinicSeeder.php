<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\ActivityLog;
use App\Models\Appointment;
use App\Models\Baby;
use App\Models\Category;
use App\Models\ClinicalPrescription;
use App\Models\ClinicalPrescriptionItem;
use App\Models\Examination;
use App\Models\Notification;
use App\Models\Product;
use App\Models\User;
use App\Models\VaccineSchedule;
use App\Models\VaccineType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder layanan klinis Premysis Medika.
 *
 * Melengkapi basis data apotek dengan data klinis (pasien, bayi,
 * imunisasi, janji temu, pemeriksaan, resep klinis, notifikasi, log)
 * yang ditampilkan dashboard admin, serta akun petugas (bidan &
 * asisten) yang dipakai untuk masuk ke dashboard.
 *
 * Idempoten: aman dijalankan berulang kali. Memakai firstOrCreate /
 * updateOrCreate supaya tidak menggandakan data bila dijalankan lagi.
 */
class ClinicSeeder extends Seeder
{
    public function run(): void
    {
        // ---------------------------------------------------------
        // 1. Akun petugas (bidan = admin, asisten = pharmacist)
        // ---------------------------------------------------------
        $siska = User::updateOrCreate(
            ['email' => 'siska@premysismedika.id'],
            [
                'name' => 'Siska Mariawati, S.Tr.Keb.',
                'password' => Hash::make('demo1234'),
                'role' => Role::ADMIN,
                'phone' => '0812-1111-2222',
                'status_aktif' => true,
                'email_verified_at' => now(),
            ],
        );

        User::updateOrCreate(
            ['email' => 'rina@premysismedika.id'],
            [
                'name' => 'Rina Kartika',
                'password' => Hash::make('demo1234'),
                'role' => Role::PHARMACIST,
                'phone' => '0812-3333-4444',
                'status_aktif' => true,
                'email_verified_at' => now(),
            ],
        );

        User::updateOrCreate(
            ['email' => 'ayu@premysismedika.id'],
            [
                'name' => 'Ayu Lestari',
                'password' => Hash::make('demo1234'),
                'role' => Role::PHARMACIST,
                'phone' => '0812-7777-8888',
                'status_aktif' => false,
                'email_verified_at' => now(),
            ],
        );

        // ---------------------------------------------------------
        // 2. Pasien klinis (dibuat sebagai user role customer)
        // ---------------------------------------------------------
        $pasienData = [
            ['nama' => 'Siti Nurhaliza', 'nik' => '3276010101990001', 'lahir' => '1999-01-01', 'jk' => 'P', 'wa' => '0813-9000-0001', 'alamat' => 'Jl. Melati No. 12, Depok', 'reg' => '2026-01-05', 'aktif' => true],
            ['nama' => 'Dewi Lestari', 'nik' => '3276010202950002', 'lahir' => '1995-02-02', 'jk' => 'P', 'wa' => '0813-9000-0002', 'alamat' => 'Jl. Mawar No. 8, Depok', 'reg' => '2026-01-09', 'aktif' => true],
            ['nama' => 'Ahmad Fauzi', 'nik' => '3276010303900003', 'lahir' => '1990-03-03', 'jk' => 'L', 'wa' => '0813-9000-0003', 'alamat' => 'Jl. Kenanga No. 3, Jakarta', 'reg' => '2026-02-01', 'aktif' => true],
            ['nama' => 'Ratna Sari', 'nik' => '3276010404880004', 'lahir' => '1988-04-04', 'jk' => 'P', 'wa' => '0813-9000-0004', 'alamat' => 'Jl. Anggrek No. 21, Depok', 'reg' => '2026-02-11', 'aktif' => true],
            ['nama' => 'Maya Putri', 'nik' => '3276010505970005', 'lahir' => '1997-05-05', 'jk' => 'P', 'wa' => '0813-9000-0005', 'alamat' => 'Jl. Dahlia No. 5, Bogor', 'reg' => '2026-03-02', 'aktif' => true],
            ['nama' => 'Budi Santoso', 'nik' => '3276010606850006', 'lahir' => '1985-06-06', 'jk' => 'L', 'wa' => '0813-9000-0006', 'alamat' => 'Jl. Flamboyan No. 9, Depok', 'reg' => '2026-03-14', 'aktif' => false],
            ['nama' => 'Indah Permata', 'nik' => '3276010707920007', 'lahir' => '1992-07-07', 'jk' => 'P', 'wa' => '0813-9000-0007', 'alamat' => 'Jl. Cempaka No. 17, Jakarta', 'reg' => '2026-03-28', 'aktif' => true],
            ['nama' => 'Nur Aisyah', 'nik' => '3276010808960008', 'lahir' => '1996-08-08', 'jk' => 'P', 'wa' => '0813-9000-0008', 'alamat' => 'Jl. Kamboja No. 2, Depok', 'reg' => '2026-04-04', 'aktif' => true],
        ];

        $pasien = [];
        foreach ($pasienData as $i => $p) {
            $pasien[$i + 1] = User::updateOrCreate(
                ['email' => 'pasien'.($i + 1).'@premysismedika.id'],
                [
                    'name' => $p['nama'],
                    'password' => Hash::make('demo1234'),
                    'role' => Role::CUSTOMER,
                    'phone' => $p['wa'],
                    'nik' => $p['nik'],
                    'tanggal_lahir' => $p['lahir'],
                    'jenis_kelamin' => $p['jk'],
                    'no_wa' => $p['wa'],
                    'alamat' => $p['alamat'],
                    'status_aktif' => $p['aktif'],
                    'email_verified_at' => now(),
                    'created_at' => $p['reg'].' 08:00:00',
                ],
            );
        }

        // ---------------------------------------------------------
        // 3. Bayi
        // ---------------------------------------------------------
        $bayiData = [
            [1, 2, 'Kenzo Alfarizi', '2025-10-12', 'L', 'Dewi Lestari'],
            [2, 4, 'Alesha Kirana', '2025-11-20', 'P', 'Ratna Sari'],
            [3, 5, 'Binar Prayoga', '2026-01-08', 'L', 'Maya Putri'],
            [4, 8, 'Zahra Amelia', '2026-02-15', 'P', 'Nur Aisyah'],
        ];
        $bayi = [];
        foreach ($bayiData as [$id, $idPasien, $nama, $lahir, $jk, $ortu]) {
            $bayi[$id] = Baby::updateOrCreate(
                ['id' => $id],
                [
                    'user_id' => $pasien[$idPasien]->id,
                    'nama' => $nama,
                    'nik' => $pasien[$idPasien]->nik,
                    'tanggal_lahir' => $lahir,
                    'jenis_kelamin' => $jk,
                    'nama_orang_tua' => $ortu,
                ],
            );
        }

        // ---------------------------------------------------------
        // 4. Master jenis vaksin
        // ---------------------------------------------------------
        $jenisVaksinData = [
            ['BCG', 1, 'Tuberkulosis'],
            ['Hepatitis B-1', 0, 'Hepatitis B dosis 1'],
            ['Polio-1', 1, 'Polio dosis 1'],
            ['DPT-HB-Hib-1', 2, 'Difteri, Pertusis, Tetanus, Hepatitis B, Hib'],
            ['Polio-2', 2, 'Polio dosis 2'],
            ['DPT-HB-Hib-2', 3, 'Dosis 2'],
            ['Campak-Rubella', 9, 'MR dosis 1'],
        ];
        $jenisVaksin = [];
        foreach ($jenisVaksinData as $i => [$nama, $usia, $desk]) {
            $jenisVaksin[$i + 1] = VaccineType::updateOrCreate(
                ['id' => $i + 1],
                ['nama_vaksin' => $nama, 'usia_bulan' => $usia, 'deskripsi' => $desk],
            );
        }

        // ---------------------------------------------------------
        // 5. Jadwal vaksin
        // ---------------------------------------------------------
        $jadwalData = [
            [1, 1, 1, '2025-11-12', '2025-11-12', 'Selesai'],
            [1, 3, 1, '2025-11-12', '2025-11-12', 'Selesai'],
            [1, 4, 1, '2025-12-12', '2025-12-14', 'Selesai'],
            [1, 6, 1, '2026-04-20', null, 'Terjadwal'],
            [2, 1, 1, '2025-12-20', '2025-12-20', 'Selesai'],
            [2, 4, 1, '2026-01-20', '2026-01-22', 'Selesai'],
            [2, 6, 1, '2026-04-25', null, 'Terjadwal'],
            [3, 2, 1, '2026-01-08', '2026-01-08', 'Selesai'],
            [3, 1, 1, '2026-02-08', null, 'Terjadwal'],
            [4, 2, 1, '2026-02-15', '2026-02-15', 'Selesai'],
            [4, 1, 1, '2026-03-15', null, 'Terjadwal'],
        ];
        foreach ($jadwalData as $i => [$idBayi, $idJenis, , $terjadwal, $diberikan, $status]) {
            VaccineSchedule::updateOrCreate(
                ['id' => $i + 1],
                [
                    'baby_id' => $bayi[$idBayi]->id,
                    'vaccine_type_id' => $jenisVaksin[$idJenis]->id,
                    'nama_vaksin' => $jenisVaksin[$idJenis]->nama_vaksin,
                    'tanggal_terjadwal' => $terjadwal,
                    'tanggal_diberikan' => $diberikan,
                    'status' => $status,
                ],
            );
        }

        // ---------------------------------------------------------
        // 6. Janji temu
        // ---------------------------------------------------------
        $appointmentData = [
            [1, 1, 'Pemeriksaan Kehamilan', '2026-04-20', '09:00', 'Kontrol rutin kehamilan trimester 2', '', 'Dikonfirmasi'],
            [2, 2, 'Imunisasi Bayi', '2026-04-20', '10:00', 'Vaksin DPT-HB-Hib-2 untuk Kenzo', '', 'Dikonfirmasi'],
            [3, 3, 'Konsultasi Umum', '2026-04-20', '11:00', 'Demam 2 hari', 'Bawa hasil lab', 'Menunggu Konfirmasi'],
            [4, 4, 'Kontrol Nifas', '2026-04-21', '09:30', 'Kontrol pasca melahirkan', '', 'Menunggu Konfirmasi'],
            [5, 5, 'KB / Kontrasepsi', '2026-04-21', '13:00', 'Pemasangan IUD', '', 'Dikonfirmasi'],
            [6, 7, 'Pemeriksaan Kehamilan', '2026-04-18', '10:00', 'Kontrol rutin', '', 'Selesai'],
            [7, 8, 'Imunisasi Bayi', '2026-04-15', '09:00', 'Vaksin BCG Zahra', '', 'Selesai'],
            [8, 1, 'Konsultasi Umum', '2026-04-10', '14:00', 'Sakit kepala', '', 'Dibatalkan'],
            [9, 2, 'Pemeriksaan Kehamilan', '2026-04-22', '09:00', 'Kontrol kehamilan', '', 'Menunggu Konfirmasi'],
            [10, 5, 'Konsultasi Umum', '2026-04-19', '15:00', 'Batuk berdahak', '', 'Selesai'],
        ];
        $appointment = [];
        foreach ($appointmentData as $i => [$id, $idPasien, $layanan, $tgl, $jam, $keluhan, $catatan, $status]) {
            $appointment[$id] = Appointment::updateOrCreate(
                ['id' => $id],
                [
                    'user_id' => $pasien[$idPasien]->id,
                    'bidan_id' => $siska->id,
                    'jenis_layanan' => $layanan,
                    'tanggal' => $tgl,
                    'waktu' => $jam,
                    'keluhan' => $keluhan,
                    'catatan' => $catatan,
                    'status' => $status,
                ],
            );
        }

        // ---------------------------------------------------------
        // 7. Pemeriksaan
        // ---------------------------------------------------------
        $pemeriksaanData = [
            [1, 7, 6, '2026-04-18', 'Kontrol rutin kehamilan', 'TFU 24 cm, DJJ 140x/menit, tekanan darah 110/70', 'Kehamilan normal G2P1A0 UK 24 minggu', 'Pemeriksaan ANC rutin, USG', 'Kontrol 1 bulan lagi'],
            [2, 8, 7, '2026-04-15', 'Imunisasi BCG', 'BB 4.2 kg, suhu 36.8°C, kondisi sehat', 'Bayi sehat, siap imunisasi', 'Pemberian vaksin BCG 0.05 ml', 'Observasi 30 menit'],
            [3, 5, 10, '2026-04-19', 'Batuk berdahak 5 hari', 'Faring hiperemis, suhu 37.5°C', 'ISPA (Infeksi Saluran Pernapasan Akut)', 'Pemberian resep obat batuk & vitamin', 'Kontrol bila tidak membaik 3 hari'],
            [4, 2, null, '2026-04-12', 'Nyeri perut bagian bawah', 'Tekanan darah 120/80, nyeri tekan abdomen', 'Dismenore', 'Pemberian analgesik', ''],
        ];
        $pemeriksaan = [];
        foreach ($pemeriksaanData as $i => [$id, $idPasien, $idAppt, $tgl, $keluhan, $hasil, $diagnosis, $tindakan, $catatan]) {
            $pemeriksaan[$id] = Examination::updateOrCreate(
                ['id' => $id],
                [
                    'user_id' => $pasien[$idPasien]->id,
                    'appointment_id' => $idAppt ? $appointment[$idAppt]->id : null,
                    'bidan_id' => $siska->id,
                    'tanggal' => $tgl,
                    'keluhan' => $keluhan,
                    'hasil' => $hasil,
                    'diagnosis' => $diagnosis,
                    'tindakan' => $tindakan,
                    'catatan' => $catatan,
                ],
            );
        }

        // ---------------------------------------------------------
        // 8. Resep klinis + item
        // ---------------------------------------------------------
        $produkByNama = Product::pluck('id', 'name');
        $produkId = fn (string $nama) => $produkByNama[$nama] ?? null;

        $resepData = [
            [1, 3, 5, '2026-04-19', 'Aktif', [
                ['OBH Combi Batuk Sirup Sachet', '3x sehari', 1, '1 sendok takar setelah makan'],
                ['Enervon-C Botol 30 Tablet', '1x sehari', 1, '1 tablet pagi hari'],
            ]],
            [2, 4, 2, '2026-04-12', 'Selesai', [
                ['Paracetamol 500mg Strip', '3x sehari', 1, '1 tablet bila nyeri'],
            ]],
            [3, 1, 7, '2026-04-18', 'Aktif', [
                ['Imboost Force Kaplet Strip', '1x sehari', 2, '1 kapsul setelah makan'],
            ]],
        ];
        foreach ($resepData as [$id, $idPemeriksaan, $idPasien, $tgl, $status, $items]) {
            $resep = ClinicalPrescription::updateOrCreate(
                ['id' => $id],
                [
                    'examination_id' => $pemeriksaan[$idPemeriksaan]->id,
                    'user_id' => $pasien[$idPasien]->id,
                    'bidan_id' => $siska->id,
                    'tanggal' => $tgl,
                    'status' => $status,
                ],
            );
            foreach ($items as $urutan => [$namaObat, $dosis, $jumlah, $aturan]) {
                ClinicalPrescriptionItem::updateOrCreate(
                    ['clinical_prescription_id' => $resep->id, 'nama_obat' => $namaObat],
                    [
                        'product_id' => $produkId($namaObat),
                        'dosis' => $dosis,
                        'jumlah' => $jumlah,
                        'aturan_pakai' => $aturan,
                    ],
                );
            }
        }

        // ---------------------------------------------------------
        // 9. Notifikasi
        // ---------------------------------------------------------
        $notifData = [
            [2, 'Pengingat Vaksin H-1', 'Vaksin DPT-HB-Hib-2 untuk Kenzo dijadwalkan besok.', 'vaksin', false, '2026-04-19 08:00:00'],
            [1, 'Appointment Dikonfirmasi', 'Appointment Anda tanggal 20 Apr 2026 pukul 09:00 telah dikonfirmasi.', 'appointment', true, '2026-04-18 09:30:00'],
            [3, 'Pesanan Diproses', 'Pesanan ORD-20260419-0002 sedang diproses.', 'pesanan', false, '2026-04-19 15:00:00'],
        ];
        foreach ($notifData as $i => [$idPasien, $judul, $pesan, $jenis, $baca, $tgl]) {
            Notification::updateOrCreate(
                ['id' => $i + 1],
                [
                    'user_id' => $pasien[$idPasien]->id,
                    'judul' => $judul,
                    'pesan' => $pesan,
                    'jenis' => $jenis,
                    'status_baca' => $baca,
                    'created_at' => $tgl,
                ],
            );
        }

        // ---------------------------------------------------------
        // 10. Log aktivitas
        // ---------------------------------------------------------
        $logData = [
            [1, 'Membuat resep', 'Resep', 1, '2026-04-19 10:15:00'],
            [2, 'Konfirmasi pembayaran', 'Pesanan', 6, '2026-04-20 11:20:00'],
            [2, 'Menambah pasien', 'Pasien', 8, '2026-04-04 08:45:00'],
            [1, 'Mencatat pemeriksaan', 'Pemeriksaan', 3, '2026-04-19 10:00:00'],
        ];
        $rina = User::where('email', 'rina@premysismedika.id')->first();
        $petugas = [1 => $siska->id, 2 => $rina?->id ?? $siska->id];
        foreach ($logData as $i => [$idPengguna, $aksi, $entitas, $idEntitas, $waktu]) {
            ActivityLog::updateOrCreate(
                ['id' => $i + 1],
                [
                    'user_id' => $petugas[$idPengguna],
                    'aksi' => $aksi,
                    'entitas' => $entitas,
                    'entitas_id' => $idEntitas,
                    'created_at' => $waktu,
                ],
            );
        }
    }
}
