#!/usr/bin/env python3
"""Withdraw or reactivate existing local immutable evidence without deleting history."""
import argparse
from datetime import date
import hashlib
import json
from pathlib import Path
import re


def manage(directory, action, sha, reason):
    if not re.fullmatch(r'[a-f0-9]{64}', sha) or not reason.strip() or len(reason) > 1000:
        raise ValueError('A valid release hash and public correction reason are required')
    pointer = directory / 'current.json'
    state = json.loads(pointer.read_text())
    target = directory / (sha + '.json')
    data = target.read_bytes()
    if hashlib.sha256(data).hexdigest() != sha:
        raise ValueError('Release hash mismatch')
    bank = json.loads(data)
    if bank.get('schemaVersion') != 1 or bank.get('engineVersion') != 'lean-fixed-budgets-v1':
        raise ValueError('Unsupported release contract')
    if action == 'withdraw':
        if sha in state['withdrawn']:
            raise ValueError('Release already withdrawn')
        state['withdrawn'].append(sha)
    elif action == 'activate':
        if sha in state['withdrawn']:
            raise ValueError('Withdrawn releases cannot be reactivated; compile a correction')
        expiry = min([bank['election']['date'], *[d['validUntil'] for d in bank['documents']]])
        if bank['kind'] == 'current' and expiry < date.today().isoformat():
            raise ValueError('Expired current evidence cannot be reactivated')
        state.update(sha256=sha, kind=bank['kind'])
        if bank['kind'] == 'current':
            state['validUntil'] = expiry
        else:
            state.pop('validUntil', None)
    else:
        raise ValueError('Unsupported release action')
    state['history'].append({'action': action, 'sha256': sha, 'previous': json.loads(pointer.read_text())['sha256'], 'reason': reason})
    temporary = directory / 'current.json.tmp'
    temporary.write_text(json.dumps(state, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(pointer)
    return state


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('action', choices=['withdraw', 'activate'])
    parser.add_argument('sha256')
    parser.add_argument('--directory', type=Path, default=Path('resources/evidence'))
    parser.add_argument('--reason', required=True)
    args = parser.parse_args()
    manage(args.directory, args.action, args.sha256, args.reason)
    print('Release pointer updated; immutable banks and correction history preserved')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, KeyError, OSError) as error:
        raise SystemExit('Release update failed: ' + str(error)) from error
