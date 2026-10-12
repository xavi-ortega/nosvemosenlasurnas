#!/usr/bin/env python3
"""Package retained authored positions with versioned reading, ordering and profile metadata."""
import argparse
import copy
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = Path(__file__).resolve().parents[1]
BASELINE_HASH = 'e5f20cc29577629d3b93e3397d06a723d838b08d4f06461b53c336205f97a86d'


def load(path):
    return json.loads(path.read_text())


def profiles(bank):
    result = [{'id': c['id'] + '-p1', 'candidacyId': c['id'], 'name': c['name'], 'constituencyIds': c['constituencyIds']} for c in bank['candidacies']]
    assert len(result) == 59 and len(bank['candidacies']) == 59
    assert sum(len(p['constituencyIds']) for p in result) == 550
    return result


def common_programmes(bank):
    revision = load(ROOT / 'outputs/quiz-2023-second-iteration-content-decisions.json')['commonProgrammeRevision']
    assert revision['policy'] == 'common-election-programme-v1'
    assert revision['electionId'] == bank['election']['id'] == 'es-congress-2023-07-23'
    decisions = {d['documentId']: d for d in revision['documentDecisions']}
    assert len(decisions) == len(revision['documentDecisions']) == len(bank['documents'])
    assert set(decisions) == {d['id'] for d in bank['documents']}
    for document in bank['documents']:
        decision = decisions[document['id']]
        assert decision['sourceSha256'] == document['sha256'] and decision['candidacyId'] == document['candidacyId']
        notebook = ROOT / decision['notebook']
        assert hashlib.sha256(notebook.read_bytes()).hexdigest() == decision['notebookSha256']
        notes = load(notebook)
        assert notes['fullDocumentRead'] and notes['sourceSha256'] == document['sha256'] and notes['candidacyId'] == document['candidacyId']
        assert decision['decision'] in ['include_common_programme', 'exclude']
    allowed = {id for id, decision in decisions.items() if decision['decision'] == 'include_common_programme'}
    candidates = {c['candidacyId']: c for c in revision['candidacyDecisions']}
    assert len(candidates) == len(revision['candidacyDecisions']) == len(bank['candidacies'])
    registry = load(ROOT / 'outputs/2023-candidacy-registry.json')
    assert registry['electionId'] == bank['election']['id']
    corrections = {(c['candidacyId'], c['questionId']): c for c in revision['positionCorrections']}
    assert len(corrections) == len(revision['positionCorrections'])
    for candidate in bank['candidacies']:
        id = candidate['id']; decision = candidates[id]
        ballots = [r for r in registry['records'] if r['status'] == 'proclaimed' and r['resultDenominationId'] == id]
        assert set(decision['ballotRecordIds']) == {r['id'] for r in ballots}
        assert set(candidate['constituencyIds']) == {r['id'].rsplit('-', 1)[0].removeprefix('congress-') for r in ballots}
        assert set(decision['programmeDocumentIds']) == {d['id'] for d in bank['documents'] if d['id'] in allowed and d['candidacyId'] == id}
        source_scope = decision.get('retainedPositionScope')
        if source_scope is not None:
            assert id == 'boe-2023-004' and source_scope == 'madrid'
            bank['positions'][id].update(copy.deepcopy(bank['constituencyPositions'][source_scope][id]))
        for question, position in bank['positions'][id].items():
            if not decision['programmeDocumentIds']:
                bank['positions'][id][question] = {'status': 'unknown', 'value': None, 'citations': [], 'rationale': decision['missingProgrammeExplanation']}
                continue
            if (id, question) in corrections:
                correction = corrections[(id, question)]
                assert position['status'] == correction['previousStatus'] and position['value'] == correction['previousValue']
                assert {c['documentId'] for c in position['citations']} == set(correction['previousDocumentIds'])
                position.update(status='unknown', value=None, rationale=correction['rationale'])
            if any(c['documentId'] not in allowed for c in position['citations']):
                assert position['status'] != 'derived', 'A scored cell still depends on an excluded source'
                assert (id, question) in corrections or id == 'boe-2023-026', 'Missing directly authored correction'
                if id == 'boe-2023-026':
                    position['rationale'] = decision['nonPolicyExplanation']
                position['citations'] = [c for c in position['citations'] if c['documentId'] in allowed]
    bank['documents'] = [d | {'programmeRole': 'common_election_programme'} for d in bank['documents'] if d['id'] in allowed]
    bank.pop('constituencyPositions', None)
    bank['programmePolicy'] = revision['policy']
    assert all(c['documentId'] in allowed for positions in bank['positions'].values() for p in positions.values() for c in p['citations'])


