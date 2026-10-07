# Continuous integration

.github/workflows/ci.yml runs on pull requests, main pushes and manual dispatch. Actions use immutable commit pins, contents:read by default, no persisted checkout credentials, job timeouts and cancellation of stale runs. It never runs pull_request_target with contributor code, deploys, provisions services or uses production secrets.

## Implemented baseline

- PHP 8.4 and 8.5: strict Composer validation, locked install, audit, Pint check, Larastan/PHPStan level 6 and PHPUnit.
- Frontend: locked npm install without lifecycle scripts, audit, ESLint, strict TypeScript, Vite build and a 300 KiB uncompressed initial-entry asset ceiling.
- Browser: desktop/mobile Chromium with reduced motion and an English browser locale; Spanish preparation/404, axe WCAG tags, keyboard recovery, same-origin loads, no cookies and empty local/session storage.
- Integrity: canonical plan/DAG/gate checks, generated Markdown comparison, synthetic matching invariants and pinned skill content.
- Security: checksum-verified Gitleaks scans full reachable Git history with redacted findings; actionlint validates workflows; repository checks reject tracked secrets/runtime artifacts and mutable action references.

Use README.md commands locally. On a new machine, python3 scripts/install-ci-tools.py fetches the exact official archives from ci-tools.lock.json and verifies their SHA-256 before extracting only the named binary. npx playwright install chromium installs the browser matching package-lock.json. Linux CI also installs browser OS dependencies.

Dependabot proposes weekly Composer/npm/action changes. It cannot merge or approve a release. ci-tools.lock.json release binaries are updated manually with upstream checksum review.

## What remains pending

Browser checks cover only implemented scaffold pages, not future questions/results/admin/export/regional flows. The production language gate must add template/AST-aware hardcoded-copy rules, catalog/placeholder/plural/key integrity and locale-invariant matching tests as those surfaces appear. No raw-string regex is a substitute for that contract.

The quiz no-spoiler state machine, all political traffic/storage/log tests, release schema/hash validation, full evidence-bank/performance budgets, real device/manual assistive-technology review, reviewer independence and restoration proof remain capability-specific implementation/release work. Axe passing does not establish complete WCAG compliance.

PHPStan is type/behavior analysis, not comprehensive PHP security SAST. CodeQL is not configured at this stage; it does not support PHP. A later public repository may add supported-language CodeQL scanning with its own narrow permissions and hosting/licence review.

GitHub has not executed these jobs because no remote exists. Standard public runners can be free; private repository quotas and optional products depend on the owner's account. No paid GitHub feature is required by this scaffold. Enable branch protection after the first successful hosted run and use exact job names from that run, including both PHP matrix jobs. Do not require a check that never runs.

Raw political inputs must never appear in fixtures, reports or CI artifacts. Browser traces/screenshots/video and artifact uploading are disabled for the baseline.
