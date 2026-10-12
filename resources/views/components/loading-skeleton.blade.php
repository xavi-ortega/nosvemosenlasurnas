<section {{ $attributes->class(['loading-skeleton'])->merge(['aria-busy' => 'true']) }}>
    <p class="sr-only" role="status">{{ __('public.loading') }}</p>
    <div class="skeleton-content" aria-hidden="true" inert>{{ $slot }}</div>
</section>
