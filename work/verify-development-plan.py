"""Validate the active task graph and explicit input/collection boundaries."""
import json
from pathlib import Path
p = json.loads((Path(__file__).resolve().parents[1] / "outputs/electoral-app-development-plan.json").read_text())
tasks = p["executionPlan"]["commitPlan"]["commits"]
assert len(tasks) == 30
seen = set()
for task in tasks:
    assert task["id"] not in seen
    assert set(task["dependsOn"]) <= seen
    assert task["status"] in {"planned", "in_progress", "completed", "blocked"}
    assert all(task[key] for key in ["deliverables", "acceptanceCriteria", "verification"])
    if task["status"] == "completed":
        assert task["completionEvidence"]
    seen.add(task["id"])
assert p["metricsDesign"]["liveCollectionEnabled"] is False
assert p["restart"]["backupVerified"] is True
assert p["restart"]["remoteRewritingAuthorized"] is False
print("Active task graph and authorization boundaries passed.")
