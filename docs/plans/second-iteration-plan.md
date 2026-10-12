# Second iteration: clear documented affinity and thematic 2023 programmes

quiz-2023-iteration-2-v1.0.0 · Planning complete; application implementation has not started.

Plan the next local iteration around an ordered horizontal affinity chart, proposal-led evidence, official links, twenty balanced starters and ten-question extensions. Replace evidence-only normalization with the owner-requested zero-contribution shared denominator, include every candidacy, and add a separate public programme-by-topic journey. The product is the historical 2023 edition; later election editions are separate pages.

## Second iteration scope

A result that can be understood at a glance, with evidence available through a separate proposal journey.

- Owner requests recorded on 12 October 2026 authorize this planning increment. This file is an implementation-ready proposal; no second-iteration application change is complete.
- The accepted owner changes replace 10 + 5 with 20 + 10, include all candidacies without a chooser, treat missing party positions as zero documented contribution within the common denominator, and add a thematic programme page.
- Keep the first iteration, its signed/unsigned history, 2023 source notebooks, public pointer and local acceptance records intact. Q001-Q030 retain their actual first-iteration statuses.
- Present the product as Cuestionario 2023. Publication state and internal validation state are separate metadata; do not present the quiz as a public draft or confuse local completion with a deployed release.
- The future Cuestionario 2026 is a separate menu entry once its own evidence-backed edition exists. Do not publish a dead link, reuse 2023 positions, or treat current surveys as 2026 programme evidence.
- Metrics and optional translations remain deferred and disabled. No accounts, new dependencies, purchases, push, deployment or scheduler is part of this plan.

## Documented affinity on a shared denominator

An absent position contributes zero matching evidence; it is never encoded as a neutral party stance.

- Use similarity 1 - abs(answer - position) / 4 only for a directly authored numeric party position. Unknown, conflicting, missing-programme and unverified cells contribute 0 to the numerator and retain their weight in the denominator.
- Use ten fixed positive topic budgets. Within each topic, distribute its budget over the numeric answers actually supplied, with equal policy-family budgets and equal weights inside a family. The same answer universe, topic weights and denominator apply to every candidacy/profile before sorting.
- Topic contribution = sum(weight * documented similarity) / sum(weight of the numeric answers in that topic). Overall affinity = 100 * sum(topic budget * topic contribution) / sum(all topic budgets). A missing programme can therefore have 0% documented affinity without any inferred political disagreement.
- The complete aggregate requires at least one numeric answer in every active topic. If all questions in a topic are skipped/unsure, leave the overall percentage pending and offer a clear path to review that topic; show available proposal/topic detail without fabricating the user stance. Do not silently treat user uncertainty as a negative answer or a zero party contribution.
- Every topic starts enabled with weight 1. Optional importance, if retained after the simple entry flow, uses Normal / Me importa especialmente (1 / 2); no topic-zero setting may remove a theme. Importance changes the shared denominator for all parties, including zero contributions for missing important positions.
- Coverage = weighted share with a documented party position. Evidence coverage is distinct from affinity and visible beside each bar. Affinity cannot exceed coverage under this contract; neither is confidence, a voting probability, a unique-voter statistic or a known-only score.
- Version this as documented-affinity-v2. The old common-intersection threshold and comparisonCohort leaderboard are superseded for this edition. Keep the old engine/reference and historical acceptance as historical evidence; do not weaken old tests or silently relabel its scores.
- Partial known-only overlap must leave the primary result/checkpoint entirely. Retain it only if an explicitly named optional method view needs it; it must never substitute for the headline score.

## All candidacies, including territorial ones

Inclusion is automatic; ballot eligibility and programme applicability are information.

- Remove the quiz candidacy/constituency exclusion mechanism. Every real 2023 candidacy is included in the fixed bank, scoring, maximum calculation and result list. There is no party-selection screen and no hidden evidence-qualified subset.
- Preserve all 59 reconciled denominations, 52 constituencies and 550 ballot records. Missing programmes remain visible with 0 documented contribution and a Sin programa localizado label, not an opposition label.
- Audit programme variants before implementation. A mechanical scan of applicable constituency profiles currently finds four denominations with two different profiles each (Sumar, UPL, Coalición Existe, España Vaciada): 63 distinct applicable profiles across 59 denominations. This is a planning observation, not certification of final semantic grouping.
- Recommended national presentation: score every distinct applicable programme profile and label its territorial scope; merge truly identical profiles for display. Keep distinct territorial variants as clearly named rows tied to their common denomination, not extra parties. Never choose the most favourable variant or impose one territory on all.
- Show a plain count of candidacies and explain variant rows once. Original coalition identities remain exact. Do not combine members into invented choices or propagate a scoped quotation outside its applicability.
- A future optional province context can highlight ballot availability without removing rows or changing who is included. It is not required to start the quiz.

