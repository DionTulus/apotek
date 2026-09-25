<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\PresentsResources;
use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\ContactMessage;
use App\Models\Faq;
use App\Models\Product;
use App\Models\Promo;
use App\Models\Setting;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Konten storefront + beranda: pengaturan toko, banner promo,
 * produk unggulan/terbaru, testimoni, FAQ, dan blog.
 */
class ContentController extends Controller
{
    use PresentsResources;

    public function settings(): JsonResponse
    {
        $keys = [
            'site_name', 'site_tagline', 'phone', 'whatsapp', 'email',
            'address', 'opening_hours', 'vision', 'mission',
            'terms', 'privacy', 'logo', 'about', 'maps_embed_url',
            'free_shipping_min',
        ];

        $out = [];
        foreach ($keys as $key) {
            $out[$key] = Setting::get($key);
        }

        return response()->json(['data' => $out]);
    }

    /**
     * Halaman statis storefront (Tentang Kami, Syarat, Privasi).
     *
     * `terms` dan `privacy` disimpan sebagai teks biasa di tabel
     * settings. Agar aplikasi pasien bisa menampilkannya rapi tanpa
     * parser markdown di klien, teks dipecah di sini menjadi daftar
     * paragraf/poin dan dikirim sebagai array `blocks`.
     */
    public function pages(): JsonResponse
    {
        return response()->json([
            'data' => [
                'about' => [
                    'site_name' => Setting::get('site_name'),
                    'site_tagline' => Setting::get('site_tagline'),
                    'about' => Setting::get('about'),
                    'vision' => Setting::get('vision'),
                    'mission' => $this->pecahPoin(Setting::get('mission')),
                ],
                'terms' => [
                    'title' => 'Syarat dan Ketentuan',
                    'updated_at' => optional(Setting::where('key', 'terms')->first())->updated_at?->toIso8601String(),
                    'blocks' => $this->pecahParagraf(Setting::get('terms')),
                ],
                'privacy' => [
                    'title' => 'Kebijakan Privasi',
                    'updated_at' => optional(Setting::where('key', 'privacy')->first())->updated_at?->toIso8601String(),
                    'blocks' => $this->pecahParagraf(Setting::get('privacy')),
                ],
            ],
        ]);
    }

    /**
     * Informasi kontak apotek untuk halaman Kontak Kami.
     */
    public function contact(): JsonResponse
    {
        return response()->json([
            'data' => [
                'site_name' => Setting::get('site_name'),
                'phone' => Setting::get('phone'),
                'whatsapp' => Setting::get('whatsapp'),
                'email' => Setting::get('email'),
                'address' => Setting::get('address'),
                'opening_hours' => Setting::get('opening_hours'),
                'maps_embed_url' => Setting::get('maps_embed_url'),
            ],
        ]);
    }

