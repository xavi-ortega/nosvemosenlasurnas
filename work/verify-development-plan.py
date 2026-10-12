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

if "nextIteration" in p:
    root = Path(__file__).resolve().parents[1]
    second = json.loads((root / p["nextIteration"]["plan"]).read_text())
    assert second["planVersion"] == p["nextIteration"]["planVersion"]
    if second["status"] == "planned":
        assert second["applicationImplementationStarted"] is False
    assert second["liveCollectionEnabled"] is False
    assert second["publicLaunchApproved"] is False
    assert second["scoreContract"]["allCandidaciesIncluded"] is True
    assert second["scoreContract"]["candidateSelectionAllowed"] is False
    assert second["scoreContract"]["missingPositionContribution"] == 0
    assert second["scoreContract"]["missingPositionRetainedInDenominator"] is True
    assert second["questionnaire"]["initialCount"] == 20
    assert second["questionnaire"]["extensionCount"] == 10
    starters = second["questionnaire"]["initialQuestionProposal"]
    bank = json.loads((root / "outputs/2023-authored-question-bank.json").read_text())
    questions = {item["id"]: item for item in bank["questions"]}
    assert len(starters) == 20
    assert len({item["questionId"] for item in starters}) == 20
    assert len({item["familyId"] for item in starters}) == 20
    for item in starters:
        original = questions[item["questionId"]]
        assert item["topicId"] == original["topicId"] and item["text"] == original["text"]
    topics = {item["topicId"] for item in bank["questions"]}
    assert len(topics) == 10
    assert all(sum(item["topicId"] == topic for item in starters) == 2 for topic in topics)
    seen = set()
    for task in second["tasks"]:
        assert task["id"] not in seen and set(task["dependsOn"]) <= seen
        assert all(task[key] for key in ["deliverables", "acceptanceCriteria", "verification"])
        assert task["status"] in {"planned", "in_progress", "completed", "blocked"}
        if task["status"] == "completed":
            assert task["completionEvidence"]
        seen.add(task["id"])
    assert sum(task["estimatedEffortWeight"] for task in second["tasks"]) == 100
    research = json.loads((root / second["research"]).read_text())
    assert research["source"]["studyId"] == "3577"
    assert research["source"]["interviews"] == 4042
    assert all(0 <= item["percent"] <= 100 for group in ["nationalConcerns", "personalConcerns"] for item in research[group]["items"])
    print("Second-iteration plan, authored starters and owner-revised scoring/inclusion boundaries passed.")
