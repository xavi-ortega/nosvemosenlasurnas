import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Feedback, randomize, protocolVersion, truthfulProbability, otherProbability } from '../../resources/js/feedback.ts';
import type { Category, FeedbackConfig } from '../../resources/js/feedback.ts';
const config: FeedbackConfig = { enabled: true, protocolVersion, survey: { version: 'v1', kind: 'synthetic', propositions: [{ id: 'a', topicId: 'housing', topicName: 'Vivienda', text: 'A' }, { id: 'b', topicId: 'health', topicName: 'Salud', text: 'B' }] } };
test('all categories have the specified truthful and alternative branches', () => {
    for (const category of [0, 1, 2] as Category[]) {
        assert.equal(randomize(category, () => 0), category);
        assert.equal(randomize(category, () => truthfulProbability - 1e-8), category);
        assert.equal(randomize(category, () => truthfulProbability + 1e-8), (category + 1) % 3);
        assert.equal(randomize(category, () => truthfulProbability + otherProbability + 1e-8), (category + 2) % 3);
    }
    assert.throws(() => randomize(0, () => 1));
    assert.ok(Math.abs(truthfulProbability - 0.5761168847658291) < 1e-12);
});
test('independent public sampling, refusal, failure attempts and payload whitelist', () => {
    const feedback = new Feedback(config, () => 0.9);
    assert.equal(feedback.proposition.id, 'b');
    assert.equal(feedback.prepare('result_fit', 2, false), null);
    assert.deepEqual(feedback.prepare('result_fit', 2, true), { metricId: 'result_fit', protocolVersion, category: 1 });
    assert.equal(feedback.prepare('result_fit', 2, true), null);
    assert.deepEqual(feedback.prepare('policy_agreement', 0, true), { metricId: 'policy_agreement', protocolVersion, category: 2, surveyVersion: 'v1', propositionId: 'b' });
    assert.equal(feedback.prepare('policy_agreement', 0, true), null);
    assert.equal(new Feedback({ ...config, enabled: false }, () => 0).prepare('result_fit', 1, true), null);
});
