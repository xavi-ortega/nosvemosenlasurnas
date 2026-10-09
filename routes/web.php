<?php

use App\Http\Controllers\FeedbackController;
use App\PublicBank;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Http\Request;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use Symfony\Component\HttpFoundation\Response;

Route::get('/', function (PublicBank $bank): Response {
    try {
        $release = json_decode($bank->bytes(), true);
    } catch (Throwable) {
        $release = null;
    }

    return response()->view('welcome', ['release' => $release])->withHeaders([
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

Route::post('/api/feedback', FeedbackController::class)->withoutMiddleware([StartSession::class, ShareErrorsFromSession::class, PreventRequestForgery::class])->name('feedback.submit');
Route::view('/feedback', 'public.app', ['page' => 'feedback'])->withoutMiddleware([StartSession::class, ShareErrorsFromSession::class, PreventRequestForgery::class])->name('feedback');

Route::view('/insights', 'public.app', ['page' => 'insights'])->withoutMiddleware([StartSession::class, ShareErrorsFromSession::class, PreventRequestForgery::class])->name('insights');
Route::get('/api/feedback-report', function (Request $request): Response {
    abort_if($request->query() !== [], 400);
    $files = glob(resource_path('feedback-reports/????-??-??.json')) ?: [];
    rsort($files);
    abort_if($files === [], 503);
    $bytes = file_get_contents($files[0]);
    abort_if($bytes === false || strlen($bytes) > 1024 * 1024, 503);
    $report = json_decode($bytes, true);
    abort_if(! is_array($report) || ($report['schemaVersion'] ?? null) !== 1 || (($report['kind'] ?? null) !== 'current' && ! app()->environment(['local', 'testing'])), 503);

    return response($bytes)->withHeaders(['Content-Type' => 'application/json; charset=utf-8', 'Cache-Control' => 'public, max-age=3600']);
})->withoutMiddleware([StartSession::class, ShareErrorsFromSession::class, PreventRequestForgery::class])->name('feedback.report');

Route::get('/api/release-history', function (Request $request, PublicBank $bank): Response {
    abort_if($request->query() !== [], 400);
    try {
        $state = $bank->state();
    } catch (Throwable) {
        abort(503);
    }

    $history = $state['history'];
    if ($state['kind'] === 'synthetic') {
        $history = array_map(fn (array $change): array => [...$change, 'reason' => __('public.synthetic_change')], $history);
    }

    return response()->json($history)->header('Cache-Control', 'no-store');
})->withoutMiddleware([StartSession::class, ShareErrorsFromSession::class, PreventRequestForgery::class])->name('release.history');
