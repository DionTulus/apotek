<?php

namespace App\Http\Controllers\Webhook;

use App\Enums\OrderStatus;
use App\Enums\ShipmentStatus;
use App\Http\Controllers\Controller;
use App\Models\Shipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BiteshipWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $header = (string) config('services.biteship.webhook_header');
        $secret = config('services.biteship.webhook_secret');

        if (! is_string($secret) || $secret === '') {
            Log::error('Biteship webhook secret is not configured.');

            return response()->json(['message' => 'Webhook Biteship belum dikonfigurasi.'], 503);
        }

        $providedSecret = $request->header($header);
        if (! is_string($providedSecret) || ! hash_equals($secret, $providedSecret)) {
            return response()->json(['message' => 'Signature webhook tidak valid.'], 401);
        }

        if (trim($request->getContent()) === '') {
            return response()->json(['received' => true]);
        }

        $payload = $request->json()->all();
        $event = $payload['event'] ?? null;
        $biteshipOrderId = $payload['order_id'] ?? null;

        if (! is_string($event) || ! is_string($biteshipOrderId) || $biteshipOrderId === '') {
            return response()->json(['message' => 'Payload webhook Biteship tidak lengkap.'], 422);
        }

        if (! in_array($event, ['order.status', 'order.waybill_id', 'order.price'], true)) {
            return response()->json(['received' => true, 'ignored' => true]);
        }

        $shipment = Shipment::where('biteship_order_id', $biteshipOrderId)->first();
        if (! $shipment) {
            Log::warning('Biteship webhook references an unknown order.', ['biteship_order_id' => $biteshipOrderId]);

            return response()->json(['message' => 'Pengiriman Biteship tidak ditemukan.'], 404);
        }

        DB::transaction(function () use ($request, $payload, $event, $shipment): void {
            $shipment = Shipment::query()->lockForUpdate()->findOrFail($shipment->id);
            $deliveryId = $request->header('X-Biteship-Delivery-Id');

            if (is_string($deliveryId) && $shipment->trackingEvents()->where('delivery_id', $deliveryId)->exists()) {
                return;
            }

            $updates = [];
            if (isset($payload['courier_tracking_id']) && is_string($payload['courier_tracking_id'])) {
                $updates['biteship_tracking_id'] = $payload['courier_tracking_id'];
            }
            if (isset($payload['courier_waybill_id']) && is_string($payload['courier_waybill_id'])) {
                $updates['tracking_number'] = $payload['courier_waybill_id'];
            }
            if (isset($payload['courier_company']) && is_string($payload['courier_company'])) {
                $updates['courier'] = $payload['courier_company'];
            }
            if (isset($payload['courier_type']) && is_string($payload['courier_type'])) {
                $updates['service'] = $payload['courier_type'];
            }
            if ($event === 'order.price') {
                $price = $payload['order_price'] ?? $payload['price'] ?? null;
                if (is_numeric($price) && (int) $price >= 0) {
                    $updates['cost'] = (int) $price;
                }
            }

            $status = $payload['status'] ?? null;
            if (is_string($status) && $status !== '') {
                $updates['biteship_status'] = $status;
            }

            if ($updates !== []) {
                $shipment->update($updates);
            }

            if ($event !== 'order.status' || ! is_string($status) || $status === '') {
                return;
            }

            $note = $this->statusLabel($status);
            $shipment->trackingEvents()->create([
                'delivery_id' => is_string($deliveryId) ? $deliveryId : null,
                'biteship_status' => $status,
                'note' => $note,
                'occurred_at' => now(),
            ]);

            if ($status === 'delivered' && $shipment->order->status === OrderStatus::SHIPPED) {
                $shipment->update([
                    'status' => ShipmentStatus::DELIVERED,
                    'delivered_at' => now(),
                ]);
                $shipment->order->update(['status' => OrderStatus::DELIVERED]);
                $shipment->order->statusHistories()->create([
                    'status' => OrderStatus::DELIVERED,
                    'note' => 'Status pengiriman diperbarui otomatis oleh Biteship: paket telah diantar.',
                ]);
            } elseif (in_array($status, ['returned', 'returnInTransit'], true)) {
                $shipment->update(['status' => ShipmentStatus::RETURNED]);
            }
        });

        return response()->json(['received' => true]);
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            'confirmed' => 'Pengiriman dikonfirmasi oleh kurir.',
            'allocated' => 'Kurir telah ditugaskan.',
            'pickingUp' => 'Kurir sedang menjemput paket.',
            'picked' => 'Paket telah diambil kurir.',
            'inTransit' => 'Paket sedang dalam perjalanan.',
            'droppingOff' => 'Paket sedang diantar ke penerima.',
            'returnInTransit' => 'Paket sedang dikembalikan ke pengirim.',
            'onHold' => 'Pengiriman tertahan sementara.',
            'delivered' => 'Paket telah diantarkan.',
            'rejected' => 'Pengiriman ditolak kurir.',
            'courierNotFound' => 'Kurir belum tersedia untuk pengiriman ini.',
            'returned' => 'Paket telah dikembalikan.',
            'cancelled' => 'Pengiriman dibatalkan.',
            'disposed' => 'Paket telah dimusnahkan oleh kurir.',
            default => "Status kurir: {$status}.",
        };
    }
}
