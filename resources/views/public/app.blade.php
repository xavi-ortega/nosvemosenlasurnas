<x-layout :title="$page === 'programmes' ? __('iteration.iteration_programmes') : __('public.'.$page.'_title')" :page="$page">
    <section class="page-heading {{ $page === 'quiz' ? 'sr-only' : '' }}"><h1 id="page-title">{{ $page === 'programmes' ? __('iteration.iteration_programmes') : __('public.'.$page.'_title') }}</h1><p>{{ __('public.source_warning') }}</p></section>
    <div id="app" class="app-surface" aria-labelledby="page-title"><p role="status">{{ __('public.loading') }}</p></div>
    @if($page === 'feedback')
        <p><a href="{{ route('questionnaire') }}">{{ __('public.take_quiz') }}</a></p>
    @endif
    <noscript><p>{{ __('public.javascript') }}</p></noscript>
</x-layout>
