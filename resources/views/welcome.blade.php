<x-layout :title="__('public.home_title')" page="home">
    <section class="hero">
        <p class="edition">{{ __('public.edition_2023') }}</p>
        <h1>{{ __('public.home_title') }}</h1>
        <p class="hero-description">{{ __('public.home_description') }}</p>
        @if($release !== null)
            <p class="notice">{{ __('public.'.($release['kind'] === 'synthetic' ? 'development' : ($release['kind'] === 'historical' ? 'historical' : 'source_warning'))) }}</p>
            <p>{{ __('public.release') }}: {{ $release['asOf'] }}</p>
        @else
            <p class="notice">{{ __('public.unavailable') }}</p>
        @endif
        <div class="actions">
            <a class="start-link" href="{{ route('questionnaire') }}">{{ __('public.take_quiz') }}</a>
        </div>
        <p>{{ __('public.quiz_description') }}</p>
        <p class="privacy-note">{{ __('public.privacy_short') }} <a href="{{ route('privacy') }}">{{ __('public.privacy') }}</a></p>
    </section>
</x-layout>
