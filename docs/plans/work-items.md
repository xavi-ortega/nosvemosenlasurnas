<!-- Generated from the canonical plan; run npm run docs:build. -->

# Atomic work items

## BOOT-01: Record selected identity

**Status:** completed

**Macro task:** TASK-02

**Owner role:** Engineering

**Requirements:** REQ-08, REQ-13, REQ-16

**Capabilities:** local_bootstrap

**Locale:** es

**Prerequisites:** None

**Gates:** None

### Deliverables

- Project metadata and preserved naming catalog

### Acceptance

- Exact user-selected brand recorded; domain remains unverified and unpurchased

### Verification

- Check DEC-11 and naming selection record against the user message

### Evidence

- outputs/bootstrap-report.json#BOOT-01

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## BOOT-02: Install a project-scoped runtime

**Status:** completed

**Macro task:** TASK-02

**Owner role:** Engineering

**Requirements:** REQ-08, REQ-13, REQ-16

**Capabilities:** local_bootstrap

**Locale:** es

**Prerequisites:** BOOT-01

**Gates:** None

### Deliverables

- Ignored .tools runtime plus scripts/php and scripts/composer wrappers

### Acceptance

- PHP/Composer run without modifying global shell profiles; official download provenance recorded

### Verification

- Version output and wrapper invocation; verify runtime is ignored by Git

### Evidence

- outputs/bootstrap-report.json#BOOT-02

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## BOOT-03: Create Laravel and Boost

**Status:** completed

**Macro task:** TASK-02

**Owner role:** Engineering

**Requirements:** REQ-08, REQ-13, REQ-16

**Capabilities:** local_bootstrap

**Locale:** es

**Prerequisites:** BOOT-02

**Gates:** None

### Deliverables

- Laravel scaffold, lockfiles and generated Boost guidelines/skills

### Acceptance

- Blade foundation with development-only Boost; no ML or visitor questionnaire endpoint

### Verification

- Composer validation, locked version inspection and installed project-skill inventory

### Evidence

- outputs/bootstrap-report.json#BOOT-03

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## BOOT-04: Transfer persistent policies

**Status:** completed

**Macro task:** TASK-02

**Owner role:** Engineering

**Requirements:** REQ-08, REQ-13, REQ-16

**Capabilities:** local_bootstrap

**Locale:** es

**Prerequisites:** BOOT-03

**Gates:** None

### Deliverables

- AGENTS.md, .ai guideline and tracked project rules

### Acceptance

- Spanish interface/English code and evidence/privacy discipline survive Boost updates

### Verification

- Compare copied policy and review the custom guideline alongside generated Boost guidance

### Evidence

- outputs/bootstrap-report.json#BOOT-04

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## BOOT-05: Create safe Spanish public bootstrap

**Status:** completed

**Macro task:** TASK-02

**Owner role:** Engineering

**Requirements:** REQ-08, REQ-13, REQ-16

**Capabilities:** local_bootstrap

**Locale:** es

**Prerequisites:** BOOT-04

**Gates:** None

### Deliverables

- Preparation view, localized errors and disabled feature config

### Acceptance

- Spanish even with English browser preferences; public home creates no session/cookie; unsupported product routes remain unavailable

### Verification

- PublicBootstrapTest asserts language, headers, no cookies, safe HTML/JSON errors and rejected POST

### Evidence

- outputs/bootstrap-report.json#BOOT-05

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## BOOT-06: Verify and repair bootstrap dependencies

**Status:** completed

**Macro task:** TASK-02

**Owner role:** Engineering

**Requirements:** REQ-08, REQ-13, REQ-16

**Capabilities:** local_bootstrap

**Locale:** es

**Prerequisites:** BOOT-05

**Gates:** None

### Deliverables

- Local test/build/audit results and pinned development dependency fix

### Acceptance

- Meaningful tests and build pass; known critical development dependency fixed without forced major changes

### Verification

- Laravel tests, npm build, Composer validation/audit and npm audit; runner smoke check

### Evidence

- outputs/bootstrap-report.json#BOOT-06

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## BOOT-07: Prepare the engineering handoff

**Status:** completed

**Macro task:** TASK-02

**Owner role:** Engineering

**Requirements:** REQ-08, REQ-13, REQ-16

**Capabilities:** local_bootstrap

**Locale:** es

**Prerequisites:** BOOT-06

**Gates:** None

### Deliverables

- Canonical executable plan, README, loop guide, report, local Git and approval packet

### Acceptance

- All inherited requirements preserved; task/gate DAG validated; secrets/runtime excluded; app and original planning snapshot agree

### Verification

- Renderer checks including managed view, reference verification and staged-file review

### Evidence

- outputs/bootstrap-report.json#BOOT-07
- outputs/approval-gate-01.json
- work/execution-journal.jsonl

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## GOV-01: Finalize neutrality and election scope

**Status:** planned

**Macro task:** TASK-01

**Owner role:** Project owner + named specialist

**Requirements:** REQ-01, REQ-12, REQ-14, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** BOOT-07

**Gates:** GATE-01

### Deliverables

- Charter and scope decision record

### Acceptance

- Confirm Congress-first proposal, constituency/coalition treatment, equal inclusion and evidence limitations without promising complete programmes

### Verification

- User/editorial review against scope section and official election records

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## GOV-02: Assign real owners and independent reviewers

**Status:** planned

**Macro task:** TASK-01

**Owner role:** Project owner + named specialist

**Requirements:** REQ-01, REQ-12, REQ-14, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** GOV-01

**Gates:** GATE-01

### Deliverables

- Named operator, responsibility roster, conflicts and available hours

### Acceptance

- Distinct actual people supply independent approvals; accounts or two AI agents never satisfy quorum; escalation/on-call responsibility assigned

### Verification

- Human identity/independence review and capacity sign-off

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## GOV-03: Resolve open-source and source rights

**Status:** planned

**Macro task:** TASK-01

**Owner role:** Project owner + named specialist

**Requirements:** REQ-01, REQ-12, REQ-14, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** GOV-01

**Gates:** GATE-01

### Deliverables

- Code/data/docs licence decision and source redistribution matrix

### Acceptance

- Original code licence explicitly chosen; framework MIT metadata alone is insufficient; rights restrictions determine citation/archive/mirror access

### Verification

- Rights specialist review for planned real sources and publication forms

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## GOV-04: Set a funded operating ceiling

**Status:** planned

**Macro task:** TASK-01

**Owner role:** Project owner + named specialist

**Requirements:** REQ-01, REQ-12, REQ-14, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** GOV-02

**Gates:** GATE-01

### Deliverables

- Cost model, funding owner and ordinary domain/provider quotes

### Acceptance

- Free access has funded review, hosting, database, archive, backups and contingency; no visitor profiling funding model

### Verification

- Owner approves costs/renewals and available reviewer hours

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## GOV-05: Set performance and recovery targets

**Status:** planned

**Macro task:** TASK-01

**Owner role:** Project owner + named specialist

**Requirements:** REQ-01, REQ-12, REQ-14, REQ-16, REQ-18

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** GOV-04

**Gates:** GATE-01

### Deliverables

- Measured target proposal and traffic envelope

### Acceptance

- Calibrate bundle/scoring/page latency, load assumptions and RPO/RTO from devices/pilot; retain proposed labels until measured
- Record named low-end/older devices and network profiles, UI versus full evidence budgets and lab-versus-field distinction from experienceDesign.

### Verification

- Operations review against release-contract proposals and pilot measurements

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## GOV-06: Prepare public accountability policies

**Status:** planned

**Macro task:** TASK-01

**Owner role:** Project owner + named specialist

**Requirements:** REQ-01, REQ-12, REQ-14, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** GOV-02, GOV-03

**Gates:** GATE-01

### Deliverables

- Spanish methodology, privacy/help, contribution, conflicts and correction policy drafts

### Acceptance

- Explain overlaps versus voting decisions, coverage limits, missing evidence, exact quotations, free access and public verification plainly

### Verification

- Independent editorial, privacy and Spanish copy review; no unreviewed legal assurances

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## DATA-01: Model election and candidacy scope

**Status:** planned

**Macro task:** TASK-03

**Owner role:** Editorial + engineering

**Requirements:** REQ-01, REQ-02

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** GOV-01, BOOT-07

**Gates:** GATE-01

### Deliverables

- English schema/migrations and applicability contract

### Acceptance

- Election/chamber/constituency, candidacy, coalition and programme version are explicit; unique programme reuse never implies inherited positions

### Verification

- Schema constraints and national/regional/coalition scope fixtures

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## DATA-02: Create an all-candidacy inventory

**Status:** planned

**Macro task:** TASK-03

**Owner role:** Editorial + engineering

**Requirements:** REQ-01, REQ-02

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** DATA-01

**Gates:** GATE-01

### Deliverables

- Official-source inventory with pending/missing/withdrawn states

### Acceptance

- Every known scoped candidacy visible; distinguish provisional list from final proclaimed register; missing document never removes a party

### Verification

- Reconciliation test including additions, mergers, withdrawals and no-programme cases

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## DATA-03: Reconcile official candidacies and changes

**Status:** planned

**Macro task:** TASK-03

