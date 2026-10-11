"""Test draft assembly from authored input, without source generation or publication."""
import copy
import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
import assemble_authored_quiz as assembler


class AuthoredQuizTest(unittest.TestCase):
    def prepare(self, root):
        output = root / "outputs"
        output.mkdir()
        text = "Context: a fixture-only café proposal.\n\n"
        quote = "café proposal."
        source = root / "source.txt"
        source.write_text(text)
        sha = assembler.digest(source.read_bytes())
        notebook = {"documentId": "fixture-document", "candidacyId": "fixture-a", "fullDocumentRead": True,
                    "sourceSha256": sha, "extractionSha256": sha, "extraction": "fixture"}
        notebook_path = output / "notebook.json"
        notebook_path.write_text(json.dumps(notebook))
        citation = {"notebook": "outputs/notebook.json", "notebookSha256": assembler.digest(notebook_path.read_bytes()),
                    "documentId": "fixture-document", "sourceSha256": sha, "extractionSha256": sha,
                    "sourceUrl": "https://fixture.invalid/programme", "start": text.index(quote),
                    "end": text.index(quote) + len(quote), "contextStart": 0, "contextEnd": len(text),
                    "contextSha256": sha, "pdfPage": 1, "quote": quote}
        question = {"id": "fixture-question", "topicId": "housing", "familyId": "fixture-family",
                    "text": "Una pregunta ficticia para las pruebas.", "help": "Ayuda ficticia.", "level": "general"}
        cells = [{"candidacyId": "fixture-a", "status": "derived", "value": 2, "rationale": "Propuesta ficticia.", "citations": [citation]},
                 {"candidacyId": "fixture-b", "status": "unknown", "value": None, "rationale": "Sin interpretación.", "citations": []}]
        files = {
            "2023-authored-question-bank.json": {"electionId": "fixture-election", "releaseEligible": False, "questions": [question]},
            "2023-authored-issue-matrix.json": {"electionId": "fixture-election", "releaseEligible": False,
                "candidacyIds": ["fixture-a", "fixture-b"], "issues": [{"id": question["id"], "topicId": "housing", "familyId": "fixture-family", "cells": cells}]},
            "2023-source-inventory.json": {"electionId": "fixture-election", "electionDate": "2023-07-23",
                "candidacies": [{"id": "fixture-a", "officialName": "Primera ficticia"}, {"id": "fixture-b", "officialName": "Segunda ficticia"}],
                "acquisitions": [{"file": "source.txt", "sha256": sha, "textFile": "source.txt",
                    "url": citation["sourceUrl"], "recordedAt": "2026-10-11T00:00:00Z"}]},
            "2023-candidacy-registry.json": {"electionId": "fixture-election", "constituencyCount": 1,
                "records": [{"id": "congress-test-1", "status": "proclaimed", "resultDenominationId": "fixture-a", "constituency": "Test"},
                            {"id": "congress-test-2", "status": "proclaimed", "resultDenominationId": "fixture-b", "constituency": "Test"}]},
        }
        for name, value in files.items():
            (output / name).write_text(json.dumps(value))
        return files

    def prepare_chunked(self, root):
        files = self.prepare(root)
        source = files["2023-source-inventory.json"]["acquisitions"][0]
        original = (root / source["file"]).read_bytes()
        parts = [original[:15], original[15:]]
        source["bytes"] = len(original)
        source["originalChunks"] = []
        for index, part in enumerate(parts):
            name = f"original-part-{index}.bin"
            (root / name).write_bytes(part)
            source["originalChunks"].append({"file": name, "bytes": len(part), "sha256": assembler.digest(part)})
        (root / "outputs/2023-source-inventory.json").write_text(json.dumps(files["2023-source-inventory.json"]))
        return files

    def test_chunked_original_preserves_the_original_hash_url_and_citation(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            files = self.prepare_chunked(root)

            bank = assembler.assemble(root)

            self.assertEqual(bank["documents"][0]["sha256"], files["2023-source-inventory.json"]["acquisitions"][0]["sha256"])
            self.assertEqual(bank["documents"][0]["url"], "https://fixture.invalid/programme")
            self.assertEqual(bank["positions"]["fixture-a"]["fixture-question"]["citations"][0]["quote"], "café proposal.")
            self.assertFalse((root / "resources/evidence/current.json").exists())

    def test_chunked_original_rejects_incomplete_reordered_changed_and_unbounded_records(self):
        for changed in ["missing", "reordered", "duplicate", "part_hash", "part_bytes", "content", "source_hash", "source_bytes", "escape", "count", "budget", "part_budget", "extra_key"]:
            with self.subTest(changed=changed), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                files = self.prepare_chunked(root)
                source = files["2023-source-inventory.json"]["acquisitions"][0]
                chunks = source["originalChunks"]
                if changed == "missing":
                    chunks.pop()
                elif changed == "reordered":
                    chunks.reverse()
                elif changed == "duplicate":
                    chunks[1] = chunks[0].copy()
                elif changed == "part_hash":
                    chunks[0]["sha256"] = "0" * 64
                elif changed == "part_bytes":
                    chunks[0]["bytes"] += 1
                elif changed == "content":
                    (root / chunks[0]["file"]).write_bytes(b"x" * chunks[0]["bytes"])
                elif changed == "source_hash":
                    (root / source["file"]).write_bytes(b"y" * source["bytes"])
                elif changed == "source_bytes":
                    source["bytes"] += 1
                elif changed == "escape":
                    chunks[0]["file"] = "../outside.bin"
                elif changed == "count":
                    source["originalChunks"] *= 3
                elif changed == "budget":
                    source["bytes"] = 4 * assembler.LIMIT + 1
                elif changed == "part_budget":
                    chunks[0]["bytes"] = assembler.LIMIT + 1
                else:
                    chunks[0]["trusted"] = True
                (root / "outputs/2023-source-inventory.json").write_text(json.dumps(files["2023-source-inventory.json"]))

                with self.assertRaises(ValueError):
                    assembler.assemble(root)

    def test_an_unchunked_oversized_original_keeps_the_existing_size_rejection(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = self.prepare(root)["2023-source-inventory.json"]["acquisitions"][0]
            with (root / source["file"]).open("r+b") as stream:
                stream.truncate(64 * 1024 * 1024 + 1)

            with self.assertRaisesRegex(ValueError, "oversized retained source"):
                assembler.verify_original(root, source, source["sha256"])

    def test_chunked_original_rejects_a_wrong_expected_complete_hash(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = self.prepare_chunked(root)["2023-source-inventory.json"]["acquisitions"][0]

            with self.assertRaises(ValueError):
                assembler.verify_original(root, source, "0" * 64)

    def test_uncorrected_nul_text_is_rejected_before_a_public_citation_is_built(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            files = self.prepare(root)
            text = "Context: a fixture-only café proposal.\x00\n\n"
            (root / "source.txt").write_text(text)
            sha = assembler.digest(text.encode())
            notebook_path = root / "outputs/notebook.json"
            notebook = json.loads(notebook_path.read_text())
            notebook.update(sourceSha256=sha, extractionSha256=sha)
            notebook_path.write_text(json.dumps(notebook))
            source = files["2023-source-inventory.json"]["acquisitions"][0]
            source["sha256"] = sha
            citation = files["2023-authored-issue-matrix.json"]["issues"][0]["cells"][0]["citations"][0]
            citation.update(sourceSha256=sha, extractionSha256=sha, notebookSha256=assembler.digest(notebook_path.read_bytes()), contextEnd=len(text), contextSha256=sha)
            for name in ["2023-source-inventory.json", "2023-authored-issue-matrix.json"]:
                (root / "outputs" / name).write_text(json.dumps(files[name]))

            with self.assertRaisesRegex(ValueError, "unsafe authored extraction"):
                assembler.assemble(root)

    def test_assembles_exact_unicode_citations_and_missing_candidacy_without_source_text(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.prepare(root)
            bank = assembler.assemble(root)

            self.assertTrue(bank["draft"])
            self.assertFalse(bank["releaseEligible"])
            self.assertEqual(bank["positions"]["fixture-a"]["fixture-question"]["value"], 2)
            self.assertEqual(bank["positions"]["fixture-a"]["fixture-question"]["citations"][0]["quote"], "café proposal.")
            self.assertEqual(bank["positions"]["fixture-b"]["fixture-question"]["status"], "unknown")
            self.assertIsNone(bank["positions"]["fixture-b"]["fixture-question"]["value"])
            self.assertEqual(bank["candidacies"][1]["constituencyIds"], ["test"])
            self.assertNotIn("text", bank["documents"][0])
            self.assertFalse((root / "resources/evidence/current.json").exists())

    def test_html_citations_preserve_a_verified_section_and_reject_an_outside_section(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            files = self.prepare(root)
            inventory = files["2023-source-inventory.json"]
            inventory["acquisitions"][0]["mediaType"] = "text/html; charset=UTF-8"
            (root / "outputs/2023-source-inventory.json").write_text(json.dumps(inventory))
            notebook_path = root / "outputs/notebook.json"
            notebook = json.loads(notebook_path.read_text())
            notebook["coverage"] = [{"sectionNumber": 2, "start": 0, "end": 39}]
            notebook_path.write_text(json.dumps(notebook))
            matrix = files["2023-authored-issue-matrix.json"]
            citation = matrix["issues"][0]["cells"][0]["citations"][0]
            citation["pdfPage"] = None
            citation["htmlSection"] = 2
            citation["notebookSha256"] = assembler.digest(notebook_path.read_bytes())
            matrix_path = root / "outputs/2023-authored-issue-matrix.json"
            matrix_path.write_text(json.dumps(matrix))

            bank = assembler.assemble(root)

            self.assertEqual(bank["documents"][0]["mediaType"], "text/html")
            result = bank["positions"]["fixture-a"]["fixture-question"]
            self.assertEqual(result["value"], 2)
            self.assertEqual(result["citations"][0]["locator"]["section"], 2)
            self.assertEqual(result["citations"][0]["quote"], "café proposal.")
            citation["htmlSection"] = 3
            matrix_path.write_text(json.dumps(matrix))
            with self.assertRaises(ValueError):
                assembler.assemble(root)

    def test_preserves_explicit_comparison_policy_and_rejects_an_unknown_policy(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            files = self.prepare(root)
            authored = files["2023-authored-question-bank.json"]
            authored["comparisonPolicy"] = "fixed-bank-evidence-v1"
            path = root / "outputs/2023-authored-question-bank.json"
            path.write_text(json.dumps(authored))

            bank = assembler.assemble(root)

            self.assertEqual(bank["comparisonPolicy"], "fixed-bank-evidence-v1")
            self.assertFalse(bank["releaseEligible"])
            self.assertIsNone(bank["positions"]["fixture-b"]["fixture-question"]["value"])
            authored["comparisonPolicy"] = "answer-dependent"
            path.write_text(json.dumps(authored))
            with self.assertRaises(ValueError):
                assembler.assemble(root)

    def test_identical_primary_and_mirror_bytes_preserve_the_authored_source_url(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            files = self.prepare(root)
            inventory = files["2023-source-inventory.json"]
            primary = inventory["acquisitions"][0]
            mirror = primary | {"url": "https://mirror.invalid/copied-programme"}
            inventory["acquisitions"].insert(0, mirror)
            path = root / "outputs/2023-source-inventory.json"
            path.write_text(json.dumps(inventory))

            bank = assembler.assemble(root)

            self.assertEqual(bank["documents"][0]["url"], "https://fixture.invalid/programme")
            self.assertEqual(bank["positions"]["fixture-a"]["fixture-question"]["citations"][0]["quote"], "café proposal.")
            inventory["acquisitions"].reverse()
            path.write_text(json.dumps(inventory))
            self.assertEqual(assembler.assemble(root), bank)

    def test_an_unregistered_url_cannot_borrow_a_registered_source_hash(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            files = self.prepare(root)
            matrix = files["2023-authored-issue-matrix.json"]
            citation = matrix["issues"][0]["cells"][0]["citations"][0]
            citation["sourceUrl"] = "https://unregistered.invalid/programme"
            (root / "outputs/2023-authored-issue-matrix.json").write_text(json.dumps(matrix))

            with self.assertRaises(ValueError):
                assembler.assemble(root)

    def test_original_extraction_notebook_and_context_changes_fail_closed(self):
        for changed in ["original", "extraction", "notebook", "context", "owner"]:
            with self.subTest(changed=changed), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                files = self.prepare(root)
                if changed == "original":
                    (root / "source.txt").write_text("Changed original")
                elif changed == "notebook":
                    (root / "outputs/notebook.json").write_text("{}")
                else:
                    matrix = files["2023-authored-issue-matrix.json"]
                    citation = matrix["issues"][0]["cells"][0]["citations"][0]
                    if changed == "extraction":
                        citation["extractionSha256"] = "a" * 64
                    elif changed == "context":
                        citation["contextSha256"] = "a" * 64
                    else:
                        matrix["issues"][0]["cells"][0]["candidacyId"] = "fixture-b"
                        matrix["issues"][0]["cells"][1]["candidacyId"] = "fixture-a"
                    (root / "outputs/2023-authored-issue-matrix.json").write_text(json.dumps(matrix))
                with self.assertRaises(ValueError):
                    assembler.assemble(root)

    def test_missing_pair_wrong_election_or_release_claim_cannot_be_assembled(self):
        for changed in ["missing-pair", "election", "release"]:
            with self.subTest(changed=changed), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                files = self.prepare(root)
                bank = files["2023-authored-question-bank.json"]
                if changed == "missing-pair":
                    matrix = files["2023-authored-issue-matrix.json"]
                    matrix["issues"][0]["cells"].pop()
                    (root / "outputs/2023-authored-issue-matrix.json").write_text(json.dumps(matrix))
                elif changed == "election":
                    bank["electionId"] = "other"
                else:
                    bank["releaseEligible"] = True
                (root / "outputs/2023-authored-question-bank.json").write_text(json.dumps(bank))
                with self.assertRaises(ValueError):
                    assembler.assemble(root)

    def prepare_territorial(self, root):
        files = self.prepare(root)
        registry = files["2023-candidacy-registry.json"]
        registry["constituencyCount"] = 2
        registry["records"].append({"id": "congress-other-1", "status": "proclaimed", "resultDenominationId": "fixture-a", "constituency": "Other"})
        files["2023-source-inventory.json"]["acquisitions"][0]["applicableBallotRecordIds"] = ["congress-test-1", "congress-other-1"]
        authored = files["2023-authored-question-bank.json"]
        authored["questions"].append(authored["questions"][0] | {"id": "fixture-second", "familyId": "second-family"})
        matrix = files["2023-authored-issue-matrix.json"]
        matrix["issues"].append(copy.deepcopy(matrix["issues"][0]) | {"id": "fixture-second", "familyId": "second-family"})
        matrix["issues"][0]["constituencyCells"] = [copy.deepcopy(matrix["issues"][0]["cells"][0]) | {"constituencyId": "test", "value": -2, "rationale": "Interpretación territorial ficticia."}]
        for name, value in files.items():
            (root / "outputs" / name).write_text(json.dumps(value))
        return files

    def test_scoped_citations_do_not_replace_common_or_unrelated_positions(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.prepare_territorial(root)

            bank = assembler.assemble(root)

            self.assertEqual(bank["positions"]["fixture-a"]["fixture-question"]["value"], 2)
            self.assertEqual(bank["positions"]["fixture-a"]["fixture-second"]["value"], 2)
            self.assertEqual(set(bank["constituencyPositions"]), {"test"})
            scoped = bank["constituencyPositions"]["test"]["fixture-a"]
            self.assertEqual(set(scoped), {"fixture-question"})
            self.assertEqual(scoped["fixture-question"]["value"], -2)
            self.assertEqual(scoped["fixture-question"]["citations"][0]["quote"], "café proposal.")
            self.assertNotIn("text", bank["documents"][0])

    def test_uncited_scoped_unknown_remains_explicit_and_unscored(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            files = self.prepare_territorial(root)
            cell = files["2023-authored-issue-matrix.json"]["issues"][0]["constituencyCells"][0]
            cell.update(status="unknown", value=None, citations=[], rationale="No hay postura territorial acreditada.")
            (root / "outputs/2023-authored-issue-matrix.json").write_text(json.dumps(files["2023-authored-issue-matrix.json"]))

            scoped = assembler.assemble(root)["constituencyPositions"]["test"]["fixture-a"]["fixture-question"]

            self.assertEqual(scoped, {"status": "unknown", "value": None, "citations": [], "rationale": "No hay postura territorial acreditada."})

    def test_territorial_duplicates_ineligible_pairs_and_unverified_applicability_fail_closed(self):
        for failure in ["duplicate", "unknown-scope", "ineligible-owner", "missing-applicability", "wrong-ballot", "narrow-default", "scoped-default"]:
            with self.subTest(failure=failure), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                files = self.prepare_territorial(root)
                issue = files["2023-authored-issue-matrix.json"]["issues"][0]
                source = files["2023-source-inventory.json"]["acquisitions"][0]
                if failure == "duplicate":
                    issue["constituencyCells"].append(copy.deepcopy(issue["constituencyCells"][0]))
                elif failure == "unknown-scope":
                    issue["constituencyCells"][0]["constituencyId"] = "missing"
                elif failure == "ineligible-owner":
                    issue["constituencyCells"][0].update(candidacyId="fixture-b", constituencyId="other")
                elif failure == "missing-applicability":
                    source.pop("applicableBallotRecordIds")
                elif failure == "wrong-ballot":
                    source["applicableBallotRecordIds"] = ["congress-other-1"]
                    for item in files["2023-authored-issue-matrix.json"]["issues"]:
                        item["cells"][0].update(status="unknown", value=None, citations=[])
                elif failure == "narrow-default":
                    source["applicableBallotRecordIds"] = ["congress-test-1"]
                else:
                    issue["cells"][0]["constituencyId"] = "test"
                for name, value in files.items():
                    (root / "outputs" / name).write_text(json.dumps(value))

                with self.assertRaises(ValueError):
                    assembler.assemble(root)

    def prepare_territorial_conflict(self, root):
        files = self.prepare_territorial(root)
        notebook_path = root / "outputs/territorial-notebook.json"
        notebook = json.loads((root / "outputs/notebook.json").read_text())
        notebook["documentId"] = "territorial-document"
        notebook_path.write_text(json.dumps(notebook))
        issue = files["2023-authored-issue-matrix.json"]["issues"][0]
        default = issue["cells"][0]
        citation = copy.deepcopy(default["citations"][0])
        citation.update(documentId="territorial-document", notebook="outputs/territorial-notebook.json",
                        notebookSha256=assembler.digest(notebook_path.read_bytes()),
                        sourceUrl="https://fixture.invalid/territorial-programme")
        inventory = files["2023-source-inventory.json"]
        inventory["acquisitions"].append(inventory["acquisitions"][0] | {
            "url": citation["sourceUrl"], "applicableBallotRecordIds": ["congress-test-1"]})
        unaffected = copy.deepcopy(default) | {"constituencyId": "other"}
        default.update(status="conflicting", value=None, rationale="Diferencia territorial documentada.")
        default["citations"].append(citation)
        issue["constituencyCells"] = [copy.deepcopy(default) | {"constituencyId": "test"}, unaffected]
        for name, value in files.items():
            (root / "outputs" / name).write_text(json.dumps(value))
        return files

    def test_all_scope_conflict_discloses_both_sources_without_a_territorial_numeric_default(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.prepare_territorial_conflict(root)

            bank = assembler.assemble(root)

            default = bank["positions"]["fixture-a"]["fixture-question"]
            self.assertEqual(default["status"], "conflicting")
            self.assertIsNone(default["value"])
            self.assertEqual({citation["documentId"] for citation in default["citations"]},
                             {"fixture-document", "territorial-document"})
            territorial = bank["constituencyPositions"]["test"]["fixture-a"]["fixture-question"]
            self.assertEqual(territorial, default)
            unaffected = bank["constituencyPositions"]["other"]["fixture-a"]["fixture-question"]
            self.assertEqual(unaffected["value"], 2)
            self.assertEqual([citation["documentId"] for citation in unaffected["citations"]], ["fixture-document"])

    def test_all_scope_territorial_disclosure_rejects_numeric_or_unreconciled_positions(self):
        for failure in ["numeric", "unknown", "missing-other-override", "missing-conflict",
                        "different-citation", "single-document", "unverified-territory"]:
            with self.subTest(failure=failure), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                files = self.prepare_territorial_conflict(root)
                issue = files["2023-authored-issue-matrix.json"]["issues"][0]
                default = issue["cells"][0]
                if failure == "numeric":
                    default.update(status="derived", value=2)
                elif failure == "unknown":
                    default["status"] = "unknown"
                elif failure == "missing-other-override":
                    issue["constituencyCells"].pop()
                elif failure == "missing-conflict":
                    issue["constituencyCells"][0].update(status="derived", value=2)
                elif failure == "different-citation":
                    issue["constituencyCells"][0]["citations"].pop()
                elif failure == "single-document":
                    default["citations"].pop(0)
                else:
                    files["2023-source-inventory.json"]["acquisitions"][1]["applicableBallotRecordIds"] = ["congress-missing-1"]
                for name, value in files.items():
                    (root / "outputs" / name).write_text(json.dumps(value))

                with self.assertRaises(ValueError):
                    assembler.assemble(root)

    def test_retained_source_cannot_escape_project_root(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / "project"
            root.mkdir()
            (root.parent / "outside.txt").write_text("Outside")
            with self.assertRaises(ValueError):
                assembler.retained_file(root, "../outside.txt")

    def test_numeric_leading_original_document_id_retains_provenance_and_valid_public_id(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            files = self.prepare(root)
            notebook_path = root / "outputs/notebook.json"
            notebook = json.loads(notebook_path.read_text())
            notebook["documentId"] = "3edad-fixture"
            notebook_path.write_text(json.dumps(notebook))
            matrix = files["2023-authored-issue-matrix.json"]
            citation = matrix["issues"][0]["cells"][0]["citations"][0]
            citation["documentId"] = "3edad-fixture"
            citation["notebookSha256"] = assembler.digest(notebook_path.read_bytes())
            (root / "outputs/2023-authored-issue-matrix.json").write_text(json.dumps(matrix))

            bank = assembler.assemble(root)

            self.assertEqual(bank["documents"][0]["id"], "source-3edad-fixture")
            self.assertEqual(bank["documents"][0]["originalDocumentId"], "3edad-fixture")
            self.assertEqual(bank["positions"]["fixture-a"]["fixture-question"]["citations"][0]["documentId"], "source-3edad-fixture")


    def test_new_preview_keeps_previous_hash_snapshot_and_rejects_changed_snapshot(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.prepare(root)
            bank = assembler.assemble(root)
            output = root / "preview" / "bank.json"
            first = assembler.write_draft(bank, output)
            first_bytes = output.read_bytes()
            self.assertEqual(json.loads(first_bytes), bank)
            bank["questions"][0]["text"] = "Otra pregunta ficticia para las pruebas."
            second = assembler.write_draft(bank, output)
            second_bytes = output.read_bytes()
            self.assertEqual(json.loads(second_bytes), bank)

            self.assertNotEqual(first["sha256"], second["sha256"])
            self.assertEqual(Path(first["snapshotFile"]).read_bytes(), first_bytes)
            self.assertEqual(Path(second["snapshotFile"]).read_bytes(), second_bytes)
            self.assertEqual(assembler.digest(first_bytes), first["sha256"])
            Path(first["snapshotFile"]).write_text("Changed snapshot")
            bank["questions"][0]["text"] = "Una pregunta ficticia para las pruebas."
            with self.assertRaises(ValueError):
                assembler.write_draft(bank, output)
            self.assertEqual(output.read_bytes(), second_bytes)


    def test_assembly_preserves_authored_starters_after_question_permutation(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            files = self.prepare(root)
            authored = files["2023-authored-question-bank.json"]
            matrix = files["2023-authored-issue-matrix.json"]
            question = authored["questions"][0]
            issue = matrix["issues"][0]
            topics = ["housing", "employment", "health", "energy", "taxes", "education", "transport", "rights", "institutions", "pensions"]
            authored["questions"] = []
            matrix["issues"] = []
            expected = []
            for index, topic in enumerate(topics):
                identifier = f"fixture-question-{index}"
                expected.append(identifier)
                authored["questions"].append(question | {"id": identifier, "familyId": f"fixture-family-{index}", "topicId": topic})
                matrix["issues"].append(copy.deepcopy(issue) | {"id": identifier, "familyId": f"fixture-family-{index}", "topicId": topic})
            authored["starterQuestionIds"] = expected
            authored["questions"].reverse()
            for name in ["2023-authored-question-bank.json", "2023-authored-issue-matrix.json"]:
                (root / "outputs" / name).write_text(json.dumps(files[name]))

            assembled = assembler.assemble(root)

            self.assertEqual(assembled["starterQuestionIds"], expected)
            self.assertEqual(len(assembled["questions"]), 10)

    def test_invalid_authored_starter_ids_stop_assembly_before_public_output(self):
        for starters in [[], ["fixture-question"] * 10, ["missing-question"] * 10, [{}] * 10]:
            with self.subTest(starters=starters), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                files = self.prepare(root)
                files["2023-authored-question-bank.json"]["starterQuestionIds"] = starters
                (root / "outputs/2023-authored-question-bank.json").write_text(json.dumps(files["2023-authored-question-bank.json"]))

                with self.assertRaises(ValueError):
                    assembler.assemble(root)
                self.assertFalse((root / "resources/evidence/current.json").exists())
