<!-- Generated from outputs/adaptive-questionnaire-specification.html; run npm run docs:build. -->

# Nos Vemos en las Urnas · Progressive questionnaire proposal

Ten balanced questions, an honest checkpoint, then optional batches of five. Planning specification only; no adaptive functionality has been implemented or validated.

[Canonical plan amendment](development-plan.md#adaptive-questionnaire) · [Structured policy and backlog](../../outputs/electoral-app-development-plan.json) · [Unchanged v1 reference specification](matching-algorithm-specification.md)

<a id="flow"></a>



## 1\. Fast and committed user journeys

The same product supports early exit and deeper policy exploration.

-   Release-pinned ten clear policy questions balanced over 8–10 reviewed domains. Broad means accessible concrete policy, not an inferred left/right identity.
-   After ten presented questions, show actual valid-answer count and an unnamed highest-overlap index only if the reviewed common-evidence/short-mode policy permits it, with separate coverage/stability limits. Otherwise show honest insufficient-evidence information. Offer explicit finish-and-reveal or +5, with early finish/exit available. Never identify a matching party, map scores to parties or reveal detailed personalised citations before finish.
-   Prefer reviewed broad questions before niche detail, but revisit uncovered important domains and only ask useful refinements. Genericity never overrides evidence, topic budgets or neutral wording.
-   Ten answers can produce useful cited overlaps and explicit limitations. They do not automatically pass broad ordering; the v1 20-answer/15-common-question proposal is not silently lowered. A distinct short-mode policy requires GATE-02 calibration.
-   Unsure/skip has no numeric stance, does not count as resolved information, is not guessed and is not repeatedly asked. Presented count and scored-answer count differ.

<a id="honest-percentages"></a>



## 2\. What the percentages mean

Overlap, bank coverage, programme evidence and stability answer different questions.

-   An index out of 100 for documented policy overlap on the disclosed common answered set; not probability of party membership or voting intention.
-   100 × sum of fixed bank weights with actual numeric user answers. Label as coverage of the reviewed scoped bank, not confidence. Excluded domains change the explicitly shown scope.
-   Show the proportion of the fixed scoped bank with applicable reviewed common evidence and candidacy-specific gaps; missing source evidence is separate from missing user answers.
-   Provisional, unresolved/tied or robust within the exact reviewed bank/cohort/weights. A stronger label needs validated bounds and must name its scope.
-   Do not combine arbitrary factors into a confidence percentage or treat the fraction of simulated completions as a probability. A future calibrated probabilistic claim would require a separately approved model/pilot/privacy design.
-   90% sure that you belong to Party X
-   100% certain which party you should vote for
-   Answering more always raises confidence
-   Skipped beliefs can be inferred from other answers

<a id="weights"></a>



## 3\. Fixed budgets and reference compatibility

The preferred adaptive method is a new proposal; v1 is preserved.

-   policy-distance-v1.0.0 normalizes priorities over answered domains and base weights within answered topics. Its existing synthetic implementation/verification remains unchanged.
-   Freeze each active domain budget over the entire release-pinned question bank, then distribute it through reviewed policy-family/question shares. Future answers resolve existing mass rather than creating topic weight. Reuse the similarity formula 1 − |u − p| / 4.
-   W(q) = priority(domain(q)) / sum\_active\_domain\_priorities × publishedQuestionShare(q); sum of shares within each domain = 1; sum of active W(q) = 1.
-   Related/duplicated questions share a published policy-family budget; splitting a question cannot increase family/domain influence. A broad question and its detail are not automatically independent evidence.
-   Fixed-bank weighting is a proposed method change, not silently applied to the v1 score. It requires a new reviewed algorithm version and GATE-02 sensitivity approval before production.
-   Stopping/bounds must refer to the same fixed weights, questions, cohort and scoring target as the published adaptive method. No fixed-bank guarantee may be attached to v1's changing answered-only weights.

<a id="bounds"></a>



## 4\. Bound unanswered beliefs without predicting them

Deterministic bounds apply only to the explicitly reviewed same target.

-   B is the pinned active bank; S is the explicitly selected cohort; C contains questions with applicable reviewed positions for every candidacy in S. Original W is fixed; common weights are W(q)/E, where E = sum\_C W(q). E=0 means no common diagnostic.
-   For an unanswered/unsure/skipped q use the possible answer set {-2,-1,0,1,2}; for a numeric answer use its singleton. No population priors or guesses.
-   For a party i, sum weighted minimum/maximum similarity over those possible user answers on C. These full-common-bank bounds are distinct from v1's answered-question missing-source bounds.
-   For a,b in S: d(q,u)=similarity(u,p\_aq)−similarity(u,p\_bq). G\_low(a,b)=100×sum\_C(W/E)×min\_u d; G\_high uses max\_u. Both parties use the same hypothetical user answer u for each question.
-   The pair interval contains every completion of the remaining user answers for this fixed common target. It is a deterministic scope-conditional bound, not a statistical confidence interval or whole-manifesto guarantee.
-   With unchanged weights/cohort/release and retained numeric answers, resolving an answer can only shrink those fixed-target intervals. Observed overlap may rise or fall; edits, priority changes and changed scope reset diagnostics.
-   Only if one candidacy has G\_low against every other candidacy greater than the approved near-score margin and all evidence/topic/readiness gates pass may the method state a robust leader for this target.
-   Identical or inseparable programme positions can make a unique leader impossible. Show a group/tie; do not invent a winner through lexical order.
-   Unknown/contested party positions remain unknown. Additional answers cannot supply missing manifesto evidence. Restrict mathematics to disclosed common C and withhold broad claims if common coverage/topic thresholds fail.

<a id="order"></a>



## 5\. Choose a useful next question

Local range reduction, topic coverage and published neutral constraints.

-   Deterministic, inspectable browser-local uncertainty-reduction heuristic; no machine learning or learned voter-party priors.
-   Unasked reviewed questions from the pinned bank, appropriate tier and policy-family budget, with applicable common evidence for the fixed comparison target. Unsure/skip is not silently revisited.
-   Apply released minimum domain coverage and repetition/burden caps before discrimination; do not spend all refinement questions on one high-separation issue.
-   Use conservative pair bounds against every candidacy to identify plausible leaders. A current low observed index is not sufficient to exclude a candidacy from refinement consideration.
-   Any internal priority pruning must have a disclosed bound certificate. All candidacies remain scored/represented on the same common set and visible after reveal or in the independent explorer; do not delete parties or shrink C to improve a result.
-   For each eligible q, calculate how much its unanswered pair-gap range contributes for each unresolved plausible pair. Gain(q)=max\_pair\[100×(W(q)/E)×(max\_u d(q,u)−min\_u d(q,u))\]. Identical stances give zero discriminating gain.
-   Within coverage/tier constraints, maximize gain divided by a published positive locale-independent response-burden cost; W already includes user domain priority. Tie-break by a published party-independent question key. Translations never change selector weights/costs.
-   No party popularity, poll strength, name/logo/ideology label, target winner, acceptance metric or inferred user demographic enters priority. Rename/reorder parties and negate all axes without changing the chosen semantic question.
-   Evaluate all five allowable numeric possibilities rather than predicting the person's next belief. 'Expected gain' terminology is reserved for an approved predictive model; this baseline is structural worst-case range reduction conditional on a real answer.
-   Explain the next topic plainly as unresolved coverage or a documented distinction; avoid a preferred-party cue in question wording.
-   If bounds/model/scope validation fails, keep results unrevealed until explicit finish and use a pinned balanced order. Never fabricate readiness. CPU limits get a disclosed fixed-order fallback with identical privacy.

<a id="stop"></a>



## 6\. Know when another block cannot help

If all topic priorities are zero or no valid active question/evidence target exists, return unavailable coverage/diagnostics rather than divide by zero or report 100%. Offer scope/priority revision and source browsing.

The user may stop at any point; ties are valid results.

-   A scoped leading group is robust under the approved same-target policy
-   Remaining reviewed questions add too little discrimination
-   Available bank exhausted
-   Programme evidence prevents a stronger comparison
-   User chooses to stop
-   Do not promise eventual 100% certainty or keep asking solely to fill a progress bar. 100% response coverage only means this scoped bank is answered.
-   Users may still browse or answer for fuller topic explanations; the interface explains why another block could or could not help.
-   Show unavailable/insufficient personal comparison, cited programme browsing and an option to revise responses; never assign a default neutral profile.

<a id="privacy"></a>



## 7\. Branches are private political data too

No server-side adaptation or branch telemetry.

-   Load the same complete public bank, dictionary and relevant evidence release regardless of responses. No per-next-question request, server-selected branch or response-dependent chunk.
-   Question order, next-question ID, candidate subset, stop reason, uncertainty ranges and progress are derived political data; keep them in browser memory alongside answers/priorities/constituency.
-   No adaptive-path, progress, abandonment, timing or result events by default. Optional metrics stay behind their separate actual-flow/aggregation gate.
-   Only an explicit local export may include answers, priorities, order and all algorithm/selector/readiness/bank versions, with a Spanish privacy explanation.
-   Pin bank, scores, selector, readiness, weights, locale dictionaries and evidence together. Locale changes preserve semantic IDs/order/diagnostics; withdrawn source versions invalidate affected conclusions.

<a id="copy"></a>



## 8\. Proposed Spanish interface copy

Draft content values; fluent/comprehension review remains pending. Identifiers and developer artifacts stay English.

| English semantic key | Spanish draft value |
| --- | --- |
| questionnaire.leading\_overlap\_blind | Mayor coincidencia detectada: :overlap % |
| questionnaire.checkpoint | Puedes terminar y ver tus resultados o responder 5 preguntas más. |
| questionnaire.coverage | Cobertura de tus respuestas en este banco de preguntas |
| questionnaire.overlap | Índice de coincidencia en las preguntas con evidencia compartida |
| questionnaire.provisional | El resultado es provisional: otras respuestas podrían cambiar la comparación. |
| questionnaire.missing\_evidence | Falta evidencia de los programas para una comparación más completa. |
| questionnaire.tie | Estas candidaturas tienen posiciones muy parecidas en los temas comparados. |
| questionnaire.continue | Responder 5 más |
| questionnaire.finish | Terminar y ver mis resultados |

<a id="validation"></a>



## 9\. Evidence before activation

Mathematics, neutral wording and actual flow require separate checks.

-   Fixed-target bounds contain all enumerated tiny-fixture completions; pair comparisons use the same hypothetical answer
-   Party order/labels, question order, axis inversion and duplicated issue splitting cannot manipulate priority/budgets
-   Neutral vs skip; edited answer, changed priorities/cohort, all-skipped, tied parties and insufficient common evidence
-   Anchor versus adaptive paths over synthetic profiles at 10/15/20+ questions; convergence is not treated as calibrated probability
-   Independent human question-order, party-priming, wording/translation and coverage review
-   Actual no-network/storage/log proof includes derived question IDs/path/stop codes; mobile burden/latency measured
-   No retained real answer vectors, party identities, voting intentions or learned ideology labels. Use public/synthetic simulations and consented comprehension review under the existing pilot/privacy gate.
-   GATE-02 approves the actual bank, weights, thresholds, ordering, short-mode rules and honest readiness language. GATE-03/GATE-06 must then pass for shipped adaptive flows; fluent regional packs add their scoped gate.

<a id="research"></a>



## 10\. Primary research and limits of transfer

[A perfect match? The impact of statement selection on voting advice applications' ability to match voters and parties](https://dare.uva.nl/id/c55af723-1679-47c7-8949-61e8828bf5b2): Primary study by Lefevere and Walgrave (2014), reviewed through the university repository abstract, reports that statement selection changes voter-party matching. It motivates independent question-selection/weight review; it does not validate this adaptive method.

[A New Stopping Rule for Computerized Adaptive Testing](https://pmc.ncbi.nlm.nih.gov/articles/PMC3028267/): Primary simulation study motivates stopping when further items offer little improvement. Its calibrated medical/psychometric model and numeric thresholds are not transferable confidence evidence for political overlap.

This specific deterministic selector/weight/bounds policy is our design proposal, not an implementation or a validated result of those studies.

<a id="explicit-reveal"></a>



## 11\. Explicit finish and cited result exploration

Neutral questions and checkpoints first; only the user reveals their personalised comparison.

Only an intentional finish/view-results activation enters finished\_revealed. Completing question 10, another block, the final bank item, a timeout or a readiness calculation never triggers it.

Neutral question/help text and actual presented/valid counts. At checkpoints, optionally show the unnamed highest comparable overlap and a non-identifying close-group/limitation explanation when the reviewed policy allows it. No names/logos, party-specific colours or score mappings, ranking, result preview or personalised programme excerpts; never manufacture a strongest score on incomparable evidence.

A scoped overlap comparison with topic-specific agreement/disagreement, understandable weighting and coverage/stability/missing-source limits. All candidacies remain represented; broad ordering is withheld when its evidence gates fail.

Finish is a browser-local display choice, never consent to metrics, transmission, storage, sharing or publication. No finish/exit/reveal event is sent by default.

Users may leave without revealing or choose finish at an early point. Zero valid answers, excluded domains or insufficient evidence produce an honest unavailable/limited result, never an invented leader.

After viewing results, users may explicitly refine. Updated affinities are withheld until another finish activation; retain the pinned release and valid semantic IDs. Previously seen information cannot be unlearned, so informed refinement is distinguished from first-pass neutral evaluation.

The independent programme comparison remains available without finishing or taking the quiz. It does not automatically display personalised affinities; the complete public evidence bank remains inspectable for open-source verification.

Withhold matching-party identities, party-specific mappings/rankings and detailed personalised results from visual/hidden DOM, live regions, tooltips, notifications, titles, previews and downloads before finish; do not merely hide a result list with CSS. The explicitly permitted unnamed checkpoint index may render without identity. This controls presentation, not secrecy of public evidence/local calculation.

After finish, show relevant exact citations for scored answered questions, including disagreement and conditions. Unknown/ambiguous/pending mappings are marked unscored, with reviewed available source information rather than a fabricated justification.

Provide all-candidacy and topic exploration, full reviewed programme/source links, original excerpts plus labelled translations, scope/date/version, glossary, method/weighting, corrections and optional local reset/export. Unanswered topics are public information only, not inferred personal preferences.

With synthetic fixtures, whitelist only the permitted unnamed checkpoint index and verify its shared-evidence arithmetic/limitations; assert no matching-party identity, score-to-party mapping or detailed result in visual/DOM/accessibility/title/notification/export surfaces before finish. Cover checkpoints, bank exhaustion, errors, locale/theme and history. Then verify intentional reveal, refinement/re-finish, source parity and no transport/storage/log events. Raw common public data may contain party names.

### Draft Spanish actions and result copy

Draft content values awaiting fluent/editorial, comprehension and actual-flow review; identifiers remain English.

| English semantic key | Spanish draft value |
| --- | --- |
| questionnaire.finish | Terminar y ver mis resultados |
| questionnaire.continue | Responder 5 más |
| questionnaire.exit\_without\_results | Salir sin ver resultados |
| questionnaire.checkpoint | Puedes terminar y ver tus resultados o responder 5 preguntas más. |
| results.leading\_overlap | Tu mayor coincidencia: :party · :overlap % |
| results.explanation | Coincidencia con propuestas documentadas en las preguntas comparadas. |
| results.refine | Afinar mi comparación |

### Answered-question insights after finish

-   User's chosen answer and question meaning
-   Candidacy's reviewed stance and alignment/disagreement
-   Question/topic weighting and contribution explanation
-   Exact programme excerpt with surrounding conditions, page/locator, source scope/date/version and original link
-   Unknown/conflicting/pending evidence clearly distinguished and unscored

When the reviewed shared-evidence comparison permits a leader, headline its weighted overlap index and show close alternatives and limitations. Independent party indices do not sum to 100%; they are not probabilities or literal percentages of accepted promises. More answers may raise or lower them.

Explain documented overlaps and disagreements across answered topics; avoid cherry-picking only positive matches or labelling the user's identity.

All personalised expansion/filtering stays browser-local against the same pinned public bundle. Original-source visits and explicit local exports follow their existing honest destination/rights/privacy review; no new remote personalised API or analytics.

Planning only. These checks are requirements for future browser CI and human review, not implemented results. Skills and baseline CI remain the immediate setup priority.
