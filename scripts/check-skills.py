#!/usr/bin/env python3
"""Verify the deliberately reviewed project skill inventory, without network access."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
lock = json.loads((root / "skills-lock.json").read_text())
actual = set()
for client in [".agents"]:
    for skill in (root / client / "skills").iterdir():
        if skill.is_symlink():
            expected = lock["aliases"].get(str(skill.relative_to(root)))
            if expected is None or skill.resolve() != (root / expected).resolve():
                raise SystemExit("Unreviewed skill alias: " + str(skill))
            continue
        for file in skill.rglob("*"):
            if file.is_file():
                actual.add(str(file.relative_to(root)))
expected = set(lock["files"])
if actual != expected:
    raise SystemExit("Skill inventory mismatch: " + str(sorted(actual ^ expected)))
for name, digest in lock["files"].items():
    if hashlib.sha256((root / name).read_bytes()).hexdigest() != digest:
        raise SystemExit("Reviewed skill changed: " + name)
print("Verified " + str(len(lock["skills"])) + " canonical skills and " + str(len(actual)) + " pinned files. Integrity is not human editorial approval.")
