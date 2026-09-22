# 03 — Arsitektur, Route & Logika Bisnis

## Struktur Folder (target)
```
app/
  Enums/            OrderStatus, PaymentStatus, DrugClass, StockMovementType, Role
  Http/Controllers/
    Store/          Home, Page, Product, Cart, Wishlist, Checkout, Payment, Order, TrackOrder, Address, Testimonial, Blog, Contact, Prescription
    Admin/          Dashboard, Product, Category, Customer, Order, Payment, Shipment, ShippingMethod, Stock, Supplier, Purchase, Return, User, Setting, Finance, Crm, Analytics, Report, Faq, Blog, Promo, Testimonial, ContactMessage, Prescription
    Webhook/        MidtransController
  Http/Middleware/  EnsureRole, TrackVisit, HandleInertiaRequests (share settings, cart count, flash)
  Http/Requests/    (Form Request per aksi)
  Models/
  Policies/
  Services/         CartService, CheckoutService, OrderService, StockService, PaymentService (Midtrans), FinanceService, ReportService, PromoService, ShippingService
  Console/Commands/ BackupDatabase, ExpireUnpaidOrders, SendLowStockDigest
database/{migrations,seeders,factories}
resources/js/
  pages/store/…  pages/admin/…  pages/account/…
  components/{store,admin,ui}/  layouts/{store-layout,admin-layout}.tsx
  lib/{format.ts, api.ts}   types/
tests/Feature/{Checkout,Midtrans,Stock,Finance,Auth,Admin}
```

## Route Ringkas
**Publik**: `GET /`, `/tentang-kami`, `/kontak` (+`POST`), `/faq`, `/syarat-ketentuan`, `/kebijakan-privasi`, `/testimoni`, `/blog`, `/blog/{slug}`, `/promo`, `/produk`, `/produk/{slug}`, `/lacak-pesanan` (+`POST`).
**Auth**: `/login`, `/register`, `/auth/google/redirect|callback`, lupa password (bawaan starter kit).
**Customer (auth)**: `/wishlist` (+toggle), `/keranjang` (+add/update/remove), `/checkout` (+`POST`), `/checkout/pengiriman`, `/checkout/payment`, `/pembayaran/{order}`, `/akun/pengaturan`, `/akun/alamat`, `/akun/pesanan`, `/akun/pesanan/{no}`, `/akun/pesanan/{no}/retur`, `/akun/resep`.
**Webhook**: `POST /midtrans/notification` (tanpa CSRF & auth, verifikasi signature).
**Admin** (`/admin`, middleware `auth`,`role:admin` — `pharmacist` hanya stok & resep): resource controller untuk setiap modul di `docs/01-REQUIREMENTS.md` bagian C.

## Layanan & Logika Bisnis Inti

### CartService
- Cart per user (DB). Guest boleh melihat katalog; add-to-cart memaksa login (redirect kembali).
- Validasi qty ≤ stok tersedia & produk aktif & tidak kedaluwarsa.

### CheckoutService::placeOrder(user, payload)  — DALAM `DB::transaction`
1. Ambil cart items, `lockForUpdate()` pada produk terkait.
2. Validasi stok cukup; jika ada produk `requires_prescription` → wajib `prescription_id` (status pending/approved) → order status awal `awaiting_prescription` bila belum approved.
3. Hitung ulang subtotal dari harga DB, terapkan promo (PromoService), ongkir (ShippingService: base + per kg × berat total), grand_total.
4. Buat `orders`, `order_items` (snapshot nama/harga/cost).
5. **Kurangi stok** via `StockService::decrease()` (FEFO batch) + catat `stock_movements(type=sale)`. Naikkan `sold_count`.
6. Kosongkan cart. Set `expires_at = now()+24 jam` (Midtrans) atau null (COD).
7. Buat `payments` (pending). Jika Midtrans → `PaymentService::createSnapToken(order)`.
8. Return order.

### OrderService::transition(order, newStatus)
Alur sah:
```
pending_payment → paid → processing → shipped → delivered → completed
awaiting_prescription → (resep approved) → pending_payment | processing(COD)
pending_payment/awaiting_prescription → cancelled | expired  (STOK DIKEMBALIKAN)
paid..delivered → refunded (via retur)
COD: awaiting/processing → shipped → delivered (payment_status=paid, income tercatat)
```
Tolak transisi tidak valid (throw). Setiap transisi dicatat (timeline untuk lacak pesanan; gunakan tabel `order_status_histories` (order_id,status,note,created_at,created_by) — tambahkan migrasi ini).

### StockService
- `decrease(product, qty, ref)` / `increase(...)` / `adjust(...)`; selalu tulis `stock_movements` + `stock_after`.
- Throw `InsufficientStockException` bila hasil < 0.
- `lowStock()` (stock ≤ min_stock), `expiringSoon(90)`, `expired()`.

### FinanceService
- `recordSale(order)` saat payment paid (idempotent: cek `reference`), `recordRefund`, `recordPurchase`, `recordExpense` manual.
- `incomeReport(from,to,group)`, `expenseReport`, `profitLoss(from,to)` (pendapatan − HPP − pengeluaran).

### ReportService
`salesDaily/Monthly`, `topProducts`, `lowStock`, `customerSegments` (baru: ≤30 hari; setia: ≥3 order; pasif: >90 hari tanpa order; top spender), `visitors(from,to)`.

### Scheduler (routes/console.php)
- `orders:expire` tiap 5 menit — batalkan order `pending_payment` melewati `expires_at` → restore stok.
- `app:backup-db` harian 02:00 (mysqldump ke `storage/app/backups`, simpan 7 terbaru).
- `stock:digest` harian — log/email ringkasan stok menipis & mendekati kedaluwarsa.

## Inertia Shared Props
`auth.user`, `settings` (nama, logo, kontak), `cart.count`, `wishlist.count`, `flash.success|error`.

## Otorisasi
- Middleware `EnsureRole` (`role:admin`, `role:admin,pharmacist`).
- Policy: user hanya boleh melihat order/alamat/resep miliknya.
- Rate limit: login (5/menit), lacak pesanan (10/menit), kontak (5/menit).

## Storage
`php artisan storage:link`. Folder: `products/`, `categories/`, `prescriptions/` (disk **private**, tampilkan lewat route ber-otorisasi), `blog/`, `branding/`.

## Konvensi UI
- Store layout: navbar (logo, cari, kategori, wishlist, keranjang, akun), footer (link halaman info, kontak, sosial).
- Admin layout: sidebar per modul (Dashboard, Katalog, Inventori, Penjualan, Keuangan, CRM, Konten, Pengaturan), tabel dengan search/filter/pagination, dialog konfirmasi hapus.
- Badge status berwarna konsisten (paid=hijau, pending=kuning, cancelled=merah).
