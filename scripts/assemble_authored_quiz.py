#!/usr/bin/env python3
"""Assemble a local, unpublished quiz preview from directly authored source records."""
import argparse
import copy
import hashlib
import json
from pathlib import Path
import tempfile

from grounded_positions import attach
from prepare_sources import ID, LIMIT, digest, require


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def retained_file(root, relative, max_bytes=LIMIT):
    path = (root / relative).resolve()
    require(path.is_relative_to(root.resolve()), "Retained source path escapes the project")
    require(path.is_file() and 0 < path.stat().st_size <= max_bytes, "Missing or oversized retained source")
    return path


def verify_original(root, source, expected_sha256):
    chunks = source.get("originalChunks")
    if chunks is None:
        original = retained_file(root, source["file"], max_bytes=64 * 1024 * 1024)
        require(digest(original.read_bytes()) == expected_sha256, "Original source changed")
        return
    require(isinstance(chunks, list) and 1 <= len(chunks) <= 4, "Invalid original chunk count")
    require(type(source.get("bytes")) is int and 0 < source["bytes"] <= 4 * LIMIT, "Original chunk byte budget exceeded")
    original = (root / source["file"]).resolve()
    require(original.is_relative_to(root.resolve()) and original.is_file() and original.stat().st_size == source["bytes"], "Original chunk source unavailable")
    total = 0
    complete_hash = hashlib.sha256()
    paths = set()
    with original.open("rb") as original_stream:
        for chunk in chunks:
            require(isinstance(chunk, dict) and set(chunk) == {"file", "bytes", "sha256"}, "Invalid original chunk record")
            require(type(chunk["bytes"]) is int and 0 < chunk["bytes"] <= LIMIT, "Original chunk byte limit exceeded")
            path = retained_file(root, chunk["file"])
            require(path != original and path not in paths and path.stat().st_size == chunk["bytes"], "Duplicate or changed original chunk")
            paths.add(path)
            part_hash = hashlib.sha256()
            with path.open("rb") as part:
                while data := part.read(1024 * 1024):
                    require(original_stream.read(len(data)) == data, "Original chunk order or content changed")
                    part_hash.update(data)
                    complete_hash.update(data)
                    total += len(data)
                    require(total <= source["bytes"], "Original chunks exceed declared source")
            require(part_hash.hexdigest() == chunk["sha256"], "Original chunk hash changed")
        require(total == source["bytes"] and original_stream.read(1) == b"", "Incomplete original chunks")
    require(complete_hash.hexdigest() == expected_sha256, "Original source changed")


