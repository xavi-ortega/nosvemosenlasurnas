<x-layout :title="__('public.'.$page.'_title')" :page="$page">
    <section class="page-heading"><h1 id="page-title">{{ __('public.'.$page.'_title') }}</h1><p>{{ __('public.source_warning') }}</p></section>
    <div id="app" class="app-surface" aria-labelledby="page-title"><p role="status">{{ __('public.loading') }}</p></div>
    <noscript><p>{{ __('public.javascript') }}</p></noscript>
</x-layout>
