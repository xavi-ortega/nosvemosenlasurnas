# Nos Vemos en las Urnas

A free Spanish public programme comparison service and private browser-local progressive quiz. Development uses clearly synthetic sources until the owner supplies current programmes and their election/candidacy/provenance manifest.

One Laravel 13 / Blade / Tailwind 4 / TypeScript application, static evidence releases and optional SQLite aggregate counters. No public accounts, backoffice, runtime model or worker infrastructure. Collection is disabled; launch needs concrete owner approval.

Use scripts/composer install, npm ci --ignore-scripts and npm run build. Run scripts/php artisan serve for local development. Read docs/loop-engineer.md and docs/plans/development-plan.md. Before commits install the hook with python3 scripts/install-git-hooks.py and run python3 scripts/check-staged.py on the final staged tree. Existing identity/signing and remote history stay unchanged.
