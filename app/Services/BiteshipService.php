<?php

namespace App\Services;

use App\Exceptions\BiteshipException;
use App\Models\Order;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class BiteshipService
{
    /**
     * @param  array<int, array{name: string, value: int, quantity: int, weight: int, sku?: string, description?: string}>  $items
     * @return array<int, array{company: string, courier_name: string, courier_type: string, service_name: string, duration: string, price: int, available_for_cash_on_delivery: bool}>
     */
    public function rates(int $destinationPostalCode, array $items, ?int $cashOnDeliveryAmount = null): array
    {
        $payload = [
            'origin_postal_code' => (int) $this->requiredOrigin('postal_code'),
            'destination_postal_code' => $destinationPostalCode,
            'couriers' => config('services.biteship.couriers'),
            'items' => $items,
        ];

        if ($cashOnDeliveryAmount !== null) {
            $payload['destination_cash_on_delivery'] = $cashOnDeliveryAmount;
            $payload['destination_cash_on_delivery_type'] = config('services.biteship.cod_disbursement_type');
        }

        $response = $this->request('post', '/rates/couriers', $payload);
        $pricing = $response['pricing'] ?? null;

        if (! is_array($pricing)) {
            throw new BiteshipException('Biteship tidak mengembalikan daftar tarif kurir yang valid.');
        }

        return collect($pricing)
            ->filter(fn ($rate) => is_array($rate)
                && isset($rate['company'], $rate['price'])
                && is_numeric($rate['price'])
                && (isset($rate['type']) || isset($rate['courier_service_code'])))
            ->map(fn (array $rate) => [
                'company' => (string) $rate['company'],
                'courier_name' => (string) ($rate['courier_name'] ?? $rate['company']),
                'courier_type' => (string) ($rate['type'] ?? $rate['courier_service_code']),
                'service_name' => (string) ($rate['courier_service_name'] ?? $rate['courier_type'] ?? $rate['type'] ?? ''),
                'duration' => (string) ($rate['duration'] ?? ''),
                'price' => (int) $rate['price'],
                'available_for_cash_on_delivery' => (bool) ($rate['available_for_cash_on_delivery'] ?? false),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function createOrder(Order $order): array
    {
        if (! $order->recipient_postal_code || ! $order->biteship_courier_company || ! $order->biteship_courier_type) {
            throw new BiteshipException('Data alamat atau layanan Biteship pesanan belum lengkap.');
        }

        $order->loadMissing(['items.product', 'user']);

        $payload = [
            'shipper_contact_name' => $this->requiredOrigin('contact_name'),
            'shipper_contact_phone' => $this->requiredOrigin('contact_phone'),
            'shipper_contact_email' => config('services.biteship.origin.contact_email'),
            'shipper_organization' => config('services.biteship.origin.organization'),
            'origin_contact_name' => $this->requiredOrigin('contact_name'),
            'origin_contact_phone' => $this->requiredOrigin('contact_phone'),
            'origin_address' => $this->requiredOrigin('address'),
            'origin_postal_code' => (int) $this->requiredOrigin('postal_code'),
            'destination_contact_name' => $order->recipient_name,
            'destination_contact_phone' => $order->recipient_phone,
            'destination_contact_email' => $order->user?->email,
            'destination_address' => $order->shipping_address,
            'destination_postal_code' => (int) $order->recipient_postal_code,
            'courier_company' => $order->biteship_courier_company,
            'courier_type' => $order->biteship_courier_type,
            'delivery_type' => 'now',
            'order_note' => $order->note ?: "Pesanan {$order->order_number}",
            'reference_id' => $order->order_number,
            'items' => $order->items->map(fn ($item) => [
                'name' => $item->product_name,
                'description' => $item->product->name ?? $item->product_name,
                'sku' => $item->sku,
                'value' => $item->price,
                'quantity' => $item->qty,
                'weight' => max(1, (int) ($item->product->weight_gram ?? 1)),
            ])->values()->all(),
        ];

        if ($order->payment_method->value === 'cod') {
            $payload['destination_cash_on_delivery'] = max(0, $order->subtotal - $order->discount_total);
            $payload['destination_cash_on_delivery_type'] = config('services.biteship.cod_disbursement_type');
        }

        $response = $this->request('post', '/orders', $payload);

        if (! isset($response['id']) || ! is_string($response['id'])) {
            throw new BiteshipException('Biteship tidak mengembalikan ID pengiriman.');
        }

        return $response;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    protected function request(string $method, string $path, array $payload): array
    {
        $apiKey = config('services.biteship.api_key');

        if (! is_string($apiKey) || trim($apiKey) === '') {
            throw new BiteshipException('API key Biteship belum diatur pada konfigurasi aplikasi.');
        }

        $baseUrl = rtrim((string) config('services.biteship.base_url'), '/');
        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->asJson()
            ->timeout(15)
            ->{$method}($baseUrl.$path, $payload);

        return $this->validatedResponse($response);
    }

    /**
     * @return array<string, mixed>
     */
    protected function validatedResponse(Response $response): array
    {
        $data = $response->json();

        if (! $response->successful() || ! is_array($data) || ! ($data['success'] ?? false)) {
            $message = is_array($data)
                ? ($data['error'] ?? $data['message'] ?? null)
                : null;

            throw new BiteshipException(
                is_string($message) && $message !== ''
                    ? "Biteship: {$message}"
                    : "Permintaan ke Biteship gagal (HTTP {$response->status()})."
            );
        }

        return $data;
    }

    protected function requiredOrigin(string $key): string
    {
        $value = config("services.biteship.origin.{$key}");

        if (! is_string($value) || trim($value) === '') {
            throw new BiteshipException('Konfigurasi BITESHIP_ORIGIN_'.strtoupper($key).' belum diisi.');
        }

        return trim($value);
    }
}
