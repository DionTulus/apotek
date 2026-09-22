<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Faq;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function about(): Response
    {
        return Inertia::render('store/about', [
            'vision' => Setting::get('vision'),
            'mission' => Setting::get('mission'),
            'about' => Setting::get('about'),
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('store/contact', [
            'phone' => Setting::get('phone'),
            'whatsapp' => Setting::get('whatsapp'),
            'email' => Setting::get('email'),
            'address' => Setting::get('address'),
            'mapsEmbedUrl' => Setting::get('maps_embed_url'),
        ]);
    }

    public function storeContact(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        ContactMessage::create($validated);

        return redirect()->back()->with('success', 'Pesan Anda berhasil terkirim. Terima kasih telah menghubungi kami!');
    }

    public function faq(): Response
    {
        $faqs = Faq::active()->get();

        return Inertia::render('store/faq', [
            'faqs' => $faqs,
        ]);
    }

    public function terms(): Response
    {
        return Inertia::render('store/terms', [
            'terms' => Setting::get('terms'),
        ]);
    }

    public function privacy(): Response
    {
        return Inertia::render('store/privacy', [
            'privacy' => Setting::get('privacy'),
        ]);
    }
}
