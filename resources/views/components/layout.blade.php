@props(['title', 'page' => 'information', 'iteration' => false, 'release' => null])
@php
    $publicMessages = __('public');
    if ($iteration) {
        unset($publicMessages['threshold_details'], $publicMessages['selector_details']);
    }
    $uiMessages = __('ui');
    $publicMessages = array_merge($publicMessages, __('iteration'), __('cleanup'), is_array($uiMessages) ? $uiMessages : []);
@endphp
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <meta name="referrer" content="no-referrer">
    @if (Vite::cspNonce())
        <meta property="csp-nonce" nonce="{{ Vite::cspNonce() }}">
    @endif
    <title>{{ $title }} · Nos Vemos en las Urnas</title>
    @vite(['resources/css/app.css', 'resources/js/app.ts'])
</head>
<body data-page="{{ $page }}" @if ($iteration) data-iteration="2" @endif>
    <a class="skip-link" href="#content">{{ __('public.skip_link') }}</a>
    <header class="site-header">
        <a class="brand" href="{{ route('home') }}"><svg aria-hidden="true" viewBox="0 0 32 32" width="32" height="32"><path d="M4 12h24v16H4zM9 4h14v12H9z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m12 9 3 3 6-6" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Nos Vemos<br>en las Urnas</span></a>
        <nav aria-label="{{ __('public.main_navigation') }}" class="flex flex-wrap gap-2 sm:gap-5">
            @foreach (['home' => ['home', 'iteration_home'], 'quiz' => ['questionnaire', 'iteration_quiz'], 'programmes' => ['programmes', 'iteration_programmes'], 'method' => ['how-it-works', 'iteration_method']] as $section => [$destination, $label])
                <a href="{{ route($destination) }}" data-nav-page="{{ $section }}" @if ($page === $section || ($page === 'comparison' && $section === 'programmes')) aria-current="page" @endif>{{ __('iteration.'.$label) }}</a>
            @endforeach
        </nav>
    </header>
    <main id="content">{{ $slot }}</main>
    <footer class="site-footer">
        <p>{{ __('public.free') }}</p>
        <nav class="flex flex-wrap gap-4" aria-label="{{ __('cleanup.cleanup_footer_navigation') }}">
            <a href="{{ route('help') }}" data-nav-page="help" @if ($page === 'help') aria-current="page" @endif>{{ __('cleanup.cleanup_help_navigation') }}</a>
            <a href="{{ route('sources') }}" data-nav-page="sources" @if ($page === 'sources') aria-current="page" @endif>{{ __('public.sources') }}</a>
            <a href="{{ route('privacy') }}" data-nav-page="privacy" @if ($page === 'privacy') aria-current="page" @endif>{{ __('public.privacy') }}</a>
            <a href="{{ route('accessibility') }}" data-nav-page="accessibility" @if ($page === 'accessibility') aria-current="page" @endif>{{ __('public.accessibility') }}</a>
        </nav>
    </footer>
    @foreach (['method', 'help', 'privacy', 'accessibility'] as $informationSection)
        <template id="information-content-{{ $informationSection }}">
            @include('public.information-content', ['informationSection' => $informationSection, 'release' => $release])
        </template>
    @endforeach
    <script type="application/json" id="feedback-config">@json($feedbackConfig)</script>
    <script type="application/json" id="public-messages">@json($publicMessages)</script>
</body>
</html>
