# Tooling and skills

The application uses Laravel 13/Blade and Tailwind 4, with a TypeScript entrypoint prepared for a later browser-local module. There is no Livewire questionnaire, JavaScript framework, ML library, analytics service or production provider requirement.

Laravel Boost is a Composer development dependency. Generated framework guidance and skills are tracked; local MCP configuration and development runtimes are ignored. scripts/php and scripts/composer prefer an ignored project runtime, then PATH. The current MCP configuration uses the local wrapper and is not portable to another checkout until regenerated.

Canonical project skills are in .agents/skills:

- laravel-best-practices: Laravel patterns.
- testing-best-practices: meaningful tests using the installed PHPUnit suite.
- tailwindcss-development: installed Tailwind APIs.
- frontend-design: separately pinned Anthropic Apache-2.0 skill.
- inclusive-interface-review: Spanish catalogs, regional review, accessibility and explicit finish presentation.
- electoral-evidence: current-election sources, citations, independent approval and release integrity.
- private-matching: deterministic local computation and private derived state.
- infer-conventions: available for explicit invocation; not an automatic broad rewrite.
- deploying-to-cloud: available only if Laravel Cloud is selected; its presence does not select/provision a provider.

Custom/design skills are linked into .cursor/skills and .claude/skills; Boost currently generates separate framework copies for those clients. skills-lock.json records reviewed hashes for all tracked skill copies. Update the manifest after a deliberate reviewed skill change. CI detects missing, altered and unrecorded skill files.

Use scripts/composer lint/analyse/test for PHP. Use npm run lint/typecheck/build for frontend and npm run test:browser for implemented browser flows. No callable Boost MCP tool is available in the current planning chat; opening the project allows its configured tools to load. This setup does not install unrelated global plugins.

The PDF tooling available to this development environment can help inspect public source documents later. It is not a production ingestion service; source isolation and rights/editorial review remain backlog work.