**Owner role:** Editorial + engineering

**Requirements:** REQ-01, REQ-02

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** DATA-02

**Gates:** GATE-01

### Deliverables

- Repeatable official-register reconciliation and change review queue

### Acceptance

- Final completeness based on official register when available; discrepancies require human resolution rather than silent replacement

### Verification

- Compare a reviewed official snapshot with published inventory and record mismatches

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## DATA-04: Model source provenance and status

**Status:** planned

**Macro task:** TASK-03

**Owner role:** Editorial + engineering

**Requirements:** REQ-01, REQ-02

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** DATA-01

**Gates:** GATE-01

### Deliverables

- Document/source version and status schema

### Acceptance

- Official URL, scope, publication/acquisition time, hash, rights and original language preserved; old programmes explicitly historical and never scored as current

### Verification

- Reject stale-election, wrong-scope and implicit coalition inheritance fixtures

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## DATA-05: Create the editorial coverage dashboard

**Status:** planned

**Macro task:** TASK-03

**Owner role:** Editorial + engineering

**Requirements:** REQ-01, REQ-02

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** DATA-02, DATA-04

**Gates:** GATE-01

### Deliverables

- Restricted inventory/coverage dashboard

### Acceptance

- Show per-candidacy/document/topic gaps and review counts without visitor data; incomplete evidence is visible

### Verification

- Admin authorization and missing/conflicting/pending coverage checks

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## SOURCE-01: Build bounded document acquisition

**Status:** planned

**Macro task:** TASK-04

**Owner role:** Engineering

**Requirements:** REQ-02, REQ-13

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** DATA-04

**Gates:** GATE-01

### Deliverables

- Allowlisted official-source fetcher with limits

### Acceptance

- Block private/local/link-local targets, redirect bypasses, oversized/decompression-bomb and untrusted content; no URL supplied by public visitors

### Verification

- Adversarial SSRF/redirect/content-limit tests in isolated fixtures

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## SOURCE-02: Archive immutable source versions

**Status:** planned

**Macro task:** TASK-04

**Owner role:** Engineering

**Requirements:** REQ-02, REQ-13

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** SOURCE-01, GOV-03

**Gates:** GATE-01

### Deliverables

- Hashed source archive and provenance records

### Acceptance

- A changed source creates a new version; original bytes retained subject to rights; permissions prevent unapproved mirroring

### Verification

- Hash/dedup/version tests and rights-access review

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## SOURCE-03: Extract PDF/text in isolation

**Status:** planned

**Macro task:** TASK-04

**Owner role:** Engineering

**Requirements:** REQ-02, REQ-13

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** SOURCE-02

**Gates:** GATE-01

### Deliverables

- Sandboxed extraction worker and OCR fallback

### Acceptance

- Untrusted parsing bounded by CPU/memory/time; preserve printed page versus PDF index; OCR uncertainty flagged

### Verification

- Malformed/scanned/misaligned-page fixtures and resource-limit tests

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## SOURCE-04: Build exact citation locators

**Status:** planned

**Macro task:** TASK-04

**Owner role:** Engineering

**Requirements:** REQ-02, REQ-13

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** SOURCE-03

**Gates:** GATE-01

### Deliverables

- Excerpt/page/section/paragraph locator model

### Acceptance

- Quotes stay exact, conditions and surrounding context reachable; separate reviewed translation never overwrites original

### Verification

- Human compares rendered source page with locator and excerpt

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## SOURCE-05: Make acquisition jobs repeatable

**Status:** planned

**Macro task:** TASK-04

**Owner role:** Engineering

**Requirements:** REQ-02, REQ-13

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** SOURCE-02, SOURCE-03

**Gates:** GATE-01

### Deliverables

- Idempotent database-backed queues, scheduler and failure dashboard

### Acceptance

- Retries do not overwrite reviewed evidence; failed/quarantined documents visible; job inputs contain no visitor political data

### Verification

- Duplicate/retry/crash tests and bounded scheduler run

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## SOURCE-06: Detect source revisions and withdrawals

**Status:** planned

**Macro task:** TASK-04

**Owner role:** Engineering

**Requirements:** REQ-02, REQ-13

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** SOURCE-04, SOURCE-05

**Gates:** GATE-01

### Deliverables

- Version-diff and correction impact queue

### Acceptance

- Changed or withdrawn official evidence flags affected mappings/releases; never silently changes active scores

### Verification

- Mutation fixture identifies all affected citations and preserves history

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## SOURCE-07: Separate drafting from publication

**Status:** planned

**Macro task:** TASK-04

**Owner role:** Engineering

**Requirements:** REQ-02, REQ-13

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** SOURCE-04

**Gates:** GATE-01

### Deliverables

- Optional machine-assisted extraction draft workflow

### Acceptance

- AI output is untrusted draft only, public/synthetic inputs only, no automatic stance/scored publication; ML not required

### Verification

- Draft cannot cross review/publication permissions in feature tests

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## EDIT-01: Create invite-only editorial authentication

**Status:** planned

**Macro task:** TASK-06

**Owner role:** Engineering + editorial

**Requirements:** REQ-02, REQ-13, REQ-15

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** BOOT-07, GOV-02

**Gates:** GATE-01

### Deliverables

- Admin accounts, MFA and recovery design

### Acceptance

- No visitor accounts/self-registration; named reviewer roles separated; session/CSRF protections intact on state-changing routes

### Verification

- Authentication, MFA recovery, CSRF and unauthorized-route tests

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## EDIT-02: Implement editorial permissions and audit

**Status:** planned

**Macro task:** TASK-06

**Owner role:** Engineering + editorial

**Requirements:** REQ-02, REQ-13, REQ-15

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** EDIT-01, DATA-04

**Gates:** GATE-01

### Deliverables

- Policies and immutable administrative audit records

### Acceptance

- Only assigned roles submit/review/publish; audit stores editorial actions, never questionnaire vectors

### Verification

- Role matrix and tampering/unauthorized access tests

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## EDIT-03: Build evidence review screens

**Status:** planned

**Macro task:** TASK-06

**Owner role:** Engineering + editorial

**Requirements:** REQ-02, REQ-13, REQ-15

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** EDIT-02, SOURCE-04

**Gates:** GATE-01

### Deliverables

- Spanish evidence forms and original-source viewer

### Acceptance

- Show exact quote, scope, conditions, version, rationale and unknown reason; translated UI never alters source

### Verification

- Public/admin language and source-fidelity checks

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## EDIT-04: Enforce independent approval quorum

**Status:** planned

**Macro task:** TASK-06

**Owner role:** Engineering + editorial

**Requirements:** REQ-02, REQ-13, REQ-15

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** EDIT-03

**Gates:** GATE-01

### Deliverables

- Two-person approval model bound to content hash

### Acceptance

- Actual-person independence and conflicts verified; editor self-approval, duplicate accounts, stale hashes and revoked approvals cannot satisfy quorum

### Verification

- Feature tests for bypasses plus separate human independence sign-off

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## EDIT-05: Handle disagreements and unknowns

**Status:** planned

**Macro task:** TASK-06

**Owner role:** Engineering + editorial

**Requirements:** REQ-02, REQ-13, REQ-15

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** EDIT-04

**Gates:** GATE-01

### Deliverables

- Adjudication and unknown/conflicting/pending state machine

### Acceptance

- Unresolved conflicts remain unscored; decisions preserve both rationales and attributable evidence; changes require fresh approval

### Verification

- Disagreement/expiry/adjudication fixtures and editorial review

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## EDIT-06: Publish corrections with impact history

**Status:** planned

**Macro task:** TASK-06

**Owner role:** Engineering + editorial

**Requirements:** REQ-02, REQ-13, REQ-15

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** EDIT-05, SOURCE-06

**Gates:** GATE-01

### Deliverables

- Correction intake, audit history and release-impact workflow

### Acceptance

- Retraction preserves history, identifies affected release/question IDs and provides Spanish notice without exposing reporter data

### Verification

- Correction/withdrawal end-to-end drill and privacy review

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## PILOT-01: Select current-election pilot material

**Status:** planned

**Macro task:** TASK-05

**Owner role:** Two independent editorial reviewers

**Requirements:** REQ-02, REQ-03, REQ-05, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** DATA-02, SOURCE-04, GOV-02

**Gates:** GATE-01

### Deliverables

- Reviewed pilot sample manifest

### Acceptance

- National/regional/coalition, conditional, missing and conflicting cases covered with current-election sources; lack of programmes blocks real pilot, not local engineering

### Verification

- Human scope/fidelity verification; synthetic pipeline exercise labelled separately

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## PILOT-02: Measure independent coding and effort

**Status:** planned

**Macro task:** TASK-05

**Owner role:** Two independent editorial reviewers

**Requirements:** REQ-02, REQ-03, REQ-05, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** PILOT-01, EDIT-04, EDIT-05

**Gates:** GATE-01

### Deliverables

- Pilot decisions, disagreements and time/capacity report

### Acceptance

- Two reviewers code independently before reconciliation; measure agreement, review time and common evidence coverage

### Verification

- Compare independent records and classify disagreements without averaging away conflict

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## PILOT-03: Calibrate workload and methodology