## Compact visual result overview

Names, horizontal bars and percentages lead; full analysis opens on request.

- Use one horizontal axis from 0 to 100%, fixed for all rows, with quiet ticks at 0 / 25 / 50 / 75 / 100. Order all programme rows by unrounded documented affinity descending; exact ties share a visual tie label and stable alphabetical order. Explain rounding when distinct underlying scores display the same percentage; do not fabricate an exact tie.
- Each row contains the official name (and territory when needed), a neutral single-colour bar, the percentage as text, a short evidence-coverage label, and a clearly named link to proposal detail. No quotations or three-agreement/three-difference blocks render in the overview.
- All rows remain accessible in the ordered result list. Collapsing a long list for readability must say how many rows are hidden and must never change scoring or inclusion. Default plan: a single scrollable list, not an arbitrary top-three winner panel.
- A single sentence explains the measure: Coincidencia con las propuestas que hemos podido documentar. Missing information contributes no coincidence; display Sin postura documentada separately from disagreement.
- A 0% bar needs a visible zero marker/text; missing programmes do not resemble a documented 100% disagreement. Coverage can appear as a compact n / N data label rather than a competing progress chart.
- Keep edition and answer/topic count nearby. Methodology, export, review and reset become quiet secondary actions. The chart is a navigable list with visible text values, not a progressbar announcing completion.
- Preserve negative rent-control relation in the detailed proposal even when aggregate affinity ranks that programme first. Never infer agreement from its total score.

## Evidence through proposals

Choose a programme, then a topic or proposal, then inspect its exact source.

- Primary flow: result chart → programme detail → topic/proposal list → proposal detail → source/context. A second entry from results opens Explorar por tema, using the same detail components.
- Programme detail begins with a compact affinity/coverage summary and topic list. Within a topic, show concise decisions tagged Coincides / Difieres / Sin postura documentada; the user chooses which to open.
- Proposal detail shows Tu respuesta, Qué proponía el programa de 2023, and the precise agreement/difference relation, followed by Ver cita y fuente. Keep no-answer cases separate.
- Original quotation, page/section, conditions, authored interpretation and full context are one optional disclosure. Preserve exact text and link to the official publication beside the quotation.
- Back navigation restores the same chart row/topic, scroll and focus in memory. Edition-only routes are public; never put user answers, party affinity, progress or personalized result IDs in URLs.
- The same programme/topic detail is usable from the public comparison page without answers; personalized relation labels appear there only after explicit quiz finish and are never persisted.

## Official source links

Every citation has a meaningful source link and truthful provenance.

- Audit all 45 citation document records plus the preserved source registry; carry a verified official programme URL or official campaign landing page independently of the exact archived/mirrored evidence URL.
- Use the original official programme URL when available; an official page publishing the programme is sufficient. Page-level PDF anchoring is optional and must not be invented.
- For a preserved original, provide Fuente oficial and Copia conservada as distinct links where both are verified. Preserve the SHA-256 and exact evidence locator; never call a mirror official or substitute a newer programme for a dead 2023 URL.
- If no official source can be verified, state Fuente oficial no localizada and keep the verified provenance link. This exception is visible and remains an acquisition task; do not fabricate a link to satisfy the UI.
- Use descriptive Spanish link names including publisher/document/year, visible external-link behaviour, HTTPS validation and no referrer. No automatic third-party fetch, embedded viewer or opener access.
- Citation source links are present in proposal details, public comparison details and deliberate local exports. No citation body is orphaned from its document record.

## 20 questions, then ten more

A simple checkpoint describes the current result without disclosing party identity.

