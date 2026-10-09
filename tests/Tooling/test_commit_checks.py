"""Exercise staged isolation and fail-closed hooks using disposable Git repositories."""
import contextlib
import importlib.util
import io
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[2]


def load_script(name):
    specification = importlib.util.spec_from_file_location(name, ROOT / "scripts" / (name + ".py"))
    module = importlib.util.module_from_spec(specification)
    specification.loader.exec_module(module)
    return module


staged = load_script("check-staged")
hooks = load_script("install-git-hooks")


class CommitChecksTest(unittest.TestCase):
    def setUp(self):
        temporary_root = ROOT / ".tools" / "tmp"
        temporary_root.mkdir(parents=True, exist_ok=True)
        self.directory = tempfile.TemporaryDirectory(dir=temporary_root)
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        environment = {key: value for key, value in os.environ.items() if not key.startswith("GIT_")}
        environment.update({"GIT_CONFIG_GLOBAL": os.devnull, "GIT_CONFIG_NOSYSTEM": "1"})
        self.environment_patch = patch.dict(os.environ, environment, clear=True)
        self.environment_patch.start()
        self.addCleanup(self.environment_patch.stop)
        self.git("init", "--quiet")
        (self.root / ".gitignore").write_text(".tools/\n")
        (self.root / "example.txt").write_text("staged content\n")
        self.git("add", ".gitignore", "example.txt")
        self.output = contextlib.redirect_stdout(io.StringIO())
        self.output.__enter__()
        self.addCleanup(self.output.__exit__, None, None, None)

    def git(self, *arguments):
        return subprocess.check_output(["git", *arguments], cwd=self.root, text=True).strip()

    def test_partial_staging_checks_index_content_and_preserves_user_files(self):
        original_index = (self.root / ".git" / "index").read_bytes()
        (self.root / "example.txt").write_text("unstaged changes\n")
        (self.root / "untracked.txt").write_text("not part of the commit\n")

        def check(snapshot, environment):
            self.assertEqual((snapshot / "example.txt").read_text(), "staged content\n")
            self.assertFalse((snapshot / "untracked.txt").exists())
            self.assertEqual(Path(environment["GIT_WORK_TREE"]), snapshot)
            self.assertNotEqual(Path(environment["GIT_INDEX_FILE"]), self.root / ".git" / "index")

        staged.verify_staged(self.root, checker=check)

        self.assertEqual((self.root / ".git" / "index").read_bytes(), original_index)
        self.assertEqual((self.root / "example.txt").read_text(), "unstaged changes\n")
        self.assertEqual(list((self.root / ".tools" / "pre-commit").iterdir()), [])

    def test_a_failing_check_blocks_and_preserves_the_original_index(self):
        original_index = (self.root / ".git" / "index").read_bytes()

        def fail(snapshot, environment):
            raise subprocess.CalledProcessError(2, ["synthetic-failing-check"])

        with self.assertRaises(subprocess.CalledProcessError):
            staged.verify_staged(self.root, checker=fail)

        self.assertEqual((self.root / ".git" / "index").read_bytes(), original_index)
        self.assertEqual(list((self.root / ".tools" / "pre-commit").iterdir()), [])

    def test_changing_the_user_index_during_checks_invalidates_the_result(self):
        def change_index(snapshot, environment):
            (self.root / "example.txt").write_text("newly staged content\n")
            self.git("add", "example.txt")

        with self.assertRaisesRegex(RuntimeError, "Staged files changed"):
            staged.verify_staged(self.root, checker=change_index)

        self.assertEqual(self.git("show", ":example.txt"), "newly staged content")

    def test_check_mutation_of_a_tracked_snapshot_file_blocks_commit(self):
        def mutate(snapshot, environment):
            (snapshot / "example.txt").write_text("modified by a check\n")

        with self.assertRaisesRegex(RuntimeError, "modified tracked snapshot files: example.txt"):
            staged.verify_staged(self.root, checker=mutate)

    def test_removed_editor_copies_naming_drafts_and_extraction_bytes_are_rejected(self):
        cases = [
            (".claude/settings.local.json", "Removed local/editor or obsolete naming artifact"),
            (".cursor/skills/example/SKILL.md", "Removed local/editor or obsolete naming artifact"),
            ("outputs/electoral-app-naming-explorer.v1.json", "Removed local/editor or obsolete naming artifact"),
            ("storage/framework/extraction-workspaces/owned/input.pdf", "Extraction runtime bytes"),
        ]
        for name, reason in cases:
            with self.subTest(path=name):
                path = self.root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text("Synthetic unwanted artifact\n")
                self.git("add", name)
                try:
                    result = subprocess.run(
                        [sys.executable, str(ROOT / "scripts/check-repository.py")],
                        cwd=self.root,
                        env={**os.environ, "GIT_DIR": str(self.root / ".git"), "GIT_WORK_TREE": str(self.root)},
                        capture_output=True,
                        text=True,
                    )

                    self.assertEqual(result.returncode, 1)
                    self.assertIn(reason + " must not be tracked: " + name, result.stderr)
                finally:
                    self.git("rm", "--cached", name)
                    path.unlink()

    def test_reviewed_relative_skill_aliases_survive_snapshot_export(self):
        source = self.root / ".agents" / "skills" / "example"
        source.mkdir(parents=True)
        (source / "SKILL.md").write_text("Synthetic skill\n")
        aliases = self.root / ".cursor" / "skills"
        aliases.mkdir(parents=True)
        (aliases / "example").symlink_to("../../.agents/skills/example", target_is_directory=True)
        self.git("add", ".agents", ".cursor")

        def check(snapshot, environment):
            self.assertEqual((snapshot / ".cursor/skills/example/SKILL.md").read_text(), "Synthetic skill\n")

        staged.verify_staged(self.root, checker=check)

    def test_release_archive_exclusions_do_not_omit_ci_files_from_checks(self):
        workflows = self.root / ".github/workflows"
        workflows.mkdir(parents=True)
        (workflows / "ci.yml").write_text("name: Synthetic CI\n")
        (self.root / ".gitattributes").write_text("/.github export-ignore\n")
        self.git("add", ".github", ".gitattributes")

        def check(snapshot, environment):
            self.assertEqual((snapshot / ".github/workflows/ci.yml").read_text(), "name: Synthetic CI\n")

        staged.verify_staged(self.root, checker=check)

    def test_hook_installation_is_idempotent_without_changing_hook_configuration(self):
        hooks.install(self.root)
        hooks.install(self.root)

        target = self.root / ".git/hooks/pre-commit"
        self.assertEqual(target.read_text(), hooks.HOOK)
        self.assertTrue(os.access(target, os.X_OK))
        self.assertEqual(subprocess.run(["git", "config", "--get", "core.hooksPath"], cwd=self.root).returncode, 1)

    def test_existing_local_hook_is_preserved(self):
        target = self.root / ".git/hooks/pre-commit"
        target.write_text("#!/bin/sh\nexit 17\n")

        with self.assertRaisesRegex(RuntimeError, "existing local"):
            hooks.install(self.root)

        self.assertEqual(target.read_text(), "#!/bin/sh\nexit 17\n")

    def test_unrecognized_custom_hook_configuration_is_preserved(self):
        self.git("config", "core.hooksPath", "custom-hooks")

        with self.assertRaisesRegex(RuntimeError, "explicit hook chaining"):
            hooks.install(self.root)

        self.assertEqual(self.git("config", "--get", "core.hooksPath"), "custom-hooks")

    def test_installed_hook_propagates_verification_failure(self):
        scripts = self.root / "scripts"
        scripts.mkdir()
        (scripts / "check-staged.py").write_text("raise SystemExit(23)\n")
        hooks.install(self.root)

        result = subprocess.run([str(self.root / ".git/hooks/pre-commit")], cwd=self.root)

        self.assertEqual(result.returncode, 23)


if __name__ == "__main__":
    unittest.main()
