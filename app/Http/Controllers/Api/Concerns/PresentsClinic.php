<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\Role;
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

/**
 * Kontrak data dashboard admin klinik (Premysis Medika).
 *
 * Basis data repositori ini adalah basis data APOTEK: nama kolom,
 * enum status, dan relasinya berbahasa Inggris dan berorientasi
 * e-commerce. Dashboard admin klinik memakai kontrak lain: nama kolom
 * Indonesia (`nama`, `id_pasien`, `stok`, `wajib_resep`, ...) dan alur
 * kerja bidan yang lebih rinci.
 *
 * Trait ini adalah SATU-SATUNYA tempat penerjemahan itu terjadi:
 *  - `present*`  : model apotek  -> bentuk JSON dashboard admin
 *  - `apply*`    : input dashboard admin -> kolom model apotek
 *
 * Dengan begitu tidak ada duplikasi logika di controller dan kontrak
 * yang dilihat dashboard tetap stabil walau skema apotek berubah.
 */
trait PresentsClinic
{
    // =========================================================
    // Pemetaan status pesanan: enum apotek <-> alur klinik
    // =========================================================
    //
    // Dashboard memakai istilah alur bidan (BR-02 versi klinik).
    // Enum apotek tidak punya padanan "Siap Diambil", sehingga status
    // enum disimpan sebagai PROCESSING dan pilihan persisnya disimpan
    // di kolom `status_clinic`.
    public const STATUS_KLINIK = [
        'Menunggu Pembayaran',
        'Dibayar',
        'Diproses',
        'Siap Diambil',
        'Dikirim',
        'Selesai',
        'Dibatalkan',
    ];

    /** Transisi status yang diizinkan (BR-02). */
    public const TRANSISI_KLINIK = [
        'Menunggu Pembayaran' => ['Dibayar', 'Dibatalkan'],
        'Dibayar' => ['Diproses', 'Dibatalkan'],
        'Diproses' => ['Siap Diambil', 'Dikirim', 'Dibatalkan'],
        'Siap Diambil' => ['Selesai'],
        'Dikirim' => ['Selesai'],
        'Selesai' => [],
        'Dibatalkan' => [],
    ];

    protected function enumDariStatusKlinik(string $status): OrderStatus
    {
        return match ($status) {
            'Menunggu Pembayaran' => OrderStatus::PENDING_PAYMENT,
            'Dibayar' => OrderStatus::PAID,
            'Diproses', 'Siap Diambil' => OrderStatus::PROCESSING,
            'Dikirim' => OrderStatus::SHIPPED,
            'Selesai' => OrderStatus::COMPLETED,
            'Dibatalkan' => OrderStatus::CANCELLED,
            default => OrderStatus::PENDING_PAYMENT,
        };
    }

    protected function statusKlinikDariOrder(Order $order): string
    {
        if ($order->status_clinic) {
            return $order->status_clinic;
        }

        $status = $order->status instanceof OrderStatus ? $order->status : OrderStatus::from($order->status);

        return match ($status) {
            OrderStatus::PENDING_PAYMENT => 'Menunggu Pembayaran',
            OrderStatus::AWAITING_PRESCRIPTION => 'Menunggu Pembayaran',
            OrderStatus::PAID => 'Dibayar',
            OrderStatus::PROCESSING => 'Diproses',
            OrderStatus::SHIPPED => 'Dikirim',
            OrderStatus::DELIVERED, OrderStatus::COMPLETED => 'Selesai',
            OrderStatus::CANCELLED, OrderStatus::EXPIRED, OrderStatus::REFUNDED => 'Dibatalkan',
        };
    }

    protected function bolehTransisiKlinik(string $dari, string $ke): bool
    {
        return in_array($ke, self::TRANSISI_KLINIK[$dari] ?? [], true);
    }

    // =========================================================
    // Peran: enum apotek <-> label peran dashboard
    // =========================================================
    protected function peranDariRole(Role $role): string
    {
        return $role === Role::ADMIN ? 'bidan' : 'asisten';
    }

    protected function roleDariPeran(?string $peran): Role
    {
        return $peran === 'bidan' ? Role::ADMIN : Role::PHARMACIST;
    }

    // =========================================================
    // Presenter
    // =========================================================

    public function presentPengguna(User $u): array
    {
        return [
            'id' => $u->id,
            'nama' => $u->name,
            'email' => $u->email,
            'peran' => $this->peranDariRole($u->role),
            'no_hp' => $u->phone,
            'status_aktif' => (bool) $u->status_aktif,
        ];
    }

    public function presentPasien(User $u): array
    {
        return [
            'id' => $u->id,
            'nama' => $u->name,
            'nik' => $u->nik,
            'email' => $u->email,
            'tanggal_lahir' => optional($u->tanggal_lahir)->toDateString(),
            'jenis_kelamin' => $u->jenis_kelamin ?: 'P',
            'no_wa' => $u->no_wa ?: $u->phone,
            'alamat' => $u->alamat,
            'tanggal_registrasi' => optional($u->created_at)->toDateString(),
            'status_aktif' => (bool) $u->status_aktif,
        ];
    }

