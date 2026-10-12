import { Questionnaire } from './questionnaire.ts';
import { documentedMatch, profilePosition } from './documented-affinity.ts';
import { relationship, similarity } from './matching.ts';
import type { Answer, Bank, Position, ProgrammeProfile, Question } from './matching.ts';
import { startLoading } from './loading.ts';

type Section = 'home' | 'quiz' | 'programmes' | 'method';
type Translate = (key: string) => string;
const routes: Record<Section, string> = { home: '/', quiz: '/questionnaire', programmes: '/programmes', method: '/how-it-works' };

export function mountIteration(root: HTMLElement, bank: Bank, releaseHash: string, t: Translate, initialPage: string): void {
    const element = <K extends keyof HTMLElementTagNameMap>(tag: K, text = '', className = ''): HTMLElementTagNameMap[K] => {
        const node = document.createElement(tag); node.textContent = text; node.className = className; return node;
    };
    const paragraph = (key: string, className = '') => element('p', t(key), className);
    const interpolate = (key: string, fields: Record<string, string | number>) => Object.entries(fields).reduce((text, [id, value]) => text.replaceAll(':' + id, String(value)), t(key));
    const percent = (value: number) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(value) + ' %';
    const action = (label: string, callback: (control: HTMLButtonElement) => void | Promise<void>, primary = false) => {
        const node = element('button', label, primary ? 'primary' : ''); node.type = 'button';
        node.addEventListener('keydown', event => { if (event.repeat && ['Enter', ' '].includes(event.key)) event.preventDefault(); });
        node.addEventListener('click', () => { if (node.isConnected && !node.disabled) void callback(node); }); return node;
    };
    const button = (key: string, callback: (control: HTMLButtonElement) => void | Promise<void>, primary = false) => action(t(key), callback, primary);
    const actions = (...nodes: HTMLElement[]) => { const group = element('div', '', 'actions'); group.append(...nodes); return group; };
    const focus = (node: HTMLElement | null) => { if (node) { node.tabIndex = -1; node.focus({ preventScroll: true }); } };
    const profile = (id: string) => bank.programmeProfiles!.find(p => p.id === id)!;
    const topicName = (id: string) => bank.topics.find(topic => topic.id === id)!.name;
    const scopeNames = (p: ProgrammeProfile) => p.constituencyIds.map(id => bank.election.constituencies.find(c => c.id === id)!.name).join(', ');
    const positionLabel = (p: Position) => p.status === 'conflicting' ? t('iteration_conflict') : p.status !== 'derived' ? t('iteration_no_position') : t(p.value === 2 ? 'support' : p.value === 1 ? 'support_qualified' : p.value === -2 ? 'oppose' : p.value === -1 ? 'oppose_qualified' : 'intermediate');
    let session: Questionnaire | null = null;
    let section: Section = initialPage === 'quiz' ? 'quiz' : ['programmes', 'comparison', 'sources'].includes(initialPage) ? 'programmes' : initialPage === 'method' ? 'method' : 'home';
    let quizView: 'setup' | 'question' | 'checkpoint' | 'review' | 'results' = 'setup';
    let finishing = false;
    let answerUnlockAt = 0;
    let withdrawn = false;
    let overlay = false;
    const views = new Map<Section, HTMLElement>();
    const scrolls = new Map<Section, number>();
    const selected = new Set<string>();
    let publicTopic: string | null = null;
    let publicQuestion: string | null = null;
    let publicOrigin: 'catalogue' | 'topic' = 'catalogue';
    let publicMode: 'catalogue' | 'topic' | 'positions' | 'selection' | 'workspace' = 'catalogue';
    let publicSearch = '';
    let publicFilter = 'all';
    let programmeOrigin: HTMLElement | null = null;
    let programmeOriginScroll = 0;

    document.body.dataset.iteration = '2';
    const title = document.getElementById('page-title');
    const view = (key: Section) => { if (!views.has(key)) views.set(key, element('section')); return views.get(key)!; };
    const invalidatePersonalReading = () => {
        if (overlay) { overlay = false; views.delete('programmes'); }
    };
    const show = (next: Section, push = false) => {
        scrolls.set(section, window.scrollY); section = next;
        if (push && location.pathname !== routes[next]) history.pushState(null, '', routes[next]);
        root.replaceChildren(view(next));
        if (title) { title.textContent = t('iteration_' + next); title.parentElement!.classList.toggle('sr-only', next === 'quiz'); }
        document.title = t('iteration_' + next) + ' · Nos Vemos en las Urnas';
        document.body.dataset.page = next;
        if (withdrawn) { view(next).replaceChildren(element('h2', t('withdrawn')), button('retry', () => location.reload())); return; }
        for (const link of document.querySelectorAll<HTMLAnchorElement>('.site-header a')) {
            if (new URL(link.href).pathname === routes[next]) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
        }
        if (next === 'home') renderHome();
        else if (!view(next).childElementCount) {
            if (next === 'quiz') renderQuiz(); else if (next === 'programmes') renderProgrammes(); else renderMethod();
        }
        requestAnimationFrame(() => { window.scrollTo(0, scrolls.get(next) ?? 0); if (!view(next).contains(document.activeElement)) focus(view(next).querySelector<HTMLElement>('h2')); });
    };
    document.addEventListener('click', event => {
        const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a');
        if (!link || event.defaultPrevented || event instanceof MouseEvent && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)) return;
        const url = new URL(link.href);
        const next = (Object.keys(routes) as Section[]).find(key => routes[key] === url.pathname);
        if (next && url.origin === location.origin && !url.hash && !url.search) { event.preventDefault(); show(next, true); }
    });
    window.addEventListener('popstate', () => {
        const next = (Object.keys(routes) as Section[]).find(key => routes[key] === location.pathname);
        if (next) show(next);
    });

    function startQuiz(): void {
        if (!session) { session = new Questionnaire(bank, releaseHash); quizView = 'question'; scrolls.delete('quiz'); renderQuiz(); }
        show('quiz', true);
    }
    function renderHome(): void {
        const page = view('home'); page.replaceChildren(element('h2', t('home_title'), 'iteration-hero'), paragraph('iteration_intro'), paragraph('iteration_version', 'quiet'), actions(button(session ? 'iteration_resume' : 'iteration_start', startQuiz, true)), paragraph('quiz_reload', 'quiet'));
    }
    function renderMethod(): void {
        const page = view('method'); page.replaceChildren(element('h2', t('iteration_method')), paragraph('iteration_method_body'), paragraph('iteration_method_example'), paragraph('iteration_method_pending'), paragraph('privacy_short'), element('h3', t('iteration_question_order')), element('p', bank.ordering!.rationale), element('p', bank.ordering!.migrationGap), paragraph('iteration_official_note'));
    }
    function resetDialog(opener: HTMLElement): void {
        const dialog = element('dialog'); const heading = element('h2', t('iteration_clear_title')); heading.id = 'reset-title'; dialog.setAttribute('aria-labelledby', heading.id);
        const close = () => { dialog.close(); dialog.remove(); opener.focus(); };
        const keep = button('iteration_keep', close, true); keep.autofocus = true;
        dialog.append(heading, paragraph('quiz_reload'), actions(keep, button('iteration_clear', () => { session?.reset(); session = null; overlay = false; views.delete('programmes'); quizView = 'setup'; dialog.close(); dialog.remove(); renderQuiz(); })));
        dialog.addEventListener('cancel', event => { event.preventDefault(); close(); }); document.body.append(dialog); dialog.showModal();
    }
    function answerControls(q: Question, onChange: (answer: Answer) => void, onConfirm?: (answer: Answer) => void): HTMLFieldSetElement {
        const group = element('fieldset'); group.append(element('legend', t('opinion')));
        let navigatingAnswers = false;
        group.addEventListener('keyup', event => { if (event.key.startsWith('Arrow')) navigatingAnswers = false; });
        const choices = element('div', '', 'answers'); const other = element('div', '', 'other-answers');
        for (const value of [-2, -1, 0, 1, 2, 'unsure', 'skip'] as Answer[]) {
            const label = element('label', '', 'choice'); const radio = element('input'); radio.type = 'radio'; radio.name = 'answer-' + q.id; radio.value = String(value); radio.autocomplete = 'off'; radio.checked = session?.answers[q.id] === value;
            label.append(radio, element('span', t(typeof value === 'number' ? value === 0 ? 'answer_neutral' : 'answer_' + (value > 0 ? 'positive_' : 'negative_') + Math.abs(value) : value)));
            radio.addEventListener('change', () => onChange(value));
            if (onConfirm) {
                radio.addEventListener('click', () => { if (radio.isConnected && !group.disabled && !navigatingAnswers) onConfirm(value); });
                radio.addEventListener('keydown', event => {
                    if (event.key.startsWith('Arrow')) navigatingAnswers = true;
                    else if (event.repeat && ['Enter', ' '].includes(event.key)) event.preventDefault();
                    else if (['Enter', ' '].includes(event.key)) { event.preventDefault(); radio.click(); }
                });
            }
            (typeof value === 'number' ? choices : other).append(label);
        }
        group.append(choices, other); return group;
    }
    function pending(result: ReturnType<typeof documentedMatch>): HTMLElement {
        const block = element('section', '', 'notice'); block.append(element('p', interpolate('iteration_pending', { topics: result.pendingTopicIds.map(topicName).join(', ') })));
        for (const id of result.pendingTopicIds) block.append(action(t('iteration_review_topic') + ': ' + topicName(id), () => { quizView = 'review'; renderQuiz(id); }));
        return block;
    }
    function renderQuiz(reviewTopic?: string): void {
        const page = view('quiz'); page.replaceChildren();
        const stage = element('section', '', 'quiz-stage'); stage.classList.toggle('state-enter', !root.hasAttribute('aria-busy')); page.append(stage);
        stage.addEventListener('pointerdown', event => {
            if (performance.now() < answerUnlockAt && !(event.target as Element).closest('.quiz-navigation button')) { event.preventDefault(); focus(stage.querySelector('h2')); }
        }, true);
        if (!session || quizView === 'setup') {
            stage.classList.add('quiz-intro'); stage.append(element('h2', t('iteration_quiz')), paragraph('iteration_intro'), paragraph('iteration_version', 'quiet'), actions(button('iteration_start', startQuiz, true)), paragraph('quiz_reload', 'quiet')); focus(stage.querySelector('h2')); return;
        }
        if (quizView === 'results' && session.revealed) { renderResults(page); return; }
        if (quizView === 'review') {
            session.revealed = false; invalidatePersonalReading(); stage.append(element('h2', t('review')), paragraph('quiz_reload'));
            const importance = element('details', '', 'priorities'); importance.append(element('summary', t('priorities')));
            for (const topic of bank.topics) {
                const label = element('label', topic.name, 'control'); const select = element('select'); select.autocomplete = 'off';
                select.append(new Option(t('iteration_importance_1'), '1'), new Option(t('iteration_importance_2'), '2')); select.value = String(session.priorities[topic.id] ?? 1);
                select.addEventListener('change', () => { session!.priorities[topic.id] = Number(select.value) as 1 | 2; }); label.append(select); importance.append(label);
            }
            stage.append(importance);
            for (const id of session.presented) {
                const q = bank.questions.find(q => q.id === id)!; const item = element('section', '', 'source-card'); item.dataset.questionId = id;
                item.append(element('h3', q.text), answerControls(q, value => { session!.edit(id, value); invalidatePersonalReading(); })); stage.append(item);
            }
            stage.append(actions(button('back_checkpoint', () => { quizView = 'checkpoint'; renderQuiz(); })));
            if (reviewTopic) requestAnimationFrame(() => { const q = bank.questions.find(q => q.topicId === reviewTopic && session!.presented.includes(q.id)); const heading = stage.querySelector<HTMLElement>('[data-question-id="' + q?.id + '"] h3'); heading?.scrollIntoView(); focus(heading ?? stage.querySelector('h2')); });
        } else if (quizView === 'question' && session.current()) {
            const q = session.current()!; stage.classList.add('quiz-card'); stage.dataset.questionId = q.id;
            const state = session.progress(); const navigation = element('div', '', 'quiz-navigation flex flex-wrap items-center justify-between gap-3');
            const back = button('iteration_back_question', () => { answerUnlockAt = 0; if (session!.previous()) renderQuiz(); }); back.disabled = !session.canGoBack();
            navigation.append(back, element('p', t('question') + ' ' + state.current + ' ' + t('of') + ' ' + state.total + ' · ' + topicName(q.topicId), 'progress'));
            stage.append(navigation, element('h2', q.text));
            if (q.help) { const help = element('details', '', 'question-help'); help.append(element('summary', t('question_help')), element('p', q.help)); stage.append(help); }
            const hint = paragraph('iteration_answer_hint', 'quiet answer-hint'); hint.id = 'answer-hint';
            const controls = answerControls(q, () => {}, value => {
                if (performance.now() < answerUnlockAt || session!.current()?.id !== q.id) return;
                controls.disabled = true; answerUnlockAt = performance.now() + 320;
                session!.answer(value); invalidatePersonalReading(); if (!session!.current()) quizView = 'checkpoint'; renderQuiz();
            });
            controls.setAttribute('aria-describedby', hint.id);
            if (performance.now() < answerUnlockAt) {
                controls.disabled = true; window.setTimeout(() => { if (controls.isConnected) controls.disabled = false; }, Math.max(0, answerUnlockAt - performance.now()));
            }
            stage.append(hint, controls);
        } else {
            quizView = 'checkpoint'; const result = documentedMatch(bank, session.answers, session.priorities);
            stage.classList.add('quiz-checkpoint'); stage.append(element('h2', t('iteration_checkpoint')), element('p', interpolate('iteration_numeric', { answers: result.numericCount, topics: result.topicCount, total: bank.topics.length })));
            if (!result.complete) stage.append(pending(result));
            else stage.append(element('p', result.hasEvidence ? interpolate('iteration_maximum', { percent: percent(result.maximum!) }) : t('iteration_no_evidence')));
            const available = session.extension().length === 10;
            const more = button('iteration_more', control => { control.disabled = true; if (session!.extend()) { quizView = 'question'; renderQuiz(); } }); more.disabled = !available;
            if (!available) stage.append(paragraph('iteration_exhausted'));
            const finishControl = button('iteration_finish', finish, true);
            if (performance.now() < answerUnlockAt) {
                finishControl.disabled = true; more.disabled = true;
                window.setTimeout(() => { if (finishControl.isConnected) { finishControl.disabled = false; more.disabled = !available; } }, Math.max(0, answerUnlockAt - performance.now()));
            }
            stage.append(actions(finishControl, more));
            const review = actions(button('review', () => { quizView = 'review'; renderQuiz(); })); review.classList.add('secondary-actions'); stage.append(review);
        }
        if (quizView !== 'checkpoint') { const reset = actions(button('iteration_clear', control => resetDialog(control))); reset.classList.add('secondary-actions', 'quiz-reset'); stage.append(reset); }
        focus(stage.querySelector('h2'));
        if (quizView === 'question') requestAnimationFrame(() => stage.scrollIntoView({ block: 'start' }));
    }
    async function finish(): Promise<void> {
        if (!session || finishing) return;
        const active = session; finishing = true;
        const page = view('quiz');
        const controls = [...page.querySelectorAll<HTMLButtonElement>('button')].map(control => ({ control, disabled: control.disabled }));
        const restore = startLoading(page, t('checking_release'));
        controls.forEach(({ control }) => { control.disabled = true; });
        try {
            const response = await fetch('/api/release-state', { credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer' });
            if (!response.ok) throw new Error('Release unavailable.');
            const state: { withdrawn: string[] } = await response.json();
            if (!Array.isArray(state.withdrawn)) throw new Error('Invalid release state.');
            if (session !== active) return;
            if (state.withdrawn.includes(releaseHash)) { withdrawn = true; overlay = false; active.revealed = false; page.replaceChildren(element('h2', t('withdrawn')), button('retry', () => location.reload())); return; }
            active.finish(); quizView = 'results'; renderQuiz();
        } catch {
            restore(); const error = page.querySelector<HTMLElement>('.release-error') ?? paragraph('release_check_failed', 'error release-error');
            error.setAttribute('role', 'alert'); page.append(error);
        }
        finally { restore(); finishing = false; controls.forEach(({ control, disabled }) => { if (control.isConnected) control.disabled = disabled; }); }
    }

    function readingLayout(page: HTMLElement) {
        const layout = element('div', '', 'reading-layout'); const origin = element('div', '', 'reading-origin'); const reader = element('aside', '', 'programme-reader'); reader.hidden = true;
        layout.append(origin, reader); page.replaceChildren(layout);
        const stack: { nodes: Node[]; opener: HTMLElement; pageScroll: number; readerScroll: number }[] = [];
        let rootOpener: HTMLElement | null = null; let rootScroll = 0;
        const restore = (opener: HTMLElement, pageScroll: number) => requestAnimationFrame(() => {
            window.scrollTo(0, pageScroll);
            if (opener.isConnected) opener.focus({ preventScroll: true });
            else { focus(origin.querySelector('h2')); origin.append(paragraph('iteration_origin_changed', 'quiet')); }
        });
        const close = () => { reader.replaceChildren(); reader.hidden = true; layout.classList.remove('has-reader'); stack.splice(0); if (rootOpener) restore(rootOpener, rootScroll); };
        const back = () => {
            const previous = stack.pop(); if (!previous) { close(); return; }
            reader.replaceChildren(...previous.nodes); restore(previous.opener, previous.pageScroll); reader.scrollTop = previous.readerScroll;
        };
        const open = (heading: string, nodes: HTMLElement[], opener: HTMLElement, backKey: string) => {
            if (reader.hidden) { rootOpener = opener; rootScroll = window.scrollY; }
            else stack.push({ nodes: [...reader.childNodes], opener, pageScroll: window.scrollY, readerScroll: reader.scrollTop });
            const title = element('h2', heading); title.id = 'reader-heading'; reader.setAttribute('aria-labelledby', title.id);
            reader.replaceChildren(actions(button(backKey, back), button('iteration_close_reader', close)), title, ...nodes); reader.hidden = false; layout.classList.add('has-reader'); reader.scrollTop = 0;
            focus(title); title.scrollIntoView({ block: 'nearest' });
        };
        reader.addEventListener('keydown', event => { if (event.key === 'Escape' && reader.contains(document.activeElement)) { event.preventDefault(); close(); } });
        return { origin, open, close };
    }
    function scopeView(p: ProgrammeProfile): HTMLElement {
        const scope = element('details'); scope.append(element('summary', interpolate('iteration_scope_count', { count: p.constituencyIds.length })), element('p', t('iteration_scope') + ': ' + scopeNames(p))); return scope;
    }
    function relation(q: Question, p: ProgrammeProfile): HTMLElement {
        const position = profilePosition(bank, p, q.id); const answer = session?.answers[q.id];
        const block = element('div', '', 'proposal-relation'); block.append(element('p', t('your_answer') + ': ' + (typeof answer === 'number' ? t(answer === 0 ? 'answer_neutral' : 'answer_' + (answer > 0 ? 'positive_' : 'negative_') + Math.abs(answer)) : t('iteration_unanswered'))));
        if (typeof answer === 'number' && position.status === 'derived' && position.value !== null) block.append(paragraph('relationship_' + relationship(answer, position.value), 'relationship'), element('p', t('question_overlap') + ': ' + percent(100 * similarity(answer, position.value))));
        return block;
    }
    function proposalDetail(q: Question, p: ProgrammeProfile, personal: boolean): HTMLElement[] {
        const position = profilePosition(bank, p, q.id); const block = element('section'); block.dataset.questionId = q.id;
        block.append(element('h3', p.name), element('p', q.text), scopeView(p));
        if (personal && session?.revealed) block.append(relation(q, p));
        block.append(element('h3', t('iteration_programme_position')), element('p', positionLabel(position)));
        if (!bank.documents.some(d => d.candidacyId === p.candidacyId)) block.append(paragraph('iteration_no_programme'));
        if (position.rationale) block.append(element('h3', t('iteration_summary')), element('p', position.rationale));
        if (q.help) block.append(element('p', q.help, 'quiet'));
        const linkTo = (url: string, label: string) => {
            const link = element('a', label + ' ' + t('iteration_external')); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.referrerPolicy = 'no-referrer'; return link;
        };
        for (const citation of position.citations) {
            const source = bank.sourceLinks![citation.documentId]; const document = bank.documents.find(d => d.id === citation.documentId)!;
            const links = element('div', '', 'source-links');
            if (source.officialUrl) links.append(linkTo(source.officialUrl, t('iteration_official') + ': ' + source.publisher + ' · 2023'));
            else links.append(paragraph('iteration_official_missing', 'notice'));
            if (source.officialUrl !== source.preservedUrl) links.append(linkTo(source.preservedUrl, t('iteration_preserved') + ': ' + source.publisher + ' · 2023'));
            block.append(links);
            const quote = element('details', '', 'literal-source'); quote.dataset.documentId = citation.documentId;
            quote.append(element('summary', t('iteration_quote')), element('h4', t('iteration_literal')), element('blockquote', citation.quote), element('p', (document.mediaType === 'text/html' ? t('section') + ' ' + (citation.locator.section ?? '—') : t('page') + ' ' + citation.locator.page) + ', ' + t('line') + ' ' + citation.locator.line), element('h4', t('iteration_context')), element('blockquote', citation.context), paragraph('interpretation'), element('p', 'SHA-256: ' + document.sha256, 'quiet source-hash'));
            block.append(quote);
        }
        return [block];
    }
    function programmeReader(layout: ReturnType<typeof readingLayout>, p: ProgrammeProfile, opener: HTMLElement): void {
        const topics = element('div', '', 'topic-index');
        const result = documentedMatch(bank, session!.answers, session!.priorities).rows.find(r => r.id === p.id)!;
        const metadata = element('p', result.affinity === null ? t('iteration_percent_pending') : t('iteration_affinity') + ': ' + percent(result.affinity) + '. ' + t('iteration_coverage') + ': ' + percent(result.coverage!));
        for (const topic of bank.topics) topics.append(action(topic.name, topicOpener => {
            const proposals = element('div');
            for (const q of bank.questions.filter(q => q.topicId === topic.id)) {
                const row = element('section', '', 'proposal-row'); row.dataset.questionId = q.id; row.append(element('h3', q.text), element('p', positionLabel(profilePosition(bank, p, q.id))), relation(q, p), button('iteration_open_proposal', proposalOpener => layout.open(q.text, proposalDetail(q, p, true), proposalOpener, 'iteration_back_topic'))); proposals.append(row);
            }
            layout.open(topic.name, [proposals], topicOpener, 'iteration_back_programme');
        }));
        layout.open(p.name, [metadata, scopeView(p), topics], opener, 'iteration_back_results');
    }
    function renderResults(page: HTMLElement): void {
        if (!session?.revealed) return;
        const result = documentedMatch(bank, session.answers, session.priorities); const layout = readingLayout(page); const origin = layout.origin;
        origin.append(element('h2', t('iteration_results')), paragraph('iteration_measure'), element('p', interpolate('iteration_counts', { candidacies: bank.candidacies.length, profiles: bank.programmeProfiles!.length })), element('p', interpolate('iteration_numeric', { answers: result.numericCount, topics: result.topicCount, total: bank.topics.length })));
        if (!result.complete) origin.append(pending(result));
        else origin.append(paragraph('iteration_rounding', 'quiet'));
        const axis = element('div', '', 'chart-axis'); axis.setAttribute('aria-hidden', 'true'); for (const mark of [0, 25, 50, 75, 100]) axis.append(element('span', mark + '%')); origin.append(axis);
        const rows = element('ol', '', 'affinity-chart');
        for (const row of result.rows) {
            const p = profile(row.id); const item = element('li', '', 'affinity-row'); item.dataset.profileId = p.id;
            const heading = element('h3', p.name); const value = element('strong', row.affinity === null ? '—' : percent(row.affinity), 'affinity-value');
            const bar = element('div', '', 'affinity-track'); bar.setAttribute('aria-hidden', 'true'); const fill = element('span'); fill.style.width = (row.affinity ?? 0) + '%'; bar.append(fill);
            const metadata = element('p', row.coverage === null ? t('iteration_percent_pending') : t('iteration_coverage') + ': ' + percent(row.coverage), 'quiet');
            if (p.constituencyIds.length < 52) metadata.append(element('span', ' · ' + (p.constituencyIds.length <= 6 ? scopeNames(p) : interpolate('iteration_scope_count', { count: p.constituencyIds.length }))));
            if (!bank.documents.some(d => d.candidacyId === row.candidacyId)) metadata.append(element('span', ' · ' + t('iteration_no_programme')));
            if (row.affinity !== null && result.rows.some(other => other.id !== row.id && other.affinity === row.affinity)) metadata.append(element('span', ' · ' + t('iteration_tie')));
            item.append(heading, value, bar, metadata, button('iteration_open_programme', opener => programmeReader(layout, p, opener))); rows.append(item);
        }
        origin.append(rows, actions(button('iteration_result_topics', () => { overlay = true; views.delete('programmes'); publicMode = 'catalogue'; show('programmes', true); }), button('review', () => { session!.revealed = false; invalidatePersonalReading(); quizView = 'review'; renderQuiz(); }), button('export', exportResults), button('iteration_clear', resetDialog)));
        focus(origin.querySelector('h2'));
    }
    function exportResults(): void {
        if (!session?.revealed || !window.confirm(t('export_warning'))) return;
        const data = { title: t('iteration_export_title'), explanation: t('iteration_measure'), labels: { affinity: t('iteration_affinity'), coverage: t('iteration_coverage'), pending: t('iteration_percent_pending'), answer: t('your_answer'), interpretation: t('iteration_summary'), officialUrl: t('iteration_official'), preservedUrl: t('iteration_preserved') }, ...session.export(), answerDetails: session.presented.map(id => { const value = session!.answers[id]; return { questionId: id, text: bank.questions.find(q => q.id === id)!.text, answerLabel: t(typeof value === 'number' ? value === 0 ? 'answer_neutral' : 'answer_' + (value > 0 ? 'positive_' : 'negative_') + Math.abs(value) : value) }; }), programmes: bank.programmeProfiles, questions: bank.questions, sourceLinks: bank.sourceLinks, documents: bank.documents, positions: bank.positions, constituencyPositions: bank.constituencyPositions };
        const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); const link = element('a'); link.href = url; link.download = 'questionnaire-2023.json'; link.click(); URL.revokeObjectURL(url);
    }
    function returnPublic(mode: typeof publicMode): void {
        publicMode = mode; renderProgrammes();
        requestAnimationFrame(() => { window.scrollTo(0, programmeOriginScroll); const candidate = programmeOrigin?.dataset.returnId ? view('programmes').querySelector<HTMLElement>('[data-return-id="' + programmeOrigin.dataset.returnId + '"]') : null; if (candidate) candidate.focus({ preventScroll: true }); else focus(view('programmes').querySelector('h2')); });
    }
    function openPublicQuestion(q: Question, opener: HTMLButtonElement, from: 'catalogue' | 'topic'): void {
        programmeOrigin = opener; programmeOrigin.dataset.returnId = q.id; programmeOriginScroll = window.scrollY; publicOrigin = from; publicQuestion = q.id; publicMode = 'positions'; publicFilter = 'all'; renderProgrammes();
    }
    function overlayControl(): HTMLElement {
        const group = element('div');
        if (session?.revealed) {
            const label = element('label', '', 'choice'); const check = element('input'); check.type = 'checkbox'; check.checked = overlay; check.autocomplete = 'off'; label.append(check, element('span', t('iteration_overlay'))); check.addEventListener('change', () => { overlay = check.checked; renderProgrammes(); }); group.append(label, paragraph('iteration_overlay_notice', 'quiet'));
        }
        return group;
    }
    function renderProgrammes(): void {
        const page = view('programmes'); const layout = readingLayout(page); const origin = layout.origin;
        origin.append(overlayControl());
        if (publicMode === 'catalogue') {
            origin.append(element('h2', t('iteration_featured')), paragraph('iteration_featured_reason'));
            const featured = element('div', '', 'featured-proposals');
            for (const id of bank.starterQuestionIds!.slice(0, 4)) { const q = bank.questions.find(q => q.id === id)!; const control = action(q.text, opener => openPublicQuestion(q, opener, 'catalogue')); control.dataset.returnId = id; featured.append(control); }
            origin.append(featured);
            origin.append(element('h3', t('iteration_all_topics'))); const topics = element('div', '', 'topic-index grid gap-3 sm:grid-cols-2');
            for (const topic of bank.topics) topics.append(action(topic.name, () => { publicTopic = topic.id; publicMode = 'topic'; publicSearch = ''; renderProgrammes(); }));
            origin.append(topics, actions(button('iteration_select_programmes', () => { publicMode = 'selection'; renderProgrammes(); })), element('p', bank.ordering!.migrationGap, 'quiet'));
        } else if (publicMode === 'topic') {
            origin.append(button('iteration_back_catalogue', () => returnPublic('catalogue')), element('h2', topicName(publicTopic!)));
            const label = element('label', t('search'), 'control'); const search = element('input'); search.type = 'search'; search.autocomplete = 'off'; search.value = publicSearch; label.append(search); const output = element('div');
            const update = () => { output.replaceChildren(); const questions = bank.questions.filter(q => q.topicId === publicTopic && q.text.toLocaleLowerCase('es').includes(publicSearch.toLocaleLowerCase('es')));
                for (const q of questions) { const row = element('section', '', 'proposal-row'); const control = action(q.text, opener => openPublicQuestion(q, opener, 'topic')); control.dataset.returnId = q.id; row.append(control); output.append(row); }
                if (!questions.length) output.append(paragraph('nothing_found'), button('iteration_clear_filters', () => { publicSearch = ''; search.value = ''; update(); search.focus(); }));
            };
            search.addEventListener('input', () => { publicSearch = search.value; update(); }); origin.append(label, output); update();
        } else if (publicMode === 'positions') {
            const q = bank.questions.find(q => q.id === publicQuestion)!;
            origin.append(button(publicOrigin === 'catalogue' ? 'iteration_back_catalogue' : 'iteration_back_topic', () => returnPublic(publicOrigin)), element('h2', q.text));
            if (q.help) origin.append(element('p', q.help));
            origin.append(element('h3', t('iteration_all_positions')), element('p', interpolate('iteration_counts', { candidacies: bank.candidacies.length, profiles: bank.programmeProfiles!.length })));
            const category = (p: ProgrammeProfile) => { const position = profilePosition(bank, p, q.id); return position.status !== 'derived' ? 'unknown' : position.value! > 0 ? 'for' : position.value! < 0 ? 'against' : 'middle'; };
            const label = element('label', t('iteration_filter'), 'control'); const filter = element('select'); for (const value of ['all', 'for', 'middle', 'against', 'unknown']) filter.append(new Option(t(value === 'all' ? 'iteration_all_positions' : value === 'unknown' ? 'iteration_no_position' : 'iteration_' + value), value)); filter.value = publicFilter; label.append(filter);
            const output = element('div'); const update = () => {
                output.replaceChildren();
                for (const group of ['for', 'middle', 'against', 'unknown']) {
                    const candidates = bank.programmeProfiles!.filter(p => category(p) === group); if (publicFilter !== 'all' && publicFilter !== group) continue;
                    const block = element('section'); block.dataset.positionGroup = group; block.append(element('h3', t(group === 'unknown' ? 'iteration_no_position' : 'iteration_' + group) + ' (' + candidates.length + ')'));
                    for (const p of candidates) { const row = element('section', '', 'position-row'); row.dataset.profileId = p.id; row.append(element('h4', p.name), element('p', positionLabel(profilePosition(bank, p, q.id))));
                        if (overlay && session?.revealed) row.append(relation(q, p));
                        row.append(button('iteration_open_proposal', opener => layout.open(q.text, proposalDetail(q, p, overlay), opener, 'iteration_back_positions'))); block.append(row); }
                    output.append(block);
                }
                if (publicFilter !== 'all') output.prepend(button('iteration_clear_filters', () => { publicFilter = 'all'; filter.value = 'all'; update(); filter.focus(); }));
            };
            filter.addEventListener('change', () => { publicFilter = filter.value; layout.close(); update(); }); origin.append(label, output); update();
        } else if (publicMode === 'selection') {
            origin.append(button('iteration_back_catalogue', () => returnPublic('catalogue')), element('h2', t('iteration_select_programmes')), paragraph('iteration_selection_notice'));
            const status = element('p'); status.setAttribute('role', 'status');
            const selection = element('fieldset'); selection.append(element('legend', t('iteration_select_two')));
            const compare = button('iteration_workspace', () => { publicMode = 'workspace'; renderProgrammes(); }, true);
            const update = () => { status.textContent = interpolate('iteration_selection_count', { count: selected.size }); compare.disabled = selected.size < 2; };
            for (const p of bank.programmeProfiles!) {
                const label = element('label', '', 'choice'); const input = element('input'); input.type = 'checkbox'; input.checked = selected.has(p.id); input.autocomplete = 'off'; label.append(input, element('span', p.name));
                input.addEventListener('change', () => { if (input.checked && selected.size === 3) { input.checked = false; status.textContent = t('iteration_selection_limit'); return; } if (input.checked) selected.add(p.id); else selected.delete(p.id); update(); }); selection.append(label);
            }
            origin.append(status, compare, selection); update();
        } else {
            origin.append(button('iteration_change_selection', () => { publicMode = 'selection'; renderProgrammes(); }), element('h2', t('iteration_comparison')), paragraph('iteration_selection_notice'));
            const notice = element('p'); notice.setAttribute('role', 'status');
            const selections = element('div', '', 'actions'); const output = element('div');
            const update = () => {
                selections.replaceChildren(); output.replaceChildren();
                for (const id of selected) selections.append(action(t('iteration_remove') + ': ' + profile(id).name, () => { const scroll = window.scrollY; selected.delete(id); layout.close(); update(); notice.textContent = interpolate('iteration_selection_count', { count: selected.size }); requestAnimationFrame(() => { window.scrollTo(0, scroll); focus(origin.querySelector('h2')); }); }));
                if (selected.size < 2) { output.append(paragraph('iteration_select_two')); return; }
                for (const topic of bank.topics) {
                    const group = element('section'); group.append(element('h3', topic.name));
                    for (const q of bank.questions.filter(q => q.topicId === topic.id)) {
                        const proposal = element('section', '', 'comparison-proposal'); proposal.dataset.questionId = q.id; proposal.append(element('h4', q.text)); const summaries = element('div', '', 'comparison-summaries grid gap-5');
                        for (const id of selected) { const p = profile(id); const position = profilePosition(bank, p, q.id); const item = element('section'); item.append(element('h5', p.name), element('p', positionLabel(position))); if (position.status === 'derived' && Math.abs(position.value!) === 1 && position.rationale) item.append(element('p', position.rationale)); if (overlay && session?.revealed) item.append(relation(q, p)); item.append(button('iteration_open_proposal', opener => layout.open(q.text, proposalDetail(q, p, overlay), opener, 'iteration_back_positions'))); summaries.append(item); }
                        proposal.append(summaries); group.append(proposal);
                    }
                    output.append(group);
                }
            };
            origin.append(notice, selections, output); update();
        }
        focus(origin.querySelector('h2'));
    }
    const keepFocusedContentVisible = () => { const active = document.activeElement as HTMLElement; if (active?.closest('.programme-reader')) requestAnimationFrame(() => active.scrollIntoView({ block: 'nearest' })); };
    const resizing = new ResizeObserver(keepFocusedContentVisible); resizing.observe(root);
    window.addEventListener('resize', keepFocusedContentVisible);
    window.addEventListener('pagehide', () => { resizing.disconnect(); session?.reset(); session = null; overlay = false; selected.clear(); views.clear(); root.replaceChildren(); });
    window.addEventListener('pageshow', event => { if (event.persisted) { resizing.observe(root); quizView = 'setup'; show(section); } });
    show(section);
}
