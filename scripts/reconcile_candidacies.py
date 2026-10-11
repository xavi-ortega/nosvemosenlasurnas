#!/usr/bin/env python3
"""Reconcile Congress ballot records with explicit aliases and official result coverage."""
import argparse
import hashlib
import html
import json
from pathlib import Path
import re
import unicodedata


def normalize(value):
    return ''.join(char for char in unicodedata.normalize('NFD', value.casefold()) if char.isalnum() and not unicodedata.combining(char))


def paragraphs(source):
    start = source.index('id="textoxslt"')
    body = source[start:source.index('<!-- #textoxslt', start)]
    return [(style, re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', text))).strip()) for style, text in re.findall(r'<p class="([^"]*)"[^>]*>(.*?)</p>', body, re.S)]


def proclaimed_rows(source):
    records = []
    district = None
    congress = False
    for style, text in paragraphs(source):
        if style == 'centro_negrita' and text.startswith('JUNTA ELECTORAL DE '):
            district = text.removeprefix('JUNTA ELECTORAL DE ')
            congress = False
        if text == 'CONGRESO DE LOS DIPUTADOS':
            congress = True
        if text == 'SENADO':
            congress = False
        if congress and style == 'centro_redonda' and '(' in text:
            match = re.fullmatch(r'(?:Candidatura núm\.: )?(\d+)\.\s*(.+)', text)
            if not match or district is None:
                raise ValueError('Unrecognised Congress heading: ' + text)
            records.append({'district': district, 'number': int(match[1]), 'proclaimedName': match[2], 'officialName': match[2], 'status': 'proclaimed', 'proclamationParagraph': text, 'correctionIds': []})
        if congress and text == 'No proclamada.':
            if not records or records[-1]['district'] != district:
                raise ValueError('Unattached non-proclamation record.')
            records[-1]['status'] = 'not_proclaimed'
    keys = [(row['district'], row['number']) for row in records]
    if not records or len(keys) != len(set(keys)):
        raise ValueError('Empty or duplicate Congress records.')
    return records


def reconcile(records, inventory, aliases):
    district_names = {normalize(item['name']): item['name'] for row in inventory['candidacies'] for item in row['constituencies']}
    districts = {normalize(name): target for name, target in aliases['constituencyAliases'].items()}
    names = {normalize(row['officialName']): row['id'] for row in inventory['candidacies']}
    for name, identifier in aliases['candidacyAliases'].items():
        key = normalize(name)
        if key in names and names[key] != identifier:
            raise ValueError('Conflicting candidacy alias: ' + name)
        names[key] = identifier
    expected = {(row['id'], item['name']) for row in inventory['candidacies'] for item in row['constituencies']}
    actual = set()
    for row in records:
        key = normalize(row['district'])
        row['constituency'] = districts.get(key, district_names.get(key))
        if row['constituency'] is None:
            raise ValueError('Unresolved constituency: ' + row['district'])
        row['id'] = 'congress-' + normalize(row['district']) + '-' + str(row['number'])
        row['resultDenominationId'] = names.get(normalize(row['officialName']))
        if row['status'] == 'proclaimed':
            if row['resultDenominationId'] is None:
                raise ValueError('Unresolved candidacy: ' + row['officialName'])
            pair = (row['resultDenominationId'], row['constituency'])
            if pair in actual:
                raise ValueError('Duplicate ballot choice: ' + str(pair))
            actual.add(pair)
    if actual != expected:
        raise ValueError('Official coverage mismatch: ' + repr({'missing': sorted(expected - actual), 'additional': sorted(actual - expected)}))
    return records


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cache', type=Path, default=Path('storage/app/election-sources/2023-congress'))
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    inventory = json.loads(Path('outputs/2023-source-inventory.json').read_text())
    aliases = json.loads(Path('outputs/2023-candidacy-aliases.json').read_text())
    sources = {}
    for name, expected in aliases['sourceHashes'].items():
        path = args.cache / name
        if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            raise ValueError('Official source hash mismatch: ' + name)
        sources[name] = path.read_text()
    records = proclaimed_rows(sources['boe-proclaimed.html'])
    # The explicitly authored correction ledger changes ballot names/status only, never policy positions.
    for correction in aliases['corrections']:
        matches = [row for row in records if row['district'] == correction['district'] and row['number'] == correction['number']]
        if len(matches) != 1 or matches[0]['officialName'] != correction['before']:
            raise ValueError('Correction target mismatch.')
        source = sources[correction['sourceFile']]
        plain = ' '.join(text for _, text in paragraphs(source))
        if correction['evidence'] not in plain:
            raise ValueError('Correction evidence missing.')
        row = matches[0]
        row['officialName'] = correction['after']
        if 'status' in correction:
            row['status'] = correction['status']
        row['correctionIds'].append(correction['sourceId'])
    records = reconcile(records, inventory, aliases)
    payload = {'schemaVersion': 1, 'electionId': inventory['electionId'], 'chamber': 'congress', 'sourceHashes': aliases['sourceHashes'], 'constituencyCount': len({row['constituency'] for row in records}), 'finalBallotCount': sum(row['status'] == 'proclaimed' for row in records), 'notProclaimedCount': sum(row['status'] != 'proclaimed' for row in records), 'resultDenominationCount': len(inventory['candidacies']), 'programmeApplicability': 'A result-table alias is a roster relationship only; it never authorises inheriting another party or coalition programme.', 'records': records}
    content = json.dumps(payload, ensure_ascii=False, indent=2) + '\n'
    output = Path('outputs/2023-candidacy-registry.json')
    if args.check:
        if output.read_text() != content:
            raise ValueError('Registry differs from official source reconciliation.')
        print('Official Congress registry reproducibility passed.')
    else:
        output.write_text(content)
        print('Reconciled', payload['finalBallotCount'], 'ballots in', payload['constituencyCount'], 'constituencies;', payload['notProclaimedCount'], 'excluded records retained.')


if __name__ == '__main__':
    main()