- Begin with 20 distinct questions spanning every released core category: two per each of the current ten topics, with different policy families. The initial 20 replace the old ten starter IDs.
- Checkpoints occur at 20, 30, 40, 50, 60, 70 and 80 when a full ten-question block adds useful unseen evidence. Eighty is an upper bound from this bank, not a completion target; stop earlier when useful balanced questions are exhausted. Never pad or offer an unlabeled smaller block.
- Exactly two main checkpoint actions: Ver mi resultado and Responder 10 más. Review lives in one quiet link; reset/export are outside the checkpoint action cluster.
- When all ten topics have a numeric answer and some documented weighted evidence exists, show only the highest documented affinity, without names/logos/source clues. Example template: Tu mayor coincidencia hasta ahora es del :percent. Puedes ver el resultado o responder 10 preguntas más para explorar otras propuestas. Follow with Puede subir o bajar.
- The maximum is max of all profile scores computed with documented-affinity-v2, not the first alphabetical row or the old partialIndex. A rounded tie remains anonymous. This is the best observed value now, not the maximum theoretically attainable affinity.
- If every score is zero because evidence is missing, say Todavía no hemos podido confirmar coincidencias con estas respuestas; distinguish this from documented disagreement. If a topic has no numeric answer, report topic coverage and provide review instead of an invented maximum.
- No identity-specific score, citation, ranked row or personalized name enters the answering DOM before deliberate finish. Anonymous maximum disclosure is the owner-authorized exception. Exhaustion never automatically reveals results.
- Keep native answer order, optional help, back/edit, skip and unsure. Progress reads Pregunta 7 de 20, then Pregunta 21 de 30; it describes the current agreed block, not an obligation to reach 80.

## Editorial salience with guaranteed breadth

Concern research orders questions within diversity constraints; it never adjusts matching weights.

- Use outputs/quiz-2023-second-iteration-research.json, based on the September 2026 official CIS study 3577 (4,042 interviews, fieldwork 1-4 September). Housing and economic issues lead national concerns; health is particularly prominent personally. Keep national and personal columns separate.
- The concrete initial-20 proposal below cycles through all ten topics once, then a second time. It is an editorial selection among already authored IDs, not a machine-generated question bank or a direct survey-ranking transformation.
- Migration (19.7% among national concerns) is a genuine content gap. Add or replace a suitable directly authored question only after reopening complete applicable source context, preserving exceptions and verifying mappings. Do not claim the starter bank covers it today.
- Review topic taxonomy before locking starter IDs: several current energy questions concern animals, and the pension bank includes a child benefit. Correct labels/weights only through a versioned semantic review; do not hide these gaps behind a quota count.
- For each later ten, prioritize underrepresented topics and unseen families first, then useful documented evidence, then authored editorial salience. Aim for at least five topics, cap two questions per topic, and use a stable ID tie break; if a full useful block cannot satisfy these rules, stop and offer finish.
- A party-leading adaptation must not select questions to increase a current winner score. Under the new zero-contribution rule, missingness must not make a candidate disappear from next-question decisions.
- Store ordering version, research date, authored rationale and starter IDs in the immutable bank; pin them for the session. Refresh research locally before implementation/release if newer official data is available. No runtime trends request or private-answer transmission.
- Salience is opinionated and disclosed in Cómo elegimos las preguntas. It has no claim to objective political importance, and it does not remove lower-salience categories.

## Programmes by topic in the top menu

A second public journey reuses the complete preserved 2023 analysis.

- Menu proposal: Inicio / Cuestionario 2023 / Programas 2023 / Cómo funciona. Future Cuestionario 2026 and Programas 2026 appear only when that separate edition exists.
- Programas 2023 starts with readable topic choices. Selecting a topic opens a list of concrete proposals, each with programme positions, contextual qualifications and missing information. Start with the released authored proposal matrix; preserve the broader notebooks as a provenance/research layer.
- A proposal opens all candidacy/profile positions grouped as A favor / Posición intermedia / En contra / Sin postura documentada, only according to that exact question rubric. Qualified +1 support and -1 opposition retain their direction and a visible Con condiciones label with the exact restriction. Every candidacy is accounted for. No silence-to-neutral inference or semantic generation from notebook keywords.
- Provide programme-detail and official-source links from each position. Desktop can offer a focused side-by-side view of a few programmes on explicit request; mobile uses readable programme rows. A reading filter may change visible content, never questionnaire inclusion.
- Do not render a 59-column spreadsheet or dump entire notebooks into the public page. Topic → proposal → programme/source is the default path. Missing documents and uncovered policies stay explicit.
- Reuse edition-aware generic public routes, current fixed bank and accessible components. Keep quiz state in memory while moving between quiz/results/comparison in the app shell, using generic paths without personalized URL data. Refresh starts a fresh session; no default browser persistence.
- The comparison page is usable without taking the quiz and never reveals unfinished personalized results. Shared source data is public; a personalized overlay is opt-in navigation after finish, not an API request.

