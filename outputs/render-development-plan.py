#!/usr/bin/env python3
"""Render current lean guidance and synchronize the existing managed plan view."""
import argparse
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANVAS = Path("/Users/xavi.ortega/.cursor/projects/empty-window/canvases/electoral-app-development-plan.canvas.tsx")

def render_interactions(design):
    """Render the authored interaction contract; do not synthesize product evidence."""
    blocks = ["## Interaction blueprint\n\n" + design["revision"] + " · " + design["status"] + "\n\n" + design["principle"]]
    blocks.append("### Surface policy\n\n" + "\n".join("- **" + item["title"] + "**: " + item["policy"] for item in design["surfacePolicies"]))
    for flow in design["flows"]:
        lines = ["### " + flow["title"], flow["goal"] + " Entry: " + flow["entryRequirement"]]
        walk = flow["walkthrough"]
        lines.append("Start: " + flow["start"] + ". Primary path: " + " → ".join(walk["actionIds"]) + ". Maximum navigation/disclosure clicks: " + str(walk["maximumClicks"]) + ". " + walk["note"])
        for node in flow["nodes"]:
            lines.append("#### " + node["title"] + " (" + node["id"] + ")")
            lines.append("Wide surface: " + node["desktopSurface"] + ". Narrow surface: " + node["mobileSurface"] + ". Context: " + node["retainedContext"])
            lines.append("Visible content (Spanish UI examples):\n\n" + "\n".join("- " + item for item in node["visible"]))
            lines.append("Actions:\n\n" + "\n".join("- **" + action["label"] + "** (" + action["kind"] + "; " + action.get("target", "external verified source") + "): " + action["effect"] for action in node["actions"]))
        blocks.append("\n\n".join(lines))
    blocks.append("### Return, focus and privacy\n\n" + "\n".join("- " + rule for rule in design["navigationContract"]["rules"]))
    blocks.append("### Responsive layout sketches\n\n" + "\n\n".join("#### " + item["title"] + "\n\n```text\n" + item["layout"] + "\n```\n\n" + item["notes"] for item in design["wireframes"]))
    blocks.append("### Failure and pending states\n\n" + "\n\n".join("- **" + item["id"] + "** (" + item["surface"] + "): Spanish copy: “" + item["copy"] + "” " + item["recovery"] for item in design["states"]))
    blocks.append("### Planned acceptance walkthroughs\n\nThese scenarios require actual application evidence during R005-R008. Planning graph or canvas checks do not complete them.\n\n" + "\n\n".join("- **" + item["id"] + " " + item["title"] + "** (" + item["flowId"] + "). Steps: " + item["steps"] + " Expected: " + item["expected"] for item in design["acceptanceScenarios"]))
    blocks.append("### Primary UX references\n\nThe application choices are this plan's design decisions, informed by the following guidance.\n\n" + "\n".join("- [" + item["title"] + "](" + item["url"] + "): " + item["appliedDecision"] for item in design["references"]))
    return "\n\n".join(blocks)

def render_reference_review(research):
    """Render evidence levels and actionable adaptation decisions from the dated review."""
    sources = research["sources"]
    blocks = ["### Reference evidence and limitations", research["method"]["selection"] + " " + research["method"]["verificationLimits"]]
    for site in research["sites"]:
        lines = ["#### " + site["name"] + " — " + site["edition"]]
        lines.append("Inspected surfaces: " + "; ".join(key + ": " + value for key, value in site["surfaceEvidence"].items()) + ".")
        for observation in site["observations"]:
            citations = ", ".join("[" + sources[source_id]["title"] + "](" + sources[source_id]["url"] + ")" for source_id in observation["sourceIds"])
            lines.append("- **" + observation["level"] + "**: " + observation["claim"] + " " + citations)
        lines.append("Our design assessment: " + site["critique"])
        lines.append("Limits: " + site["limits"])
        blocks.append("\n\n".join(lines))
    blocks.append("### Decisions to implement, adapt or reject")
    for decision in research["decisions"]:
        citations = ", ".join("[" + sources[source_id]["title"] + "](" + sources[source_id]["url"] + ")" for source_id in decision["sourceIds"])
        blocks.append("\n\n".join([
            "#### " + decision["id"] + " " + decision["title"],
            "Decision: " + decision["disposition"] + ". " + decision["change"],
            "Tasks: " + ", ".join(decision["taskIds"]) + ". Flows: " + ", ".join(decision["flowIds"]) + ". Acceptance: " + ", ".join(decision["acceptanceIds"]) + ".",
            "Compatibility boundary: " + decision["constraint"],
            "Reference context: " + citations + ". These are our adaptations, not usability findings from those sites.",
        ]))
    blocks.append("Prototype boundary: " + research["prototypeScope"])
    return "\n\n".join(blocks)


