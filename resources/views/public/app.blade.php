@php
    $informationPage = in_array($page, ['method', 'help', 'privacy', 'accessibility']);
    $secondIteration = $release === null || ($release['engineVersion'] ?? null) === 'documented-affinity-v2';
    $unavailablePage = $secondIteration && in_array($page, ['feedback', 'insights']);
    $orderedProfiles = $release['programmeProfiles'] ?? [];
    if ($secondIteration && $orderedProfiles !== []) {
        $collator = class_exists(Collator::class) ? new Collator('es') : null;
        usort($orderedProfiles, fn (array $left, array $right): int => $collator?->compare($left['name'], $right['name']) ?: strcasecmp($left['name'], $right['name']));
    }
    $surfacePage = $secondIteration && $page === 'comparison' ? 'programmes' : $page;
    $title = $unavailablePage ? __('cleanup.cleanup_unavailable_title') : ($informationPage
        ? __('cleanup.cleanup_'.$page.'_title')
        : ($secondIteration && in_array($surfacePage, ['home', 'quiz', 'programmes'])
            ? __('iteration.iteration_'.$surfacePage)
            : ($secondIteration && $page === 'sources' ? __('cleanup.cleanup_sources_title') : ($page === 'programmes' ? __('iteration.iteration_programmes') : __('public.'.$page.'_title')))));
