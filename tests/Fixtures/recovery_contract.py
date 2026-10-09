"""Cross-runtime authenticated backup and portable runtime acceptance fixtures."""
import json
from pathlib import Path
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import threading
import time
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts'))
import local_recovery as recovery
import prepare_runtime as runtime


class RecoveryContractTest(unittest.TestCase):
    def key(self, path):
        subprocess.run([str(ROOT / 'scripts/php'), str(ROOT / 'scripts/encrypt-backup.php'), 'key', str(path)], check=True, capture_output=True)

    def test_encrypted_snapshot_preserves_hashes_owner_files_and_live_sqlite_counters(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory); key = folder / 'key'; self.key(key)
            source = folder / 'sources'; source.mkdir(); (source / 'manifest.json').write_text('{"private-source":"preserved"}')
            database = folder / 'metrics.sqlite'
            with sqlite3.connect(database) as connection:
                connection.execute('PRAGMA journal_mode=WAL'); connection.execute('CREATE TABLE counts (id INTEGER PRIMARY KEY, count INTEGER NOT NULL)'); connection.execute('INSERT INTO counts VALUES (1, 0)')
            running = threading.Event(); running.set(); started = threading.Event(); errors = []
            def writer():
                try:
                    with sqlite3.connect(database) as connection:
                        for _ in range(100):
                            if not running.is_set(): break
                            connection.execute('UPDATE counts SET count=count+1 WHERE id=1'); connection.commit(); started.set(); time.sleep(0.002)
                except Exception as error: errors.append(type(error).__name__)
            thread = threading.Thread(target=writer); thread.start(); self.assertTrue(started.wait(2))
            archive = folder / 'snapshot.enc'
            manifest = recovery.backup(ROOT / 'resources/evidence', archive, key, database, source)
            running.clear(); thread.join()
            self.assertEqual(errors, [])
            self.assertNotIn(b'private-source', archive.read_bytes())
            self.assertEqual(archive.stat().st_mode & 0o777, 0o600)
            restored = folder / 'restored'; recovered = recovery.restore(archive, restored, key)
            self.assertEqual(manifest, recovered)
            self.assertEqual((restored / 'owner-sources/manifest.json').read_text(), '{"private-source":"preserved"}')
            with sqlite3.connect(restored / 'counters.sqlite') as connection:
                self.assertEqual(connection.execute('PRAGMA integrity_check').fetchone()[0], 'ok')
                restored_count = connection.execute('SELECT count FROM counts').fetchone()[0]
                self.assertGreaterEqual(restored_count, 1)
            with sqlite3.connect(database) as connection:
                self.assertEqual(connection.execute('PRAGMA journal_mode').fetchone()[0], 'wal')
                self.assertLessEqual(restored_count, connection.execute('SELECT count FROM counts').fetchone()[0])
            with self.assertRaises(ValueError): recovery.restore(archive, restored, key)
            wrong = folder / 'wrong-key'; self.key(wrong)
            with self.assertRaises(subprocess.CalledProcessError): recovery.restore(archive, folder / 'wrong-restore', wrong)
            archive.write_bytes(archive.read_bytes()[:-10] + b'corrupted!')
            with self.assertRaises(subprocess.CalledProcessError): recovery.restore(archive, folder / 'tampered', key)
            self.assertFalse((folder / 'tampered').exists())

    def test_runtime_copy_excludes_secrets_tools_and_requires_current_sources(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory); source = folder / 'app'; source.mkdir()
            (source / 'resources').mkdir(); shutil.copytree(ROOT / 'resources/evidence', source / 'resources/evidence')
            (source / 'public/build').mkdir(parents=True); (source / 'public/build/manifest.json').write_text('{}')
            (source / 'app').mkdir(); (source / 'app/Example.php').write_text('<?php')
            (source / 'bootstrap/cache').mkdir(parents=True); (source / 'bootstrap/cache/secret.php').write_text('secret-cache')
            (source / '.env').write_text('PRIVATE_FIXTURE_SECRET=value'); (source / '.tools').mkdir(); (source / '.tools/parser.py').write_text('private-tool')
            with self.assertRaises(ValueError): runtime.prepare(source, folder / 'production')
            result = runtime.prepare(source, folder / 'development', development=True)
            self.assertTrue(result['developmentOnly']); self.assertFalse(result['collectionEnabled'])
            self.assertNotIn('.env', result['files']); self.assertNotIn('.tools/parser.py', result['files']); self.assertNotIn('bootstrap/cache/secret.php', result['files'])
            self.assertFalse((folder / 'development/bootstrap/cache/secret.php').exists())
            with self.assertRaises(ValueError): recovery.backup(ROOT / 'resources/evidence', folder / 'missing-parent/snapshot.enc', folder / 'key')
            links = folder / 'links'; links.mkdir(); (links / 'link').symlink_to(ROOT / 'README.md')
            with self.assertRaises(ValueError): recovery.copy_tree(links, folder / 'copied')


if __name__ == '__main__': unittest.main()