## Visual and accessible design

A quiet civic interface whose visual emphasis is the affinity chart.

- Retain the established civic palette: ink #182235, background #F4F7FB, surface #FFFFFF, action #3449A4, muted #526078, selected #176B71. Use one neutral bar fill and structural dividers; no party colours, gradients or decorative card wall.
- Reuse locally served font assets. Keep names and percentages aligned, plain Spanish captions, body text at least 18px on mobile where appropriate, and a bounded reading width for proposal details.
- Desktop chart row: name/territory → bar → numeric percentage/coverage → detail link. Mobile: name and percentage on the first line, full-width bar below, coverage and detail action on the third. No horizontal document-level overflow.
- One visual list with an accessible textual equivalent; chart marks are decorative when their name/value are already text. Do not misuse progressbar/meter as political certainty. Maintain 0-100 axes and legibility for 0, 100, equal rounded values and long names.
- Visible keyboard focus, native controls, 44px targets, text contrast 4.5:1, controls/focus contrast 3:1, 320px reflow, 200/400% zoom and reduced motion. Navigation restores focus/scroll and does not announce every chart row as a live update.
- Inspect compact overview, unknown-heavy overview, party/topic/proposal details, checkpoint, public comparison, loading/error and mobile states. Automation supports a practical walkthrough; no recruited approval panel is required.

## Acceptance and migration

Prove the new denominator and journey independently using the real 2023 bank.

- Independent arithmetic oracle: five equal-weight numeric answers, two exact documented matches and three unknowns = 40% affinity / 40% coverage. Explicit party value 0 versus user +2 gives 50% for that proposition; an unknown party value contributes 0%, never 50%.
- Other cases: complete agreement 100%; complete documented opposition 0%; missing programme 0 with missing-source label; ambiguity/conflict 0; topic importance 2 doubles its budget for every party; user skip/unsure never becomes a numeric opinion.
- Verify ten-topic total and family weighting without calling the implementation under test. Adding a new topic answer must not implicitly increase the topic budget. Editing may raise or lower scores; unknown never increases the numerator; 0 <= affinity <= coverage <= 100.
- Browser regressions: all 59 denominations and every audited profile included automatically, no candidacy chooser; first 20 cover all ten topics; +10 exactly once per activation; identities hidden until finish; max computed from the new metric; sorted bars agree with export and proposal relationship.
- Recheck the rent case, official-link association, citation context, navigation/back, mobile/keyboard/reduced motion, no personalized traffic/URLs/storage and edition/session pinning. New comparison must not trigger programme fetches depending on answers.
- Create a new immutable engine/bank version and candidate acceptance records. Keep the old byte-identical bank, engine, recovery evidence and release pointer until the new version passes applicable checks. Updating the UI label alone is not deployment eligibility.
- Regenerate plans, run docs:build/check:plans and affected checks. Before any local commit run scripts/check-staged.py on the exact staged tree and keep hooks. Use unsigned commits per owner; work on main, no automatic push.
- Second iteration is locally complete only after real-bank scoring, journey, programme-comparison and visual/privacy acceptance. PUBLIC-LAUNCH remains deferred until concrete hosting/domain/cost/source-rights/privacy artifacts and explicit owner authorization.

## Concrete first-20 editorial proposal

Pending evidence, migration-gap and taxonomy review; these are existing authored questions, not a newly released order.

