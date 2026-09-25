<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel layanan klinis (pasien, bayi, vaksin, janji temu, pemeriksaan,
 * resep klinis, notifikasi, log aktivitas).
 *
 * Repositori apotek ini awalnya hanya memodelkan sisi e-commerce
 * (produk, keranjang, pesanan). Dashboard admin Premysis Medika juga
 * menampilkan layanan klinis bidan (imunisasi bayi, ANC, KB, dst.),
 * sehingga tabel pendukungnya ditambahkan di sini. Semua tabel baru
 * memakai prefiks domain klinis dan tidak mengubah tabel apotek yang
 * sudah ada.
 */
return new class extends Migration
{
    public function up(): void
    {
        // --- Kolom klinis pada tabel users (dipakai untuk data pasien) ---
        Schema::table('users', function (Blueprint $table) {
            $table->string('nik', 32)->nullable()->unique()->after('phone');
            $table->date('tanggal_lahir')->nullable()->after('nik');
            $table->char('jenis_kelamin', 1)->nullable()->after('tanggal_lahir');
            $table->string('no_wa', 24)->nullable()->after('jenis_kelamin');
            $table->text('alamat')->nullable()->after('no_wa');
            $table->boolean('status_aktif')->default(true)->after('alamat');
        });

        // --- Bayi (anak dari seorang pasien) ---
        Schema::create('babies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('nama');
            $table->string('nik', 32)->nullable();
            $table->date('tanggal_lahir');
            $table->char('jenis_kelamin', 1)->default('L');
            $table->string('nama_orang_tua')->nullable();
            $table->timestamps();
        });

        // --- Master jenis vaksin (jadwal imunisasi dasar) ---
        Schema::create('vaccine_types', function (Blueprint $table) {
            $table->id();
            $table->string('nama_vaksin');
            $table->unsignedSmallInteger('usia_bulan')->default(0);
            $table->string('deskripsi')->nullable();
            $table->timestamps();
        });

        // --- Jadwal vaksin per bayi (BR-07: dibuat dari master + tgl lahir) ---
        Schema::create('vaccine_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('baby_id')->constrained('babies')->cascadeOnDelete();
            $table->foreignId('vaccine_type_id')->constrained('vaccine_types')->cascadeOnDelete();
            $table->string('nama_vaksin');
            $table->date('tanggal_terjadwal');
            $table->date('tanggal_diberikan')->nullable();
            $table->string('status')->default('Terjadwal');
            $table->timestamps();
        });

        // --- Janji temu (appointment) ---
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('bidan_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('jenis_layanan');
            $table->date('tanggal');
            $table->string('waktu', 8);
            $table->text('keluhan')->nullable();
            $table->text('catatan')->nullable();
            $table->string('status')->default('Menunggu Konfirmasi');
            $table->timestamps();
        });

        // --- Pemeriksaan & rekam medis ---
        Schema::create('examinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->nullOnDelete();
            $table->foreignId('bidan_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('tanggal');
            $table->text('keluhan')->nullable();
            $table->text('riwayat')->nullable();
            $table->text('hasil')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('tindakan')->nullable();
            $table->text('catatan')->nullable();
            $table->date('jadwal_kontrol')->nullable();
            $table->timestamps();
        });

        // --- Resep klinis (dari pemeriksaan, berisi daftar obat) ---
        Schema::create('clinical_prescriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('examination_id')->nullable()->constrained('examinations')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('bidan_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('tanggal');
            $table->string('status')->default('Aktif');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        Schema::create('clinical_prescription_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinical_prescription_id')->constrained('clinical_prescriptions')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('nama_obat');
            $table->string('dosis')->nullable();
            $table->unsignedInteger('jumlah')->default(1);
            $table->string('aturan_pakai')->nullable();
            $table->timestamps();
        });

        // --- Notifikasi (BR-08: dipicu perubahan status pesanan/janji temu) ---
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('judul');
            $table->text('pesan');
            $table->string('jenis')->default('info');
            $table->boolean('status_baca')->default(false);
            $table->timestamps();
        });

        // --- Log aktivitas / audit trail (BR-09) ---
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('aksi');
            $table->string('entitas');
            $table->unsignedBigInteger('entitas_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('clinical_prescription_items');
        Schema::dropIfExists('clinical_prescriptions');
        Schema::dropIfExists('examinations');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('vaccine_schedules');
        Schema::dropIfExists('vaccine_types');
        Schema::dropIfExists('babies');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'nik',
                'tanggal_lahir',
                'jenis_kelamin',
                'no_wa',
                'alamat',
                'status_aktif',
            ]);
        });
    }
};
