<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyPrescriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $prescriptions = Prescription::with(['reviewer'])
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(10);

        return Inertia::render('store/account/prescriptions', [
            'prescriptions' => $prescriptions,
        ]);
    }
}
