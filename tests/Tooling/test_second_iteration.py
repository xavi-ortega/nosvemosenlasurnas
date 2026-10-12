"""Real second-iteration recovery and immutable version lifecycle regression."""
import hashlib
import json
from pathlib import Path
import secrets
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts'))
import local_recovery as recovery
import manage_releases as releases


class SecondIterationRecoveryTest(unittest.TestCase):
    def test_real_v2_bank_restores_byte_exactly_and_withdrawn_bank_cannot_be_reactivated(self):
        with tempfile.TemporaryDirectory() as temporary:
            folder = Path(temporary)
            folder.chmod(0o700)
            evidence = folder / 'evidence'; evidence.mkdir()
            data = (ROOT / 'outputs/quiz-2023-second-iteration-bank.json').read_bytes()
            sha = hashlib.sha256(data).hexdigest()
            (evidence / (sha + '.json')).write_bytes(data)
            (evidence / 'current.json').write_text(json.dumps({'sha256': sha, 'kind': 'historical', 'withdrawn': [], 'history': []}))
            key = folder / 'key'; key.write_bytes(secrets.token_bytes(32)); key.chmod(0o600)
            archive = folder / 'backup.bin'

            backed = recovery.backup(evidence, archive, key)
            restored = recovery.restore(archive, folder / 'restore', key)

            self.assertEqual(restored, backed)
            self.assertEqual((folder / 'restore/evidence' / (sha + '.json')).read_bytes(), data)
            self.assertFalse(restored['containsCounters'])
            state = releases.manage(evidence, 'withdraw', sha, 'Retirada de prueba local')
            self.assertIn(sha, state['withdrawn'])
            with self.assertRaises(ValueError):
                releases.manage(evidence, 'activate', sha, 'No reactivar una retirada')
            self.assertEqual((evidence / (sha + '.json')).read_bytes(), data)


if __name__ == '__main__':
    unittest.main()
