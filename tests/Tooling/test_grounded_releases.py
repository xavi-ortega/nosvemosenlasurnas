"""Grounded preparation, parser limits and reversible correction contracts."""
from datetime import date
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts'))
import prepare_sources as compiler
import manage_releases as releases


class GroundedReleaseTest(unittest.TestCase):
    def prepare(self, folder, status='derived', value=2):
        shutil.copytree(ROOT / 'tests/Fixtures/programmes', folder, dirs_exist_ok=True)
        manifest_path = folder / 'manifest.json'
        manifest = json.loads(manifest_path.read_text())
        source = folder / 'alpha.txt'
        text = 'Impulsaremos el alquiler público, con una reserva del 30 % para hogares vulnerables.\n\nNo eliminaremos los límites de renta.\n'
        source.write_text(text)
        manifest['sources'][0]['sha256'] = compiler.digest(source.read_bytes())
        hashes = {s['id']: s['sha256'] for s in manifest['sources']}
        end = text.index('\n\n')
        mapping = {'candidacyId': 'alpha', 'questionId': 'housing-1', 'status': status, 'value': value, 'rationale': 'La propuesta expresa apoyo al alquiler público y conserva la condición del 30 % en su contexto.', 'citations': [{'documentId': manifest['sources'][0]['id'], 'start': 0, 'end': end, 'contextStart': 0, 'contextEnd': end}]}
        prepared = {'schemaVersion': 1, 'electionId': manifest['election']['id'], 'sourceHashes': hashes, 'positions': [mapping]}
        path = folder / 'prepared.json'
        path.write_text(json.dumps(prepared, ensure_ascii=False))
        manifest['preparation'] = {'schemaVersion': 1, 'toolVersion': 'local-agent-input-v1', 'promptVersion': 'grounded-policy-v1', 'file': 'prepared.json', 'sha256': compiler.digest(path.read_bytes())}
        manifest_path.write_text(json.dumps(manifest))
        return manifest_path, prepared

    def replace_prepared(self, manifest_path, prepared):
        path = manifest_path.parent / 'prepared.json'
        path.write_text(json.dumps(prepared, ensure_ascii=False))
        manifest = json.loads(manifest_path.read_text())
        manifest['preparation']['sha256'] = compiler.digest(path.read_bytes())
        manifest_path.write_text(json.dumps(manifest))

    def test_build_time_positions_retain_exact_unicode_context_conditions_and_versions(self):
        with tempfile.TemporaryDirectory() as directory:
            path, _ = self.prepare(Path(directory))
            bank = compiler.compile_manifest(path)
            position = bank['positions']['alpha']['housing-1']
            citation = position['citations'][0]
            self.assertEqual(position['value'], 2)
            self.assertIn('30 %', citation['context'])
            self.assertEqual(bank['documents'][0]['text'][citation['start']:citation['end']], citation['quote'])
            self.assertEqual(citation['locator'], {'page': 1, 'line': 1})
            self.assertEqual(bank['preparation']['promptVersion'], 'grounded-policy-v1')
            self.assertEqual(bank['positions']['delta']['housing-1']['status'], 'unknown')

    def test_ambiguous_unsupported_conflicting_and_invalid_grounding_remain_unscored_or_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            for status in ['ambiguous', 'unsupported', 'conflicting']:
                path, _ = self.prepare(folder, status, None)
                bank = compiler.compile_manifest(path)
                self.assertIsNone(bank['positions']['alpha']['housing-1']['value'])
            path, original = self.prepare(folder)
            changes = [
                ('value', 3), ('candidacyId', 'beta'), ('questionId', 'invented'),
                ('status', 'approved'), ('citations', [{'documentId': original['positions'][0]['citations'][0]['documentId'], 'start': 1, 'end': 10, 'contextStart': 1, 'contextEnd': 10}]),
            ]
            for field, value in changes:
                with self.subTest(field=field):
                    prepared = json.loads(json.dumps(original))
                    prepared['positions'][0][field] = value
                    self.replace_prepared(path, prepared)
                    with self.assertRaises(ValueError):
                        compiler.compile_manifest(path)
            prepared = json.loads(json.dumps(original)); prepared['sourceHashes'] = {}
            self.replace_prepared(path, prepared)
            with self.assertRaises(ValueError): compiler.compile_manifest(path)

    def test_initial_paragraph_and_credentialed_original_urls_have_safe_boundaries(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            shutil.copytree(ROOT / 'tests/Fixtures/programmes', folder, dirs_exist_ok=True)
            path = folder / 'manifest.json'; manifest = json.loads(path.read_text())
            source = folder / 'alpha.txt'; source.write_text('Apoyamos: Aumentar la vivienda pública en alquiler.\n')
            manifest['sources'][0]['sha256'] = compiler.digest(source.read_bytes()); path.write_text(json.dumps(manifest))
            self.assertEqual(compiler.compile_manifest(path)['positions']['alpha']['housing-1']['value'], 2)
            manifest['sources'][0]['url'] = 'https://user:password@example.org/source.pdf'; path.write_text(json.dumps(manifest))
            with self.assertRaises(ValueError): compiler.compile_manifest(path)

    def test_real_subprocess_empty_extraction_time_and_output_budgets_fail_closed(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory); pdf = folder / 'source.pdf'; pdf.write_bytes(b'%PDF-1.4\n')
            worker = folder / 'parser'; worker.write_text('#!/usr/bin/env python3\nimport time\ntime.sleep(2)\n'); worker.chmod(0o700)
            with patch.object(compiler, 'PDF_SECONDS', 0.1):
                with self.assertRaises(ValueError): compiler.extract(pdf, str(worker))
            worker.write_text('#!/usr/bin/env python3\nprint("x" * 1024)\n')
            with patch.object(compiler, 'LIMIT', 512):
                with self.assertRaises(ValueError): compiler.extract(pdf, str(worker))
            worker.write_text('#!/usr/bin/env python3\n')
            with self.assertRaises(ValueError): compiler.extract(pdf, str(worker))
            with patch.object(compiler, 'LIMIT', 4):
                with self.assertRaises(ValueError): compiler.extract(pdf, str(worker))

    def test_withdrawal_and_rollback_preserve_immutable_banks_and_reject_withdrawn_activation(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory); path, _ = self.prepare(folder / 'sources')
            bank = compiler.compile_manifest(path); first = compiler.publish(bank, folder / 'releases', 'Edición de prueba')
            changed = json.loads(json.dumps(bank)); changed['limitations'].append('Corrección de prueba')
            second = compiler.publish(changed, folder / 'releases', 'Corrección de prueba')
            releases.manage(folder / 'releases', 'activate', first, 'Restauración de prueba')
            state = releases.manage(folder / 'releases', 'withdraw', second, 'Retirada de prueba')
            self.assertEqual(state['sha256'], first)
            self.assertIn(second, state['withdrawn'])
            self.assertEqual(len(state['history']), 4)
            self.assertTrue((folder / 'releases' / (second + '.json')).exists())
            with self.assertRaises(ValueError): releases.manage(folder / 'releases', 'activate', second, 'Invalid restoration')
            with self.assertRaises(ValueError): compiler.publish(changed, folder / 'releases', 'Invalid restoration')
