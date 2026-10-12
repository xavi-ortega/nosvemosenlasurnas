import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parseBank } from '../../resources/js/matching.ts';
import type { Answers, Bank } from '../../resources/js/matching.ts';
import { answerWeights, documentedBlock, documentedMatch, profilePosition, verifyProfileScope } from '../../resources/js/documented-affinity.ts';
import { Questionnaire } from '../../resources/js/questionnaire.ts';

const real = parseBank(JSON.parse(readFileSync('outputs/quiz-2023-second-iteration-bank.json', 'utf8')));

test('two exact matches and three unknowns with equal weights give 40 percent affinity and coverage', () => {
    const bank = structuredClone(real);
    bank.topics = [{ id: 'housing', name: 'Vivienda', budget: 1 }];
    bank.questions = bank.questions.slice(0, 5).map(q => ({ ...q, topicId: 'housing' }));
    bank.programmeProfiles = [bank.programmeProfiles![0]];
    const id = bank.programmeProfiles[0].candidacyId;
    bank.constituencyPositions = undefined;
    const answers: Answers = {};
    for (const [i, q] of bank.questions.entries()) {
        answers[q.id] = 2;
        bank.positions[id][q.id] = i < 2 ? { ...bank.positions[id][q.id], status: 'derived', value: 2 } : { status: 'unknown', value: null, citations: [] };
    }
    const result = documentedMatch(bank, answers);
    assert.equal(result.rows[0].affinity, 40);
    assert.equal(result.rows[0].coverage, 40);
    assert.equal(result.denominator, 1);
});

test('family and importance budgets use numeric answers and include all absent party positions', () => {
    const bank = structuredClone(real);
    bank.topics = [{ id: 'housing', name: 'Vivienda', budget: 1 }, { id: 'health', name: 'Sanidad', budget: 1 }];
    bank.questions = bank.questions.slice(0, 4).map((q, i) => ({ ...q, topicId: i === 3 ? 'health' : 'housing', familyId: i < 2 ? 'shared-family' : 'family-' + i }));
    const answers = Object.fromEntries(bank.questions.map(q => [q.id, 2])) as Answers;
    const weights = answerWeights(bank, answers, { housing: 2 });
    assert.deepEqual(Object.values(weights), [0.5, 0.5, 1, 1]);
    assert.throws(() => answerWeights(bank, answers, { housing: 0 }));
    const id = bank.programmeProfiles![0].candidacyId;
    bank.programmeProfiles = [bank.programmeProfiles![0]]; bank.constituencyPositions = undefined;
    bank.positions[id] = Object.fromEntries(bank.questions.map((q, i) => [q.id, i < 2 ? { status: 'derived', value: 2, citations: [] } : { status: i === 2 ? 'conflicting' : 'unknown', value: null, citations: [] }])) as Bank['positions'][string];
    const result = documentedMatch(bank, answers, { housing: 2 });
    assert.equal(result.denominator, 3);
    assert.equal(result.rows[0].affinity, 100 / 3);
    assert.equal(result.rows[0].coverage, 100 / 3);
});

test('user uncertainty in a whole topic leaves every global percentage pending', () => {
    const answers = Object.fromEntries(real.starterQuestionIds!.map(id => [id, real.questions.find(q => q.id === id)!.topicId === 'pensions' ? 'skip' : 2])) as Answers;
    const result = documentedMatch(real, answers);
    assert.equal(result.complete, false);
    assert.deepEqual(result.pendingTopicIds, ['pensions']);
    assert.equal(result.maximum, null);
    assert.ok(result.rows.every(r => r.affinity === null && r.coverage === null));
});

