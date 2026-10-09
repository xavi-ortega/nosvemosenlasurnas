# Active commit plan

## L001 chore: restart from verified scaffold and restore CI

Status: completed

Dependencies: 

- Verified complete private backup outside repository and one-time unpublished local restart.
- Selective CI repairs, mandatory staged-tree gate, current lean contracts and restart guidance.
- Remote main remains the unchanged initial scaffold. Complete backup includes history, index, all working and ignored files and passes byte/hash/Git checks.
- Every new commit passes exact staged CI; no prior product task is marked complete from obsolete history.
- Full backup comparison, git fsck and bundle verify; live remote-main check.
- Exact staged CI and hook-preservation tests.

## L002 refactor: keep a stateless public app and retire editorial runtime

Status: completed

Dependencies: L001

- Public-only route/provider/config baseline; retire unused backoffice code and dependencies after inventory.
- Coherent removal of obsolete auth/review tests alongside their features, keeping relevant public/security checks.
- Preserve ade3970 cleanup as a distinct verified commit in rebuilt history.
- No visitor/editor auth, review queues, staffed approval gate, server quiz state or production OCR worker.
- Do not destructively drop existing non-synthetic DB data; preserve and classify prepared uncommitted work.
- Public/error/stateless browser and PHP smoke tests; route/dependency audit.
- Full staged CI before the removal commit; no check weakening for surviving capabilities.

## L003 feat: accept owner source manifests and candidacy coverage

Status: completed

Dependencies: L002

- Versioned file/provenance/election/candidacy manifest and local import command.
- Reject wrong election, duplicate identities, escaped paths and missing applicability.
- All supplied/official scoped candidacies remain visible, including missing programmes; dates are configurable.
- Manifest/path/encoding/election fixtures including omitted and territorial candidacies.

## L004 feat: extract native programme text locally

Status: completed

Dependencies: L003

- Bounded text/HTML/native-PDF extraction with original page text and normalization offsets.
- No runtime downloads/uploads/worker or executed HTML. Input errors are reported without fabricated text.
- Preserve Unicode, headings, negation, numbers, page labels and source hashes. Image-only sources report unavailable text.
- Native/local parser fixtures: columns, script HTML, malformed/huge documents, ligatures, source hash changes and timeout.

## L005 feat: validate exact contextual citations

Status: completed

Dependencies: L004

- Immutable citation IDs, page/section/offset locators, original/context quotation and link policy.
- Exact quotes resolve to original retained text; search normalization never creates a quotation.
- Reject unsafe URLs/markup, corrupt bytes and mismatched source/election. Missing original or uncertain transcription is labelled.
- Unicode range/negation/quantity/context/locator/link and corrupt source tests.

## L006 feat: compile grounded programme positions automatically

Status: completed

Dependencies: L005

- Local preparation adapter and position/rationale/citation schema, deterministic content compiler.
- Record preparation tool/prompt/source versions; compiled public content is inspectable.
- No human attestations or staff queue. Automatic interpretation is labelled and uncertainty stays null.
- Reject invented quotes, unsupported mappings, cross-election/coalition leakage, contradictions and invalid scales. Semantic checks are not a claim of perfect truth.
- Grounded/contradictory/ambiguous/off-topic/negated and hostile-document synthetic cases.
- Reproduce compiled output from retained prepared content and validate every scored citation.

## L007 feat: build and verify immutable public bundles

Status: completed

Dependencies: L006

- Content schema, stable IDs and sorted versioned JSON/manifest/hashes, fixed public bank and active pointer.
- No private data or dev fixtures in a production bundle; compiler supports synthetic local builds separately.
- Browser validates compatibility/hash before scoring; session bank remains pinned.
- Reproducibility, malformed schema/hash, mismatched assets/data and atomic pointer tests.

## L008 feat: browse and search cited programmes

Status: completed

Dependencies: L007

- Spanish programme/topic catalogue, coverage states and local text search.
- Useful without quiz; missing sources/candidacies are visible.
- Safe source rendering with keyboard/mobile/empty/loading/error states and no account.
- Catalogue/search/citation/coverage browser flows; XSS and no-personal-state network assertions.

## L009 feat: compare programme proposals locally

Status: completed

Dependencies: L008

- Local candidacy/constituency/topic selection and readable comparison cards/table.
- Every difference/overlap shows cited propositions and unknowns, not invented absence.
- Same public bundle fetched independent of selection; filters do not leak personal scope.
- Two/many/missing/territorial candidacy browser cases, mobile reflow, keyboard and no selection traffic/storage.

## L010 feat: open original contextual evidence

Status: completed

Dependencies: L009

- Citation drawer/reader with source metadata, context, original-language quote and official link.
- Readable exact text and accessible return focus; escaped content and safe new-tab behavior.
- Summaries/translations never replace the source quote. Reader failures leave comparison usable.
- Original-source parity, labelled translation, malicious text, broken link and keyboard reader checks.

## L011 feat: explain coverage and support bundle corrections

