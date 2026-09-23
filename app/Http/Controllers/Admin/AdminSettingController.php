<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingController extends Controller
{
    public function index(): Response
    {
        $allSettings = Setting::all()->pluck('value', 'key')->toArray();

        // Defaults if not set
        $settings = array_merge([
            'site_name'             => 'Apotek ERP',
            'site_tagline'          => 'Solusi Kesehatan & Apotek Modern Terpercaya',
            'phone'                 => '021-5551234',
            'whatsapp'              => '6281234567890',
            'email'                 => 'info@erp-apotek.test',
            'address'               => 'Jl. Kesehatan Raya No. 45, Jakarta Selatan 12340',
            'operating_hours'       => 'Senin - Minggu: 08:00 - 22:00 WIB',
            'maps_embed'            => '',
            'vision'                => 'Menjadi jaringan apotek modern terpercaya yang memberikan akses obat asli, terjangkau, dan layanan kefarmasian profesional.',
            'mission'               => "1. Menyediakan obat dan alat kesehatan 100% original dan teregistrasi BPOM.\n2. Memberikan konsultasi apoteker yang ramah dan solutif.\n3. Menjangkau masyarakat luas melalui layanan antar cepat.",
            'terms_content'         => 'Syarat dan ketentuan pembelian obat di Apotek ERP...',
            'privacy_content'       => 'Kebijakan privasi perlindungan data medis dan pelanggan...',
            'bank_bca'              => '123-456-7890 a/n PT Apotek ERP Sehat',
            'bank_mandiri'          => '987-654-3210 a/n PT Apotek ERP Sehat',
        ], $allSettings);

        return Inertia::render('admin/settings/index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $fields = $request->except(['_token']);

        foreach ($fields as $key => $value) {
            $group = 'general';
            if (in_array($key, ['vision', 'mission', 'terms_content', 'privacy_content'])) {
                $group = 'legal_about';
            } elseif (str_starts_with($key, 'bank_')) {
                $group = 'payment';
            }

            Setting::set($key, $value, $group);
        }

        return back()->with('success', 'Pengaturan website apotek berhasil diperbarui.');
    }
}
