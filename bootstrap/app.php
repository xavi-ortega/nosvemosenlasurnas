<?php

use App\Http\Middleware\PublicHeaders;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(PublicHeaders::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $exception, Request $request): Response {
            $status = match (true) {
                $exception instanceof HttpExceptionInterface => $exception->getStatusCode(),
                $exception instanceof ValidationException => 422,
                $exception instanceof AuthenticationException => 401,
                default => 500,
            };

            $codes = [
                400 => 'bad_request',
                401 => 'unauthorized',
                403 => 'forbidden',
                404 => 'not_found',
                405 => 'method_not_allowed',
                419 => 'session_expired',
                422 => 'invalid_request',
                429 => 'too_many_requests',
                500 => 'internal_error',
                503 => 'unavailable',
            ];

            $messageKeys = [
                'bad_request' => 'errors.bad_request',
                'unauthorized' => 'errors.unauthorized',
                'forbidden' => 'errors.forbidden',
                'not_found' => 'errors.not_found',
                'method_not_allowed' => 'errors.method_not_allowed',
                'session_expired' => 'errors.session_expired',
                'invalid_request' => 'errors.invalid_request',
                'too_many_requests' => 'errors.too_many_requests',
                'internal_error' => 'errors.internal_error',
                'unavailable' => 'errors.unavailable',
            ];

            $code = $codes[$status] ?? 'internal_error';

            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['error' => ['code' => $code]], $status)->withHeaders(PublicHeaders::values());
            }

            return response()->view('errors.message', [
                'messageKey' => $messageKeys[$code],
            ], $status)->withHeaders([
                ...PublicHeaders::values(),
                'Referrer-Policy' => 'no-referrer',
                'X-Content-Type-Options' => 'nosniff',
            ]);
        });
    })->create();
