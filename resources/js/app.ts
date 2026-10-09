import { parseBank, match } from './matching.ts';
import type { Answer, Bank, Citation, Question, Position, Priorities, Scale } from './matching.ts';
import { Questionnaire } from './questionnaire.ts';

const dictionary = document.getElementById('public-messages');
const messages: Record<string, string> = dictionary ? JSON.parse(dictionary.textContent ?? '{}') : {};
const t = (key: string): string => messages[key] ?? messages.generic_error ?? 'No hemos podido completar esta acción.';
const root = document.getElementById('app');
const page = document.body.dataset.page;
let bank: Bank;
let releaseHash = '';
let session: Questionnaire | null = null;
const percentage = (n: number) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(n) + ' %';
const e = <K extends keyof HTMLElementTagNameMap>(tag: K, text = '', className = ''): HTMLElementTagNameMap[K] => {
    const element = document.createElement(tag); element.textContent = text; element.className = className; return element;
};
const p = (key: string, className = '') => e('p', t(key), className);
const button = (key: string, action: () => void | Promise<void>, primary = false): HTMLButtonElement => {
    const control = e('button', t(key), primary ? 'primary' : ''); control.type = 'button';
    control.addEventListener('click', () => { void action(); }); return control;
};
const actions = (...buttons: HTMLButtonElement[]) => { const group = e('div', '', 'actions'); group.append(...buttons); return group; };
const focusHeading = () => { const heading = root?.querySelector('h2') ?? document.getElementById('page-title'); if (heading) { heading.tabIndex = -1; heading.focus(); } };
const numberAnswers = () => Object.values(session?.answers ?? {}).filter(value => typeof value === 'number').length;
const answerKeys: Record<string, string> = { '-2': 'answer_negative_2', '-1': 'answer_negative_1', '0': 'answer_neutral', '1': 'answer_positive_1', '2': 'answer_positive_2', unsure: 'unsure', skip: 'skip' };
const parseAnswer = (value: string): Answer => value === 'unsure' || value === 'skip' ? value : Number(value) as Scale;
const sampleNotice = () => bank.kind === 'current' ? p('source_warning') : p(bank.kind === 'synthetic' ? 'development' : 'historical', 'notice');
const progress = () => e('p', `${t('presented')}: ${session?.presented.length ?? 0}. ${t('numeric')}: ${numberAnswers()}.`, 'progress');

async function load(): Promise<void> {
    const response = await fetch('/api/bank', { credentials: 'omit', cache: 'no-cache', referrerPolicy: 'no-referrer' });
    if (!response.ok) throw new Error('Bank unavailable.');
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > 5 * 1024 * 1024) throw new Error('Bank limit exceeded.');
    const expected = response.headers.get('X-Evidence-Sha256');
    const computed = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), value => value.toString(16).padStart(2, '0')).join('');
    if (expected !== computed) throw new Error('Bank hash mismatch.');
    bank = parseBank(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)));
    releaseHash = computed;
}

function citation(c: Citation): HTMLElement {
    const details = e('details'); details.append(e('summary', t('citation')));
    const document = bank.documents.find(d => d.id === c.documentId)!;
    details.append(e('blockquote', c.context), e('p', `${t('page')} ${c.locator.page}; ${t('line')} ${c.locator.line}.`), p('interpretation'));
    if (bank.kind === 'synthetic') {
        details.append(p('synthetic_original'));
    } else {
        const link = e('a', t('original')); const url = new URL(document.url); url.hash = `page=${c.locator.page}`;
        link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.referrerPolicy = 'no-referrer'; details.append(link);
    }
    return details;
}
function positionView(position: Position): HTMLElement {
    const block = e('div');
    block.append(p(position.status !== 'derived' ? position.status : position.value === 2 ? 'support' : position.value === -2 ? 'oppose' : 'intermediate'));
    for (const c of position.citations) block.append(citation(c));
    return block;
}

