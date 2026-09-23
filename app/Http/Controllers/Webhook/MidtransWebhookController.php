<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MidtransWebhookController extends Controller
{
    public function handleNotification(Request $request, PaymentService $paymentService): JsonResponse
    {
        try {
            $payload = $request->all();
            $result = $paymentService->processNotificationPayload($payload);

            if (! $result) {
                return response()->json(['message' => 'Order payment record not found'], 404);
            }

            return response()->json(['message' => 'Notification processed successfully']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }
}
