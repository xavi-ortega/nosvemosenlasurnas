#!/usr/bin/env python3
"""Check a clean staged-tree snapshot without changing the user's index or files."""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile


def git(root, *arguments, environment=None):
    return subprocess.check_output(["git", *arguments], cwd=root, env=environment, text=True).strip()


def index_tree(root):
    index = Path(git(root, "rev-parse", "--path-format=absolute", "--git-path", "index"))
    temporary_root = root / ".tools" / "pre-commit"
    temporary_root.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="index-", dir=temporary_root) as directory:
        copied_index = Path(directory) / "index"
        if index.exists():
            shutil.copyfile(index, copied_index)
        return git(root, "write-tree", environment={**os.environ, "GIT_INDEX_FILE": str(copied_index)})


def verify_staged(root, checker=None):
    original_environment = dict(os.environ)
    tree = index_tree(root)
    git_directory = git(root, "rev-parse", "--absolute-git-dir")
    temporary_root = root / ".tools" / "pre-commit"
    temporary_root.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="snapshot-", dir=temporary_root) as directory:
        snapshot = Path(directory)
        tools = snapshot / ".tools"
        tools.mkdir(exist_ok=True)
        (tools / "tmp").mkdir()
        source_binaries = root / ".tools" / "bin"
        if source_binaries.exists():
            (tools / "bin").mkdir()
            for name in ["php", "composer", "php.ini", "cacert.pem"]:
                binary = source_binaries / name
                if binary.is_file():
                    (tools / "bin" / binary.name).symlink_to(binary.resolve())
        environment = {
            **original_environment,
            "GIT_DIR": git_directory,
            "GIT_WORK_TREE": str(snapshot),
            "GIT_INDEX_FILE": str(tools / "index"),
            "TMPDIR": str(tools / "tmp"),
            "COMPOSER_CACHE_DIR": str(root / ".tools" / "cache" / "composer"),
            "npm_config_cache": str(root / ".tools" / "cache" / "npm"),
            "CI": "true",
        }
        git(snapshot, "read-tree", tree, environment=environment)
        subprocess.run(
            ["git", "checkout-index", "--all", "--prefix=" + str(snapshot) + "/"],
            cwd=snapshot, env=environment, check=True,
        )
        print("Verifying staged tree " + tree + " in a clean snapshot.", flush=True)
        if checker is None:
            subprocess.run(["python3", "scripts/check-repository.py"], cwd=snapshot, env=environment, check=True)
            subprocess.run(["python3", "scripts/check-ci.py", "all"], cwd=snapshot, env=environment, check=True)
            subprocess.run(
                [str(tools / "bin" / "gitleaks"), "git", "--pre-commit", "--staged", "--redact", "--no-banner"],
                cwd=snapshot, env=environment, check=True,
            )
        else:
            checker(snapshot, environment)
        if git(snapshot, "write-tree", environment=environment) != tree:
            raise RuntimeError("Checks modified the snapshot index; commit blocked.")
        changes = git(snapshot, "diff", "--name-only", "--no-ext-diff", environment=environment)
        if changes:
            raise RuntimeError("Checks modified tracked snapshot files: " + changes.replace("\n", ", "))
        if index_tree(root) != tree:
            raise RuntimeError("Staged files changed during checks; run them again before committing.")
    print("Required local CI checks passed for staged tree " + tree + ".", flush=True)
    print("Hosted Linux/PHP matrix results must also pass for the published revision before merging.", flush=True)
    return tree


if __name__ == "__main__":
    try:
        verify_staged(Path(git(Path.cwd(), "rev-parse", "--show-toplevel")))
    except (subprocess.CalledProcessError, RuntimeError) as error:
        print("Commit blocked: " + str(error), flush=True)
        raise SystemExit(error.returncode if isinstance(error, subprocess.CalledProcessError) else 1) from error
