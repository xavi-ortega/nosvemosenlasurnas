export type Scale = -2 | -1 | 0 | 1 | 2;
export type Answer = Scale | 'unsure' | 'skip';
export type Answers = Record<string, Answer>;
export type Priorities = Record<string, 0 | 1 | 2>;
export interface Question { id: string; topicId: string; familyId: string; text: string; level: 'general' | 'specific' }
export interface Citation { documentId: string; start: number; end: number; quote: string; context: string; locator: { page: number; line: number } }
export interface Position { status: 'derived' | 'unknown' | 'conflicting'; value: Scale | null; citations: Citation[]; rationale?: string }
export interface Bank {
    schemaVersion: 1; engineVersion: 'lean-fixed-budgets-v1'; compilerVersion: string; kind: 'synthetic' | 'historical' | 'current'; asOf: string;
    election: { id: string; name: string; date: string; constituencies: { id: string; name: string }[] };
    topics: { id: string; name: string; budget: number }[]; questions: Question[];
    candidacies: { id: string; name: string; constituencyIds: string[] }[];
    documents: { id: string; candidacyId: string; electionId: string; kind: Bank['kind']; url: string; sha256: string; textSha256: string; publishedAt: string | null; retrievedAt: string; validFrom: string; validUntil: string; extraction: string }[];
    positions: Record<string, Record<string, Position>>; interpretation: string; limitations: string[];
}
const idPattern = /^[a-z][a-z0-9_-]{0,63}$/;
const isScale = (value: unknown): value is Scale => Number.isInteger(value) && typeof value === 'number' && value >= -2 && value <= 2;
const ensure = (condition: unknown): void => { if (!condition) throw new Error('Invalid public evidence contract.'); };
const unique = (ids: string[]): boolean => ids.length > 0 && new Set(ids).size === ids.length && ids.every(id => typeof id === 'string' && idPattern.test(id));
const safeText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0 && !Array.from(value).some(char => { const code = char.charCodeAt(0); return code <= 8 || code === 11 || (code >= 14 && code <= 31); });
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function parseBank(value: unknown): Bank {
    try {
        const b = value as Bank;
        ensure(b && b.schemaVersion === 1 && b.engineVersion === 'lean-fixed-budgets-v1' && ['synthetic', 'historical', 'current'].includes(b.kind));
        ensure(safeText(b.election.name) && idPattern.test(b.election.id) && datePattern.test(b.election.date) && datePattern.test(b.asOf));
        ensure(Array.isArray(b.topics) && Array.isArray(b.questions) && b.questions.length <= 1000 && Array.isArray(b.candidacies) && b.candidacies.length <= 100);
        ensure(unique(b.topics.map(t => t.id)) && unique(b.questions.map(q => q.id)) && unique(b.candidacies.map(c => c.id)) && unique(b.election.constituencies.map(c => c.id)));
        ensure(b.topics.every(t => safeText(t.name) && Number.isFinite(t.budget) && t.budget > 0 && t.budget <= 100));
        const familyTopics = new Map<string, string>();
        for (const q of b.questions) {
            ensure(b.topics.some(t => t.id === q.topicId) && idPattern.test(q.familyId) && safeText(q.text) && q.text.length <= 400 && ['general', 'specific'].includes(q.level));
            ensure(!familyTopics.has(q.familyId) || familyTopics.get(q.familyId) === q.topicId);
            familyTopics.set(q.familyId, q.topicId);
        }
        ensure(Array.isArray(b.documents) && new Set(b.documents.map(d => d.id)).size === b.documents.length);
        for (const d of b.documents) {
            const url = new URL(d.url);
            ensure(idPattern.test(d.id) && url.protocol === 'https:' && !url.username && !url.password && !/[<>\s]/.test(d.url));
            ensure(d.electionId === b.election.id && d.kind === b.kind && b.candidacies.some(c => c.id === d.candidacyId));
            ensure(/^[a-f0-9]{64}$/.test(d.sha256) && /^[a-f0-9]{64}$/.test(d.textSha256) && datePattern.test(d.validFrom) && datePattern.test(d.validUntil) && d.validFrom <= b.asOf && b.asOf <= d.validUntil);
            ensure(!Object.hasOwn(d, 'text'));
        }
        ensure(Object.keys(b.positions).length === b.candidacies.length);
        for (const c of b.candidacies) {
            ensure(safeText(c.name) && c.constituencyIds.length > 0 && c.constituencyIds.every(id => b.election.constituencies.some(s => s.id === id)));
            const map = b.positions[c.id];
            ensure(Object.keys(map).length === b.questions.length);
            for (const q of b.questions) {
                const p = map[q.id];
                ensure(p && ['derived', 'unknown', 'conflicting'].includes(p.status) && Array.isArray(p.citations));
                ensure(p.rationale === undefined || safeText(p.rationale));
                ensure(p.status === 'derived' ? isScale(p.value) && p.citations.length > 0 : p.value === null);
                for (const citation of p.citations) {
                    const d = b.documents.find(d => d.id === citation.documentId);
                    ensure(d && d.candidacyId === c.id && safeText(citation.quote) && safeText(citation.context) && citation.context.includes(citation.quote));
                    ensure(Number.isInteger(citation.start) && Number.isInteger(citation.end) && citation.start >= 0 && citation.end > citation.start && Number.isInteger(citation.locator.page) && citation.locator.page > 0 && Number.isInteger(citation.locator.line) && citation.locator.line > 0);
                }
            }
        }
        ensure(safeText(b.interpretation) && Array.isArray(b.limitations) && b.limitations.every(safeText));
        return b;
    } catch {
        throw new Error('Invalid public evidence contract.');
    }
}