    public function presentBayi(Baby $b): array
    {
        return [
            'id' => $b->id,
            'id_pasien' => $b->user_id,
            'nama' => $b->nama,
            'nik' => $b->nik,
            'tanggal_lahir' => optional($b->tanggal_lahir)->toDateString(),
            'jenis_kelamin' => $b->jenis_kelamin,
            'nama_orang_tua' => $b->nama_orang_tua,
        ];
    }

    public function presentJenisVaksin(VaccineType $v): array
    {
        return [
            'id' => $v->id,
            'nama_vaksin' => $v->nama_vaksin,
            'usia_bulan' => (int) $v->usia_bulan,
            'deskripsi' => $v->deskripsi,
        ];
    }

    public function presentJadwalVaksin(VaccineSchedule $j): array
    {
        return [
            'id' => $j->id,
            'id_bayi' => $j->baby_id,
            'id_jenis_vaksin' => $j->vaccine_type_id,
            'nama_vaksin' => $j->nama_vaksin,
            'tanggal_terjadwal' => optional($j->tanggal_terjadwal)->toDateString(),
            'tanggal_diberikan' => optional($j->tanggal_diberikan)->toDateString(),
            'status' => $j->status,
        ];
    }

    public function presentAppointment(Appointment $a): array
    {
        return [
            'id' => $a->id,
            'id_pasien' => $a->user_id,
            'id_bidan' => $a->bidan_id,
            'jenis_layanan' => $a->jenis_layanan,
            'tanggal' => optional($a->tanggal)->toDateString(),
            'waktu' => $a->waktu,
            'keluhan' => $a->keluhan,
            'catatan' => $a->catatan,
            'status' => $a->status,
            'created_at' => optional($a->created_at)->format('Y-m-d H:i'),
        ];
    }

    public function presentPemeriksaan(Examination $p): array
    {
        $resep = ClinicalPrescription::with('items')
            ->where('examination_id', $p->id)
            ->get()
            ->map(fn ($r) => $this->presentResep($r))
            ->values()
            ->all();

        return [
            'id' => $p->id,
            'id_pasien' => $p->user_id,
            'id_appointment' => $p->appointment_id,
            'id_bidan' => $p->bidan_id,
            'tanggal' => optional($p->tanggal)->toDateString(),
            'keluhan' => $p->keluhan,
            'riwayat' => $p->riwayat,
            'hasil' => $p->hasil,
            'diagnosis' => $p->diagnosis,
            'tindakan' => $p->tindakan,
            'catatan' => $p->catatan,
            'jadwal_kontrol' => optional($p->jadwal_kontrol)->toDateString(),
            'resep' => $resep,
        ];
    }

    public function presentKategori(Category $k): array
    {
        return [
            'id' => $k->id,
            'nama' => $k->name,
            'deskripsi' => $k->description,
        ];
    }

    public function presentProduk(Product $p): array
    {
        return [
            'id' => $p->id,
            'id_kategori' => $p->category_id,
            'nama' => $p->name,
            'deskripsi' => $p->description,
            'harga' => (int) $p->price,
            'stok' => (int) $p->stock,
            'satuan' => $p->unit,
            'stok_minimum' => (int) $p->min_stock,
            'status' => $p->is_active ? 'Aktif' : 'Nonaktif',
            'wajib_resep' => (bool) $p->requires_prescription,
        ];
    }

    public function presentStokMutasi(StockMovement $s): array
    {
        $jenis = $s->qty < 0 ? 'keluar' : 'masuk';

        return [
            'id' => $s->id,
            'id_produk' => $s->product_id,
            'jenis' => $jenis,
            'jumlah' => abs((int) $s->qty),
            'tanggal' => optional($s->created_at)->toDateString(),
            'keterangan' => $s->note,
            'sumber' => str_starts_with((string) $s->reference_type, 'App\\Models\\Order') ? 'e-commerce' : 'klinik',
            'id_pengguna' => $s->created_by,
        ];
    }

    public function presentResep(ClinicalPrescription $r): array
    {
        $r->loadMissing('items');

        return [
            'id' => $r->id,
            'id_pemeriksaan' => $r->examination_id,
            'id_pasien' => $r->user_id,
            'id_bidan' => $r->bidan_id,
            'tanggal' => optional($r->tanggal)->toDateString(),
            'status' => $r->status,
            'catatan' => $r->catatan,
            'detail' => $r->items->map(fn (ClinicalPrescriptionItem $i) => [
                'id' => $i->id,
                'id_produk' => $i->product_id,
                'nama_obat' => $i->nama_obat,
                'dosis' => $i->dosis,
                'jumlah' => (int) $i->jumlah,
                'aturan_pakai' => $i->aturan_pakai,
            ])->values()->all(),
        ];
    }

