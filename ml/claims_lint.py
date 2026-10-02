#!/usr/bin/env python3
"""
PashuPoshan Claims & Scientific Honesty Linter.
Scans all i18n bundles, templates, UI components, and reports for forbidden claims
per CLAUDE.md Section 0.7.
"""

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
FORBIDDEN_FILE = ROOT_DIR / "ml" / "claims_forbidden.txt"

# Files/folders exempt from scanning (definition of the rules or documentation of forbidden claims)
EXEMPT_PATHS = {
    "ml/claims_forbidden.txt",
    "ml/claims_lint.py",
    "CLAUDE.md",
    "AGENTS.md",
    "FeedShield_Build_Pack.md",
    "docs/KNOWN_GAPS.md",
    ".git",
    "node_modules",
    ".next",
    "out",
    "android",
    "build",
    ".venv",
    "venv",
    "__pycache__"
}

SCAN_EXTENSIONS = {".json", ".ts", ".tsx", ".py", ".md", ".html", ".txt"}


def load_forbidden_phrases():
    if not FORBIDDEN_FILE.exists():
        print(f"Error: Forbidden phrases file missing at {FORBIDDEN_FILE}")
        sys.exit(1)

    phrases = []
    with open(FORBIDDEN_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                phrases.append(line.lower())
    return phrases


def should_scan(path: Path) -> bool:
    rel_str = str(path.relative_to(ROOT_DIR)).replace("\\", "/")
    for exempt in EXEMPT_PATHS:
        if rel_str == exempt or rel_str.startswith(exempt + "/") or f"/{exempt}/" in f"/{rel_str}/":
            return False
    return path.suffix in SCAN_EXTENSIONS


def run_lint():
    forbidden = load_forbidden_phrases()
    print(f"Loaded {len(forbidden)} forbidden claims rules.")

    violations = []
    scanned_count = 0

    import os
    for root, dirs, files in os.walk(ROOT_DIR):
        # Prune exempt directories from recursion
        dirs[:] = [
            d for d in dirs
            if d not in EXEMPT_PATHS and not any(
                str(Path(root, d).relative_to(ROOT_DIR)).replace("\\", "/") == e or
                str(Path(root, d).relative_to(ROOT_DIR)).replace("\\", "/").startswith(e + "/")
                for e in EXEMPT_PATHS
            )
        ]
        for f in files:
            file_path = Path(root) / f
            if should_scan(file_path):
                scanned_count += 1
                try:
                    content = file_path.read_text(encoding="utf-8", errors="ignore").lower()
                    for phrase in forbidden:
                        if phrase in content:
                            rel = file_path.relative_to(ROOT_DIR)
                            violations.append((rel, phrase))
                except Exception as e:
                    print(f"Warning reading {file_path}: {e}")

    print(f"Scanned {scanned_count} files across PashuPoshan workspace.")

    if violations:
        print("\n[FAIL] SCIENTIFIC HONESTY VIOLATION DETECTED!")
        print("The following forbidden marketing or unscientific claims were detected:")
        for rel_path, phrase in violations:
            print(f"  * [{rel_path}] matched forbidden phrase: '{phrase}'")
        print("\nPlease reword these statements to adhere to CLAUDE.md Section 0.7.")
        sys.exit(1)
    else:
        print("[PASS] Claims Lint Passed: All scanned files comply with the PashuPoshan Claims Policy.")
        sys.exit(0)


if __name__ == "__main__":
    run_lint()
