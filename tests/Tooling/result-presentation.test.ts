import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { documentedMatch } from '../../resources/js/documented-affinity.ts';
import { parseBank } from '../../resources/js/matching.ts';
import type { Answer, Answers, Position, Scale } from '../../resources/js/matching.ts';
import { Questionnaire } from '../../resources/js/questionnaire.ts';
import { presentResult } from '../../resources/js/result-presentation.ts';

const real = parseBank(JSON.parse(readFileSync('outputs/quiz-2023-second-iteration-bank.json', 'utf8')));

function example(rows: { answer?: Answer; value: Scale | null; status?: Position['status']; topic?: string; family?: string }[]) {
    const bank = structuredClone(real);
    const profile = bank.programmeProfiles![0];
    bank.programmeProfiles = [profile];
    bank.constituencyPositions = undefined;
    bank.topics = [...new Set(rows.map(row => row.topic ?? 'housing'))].map(id => ({ id, name: id, budget: 1 }));
    bank.questions = rows.map((row, index) => ({ id: 'example-' + index, topicId: row.topic ?? 'housing', familyId: row.family ?? 'family-' + index, text: 'Example ' + index, level: 'general' }));
    bank.positions[profile.candidacyId] = Object.fromEntries(rows.map((row, index) => [bank.questions[index].id, { status: row.status ?? (row.value === null ? 'unknown' : 'derived'), value: row.value, citations: [] }]));
    const answers: Answers = {};
    for (const [index, row] of rows.entries()) if (row.answer !== undefined) answers[bank.questions[index].id] = row.answer;
    return { bank, profile, answers };
}

test('numeric answers form three complete groups while preserving exact, close, opposed and missing distinctions', () => {
    const { bank, profile, answers } = example([
        { answer: 2, value: 2 },
        { answer: 2, value: 1 },
        { answer: -1, value: 1, topic: 'health' },
        { answer: 0, value: 1, topic: 'health' },
        { answer: 0, value: 2, topic: 'health' },
        { answer: 2, value: null, topic: 'energy' },
        { answer: 2, value: null, status: 'conflicting', topic: 'energy' },
        { answer: 2, value: null, status: 'derived', topic: 'energy' },
        { answer: 'skip', value: 2 },
        { answer: 'unsure', value: 2, topic: 'energy' },
        { value: 2 },
    ]);

    const result = presentResult(bank, answers, profile);

    assert.equal(result.numericCount, 8);
    assert.equal(result.skippedCount, 1);
    assert.equal(result.unsureCount, 1);
    assert.equal(result.axisMaximum, 3);
    assert.deepEqual(result.groups.matches.map(row => [row.question.id, row.answer, row.relationship]), [['example-0', 2, 'same'], ['example-1', 2, 'close'], ['example-3', 0, 'close']]);
    assert.deepEqual(result.groups.differences.map(row => [row.question.id, row.relationship]), [['example-2', 'opposed'], ['example-4', 'different']]);
    assert.deepEqual(result.groups.unknowns.map(row => [row.question.id, row.relationship, row.position.status]), [['example-5', null, 'unknown'], ['example-6', null, 'conflicting'], ['example-7', null, 'derived']]);
    assert.deepEqual(result.topics, [
        { topicId: 'housing', numericCount: 2, counts: { matches: 2, differences: 0, unknowns: 0 } },
        { topicId: 'health', numericCount: 3, counts: { matches: 1, differences: 2, unknowns: 0 } },
        { topicId: 'energy', numericCount: 3, counts: { matches: 0, differences: 0, unknowns: 3 } },
    ]);
});

test('twenty skipped or unsure answers leave every topic without a numeric count or a fabricated axis', () => {
    const answers: Answers = Object.fromEntries(real.starterQuestionIds!.map((id, index) => [id, index % 2 ? 'skip' : 'unsure']));

    const result = presentResult(real, answers, real.programmeProfiles![0]);

    assert.equal(result.numericCount, 0);
    assert.equal(result.skippedCount, 10);
    assert.equal(result.unsureCount, 10);
    assert.equal(result.axisMaximum, 0);
    assert.deepEqual(result.groups, { matches: [], differences: [], unknowns: [] });
    assert.deepEqual(result.topics, real.topics.map(topic => ({ topicId: topic.id, numericCount: 0, counts: { matches: 0, differences: 0, unknowns: 0 } })));
});

