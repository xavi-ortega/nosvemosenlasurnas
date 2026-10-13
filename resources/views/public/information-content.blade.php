@php
    $informationSection = $informationSection ?? $page;
    $calculationSections = [
        'scale' => ['exact_scale'],
        'weights' => ['exact_weights', 'exact_percent'],
        'unknown' => ['exact_unknown', 'missing_detail'],
        'pending' => ['pending'],
        'order' => ['exact_order'],
        'questions' => ['questions', 'progression'],
        'sources' => ['scope', 'reliability'],
    ];
@endphp
<article class="information information-surface {{ $informationSection === 'method' ? 'method-surface' : 'answer-surface' }}" data-information-section="{{ $informationSection }}">
    <button type="button" class="information-return" data-return-context hidden>{{ __('cleanup.cleanup_return_task') }}</button>
    <h2>{{ __('cleanup.cleanup_'.$informationSection.'_title') }}</h2>
    <p class="lead">{{ __('cleanup.cleanup_'.$informationSection.'_intro') }}</p>
    @if ($informationSection === 'method')
        <ol class="method-steps">
            @foreach (['answer', 'finish', 'read'] as $step)
                <li>
                    <h3>{{ __('cleanup.cleanup_method_step_'.$step.'_title') }}</h3>
                    <p>{{ __('cleanup.cleanup_method_step_'.$step) }}</p>
                </li>
            @endforeach
        </ol>
        <section class="method-explainer" aria-labelledby="method-percentage-title">
            <h3 id="method-percentage-title">{{ __('cleanup.cleanup_method_percentage_title') }}</h3>
            <figure class="method-visual" data-method-example>
                <figcaption>{{ __('cleanup.cleanup_method_example_caption') }}</figcaption>
                <div class="method-marks" aria-hidden="true">
                    @foreach (range(0, 4) as $index)
                        <span class="method-mark" data-method-mark="{{ $index }}" data-state="{{ $index < 2 ? 'same' : 'unknown' }}">{{ $index < 2 ? '=' : '?' }}</span>
                    @endforeach
                </div>
                <ul class="method-legend" aria-hidden="true">
                    <li data-example-count="same">{{ __('cleanup.cleanup_method_example_same', ['count' => 2]) }}</li>
                    <li data-example-count="different">{{ __('cleanup.cleanup_method_example_different', ['count' => 0]) }}</li>
                    <li data-example-count="unknown">{{ __('cleanup.cleanup_method_example_unknown', ['count' => 3]) }}</li>
                </ul>
                <dl class="method-values">
                    <div><dt>{{ __('cleanup.cleanup_method_example_overlap') }}</dt><dd data-example-overlap>40 %</dd></div>
                    <div><dt>{{ __('cleanup.cleanup_method_example_coverage') }}</dt><dd data-example-coverage>40 %</dd></div>
                </dl>
                <p class="sr-only" data-example-description role="status" aria-live="polite" aria-atomic="true">{{ __('cleanup.cleanup_method_example_initial') }}</p>
                <label class="method-switch" data-method-control hidden>
                    <input type="checkbox" role="switch" autocomplete="off" data-method-switch>
                    <span>{{ __('cleanup.cleanup_method_example_switch') }}</span>
                </label>
            </figure>
            <div class="method-meaning">
                <p>{{ __('cleanup.cleanup_method_missing') }}</p>
                <p>{{ __('cleanup.cleanup_method_equal') }}</p>
                <button type="button" class="information-text-action" data-open-calculation hidden>{{ __('cleanup.cleanup_method_exact_title') }}</button>
                <noscript><p><a href="#calculation-detail">{{ __('cleanup.cleanup_method_exact_title') }}</a></p></noscript>
            </div>
        </section>
        <p class="method-provenance">{{ __('cleanup.cleanup_method_provenance') }} <a href="{{ route('sources') }}">{{ __('public.sources') }}</a></p>
        <a href="{{ route('questionnaire') }}" class="start-link" data-method-start>{{ __('iteration.iteration_start') }}</a>
        @foreach (['panel', 'fallback'] as $destination)
            @if ($destination === 'panel')
                <template data-calculation-content>
            @else
                <noscript><section id="calculation-detail" class="method-fallback">
                    <h3>{{ __('cleanup.cleanup_method_exact_title') }}</h3>
            @endif
                <div class="calculation-content">
                    @foreach ($calculationSections as $heading => $paragraphs)
                        <section>
                            <h3>{{ __('cleanup.cleanup_method_detail_'.$heading) }}</h3>
                            @foreach ($paragraphs as $key)
                                <p>{{ __('cleanup.cleanup_method_'.$key) }}</p>
                            @endforeach
                        </section>
                    @endforeach
                    @if (isset($release['ordering']))
                        <section>
                            <h3>{{ __('cleanup.cleanup_method_order_title') }}</h3>
                            <p>{{ $release['ordering']['rationale'] }}</p>
                            <p>{{ $release['ordering']['migrationGap'] }}</p>
                        </section>
                    @endif
                    <a href="{{ route('sources') }}">{{ __('public.sources') }}</a>
                </div>
            @if ($destination === 'panel')
                </template>
            @else
                </section></noscript>
            @endif
        @endforeach
    @elseif ($informationSection === 'help')
        <div class="information-answers">
            @foreach (['percentage' => 'how-it-works', 'comparison' => 'comparison', 'answer' => 'questionnaire', 'missing' => 'sources', 'close' => 'how-it-works', 'privacy' => 'privacy'] as $key => $destination)
                <section>
                    <h3>{{ __('cleanup.cleanup_help_'.$key.'_title') }}</h3>
                    <p>{{ __('cleanup.cleanup_help_'.$key) }}</p>
                    <a href="{{ route($destination) }}">{{ $destination === 'how-it-works' ? __('iteration.iteration_method') : ($destination === 'comparison' ? __('iteration.iteration_compare') : ($destination === 'questionnaire' ? __('iteration.iteration_quiz') : __('public.'.$destination))) }}</a>
                </section>
            @endforeach
            <section>
                <h3>{{ __('cleanup.cleanup_help_terms_title') }}</h3>
                @foreach (['formation', 'common', 'position'] as $key)
                    <p>{{ __('cleanup.cleanup_help_'.$key) }}</p>
                @endforeach
            </section>
        </div>
    @elseif ($informationSection === 'privacy')
        <div class="information-answers">
            @foreach (['memory', 'download', 'source', 'host', 'metrics'] as $key)
                <section>
                    <h3>{{ __('cleanup.cleanup_privacy_'.$key.'_title') }}</h3>
                    <p>{{ __('cleanup.cleanup_privacy_'.$key) }}</p>
                </section>
            @endforeach
        </div>
    @elseif ($informationSection === 'accessibility')
        <div class="information-answers">
            @foreach (['keyboard', 'reading', 'motion', 'source', 'limits'] as $key)
                <section>
                    <h3>{{ __('cleanup.cleanup_accessibility_'.$key.'_title') }}</h3>
                    <p>{{ __('cleanup.cleanup_accessibility_'.$key) }}</p>
                </section>
            @endforeach
        </div>
    @endif
    @unless ($informationSection === 'method')
        <nav class="actions information-navigation" aria-label="{{ __('cleanup.cleanup_footer_navigation') }}">
            <a href="{{ route('home') }}">{{ __('site.return_home') }}</a>
            <a href="{{ route('questionnaire') }}">{{ __('iteration.iteration_quiz') }}</a>
            <a href="{{ route('programmes') }}">{{ __('iteration.iteration_programmes') }}</a>
        </nav>
    @endunless
</article>
