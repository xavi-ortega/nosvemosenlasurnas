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

# Keep the next-stage plan honest and its prototype politically lossless.
if p.get("nextIteration", {}).get("activeRefinement"):
    import hashlib
    import re
    root = Path(__file__).resolve().parents[1]
    reference = p["nextIteration"]["activeRefinement"]
    cleanup = json.loads((root / reference["plan"]).read_text())
    assert cleanup["planVersion"] == reference["planVersion"]
    assert cleanup["preservesCompletedIterations"] is True
    assert cleanup["publicLaunchApproved"] is False and cleanup["liveCollectionEnabled"] is False
    if cleanup["status"] == "planned_application_stage":
        assert cleanup["applicationImplementationStarted"] is False
        assert cleanup["applicationImplementationComplete"] is False
    bank_bytes = (root / cleanup["sourceBank"]).read_bytes()
    bank_hash = hashlib.sha256(bank_bytes).hexdigest()
    assert cleanup["sourceBankSha256"] == bank_hash
    bank = json.loads(bank_bytes)
    seen = set()
    for task in cleanup["tasks"]:
        assert task["id"] not in seen and set(task["dependsOn"]) <= seen
        assert task["status"] in {"planned", "in_progress", "completed", "blocked"}
        assert all(task[key] for key in ["deliverables", "acceptanceCriteria", "verification"])
        if task["status"] == "completed":
            assert task["completionEvidence"]
            assert all((root / path).exists() for path in task["completionEvidence"] if not path.startswith(".tools/"))
        seen.add(task["id"])
    if cleanup.get("activeTaskIds"):
        active_ids = cleanup["activeTaskIds"]
        assert len(active_ids) == len(set(active_ids))
        assert set(active_ids) <= seen
        active_tasks = [task for task in cleanup["tasks"] if task["id"] in active_ids]
        assert all(task["phase"] == "active_v2" for task in active_tasks)
        assert cleanup["acceptanceRevision"] == cleanup["planVersion"]
        if cleanup.get("planningOnly"):
            assert cleanup["applicationImplementationStarted"] is False
            assert cleanup["applicationImplementationComplete"] is False
            assert cleanup["localAcceptanceComplete"] is False
            assert cleanup["acceptanceStatus"] == "pending_application_implementation"
            assert all(task["status"] == "planned" for task in active_tasks)
        assert cleanup["historicalImplementation"]["ownerAcceptanceConfirmed"] is False
        baseline = json.loads((root / cleanup["baseline"]).read_text())
        assert baseline["sourceBankSha256"] == bank_hash
        assert baseline["kind"] == "planning_reproduction_not_redesign_acceptance"
        for capture in baseline["screenshots"]:
            assert hashlib.sha256((root / capture["path"]).read_bytes()).hexdigest() == capture["sha256"]
        print("Active revision boundaries and baseline capture hashes passed.")
    assert len({item["id"] for item in cleanup["sections"]}) == len(cleanup["sections"])
    flow_ids = set()
    for flow in cleanup["flows"]:
        assert flow["id"] not in flow_ids
        flow_ids.add(flow["id"])
        nodes = {item["id"]: item for item in flow["nodes"]}
        assert len(nodes) == len(flow["nodes"]) and flow["start"] in nodes
        for node in nodes.values():
            assert node["goal"] and node["actions"]
            assert all(action["target"] in nodes and action["label"] and action["retains"] for action in node["actions"])
        def cleanup_reachable(start):
            visited, pending = set(), [start]
            while pending:
                current = pending.pop()
                if current in visited:
                    continue
                visited.add(current)
                pending.extend(action["target"] for action in nodes[current]["actions"])
            return visited
        assert cleanup_reachable(flow["start"]) == set(nodes)
        assert all(flow["start"] in cleanup_reachable(node_id) for node_id in nodes)
        walk = flow["walkthrough"]
        assert walk[0] == flow["start"]
        assert all(any(action["target"] == destination for action in nodes[origin]["actions"]) for origin, destination in zip(walk, walk[1:]))
    if cleanup.get("referenceResearch"):
        from urllib.parse import urlparse
        research_path = root / cleanup["referenceResearch"]
        research_bytes = research_path.read_bytes()
        research = json.loads(research_bytes)
        assert cleanup["referenceResearchSha256"] == hashlib.sha256(research_bytes).hexdigest()
        assert reference["referenceResearch"] == cleanup["referenceResearch"]
        assert research["sourceRole"] == "ux_references_only_not_electoral_evidence"
        assert research["sourceBankSha256"] == bank_hash
        assert research["status"] == "completed_bounded_reference_review"
        assert research["applicationImplementationStarted"] is False
        assert research["publicLaunchApproved"] is False and research["liveCollectionEnabled"] is False
        sources = research["sources"]
        assert sources and all(urlparse(source["url"]).scheme == "https" and urlparse(source["url"]).netloc for source in sources.values())
        assert all(source["title"] for source in sources.values())
        decision_ids = {item["id"] for item in research["decisions"]}
        assert len(decision_ids) == len(research["decisions"])
        assert set(cleanup["referenceDecisionIds"]) == decision_ids
        acceptance_section = next(item for item in cleanup["sections"] if item["id"] == "acceptance")
        acceptance_ids = set(re.findall(r"\| (A\d{2}) \|", acceptance_section["content"]))
        assert acceptance_ids == {f"A{number:02d}" for number in range(1, 39)}
        for decision in research["decisions"]:
            assert decision["change"] and decision["constraint"] and decision["disposition"]
            assert decision["sourceIds"] and set(decision["sourceIds"]) <= set(sources)
            assert decision["taskIds"] and set(decision["taskIds"]) <= seen
            assert decision["flowIds"] and set(decision["flowIds"]) <= flow_ids
            assert decision["acceptanceIds"] and set(decision["acceptanceIds"]) <= acceptance_ids
        evidence_levels = set(research["method"]["evidenceLevels"])
        surface_levels = {"browser_observed", "browser_observed_partial", "official_documentation_only", "not_inspected", "not_applicable", "not_reached", "blocked", "control_observed_content_not_reached", "markup_behind_consent"}
        assert len({site["id"] for site in research["sites"]}) == len(research["sites"])
        for site in research["sites"]:
            assert site["name"] and site["edition"] and site["critique"] and site["limits"]
            assert site["sourceIds"] and set(site["sourceIds"]) <= set(sources)
            assert set(site["decisionIds"]) <= decision_ids
            assert set(site["surfaceEvidence"].values()) <= surface_levels
            assert site["observations"]
            for observation in site["observations"]:
                assert observation["claim"] and observation["level"] in evidence_levels
                assert observation["sourceIds"] and set(observation["sourceIds"]) <= set(site["sourceIds"])
        assert research["prototypeScope"]
        print("Reference research hashes, evidence levels and task/flow/acceptance links passed.")
    prototype_path = root / cleanup["prototype"]
    prototype = prototype_path.read_text()
    match = re.search(r'<script id="programme-data" type="application/json">(.*?)</script>', prototype, re.S)
    assert match, "Prototype must embed its complete fixed public data"
    data = json.loads(match.group(1))
    assert data["sourceBankSha256"] == bank_hash
    for key in ["topics", "questions", "candidacies", "documents", "sourceLinks"]:
        assert data[key] == bank[key], "Prototype altered bank field: " + key
    restored = {party: {question: {**cell, "citations": [data["citations"][index] for index in cell["citations"]]} for question, cell in questions.items()} for party, questions in data["positions"].items()}
    assert restored == bank["positions"], "Prototype political positions/citations must remain exact"
    verification = json.loads((root / cleanup["verification"]).read_text())
    assert verification["status"] == "passed_local_prototype_checks"
    assert verification["applicationAcceptanceComplete"] is False
    assert verification["prototypeSha256"] == hashlib.sha256(prototype_path.read_bytes()).hexdigest()
    assert verification["sourceBankSha256"] == bank_hash
    assert not verification["browserErrors"] and not verification["externalAutomaticRequests"]
    assert all(not item["horizontalOverflow"] and item["axeViolations"] == 0 for item in verification["observations"])
    print("Whole-site cleanup graph, task boundaries, exact programme/citation parity and prototype evidence passed.")