test('all real formation panels share the answer axis and preserve the pinned score, export and evidence', () => {
    const session = new Questionnaire(real, 'test-hash');
    while (session.current()) session.answer(session.current()!.id === 'rent-price-cap' ? -2 : 2);
    session.finish();
    const before = session.export();
    const original = JSON.stringify({ bank: session.bank, answers: session.answers });

    const panels = session.bank.programmeProfiles!.map(profile => presentResult(session.bank, session.answers, profile));

    assert.equal(panels.length, 59);
    assert.ok(panels.every(panel => panel.axisMaximum === 2 && panel.numericCount === 20));
    for (const panel of panels) {
        assert.equal(panel.groups.matches.length + panel.groups.differences.length + panel.groups.unknowns.length, 20);
        assert.ok(panel.topics.every(topic => topic.numericCount === 2 && topic.counts.matches + topic.counts.differences + topic.counts.unknowns === 2));
    }
    const sumar = panels.find(panel => panel.profileId === 'boe-2023-004-p1')!;
    const pp = panels.find(panel => panel.profileId === 'boe-2023-001-p1')!;
    assert.deepEqual([sumar.groups.matches.length, sumar.groups.differences.length, sumar.groups.unknowns.length], [13, 2, 5]);
    assert.deepEqual([pp.groups.matches.length, pp.groups.differences.length, pp.groups.unknowns.length], [7, 1, 12]);
    assert.equal(sumar.groups.differences.find(row => row.question.id === 'rent-price-cap')!.relationship, 'opposed');
    assert.deepEqual(sumar.groups.differences.find(row => row.question.id === 'rent-price-cap')!.position.citations, real.positions['boe-2023-004']['rent-price-cap'].citations);
    assert.equal(pp.groups.unknowns.find(row => row.question.id === 'rent-price-cap')!.position.value, null);
    assert.deepEqual(session.export(), before);
    assert.equal(JSON.stringify({ bank: session.bank, answers: session.answers }), original);
});

test('a close and an exact response count as two matches even with 87.5 percent weighted similarity', () => {
    const { bank, profile, answers } = example([{ answer: 2, value: 2 }, { answer: 2, value: 1 }]);

    const result = presentResult(bank, answers, profile);

    assert.deepEqual(result.topics[0].counts, { matches: 2, differences: 0, unknowns: 0 });
    assert.deepEqual(result.groups.matches.map(row => row.relationship), ['same', 'close']);
    assert.equal(documentedMatch(bank, answers).rows[0].affinity, 87.5);
});

test('counts represent answers rather than families or weighted information coverage', () => {
    const { bank, profile, answers } = example([
        { answer: 2, value: 2, family: 'shared' },
        { answer: 2, value: 2, family: 'shared' },
        { answer: 2, value: null, status: 'conflicting' },
        { answer: 2, value: null, topic: 'health' },
    ]);

    const result = presentResult(bank, answers, profile);

    assert.deepEqual(result.topics, [
        { topicId: 'housing', numericCount: 3, counts: { matches: 2, differences: 0, unknowns: 1 } },
        { topicId: 'health', numericCount: 1, counts: { matches: 0, differences: 0, unknowns: 1 } },
    ]);
    assert.equal(result.axisMaximum, 3);
    assert.equal(documentedMatch(bank, answers).rows[0].affinity, 25);
    assert.equal(documentedMatch(bank, answers, { housing: 2 }).rows[0].affinity, 100 / 3);
    assert.deepEqual(presentResult(bank, answers, profile), result);
});

test('detail positions use the profile scope rather than the unscoped position table', () => {
    const { bank, profile, answers } = example([{ answer: 2, value: 2 }]);
    bank.programmePolicy = undefined;
    bank.constituencyPositions = { [profile.constituencyIds[0]]: { [profile.candidacyId]: { 'example-0': { status: 'derived', value: -2, citations: [] } } } };

    const result = presentResult(bank, answers, profile);

    assert.equal(result.groups.matches.length, 0);
    assert.equal(result.groups.differences[0].relationship, 'opposed');
    assert.equal(result.groups.differences[0].position.value, -2);
    assert.equal(bank.positions[profile.candidacyId]['example-0'].value, 2);
});
