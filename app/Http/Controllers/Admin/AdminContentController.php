<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\ContactMessage;
use App\Models\Faq;
use App\Models\Promo;
use App\Models\Testimonial;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminContentController extends Controller
{
    // ==========================================
    // 1. FAQs Management
    // ==========================================
    public function faqs(Request $request): Response
    {
        $faqs = Faq::orderBy('sort_order', 'asc')
            ->when($request->filled('search'), fn ($q) => $q->where('question', 'like', "%{$request->input('search')}%"))
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/content/faqs', [
            'faqs'    => $faqs,
            'filters' => (object) $request->only('search'),
        ]);
    }

    public function storeFaq(Request $request): RedirectResponse
    {
        $request->validate([
            'question'   => 'required|string|max:255',
            'answer'     => 'required|string',
            'sort_order' => 'nullable|integer',
            'is_active'  => 'boolean',
        ]);

        Faq::create([
            'question'   => $request->input('question'),
            'answer'     => $request->input('answer'),
            'sort_order' => $request->input('sort_order', 0),
            'is_active'  => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'FAQ baru berhasil ditambahkan.');
    }

    public function updateFaq(Request $request, Faq $faq): RedirectResponse
    {
        $request->validate([
            'question'   => 'required|string|max:255',
            'answer'     => 'required|string',
            'sort_order' => 'nullable|integer',
            'is_active'  => 'boolean',
        ]);

        $faq->update([
            'question'   => $request->input('question'),
            'answer'     => $request->input('answer'),
            'sort_order' => $request->input('sort_order', 0),
            'is_active'  => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'FAQ berhasil diperbarui.');
    }

    public function destroyFaq(Faq $faq): RedirectResponse
    {
        $faq->delete();
        return back()->with('success', 'FAQ berhasil dihapus.');
    }

    // ==========================================
    // 2. Promos & Vouchers Management
    // ==========================================
    public function promos(Request $request): Response
    {
        $promos = Promo::latest()
            ->when($request->filled('search'), fn ($q) => $q->where('code', 'like', "%{$request->input('search')}%")
                ->orWhere('name', 'like', "%{$request->input('search')}%"))
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/content/promos', [
            'promos'  => $promos,
            'filters' => (object) $request->only('search'),
        ]);
    }

    public function storePromo(Request $request): RedirectResponse
    {
        $request->validate([
            'code'         => 'required|string|max:50|unique:promos,code',
            'name'         => 'required|string|max:100',
            'description'  => 'nullable|string|max:300',
            'type'         => 'required|in:percentage,fixed',
            'value'        => 'required|numeric|min:1',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'quota'        => 'nullable|integer|min:0',
            'starts_at'    => 'nullable|date',
            'ends_at'      => 'nullable|date|after_or_equal:starts_at',
            'is_active'    => 'boolean',
        ]);

        Promo::create([
            'code'         => strtoupper($request->input('code')),
            'name'         => $request->input('name'),
            'description'  => $request->input('description'),
            'type'         => $request->input('type'),
            'value'        => $request->input('value'),
            'min_purchase' => $request->input('min_purchase', 0),
            'max_discount' => $request->input('max_discount'),
            'quota'        => $request->input('quota'),
            'starts_at'    => $request->input('starts_at'),
            'ends_at'      => $request->input('ends_at'),
            'is_active'    => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Voucher promo baru berhasil dibuat.');
    }

    public function updatePromo(Request $request, Promo $promo): RedirectResponse
    {
        $request->validate([
            'code'         => 'required|string|max:50|unique:promos,code,' . $promo->id,
            'name'         => 'required|string|max:100',
            'description'  => 'nullable|string|max:300',
            'type'         => 'required|in:percentage,fixed',
            'value'        => 'required|numeric|min:1',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'quota'        => 'nullable|integer|min:0',
            'starts_at'    => 'nullable|date',
            'ends_at'      => 'nullable|date|after_or_equal:starts_at',
            'is_active'    => 'boolean',
        ]);

        $promo->update([
            'code'         => strtoupper($request->input('code')),
            'name'         => $request->input('name'),
            'description'  => $request->input('description'),
            'type'         => $request->input('type'),
            'value'        => $request->input('value'),
            'min_purchase' => $request->input('min_purchase', 0),
            'max_discount' => $request->input('max_discount'),
            'quota'        => $request->input('quota'),
            'starts_at'    => $request->input('starts_at'),
            'ends_at'      => $request->input('ends_at'),
            'is_active'    => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Voucher promo berhasil diperbarui.');
    }

    public function destroyPromo(Promo $promo): RedirectResponse
    {
        $promo->delete();
        return back()->with('success', 'Voucher promo berhasil dihapus.');
    }

    // ==========================================
    // 3. Blog Articles Management
    // ==========================================
    public function blogs(Request $request): Response
    {
        $posts = BlogPost::with('author')
            ->latest()
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', "%{$request->input('search')}%"))
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/content/blogs', [
            'posts'   => $posts,
            'filters' => (object) $request->only('search'),
        ]);
    }

    public function storeBlog(Request $request): RedirectResponse
    {
        $request->validate([
            'title'        => 'required|string|max:200',
            'excerpt'      => 'required|string|max:300',
            'content'      => 'required|string',
            'cover_image'  => 'nullable|string',
            'is_published' => 'boolean',
        ]);

        BlogPost::create([
            'title'        => $request->input('title'),
            'slug'         => Str::slug($request->input('title')) . '-' . rand(1000, 9999),
            'excerpt'      => $request->input('excerpt'),
            'content'      => $request->input('content'),
            'cover_image'  => $request->input('cover_image'),
            'author_id'    => $request->user()->id,
            'is_published' => $request->boolean('is_published', true),
            'published_at' => $request->boolean('is_published', true) ? now() : null,
        ]);

        return back()->with('success', 'Artikel blog baru berhasil diterbitkan.');
    }

    public function updateBlog(Request $request, BlogPost $post): RedirectResponse
    {
        $request->validate([
            'title'        => 'required|string|max:200',
            'excerpt'      => 'required|string|max:300',
            'content'      => 'required|string',
            'cover_image'  => 'nullable|string',
            'is_published' => 'boolean',
        ]);

        $post->update([
            'title'        => $request->input('title'),
            'excerpt'      => $request->input('excerpt'),
            'content'      => $request->input('content'),
            'cover_image'  => $request->input('cover_image'),
            'is_published' => $request->boolean('is_published'),
            'published_at' => $request->boolean('is_published') ? ($post->published_at ?? now()) : null,
        ]);

        return back()->with('success', 'Artikel blog berhasil diperbarui.');
    }

    public function destroyBlog(BlogPost $post): RedirectResponse
    {
        $post->delete();
        return back()->with('success', 'Artikel blog berhasil dihapus.');
    }

    // ==========================================
    // 4. Testimonials Moderation
    // ==========================================
    public function testimonials(Request $request): Response
    {
        $testimonials = Testimonial::with('user')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/content/testimonials', [
            'testimonials' => $testimonials,
        ]);
    }

    public function toggleTestimonial(Testimonial $testimonial): RedirectResponse
    {
        $testimonial->update([
            'is_approved' => !$testimonial->is_approved,
        ]);

        $status = $testimonial->is_approved ? 'disetujui dan tampil di storefront' : 'disembunyikan';
        return back()->with('success', "Status testimoni {$testimonial->name} berhasil {$status}.");
    }

    public function destroyTestimonial(Testimonial $testimonial): RedirectResponse
    {
        $testimonial->delete();
        return back()->with('success', 'Testimoni berhasil dihapus.');
    }

    // ==========================================
    // 5. Contact Inbox Messages
    // ==========================================
    public function messages(Request $request): Response
    {
        $messages = ContactMessage::latest()
            ->when($request->filled('unread'), fn ($q) => $q->where('is_read', false))
            ->paginate(15)
            ->withQueryString();

        $unreadCount = ContactMessage::where('is_read', false)->count();

        return Inertia::render('admin/content/messages', [
            'messages'    => $messages,
            'unreadCount' => $unreadCount,
            'filters'     => (object) $request->only('unread'),
        ]);
    }

    public function markMessageRead(ContactMessage $message): RedirectResponse
    {
        $message->update(['is_read' => true]);
        return back()->with('success', 'Pesan ditandai telah dibaca.');
    }

    public function destroyMessage(ContactMessage $message): RedirectResponse
    {
        $message->delete();
        return back()->with('success', 'Pesan kontak berhasil dihapus.');
    }
}
