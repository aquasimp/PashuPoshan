# PROMPT 0 — MASTER CONTEXT
*(FeedShield System Guide)*

## 0.1 Identity

| | |
|---|---|
| Product | **FeedShield** — AI-Powered Feed & Silage Intelligence |
| Tagline | **Test. Understand. Act.** |
| Problem statement | **SIH26111** — Smart AI-Enabled Rapid Feed and Silage Quality Testing System for Dairy Farmers |
| Organization | Ministry of Fisheries, Animal Husbandry & Dairying |
| Department | Department of Animal Husbandry & Dairying |
| Theme / Category | Agriculture, FoodTech & Rural Development / Software |

**Positioning line:** *FeedShield brings rapid feed and silage quality intelligence closer to the farmer.*

FeedShield is a **rapid screening + measurement + prediction + decision-support platform** with explicit laboratory referral. It is not a universal instant laboratory.

**Pillars:** Multimodal · Offline · Explainable · Farmer-centric · Traceable.

**Long-term innovation:** a paired Indian dataset linking images + spectra + sensors + metadata + laboratory truth, grown through the field data-collection module.

**Core workflow:** TAKE SAMPLE → CAPTURE/MEASURE → ANALYZE → UNDERSTAND → IDENTIFY RISK → TAKE ACTION → SAVE/TRACE/SHARE.

**Build target:** a real product prototype, built from an empty directory. No existing code, UI, database, model, auth or deployment.

---

## 0.2 Project constraints

| Item | Value |
|---|---|
| Team size and skills | 1–3 developers |
| Time until submission / demo | plan for 14 days |
| Physical hardware available (NIR, pH probe, ESP32, sensors) | none: simulate everything and label it simulated |
| GPU for training | none: CPU-only, small models |
| Lowest target device | mid-range Android, Chrome, 3 GB RAM |
| Judging criteria / demo format | live 3-minute demo plus Q&A |
| Official SIH26111 data folder | treat as not accessible (PROCEED-FALLBACK) |

---

## 0.3 Agent working rules

1. Build from scratch in the current empty directory.
2. **One phase per session.** At session start read `CLAUDE.md` and `docs/PROGRESS.md`. At session end append to `docs/PROGRESS.md`: done, not done, decisions made, next step.
3. The tech stack in 0.9 is **locked**. Do not re-debate it.
4. Ask questions only when blocked. Otherwise state the assumption in one line and continue.
5. **No fake functionality.** A stub is allowed only if it is honestly labelled in the UI and logged in `docs/KNOWN_GAPS.md`. A feature that cannot be validated ships as "interface + simulator", never as a claim.
6. **Cut-line.** If time runs short, cut P2 first, then P1 from the bottom. Never cut the honesty rules (0.6 to 0.8) or the P0 slice.
7. Every phase ends by running things. Report real command output for tests. Do not say "should work".
8. Never hard-code metrics, accuracy, latency or model sizes into the UI or docs. Read them from generated files, or omit them.
9. Use the repo layout in 0.9. Commit at the end of each phase with a clear message.

---

## 0.4 Priority tiers

**P0 — the vertical slice (demo-critical; build first and make excellent)**
- Silage test: image + pH + internal/ambient temperature + moisture/DM (manual or simulated) → silage risk engine → result → advisory
- Hero demo: **Healthy vs Spoiled Silage** side by side; Try Demo (no login) with 5 scenarios; guided judge tour; Reset Demo
- Feed test, image only: quality check, visible-mould screen, colour/texture, "Nutrition: not measured", "Urea cannot be assessed from this image alone"
- Evidence tags, input-completeness component, and the prediction envelope on every result
- Offline: save on device → outbox → sync → "Updated after Sync"
- Sample ID `FS-YYYYMMDD-XXXX`, QR, public verification page (Verified / Unverified / Tampered)
- PDF report
- English, हिन्दी, Hinglish
- Auth with 4 roles and route-level RBAC
- History and Advisory with voice readout

