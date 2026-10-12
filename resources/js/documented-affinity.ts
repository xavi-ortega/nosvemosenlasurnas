import { bankForConstituency, similarity } from './matching.ts';
import type { Answers, Bank, Position, Priorities, ProgrammeProfile, Question, Scale } from './matching.ts';

export function profilePosition(bank: Bank, profile: ProgrammeProfile, questionId: string): Position {
    return bank.constituencyPositions?.[profile.constituencyIds[0]]?.[profile.candidacyId]?.[questionId] ?? bank.positions[profile.candidacyId][questionId];
}

export function answerWeights(bank: Bank, answers: Answers, priorities: Priorities = {}): Record<string, number> {
    if (Object.entries(priorities).some(([id, value]) => !bank.topics.some(t => t.id === id) || ![1, 2].includes(value))) throw new Error('Invalid topic importance.');
    if (Object.entries(answers).some(([id, value]) => !bank.questions.some(q => q.id === id) || ![-2, -1, 0, 1, 2, 'skip', 'unsure'].includes(value))) throw new Error('Invalid answer.');
    const weights: Record<string, number> = {};
    for (const topic of bank.topics) {
        const numeric = bank.questions.filter(q => q.topicId === topic.id && typeof answers[q.id] === 'number');
        const families = new Set(numeric.map(q => q.familyId));
        for (const question of numeric) {
            weights[question.id] = topic.budget * (priorities[topic.id] ?? 1) / families.size / numeric.filter(q => q.familyId === question.familyId).length;
        }
    }
    return weights;
}

export function documentedMatch(bank: Bank, answers: Answers, priorities: Priorities = {}) {
    const weights = answerWeights(bank, answers, priorities);
    const questions = bank.questions.filter(q => Object.hasOwn(weights, q.id)).sort((a, b) => a.id.localeCompare(b.id, 'en'));
    const pendingTopicIds = bank.topics.filter(t => !questions.some(q => q.topicId === t.id)).map(t => t.id);
    const denominator = bank.topics.reduce((sum, t) => sum + t.budget * (priorities[t.id] ?? 1), 0);
    const complete = pendingTopicIds.length === 0;
    const rows = (bank.programmeProfiles ?? []).map(profile => {
        let numerator = 0, knownWeight = 0, knownCount = 0;
        for (const q of questions) {
            const position = profilePosition(bank, profile, q.id);
            if (position.status !== 'derived' || position.value === null) continue;
            knownWeight += weights[q.id]; knownCount++;
            numerator += weights[q.id] * similarity(answers[q.id] as Scale, position.value);
        }
        return { id: profile.id, candidacyId: profile.candidacyId, affinity: complete ? 100 * numerator / denominator : null, coverage: complete ? 100 * knownWeight / denominator : null, knownCount };
    });
    rows.sort((a, b) => (b.affinity ?? 0) - (a.affinity ?? 0) || bank.programmeProfiles!.find(p => p.id === a.id)!.name.localeCompare(bank.programmeProfiles!.find(p => p.id === b.id)!.name, 'es') || a.id.localeCompare(b.id, 'en'));
    return { engineVersion: 'documented-affinity-v2' as const, complete, pendingTopicIds, numericCount: questions.length, topicCount: bank.topics.length - pendingTopicIds.length, denominator, weights, rows, maximum: complete ? Math.max(0, ...rows.map(r => r.affinity!)) : null, hasEvidence: rows.some(r => r.knownCount > 0) };
}

export function documentedBlock(bank: Bank, presented: string[], answers: Answers, count = 10): Question[] {
    const ordering = bank.ordering!.questionIds;
    const topicCounts = new Map(bank.topics.map(t => [t.id, presented.filter(id => bank.questions.find(q => q.id === id)?.topicId === t.id).length]));
    const selected: Question[] = [];
    const blockTopicCounts = new Map<string, number>();
    const families = new Set(presented.map(id => bank.questions.find(q => q.id === id)?.familyId));
    while (selected.length < count) {
        const candidates = bank.questions.filter(q => !presented.includes(q.id) && !selected.some(s => s.id === q.id) && !families.has(q.familyId) && (blockTopicCounts.get(q.topicId) ?? 0) < 2 && bank.programmeProfiles!.some(p => profilePosition(bank, p, q.id).status === 'derived'));
        candidates.sort((a, b) => Number(bank.questions.some(q => q.topicId === a.topicId && typeof answers[q.id] === 'number')) - Number(bank.questions.some(q => q.topicId === b.topicId && typeof answers[q.id] === 'number')) || (blockTopicCounts.get(a.topicId) ?? 0) - (blockTopicCounts.get(b.topicId) ?? 0) || (topicCounts.get(a.topicId) ?? 0) - (topicCounts.get(b.topicId) ?? 0) || ordering.indexOf(a.id) - ordering.indexOf(b.id));
        if (!candidates[0]) return [];
        const q = candidates[0]; selected.push(q); families.add(q.familyId); blockTopicCounts.set(q.topicId, (blockTopicCounts.get(q.topicId) ?? 0) + 1);
    }
    return blockTopicCounts.size >= 5 ? selected : [];
}

export function verifyProfileScope(bank: Bank): boolean {
    return bank.programmeProfiles!.every(profile => profile.constituencyIds.every(scope => JSON.stringify(bankForConstituency(bank, scope).positions[profile.candidacyId]) === JSON.stringify(bankForConstituency(bank, profile.constituencyIds[0]).positions[profile.candidacyId])));
}
