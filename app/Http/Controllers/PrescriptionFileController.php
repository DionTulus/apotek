<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PrescriptionFileController extends Controller
{
    public function show(Request $request, Prescription $prescription): StreamedResponse
    {
        $user = $request->user();

        abort_unless(
            $user->isAdmin() || $user->isPharmacist() || $user->id === $prescription->user_id,
            403,
        );

        $disk = Storage::disk('local');
        if (! $disk->exists($prescription->file_path)) {
            $disk = Storage::disk('public');
        }

        abort_unless($disk->exists($prescription->file_path), 404);

        return $disk->response(
            $prescription->file_path,
            basename($prescription->file_path),
            ['Cache-Control' => 'private, no-store'],
        );
    }
}