    public function presentPesanan(Order $o): array
    {
        $o->loadMissing(['items', 'shippingMethod']);

        $metodeAmbil = $o->shippingMethod && $o->shippingMethod->code === 'PICKUP'
            ? 'Ambil di Klinik'
            : 'Dikirim';

        $metodeBayar = ($o->payment_method instanceof PaymentMethod ? $o->payment_method : PaymentMethod::from($o->payment_method))
            === PaymentMethod::COD ? 'Tunai' : 'Transfer Bank';

        return [
            'id' => $o->id,
            'nomor_pesanan' => $o->order_number,
            'id_pasien' => $o->user_id,
            // `total` SUDAH termasuk ongkir supaya dashboard tidak
            // menjumlahkan biaya_kirim dua kali.
            'total' => (int) $o->grand_total,
            'biaya_kirim' => (int) $o->shipping_cost,
            'alamat_pengiriman' => $metodeAmbil === 'Dikirim' ? $o->shipping_address : '-',
            'metode_ambil' => $metodeAmbil,
            'metode_bayar' => $metodeBayar,
            'status' => $this->statusKlinikDariOrder($o),
            'waktu_pemesanan' => optional($o->created_at)->format('Y-m-d H:i'),
            'status_pembayaran' => $this->statusPembayaranKlinik($o),
            'bukti_bayar' => $o->bukti_bayar,
            'catatan_bayar' => $o->catatan_bayar,
            'alasan_tolak' => $o->alasan_tolak,
            'detail' => $o->items->map(fn ($i) => [
                'id' => $i->id,
                'id_produk' => $i->product_id,
                'nama_produk' => $i->product_name,
                'jumlah' => (int) $i->qty,
                'harga_satuan' => (int) $i->price,
            ])->values()->all(),
        ];
    }

    protected function statusPembayaranKlinik(Order $o): string
    {
        if ($o->alasan_tolak) {
            return 'Ditolak';
        }

        $status = $o->payment_status instanceof PaymentStatus ? $o->payment_status : PaymentStatus::from($o->payment_status);

        if ($status === PaymentStatus::PAID) {
            return 'Terverifikasi';
        }

        return $o->bukti_bayar ? 'Menunggu Verifikasi' : 'Belum Bayar';
    }

    public function presentPembayaran(Payment $p): array
    {
        return [
            'id' => $p->id,
            'id_pesanan' => $p->order_id,
            'jumlah' => (int) $p->gross_amount,
            'metode' => $p->provider === 'cod' ? 'Tunai' : 'Transfer Bank',
            'bukti' => $p->order?->bukti_bayar,
            'status' => $p->status instanceof PaymentStatus ? ucfirst($p->status->value) : (string) $p->status,
            'waktu' => optional($p->created_at)->format('Y-m-d H:i'),
            'id_pengguna' => null,
        ];
    }

    public function presentNotifikasi(Notification $n): array
    {
        return [
            'id' => $n->id,
            'id_pasien' => $n->user_id,
            'judul' => $n->judul,
            'pesan' => $n->pesan,
            'jenis' => $n->jenis,
            'status_baca' => (bool) $n->status_baca,
            'tanggal' => optional($n->created_at)->format('Y-m-d H:i'),
        ];
    }

    public function presentLogAktivitas(ActivityLog $l): array
    {
        return [
            'id' => $l->id,
            'id_pengguna' => $l->user_id,
            'aksi' => $l->aksi,
            'entitas' => $l->entitas,
            'id_entitas' => $l->entitas_id,
            'waktu' => optional($l->created_at)->format('Y-m-d H:i'),
        ];
    }

    // =========================================================
    // Penerjemah input dashboard -> kolom model apotek
    // =========================================================

    protected function slugUnik(string $nama, string $tabel, ?int $abaikanId = null): string
    {
        $dasar = \Illuminate\Support\Str::slug($nama) ?: 'item';
        $slug = $dasar;
        $n = 1;
        while (\Illuminate\Support\Facades\DB::table($tabel)
            ->where('slug', $slug)
            ->when($abaikanId, fn ($q) => $q->where('id', '!=', $abaikanId))
            ->exists()) {
            $slug = $dasar.'-'.(++$n);
        }

        return $slug;
    }

    protected function catat(string $aksi, string $entitas, ?int $idEntitas = null, ?int $idPengguna = null): void
    {
        ActivityLog::create([
            'user_id' => $idPengguna,
            'aksi' => $aksi,
            'entitas' => $entitas,
            'entitas_id' => $idEntitas,
        ]);
    }

    protected function notifikasiUntuk(?int $idPasien, string $judul, string $pesan, string $jenis = 'info'): void
    {
        if (! $idPasien) {
            return;
        }

        Notification::create([
            'user_id' => $idPasien,
            'judul' => $judul,
            'pesan' => $pesan,
            'jenis' => $jenis,
            'status_baca' => false,
        ]);
    }
}
