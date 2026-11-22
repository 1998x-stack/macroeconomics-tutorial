#!/usr/bin/env python3
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET
import json, re, sys

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
errors = []

class HTMLAudit(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs, self.images, self.h1 = [], [], 0
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        self.h1 += tag == "h1"
        if tag == "img":
            self.images.append(d)
        for key in ("href", "src"):
            if d.get(key):
                self.refs.append(d[key])

def check_mathml(path, source):
    blocks = re.findall(r"<math\\b[\\s\\S]*?</math>", source, flags=re.I)
    if 21 <= int(path.stem) <= 25 and not blocks:
        errors.append(f"{path}: missing MathML equations")
    for index, block in enumerate(blocks, 1):
        try:
            root = ET.fromstring(block)
        except ET.ParseError as exc:
            errors.append(f"{path}: malformed MathML #{index}: {exc}")
            continue
        if root.tag.split("}")[-1] != "math":
            errors.append(f"{path}: MathML #{index} has wrong root")
        for node in root.iter():
            tag = node.tag.split("}")[-1]
            children = list(node)
            expected = {"mfrac": 2, "msub": 2, "msup": 2, "mover": 2, "munder": 2, "munderover": 3}
            if tag in expected and len(children) != expected[tag]:
                errors.append(f"{path}: MathML #{index} {tag} expects {expected[tag]} children")
            if tag in ("mi", "mn", "mo") and not (node.text or "").strip():
                errors.append(f"{path}: MathML #{index} has empty {tag}")
            if tag in ("mi", "mn") and node.text and "\\\\" in node.text:
                errors.append(f"{path}: MathML #{index} contains raw TeX in {tag}")

for path in [DOCS / "index.html"] + [DOCS / "chapters" / f"{n:02d}.html" for n in range(1, 29)]:
    if not path.exists():
        errors.append("missing " + str(path))
        continue
    source = path.read_text(encoding="utf-8")
    audit = HTMLAudit()
    audit.feed(source)
    if path == DOCS / "index.html" or (path.parent.name == "chapters" and int(path.stem) <= 25):
        if audit.h1 != 1:
            errors.append(f"{path}: expected one H1, found {audit.h1}")
    for image in audit.images:
        if not image.get("alt"):
            errors.append(f"{path}: img missing alt")
    for link in audit.refs:
        url = urlsplit(link)
        if url.scheme or link.startswith(("#", "//", "mailto:", "javascript:")):
            continue
        target = (path.parent / url.path).resolve() if url.path else path.resolve()
        if not target.is_relative_to(DOCS.resolve()) or not target.exists():
            errors.append(f"{path}: bad local link {link}")
    if path.parent.name == "chapters":
        check_mathml(path, source)

for n in range(1, 29):
    if not (DOCS / f"{n:02d}.html").exists():
        errors.append(f"missing legacy alias {n:02d}.html")

for svg in (DOCS / "assets" / "svg").glob("*.svg"):
    try:
        root = ET.parse(svg).getroot()
        tags = {node.tag.split("}")[-1] for node in root}
        if "viewBox" not in root.attrib or not {"title", "desc"}.issubset(tags):
            errors.append(f"bad SVG accessibility {svg}")
    except ET.ParseError as exc:
        errors.append(f"bad XML {svg}: {exc}")

for n in range(1, 26):
    ledger = DOCS / "chapters" / "evidence" / f"{n:02d}.json"
    if not ledger.exists():
        errors.append("missing evidence " + str(ledger))
        continue
    data = json.loads(ledger.read_text(encoding="utf-8"))
    for item in data.get("claims", []):
        required = ("id", "claim", "kind", "source_url", "locator", "status", "notes")
        if not all(key in item for key in required):
            errors.append(f"invalid ledger {ledger}")
    if not data.get("claims"):
        errors.append("empty evidence " + str(ledger))

for required in (
    DOCS / "assets" / "js" / "econ-labs-growth.js",
    DOCS / "assets" / "code" / "rbc_baseline.mod",
    ROOT / "scripts" / "verify_rbc_baseline.py",
):
    if not required.exists():
        errors.append("missing required teaching asset " + str(required))

if errors:
    print("\\n".join(errors))
    sys.exit(1)
print("Validated: 28 chapters, 28 legacy aliases, MathML, SVG accessibility, 25 evidence ledgers and teaching assets")