**P1**
- NIR pipeline: preprocessing, PLSR baseline, SVR/RF/XGBoost comparison, nested CV, applicability-domain check, real metric files, model cards, Model Performance screen
- Storage monitoring, IoT simulator, trend charts
- Admin analytics, data-collection module, compare samples, explainability screen
- pH-strip reader and urea/colorimetric assay reader (reference-card validated)
- Cooperative manager view

**P2**
- Lateral-flow (mycotoxin) assay reader
- Foreign-material detector
- O₂/CO₂ ingestion (architecture + simulator only)
- On-device ONNX image inference (onnxruntime-web)
- Additional languages beyond the architecture stub
- Web Bluetooth device adapters, Lighthouse tuning, full design-system page

---

## 0.5 Personas

| Persona | Needs |
|---|---|
| **Farmer** | Mobile-first, Hindi/Hinglish, icons, voice guidance, large controls, offline, actionable advice |
| **Cooperative / dairy manager** | Many farmers, sample history, alerts, traceability, storage monitoring, analytics, shared-node management |
| **Veterinarian / nutritionist** | Detailed evidence, model explanation, confidence and uncertainty, lab results, ability to annotate or override a recommendation |
| **Admin** | Users, models, datasets, model performance, audit trail, devices, system monitoring |

Deployment model: **shared testing service.** Do not assume every farmer owns a NIR device. Test nodes sit at cooperatives, milk collection centres, FPOs, veterinary centres, KVKs, feed-testing centres and mobile vans. The farmer app must stay useful when no instrument is present.

---

## 0.6 Evidence tags — canonical definition

Every result in the UI, API, report, QR page, analytics and model dashboard carries exactly one of these tags:

| Tag | Meaning |
|---|---|
| `DETECTED` | Directly observable visual characteristic |
| `PREDICTED` | Output of a trained ML model from available inputs |
| `ESTIMATED` | Output of a documented formula, rule or heuristic |
| `USER-ENTERED` | Typed in manually |
| `SENSOR-MEASURED` | From a sensor, NIR, pH probe or assay-reader workflow |
| `DEMO` | Produced by demonstration or synthetic data |

Keep MEASURED, PREDICTED, ESTIMATED, SCREENING and CONFIRMED visibly distinct. Never blur them.

**Prediction envelope** (API, DB and UI all use this shape):

```json
{
  "value": 62.4,
  "unit": "% DM",
  "evidence_tag": "PREDICTED",
  "confidence": 0.81,
  "uncertainty": {"type": "interval", "lower": 60.1, "upper": 64.7, "level": 0.95},
  "model_version": "nir-dm-plsr-0.3.1",
  "data_provenance": "real_field | public_dataset | synthetic_demo | user_entered | simulated_sensor",
  "modalities_used": ["nir"],
  "modalities_missing": ["rgb", "ph"],
  "applicability_domain": "IN_DOMAIN | CAUTION | INVALID | NOT_APPLICABLE"
}
```

Rules:
- If `applicability_domain = INVALID`, `value` is `null` and the UI shows the out-of-range message. Never show a precise number.
- `USER-ENTERED` and `ESTIMATED` values use the same envelope with `confidence = null` where not applicable.
- Every screen or PDF section that shows a result renders an `<EvidenceTag>`.
- Any screen fed by `synthetic_demo` or `simulated_sensor` visibly shows **DEMO**.

---

## 0.7 Claims policy — the single source of truth

