import { createSidePanel } from './side-panel.ts';
import { presentResult } from './result-presentation.ts';
import { mountMethodInformation } from './method-example.ts';
import { programmeSummary, programmeSummaryBankSha256 } from './programme-summaries.ts';
import { Questionnaire } from './questionnaire.ts';
import { documentedMatch, profilePosition } from './documented-affinity.ts';
import { similarity } from './matching.ts';
import type { Answer, Bank, Citation, Position, ProgrammeProfile, Question } from './matching.ts';
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
    let resultSearch = '';
    let answerUnlockAt = 0;
    let quizMotion: { animations: Set<Animation>; restore: () => void } | null = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let withdrawn = false;
    const views = new Map<Section, HTMLElement>();
    const scrolls = new Map<Section, number>();
    const selected: string[] = [];
    let comparisonStarted = false;
    let workspaceSearch = '';
    let loadedProposals = 6;
    let unfilteredLoaded = 6;
    const expandedCitationQuestions = new Set<string>();
    let directorySearch = '';
    const panel = createSidePanel(t, () => root.querySelector<HTMLElement>('button, input, a[href]'));
    const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
    const orderedProfiles = [...bank.programmeProfiles!].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    const hasProgramme = (p: ProgrammeProfile) => bank.documents.some(d => d.candidacyId === p.candidacyId);
    const answerLabel = (answer: Answer | undefined) => answer === undefined ? t('ui_unasked') : t(typeof answer === 'number' ? answer === 0 ? 'answer_neutral' : 'answer_' + (answer > 0 ? 'positive_' : 'negative_') + Math.abs(answer) : answer);
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
        personalRevision++; panel.invalidatePersonal();
        if (session) session.revealed = false;
    };
    const show = (next: Section, push = false) => {
        cancelQuizMotion(); panel.close(true, false); navigationRevision++; if (navigationRevision > 1) root.style.minHeight = '';
        scrolls.set(section, window.scrollY); section = next;
        if (push && location.pathname !== routes[next]) history.pushState(null, '', routes[next]);
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
        if (key === 'method') {
            mountMethodInformation(page, t, panel);
            const start = page.querySelector<HTMLAnchorElement>('[data-method-start]');
            if (start) { start.textContent = t(session ? 'iteration_resume' : 'iteration_start'); start.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); startQuiz(); }); }
        }
    }
    function resetDialog(opener: HTMLElement): void {
        cancelQuizMotion();
        const dialog = element('dialog'); const heading = element('h2', t('iteration_clear_title')); heading.id = 'reset-title'; dialog.setAttribute('aria-labelledby', heading.id);
        const restart = quizView === 'results';
        const close = () => { dialog.close(); dialog.remove(); focusControl(opener); };
        const keep = button('iteration_keep', close, true); keep.autofocus = true;
        dialog.append(heading, paragraph('quiz_reload'), actions(keep, button('iteration_clear', () => { invalidatePersonalReading(); session?.reset(); session = null; reviewQuestion = null; resultSearch = ''; views.delete('programmes'); quizView = 'setup'; dialog.close(); dialog.remove(); if (restart) { startQuiz(); } else renderQuiz(); })));
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
            advance(); renderQuiz(true);
            const next = view('quiz').querySelector<HTMLElement>('.quiz-stage')!; lock(next);
            await animate(next, [{ transform: `translateX(${-offset}rem)`, opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }], 160);
            if (current() && performance.now() < answerUnlockAt) await new Promise(resolve => window.setTimeout(resolve, answerUnlockAt - performance.now()));
        } finally {
            if (quizMotion === active) { cancelQuizMotion(); if (session === activeSession && section === 'quiz') focusFirstControl(view('quiz'), ['input[type=radio]:checked', 'input[type=radio]']); }
        }
    }
    function renderQuiz(transitioning = false): void {
        if (!transitioning) cancelQuizMotion();
        const page = view('quiz'); page.className = ''; page.replaceChildren();
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
        } else if (quizView === 'question' && session.current()) {
            const q = session.current()!; stage.classList.add('quiz-card'); stage.dataset.questionId = q.id;
            const state = session.progress(); const navigation = element('div', '', 'quiz-navigation flex flex-wrap items-center justify-between gap-3');
            const back = button('iteration_back_question', () => moveQuiz(stage, 'back', () => { session!.previous(); })); back.hidden = !session.canGoBack();
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

    function externalLink(url: string, label: string): HTMLAnchorElement {
        const link = element('a', label, 'external-link'); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.referrerPolicy = 'no-referrer';
        link.setAttribute('aria-label', label + ' ' + t('iteration_external'));
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); icon.setAttribute('viewBox', '0 0 24 24'); icon.setAttribute('aria-hidden', 'true'); icon.setAttribute('fill', 'none'); icon.setAttribute('stroke', 'currentColor'); icon.setAttribute('stroke-width', '1.6');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', 'M14 3h7v7m0-7L10 14M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5'); icon.append(path); link.append(icon); return link;
    }
    function summaryText(q: Question, p: ProgrammeProfile): string {
        return (releaseHash === programmeSummaryBankSha256 ? programmeSummary(p.candidacyId, q.id) : null) ?? profilePosition(bank, p, q.id).rationale ?? t('ui_missing_position');
    }
    function citationView(citation: Citation): HTMLElement {
        const source = bank.sourceLinks![citation.documentId]; const document = bank.documents.find(d => d.id === citation.documentId)!;
        const quote = element('figure', '', 'literal-source'); quote.dataset.documentId = citation.documentId;
        const locator = (document.mediaType === 'text/html' ? t('section') + ' ' + (citation.locator.section ?? '—') : t('page') + ' ' + citation.locator.page) + ', ' + t('line') + ' ' + citation.locator.line;
        const caption = element('figcaption'); caption.append(externalLink(source.officialUrl ?? source.preservedUrl, locator + (!source.officialUrl ? ' · ' + t('iteration_preserved') : '')));
        quote.append(element('blockquote', citation.quote), caption); return quote;
    }
    function proposalDetail(q: Question, p: ProgrammeProfile): HTMLElement[] {
        const position = profilePosition(bank, p, q.id); const block = element('section', '', 'source-detail'); block.dataset.questionId = q.id;
        block.append(element('h3', p.name, 'source-formation'), paragraph('ui_source_edition', 'quiet'), element('p', q.text, 'source-proposal'));
        if (position.citations.length) {
            block.append(paragraph('ui_literal_text', 'quiet'));
            for (const citation of position.citations) {
                block.append(citationView(citation));
                const source = bank.sourceLinks![citation.documentId];
                if (source.officialUrl && source.preservedUrl !== source.officialUrl) block.append(externalLink(source.preservedUrl, t('iteration_preserved')));
            }
        } else block.append(paragraph(hasProgramme(p) ? 'flow_no_quote' : 'ui_missing_programme'));
        if (position.status !== 'derived') block.append(element('p', summaryText(q, p)), paragraph('ui_no_opposition', 'quiet'));
        return [block];
    }
    function sourceButton(q: Question, p: ProgrammeProfile, personal = false): HTMLButtonElement {
        const key = profilePosition(bank, p, q.id).citations.length ? 'ui_source' : 'ui_explanation';
        const control = button(key, opener => {
            if (personal && !session?.revealed) return;
            const content = { title: t('flow_source'), nodes: proposalDetail(q, p), kind: 'source' as const };
            if (personal) panel.push(content, opener); else panel.open(content, opener);
        });
        control.classList.add('text-action'); control.dataset.panelOrigin = q.id + '/' + p.id;
        control.setAttribute('aria-label', t(key) + ': ' + p.name); return control;
    }
    function resultDetail(p: ProgrammeProfile, opener: HTMLElement): void {
        if (!session?.revealed) return;
        const presentation = presentResult(bank, session.answers, p); const result = documentedMatch(bank, session.answers, session.priorities).rows.find(row => row.id === p.id)!;
        const content = element('div', '', 'result-detail');
        content.append(element('p', t('ui_affinity') + ': ' + (result.affinity === null ? '—' : percent(result.affinity)) + ' · ' + t('ui_coverage') + ': ' + (result.coverage === null ? '—' : percent(result.coverage)), 'quiet'));
        const chart = element('section', '', 'topic-chart'); chart.append(element('h3', t('flow_topic_chart')), paragraph('flow_count_notice', 'quiet'));
        const legend = element('div', '', 'chart-legend');
        const modes = ['matches', 'differences', 'unknowns'] as const;
        for (const mode of modes) { const label = element('span', t('flow_' + mode), 'legend-' + mode); legend.append(label); } chart.append(legend);
        for (const topic of presentation.topics) {
            const row = element('div', '', 'topic-count-row'); row.dataset.topicId = topic.topicId;
            const name = element('p', topicName(topic.topicId)); const bar = element('div', '', 'topic-count-track'); bar.setAttribute('aria-hidden', 'true');
            for (const mode of modes) { const segment = element('span', topic.counts[mode] ? String(topic.counts[mode]) : '', 'count-' + mode); segment.style.width = (presentation.axisMaximum ? topic.counts[mode] / presentation.axisMaximum * 100 : 0) + '%'; bar.append(segment); }
            const counts = topic.numericCount ? modes.map(mode => topic.counts[mode] + ' ' + t('flow_count_' + mode)).join(', ') : t('flow_unanswered_topic');
            const label = element('p', counts, topic.numericCount ? 'sr-only' : 'topic-count-label'); row.append(name, bar, label); chart.append(row);
        }
        chart.append(element('p', interpolate('flow_axis', { count: presentation.axisMaximum }), 'quiet chart-axis-note'));
        const tabs = element('div', '', 'result-tabs'); tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', t('flow_detail'));
        const list = element('section', '', 'result-tab-content'); list.id = 'result-tab-content'; list.setAttribute('role', 'tabpanel');
        const tabButtons: HTMLButtonElement[] = [];
        const change = (mode: typeof modes[number], focus = false) => {
            if (!session?.revealed) return;
            list.replaceChildren(); list.setAttribute('aria-labelledby', 'tab-' + mode);
            tabButtons.forEach((tab, index) => { tab.setAttribute('aria-selected', String(modes[index] === mode)); tab.tabIndex = modes[index] === mode ? 0 : -1; });
            if (focus) focusControl(tabButtons[modes.indexOf(mode)]);
            const rows = presentation.groups[mode];
            if (!rows.length) list.append(paragraph('flow_empty_' + mode));
            for (const row of rows) {
                const q = row.question; const item = element('article', '', 'result-example'); item.dataset.questionId = q.id;
                item.append(element('p', topicName(q.topicId), 'category'), element('h3', q.text), element('p', t('your_answer') + ': ' + answerLabel(row.answer), 'own-answer'));
                if (row.relationship) item.append(paragraph('relationship_' + row.relationship, 'relationship'), element('p', t('question_overlap') + ': ' + percent(similarity(row.answer, row.position.value!) * 100), 'quiet'));
                item.append(element('p', positionLabel(row.position), 'stance'), element('p', summaryText(q, p)), sourceButton(q, p, true)); list.append(item);
            }
            list.getAnimations().forEach(animation => animation.cancel());
            if (!reducedMotion.matches && list.isConnected) list.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 140 });
        };
        for (const mode of modes) {
            const tab = action(t('flow_' + mode) + ' (' + presentation.groups[mode].length + ')', () => change(mode)); tab.id = 'tab-' + mode; tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', list.id); tabButtons.push(tab); tabs.append(tab);
            tab.addEventListener('keydown', event => { const index = modes.indexOf(mode); const next = ['ArrowRight', 'ArrowDown'].includes(event.key) ? (index + 1) % 3 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? (index + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : -1; if (next >= 0) { event.preventDefault(); change(modes[next], true); } });
        }
        content.append(tabs, chart, list); change('matches');
        panel.open({ title: p.name, nodes: [content], kind: 'result' }, opener, true);
    }
    function renderResults(page: HTMLElement): void {
        if (!session?.revealed) return;
        const result = documentedMatch(bank, session.answers, session.priorities); page.replaceChildren(); page.className = 'result-surface';
        const heading = element('header', '', 'result-heading'); const titles = element('div'); titles.append(element('h2', t('ui_result_title')), element('p', interpolate('flow_result_context', { count: result.numericCount }), 'quiet'));
        const resume = button(!result.complete || session.extension().length === 10 ? 'flow_continue' : 'flow_restart', control => {
            if (result.complete && session!.extension().length !== 10) { resetDialog(control); return; }
            invalidatePersonalReading(); resultSearch = '';
            if (!result.complete) quizView = 'checkpoint'; else { session!.extend(); quizView = 'question'; }
            renderQuiz(); window.scrollTo(0, 0);
        }, true);
        heading.append(titles, actions(button('ui_export', exportDialog), resume)); page.append(heading, paragraph('flow_result_intro'));
        if (!result.complete) page.append(element('p', interpolate('ui_pending', { topics: result.pendingTopicIds.map(topicName).join(', ') }), 'notice'));
        const search = searchControl('ui_search_formations', resultSearch, value => { resultSearch = value; update(); }); search.label.classList.add('result-search');
        const count = element('p', '', 'quiet'); count.setAttribute('role', 'status'); const rows = element('ol', '', 'affinity-chart');
        const update = () => {
            rows.replaceChildren(); const matches = result.rows.filter(row => normalize(profile(row.id).name).includes(normalize(resultSearch)));
            count.textContent = interpolate('ui_results_count', { count: matches.length, total: result.rows.length });
            if (!matches.length) { const empty = element('li'); empty.append(paragraph('ui_no_formations'), button('ui_clear_search', () => { resultSearch = ''; search.input.value = ''; update(); focusControl(search.input); })); rows.append(empty); }
            for (const row of matches) {
                const p = profile(row.id); const item = element('li', '', 'affinity-row'); item.dataset.profileId = p.id;
                const value = element('strong', row.affinity === null ? '—' : percent(row.affinity), 'affinity-value'); value.setAttribute('aria-label', t('ui_affinity') + ': ' + value.textContent);
                const track = element('div', '', 'affinity-track'); track.setAttribute('aria-hidden', 'true'); const fill = element('span'); fill.style.width = (row.affinity ?? 0) + '%'; track.append(fill);
                const detail = button('flow_detail', control => resultDetail(p, control)); detail.classList.add('text-action'); detail.dataset.panelOrigin = 'result/' + p.id; detail.setAttribute('aria-label', t('flow_detail') + ': ' + p.name);
                item.append(element('h3', p.name), value, track, element('p', row.coverage === null ? t('iteration_percent_pending') : t('ui_coverage') + ': ' + percent(row.coverage), 'quiet'));
                item.append(element('p', row.knownCount ? '' : t('flow_no_positions'), 'result-evidence quiet'), detail); rows.append(item);
            }
        };
        page.append(search.label, count, rows); update(); focusFirstControl(page);
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
    function renderProgrammes(): void {
        const page = view('programmes'); page.className = 'comparison-workspace'; page.replaceChildren(element('h2', t('flow_comparison_title')));
        if (!comparisonStarted) page.append(paragraph('flow_selection_intro'));
        const slots = element('div', '', 'programme-slots'); const feedback = element('p', '', 'quiet selection-feedback'); feedback.setAttribute('role', 'status');
        const body = element('div', '', 'comparison-body');
        const updateSlots = () => {
            slots.replaceChildren();
            for (let index = 0; index < (selected[0] && selected[1] ? 3 : 2); index++) {
                const id = selected[index]; const slot = element('div', '', 'programme-slot'); slot.dataset.slotIndex = String(index);
                const choose = action(id ? profile(id).name : t('flow_slot_' + index), control => openPicker(index, control)); choose.className = 'slot-choice';
                if (id) { choose.setAttribute('aria-label', t('flow_change') + ': ' + profile(id).name); choose.append(element('span', t('flow_change'), 'slot-action')); }
                slot.append(choose);
                slots.append(slot);
            }
        };
        const openPicker = (index: number, opener: HTMLElement) => {
            const content = element('div', '', 'programme-picker'); const output = element('div', '', 'picker-options'); const count = element('p', '', 'quiet'); count.setAttribute('role', 'status');
            const search = searchControl('ui_search_formations', '', () => update());
            const clear = button('ui_clear_search', () => { search.input.value = ''; update(); focusControl(search.input); }); clear.classList.add('text-action');
            const update = () => {
                output.replaceChildren(); clear.hidden = !search.input.value;
                const matches = orderedProfiles.filter(p => normalize(p.name).includes(normalize(search.input.value)));
                count.textContent = interpolate('ui_found', { count: matches.length });
                if (!matches.length) output.append(paragraph('ui_no_formations'));
                for (const p of matches) {
                    const row = element('div', '', 'picker-option'); row.dataset.profileId = p.id;
                    if (selected.includes(p.id) && selected[index] !== p.id) { row.append(element('p', p.name), paragraph('flow_already_selected', 'quiet')); output.append(row); continue; }
                    const choose = action(p.name, () => { selected[index] = p.id; panel.close(true, false); const scroll = window.scrollY; updateSlots(); updateBody(); const target = slots.querySelector<HTMLElement>('[data-slot-index="' + index + '"] button'); focusControl(target); window.scrollTo(0, scroll); feedback.textContent = interpolate('flow_selected', { name: p.name }); if (!reducedMotion.matches) target?.animate([{ opacity: .3 }, { opacity: 1 }], { duration: 160 }); });
                    choose.setAttribute('aria-label', p.name); if (selected[index] === p.id) choose.append(element('span', ' · ' + t('flow_current'))); choose.append(element('small', t(hasProgramme(p) ? 'ui_found_programme' : 'ui_missing_programme'))); row.append(choose); output.append(row);
                }
            };
            if (selected.some(Boolean)) content.append(element('p', interpolate('flow_picker_selection', { names: selected.filter(Boolean).map(id => profile(id).name).join(', ') }), 'quiet'));
            if (selected[index] && (!comparisonStarted || selected.length === 3)) {
                const remove = button('iteration_remove', () => { selected.splice(index, 1); panel.close(true, false); updateSlots(); updateBody(); focusFirstControl(slots); });
                remove.classList.add('text-action'); remove.setAttribute('aria-label', t('iteration_remove') + ': ' + profile(selected[index]).name); content.append(remove);
            }
            const tools = element('div', '', 'picker-search'); tools.append(search.label, clear, count);
            content.append(tools, output); update(); panel.open({ title: selected[index] ? t('flow_change') + ': ' + profile(selected[index]).name : t('flow_slot_' + index), nodes: [content], kind: 'picker', focus: search.input }, opener);
        };
        const updateBody = () => {
            body.replaceChildren();
            if (!comparisonStarted) {
                if (selected[0] && selected[1]) body.append(button('iteration_compare', () => { comparisonStarted = true; updateBody(); focusFirstControl(body); }, true));
                else body.append(paragraph(selected.some(Boolean) ? 'flow_choose_one' : 'flow_choose_two', 'quiet'));
                return;
            }
            const search = searchControl('flow_search_proposals', workspaceSearch, value => { const hadQuery = !!workspaceSearch.trim(); workspaceSearch = value; if (!hadQuery && value.trim()) unfilteredLoaded = loadedProposals; loadedProposals = value.trim() ? 6 : unfilteredLoaded; update(); }); search.input.dataset.control = 'workspace-search'; search.input.placeholder = t('ui_workspace_search_placeholder');
            const clear = button('ui_clear_search', () => { workspaceSearch = ''; search.input.value = ''; loadedProposals = unfilteredLoaded; update(); focusControl(search.input); }); clear.classList.add('text-action');
            const toolbar = element('div', '', 'comparison-toolbar'); const count = element('p', '', 'quiet'); count.setAttribute('role', 'status'); toolbar.append(count, clear);
            const output = element('div', '', 'comparison-proposals'); const paging = element('div', '', 'load-more');
            let countTimer = 0;
            const update = () => {
                clear.hidden = !workspaceSearch; const terms = normalize(workspaceSearch).trim().split(/\s+/).filter(Boolean);
                const questions = bank.questions.filter(q => terms.every(term => normalize(q.text + ' ' + (q.help ?? '') + ' ' + topicName(q.topicId)).includes(term)));
                output.replaceChildren(); paging.replaceChildren();
                window.clearTimeout(countTimer); const message = interpolate('flow_proposal_count', { count: Math.min(loadedProposals, questions.length), total: questions.length });
                if (!count.textContent) count.textContent = message; else countTimer = window.setTimeout(() => { if (count.isConnected) count.textContent = message; }, 180);
                if (!questions.length) output.append(paragraph('ui_no_proposals'));
                for (const q of questions.slice(0, loadedProposals)) output.append(comparisonProposal(q));
                if (questions.length > loadedProposals) paging.append(button('flow_more_proposals', control => {
                    const start = loadedProposals; loadedProposals += 6; if (!workspaceSearch.trim()) unfilteredLoaded = loadedProposals;
                    for (const q of questions.slice(start, loadedProposals)) output.append(comparisonProposal(q));
                    count.textContent = interpolate('flow_proposal_count', { count: Math.min(loadedProposals, questions.length), total: questions.length });
                    if (loadedProposals >= questions.length) { const firstNew = output.children[start] as HTMLElement; control.remove(); focusFirstControl(firstNew); }
                }));
            };
            body.append(search.label, toolbar, output, paging); update();
        };
        page.append(slots, feedback, body); updateSlots(); updateBody();
    }
    function comparisonProposal(q: Question): HTMLElement {
        const card = element('article', '', 'comparison-proposal'); card.dataset.questionId = q.id;
        const header = element('header', '', 'proposal-heading'); header.append(element('p', topicName(q.topicId), 'category'), element('h3', q.text));
        const grid = element('div', '', 'comparison-grid'); grid.dataset.count = String(selected.length);
        const quotes: HTMLElement[] = [];
        const reveal = button(expandedCitationQuestions.has(q.id) ? 'ui_hide_quotes' : 'ui_show_quotes', control => {
            const expanded = !expandedCitationQuestions.has(q.id); if (expanded) expandedCitationQuestions.add(q.id); else expandedCitationQuestions.delete(q.id);
            const top = control.getBoundingClientRect().top; grid.getAnimations().forEach(animation => animation.cancel()); const before = grid.getBoundingClientRect().height;
            quotes.forEach(quote => { quote.hidden = !expanded; }); const after = grid.getBoundingClientRect().height;
            control.textContent = t(expanded ? 'ui_hide_quotes' : 'ui_show_quotes'); control.setAttribute('aria-expanded', String(expanded));
            if (!reducedMotion.matches) grid.animate([{ height: before + 'px', overflow: 'clip' }, { height: after + 'px', overflow: 'clip' }], { duration: 200, easing: 'cubic-bezier(.22,1,.36,1)' });
            window.scrollBy(0, control.getBoundingClientRect().top - top);
        }); reveal.classList.add('text-action', 'quote-toggle'); reveal.setAttribute('aria-expanded', String(expandedCitationQuestions.has(q.id)));
        let available = false;
        for (const id of selected) {
            const p = profile(id); const position = profilePosition(bank, p, q.id); const cell = element('section', '', 'comparison-cell'); cell.dataset.profileId = id;
            const stance = element('p', positionLabel(position), 'stance'); stance.dataset.status = position.status;
            const copy = element('div', '', 'proposal-copy'); copy.append(element('p', summaryText(q, p), 'rationale')); if (!hasProgramme(p)) copy.append(paragraph('ui_missing_programme', 'quiet'));
            const originals = element('div', '', 'comparison-quotes'); originals.id = 'quotes-' + q.id + '-' + p.id; originals.hidden = !expandedCitationQuestions.has(q.id);
            if (position.citations.length) { available = true; originals.append(paragraph('ui_literal_text', 'quiet')); position.citations.forEach(citation => originals.append(citationView(citation))); }
            else originals.append(paragraph('flow_no_quote', 'quiet'));
            quotes.push(originals); cell.append(element('h4', p.name), stance, copy, sourceButton(q, p), originals); grid.append(cell);
        }
        if (available) { reveal.setAttribute('aria-controls', quotes.map(quote => quote.id).join(' ')); header.append(reveal); }
        card.append(header, grid); return card;
    }
    function renderDirectory(): void {
        const page = view('sources'); page.replaceChildren(element('h2', t('ui_directory')), paragraph('ui_directory_intro'));
        const output = element('div', '', 'directory-list'); const count = element('p', '', 'quiet'); count.setAttribute('role', 'status');
        const search = searchControl('ui_search_formations', directorySearch, value => { directorySearch = value; update(); });
        const clear = button('ui_clear_search', () => { directorySearch = ''; search.input.value = ''; update(); focusControl(search.input); }); clear.classList.add('text-action');
        const update = () => {
            clear.hidden = !directorySearch; output.replaceChildren(); const matches = orderedProfiles.filter(p => normalize(p.name).includes(normalize(directorySearch))); count.textContent = interpolate('ui_found', { count: matches.length });
            for (const p of matches) {
                const row = element('section', '', 'directory-row'); row.dataset.profileId = p.id;
                const open = button('ui_factsheet', control => {
                    const content = element('div'); content.append(paragraph('ui_source_edition'), paragraph(hasProgramme(p) ? 'ui_found_programme' : 'ui_missing_programme'));
                    for (const document of bank.documents.filter(d => d.candidacyId === p.candidacyId)) {
                        const source = bank.sourceLinks![document.id]; const links = element('div', '', 'source-links');
                        links.append(externalLink(source.officialUrl ?? source.preservedUrl, t(source.officialUrl ? 'iteration_official' : 'iteration_preserved') + ': ' + source.publisher));
                        if (source.officialUrl && source.preservedUrl !== source.officialUrl) links.append(externalLink(source.preservedUrl, t('iteration_preserved'))); content.append(links);
                    }
                    content.append(element('h3', t('iteration_scope')), element('p', scopeNames(p))); panel.open({ title: p.name, nodes: [content], kind: 'factsheet' }, control);
                }); open.classList.add('text-action'); open.setAttribute('aria-label', t('ui_factsheet') + ': ' + p.name);
                row.append(element('h3', p.name), paragraph(hasProgramme(p) ? 'ui_found_programme' : 'ui_missing_programme', 'quiet'), open); output.append(row);
            }
            if (!matches.length) output.append(paragraph('ui_no_formations'));
        };
        page.append(search.label, clear, count, output); update();
    }

    window.addEventListener('pagehide', () => { navigationRevision++; personalRevision++; cancelQuizMotion(); panel.close(true, false); session?.reset(); session = null; selected.splice(0); expandedCitationQuestions.clear(); informationOrigin = null; directorySearch = resultSearch = workspaceSearch = ''; loadedProposals = unfilteredLoaded = 6; comparisonStarted = false; views.clear(); root.replaceChildren(); });
    window.addEventListener('pageshow', event => { if (event.persisted) { quizView = 'setup'; show(section); } });
    show(section);
}
