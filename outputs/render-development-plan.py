#!/usr/bin/env python3
"""Render and validate the local development plan. No network access.
English developer artifacts; translated product content remains separate.
Usage: python3 render-development-plan.py [--check] [--canvas PATH] [--next] [--fingerprint]
"""
from pathlib import Path
import argparse
import hashlib
import html
import json
import re
STYLE = '\n:root{color-scheme:light dark;--bg:Canvas;--text:CanvasText;--link:LinkText;--line:color-mix(in srgb,CanvasText 20%,Canvas);--muted:color-mix(in srgb,CanvasText 75%,Canvas)}\n*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.65 system-ui,sans-serif}main{max-width:1050px;padding:32px 24px 64px;margin:auto}h1{font-size:27px;line-height:1.25;margin:0 0 12px}h2{font-size:21px;line-height:1.3;margin:0 0 14px}p{margin:0 0 14px}.sub,.status{color:var(--muted);font-size:14px}.intro{font-size:18px;max-width:860px}a{color:var(--link);text-underline-offset:3px}.baseline{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;margin:24px 0;padding:18px 0;border-block:1px solid var(--line);list-style:none}.baseline li{font-weight:600}nav{display:flex;gap:10px 20px;flex-wrap:wrap;padding:16px 0;margin-bottom:12px;font-size:14px}section{padding:30px 0;border-top:1px solid var(--line)}.lead{font-weight:600;max-width:860px}li{margin-bottom:12px}ul{padding-left:23px}table{width:100%;border-collapse:collapse;font-size:14px}caption{text-align:left;margin-bottom:12px;font-weight:600}th,td{text-align:left;padding:12px 10px;vertical-align:top;border-bottom:1px solid var(--line)}th:first-child,td:first-child{padding-left:0}.table-wrap{overflow-x:auto;margin:20px 0}.sources{padding:24px 0;border-top:1px solid var(--line)}.sources li{margin-bottom:16px}.sources p{font-size:14px;margin:4px 0 0}.status{border-left:3px solid var(--line);padding-left:14px}@media(max-width:650px){main{padding:22px 16px 48px}h1{font-size:24px}.baseline{grid-template-columns:1fr;gap:10px}.baseline li{margin:0}table{min-width:610px}}@media print{body{font-size:10pt;line-height:1.45}main{max-width:none;padding:0}nav{display:none}section{padding:16px 0}li{margin-bottom:7px}h2{break-after:avoid}tr{break-inside:avoid}.table-wrap{overflow:visible}table{min-width:0}a{color:var(--text)}}\n'

