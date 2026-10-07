/**
 * Reference matching engine, proposal v1.0.0. No network or storage APIs.
 * Run in the browser with a reviewed, versioned public dataset.
 * Scores are similarity indices, not probabilities or literal agreement percentages.
 * Publication, evidence truth, and reviewer independence need editorial controls.
 */
export const ALGORITHM_VERSION = 'policy-distance-v1.0.0';
export const PROPOSED_COMPARISON_POLICY = Object.freeze({
  minAnsweredQuestions: 20,
  minAnsweredDomains: 6,
  minCommonQuestions: 15,
  minCommonDomains: 6,
  minCommonCoverage: 0.8,
  closeScorePoints: 3,
});
const VALUES = new Set([-2, -1, 0, 1, 2]);
const UNKNOWN = new Set(['not_stated', 'ambiguous', 'conflicting', 'pending', 'unmapped']);
const own = (o, key) => Object.hasOwn(o, key);
const requireCondition = (condition, message) => { if (!condition) throw new Error(message); };
const lexical = (a, b) => a < b ? -1 : a > b ? 1 : 0;

export function similarity(user, party) {
  requireCondition(VALUES.has(user) && VALUES.has(party), 'Stances must be integers from -2 to 2');
  return 1 - Math.abs(user - party) / 4;
}
export function minimumUnknownSimilarity(user) {
  requireCondition(VALUES.has(user), 'Invalid user stance');
  return 1 - Math.max(Math.abs(user + 2), Math.abs(user - 2)) / 4;
}
function approved(bundle, position) {
  return !!position && position.status === (bundle.kind === 'synthetic' ? 'fixture' : 'reviewed');
}
function validateBundle(bundle) {
  requireCondition(bundle && ['synthetic', 'released'].includes(bundle.kind), 'Dataset kind must be explicit');
  requireCondition(bundle.algorithmVersion === ALGORITHM_VERSION, 'Dataset/algorithm version mismatch');
  requireCondition(typeof bundle.releaseId === 'string' && bundle.releaseId.length > 0, 'Missing release ID');
  if (bundle.kind === 'released') requireCondition(typeof bundle.electionId === 'string' && bundle.electionId.length > 0, 'Missing election ID');
  requireCondition(Array.isArray(bundle.domains) && Array.isArray(bundle.questions) && Array.isArray(bundle.candidacies), 'Invalid dataset collections');
  requireCondition(bundle.positions && bundle.evidence, 'Missing position/evidence indexes');
  const unique = (items, name) => {
    const ids = items.map(x => x.id);
    requireCondition(ids.every(id => typeof id === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id)), `Invalid ${name} ID`);
    requireCondition(new Set(ids).size === ids.length, `Duplicate ${name} ID`);
    return new Set(ids);
  };
  const domainIds = unique(bundle.domains, 'domain');
  const questionIds = unique(bundle.questions, 'question');
  const candidacyIds = unique(bundle.candidacies, 'candidacy');
  for (const q of bundle.questions) {
    requireCondition(domainIds.has(q.domainId), `Unknown domain for ${q.id}`);
    requireCondition(Number.isFinite(q.baseWeight) && q.baseWeight > 0, `Invalid base weight for ${q.id}`);
  }
  for (const [partyId, mapping] of Object.entries(bundle.positions)) {
    requireCondition(candidacyIds.has(partyId), `Unknown candidacy ${partyId}`);
    for (const [questionId, p] of Object.entries(mapping)) {
      requireCondition(questionIds.has(questionId), `Unknown question ${questionId}`);
      requireCondition(p && (approved(bundle, p) || UNKNOWN.has(p.status)), `Invalid position status at ${partyId}/${questionId}`);
      if (!approved(bundle, p)) continue; // Draft/uncertain values are never scored.
      requireCondition(VALUES.has(p.stance), `Invalid approved stance at ${partyId}/${questionId}`);
      requireCondition(Array.isArray(p.evidenceIds) && p.evidenceIds.length > 0, `Missing evidence at ${partyId}/${questionId}`);
      requireCondition(Array.isArray(p.approvedBy) && p.approvedBy.every(id => typeof id === 'string' && id.trim().length > 0) && new Set(p.approvedBy).size >= 2, `Two distinct approvals required at ${partyId}/${questionId}`);
      for (const id of p.evidenceIds) {
        const e = bundle.evidence[id];
        requireCondition(e && typeof e.quote === 'string' && e.quote.trim().length > 0, `Invalid evidence ${id}`);
        if (bundle.kind === 'synthetic') {
          requireCondition(e.kind === 'synthetic', 'Fictional fixtures must be labelled synthetic');
        } else {
          const d = bundle.documents?.[e.documentId];
          requireCondition(d && d.type === 'programme' && d.electionId === bundle.electionId, `Current-election programme required for ${id}`);
          requireCondition(Array.isArray(d.candidacyIds) && d.candidacyIds.includes(partyId), `Programme scope mismatch for ${id}`);
          requireCondition(typeof d.sha256 === 'string' && /^[a-f0-9]{64}$/i.test(d.sha256), `Missing document hash for ${id}`);
          requireCondition(typeof d.sourceUrl === 'string' && /^https?:\/\//.test(d.sourceUrl), `Missing official source URL for ${id}`);
          requireCondition(typeof e.locator === 'string' && e.locator.trim().length > 0, `Missing page/section locator for ${id}`);
        }
      }
    }
  }
  return { domainIds, questionIds, candidacyIds };
}
function validatePolicy(policy) {
  for (const key of ['minAnsweredQuestions', 'minAnsweredDomains', 'minCommonQuestions', 'minCommonDomains']) {
    requireCondition(Number.isInteger(policy[key]) && policy[key] >= 1, `Invalid comparison policy ${key}`);
  }
  requireCondition(Number.isFinite(policy.minCommonCoverage) && policy.minCommonCoverage >= 0 && policy.minCommonCoverage <= 1, 'Invalid common coverage threshold');
  requireCondition(Number.isFinite(policy.closeScorePoints) && policy.closeScorePoints >= 0 && policy.closeScorePoints <= 100, 'Invalid near-score threshold');
}
function summarize(rows) {
  const totalWeight = rows.reduce((a, r) => a + r.weight, 0);
  const known = rows.filter(r => r.known);
  const knownWeight = known.reduce((a, r) => a + r.weight, 0);
  const knownContribution = known.reduce((a, r) => a + r.weight * r.similarity, 0);
  const missing = rows.filter(r => !r.known);
  const lowerMissing = missing.reduce((a, r) => a + r.weight * minimumUnknownSimilarity(r.userAnswer), 0);
  const missingWeight = missing.reduce((a, r) => a + r.weight, 0);
  return {
    answeredQuestions: rows.length,
    knownQuestions: known.length,
    knownWeight,
    coverage: totalWeight ? knownWeight / totalWeight : 0,
    observedIndex: knownWeight ? 100 * knownContribution / knownWeight : null,
    missingEvidenceBounds: knownWeight ? {
      lower: 100 * (knownContribution + lowerMissing) / totalWeight,
      upper: 100 * (knownContribution + missingWeight) / totalWeight,
    } : null,
  };
}

