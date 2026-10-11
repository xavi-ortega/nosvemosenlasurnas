"""Exercise real offline import, grounding and immutable release failure boundaries."""
import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest
import sys
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts'))
spec = importlib.util.spec_from_file_location('prepare_sources', ROOT / 'scripts/prepare_sources.py')
compiler = importlib.util.module_from_spec(spec)
spec.loader.exec_module(compiler)


class SourcePreparationTest(unittest.TestCase):
    def test_compiles_exact_citations_preserves_missing_candidates_and_fixed_budgets(self):
        bank = compiler.compile_manifest(ROOT / 'tests/Fixtures/programmes/manifest.json')
        self.assertEqual(bank['positions']['alpha']['housing-1']['value'], -2)
        self.assertEqual(bank['positions']['delta']['housing-1']['status'], 'unknown')
        citation = bank['positions']['alpha']['housing-1']['citations'][0]
        self.assertEqual(citation['quote'], 'Rechazamos: Aumentar la vivienda pública en alquiler.')
        self.assertEqual(bank['documents'][0]['text'][citation['start']:citation['end']], citation['quote'])
        self.assertEqual(len(bank['questions']), 20)

    def test_rejects_changed_bytes_wrong_election_kind_dates_and_path_escape(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            shutil.copytree(ROOT / 'tests/Fixtures/programmes', folder, dirs_exist_ok=True)
            manifest_path = folder / 'manifest.json'
            original = json.loads(manifest_path.read_text())
            for key, value in [('sha256', 'a' * 64), ('electionId', 'other-election'), ('kind', 'current'), ('validUntil', '2026-10-01'), ('file', '../outside.txt')]:
                with self.subTest(field=key):
                    manifest = json.loads(json.dumps(original))
                    manifest['sources'][0][key] = value
                    manifest_path.write_text(json.dumps(manifest))
                    with self.assertRaises(ValueError):
                        compiler.compile_manifest(manifest_path)

    def test_unsafe_html_is_removed_and_unknown_wording_never_becomes_numeric(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'input.html'
            path.write_text('<script>Apoyamos: unsafe</script><p>No apoyamos necesariamente esa medida.</p>')
            _, text = compiler.extract(path)
            self.assertNotIn('unsafe', text)
            self.assertIn('No apoyamos necesariamente', text)

    def test_conflicting_claims_are_unscored_and_corrections_preserve_previous_release(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            shutil.copytree(ROOT / 'tests/Fixtures/programmes', folder / 'inputs')
            path = folder / 'inputs/manifest.json'
            original = compiler.compile_manifest(path)
            first = compiler.publish(original, folder / 'releases', 'Initial fixture')
            data = json.loads(path.read_text())
            source = folder / 'inputs/alpha.txt'
            source.write_text(source.read_text() + '\nApoyamos: Aumentar la vivienda pública en alquiler.\n')
            data['sources'][0]['sha256'] = compiler.digest(source.read_bytes())
            path.write_text(json.dumps(data))
            corrected = compiler.compile_manifest(path)
            self.assertEqual(corrected['positions']['alpha']['housing-1']['status'], 'conflicting')
            self.assertIsNone(corrected['positions']['alpha']['housing-1']['value'])
            second = compiler.publish(corrected, folder / 'releases', 'Conflicting fixture correction')
            self.assertNotEqual(first, second)
            pointer = json.loads((folder / 'releases/current.json').read_text())
            self.assertEqual(pointer['history'][1]['previous'], first)
            self.assertTrue((folder / 'releases' / (first + '.json')).exists())

    def test_authored_help_survives_public_bundle_without_changing_positions(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            shutil.copytree(ROOT / 'tests/Fixtures/programmes', folder, dirs_exist_ok=True)
            path = folder / 'manifest.json'
            baseline = compiler.compile_manifest(path)
            manifest = json.loads(path.read_text())
            help_text = 'Explicación ficticia: la ayuda conserva las condiciones de la pregunta.'
            manifest['questions'][0]['help'] = help_text
            path.write_text(json.dumps(manifest, ensure_ascii=False))

            bank = compiler.compile_manifest(path)
            public = json.loads(compiler.public_bytes(bank))

            self.assertEqual(public['questions'][0]['help'], help_text)
            self.assertEqual(bank['positions'], baseline['positions'])
            self.assertNotIn('help', public['questions'][1])

    def test_rejects_invalid_help_and_other_unexpected_question_fields(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            shutil.copytree(ROOT / 'tests/Fixtures/programmes', folder, dirs_exist_ok=True)
            path = folder / 'manifest.json'
            original = json.loads(path.read_text())
            for value in [None, 3, [], '', '   ', 'x' * 1201, '\x00', '\x0b', '😀' * 601]:
                with self.subTest(help=value):
                    manifest = json.loads(json.dumps(original))
                    manifest['questions'][0]['help'] = value
                    path.write_text(json.dumps(manifest))

                    with self.assertRaisesRegex(ValueError, 'Invalid question help'):
                        compiler.compile_manifest(path)
            for value in ['x' * 1200, '😀' * 600]:
                with self.subTest(accepted_help_length=len(value)):
                    manifest = json.loads(json.dumps(original))
                    manifest['questions'][0]['help'] = value
                    path.write_text(json.dumps(manifest))

                    self.assertEqual(compiler.compile_manifest(path)['questions'][0]['help'], value)
            manifest['questions'][0]['internalNotes'] = 'Unpublished author notes'
            path.write_text(json.dumps(manifest))

            with self.assertRaisesRegex(ValueError, 'Unknown public fields'):
                compiler.compile_manifest(path)

    def test_real_sources_never_receive_automatic_literal_positions(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            shutil.copytree(ROOT / 'tests/Fixtures/programmes', folder, dirs_exist_ok=True)
            path = folder / 'manifest.json'
            original = json.loads(path.read_text())
            for kind in ['historical', 'current']:
                with self.subTest(kind=kind):
                    manifest = json.loads(json.dumps(original))
                    manifest['kind'] = kind
                    for source in manifest['sources']:
                        source['kind'] = kind
                    path.write_text(json.dumps(manifest))

                    bank = compiler.compile_manifest(path)

                    self.assertEqual(bank['interpretation'], 'authored_positions_pending')
                    self.assertTrue(bank['documents'])
                    for positions in bank['positions'].values():
                        for position in positions.values():
                            self.assertEqual(position, {'status': 'unknown', 'value': None, 'citations': []})
