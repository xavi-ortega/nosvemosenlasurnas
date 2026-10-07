#!/usr/bin/env python3
"""Install only the checksum-pinned CI tools declared in ci-tools.lock.json."""
import argparse
import hashlib
import io
import json
import platform
from pathlib import Path
import tarfile
import urllib.request

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--tool", choices=["gitleaks", "actionlint"], action="append")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    lock = json.loads((root / "ci-tools.lock.json").read_text())
    machine = {"aarch64": "arm64", "arm64": "arm64", "x86_64": "x64", "AMD64": "x64"}.get(platform.machine())
    key = platform.system().lower() + "-" + str(machine)
    destination = root / ".tools" / "bin"
    destination.mkdir(parents=True, exist_ok=True)
    for name in args.tool or list(lock["tools"]):
        asset = lock["tools"][name]["assets"].get(key)
        if asset is None:
            raise SystemExit("Unsupported tool platform: " + key)
        request = urllib.request.Request(asset["url"], headers={"User-Agent": "nosvemosenlasurnas-ci"})
        with urllib.request.urlopen(request, timeout=60) as response:
            data = response.read()
        if hashlib.sha256(data).hexdigest() != asset["sha256"]:
            raise SystemExit("Tool checksum mismatch: " + name)
        with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
            member = next(member for member in archive.getmembers() if member.name == name and member.isfile())
            source = archive.extractfile(member)
            if source is None:
                raise SystemExit("Missing tool binary: " + name)
            target = destination / name
            target.write_bytes(source.read())
            target.chmod(0o755)
        print("Verified and installed " + name + " " + lock["tools"][name]["version"])

if __name__ == "__main__":
    main()
