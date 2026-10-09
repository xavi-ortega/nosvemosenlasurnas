#!/usr/bin/env python3
"""Check committed-file boundaries and scaffold metadata without private payloads."""
import json
from pathlib import Path
import re
import subprocess

root = Path(__file__).resolve().parents[1]
tracked = subprocess.check_output(["git", "ls-files", "-z"], cwd=root).decode().split("\0")
for name in filter(None, tracked):
    path = Path(name)
    if name.startswith("storage/framework/extraction-workspaces/"):
        raise SystemExit("Extraction runtime bytes must not be tracked: " + name)
    if name.startswith((".claude/", ".cursor/skills/")) or name in ['CLAUDE.md', 'outputs/creative-domain-name-shortlist.json', 'outputs/domain-name-shortlist.json', 'outputs/electoral-app-naming-explorer.html', 'outputs/electoral-app-naming-explorer.json', 'outputs/electoral-app-naming-explorer.v1.json', 'outputs/electoral-app-naming-explorer.v2.json', 'outputs/electoral-app-naming-explorer.v3.json', 'outputs/render-naming-explorer.py']:
        raise SystemExit("Removed local/editor or obsolete naming artifact must not be tracked: " + name)
    if any(part in {"vendor", "node_modules", ".tools", ".git", "test-results", "playwright-report"} for part in path.parts):
        raise SystemExit("Runtime/test output must not be tracked: " + name)
    if path.name.startswith(".env") and name != ".env.example":
        raise SystemExit("Environment file must not be tracked: " + name)
    if path.suffix in {".sqlite", ".sqlite3", ".log"} or name in {".mcp.json", ".cursor/mcp.json", ".codex/config.toml"}:
        raise SystemExit("Local configuration/data must not be tracked: " + name)
for workflow in (root / ".github/workflows").glob("*.yml"):
    text = workflow.read_text()
    if "pull_request_target" in text:
        raise SystemExit("Elevated contributor workflow requires a separate reviewed design")
    for reference in re.findall(r"uses:\s*(\S+)", text):
        if not reference.startswith("./") and not re.fullmatch(r"[\w./-]+@[0-9a-f]{40}", reference):
            raise SystemExit("Action must have an immutable commit pin: " + reference)
package = json.loads((root / "package.json").read_text())
lock = json.loads((root / "package-lock.json").read_text())
for key in ["name", "version", "license"]:
    if package[key] != lock["packages"][""][key]:
        raise SystemExit("npm lock metadata mismatch: " + key)
composer = json.loads((root / "composer.json").read_text())
metadata = json.loads((root / "project-metadata.json").read_text())
if composer["license"] != package["license"] or composer["license"] != metadata["originalCodeLicense"]:
    raise SystemExit("Original-code licence metadata is inconsistent")
if metadata["launchReady"] or any(metadata["capabilities"].values()):
    raise SystemExit("Scaffold metadata cannot certify unimplemented production capabilities")
print("Tracked-file boundaries, immutable action references and scaffold metadata passed.")
