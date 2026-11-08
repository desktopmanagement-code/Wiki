#!/usr/bin/env python3
"""Prüft alle relativen Markdown-Links im Wiki und meldet Seiten ohne eingehende Links.

Aufruf (im Repo-Hauptordner):  python3 tools/linkcheck.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LINK = re.compile(r"\[[^\]]*\]\(([^)\s]+)\)")
SKIP_DIRS = {".git", "raw"}

broken = []
inbound = {}
pages = [p for p in ROOT.rglob("*.md") if not SKIP_DIRS & set(p.relative_to(ROOT).parts)]

for page in pages:
    text = page.read_text(encoding="utf-8")
    # Codeblöcke ignorieren (enthalten Beispiel-Links)
    text = re.sub(r"```.*?```", "", text, flags=re.S)
    text = re.sub(r"`[^`]*`", "", text)
    for target in LINK.findall(text):
        if re.match(r"^[a-z]+:", target) or target.startswith("#"):
            continue
        path = (page.parent / target.split("#")[0]).resolve()
        if not path.exists():
            broken.append(f"{page.relative_to(ROOT)} -> {target}")
        else:
            inbound.setdefault(path, set()).add(page)

orphans = [
    p.relative_to(ROOT)
    for p in pages
    if p.relative_to(ROOT).parts[0] == "wiki"
    and not (inbound.get(p.resolve(), set()) - {p})
]

print(f"Geprüfte Seiten: {len(pages)}")
print("Defekte Links:" if broken else "Defekte Links: keine")
for b in broken:
    print("  -", b)
print("Wiki-Seiten ohne eingehende Links:" if orphans else "Verwaiste Wiki-Seiten: keine")
for o in orphans:
    print("  -", o)
sys.exit(1 if broken else 0)