**Status:** planned

**Macro task:** TASK-05

**Owner role:** Two independent editorial reviewers

**Requirements:** REQ-02, REQ-03, REQ-05, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** PILOT-02, GOV-04

**Gates:** GATE-01

### Deliverables

- Staffing/coverage forecast and rubric revision proposal

### Acceptance

- Unique source scopes, reviewer hours and missing material determine viable release; no assumed complete evidence or fixed launch promise

### Verification

- Editorial lead reviews forecast and presents GATE-02 candidate evidence

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## QUESTION-01: Define a balanced topic blueprint

**Status:** planned

**Macro task:** TASK-07

**Owner role:** Editorial + language reviewers

**Requirements:** REQ-01, REQ-02, REQ-03, REQ-05

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** GOV-01, DATA-02

**Gates:** GATE-01

### Deliverables

- Topic weights, question inclusion criteria and shared glossary

### Acceptance

- Policy importance/discrimination, not party advantage, drives selection; no party slogan or loaded premise; weight splitting cannot inflate topic

### Verification

- Independent balance review across all scoped candidacies and policy domains

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## QUESTION-02: Write Spanish questions and answer semantics

**Status:** planned

**Macro task:** TASK-07

**Owner role:** Editorial + language reviewers

**Requirements:** REQ-01, REQ-02, REQ-03, REQ-05

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** QUESTION-01

**Gates:** GATE-01

### Deliverables

- Versioned reviewed question/answer content

### Acceptance

- One concrete policy per question; answer IDs have explicit rubric meaning; ABCD labels are presentation, not inferred ordinal scores; unsure/skip differ from neutral

### Verification

- Spanish comprehension pilot and rubric/ID checks for asymmetric policy options

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## QUESTION-03: Map questions to reviewed current evidence

**Status:** planned

**Macro task:** TASK-07

**Owner role:** Editorial + language reviewers

**Requirements:** REQ-01, REQ-02, REQ-03, REQ-05

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** QUESTION-02, EDIT-05, PILOT-02

**Gates:** GATE-01

### Deliverables

- All-candidacy question/evidence matrix

### Acceptance

- Every scored stance has exact applicable source and two independent approvals; absence/ambiguity/conflict/pending remains unknown

### Verification

- Matrix completeness and approval/hash/scope tests plus human quote review

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## QUESTION-04: Approve calibrated comparison policy

**Status:** planned

**Macro task:** TASK-07

**Owner role:** Editorial + language reviewers

**Requirements:** REQ-01, REQ-02, REQ-03, REQ-05

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** QUESTION-03, PILOT-03

**Gates:** GATE-01

### Deliverables

- Pinned weights, shared-coverage thresholds and near-score convention

### Acceptance

- Calibrate thresholds and unknown bounds using real pilot; never compare scores on different evidence sets; adequate shared evidence required for ordering

### Verification

- Sensitivity/coverage review and reproducible counterexamples in GATE-02 packet

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## QUESTION-05: Version content without semantic drift

**Status:** planned

**Macro task:** TASK-07

**Owner role:** Editorial + language reviewers

**Requirements:** REQ-01, REQ-02, REQ-03, REQ-05

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** QUESTION-04

**Gates:** GATE-01

### Deliverables

- Question/rubric version and migration rules

### Acceptance

- Changing meaning, scale or topic weights creates a version; active local sessions retain compatible IDs/content

### Verification

- Compatibility tests and editorial change-impact review

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## MATCH-01: Integrate the pure reference engine

**Status:** planned

**Macro task:** TASK-08

**Owner role:** Engineering

**Requirements:** REQ-04, REQ-05, REQ-06, REQ-08

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** BOOT-07, QUESTION-01

**Gates:** GATE-01

### Deliverables

- Browser module around reference implementation

### Acceptance

- No network/storage side effects; positions/weights arithmetic unchanged; no Rubix dependency; technical fixtures clearly synthetic

### Verification

- 15 reference verification groups plus browser-bundle parity checks

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## MATCH-02: Define reviewed release/engine adapters

**Status:** planned

**Macro task:** TASK-08

**Owner role:** Engineering

**Requirements:** REQ-04, REQ-05, REQ-06, REQ-08

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** MATCH-01, DATA-04

**Gates:** GATE-01

### Deliverables

- Typed data validation and English stable reason codes

### Acceptance

- Schema/version/hash failures disable scoring; adapter maps reason codes to reviewed Spanish copy, never exposes exception details

### Verification

- Malformed/mismatched/corrupt release and localized-error tests

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## MATCH-03: Keep questionnaire state in local memory

**Status:** planned

**Macro task:** TASK-08

**Owner role:** Engineering

**Requirements:** REQ-04, REQ-05, REQ-06, REQ-08

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** MATCH-02, QUESTION-02

**Gates:** GATE-01

### Deliverables

- Local answer/priority/constituency state controller

### Acceptance

- No state in query/hash paths, POST, cookies, local storage, telemetry or logs; resetting clears memory; no Livewire round trips

### Verification

- Actual network/storage inspection for answer/edit/back/reset/error flows

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## MATCH-04: Build private questionnaire navigation

**Status:** planned

**Macro task:** TASK-08

**Owner role:** Engineering

**Requirements:** REQ-04, REQ-05, REQ-06, REQ-08, REQ-18

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** MATCH-03

**Gates:** GATE-01

### Deliverables

- Accessible Spanish question/priority/skip/review screens

### Acceptance

- Keyboard/mobile operation and explicit unsure/skip; no directional answer defaults; state survives locale changes only by stable IDs

### Verification

- Meaningful navigation/empty/error and answer-ID invariance checks

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## MATCH-05: Present overlaps, coverage and bounds

**Status:** planned

**Macro task:** TASK-08

**Owner role:** Engineering

**Requirements:** REQ-04, REQ-05, REQ-06, REQ-08

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** MATCH-04, QUESTION-04

**Gates:** GATE-01

### Deliverables

- Spanish result/citation views

### Acceptance

- Explain matching is documented policy overlap; show coverage/unknown range and cited agreement/disagreement; insufficient shared evidence removes broad ordering
- Only explicit finish renders personalised results. Show user answer, reviewed stance, alignment/disagreement, weights and exact contextual citation for each scored answered question; unscored gaps and unasked public topics remain explicit.

### Verification

- Worked and adversarial sparse/common-evidence cases; independent comprehension review
- Post-finish insight/source parity, common-set headline/group/limited-evidence cases, accessible full-candidacy exploration and no inferred preferences for unanswered topics.

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## MATCH-06: Protect release-pinned sessions

**Status:** planned

**Macro task:** TASK-08

**Owner role:** Engineering

**Requirements:** REQ-04, REQ-05, REQ-06, REQ-08

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** MATCH-02, RELEASE-01

**Gates:** GATE-01

### Deliverables

- Session manifest pin and compatible asset loading

### Acceptance

- No mixing versions after deployment; withdrawn releases disable affected results and explain locally; static requests never depend on private state

### Verification

- Release-change/cache-corruption/withdrawal tests during an active session

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## MATCH-07: Implement explicit local result export

**Status:** planned

**Macro task:** TASK-08

**Owner role:** Engineering

**Requirements:** REQ-04, REQ-05, REQ-06, REQ-08

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** MATCH-05, MATCH-06

**Gates:** GATE-01

### Deliverables

- User-triggered Spanish download/print without upload

### Acceptance

- Export only on deliberate action; explain file contains political preferences if included; locale/version/citations exact; no result-bearing share URL

### Verification

- Download/print privacy and citation fidelity checks

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## MATCH-08: Prove production matching properties

**Status:** planned

**Macro task:** TASK-08

**Owner role:** Engineering

**Requirements:** REQ-04, REQ-05, REQ-06, REQ-08

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** MATCH-05, MATCH-06, QUESTION-05

**Gates:** GATE-01

### Deliverables

- Adversarial/property tests and score parity evidence

### Acceptance

- Input/order/direction/scale/topic-split invariants, missing bounds and common evidence hold in shipped assets; locale changes preserve IDs/scores/coverage

### Verification

- Run meaningful properties over pinned public fixtures and minified production bundle

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## EXPLORE-01: Create the public evidence bundle

**Status:** planned

**Macro task:** TASK-09

**Owner role:** Engineering + editorial

**Requirements:** REQ-01, REQ-02, REQ-06, REQ-09

**Capabilities:** source_explorer

**Locale:** es

**Prerequisites:** DATA-02, EDIT-05

**Gates:** GATE-01

### Deliverables

- Public-only scoped registry/evidence serializer

### Acceptance

- All candidacies and missing statuses included; exclude account/audit/reporter/secret fields; only reviewed citations public

### Verification

- Serializer allowlist and all-candidacy fixture tests

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## EXPLORE-02: Build Spanish party/topic comparison

**Status:** planned

**Macro task:** TASK-09

**Owner role:** Engineering + editorial

**Requirements:** REQ-01, REQ-02, REQ-06, REQ-09

**Capabilities:** source_explorer

**Locale:** es

**Prerequisites:** EXPLORE-01

**Gates:** GATE-01

### Deliverables

- Accessible Blade/browser comparison screens

