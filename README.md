# Nos Vemos en las Urnas

A free electoral-programme comparison tool and private policy questionnaire in development. The intended public interface is Spanish; reviewed Catalan, Basque and Galician interfaces remain in scope. Original code and developer documentation are English.

The repository is an **initial Laravel scaffold**, not a voting recommendation service ready for publication. Only Spanish preparation and safe error pages are implemented. Programme exploration, the questionnaire, regional interfaces and metrics remain disabled. No domain, hosted service or remote repository has been created by this setup.

## Local development

Use PHP 8.4.1+ with the extensions required by composer.lock, Composer 2, Node 24, npm, Python 3.12+ and Git. SQLite is the development default; PostgreSQL is planned for hosted editorial data. Production runtime/provider selection remains a release decision.

~~~sh
scripts/composer run setup
scripts/php artisan serve
~~~

On this machine the ignored .tools runtime supplies PHP and Composer through the wrappers. Elsewhere they use PHP/Composer from PATH. Setup installs locked dependencies, creates .env if missing, generates a local key, migrates the local database and builds assets. **Run setup only against a local development environment**; it is not a production deployment command.

The current checkout already has dependencies, a local key and SQLite prepared. To rebuild or use asset hot reload:

~~~sh
npm run build
npm run dev
~~~

To attach Boost in a new checkout after installing dependencies:

~~~sh
scripts/php artisan boost:install --guidelines --skills --mcp --no-interaction
~~~

Machine-specific MCP configuration is ignored. The project policy in .ai/guidelines/project-policy.md survives guideline regeneration. Boost is development-only; use public/synthetic inputs. Open this folder in Codex/Cursor so project skills and Boost can be discovered. Newly installed skills become available on the next agent turn.

## Verification

~~~sh
scripts/composer validate --strict
scripts/composer lint
scripts/composer analyse
scripts/composer test
npm run lint
npm run typecheck
npm run build
npm run check:assets
npm run check:plans
npm run test:reference
npm run check:skills
scripts/composer audit
npm audit
npx playwright install chromium
npm run test:browser
python3 scripts/install-ci-tools.py
.tools/bin/actionlint
python3 scripts/check-repository.py
~~~

[CI coverage and limitations](docs/ci.md) explains each job. Browser tests currently cover the preparation/404 pages on desktop and mobile Chromium, Spanish with English browser preferences, axe checks, keyboard recovery, same-origin requests and empty browser storage/cookies. They do not verify a questionnaire that does not exist yet.

## Engineering plan and safeguards

- [Development plan](docs/plans/development-plan.md): requirements, atomic dependencies, acceptance, risks and strict gates.
- [Individual work-item acceptance and evidence](docs/plans/work-items.md).
- [Loop engineer contract](docs/loop-engineer.md): eligible work, bounded repairs, retained human approvals and stopping rules.
- [Matching reference](docs/plans/matching-algorithm-specification.md) and [adaptive questionnaire proposal](docs/plans/adaptive-questionnaire-specification.md).
- [Language policy](docs/plans/project-language-policy.md), [project instructions](AGENTS.md) and [tooling/skill inventory](docs/tooling.md).
- [Initial scaffold report](docs/scaffold-report.md); [first feature blueprint packet](docs/plans/approval-gate-01.md) remains pending.

The user has authorized this local scaffold, skills, CI and documentation. This does not approve the full feature blueprint or public release. Ten-question checkpoints may eventually show an approved unnamed overlap index; party identities, individual results and personalised citations require deliberate finish. Overlap is not a probability. Matching is deterministic and browser-local, with no ML and no default submission or persistence of political inputs.

Current-election citations and genuinely independent human review are required before scored positions. Synthetic fixtures and planning checks cannot certify neutrality, privacy or production readiness. Non-editorial metrics remain off.

## Contributing and licence

See [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), [SECURITY.md](SECURITY.md) and [third-party notices](THIRD_PARTY_NOTICES.md). MIT is the initial code/documentation licence default, subject to the owner's publication review. It does not grant rights to third-party programmes, quotations, party marks or separately licensed skills.

Repository URLs, named maintainers, security/conduct contacts, ownership rules and funding are intentionally not invented. [Publication setup](docs/repository-publication.md) lists the actual information and GitHub settings needed before opening contributions or publishing. Use project-metadata.json for those explicit pending values.

Historical research and naming proposals are retained under outputs; the current canonical plan is outputs/electoral-app-development-plan.json. Regenerate Markdown with npm run docs:build after changing its source artifacts.
