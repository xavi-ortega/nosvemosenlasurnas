#!/usr/bin/env python3
"""Compile owner manifests offline into immutable, inspectable public evidence banks."""
import argparse
from datetime import date
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import time

LIMIT = 20 * 1024 * 1024
ID = re.compile(r"[a-z][a-z0-9_-]{0,63}\Z")


def digest(data):
    return hashlib.sha256(data).hexdigest()


def require(condition, message):
    if not condition:
        raise ValueError(message)


class SafeText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.blocked = 0

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style", "iframe", "object", "template"}:
            self.blocked += 1
        if not self.blocked and tag in {"p", "div", "br", "li", "h1", "h2", "h3"}:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in {"script", "style", "iframe", "object", "template"} and self.blocked:
            self.blocked -= 1
        if not self.blocked and tag in {"p", "div", "li"}:
            self.parts.append("\n")

    def handle_data(self, data):
        if not self.blocked:
            self.parts.append(data)


def extract(path, pdf_python=None):
    data = path.read_bytes()
    require(0 < len(data) <= LIMIT, "Source byte limit exceeded or empty input")
    if path.suffix.lower() == ".pdf":
        worker = Path(__file__).with_name("extract_pdf.py")
        with tempfile.TemporaryDirectory(prefix="programme-extraction-") as directory:
            output = Path(directory) / "text.txt"
            errors = Path(directory) / "errors.txt"
            started = time.monotonic()
            with output.open("wb") as stream, errors.open("wb") as diagnostics:
                process = subprocess.Popen([pdf_python or sys.executable, str(worker), str(path)], stdout=stream, stderr=diagnostics)
                try:
                    while process.poll() is None:
                        if time.monotonic() - started > 60 or output.stat().st_size > LIMIT or errors.stat().st_size > LIMIT:
                            raise ValueError("PDF time/output budget exceeded")
                        measured = subprocess.run(["ps", "-o", "rss=", "-p", str(process.pid)], capture_output=True, text=True)
                        if measured.stdout.strip() and int(measured.stdout.strip()) > 256 * 1024:
                            raise ValueError("PDF resident-memory budget exceeded")
                        time.sleep(0.05)
                finally:
                    if process.poll() is None:
                        process.kill()
                    process.wait(timeout=5)
            require(process.returncode == 0, "PDF parser unavailable or input rejected")
            require(output.stat().st_size <= LIMIT, "Extracted text limit exceeded")
            text = output.read_text(encoding="utf-8", errors="strict")
    else:
        text = data.decode("utf-8", errors="strict")
        if path.suffix.lower() in {".html", ".htm"}:
            parser = SafeText()
            parser.feed(text)
            text = "".join(parser.parts)
        else:
            require(path.suffix.lower() == ".txt", "Unsupported source format")
    require(text.strip() and "\x00" not in text and len(text.encode()) <= LIMIT, "Empty or unsafe extraction")
    return data, text.replace("\r\n", "\n").replace("\r", "\n")