def validate(plan):
    section_ids = [s["id"] for s in plan["sections"]]
    if len(section_ids) != len(set(section_ids)):
        raise ValueError("Duplicate section IDs")
    collections = {key: {item["id"]: item for item in plan[key]} for key in ("requirements", "tasks", "risks", "decisions")}
    for key, index in collections.items():
        if len(index) != len(plan[key]):
            raise ValueError("Duplicate IDs in " + key)
    validate_execution(plan)
    covered = set()
    for task in plan["tasks"]:
        for dependency in task["dependsOn"]:
            if dependency not in collections["tasks"]:
                raise ValueError("Unknown task dependency: " + dependency)
        for feature, dependencies in task.get("featureDependencies", {}).items():
            if not dependencies or any(dependency not in collections["tasks"] for dependency in dependencies):
                raise ValueError("Invalid conditional task dependency: " + feature)
        for requirement_id in task["requirementIds"]:
            if requirement_id not in collections["requirements"]:
                raise ValueError("Unknown task requirement: " + requirement_id)
            covered.add(requirement_id)
    if covered != set(collections["requirements"]):
        raise ValueError("Uncovered requirement")
    for risk in plan["risks"]:
        if not risk["requirementIds"] or not set(risk["requirementIds"]).issubset(collections["requirements"]):
            raise ValueError("Invalid risk requirement references")
    for capability, requirement_ids in plan["releaseContract"]["capabilityGates"].items():
        if not requirement_ids or not set(requirement_ids).issubset(collections["requirements"]):
            raise ValueError("Invalid capability acceptance requirements: " + capability)
    visiting, visited = set(), set()
    def visit(task_id):
        if task_id in visiting:
            raise ValueError("Cyclic task dependency")
        if task_id in visited:
            return
        visiting.add(task_id)
        task = collections["tasks"][task_id]
        dependencies = list(task["dependsOn"])
        for conditional in task.get("featureDependencies", {}).values():
            dependencies.extend(conditional)
        for dependency in dependencies:
            visit(dependency)
        visiting.remove(task_id)
        visited.add(task_id)
    for task_id in collections["tasks"]:
        visit(task_id)
    if plan["review"]["launchReady"]:
        raise ValueError("This planning artifact has no completed production launch evidence")
    if plan["releaseContract"]["featureDefaults"]["nonEditorialMetricsEnabled"]:
        raise ValueError("Unverified optional collection must remain disabled")
    adaptive = plan.get("questionnaireDesign")
    if adaptive:
        if adaptive["display"]["certaintyProbabilityEnabled"] or adaptive["validation"]["readyNow"]:
            raise ValueError("Unvalidated adaptive proposal cannot assert confidence probabilities or readiness")
        if adaptive["flow"]["initialPresentedQuestions"] < 1 or adaptive["flow"]["continuationBatchQuestions"] < 1:
            raise ValueError("Invalid progressive question counts")
        for field in ("questionBankVersion", "selectionPolicyVersion", "readinessPolicyVersion", "adaptiveWeightPolicyVersion"):
            if field not in plan["releaseContract"]["manifestFields"]:
                raise ValueError("Adaptive release lacks a pinned policy version: " + field)
        if "REQ-17" not in plan["releaseContract"]["capabilityGates"]["questionnaireAdditional"]:
            raise ValueError("Adaptive acceptance cannot be omitted from questionnaire activation")



def execution_indexes(plan):
    execution = plan["executionPlan"]
    indexes = {}
    for key in ("workItems", "approvalGates"):
        records = execution[key]
        indexes[key] = {record["id"]: record for record in records}
        if len(indexes[key]) != len(records):
            raise ValueError("Duplicate execution record: " + key)
    return indexes["workItems"], indexes["approvalGates"]