def official_candidates(bank):
    exceptions = {
        'psoe-preserved-objective': 'https://www.psoe.es/media-content/2023/07/PROGRAMA_ELECTORAL-GENERALES-2023.pdf',
        'ehbildu-preserved-newtral': 'https://ehbildu.eus/dokumentuak/23J-COMPROMISO-DE-EUSKAL-HERRIA-BILDU.pdf',
        'junts-beteve-programme': 'https://junts.cat/wp-content/uploads/2023/08/Programa-Electoral-Definitiu-def.pdf',
        'junts-preserved-abc': 'https://junts.cat/wp-content/uploads/2023/08/Programa-Electoral-Definitiu-def.pdf',
        'caminando-preserved-i28': 'https://caminando-juntos.org/programa/',
        'pdecat-primary-cdn': 'https://www.pdecat.cat/index.php/2023/07/17/programa-electoral-eleccions-generals-2023/',
    }
    for document in bank['documents']:
        url = exceptions.get(document['id'], document['url'])
        if url.startswith('https://web.archive.org/web/'):
            url = 'https://' + url.split('/https://', 1)[1]
        yield document, url


def audit_links(bank):
    recorded = datetime.now(timezone.utc).isoformat()
    inventory = load(ROOT / 'outputs/2023-source-inventory.json')
    retained = inventory['acquisitions'] + inventory.get('publicationAcquisitions', [])

    def probe(pair):
        document, url = pair
        record = {'documentId': document['id'], 'attemptedOfficialUrl': url, 'preservedUrl': document['url'], 'sourceSha256': document['sha256'], 'checkedAt': recorded}
        try:
            request = urllib.request.Request(url, headers={'User-Agent': 'NosVemosenLasUrnas local source verification', 'Range': 'bytes=0-65535'})
            with urllib.request.urlopen(request, timeout=12) as response:
                sample = response.read(65536)
                record.update(httpStatus=response.status, resolvedUrl=response.url, mediaType=response.headers.get('Content-Type', ''), sampleSha256=hashlib.sha256(sample).hexdigest())
                retained_primary = url == document['url'] and not url.startswith('https://web.archive.org/')
                exact_ehbildu = document['id'] == 'ehbildu-preserved-newtral' and hashlib.sha256(sample).hexdigest() == document['sha256']
                acquired = any(a.get('url') == url and a.get('sha256') == document['sha256'] for a in retained)
                pdf = sample.startswith(b'%PDF-')
                html = document.get('mediaType') == 'text/html' and b'<' in sample
                record['verified'] = bool((retained_primary or exact_ehbildu or acquired) and (pdf or html) and response.status in [200, 206])
                record['reason'] = 'Retained election-specific publisher provenance and live document signature' if record['verified'] else 'Live content could not be associated with the exact retained 2023 document; official unavailable exception'
        except Exception as error:
            record.update(verified=False, error=type(error).__name__, reason='Official 2023 URL unavailable during bounded check; retained source remains accessible separately')
        return record

    with ThreadPoolExecutor(max_workers=6) as pool:
        records = list(pool.map(probe, official_candidates(bank)))
    return {'schemaVersion': 1, 'recordedAt': recorded, 'documents': records, 'semanticGeneration': False, 'blanketCurrentAvailabilityCertified': False}


