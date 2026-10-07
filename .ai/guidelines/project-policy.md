# Project instructions

## Required language policy

- Apply this policy to the entire project and every future application change.
- Spanish is the complete default website language, including admin, accessibility text, errors, privacy/help pages, result explanations and exports.
- Keep Catalan, Basque and Galician interfaces in scope. Enable each only after complete UI/question translations receive fluent review.
- All original code and developer documentation are English: identifiers, classes, filenames, routes, database/schema names, JSON/API keys, status/reason codes, translation keys, comments, docblocks, tests and internal diagnostics.
- Translation values, reviewed content and source excerpts are content data. Keep their surrounding identifiers and code in English.
- Use English semantic keys such as results.insufficient_evidence in lang/es/*.php; approved regional catalogs use ca, gl and eu. Browser UI consumes the same reviewed local dictionary.
- Keep long translated questions/explanations in reviewed content, never mixed into scoring logic.
- Set APP_LOCALE=es and APP_FALLBACK_LOCALE=es. HTML language and formatting follow an explicitly selected enabled locale. Keep the code/Eloquent pluralizer in English.
- English UI is outside scope; browser preferences must not activate an unsupported English interface.
- Spanish fallback is an unexpected-runtime safeguard, not approval to publish incomplete regional translations.
- Localize framework/package errors and validation. Never render raw exception messages, machine codes or missing translation keys.
- Original quotations and official proper names remain exact. Provide separately reviewed and labelled translations with access to the original.
- AI can draft translations of public content; fluent reviewers approve them, with particular care for Basque and nuanced political/legal wording.
- Shared glossary, question IDs, answer scales, evidence and scoring rubrics remain consistent across languages.
- Before future application changes, read docs/plans/project-language-policy.md and section 17 of docs/plans/development-plan.md (generated from the retained HTML/canonical JSON).
- Keep .cursor/rules/project-language.mdc consistent with this policy.

## Required implementation and release checks

- Future CI checks hardcoded visible UI strings with template/AST-aware rules, enabled-locale key coverage, interpolation/plural variants, duplicate and unresolved keys.
- Dynamic keys require explicit enumerated mappings. Exceptions require a documented, reviewed allowlist.
- Browser checks cover approved languages across normal/empty/error flows, public/admin screens, accessibility, exports and formatting.
- Verify locale changes preserve stored answer IDs, weights, scores, coverage and citations.
- Review English code naming/comments/docs and fluent translated copy separately. Automatic language detection alone is insufficient.
- The reference engine has English developer diagnostics. Its website adapter maps stable English reason codes to reviewed catalog values without changing the algorithm.
- Language work preserves browser-local matching: no answers, priorities, constituency or affinities in requests, URLs, logs or analytics.

## Current stage

- This repository contains a local Laravel bootstrap, planning documents and a synthetic reference engine. Product features and production readiness remain implementation work.
- Persistent instructions are active. The local Spanish preparation/error pages are a bootstrap only; production language CI/browser checks and fluent content review remain implementation work.
- Developer planning artifacts remain English. The eventual user-facing methodology follows the approved interface language.

## Evidence, privacy and release discipline

- The canonical developer plan is outputs/electoral-app-development-plan.json; use its requirements, task dependencies, risks and decisions.
- Regenerate/check the human plan with outputs/render-development-plan.py. Keep the managed planning view in sync when changing the plan.
- Follow current-election programme scope, exact citations and two genuinely independent approvals; unknown/conflicting/pending positions remain unscored.
- Preserve browser-local deterministic matching. No answer, priority, constituency or affinity submission/persistence by default.
- All non-editorial metrics default off until their separate actual-flow, legal and aggregation gate passes.
- Never silently drop candidacies, use historical programmes as current evidence or order indices calculated on different evidence sets.
- Insufficient shared evidence means cited overlaps/comparisons without broad ordering; unready regional languages stay disabled.
- Publish only a coherent verified release; pin active sessions, validate schema/hashes and preserve correction/withdrawal history.
- Document what has been verified and what remains pending. Planning checks and synthetic arithmetic do not certify production privacy, neutrality or readiness.
- Named owners, reviewer capacity, licences, funding, actual production checks and restore/rollback proof are required before public launch.

- Record gate applicability by capability/locale: a cited explorer may release before scoring; questionnaire and metric activation require their extra gates. Complete regional coverage applies to enabled surfaces, with reviewed question translations required before questionnaire locale activation.

## Execution plan and strict approvals

- The selected project brand is Nos Vemos en las Urnas; the preferred .es domain is unverified and unpurchased.
- Use the atomic work items and GATE-00–GATE-08 in outputs/electoral-app-development-plan.json.
- Read docs/loop-engineer.md and outputs/approval-gate-01.html before continuing implementation.
- GATE-00 records the actual user identity/setup and initial-scaffold instructions. The latest user instruction explicitly authorizes local Laravel/Boost, project skills, CI, Markdown plans and open-source scaffold metadata (outputs/initial-scaffold-authorization.json). GATE-01 and later gates remain pending for features and their concrete subjects.
- Prepare reversible implementation and review artifacts within the approved blueprint. Never approve a gate on behalf of the user or count AI/accounts as independent natural-person reviewers.
- Record task progress with meaningful acceptance evidence in work/execution-journal.jsonl. Synthetic or local bootstrap evidence does not certify production readiness.
- A pending optional gate does not block independently ready core work; keep the unapproved capability disabled.
