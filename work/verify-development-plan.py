#!/usr/bin/env python3
"""Verify safety properties of the execution-plan checker. Local planning only."""
import contextlib
import copy
import importlib.util
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("plan_renderer", ROOT / "outputs/render-development-plan.py")
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)
plan = json.loads((ROOT / "outputs/electoral-app-development-plan.json").read_text())
renderer.validate(plan)
count = 0

def reject(label, mutate):
    global count
    candidate = copy.deepcopy(plan)
    mutate(candidate)
    try:
        renderer.validate(candidate)
    except ValueError:
        count += 1
        print("PASS " + label)
        return
    raise AssertionError("Unsafe plan was accepted: " + label)

reject("combined work/gate cycle rejected", lambda p: p["executionPlan"]["approvalGates"][1]["prerequisiteWorkItemIds"].append("GOV-01"))
reject("unverified completion rejected", lambda p: p["executionPlan"]["workItems"][7].update(status="completed", completionEvidence=["draft-only"]))
reject("forged machine approval rejected", lambda p: p["executionPlan"]["approvalGates"][0]["approvalRecords"][0].update(authority="agent"))
reject("missing concrete human packet rejected", lambda p: p["executionPlan"]["approvalGates"][1].update(status="approved", approvedScopes=["project"], approvalRecords=[{"authority":"human_user","message":"approve"}]))
reject("unknown conditional dependency rejected", lambda p: p["executionPlan"]["workItems"][30].update(conditionalDependencies={"questionnaire":["unknown-task"]}))
reject("unapproved collection default rejected", lambda p: p["releaseContract"]["featureDefaults"].update(nonEditorialMetricsEnabled=True))
reject("synthetic planning cannot assert launch readiness", lambda p: p["review"].update(launchReady=True))
progress = copy.deepcopy(plan)
progress["executionPlan"]["workItems"][7]["status"] = "in_progress"
progress["decisions"][4]["status"] = "in_progress"
progress["project"]["projectRegistration"] = "association_metadata_updated"
assert renderer.design_fingerprint(progress) == renderer.design_fingerprint(plan)
count += 1
print("PASS progress-only changes preserve blueprint fingerprint")
changed = copy.deepcopy(plan)
changed["executionPlan"]["policy"]["dataRule"] = "Allow private answers to leave the browser"
assert renderer.design_fingerprint(changed) != renderer.design_fingerprint(plan)
count += 1
print("PASS private-input design change invalidates blueprint fingerprint")
buffer = io.StringIO()
with contextlib.redirect_stdout(buffer):
    renderer.print_next(plan, "source_explorer", "es")
snapshot = json.loads(buffer.getvalue())
assert not snapshot["eligible"] and any(g["id"] == "GATE-01" for g in snapshot["pendingGates"])
count += 1
print("PASS pending blueprint authorizes no subsequent implementation")
assert all(not item["dependsOn"] or "QUESTION-02" not in item["dependsOn"] for item in plan["executionPlan"]["workItems"] if item["id"] in ("LANG-05", "LANG-06", "LANG-07"))
count += 1
print("PASS regional explorer preparation does not require questionnaire evidence")
print(str(count) + " planning verification groups passed; no production certification.")
