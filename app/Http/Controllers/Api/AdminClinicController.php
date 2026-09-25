<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Enums\StockMovementType;
use App\Http\Controllers\Api\Concerns\PresentsClinic;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Appointment;
use App\Models\Baby;
use App\Models\Category;
use App\Models\ClinicalPrescription;
use App\Models\ClinicalPrescriptionItem;
use App\Models\Examination;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\VaccineSchedule;
use App\Models\VaccineType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * API dashboard admin klinik (Premysis Medika).
 *
 * Menyajikan basis data apotek dalam kontrak data yang dipakai
 * dashboard admin, sehingga satu basis data melayani dua front-end:
 *   - aplikasi pasien  -> /api/*        (kontrak e-commerce)
 *   - dashboard admin  -> /api/admin/*  (kontrak klinik, file ini)
 *
 * Semua aturan bisnis (BR-02 mesin status, BR-04 stok, BR-07 jadwal
 * vaksin, BR-08 notifikasi, BR-09 audit) ditegakkan di sini, bukan di
 * UI, sehingga dashboard tidak bisa melewatinya.
 */
class AdminClinicController extends Controller
{
    use PresentsClinic;

    // =========================================================
    // Snapshot seluruh data (dipakai dashboard saat dimuat)
    // =========================================================
    public function state(): JsonResponse
    {
        $users = User::whereIn('role', [Role::ADMIN, Role::PHARMACIST])
            ->orderBy('id')
            ->get()
            ->map(fn (User $u) => $this->presentPengguna($u))->values()->all();

        $pasien = User::where('role', Role::CUSTOMER)
            ->orderBy('id')
            ->get()
            ->map(fn (User $u) => $this->presentPasien($u))->values()->all();

        return response()->json([
            'users' => $users,
            'pasien' => $pasien,
            'bayi' => Baby::orderBy('id')->get()->map(fn ($b) => $this->presentBayi($b))->values()->all(),
            'jenisVaksin' => VaccineType::orderBy('id')->get()->map(fn ($v) => $this->presentJenisVaksin($v))->values()->all(),
            'jadwalVaksin' => VaccineSchedule::orderBy('id')->get()->map(fn ($j) => $this->presentJadwalVaksin($j))->values()->all(),
            'appointment' => Appointment::orderBy('id')->get()->map(fn ($a) => $this->presentAppointment($a))->values()->all(),
            'pemeriksaan' => Examination::orderBy('id')->get()->map(fn ($p) => $this->presentPemeriksaan($p))->values()->all(),
            'kategori' => Category::orderBy('id')->get()->map(fn ($k) => $this->presentKategori($k))->values()->all(),
            'produk' => Product::orderBy('id')->get()->map(fn ($p) => $this->presentProduk($p))->values()->all(),
            'stokMutasi' => StockMovement::orderByDesc('created_at')->orderByDesc('id')->get()
                ->map(fn ($s) => $this->presentStokMutasi($s))->values()->all(),
            'resep' => ClinicalPrescription::orderBy('id')->get()->map(fn ($r) => $this->presentResep($r))->values()->all(),
            'pesanan' => Order::orderByDesc('created_at')->get()->map(fn ($o) => $this->presentPesanan($o))->values()->all(),
            'pembayaran' => Payment::with('order')->orderByDesc('id')->get()
                ->map(fn ($p) => $this->presentPembayaran($p))->values()->all(),
            'notifikasi' => Notification::orderByDesc('created_at')->get()
                ->map(fn ($n) => $this->presentNotifikasi($n))->values()->all(),
            'logAktivitas' => ActivityLog::orderByDesc('created_at')->orderByDesc('id')->get()
                ->map(fn ($l) => $this->presentLogAktivitas($l))->values()->all(),
        ]);
    }

    // =========================================================
    // Autentikasi admin
    // =========================================================
    public function loginAdmin(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! in_array($user->role, [Role::ADMIN, Role::PHARMACIST], true)) {
            return response()->json(['pesan' => 'Email tidak terdaftar.'], 404);
        }

        if (! $user->status_aktif) {
            return response()->json(['pesan' => 'Akun tidak aktif. Hubungi Bidan.'], 403);
        }

        if (! Hash::check($data['password'], $user->password)) {
            return response()->json(['pesan' => 'Password salah.'], 401);
        }

        $user->forceFill(['last_login_at' => now()])->save();

