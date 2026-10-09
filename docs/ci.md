# Required verification

The repository pre-commit hook runs scripts/check-staged.py against a clean exact-index snapshot. Existing security hooks remain chained and unchanged. CI runs PHP 8.4/8.5 tests, formatting and static analysis; TypeScript, lint, build, browser accessibility/privacy checks; generated-plan and skill integrity; dependency audits, pinned workflow checks and secret scanning. Failure or unavailable tools block commits. Local passes do not certify hosted results, current source semantics or public launch.
