#!/usr/bin/env python3
"""Inspect eligible lean tasks without creating approval machinery."""
import json
from pathlib import Path
import subprocess
import sys
root = Path(__file__).resolve().parents[1]
if len(sys.argv) > 1 and sys.argv[1] == "check":
    subprocess.run([sys.executable, "work/verify-development-plan.py"], cwd=root, check=True)
else:
    tasks = json.loads((root / "outputs/electoral-app-development-plan.json").read_text())["executionPlan"]["commitPlan"]["commits"]
    complete = {t["id"] for t in tasks if t["status"] == "completed"}
    print(json.dumps([t for t in tasks if t["status"] != "completed" and set(t["dependsOn"]) <= complete], indent=2))
