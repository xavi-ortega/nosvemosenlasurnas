@php
    $informationSection = $informationSection ?? $page;
@endphp
<article class="information information-surface">
    <button type="button" class="mb-5" data-return-context hidden>{{ __('cleanup.cleanup_return_task') }}</button>
    <h2>{{ __('cleanup.cleanup_'.$informationSection.'_title') }}</h2>
    <p class="lead">{{ __('cleanup.cleanup_'.$informationSection.'_intro') }}</p>
    @if ($informationSection === 'method')
        <ul>
            @foreach (['rule', 'missing', 'choice'] as $key)
                <li>{{ __('cleanup.cleanup_method_'.$key) }}</li>
            @endforeach
        </ul>
        <section data-method-example>
            <section class="method-example">
                <h3>{{ __('ui.ui_example_title') }}</h3>
                <p>{{ __('ui.ui_example_notice') }}</p>
                <div class="actions script-only">
                    @foreach (['agree', 'differ', 'missing', 'equal'] as $mode)
                        <button type="button" disabled>{{ __('ui.ui_example_'.$mode) }}</button>
                    @endforeach
                </div>
                <div aria-live="polite"><p>{{ __('ui.ui_example_missing_text') }}</p></div>
                <noscript><p>{{ __('cleanup.cleanup_method_equal_example') }}</p></noscript>
            </section>
        </section>
        <section>
            <h3>{{ __('cleanup.cleanup_method_questions_title') }}</h3>
            <p>{{ __('cleanup.cleanup_method_questions') }}</p>
            <p>{{ __('cleanup.cleanup_method_progression') }}</p>
        </section>
        <section>
            <h3>{{ __('cleanup.cleanup_method_missing_title') }}</h3>
            <p>{{ __('cleanup.cleanup_method_missing_detail') }}</p>
        </section>
        <section>
            <h3>{{ __('cleanup.cleanup_method_pending_title') }}</h3>
            <p>{{ __('cleanup.cleanup_method_pending') }}</p>
        </section>
        <details>
            <summary>{{ __('cleanup.cleanup_method_exact_title') }}</summary>
            @foreach (['scale', 'weights', 'unknown', 'percent', 'order'] as $key)
                <p>{{ __('cleanup.cleanup_method_exact_'.$key) }}</p>
            @endforeach
        </details>
        <details>
            <summary>{{ __('cleanup.cleanup_method_order_title') }}</summary>
            @if (isset($release['ordering']))
                <p>{{ $release['ordering']['rationale'] }}</p>
                <p>{{ $release['ordering']['migrationGap'] }}</p>
            @else
                <p>{{ __('cleanup.cleanup_method_progression') }}</p>
            @endif
        </details>
        <details>
            <summary>{{ __('cleanup.cleanup_method_reliability_title') }}</summary>
            <p>{{ __('cleanup.cleanup_method_scope') }}</p>
            <p>{{ __('cleanup.cleanup_method_reliability') }}</p>
            <a href="{{ route('sources') }}">{{ __('public.sources') }}</a>
        </details>
    @elseif ($informationSection === 'help')
        @foreach (['percentage' => 'how-it-works', 'comparison' => 'comparison', 'answer' => 'questionnaire', 'missing' => 'sources', 'close' => 'how-it-works', 'privacy' => 'privacy'] as $key => $destination)
            <details>
                <summary>{{ __('cleanup.cleanup_help_'.$key.'_title') }}</summary>
                <p>{{ __('cleanup.cleanup_help_'.$key) }}</p>
                <a href="{{ route($destination) }}">{{ $destination === 'how-it-works' ? __('iteration.iteration_method') : ($destination === 'comparison' ? __('iteration.iteration_compare') : ($destination === 'questionnaire' ? __('iteration.iteration_quiz') : __('public.'.$destination))) }}</a>
            </details>
        @endforeach
        <details>
            <summary>{{ __('cleanup.cleanup_help_terms_title') }}</summary>
            @foreach (['formation', 'common', 'position'] as $key)
                <p>{{ __('cleanup.cleanup_help_'.$key) }}</p>
            @endforeach
        </details>
    @elseif ($informationSection === 'privacy')
        @foreach (['memory', 'download', 'source', 'host', 'metrics'] as $key)
            <details>
                <summary>{{ __('cleanup.cleanup_privacy_'.$key.'_title') }}</summary>
                <p>{{ __('cleanup.cleanup_privacy_'.$key) }}</p>
            </details>
        @endforeach
    @elseif ($informationSection === 'accessibility')
        @foreach (['keyboard', 'reading', 'motion', 'source', 'limits'] as $key)
            <details>
                <summary>{{ __('cleanup.cleanup_accessibility_'.$key.'_title') }}</summary>
                <p>{{ __('cleanup.cleanup_accessibility_'.$key) }}</p>
            </details>
        @endforeach
    @endif
    <nav class="actions" aria-label="{{ __('cleanup.cleanup_footer_navigation') }}">
        <a href="{{ route('home') }}">{{ __('site.return_home') }}</a>
        <a href="{{ route('questionnaire') }}">{{ __('iteration.iteration_quiz') }}</a>
        <a href="{{ route('programmes') }}">{{ __('iteration.iteration_programmes') }}</a>
    </nav>
</article>
