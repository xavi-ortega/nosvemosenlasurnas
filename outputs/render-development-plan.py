#!/usr/bin/env python3
"""Render current lean guidance and synchronize the existing managed plan view."""
import argparse
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANVAS = Path("/Users/xavi.ortega/.cursor/projects/empty-window/canvases/electoral-app-development-plan.canvas.tsx")

def render():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--canvas", type=Path)
    args = parser.parse_args()
    plan = json.loads((ROOT / "outputs/electoral-app-development-plan.json").read_text())
    sections = {item["id"]: item for item in plan["sections"]}
    tasks = plan["executionPlan"]["commitPlan"]["commits"]
    def section_text(keys):
        return "\n\n".join("## " + sections[key]["title"] + "\n\n" + sections[key]["lead"] + "\n\n" + "\n".join("- " + line for line in sections[key]["items"]) for key in keys)
    development = "# " + plan["title"] + "\n\n" + plan["planVersion"] + "\n\n" + plan["summary"] + "\n\n" + section_text(sections) + "\n\n## Progress\n\n" + "\n".join("- " + task["id"] + " · " + task["subject"] + " · " + task["status"] for task in tasks) + "\n"
    commits = "# Active commit plan\n\n" + "\n\n".join("## " + task["id"] + " " + task["subject"] + "\n\nStatus: " + task["status"] + "\n\nDependencies: " + ", ".join(task["dependsOn"]) + "\n\n" + "\n".join("- " + line for line in task["deliverables"] + task["acceptanceCriteria"] + task["verification"]) for task in tasks) + "\n"
    generated = {
        "docs/plans/development-plan.md": development,
        "docs/plans/commit-by-commit-plan.md": commits,
        "docs/plans/matching-algorithm-specification.md": "# Lean matching specification\n\n" + section_text(["matching", "privacy"]) + "\n",
        "docs/plans/adaptive-questionnaire-specification.md": "# Lean progressive questionnaire\n\n" + section_text(["journeys", "adaptive"]) + "\n",
        "docs/plans/project-language-policy.md": "# Project language policy\n\n" + section_text(["language"]) + "\n",
        "outputs/electoral-app-development-plan.html": '<!doctype html><html lang="en"><meta charset="utf-8"><title>Active development plan</title><style>body{max-width:80ch;margin:3rem auto;padding:1rem;font:16px/1.6 system-ui}pre{white-space:pre-wrap}</style><body><pre>' + html.escape(development) + '</pre></body></html>\n',
    }
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
        canvas.write_text(text[:start] + json.dumps(plan, ensure_ascii=False, indent=2) + text[end:])
    print("Active plan parity passed." if args.check else "Active plans rendered; existing managed view synchronized.")

if __name__ == "__main__":
    render()
