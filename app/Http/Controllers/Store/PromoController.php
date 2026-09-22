<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Promo;
use Inertia\Inertia;
use Inertia\Response;

class PromoController extends Controller
{
    public function index(): Response
    {
        $promos = Promo::active()->get();

        return Inertia::render('store/promo', [
            'promos' => $promos,
        ]);
    }
}
