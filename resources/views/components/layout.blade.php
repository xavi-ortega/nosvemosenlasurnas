@props(['title', 'page' => 'information'])
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <meta name="referrer" content="no-referrer">
    <title>{{ $title }} · Nos Vemos en las Urnas</title>
    @vite(['resources/css/app.css', 'resources/js/app.ts'])
</head>
<body data-page="{{ $page }}">
    <a class="skip-link" href="#content">{{ __('public.skip_link') }}</a>
    <header class="site-header">
        <a class="brand" href="{{ route('home') }}"><svg aria-hidden="true" viewBox="0 0 32 32" width="32" height="32"><path d="M4 12h24v16H4zM9 4h14v12H9z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m12 9 3 3 6-6" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Nos Vemos<br>en las Urnas</span></a>
        <nav aria-label="{{ __('public.main_navigation') }}" class="flex flex-wrap gap-2 sm:gap-5">
            <a href="{{ route('comparison') }}">{{ __('public.compare') }}</a>
            <a href="{{ route('questionnaire') }}">{{ __('public.take_quiz') }}</a>
            <a href="{{ route('sources') }}">{{ __('public.sources') }}</a>
        </nav>
    </header>
    <main id="content" tabindex="-1">{{ $slot }}</main>
    <footer class="site-footer">
        <p>{{ __('public.free') }}</p>
        <nav class="flex flex-wrap gap-4" aria-label="{{ __('public.privacy') }}">
            <a href="{{ route('privacy') }}">{{ __('public.privacy') }}</a>
            <a href="{{ route('method') }}">{{ __('public.method') }}</a>
            <a href="{{ route('accessibility') }}">{{ __('public.accessibility') }}</a>
            <a href="{{ route('feedback') }}">{{ __('public.feedback_link') }}</a>
            <a href="{{ route('insights') }}">{{ __('public.insights_link') }}</a>
        </nav>
    </footer>
    <script type="application/json" id="feedback-config">@json($feedbackConfig)</script>
    <script type="application/json" id="public-messages">@json(__('public'))</script>
</body>
</html>
