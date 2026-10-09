"""Optional offline native-text PDF adapter; never executes document instructions."""
import resource
import sys
from pathlib import Path

if sys.platform != "darwin":
    resource.setrlimit(resource.RLIMIT_AS, (256 * 1024 * 1024, 256 * 1024 * 1024))
resource.setrlimit(resource.RLIMIT_CPU, (55, 55))
from pypdf import PdfReader  # noqa: E402

path = Path(sys.argv[1])
if path.stat().st_size > 20 * 1024 * 1024:
    raise SystemExit("PDF byte limit exceeded")
reader = PdfReader(path, strict=True)
if reader.is_encrypted or len(reader.pages) > 500:
    raise SystemExit("Encrypted PDF or page limit exceeded")
parts = []
size = 0
for page in reader.pages:
    text = (page.extract_text(extraction_mode="layout") or "") if "/Contents" in page else ""
    size += len(text.encode())
    if size > 20 * 1024 * 1024:
        raise SystemExit("PDF text limit exceeded")
    parts.append(text)
sys.stdout.write("\f".join(parts))
