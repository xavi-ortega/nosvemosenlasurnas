import { programmeSummary, programmeSummaryBankSha256 } from './programme-summaries.ts';
import { Questionnaire } from './questionnaire.ts';
import { documentedMatch, profilePosition } from './documented-affinity.ts';
import { relationship, similarity } from './matching.ts';
import type { Answer, Bank, Position, ProgrammeProfile, Question } from './matching.ts';
import { startLoading } from './loading.ts';
import { focusControl, focusFirstControl } from './focus.ts';

type Section = 'home' | 'quiz' | 'programmes' | 'method' | 'sources' | 'help' | 'privacy' | 'accessibility';
type Translate = (key: string) => string;
const routes: Record<Section, string> = { home: '/', quiz: '/questionnaire', programmes: '/programmes', method: '/how-it-works', sources: '/sources', help: '/help', privacy: '/privacy', accessibility: '/accessibility' };
const sectionForPath = (pathname: string): Section | undefined => pathname === '/method' ? 'method' : pathname === '/comparison' ? 'programmes' : (Object.keys(routes) as Section[]).find(key => routes[key] === pathname);

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
    const profile = (id: string) => bank.programmeProfiles!.find(p => p.id === id)!;
    const topicName = (id: string) => bank.topics.find(topic => topic.id === id)!.name;
    const scopeNames = (p: ProgrammeProfile) => p.constituencyIds.map(id => bank.election.constituencies.find(c => c.id === id)!.name).join(', ');
    const positionLabel = (p: Position) => p.status === 'conflicting' ? t('ui_conflicting_position') : p.status !== 'derived' ? t('ui_missing_position') : t(p.value === 2 ? 'support' : p.value === 1 ? 'support_qualified' : p.value === -2 ? 'oppose' : p.value === -1 ? 'oppose_qualified' : 'intermediate');
    let session: Questionnaire | null = null;
    let section: Section = initialPage === 'comparison' ? 'programmes' : initialPage in routes ? initialPage as Section : 'home';
    let quizView: 'setup' | 'question' | 'checkpoint' | 'review' | 'results' = 'setup';
    let finishing = false;
    let personalRevision = 0;
    let navigationRevision = 0;
    let reviewQuestion: string | null = null;
    let informationOrigin: { section: Section; opener: HTMLElement | null; scroll: number; revision: number } | null = null;
    let resultOrigin: { opener: HTMLElement; scroll: number; revision: number } | null = null;
    const resultSelected = new Set<string>();
    let resultSearch = '';
    let resultPage = 0;
    let allResults = false;
    let answerUnlockAt = 0;
    let quizMotion: { animations: Set<Animation>; restore: () => void } | null = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let withdrawn = false;
    let overlay = false;
    const views = new Map<Section, HTMLElement>();
    const scrolls = new Map<Section, number>();
    const selected = new Set<string>();
    let publicTopic = 'housing';
    let publicQuestion: string | null = null;
    type PublicMode = 'selection' | 'workspace' | 'topics' | 'proposals' | 'search' | 'positions' | 'formation';
    let publicMode: PublicMode = 'selection';
    let publicOrigin: PublicMode = 'topics';
    let publicSearch = '';
    let proposalSearch = '';
    let proposalPage = 0;
    let positionSearch = '';
    let publicFilter = 'all';
    let workspaceFilter = 'all';
    let workspacePage = 0;
    let workspaceSearch = '';
    let workspaceSearchPage = 0;
    let workspaceToolsOpen = false;
    const expandedCitationQuestions = new Set<string>();
    let positionPage = 0;
    let directorySearch = '';
    let sourceSelection = '';
    let formationId: string | null = null;
    let draft: Set<string> | null = null;
    let selectionReturn: { mode: PublicMode; scroll: number; opener: HTMLElement | null } | null = null;
    type PublicSnapshot = { nodes: Node[]; scroll: number; opener: HTMLElement; mode: PublicMode; revision: number; question: string | null; topic: string; overlay: boolean; selection: string };
    let proposalOrigin: PublicSnapshot | null = null;
    let workspaceOrigin: PublicSnapshot | null = null;
    const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
    const orderedProfiles = [...bank.programmeProfiles!].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    const hasProgramme = (p: ProgrammeProfile) => bank.documents.some(d => d.candidacyId === p.candidacyId);
    const answerLabel = (answer: Answer | undefined) => answer === undefined ? t('ui_unasked') : t(typeof answer === 'number' ? answer === 0 ? 'answer_neutral' : 'answer_' + (answer > 0 ? 'positive_' : 'negative_') + Math.abs(answer) : answer);
    const disclosure = (label: string, ...nodes: HTMLElement[]) => { const details = element('details'); details.append(element('summary', label), ...nodes); return details; };
    const searchControl = (key: string, value: string, update: (value: string) => void) => {
        const label = element('label', t(key), 'control search-control'); const input = element('input'); input.type = 'search'; input.autocomplete = 'off'; input.value = value;
        input.addEventListener('input', () => update(input.value)); label.append(input); return { label, input };
    };
    const restoreControl = (opener: HTMLElement | null, scroll: number, revision = personalRevision) => {
        const navigation = navigationRevision;
        requestAnimationFrame(() => { if (navigation !== navigationRevision || revision !== personalRevision) return; window.scrollTo(0, scroll); if (opener?.isConnected) focusControl(opener); else focusFirstControl(root); });
    };

    document.body.dataset.iteration = '2';
    const title = document.getElementById('page-title');
    const view = (key: Section) => { if (!views.has(key)) views.set(key, element('section')); return views.get(key)!; };
    const invalidatePersonalReading = () => {
        personalRevision++; overlay = false; resultOrigin = null; proposalOrigin = null; workspaceOrigin = null;
        if (session) session.revealed = false; views.delete('programmes');
    };
    const show = (next: Section, push = false) => {
        cancelQuizMotion(); navigationRevision++; if (navigationRevision > 1) root.style.minHeight = '';
        scrolls.set(section, window.scrollY); section = next;
        if (push && location.pathname !== routes[next]) history.pushState(null, '', routes[next]);
        if (next === 'sources' && sourceSelection !== [...(draft ?? selected)].join(',')) views.delete('sources');
        root.replaceChildren(view(next));
        if (title) { title.textContent = sectionTitle(next); title.parentElement!.classList.add('sr-only'); }
        document.title = sectionTitle(next) + ' · Nos Vemos en las Urnas';
        document.body.dataset.page = next;
        if (withdrawn) { view(next).replaceChildren(element('h2', t('withdrawn')), button('retry', () => location.reload())); return; }
        for (const link of document.querySelectorAll<HTMLAnchorElement>('.site-header a, .site-footer a')) {
            if (new URL(link.href).pathname === routes[next]) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
        }
        if (next === 'home') renderHome();
        else if (!view(next).childElementCount) {
            if (next === 'quiz') renderQuiz(); else if (next === 'programmes') renderProgrammes(); else if (next === 'sources') renderDirectory(); else renderInformation(next);
        }
        const focusAtNavigation = document.activeElement;
        requestAnimationFrame(() => {
            if (section !== next || document.activeElement !== focusAtNavigation) return;
            window.scrollTo(0, scrolls.get(next) ?? 0);
            if (!view(next).contains(document.activeElement)) focusFirstControl(view(next), next === 'quiz' ? ['input[type=radio]:checked', 'input[type=radio]'] : []);
        });
    };
    document.addEventListener('click', event => {
        const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a');
        if (!link || event.defaultPrevented || event instanceof MouseEvent && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)) return;
        const url = new URL(link.href);
        const next = sectionForPath(url.pathname);
        if (next && url.origin === location.origin && !url.hash && !url.search) { event.preventDefault(); if (['method', 'help', 'privacy', 'accessibility'].includes(next) && !['method', 'help', 'privacy', 'accessibility'].includes(section)) { informationOrigin = { section, opener: link, scroll: window.scrollY, revision: personalRevision }; views.delete(next); } show(next, true); }
    });
    window.addEventListener('popstate', () => {
        const next = sectionForPath(location.pathname);
        if (next) show(next);
    });

    function startQuiz(): void {
        if (!session) { session = new Questionnaire(bank, releaseHash); quizView = 'question'; scrolls.delete('quiz'); renderQuiz(); }
        show('quiz', true);
    }
    function sectionTitle(key: Section): string { return ['sources', 'help', 'privacy', 'accessibility'].includes(key) ? t('cleanup_' + key + '_title') : t('iteration_' + key); }
    function renderHome(): void {
        const page = view('home'); page.className = 'home-surface';
        page.replaceChildren(element('h2', t('ui_home_title'), 'iteration-hero'), paragraph('ui_home_intro', 'intro-copy'), paragraph('iteration_version', 'quiet'), actions(button(session ? 'iteration_resume' : 'iteration_start', startQuiz, true), button('iteration_compare', () => show('programmes', true))), paragraph('ui_home_notice', 'quiet'));
    }
    function renderInformation(key: Section): void {
        const page = view(key); const template = document.getElementById('information-content-' + key) as HTMLTemplateElement | null;
        page.replaceChildren();
        if (template) page.append(template.content.cloneNode(true));
        else page.append(element('h2', sectionTitle(key)), paragraph(key === 'method' ? 'iteration_method_body' : 'privacy_short'));
        const back = page.querySelector<HTMLButtonElement>('[data-return-context]');
        if (back && informationOrigin) { back.hidden = false; back.addEventListener('click', () => { const origin = informationOrigin!; show(origin.section, true); restoreControl(origin.opener, origin.scroll, origin.revision); }); }
        if (key === 'method') renderMethodExample(page.querySelector<HTMLElement>('[data-method-example]') ?? page);
    }
    function renderMethodExample(host: HTMLElement): void {
        host.replaceChildren();
        const block = element('section', '', 'method-example'); const output = element('div'); output.setAttribute('aria-live', 'polite');
        const update = (mode: string) => {
            output.replaceChildren(paragraph('ui_example_' + mode + '_text'));
            if (mode === 'equal') {
                const table = element('table', '', 'example-table'); const head = element('tr'); for (const key of ['ui_decision', 'ui_example_a', 'ui_example_b']) { const th = element('th', t(key)); th.scope = 'col'; head.append(th); }
                const thead = element('thead'); thead.append(head); table.append(thead); const body = element('tbody');
                for (let i = 1; i <= 5; i++) { const row = element('tr'); const label = element('th', String(i)); label.scope = 'row'; row.append(label, element('td', t(i === 5 ? 'ui_missing' : i <= 2 ? 'ui_agrees' : 'ui_differs')), element('td', t(i === 5 ? 'ui_missing' : i <= 2 ? 'ui_differs' : 'ui_agrees'))); body.append(row); } table.append(body); output.append(table);
            }
        };
        block.append(element('h3', t('ui_example_title')), paragraph('ui_example_notice'), actions(...['agree', 'differ', 'missing', 'equal'].map(mode => button('ui_example_' + mode, () => update(mode)))), output); host.append(block); update('missing');
    }
    function resetDialog(opener: HTMLElement): void {
        cancelQuizMotion();
        const dialog = element('dialog'); const heading = element('h2', t('iteration_clear_title')); heading.id = 'reset-title'; dialog.setAttribute('aria-labelledby', heading.id);
        const close = () => { dialog.close(); dialog.remove(); opener.focus(); };
        const keep = button('iteration_keep', close, true); keep.autofocus = true;
        dialog.append(heading, paragraph('quiz_reload'), actions(keep, button('iteration_clear', () => { invalidatePersonalReading(); session?.reset(); session = null; reviewQuestion = null; resultSelected.clear(); views.delete('programmes'); quizView = 'setup'; dialog.close(); dialog.remove(); renderQuiz(); })));
        dialog.addEventListener('cancel', event => { event.preventDefault(); close(); }); document.body.append(dialog); dialog.showModal();
    }
    function answerControls(q: Question, onChange: (answer: Answer) => void, onConfirm?: (answer: Answer) => void): HTMLFieldSetElement {
        const group = element('fieldset'); group.setAttribute('aria-label', q.text); group.append(element('legend', t('opinion')));
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
        const block = element('section', '', 'notice'); block.append(element('p', interpolate('ui_pending', { topics: result.pendingTopicIds.map(topicName).join(', ') })));
        for (const id of result.pendingTopicIds) block.append(action(interpolate('ui_pending_action', { topic: topicName(id) }), () => { reviewQuestion = bank.questions.find(q => q.topicId === id && session!.presented.includes(q.id))!.id; invalidatePersonalReading(); quizView = 'review'; renderQuiz(); }));
        return block;
    }
    function cancelQuizMotion(): void {
        const active = quizMotion; quizMotion = null; answerUnlockAt = 0;
        active?.animations.forEach(animation => animation.cancel()); active?.restore();
    }
    async function moveQuiz(stage: HTMLElement, direction: 'forward' | 'back', advance: () => void, choice?: HTMLElement): Promise<void> {
        if (quizMotion) return;
        const activeSession = session;
        const active = { animations: new Set<Animation>(), restore: () => {} }; quizMotion = active;
        const current = () => quizMotion === active && session === activeSession && section === 'quiz';
        const lock = (target: HTMLElement) => {
            const controls = [...target.querySelectorAll<HTMLButtonElement | HTMLFieldSetElement>('.quiz-navigation button, fieldset, .quiz-checkpoint .actions button')].map(control => ({ control, disabled: control.disabled }));
            controls.forEach(({ control }) => { control.disabled = true; });
            active.restore = () => controls.forEach(({ control, disabled }) => { control.disabled = disabled; });
        };
        const animate = async (target: HTMLElement, frames: Keyframe[], duration: number) => {
            if (reducedMotion.matches || typeof target.animate !== 'function') return;
            const animation = target.animate(frames, { duration, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'forwards' });
            active.animations.add(animation);
            try { await animation.finished; } catch { /* Cancellation ends the pending navigation. */ }
        };
        stage.classList.remove('state-enter'); lock(stage);
        try {
            if (choice) {
                if (reducedMotion.matches || typeof choice.animate !== 'function') await new Promise(resolve => window.setTimeout(resolve, 120));
                else await animate(choice, [
                    { transform: 'scale(1)', boxShadow: '0 0 0 0 rgb(0 107 97 / 0)' },
                    { transform: 'scale(.992)', boxShadow: '0 0 0 3px rgb(0 107 97 / .16)', offset: .4 },
                    { transform: 'scale(1)', boxShadow: '0 0 0 0 rgb(0 107 97 / 0)' },
                ], 120);
                if (!current()) return;
            }
            const offset = direction === 'forward' ? -1 : 1;
            await animate(stage, [{ transform: 'translateX(0)', opacity: 1 }, { transform: `translateX(${offset}rem)`, opacity: 0 }], 100);
            if (!current()) return;
            advance(); renderQuiz(undefined, true);
            const next = view('quiz').querySelector<HTMLElement>('.quiz-stage')!; lock(next);
            await animate(next, [{ transform: `translateX(${-offset}rem)`, opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }], 160);
            if (current() && performance.now() < answerUnlockAt) await new Promise(resolve => window.setTimeout(resolve, answerUnlockAt - performance.now()));
        } finally {
            if (quizMotion === active) { cancelQuizMotion(); if (session === activeSession && section === 'quiz') focusFirstControl(view('quiz'), ['input[type=radio]:checked', 'input[type=radio]']); }
        }
    }
    function renderQuiz(reviewTopic?: string, transitioning = false): void {
        if (!transitioning) cancelQuizMotion();
        const page = view('quiz'); page.replaceChildren();
        const stage = element('section', '', 'quiz-stage'); stage.classList.toggle('state-enter', !transitioning && !root.hasAttribute('aria-busy')); page.append(stage);
        stage.addEventListener('pointerdown', event => {
            if (performance.now() < answerUnlockAt && !(event.target as Element).closest('.quiz-navigation button')) { event.preventDefault(); }
        }, true);
        if (!session || quizView === 'setup') {
            stage.classList.add('quiz-intro'); stage.append(element('h2', t('iteration_quiz')), paragraph('iteration_intro'), paragraph('iteration_version', 'quiet'), actions(button('iteration_start', startQuiz, true)), paragraph('quiz_reload', 'quiet')); focusFirstControl(stage); return;
        }
        if (quizView === 'results' && session.revealed) { renderResults(page); return; }
        if (quizView === 'review') {
            session.revealed = false; stage.append(element('h2', t(reviewQuestion ? 'ui_review_title' : 'review')), paragraph('ui_review_notice'));
            const importance = element('details', '', 'priorities'); importance.append(element('summary', t('priorities')));
            for (const topic of bank.topics) {
                const label = element('label', topic.name, 'control'); const select = element('select'); select.autocomplete = 'off';
                select.append(new Option(t('iteration_importance_1'), '1'), new Option(t('iteration_importance_2'), '2')); select.value = String(session.priorities[topic.id] ?? 1);
                select.addEventListener('change', () => { session!.priorities[topic.id] = Number(select.value) as 1 | 2; }); label.append(select); importance.append(label);
            }
            if (!reviewQuestion) stage.append(importance);
            for (const id of reviewQuestion ? [reviewQuestion] : session.presented) {
                const q = bank.questions.find(q => q.id === id)!; const item = element('section', '', 'source-card'); item.dataset.questionId = id;
                item.append(element('h3', q.text), answerControls(q, value => { session!.edit(id, value); invalidatePersonalReading(); })); stage.append(item);
            }
            if (reviewQuestion) stage.append(actions(button('ui_refinish', finish, true)));
            stage.append(actions(button('back_checkpoint', () => { reviewQuestion = null; quizView = 'checkpoint'; renderQuiz(); })));
            if (reviewTopic) requestAnimationFrame(() => { const q = bank.questions.find(q => q.topicId === reviewTopic && session!.presented.includes(q.id)); const item = stage.querySelector<HTMLElement>('[data-question-id="' + q?.id + '"]'); item?.scrollIntoView(); focusFirstControl(item ?? stage, ['input[type=radio]:checked', 'input[type=radio]']); });
        } else if (quizView === 'question' && session.current()) {
            const q = session.current()!; stage.classList.add('quiz-card'); stage.dataset.questionId = q.id;
            const state = session.progress(); const navigation = element('div', '', 'quiz-navigation flex flex-wrap items-center justify-between gap-3');
            const back = button('iteration_back_question', () => moveQuiz(stage, 'back', () => { session!.previous(); })); back.disabled = !session.canGoBack();
            navigation.append(back, element('p', t('question') + ' ' + state.current + ' ' + t('of') + ' ' + state.total + ' · ' + topicName(q.topicId), 'progress'));
            stage.append(navigation, element('h2', q.text));
            if (q.help) { const help = element('details', '', 'question-help'); help.append(element('summary', t('question_help')), element('p', q.help)); stage.append(help); }
            const hint = paragraph('iteration_answer_hint', 'quiet answer-hint'); hint.id = 'answer-hint';
            const controls = answerControls(q, () => {}, value => {
                if (quizMotion || performance.now() < answerUnlockAt || session!.current()?.id !== q.id) return;
                session!.edit(q.id, value); invalidatePersonalReading(); answerUnlockAt = performance.now() + 320;
                void moveQuiz(stage, 'forward', () => { session!.answer(value); if (!session!.current()) quizView = 'checkpoint'; }, controls.querySelector<HTMLInputElement>('input:checked')!.closest<HTMLElement>('.choice')!);
            });
            controls.setAttribute('aria-describedby', hint.id);
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
            stage.append(actions(finishControl, more));
            const review = actions(button('review', () => { reviewQuestion = null; invalidatePersonalReading(); quizView = 'review'; renderQuiz(); })); review.classList.add('secondary-actions'); stage.append(review);
        }
        if (quizView !== 'checkpoint') { const reset = actions(button('iteration_clear', control => resetDialog(control))); reset.classList.add('secondary-actions', 'quiz-reset'); stage.append(reset); }
        if (!transitioning) focusFirstControl(stage, ['input[type=radio]:checked', 'input[type=radio]']);
        if (quizView === 'question') requestAnimationFrame(() => stage.scrollIntoView({ block: 'start' }));
    }
    async function finish(): Promise<void> {
        if (!session || finishing) return;
        const active = session; const revision = personalRevision; finishing = true;
        const page = view('quiz');
        const controls = [...page.querySelectorAll<HTMLButtonElement>('button')].map(control => ({ control, disabled: control.disabled }));
        const restore = startLoading(page, t('checking_release'));
        controls.forEach(({ control }) => { control.disabled = true; });
        try {
            const response = await fetch('/api/release-state', { credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer' });
            if (!response.ok) throw new Error('Release unavailable.');
            const state: { withdrawn: string[] } = await response.json();
            if (!Array.isArray(state.withdrawn)) throw new Error('Invalid release state.');
            if (session !== active || revision !== personalRevision) return;
            if (state.withdrawn.includes(releaseHash)) { withdrawn = true; invalidatePersonalReading(); active.revealed = false; page.replaceChildren(element('h2', t('withdrawn')), button('retry', () => location.reload())); return; }
            active.finish(); reviewQuestion = null; quizView = 'results'; renderQuiz();
        } catch {
            restore(); const error = page.querySelector<HTMLElement>('.release-error') ?? paragraph('release_check_failed', 'error release-error');
            error.setAttribute('role', 'alert'); page.append(error);
        }
        finally { restore(); finishing = false; controls.forEach(({ control, disabled }) => { if (control.isConnected) control.disabled = disabled; }); }
    }

    function readingLayout(page: HTMLElement) {
        const layout = element('div', '', 'reading-layout full-reader'); const origin = element('div', '', 'reading-origin'); const reader = element('aside', '', 'programme-reader'); reader.hidden = true;
        layout.append(origin, reader); page.replaceChildren(layout);
        const stack: { nodes: Node[]; opener: HTMLElement; pageScroll: number; readerScroll: number }[] = [];
        let rootOpener: HTMLElement | null = null; let rootScroll = 0;
        const revision = personalRevision;
        const restore = (opener: HTMLElement, pageScroll: number) => requestAnimationFrame(() => {
            if (!layout.isConnected || revision !== personalRevision) return;
            window.scrollTo(0, pageScroll);
            const semantic = opener.dataset.readerOrigin ? [...origin.querySelectorAll<HTMLElement>('[data-reader-origin]')].find(control => control.dataset.readerOrigin === opener.dataset.readerOrigin && control.getClientRects().length > 0) : null;
            if (semantic) focusControl(semantic);
            else if (opener.isConnected && opener.getClientRects().length) focusControl(opener);
            else { focusFirstControl(origin); origin.append(paragraph('iteration_origin_changed', 'quiet')); }
        });
        const close = () => { reader.replaceChildren(); reader.hidden = true; layout.classList.remove('has-reader'); stack.splice(0); if (rootOpener) restore(rootOpener, rootScroll); };
        const back = () => {
            const previous = stack.pop(); if (!previous) { close(); return; }
            reader.replaceChildren(...previous.nodes); reader.classList.toggle('source-reader', !!reader.querySelector('.source-detail')); restore(previous.opener, previous.pageScroll); reader.scrollTop = previous.readerScroll;
        };
        const open = (heading: string, nodes: HTMLElement[], opener: HTMLElement, backKey: string, replace = false) => {
            root.style.minHeight = '';
            if (reader.hidden) { rootOpener = opener; rootScroll = window.scrollY; }
            else if (!replace) stack.push({ nodes: [...reader.childNodes], opener, pageScroll: window.scrollY, readerScroll: reader.scrollTop });
            const title = element('h2', heading); title.id = 'reader-heading'; reader.setAttribute('aria-labelledby', title.id);
            const closeControl = button('iteration_close_reader', close); closeControl.classList.add('reader-close'); closeControl.setAttribute('aria-label', t('iteration_close_reader')); const closeMark = element('span', '×'); closeMark.setAttribute('aria-hidden', 'true'); closeControl.replaceChildren(closeMark);
            const navigation = actions(button(backKey, back), closeControl); navigation.classList.add('reader-navigation');
            reader.replaceChildren(navigation, title, ...nodes); reader.classList.toggle('source-reader', nodes.some(node => node.classList.contains('source-detail'))); reader.hidden = false; layout.classList.add('has-reader'); reader.scrollTop = 0;
            for (const control of reader.querySelectorAll('.actions button')) control.setAttribute('aria-describedby', title.id);
            focusFirstControl(reader); reader.scrollIntoView({ block: 'start' });
        };
        reader.addEventListener('keydown', event => { if (event.key === 'Escape' && reader.contains(document.activeElement)) { event.preventDefault(); close(); } });
        return { origin, open, close };
    }
    function scopeView(p: ProgrammeProfile): HTMLElement {
        const scope = element('details'); scope.append(element('summary', interpolate('iteration_scope_count', { count: p.constituencyIds.length })), element('p', t('iteration_scope') + ': ' + scopeNames(p))); return scope;
    }
    function ownAnswer(q: Question): HTMLElement {
        const line = element('p', t('your_answer') + ': ' + answerLabel(session?.answers[q.id]), 'own-answer'); line.dataset.questionId = q.id; return line;
    }
    function relation(q: Question, p: ProgrammeProfile): HTMLElement {
        const position = profilePosition(bank, p, q.id); const answer = session?.answers[q.id];
        const block = element('div', '', 'proposal-relation'); block.append(ownAnswer(q));
        if (typeof answer === 'number' && position.status === 'derived' && position.value !== null) block.append(paragraph('relationship_' + relationship(answer, position.value), 'relationship'), element('p', t('question_overlap') + ': ' + percent(100 * similarity(answer, position.value))));
        else if (position.status !== 'derived') block.append(paragraph('ui_no_opposition'));
        return block;
    }
    function externalLink(url: string, label: string): HTMLAnchorElement {
        const link = element('a', label + ' ' + t('iteration_external')); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.referrerPolicy = 'no-referrer'; return link;
    }
    function summaryText(q: Question, p: ProgrammeProfile): string {
        return (releaseHash === programmeSummaryBankSha256 ? programmeSummary(p.candidacyId, q.id) : null) ?? profilePosition(bank, p, q.id).rationale ?? t('ui_missing_position');
    }
    function proposalDetail(q: Question, p: ProgrammeProfile, personal: boolean): HTMLElement[] {
        const position = profilePosition(bank, p, q.id); const block = element('section', '', 'source-detail'); block.dataset.questionId = q.id;
        block.append(element('h3', p.name, 'source-formation'), paragraph('ui_source_edition', 'quiet source-edition'));
        for (const [index, citation] of position.citations.entries()) {
            const source = bank.sourceLinks![citation.documentId]; const document = bank.documents.find(d => d.id === citation.documentId)!;
            const quote = element('section', '', 'literal-source'); quote.dataset.documentId = citation.documentId;
            const locator = (document.mediaType === 'text/html' ? t('section') + ' ' + (citation.locator.section ?? '—') : t('page') + ' ' + citation.locator.page) + ', ' + t('line') + ' ' + citation.locator.line;
            const caption = element('div', '', 'citation-caption'); caption.append(element('h4', interpolate('ui_original_quote', { number: index + 1 })), element('p', locator));
            quote.append(caption, element('blockquote', citation.quote));
            const links = element('div', '', 'source-links');
            if (source.officialUrl) links.append(externalLink(source.officialUrl, t('iteration_official')));
            else links.append(paragraph('iteration_official_missing', 'quiet'));
            if (source.officialUrl !== source.preservedUrl) links.append(externalLink(source.preservedUrl, t('iteration_preserved')));
            quote.append(links, disclosure(t('ui_original_context'), element('blockquote', citation.context)), disclosure(t('ui_document_origin'), element('p', source.publisher + ' · 2023'), element('p', 'SHA-256: ' + document.sha256, 'source-hash'), scopeView(p), paragraph('interpretation'))); block.append(quote);
        }
        const interpretation = element('section', '', 'source-interpretation');
        interpretation.append(element('h4', t('ui_interpretation')), element('p', positionLabel(position), 'stance'), element('p', summaryText(q, p)));
        if (!hasProgramme(p)) interpretation.append(paragraph('ui_missing_programme'));
        if (position.status !== 'derived') interpretation.append(paragraph('ui_no_opposition', 'quiet'));
        if (position.rationale) interpretation.append(disclosure(t('ui_full_interpretation'), element('p', position.rationale)));
        if (position.citations.length) interpretation.append(paragraph('ui_original_notice', 'quiet'));
        block.append(interpretation);
        if (personal && session?.revealed) block.append(relation(q, p));
        return [block];
    }
    function sourceButton(q: Question, p: ProgrammeProfile, layout: ReturnType<typeof readingLayout>, personal: boolean, backKey: string): HTMLButtonElement {
        const control = button(profilePosition(bank, p, q.id).citations.length ? 'ui_source' : 'ui_explanation', opener => layout.open(q.text, proposalDetail(q, p, personal), opener, backKey));
        control.dataset.readerOrigin = q.id + '/' + p.id; control.setAttribute('aria-label', t(profilePosition(bank, p, q.id).citations.length ? 'ui_source' : 'ui_explanation') + ': ' + p.name); return control;
    }
    function reviewOne(q: Question): void {
        if (!session?.presented.includes(q.id)) return;
        reviewQuestion = q.id; invalidatePersonalReading(); quizView = 'review'; renderQuiz(); show('quiz', true); window.scrollTo(0, 0);
    }
    function programmeReader(layout: ReturnType<typeof readingLayout>, p: ProgrammeProfile, opener: HTMLElement): void {
        const topics = element('div', '', 'topic-index');
        for (const topic of bank.topics) topics.append(action(topic.name, topicOpener => {
            const proposals = element('div');
            for (const q of bank.questions.filter(q => q.topicId === topic.id)) {
                const row = element('section', '', 'proposal-row'); row.dataset.questionId = q.id; row.append(element('h3', q.text), element('p', positionLabel(profilePosition(bank, p, q.id))), relation(q, p), sourceButton(q, p, layout, true, 'iteration_back_topic')); proposals.append(row);
            }
            layout.open(topic.name, [proposals], topicOpener, 'iteration_back_programme');
        }));
        layout.open(p.name, [scopeView(p), topics], opener, 'iteration_back_results');
    }
    function resultExamples(layout: ReturnType<typeof readingLayout>, p: ProgrammeProfile, mode: string, opener: HTMLElement, replace = false): void {
        if (!session?.revealed) return;
        const content = element('div'); const matched = bank.questions.filter(q => {
            if (!session!.presented.includes(q.id)) return false;
            const answer = session!.answers[q.id]; const position = profilePosition(bank, p, q.id);
            if (mode === 'unknowns') return position.status !== 'derived';
            return typeof answer === 'number' && position.status === 'derived' && (mode === 'matches' ? ['same', 'close'].includes(relationship(answer, position.value!)) : ['different', 'opposed'].includes(relationship(answer, position.value!)));
        });
        content.append(element('h3', t('ui_' + mode)));
        if (!matched.length) content.append(paragraph('ui_no_examples'));
        for (const q of matched) {
            const item = element('section', '', 'result-example'); item.dataset.questionId = q.id;
            item.append(element('h3', q.text), relation(q, p), element('p', t('iteration_programme_position') + ': ' + positionLabel(profilePosition(bank, p, q.id))), element('p', summaryText(q, p)), actions(sourceButton(q, p, layout, true, 'iteration_back_positions'), button('ui_review_one', () => reviewOne(q))));
            if (resultSelected.size >= 2) item.append(button('ui_compare_proposal', control => { publicQuestion = q.id; resultToComparison(control, true); }));
            content.append(item);
        }
        content.append(actions(...['matches', 'disagreements', 'unknowns'].filter(item => item !== mode).map(item => button('ui_' + item, control => resultExamples(layout, p, item, control, true)))));
        layout.open(p.name, [content], opener, 'iteration_back_results', replace);
    }
    function resultToComparison(opener: HTMLElement, personal: boolean): void {
        if (!session?.revealed || resultSelected.size < 2) return;
        workspaceSearch = ''; workspaceSearchPage = 0; selected.clear(); resultSelected.forEach(id => selected.add(id)); draft = null; overlay = personal;
        if (publicQuestion) { const q = bank.questions.find(q => q.id === publicQuestion)!; publicTopic = q.topicId; workspaceFilter = 'all'; workspacePage = Math.floor(bank.questions.filter(item => item.topicId === q.topicId).findIndex(item => item.id === q.id) / 6); }
        resultOrigin = { opener, scroll: window.scrollY, revision: personalRevision }; workspaceOrigin = null; publicMode = 'workspace'; views.delete('programmes'); scrolls.delete('programmes'); show('programmes', true);
    }
    function renderResults(page: HTMLElement): void {
        if (!session?.revealed) return;
        const result = documentedMatch(bank, session.answers, session.priorities); const layout = readingLayout(page); const origin = layout.origin;
        origin.append(element('h2', t('ui_result_title')), paragraph('ui_result_intro'), disclosure(t('ui_result_help'), paragraph('ui_close_result'), paragraph('ui_coverage_help'), paragraph('iteration_rounding'), button('iteration_method', () => { informationOrigin = { section: 'quiz', opener: document.activeElement as HTMLElement, scroll: window.scrollY, revision: personalRevision }; views.delete('method'); show('method', true); })));
        if (!result.complete) origin.append(pending(result));
        const selection = element('details', '', 'result-selection'); const selectionHeading = element('summary', t('ui_optional_compare')); selection.append(selectionHeading); const choiceStatus = element('p'); choiceStatus.setAttribute('role', 'status'); const chips = element('div', '', 'selected-chips');
        const compare = button('iteration_compare', control => { publicQuestion = null; resultToComparison(control, false); }, true); const personal = button('ui_comparison_personal', control => { publicQuestion = null; resultToComparison(control, true); });
        const updateSelection = () => {
            selectionHeading.textContent = t('ui_optional_compare') + (resultSelected.size ? ' (' + resultSelected.size + ')' : '');
            if (resultSelected.size) selection.open = true;
            choiceStatus.textContent = interpolate('ui_selection_count', { count: resultSelected.size }) + '. ' + t(resultSelected.size === 3 ? 'ui_three_limit' : resultSelected.size === 1 ? 'ui_one_more' : resultSelected.size === 0 ? 'ui_choose_two' : 'iteration_selection_notice');
            compare.disabled = personal.disabled = resultSelected.size < 2; chips.replaceChildren();
            for (const id of resultSelected) chips.append(action(t('iteration_remove') + ': ' + profile(id).name, () => { resultSelected.delete(id); updateSelection(); updateRows(); focusControl(search.input); }));
            for (const check of origin.querySelectorAll<HTMLInputElement>('.result-choice input')) check.disabled = !check.checked && resultSelected.size === 3;
        };
        selection.append(choiceStatus, chips, actions(compare, personal)); origin.append(selection);
        const search = searchControl('ui_search_formations', resultSearch, value => { resultSearch = value; resultPage = 0; updateRows(); }); search.label.classList.add('result-search');
        const count = element('p'); count.setAttribute('role', 'status'); const rows = element('ol', '', 'affinity-chart'); const paging = element('div');
        const updateRows = () => {
            rows.replaceChildren(); paging.replaceChildren(); const matches = result.rows.filter(row => normalize(profile(row.id).name).includes(normalize(resultSearch)));
            const size = allResults ? 59 : 6; resultPage = Math.min(resultPage, Math.max(0, Math.ceil(matches.length / size) - 1));
            const shown = matches.slice(resultPage * size, (resultPage + 1) * size); count.textContent = interpolate('ui_results_count', { count: shown.length, total: matches.length });
            if (!shown.length) rows.append(element('li', t('ui_no_formations')), button('ui_clear_search', () => { resultSearch = ''; search.input.value = ''; updateRows(); search.input.focus(); }));
            for (const row of shown) {
                const p = profile(row.id); const item = element('li', '', 'affinity-row'); item.dataset.profileId = p.id;
                const heading = element('h3', p.name); const value = element('strong', row.affinity === null ? '—' : percent(row.affinity), 'affinity-value'); value.setAttribute('aria-label', t('ui_affinity') + ': ' + value.textContent);
                const bar = element('div', '', 'affinity-track'); bar.setAttribute('aria-hidden', 'true'); const fill = element('span'); fill.style.width = (row.affinity ?? 0) + '%'; bar.append(fill);
                const metadata = element('p', row.coverage === null ? t('iteration_percent_pending') : t('ui_coverage') + ': ' + percent(row.coverage), 'quiet');
                if (!hasProgramme(p)) metadata.append(element('span', '. ' + t('ui_missing_programme') + ' ' + t('ui_no_result_evidence')));
                const checkLabel = element('label', '', 'choice result-choice'); const check = element('input'); check.type = 'checkbox'; check.autocomplete = 'off'; check.checked = resultSelected.has(p.id); check.disabled = !check.checked && resultSelected.size === 3; checkLabel.append(check, element('span', interpolate('ui_compare_label', { name: p.name })));
                check.addEventListener('change', () => { if (check.checked && resultSelected.size < 3) resultSelected.add(p.id); else resultSelected.delete(p.id); updateSelection(); });
                item.append(heading, value, bar, metadata, actions(...['matches', 'disagreements', 'unknowns'].map(mode => button('ui_' + mode, opener => resultExamples(layout, p, mode, opener)))), checkLabel, disclosure(t('iteration_open_programme'), button('iteration_open_programme', opener => programmeReader(layout, p, opener)))); rows.append(item);
            }
            if (!allResults && matches.length > 6) paging.append(pagination(matches.length, resultPage, next => { resultPage = next; updateRows(); focusFirstControl(paging); paging.scrollIntoView({ block: 'nearest' }); }, 'ui_formation_range'));
        };
        origin.append(search.label, count, rows, paging, actions(button('ui_result_all', control => { allResults = !allResults; resultPage = 0; control.textContent = t(allResults ? 'ui_result_page' : 'ui_result_all'); updateRows(); }), button('review', () => { reviewQuestion = null; invalidatePersonalReading(); quizView = 'review'; renderQuiz(); }), button('ui_export', exportDialog), button('iteration_clear', resetDialog)));
        updateRows(); updateSelection(); focusFirstControl(origin);
    }
    function exportDialog(opener: HTMLElement): void {
        if (!session?.revealed) return;
        const dialog = element('dialog'); const heading = element('h2', t('ui_export')); heading.id = 'export-title'; dialog.setAttribute('aria-labelledby', heading.id);
        const close = () => { dialog.close(); dialog.remove(); focusControl(opener); };
        const save = (readable: boolean) => { exportResults(readable); close(); };
        const cancel = button('ui_cancel', close); cancel.autofocus = true;
        dialog.append(heading, paragraph('ui_export_notice'), actions(cancel, button('ui_export_readable', () => save(true), true), button('ui_export_technical', () => save(false))));
        dialog.addEventListener('cancel', event => { event.preventDefault(); close(); }); document.body.append(dialog); dialog.showModal();
    }
    function exportResults(readable = false): void {
        if (!session?.revealed) return;
        const data = { title: t('iteration_export_title'), explanation: t('ui_result_intro'), programmePolicy: bank.programmePolicy, limitations: bank.limitations, labels: { affinity: t('ui_affinity'), coverage: t('ui_coverage'), pending: t('iteration_percent_pending'), answer: t('your_answer'), interpretation: t('ui_interpretation'), officialUrl: t('iteration_official'), preservedUrl: t('iteration_preserved') }, ...session.export(), answerDetails: session.presented.map(id => ({ questionId: id, text: bank.questions.find(q => q.id === id)!.text, answerLabel: answerLabel(session!.answers[id]) })), programmes: bank.programmeProfiles, questions: bank.questions, sourceLinks: bank.sourceLinks, documents: bank.documents, positions: bank.positions, constituencyPositions: bank.constituencyPositions };
        let contents = JSON.stringify(data, null, 2);
        if (readable) {
            const result = documentedMatch(bank, session.answers, session.priorities);
            contents = [t('iteration_export_title'), t('ui_result_intro'), t('ui_coverage_help'), t('ui_no_opposition'), '', ...data.answerDetails.flatMap(answer => [answer.text, t('your_answer') + ': ' + answer.answerLabel, '']), ...result.rows.map(row => profile(row.id).name + '\n' + t('ui_affinity') + ': ' + (row.affinity === null ? t('iteration_percent_pending') : percent(row.affinity)) + '\n' + t('ui_coverage') + ': ' + (row.coverage === null ? t('iteration_percent_pending') : percent(row.coverage)) + (!hasProgramme(profile(row.id)) ? '\n' + t('ui_missing_programme') : '')), '', t('ui_export_notice')].join('\n');
        }
        const url = URL.createObjectURL(new Blob([contents], { type: readable ? 'text/plain;charset=utf-8' : 'application/json' })); const link = element('a'); link.href = url; link.download = readable ? 'mi-resultado-2023.txt' : 'questionnaire-2023.json'; link.click(); URL.revokeObjectURL(url);
    }
    function pagination(total: number, current: number, change: (page: number) => void, key = 'ui_range'): HTMLElement {
        const group = element('div', '', 'pagination'); const previous = button('ui_previous', () => change(current - 1)); previous.disabled = current === 0;
        const next = button('ui_next', () => change(current + 1)); next.disabled = (current + 1) * 6 >= total;
        group.append(previous, element('p', interpolate(key, { first: total ? current * 6 + 1 : 0, last: Math.min(total, (current + 1) * 6), total })), next); return group;
    }
    function publicNavigate(mode: PublicMode, focusKey?: string): void {
        root.style.minHeight = ''; publicMode = mode; renderProgrammes(); window.scrollTo(0, 0);
        if (focusKey) focusControl(view('programmes').querySelector<HTMLElement>('[data-control="' + focusKey + '"]'));
    }
    function startSelection(opener: HTMLElement): void {
        selectionReturn = { mode: publicMode, scroll: window.scrollY, opener }; draft = new Set(selected); publicSearch = ''; publicNavigate('selection', 'formation-search');
    }
    function selectionSummary(ids: Set<string>, update: () => void, compareAction: (opener: HTMLButtonElement) => void): HTMLElement {
        const summary = element('section', '', 'selection-summary');
        const status = element('p', interpolate('ui_selection_count', { count: ids.size }) + '. ' + (ids.size < 2 ? t(ids.size === 1 ? 'ui_one_more' : 'ui_choose_two') : ids.size === 3 ? t('ui_three_limit') : ''), 'selection-status'); status.setAttribute('role', 'status');
        const chips = element('div', '', 'selected-chips');
        for (const id of ids) chips.append(action(t('iteration_remove') + ': ' + profile(id).name, () => { ids.delete(id); update(); }));
        const compare = action(interpolate('ui_compare_count', { count: ids.size }), compareAction, true); compare.disabled = ids.size < 2; compare.dataset.control = 'compare';
        summary.append(status, chips, compare); return summary;
    }
    function confirmPublicComparison(opener?: HTMLElement): void {
        if (draft) { selected.clear(); draft.forEach(id => selected.add(id)); draft = null; }
        if (selected.size < 2) return;
        if (publicMode === 'positions' && opener) { workspaceOrigin = publicSnapshot(opener); workspaceSearch = ''; workspaceSearchPage = 0; }
        if (publicQuestion) { const q = bank.questions.find(q => q.id === publicQuestion)!; publicTopic = q.topicId; const questions = bank.questions.filter(item => item.topicId === publicTopic); workspacePage = Math.floor(questions.findIndex(item => item.id === q.id) / 6); }
        publicNavigate('workspace');
        if (publicQuestion) { const target = [...view('programmes').querySelectorAll<HTMLElement>('[data-reader-origin]')].find(control => control.dataset.readerOrigin?.startsWith(publicQuestion + '/') && control.getClientRects().length); target?.scrollIntoView({ block: 'center' }); focusControl(target ?? null); }
        selectionReturn = null;
    }
    function publicSnapshot(opener: HTMLElement): PublicSnapshot {
        return { nodes: [...view('programmes').childNodes], scroll: window.scrollY, opener, mode: publicMode, revision: personalRevision, question: publicQuestion, topic: publicTopic, overlay, selection: [...selected].join(',') };
    }
    function restorePublic(snapshot: PublicSnapshot): void {
        publicMode = snapshot.mode; publicQuestion = snapshot.question; publicTopic = snapshot.topic;
        if (snapshot.revision === personalRevision && snapshot.overlay === overlay && snapshot.selection === [...selected].join(',')) view('programmes').replaceChildren(...snapshot.nodes); else renderProgrammes();
        const identity = snapshot.opener.dataset.control ? ['data-control', snapshot.opener.dataset.control] : snapshot.opener.dataset.proposalId ? ['data-proposal-id', snapshot.opener.dataset.proposalId] : null;
        const opener = snapshot.opener.isConnected ? snapshot.opener : identity ? view('programmes').querySelector<HTMLElement>('[' + identity[0] + '="' + identity[1] + '"]') : null;
        restoreControl(opener, snapshot.scroll, snapshot.revision);
    }
    function openPublicQuestion(q: Question, opener: HTMLButtonElement): void {
        proposalOrigin = publicSnapshot(opener);
        publicOrigin = publicMode; publicQuestion = q.id; publicTopic = q.topicId; publicFilter = 'all'; positionPage = 0; positionSearch = ''; publicNavigate('positions');
    }
    function overlayControl(): HTMLElement {
        const group = element('div');
        if (session?.revealed) {
            const label = element('label', '', 'choice overlay-choice'); const check = element('input'); check.type = 'checkbox'; check.checked = overlay; check.autocomplete = 'off'; label.append(check, element('span', t('iteration_overlay')));
            check.addEventListener('change', () => { const scroll = window.scrollY; overlay = check.checked; renderProgrammes(); restoreControl(view('programmes').querySelector<HTMLInputElement>('.overlay-choice input'), scroll); }); group.append(label);
        }
        return group;
    }
    function renderProgrammes(): void {
        const page = view('programmes'); const layout = readingLayout(page); const origin = layout.origin;
        if (publicMode === 'selection') {
            origin.append(element('h2', t('ui_selection_title')), paragraph('ui_selection_intro'));
            const navigation = actions(button('ui_topics', () => publicNavigate('topics')), button('ui_search_proposals', () => publicNavigate('search', 'proposal-search')));
            if (session) navigation.append(button('iteration_resume', startQuiz)); origin.append(navigation);
            if (selectionReturn) origin.prepend(button('ui_cancel_selection', () => { const previous = selectionReturn!; draft = null; selectionReturn = null; publicNavigate(previous.mode); restoreControl(previous.opener?.dataset.control ? view('programmes').querySelector<HTMLElement>('[data-control="' + previous.opener.dataset.control + '"]') : null, previous.scroll); }));
            const ids = draft ?? selected; const summaryHost = element('div'); const list = element('fieldset', '', 'formation-list'); list.append(element('legend', t('ui_selection_choices')));
            const count = element('p'); count.setAttribute('role', 'status'); const choices = element('div'); list.append(choices);
            const search = searchControl('ui_search_formations', publicSearch, value => { publicSearch = value; updateList(); }); search.input.dataset.control = 'formation-search';
            const updateList = () => {
                choices.replaceChildren(); const matches = orderedProfiles.filter(p => normalize(p.name).includes(normalize(publicSearch))); count.textContent = interpolate('ui_found', { count: matches.length });
                for (const p of matches) {
                    const label = element('label', '', 'formation-choice'); const input = element('input'); input.type = 'checkbox'; input.autocomplete = 'off'; input.checked = ids.has(p.id); input.disabled = !input.checked && ids.size === 3; input.setAttribute('aria-label', p.name);
                    const name = element('span', p.name); name.append(element('small', t(hasProgramme(p) ? 'ui_found_programme' : 'ui_missing_programme'))); label.append(input, name);
                    input.addEventListener('change', () => { if (input.checked && ids.size < 3) ids.add(p.id); else ids.delete(p.id); updateSummary(); for (const check of choices.querySelectorAll<HTMLInputElement>('input')) check.disabled = !check.checked && ids.size === 3; }); choices.append(label);
                }
                if (!matches.length) choices.append(paragraph('ui_no_formations'));
            };
            const updateSummary = () => { summaryHost.replaceChildren(selectionSummary(ids, () => { updateSummary(); updateList(); focusControl(search.input); }, () => confirmPublicComparison())); };
            const clear = button('ui_clear_search', () => { publicSearch = ''; search.input.value = ''; updateList(); search.input.focus(); });
            const container = element('div', '', 'choose-layout'); const searchList = element('div'); searchList.append(search.label, clear, count, list); container.append(summaryHost, searchList); origin.append(container); updateList(); updateSummary();
        } else if (publicMode === 'workspace') {
            if (selected.size < 2) { publicMode = 'selection'; renderProgrammes(); return; }
            origin.classList.add('comparison-workspace');
            const navigation = actions();
            if (resultOrigin && session?.revealed) navigation.append(button('ui_back_results', () => { const previous = resultOrigin!; show('quiz', true); restoreControl(previous.opener, previous.scroll, previous.revision); }));
            if (workspaceOrigin) navigation.append(button('ui_back_positions', () => restorePublic(workspaceOrigin!)));
            const change = button('iteration_change_selection', startSelection); change.dataset.control = 'change-selection'; navigation.classList.add('workspace-navigation'); navigation.append(change, button('ui_back_topics', () => publicNavigate('topics')));
            const heading = element('header', '', 'comparison-heading'); heading.append(element('h2', t('ui_comparison_title')), navigation); origin.append(heading);
            const controls = element('div', '', 'comparison-controls'); const topicLabel = element('label', t('ui_topic'), 'control'); const topic = element('select');
            const allTopics = new Option(t('ui_all_topics'), 'all'); allTopics.disabled = true; allTopics.hidden = true; topic.append(allTopics);
            for (const item of bank.topics) topic.append(new Option(item.name + ' (' + bank.questions.filter(q => q.topicId === item.id).length + ')', item.id)); topic.value = publicTopic; topicLabel.append(topic);
            const search = searchControl('ui_search_proposals', workspaceSearch, value => { workspaceSearch = value; workspaceSearchPage = 0; publicQuestion = null; update(); }); search.input.placeholder = t('ui_workspace_search_placeholder'); search.input.dataset.control = 'workspace-search';
            const clear = button('ui_clear_search', () => { workspaceSearch = ''; workspaceSearchPage = 0; search.input.value = ''; update(); search.input.focus(); }); clear.classList.add('text-action');
            const filterLabel = element('label', t('ui_show'), 'control'); const filter = element('select'); for (const value of ['all', 'differences', 'gaps']) filter.append(new Option(t(value === 'all' ? 'ui_all_proposals' : 'ui_' + value), value)); filter.value = workspaceFilter; filterLabel.append(filter);
            const toolsContent = element('div', '', 'comparison-tools-content'); toolsContent.append(search.label, filterLabel);
            const tools = disclosure(t('ui_comparison_tools'), toolsContent); tools.classList.add('comparison-tools'); tools.open = workspaceToolsOpen; tools.addEventListener('toggle', () => { if (tools.isConnected) workspaceToolsOpen = tools.open; }); controls.append(topicLabel, tools);
            const guide = disclosure(t('ui_comparison_help'), paragraph('ui_equal_hint'), paragraph('ui_filter_hint'), paragraph('ui_no_opposition')); guide.classList.add('comparison-help');
            const toolbar = element('div', '', 'comparison-toolbar'); const count = element('p'); count.setAttribute('role', 'status'); toolbar.append(count, clear, guide, overlayControl());
            const output = element('div', '', 'comparison-proposals'); const paging = element('div'); origin.append(controls, toolbar, output, paging);
            const update = () => {
                output.replaceChildren(); paging.replaceChildren(); const query = normalize(workspaceSearch.trim()); topic.disabled = !!query; topic.value = query ? 'all' : publicTopic; clear.hidden = !workspaceSearch;
                const questions = bank.questions.filter(q => {
                    if (query ? !normalize(q.text + ' ' + (q.help ?? '')).includes(query) : q.topicId !== publicTopic) return false;
                    const positions = [...selected].map(id => profilePosition(bank, profile(id), q.id));
                    return workspaceFilter === 'all' || workspaceFilter === 'gaps' && positions.some(p => p.status !== 'derived') || workspaceFilter === 'differences' && new Set(positions.filter(p => p.status === 'derived').map(p => p.value)).size >= 2;
                });
                const currentPage = Math.min(query ? workspaceSearchPage : workspacePage, Math.max(0, Math.ceil(questions.length / 6) - 1));
                if (query) workspaceSearchPage = currentPage; else workspacePage = currentPage;
                const current = questions.slice(currentPage * 6, (currentPage + 1) * 6);
                tools.querySelector('summary')!.textContent = t('ui_comparison_tools') + (query || workspaceFilter !== 'all' ? ' (' + t('ui_filter_active') + ')' : '');
                count.textContent = interpolate('ui_range', { first: questions.length ? currentPage * 6 + 1 : 0, last: Math.min(questions.length, (currentPage + 1) * 6), total: questions.length }) + (query ? '. ' + t('ui_search_all_topics') : '');
                if (!current.length) {
                    const empty = element('section', '', 'comparison-empty'); empty.append(paragraph(query ? workspaceFilter === 'all' ? 'ui_no_proposals' : 'ui_no_filtered_proposals' : workspaceFilter === 'differences' ? 'ui_empty_differences' : 'ui_empty_filter'));
                    if (workspaceFilter !== 'all') empty.append(button(query ? 'ui_remove_filter' : 'ui_all_again', () => { workspaceFilter = 'all'; filter.value = 'all'; update(); filter.focus(); }));
                    output.append(empty); return;
                }
                for (const q of current) {
                    const card = element('article', '', 'comparison-proposal'); card.dataset.questionId = q.id;
                    const title = element('header', '', 'proposal-heading'); if (query) title.append(element('p', topicName(q.topicId), 'quiet'));
                    title.append(element('h3', q.text)); if (overlay && session?.revealed) title.append(ownAnswer(q)); card.append(title);
                    const grid = element('div', '', 'comparison-grid'); grid.dataset.count = String(selected.size);
                    const quotes: HTMLElement[] = [];
                    const revealQuotes = button(expandedCitationQuestions.has(q.id) ? 'ui_hide_quotes' : 'ui_show_quotes', control => { const expanded = !expandedCitationQuestions.has(q.id); if (expanded) expandedCitationQuestions.add(q.id); else expandedCitationQuestions.delete(q.id); control.setAttribute('aria-expanded', String(expanded)); control.textContent = t(expanded ? 'ui_hide_quotes' : 'ui_show_quotes'); quotes.forEach(quote => { quote.hidden = !expanded; }); }); revealQuotes.classList.add('text-action'); revealQuotes.setAttribute('aria-expanded', String(expandedCitationQuestions.has(q.id)));
                    for (const id of selected) {
                        const p = profile(id); const position = profilePosition(bank, p, q.id); const cell = element('section', '', 'comparison-cell'); cell.dataset.profileId = p.id;
                        const heading = element('h4', p.name); const stance = element('p', position.status === 'unknown' ? t('ui_undocumented') : positionLabel(position), 'stance'); stance.dataset.status = position.status;
                        cell.append(heading, stance, element('p', summaryText(q, p), 'rationale'));
                        if (!hasProgramme(p)) cell.append(paragraph('ui_missing_programme', 'quiet'));
                        if (position.citations.length) {
                            const originals = element('div', '', 'comparison-quotes'); originals.id = 'quotes-' + q.id + '-' + p.id; originals.hidden = !expandedCitationQuestions.has(q.id); originals.append(paragraph('ui_literal_text', 'quiet'));
                            for (const citation of position.citations) { const document = bank.documents.find(item => item.id === citation.documentId)!; originals.append(element('blockquote', citation.quote), element('p', document.mediaType === 'text/html' ? t('section') + ' ' + (citation.locator.section ?? '—') : t('page') + ' ' + citation.locator.page, 'quiet')); }
                            quotes.push(originals); cell.append(originals);
                        }
                        const source = sourceButton(q, p, layout, overlay, 'ui_back_comparison'); source.classList.add('text-action'); cell.append(source); grid.append(cell);
                    }
                    if (quotes.length) { revealQuotes.setAttribute('aria-controls', quotes.map(quote => quote.id).join(' ')); title.append(revealQuotes); }
                    card.append(grid); output.append(card);
                }
                if (questions.length > 6) paging.append(pagination(questions.length, currentPage, next => { if (query) workspaceSearchPage = next; else workspacePage = next; publicQuestion = null; update(); (query ? search.input : topic).focus({ preventScroll: true }); controls.scrollIntoView({ block: 'start' }); }));
            };
            topic.addEventListener('change', () => { publicTopic = topic.value; publicQuestion = null; workspacePage = 0; update(); }); filter.addEventListener('change', () => { workspaceFilter = filter.value; workspacePage = workspaceSearchPage = 0; update(); }); update();
        } else if (['topics', 'proposals', 'search', 'formation'].includes(publicMode)) {
            origin.append(actions(button('iteration_select_programmes', control => startSelection(control)), button('ui_topics', () => publicNavigate('topics')), button('ui_search_proposals', () => publicNavigate('search', 'proposal-search'))));
            origin.append(element('h2', publicMode === 'topics' ? t('ui_topics_title') : publicMode === 'proposals' ? topicName(publicTopic) : publicMode === 'formation' ? profile(formationId!).name : t('ui_search_proposals')));
            if (publicMode === 'topics') {
                const topics = element('div', '', 'topic-index grid gap-3 sm:grid-cols-2'); for (const item of bank.topics) topics.append(action(item.name, () => { publicTopic = item.id; proposalSearch = ''; proposalPage = 0; publicNavigate('proposals'); })); origin.append(topics);
            } else {
                if (publicMode === 'formation') origin.append(button('ui_back_directory', () => show('sources', true)));
                const output = element('div'); const count = element('p'); count.setAttribute('role', 'status'); const paging = element('div');
                const search = searchControl('ui_search_proposals', proposalSearch, value => { proposalSearch = value; proposalPage = 0; update(); }); search.input.dataset.control = 'proposal-search';
                const update = () => {
                    output.replaceChildren(); paging.replaceChildren();
                    if (publicMode === 'search' && !proposalSearch.trim()) { count.textContent = t('ui_search_hint'); output.append(button('ui_back_topics', () => publicNavigate('topics'))); return; }
                    const questions = bank.questions.filter(q => (publicMode !== 'proposals' || q.topicId === publicTopic) && normalize(q.text + ' ' + (q.help ?? '')).includes(normalize(proposalSearch)));
                    proposalPage = Math.min(proposalPage, Math.max(0, Math.ceil(questions.length / 6) - 1)); count.textContent = interpolate('ui_range', { first: questions.length ? proposalPage * 6 + 1 : 0, last: Math.min(questions.length, (proposalPage + 1) * 6), total: questions.length });
                    for (const q of questions.slice(proposalPage * 6, (proposalPage + 1) * 6)) { const item = element('section', '', 'proposal-row'); item.dataset.questionId = q.id; const open = action(q.text, control => openPublicQuestion(q, control)); open.dataset.proposalId = q.id; item.append(element('p', topicName(q.topicId), 'quiet'), open); if (publicMode === 'formation') { const p = profile(formationId!); item.append(element('p', positionLabel(profilePosition(bank, p, q.id))), element('p', summaryText(q, p)), sourceButton(q, p, layout, false, 'ui_back_proposals')); } output.append(item); }
                    if (!questions.length) output.append(paragraph('ui_no_proposals'));
                    if (questions.length > 6) paging.append(pagination(questions.length, proposalPage, next => { proposalPage = next; update(); search.input.focus({ preventScroll: true }); search.label.scrollIntoView({ block: 'start' }); }));
                };
                origin.append(search.label, button('ui_clear_search', () => { proposalSearch = ''; search.input.value = ''; proposalPage = 0; update(); search.input.focus(); }), count, output, paging); update();
            }
        } else if (publicMode === 'positions') {
            const q = bank.questions.find(q => q.id === publicQuestion)!;
            origin.append(button(publicOrigin === 'search' ? 'ui_back_search' : 'ui_back_proposals', () => { if (proposalOrigin) restorePublic(proposalOrigin); else publicNavigate('topics'); }), element('h2', q.text));
            if (q.help) origin.append(disclosure(t('question_help'), element('p', q.help))); origin.append(overlayControl());
            if (overlay && session?.revealed) origin.append(ownAnswer(q));
            const summary = element('div'); const updateSummary = () => summary.replaceChildren(selectionSummary(selected, () => { updateSummary(); update(); focusControl(search.input); }, control => confirmPublicComparison(control))); origin.append(summary);
            const category = (p: ProgrammeProfile) => { const position = profilePosition(bank, p, q.id); return position.status !== 'derived' ? 'unknown' : position.value! > 0 ? 'for' : position.value! < 0 ? 'against' : 'middle'; };
            const groups = element('div', '', 'position-groups');
            for (const value of ['for', 'middle', 'against', 'unknown']) groups.append(action(t(value === 'unknown' ? 'ui_missing_position' : 'iteration_' + value) + ' (' + orderedProfiles.filter(p => category(p) === value).length + ')', () => { publicFilter = value; filter.value = value; positionPage = 0; update(); filter.focus(); })); origin.append(groups);
            const label = element('label', t('iteration_filter'), 'control'); const filter = element('select'); for (const value of ['all', 'for', 'middle', 'against', 'unknown']) filter.append(new Option(t(value === 'all' ? 'iteration_all_positions' : value === 'unknown' ? 'ui_missing_position' : 'iteration_' + value), value)); filter.value = publicFilter; label.append(filter);
            const search = searchControl('ui_search_formations', positionSearch, value => { positionSearch = value; positionPage = 0; update(); }); const output = element('div'); const paging = element('div'); const count = element('p'); count.setAttribute('role', 'status');
            const update = () => {
                output.replaceChildren(); paging.replaceChildren(); const matches = orderedProfiles.filter(p => (publicFilter === 'all' || category(p) === publicFilter) && normalize(p.name).includes(normalize(positionSearch)));
                count.textContent = interpolate('ui_found', { count: matches.length }); positionPage = Math.min(positionPage, Math.max(0, Math.ceil(matches.length / 6) - 1));
                for (const p of matches.slice(positionPage * 6, (positionPage + 1) * 6)) { const row = element('section', '', 'position-row'); row.dataset.profileId = p.id; row.dataset.positionGroup = category(p); row.append(element('h3', p.name), element('p', positionLabel(profilePosition(bank, p, q.id))), element('p', summaryText(q, p)));
                    const add = button(selected.has(p.id) ? 'ui_added_comparison' : 'ui_add_comparison', () => { if (selected.size < 3) selected.add(p.id); updateSummary(); update(); focusFirstControl(summary); }); add.disabled = selected.has(p.id) || selected.size === 3; row.append(actions(sourceButton(q, p, layout, overlay, 'ui_back_positions'), add)); output.append(row); }
                if (!matches.length) output.append(paragraph('ui_no_formations')); if (matches.length > 6) paging.append(pagination(matches.length, positionPage, next => { positionPage = next; update(); filter.focus({ preventScroll: true }); filter.scrollIntoView(); }, 'ui_formation_range'));
            };
            filter.addEventListener('change', () => { publicFilter = filter.value; positionPage = 0; update(); }); origin.append(label, search.label, button('iteration_clear_filters', () => { publicFilter = 'all'; positionSearch = ''; positionPage = 0; search.input.value = ''; filter.value = 'all'; update(); filter.focus(); }), count, output, paging); update(); updateSummary();
        }
        focusFirstControl(origin);
    }
    function renderDirectory(): void {
        sourceSelection = [...(draft ?? selected)].join(',');
        const layout = readingLayout(view('sources')); const origin = layout.origin; origin.append(element('h2', t('ui_directory')), paragraph('ui_directory_intro'));
        const output = element('div'); const count = element('p'); count.setAttribute('role', 'status'); const search = searchControl('ui_search_formations', directorySearch, value => { directorySearch = value; update(); });
        const update = () => {
            output.replaceChildren(); const matches = orderedProfiles.filter(p => normalize(p.name).includes(normalize(directorySearch))); count.textContent = interpolate('ui_found', { count: matches.length });
            for (const p of matches) {
                const row = element('section', '', 'directory-row'); row.dataset.profileId = p.id; row.append(element('h3', p.name), element('p', t(hasProgramme(p) ? 'ui_found_programme' : 'ui_missing_programme')), button('ui_factsheet', control => {
                    const content = element('div'); content.append(paragraph('ui_source_edition'), element('p', t(hasProgramme(p) ? 'ui_found_programme' : 'ui_missing_programme')), scopeView(p));
                    for (const document of bank.documents.filter(d => d.candidacyId === p.candidacyId)) {
                        const source = bank.sourceLinks![document.id]; const links = element('div', '', 'source-links');
                        if (source.officialUrl) links.append(externalLink(source.officialUrl, t('iteration_official') + ': ' + source.publisher)); else links.append(paragraph('iteration_official_missing'));
                        if (source.preservedUrl !== source.officialUrl) links.append(externalLink(source.preservedUrl, t('iteration_preserved') + ': ' + source.publisher)); content.append(links, disclosure(t('ui_document_origin'), element('p', 'SHA-256: ' + document.sha256, 'source-hash')));
                    }
                    const status = element('p'); status.setAttribute('role', 'status'); const ids = draft ?? selected;
                    const add = button(ids.has(p.id) ? 'ui_added_comparison' : 'ui_add_comparison', addControl => { const activeIds = draft ?? selected; if (activeIds.size < 3) { activeIds.add(p.id); views.delete('programmes'); sourceSelection = [...activeIds].join(','); addControl.disabled = true; addControl.textContent = t('ui_added_comparison'); status.textContent = interpolate('ui_selection_count', { count: activeIds.size }); } }); add.disabled = ids.has(p.id) || ids.size >= 3;
                    if (ids.size === 3) status.textContent = t('ui_three_limit');
                    content.append(status, actions(button('ui_view_proposals', () => { formationId = p.id; publicMode = 'formation'; proposalSearch = ''; proposalPage = 0; views.delete('programmes'); show('programmes', true); }), add, button('iteration_compare', () => { publicMode = 'selection'; views.delete('programmes'); show('programmes', true); })));
                    layout.open(p.name, [content], control, 'ui_back_directory');
                })); output.append(row);
            }
            if (!matches.length) output.append(paragraph('ui_no_formations'));
        };
        origin.append(search.label, button('ui_clear_search', () => { directorySearch = ''; search.input.value = ''; update(); search.input.focus(); }), count, output); update();
    }
    const keepFocusedContentVisible = () => { const active = document.activeElement as HTMLElement; if (active?.closest('.programme-reader')) requestAnimationFrame(() => active.scrollIntoView({ block: 'nearest' })); };
    const resizing = new ResizeObserver(keepFocusedContentVisible); resizing.observe(root);
    window.addEventListener('resize', keepFocusedContentVisible);
    window.addEventListener('pagehide', () => { navigationRevision++; personalRevision++; resizing.disconnect(); session?.reset(); session = null; overlay = false; selected.clear(); resultSelected.clear(); expandedCitationQuestions.clear(); draft = null; resultOrigin = null; informationOrigin = null; proposalOrigin = null; workspaceOrigin = null; directorySearch = publicSearch = proposalSearch = positionSearch = resultSearch = workspaceSearch = ''; workspaceSearchPage = 0; publicMode = 'selection'; views.clear(); root.replaceChildren(); });
    window.addEventListener('pageshow', event => { if (event.persisted) { resizing.observe(root); quizView = 'setup'; show(section); } });
    show(section);
}
