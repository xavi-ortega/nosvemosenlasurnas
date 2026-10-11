import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parseBank, weights, match, balanced, followups, similarity, relationship } from '../../resources/js/matching.ts';
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


test('all five rent answers preserve direction independently of aggregate overlap', () => {
    const expected = [0, 0.25, 0.5, 0.75, 1];
    for (const [i, value] of ([-2, -1, 0, 1, 2] as const).entries()) {
        assert.equal(similarity(value, 2), expected[i]);
    }
    assert.equal(relationship(-2, 2), 'opposed');
    assert.equal(relationship(-1, 1), 'opposed');
    assert.equal(relationship(0, 2), 'different');
    assert.equal(relationship(1, 2), 'close');
    assert.equal(relationship(2, 2), 'same');
    const mixed: Answers = { ...answers, 'housing-2': -2 };
    const result = match(bank, mixed, {}, cohort);
    assert.equal(result.rows.find(r => r.id === 'alpha')?.index, 60);
    assert.equal(relationship(mixed['housing-2'] as -2, bank.positions.alpha['housing-2'].value!), 'opposed');
    assert.equal(match(bank, { 'housing-2': -2 }, {}, cohort).rows.find(r => r.id === 'alpha')?.partialIndex, 0);
});


test('back and edited answers preserve the selected questions across five-question blocks', () => {
    const q = new Questionnaire(bank, pointer.sha256, 'north');
    const first = q.current()!.id;
    assert.equal(q.previous(), false);
    assert.deepEqual(q.progress(), { current: 1, total: 10 });
    q.answer(2);
    const second = q.current()!.id;
    q.answer('skip');
    assert.equal(q.previous(), true);
    assert.equal(q.current()!.id, second);
    assert.equal(q.answers[second], 'skip');
    assert.equal(q.previous(), true);
    assert.equal(q.current()!.id, first);
    q.answer(-2);
    assert.equal(q.current()!.id, second);
    assert.equal(q.answers[first], -2);
    for (let i = 0; i < 9; i++) q.answer(1);
    const initial = [...q.presented];
    assert.equal(q.extend(), true);
    const followup = q.current()!.id;
    assert.deepEqual(q.progress(), { current: 11, total: 15 });
    assert.equal(q.previous(), true);
    assert.equal(q.current()!.id, initial[9]);
    q.answer(-1);
    assert.equal(q.current()!.id, followup);
    assert.deepEqual(q.presented, [...initial, followup]);
    for (let i = 0; i < 5; i++) q.answer('unsure');
    q.finish();
    assert.equal(Object.keys(q.export().answers).length, 15);
    q.previous();
    assert.equal(q.revealed, false);
    assert.throws(() => q.export());
});

test('optional blocks stop at thirty even when a larger fixture bank has useful questions', () => {
    const copy = structuredClone(bank);
    for (let i = 0; i < 30; i++) {
        const question = { ...copy.questions[0], id: `extra-${i}`, familyId: `extra-family-${i}` };
        copy.questions.push(question);
        for (const c of copy.candidacies) copy.positions[c.id][question.id] = structuredClone(copy.positions[c.id]['housing-1']);
    }
    const q = new Questionnaire(copy, pointer.sha256, 'north');
    for (let i = 0; i < 10; i++) q.answer(2);
    for (let block = 0; block < 4; block++) {
        assert.equal(q.extend(), true);
        for (let i = 0; i < 5; i++) q.answer(2);
    }
    assert.equal(q.presented.length, 30);
    assert.equal(new Set(q.presented).size, 30);
    assert.equal(q.extend(), false);
    assert.equal(q.revealed, false);
});

test('optional authored help is bounded text and does not alter scoring', () => {
    const copy = structuredClone(bank);
    copy.questions[0].help = 'Ayuda ficticia de prueba.';
    assert.deepEqual(match(parseBank(copy), answers, {}, cohort), match(bank, answers, {}, cohort));
    for (const invalid of ['', '\u0000', 'x'.repeat(1201)]) {
        copy.questions[0].help = invalid;
        assert.throws(() => parseBank(copy));
    }
});

test('fewer than five unseen questions do not create a partial extension or reveal results', () => {
    const copy = structuredClone(bank);
    const retained = new Set(copy.questions.slice(0, 13).map(question => question.id));
    copy.questions = copy.questions.filter(question => retained.has(question.id));
    for (const candidate of copy.candidacies) {
        copy.positions[candidate.id] = Object.fromEntries(Object.entries(copy.positions[candidate.id]).filter(([id]) => retained.has(id)));
    }
    const q = new Questionnaire(copy, pointer.sha256, 'north');
    for (let i = 0; i < 10; i++) q.answer(2);
    const presented = [...q.presented];
    const saved = { ...q.answers };

    assert.equal(q.extend(), false);
    assert.equal(q.current(), undefined);
    assert.deepEqual(q.presented, presented);
    assert.deepEqual(q.answers, saved);
    assert.equal(q.progress().total, 10);
    assert.equal(q.revealed, false);
    assert.throws(() => q.export());
});


test('authored ten-question starters stay fixed when the bank grows or changes order', () => {
    const copy = structuredClone(bank);
    const expected = ['institutions-2', 'institutions-1', 'climate-2', 'climate-1', 'services-2', 'services-1', 'economy-2', 'economy-1', 'housing-2', 'housing-1'];
    copy.starterQuestionIds = expected;
    for (const [index, topic] of copy.topics.entries()) {
        const added = { ...copy.questions[0], id: `a-extra-${index}`, familyId: `added-family-${index}`, topicId: topic.id };
        copy.questions.unshift(added);
        for (const candidate of copy.candidacies) copy.positions[candidate.id][added.id] = structuredClone(copy.positions[candidate.id]['housing-1']);
    }
    copy.questions.reverse();

    const selected = balanced(parseBank(copy));
    const unseen = followups(copy, {}, expected, {}, cohort);

    assert.deepEqual(selected.map(question => question.id), expected);
    assert.equal(new Set(selected.map(question => question.topicId)).size, 5);
    assert.equal(unseen.length, 5);
    assert.ok(unseen.every(question => !expected.includes(question.id)));
});

test('missing duplicate specific or unbalanced authored starters fail closed', () => {
    const valid = ['housing-1', 'housing-2', 'economy-1', 'economy-2', 'services-1', 'services-2', 'climate-1', 'climate-2', 'institutions-1', 'institutions-2'];
    for (const changed of ['short', 'duplicate', 'missing', 'topic', 'family', 'specific']) {
        const copy = structuredClone(bank);
        copy.starterQuestionIds = [...valid];
        if (changed === 'short') copy.starterQuestionIds.pop();
        if (changed === 'duplicate') copy.starterQuestionIds[0] = copy.starterQuestionIds[1];
        if (changed === 'missing') copy.starterQuestionIds[0] = 'absent-question';
        if (changed === 'topic') copy.starterQuestionIds.splice(6, 2, 'housing-3', 'housing-4');
        if (changed === 'family') copy.questions.find(q => q.id === 'housing-2')!.familyId = copy.questions.find(q => q.id === 'housing-1')!.familyId;
        if (changed === 'specific') copy.questions.find(q => q.id === 'housing-1')!.level = 'specific';

        assert.throws(() => parseBank(copy), changed);
    }
});


test('continuations require scored evidence from at least one eligible candidacy', () => {
    const selected = balanced(bank).map(q => q.id);

    assert.deepEqual(followups(bank, answers, selected, {}, ['delta']), []);
    assert.equal(followups(bank, answers, selected, {}, ['alpha']).length, 5);
});
