# FeedShield — PPT Metrics Master Sheet
*(SIH 2026 · Problem Statement SIH26111)*

> **Critical Presentation Rule:**  
> «ML performance metrics are intentionally left pending where model training/validation is still in progress. No performance number is to be fabricated for the SIH submission.»

---

## 1. MUST HAVE NOW (Verified & Safe to Present)

| Metric | Unit | Recommended Slide | Recommended Slide Text / Bullet | Source File | Status |
|---|---|---|---|---|---|
| **3 Taps** | Taps | Slide 4: Farmer Experience | "1-Tap 'Start New Test' → Choose Category → Shutter Capture. Zero clutter." | `apps/web/app/page.tsx` | VERIFIED |
| **25 / 25 Cases** | Ratio / % | Slide 6: Silage Engine & Parity | "100% mathematical parity across Python and TypeScript over 25 golden test cases." | `ml/tests/golden/silage_cases.json` | VERIFIED |
| **27 Rules** | Count | Slide 6: Agronomic Rules | "27 peer-reviewed rules derived from Kung et al. (2018) & McDonald et al. (1991)." | `silage_rules.yaml` | VERIFIED |
| **115 Files · 0 Violations** | Count | Slide 7: Scientific Honesty | "Automated CI claims linter blocks fake AI claims. No false RGB protein claims." | `ml/claims_lint.py` | VERIFIED |
| **45 / 45 Tests** | Count | Slide 8: System Verification | "45 backend & ML pytest tests passing with full test coverage." | `apps/api/tests/` | VERIFIED |
| **33 / 33 Tests** | Count | Slide 8: Frontend Verification | "33 Vitest tests passing across offline IndexedDB and parity suites." | `apps/web/test/` | VERIFIED |
| **17 Routes** | Count | Slide 8: Production Build | "17 static production routes compiled and optimized in Next.js 14 App Router." | Next.js Build Trace | VERIFIED |
| **3 Languages** | Languages | Slide 4: Farmer Inclusivity | "English, हिन्दी (Hindi), and Hinglish with Web Speech API audio narration." | `apps/web/locales/` | VERIFIED |
| **HMAC-SHA256** | Standard | Slide 9: Traceability & QR | "Every sample signed with cryptographic HMAC-SHA256 token." | `apps/api/app/services/traceability_service.py` | VERIFIED |
| **1,200 Spectra (401 bands)** | Count | Slide 5: Spectroscopy Pipeline | "Physics-based NIR simulation covering 920–1680 nm (water & protein overtone bands)." | `ml/synthetic/generator.py` | DEMO-ONLY |
| **$R^2 = 0.950$ (Synthetic)** | Coefficient | Slide 5: Chemometrics Baseline | "PLSR chemometrics baseline on 1,200 synthetic calibration spectra." | `ml/metrics/model_registry_summary.json` | DEMO-ONLY |
| **RPD = 4.45 (Synthetic)** | Ratio | Slide 5: Chemometrics Baseline | "Excellent screening capability on synthetic absorption spectra." | `ml/metrics/model_registry_summary.json` | DEMO-ONLY |
| **$\ge 10.0^\circ\text{C}$ $\Delta T$** | °C | Slide 6: Bunker Aerobic Heating | "Critical alert threshold for aerobic yeast proliferation in bunker shoulders." | `silage_rules.yaml` | VERIFIED |
| **$\ge 1.5^\circ\text{C}$ / day** | °C/day | Slide 6: Pit Telemetry Alerts | "Heating rate warning threshold detecting rapid secondary fermentation." | `silage_rules.yaml` | VERIFIED |
| **48px × 48px** | Pixels | Slide 4: Farmer Accessibility | "Adheres to mobile touch ergonomics for rural field workers." | `tailwind.config.ts` | VERIFIED |

---

## 2. MUST HAVE BEFORE FINAL SUBMISSION (Real Field Validation In Progress)

| Metric | Unit | Recommended Slide | Recommended Wording / Placeholder | Insertion Location | Status |
|---|---|---|---|---|---|
| **Field NIR Moisture RMSEP** | % DM | Slide 5: Field Model Card | `PENDING — MODEL BUILD / VALIDATION IN PROGRESS` | `ml/metrics/field_moisture_metrics.json` | PENDING |
| **Field NIR Crude Protein RMSEP** | % DM | Slide 5: Field Model Card | `PENDING — MODEL BUILD / VALIDATION IN PROGRESS` | `ml/metrics/field_crude_protein_metrics.json` | PENDING |
| **Field Applicability Coverage** | % | Slide 5: Reliability | `PENDING — MODEL BUILD / VALIDATION IN PROGRESS` | `docs/model_cards/` | PENDING |
| **Urea Assay False Negative Rate** | % | Slide 7: Safety Screening | `PENDING — MODEL BUILD / VALIDATION IN PROGRESS` | `ml/metrics/assay_metrics.json` | PENDING |
| **Field Real-World Sample Count** | Samples | Slide 10: Indian Dataset | `1,200 Synthetic Initial / 10,000 Target` | `docs/DATA_SOURCES.md` | PENDING FIELD RUN |
| **External Lab Repeatability** | % CV | Slide 10: Validation Plan | `PENDING — MODEL BUILD / VALIDATION IN PROGRESS` | `docs/VALIDATION_PLAN.md` | PENDING |

---

## 3. OPTIONAL (High Impact if Available)

| Metric | Unit | Recommended Slide | Context & Rationale | Source File | Status |
|---|---|---|---|---|---|
| **API Latency (p95)** | ms | Slide 8: Technical Specs | "84 ms average analysis time on local cluster." | `apps/api/tests/` | MEASURED (DEV) |
| **QR Verification Latency** | ms | Slide 9: Buyer Verification | "35 ms instant public certificate verification." | `apps/api/tests/` | MEASURED (DEV) |
| **Estimated Node Cost** | INR (₹) | Slide 11: Deployment Model | "₹1,04,500 – ₹1,85,000 per shared cooperative testing node." | `docs/HARDWARE.md` | ESTIMATED TARGET |
| **Farmer Handheld Kit Cost** | INR (₹) | Slide 11: Deployment Model | "₹2,200 – ₹3,800 for core probe and reference card accessory." | `docs/HARDWARE.md` | ESTIMATED TARGET |
| **Avoided Silage Loss** | % | Slide 12: National Impact | "Projected: 15–20% reduction in aerobic bunker spoilage." | `docs/DEMO_SCRIPT.md` | PROJECTED GOAL |
| **Lighthouse Mobile Score** | Score / 100 | Slide 8: PWA Engineering | `PENDING — FINAL AUDIT RUN REQUIRED` | `e2e/` | PENDING |