1. El Estado debería poner un precio máximo al alquiler de viviendas en zonas con precios muy altos. (housing; rent-price-cap). Housing salience; concrete rental decision.
2. El impuesto sobre la renta debería ajustarse para descontar el efecto de la subida de los precios. (taxes; adjust-income-tax-for-inflation). Economic concern; one concrete earnings-tax decision, not a proxy for all economic worries.
3. La jornada laboral máxima debería bajar a 35 horas semanales o menos, manteniendo el mismo sueldo. (employment; shorter-workweek). Employment-quality concern; a distinct working-time decision.
4. La sanidad pública debería incluir la psicoterapia entre sus servicios para quienes la necesitan. (health; public-psychotherapy-care). Personal health concern; concrete public-care provision.
5. Las ayudas de luz y calefacción para hogares vulnerables deberían pagarse directamente a la persona consumidora. (energy; direct-vulnerable-household-energy-aid). Everyday energy support; editorial relevance, not a direct CIS category equivalence.
6. Todas las familias deberían poder acceder gratis a una plaza de educación infantil de 0 a 3 años. (education; free-early-education). Education and family access; a different topic from health/work.
7. Cada propuesta de ley debería tener una ficha pública que muestre quién negoció o intermedió en su elaboración. (institutions; public-legislative-influence-record). Institutional transparency; a concrete proposal rather than attitudes toward named politicians.
8. Los pueblos pequeños deberían contar con transporte a demanda y a precio reducido hacia su municipio de referencia. (transport; low-cost-rural-on-demand-transport). Transport and territorial inclusion; topic quota despite lower survey salience.
9. Los permisos de maternidad y paternidad deberían ampliarse hasta durar al menos seis meses. (rights; birth-leave-at-least-six-months). Rights and care; concrete parental leave.
10. Las pensiones públicas deberían actualizarse según lo que sube el coste de la vida. (pensions; pensions-cost-of-living). Pension purchasing power; completes the first ten-topic cycle.
11. Las viviendas públicas deberían conservarse sin poder venderse al sector privado. (housing; retain-public-housing-ownership). Second housing decision; different family from rent caps.
12. Se debería mantener un impuesto específico sobre las grandes fortunas de las personas. (taxes; permanent-large-fortunes-tax). Second tax decision; different family from earnings-tax adjustment.
13. El salario mínimo debería subir cada año más que el aumento de los precios. (employment; minimum-wage-above-inflation). Second employment decision; pay rather than working time.
14. Debería eliminarse el copago de los medicamentos que cubre la sanidad pública. (health; phase-out-prescription-copay). Second health decision; medicine payments rather than psychotherapy.
15. Se debería alargar la vida útil de las centrales nucleares que ya existen en España. (energy; extend-existing-nuclear). Second energy decision; production rather than household aid.
16. El comedor escolar debería ser gratuito para todo el alumnado de las etapas obligatorias. (education; free-compulsory-school-meals). Second education decision; school services rather than early education.
17. Los trámites con la Administración deberían poder realizarse en persona, sin obligar a usar internet. (institutions; keep-in-person-public-services). Second institutional decision; access rather than legislative transparency.
18. Se deberían limitar los vuelos dentro de España cuando exista una alternativa adecuada en tren. (transport; rail-alternative-flight-limits). Second transport decision; flights rather than rural mobility.
19. Debería mantenerse el derecho a solicitar la eutanasia en las condiciones previstas por la ley. (rights; retain-euthanasia-right). Second rights decision; a separate family from parental leave.
20. La pensión de jubilación de quienes han cotizado debería estar exenta del impuesto sobre la renta. (pensions; retirement-pension-income-tax-exemption). Second pension question under the current taxonomy; flag the pensions/tax overlap for editorial review.

## Implementation sequence

### R001 Lock documented-affinity semantics and all-candidacy profile identity

Status: planned. Depends on: none. Estimated share of implementation effort: 15%.

- New metric/profile specification and independent expected-case ledger.
- Audit national/scoped profiles and current topic taxonomy; preserve applicability.

Acceptance:

- Unknown/conflict/missing cells contribute zero and remain in the same denominator for every programme.
- All denominations/territorial variants included without user selection; no favourable-variant merge.
- User-unanswered topics are distinct from absent party positions.

Verification:

- Independent weighted calculations and all-profile/source audit.
- Review the eight owner feedback requirements against the proposed contract.

### R002 Finalize trend-based balanced starters and useful ten-question blocks

Status: planned. Depends on: R001. Estimated share of implementation effort: 12%.

- Versioned editorial order, first-20 IDs and rationales.
- Directly authored migration/gap correction only when full applicable evidence supports it.

Acceptance:

- First 20 span every core topic twice using distinct families.
- Later ten span at least five topics with at most two per topic; exhaustion stops honestly.
- Current trends change order only, not 2023 evidence or score weights.

Verification:

- Real bank topic/family/coverage audit and editorial reread.
- Deterministic ordering/skip/edit/exhaustion cases.

### R003 Publish verified official-source links into the local candidate bank

Status: planned. Depends on: R001. Estimated share of implementation effort: 10%.

- Official publisher versus preserved-original URL fields and validation.
- Citation-link audit across every used document.

Acceptance:

- Every quotation has a verified official link or an explicit documented unavailable exception.
- No substituted newer source, mislabeled mirror or broken document association.
- Payload remains within existing bounds; privacy and referrer policy preserved.

