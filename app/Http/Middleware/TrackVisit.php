<?php

namespace App\Http\Middleware;

use App\Models\PageVisit;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackVisit
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Track only GET HTML/Inertia requests, skip admin and API
        if ($request->isMethod('GET') && ! $request->is('admin*') && ! $request->is('api*') && ! $request->expectsJson()) {
            try {
                PageVisit::create([
                    'path' => substr($request->path(), 0, 250),
                    'ip_hash' => md5($request->ip() ?? '127.0.0.1'),
                    'user_agent' => substr($request->userAgent() ?? '', 0, 250),
                    'user_id' => $request->user()?->id,
                    'visited_at' => now(),
                ]);
            } catch (\Exception $e) {
                // Ignore analytics errors to not block request
            }
        }

        return $response;
    }
}