def assemble(root):
    authored = load_json(root / "outputs/2023-authored-question-bank.json")
    matrix = load_json(root / "outputs/2023-authored-issue-matrix.json")
    inventory = load_json(root / "outputs/2023-source-inventory.json")
    registry = load_json(root / "outputs/2023-candidacy-registry.json")
    election_id = inventory["electionId"]
    require(all(item["electionId"] == election_id for item in [authored, matrix, registry]), "Authored election mismatch")
    require(election_id == "es-congress-2023-07-23" and inventory["electionDate"] == "2023-07-23", "The 2023 authored compiler cannot relabel another edition")
    require(authored["releaseEligible"] is False and matrix["releaseEligible"] is False, "This command assembles drafts only")
    policy = authored.get("comparisonPolicy")
    require(policy is None or policy == "fixed-bank-evidence-v1", "Invalid comparison policy")
    questions = authored["questions"]
    question_ids = [question["id"] for question in questions]
    require(question_ids and len(question_ids) == len(set(question_ids)), "Duplicate authored question")
    starters = authored.get("starterQuestionIds")
    if starters is not None:
        require(isinstance(starters, list) and len(starters) == 10 and all(isinstance(identifier, str) for identifier in starters) and len(set(starters)) == 10 and set(starters) <= set(question_ids), "Invalid authored starters")
        selected = [next(question for question in questions if question["id"] == identifier) for identifier in starters]
        require(all(question["level"] == "general" for question in selected) and len({question["familyId"] for question in selected}) == 10, "Invalid authored starter families")
        require(len({question["topicId"] for question in selected}) == min(10, len({question["topicId"] for question in questions})), "Unbalanced authored starter topics")
    issues = {issue["id"]: issue for issue in matrix["issues"]}
    require(len(issues) == len(matrix["issues"]) and set(issues) == set(question_ids), "Issue/question mismatch")
    candidate_ids = [candidate["id"] for candidate in inventory["candidacies"]]
    require(set(matrix["candidacyIds"]) == set(candidate_ids), "Missing candidature in authored matrix")
    scopes = {}
    territories = {candidate: set() for candidate in candidate_ids}
    for row in registry["records"]:
        if row["status"] != "proclaimed":
            continue
        candidate = row["resultDenominationId"]
        require(candidate in territories, "Registry owner absent from inventory")
        scope = row["id"].rsplit("-", 1)[0].removeprefix("congress-")
        require(scope not in scopes or scopes[scope] == row["constituency"], "Inconsistent constituency name")
        scopes[scope] = row["constituency"]
        territories[candidate].add(scope)
    require(len(scopes) == registry["constituencyCount"] and all(territories.values()), "Incomplete constituency registry")
    acquisitions = inventory["acquisitions"] + inventory.get("publicationAcquisitions", [])
    documents = {}
    prepared = []
    unknown_rationales = []
    html_sections = {}
    scoped_prepared = {}
    scoped_unknown_rationales = {}
    scoped_candidates = {}
    scoped_questions = {}
    for question in questions:
        issue = issues[question["id"]]
        require(issue["topicId"] == question["topicId"] and issue["familyId"] == question["familyId"], "Issue budget mismatch")
        cells = issue["cells"]
        require(len(cells) == len(candidate_ids) and {cell["candidacyId"] for cell in cells} == set(candidate_ids), "Missing or duplicate authored pair")
        scoped_cells = issue.get("constituencyCells", [])
        require(isinstance(scoped_cells, list), "Invalid constituency cells")
        scoped_pairs = set()
        for cell in scoped_cells:
            candidate, scope = cell["candidacyId"], cell["constituencyId"]
            require(isinstance(candidate, str) and isinstance(scope, str) and candidate in territories and scope in territories[candidate] and (candidate, scope) not in scoped_pairs, "Invalid or duplicate constituency pair")
            scoped_pairs.add((candidate, scope))
            scoped_candidates.setdefault(scope, set()).add(candidate)
            scoped_questions.setdefault(scope, {}).setdefault(candidate, set()).add(question["id"])
        require(all("constituencyId" not in cell for cell in cells), "Default cell has a constituency override")
        for cell in cells + scoped_cells:
            scope = cell.get("constituencyId")
            require(cell["status"] in {"derived", "unknown", "ambiguous", "unsupported", "conflicting"}, "Invalid authored status")
            require((type(cell["value"]) is int and -2 <= cell["value"] <= 2) if cell["status"] == "derived" else cell["value"] is None, "Unsupported authored number")
            citations = []
            for citation in cell["citations"]:
                notebook_path = retained_file(root, citation["notebook"])
                require(digest(notebook_path.read_bytes()) == citation["notebookSha256"], "Authored notebook changed")
                notebook = load_json(notebook_path)
                require(notebook["fullDocumentRead"] is True and notebook["candidacyId"] == cell["candidacyId"], "Unread or inapplicable notebook")
                require(notebook["documentId"] == citation["documentId"] and notebook["sourceSha256"] == citation["sourceSha256"] and notebook["extractionSha256"] == citation["extractionSha256"], "Authored source mismatch")
                source = next((source for source in acquisitions
                               if source.get("sha256") == citation["sourceSha256"]
                               and source.get("resolvedUrl", source["url"]) == citation["sourceUrl"]), None)
                require(source is not None, "Unregistered source hash or URL")
                if scope is not None:
                    applicable = source.get("applicableBallotRecordIds", [])
                    require(any(row["id"] in applicable and row["status"] == "proclaimed" and row["resultDenominationId"] == cell["candidacyId"] and row["id"].rsplit("-", 1)[0].removeprefix("congress-") == scope for row in registry["records"]), "Missing explicit territorial source applicability")
                elif source.get("applicableBallotRecordIds"):
                    applicable_scopes = {row["id"].rsplit("-", 1)[0].removeprefix("congress-") for row in registry["records"] if row["id"] in source["applicableBallotRecordIds"] and row["status"] == "proclaimed" and row["resultDenominationId"] == cell["candidacyId"]}
                    if not territories[cell["candidacyId"]] <= applicable_scopes:
                        overrides = {item["constituencyId"]: item for item in scoped_cells if item["candidacyId"] == cell["candidacyId"]}
                        require(cell["status"] == "conflicting" and cell["value"] is None
                                and len({item["documentId"] for item in cell["citations"]}) >= 2
                                and applicable_scopes
                                and territories[cell["candidacyId"]] <= set(overrides)
                                and all(overrides[territory]["status"] == "conflicting"
                                        and overrides[territory]["value"] is None
                                        and citation in overrides[territory]["citations"]
                                        for territory in applicable_scopes),
                                "Territorial citation cannot become a default position")
                verify_original(root, source, citation["sourceSha256"])
                extraction = retained_file(root, source.get("extraction", {}).get("file", source.get("textFile")))
                require(digest(extraction.read_bytes()) == citation["extractionSha256"], "Original extraction changed")
                text = extraction.read_text(encoding="utf-8")
                require(text.strip() and "\x00" not in text, "Empty or unsafe authored extraction")
                start, end = citation["start"], citation["end"]
                low, high = citation["contextStart"], citation["contextEnd"]
                require(all(type(offset) is int for offset in [start, end, low, high]) and 0 <= low <= start < end <= high <= len(text), "Invalid authored locator")
                require(text[start:end] == citation["quote"] and digest(text[low:high].encode()) == citation["contextSha256"], "Citation or complete context changed")
                require(citation["pdfPage"] is None or text[:start].count("\f") + 1 == citation["pdfPage"], "Authored page mismatch")
                url = source.get("resolvedUrl", source["url"])
                require(citation["sourceUrl"] == url, "Authored URL mismatch")
                document_id = citation["documentId"]
                public_document_id = document_id if ID.fullmatch(document_id) else "source-" + document_id
                document = {
                    "id": public_document_id, "originalDocumentId": document_id, "candidacyId": cell["candidacyId"], "electionId": election_id,
                    "kind": "historical", "url": url, "sha256": citation["sourceSha256"],
                    "textSha256": citation["extractionSha256"], "text": text,
                    "publishedAt": None, "publishedAtPrecision": "unknown",
                    "retrievedAt": source.get("retrievedAt", source.get("recordedAt"))[:10], "validFrom": inventory["electionDate"],
                    "validUntil": inventory["electionDate"], "extraction": notebook["extraction"],
                }
                if source.get("mediaType", "").split(";", 1)[0].strip() == "text/html":
                    document["mediaType"] = "text/html"
                    section = citation.get("htmlSection")
                    if section is not None:
                        coverage = next((item for item in notebook.get("coverage", []) if item.get("sectionNumber") == section), None)
                        require(type(section) is int and section > 0 and coverage is not None and coverage["start"] <= start < coverage["end"], "Invalid authored HTML section")
                        html_sections[(cell["candidacyId"], question["id"], public_document_id, start, end)] = section
                require(public_document_id not in documents or documents[public_document_id] == document, "Conflicting source versions")
                documents[public_document_id] = document
                citations.append({key: citation[key] for key in ["start", "end", "contextStart", "contextEnd"]} | {"documentId": public_document_id})
            require(cell["status"] != "derived" or citations, "Scored pair has no context")
            if citations:
                mappings = prepared if scope is None else scoped_prepared.setdefault(scope, [])
                mappings.append({key: cell[key] for key in ["candidacyId", "status", "value", "rationale"]} | {"questionId": question["id"], "citations": citations})
            else:
                rationales = unknown_rationales if scope is None else scoped_unknown_rationales.setdefault(scope, [])
                rationales.append((cell["candidacyId"], question["id"], cell["rationale"]))
    topic_names = {
        "housing": "Vivienda", "employment": "Trabajo", "health": "Sanidad",
        "energy": "Energía y medio ambiente", "taxes": "Impuestos", "education": "Educación",
        "transport": "Transporte", "rights": "Derechos", "institutions": "Instituciones",
        "pensions": "Pensiones",
    }
    topic_ids = sorted({question["topicId"] for question in questions})
    require(set(topic_ids) <= set(topic_names), "Unlabelled public topic")
    public_questions = [{key: question[key] for key in ["id", "topicId", "familyId", "text", "help", "level"]} for question in questions]
    bank = {
        "schemaVersion": 1, "engineVersion": "lean-fixed-budgets-v1", "compilerVersion": "authored-quiz-draft-v1",
        "kind": "historical", "asOf": inventory["electionDate"],
        "election": {"id": election_id, "name": "Elecciones generales 2023 · Congreso", "date": inventory["electionDate"],
                     "constituencies": [{"id": scope, "name": name} for scope, name in sorted(scopes.items())]},
        "topics": [{"id": topic, "name": topic_names[topic], "budget": 1} for topic in topic_ids],
        "questions": public_questions,
        "candidacies": [{"id": candidate["id"], "name": candidate["officialName"], "constituencyIds": sorted(territories[candidate["id"]])} for candidate in inventory["candidacies"]],
        "documents": list(documents.values()),
        "positions": {candidate: {question: {"status": "unknown", "value": None, "citations": []} for question in question_ids} for candidate in candidate_ids},
    }
    if starters is not None:
        bank["starterQuestionIds"] = starters
    if policy is not None:
        bank["comparisonPolicy"] = policy
    preparation = {"schemaVersion": 1, "electionId": election_id, "sourceHashes": {key: document["sha256"] for key, document in documents.items()}, "positions": prepared}
    with tempfile.TemporaryDirectory(prefix="authored-quiz-") as directory:
        folder = Path(directory)
        data = json.dumps(preparation, ensure_ascii=False).encode()
        (folder / "positions.json").write_bytes(data)
        manifest = {"preparation": {"schemaVersion": 1, "toolVersion": "direct-authored-quiz-v1", "promptVersion": "manual-source-context-v1", "file": "positions.json", "sha256": digest(data)}}
        bank = attach(bank, manifest, folder, digest, require)
        for scope, candidates in scoped_candidates.items():
            scoped = copy.deepcopy(bank)
            for candidate in candidates:
                scoped["positions"][candidate] = {question: {"status": "unknown", "value": None, "citations": []} for question in question_ids}
            scoped_input = preparation | {"positions": scoped_prepared.get(scope, [])}
            data = json.dumps(scoped_input, ensure_ascii=False).encode()
            filename = "positions-" + scope + ".json"
            (folder / filename).write_bytes(data)
            manifest["preparation"].update(file=filename, sha256=digest(data))
            scoped = attach(scoped, manifest, folder, digest, require)
            for candidate, question, rationale in scoped_unknown_rationales.get(scope, []):
                scoped["positions"][candidate][question]["rationale"] = rationale
            bank.setdefault("constituencyPositions", {})[scope] = {candidate: {question: scoped["positions"][candidate][question] for question in question_ids if question in scoped_questions[scope][candidate]} for candidate in sorted(candidates)}
    for candidate_positions in [bank["positions"], *bank.get("constituencyPositions", {}).values()]:
        for candidate, positions in candidate_positions.items():
            for question, position in positions.items():
                for citation in position["citations"]:
                    key = (candidate, question, citation["documentId"], citation["start"], citation["end"])
                    if key in html_sections:
                        citation["locator"]["section"] = html_sections[key]
    for candidate, question, rationale in unknown_rationales:
        bank["positions"][candidate][question]["rationale"] = rationale
    bank["documents"] = [{key: value for key, value in document.items() if key != "text"} for document in bank["documents"]]
    bank["interpretation"] = "Interpretaciones redactadas a partir de citas de los programas de 2023."
    bank["limitations"] = [
        "Borrador local incompleto: no es una edición lista para publicar.",
        "Las posturas sin interpretación documentada permanecen sin puntuar.",
        "Las citas verificadas no garantizan por sí solas que una interpretación sea correcta.",
    ]
    bank["draft"] = True
    bank["releaseEligible"] = False
    return bank


def write_draft(bank, output):
    data = (json.dumps(bank, ensure_ascii=False, separators=(",", ":")) + "\n").encode()
    sha = digest(data)
    snapshot = output.parent / "snapshots" / (sha + ".json")
    snapshot.parent.mkdir(parents=True, exist_ok=True)
    if snapshot.exists():
        require(snapshot.read_bytes() == data, "Existing draft snapshot changed")
    else:
        with snapshot.open("xb") as stream:
            stream.write(data)
    output.write_bytes(data)
    return {"draftFile": str(output), "snapshotFile": str(snapshot), "sha256": sha,
            "questions": len(bank["questions"]), "topics": len(bank["topics"]),
            "candidacies": len(bank["candidacies"]),
            "constituencies": len(bank["election"]["constituencies"]),
            "publicPointerChanged": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path(".tools/authored-quiz-preview/bank.json"))
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    output = (root / args.output).resolve()
    require(output.is_relative_to(root / ".tools"), "Draft output must stay in the ignored local .tools directory")
    bank = assemble(root)
    print(json.dumps(write_draft(bank, output)))


if __name__ == "__main__":
    main()
