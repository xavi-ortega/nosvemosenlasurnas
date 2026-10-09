<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PublicHeaders
{
    /** @return array<string, string> */
    public static function values(): array
    {
        return [
            'Content-Language' => 'es',
            'Referrer-Policy' => 'no-referrer',
            'X-Content-Type-Options' => 'nosniff',
            'Content-Security-Policy' => "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
            'Permissions-Policy' => 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
        ];
    }

    public function handle(Request $request, Closure $next): Response
    {
        app()->setLocale('es');
        $response = $next($request);
        foreach (self::values() as $name => $value) {
            $response->headers->set($name, $value);
        }

        return $response;
    }
}