export function weights(bank: Bank, priorities: Priorities = {}): Record<string, number> {
    ensure(Object.keys(priorities).every(id => bank.topics.some(t => t.id === id) && [0, 1, 2].includes(priorities[id])));
    const result: Record<string, number> = {};
    for (const topic of bank.topics) {
        const families = [...new Set(bank.questions.filter(q => q.topicId === topic.id).map(q => q.familyId))];
        for (const family of families) {
            const items = bank.questions.filter(q => q.familyId === family);
            for (const q of items) result[q.id] = topic.budget * (priorities[topic.id] ?? 1) / families.length / items.length;
        }
    }
    return result;
}
export const similarity = (answer: Scale, position: Scale): number => 1 - Math.abs(answer - position) / 4;
const known = (bank: Bank, candidacyId: string, qid: string): boolean => bank.positions[candidacyId][qid].status === 'derived' && isScale(bank.positions[candidacyId][qid].value);

export function match(bank: Bank, answers: Answers, priorities: Priorities = {}, cohort = bank.candidacies.map(c => c.id)) {
    ensure(unique(cohort) && cohort.every(id => bank.candidacies.some(c => c.id === id)));
    ensure(Object.entries(answers).every(([id, value]) => bank.questions.some(q => q.id === id) && (isScale(value) || value === 'skip' || value === 'unsure')));
    const w = weights(bank, priorities);
    const answered = bank.questions.filter(q => isScale(answers[q.id]) && w[q.id] > 0).sort((a, b) => a.id.localeCompare(b.id, 'en'));
    const common = answered.filter(q => cohort.every(id => known(bank, id, q.id)));
    const sum = (items: Question[]) => items.reduce((total, q) => total + w[q.id], 0);
    const answeredWeight = sum(answered), sharedWeight = sum(common);
    const sharedCoverage = answeredWeight > 0 ? sharedWeight / answeredWeight : 0;
    const comparable = cohort.length >= 2 && common.length >= 8 && new Set(common.map(q => q.topicId)).size >= 4 && sharedCoverage >= 0.6;
    const index = (id: string, items: Question[]): number | null => sum(items) > 0 ? 100 * items.reduce((total, q) => total + w[q.id] * similarity(answers[q.id] as Scale, bank.positions[id][q.id].value as Scale), 0) / sum(items) : null;
    const rows = cohort.map(id => {
        const evidence = answered.filter(q => known(bank, id, q.id));
        return { id, index: comparable ? index(id, common) : null, partialIndex: index(id, evidence), coverage: answeredWeight > 0 ? sum(evidence) / answeredWeight : 0, knownCount: evidence.length };
    });
    rows.sort(comparable ? (a, b) => (b.index! - a.index!) || a.id.localeCompare(b.id, 'en') : (a, b) => a.id.localeCompare(b.id, 'en'));
    return { comparable, rows, sharedCoverage, sharedCount: common.length, numericCount: answered.length, topicCount: new Set(common.map(q => q.topicId)).size, commonIds: common.map(q => q.id), cohort: [...cohort] };
}

