# 04 — Integrasi Midtrans (Snap, Sandbox)

## Persiapan
1. Daftar https://dashboard.sandbox.midtrans.com → Settings → Access Keys → salin **Server Key** & **Client Key** (mode Sandbox).
2. `.env`:
```
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true
```
3. `composer require midtrans/midtrans-php`
4. `config/midtrans.php` membaca env di atas (jangan panggil `env()` di luar config).
5. Dashboard Midtrans → Settings → Configuration → **Payment Notification URL** = `https://<url-publik>/midtrans/notification`.
   Untuk lokal pakai tunnel: `herd share` (jika tersedia) / `ngrok http apotek-erp.test` / `cloudflared tunnel --url http://apotek-erp.test`. Set juga Finish/Unfinish/Error redirect URL ke `/akun/pesanan`.
6. CSRF: di `bootstrap/app.php` → `$middleware->validateCsrfTokens(except: ['midtrans/notification']);`

## Alur
```
Checkout POST → order dibuat → PaymentService::createSnapToken()
 → simpan payments.snap_token → halaman /pembayaran/{order} memuat snap.js
 → snap.pay(token) → user bayar di popup
 → Midtrans POST /midtrans/notification → verifikasi → update payments/orders → stok/keuangan
```
**Sumber kebenaran = webhook (server-to-server), BUKAN callback JavaScript di browser.**

## PaymentService::createSnapToken(Order $order)
```php
\Midtrans\Config::$serverKey = config('midtrans.server_key');
\Midtrans\Config::$isProduction = config('midtrans.is_production');
\Midtrans\Config::$isSanitized = true;
\Midtrans\Config::$is3ds = true;

$midtransOrderId = $order->order_number.'-'.now()->timestamp; // unik tiap percobaan
$params = [
  'transaction_details' => ['order_id' => $midtransOrderId, 'gross_amount' => (int) $order->grand_total],
  'customer_details' => ['first_name' => $order->user->name, 'email' => $order->user->email, 'phone' => $order->recipient_phone],
  'item_details' => [...order_items (id, price, quantity, name<=50 char)..., + baris ongkir, + baris diskon (harga negatif)],
  'expiry' => ['unit' => 'hours', 'duration' => 24],
];
$snapToken = \Midtrans\Snap::getSnapToken($params);
```
> Total `item_details` (price×qty, termasuk ongkir & diskon negatif) HARUS sama dengan `gross_amount`, jika tidak Midtrans menolak.

## Frontend (React)
Muat script di halaman pembayaran (sandbox):
```tsx
useEffect(() => {
  const s = document.createElement('script');
  s.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
  s.setAttribute('data-client-key', clientKey); // dari props Inertia, bukan hardcode
  document.body.appendChild(s);
  return () => { document.body.removeChild(s); };
}, []);
const pay = () => window.snap.pay(snapToken, {
  onSuccess: () => router.visit(`/akun/pesanan/${order.order_number}`),
  onPending: () => router.visit(`/akun/pesanan/${order.order_number}`),
  onError: () => toast.error('Pembayaran gagal'),
  onClose: () => toast.info('Anda menutup popup pembayaran'),
});
```
Tambahkan deklarasi tipe `window.snap` di `resources/js/types`. Tombol "Bayar Sekarang" & "Bayar Ulang" (buat token baru bila token lama kedaluwarsa).

## Webhook Handler (Webhook/MidtransController)
1. Baca JSON body. Hitung `sha512(order_id . status_code . gross_amount . SERVER_KEY)`; **bandingkan dengan `signature_key`** (`hash_equals`). Jika beda → 403.
2. Cari `payments` via `midtrans_order_id`. Tidak ada → 404.
3. Idempotent: bungkus `DB::transaction` + `lockForUpdate()` payment/order; abaikan jika status sudah final yang sama.
4. Mapping:

| transaction_status | fraud_status | Aksi |
|---|---|---|
| `capture` | `accept` | paid |
| `capture` | `challenge` | pending (tinjau manual di dashboard) |
| `settlement` | – | **paid** |
| `pending` | – | pending (simpan va_number/bank/payment_type) |
| `deny`, `cancel` | – | failed → order `cancelled` → **restore stok** |
| `expire` | – | expired → order `expired` → **restore stok** |
| `refund`/`partial_refund` | – | refunded → catat `financial_transactions(refund)` |

5. Saat **paid**: `payments.status=paid, paid_at`, `orders.payment_status=paid`; order → `paid` (atau tetap `awaiting_prescription` bila resep belum approved); `FinanceService::recordSale($order)`; kirim notifikasi.
6. Simpan seluruh payload di `payments.raw_response`. Balas HTTP 200.

## Fallback Cek Status
Tombol admin/user "Cek Status Pembayaran" → `\Midtrans\Transaction::status($midtransOrderId)` → jalankan mapper yang sama (berguna saat webhook lokal tidak sampai).

## COD
`payment_method=cod`: tidak ada Snap. Order → `processing` setelah admin konfirmasi (dan resep approved). Saat pengiriman `delivered` → payment `paid`, catat income.

## Testing Sandbox
- Kartu: `4811 1111 1111 1114`, CVV `123`, exp bulan/tahun mendatang, OTP 3DS `112233`. (Kartu tolak: `4911 1111 1111 1113`.)
- Simulasi VA/e-wallet: https://simulator.sandbox.midtrans.com
- Tes otomatis: feature test yang mem-POST payload webhook dengan signature valid (hitung di test) untuk settlement, expire, deny, signature salah (403), duplikat (idempotent).

## Checklist Keamanan
- [ ] Server Key hanya di `.env` backend
- [ ] Signature diverifikasi
- [ ] `gross_amount` webhook dicocokkan dengan `orders.grand_total`
- [ ] Idempotent
- [ ] Harga dihitung ulang di server
