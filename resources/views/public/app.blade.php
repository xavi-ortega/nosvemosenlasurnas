@php
    $secondIteration = ($release['engineVersion'] ?? null) === 'documented-affinity-v2';
    $surfacePage = $secondIteration && in_array($page, ['comparison', 'sources', 'programmes']) ? 'programmes' : $page;
    $title = $secondIteration && in_array($surfacePage, ['home', 'quiz', 'programmes', 'method'])
        ? __('iteration.iteration_'.$surfacePage)
        : ($page === 'programmes' ? __('iteration.iteration_programmes') : __('public.'.$page.'_title'));
@endphp
<x-layout :title="$title" :page="$page" :iteration="$secondIteration">
    <section class="page-heading {{ $page === 'quiz' ? 'sr-only' : '' }}"><h1 id="page-title">{{ $title }}</h1><p>{{ __('public.source_warning') }}</p></section>
    <div id="app" class="app-surface" aria-labelledby="page-title" aria-busy="true">
        <x-loading-skeleton>
            @if ($secondIteration && in_array($surfacePage, ['home', 'quiz']))
                <section class="{{ $surfacePage === 'quiz' ? 'quiz-stage quiz-intro' : '' }}">
                    <h2 class="{{ $surfacePage === 'home' ? 'iteration-hero' : '' }}"><span class="skeleton-text">{{ $surfacePage === 'home' ? __('public.home_title') : __('iteration.iteration_quiz') }}</span></h2>
                    <p><span class="skeleton-text">{{ __('iteration.iteration_intro') }}</span></p>
                    <p class="quiet"><span class="skeleton-text">{{ __('iteration.iteration_version') }}</span></p>
                    <div class="actions"><button type="button" class="primary" disabled><span class="skeleton-text">{{ __('iteration.iteration_start') }}</span></button></div>
                    <p class="quiet"><span class="skeleton-text">{{ __('public.quiz_reload') }}</span></p>
                </section>
            @elseif ($secondIteration && $surfacePage === 'programmes')
                <div class="reading-layout"><div class="reading-origin">
                    <h2><span class="skeleton-text">{{ __('iteration.iteration_featured') }}</span></h2>
                    <p><span class="skeleton-text">{{ __('iteration.iteration_featured_reason') }}</span></p>
                    <div class="featured-proposals">
                        @foreach (array_slice($release['starterQuestionIds'], 0, 4) as $questionId)
                            <button type="button" disabled><span class="skeleton-text">{{ collect($release['questions'])->firstWhere('id', $questionId)['text'] }}</span></button>
                        @endforeach
                    </div>
                    <h3><span class="skeleton-text">{{ __('iteration.iteration_all_topics') }}</span></h3>
                    <div class="topic-index grid gap-3 sm:grid-cols-2">
                        @foreach ($release['topics'] as $topic)
                            <button type="button" disabled><span class="skeleton-text">{{ $topic['name'] }}</span></button>
                        @endforeach
                    </div>
                    <div class="actions"><button type="button" disabled><span class="skeleton-text">{{ __('iteration.iteration_select_programmes') }}</span></button></div>
                    <p class="quiet"><span class="skeleton-text">{{ $release['ordering']['migrationGap'] }}</span></p>
                </div></div>
            @elseif ($secondIteration && $surfacePage === 'method')
                <h2><span class="skeleton-text">{{ __('iteration.iteration_method') }}</span></h2>
                @foreach (['iteration_method_body', 'iteration_method_example', 'iteration_method_pending'] as $key)
                    <p><span class="skeleton-text">{{ __('iteration.'.$key) }}</span></p>
                @endforeach
                <p><span class="skeleton-text">{{ __('public.privacy_short') }}</span></p>
                <h3><span class="skeleton-text">{{ __('iteration.iteration_question_order') }}</span></h3>
                <p><span class="skeleton-text">{{ $release['ordering']['rationale'] }}</span></p>
                <p><span class="skeleton-text">{{ $release['ordering']['migrationGap'] }}</span></p>
                <p><span class="skeleton-text">{{ __('iteration.iteration_official_note') }}</span></p>
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
    </div>
    @if($page === 'feedback')
        <p><a href="{{ route('questionnaire') }}">{{ __('public.take_quiz') }}</a></p>
    @endif
    <noscript><p>{{ __('public.javascript') }}</p></noscript>
</x-layout>
