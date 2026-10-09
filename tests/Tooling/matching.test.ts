import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parseBank, weights, match, balanced, followups, similarity } from '../../resources/js/matching.ts';
import type { Answers, Bank } from '../../resources/js/matching.ts';
const pointer = JSON.parse(readFileSync('resources/evidence/current.json', 'utf8'));
const bank = parseBank(JSON.parse(readFileSync(`resources/evidence/${pointer.sha256}.json`, 'utf8')));
const cohort = ['alpha', 'beta', 'gamma'];
const answers: Answers = Object.fromEntries(balanced(bank).map(q => [q.id, 2]));

test('exact arithmetic, fixed family budgets and neutral/skip semantics', () => {
    assert.equal(similarity(-2, 2), 0); assert.equal(similarity(0, 2), 0.5);
    const w = weights(bank); assert.equal(w['housing-1'], 0.25);
    const result = match(bank, answers, {}, cohort);
    assert.equal(result.comparable, true); assert.equal(result.sharedCount, 10);
    assert.equal(result.rows.find(r => r.id === 'alpha')?.index, 70);
    const neutral = match(bank, { ...answers, 'climate-1': 0 }, {}, cohort);
    assert.equal(neutral.numericCount, 10);
    assert.equal(match(bank, { ...answers, 'climate-1': 'unsure' }, {}, cohort).numericCount, 9);
});
test('missing candidacies prevent ranking and retain independent partial coverage', () => {
    const result = match(bank, answers);
    assert.equal(result.comparable, false); assert.equal(result.sharedCoverage, 0);
    assert.equal(result.rows.find(r => r.id === 'delta')?.partialIndex, null);
    assert.equal(result.rows.find(r => r.id === 'delta')?.coverage, 0);
});
test('zero priorities and unknown answers do not manufacture neutral scores', () => {
    const result = match(bank, answers, Object.fromEntries(bank.topics.map(t => [t.id, 0])), cohort);
    assert.equal(result.numericCount, 0); assert.ok(result.rows.every(r => r.partialIndex === null));
    assert.throws(() => match(bank, { alien: 2 }));
    assert.throws(() => weights(bank, { housing: 4 } as never));
});
test('party names/order and question permutations preserve numeric results and selector', () => {
    const copy = structuredClone(bank); copy.candidacies.reverse(); copy.questions.reverse(); copy.candidacies.forEach(c => c.name = 'renamed');
    assert.deepEqual(match(copy, answers, {}, cohort), match(bank, answers, {}, cohort));
    assert.deepEqual(balanced(copy).map(q => q.id), balanced(bank).map(q => q.id));
    assert.deepEqual(followups(copy, answers, Object.keys(answers), {}, cohort).map(q => q.id), followups(bank, answers, Object.keys(answers), {}, cohort).map(q => q.id));
});
test('starters cover five topics/ten families; continuations exclude seen and cap families', () => {
    const start = balanced(bank); assert.equal(start.length, 10); assert.equal(new Set(start.map(q => q.topicId)).size, 5); assert.equal(new Set(start.map(q => q.familyId)).size, 10);
    const more = followups(bank, answers, start.map(q => q.id), {}, cohort); assert.equal(more.length, 5);
    assert.ok(more.every(q => !start.some(previous => previous.id === q.id)));
    assert.equal(followups(bank, answers, bank.questions.map(q => q.id), {}, cohort).length, 0);
});
test('evidence scope/version/unsafe URLs and unsupported numeric values fail closed', () => {
    for (const change of [(b: Bank) => { b.documents[0].electionId = 'other'; }, (b: Bank) => { b.documents[0].url = 'javascript:alert(1)'; }, (b: Bank) => { b.positions.alpha['housing-1'].value = 3 as never; }, (b: Bank) => { b.positions.alpha['housing-1'].citations = []; }]) {
        const copy = structuredClone(bank); change(copy); assert.throws(() => parseBank(copy));
    }
});
test('pure engine does not mutate inputs; more answers can reduce overlap', () => {
    const before = JSON.stringify(bank); match(bank, answers, {}, cohort); followups(bank, answers, Object.keys(answers), {}, cohort); assert.equal(JSON.stringify(bank), before);
    const perfect: Answers = Object.fromEntries(bank.questions.slice(0, 8).map(q => [q.id, bank.positions.alpha[q.id].value!]));
    assert.equal(match(bank, perfect, {}, cohort).rows.find(r => r.id === 'alpha')?.partialIndex, 100);
    perfect[bank.questions[8].id] = bank.positions.alpha[bank.questions[8].id].value === 2 ? -2 : 2;
    assert.ok(match(bank, perfect, {}, cohort).rows.find(r => r.id === 'alpha')!.partialIndex! < 100);
});

import { Questionnaire } from '../../resources/js/questionnaire.ts';
test('state machine requires deliberate finish and never reveals at ten, extension or exhaustion', () => {
    const q = new Questionnaire(bank, pointer.sha256, 'north');
    assert.throws(() => q.export());
    for (let i = 0; i < 10; i++) { assert.ok(q.current()); q.answer(i % 2 === 0 ? 2 : 'skip'); }
    assert.equal(q.current(), undefined); assert.equal(q.presented.length, 10); assert.equal(q.revealed, false);
    assert.equal(q.extend(), true);
    for (let i = 0; i < 5; i++) q.answer('unsure');
    assert.equal(q.presented.length, 15); assert.equal(q.revealed, false);
    q.finish(); assert.equal(q.revealed, true); assert.equal(Object.keys(q.export().answers).length, 15);
    q.edit(q.presented[0], -2); assert.equal(q.revealed, false); assert.throws(() => q.export());
    q.extend(); for (let i = 0; i < 5; i++) q.answer(0);
    assert.equal(q.extend(), false); assert.equal(q.revealed, false);
    q.reset(); assert.deepEqual(q.answers, {}); assert.deepEqual(q.priorities, {}); assert.equal(q.cohort.length, 0); assert.equal(q.presented.length, 0);
});
test('session freezes bank and exports the pinned release even if outside bank changes', () => {
    const copy = structuredClone(bank); const q = new Questionnaire(copy, pointer.sha256, 'north');
    copy.candidacies[0].name = 'outside change'; assert.notEqual(q.bank.candidacies[0].name, 'outside change');
    assert.throws(() => { q.bank.questions[0].text = 'mutation'; });
    q.current(); q.answer(2); q.finish(); assert.equal(q.export().releaseHash, pointer.sha256);
});
