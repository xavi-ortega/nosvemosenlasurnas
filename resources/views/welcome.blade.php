<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>{{ config('app.name') }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.ts'])
</head>
<body class="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
    <main class="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-16">
        <p class="text-lg font-semibold">{{ config('app.name') }}</p>
        <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{{ __('site.preparation_title') }}</h1>
        <p class="text-lg leading-relaxed text-slate-700 dark:text-slate-300">{{ __('site.preparation_description') }}</p>
        <p class="text-sm text-slate-600 dark:text-slate-400">{{ __('site.preparation_status') }}</p>
    </main>
</body>
</html>