| Input | May support | Must never claim |
|---|---|---|
| **RGB image** | Feed/ingredient class, pellet vs mash, visible foreign material, visibly mouldy regions, colour and texture, visible spoilage, batch/packaging OCR, image-quality checks, reading colorimetric/lateral-flow tests | Protein, NDF, ADF, starch, energy, minerals, invisible urea, fine silica, aflatoxin concentration, non-visible mycotoxins, fermentation-acid concentration, precise dry matter |
| **NIR (validated model, in domain)** | Moisture/DM, crude protein, NDF, ADF (core); starch, fat, energy (secondary); spectral anomaly screening | Anything outside the validated domain; minerals or digestibility as validated outputs |
| **Colorimetric assay + reference card** | Urea screening result | Urea concentration without a validated calibration; any urea claim from a plain feed photo |
| **Lateral-flow / ELISA / HPLC** | Rapid screening / lab screening / confirmatory result respectively | Precise toxin concentration without matching validated input |
| **Sensors** | pH, internal temp, ambient temp/RH, O₂, CO₂ context | Ambient humidity as silage moisture; generic gas sensors as quantitative fermentation-gas measurement |

**Exact UI strings (translate via i18n, keep meaning identical):**

| Situation | String |
|---|---|
| Urea, image only | "Urea cannot be assessed from this image alone." |
| Urea, assay positive | "Possible excess/non-declared urea — screening result. Confirmatory laboratory test recommended." |
| Visible mould (RGB) | "Visible mould risk" |
| Spectral contamination (NIR) | "Indicative spectral contamination risk" |
| Lateral-flow result | "Rapid assay screening result" |
| ELISA result | "Laboratory screening result" |
| HPLC / LC-MS/MS result | "Confirmatory laboratory result" |
| Sand / silica suspicion | "Suspected inorganic contamination — confirmatory laboratory test recommended." (reference method: acid-insoluble ash) |
| Out of applicability domain | "Sample outside validated model range — laboratory confirmation recommended." |
| pH strip or lighting validation fails | "Unable to validate test image — retake required." (return no pH number) |
| Nutrition without NIR | "Not measured" |
| Synthetic-trained model | "Trained on synthetic demo data — NOT a validation of field accuracy" |

**Never claim, anywhere (UI, API, docs, PDF, pitch):**
RGB measures protein, fibre or minerals · RGB detects aflatoxin or urea directly · NIR universally replaces laboratories · one model works for every Indian feed · one instrument calibration works across all NIR devices · no visible mould means no mycotoxin · ambient humidity equals silage moisture · generic gas sensors quantify fermentation gases · high cross-validation accuracy proves field accuracy · BIS compliance without formal assessment · a screening result is a confirmed laboratory result.

**Enforcement:** `ml/claims_forbidden.txt` and `claims_lint` test scan all i18n bundles, templates, docs and generated PDF text for forbidden phrasing.

---

## 0.8 Data rule — decision ladder

1. Official SIH26111 data folder: recorded as inaccessible without private auth; proceed using fallback ladder.
2. Audit before training: `data/DATA_AUDIT.md`.
3. Public licensed datasets: recorded in `docs/DATA_SOURCES.md`.
4. Synthetic demo data: physically plausible generators stored in `data/synthetic_demo/` and `ml/synthetic/`. Every record tagged `data_provenance = synthetic_demo`.
5. One pipeline: identical code for real and synthetic data.

---

## 0.9 Locked tech stack and repo layout

**Frontend** (`apps/web`): Next.js App Router · TypeScript · Tailwind CSS · Framer Motion · Lucide · Recharts · Serwist (PWA service worker) · Dexie/IndexedDB · next-intl · Vitest · Playwright.
**Backend** (`apps/api`): Python 3.11+ · FastAPI · Pydantic v2 · SQLAlchemy 2 · Alembic · JWT (access + refresh) · slowapi · ReportLab · `qrcode`.
**ML** (`ml/`): scikit-learn (PLSR, SVR, RF, IsolationForest, OneClassSVM) · XGBoost or LightGBM · OpenCV · SHAP · ONNX export · onnxruntime.
**Database:** PostgreSQL via `docker-compose`; SQLite fallback for dev and demo (`DATABASE_URL` switch).
**Tooling:** pnpm · `uv` or pip · Makefile with `make dev`, `make test`, `make seed`, `make train`, `make demo`.

