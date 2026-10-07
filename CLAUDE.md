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

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

## Foundational Context

This application is a Laravel application running on PHP 8.5. Always use the APIs that match the installed major version of each package — do not assume a version.

Before relying on a package's API, confirm its installed version:
- PHP packages: run `composer show --direct` to list direct dependencies with versions, or `composer show <vendor/package>` for a single package.
- JS packages: check `package.json` for the installed versions.

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If a frontend change doesn't show in the UI or you get a "Unable to locate file in Vite manifest" error, run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Use `search-docs` before changes that depend on Laravel ecosystem APIs, behavior, configuration, or version-specific syntax. Skip it for copy-only edits and other changes where package documentation is irrelevant. Reuse sufficient results already in context instead of searching again.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Project Rules

- This project contains committed, area-grouped rules in `.ai/rules` when that directory exists, including path-scoped framework guidelines under `.ai/rules/boost`. Before you enter plan mode or create/edit any file, you MUST first: open @.ai/rules/index.md (it maps file globs to rule files), read every rule file whose globs cover the path(s) in scope, and run `grep -rin 'keyword' .ai/rules` to catch what a path match alone misses. Do not write code until you have read and are following every matching rule. If `.ai/rules` does not exist, continue without it.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.
- Activate the `deploying-to-cloud` skill whenever deploying to Laravel Cloud, configuring Cloud environments or resources, using the Cloud CLI, or troubleshooting Cloud deployments.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== phpunit/core rules ===

# PHPUnit

- This project uses PHPUnit. Create tests with `php artisan make:test --phpunit {name}`.
- Do not include the test suite directory in `{name}`. Use `SomeFeatureTest`, not `Feature/SomeFeatureTest`.
- Read the `testing-best-practices` skill for guidance on coverage, naming, structure, dependency isolation, and review.

## Running Tests

- Run the narrowest set of tests that covers the change. Pass a file path or `--filter=testName` to `php artisan test --compact`.
- Rerun a test after each change to it.
- Run `vendor/bin/phpunit` to call the test runner directly. It accepts the same file path and `--filter=testName` arguments.

</laravel-boost-guidelines>
