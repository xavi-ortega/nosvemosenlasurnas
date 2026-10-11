# 2023 quiz matching specification

## 5. Verify meaning and arithmetic together

Trace the full result instead of guessing a global sign correction.

- Canonical labels run -2 Strongly disagree through +2 Strongly agree in an explicit ordered array. Verify browser-visible order, chosen value, stored state, authored direction, source value and result explanation.
- Retain deterministic similarity 1-abs(answer-position)/4 unless a documented defect justifies a versioned change. Independent expected cases: -2 versus +2 = 0; -2 versus -2 = 1; 0 versus +/-2 = 0.5.
- Build an independent semantic calibration ledger for every released question and mapping, with source-grounded expected support/opposition and calculation cases. Do not calculate expected answers by calling the same implementation under test.
- Test all five user answers, inverse phrasing, qualifications, missing/conflicting data, skip/unsure, edited answers, ties, duplicates and weighting. Rent-cap strongly disagree versus a supporting party must be marked a disagreement even if that party has the highest aggregate overlap.
- Use fixed topic/family budgets and an eligible constituency cohort determined independently of answers. Rank only parties sharing identical scored propositions and weights above the declared minimums; disclose the fixed comparison subset and preserve other eligible candidacies.
- Never convert silence to neutral, compare differently covered partial scores in one leaderboard, silently discard small parties, label overlap a probability or split 100 percent among parties.

## 8. Preserve the private quiz boundary

A simpler interface must preserve local processing.

- Fetch the same fixed public versioned bank for everyone. Province, answers, priorities, adaptive state, results and finished state stay only in browser memory by default.
- No personalised API, party/result URL, answer telemetry, persistent identifier, raw request log or remote crash payload containing private state. Help content and scoring remain local.
- Do not embed third-party video, analytics, fonts or programme viewers in the answering journey. Explicit original-source links after finish may open the external publisher with no referrer.
- Finish is not collection consent. Preserve the optional feedback implementation disabled and defer its product work.
