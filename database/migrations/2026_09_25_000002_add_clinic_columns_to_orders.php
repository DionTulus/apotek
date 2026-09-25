<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Kolom tambahan pada `orders` untuk dashboard admin klinik.
 *
 * Basis data apotek memakai statusEnum teknis (pending_payment, paid,
 * processing, ...). Dashboard admin Premysis Medika memakai alur kerja
 * bidan yang lebih rinci ("Siap Diambil" untuk pesanan ambil di klinik,
 * serta status verifikasi bukti transfer manual). Kolom di sini
 * menyimpan status alur klinik apa adanya, TANPA menghapus statusEnum
 * apotek: enum tetap diperbarui agar aplikasi pasien juga ikut berubah,
 * sementara `status_clinic` menyimpan pilihan persis dari dashboard.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('status_clinic')->nullable()->after('status')->index();
            $table->string('bukti_bayar')->nullable()->after('payment_status');
            $table->text('catatan_bayar')->nullable()->after('bukti_bayar');
            $table->text('alasan_tolak')->nullable()->after('catatan_bayar');
            $table->unsignedBigInteger('nominal_bayar')->nullable()->after('alasan_tolak');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'status_clinic',
                'bukti_bayar',
                'catatan_bayar',
                'alasan_tolak',
                'nominal_bayar',
            ]);
        });
    }
};
