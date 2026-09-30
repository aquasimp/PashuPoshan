#!/usr/bin/env python3
"""
FeedShield Brand & Canonical Identity Linter (Section 13)
Verifies that all user-facing code, locales, and components use the canonical
product name "FeedShield" and not legacy "PashuPoshan", with an explicit allowlist
for backward-compatible database migrations and storage aliases.
"""

import os
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent

# Files permitted to contain legacy references for storage/migration compatibility
ALLOWLIST_FILES = {
    "apps/web/lib/db.ts",
    "apps/web/lib/theme.tsx",
    "apps/web/lib/i18n.tsx",
    "CLAUDE.md",
    "AGENTS.md",
    "FeedShield_Build_Pack.md",
    "FeedShield_Polish_Pass_v2.md",
    "docs/POLISH_BASELINE.md",
    "scripts/brand_lint.py",
    "scripts/i18n_audit.py",
    "Makefile",
}

SCAN_DIRS = [
    ROOT / "apps" / "web" / "app",
    ROOT / "apps" / "web" / "components",
    ROOT / "apps" / "web" / "locales",
    ROOT / "apps" / "api" / "app",
]

def main():
    violations = []
    scanned_count = 0

    for scan_dir in SCAN_DIRS:
        if not scan_dir.exists():
            continue
        for root, _, files in os.walk(scan_dir):
            for file in files:
                if not file.endswith((".tsx", ".ts", ".jsx", ".js", ".json", ".py", ".html", ".css")):
                    continue
                file_path = Path(root) / file
                rel_path = file_path.relative_to(ROOT).as_posix()

                if rel_path in ALLOWLIST_FILES:
                    continue

                scanned_count += 1
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        for line_no, line in enumerate(f, start=1):
                            if "PashuPoshan" in line:
                                violations.append((rel_path, line_no, line.strip()))
                except Exception as e:
                    print(f"Error reading {rel_path}: {e}")

    print(f"Brand lint: scanned {scanned_count} user-facing files.")
    if violations:
        print(f"[FAIL] Found {len(violations)} brand violations (PashuPoshan in user-facing code):")
        for f, l, content in violations:
            print(f"  - {f}:{l} -> {content}")
        return 1
    else:
        print("[PASS] Brand lint passed: All user-facing files strictly use canonical FeedShield identity.")
        return 0

if __name__ == "__main__":
    sys.exit(main())
