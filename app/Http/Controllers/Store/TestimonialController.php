<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TestimonialController extends Controller
{
    public function index(): Response
    {
        $testimonials = Testimonial::approved()->latest()->paginate(12);

        return Inertia::render('store/testimonials', [
            'testimonials' => $testimonials,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'content' => ['required', 'string', 'max:1000'],
        ]);

        $user = $request->user();

        Testimonial::create([
            'user_id' => $user->id,
            'name' => $user->name,
            'rating' => $validated['rating'],
            'content' => $validated['content'],
            'is_approved' => false,
        ]);

        return redirect()->back()->with('success', 'Ulasan Anda berhasil dikirim dan sedang dalam proses moderasi admin. Terima kasih!');
    }
}
