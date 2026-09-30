#!/usr/bin/env python3
"""
Compiles apps/api/app/rules/silage_rules.yaml into apps/web/lib/rules/silage_rules.json
Guarantees single source of truth between Python backend and TypeScript PWA client.
"""

import os
import json
import yaml
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
YAML_PATH = ROOT / "apps" / "api" / "app" / "rules" / "silage_rules.yaml"
OUTPUT_DIR = ROOT / "apps" / "web" / "lib" / "rules"
JSON_PATH = OUTPUT_DIR / "silage_rules.json"


def compile_rules():
    if not YAML_PATH.exists():
        raise FileNotFoundError(f"YAML rules missing at: {YAML_PATH}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with open(YAML_PATH, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"[INFO] Silage rules compiled successfully from YAML -> JSON.")
    print(f"       Target: {JSON_PATH}")


if __name__ == "__main__":
    compile_rules()