### Acceptance

- Same fields/visual treatment for every party; filter locally with no constituency/interest submission; clear source status and programme scope

### Verification

- Side-by-side missing/coalition/regional cases and network inspection

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## EXPLORE-03: Build citation and context navigation

**Status:** planned

**Macro task:** TASK-09

**Owner role:** Engineering + editorial

**Requirements:** REQ-01, REQ-02, REQ-06, REQ-09

**Capabilities:** source_explorer

**Locale:** es

**Prerequisites:** EXPLORE-02, SOURCE-04

**Gates:** GATE-01

### Deliverables

- Exact excerpts, conditions, source pages and original/translated view

### Acceptance

- Citations reach precise retained source version or honest rights-safe locator; external links suppress referrers; no forged quote translations

### Verification

- Human quote/page checks and broken-link/unsafe-link tests

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## EXPLORE-04: Publish methodology and coverage views

**Status:** planned

**Macro task:** TASK-09

**Owner role:** Engineering + editorial

**Requirements:** REQ-01, REQ-02, REQ-06, REQ-09, REQ-18

**Capabilities:** source_explorer

**Locale:** es

**Prerequisites:** EXPLORE-03, GOV-06

**Gates:** GATE-01

### Deliverables

- Spanish help/privacy/methodology/coverage screens

### Acceptance

- Clearly distinguish current programme evidence from history and policy matching from turnout/vote intention; no real-data readiness claim from fixtures

### Verification

- Editorial/Spanish copy review and empty/missing/correction flows

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## EXPLORE-05: Design neutral branding and discovery

**Status:** planned

**Macro task:** TASK-09

**Owner role:** Engineering + editorial

**Requirements:** REQ-01, REQ-02, REQ-06, REQ-09

**Capabilities:** source_explorer

**Locale:** es

**Prerequisites:** BOOT-01, EXPLORE-04

**Gates:** GATE-01

### Deliverables

- Selected brand, Spanish metadata and honest launch scope

### Acceptance

- Voting-related brand can be lively; party results/copy stay evidence-based and equal; no unsupported election procedures/turnout claims

### Verification

- Presentation balance review and citation check for factual voting information

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## LANG-01: Implement shared reviewed dictionaries

**Status:** planned

**Macro task:** TASK-12

**Owner role:** Engineering + fluent reviewers

**Requirements:** REQ-08, REQ-09

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** BOOT-07

**Gates:** GATE-01

**Conditional prerequisites:** {"questionnaire":["MATCH-02"]}

### Deliverables

- English semantic keys, Spanish catalog and browser dictionary

### Acceptance

- One reviewed content source across Blade/browser; enabled locale allowlist; no browser-triggered English UI; pluralizer remains English

### Verification

- Locale negotiation/fallback, key identity and localized formatting tests

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## LANG-02: Enforce UI string and catalog CI

**Status:** planned

**Macro task:** TASK-12

**Owner role:** Engineering + fluent reviewers

**Requirements:** REQ-08, REQ-09

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** LANG-01

**Gates:** GATE-01

### Deliverables

- Template/AST-aware lint, coverage and reviewed allowlist

### Acceptance

- Catch hardcoded visible strings, duplicate/unresolved keys, missing enabled-locale values and placeholder/plural variants; dynamic keys enumerated

### Verification

- Positive/negative fixture checks and CI run on actual Blade/TS catalogs

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## LANG-03: Review English code and Spanish copy

**Status:** planned

**Macro task:** TASK-12

**Owner role:** Engineering + fluent reviewers

**Requirements:** REQ-08, REQ-09

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** LANG-02, EXPLORE-04

**Gates:** GATE-01

**Conditional prerequisites:** {"questionnaire":["MATCH-02"]}

### Deliverables

- Separate naming/documentation and fluent content review records

### Acceptance

- Original identifiers/routes/schema/API keys/comments/tests/docs English; all public/admin/a11y/errors/exports Spanish; no automatic language detector as sole review

### Verification

- Human review and enabled-surface inventory

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## LANG-04: Verify accessible Spanish flows

**Status:** planned

**Macro task:** TASK-12

**Owner role:** Engineering + fluent reviewers

**Requirements:** REQ-08, REQ-09, REQ-18

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** EXPLORE-05, LANG-03

**Gates:** GATE-01

### Deliverables

- Keyboard/screen-reader/mobile/browser acceptance record

### Acceptance

- Normal/empty/error public/admin screens, citations, formatting and enabled exports pass; questionnaire checks apply only when enabled

### Verification

- Automated a11y plus manual assistive technology/comprehension review on candidate assets

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## LANG-05: Prepare complete Catalan surface pack

**Status:** planned

**Macro task:** TASK-12

**Owner role:** Engineering + fluent reviewers

**Requirements:** REQ-08, REQ-09, REQ-18

**Capabilities:** source_explorer, questionnaire

**Locale:** ca

**Prerequisites:** LANG-01, EXPLORE-04

**Gates:** GATE-01

**Conditional prerequisites:** {"questionnaire":["QUESTION-02","MATCH-08","ADAPT-07"]}

### Deliverables

- ca catalog/content/glossary and fluent approval pack

### Acceptance

- Complete proposed enabled surfaces reviewed by fluent humans; exact original source retained; questionnaire translations require scale/ID invariance

### Verification

- ca coverage/plural/a11y/error checks, fluent political wording review and questionnaire score parity when applicable
- Repeat applicable REQ-18 theme/motion/layout/assistive-technology/comprehension checks for every enabled surface; longer translated text must not obscure controls or uncertainty.

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## LANG-06: Prepare complete Galician surface pack

**Status:** planned

**Macro task:** TASK-12

**Owner role:** Engineering + fluent reviewers

**Requirements:** REQ-08, REQ-09, REQ-18

**Capabilities:** source_explorer, questionnaire

**Locale:** gl

**Prerequisites:** LANG-01, EXPLORE-04

**Gates:** GATE-01

**Conditional prerequisites:** {"questionnaire":["QUESTION-02","MATCH-08","ADAPT-07"]}

### Deliverables

- gl catalog/content/glossary and fluent approval pack

### Acceptance

- Complete proposed enabled surfaces reviewed by fluent humans; exact original source retained; questionnaire translations require scale/ID invariance

### Verification

- gl coverage/plural/a11y/error checks, fluent political wording review and questionnaire score parity when applicable
- Repeat applicable REQ-18 theme/motion/layout/assistive-technology/comprehension checks for every enabled surface; longer translated text must not obscure controls or uncertainty.

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## LANG-07: Prepare complete Basque surface pack

**Status:** planned

**Macro task:** TASK-12

**Owner role:** Engineering + fluent reviewers

**Requirements:** REQ-08, REQ-09, REQ-18

**Capabilities:** source_explorer, questionnaire

**Locale:** eu

**Prerequisites:** LANG-01, EXPLORE-04

**Gates:** GATE-01

**Conditional prerequisites:** {"questionnaire":["QUESTION-02","MATCH-08","ADAPT-07"]}

### Deliverables

- eu catalog/content/glossary and fluent approval pack

### Acceptance

- Complete proposed enabled surfaces reviewed by fluent humans, with extra nuanced wording review; no AI-only approval; questionnaire invariance mandatory

### Verification

- eu coverage/plural/a11y/error checks, fluent political wording review and questionnaire score parity when applicable
- Repeat applicable REQ-18 theme/motion/layout/assistive-technology/comprehension checks for every enabled surface; longer translated text must not obscure controls or uncertainty.

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## LANG-08: Activate one approved regional interface

**Status:** planned

**Macro task:** TASK-12

**Owner role:** Engineering + fluent reviewers

**Requirements:** REQ-08, REQ-09

**Capabilities:** source_explorer, questionnaire

**Locale:** per_approved_locale

**Prerequisites:** LANG-04

**Gates:** GATE-01, GATE-07

### Deliverables

- Scoped locale activation release

### Acceptance

- GATE-07 must pass for the exact locale and enabled capability set; missing questions block regional questionnaire, not independently complete explorer surfaces

### Verification

- Locale-specific candidate manifest, actual browser flows and unchanged scoring proof

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## RELEASE-01: Define capability-aware manifest/schema

**Status:** planned

**Macro task:** TASK-10

**Owner role:** Release engineering

**Requirements:** REQ-10, REQ-11, REQ-12, REQ-15, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** EXPLORE-01, DATA-04

**Gates:** GATE-01

### Deliverables

- Manifest and compatibility schema

### Acceptance

- Explorer-only release has no fabricated questionnaire versions; enabled capabilities/locales explicit; dependency lock, source/build/evidence hashes required

### Verification

- Valid/invalid optional-field, hash and capability fixtures

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## RELEASE-02: Build reproducible release candidates

**Status:** planned

**Macro task:** TASK-10

**Owner role:** Release engineering

**Requirements:** REQ-10, REQ-11, REQ-12, REQ-15, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** RELEASE-01, LANG-02

**Gates:** GATE-01

### Deliverables

- Clean locked build, provenance and dependency licence inventory

### Acceptance

- Rebuild from lockfiles and reviewed content; retain attribution and provenance; public artifact excludes editorial/private data

### Verification

