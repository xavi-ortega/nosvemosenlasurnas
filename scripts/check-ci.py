#!/usr/bin/env python3
"""Run the same required checks in hosted CI and clean local snapshots."""
import argparse
import os
from pathlib import Path
import shutil
import subprocess
import sys


JOBS = {
    "php": [
        ["scripts/composer", "validate", "--strict"],
        ["scripts/composer", "install", "--no-interaction", "--prefer-dist", "--no-progress"],
        ["scripts/composer", "audit"],
        ["scripts/composer", "lint"],
        ["scripts/composer", "analyse"],
        ["scripts/composer", "test"],
    ],
    "frontend": [
        ["scripts/composer", "install", "--no-interaction", "--prefer-dist", "--no-progress"],
        ["npm", "ci", "--ignore-scripts"],
        ["npm", "audit"],
        ["npm", "run", "lint"],
        ["npm", "run", "typecheck"],
        ["npm", "run", "build"],
        ["npm", "run", "check:assets"],
        ["npm", "exec", "--no", "--", "playwright", "install", "chromium"],
        ["npm", "run", "test:browser"],
    ],
    "integrity": [
        ["npm", "ci", "--ignore-scripts"],
        ["npm", "run", "check:plans"],
        ["npm", "run", "check:evidence"],
        ["npm", "run", "test:reference"],
        ["npm", "run", "test:engine"],
        ["npm", "run", "check:skills"],
    ],
    "security": [
        ["python3", "scripts/install-ci-tools.py"],
        [".tools/bin/actionlint"],
        [".tools/bin/gitleaks", "git", "--redact", "--no-banner", "--log-opts=--all"],
        ["python3", "scripts/check-repository.py"],
        ["python3", "-m", "unittest", "discover", "-s", "tests/Tooling", "-p", "test_*.py"],
    ],
}


def run(command, root, environment):
    print("Checking: " + " ".join(command), flush=True)
    subprocess.run(command, cwd=root, env=environment, check=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("job", choices=[*JOBS, "all"], default="all", nargs="?")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    environment = {**os.environ, "CI": "true"}
    jobs = list(JOBS) if args.job == "all" else [args.job]
    if sys.version_info < (3, 12):
        raise SystemExit("Python 3.12 or newer is required.")
    if any(job in jobs for job in ["frontend", "integrity"]):
        node_major = subprocess.check_output(["node", "-p", "process.versions.node.split('.')[0]"], text=True).strip()
        expected_major = (root / ".nvmrc").read_text().strip()
        if node_major != expected_major:
            raise SystemExit("Use the Node major declared in .nvmrc: " + expected_major)
    if any(job in jobs for job in ["php", "frontend"]) and not (root / ".env").exists():
        shutil.copyfile(root / ".env.example", root / ".env")
        run(["scripts/composer", "install", "--no-interaction", "--prefer-dist", "--no-progress"], root, environment)
        run(["scripts/php", "artisan", "key:generate", "--no-interaction"], root, environment)
    for job in jobs:
        for command in JOBS[job]:
            if command == [".tools/bin/actionlint"]:
                workflows = sorted({*root.glob(".github/workflows/*.yml"), *root.glob(".github/workflows/*.yaml")})
                if not workflows:
                    raise SystemExit("Required workflow files are missing; security checks cannot pass.")
                command = [*command, *(str(path.relative_to(root)) for path in workflows)]
            if command[-2:] == ["install", "chromium"] and sys.platform.startswith("linux"):
                command = [*command[:-1], "--with-deps", command[-1]]
            run(command, root, environment)
    print("All selected CI checks passed: " + ", ".join(jobs), flush=True)


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as error:
        raise SystemExit(error.returncode) from error