def validate_execution(plan):
    items, gates = execution_indexes(plan)
    requirement_ids = {r["id"] for r in plan["requirements"]}
    macro_ids = {t["id"] for t in plan["tasks"]}
    coverage = set()
    edges = {}
    for item_id, item in items.items():
        if item["macroTaskId"] not in macro_ids:
            raise ValueError("Unknown macro task: " + item_id)
        if not item["requirementIds"] or not set(item["requirementIds"]) <= requirement_ids:
            raise ValueError("Invalid work-item requirements: " + item_id)
        coverage.update(item["requirementIds"])
        if item["status"] not in plan["executionPlan"]["policy"]["taskStates"]:
            raise ValueError("Unknown work-item state: " + item_id)
        if not all(item.get(key) for key in ("ownerRole", "capabilities", "locale", "deliverables", "acceptanceCriteria", "verification", "failureBehaviour")):
            raise ValueError("Incomplete work-item acceptance: " + item_id)
        if item["status"] == "completed" and not item["completionEvidence"]:
            raise ValueError("Completed item lacks evidence: " + item_id)
        dependencies = list(item["dependsOn"])
        for values in item.get("conditionalDependencies", {}).values():
            dependencies += values
        if not set(dependencies) <= set(items) or not set(item["requiredGateIds"]) <= set(gates):
            raise ValueError("Unknown execution dependency/gate: " + item_id)
        if item["status"] == "completed":
            if any(items[dep]["status"] != "completed" for dep in item["dependsOn"]):
                raise ValueError("Completed item has incomplete prerequisites: " + item_id)
            bindings = item.get("completionApprovalBindings", [])
            for gate_id in item["requiredGateIds"]:
                bound = [binding for binding in bindings if binding.get("gateId") == gate_id]
                if not any(binding.get("packetHash") and any(
                    record.get("packetHash") == binding["packetHash"] and record.get("authority") == "human_user"
                    for record in gates[gate_id]["approvalRecords"]
                ) for binding in bound):
                    raise ValueError("Completed gated item lacks actual approval binding: " + item_id)
        edges[item_id] = dependencies + item["requiredGateIds"]
    if coverage != requirement_ids:
        raise ValueError("Atomic backlog leaves requirements uncovered")
    for gate_id, gate in gates.items():
        if gate["status"] not in plan["executionPlan"]["policy"]["gateStates"]:
            raise ValueError("Unknown gate state: " + gate_id)
        dependencies = list(gate["prerequisiteWorkItemIds"])
        for values in gate.get("conditionalPrerequisites", {}).values():
            dependencies += values
        gate_dependencies = gate.get("requiredGateIds", [])
        if not set(dependencies) <= set(items) or not set(gate_dependencies) <= set(gates):
            raise ValueError("Unknown gate prerequisite: " + gate_id)
        if gate["status"] == "approved":
            if not gate["approvalRecords"] or not gate["approvedScopes"]:
                raise ValueError("Approved gate lacks human/scope evidence: " + gate_id)
            for record in gate["approvalRecords"]:
                if record.get("authority") != "human_user" or not record.get("message"):
                    raise ValueError("Gate approval is not explicit human authorization")
                if gate_id != "GATE-00" and not all(record.get(key) for key in ("packetHash", "subjectHash", "action", "capability", "locale", "date")):
                    raise ValueError("Approval does not bind a concrete packet/scope: " + gate_id)
        edges[gate_id] = dependencies + gate_dependencies
    visiting, visited = set(), set()
    def visit(node):
        if node in visiting:
            raise ValueError("Cyclic task/gate graph at " + node)
        if node in visited:
            return
        visiting.add(node)
        for dependency in edges[node]:
            visit(dependency)
        visiting.remove(node)
        visited.add(node)
    for node in edges:
        visit(node)


def design_fingerprint(plan):
    """Bind definitions, not progress-only journal/status changes."""
    def definition(record, ignored):
        return {key: value for key, value in record.items() if key not in ignored}
    payload = {
        "planVersion": plan["planVersion"],
        "project": definition(plan["project"], {"domainStatus", "sourcePublication", "projectRegistration"}),
        "baseline": plan["baseline"],
        "requirements": [definition(r, {"status"}) for r in plan["requirements"]],
        "macroTasks": [definition(t, {"status", "ownerAssigned"}) for t in plan["tasks"]],
        "risks": plan["risks"],
        "decisions": [definition(r, {"status"}) for r in plan["decisions"]],
        "releaseContract": plan["releaseContract"],
        "questionnaireDesign": plan.get("questionnaireDesign"),
        "experienceDesign": plan.get("experienceDesign"),
        "policy": plan["executionPlan"]["policy"],
        "workItems": [definition(i, {"status", "completionEvidence", "completionApprovalBindings", "blockedBy"}) for i in plan["executionPlan"]["workItems"]],
        "approvalGates": [definition(g, {"status", "approvalRecords", "approvedScopes"}) for g in plan["executionPlan"]["approvalGates"]],
        "humanInputs": plan["executionPlan"]["humanInputs"],
        "methodologySections": [s for s in plan["sections"] if s["id"] in ("scope", "truth", "corpus", "questions", "matching", "privacy", "metrics", "algorithm-detail", "language-policy", "experience-design")]
    }
    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(encoded).hexdigest()