- Clean install/build comparison, audit and artifact inspection

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## RELEASE-03: Validate and publish atomically

**Status:** planned

**Macro task:** TASK-10

**Owner role:** Release engineering

**Requirements:** REQ-10, REQ-11, REQ-12, REQ-15, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** RELEASE-02, EDIT-04

**Gates:** GATE-01

### Deliverables

- Candidate validation and active-release pointer tooling

### Acceptance

- Incomplete schema/hash/quorum cannot activate; public assets switch coherently and immutable versions remain retrievable

### Verification

- Partial upload/hash/quorum/concurrent activation tests

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## RELEASE-04: Make caching and offline evidence safe

**Status:** planned

**Macro task:** TASK-10

**Owner role:** Release engineering

**Requirements:** REQ-10, REQ-11, REQ-12, REQ-15, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** RELEASE-03

**Gates:** GATE-01

### Deliverables

- Cache policy and static offline evidence package

### Acceptance

- Cache only public immutable assets, never political state; coherent versions and rights limits; no visitor accounts needed

### Verification

- Stale/corrupt/offline/version-mix tests and archive rights checks

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## RELEASE-05: Demonstrate withdrawal and rollback

**Status:** planned

**Macro task:** TASK-10

**Owner role:** Release engineering

**Requirements:** REQ-10, REQ-11, REQ-12, REQ-15, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** RELEASE-03, EDIT-06

**Gates:** GATE-01

### Deliverables

- Release history, withdrawal notices and rollback drill

### Acceptance

- Withdraw unsafe affected results without erasing history; reproduce earlier verified release; active sessions handle revocation explicitly

### Verification

- Timed restore/rollback/withdrawal drill with manifest and citation checks

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## RELEASE-06: Prepare public repository verification

**Status:** planned

**Macro task:** TASK-10

**Owner role:** Release engineering

**Requirements:** REQ-10, REQ-11, REQ-12, REQ-15, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** RELEASE-02, GOV-03

**Gates:** GATE-01

### Deliverables

- Sanitized repo, contribution checks and reproducibility guide

### Acceptance

- Explicit approved licences, no secrets/private data; reviewers can inspect scoring, evidence rules, funding and changes; no claim open source alone guarantees neutrality

### Verification

- Secret/history/attribution scan and external clean-rebuild review before publication

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## QA-01: Threat-model real visitor/editorial flows

**Status:** planned

**Macro task:** TASK-11

**Owner role:** Independent privacy/security reviewers + engineering

**Requirements:** REQ-04, REQ-06, REQ-09, REQ-11, REQ-13, REQ-14, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** GOV-02, EXPLORE-04, EDIT-06

**Gates:** GATE-01

### Deliverables

- Data-flow inventory, retention model and threat review

### Acceptance

- Distinguish public requests and editorial identities from absent political inputs; include CDN/host/support/crash logs, uploads, backups and dependencies

### Verification

- Independent design review plus explicit processor/retention inventory

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## QA-02: Audit explorer privacy on actual assets

**Status:** planned

**Macro task:** TASK-11

**Owner role:** Independent privacy/security reviewers + engineering

**Requirements:** REQ-04, REQ-06, REQ-09, REQ-11, REQ-13, REQ-14, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** QA-01, OPS-03, RELEASE-04, LANG-04

**Gates:** GATE-01

### Deliverables

- Scoped actual network/storage/log inspection

### Acceptance

- No constituency/topic/interest leakage through paths, query, beacons, referrers or infrastructure logs; third-party assets scrutinized; unavoidable request metadata honestly documented

### Verification

- Exercise normal/filter/citation/error flows in staging and inspect browser, proxy/server/provider logs with synthetic inputs

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## QA-03: Audit questionnaire privacy on actual assets

**Status:** planned

**Macro task:** TASK-11

**Owner role:** Independent privacy/security reviewers + engineering

**Requirements:** REQ-04, REQ-06, REQ-09, REQ-11, REQ-13, REQ-14, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** QA-01, OPS-03, MATCH-08, MATCH-07

**Gates:** GATE-01

### Deliverables

- Scoped questionnaire traffic/storage/crash proof

### Acceptance

- Answers, priorities, constituency and result never leave browser or persist by default, including errors, exports and support flows; no analytics

### Verification

- Inspect every request/body/header/URL/storage surface and provider log path using identifiable synthetic test vectors

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## QA-04: Test security boundaries and untrusted sources

**Status:** planned

**Macro task:** TASK-11

**Owner role:** Independent privacy/security reviewers + engineering

**Requirements:** REQ-04, REQ-06, REQ-09, REQ-11, REQ-13, REQ-14, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** QA-01, OPS-03, EDIT-06, SOURCE-05

**Gates:** GATE-01

### Deliverables

- Security report and fixed findings

### Acceptance

- SSRF/parser abuse, admin authorization/MFA/CSRF, quorum bypass, source XSS and supply-chain issues addressed; no public ingest authority

### Verification

- Adversarial independent assessment and meaningful regression tests

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## QA-05: Measure load, latency and resource limits

**Status:** planned

**Macro task:** TASK-11

**Owner role:** Independent privacy/security reviewers + engineering

**Requirements:** REQ-04, REQ-06, REQ-09, REQ-11, REQ-13, REQ-14, REQ-16, REQ-18

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** OPS-03, GOV-05, RELEASE-04

**Gates:** GATE-01

### Deliverables

- Measured performance/cost report

### Acceptance

- Actual target devices and expected/3x peak load meet agreed budgets; browser local scoring measured separately when enabled; no real political payloads
- Measure initial UI separately from the complete common bank and cold validated-bank readiness; include selector/bounds and LCP/INP/CLS lab targets. No custom production telemetry or response-dependent downloads.

### Verification

- 30-minute proposed envelope calibrated by owners and public/synthetic fixtures

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## QA-06: Prove backup restore and operational rollback

**Status:** planned

**Macro task:** TASK-11

**Owner role:** Independent privacy/security reviewers + engineering

**Requirements:** REQ-04, REQ-06, REQ-09, REQ-11, REQ-13, REQ-14, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** OPS-04, RELEASE-05, GOV-05

**Gates:** GATE-01

### Deliverables

- Off-host restore/rollback evidence

### Acceptance

- Restore actual approved staging setup and evidence provenance within agreed RPO/RTO; recovery procedure and credential ownership validated

### Verification

- Timed fresh-environment restore drill, hash/citation checks and operator sign-off

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## QA-07: Collect scoped acceptance evidence

**Status:** planned

**Macro task:** TASK-11

**Owner role:** Independent privacy/security reviewers + engineering

**Requirements:** REQ-04, REQ-06, REQ-09, REQ-11, REQ-13, REQ-14, REQ-16, REQ-18

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** QA-02, QA-04, QA-05, QA-06, UX-06

**Gates:** GATE-01

**Conditional prerequisites:** {"questionnaire":["QA-03","MATCH-08","ADAPT-09"]}

### Deliverables

- Capability/locale acceptance matrix and GATE-03 packet

### Acceptance

- Independent reviewers sign actual tested candidate scope; questionnaire proof required only if enabled; unresolved material issues block affected capability
- REQ-09/REQ-18 manual mixed-age/assistive-technology and calibrated device evidence applies to the exact enabled candidate; no unverified universal trust/accessibility claim.
- Questionnaire acceptance proves only a policy-permitted unnamed checkpoint overlap before finish, no party/score mapping spoilers, and complete cited insight parity after intentional finish; explorer/bootstrap CI cannot substitute.

### Verification

- Cross-check requirement/capability mapping, release hash, test outputs and named reviewers

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## OPS-01: Choose minimal deployable infrastructure

**Status:** planned

**Macro task:** TASK-14

**Owner role:** Named operations owner

**Requirements:** REQ-10, REQ-11, REQ-12, REQ-14, REQ-15, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** GOV-03, GOV-04

**Gates:** GATE-01

### Deliverables

- Provider/domain comparison and bounded procurement packet

### Acceptance

- PHP + PostgreSQL + database queue/scheduler + private archive + off-host backups; CDN/object store optional by measurement; Redis/ML not baseline

### Verification

- Current official provider quotes/limits/retention terms and owner cost review; .es availability still must be checked

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## OPS-02: Provision authorized restricted staging

**Status:** planned

**Macro task:** TASK-14

**Owner role:** Named operations owner

**Requirements:** REQ-10, REQ-11, REQ-12, REQ-14, REQ-15, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** OPS-01

**Gates:** GATE-01, GATE-04

### Deliverables

- Approved domain/resources and restricted staging environment

### Acceptance

- Exact GATE-04 action/cost/scope approved before purchase/provision; no public political questionnaire or visitor metrics

### Verification

- Provider configuration and cost inventory; current patched supported runtimes validated

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## OPS-03: Harden hosted runtime and deployment

**Status:** planned

**Macro task:** TASK-14

**Owner role:** Named operations owner

**Requirements:** REQ-10, REQ-11, REQ-12, REQ-14, REQ-15, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** OPS-02, RELEASE-02

**Gates:** GATE-01

### Deliverables

- Least-privilege deploy, database/queue/scheduler, TLS and log policies

### Acceptance

