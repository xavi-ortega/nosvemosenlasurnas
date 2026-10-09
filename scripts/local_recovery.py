#!/usr/bin/env python3
"""Prepare bounded authenticated backups and verify fresh local restores, without deployment."""
import argparse
from contextlib import closing
import hashlib
import json
from pathlib import Path
import re
import shutil
import sqlite3
import subprocess
import tarfile
import tempfile
import time

ROOT = Path(__file__).resolve().parents[1]
LIMIT = 64 * 1024 * 1024
FILE_LIMIT = 10000


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def evidence_state(directory):
    state = json.loads((directory / 'current.json').read_text())
    require(re.fullmatch(r'[a-f0-9]{64}', state['sha256']) and state['sha256'] not in state['withdrawn'], 'Active evidence invalid or withdrawn')
    path = directory / (state['sha256'] + '.json')
    require(path.stat().st_size <= 5 * 1024 * 1024 and sha(path) == state['sha256'], 'Evidence hash mismatch')
    bank = json.loads(path.read_text())
    require(bank['schemaVersion'] == 1 and bank['engineVersion'] == 'lean-fixed-budgets-v1' and bank['kind'] == state['kind'], 'Evidence version mismatch')
    return state, bank


def copy_tree(source, target):
    require(source.is_dir() and not source.is_symlink(), 'Source directory unavailable')
    files = []
    for path in sorted(source.rglob('*')):
        require(not path.is_symlink(), 'Symlink input rejected')
        if path.is_file():
            files.append(path)
    require(len(files) <= FILE_LIMIT and sum(p.stat().st_size for p in files) <= LIMIT, 'Source file/byte budget exceeded')
    for path in files:
        destination = target / path.relative_to(source)
        destination.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        shutil.copyfile(path, destination)
        destination.chmod(0o600)


def sqlite_backup(source, destination):
    require(source.is_file() and not destination.exists(), 'Counter source unavailable or snapshot target exists')
    started = time.monotonic()
    def progress(status, remaining, total):
        require(time.monotonic() - started <= 15, 'SQLite backup time budget exceeded')
    with closing(sqlite3.connect(source.resolve().as_uri() + '?mode=rw', uri=True, timeout=0.25)) as original:
        original.execute('PRAGMA query_only=ON')
        with closing(sqlite3.connect(destination)) as copy:
            original.backup(copy, pages=128, progress=progress, sleep=0.05)
    with closing(sqlite3.connect(destination)) as copy:
        require(copy.execute('PRAGMA journal_mode=DELETE').fetchone()[0] == 'delete', 'SQLite snapshot mode failed')
        require(copy.execute('PRAGMA integrity_check').fetchone()[0] == 'ok', 'SQLite backup integrity failed')
    wal = Path(str(destination) + '-wal')
    require(not wal.exists() or wal.stat().st_size == 0, 'Snapshot still depends on WAL data')
    for suffix in ['-wal', '-shm']:
        auxiliary = Path(str(destination) + suffix)
        if auxiliary.exists():
            auxiliary.unlink()
    destination.chmod(0o600)


def crypt(action, key, source, output):
    subprocess.run([str(ROOT / 'scripts/php'), '-d', 'memory_limit=512M', str(ROOT / 'scripts/encrypt-backup.php'), action, str(key), str(source), str(output)], check=True, timeout=30, capture_output=True)