@endphp
<x-layout :title="$title" :page="$page" :iteration="$secondIteration" :release="$release">
    <section class="page-heading {{ $secondIteration || $page === 'quiz' ? 'sr-only' : '' }}">
        <h1 id="page-title">{{ $title }}</h1>
        @unless ($secondIteration)<p>{{ __('public.source_warning') }}</p>@endunless
    </section>
    <div id="app" class="app-surface" aria-labelledby="page-title" aria-busy="{{ ($informationPage && $secondIteration) || $unavailablePage ? 'false' : 'true' }}" @if ($informationPage && $secondIteration) data-information-page="{{ $page }}" @endif @if ($unavailablePage) data-deferred-page="{{ $page }}" @endif>
        @if ($unavailablePage)
            <section class="information">
                <h2>{{ __('cleanup.cleanup_unavailable_title') }}</h2>
                <p>{{ __('cleanup.cleanup_unavailable_body') }}</p>
                <nav class="actions" aria-label="{{ __('cleanup.cleanup_footer_navigation') }}">
                    <a href="{{ route('questionnaire') }}">{{ __('iteration.iteration_quiz') }}</a>
                    <a href="{{ route('programmes') }}">{{ __('iteration.iteration_programmes') }}</a>
                </nav>
            </section>
        @elseif ($informationPage && $secondIteration)
            @include('public.information-content', ['informationSection' => $page])
        @else
            <x-loading-skeleton>
                @if ($secondIteration && in_array($surfacePage, ['home', 'quiz']))
                    <section class="{{ $surfacePage === 'quiz' ? 'quiz-stage quiz-intro' : 'home-surface' }}">
                        <h2 class="{{ $surfacePage === 'home' ? 'iteration-hero' : '' }}"><span class="skeleton-text">{{ $surfacePage === 'home' ? __('ui.ui_home_title') : __('iteration.iteration_quiz') }}</span></h2>
                        <p class="{{ $surfacePage === 'home' ? 'intro-copy' : '' }}"><span class="skeleton-text">{{ $surfacePage === 'home' ? __('ui.ui_home_intro') : __('iteration.iteration_intro') }}</span></p>
                        <p class="quiet"><span class="skeleton-text">{{ __('iteration.iteration_version') }}</span></p>
                        <div class="actions">
                            <button type="button" class="primary" disabled><span class="skeleton-text">{{ __('iteration.iteration_start') }}</span></button>
                            @if ($surfacePage === 'home')
                                <button type="button" disabled><span class="skeleton-text">{{ __('iteration.iteration_compare') }}</span></button>
                            @endif
                        </div>
                        <p class="quiet"><span class="skeleton-text">{{ $surfacePage === 'home' ? __('ui.ui_home_notice') : __('public.quiz_reload') }}</span></p>
                    </section>
                @elseif ($secondIteration && $surfacePage === 'programmes')
                    <section class="comparison-workspace">
                        <h2><span class="skeleton-text">{{ __('ui.flow_comparison_title') }}</span></h2>
                        <p><span class="skeleton-text">{{ __('ui.flow_selection_intro') }}</span></p>
                        <div class="programme-slots">
                            @foreach ([0, 1] as $slot)
                                <div class="programme-slot"><button class="slot-choice" disabled><span class="skeleton-text">{{ __('ui.flow_slot_'.$slot) }}</span></button></div>
                            @endforeach
                        </div>
                        <p class="quiet selection-feedback"></p>
                        <div class="comparison-body"><p class="quiet"><span class="skeleton-text">{{ __('ui.flow_choose_two') }}</span></p></div>
                    </section>
                @else
                    <div class="skeleton-list">
                        @foreach (range(1, 4) as $row)
                            <div class="source-card">
                                <div class="skeleton-bar skeleton-heading"></div>
                                <div class="skeleton-bar"></div><div class="skeleton-bar skeleton-short"></div>
                                <div class="skeleton-bar skeleton-control"></div>
                            </div>
                        @endforeach
                    </div>
                @endif
            </x-loading-skeleton>
        @endif
    </div>
    @if ($secondIteration && $page === 'sources')
        <noscript>
            <section class="information source-directory">
                <h2>{{ __('cleanup.cleanup_sources_title') }}</h2>
                <p>{{ __('cleanup.cleanup_sources_intro') }}</p>
                <p>{{ __($orderedProfiles === [] ? 'cleanup.cleanup_sources_unavailable' : 'cleanup.cleanup_sources_no_script') }}</p>
                @foreach ($orderedProfiles as $profile)
                    @php $documents = collect($release['documents'])->where('candidacyId', $profile['candidacyId']); @endphp
                    <details data-source-profile="{{ $profile['id'] }}">
                        <summary>{{ $profile['name'] }}</summary>
                        <p>{{ $documents->isEmpty() ? __('cleanup.cleanup_sources_missing') : __('cleanup.cleanup_sources_found') }}</p>
                        <p>{{ __('cleanup.cleanup_sources_scope') }}: {{ collect($release['election']['constituencies'])->whereIn('id', $profile['constituencyIds'])->pluck('name')->join(', ') }}</p>
                        @foreach ($documents as $document)
                            @php $links = $release['sourceLinks'][$document['id']] ?? []; @endphp
                            <p>
                                @if (!empty($links['officialUrl']))
                                    <a href="{{ $links['officialUrl'] }}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">{{ __('cleanup.cleanup_sources_original') }} — {{ $profile['name'] }} {{ __('iteration.iteration_external') }}</a>
                                @else
                                    <span>{{ __('iteration.iteration_official_missing') }}</span>
                                @endif
                            </p>
                            @if (!empty($links['preservedUrl']) && ($links['preservedUrl'] !== ($links['officialUrl'] ?? null)))
                                <p><a href="{{ $links['preservedUrl'] }}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">{{ __('cleanup.cleanup_sources_copy') }} — {{ $profile['name'] }} {{ __('iteration.iteration_external') }}</a></p>
                            @endif
                        @endforeach
                    </details>
                @endforeach
            </section>
        </noscript>
    @endif
    @if ($page === 'feedback' && !$unavailablePage)
        <p><a href="{{ route('questionnaire') }}">{{ __('public.take_quiz') }}</a></p>
    @endif
    @unless ($informationPage)
        <noscript><p>{{ __('cleanup.cleanup_no_script') }}</p><p><a href="{{ route('how-it-works') }}">{{ __('iteration.iteration_method') }}</a> · <a href="{{ route('sources') }}">{{ __('public.sources') }}</a></p></noscript>
    @endunless
</x-layout>