- Production debug off, secrets controlled, admin protected, current patches, no visitor payload logs, no optional analytics; staging mirrors intended flow

### Verification

- Config/permissions/log-retention inspection and health/job failure drill

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## OPS-04: Create off-host backups and recovery runbook

**Status:** planned

**Macro task:** TASK-14

**Owner role:** Named operations owner

**Requirements:** REQ-10, REQ-11, REQ-12, REQ-14, REQ-15, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** OPS-03

**Gates:** GATE-01

### Deliverables

- Encrypted backup/retention, custody and recovery tools

### Acceptance

- Editorial/source data recoverable within chosen targets; no visitor political state included; restore credentials independent of failed host

### Verification

- Backup integrity/restore rehearsals and named custodian review

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## OPS-05: Staff corrections and election operations

**Status:** planned

**Macro task:** TASK-14

**Owner role:** Named operations owner

**Requirements:** REQ-10, REQ-11, REQ-12, REQ-14, REQ-15, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** OPS-04, GOV-02, EDIT-06

**Gates:** GATE-01

### Deliverables

- On-call schedule, correction contact and incident triage runbook

### Acceptance

- Actual people/hours support stated correction targets; clear publication freeze and emergency withdrawal authority

### Verification

- Tabletop outage/critical citation correction and coverage review

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## OPS-06: Review the controlled Spanish beta

**Status:** planned

**Macro task:** TASK-14

**Owner role:** Named operations owner

**Requirements:** REQ-10, REQ-11, REQ-12, REQ-14, REQ-15, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** QA-07, OPS-05, EXPLORE-05

**Gates:** GATE-01, GATE-03

### Deliverables

- Beta comprehension/citation/error/correction report

### Acceptance

- Testers understand coverage/overlap limits; feedback does not retain political vectors; all applicable GATE-03 evidence accepted

### Verification

- Human beta sessions and issue closure against exact candidate assets

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## OPS-07: Publish the approved Spanish explorer

**Status:** planned

**Macro task:** TASK-14

**Owner role:** Named operations owner

**Requirements:** REQ-10, REQ-11, REQ-12, REQ-14, REQ-15, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** OPS-06, RELEASE-06

**Gates:** GATE-01, GATE-05

### Deliverables

- Public repo/site and release manifest/history

### Acceptance

- GATE-05 authorizes exact repo/site/release; licences/funding/registry/core acceptance pass; questionnaire and metrics stay off unless separately approved

### Verification

- Post-deploy smoke, active manifest/hash verification and operational handoff

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## OPS-08: Activate the approved questionnaire

**Status:** planned

**Macro task:** TASK-14

**Owner role:** Named operations owner

**Requirements:** REQ-10, REQ-11, REQ-12, REQ-14, REQ-15, REQ-16

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** OPS-06, MATCH-08, QUESTION-05, ADAPT-09

**Gates:** GATE-01, GATE-02, GATE-03, GATE-05, GATE-06

### Deliverables

- Scoring-enabled release and public methodology

### Acceptance

- GATE-06 for exact evidence/question/rubric/algorithm versions; GATE-02 and questionnaire-scoped GATE-03 accepted; shared evidence restrictions visible

### Verification

- Production privacy smoke, score/citation parity and rollback evidence

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## OPS-09: Maintain the coherent election release

**Status:** planned

**Macro task:** TASK-14

**Owner role:** Named operations owner

**Requirements:** REQ-10, REQ-11, REQ-12, REQ-14, REQ-15, REQ-16

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** OPS-07

**Gates:** GATE-01, GATE-05

### Deliverables

- Routine source reconciliation, corrections and operational records

### Acceptance

- New content requires applicable review and compatible release; expired gates reopen; election date never forces unverified scoring

### Verification

- Daily staffed source/health review and bounded correction drills, without assuming automation exists

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## METRIC-01: Define a minimal voluntary feedback purpose

**Status:** planned

**Macro task:** TASK-15

**Owner role:** Privacy specialists + independent operators

**Requirements:** REQ-07, REQ-14, REQ-16

**Capabilities:** anonymous_metrics

**Locale:** es

**Prerequisites:** GOV-06

**Gates:** GATE-01

### Deliverables

- Metric purpose/denominator/schema proposal

### Acceptance

- Separate result usefulness/acceptance/intended different vote from actual turnout; no party, answers, constituency, free text or identifying linkage; off by default

### Verification

- Privacy review of proposed fields and public interpretation limits

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## METRIC-02: Evaluate maintained private aggregation options

**Status:** planned

**Macro task:** TASK-15

**Owner role:** Privacy specialists + independent operators

**Requirements:** REQ-07, REQ-14, REQ-16

**Capabilities:** anonymous_metrics

**Locale:** es

**Prerequisites:** METRIC-01

**Gates:** GATE-01

### Deliverables

- Feasibility and independent-operator protocol comparison

### Acceptance

- Do not invent home-grown cryptography; relay/aggregators and request metadata/collusion threat included; omit feature if funded safe maintained option unavailable

### Verification

- Primary protocol/library review by qualified privacy/security specialist

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## METRIC-03: Resolve operators and lawful actual flow

**Status:** planned

**Macro task:** TASK-15

**Owner role:** Privacy specialists + independent operators

**Requirements:** REQ-07, REQ-14, REQ-16

**Capabilities:** anonymous_metrics

**Locale:** es

**Prerequisites:** METRIC-02, GOV-02, GOV-04

**Gates:** GATE-01

### Deliverables

- Named independent operators, legal/retention/consent contract

### Acceptance

- Actual flow, roles, no reidentification/party linkage and ownership approved; anonymity claim justified by implementation, not removal of names

### Verification

- Specialist review including IP/timing/denominator/dedup risks and current legal obligations

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## METRIC-04: Implement an isolated synthetic metric prototype

**Status:** planned

**Macro task:** TASK-15

**Owner role:** Privacy specialists + independent operators

**Requirements:** REQ-07, REQ-14, REQ-16

**Capabilities:** anonymous_metrics

**Locale:** es

**Prerequisites:** METRIC-03

**Gates:** GATE-01

**Conditional prerequisites:** {"post_result_feedback":["MATCH-08"]}

### Deliverables

- Disabled isolated aggregation and consent prototype

### Acceptance

- Fixed schema, batching, expiry, query budget/minimum cohort and no-result linkage; explicit opt-in independent of core access; no production collection

### Verification

- Synthetic traffic, malformed report, outage, timing, collusion and tiny-cohort tests

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## METRIC-05: Verify aggregation and disclosure limits

**Status:** planned

**Macro task:** TASK-15

**Owner role:** Privacy specialists + independent operators

**Requirements:** REQ-07, REQ-14, REQ-16, REQ-18

**Capabilities:** anonymous_metrics

**Locale:** es

**Prerequisites:** METRIC-04

**Gates:** GATE-01

**Conditional prerequisites:** {"post_result_feedback":["MATCH-08"]}

### Deliverables

- Actual-flow metric acceptance record and dashboard

### Acceptance

- No raw political response retention or sparse subgroup disclosure; count contributions honestly, not unique people or representative electorate; avoid repeated-query differencing
- Any proposed consent/dashboard UI meets REQ-09/REQ-18 clarity/accessibility/motion/device criteria without activating telemetry or changing core access; collection remains separately gated.

### Verification

- Independent infrastructure log/network/aggregation lifecycle audit and disclosure review

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## METRIC-06: Activate only separately approved metrics

**Status:** planned

**Macro task:** TASK-15

**Owner role:** Privacy specialists + independent operators

**Requirements:** REQ-07, REQ-14, REQ-16

**Capabilities:** anonymous_metrics

**Locale:** es

**Prerequisites:** METRIC-05, OPS-07

**Gates:** GATE-01, GATE-03, GATE-08

### Deliverables

- Optional metrics-enabled release

### Acceptance

- Exact GATE-08 plus scoped privacy gate accepted, operators/funding ready, opt-in and kill switch verified; no dependency from core matching to collection

### Verification

- Actual deployment privacy/consent/disable smoke with synthetic contributions

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## METRIC-07: Publish honest aggregate summaries

**Status:** planned

**Macro task:** TASK-15

**Owner role:** Privacy specialists + independent operators

**Requirements:** REQ-07, REQ-14, REQ-16

**Capabilities:** anonymous_metrics

**Locale:** es

**Prerequisites:** METRIC-06

**Gates:** GATE-01

### Deliverables

- Spanish voluntary-feedback dashboard

### Acceptance

- Fixed safe reports show denominators/uncertainty/window; no electorate-wide vote prediction or claim actual vote changed

### Verification

- Disclosure/query review and Spanish comprehension test

### Evidence

Pending.

**Failure behavior:** Keep the affected item incomplete and its dependent capability disabled; record the cause and continue independent eligible work.

## ADAPT-01: Design the reviewed tiered bank and anchors

**Status:** planned

**Macro task:** TASK-07

**Owner role:** Editorial + engineering + privacy

**Requirements:** REQ-02, REQ-03, REQ-17

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** QUESTION-01, QUESTION-02

**Gates:** GATE-01

### Deliverables

- Bank/family/topic budgets, genericity tiers and ten-question anchor set

