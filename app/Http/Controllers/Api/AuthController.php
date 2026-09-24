<?php

namespace App\Http\Controllers\Api;

use App\Enums\Role;
use App\Http\Controllers\Api\Concerns\PresentsResources;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;

/**
 * Autentikasi API berbasis token (Laravel Sanctum).
 *
 * Aplikasi pasien mengirim header `Authorization: Bearer <token>` pada
 * setiap permintaan yang butuh login. Token dibuat saat register/login
 * dan dihapus saat logout.
 */
class AuthController extends Controller
{
    use PresentsResources;

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:150', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'password' => Hash::make($data['password']),
            'role' => Role::CUSTOMER,
            'email_verified_at' => now(),
        ]);

        $token = $user->createToken('pasien-app')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil.',
            'token' => $token,
            'user' => $this->presentUser($user),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            // `identifier` menerima email ATAU nomor HP supaya aplikasi
            // pasien bisa memakai satu kolom sederhana. `email` tetap
            // didukung agar klien lama tidak rusak.
            'identifier' => ['nullable', 'string'],
            'email' => ['nullable', 'string'],
            'password' => ['required', 'string'],
        ]);

        $identifier = $data['identifier'] ?? $data['email'] ?? null;

        if (! $identifier) {
            throw ValidationException::withMessages([
                'identifier' => ['Email atau nomor HP wajib diisi.'],
            ]);
        }

        $user = User::where('email', $identifier)
            ->orWhere('phone', $identifier)
            ->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'identifier' => ['Email/nomor HP atau kata sandi tidak cocok.'],
            ]);
        }

        if (! $user->isCustomer()) {
            throw ValidationException::withMessages([
                'identifier' => ['Akun ini bukan akun pelanggan. Gunakan dashboard admin.'],
            ]);
        }

        $user->forceFill(['last_login_at' => now()])->save();

        $token = $user->createToken('pasien-app')->plainTextToken;

        return response()->json([
            'message' => 'Berhasil masuk.',
            'token' => $token,
            'user' => $this->presentUser($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->presentUser($request->user()),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'email' => ['sometimes', 'email', 'max:150', 'unique:users,email,'.$user->id],
            'notify_email' => ['sometimes', 'boolean'],
            'notify_promo' => ['sometimes', 'boolean'],
        ]);

        $user->update($data);

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => $this->presentUser($user->fresh()),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Kata sandi saat ini tidak cocok.'],
            ]);
        }

        $user->update(['password' => Hash::make($data['password'])]);

        return response()->json(['message' => 'Kata sandi berhasil diperbarui.']);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Berhasil keluar.']);
    }

    // ==========================================================
    // Login dengan Google (OAuth) untuk aplikasi pasien (SPA).
    //
    // Alur: aplikasi pasien membuka /auth/google/redirect, menerima
    // URL Google, lalu mengarahkan pengguna ke sana. Setelah pengguna
    // menyetujui, Google memanggil /auth/google/callback; di sini
    // token Sanctum dibuat dan pengguna dikirim kembali ke aplikasi
    // pasien lewat query string. Dengan begitu aplikasi pasien tidak
    // perlu menyimpan client secret apa pun.
    //
    // Bila kredensial Google belum diisi di .env, endpoint tetap
    // membalas rapi (configured=false) supaya tombol di aplikasi bisa
    // menampilkan pesan yang jelas, bukan gagal diam-diam.
    // ==========================================================
    public function googleRedirect(Request $request): JsonResponse
    {
        if (empty(config('services.google.client_id'))) {
            return response()->json([
                'configured' => false,
                'message' => 'Login dengan Google belum diaktifkan oleh apotek.',
            ], 503);
        }

        $tujuan = $request->query('redirect', '/');
        $url = Socialite::driver('google')
            ->stateless()
            ->with(['state' => $tujuan])
            ->redirect()
            ->getTargetUrl();

        return response()->json(['configured' => true, 'url' => $url]);
    }

    public function googleCallback(Request $request): RedirectResponse
    {
        if (empty(config('services.google.client_id'))) {
            return $this->kembaliKeAplikasi('/', null, 'Login dengan Google belum diaktifkan oleh apotek.');
        }

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Throwable $e) {
            return $this->kembaliKeAplikasi($request->query('state', '/'), null, 'Gagal masuk dengan Google. Silakan coba lagi.');
        }

        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if (! $user) {
            $user = User::create([
                'name' => $googleUser->getName() ?? $googleUser->getNickname() ?? 'Pengguna Google',
                'email' => $googleUser->getEmail(),
                'password' => Hash::make(Str::random(40)),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'role' => Role::CUSTOMER,
                'email_verified_at' => now(),
            ]);
        } elseif (! $user->google_id) {
            $user->update(['google_id' => $googleUser->getId()]);
        }

        if (! $user->isCustomer()) {
            return $this->kembaliKeAplikasi('/', null, 'Akun ini bukan akun pelanggan.');
        }

        $user->forceFill(['last_login_at' => now()])->save();

        return $this->kembaliKeAplikasi(
            $request->query('state', '/'),
            $user->createToken('pasien-app')->plainTextToken,
        );
    }

    /**
     * Kembalikan pengguna ke aplikasi pasien setelah OAuth selesai.
     *
     * Halaman tujuan menerima `google_token` di query string lalu
     * menyimpannya sendiri. Token TIDAK ditaruh di path supaya tidak
     * ikut tercatat di log akses server.
     */
    protected function kembaliKeAplikasi(string $tujuan, ?string $token, ?string $galat = null): RedirectResponse
    {
        $dasar = rtrim(config('app.frontend_url', config('app.url')), '/');
        $tujuan = '/'.ltrim($tujuan ?: '/', '/');

        $query = array_filter([
            'google_token' => $token,
            'google_error' => $galat,
        ]);

        return redirect()->away($dasar.$tujuan.'?'.http_build_query($query));
    }
}
