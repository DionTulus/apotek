<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Promo;
use App\Models\Testimonial;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $categories = Category::active()->take(8)->get();

        $featuredProducts = Product::active()
            ->with('category')
            ->featured()
            ->take(8)
            ->get();

        $latestProducts = Product::active()
            ->with('category')
            ->latest()
            ->take(8)
            ->get();

        $promos = Promo::active()->take(3)->get();

        $testimonials = Testimonial::approved()
            ->latest()
            ->take(4)
            ->get();

        return Inertia::render('store/home', [
            'categories' => $categories,
            'featuredProducts' => $featuredProducts,
            'latestProducts' => $latestProducts,
            'promos' => $promos,
            'testimonials' => $testimonials,
        ]);
    }
}