def prepare(baseline, link_audit):
    bank = copy.deepcopy(baseline)
    plan = load(ROOT / 'outputs/quiz-2023-second-iteration-plan.json')
    bank['engineVersion'] = 'documented-affinity-v2'
    bank['compilerVersion'] = 'direct-authored-iteration-2-common-v2'
    bank.pop('comparisonPolicy', None)
    common_programmes(bank)
    bank['programmeProfiles'] = profiles(bank)
    bank['starterQuestionIds'] = [q['questionId'] for q in plan['questionnaire']['initialQuestionProposal']]
    for question in bank['questions']:
        if question['id'] in ['ban-food-production-force-feeding', 'child-benefit-from-fifth-pregnancy-month']:
            question['topicId'] = 'rights'
    for topic in bank['topics']:
        if topic['id'] == 'energy': topic['name'] = 'Medio ambiente y energía'
        if topic['id'] == 'rights': topic['name'] = 'Derechos y cuidados'
    bank['ordering'] = {
        'version': 'editorial-2023-iteration-2-v1', 'researchDate': '2026-10-12',
        'questionIds': bank['starterQuestionIds'] + [q['id'] for q in bank['questions'] if q['id'] not in bank['starterQuestionIds']],
        'rationale': 'Vivienda, impuestos, trabajo y sanidad encabezan cada vuelta; dos decisiones distintas por cada tema. Criterio editorial informado por el CIS de septiembre de 2026, revisado el 12 de octubre. Las tendencias ordenan preguntas y no cambian posturas ni pesos de 2023.',
        'migrationGap': 'Este banco no incluye una pregunta específica sobre inmigración. No se ha sustituido por otra decisión ni se han inventado posturas para cubrirla.',
    }
    records = {r['documentId']: r for r in link_audit['documents']}
    bank['sourceLinks'] = {}
    for document in bank['documents']:
        record = records[document['id']]
        bank['sourceLinks'][document['id']] = {
            'officialUrl': record['attemptedOfficialUrl'] if record['verified'] else None,
            'preservedUrl': document['url'], 'status': 'official_verified' if record['verified'] else 'official_unavailable',
            'publisher': next(c['name'] for c in bank['candidacies'] if c['id'] == document['candidacyId']), 'checkedAt': record['checkedAt'],
        }
    bank['limitations'] = ['Edición histórica del Congreso del 23 de julio de 2023.', 'Una entrada por formación; solo el programa electoral común para las generales del 23J. No se incorporan suplementos provinciales, documentos políticos ni planes externos.', 'Las formaciones sin programa común localizado siguen visibles y sin posturas puntuadas.', 'Las posturas ausentes o contradictorias no aportan coincidencia; no significan oposición.', 'La cobertura documentada no mide la confianza ni predice el voto.', bank['ordering']['migrationGap']]
    bank['draft'] = False
    assert bank['candidacies'] == baseline['candidacies'] and bank['election'] == baseline['election']
    assert len(bank['questions']) == 80 and len(bank['topics']) == 10
    assert all(sum(next(q for q in bank['questions'] if q['id'] == id)['topicId'] == topic['id'] for id in bank['starterQuestionIds']) == 2 for topic in bank['topics'])
    return bank


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--baseline', type=Path, default=ROOT / '.tools/authored-local-runtime/resources/evidence' / (BASELINE_HASH + '.json'))
    parser.add_argument('--refresh-links', action='store_true')
    parser.add_argument('--check-sources', action='store_true')
    args = parser.parse_args()
    data = args.baseline.read_bytes()
    assert hashlib.sha256(data).hexdigest() == BASELINE_HASH, 'Historical baseline changed'
    baseline = json.loads(data)
    if args.check_sources:
        from assemble_authored_quiz import assemble
        assembled = assemble(ROOT)
        for key in ['positions', 'constituencyPositions', 'questions', 'documents']:
            assert assembled[key] == baseline[key], 'Retained source preparation changed: ' + key
    audit_path = ROOT / 'outputs/quiz-2023-second-iteration-source-links.json'
    if args.refresh_links:
        audit_path.write_text(json.dumps(audit_links(baseline), ensure_ascii=False, indent=2) + '\n')
    bank = prepare(baseline, load(audit_path))
    data = (json.dumps(bank, ensure_ascii=False, separators=(',', ':')) + '\n').encode()
    assert len(data) <= 5 * 1024 * 1024, 'Public payload budget exceeded'
    (ROOT / 'outputs/quiz-2023-second-iteration-bank.json').write_bytes(data)
    print(json.dumps({'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data), 'profiles': len(bank['programmeProfiles']), 'officialLinks': sum(x['officialUrl'] is not None for x in bank['sourceLinks'].values()), 'publicPointerChanged': False}))


if __name__ == '__main__':
    main()
