<?php

use App\PublicBank;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Http\Request;
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

Route::get('/api/bank', function (Request $request, PublicBank $bank): Response {
    abort_if($request->query() !== [], 400);
    try {
        $bytes = $bank->bytes();
    } catch (Throwable) {
        abort(503);
    }

    return response($bytes)->withHeaders([
        'Content-Type' => 'application/json; charset=utf-8',
        'X-Evidence-Sha256' => hash('sha256', $bytes),
        'Cache-Control' => 'public, max-age=300',
        'Content-Language' => 'es',
        'Referrer-Policy' => 'no-referrer',
        'X-Content-Type-Options' => 'nosniff',
    ]);
})->withoutMiddleware([StartSession::class, ShareErrorsFromSession::class, PreventRequestForgery::class])->name('bank');

Route::get('/api/release-state', function (PublicBank $bank): Response {
    try {
        $state = $bank->state();
    } catch (Throwable) {
        abort(503);
    }

    return response()->json(['sha256' => $state['sha256'], 'withdrawn' => $state['withdrawn']])->withHeaders(['Cache-Control' => 'no-store', 'Content-Language' => 'es']);
})->withoutMiddleware([StartSession::class, ShareErrorsFromSession::class, PreventRequestForgery::class])->name('release-state');

foreach (['comparison' => 'comparison', 'questionnaire' => 'quiz', 'sources' => 'sources'] as $path => $page) {
    Route::view('/'.$path, 'public.app', ['page' => $page])
        ->withoutMiddleware([StartSession::class, ShareErrorsFromSession::class, PreventRequestForgery::class])->name($path);
}
foreach ([
    'privacy' => ['privacy_details', 'connection_metadata', 'metrics_details'],
    'method' => ['method_details', 'threshold_details', 'selector_details', 'source_warning'],
    'accessibility' => ['a11y_details'],
] as $path => $paragraphs) {
    Route::view('/'.$path, 'public.information', ['page' => $path, 'paragraphs' => $paragraphs])
        ->withoutMiddleware([StartSession::class, ShareErrorsFromSession::class, PreventRequestForgery::class])->name($path);
}