        return response()->json($this->presentPengguna($user));
    }

    // =========================================================
    // CRUD generik: /api/admin/{koleksi}[/{id}]
    // =========================================================
    public function list(string $koleksi): JsonResponse
    {
        $rows = match ($koleksi) {
            'users' => User::whereIn('role', [Role::ADMIN, Role::PHARMACIST])->orderBy('id')->get()->map(fn ($u) => $this->presentPengguna($u)),
            'pasien' => User::where('role', Role::CUSTOMER)->orderBy('id')->get()->map(fn ($u) => $this->presentPasien($u)),
            'bayi' => Baby::orderBy('id')->get()->map(fn ($b) => $this->presentBayi($b)),
            'jenisVaksin' => VaccineType::orderBy('id')->get()->map(fn ($v) => $this->presentJenisVaksin($v)),
            'jadwalVaksin' => VaccineSchedule::orderBy('id')->get()->map(fn ($j) => $this->presentJadwalVaksin($j)),
            'appointment' => Appointment::orderBy('id')->get()->map(fn ($a) => $this->presentAppointment($a)),
            'pemeriksaan' => Examination::orderBy('id')->get()->map(fn ($p) => $this->presentPemeriksaan($p)),
            'kategori' => Category::orderBy('id')->get()->map(fn ($k) => $this->presentKategori($k)),
            'produk' => Product::orderBy('id')->get()->map(fn ($p) => $this->presentProduk($p)),
            'stokMutasi' => StockMovement::orderByDesc('id')->get()->map(fn ($s) => $this->presentStokMutasi($s)),
            'resep' => ClinicalPrescription::orderBy('id')->get()->map(fn ($r) => $this->presentResep($r)),
            'pesanan' => Order::orderByDesc('id')->get()->map(fn ($o) => $this->presentPesanan($o)),
            'pembayaran' => Payment::with('order')->orderByDesc('id')->get()->map(fn ($p) => $this->presentPembayaran($p)),
            'notifikasi' => Notification::orderByDesc('id')->get()->map(fn ($n) => $this->presentNotifikasi($n)),
            'logAktivitas' => ActivityLog::orderByDesc('id')->get()->map(fn ($l) => $this->presentLogAktivitas($l)),
            default => null,
        };

        if ($rows === null) {
            return response()->json(['pesan' => "Koleksi \"{$koleksi}\" tidak dikenal."], 404);
        }

        return response()->json($rows->values()->all());
    }

    public function create(Request $request, string $koleksi): JsonResponse
    {
        $body = $request->all();

        try {
            $row = match ($koleksi) {
                'users' => $this->buatPengguna($body),
                'pasien' => $this->buatPasien($body),
                'bayi' => $this->buatBayi($body),
                'jadwalVaksin' => $this->buatJadwalVaksin($body),
                'appointment' => $this->buatAppointment($body),
                'pemeriksaan' => $this->buatPemeriksaan($body),
                'kategori' => $this->buatKategori($body),
                'produk' => $this->buatProduk($body),
                'stokMutasi' => $this->buatStokMutasi($body),
                'resep' => $this->buatResep($body),
                'notifikasi' => $this->buatNotifikasi($body),
                default => null,
            };
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            return response()->json(['pesan' => $e->getMessage()], 409);
        }

        if ($row === null) {
            return response()->json(['pesan' => "Koleksi \"{$koleksi}\" tidak dapat dibuat dari dashboard."], 400);
        }

        return response()->json($row, 201);
    }

    public function update(Request $request, string $koleksi, int $id): JsonResponse
    {
        $body = $request->all();

        try {
            $row = match ($koleksi) {
                'users' => $this->ubahPengguna($id, $body),
                'pasien' => $this->ubahPasien($id, $body),
                'bayi' => $this->ubahBayi($id, $body),
                'jadwalVaksin' => $this->ubahJadwalVaksin($id, $body),
                'appointment' => $this->ubahAppointment($id, $body),
                'kategori' => $this->ubahKategori($id, $body),
                'produk' => $this->ubahProduk($id, $body),
                'resep' => $this->ubahResep($id, $body),
                'notifikasi' => $this->ubahNotifikasi($id, $body),
                default => null,
            };
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            return response()->json(['pesan' => $e->getMessage()], 409);
        }

        if ($row === null) {
            return response()->json(['pesan' => "Koleksi \"{$koleksi}\" tidak dapat diubah dari dashboard."], 400);
        }

        return response()->json($row);
    }

    public function remove(string $koleksi, int $id): JsonResponse
    {
        if ($koleksi !== 'kategori') {
            return response()->json(['pesan' => 'Penghapusan hanya tersedia untuk kategori.'], 400);
        }

        $kategori = Category::find($id);
        if (! $kategori) {
            return response()->json(['pesan' => 'Data tidak ditemukan.'], 404);
        }

        // Kategori yang masih dipakai produk tidak boleh dihapus supaya
        // produk tidak menjadi "yatim" tanpa kategori di katalog.
        $dipakai = Product::where('category_id', $id)->count();
        if ($dipakai > 0) {
            return response()->json([
                'pesan' => "Kategori masih dipakai oleh {$dipakai} produk. Pindahkan produk itu ke kategori lain dulu.",
            ], 409);
        }

        $kategori->delete();
        $this->catat('Menghapus kategori', 'Kategori', $id);

        return response()->json($this->presentKategori($kategori));
    }

    // =========================================================
    // Mesin status pesanan (BR-02) + pembayaran (BR-03)
    // =========================================================
    public function ubahStatusPesanan(Request $request, int $id): JsonResponse
    {
        $order = Order::find($id);
        if (! $order) {
            return response()->json(['pesan' => 'Pesanan tidak ditemukan.'], 404);
        }

        $tujuan = (string) $request->input('status');
        $dari = $this->statusKlinikDariOrder($order);

        if (! in_array($tujuan, self::STATUS_KLINIK, true)) {
            return response()->json(['pesan' => "Status \"{$tujuan}\" tidak dikenal."], 400);
        }

        if (! $this->bolehTransisiKlinik($dari, $tujuan)) {
            return response()->json([
                'pesan' => "Transisi {$dari} ke {$tujuan} tidak diizinkan (BR-02).",
            ], 409);
        }

        $idPengguna = $request->input('id_pengguna');

        DB::transaction(function () use ($order, $tujuan, $dari, $idPengguna) {
            $updates = [
                'status_clinic' => $tujuan,
                'status' => $this->enumDariStatusKlinik($tujuan),
            ];

            if ($tujuan === 'Dibatalkan' && $dari !== 'Dibatalkan') {
                // Stok sudah dipotong saat pesanan dibuat (CheckoutService),
                // jadi pembatalan mengembalikannya (BR-04).
                app(\App\Services\PaymentService::class)->restoreOrderStock($order, 'Pesanan dibatalkan');
                $updates['cancelled_at'] = now();
            }

            if ($tujuan === 'Selesai') {
                $updates['completed_at'] = now();
            }

            $order->update($updates);

            $order->statusHistories()->create([
                'status' => $this->enumDariStatusKlinik($tujuan),
                'note' => "Status diubah ke {$tujuan} dari dashboard admin.",
                'created_by' => $idPengguna,
            ]);
        });

        $this->catat("Ubah status pesanan ke {$tujuan}", 'Pesanan', $order->id, $idPengguna);
        $this->notifikasiStatusPesanan($order, $tujuan);

        return response()->json($this->presentPesanan($order->fresh()));
    }

    public function pembayaran(Request $request, int $id): JsonResponse
    {
        $order = Order::find($id);
        if (! $order) {
            return response()->json(['pesan' => 'Pesanan tidak ditemukan.'], 404);
        }

        $idPengguna = $request->input('id_pengguna');
        $statusKlinik = $this->statusKlinikDariOrder($order);

        // --- Admin MENOLAK bukti: pesanan tetap "Menunggu Pembayaran" ---
        if ($request->boolean('tolak')) {
            if ($statusKlinik !== 'Menunggu Pembayaran') {
                return response()->json(['pesan' => "Pesanan berstatus {$statusKlinik}, tidak menunggu pembayaran."], 409);
            }
            $alasan = trim((string) $request->input('alasan')) ?: 'Bukti pembayaran tidak jelas. Silakan unggah ulang.';
            $order->update(['alasan_tolak' => $alasan]);
            $this->catat('Menolak bukti pembayaran', 'Pesanan', $order->id, $idPengguna);
            $this->notifikasiUntuk(
                $order->user_id,
                'Bukti Pembayaran Ditolak',
                "Bukti pembayaran pesanan {$order->order_number} belum bisa kami terima: {$alasan}",
                'pesanan',
            );

            return response()->json($this->presentPesanan($order->fresh()));
        }

        // --- Admin mengonfirmasi pembayaran ---
        if ($statusKlinik !== 'Menunggu Pembayaran') {
            return response()->json(['pesan' => "Pesanan berstatus {$statusKlinik}, tidak menunggu pembayaran."], 409);
        }

        $metode = $request->input('metode');

        DB::transaction(function () use ($order, $metode, $idPengguna) {
            $order->update([
                'status' => OrderStatus::PAID,
                'status_clinic' => 'Dibayar',
                'payment_status' => PaymentStatus::PAID,
                'paid_at' => now(),
                'alasan_tolak' => null,
            ]);

            // Catat pembayaran terverifikasi bila belum ada.
            $payment = Payment::where('order_id', $order->id)->first();
            $payload = [
                'order_id' => $order->id,
                'provider' => $order->payment_method?->value === 'cod' ? 'cod' : 'midtrans',
                'gross_amount' => $order->grand_total,
                'status' => PaymentStatus::PAID,
                'transaction_status' => 'settlement',
                'paid_at' => now(),
            ];
            if ($payment) {
                $payment->update($payload);
            } else {
                Payment::create($payload);
            }

            $order->statusHistories()->create([
                'status' => OrderStatus::PAID,
                'note' => 'Pembayaran dikonfirmasi dari dashboard admin ('.$metode.').',
                'created_by' => $idPengguna,
            ]);
        });

        $this->catat('Konfirmasi pembayaran', 'Pesanan', $order->id, $idPengguna);
        $this->notifikasiStatusPesanan($order->fresh(), 'Dibayar');

        return response()->json($this->presentPesanan($order->fresh()));
    }

    protected function notifikasiStatusPesanan(Order $order, string $status): void
    {
        $teks = [
            'Dibayar' => "Pembayaran pesanan {$order->order_number} telah dikonfirmasi.",
            'Diproses' => "Pesanan {$order->order_number} sedang diproses.",
            'Siap Diambil' => "Pesanan {$order->order_number} siap diambil di klinik.",
            'Dikirim' => "Pesanan {$order->order_number} sedang dikirim.",
            'Selesai' => "Pesanan {$order->order_number} telah selesai. Terima kasih.",
            'Dibatalkan' => "Pesanan {$order->order_number} telah dibatalkan.",
        ][$status] ?? null;

        if ($teks) {
            $this->notifikasiUntuk($order->user_id, "Pesanan {$status}", $teks, 'pesanan');
        }
    }

    // =========================================================
    // Appointment (BR-08) & jadwal vaksin (BR-07)
    // =========================================================
    public function ubahStatusAppointment(Request $request, int $id): JsonResponse
    {
        $appointment = Appointment::find($id);
        if (! $appointment) {
            return response()->json(['pesan' => 'Appointment tidak ditemukan.'], 404);
        }

        $status = (string) $request->input('status');
        $dari = $appointment->status;

        $appointment->update([
            'status' => $status,
            'bidan_id' => $request->input('id_bidan', $appointment->bidan_id),
        ]);

        $this->catat("Ubah status appointment ke {$status}", 'Appointment', $appointment->id, $request->input('id_pengguna'));

        if ($dari !== $status) {
            $tgl = optional($appointment->tanggal)->translatedFormat('l, j F Y');
            $jam = str_replace(':', '.', (string) $appointment->waktu);
            $teks = [
                'Dikonfirmasi' => "Janji temu Anda pada {$tgl} pukul {$jam} WIB sudah dikonfirmasi klinik.",
                'Dibatalkan' => "Janji temu Anda pada {$tgl} pukul {$jam} WIB telah dibatalkan.",
                'Selesai' => "Janji temu Anda pada {$tgl} sudah selesai. Terima kasih sudah berkunjung.",
                'Tidak Hadir' => "Anda tercatat tidak hadir pada janji temu {$tgl}. Hubungi klinik bila perlu menjadwalkan ulang.",
            ][$status] ?? null;
            $judul = [
                'Dikonfirmasi' => 'Janji Temu Dikonfirmasi',
                'Dibatalkan' => 'Janji Temu Dibatalkan',
                'Selesai' => 'Janji Temu Selesai',
                'Tidak Hadir' => 'Anda Tidak Hadir',
            ][$status] ?? 'Janji Temu';

            if ($teks) {
                $this->notifikasiUntuk($appointment->user_id, $judul, $teks, 'appointment');
            }
        }

        return response()->json($this->presentAppointment($appointment->fresh()));
    }

    public function generateJadwalVaksin(int $id): JsonResponse
    {
        $bayi = Baby::find($id);
        if (! $bayi) {
            return response()->json(['pesan' => 'Bayi tidak ditemukan.'], 404);
        }

        $dibuat = [];
        $lahir = $bayi->tanggal_lahir;

        foreach (VaccineType::orderBy('id')->get() as $jenis) {
            $sudah = VaccineSchedule::where('baby_id', $bayi->id)
                ->where('vaccine_type_id', $jenis->id)
                ->exists();
            if ($sudah) {
                continue;
            }

            $terjadwal = $lahir->copy()->addMonths((int) $jenis->usia_bulan);

            $row = VaccineSchedule::create([
                'baby_id' => $bayi->id,
                'vaccine_type_id' => $jenis->id,
                'nama_vaksin' => $jenis->nama_vaksin,
                'tanggal_terjadwal' => $terjadwal->toDateString(),
                'tanggal_diberikan' => null,
                'status' => 'Terjadwal',
            ]);
            $dibuat[] = $this->presentJadwalVaksin($row);
        }

        $this->catat('Generate jadwal vaksin', 'Bayi', $bayi->id);

        return response()->json(['dibuat' => count($dibuat), 'jadwal' => $dibuat]);
    }

    // =========================================================
    // Builder per koleksi (create)
    // =========================================================
    protected function buatPengguna(array $b): array
    {
        $user = User::create([
            'name' => $b['nama'] ?? $b['name'],
            'email' => $b['email'],
            'password' => Hash::make($b['password'] ?? 'demo1234'),
            'phone' => $b['no_hp'] ?? null,
            'role' => $this->roleDariPeran($b['peran'] ?? 'asisten'),
            'status_aktif' => $b['status_aktif'] ?? true,
            'email_verified_at' => now(),
        ]);

        $this->catat('Menambah pengguna', 'Pengguna', $user->id, $b['id_pengguna'] ?? null);

        return $this->presentPengguna($user);
    }

    protected function buatPasien(array $b): array
    {
        $email = $b['email'] ?? null;
        if (! $email) {
            $email = 'pasien'.Str::random(8).'@premysismedika.id';
        }

        $user = User::create([
            'name' => $b['nama'],
            'email' => $email,
            'password' => Hash::make('demo1234'),
            'phone' => $b['no_wa'] ?? null,
            'role' => Role::CUSTOMER,
            'nik' => $b['nik'] ?? null,
            'tanggal_lahir' => $b['tanggal_lahir'] ?? null,
            'jenis_kelamin' => $b['jenis_kelamin'] ?? 'P',
            'no_wa' => $b['no_wa'] ?? null,
            'alamat' => $b['alamat'] ?? null,
            'status_aktif' => $b['status_aktif'] ?? true,
            'email_verified_at' => now(),
        ]);

        $this->catat('Menambah pasien', 'Pasien', $user->id, $b['id_pengguna'] ?? null);

        return $this->presentPasien($user);
    }

    protected function buatBayi(array $b): array
    {
        $bayi = Baby::create([
            'user_id' => $b['id_pasien'],
            'nama' => $b['nama'],
            'nik' => $b['nik'] ?? null,
            'tanggal_lahir' => $b['tanggal_lahir'],
            'jenis_kelamin' => $b['jenis_kelamin'] ?? 'L',
            'nama_orang_tua' => $b['nama_orang_tua'] ?? null,
        ]);

        // BR-07: bayi baru otomatis mendapat jadwal imunisasi.
        $this->generateJadwalVaksin($bayi->id);

        return $this->presentBayi($bayi);
    }

    protected function buatJadwalVaksin(array $b): array
    {
        $row = VaccineSchedule::create([
            'baby_id' => $b['id_bayi'],
            'vaccine_type_id' => $b['id_jenis_vaksin'],
            'nama_vaksin' => $b['nama_vaksin'] ?? '-',
            'tanggal_terjadwal' => $b['tanggal_terjadwal'],
            'tanggal_diberikan' => $b['tanggal_diberikan'] ?? null,
            'status' => $b['status'] ?? 'Terjadwal',
        ]);

        return $this->presentJadwalVaksin($row);
    }

    protected function buatAppointment(array $b): array
    {
        $row = Appointment::create([
            'user_id' => $b['id_pasien'],
            'bidan_id' => $b['id_bidan'] ?? null,
            'jenis_layanan' => $b['jenis_layanan'],
            'tanggal' => $b['tanggal'],
            'waktu' => $b['waktu'] ?? '09:00',
            'keluhan' => $b['keluhan'] ?? null,
            'catatan' => $b['catatan'] ?? null,
            'status' => $b['status'] ?? 'Menunggu Konfirmasi',
        ]);

        $this->catat('Menambah appointment', 'Appointment', $row->id, $b['id_pengguna'] ?? null);

        return $this->presentAppointment($row);
    }

    protected function buatPemeriksaan(array $b): array
    {
        $row = Examination::create([
            'user_id' => $b['id_pasien'],
            'appointment_id' => $b['id_appointment'] ?? null,
            'bidan_id' => $b['id_bidan'] ?? null,
            'tanggal' => $b['tanggal'] ?? now()->toDateString(),
            'keluhan' => $b['keluhan'] ?? null,
            'riwayat' => $b['riwayat'] ?? null,
            'hasil' => $b['hasil'] ?? null,
            'diagnosis' => $b['diagnosis'] ?? null,
            'tindakan' => $b['tindakan'] ?? null,
            'catatan' => $b['catatan'] ?? null,
            'jadwal_kontrol' => $b['jadwal_kontrol'] ?: null,
        ]);

        // Resep yang ditulis sekalian saat pemeriksaan disimpan sebagai
        // resep klinis (dipakai BR-05: syarat beli obat wajib resep).
        $resep = $b['resep'] ?? [];
        if (is_array($resep) && count($resep) > 0) {
            $this->simpanResep([
                'id_pemeriksaan' => $row->id,
                'id_pasien' => $b['id_pasien'],
                'id_bidan' => $b['id_bidan'] ?? null,
                'tanggal' => $b['tanggal'] ?? now()->toDateString(),
                'status' => 'Aktif',
                'detail' => $resep,
            ]);
        }

        $this->catat('Mencatat pemeriksaan', 'Pemeriksaan', $row->id, $b['id_pengguna'] ?? null);

        return $this->presentPemeriksaan($row->fresh());
    }

    protected function buatKategori(array $b): array
    {
        $nama = trim((string) $b['nama']);
        if (Category::whereRaw('LOWER(name) = ?', [mb_strtolower($nama)])->exists()) {
            throw new \RuntimeException("Kategori \"{$nama}\" sudah ada.");
        }

        $kategori = Category::create([
            'name' => $nama,
            'slug' => $this->slugUnik($nama, 'categories'),
            'description' => $b['deskripsi'] ?? null,
            'is_active' => true,
        ]);

        $this->catat('Menambah kategori', 'Kategori', $kategori->id, $b['id_pengguna'] ?? null);

        return $this->presentKategori($kategori);
    }

    protected function buatProduk(array $b): array
    {
        $nama = trim((string) $b['nama']);
        $harga = (int) ($b['harga'] ?? 0);

        $produk = Product::create([
            'category_id' => (int) $b['id_kategori'],
            'sku' => $this->skuUnik($nama),
            'name' => $nama,
            'slug' => $this->slugUnik($nama, 'products'),
            'description' => $b['deskripsi'] ?? null,
            'drug_class' => ($b['wajib_resep'] ?? false) ? 'keras' : 'bebas',
            'requires_prescription' => (bool) ($b['wajib_resep'] ?? false),
            'unit' => $b['satuan'] ?? 'pcs',
            'price' => $harga,
            'cost_price' => (int) round($harga * 0.8),
            'stock' => (int) ($b['stok'] ?? 0),
            'min_stock' => (int) ($b['stok_minimum'] ?? 10),
            'is_active' => ($b['status'] ?? 'Aktif') === 'Aktif',
        ]);

        $this->catat('Menambah produk', 'Produk', $produk->id, $b['id_pengguna'] ?? null);

        return $this->presentProduk($produk);
    }

    protected function buatStokMutasi(array $b): array
    {
        return DB::transaction(function () use ($b) {
            $produk = Product::lockForUpdate()->find($b['id_produk']);
            if (! $produk) {
                throw new \RuntimeException('Produk tidak ditemukan.');
            }

            $jenis = $b['jenis'] ?? 'masuk';
            $jumlah = (int) $b['jumlah'];
            $delta = $jenis === 'keluar' ? -$jumlah : $jumlah;

            $produk->update(['stock' => max(0, $produk->stock + $delta)]);

            $row = StockMovement::create([
                'product_id' => $produk->id,
                'type' => $jenis === 'keluar' ? StockMovementType::SALE : StockMovementType::PURCHASE,
                'qty' => $delta,
                'stock_after' => $produk->stock,
                'reference_type' => 'clinic',
                'reference_id' => null,
                'note' => $b['keterangan'] ?? null,
                'created_by' => $b['id_pengguna'] ?? null,
            ]);

            if (! empty($b['tanggal'])) {
                $row->forceFill(['created_at' => $b['tanggal'].' 08:00:00'])->save();
            }

            return $this->presentStokMutasi($row->fresh());
        });
    }

    protected function buatResep(array $b): array
    {
        $resep = $this->simpanResep($b);

        return $this->presentResep($resep);
    }

    protected function simpanResep(array $b): ClinicalPrescription
    {
        return DB::transaction(function () use ($b) {
            $resep = ClinicalPrescription::create([
                'examination_id' => $b['id_pemeriksaan'] ?? null,
                'user_id' => $b['id_pasien'],
                'bidan_id' => $b['id_bidan'] ?? null,
                'tanggal' => $b['tanggal'] ?? now()->toDateString(),
                'status' => $b['status'] ?? 'Aktif',
                'catatan' => $b['catatan'] ?? null,
            ]);

            foreach ($b['detail'] ?? [] as $item) {
                $produk = ! empty($item['id_produk']) ? Product::find($item['id_produk']) : null;
                ClinicalPrescriptionItem::create([
                    'clinical_prescription_id' => $resep->id,
                    'product_id' => $produk?->id,
                    'nama_obat' => $item['nama_obat'] ?? $produk?->name ?? '-',
                    'dosis' => $item['dosis'] ?? null,
                    'jumlah' => (int) ($item['jumlah'] ?? 1),
                    'aturan_pakai' => $item['aturan_pakai'] ?? null,
                ]);
            }

            $this->catat('Membuat resep', 'Resep', $resep->id, $b['id_pengguna'] ?? null);

            return $resep->fresh();
        });
    }

    protected function buatNotifikasi(array $b): array
    {
        $row = Notification::create([
            'user_id' => $b['id_pasien'],
            'judul' => $b['judul'],
            'pesan' => $b['pesan'],
            'jenis' => $b['jenis'] ?? 'info',
            'status_baca' => $b['status_baca'] ?? false,
        ]);

        return $this->presentNotifikasi($row);
    }

    // =========================================================
    // Builder per koleksi (update)
    // =========================================================
    protected function ubahPengguna(int $id, array $b): array
    {
        $user = User::findOrFail($id);
        $data = [];
        if (isset($b['nama'])) $data['name'] = $b['nama'];
        if (isset($b['email'])) $data['email'] = $b['email'];
        if (isset($b['peran'])) $data['role'] = $this->roleDariPeran($b['peran']);
        if (array_key_exists('no_hp', $b)) $data['phone'] = $b['no_hp'];
        if (isset($b['status_aktif'])) $data['status_aktif'] = (bool) $b['status_aktif'];
        $user->update($data);

        return $this->presentPengguna($user);
    }

    protected function ubahPasien(int $id, array $b): array
    {
        $user = User::findOrFail($id);
        $data = [];
        if (isset($b['nama'])) $data['name'] = $b['nama'];
        if (array_key_exists('nik', $b)) $data['nik'] = $b['nik'];
        if (array_key_exists('tanggal_lahir', $b)) $data['tanggal_lahir'] = $b['tanggal_lahir'];
        if (isset($b['jenis_kelamin'])) $data['jenis_kelamin'] = $b['jenis_kelamin'];
        if (array_key_exists('no_wa', $b)) $data['no_wa'] = $b['no_wa'];
        if (array_key_exists('alamat', $b)) $data['alamat'] = $b['alamat'];
        if (isset($b['status_aktif'])) $data['status_aktif'] = (bool) $b['status_aktif'];
        $user->update($data);

        return $this->presentPasien($user);
    }

    protected function ubahBayi(int $id, array $b): array
    {
        $bayi = Baby::findOrFail($id);
        $data = [];
        if (isset($b['id_pasien'])) $data['user_id'] = $b['id_pasien'];
        if (isset($b['nama'])) $data['nama'] = $b['nama'];
        if (array_key_exists('nik', $b)) $data['nik'] = $b['nik'];
        if (isset($b['tanggal_lahir'])) $data['tanggal_lahir'] = $b['tanggal_lahir'];
        if (isset($b['jenis_kelamin'])) $data['jenis_kelamin'] = $b['jenis_kelamin'];
        if (array_key_exists('nama_orang_tua', $b)) $data['nama_orang_tua'] = $b['nama_orang_tua'];
        $bayi->update($data);

        return $this->presentBayi($bayi);
    }

    protected function ubahJadwalVaksin(int $id, array $b): array
    {
        $row = VaccineSchedule::findOrFail($id);
        $data = [];
        if (isset($b['id_bayi'])) $data['baby_id'] = $b['id_bayi'];
        if (isset($b['id_jenis_vaksin'])) $data['vaccine_type_id'] = $b['id_jenis_vaksin'];
        if (isset($b['nama_vaksin'])) $data['nama_vaksin'] = $b['nama_vaksin'];
        if (isset($b['tanggal_terjadwal'])) $data['tanggal_terjadwal'] = $b['tanggal_terjadwal'];
        if (array_key_exists('tanggal_diberikan', $b)) $data['tanggal_diberikan'] = $b['tanggal_diberikan'];
        if (isset($b['status'])) $data['status'] = $b['status'];
        $row->update($data);

        return $this->presentJadwalVaksin($row);
    }

    protected function ubahAppointment(int $id, array $b): array
    {
        $row = Appointment::findOrFail($id);
        $data = [];
        if (isset($b['id_pasien'])) $data['user_id'] = $b['id_pasien'];
        if (isset($b['id_bidan'])) $data['bidan_id'] = $b['id_bidan'];
        if (isset($b['jenis_layanan'])) $data['jenis_layanan'] = $b['jenis_layanan'];
        if (isset($b['tanggal'])) $data['tanggal'] = $b['tanggal'];
        if (isset($b['waktu'])) $data['waktu'] = $b['waktu'];
        if (array_key_exists('keluhan', $b)) $data['keluhan'] = $b['keluhan'];
        if (array_key_exists('catatan', $b)) $data['catatan'] = $b['catatan'];
        $row->update($data);

        return $this->presentAppointment($row);
    }

    protected function ubahKategori(int $id, array $b): array
    {
        $kategori = Category::findOrFail($id);
        $nama = trim((string) ($b['nama'] ?? $kategori->name));

        if (Category::whereRaw('LOWER(name) = ?', [mb_strtolower($nama)])->where('id', '!=', $id)->exists()) {
            throw new \RuntimeException("Kategori \"{$nama}\" sudah ada.");
        }

        $kategori->update([
            'name' => $nama,
            'description' => $b['deskripsi'] ?? $kategori->description,
        ]);

        return $this->presentKategori($kategori);
    }

    protected function ubahProduk(int $id, array $b): array
    {
        $produk = Product::findOrFail($id);
        $data = [];
        if (isset($b['nama'])) {
            $data['name'] = $b['nama'];
        }
        if (isset($b['id_kategori'])) $data['category_id'] = (int) $b['id_kategori'];
        if (array_key_exists('deskripsi', $b)) $data['description'] = $b['deskripsi'];
        if (isset($b['harga'])) $data['price'] = (int) $b['harga'];
        if (isset($b['stok'])) $data['stock'] = (int) $b['stok'];
        if (isset($b['satuan'])) $data['unit'] = $b['satuan'];
        if (isset($b['stok_minimum'])) $data['min_stock'] = (int) $b['stok_minimum'];
        if (isset($b['status'])) $data['is_active'] = $b['status'] === 'Aktif';
        if (array_key_exists('wajib_resep', $b)) {
            $data['requires_prescription'] = (bool) $b['wajib_resep'];
            $data['drug_class'] = $b['wajib_resep'] ? 'keras' : 'bebas';
        }
        $produk->update($data);

        return $this->presentProduk($produk);
    }

    protected function ubahResep(int $id, array $b): array
    {
        $resep = ClinicalPrescription::findOrFail($id);
        $data = [];
        if (isset($b['status'])) $data['status'] = $b['status'];
        if (array_key_exists('catatan', $b)) $data['catatan'] = $b['catatan'];
        if (isset($b['tanggal'])) $data['tanggal'] = $b['tanggal'];
        $resep->update($data);

        return $this->presentResep($resep->fresh());
    }

    protected function ubahNotifikasi(int $id, array $b): array
    {
        $row = Notification::findOrFail($id);
        $data = [];
        if (isset($b['status_baca'])) $data['status_baca'] = (bool) $b['status_baca'];
        if (isset($b['judul'])) $data['judul'] = $b['judul'];
        if (isset($b['pesan'])) $data['pesan'] = $b['pesan'];
        $row->update($data);

        return $this->presentNotifikasi($row);
    }

    // =========================================================
    // Utilitas
    // =========================================================
    protected function skuUnik(string $nama): string
    {
        $dasar = strtoupper(Str::slug($nama, '-'));
        $dasar = substr($dasar, 0, 12) ?: 'PRD';
        $sku = 'SKU-'.$dasar;
        $n = 1;
        while (Product::withTrashed()->where('sku', $sku)->exists()) {
            $sku = 'SKU-'.$dasar.'-'.(++$n);
        }

        return $sku;
    }
}
