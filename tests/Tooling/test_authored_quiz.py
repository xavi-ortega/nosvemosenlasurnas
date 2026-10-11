"""Test draft assembly from authored input, without source generation or publication."""
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