### Acceptance

- 60–100 is capacity-driven; ten anchors cover reviewed domains with concrete neutral policies; related detail cannot multiply issue influence.

### Verification

- Independent bank/anchor balance and comprehensibility review; count real evidence/reviewer workload, not generated questions.

### Evidence

Pending.

**Failure behavior:** Keep the affected adaptive flow incomplete/disabled; fall back only to reviewed balanced provisional comparison without invented certainty.

## ADAPT-02: Define adaptive scoring targets and diagnostics

**Status:** planned

**Macro task:** TASK-08

**Owner role:** Editorial + engineering + privacy

**Requirements:** REQ-04, REQ-05, REQ-17

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** ADAPT-01, MATCH-01

**Gates:** GATE-01

### Deliverables

- Fixed-bank adaptive method proposal, response/evidence coverage and same-target bounds

### Acceptance

- New weighting never silently alters v1. Party/pair bounds use a shared hypothetical answer and fixed common target; unknowns are not guesses; no confidence probability.
- Technical bounds/selector prototypes may use explicitly synthetic fixtures before programme publication; they do not pass real-data methodology or activation gates.

### Verification

- Tiny exhaustive completion checks, analytic bound review, splitting/inversion invariants and comparison with untouched v1.

### Evidence

Pending.

**Failure behavior:** Keep the affected adaptive flow incomplete/disabled; fall back only to reviewed balanced provisional comparison without invented certainty.

## ADAPT-03: Specify and implement the local next-question selector

**Status:** planned

**Macro task:** TASK-08

**Owner role:** Editorial + engineering + privacy

**Requirements:** REQ-03, REQ-04, REQ-05, REQ-06, REQ-17

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** ADAPT-02

**Gates:** GATE-01

### Deliverables

- Pure local coverage-first, pair-gap reduction selector with public tie-breaks

### Acceptance

- Reviewed useful questions only, all plausible candidacies considered, no popularity/target-party objective, no silent cohort reduction; fixed fallback on validation/budget failure.

### Verification

- Party-label/order invariance, tied/identical profiles, skipped questions, missing evidence, family budgets and mobile cost checks.

### Evidence

Pending.

**Failure behavior:** Keep the affected adaptive flow incomplete/disabled; fall back only to reviewed balanced provisional comparison without invented certainty.

## ADAPT-04: Build checkpoint and stop/continue screens

**Status:** planned

**Macro task:** TASK-08

**Owner role:** Editorial + engineering + privacy

**Requirements:** REQ-08, REQ-09, REQ-17, REQ-18

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** ADAPT-03, MATCH-04

**Gates:** GATE-01

### Deliverables

- Spanish neutral checkpoint, explicit finish/reveal, optional +5 and exit-without-result UX

### Acceptance

- Show actual counts and only a policy-permitted unnamed highest-overlap checkpoint index, with separate coverage/stability and honest insufficiency. No party identity, score mapping, ranking, detailed personalised citation or automatic reveal before explicit finish; exit/+5 stay clear.

### Verification

- Keyboard/screen-reader/mobile checks at 0/10/15/20+, all-skipped, user exit and insufficient-evidence states; fluent copy review.
- With synthetic fixtures, whitelist only the permitted unnamed checkpoint index and verify its shared-evidence arithmetic/limitations; assert no matching-party identity, score-to-party mapping or detailed result in visual/DOM/accessibility/title/notification/export surfaces before finish. Cover checkpoints, bank exhaustion, errors, locale/theme and history. Then verify intentional reveal, refinement/re-finish, source parity and no transport/storage/log events. Raw common public data may contain party names.

### Evidence

Pending.

**Failure behavior:** Keep the affected adaptive flow incomplete/disabled; fall back only to reviewed balanced provisional comparison without invented certainty.

## ADAPT-05: Implement honest stopping and rebase rules

**Status:** planned

**Macro task:** TASK-08

**Owner role:** Editorial + engineering + privacy

**Requirements:** REQ-04, REQ-05, REQ-17

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** ADAPT-02, ADAPT-03

**Gates:** GATE-01

### Deliverables

- Reviewed stop/tie/low-gain/bank-exhaustion rules and edit handling

### Acceptance

- A bound label only certifies its unchanged target; priority/cohort/answer edits recompute and re-explain. More answers need not yield a unique party.

### Verification

- Unique leader, inseparable tie, zero gain, exhausted bank, missing programmes, input edits and changing-weight counterexamples.

### Evidence

Pending.

**Failure behavior:** Keep the affected adaptive flow incomplete/disabled; fall back only to reviewed balanced provisional comparison without invented certainty.

## ADAPT-06: Pilot short-mode and adaptive-order neutrality

**Status:** planned

**Macro task:** TASK-07

**Owner role:** Editorial + engineering + privacy

**Requirements:** REQ-02, REQ-03, REQ-05, REQ-17

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** ADAPT-01, ADAPT-02, ADAPT-03, ADAPT-05, PILOT-03, QUESTION-03

**Gates:** GATE-01

### Deliverables

- Independent ten-question/long-flow calibration and methodology packet

### Acceptance

- No automatic lowering of 20/15 reference gates; approve short-mode separately if evidence supports it. Do not maximize result acceptance or retain real political vectors.

### Verification

- Compare balanced/adaptive paths and priming/wording/coverage effects on synthetic profiles and consented comprehension review; publish sensitivity limits.
- Short-mode/order pilot uses a first pass with no party result disclosure; analyse informed post-reveal refinement separately, without retained real political vectors.

### Evidence

Pending.

**Failure behavior:** Keep the affected adaptive flow incomplete/disabled; fall back only to reviewed balanced provisional comparison without invented certainty.

## ADAPT-07: Pin bank/selector/readiness versions in releases

**Status:** planned

**Macro task:** TASK-10

**Owner role:** Editorial + engineering + privacy

**Requirements:** REQ-08, REQ-10, REQ-17

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** ADAPT-03, ADAPT-05, RELEASE-01

**Gates:** GATE-01

### Deliverables

- Adaptive manifest/schema and active-session compatibility

### Acceptance

- One coherent bank, weights, algorithm, selector, readiness, dictionary and evidence release; translations preserve semantic path and numerical results.

### Verification

- Corrupt/mixed/stale/withdrawn versions and locale/priority changes; declared balanced fallback without false readiness.

### Evidence

Pending.

**Failure behavior:** Keep the affected adaptive flow incomplete/disabled; fall back only to reviewed balanced provisional comparison without invented certainty.

## ADAPT-08: Prove adaptive-path privacy and accessible locality

**Status:** planned

**Macro task:** TASK-11

**Owner role:** Editorial + engineering + privacy

**Requirements:** REQ-06, REQ-08, REQ-09, REQ-17, REQ-18

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** ADAPT-04, ADAPT-07, QA-03

**Gates:** GATE-01

### Deliverables

- Actual deployed adaptive branch/order/progress traffic/storage/log proof

### Acceptance

- No response-dependent chunks, question URLs, selector IDs, ranges, stop codes or progress telemetry leave browser; same public bundle for all responses.
- Finish/reveal/refinement state and personalised source/result expansion stay local; clicking finish is not metrics or sharing consent.

### Verification

- Inspect production assets/providers across answer/edit/skip/continue/exit/error/locale/export and mobile fallback using synthetic markers.
- Synthetic actual-flow audit includes finish/exit/reveal/refine/re-finish/download/back-forward and absence of implicit results or transport events.

### Evidence

Pending.

**Failure behavior:** Keep the affected adaptive flow incomplete/disabled; fall back only to reviewed balanced provisional comparison without invented certainty.

## ADAPT-09: Assemble adaptive activation acceptance

**Status:** planned

**Macro task:** TASK-11

**Owner role:** Editorial + engineering + privacy

**Requirements:** REQ-03, REQ-04, REQ-05, REQ-06, REQ-10, REQ-17

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** ADAPT-06, ADAPT-08, MATCH-08

**Gates:** GATE-01

### Deliverables

- REQ-17 and questionnaire-scoped acceptance evidence

### Acceptance

- Named independent method/fluent/privacy reviewers validate actual candidate; no adaptive release inferred from scaffold/reference checks; GATE-02/03/06 required.

### Verification

- Cross-check source/quorum, algorithm target, selector/stopping/calibration, short-mode, hashes, privacy and locale applicability.

### Evidence

Pending.

**Failure behavior:** Keep the affected adaptive flow incomplete/disabled; fall back only to reviewed balanced provisional comparison without invented certainty.

## UX-01: Review civic identity and complete journey prototypes

**Status:** planned

**Macro task:** TASK-09

**Owner role:** Design + accessibility + engineering

**Requirements:** REQ-06, REQ-08, REQ-09, REQ-18

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** LANG-01

**Gates:** GATE-01

### Deliverables

- English design-token/state specification and responsive Spanish public/admin/questionnaire prototype review pack

### Acceptance

- Record actual design-owner/accessibility feedback on typography, palette, light/dark/reduced-motion and normal/empty/loading/error/unknown/tie/source states before rollout; no prototype treated as production evidence.

### Verification

- Mixed-age readability/neutral presentation review; check all proposed states and equivalent keyboard/text paths; fluent Spanish draft review.

