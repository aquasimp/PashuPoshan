# PashuPoshan — Engineering Build Plan & Phase Roadmap

**Timeline Budget:** 14-day schedule  
**Execution Paradigm:** Vertical-slice-first, honesty-first, demo-complete.

---

## 1. Phase Mapping & Milestones

| Phase | Milestone | Focus Areas | Target Duration |
|---|---|---|---|
| **Phase A** | Research & Architecture | Data audit, schemas, API contracts, screen inventory, hardware abstractions, validation plans. | Days 1–2 |
| **Phase B** | Foundations & Monorepo | Next.js PWA, FastAPI, SQLAlchemy 2 models, Alembic migrations, RBAC auth, design system route, i18n bundles (en/hi/hinglish), Dexie DB, test scaffolds. | Days 3–4 |
| **Phase C** | Scientific & ML Engines | Synthetic NIR physics generator, preprocessing, PLSR baseline & tree comparisons, applicability domain, silage rules YAML & Python/TS parity, RGB blur/glare QA, colorimetric reader, golden test suite. | Days 5–6 |
| **Phase D** | Backend & Services | Multimodal late fusion, `/analyze` orchestrator, advisory generator, IoT pit simulator, sync engine with conflict resolution, signed QR tokens, ReportLab PDF with Devanagari font. | Days 7–8 |
| **Phase E** | Farmer Frontend Experience | Mobile-first UX (<=3 taps to test), live camera QA, silage & feed workflows, 7-step analysis animation, hero result card, Web Speech voice readout, offline IndexedDB execution, sync diff UI. | Days 9–10 |
| **Phase F** | Admin, Traceability & Demos | Hero Demo (Healthy vs Spoiled side-by-side), 5 Try Demo scenarios, Judge Guided Tour, Reset Demo, Public QR verification page, Admin analytics, Model performance screen. | Days 11–12 |
| **Phase G** | QA, Hardening & Audit | End-to-end tests, offline E2E verification, claims linter pass, accessibility audit, final checklist & documentation. | Days 13–14 |

---

## 2. Vertical Slice Definition (P0 Core)

The first fully demonstrable end-to-end vertical slice consists of:
1. **Silage Test Flow:** Capture sample → enter probe pH + internal/ambient temp → on-device/server silage risk engine → Hero result screen with evidence tags and input completeness → Vernacular advisory with voice readout.
2. **Hero Demo:** Side-by-side Healthy vs Spoiled Silage with immediate visual contrast.
3. **Traceability:** Unique Sample ID `FS-YYYYMMDD-XXXX`, signed HMAC QR, and public verification page.
4. **Offline Capability:** Test runs fully offline in browser/PWA, queues in outbox, and renders "Updated after Sync" with a diff once reconnected.

---

## 3. Explicit Cut-Line Rules

If timeline pressure occurs:
1. **Cut P2 Features First:**
   * Drop live Web Bluetooth device connectivity (keep simulated adapters).
   * Drop lateral-flow mycotoxin reader (keep colorimetric urea/pH reader).
   * Drop foreign-material segmentation (keep classical blur/lighting QA).
   * Drop non-target regional languages beyond en, hi, hinglish.
2. **Trim P1 Features if Necessary:**
   * Reduce cooperative analytics to single-node summaries.
   * Restrict IoT pit simulator to 3 core time-series scenarios.
3. **NEVER Cut Under Any Circumstances:**
   * The P0 vertical slice.
   * Evidence tags and prediction envelopes on all outputs.
   * Claims policy enforcement and honesty disclaimers.
   * Parity between Python and TypeScript silage engines.
   * Clean clone buildability.