function renderComparison(): void {
    if (!root) return;
    root.replaceChildren(sampleNotice(), p('choose_two'));
    const selected = new Set(bank.candidacies.slice(0, 2).map(c => c.id));
    const candidates = e('fieldset'); candidates.append(e('legend', t('candidacies')));
    const searchLabel = e('label', t('search'), 'control'); const search = e('input'); search.type = 'search'; search.autocomplete = 'off'; searchLabel.append(search);
    const topicLabel = e('label', t('topic'), 'control'); const topic = e('select'); topic.append(new Option(t('all_topics'), 'all'));
    for (const item of bank.topics) topic.append(new Option(item.name, item.id)); topicLabel.append(topic);
    const output = e('div');
    const renderTable = () => {
        output.replaceChildren();
        const cohort = bank.candidacies.filter(c => selected.has(c.id));
        if (cohort.length < 2) { output.append(p('choose_two')); return; }
        const questions = bank.questions.filter(q => (topic.value === 'all' || q.topicId === topic.value) && q.text.toLocaleLowerCase('es').includes(search.value.toLocaleLowerCase('es')));
        if (!questions.length) { output.append(p('nothing_found')); return; }
        const table = e('table', '', 'comparison-table'); const caption = e('caption', t('comparison_title'), 'sr-only'); table.append(caption);
        const head = e('thead'); const header = e('tr'); const first = e('th', t('proposal')); first.scope = 'col'; header.append(first);
        for (const c of cohort) { const th = e('th', c.name); th.scope = 'col'; header.append(th); } head.append(header); table.append(head);
        const body = e('tbody');
        for (const q of questions) {
            const row = e('tr'); const label = e('th', q.text); label.scope = 'row';
            const values = cohort.map(c => bank.positions[c.id][q.id]);
            label.append(p(values.some(v => v.status !== 'derived') ? 'evidence_gap' : new Set(values.map(v => v.value)).size === 1 ? 'agreement' : 'difference'));
            row.append(label);
            for (const c of cohort) { const cell = e('td'); cell.append(e('span', c.name, 'cell-label'), positionView(bank.positions[c.id][q.id])); row.append(cell); }
            body.append(row);
        }
        table.append(body); output.append(table);
    };
    for (const c of bank.candidacies) {
        const label = e('label', '', 'choice'); const input = e('input'); input.type = 'checkbox'; input.checked = selected.has(c.id); input.autocomplete = 'off';
        label.append(input, e('span', c.name)); input.addEventListener('change', () => { if (input.checked) selected.add(c.id); else selected.delete(c.id); renderTable(); }); candidates.append(label);
    }
    search.addEventListener('input', renderTable); topic.addEventListener('change', renderTable);
    root.append(candidates, searchLabel, topicLabel, output); renderTable();
}

function renderSources(): void {
    if (!root) return;
    root.replaceChildren(sampleNotice(), e('p', `${t('release')}: ${bank.asOf}. ${releaseHash.slice(0, 12)}.`), p('source_warning'));
    for (const c of bank.candidacies) {
        const card = e('section', '', 'source-card'); card.append(e('h2', c.name));
        const documents = bank.documents.filter(d => d.candidacyId === c.id);
        if (!documents.length) card.append(p('missing_programme'));
        for (const d of documents) {
            card.append(e('p', `${bank.election.name}. ${d.publishedAt}.`));
            if (bank.kind === 'synthetic') card.append(p('synthetic_original'));
            else { const link = e('a', t('original')); link.href = d.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.referrerPolicy = 'no-referrer'; card.append(link); }
        }
        root.append(card);
    }
}