Status: completed

Dependencies: L010

- Plain methodology/coverage pages, local append-only change/withdrawal file and correction command.
- Explain interpretation and limited evidence; no claim that a supplied PDF proves a mapping.
- Correct/rebuild bundle without staff workflow; withdrawn releases invalidate scoring while keeping source history.
- Correction/withdrawal/session-version browser checks and rollback rehearsal.

## L012 feat: prepare balanced current-source question banks

Status: completed

Dependencies: L006

- General/specific question bank, stable scales and topic/family budgets; Spanish question content separated from arithmetic.
- Questions are one concrete neutral proposition; unsure/skip are distinct from neutral.
- Budget/family duplicate and source applicability checks; no requirement to inherit historical wording.
- Bank coverage/range/weight/duplicate/citation and neutral wording lint fixtures; label semantic lint limits.

## L013 feat: calculate deterministic browser-local policy overlaps

Status: completed

Dependencies: L007, L012

- Pure TypeScript engine with similarity, fixed budgets, priorities, missing evidence and same-set comparisons.
- Formula and zero-denominator behavior match plan; ties/partial evidence remain honest.
- No ML/network/persistence or score probability. Common evidence gates control ordering.
- Independent exact examples, zero/ignored/unsure, common-denominator, permutation and locale invariants.

## L014 feat: choose balanced informative follow-up questions

Status: completed

Dependencies: L013

- Small local coverage/spread/priority/burden selector with stable ID ties and balanced fallback.
- General ten-topic start then optional specific blocks; no forced 100% or hidden candidate removal.
- Edits recompute selection and family limits; exhaustion/errors do not reveal results.
- Balanced breadth, close/identical profiles, reordering, family redundancy, fallback and edited-answer cases.

## L015 feat: expose honest overlap and evidence coverage

Status: completed

Dependencies: L013

- Separate overlap/coverage/count diagnostics and conservative common-evidence threshold.
- Eight numeric answers/four topics/60% shared answered weight before broad ordering; otherwise cited partial results.
- A percentage is overlap only; it can fall as answers arrive. All candidacies/unknowns and denominator remain visible.
- Threshold edges, skipped questions, different evidence sets, ties and minority-candidacy coverage.

## L016 feat: build the private questionnaire state machine

Status: completed

Dependencies: L014, L015

- Preparation/answer/checkpoint/explicit finish/refinement/reset/exit states entirely in browser memory.
- Safe loading/hash/error behavior; back/edit and skip preserve semantic IDs.
- No personalised results in pre-finish DOM, a11y, titles, URLs or notifications.
- State transitions, errors, edits/reset, reload behavior and pre-finish result leakage browser tests.

## L017 feat: offer ten-question checkpoints and five more

Status: completed

Dependencies: L016

- Neutral checkpoints with finish/continue/review/exit and optional unnamed highest comparable overlap.
- No confidence claim, premature party reveal, automatic finish or penalized refusal.
- Presentation count differs from answered weight; insufficient evidence gets plain text, not a fabricated number.
- Ten-plus-five, many skips, bank exhaustion, no common evidence, keyboard/reduced-motion checks.

## L018 feat: reveal cited results after deliberate finish

Status: completed

Dependencies: L011, L017

- Party overlaps/ties, coverage and answered-topic agreement/disagreement with exact citations and refinement action.
- Results use pinned release and same-set ordering rules; no voting intention/probability or inferred unanswered beliefs.
- Explicit finish required even after exhaustion; refinement acknowledges already seen parties.
- Reveal/non-reveal, score-citation parity, partial/tie/unknown, withdrawal and informed-refinement flows.

## L019 feat: polish the fast accessible public experience

Status: completed

Dependencies: L009, L018

- Coherent modern home/comparison/quiz/results; responsive controls, focus, text/contrast and restrained motion.
- Spanish public/error/accessibility/help strings; no effort on unused admin languages.
- Keyboard/axe/reflow/reduced-motion and declared asset/cold-load/local-CPU budgets pass; no invented participant certification.
- Public browser flows at mobile/desktop, axe, keyboard checklist and measured build/CPU/load budgets.

## L020 test: verify local reset export and private quiz traffic

Status: completed

Dependencies: L019

- Explicit local export, clear-file warning, complete reset and automated whole-journey privacy assertions.
- Exports never reveal unfinished results or upload a profile.
- No private state in requests/URLs/cookies/storage/errors; comparison and result/source navigation use public assets only.
- Intercept actual browser traffic/storage across answer/edit/finish/refine/export/exit/restart and failure flows.

## L021 feat: add voluntary randomized feedback on fit and policies

Status: completed

Dependencies: L018

- Separate opt-in result-fit and random public policy survey, fixed schema and epsilon=1 randomized response per metric.
- Never reuse quiz answers or include party/scores/scope. Refusal/failure leaves core usable.
- crypto RNG, category mapping and per-visit composition are explicit; repeat visits are not falsely bounded or unique voters.
- Deterministic injected-RNG branches, distribution/estimator fixtures, consent/no-consent and independent survey selection.

