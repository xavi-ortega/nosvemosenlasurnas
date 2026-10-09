#!/usr/bin/env python3
"""Install a repository-local hook while preserving existing global security hooks."""
from pathlib import Path
import subprocess


HOOK = """#!/usr/bin/env sh
# nosvemosenlasurnas required CI checks
set -eu
project_root=$(git rev-parse --show-toplevel)
cd "$project_root"
exec python3 scripts/check-staged.py
"""


def install(root):
    configured = subprocess.run(["git", "config", "--get", "core.hooksPath"], cwd=root, text=True, capture_output=True)
    if configured.returncode not in [0, 1]:
        raise RuntimeError("Unable to read the existing Git hook configuration.")
    hooks_path = configured.stdout.strip()
    local_hooks = Path(subprocess.check_output(["git", "rev-parse", "--absolute-git-dir"], cwd=root, text=True).strip()) / "hooks"
    if not local_hooks.is_absolute():
        local_hooks = root / local_hooks
    if hooks_path and Path(hooks_path).resolve() != local_hooks.resolve():
        global_pre_commit = Path(hooks_path) / "pre-commit"
        if not hooks_path.startswith("/usr/local/dd/") or not global_pre_commit.is_file() or "run-local-hooks" not in global_pre_commit.read_text():
            raise RuntimeError("An existing custom hooksPath needs explicit hook chaining; it was preserved.")
    target = local_hooks / "pre-commit"
    if target.exists() and target.read_text() != HOOK:
        raise RuntimeError("An existing local pre-commit hook was preserved; integrate the project check explicitly.")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(HOOK)
    target.chmod(0o755)
    print("Installed " + str(target) + "; existing hooksPath unchanged.")


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    try:
        install(root)
    except RuntimeError as error:
        raise SystemExit(str(error)) from error
