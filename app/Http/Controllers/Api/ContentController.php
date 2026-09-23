<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\PresentsResources;
use App\Http\Controllers\Controller;
use App\Models\BlogPost;
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
            'terms', 'privacy', 'logo',
        ];

        $out = [];
        foreach ($keys as $key) {
            $out[$key] = Setting::get($key);
        }

        return response()->json(['data' => $out]);
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
        ]);
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

        if ($promo->type === 'percentage') {
            $discount = (int) round(($data['subtotal'] * $promo->value) / 100);
            if ($promo->max_discount) {
                $discount = min($discount, $promo->max_discount);
            }
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
        $posts = BlogPost::published()->latest('published_at')->paginate($perPage);

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
        $post = BlogPost::published()->where('slug', $slug)->firstOrFail();

        return response()->json(['data' => $this->presentBlog($post, true)]);
    }

    protected function presentBlog(BlogPost $post, bool $withContent): array
    {
        $data = [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
            'cover_image' => $post->cover_image ? $this->fileUrl($post->cover_image) : null,
            'published_at' => optional($post->published_at)->toIso8601String(),
        ];

        if ($withContent) {
            $data['content'] = $post->content;
        }

        return $data;
    }
}