Verification:

- Real-source link/provenance checks and quote-to-document associations.
- Existing schema/hash/compiler checks; no automatic semantic generator.

### R004 Implement the versioned zero-contribution score across all profiles

Status: planned. Depends on: R001. Estimated share of implementation effort: 15%.

- documented-affinity-v2 engine, coverage and anonymous maximum.
- Updated local exports and independent regression coverage.

Acceptance:

- All profiles share the same topic/family answer denominator and inclusion policy.
- Affinity never exceeds coverage; unknown never reads as neutral or opposed.
- No old partialIndex/common-cohort result survives as the new headline.

Verification:

- Meaningful engine tests and independent real-bank arithmetic/citation calibration.
- Rent regression, weights, unknown/conflict, all-topic pending and tie cases.

### R005 Implement the simple 20 + 10 quiz and anonymous checkpoint

Status: planned. Depends on: R002, R004. Estimated share of implementation effort: 12%.

- Edition-labelled entry, question progression and two-action checkpoint.
- No candidacy/province exclusion or topic-zero setting.

Acceptance:

- 20 questions initially and exactly ten more when useful; no auto reveal.
- Anonymous maximum uses new metric and sufficient topic/answer evidence.
- No personalized identity enters pre-finish DOM or network/storage.

Verification:

- Affected browser journey/keyboard/privacy tests and actual mobile checkpoints.
- Fast clicks, edit/back, skip/unsure, refresh and exhaustion.

### R006 Build horizontal result bars and proposal-led details

Status: planned. Depends on: R003, R004. Estimated share of implementation effort: 12%.

- Ordered 0-100 result chart with coverage and missing labels.
- Party/topic/proposal/citation flow using shared components.

Acceptance:

- Overview contains no full quote or programme-analysis wall.
- Every row is readable on mobile, keyboard accessible and linked to detailed proposals.
- All identities/variants are accounted for; zero and ties are honest.

Verification:

- Actual real-bank visual review at 320px and desktop; 200/400% zoom.
- Chart/export/detail parity, a11y and independent rent relation.

### R007 Add the public thematic 2023 programme comparison and edition menu

Status: planned. Depends on: R002, R003, R006. Estimated share of implementation effort: 10%.

- Programas 2023 topic/proposal/programme flow with fixed public bank.
- Edition navigation and public generic routes preserving local in-memory quiz state.

Acceptance:

- Comparison works without the quiz, includes all candidacies and distinguishes missing evidence.
- No 59-column default table, pasted notebook wall or personalized fetch.
- Cuestionario 2023 is the visible product label; 2026 remains a separate future edition.

Verification:

- Public comparison navigation/keyboard/mobile states and link validation.
- Unfinished-state privacy, no persistence and edition routing tests.

### R008 Verify the full real-bank local iteration and prepare its review packet

Status: planned. Depends on: R005, R006, R007. Estimated share of implementation effort: 14%.

- Real 2023 candidate acceptance, screenshots/walkthrough and recovery/version evidence.
- Synchronized plans, journal and local review packet.

Acceptance:

- All second-iteration behaviours pass real-bank acceptance; old bank/history/source data preserved.
- Metrics remain disabled and PUBLIC-LAUNCH is not agent-approved.
- No task completed solely from a mock chart or synthetic data.

Verification:

- Required affected checks, docs:build/check:plans and exact-index commit gate.
- Final ordinary-user journey, source links, local privacy, recovery and rollback.

## Decisions to finalize during implementation

- Semantic grouping and names for the four territorial-profile variants, using retained original context.
- Supported migration decision and starter replacement if full 2023 source evidence permits it; no invented question.
- Topic-taxonomy corrections and consequent engine/version calibration before freezing the first 20.
- Verified official source URL availability for every citation document; visible exceptions where the official publication is lost.

## Verified research sources

[Official September 2026 CIS catalogue](https://datos.gob.es/es/catalogo/ea0040772-barometro-de-septiembre-2026), [results PDF](https://www.cis.es/documents/20117/14250083/es3577mar.pdf) (questions 18R/19R, PDF pages 11/12, printed pages 7/8), [technical sheet](https://www.cis.es/documents/20117/14250083/FT3577.pdf) (fieldwork 1-4 September 2026, 4,042 interviews).

See outputs/quiz-2023-second-iteration-research.json for hashes, exact measures, visual verification and limitations. Survey salience orders historical questions; it does not update 2023 party positions.