def backup(evidence, destination, key, counters=None, owner_sources=None):
    require(not destination.exists() and destination.parent.is_dir() and not destination.is_symlink(), 'Use a new backup output in an existing private directory')
    require(destination.parent.stat().st_mode & 0o077 == 0, 'Backup parent must be private (0700)')
    with tempfile.TemporaryDirectory(prefix='.recovery-', dir=destination.parent) as temporary:
        folder = Path(temporary); payload = folder / 'payload'; payload.mkdir(mode=0o700)
        copy_tree(evidence, payload / 'evidence')
        state, _ = evidence_state(payload / 'evidence')
        if counters is not None:
            sqlite_backup(counters, payload / 'counters.sqlite')
        if owner_sources is not None:
            require(not key.resolve().is_relative_to(owner_sources.resolve()) and not destination.resolve().is_relative_to(owner_sources.resolve()), 'Key/output must be outside owner source input')
            copy_tree(owner_sources, payload / 'owner-sources')
        files = {str(p.relative_to(payload)): sha(p) for p in sorted(payload.rglob('*')) if p.is_file()}
        require(sum(p.stat().st_size for p in payload.rglob('*') if p.is_file()) <= LIMIT and len(files) <= FILE_LIMIT, 'Backup total budget exceeded')
        manifest = {'schemaVersion': 1, 'releaseSha256': state['sha256'], 'files': files, 'containsCounters': counters is not None}
        (payload / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
        archive = folder / 'snapshot.tar'
        with tarfile.open(archive, 'w') as stream:
            for path in sorted(payload.rglob('*')):
                if path.is_file(): stream.add(path, arcname=str(path.relative_to(payload)), recursive=False)
        require(archive.stat().st_size <= LIMIT, 'Archive budget exceeded')
        crypt('encrypt', key, archive, destination)
    return manifest


def restore(archive, target, key):
    require(not target.exists() and target.parent.is_dir(), 'Restore target must be new')
    require(archive.stat().st_size <= 128 * 1024 * 1024, 'Encrypted archive budget exceeded')
    with tempfile.TemporaryDirectory(prefix='.restore-', dir=target.parent) as temporary:
        folder = Path(temporary); clear = folder / 'snapshot.tar'; payload = folder / 'payload'; payload.mkdir(mode=0o700)
        crypt('decrypt', key, archive, clear)
        require(clear.stat().st_size <= LIMIT, 'Decrypted archive budget exceeded')
        with tarfile.open(clear, 'r') as stream:
            members = stream.getmembers()
            require(len(members) <= FILE_LIMIT + 1 and sum(m.size for m in members) <= LIMIT, 'Archive member budget exceeded')
            require(len({m.name for m in members}) == len(members), 'Duplicate archive paths rejected')
            for member in members:
                path = Path(member.name)
                require(member.isfile() and not path.is_absolute() and '..' not in path.parts and path.parts and path.parts[0] in {'evidence', 'owner-sources', 'counters.sqlite', 'manifest.json'}, 'Unsafe archive member rejected')
            stream.extractall(payload, filter='data')
        manifest = json.loads((payload / 'manifest.json').read_text())
        actual = {str(p.relative_to(payload)): sha(p) for p in payload.rglob('*') if p.is_file() and p != payload / 'manifest.json'}
        require(manifest['schemaVersion'] == 1 and actual == manifest['files'], 'Restored file hash mismatch')
        state, _ = evidence_state(payload / 'evidence')
        require(state['sha256'] == manifest['releaseSha256'], 'Restored pointer mismatch')
        if manifest['containsCounters']:
            with closing(sqlite3.connect((payload / 'counters.sqlite').resolve().as_uri() + '?mode=ro', uri=True)) as connection:
                require(connection.execute('PRAGMA integrity_check').fetchone()[0] == 'ok', 'Restored counter integrity failed')
        target.mkdir(mode=0o700)
        for item in payload.iterdir():
            item.rename(target / item.name)
    return manifest


def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest='action', required=True)
    create = sub.add_parser('backup'); create.add_argument('output', type=Path); create.add_argument('--evidence', type=Path, default=ROOT / 'resources/evidence'); create.add_argument('--counters', type=Path); create.add_argument('--owner-sources', type=Path); create.add_argument('--key', type=Path, required=True)
    recover = sub.add_parser('restore'); recover.add_argument('archive', type=Path); recover.add_argument('target', type=Path); recover.add_argument('--key', type=Path, required=True)
    args = parser.parse_args()
    if args.action == 'backup': backup(args.evidence, args.output, args.key, args.counters, args.owner_sources)
    else: restore(args.archive, args.target, args.key)
    print('Local authenticated snapshot operation completed; no deployment or active pointer change')


if __name__ == '__main__':
    try: main()
    except (ValueError, KeyError, OSError, sqlite3.Error, subprocess.SubprocessError, tarfile.TarError) as error:
        raise SystemExit('Recovery failed: ' + type(error).__name__) from error