### Evidence

Pending.

**Failure behavior:** Keep the affected experience/capability incomplete; resolve barriers or simplify nonessential enhancements, re-test and retain accurate limitations.

## UX-02: Build accessible shared experience and explorer states

**Status:** planned

**Macro task:** TASK-09

**Owner role:** Design + accessibility + engineering

**Requirements:** REQ-06, REQ-08, REQ-09, REQ-18

**Capabilities:** source_explorer

**Locale:** es

**Prerequisites:** UX-01, EXPLORE-03, LANG-02

**Gates:** GATE-01

### Deliverables

- Reusable token-based semantic components and inclusive public/admin/explorer/help/error/export presentation

### Acceptance

- Complete theme and reduced-motion behaviour, large targets, 320 px/zoom/reflow, accessible citations and local comparison filters. No third-party embeds or interest-bearing URL/telemetry; all candidacies remain visible.

### Verification

- Component state and integration checks plus manual keyboard/zoom/forced-colour/screen-reader review using real candidate layouts.

### Evidence

Pending.

**Failure behavior:** Keep the affected experience/capability incomplete; resolve barriers or simplify nonessential enhancements, re-test and retain accurate limitations.

## UX-03: Apply inclusive progressive questionnaire experience

**Status:** planned

**Macro task:** TASK-08

**Owner role:** Design + accessibility + engineering

**Requirements:** REQ-06, REQ-08, REQ-09, REQ-18

**Capabilities:** questionnaire

**Locale:** es

**Prerequisites:** UX-02, ADAPT-04, MATCH-06

**Gates:** GATE-01

### Deliverables

- Fast Spanish answer/review/checkpoint/result/detail/exit interactions with accessible equivalents

### Acceptance

- Immediate explicit selection, Next/back/edit/skip/unsure without silent advance; stop/+5 equally usable, honest percentages and unknowns. Theme/motion/layout changes preserve IDs, scores, citations and browser-local state.
- Before finish, permit only the reviewed unnamed checkpoint index/limitations; never disclose matching-party identity, individual score mapping or detailed personalised result, including hidden DOM/a11y. After finish explain positive/negative overlap with exact citations and no guessed unasked preferences.

### Verification

- Manual keyboard/touch/assistive-technology and double-tap/back/exit/error/locale/motion parity on production questionnaire assets.
- No spoilers for visual/keyboard/screen-reader users before finish; verify citation context, insufficient/zero data, all-candidacy access and explicit informed refinement.

### Evidence

Pending.

**Failure behavior:** Keep the affected experience/capability incomplete; resolve barriers or simplify nonessential enhancements, re-test and retain accurate limitations.

## UX-04: Verify device speed, resilience and complete accessibility

**Status:** planned

**Macro task:** TASK-11

**Owner role:** Design + accessibility + engineering

**Requirements:** REQ-06, REQ-08, REQ-09, REQ-18

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** UX-02, LANG-04, QA-05

**Gates:** GATE-01

**Conditional prerequisites:** {"questionnaire":["UX-03","ADAPT-08"]}

### Deliverables

- Actual release-bound device/network/performance and manual accessibility evidence for enabled surfaces

### Acceptance

- Calibrated UI/full-bank/readiness/scoring/selector/vitals budgets pass with run counts and device/network definitions; complete enabled AA scope and additional reduced-motion/control targets checked. No lab-to-field or universal conformance claim.

### Verification

- Older/entry-level physical phones and named assistive-technology matrix; cold/warm/slow/broken/offline/hash mismatch/large-source and duplicate-action tests; no production telemetry.

### Evidence

Pending.

**Failure behavior:** Keep the affected experience/capability incomplete; resolve barriers or simplify nonessential enhancements, re-test and retain accurate limitations.

## UX-05: Validate comprehension across ages and abilities

**Status:** planned

**Macro task:** TASK-11

**Owner role:** Design + accessibility + engineering

**Requirements:** REQ-06, REQ-08, REQ-09, REQ-18

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** UX-02, LANG-04, QA-01

**Gates:** GATE-01

**Conditional prerequisites:** {"questionnaire":["UX-03","ADAPT-06"]}

### Deliverables

- Reviewed participant protocol, two formative-round barrier/revision records and scoped comprehension findings

### Acceptance

- Actual younger/older/low-digital-confidence/assistive-technology participation with synthetic scenarios; no severe unresolved confusion about overlap, uncertainty, source coverage or privacy. Actual research data handling separately reviewed; no political profiling, visitor metrics or unauthorized recruiting/contact.

### Verification

- Repeat essential start/skip/edit/stop/compare/citation/unknown/reset/recovery tasks after fixes; retain deidentified barrier findings and review coverage only; report sample limits.
- Participants can distinguish neutral progress, leaving without results, explicit finish, overlap strength and limitations; first-pass neutral tasks are separate from knowingly informed refinement.

### Evidence

Pending.

**Failure behavior:** Keep the affected experience/capability incomplete; resolve barriers or simplify nonessential enhancements, re-test and retain accurate limitations.

## UX-06: Bind experience acceptance to each enabled release scope

**Status:** planned

**Macro task:** TASK-11

**Owner role:** Design + accessibility + engineering

**Requirements:** REQ-06, REQ-08, REQ-09, REQ-18

**Capabilities:** source_explorer, questionnaire

**Locale:** es

**Prerequisites:** UX-04, UX-05, EXPLORE-04

**Gates:** GATE-01

### Deliverables

- REQ-09/REQ-18 scoped acceptance and honest Spanish accessibility/performance/trust statement

### Acceptance

- Named qualified owners verify actual assets and unresolved issues; no beautification/automated audit substitutes for proof. Optional questionnaire, locales and metrics receive only their separately tested scope.

### Verification

- Cross-check actual candidate hashes, capability/locale, manual findings, fix/retest records and qualified signatures for GATE-03; regional packs repeat applicable checks.

### Evidence

Pending.

**Failure behavior:** Keep the affected experience/capability incomplete; resolve barriers or simplify nonessential enhancements, re-test and retain accurate limitations.

## BOOT-08: Review and install project skills

**Status:** completed

**Macro task:** TASK-02

**Owner role:** Engineering

**Requirements:** REQ-08, REQ-13, REQ-16

**Capabilities:** local_bootstrap

**Locale:** es

**Prerequisites:** BOOT-07

**Gates:** GATE-00

### Deliverables

- Pinned frontend-design skill with licence, project-authored inclusive/evidence/private-matching skills and tracked provenance

### Acceptance

- All nine canonical skills and client aliases have reviewed content/provenance; scaffold requirements remain authoritative

### Verification

- Skill creator validation and npm run check:skills

### Evidence

- outputs/initial-scaffold-report.json#BOOT-08

**Failure behavior:** Keep the scaffold item incomplete; repair the concrete issue without weakening production gates.

**Retained approval bindings:** [{"gateId":"GATE-00","packetHash":"37499faa4ec39ef48ee65b300e154591f186a4427a664d9fb74d31fef15cfd63"}]

## BOOT-09: Establish baseline continuous integration

**Status:** completed

**Macro task:** TASK-02

**Owner role:** Engineering

**Requirements:** REQ-08, REQ-13, REQ-16

**Capabilities:** local_bootstrap

**Locale:** es

**Prerequisites:** BOOT-07

**Gates:** GATE-00

### Deliverables

- PHP/static-analysis/frontend/browser/integrity/security workflows, pinned tools and dependency update configuration

### Acceptance

- Actual scaffold checks pass locally; workflows lint; no elevated contributor execution, deployment or private political fixtures

### Verification

- Composer validation, audit, Pint, PHPStan, PHPUnit; npm audit, lint, types, build, asset and desktop/mobile Playwright checks; actionlint/Gitleaks/repository checks

### Evidence

- outputs/initial-scaffold-report.json#BOOT-09

**Failure behavior:** Keep the scaffold item incomplete; repair the concrete issue without weakening production gates.

**Retained approval bindings:** [{"gateId":"GATE-00","packetHash":"37499faa4ec39ef48ee65b300e154591f186a4427a664d9fb74d31fef15cfd63"}]

## BOOT-10: Prepare portable open-source scaffold handoff

**Status:** completed

**Macro task:** TASK-02

**Owner role:** Engineering

**Requirements:** REQ-08, REQ-13, REQ-16

**Capabilities:** local_bootstrap

**Locale:** es

**Prerequisites:** BOOT-07

**Gates:** GATE-00

### Deliverables

- Generated Markdown plans, agent/loop guidance, README, package metadata, notices and contribution/security policies

### Acceptance

- Canonical requirements preserved; derived plans agree; publication/feature gates remain pending and actual owner/contact facts are not invented

### Verification

- Plan/reference safety checks, Markdown parity, metadata/file boundary review and initial scaffold report

### Evidence

- outputs/initial-scaffold-report.json#BOOT-10

**Failure behavior:** Keep the scaffold item incomplete; repair the concrete issue without weakening production gates.

**Retained approval bindings:** [{"gateId":"GATE-00","packetHash":"37499faa4ec39ef48ee65b300e154591f186a4427a664d9fb74d31fef15cfd63"}]
