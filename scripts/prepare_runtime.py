#!/usr/bin/env python3
"""Assemble a secret-free one-host runtime candidate locally; never publish or install."""
import argparse
from datetime import date
import json
from pathlib import Path
import shutil

from local_recovery import evidence_state, require, sha

ROOT = Path(__file__).resolve().parents[1]
PATHS = ['app', 'bootstrap', 'config', 'database/migrations', 'public', 'resources/views', 'resources/evidence', 'resources/feedback-survey.json', 'resources/feedback-reports', 'lang/es', 'routes', 'artisan', 'composer.json', 'composer.lock', 'LICENSE']


def prepare(root, output, development=False):
    require(not output.exists() and output.parent.is_dir(), 'Runtime target must be new')
    state, bank = evidence_state(root / 'resources/evidence')
    require(development or (state['kind'] == 'current' and state.get('validUntil', '') >= date.today().isoformat()), 'A verified applicable current bank is required for a production candidate')
    require((root / 'public/build/manifest.json').is_file() and not (root / 'public/hot').exists(), 'A complete production asset build is required')
    output.mkdir(mode=0o700)
    for relative in PATHS:
        source = root / relative; target = output / relative
        if not source.exists(): continue
        require(not source.is_symlink(), 'Runtime symlink input rejected')
        if source.is_dir():
            require(not any(p.is_symlink() for p in source.rglob('*')), 'Runtime symlink input rejected')
            shutil.copytree(source, target, ignore=shutil.ignore_patterns('cache', '.gitignore', '*.log', '*.sqlite', '*.sqlite3', 'storage', 'hot', 'node_modules', '.env*', '.git', '.tools'))
        else:
            target.parent.mkdir(parents=True, exist_ok=True); shutil.copyfile(source, target)
    (output / '.env.example').write_text('APP_NAME="Nos Vemos en las Urnas"\nAPP_ENV=production\nAPP_DEBUG=false\nAPP_KEY=\nAPP_URL=https://OWNER_DOMAIN_PENDING\nAPP_LOCALE=es\nAPP_FALLBACK_LOCALE=es\nLOG_CHANNEL=null\nSESSION_DRIVER=array\nCACHE_STORE=array\nQUEUE_CONNECTION=sync\nMETRICS_ENABLED=false\nMETRICS_HOST_APPROVED=false\n')
    for directory in ['bootstrap/cache', 'storage/framework/views', 'storage/framework/cache', 'storage/framework/sessions', 'storage/logs', 'storage/app/private']:
        (output / directory).mkdir(parents=True, exist_ok=True, mode=0o700)
    files = {str(p.relative_to(output)): sha(p) for p in output.rglob('*') if p.is_file()}
    require(not any('/tests/' in '/' + p or '/.tools/' in '/' + p or p == '.env' for p in files), 'Private/development files in runtime candidate')
    metadata = {'schemaVersion': 1, 'releaseSha256': state['sha256'], 'developmentOnly': development, 'publicLaunchApproved': False, 'collectionEnabled': False, 'dependenciesInstalled': False, 'files': files}
    (output / 'candidate.json').write_text(json.dumps(metadata, indent=2) + '\n')
    return metadata


if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('output', type=Path); parser.add_argument('--development', action='store_true'); args = parser.parse_args()
    try:
        result = prepare(ROOT, args.output, args.development)
        print('Local runtime candidate prepared; hosting, current-source and launch checks remain separate')
    except (ValueError, KeyError, OSError) as error:
        raise SystemExit('Runtime preparation failed: ' + type(error).__name__) from error
