<x-layout :title="__('public.home_title')" page="home">
    <section class="hero">
        <h1>{{ __('public.home_title') }}</h1>
        <p class="hero-description">{{ __('public.home_description') }}</p>
        @if($release !== null)
            <p class="notice">{{ __('public.'.($release['kind'] === 'synthetic' ? 'development' : ($release['kind'] === 'historical' ? 'historical' : 'source_warning'))) }}</p>
            <p>{{ __('public.release') }}: {{ $release['asOf'] }}</p>
        @else
            <p class="notice">{{ __('public.unavailable') }}</p>
        @endif
        <div class="journeys grid gap-6 md:grid-cols-2">
            <a class="journey" href="{{ route('comparison') }}"><h2>{{ __('public.compare') }}</h2><p>{{ __('public.compare_description') }}</p><span aria-hidden="true" class="journey-mark">↗</span></a>
            <a class="journey" href="{{ route('questionnaire') }}"><h2>{{ __('public.take_quiz') }}</h2><p>{{ __('public.quiz_description') }}</p><span aria-hidden="true" class="journey-mark">↗</span></a>
        </div>
        <p class="privacy-note">{{ __('public.privacy_short') }} <a href="{{ route('privacy') }}">{{ __('public.privacy') }}</a></p>
    </section>
</x-layout>
