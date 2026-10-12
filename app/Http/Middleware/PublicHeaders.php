<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
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
        $headers = self::values();
        $developmentOrigin = $this->developmentOrigin();
        if ($developmentOrigin !== null) {
            $nonce = Vite::useCspNonce();
            $webSocketOrigin = str_replace(['http://', 'https://'], ['ws://', 'wss://'], $developmentOrigin);
            $headers['Content-Security-Policy'] = "default-src 'none'; script-src 'self' {$developmentOrigin} 'nonce-{$nonce}'; style-src 'self' {$developmentOrigin} 'nonce-{$nonce}'; img-src 'self' data: {$developmentOrigin}; connect-src 'self' {$developmentOrigin} {$webSocketOrigin}; font-src 'self' {$developmentOrigin}; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
        }

        $response = $next($request);
        foreach ($headers as $name => $value) {
            $response->headers->set($name, $value);
        }

        return $response;
    }

    private function developmentOrigin(): ?string
    {
        if (! app()->isLocal() || ! Vite::isRunningHot()) {
            return null;
        }

        $url = parse_url(Vite::asset('@vite/client'));
        if ($url === false || ! in_array($url['scheme'] ?? '', ['http', 'https'], true)
            || ! in_array($url['host'] ?? '', ['localhost', '127.0.0.1'], true)) {
            return null;
        }

        return $url['scheme'].'://'.$url['host'].(isset($url['port']) ? ':'.$url['port'] : '');
    }
}