def print_next(plan, capability, locale):
    """Read-only readiness snapshot; does not grant authority or execute work."""
    items, gates = execution_indexes(plan)
    eligible, blocked = [], []
    for item in items.values():
        if item["status"] not in ("planned", "in_progress", "blocked"):
            continue
        if capability and capability not in item["capabilities"]:
            continue
        if capability and item["locale"] in ("es", "ca", "gl", "eu") and item["locale"] != locale:
            continue
        dependencies = list(item["dependsOn"])
        conditional = item.get("conditionalDependencies", {})
        # No selected capability means conservative readiness over all instances.
        for key, values in conditional.items():
            if not capability or key == capability or key == locale:
                dependencies += values
        blockers = [dep for dep in dependencies if items[dep]["status"] != "completed"]
        for gate_id in item["requiredGateIds"]:
            gate = gates[gate_id]
            if gate["status"] != "approved":
                blockers.append(gate_id)
                continue
            if gate_id == "GATE-00":
                continue
            applicable = [record for record in gate["approvalRecords"] if
                          record.get("packetHash") and record.get("subjectHash") and
                          (gate_id == "GATE-01" or record.get("capability") == capability) and
                          (gate_id == "GATE-01" or record.get("locale") == locale)]
            if gate_id == "GATE-01":
                applicable = [record for record in applicable if record.get("subjectHash") == design_fingerprint(plan)]
            if not applicable:
                blockers.append(gate_id + ":scope_or_subject_requires_review")
            elif gate_id != "GATE-01":
                # Actual release/action fingerprints require a human-reviewed packet:
                # this plan checker has no deployment/processor state to compare.
                blockers.append(gate_id + ":verify_actual_packet_subject_before_execution")
        (blocked if blockers else eligible).append(
            {"id": item["id"], "title": item["title"], "blockedBy": sorted(set(blockers))}
        )
    print(json.dumps({"designFingerprint": design_fingerprint(plan), "eligible": eligible,
                      "blockedCount": len(blocked), "pendingGates": [
                          {"id": g["id"], "title": g["title"], "scope": g["scope"]}
                          for g in gates.values() if g["status"] != "approved"
                      ], "note": "Read-only plan snapshot. Scoped actual-state gates require packet verification; this command never authorizes an external action."},
                     ensure_ascii=False, indent=2))


def materialize(plan):
    """Derive display rows from authoritative records instead of duplicate data."""
    result = json.loads(json.dumps(plan))
    sections = {section["id"]: section for section in result["sections"]}
    def dependencies(task):
        value = ", ".join(task["dependsOn"]) or "Starting task"
        conditional = task.get("featureDependencies", {})
        if conditional:
            value += " · Conditional: " + "; ".join(
                feature + " → " + ", ".join(ids) for feature, ids in conditional.items()
            )
        return value
    sections["delivery-readiness"]["rows"] = [
        [task["id"], task["title"] + " · " + task["ownerRole"],
         dependencies(task), task["exitCriterion"]]
        for task in result["tasks"]
    ]
    sections["acceptance-contract"]["rows"] = [
        [requirement["id"] + " · " + requirement["title"],
         requirement["ownerRole"],
         requirement["criterion"] + " Verification: " + requirement["verification"],
         requirement["failureBehaviour"]]
        for requirement in result["requirements"]
    ]
    sections["risk-decisions"]["rows"] = [
        [risk["id"] + " · " + risk["title"] + " · " + risk["ownerRole"],
         risk["trigger"], risk["mitigation"], risk["fallback"]]
        for risk in result["risks"]
    ]
    if sections["risk-decisions"].get("deriveDecisionItems"):
        sections["risk-decisions"]["items"] = [
            decision["id"] + " · " + decision["topic"] + " · " +
            decision["status"] + " · " + decision["resolution"]
            for decision in result["decisions"]
        ] + sections["risk-decisions"]["items"]
    if "executionPlan" in result:
        sections["atomic-backlog"]["rows"] = [
            [item["id"] + " · " + item["title"] + " · " + item["status"] + " · " + item["ownerRole"] + " · " + ", ".join(item["requirementIds"]),
             (", ".join(item["dependsOn"]) or "Starting item") + " · Gates: " + (", ".join(item["requiredGateIds"]) or "existing local authorization") +
             (" · Conditional: " + json.dumps(item["conditionalDependencies"], ensure_ascii=False) if item.get("conditionalDependencies") else "") +
             " · Scope: " + ", ".join(item["capabilities"]) + "/" + item["locale"],
             " ".join(item["deliverables"]) + " Acceptance: " + " ".join(item["acceptanceCriteria"]),
             " ".join(item["verification"]) + " · " + ("Evidence: " + ", ".join(item["completionEvidence"]) if item["completionEvidence"] else "Not completed.")]
            for item in result["executionPlan"]["workItems"]
        ]
        sections["strict-approval-gates"]["rows"] = [
            [gate["id"] + " · " + gate["title"] + " · " + gate["status"] + " · " + gate["scope"],
             ", ".join(gate["prerequisiteWorkItemIds"]) +
             (" · Conditional: " + json.dumps(gate["conditionalPrerequisites"], ensure_ascii=False) if gate.get("conditionalPrerequisites") else "") +
             (" · Gates: " + ", ".join(gate["requiredGateIds"]) if gate.get("requiredGateIds") else ""),
             gate["actionAuthorized"], gate["requiredEvidence"]]
            for gate in result["executionPlan"]["approvalGates"]
        ]
    return result

