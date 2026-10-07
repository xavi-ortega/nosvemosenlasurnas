<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>{{ __('errors.title') }} · {{ config('app.name') }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.ts'])
</head>
<body class="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
    <main class="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-16">
        <p class="text-lg font-semibold">{{ config('app.name') }}</p>
        <h1 class="text-3xl font-bold tracking-tight">{{ __($messageKey) }}</h1>
        <a class="w-fit underline underline-offset-4 focus:outline-2 focus:outline-offset-4" href="{{ route('home') }}">{{ __('site.return_home') }}</a>
    </main>
</body>
</html>
