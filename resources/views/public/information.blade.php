<x-layout :title="__('cleanup.cleanup_'.$page.'_title')" :page="$page">
    <h1 id="page-title" class="sr-only">{{ __('cleanup.cleanup_'.$page.'_title') }}</h1>
    @include('public.information-content', ['informationSection' => $page])
</x-layout>
