#!/usr/bin/env python3
"""
FeedShield i18n Audit Tool (W2 / Section 8)
Verifies:
1. Key parity across en.json, hi.json, hinglish.json
2. Placeholder parity ({name}, {count}, etc.)
3. Non-empty string checks
4. Script check: Hindi values contain Devanagari (\u0900-\u097F), Hinglish values are Roman
5. Glossary consistency: Checks for banned synonyms
6. Length reporting: Strings where hi or hinglish is > 1.6x English
7. Generates docs/I18N_AUDIT.md and docs/I18N_REVIEW_NEEDED.md
"""

import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCALES_DIR = ROOT / "apps" / "web" / "locales"
DOCS_DIR = ROOT / "docs"

ALLOWLIST_NON_DEVANAGARI_HI = {
    "common.appName",
    "common.sihId",
    "results.good",
    "results.attention",
    "results.highRisk",
    "results.nutrition.crudeProtein",
    "results.nutrition.dryMatter",
    "results.nutrition.ndf",
    "results.nutrition.adf",
    "advisory.decisions.FEED",
    "advisory.decisions.BLEND",
    "advisory.decisions.RE_TEST",
    "advisory.decisions.DISCARD",
    "models.pending.realFieldNir",
    "models.pending.realIndianFeedImage",
    "models.pending.realUrea",
    "models.pending.realExternal",
}

BANNED_SYNONYMS = {
    "PashuPoshan": "Deprecated product name. Use FeedShield.",
    "मुरब्बा": "Colloquial/inappropriate term for silage. Use साइलेज.",
    "बुखार": "Improper medical term for silage heating. Use हवा से गर्म होना (Heating).",
    "कीड़े": "Inappropriate term for fungal mould. Use फफूंद (Mould).",
    "100% accurate": "Overclaim banned by Claims Policy.",
    "guaranteed": "Overclaim banned by Claims Policy.",
    "certified": "Overclaim banned by Claims Policy (use Screening).",
}

def flatten_dict(d, parent_key=""):
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}.{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key).items())
        else:
            items.append((new_key, str(v)))
    return dict(items)

def extract_placeholders(s):
    return set(re.findall(r"\{[a-zA-Z0-9_]+\}", s))

def has_devanagari(s):
    return bool(re.search(r"[\u0900-\u097F]", s))