## L022 feat: store bounded aggregate counters in SQLite

Status: completed

Dependencies: L021

- Stateless strict-schema aggregate endpoint and atomic weekly categorical counters only.
- Reject profile fields/free text/IDs/oversize/unknown versions; no raw event rows/body logging or Laravel session.
- WAL/locking/busy timeout measured on intended SQLite setup; counter failure safely skips contributions.
- HTTP schema/no-cookie/error/body logging and parallel counter updates/retries/global budget tests.

## L023 feat: report aggregate agreement with uncertainty

Status: completed

Dependencies: L022

- CLI report estimator and closed-week static snapshots with survey wording, counts, uncertainty and suppression.
- Minimum 500 contributions and <=10pp interval half-width; no demographic/party/geography/real-time filtering.
- Equal-proposition topic summaries disclose coverage; statistical overlap/negative noise and voluntary/bot bias remain explicit.
- Known randomized counts, small cells, impossible estimates, intervals, incomplete topics and snapshot differencing boundaries.

## L024 test: verify metric privacy refusal failures and limits

Status: completed

Dependencies: L020, L023

- End-to-end metric schema/log/storage inventory, anomaly pause and documented host-probe commands.
- Raw local selections do not appear outside browser; payloads contain only approved randomized symbols/public IDs.
- Default collection disabled until actual launch flow passes; no claim of guaranteed anonymity/unique people or election prediction.
- Opt-in/refusal/retries/outage/malicious payload/aggregate concurrency browser+HTTP tests; no production collection.

## L025 data: import supplied current programmes and regenerate the bank

Status: blocked

Dependencies: L007, L011, L012

- Real owner-supplied current manifests/programmes, coverage and grounded compiled questions/positions.
- No human-review workforce; automated compiler outputs are cited and labelled.
- Actual dates/candidacies/election/permissions checked against supplied authoritative records; no silent historical fallback.
- Real-source import/compiler/citation checks and inspect generated coverage/error report; keep provenance.

## L026 chore: prepare one-host deployment backup and rollback

Status: completed

Dependencies: L002, L007

- Portable Laravel/static/SQLite production template, local build/import workflow, encrypted backup and restore/rollback commands.
- No paid provisioning or deployment in this commit; no Boost/dev/parser/worker in public runtime.
- TLS/caching/log/DB permissions and backup retention documented for one host; existing source/counter data preserved.
- Source-only/core deployment remains independently preparable. Include counter backup/concurrency checks when L022 exists; otherwise keep collection disabled and record the missing metric branch.
- Production-mode local smoke, SQLite backup during writes, restore/hash/previous-bundle and missing-disk checks.

## L027 test: verify complete release candidate and recovery

Status: blocked

Dependencies: L020, L025, L026

- Coherent actual-source local release candidate and scoped test/load/privacy/citation/recovery report.
- All applicable current-source/quiz/comparison/privacy/a11y/security/asset checks pass for the exact core candidate. Include metric checks only when L024 has passed and collection is proposed; otherwise explicitly keep collection disabled.
- Synthetic passes do not substitute for actual hosted proxy/log/TLS evidence; remaining host facts are clearly listed.
- Full unchanged CI, representative full bank browser journeys, real source parity, bounded load and restore/rollback.

## L028 docs: prepare the single concrete public launch action

Status: blocked

Dependencies: L027

- One launch packet with exact release/domain/provider/quote, public and metric flags, host probe results/remaining inputs and rollback.
- No fabricated user approval and no publication/purchase/live collection within packet preparation.
- One owner action approves only the named scope/costs; metrics may stay disabled without blocking quiz/comparison. No staffing gates.
- A passing core packet does not require L021-L024 completion. Metric activation additionally requires L024 evidence and the actual hosted flow/notice; incomplete metrics are visibly disabled, never silently certified.
- Check packet hashes/config against candidate; hosted probes only on already authorized infrastructure.
- If no host is authorized, mark actual flow pending and supply reproducible commands; do not claim launch-ready.

## L029 feat: optionally import image-only programmes with local OCR

Status: planned

Dependencies: L004, L005

- Optional bounded local OCR/transcription adapter, model/tool versions and quality flags.
- No production OCR service, staff visual attestations or forced scanned-source adoption.
- Keep original page images/links where permitted; uncertain negation/numbers/conditions unscored. Label OCR rather than claiming source-exact parity.
- Real local OCR quality/limits on permitted samples and low-confidence/quantity/negation failures.

## L030 feat: optionally translate the public interface

Status: planned

Dependencies: L019

- Optional complete ca/gl/eu public packs with original quotations preserved and identical semantic IDs.
- No formal fluent reviewer/quorum gate; uncertainty is disclosed and incomplete/uncertain packs stay disabled.
- No admin translations or impact on scores, weights, citations, consent and private state.
- Enabled key/placeholder and public-browser coverage, semantic/score/selection parity; keep existing checks.