def compile_manifest(path, pdf_python=None):
    manifest = json.loads(path.read_text())
    require(manifest["schemaVersion"] == 1, "Unsupported manifest version")
    kind = manifest["kind"]
    require(kind in {"synthetic", "historical", "current"}, "Invalid evidence kind")
    as_of = date.fromisoformat(manifest["asOf"])
    election = manifest["election"]
    require(ID.fullmatch(election["id"]), "Invalid election ID")
    require(date.fromisoformat(election["date"]), "Invalid election date")
    parties = manifest["candidacies"]
    questions = manifest["questions"]
    topics = manifest["topics"]
    require(set(election) == {"id", "name", "date", "constituencies"}, "Unknown election fields")
    for rows, keys in [(parties, {"id", "name", "constituencyIds"}), (questions, {"id", "topicId", "familyId", "text", "level"}), (topics, {"id", "name", "budget"})]:
        require(all(set(row) == keys for row in rows), "Unknown public fields")
        ids = [r["id"] for r in rows]
        require(ids and len(ids) == len(set(ids)) and all(ID.fullmatch(i) for i in ids), "Invalid or duplicate IDs")
    scopes = {c["id"] for c in election["constituencies"]}
    require(all(set(c) == {"id", "name"} and ID.fullmatch(c["id"]) for c in election["constituencies"]) and len(scopes) == len(election["constituencies"]), "Invalid constituencies")
    require(all(p["constituencyIds"] and set(p["constituencyIds"]) <= scopes for p in parties), "Invalid territorial candidacy")
    topic_ids = {t["id"] for t in topics}
    require(all(isinstance(t["budget"], (int, float)) and 0 < t["budget"] <= 100 for t in topics), "Invalid topic budgets")
    for q in questions:
        require(q["topicId"] in topic_ids and ID.fullmatch(q["familyId"]) and q["level"] in {"general", "specific"}, "Invalid question contract")
        require(q["text"].strip() and len(q["text"]) <= 400, "Invalid question wording")
    families = {}
    for q in questions:
        require(q["familyId"] not in families or families[q["familyId"]] == q["topicId"], "Family crosses topics")
        families[q["familyId"]] = q["topicId"]
    positions = {p["id"]: {q["id"]: {"status": "unknown", "value": None, "citations": []} for q in questions} for p in parties}
    documents = []
    source_ids = set()
    for source in manifest["sources"]:
        require(source["id"] not in source_ids and ID.fullmatch(source["id"]), "Invalid or duplicate source ID")
        source_ids.add(source["id"])
        require(source["candidacyId"] in positions and source["electionId"] == election["id"], "Source applicability mismatch")
        require(source["kind"] == kind and source["publicExcerptAllowed"] is True, "Source kind or excerpt permission mismatch")
        require(re.fullmatch(r"https://[^\s<>]+", source["url"]), "Invalid original URL")
        require(date.fromisoformat(source["publishedAt"]) <= as_of and date.fromisoformat(source["retrievedAt"]) <= date.today(), "Future source provenance")
        require(date.fromisoformat(source["validFrom"]) <= as_of <= date.fromisoformat(source["validUntil"]), "Source is not applicable at release date")
        local = (path.parent / source["file"]).resolve()
        require(local.is_relative_to(path.parent.resolve()), "Source path escapes manifest directory")
        data, text = extract(local, pdf_python)
        require(digest(data) == source["sha256"], "Source hash mismatch")
        document = {k: source[k] for k in ["id", "candidacyId", "electionId", "kind", "url", "sha256", "publishedAt", "retrievedAt", "validFrom", "validUntil"]}
        document.update(text=text, textSha256=digest(text.encode()), extraction="native_text_v1")
        documents.append(document)
        offset = 0
        for line in text.splitlines(keepends=True):
            sentence = line.strip()
            for q in questions:
                values = {"Apoyamos: " + q["text"]: 2, "Rechazamos: " + q["text"]: -2}
                if sentence not in values:
                    continue
                quote_start = offset + line.index(sentence)
                context_start = text.rfind("\n\n", 0, quote_start) + 2
                context_end = text.find("\n\n", quote_start + len(sentence))
                context = text[context_start:context_end if context_end >= 0 else len(text)].strip()
                if context != sentence:
                    continue
                citation = {"documentId": source["id"], "start": quote_start, "end": quote_start + len(sentence), "quote": sentence, "context": line.rstrip("\n"), "locator": {"page": text[:quote_start].count("\f") + 1, "line": text[:quote_start].count("\n") + 1}}
                require(text[citation["start"]:citation["end"]] == citation["quote"], "Citation mismatch")
                position = positions[source["candidacyId"]][q["id"]]
                value = values[sentence]
                if position["status"] == "conflicting" or (position["value"] is not None and position["value"] != value):
                    position.update(status="conflicting", value=None)
                else:
                    position.update(status="derived", value=value)
                position["citations"].append(citation)
            offset += len(line)
    return {"schemaVersion": 1, "engineVersion": "lean-fixed-budgets-v1", "compilerVersion": "literal-policy-rule-v1", "kind": kind, "asOf": manifest["asOf"], "election": election, "topics": topics, "questions": questions, "candidacies": parties, "documents": documents, "positions": positions, "interpretation": "derived_literal_rules", "limitations": ["Literal mappings are derived interpretations; source-exact matching does not certify semantics.", "Unsupported wording, numbers, conditions and ambiguous claims remain unknown."]}


def publish(bank, directory, reason):
    require(reason.strip(), "A release/correction reason is required")
    directory.mkdir(parents=True, exist_ok=True)
    public = {**bank, "documents": [{k: v for k, v in d.items() if k != "text"} for d in bank["documents"]]}
    data = json.dumps(public, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    require(len(data) <= 5 * 1024 * 1024, "Public bank limit exceeded")
    sha = digest(data)
    target = directory / (sha + ".json")
    if target.exists():
        require(target.read_bytes() == data, "Immutable release collision")
    else:
        target.write_bytes(data)
    pointer = directory / "current.json"
    previous = json.loads(pointer.read_text()) if pointer.exists() else {"history": [], "withdrawn": []}
    if previous.get("sha256") == sha:
        return sha
    history = previous["history"] + [{"sha256": sha, "previous": previous.get("sha256"), "reason": reason}]
    current = {"sha256": sha, "kind": bank["kind"], "withdrawn": previous["withdrawn"], "history": history}
    temporary = directory / "current.json.tmp"
    temporary.write_text(json.dumps(current, indent=2) + "\n")
    temporary.replace(pointer)
    return sha


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--output", type=Path, default=Path("resources/evidence"))
    parser.add_argument("--reason", default="")
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--pdf-python")
    args = parser.parse_args()
    bank = compile_manifest(args.manifest, args.pdf_python)
    if args.check:
        public = {**bank, "documents": [{k: v for k, v in d.items() if k != "text"} for d in bank["documents"]]}
        expected = digest(json.dumps(public, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())
        state = json.loads((args.output / "current.json").read_text())
        require(state["sha256"] == expected, "Prepared fixture differs from current bank")
        require(digest((args.output / (expected + ".json")).read_bytes()) == expected, "Immutable bank corrupted")
        print("Evidence reproducibility and hash checks passed")
    else:
        print(publish(bank, args.output, args.reason))


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, OSError, subprocess.SubprocessError) as error:
        raise SystemExit("Source preparation failed: " + str(error)) from error