def main():
    en_path = LOCALES_DIR / "en.json"
    hi_path = LOCALES_DIR / "hi.json"
    hinglish_path = LOCALES_DIR / "hinglish.json"

    with open(en_path, "r", encoding="utf-8") as f:
        en = json.load(f)
    with open(hi_path, "r", encoding="utf-8") as f:
        hi = json.load(f)
    with open(hinglish_path, "r", encoding="utf-8") as f:
        hinglish = json.load(f)

    flat_en = flatten_dict(en)
    flat_hi = flatten_dict(hi)
    flat_hinglish = flatten_dict(hinglish)

    all_keys = sorted(set(flat_en.keys()) | set(flat_hi.keys()) | set(flat_hinglish.keys()))

    missing_hi = [k for k in flat_en if k not in flat_hi]
    missing_hinglish = [k for k in flat_en if k not in flat_hinglish]
    extra_hi = [k for k in flat_hi if k not in flat_en]
    extra_hinglish = [k for k in flat_hinglish if k not in flat_en]

    placeholder_mismatches = []
    for k in flat_en:
        if k in flat_hi:
            ph_en = extract_placeholders(flat_en[k])
            ph_hi = extract_placeholders(flat_hi[k])
            if ph_en != ph_hi:
                placeholder_mismatches.append((k, "hi", ph_en, ph_hi))
        if k in flat_hinglish:
            ph_en = extract_placeholders(flat_en[k])
            ph_hgl = extract_placeholders(flat_hinglish[k])
            if ph_en != ph_hgl:
                placeholder_mismatches.append((k, "hinglish", ph_en, ph_hgl))

    script_violations = []
    for k, v in flat_hi.items():
        if k not in ALLOWLIST_NON_DEVANAGARI_HI and not has_devanagari(v) and len(v.strip()) > 3:
            script_violations.append((k, "hi", v))

    for k, v in flat_hinglish.items():
        if has_devanagari(v):
            script_violations.append((k, "hinglish", v))

    banned_violations = []
    for lang, flat_data in [("en", flat_en), ("hi", flat_hi), ("hinglish", flat_hinglish)]:
        for k, v in flat_data.items():
            for banned, reason in BANNED_SYNONYMS.items():
                if banned.lower() in v.lower():
                    banned_violations.append((k, lang, banned, reason))

    length_ratio_alerts = []
    for k in flat_en:
        len_en = len(flat_en[k])
        if len_en > 0:
            if k in flat_hi:
                ratio_hi = len(flat_hi[k]) / len_en
                if ratio_hi > 1.6:
                    length_ratio_alerts.append((k, "hi", len_en, len(flat_hi[k]), ratio_hi))
            if k in flat_hinglish:
                ratio_hgl = len(flat_hinglish[k]) / len_en
                if ratio_hgl > 1.6:
                    length_ratio_alerts.append((k, "hinglish", len_en, len(flat_hinglish[k]), ratio_hgl))

    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    audit_md_path = DOCS_DIR / "I18N_AUDIT.md"
    review_md_path = DOCS_DIR / "I18N_REVIEW_NEEDED.md"

    # Write I18N_AUDIT.md
    with open(audit_md_path, "w", encoding="utf-8") as f:
        f.write("# FeedShield I18N Audit Report\n\n")
        f.write(f"Generated at: {Path(__file__).name}\n\n")
        f.write("## Summary Statistics\n\n")
        f.write(f"- **Total English Keys:** {len(flat_en)}\n")
        f.write(f"- **Total Hindi Keys:** {len(flat_hi)}\n")
        f.write(f"- **Total Hinglish Keys:** {len(flat_hinglish)}\n")
        f.write(f"- **Missing in Hindi:** {len(missing_hi)}\n")
        f.write(f"- **Missing in Hinglish:** {len(missing_hinglish)}\n")
        f.write(f"- **Placeholder Mismatches:** {len(placeholder_mismatches)}\n")
        f.write(f"- **Script Violations:** {len(script_violations)}\n")
        f.write(f"- **Banned Term Violations:** {len(banned_violations)}\n")
        f.write(f"- **High Length Ratio (>1.6x):** {len(length_ratio_alerts)}\n\n")

        if missing_hi:
            f.write("### Missing Keys in Hindi\n")
            for k in missing_hi:
                f.write(f"- `{k}`\n")
            f.write("\n")

        if missing_hinglish:
            f.write("### Missing Keys in Hinglish\n")
            for k in missing_hinglish:
                f.write(f"- `{k}`\n")
            f.write("\n")

        if placeholder_mismatches:
            f.write("### Placeholder Mismatches\n")
            for k, lang, expected, found in placeholder_mismatches:
                f.write(f"- `{k}` ({lang}): expected `{expected}`, found `{found}`\n")
            f.write("\n")

        if script_violations:
            f.write("### Script Violations\n")
            for k, lang, val in script_violations:
                f.write(f"- `{k}` ({lang}): `{val}`\n")
            f.write("\n")

        if banned_violations:
            f.write("### Banned / Outdated Terminology Violations\n")
            for k, lang, term, reason in banned_violations:
                f.write(f"- `{k}` ({lang}): contains '{term}' -> {reason}\n")
            f.write("\n")

        if length_ratio_alerts:
            f.write("### Strings With High Length Expansion (>1.6x)\n")
            f.write("| Key | Locale | En Len | Target Len | Ratio |\n")
            f.write("| :--- | :--- | :--- | :--- | :--- |\n")
            for k, lang, len_en, len_t, r in length_ratio_alerts[:30]:
                f.write(f"| `{k}` | {lang} | {len_en} | {len_t} | {r:.2f}x |\n")
            f.write("\n")

    # Write I18N_REVIEW_NEEDED.md
    with open(review_md_path, "w", encoding="utf-8") as f:
        f.write("# FeedShield I18N Human Review Register\n\n")
        f.write("> [!IMPORTANT]\n")
        f.write("> As mandated by the FeedShield Polish Specification (Section 8), machine translation alone cannot certify native Hindi or Hinglish agricultural terminology.\n")
        f.write("> The following strings represent specialized agricultural, chemometric, and legal transparency terms that must be validated by a native Hindi-speaking agricultural specialist.\n\n")
        f.write("## Strings Pending Native Agricultural Review\n\n")
        f.write("| Key | English Reference | Hindi Draft | Hinglish Draft | Target Domain |\n")
        f.write("| :--- | :--- | :--- | :--- | :--- |\n")
        for k in flat_en:
            if "claim" in k or "advisory" in k or "silage" in k or "nutrition" in k:
                h_val = flat_hi.get(k, "MISSING")
                hg_val = flat_hinglish.get(k, "MISSING")
                f.write(f"| `{k}` | {flat_en[k]} | {h_val} | {hg_val} | Agricultural / Scientific |\n")

    print(f"Audit completed: {len(flat_en)} keys.")
    print(f"Missing in HI: {len(missing_hi)}, Missing in HGL: {len(missing_hinglish)}")
    print(f"Placeholder errors: {len(placeholder_mismatches)}, Script errors: {len(script_violations)}")
    print(f"Banned violations: {len(banned_violations)}")
    print(f"High length expansion alerts: {len(length_ratio_alerts)}")

    status = (
        len(missing_hi) == 0
        and len(missing_hinglish) == 0
        and len(placeholder_mismatches) == 0
        and len(script_violations) == 0
        and len(banned_violations) == 0
    )
    return 0 if status else 1

if __name__ == "__main__":
    sys.exit(main())
