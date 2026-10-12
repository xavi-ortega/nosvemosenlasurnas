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

    design = second["interactionDesign"]
    surfaces = {item["id"] for item in design["surfacePolicies"]}
    assert len(surfaces) == len(design["surfacePolicies"])
    assert design["readerContract"]["maximumConcurrentReaders"] == 1
    assert design["readerContract"]["modal"] is False
    assert design["readerContract"]["backgroundRemainsOperable"] is True
    navigation = design["navigationContract"]
    assert navigation["privateStateLocation"] == "memory_only"
    assert navigation["personalizedDataInUrlAllowed"] is False
    assert navigation["personalizedDataInHistoryStateAllowed"] is False
    assert navigation["refreshRestoresPrivateState"] is False
    flow_ids = {flow["id"] for flow in design["flows"]}
    assert len(flow_ids) == len(design["flows"])
    for flow in design["flows"]:
        nodes = {node["id"]: node for node in flow["nodes"]}
        assert len(nodes) == len(flow["nodes"])
        assert flow["start"] in nodes
        action_ids = set()
        for node in nodes.values():
            assert node["desktopSurface"] in surfaces and node["mobileSurface"] in surfaces
            assert node["visible"] and node["retainedContext"] and node["actions"]
            assert node["desktopSurface"] != "dialog" and node["mobileSurface"] != "dialog"
            if node["desktopSurface"] == "nonmodal-reader":
                assert node["mobileSurface"] == "full-view"
            for action in node["actions"]:
                assert action["id"] not in action_ids
                action_ids.add(action["id"])
                assert action["label"] and action["effect"]
                assert action["kind"] in {"navigate", "return", "disclose", "external", "finish", "extend"}
                if action["kind"] == "external":
                    assert "target" not in action
                else:
                    assert action["target"] in nodes
        def reachable(start):
            visited, pending = set(), [start]
            while pending:
                current = pending.pop()
                if current in visited:
                    continue
                visited.add(current)
                pending.extend(action["target"] for action in nodes[current]["actions"] if "target" in action)
            return visited
        assert reachable(flow["start"]) == set(nodes), "Unreachable flow screen: " + flow["id"]
        assert all(flow["start"] in reachable(node_id) for node_id in nodes), "Missing return path: " + flow["id"]
        current = flow["start"]
        walk = flow["walkthrough"]
        for action_id in walk["actionIds"]:
            matches = [action for action in nodes[current]["actions"] if action["id"] == action_id]
            assert len(matches) == 1 and "target" in matches[0], "Disconnected click walkthrough: " + flow["id"]
            current = matches[0]["target"]
        assert current == walk["destination"]
        assert len(walk["actionIds"]) <= walk["maximumClicks"]
    scenarios = design["acceptanceScenarios"]
    assert len({item["id"] for item in scenarios}) == len(scenarios)
    assert all(item["flowId"] in flow_ids and item["steps"] and item["expected"] for item in scenarios)
    states = design["states"]
    assert len({item["id"] for item in states}) == len(states)
    assert all(item["surface"] in surfaces and item["copy"] and item["recovery"] for item in states)
    assert all(item["url"].startswith("https://") for item in design["references"])
    print("Interaction graph reachability, connected walkthroughs, return paths and local-navigation boundaries passed.")
