---
name: private-matching
description: Implement or review deterministic browser-local scoring, progressive question selection, explicit finish/result insights, privacy boundaries and synthetic matching checks.
license: MIT
---

# Private matching

Read [matching reference](../../../docs/plans/matching-algorithm-specification.md), [adaptive proposal](../../../docs/plans/adaptive-questionnaire-specification.md) and the canonical plan. The v1 synthetic reference and proposed fixed-bank adaptive method have different weight contracts; a new reviewed version is required before adaptive scoring.

No ML or private-input API. Fetch the same complete public bank for everyone. Answers, priorities, constituency, affinities, next-question IDs, progress, stop reasons and finish/refinement state stay in browser memory. No such data in requests, URLs/fragments, cookies, default persistence, telemetry, logs, crash/support payloads or AI tooling. Explicit local export is separately explained and reviewed. Finish is not data consent.

Compute deterministic independent overlap indices using applicable reviewed evidence, original weights and a common evidence set before ordering. Scores do not sum to 100 and are not probabilities. Preserve ties, unknown evidence and honest limited-result states. More answers can raise or lower an overlap.

Start with ten balanced presented questions and optionally five more per block. Adaptive selection needs transparent versioned local rules, domain coverage, bounded question families and a reviewed stopping policy. Do not chase a fabricated 100%.

No party-specific personalised result before deliberate finish. Checkpoints may show only a reviewed unnamed index when evidence permits. At finish explain answered-question agreement/disagreement, weights and exact contextual citations; show unknowns and all candidacies. Public exploration of unanswered topics must not imply an inferred preference.

Use synthetic arithmetic and actual browser traffic/storage/log checks for implemented flows. Inspect DOM, accessibility tree, titles, notifications, previews and exports for premature identity/score/citation disclosure. Full public evidence is inspectable: presentation discipline is not secrecy. Report unimplemented checks as pending.
