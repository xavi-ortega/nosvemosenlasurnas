import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { relationship, similarity, type Scale } from '../../resources/js/matching.ts';

interface MappingCase {
    candidacyId: string;
    sourceExpectedValue: Scale;
    answerCases: { answer: Scale; expectedOverlap: number; expectedRelationship: ReturnType<typeof relationship> }[];
}
interface Cell { candidacyId: string; status: string; value: Scale | null; citations: unknown[] }
const calibration = JSON.parse(readFileSync('outputs/2023-authored-calibration.json', 'utf8')) as {
    questions: { questionId: string; mappingCases: MappingCase[]; unknownCases: { candidacyId: string; expectedScored: boolean }[] }[];
    mandatoryRentCase: { questionId: string; candidacyId: string; answer: Scale; expectedPartyValue: Scale; expectedOverlap: number; expectedRelationship: ReturnType<typeof relationship> };
};
const matrix = JSON.parse(readFileSync('outputs/2023-authored-issue-matrix.json', 'utf8')) as {
    candidacyIds: string[]; issues: { id: string; cells: Cell[] }[];
};
const authored = JSON.parse(readFileSync('outputs/2023-authored-question-bank.json', 'utf8')) as {
    releaseEligible: boolean; questions: { id: string; topicId: string; familyId: string; text: string; help: string }[];
};

test('every directly authored mapping preserves the five independent source-calibration cases', () => {
    assert.deepEqual(calibration.questions.map(q => q.questionId), authored.questions.map(q => q.id));
    for (const question of calibration.questions) {
        const issue = matrix.issues.find(issue => issue.id === question.questionId)!;
        assert.ok(issue);
        assert.equal(issue.cells.length, matrix.candidacyIds.length);
        assert.deepEqual([...new Set(issue.cells.map(cell => cell.candidacyId))].sort(), [...matrix.candidacyIds].sort());
        for (const mapping of question.mappingCases) {
            const cell = issue.cells.find(cell => cell.candidacyId === mapping.candidacyId)!;
            assert.equal(cell.status, 'derived');
            assert.equal(cell.value, mapping.sourceExpectedValue);
            assert.ok(cell.citations.length > 0);
            assert.deepEqual(mapping.answerCases.map(item => item.answer), [-2, -1, 0, 1, 2]);
            for (const item of mapping.answerCases) {
                assert.equal(similarity(item.answer, cell.value!), item.expectedOverlap, question.questionId);
                assert.equal(relationship(item.answer, cell.value!), item.expectedRelationship, question.questionId);
            }
        }
        assert.deepEqual(question.mappingCases.map(item => item.candidacyId).sort(), issue.cells.filter(cell => cell.status === 'derived').map(cell => cell.candidacyId).sort());
        for (const unknown of question.unknownCases) {
            const cell = issue.cells.find(cell => cell.candidacyId === unknown.candidacyId)!;
            assert.equal(unknown.expectedScored, false);
            assert.notEqual(cell.status, 'derived');
            assert.equal(cell.value, null);
        }
        assert.equal(question.mappingCases.length + question.unknownCases.length, issue.cells.length);
    }
});

test('real Sumar rent support remains opposition to strong disagreement', () => {
    const expected = calibration.mandatoryRentCase;
    const rent = matrix.issues.find(issue => issue.id === expected.questionId)!;
    const position = rent.cells.find(cell => cell.candidacyId === expected.candidacyId)!;
    assert.equal(position.value, 2);
    assert.equal(expected.answer, -2);
    assert.equal(expected.expectedPartyValue, 2);
    assert.equal(expected.expectedOverlap, 0);
    assert.equal(expected.expectedRelationship, 'opposed');
    assert.equal(similarity(expected.answer, position.value!), 0);
    assert.equal(relationship(expected.answer, position.value!), 'opposed');
});

test('authored drafts retain unique questions and do not assert release readiness', () => {
    assert.equal(authored.releaseEligible, false);
    assert.equal(new Set(authored.questions.map(q => q.id)).size, authored.questions.length);
    assert.ok(new Set(authored.questions.map(q => q.topicId)).size >= 10);
    assert.equal(new Set(authored.questions.map(q => q.familyId)).size, authored.questions.length);
    for (const q of authored.questions) {
        assert.ok(q.text.length <= 400 && q.help.length <= 1200);
    }
});
