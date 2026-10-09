<x-layout :title="__('public.'.$page.'_title')">
    <article class="information"><h1>{{ __('public.'.$page.'_title') }}</h1>
        @foreach($paragraphs as $key)<p>{{ __('public.'.$key) }}</p>@endforeach
        <a href="{{ route('home') }}">{{ __('site.return_home') }}</a>
    </article>
</x-layout>
