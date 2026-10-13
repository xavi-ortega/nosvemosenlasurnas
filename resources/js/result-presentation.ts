import { profilePosition } from './documented-affinity.ts';
import { relationship } from './matching.ts';
import type { Answers, Bank, Position, ProgrammeProfile, Question, Scale } from './matching.ts';

export type ResultGroup = 'matches' | 'differences' | 'unknowns';
export type ResultRelationship = ReturnType<typeof relationship> | null;
export type ResultCounts = Record<ResultGroup, number>;

export interface ResultDetailRow {
    question: Question;
    answer: Scale;
    position: Position;
    relationship: ResultRelationship;
}

export interface ResultTopicCounts {
    topicId: string;
    numericCount: number;
    counts: ResultCounts;
}

export interface ResultPresentation {
    profileId: string;
    numericCount: number;
    skippedCount: number;
    unsureCount: number;
    axisMaximum: number;
    groups: Record<ResultGroup, ResultDetailRow[]>;
    topics: ResultTopicCounts[];
}

export function presentResult(bank: Bank, answers: Answers, profile: ProgrammeProfile): ResultPresentation {
    const groups: ResultPresentation['groups'] = { matches: [], differences: [], unknowns: [] };
    const topics: ResultTopicCounts[] = bank.topics.map(topic => ({ topicId: topic.id, numericCount: 0, counts: { matches: 0, differences: 0, unknowns: 0 } }));
    const topicsById = new Map(topics.map(topic => [topic.topicId, topic]));
    let numericCount = 0, skippedCount = 0, unsureCount = 0;

    for (const question of bank.questions) {
        const answer = answers[question.id];
        if (answer === 'skip') { skippedCount++; continue; }
        if (answer === 'unsure') { unsureCount++; continue; }
        if (typeof answer !== 'number') continue;

        const position = profilePosition(bank, profile, question.id);
        const relation = position.status === 'derived' && position.value !== null ? relationship(answer, position.value) : null;
        const group: ResultGroup = relation === null ? 'unknowns' : relation === 'same' || relation === 'close' ? 'matches' : 'differences';
        groups[group].push({ question, answer, position, relationship: relation });
        const topic = topicsById.get(question.topicId)!;
        topic.numericCount++;
        topic.counts[group]++;
        numericCount++;
    }

    return { profileId: profile.id, numericCount, skippedCount, unsureCount, axisMaximum: Math.max(0, ...topics.map(topic => topic.numericCount)), groups, topics };
}
