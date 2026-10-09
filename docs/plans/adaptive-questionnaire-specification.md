# Lean progressive questionnaire

## 2. Public journeys

The comparison tool and quiz must each be useful on their own.

- Home: two clear actions, what the service measures, how sources work, privacy in one plain paragraph, and the source release date.
- Comparison: browse all in-scope candidacies, select two or more, search topics and see exact proposals, differences, overlap and evidence gaps. Provide a table on wide screens and readable cards on phones.
- Quiz: explain local processing and reload behavior, optional local constituency selection, balanced questions, skip/unsure, optional topic priorities and edit. After ten presented questions offer finish, five more, review or exit. Presentation count and scored-answer count differ.
- Before explicit finish, withhold personalised party identities, scores by party, ranking and selected result citations from DOM/accessibility/title/export surfaces. An unnamed highest comparable overlap may appear only when enough shared answers exist; never call it certainty.
- Results: explain per-party policy overlap, shared evidence coverage, ties and limitations; show agreements/disagreements with cited programme passages for answered questions. Unanswered-topic exploration is public information, not a guessed preference.
- After results, a person may knowingly refine answers, compare sources, reset, deliberately export a local file, or optionally contribute feedback. Finish never opts into metrics. No pressure to reach 100%.

## 6. Progressive question order

Start useful and get more specific without pretending to read minds.

- Start with ten general questions covering the released topics, one per family where possible, selected by a documented balanced order. Do not force scoring if enough comparable evidence does not exist.
- For continuation, prioritize uncovered positive-weight topics/families first, then specificity. Among eligible remaining questions, compute D(q)=(max party position-min party position)/4 on the close-profile common-evidence cohort, U(t)=1-answered numeric bank weight in topic t/total positive released topic weight, and score(q)=topicPriority*(0.6*U(t)+0.4*D(q))/burden(q). Default burdens: general=1, specific=1.5; all values/version are published. Unsupported numeric spread is zero. Stable question ID breaks equal scores.
- Define close profiles as within ten observed index points of the current highest comparable index. If comparison is insufficient, consider the full cohort. Never remove parties from results or infer an answer; stable question IDs and party renaming/order do not change semantic selection.
- Limit a family to two presented questions per session by default; score its declared items using the fixed family budget, without double-counting alternate wording of the same proposition. An edit resets derived selection; already presented questions remain in local history. Identical profiles or no discrimination are legitimate outcomes.
- If the selector fails or exceeds its CPU budget, use the balanced remaining order with the same scoring contract. Bank exhaustion offers explicit finish/exit; it never reveals automatically. There is no prediction probability or target of reaching 100%.