test('every real formation appears once and covers exactly its proclaimed 23J Congress ballots', () => {
    const registry = JSON.parse(readFileSync('outputs/2023-candidacy-registry.json', 'utf8')) as { records: { id: string; status: string; resultDenominationId: string }[] };

    assert.equal(real.candidacies.length, 59);
    assert.equal(real.programmeProfiles!.length, 59);
    assert.equal(new Set(real.programmeProfiles!.map(p => p.candidacyId)).size, 59);
    assert.equal(real.programmeProfiles!.reduce((sum, p) => sum + p.constituencyIds.length, 0), 550);
    assert.equal(real.programmePolicy, 'common-election-programme-v1');
    assert.equal(real.constituencyPositions, undefined);
    assert.equal(verifyProfileScope(real), true);
    for (const candidate of real.candidacies) {
        const profile = real.programmeProfiles!.find(p => p.candidacyId === candidate.id)!;
        const ballots = registry.records.filter(r => r.status === 'proclaimed' && r.resultDenominationId === candidate.id);
        assert.equal(profile.name, candidate.name);
        assert.deepEqual(profile.constituencyIds, candidate.constituencyIds);
        assert.deepEqual([...profile.constituencyIds].sort(), ballots.map(r => r.id.slice(9, r.id.lastIndexOf('-'))).sort());
    }
});

test('all source decisions are reconciled and only common electoral programmes can ground active positions', () => {
    const revision = JSON.parse(readFileSync('outputs/quiz-2023-second-iteration-content-decisions.json', 'utf8')).commonProgrammeRevision as { documentDecisions: { documentId: string; decision: string }[]; candidacyDecisions: { candidacyId: string; programmeDocumentIds: string[] }[] };
    const included = revision.documentDecisions.filter(d => d.decision === 'include_common_programme').map(d => d.documentId);
    const excluded = revision.documentDecisions.filter(d => d.decision === 'exclude').map(d => d.documentId);

    assert.equal(revision.documentDecisions.length, 45);
    assert.equal(included.length, 35);
    assert.equal(excluded.length, 10);
    assert.deepEqual(real.documents.map(d => d.id).sort(), included.sort());
    assert.ok(real.documents.every(d => d.programmeRole === 'common_election_programme'));
    for (const decision of revision.candidacyDecisions) {
        assert.deepEqual(real.documents.filter(d => d.candidacyId === decision.candidacyId).map(d => d.id).sort(), decision.programmeDocumentIds.sort());
        for (const position of Object.values(real.positions[decision.candidacyId])) {
            assert.ok(position.citations.every(c => included.includes(c.documentId) && !excluded.includes(c.documentId)));
            if (!decision.programmeDocumentIds.length) {
                assert.equal(position.status, 'unknown');
                assert.equal(position.value, null);
                assert.deepEqual(position.citations, []);
            }
        }
    }
    const sumar = real.programmeProfiles!.find(p => p.candidacyId === 'boe-2023-004')!;
    assert.equal(sumar.constituencyIds.length, 52);
    for (const id of ['rent-price-cap', 'retain-public-housing-ownership', 'phase-out-prescription-copay']) {
        const position = profilePosition(real, sumar, id);
        assert.equal(position.status, 'derived');
        assert.equal(position.value, 2);
        assert.ok(position.citations.every(c => c.documentId === 'sumar'));
    }
    for (const id of ['boe-2023-001', 'boe-2023-002']) {
        assert.equal(real.positions[id]['free-compulsory-school-meals'].value, null);
        assert.equal(real.positions[id]['restrict-unhealthy-food-child-ads'].value, null);
    }
    assert.equal(real.positions['boe-2023-001']['public-dental-care'].value, null);
    assert.equal(real.positions['boe-2023-002']['public-dental-care'].value, 1);
});

test('common-programme banks reject duplicate formation rows, hidden territorial overrides and unclassified sources', () => {
    const duplicate = structuredClone(real);
    const first = duplicate.programmeProfiles![0];
    const scope = first.constituencyIds.pop()!;
    duplicate.programmeProfiles!.push({ ...first, id: first.id + '-extra', constituencyIds: [scope] });
    assert.throws(() => parseBank(duplicate));

    const scoped = structuredClone(real);
    scoped.constituencyPositions = { madrid: { 'boe-2023-004': { 'rent-price-cap': real.positions['boe-2023-004']['rent-price-cap'] } } };
    assert.throws(() => parseBank(scoped));

    const unclassified = structuredClone(real);
    delete unclassified.documents[0].programmeRole;
    assert.throws(() => parseBank(unclassified));
});