    /**
     * Form Kontak Kami. Pesan masuk ke kotak masuk CRM apotek
     * (tabel contact_messages) dan bisa dibaca petugas di dashboard.
     */
    public function storeContact(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:20'],
            'subject' => ['nullable', 'string', 'max:150'],
            'message' => ['required', 'string', 'min:10', 'max:2000'],
        ]);

        ContactMessage::create($data);

        return response()->json([
            'message' => 'Pesan Anda sudah kami terima. Petugas apotek akan menghubungi Anda.',
        ], 201);
    }

    /**
     * Testimoni pelanggan yang sudah disetujui apotek.
     */
    public function testimonials(): JsonResponse
    {
        $items = Testimonial::approved()
            ->latest()
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'rating' => (int) $t->rating,
                'content' => $t->content,
                'photo' => $t->photo ? $this->fileUrl($t->photo) : null,
                'created_at' => optional($t->created_at)->toIso8601String(),
            ])
            ->values()
            ->all();

        $rata = $items ? round(collect($items)->avg('rating'), 1) : 0;

        return response()->json([
            'data' => $items,
            'meta' => [
                'total' => count($items),
                'average_rating' => $rata,
                'rating_counts' => collect(range(5, 1))->mapWithKeys(fn ($r) => [
                    $r => collect($items)->where('rating', $r)->count(),
                ])->all(),
            ],
        ]);
    }

    /**
     * Pecah teks setting menjadi paragraf. Baris yang berupa nomor
     * ("1. ...") atau diawali "- " dianggap poin daftar.
     */
    protected function pecahParagraf(?string $teks): array
    {
        if (! $teks) {
            return [];
        }

        $baris = preg_split('/\r\n|\r|\n/', trim($teks));
        $blok = [];
        $paragraf = [];

        foreach ($baris as $b) {
            $b = trim($b);
            if ($b === '') {
                if ($paragraf) {
                    $blok[] = ['type' => 'p', 'text' => implode(' ', $paragraf)];
                    $paragraf = [];
                }
                continue;
            }
            $paragraf[] = $b;
        }
        if ($paragraf) {
            $blok[] = ['type' => 'p', 'text' => implode(' ', $paragraf)];
        }

        return $blok;
    }

    /**
     * Pecah teks misi menjadi daftar poin bernomor.
     */
    protected function pecahPoin(?string $teks): array
    {
        if (! $teks) {
            return [];
        }

        return collect(preg_split('/\r\n|\r|\n/', trim($teks)))
            ->map(fn ($b) => preg_replace('/^\s*\d+[\.\)]\s*/', '', trim($b)))
            ->filter()
            ->values()
            ->all();
    }

    public function home(): JsonResponse
    {
        $categories = \App\Models\Category::active()
            ->withCount(['products' => fn ($q) => $q->where('is_active', true)])
            ->orderBy('name')
            ->take(8)
            ->get();

        $featured = Product::active()->with('category')->featured()->take(8)->get();
        $latest = Product::active()->with('category')->latest()->take(8)->get();
        $popular = Product::active()->with('category')->orderBy('sold_count', 'desc')->take(8)->get();

        return response()->json([
            'categories' => $categories->map(fn ($c) => $this->presentCategory($c))->values()->all(),
            'featured_products' => $featured->map(fn ($p) => $this->presentProduct($p))->values()->all(),
            'latest_products' => $latest->map(fn ($p) => $this->presentProduct($p))->values()->all(),
            'popular_products' => $popular->map(fn ($p) => $this->presentProduct($p))->values()->all(),
            'promos' => Promo::active()->take(5)->get()->map(fn ($p) => $this->presentPromo($p))->values()->all(),
            'testimonials' => Testimonial::approved()->latest()->take(6)->get()->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'rating' => (int) $t->rating,
                'content' => $t->content,
                'photo' => $t->photo ? $this->fileUrl($t->photo) : null,
            ])->values()->all(),
            // FAQ dan janji layanan ikut dikirim bersama beranda supaya
            // pengunjung bisa membaca semuanya tanpa berpindah halaman.
            'faqs' => Faq::active()->take(6)->get()->map(fn ($f) => [
                'id' => $f->id,
                'question' => $f->question,
                'answer' => $f->answer,
            ])->values()->all(),
            'promises' => $this->janjiLayanan(),
            'settings' => [
                'site_name' => Setting::get('site_name'),
                'site_tagline' => Setting::get('site_tagline'),
                'phone' => Setting::get('phone'),
                'whatsapp' => Setting::get('whatsapp'),
                'email' => Setting::get('email'),
                'address' => Setting::get('address'),
                'opening_hours' => Setting::get('opening_hours'),
                'logo' => Setting::get('logo'),
            ],
        ]);
    }

    /**
     * "Yang Kami Janjikan" - komitmen layanan yang tampil di beranda.
     *
     * Disimpan di kode (bukan tabel) karena isinya adalah kebijakan
     * layanan klinik yang jarang berubah dan harus ikut terversi di
     * repositori. Ubah di sini bila kebijakan layanan berubah.
     */
    protected function janjiLayanan(): array
    {
        return [
            [
                'judul' => 'Obat Asli & Terdaftar BPOM',
                'isi' => 'Semua obat dibeli dari distributor resmi dan dicek masa simpannya sebelum dikirim.',
                'ikon' => 'perisai',
                'warna' => 'permukaan-mint',
            ],
            [
                'judul' => 'Dikemas Apoteker',
                'isi' => 'Setiap pesanan disiapkan dan diperiksa langsung oleh apoteker kami, bukan mesin.',
                'ikon' => 'buku',
                'warna' => 'permukaan-sky',
            ],
            [
                'judul' => 'Konsultasi Gratis',
                'isi' => 'Tanya dosis atau aturan pakai lewat WhatsApp tanpa biaya tambahan.',
                'ikon' => 'chat',
                'warna' => 'permukaan-peach',
            ],
            [
                'judul' => 'Antar Cepat Sampai Rumah',
                'isi' => 'Pesan sebelum sore, pesanan dikirim di hari yang sama untuk area terdekat.',
                'ikon' => 'kirim',
                'warna' => 'permukaan-honey',
            ],
        ];
    }

    public function promos(): JsonResponse
    {
        return response()->json([
            'data' => Promo::active()->get()->map(fn ($p) => $this->presentPromo($p))->values()->all(),
        ]);
    }

    public function validatePromo(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'subtotal' => ['required', 'integer', 'min:0'],
        ]);

        $promo = Promo::active()->where('code', strtoupper($data['code']))->first();

        if (! $promo) {
            return response()->json(['valid' => false, 'message' => 'Kode promo tidak ditemukan atau sudah kedaluwarsa.'], 404);
        }

        if ($data['subtotal'] < $promo->min_purchase) {
            return response()->json([
                'valid' => false,
                'message' => 'Minimal belanja Rp '.number_format($promo->min_purchase, 0, ',', '.').' untuk memakai promo ini.',
            ], 422);
        }

        if ($promo->isPercentage()) {
            $discount = $promo->discountFor($data['subtotal']);
        } else {
            $discount = (int) $promo->value;
        }

        $discount = min($discount, $data['subtotal']);

        return response()->json([
            'valid' => true,
            'promo' => $this->presentPromo($promo),
            'discount' => $discount,
        ]);
    }

    public function faqs(): JsonResponse
    {
        $faqs = Faq::active()->get()->map(fn ($f) => [
            'id' => $f->id,
            'question' => $f->question,
            'answer' => $f->answer,
        ])->values()->all();

        return response()->json(['data' => $faqs]);
    }

    public function blogs(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 9), 1), 30);
        $posts = BlogPost::published()->with('author:id,name')->latest('published_at')->paginate($perPage);

        return response()->json([
            'data' => collect($posts->items())->map(fn ($p) => $this->presentBlog($p, false))->values()->all(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    public function blogShow(string $slug): JsonResponse
    {
        $post = BlogPost::published()->with('author:id,name')->where('slug', $slug)->firstOrFail();

        return response()->json(['data' => $this->presentBlog($post, true)]);
    }

    protected function presentBlog(BlogPost $post, bool $withContent): array
    {
        // Estimasi waktu baca dari jumlah kata isi artikel (200 kata/menit),
        // dipakai kartu artikel untuk menampilkan "X menit baca".
        $kata = str_word_count(strip_tags((string) $post->content));
        $menitBaca = max(1, (int) ceil($kata / 200));

        $data = [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
            'cover_image' => $post->cover_image ? $this->fileUrl($post->cover_image) : null,
            'published_at' => optional($post->published_at)->toIso8601String(),
            // Penulis ditampilkan di kartu artikel. Bila belum ada
            // penulis tercatat, dipakai sebutan netral "Apoteker Kami".
            'author' => $post->author?->name ?: 'Apoteker Kami',
            'read_minutes' => $menitBaca,
        ];

        if ($withContent) {
            $data['content'] = $post->content;
        }

        return $data;
    }
}