/**
 * Pure function. `answers`: question ID -> -2..2, null, 'unsure', or 'skip'.
 * `importance`: domain ID -> 0 (exclude), 1 (default), 2, or 3.
 * The caller retains these inputs locally; this module never submits them.
 * `options.cohortIds` selects explicitly compared candidacies, never silently.
 * Reduced comparison thresholds are allowed only for synthetic demonstrations.
 */
export function matchPolicyPreferences(bundle, answers = {}, importance = {}, options = {}) {
  const ids = validateBundle(bundle);
  for (const [id, value] of Object.entries(answers)) {
    requireCondition(ids.questionIds.has(id), `Unknown answer question ${id}`);
    requireCondition(VALUES.has(value) || value === null || value === 'unsure' || value === 'skip', `Invalid answer for ${id}`);
  }
  for (const [id, value] of Object.entries(importance)) {
    requireCondition(ids.domainIds.has(id) && [0, 1, 2, 3].includes(value), `Invalid importance for ${id}`);
  }
  requireCondition(!options.demoPolicy || bundle.kind === 'synthetic', 'Production thresholds must be pinned in the public release');
  const policy = { ...PROPOSED_COMPARISON_POLICY, ...(bundle.comparisonPolicy || {}), ...(options.demoPolicy || {}) };
  validatePolicy(policy);
  const selected = options.cohortIds ?? bundle.candidacies.map(c => c.id);
  requireCondition(Array.isArray(selected) && selected.every(id => ids.candidacyIds.has(id)), 'Invalid comparison cohort');
  requireCondition(new Set(selected).size === selected.length, 'Duplicate candidacy in cohort');
  const cohort = [...selected].sort(lexical);
  const domainPriority = id => own(importance, id) ? importance[id] : 1;
  const activeQuestions = bundle.questions.filter(q => domainPriority(q.domainId) > 0);
  const answered = activeQuestions.filter(q => own(answers, q.id) && VALUES.has(answers[q.id]));
  const answeredDomainIds = [...new Set(answered.map(q => q.domainId))];
  const priorityTotal = answeredDomainIds.reduce((sum, id) => sum + domainPriority(id), 0);
  const baseTotals = new Map(answeredDomainIds.map(id => [id, answered.filter(q => q.domainId === id).reduce((sum, q) => sum + q.baseWeight, 0)]));
  const weighted = answered.map(q => ({
    ...q,
    userAnswer: answers[q.id],
    weight: domainPriority(q.domainId) / priorityTotal * q.baseWeight / baseTotals.get(q.domainId),
  }));
  const partyRows = new Map();
  const parties = [...bundle.candidacies].sort((a, b) => lexical(a.id, b.id)).map(c => {
    const rows = weighted.map(q => {
      const p = bundle.positions[c.id]?.[q.id];
      const known = approved(bundle, p);
      return {
        questionId: q.id, domainId: q.domainId, userAnswer: q.userAnswer, weight: q.weight,
        known, status: known ? p.status : (p?.status ?? 'unmapped'),
        partyStance: known ? p.stance : null,
        similarity: known ? similarity(q.userAnswer, p.stance) : null,
        evidenceIds: known ? [...p.evidenceIds] : [],
      };
    });
    partyRows.set(c.id, rows);
    return { candidacyId: c.id, name: c.name, ...summarize(rows), domains: answeredDomainIds.map(id => ({domainId: id, ...summarize(rows.filter(r => r.domainId === id))})), explanations: rows };
  });
  const common = weighted.filter(q => cohort.length > 0 && cohort.every(id => approved(bundle, bundle.positions[id]?.[q.id])));
  const commonWeight = common.reduce((sum, q) => sum + q.weight, 0);
  const commonDomains = new Set(common.map(q => q.domainId)).size;
  const reasons = [];
  if (cohort.length < 2) reasons.push('Choose at least two candidacies for a direct comparison');
  if (answered.length < policy.minAnsweredQuestions) reasons.push('Too few scored user answers');
  if (answeredDomainIds.length < policy.minAnsweredDomains) reasons.push('Too few answered domains');
  if (common.length < policy.minCommonQuestions) reasons.push('Too few questions with shared evidence');
  if (commonDomains < policy.minCommonDomains) reasons.push('Too few domains with shared evidence');
  if (commonWeight + 1e-12 < policy.minCommonCoverage) reasons.push('Shared evidence covers too little of the user’s answered-question weight');
  const comparisonAllowed = reasons.length === 0;
  const scores = comparisonAllowed ? cohort.map(id => ({
    candidacyId: id,
    sharedIndex: 100 * common.reduce((sum, q) => sum + q.weight * similarity(q.userAnswer, bundle.positions[id][q.id].stance), 0) / commonWeight,
  })).sort((a, b) => b.sharedIndex - a.sharedIndex || lexical(a.candidacyId, b.candidacyId)) : [];
  const groups = [];
  for (const score of scores) {
    const last = groups.at(-1);
    // Anchor to the highest member: do not create long chains of near scores.
    if (!last || last.highestIndex - score.sharedIndex > policy.closeScorePoints + 1e-12) {
      groups.push({ highestIndex: score.sharedIndex, lowestIndex: score.sharedIndex, candidacyIds: [score.candidacyId] });
    } else {
      last.lowestIndex = score.sharedIndex;
      last.candidacyIds.push(score.candidacyId);
    }
  }
  for (const group of groups) group.candidacyIds.sort(lexical);
  return {
    algorithmVersion: ALGORITHM_VERSION,
    datasetReleaseId: bundle.releaseId,
    synthetic: bundle.kind === 'synthetic',
    responseCoverage: {
      activeQuestions: activeQuestions.length,
      answeredQuestions: answered.length,
      answeredFraction: activeQuestions.length ? answered.length / activeQuestions.length : 0,
      activeDomains: new Set(activeQuestions.map(q => q.domainId)).size,
      answeredDomains: answeredDomainIds.length,
    },
    questionWeights: weighted.map(q => ({questionId: q.id, domainId: q.domainId, weight: q.weight})),
    parties,
    comparison: { cohortIds: cohort, policy, allowed: comparisonAllowed, reasons, commonQuestionIds: common.map(q => q.id), commonQuestions: common.length, commonDomains, commonCoverage: commonWeight, scores, groups },
  };
}