test('every retained numeric position reuses a directly authored cell and its original contextual citations', () => {
    type AuthoredCell = { candidacyId: string; status: string; value: number | null; citations: { documentId: string; start: number; end: number; quote: string }[] };
    const matrix = JSON.parse(readFileSync('outputs/2023-authored-issue-matrix.json', 'utf8')) as { issues: { id: string; cells: AuthoredCell[]; constituencyCells?: AuthoredCell[] }[] };

    for (const [candidate, positions] of Object.entries(real.positions)) {
        for (const [question, position] of Object.entries(positions)) {
            if (position.status !== 'derived') continue;
            const issue = matrix.issues.find(i => i.id === question)!;
            const source = [...issue.cells, ...(issue.constituencyCells ?? [])].find(cell => cell.candidacyId === candidate && cell.status === 'derived' && cell.value === position.value && position.citations.every(c => cell.citations.some(original => (original.documentId === c.documentId || 'source-' + original.documentId === c.documentId) && original.start === c.start && original.end === c.end && original.quote === c.quote)));
            assert.ok(source, candidate + '/' + question);
        }
    }
});

test('real arithmetic uses one denominator, includes zero-evidence programmes and orders unrounded scores', () => {
    const answers = Object.fromEntries(real.starterQuestionIds!.map(id => [id, id === 'rent-price-cap' ? -2 : 2])) as Answers;
    const result = documentedMatch(real, answers);
    assert.equal(result.rows.length, 59);
    assert.equal(result.denominator, 10);
    for (const row of result.rows) {
        const p = real.programmeProfiles!.find(p => p.id === row.id)!;
        let affinity = 0, coverage = 0;
        for (const topic of real.topics) {
            const ids = real.starterQuestionIds!.filter(id => real.questions.find(q => q.id === id)!.topicId === topic.id);
            for (const id of ids) {
                const position = profilePosition(real, p, id);
                if (position.status !== 'derived') continue;
                coverage += 5;
                affinity += 5 * (4 - Math.abs((answers[id] as number) - position.value!)) / 4;
            }
        }
        assert.ok(Math.abs(row.affinity! - affinity) < 1e-10, p.name);
        assert.ok(Math.abs(row.coverage! - coverage) < 1e-10, p.name);
        assert.ok(row.affinity! <= row.coverage! + 1e-10);
        if (!real.documents.some(d => d.candidacyId === p.candidacyId)) assert.equal(row.affinity, 0);
    }
    for (let i = 1; i < result.rows.length; i++) assert.ok(result.rows[i - 1].affinity! >= result.rows[i].affinity!);
});

test('twenty starters and full ten-question blocks retain breadth, stop honestly and require finish', () => {
    const session = new Questionnaire(real, 'test-hash');
    assert.equal(session.progress().total, 20);
    for (let i = 0; i < 20; i++) session.answer(2);
    let total = 20;
    while (session.extension().length) {
        const next = session.extension();
        assert.equal(next.length, 10);
        const counts = real.topics.map(t => next.filter(q => q.topicId === t.id).length);
        assert.ok(counts.filter(n => n > 0).length >= 5);
        assert.ok(counts.every(n => n <= 2));
        assert.equal(session.extend(), true); total += 10;
        assert.equal(session.progress().total, total);
        for (let i = 0; i < 10; i++) session.answer(2);
        assert.equal(session.revealed, false);
    }
    assert.ok(total <= 80 && total >= 30);
    assert.equal(session.extend(), false);
    assert.equal(session.revealed, false);
    assert.throws(() => session.export());
    session.finish(); assert.equal(session.export().engineVersion, 'documented-affinity-v2');
    session.edit(real.starterQuestionIds![0], -2); assert.equal(session.revealed, false);
    assert.equal(documentedBlock(real, real.questions.map(q => q.id), {}).length, 0);
    assert.throws(() => new Questionnaire(real, 'hash', 'madrid'));
});

test('official-source exceptions remain explicit and corrupt variants are rejected', () => {
    assert.equal(Object.keys(real.sourceLinks!).length, real.documents.length);
    assert.ok(Object.values(real.sourceLinks!).some(s => s.officialUrl === null && s.status === 'official_unavailable'));
    const invalid = structuredClone(real); invalid.programmeProfiles![0].constituencyIds.push(invalid.programmeProfiles![0].constituencyIds[0]);
    assert.throws(() => parseBank(invalid));
    const source = structuredClone(real); const id = Object.keys(source.sourceLinks!)[0]; source.sourceLinks![id].officialUrl = 'http://invalid.example';
    assert.throws(() => parseBank(source));
});