def escape(value):
    return html.escape(str(value), quote=True)

def table(section):
    headers = section.get("headers", ["Dates", "Focus", "Owner role", "Exit deliverable"])
    rows = section["rows"]
    if not rows or any(len(row) != len(headers) for row in rows):
        raise ValueError("Missing or inconsistent table rows")
    def cell(value):
        if value.startswith("https://"):
            return '<a href="' + escape(value) + '" rel="noreferrer">Source</a>'
        return escape(value)
    return '<div class="table-wrap"><table><caption>' + escape(section["title"]) + ' · planning assessment, 7 October 2026</caption><thead><tr>' + ''.join('<th>' + escape(v) + '</th>' for v in headers) + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join('<td>' + cell(v) + '</td>' for v in row) + '</tr>' for row in rows) + '</tbody></table></div>'

def render_section(section):
    refs = section.get("references", [])
    return '<section id="' + escape(section["id"]) + '"><h2>' + escape(section["title"]) + '</h2><p class="lead">' + escape(section["lead"]) + '</p>' + (table(section) if section.get("rows") else '') + '<ul>' + ''.join('<li>' + escape(v) + '</li>' for v in section["items"]) + '</ul>' + ('<p>' + ' · '.join('<a href="' + escape(r["url"]) + '" rel="noreferrer">' + escape(r["label"]) + '</a>' for r in refs) + '</p>' if refs else '') + '</section>'

def render(plan):
    header = '<header><h1>' + escape(plan["title"]) + '</h1><p class="sub">' + escape(plan["subtitle"]) + '</p><p class="intro">' + escape(plan["summary"]) + '</p><p class="status">' + escape(plan["status"]) + '</p><ul class="baseline">' + ''.join('<li>' + escape(v) + '</li>' for v in plan["baseline"]) + '</ul><p><a href="matching-algorithm-specification.html">Detailed reference algorithm specification</a> · <a href="adaptive-questionnaire-specification.html">Adaptive questionnaire proposal</a> · <a href="matching-engine.mjs">Reference implementation</a> · <a href="project-language-policy.html">Required project language policy</a> · <a href="electoral-app-development-plan.json">Canonical structured plan and readiness records</a> · <a href="render-development-plan.py">Planning renderer and consistency checks</a> · <a href="approval-gate-01.html">First strict approval packet</a> · <a href="bootstrap-report.html">Local bootstrap verification</a> · <a href="../docs/loop-engineer.md">Loop engineer guide</a></p></header>'
    nav = '<nav aria-label="Plan sections">' + ''.join('<a href="#' + escape(s["id"]) + '">' + escape(s["title"]) + '</a>' for s in plan["sections"]) + '</nav>'
    footer = '<footer class="sources"><h2>Election and legal primary sources</h2><p>Checked on 7 October 2026. Product rules, examples and development milestones are proposals.</p><ul>' + ''.join('<li><a href="' + escape(s["url"]) + '" rel="noreferrer">' + escape(s["label"]) + '</a><p>' + escape(s["note"]) + '</p></li>' for s in plan["sources"]) + '</ul></footer>'
    body = header + nav + ''.join(render_section(s) for s in plan["sections"]) + footer
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;; base-uri &#39;none&#39;; form-action &#39;none&#39;"><title>' + escape(plan["title"]) + '</title><style>' + STYLE + '</style></head><body><main>' + body + '</main></body></html>'