export function balanced(bank: Bank, excluded: string[] = [], count = 10): Question[] {
    const selected: Question[] = [];
    const seen = new Set(excluded);
    const familyCounts = new Map<string, number>();
    for (const id of excluded) {
        const q = bank.questions.find(q => q.id === id);
        if (q) familyCounts.set(q.familyId, (familyCounts.get(q.familyId) ?? 0) + 1);
    }
    const topics = [...bank.topics].sort((a, b) => a.id.localeCompare(b.id, 'en'));
    while (selected.length < count) {
        let progressed = false;
        for (const topic of topics) {
            const candidates = bank.questions.filter(q => q.topicId === topic.id && !seen.has(q.id) && (familyCounts.get(q.familyId) ?? 0) < 2);
            candidates.sort((a, b) => (familyCounts.get(a.familyId) ?? 0) - (familyCounts.get(b.familyId) ?? 0) || Number(a.level === 'specific') - Number(b.level === 'specific') || a.id.localeCompare(b.id, 'en'));
            if (candidates[0] && selected.length < count) {
                const q = candidates[0]; selected.push(q); seen.add(q.id); familyCounts.set(q.familyId, (familyCounts.get(q.familyId) ?? 0) + 1); progressed = true;
            }
        }
        if (!progressed) break;
    }
    return selected;
}

export function followups(bank: Bank, answers: Answers, presented: string[], priorities: Priorities = {}, cohort?: string[], count = 5): Question[] {
    try {
        const started = performance.now();
        const result = match(bank, answers, priorities, cohort);
        const top = result.rows[0]?.index;
        const close = result.comparable ? result.rows.filter(r => top! - r.index! <= 10).map(r => r.id) : result.cohort;
        const w = weights(bank, priorities);
        const numeric = bank.questions.filter(q => isScale(answers[q.id]) && w[q.id] > 0);
        const seen = new Set(presented);
        const selected: Question[] = [];
        const familyCount = (id: string) => [...seen].filter(qid => bank.questions.find(q => q.id === qid)?.familyId === id).length;
        while (selected.length < count) {
            const candidates = bank.questions.filter(q => !seen.has(q.id) && w[q.id] > 0 && familyCount(q.familyId) < 2);
            const score = (q: Question): number => {
                const topic = bank.questions.filter(item => item.topicId === q.topicId);
                const total = topic.reduce((n, item) => n + w[item.id], 0);
                const answered = numeric.filter(item => item.topicId === q.topicId).reduce((n, item) => n + w[item.id], 0);
                const values = close.every(id => known(bank, id, q.id)) ? close.map(id => bank.positions[id][q.id].value as number) : [];
                const spread = values.length > 1 ? (Math.max(...values) - Math.min(...values)) / 4 : 0;
                return (priorities[q.topicId] ?? 1) * (0.6 * (total > 0 ? 1 - answered / total : 0) + 0.4 * spread) / (q.level === 'general' ? 1 : 1.5);
            };
            const uncovered = (q: Question, family: boolean) => Number(numeric.some(item => family ? item.familyId === q.familyId : item.topicId === q.topicId));
            candidates.sort((a, b) => uncovered(a, false) - uncovered(b, false) || uncovered(a, true) - uncovered(b, true) || score(b) - score(a) || a.id.localeCompare(b.id, 'en'));
            if (!candidates[0]) break;
            selected.push(candidates[0]); seen.add(candidates[0].id);
            if (performance.now() - started > 50) return balanced(bank, presented, count).filter(q => w[q.id] > 0);
        }
        return selected;
    } catch {
        return balanced(bank, presented, count);
    }
}
