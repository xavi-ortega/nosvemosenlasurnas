"""Validate local build-time interpretations against retained source bytes and context."""
import json
from pathlib import Path


def attach(bank, manifest, root, digest, require):
    preparation = manifest.get('preparation')
    if preparation is None:
        return bank
    require(set(preparation) == {'schemaVersion', 'toolVersion', 'promptVersion', 'file', 'sha256'} and preparation['schemaVersion'] == 1, 'Invalid preparation contract')
    require(all(isinstance(preparation[k], str) and 0 < len(preparation[k]) <= 200 for k in ['toolVersion', 'promptVersion']), 'Missing preparation versions')
    path = (root / preparation['file']).resolve()
    require(path.is_relative_to(root.resolve()), 'Prepared positions escape source directory')
    data = path.read_bytes()
    require(len(data) <= 5 * 1024 * 1024 and digest(data) == preparation['sha256'], 'Prepared position hash/size mismatch')
    prepared = json.loads(data)
    require(set(prepared) == {'schemaVersion', 'electionId', 'sourceHashes', 'positions'} and prepared['schemaVersion'] == 1 and prepared['electionId'] == bank['election']['id'], 'Prepared election/version mismatch')
    documents = {d['id']: d for d in bank['documents']}
    require(prepared['sourceHashes'] == {d['id']: d['sha256'] for d in bank['documents']}, 'Prepared source hashes mismatch')
    require(isinstance(prepared['positions'], list) and len(prepared['positions']) <= 100000, 'Prepared position limit exceeded')
    pairs = set()
    for mapping in prepared['positions']:
        require(set(mapping) == {'candidacyId', 'questionId', 'status', 'value', 'rationale', 'citations'}, 'Unknown prepared fields')
        candidate = mapping['candidacyId']
        question = mapping['questionId']
        require(candidate in bank['positions'] and question in bank['positions'][candidate], 'Prepared candidacy/question mismatch')
        require((candidate, question) not in pairs, 'Duplicate prepared interpretation')
        pairs.add((candidate, question))
        status = mapping['status']
        require(status in {'derived', 'unknown', 'ambiguous', 'unsupported', 'conflicting'}, 'Invalid interpretation status')
        require(isinstance(mapping['rationale'], str) and 0 < len(mapping['rationale']) <= 2000, 'A bounded public rationale is required')
        value = mapping['value']
        require((type(value) is int and -2 <= value <= 2) if status == 'derived' else value is None, 'Unsupported numeric interpretation')
        citations = mapping['citations']
        require(isinstance(citations, list) and 0 < len(citations) <= 20, 'Contextual source citations are required')
        checked = []
        for citation in citations:
            require(set(citation) == {'documentId', 'start', 'end', 'contextStart', 'contextEnd'}, 'Prepared citations use original ranges only')
            document = documents.get(citation['documentId'])
            require(document and document['candidacyId'] == candidate and document['electionId'] == prepared['electionId'], 'Prepared citation applicability mismatch')
            text = document['text']
            start, end = citation['start'], citation['end']
            low, high = citation['contextStart'], citation['contextEnd']
            require(all(type(i) is int for i in [start, end, low, high]) and 0 <= low <= start < end <= high <= len(text), 'Invalid original text ranges')
            require(high - low <= 20000 and text[start:end].strip(), 'Empty or oversized citation context')
            before = text[:low].rstrip(' \t')
            after = text[high:].lstrip(' \t')
            require((low == 0 or before.endswith('\n\n') or before.endswith('\f')) and (high == len(text) or after.startswith('\n\n') or after.startswith('\f')), 'Prepared context must retain the complete original paragraph/page boundary')
            checked.append({'documentId': document['id'], 'start': start, 'end': end, 'quote': text[start:end], 'context': text[low:high], 'locator': {'page': text[:start].count('\f') + 1, 'line': text[:start].count('\n') + 1}})
        target = bank['positions'][candidate][question]
        if status == 'conflicting' or target['status'] == 'conflicting' or (status == 'derived' and target['value'] is not None and target['value'] != value):
            target.update(status='conflicting', value=None)
        elif status != 'derived':
            target.update(status='unknown', value=None)
        else:
            target.update(status='derived', value=value)
        target['citations'].extend(checked)
        target['rationale'] = mapping['rationale']
    bank['compilerVersion'] = 'grounded-position-input-v1'
    bank['preparation'] = {k: preparation[k] for k in ['toolVersion', 'promptVersion', 'sha256']}
    bank['interpretation'] = 'derived_build_time_interpretation'
    bank['limitations'] = ['Build-time interpretations are derived, not source-authored numeric positions. Exact contextual citations do not certify semantic correctness.', 'Unknown, ambiguous, unsupported and conflicting prepared positions remain unscored.']
    return bank