function renderSetup(): void {
    if (!root) return;
    root.replaceChildren(sampleNotice(), p('quiz_intro'), p('quiz_reload'));
    const scopeLabel = e('label', t('constituency'), 'control'); const scope = e('select'); scope.autocomplete = 'off'; scope.append(new Option(t('all_constituencies'), 'all'));
    for (const s of bank.election.constituencies) scope.append(new Option(s.name, s.id)); scopeLabel.append(scope);
    const priorityGroup = e('fieldset'); priorityGroup.append(e('legend', t('priorities')));
    const selects: Record<string, HTMLSelectElement> = {};
    for (const topic of bank.topics) {
        const label = e('label', topic.name, 'control'); const select = e('select'); select.autocomplete = 'off';
        for (const n of [0, 1, 2]) select.append(new Option(t(`priority_${n}`), String(n), n === 1, n === 1));
        label.append(select); selects[topic.id] = select; priorityGroup.append(label);
    }
    root.append(scopeLabel, priorityGroup, button('start', () => {
        const priorities = Object.fromEntries(Object.entries(selects).map(([id, select]) => [id, Number(select.value)])) as Priorities;
        session = new Questionnaire(bank, releaseHash, scope.value, priorities); renderQuestion();
    }, true));
}
function answerControls(question: Question, current: Answer | undefined, onChange?: (value: Answer) => void): HTMLFieldSetElement {
    const fieldset = e('fieldset'); fieldset.append(e('legend', t('opinion')));
    for (const [value, key] of Object.entries(answerKeys)) {
        const label = e('label', '', 'choice'); const input = e('input'); input.type = 'radio'; input.name = `answer-${question.id}`; input.value = value; input.checked = String(current) === value; input.autocomplete = 'off';
        input.addEventListener('change', () => onChange?.(parseAnswer(input.value))); label.append(input, e('span', t(key))); fieldset.append(label);
    }
    return fieldset;
}
function reset(): void { session?.reset(); session = null; renderSetup(); focusHeading(); }
function renderQuestion(): void {
    if (!root || !session) return;
    const question = session.current();
    if (!question) { renderCheckpoint(); return; }
    const card = e('section', '', 'quiz-card'); card.append(progress(), e('h2', question.text));
    const choices = answerControls(question, session.answers[question.id]); const status = e('p', '', 'error'); status.setAttribute('role', 'alert');
    card.append(choices, status, actions(button('next', () => {
        const selected = choices.querySelector<HTMLInputElement>('input:checked');
        if (!selected) { status.textContent = t('choose_answer'); return; }
        session!.answer(parseAnswer(selected.value)); renderQuestion(); focusHeading();
    }, true), button('reset', reset)));
    root.replaceChildren(sampleNotice(), card); focusHeading();
}
async function finish(): Promise<void> {
    if (!root || !session) return;
    const status = e('p', '', 'error'); status.setAttribute('role', 'alert'); root.append(status);
    try {
        const response = await fetch('/api/release-state', { credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer' });
        if (!response.ok) throw new Error('Release state unavailable.');
        const state: { sha256: string; withdrawn: string[] } = await response.json();
        if (!Array.isArray(state.withdrawn)) throw new Error('Invalid release state.');
        if (state.withdrawn.includes(session.releaseHash)) { status.textContent = t('withdrawn'); return; }
        session.finish(); renderResults(); focusHeading();
    } catch { status.textContent = t('release_check_failed'); }
}
function renderCheckpoint(exhausted = false): void {
    if (!root || !session) return;
    root.replaceChildren(sampleNotice(), e('h2', t('checkpoint')), progress(), p(exhausted ? 'exhausted' : 'checkpoint_description'));
    root.append(actions(button('finish', finish, true), button('more', () => { if (session!.extend()) renderQuestion(); else renderCheckpoint(true); }), button('review', renderReview), button('reset', reset)));
    focusHeading();
}
function renderReview(): void {
    if (!root || !session) return;
    session.revealed = false;
    root.replaceChildren(e('h2', t('review')), p('quiz_reload'));
    for (const id of session.presented) {
        const q = bank.questions.find(q => q.id === id)!; const section = e('section', '', 'source-card'); section.append(e('h3', q.text), answerControls(q, session.answers[id], value => session!.edit(id, value))); root.append(section);
    }
    root.append(actions(button('back_checkpoint', () => renderCheckpoint()), button('reset', reset))); focusHeading();
}
function exportResults(): void {
    if (!session?.revealed || !window.confirm(t('export_warning'))) return;
    const data = {
        title: t('export_title'), explanation: t('export_limit'), ...session.export(),
        answerDetails: session.presented.map(id => ({ questionId: id, text: bank.questions.find(q => q.id === id)!.text, answerLabel: t(answerKeys[String(session!.answers[id])]) })),
        candidacyDetails: session.cohort.map(id => ({ candidacyId: id, name: bank.candidacies.find(c => c.id === id)!.name, positions: Object.fromEntries(session!.presented.map(qid => [qid, bank.positions[id][qid]])) })),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = e('a'); link.href = url; link.download = 'policy-overlap.json'; link.click(); URL.revokeObjectURL(url);
}
function renderResults(): void {
    if (!root || !session?.revealed) return;
    const result = match(session.bank, session.answers, session.priorities, session.cohort);
    root.replaceChildren(sampleNotice(), e('h2', t('results_title')), p('results_explanation'), e('h3', t(result.comparable ? 'comparable' : 'partial')));
    if (!result.comparable) root.append(p('partial_explanation'));
    const scope = bank.election.constituencies.find(c => c.id === session!.constituency)?.name ?? t('all_constituencies');
    root.append(e('p', `${t('constituency')}: ${scope}.`));
    const outside = bank.candidacies.filter(c => !session!.cohort.includes(c.id));
    if (outside.length) {
        root.append(p('limited_cohort', 'notice'));
        const disclosure = e('details'); disclosure.append(e('summary', t('outside_cohort')));
        for (const c of outside) disclosure.append(e('p', c.name));
        root.append(disclosure);
    }
    root.append(e('p', `${t('shared_coverage')}: ${percentage(result.sharedCoverage * 100)}. ${t('scored_questions')}: ${result.sharedCount}.`));
    const rows = e('div', '', 'results');
    for (const row of result.rows) {
        const party = bank.candidacies.find(c => c.id === row.id)!; const section = e('section', '', 'result'); section.append(e('h3', party.name));
        const value = result.comparable ? row.index : row.partialIndex;
        section.append(e('p', value === null ? t('no_score') : `${t(result.comparable ? 'overlap' : 'partial_overlap')}: ${percentage(value)}`, 'result-number'));
        section.append(e('p', `${t('coverage')}: ${percentage(row.coverage * 100)}. ${row.knownCount} ${t('known_questions').toLocaleLowerCase('es')}.`, 'result-metadata'));
        if (result.comparable && result.rows.some(other => other.id !== row.id && Math.abs(other.index! - row.index!) < 1e-8)) section.append(p('tie'));
        const explanations = e('details'); explanations.append(e('summary', t('agreements')));
        for (const q of bank.questions.filter(q => typeof session!.answers[q.id] === 'number')) {
            const item = e('section', '', 'source-card'); item.append(e('h3', q.text), e('p', `${t('your_answer')}: ${t(answerKeys[String(session!.answers[q.id])])}`), positionView(bank.positions[row.id][q.id])); explanations.append(item);
        }
        section.append(explanations); rows.append(section);
    }
    root.append(rows, actions(button('review', renderReview), button('export', exportResults), button('reset', reset)));
    const feedback = e('section', '', 'source-card'); feedback.append(e('h3', t('feedback_title')), p('feedback_description'), p('collection_disabled')); root.append(feedback);
}

if (root) {
    void load().then(() => { if (page === 'comparison') renderComparison(); else if (page === 'sources') renderSources(); else renderSetup(); }).catch((error: unknown) => {
        const unavailable = error instanceof Error && error.message === 'Bank unavailable.';
        root.replaceChildren(p(unavailable ? 'unavailable' : 'generic_error'), button('retry', () => location.reload()));
    });
}
window.addEventListener('pagehide', () => { session?.reset(); session = null; root?.replaceChildren(); });
window.addEventListener('pageshow', event => { if (event.persisted && page === 'quiz' && root && bank) renderSetup(); });