def render():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--canvas", type=Path)
    args = parser.parse_args()
    plan = json.loads((ROOT / "outputs/electoral-app-development-plan.json").read_text())
    sections = {item["id"]: item for item in plan["sections"]}
    tasks = plan["executionPlan"]["commitPlan"]["commits"]
    second = json.loads((ROOT / plan["nextIteration"]["plan"]).read_text()) if "nextIteration" in plan else None
    def section_text(keys):
        return "\n\n".join("## " + sections[key]["title"] + "\n\n" + sections[key]["lead"] + "\n\n" + "\n".join("- " + line for line in sections[key]["items"]) for key in keys)
    development = "# " + plan["title"] + "\n\n" + plan["planVersion"] + "\n\n" + plan["summary"] + "\n\n" + section_text(sections) + "\n\n## Progress\n\n" + "\n".join("- " + task["id"] + " · " + task["subject"] + " · " + task["status"] for task in tasks) + "\n"
    commits = "# Active commit plan\n\n" + "\n\n".join("## " + task["id"] + " " + task["subject"] + "\n\nStatus: " + task["status"] + "\n\nDependencies: " + ", ".join(task["dependsOn"]) + "\n\n" + "\n".join("- " + line for line in task["deliverables"] + task["acceptanceCriteria"] + task["verification"]) for task in tasks) + "\n"
    generated = {
        "docs/plans/development-plan.md": development,
        "docs/plans/commit-by-commit-plan.md": commits,
        "docs/plans/matching-algorithm-specification.md": "# 2023 quiz matching specification\n\n" + section_text(["matching", "privacy"]) + "\n",
        "docs/plans/adaptive-questionnaire-specification.md": "# Directly authored progressive questionnaire\n\n" + section_text(["journeys", "adaptive"]) + "\n",
        "docs/plans/project-language-policy.md": "# Project language policy\n\n" + section_text(["language"]) + "\n",
        "outputs/electoral-app-development-plan.html": '<!doctype html><html lang="en"><meta charset="utf-8"><title>Active development plan</title><style>body{max-width:80ch;margin:3rem auto;padding:1rem;font:16px/1.6 system-ui}pre{white-space:pre-wrap}</style><body><pre>' + html.escape(development) + '</pre></body></html>\n',
    }
    if second:
        second_sections = "\n\n".join("## " + item["title"] + "\n\n" + item["lead"] + "\n\n" + "\n".join("- " + line for line in item["items"]) for item in second["sections"])
        starters = "\n".join(str(item["order"]) + ". " + item["text"] + " (" + item["topicId"] + "; " + item["questionId"] + "). " + item["rationale"] for item in second["questionnaire"]["initialQuestionProposal"])
        second_tasks = "\n\n".join("### " + item["id"] + " " + item["subject"] + "\n\nStatus: " + item["status"] + ". Depends on: " + (", ".join(item["dependsOn"]) or "none") + ". Estimated share of implementation effort: " + str(item["estimatedEffortWeight"]) + "%.\n\n" + "\n".join("- " + line for line in item["deliverables"]) + "\n\nAcceptance:\n\n" + "\n".join("- " + line for line in item["acceptanceCriteria"]) + "\n\nVerification:\n\n" + "\n".join("- " + line for line in item["verification"]) for item in second["tasks"])
        research = json.loads((ROOT / second["research"]).read_text())
        citations = "[Official September 2026 CIS catalogue](" + research["source"]["catalogueUrl"] + "), [results PDF](" + research["source"]["resultUrl"] + ") (questions 18R/19R, PDF pages 11/12, printed pages 7/8), [technical sheet](" + research["source"]["methodUrl"] + ") (fieldwork 1-4 September 2026, 4,042 interviews)."
        implementation = "Application status: " + second["status"] + ". Implementation complete: " + str(second["progress"]["implementationComplete"]).lower() + "."
        ordering = "Versioned editorial order accepted for the local bank; see the recorded content decisions." if second["questionnaire"]["starterProposalStatus"] == "accepted_local_order" else "Pending evidence, migration-gap and taxonomy review; these are existing authored questions, not a newly released order."
        decisions = "\n".join("- " + item for item in second["planningDecisionsStillToResolve"]) or "All implementation decisions are recorded in the local review packet; unavailable official sources remain explicit exceptions."
        generated[second["humanPlan"]] = "# " + second["title"] + "\n\n" + second["planVersion"] + " · " + implementation + "\n\n" + second["summary"] + "\n\n" + second_sections + "\n\n" + render_interactions(second["interactionDesign"]) + "\n\n## Concrete first-20 editorial order\n\n" + ordering + "\n\n" + starters + "\n\n## Implementation sequence\n\n" + second_tasks + "\n\n## Implementation decisions\n\n" + decisions + "\n\n## Verified research sources\n\n" + citations + "\n\nSee " + second["research"] + " for hashes, exact measures, visual verification and limitations. Survey salience orders historical questions; it does not update 2023 party positions.\n"
    refinement = json.loads((ROOT / plan["nextIteration"]["activeRefinement"]["plan"]).read_text()) if plan.get("nextIteration", {}).get("activeRefinement") else None
    if refinement:
        active_note = "\n## Active next-stage refinement\n\n" + refinement["title"] + ". Status: " + refinement["status"] + ". " + refinement["summary"] + "\n\nRead " + refinement["humanPlan"] + " and " + plan["nextIteration"]["activeRefinement"]["plan"] + ". Completed Q/R evidence is preserved; U tasks have separate acceptance.\n"
        generated["docs/plans/development-plan.md"] += active_note
        generated["docs/plans/commit-by-commit-plan.md"] += active_note
        generated["outputs/electoral-app-development-plan.html"] = '<!doctype html><html lang="en"><meta charset="utf-8"><title>Active development plan</title><style>body{max-width:80ch;margin:3rem auto;padding:1rem;font:16px/1.6 system-ui}pre{white-space:pre-wrap}</style><body><pre>' + html.escape(generated["docs/plans/development-plan.md"]) + '</pre></body></html>\n'
    if refinement:
        blocks = ["# " + refinement["title"], refinement["planVersion"] + " · " + refinement["status"], refinement["summary"], "Application implementation started: " + str(refinement["applicationImplementationStarted"]).lower() + ". Complete: " + str(refinement["applicationImplementationComplete"]).lower() + ". Public launch and collection remain unapproved/disabled.", "Baseline: " + refinement["baseline"] + ". Prototype: " + refinement["prototype"] + ". Source bank SHA-256: " + refinement["sourceBankSha256"] + "."]
        for item in refinement["sections"]:
            blocks.append("## " + item["title"] + "\n\n" + item["content"])
            if item["id"] == "reference-review":
                research = json.loads((ROOT / refinement["referenceResearch"]).read_text())
                blocks.append(render_reference_review(research))
        blocks.append("## Connected navigation and return graphs")
        for flow in refinement["flows"]:
            lines = ["### " + flow["id"] + " " + flow["title"], "Start: " + flow["start"] + ". Walkthrough: " + " → ".join(flow["walkthrough"]) + "."]
            for node in flow["nodes"]:
                lines.append("- **" + node["id"] + "**: " + node["goal"] + ". " + "; ".join("“" + action["label"] + "” → " + action["target"] + " (retain " + action["retains"] + ")" + ("; available when " + action["when"] if action.get("when") else "") for action in node["actions"]))
            blocks.append("\n\n".join(lines))
        blocks.append("## Bounded implementation tasks")
        for task in refinement["tasks"]:
            lines = ["### " + task["id"] + " " + task["subject"], "Status: " + task["status"] + ". Size: " + task["size"] + ". Dependencies: " + (", ".join(task["dependsOn"]) or "none") + "."]
            for label, key in [("Deliverables", "deliverables"), ("Accept when", "acceptanceCriteria"), ("Verify", "verification")]:
                lines.append(label + ":\n\n" + "\n".join("- " + value for value in task[key]))
            if task.get("completionEvidence"):
                lines.append("Actual evidence: " + ", ".join(task["completionEvidence"]) + ".")
            blocks.append("\n\n".join(lines))
        blocks.append("## Primary design references\n\nThese inform the design constraints, not a claim of proven usability.\n\n" + "\n".join("- [" + item["title"] + "](" + item["url"] + "): " + item["decision"] for item in refinement["references"]))
        generated[refinement["humanPlan"]] = "\n\n".join(blocks) + "\n"
    for name, content in generated.items():
        path = ROOT / name
        if args.check:
            if not path.exists() or path.read_text() != content:
                raise SystemExit("Generated plan differs: " + name)
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
    canvas = args.canvas or (CANVAS if not args.check else None)
    if canvas and canvas.is_file():
        text = canvas.read_text()
        start = text.index("const plan = ") + len("const plan = ")
        end = text.index("\n};", start) + 2
        text = text[:start] + json.dumps(plan, ensure_ascii=False, indent=2) + text[end:]
        if second and "const iteration = " in text:
            start = text.index("const iteration = ") + len("const iteration = ")
            end = text.index("\n};", start) + 2
            view = {**second, "trend": json.loads((ROOT / second["research"]).read_text())["personalConcerns"]}
            text = text[:start] + json.dumps(view, ensure_ascii=False, indent=2) + text[end:]
        if refinement and "const cleanup = " in text:
            start = text.index("const cleanup = ") + len("const cleanup = ")
            end = text.index("\n};", start) + 2
            view = {**refinement}
            if refinement.get("referenceResearch"):
                view["referenceResearchData"] = json.loads((ROOT / refinement["referenceResearch"]).read_text())
            text = text[:start] + json.dumps(view, ensure_ascii=False, indent=2) + text[end:]
        canvas.write_text(text)
    print("Active plan parity passed." if args.check else "Active plans rendered; existing managed view synchronized.")

if __name__ == "__main__":
    render()