```
feedshield/
  CLAUDE.md  AGENTS.md  README.md  Makefile  docker-compose.yml  .env.example
  apps/web/          Next.js PWA (includes /design-system route)
  apps/api/          FastAPI (routers, services, rules/, models, migrations)
  ml/                ingest, clean, features, split, train, evaluate, serialize, infer, explain, synthetic, tests
  data/              DATA_AUDIT.md, raw/ (gitignored), synthetic_demo/
  tools/             iot_sim/, seed/
  e2e/               Playwright
  docs/              all docs, model_cards/, PROGRESS.md, KNOWN_GAPS.md
  qa/screenshots/
```

**Hardware adapters:** TypeScript interfaces (`NirDevice`, `PhProbe`, `TempProbe`, `GasSensor`, `AssayReader`) with `Simulated*` implementations.

**API base:** `/api/v1`.

**Tables:** users, roles, farms, storage_units, devices, samples, sample_images, spectra, sensor_readings, assays, laboratory_results, analyses, predictions, evidence, advisories, recommendations, traceability, sync_queue, sync_conflicts, model_registry, audit_logs.

**Roles:** `farmer`, `cooperative_manager`, `veterinarian`, `admin`.

---

## 0.10 NIR discipline
- Prefer portable NIR spectrometer (~900-1700 nm / 1100-2500 nm). Low channel module labeled EXPERIMENTAL MULTISPECTRAL MODULE.
- Pipeline: Raw -> dark/white ref -> reflectance -> absorbance = log10(1/R) -> bad-band removal -> replicate averaging -> preprocessing (SNV, MSC, Detrend, SG 1st/2nd) -> PCA -> PLSR baseline vs SVR/RF/XGBoost -> nested CV -> applicability domain (Hotelling T² & Q-residual) -> prediction + uncertainty.

---

## 0.11 Silage measurement and risk engine
- Inputs: pH, internal temp, ambient temp, moisture/DM, gas context.
- Single source of truth: `apps/api/app/rules/silage_rules.yaml` compiled to `apps/web/lib/rules/silage_rules.json`.
- Parity: `ml/tests/golden/silage_cases.json` tested in pytest and Vitest.
- Outputs: air-ingress risk, heating risk, spoilage risk, fermentation-failure risk, mould risk, sensor-health warning (each low/moderate/high/indeterminate). Missing inputs -> indeterminate.

---

## 0.12 Fusion and advisory
- Late fusion: independent interpretation of RGB, NIR, sensors, metadata.
- Worst supported hazard rule for overall risk.
- Advisory chain: RESULT → ISSUE → ACTION → STORAGE → RISK → NEXT STEP ending in FEED · BLEND · RE-TEST · DISCARD.

---

## 0.13 Design direction
- Warm editorial agritech: ivory (#FAF6EC), bone (#F3EDDD), surface (#FFFDF7), forest (#1F4D3A), deep (#143628), moss (#6B8F5E), sage (#A9BFA0), mist (#E4EBDD), amber (#C98A2B), terracotta (#B95C3A), ink (#23302A), muted (#6E7A70).
- Typography: Fraunces serif for display, Inter/Instrument Sans for UI, Noto Sans Devanagari for Hindi.

---

## 0.14 Offline-first and sync
- Installable PWA with IndexedDB via Dexie.
- UUIDs and idempotency keys. Outbox with retry.
- Conflict policy: server authoritative for analyses, client for drafts.
- On-device offline analysis with "Analysed on device — Offline", post-sync diff with "Updated after Sync".

---

## 0.15 Traceability and security
- Sample ID: `FS-YYYYMMDD-XXXX`.
- QR payload: signed HMAC-SHA256 token.
- Verification states: Verified, Unverified, Tampered.
- Secure auth, EXIF stripping, audit logging.

---

## 0.16 Internationalisation
- English, Hindi, Hinglish shipped.
- Web Speech API voice readout.

---

## 0.17 Global definition of done
- Stack runs, tests pass, honesty policy enforced, claims lint passes, documentation complete.