def render_gate_packet(packet):
    details = html.escape(json.dumps(packet, ensure_ascii=False, indent=2))
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Pending feature blueprint approval</title><style>' + STYLE + 'pre{white-space:pre-wrap;overflow-wrap:anywhere}</style></head><body><main><h1>Pending feature blueprint approval</h1><p>The latest direct user instruction already authorizes initial local scaffolding, skills, baseline CI and Markdown/open-source metadata. This pending packet concerns future product features; it does not approve methodology, independent review, external publication or production release.</p><p>Review the exact action, subject fingerprint, packet hash and scoped gates below. No approval has been recorded for GATE-01.</p><pre><code>' + details + '</code></pre></main></body></html>'

def main():
    parser = argparse.ArgumentParser(description="Render and validate the canonical developer plan.")
    parser.add_argument("--next", action="store_true", help="Print eligible work and pending gates; no mutations.")
    parser.add_argument("--fingerprint", action="store_true", help="Print the stable blueprint design fingerprint.")
    parser.add_argument("--capability", choices=["local_bootstrap", "source_explorer", "questionnaire", "anonymous_metrics"])
    parser.add_argument("--locale", choices=["es", "ca", "gl", "eu"], default="es")
    parser.add_argument("--check", action="store_true", help="Check consistency without changing files.")
    parser.add_argument("--canvas", type=Path, help="Existing managed planning view to update/check.")
    args = parser.parse_args()
    directory = Path(__file__).resolve().parent
    plan = json.loads((directory / "electoral-app-development-plan.json").read_text())
    validate(plan)
    packet_path = directory / "approval-gate-01.json"
    if packet_path.exists():
        packet = json.loads(packet_path.read_text())
        if packet["subjectHash"] != design_fingerprint(plan) or packet["planVersion"] != plan["planVersion"]:
            raise ValueError("First approval packet is stale; regenerate before requesting approval")
        packet_definition = {key: value for key, value in packet.items() if key != "packetHash"}
        packet_hash = hashlib.sha256(json.dumps(packet_definition, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
        if packet["packetHash"] != packet_hash:
            raise ValueError("Approval packet hash is inconsistent")
        for name, expected_hash in packet.get("artifactHashes", {}).items():
            artifact_path = directory / name
            if not artifact_path.is_file() or hashlib.sha256(artifact_path.read_bytes()).hexdigest() != expected_hash:
                raise ValueError("Bound approval material changed or is missing: " + name)
    if packet_path.exists() and not args.fingerprint and not args.next:
        packet_view = directory / "approval-gate-01.html"
        expected_packet = render_gate_packet(packet)
        if args.check:
            if packet_view.read_text() != expected_packet:
                raise ValueError("HTML approval packet differs from canonical JSON")
        else:
            packet_view.write_text(expected_packet)
    if args.fingerprint:
        print(design_fingerprint(plan))
        return
    if args.next:
        print_next(plan, args.capability, args.locale)
        return
    plan = materialize(plan)
    expected = render(plan)
    target = directory / "electoral-app-development-plan.html"
    if args.check:
        if target.read_text() != expected:
            raise ValueError("HTML plan differs from the canonical JSON")
    else:
        target.write_text(expected)
    if args.canvas:
        source = args.canvas.read_text()
        prefix, remainder = source.split("const plan = ", 1)
        current, suffix = remainder.split(";\nexport default function ElectoralAppPlan()", 1)
        if args.check:
            if json.loads(current) != plan:
                raise ValueError("Managed planning view differs from canonical JSON")
        else:
            args.canvas.write_text(prefix + "const plan = " + json.dumps(plan, ensure_ascii=False, indent=2) + ";\nexport default function ElectoralAppPlan()" + suffix)
    print("Plan references, requirement coverage, task/gate graphs and generated artifacts are consistent.")
    print("Planning checks do not certify the future application, sources or production launch.")

if __name__ == "__main__":
    main()
