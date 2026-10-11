"""Congress registry contracts: preserve corrections/exclusions and never borrow a roster."""
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("registry", ROOT / "scripts/reconcile_candidacies.py")
registry = importlib.util.module_from_spec(spec)
spec.loader.exec_module(registry)


class CandidacyRegistryTest(unittest.TestCase):
    def test_congress_excludes_senate_and_preserves_non_proclaimed_ballots(self):
        source = '<div id="textoxslt"><p class="centro_negrita">JUNTA ELECTORAL DE TEST</p><p class="centro_cursiva">CONGRESO DE LOS DIPUTADOS</p><p class="centro_redonda">1. ONE (A)</p><p class="parrafo_2">1. Person.</p><p class="centro_redonda">2. TWO (B)</p><p class="parrafo_2">No proclamada.</p><p class="centro_cursiva">SENADO</p><p class="centro_redonda">3. SENATE (C)</p></div><!-- #textoxslt -->'

        rows = registry.proclaimed_rows(source)

        self.assertEqual([row['officialName'] for row in rows], ['ONE (A)', 'TWO (B)'])
        self.assertEqual([row['status'] for row in rows], ['proclaimed', 'not_proclaimed'])

    def test_missing_alias_or_territorial_result_pair_fails_closed(self):
        row = {'district': 'TEST', 'number': 1, 'officialName': 'ONE (A)', 'status': 'proclaimed'}
        inventory = {'candidacies': [{'id': 'one', 'officialName': 'ONE (A)', 'constituencies': [{'name': 'Test'}]}, {'id': 'two', 'officialName': 'TWO (B)', 'constituencies': [{'name': 'Test'}]}]}
        aliases = {'constituencyAliases': {}, 'candidacyAliases': {}}

        with self.assertRaisesRegex(ValueError, 'coverage mismatch'):
            registry.reconcile([row], inventory, aliases)
        row['officialName'] = 'ALIEN (C)'
        with self.assertRaisesRegex(ValueError, 'Unresolved candidacy'):
            registry.reconcile([row], inventory, aliases)

    def test_real_registry_contains_every_result_pair_and_applies_teruel_correction(self):
        data = json.loads((ROOT / 'outputs/2023-candidacy-registry.json').read_text())
        inventory = json.loads((ROOT / 'outputs/2023-source-inventory.json').read_text())
        ballots = [row for row in data['records'] if row['status'] == 'proclaimed']

        self.assertEqual(len(ballots), 550)
        self.assertEqual(len({row['constituency'] for row in ballots}), 52)
        self.assertEqual(len([row for row in data['records'] if row['status'] == 'not_proclaimed']), 34)
        self.assertEqual({(row['resultDenominationId'], row['constituency']) for row in ballots}, {(c['id'], item['name']) for c in inventory['candidacies'] for item in c['constituencies']})
        teruel = next(row for row in ballots if row['district'] == 'TERUEL' and row['number'] == 13)
        self.assertEqual(teruel['resultDenominationId'], 'boe-2023-013')
        self.assertEqual(teruel['correctionIds'], ['BOE-A-2023-15828'])
        self.assertTrue(any('COMPROMÍS' in row['officialName'] for row in ballots))
        self.assertTrue(any('MÉS PER MENORCA' in row['officialName'] for row in ballots))
