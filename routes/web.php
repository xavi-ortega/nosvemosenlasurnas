<?php

use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use Symfony\Component\HttpFoundation\Response;

Route::get('/', function (): Response {
    return response()->view('welcome')->withHeaders([
        'Content-Language' => app()->getLocale(),
        'Referrer-Policy' => 'no-referrer',
        'X-Content-Type-Options' => 'nosniff',
    ]);
})->withoutMiddleware([
    StartSession::class,
    ShareErrorsFromSession::class,
    PreventRequestForgery::class,
])->name('home');
