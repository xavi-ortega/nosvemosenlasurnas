<!-- Generated from outputs/matching-algorithm-specification.html; run npm run docs:build. -->

Planning amendment: a ten-question progressive flow, deterministic selector and fixed-bank adaptive scoring candidate are specified separately. This v1 answered-topic-normalized reference remains unchanged. Its checks do not validate the new method, and fixed-bank stability guarantees must not be attached to its changing weights. See the [adaptive questionnaire planning supplement](adaptive-questionnaire-specification.md).

# Matching algorithm · detailed proposal v1.0.0

An explainable similarity calculation using a reviewed public evidence matrix and answers kept in the browser. It describes overlap on selected policy questions, not political identity, voting intention, objective ideological truth or the probability of party membership.

A runnable reference implementation and fictional arithmetic fixtures are included. The real question bank, party mappings, thresholds and deployment have not been validated or implemented.

[Reference engine](../../outputs/matching-engine.mjs) · [Fictional input fixture](matching-example.json) · [Verified fictional results](matching-example-results.json)

## Contents

- [1. Build the released evidence matrix](#inputs)
- [2. Code answers and party positions carefully](#coding)
- [3. Derive weights from topics and answered questions](#weights)
- [4. Calculate similarity per question](#distance)
- [5. Report overlap on known evidence and coverage separately](#coverage)
- [6. Bound the effect of missing party positions](#bounds)
- [7. Compare parties on the same evidence set](#comparison)
- [8. Worked example: entirely fictional parties](#example)
- [9. Inspect the individual arithmetic](#question-example)
- [10. Generate explanations from the calculation](#explanations)
- [11. Implement it as a small pure browser module](#implementation)
- [12. Verify arithmetic, then validate the editorial method](#verification)

<a id="inputs"></a>



## 1\. Build the released evidence matrix

Laravel manages evidence and review. The browser receives the approved public release, not an AI model.

-   Question: stable ID, domain ID, one precise statement, direction of coding, published base weight and question-version ID. Maintain about 30 questions over 8–10 domains, with balanced coverage and no repeated counting of substantially identical policy proposals.
-   Position assessment: candidacy ID, question ID, status, stance when approved, evidence IDs, reviewer IDs and interpretation rationale. Use the actual ballot/coalition identity and geographical programme scope.
-   Evidence: exact original excerpt, surrounding context, original language, any labelled translation, document ID and page/section locator. Document: official URL, election ID, programme type, geographic/candidacy scope, original hash and version. Keep non-programme or older-election material separate.
-   Position states: reviewed; not stated; ambiguous; conflicting; pending; or unmapped. Only reviewed, current-election programme positions enter real scores. Silence is not opposition, neutrality or an inferred party identity.
-   Two independent reviewers approve the mapping against the original. Disagreement goes to an adjudicator or remains unresolved. A code-level approval-count check cannot itself prove human independence or evidence truth; the editorial workflow must do that.
-   Pin the schema, question bank, rubric, algorithm, comparison policy and documents in a dataset release. The reference engine checks structural metadata, evidence presence, two distinct approval IDs, document scope and current election. The release pipeline must also check source authenticity, extraction accuracy and actual review.

<a id="coding"></a>



## 2\. Code answers and party positions carefully

Use one common ordinal axis, while explaining that user conviction and programme commitment are different kinds of evidence.

2\. Code answers and party positions carefully · proposal/fictional arithmetic, 7 October 2026
| User response | Code | Treatment |
| --- | --- | --- |
| A · Strongly agree | +2 | A scored answer |
| B · Somewhat agree | +1 | A scored answer |
| Neither agree nor disagree | 0 | A scored answer |
| C · Somewhat disagree | −1 | A scored answer |
| D · Strongly disagree | −2 | A scored answer |
| Unsure / skip | No value | Excluded from calculation |

-   Party rubric: +2 = explicit support for the precise measure; +1 = an explicitly narrower or partial compatible position; 0 = an explicitly intermediate position; −1 = an explicitly partial opposing position; −2 = explicit rejection or support for the opposite measure. Full support means support for the question as written, not emotional intensity inferred from campaign language.
-   Approve +1 or −1 only if the partial position can genuinely be represented on that question’s ordered axis. If a condition changes the meaning substantially, rewrite the question to include that condition or leave the position ambiguous and unscored.
-   Never use reviewer confidence as the stance: weak evidence does not turn support into neutrality. A conflict between passages also does not average to zero. Missing or unresolved evidence has no numeric stance.
-   The equal spacing of −2, −1, 0, +1, +2 is an explicit modelling convention. It does not establish an objective metric for ideology. Publish it and compare its sensitivity with alternative codings before release.
-   Categorical choices between different policies are outside this first scoring formula. They need a separately reviewed compatibility matrix. ABCD letters alone are not ordered political positions.

<a id="weights"></a>



## 3\. Derive weights from topics and answered questions

Prevent a topic from dominating simply because it has more questions.

-   Let r\_d be the user’s topic priority: 1 by default, 2 for important, 3 for very important; optionally 0 to exclude the topic. Let b\_i be the question’s published base weight, default 1.
-   Keep only answered, scored questions in topics with positive priority. Let D be their set of topics and A\_d the answered questions in topic d. Normalize each topic’s question weights, then normalize the topic priorities.
-   Question weight: w\_i = \[r\_d / Σ(r\_t for t in D)\] × \[b\_i / Σ(b\_j for j in A\_d)\]. The retained question weights sum to 1. Source completeness does not alter these weights.
-   With equal priorities, each answered topic has equal total influence. Inside a topic, its influence is shared among its answered questions according to their published base weights.
-   If all answers or topics are excluded, return no score. If a topic is only partly answered, show that response coverage. Missing user answers are never inferred from other answers.
-   Bounds and scores describe the retained, answered questions only. They do not claim to represent excluded topics, skipped answers or policies never included in the questionnaire.
-   Question duplication is an editorial defect. If a question is deliberately split into equivalent subquestions, divide its original base-weight budget rather than increasing its influence.

<a id="distance"></a>



## 4\. Calculate similarity per question

Use a small deterministic calculation that anyone can inspect.

-   For user code u\_i and reviewed party code p\_i, similarity s\_i = 1 − |u\_i − p\_i| / 4. The largest possible distance is 4, so s\_i is between 0 and 1.
-   Same code: similarity 1. Adjacent codes: 0.75. Two steps apart: 0.5. Three steps apart: 0.25. Opposite extremes: 0.
-   Example: the user somewhat agrees (+1), and a programme fully supports the precise measure (+2). Their one-step distance gives 0.75 similarity on that question.
-   A neutral user response compared with either extreme gives 0.5. That midpoint behaviour is a consequence of the published distance convention, not proof that the user agrees with half of a programme.
-   Use full numeric precision for calculations; round only presentation. Label results as an overlap or similarity index out of 100, rather than a probability or a literal percentage of promises accepted.

<a id="coverage"></a>



## 5\. Report overlap on known evidence and coverage separately

A high score from little evidence must remain visibly incomplete.

-   For a party, let E be the retained questions with reviewed positions. Coverage C = Σ(w\_i for i in E). Known similarity contribution K = Σ(w\_i × s\_i for i in E).
-   Observed overlap index = 100 × K / C. Evidence coverage = 100 × C. Show known question count, answered question count and the missing topics beside it.
-   If C = 0, return an unavailable index and no ordering. Do not show a neutral score. Not-stated, ambiguous, conflicting and pending records all remain unscored, with distinct explanatory labels.
-   Calculate the same summaries within each topic, dividing by that topic’s retained weight. A party-specific known-evidence index is useful for inspection but cannot be fairly sorted against indices calculated from different evidence sets.
-   Separately report response coverage: how many questions and topics the user answered after excluding zero-priority topics. Evidence coverage is conditional on those answered questions; it must not be presented as coverage of the entire programme.

<a id="bounds"></a>



## 6\. Bound the effect of missing party positions

Describe possible completions of missing evidence without guessing a stance.

-   For a missing position, the minimum possible similarity is m\_i = 1 − max(|u\_i + 2|, |u\_i − 2|) / 4. The maximum is 1 because the missing position could equal the user’s code.
-   If the user is at an extreme, m\_i is 0. For a somewhat-agree/disagree answer it is 0.25. For a neutral answer it is 0.5. This produces tighter bounds than assuming every unknown question could contribute anything from 0 to 1.
-   Let M be the missing positions. Lower bound L = 100 × \[K + Σ(w\_i × m\_i for i in M)\]. Upper bound U = 100 × \[K + Σ(w\_i for i in M)\]. Weights remain normalized over all retained answered questions.
-   These are mathematical missing-evidence bounds under the proposed coding. They are not statistical confidence intervals, measures of editorial reliability or predictions of what the party actually believes.
-   Bounds collapse to the full-question score when all retained positions are known. With no known positions, the UI withholds the index and bounds rather than presenting a theoretical range as evidence about a party.
-   The earlier broad bound from the planning document was conservative. This proposal refines it to the actual possible distances on the five-point coding axis. It still excludes uncertainty in question selection, interpretation and policy implementation.

<a id="comparison"></a>



## 7\. Compare parties on the same evidence set

Do not silently remove poorly documented candidates to manufacture a best match.

-   Define the comparison cohort explicitly: all relevant candidacies by default, or a group deliberately selected by the user. Keep candidacies without usable evidence visible elsewhere in the results.
-   Let H be the retained questions that have reviewed positions for every member of that cohort. Common coverage = Σ(w\_i for i in H). Use exactly that set and the same original question weights for all compared parties.
-   Shared overlap for party a = 100 × Σ(w\_i × s\_ai for i in H) / Σ(w\_i for i in H). Normalize only over the common total; do not recalculate topic priorities differently for each party.
-   Initial pilot policy for a roughly 30-question, 8–10-topic release: at least 20 scored user answers across 6 topics; at least 15 common questions across 6 topics; at least 80% common weighted coverage. These are editorial proposals, not validated scientific cut-offs. Pin final thresholds before release, after the pilot.
-   If those conditions fail, display topic evidence, individual known-evidence summaries and the reason an overall ordering is withheld. The questionnaire remains useful. A deliberately narrow topic selection may support topic comparison without satisfying the broad overall-ordering policy.
-   Never build an overall ordering from pairwise comparisons that each use different question sets. Explicit comparisons between two parties can use their shared set, but must disclose the scope and cannot be combined into an all-party league table.
-   Initial near-score rule: group shared indices within 3 points of the highest member of the group, showing all members’ values. Anchor to that highest value; avoid chaining a long group of adjacent scores whose endpoints differ widely. This is a display convention to validate, not a declaration of statistical equivalence.
-   An ordering on shared evidence describes that cohort and subset. It does not establish an unconditional winner once unresolved party positions or other voting considerations are included.

<a id="example"></a>



## 8\. Worked example: entirely fictional parties

Six synthetic questions across housing, energy and health/care. Priorities are 3, 1 and 2, giving topic weights of 50%, 16.7% and 33.3%. Each topic contains two equally weighted questions.

8\. Worked example: entirely fictional parties · proposal/fictional arithmetic, 7 October 2026
| Fictional party | Index on known evidence | Weighted evidence coverage | Possible full-question index |
| --- | --- | --- | --- |
| Fictional Party X | 90.0 / 100 | 83.3% · 5/6 positions | 83.3–91.7 |
| Fictional Party Y | 83.3 / 100 | 100.0% · 6/6 positions | 83.3–83.3 |
| Fictional Party Z | 100.0 / 100 | 25.0% · 1/6 positions | 41.7–100.0 |

-   Source: the included synthetic fixture and reference engine, calculated on 7 October 2026. No party, position, quotation or user answer in this example describes a real party or person.
-   Party Z’s 100/100 comes from one known position with weight 0.25. Its 25% coverage and wide possible range make it unsuitable for a confident overall comparison.
-   Across X, Y and Z, only one question is common: 25% of the answer weight. The miniature demonstration’s comparison gate blocks ordering the three parties.
-   An explicit comparison of X and Y has five common questions carrying 83.3% of the original weight. On that same subset, X scores 90/100 and Y scores 80/100. Y’s separate 83.3 known-evidence index uses all six questions, so it is a different measure.
-   The toy fixture uses explicitly reduced thresholds suitable for six questions and three topics. The proposed real-release thresholds above would withhold an overall ordering for such a short questionnaire.

<a id="question-example"></a>



## 9\. Inspect the individual arithmetic

All values below are synthetic. Signs describe agreement with each precise statement, not left/right identity.

9\. Inspect the individual arithmetic · proposal/fictional arithmetic, 7 October 2026
| Question / topic | User code | Question weight | Party X code | Party Y code | Party Z code |
| --- | --- | --- | --- | --- | --- |
| h1 · housing | 2 | 25.0% | 2 | 1 | 2 |
| h2 · housing | 1 | 25.0% | 1 | 0 | Not stated |
| e1 · energy | \-2 | 8.3% | 2 | \-2 | Not stated |
| e2 · energy | \-1 | 8.3% | \-1 | \-1 | Not stated |
| c1 · care | 2 | 16.7% | 2 | 1 | Not stated |
| c2 · care | 0 | 16.7% | Not stated | 0 | Not stated |

-   X’s known contribution is 0.25 + 0.25 + 0 + 0.0833 + 0.1667 = 0.75. Its known weight is 0.8333. Therefore its observed index is 100 × 0.75 / 0.8333 = 90.
-   X’s missing care question has user code 0 and weight 0.1667. Its unknown similarity can be 0.5–1, contributing 0.0833–0.1667. Adding that to 0.75 gives the full-question range of 83.3–91.7 out of 100.
-   The interface must expose each answer, party position, similarity, weight and original citation so a reader can reconstruct the result. Use the real release’s passages in production; this example uses explicitly labelled arithmetic definitions instead.

<a id="explanations"></a>



## 10\. Generate explanations from the calculation

Use deterministic explanations and direct source links, with no generated political advice.

-   Per-question record: user answer, reviewed party stance or unknown status, similarity, effective weight, weighted contribution, question ID, evidence IDs and source locators.
-   Show topic indices and evidence coverage, highest-weight agreements and disagreements, and unresolved topics. Agreement explanations come from scored rows only; silence never becomes a disagreement.
-   Use plain templates such as “You somewhat agree; this programme supports the measure; one-step difference; source page 12.” Link the original passage and explain any editorial partial-position coding.
-   Show the exact comparison cohort, common question count and effective scope beside shared indices. Display priority settings and a local option to inspect equal-topic defaults.
-   Display an index out of 100 with sensible rounding. Keep the full-precision result in the reproducible local calculation. Avoid a probability of affiliation, a political-identity label, certainty claims or a voting instruction.

<a id="implementation"></a>



## 11\. Implement it as a small pure browser module

Laravel publishes approved information. Local JavaScript calculates the personal result.

-   Export a pure function accepting the released public bundle, local answers, local topic priorities and an explicit comparison cohort. Return indices, coverage, bounds and explanation records. No network, database, browser storage, time or randomness is needed for the calculation.
-   The included matching-engine.mjs implements this proposal and is browser compatible. It is a reference, not a completed Laravel application, production privacy audit or validator of manifesto truth.
-   The browser fetches the same release bundle regardless of answers. Do not put answers into Laravel forms, Inertia submissions, URLs, log messages or analytics payloads. Clear resets the in-memory answers and results; optional saving/exporting is a separate deliberate action.
-   Questionnaire and programme comparison use the same records. Browsing party-to-party proposals requires no user profile; matching adds the locally supplied preferences.
-   Pin the public source commit, algorithm version, dataset release, document hashes and method settings. An optional local export may include the answers and priority settings needed for reproduction, with a clear privacy notice.
-   Anonymous metrics remain outside this function. They must not receive the answer vector, party scores, selected constituency or explanation records. Their separate reviewed flow can collect only the approved coarse metric contributions.

Spanish is the default website interface; Catalan, Basque and Galician interfaces may be enabled after fluent review. All original code identifiers, JSON keys, reason codes, comments and developer documentation use English. Visible copy belongs in reviewed locale catalogs; the browser maps engine outputs to localized explanations without changing the calculation. The reference module’s English diagnostic strings must not be rendered directly. See the [required project language policy](project-language-policy.md).

<a id="verification"></a>



## 12\. Verify arithmetic, then validate the editorial method

The reference implementation passes 15 meaningful verification groups. That establishes calculation behaviour, not the neutrality of a future real dataset.

-   Verified: golden weighted examples, common-set comparisons, identical/opposite stances, neutral versus skipped answers, unresolved positions, missing evidence, party/question ordering, direction inversion, weight splitting, missing-evidence bounds, excluded topics, near-score grouping, malformed metadata, historical-source rejection and absence of input mutation or storage/network APIs.
-   Pilot the real questions for comprehension and whether partial positions can be mapped consistently. Record independent reviewer agreement, disputes and the cost of finding page-level evidence.
-   Run sensitivity analyses on synthetic profiles: equal-topic versus chosen weights, dropping one question, changing ordinal spacing, duplicated issue coverage and contested position codings. A small score change should not be presented as a substantive political finding.
-   Do not estimate empirical error bars without an appropriate statistical model. Review coding uncertainty separately from the missing-evidence bounds. If rankings depend on contested interpretations, expose that dependence or withhold a stronger conclusion.
-   The release method remains a proposal until reviewed and piloted. Freeze the published rule set before launch; change it through visible versioned decisions, never to increase result acceptance or support for a party.

Integration requirements REQ-03 through REQ-06 and REQ-10 remain pending for real data and production. Shared evidence can be too sparse for an all-candidacy ranking; never bypass that limitation. Validate finite bounded weights and normalized totals before release. Test sensitivity to partial topic answers, alternative coding and contested mappings separately from mathematical missing-evidence bounds. See the [release acceptance matrix](development-plan.md#acceptance-contract).
