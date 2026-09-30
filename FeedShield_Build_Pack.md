# PASHUPOSHAN BUILD PACK (formerly FeedShield)

**SIH 2026 · SIH26111 · Smart AI-Enabled Rapid Feed & Silage Quality Testing System for Dairy Farmers**

---

## HOW TO USE THIS PACK

1. Fill every `[FILL]` in PROMPT 0, section 0.2. Unfilled items fall back to the stated defaults.
2. Save PROMPT 0 as `CLAUDE.md` (or `AGENTS.md`) in the root of an empty repo. It loads every session, so the rules are never repeated.
3. Paste PROMPT A. Review the plan. Reply `APPROVED` or list changes.
4. Paste PROMPT B, C, D, E, F, G one at a time, one per session. Each ends with a gate. Do not advance until every exit criterion is ticked.
5. If the agent drifts or loses context, use the recovery prompts at the end.

Structure: **PROMPT 0** (master, saved once) → **PROMPTS A–G** (phases) → **Recovery prompts**.

---
---

# PROMPT 0 — MASTER CONTEXT
*(save as `CLAUDE.md`)*

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

## 0.2 Project constraints — FILL BEFORE STARTING

| Item | Value | Default if blank |
|---|---|---|
| Team size and skills | `[FILL]` | 1–3 developers |
| Time until submission / demo | `[FILL]` | plan for 14 days |
| Physical hardware available (NIR, pH probe, ESP32, sensors) | `[FILL]` | none: simulate everything and label it simulated |
| GPU for training | `[FILL]` | none: CPU-only, small models |
| Lowest target device | `[FILL]` | mid-range Android, Chrome, 3 GB RAM |
| Judging criteria / demo format | `[FILL]` | live 3-minute demo plus Q&A |
| Official SIH26111 data folder | `[FILL: accessible / I will upload to data/raw/sih/ / not available]` | treat as not accessible |

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

All other sections and phases refer back to this table. Do not restate it elsewhere.

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

**Enforcement:** create `ml/claims_forbidden.txt` and a `claims_lint` test that scans all i18n bundles, templates, docs and generated PDF text for forbidden phrasing. It runs in CI and must pass.

---

## 0.8 Data rule — decision ladder

Follow in order. Never skip a rung silently.

1. **Official data.** Try the SIH26111 supporting folder: https://drive.google.com/drive/folders/1KrErp9hRfLlaWw3gqvWFo1EpQiU1qtbG. If it cannot be opened (login wall, permissions, blocked network), record "inaccessible" in `data/DATA_AUDIT.md`, **stop, and ask me to upload files to `data/raw/sih/`**, unless I have replied `PROCEED-FALLBACK`.
2. **Audit before training.** Write `data/DATA_AUDIT.md` (files, modalities, labels, targets, units, sample counts, missing values, duplicates, class balance, batch/source structure, licence, provenance, leakage risk). Enable an ML task **only** if the data supports it (enough physical samples, real labels, splittable by sample, batch and farm).
3. **Public licensed datasets.** Use only datasets with a clear licence (Zenodo, Mendeley Data, Figshare, Kaggle, UCI, IEEE DataPort, government or academic repositories). Record domain, matrix, sample count, modality, labels, licence, intended use and limitations in `docs/DATA_SOURCES.md`. A cereal dataset does not validate cattle feed. A bread-mould dataset does not validate silage mould. If downloads are blocked, note it and go to rung 4.
4. **Synthetic demo data.** Physically plausible generators only (for NIR: absorption bands + scatter + baseline drift + noise, with realistic constituent correlations). Store in `data/synthetic_demo/` and `ml/synthetic/`. Every record has `data_provenance = synthetic_demo`; every screen shows **DEMO**; every metric file carries `provenance: synthetic_demo`; the admin screen shows the synthetic-model banner from 0.7.
5. **One pipeline.** Code for real and synthetic data is identical. Switching to real data is a config change, not a rewrite.

**Image-model fallback when no labelled image data exists:**
- Feed class → user selects it (`USER-ENTERED`); the classifier slot is a documented interface returning `unavailable`.
- Visible mould → classical CV heuristic (HSV/texture/region analysis) tagged `ESTIMATED`, with its limitations documented. No trained-CNN claims.

**Split and leakage rules (all training):**
- Split by physical sample, then batch, farm and acquisition period where possible. Repeated scans of one sample stay in one partition. Augmented images stay with their source sample.
- Fit preprocessing and feature selection only inside training folds. Choose preprocessing inside nested CV, not by scoring dozens of variants on the full data.
- Reserve an independent external test set.
- Report performance by feed type, geography, supplier, concentration range and acquisition domain, not just overall.

---

## 0.9 Locked tech stack and repo layout

**Frontend** (`apps/web`): Next.js App Router · TypeScript · Tailwind CSS · Framer Motion · Lucide · Recharts · Serwist (PWA service worker) · Dexie/IndexedDB · next-intl · Vitest · Playwright.
**Backend** (`apps/api`): Python 3.11+ · FastAPI · Pydantic v2 · SQLAlchemy 2 · Alembic · JWT (access + refresh) · slowapi (rate limits) · ReportLab (PDF, embed a Devanagari font) · `qrcode`.
**ML** (`ml/`): scikit-learn (PLSR, SVR, RF, IsolationForest, OneClassSVM) · XGBoost or LightGBM · OpenCV · SHAP · PyTorch only if a real image dataset justifies it · ONNX export · onnxruntime.
**Database:** PostgreSQL via `docker-compose`; SQLite fallback for dev and demo (`DATABASE_URL` switch).
**Tooling:** pnpm · `uv` or pip · Makefile with `make dev`, `make test`, `make seed`, `make train`, `make demo`.

```
feedshield/
  CLAUDE.md  README.md  Makefile  docker-compose.yml  .env.example
  apps/web/          Next.js PWA (includes /design-system route)
  apps/api/          FastAPI (routers, services, rules/, models, migrations)
  ml/                ingest, clean, features, split, train, evaluate, serialize, infer, explain, synthetic, tests
  data/              DATA_AUDIT.md, raw/ (gitignored), synthetic_demo/
  tools/             iot_sim/, seed/
  e2e/               Playwright
  docs/              all docs, model_cards/, PROGRESS.md, KNOWN_GAPS.md
  qa/screenshots/
```

**Hardware adapters:** define TypeScript interfaces (`NirDevice`, `PhProbe`, `TempProbe`, `GasSensor`, `AssayReader`) with `Simulated*` implementations. Real BLE/Web Bluetooth implementations, if written, are marked "untested with hardware". The UI never talks to hardware directly.

**API base:** `/api/v1`.
```
POST /auth/login          GET /me
CRUD /samples             POST /samples/{id}/image
POST /analyze             GET /analyses/{id}          GET /analyses/{id}/explain
GET /advisories/{analysis_id}
POST /reports/{analysis_id}/pdf
GET /verify/{sample_id}
POST /sensors/readings    GET /storage-units/{id}/readings
POST /sync/push           GET /sync/pull
GET /analytics/overview   GET /analytics/trends       GET /analytics/alerts
GET /models               POST /data-collection/upload
GET /health
```

**Tables:** users, roles, farms, storage_units, devices, samples, sample_images, spectra, sensor_readings, assays, laboratory_results, analyses, predictions, evidence, advisories, recommendations, traceability, sync_queue, sync_conflicts, model_registry, audit_logs. Provide Alembic migrations (up and down).

**Roles:** `farmer`, `cooperative_manager`, `veterinarian`, `admin`, enforced at route level.

---

## 0.10 NIR discipline

- Prefer a genuine portable NIR spectrometer (≈900–1700 nm compact; ≈1100–2500 nm broader). A low-channel VIS/multispectral module (e.g. AS7265x-class) is labelled **EXPERIMENTAL MULTISPECTRAL MODULE**. It is never described or treated as a conventional NIR feed analyser.
- Never train on one instrument and silently deploy on another.
- **Store per spectrum:** instrument ID, firmware, spectral range, acquisition metadata, calibration domain, dark reference, white reference, timestamp.
- **Store per sample:** fresh / dried / ground status, particle-size protocol, sample mass, cup/container, replicate count, scan orientation.
- Never merge fresh, dried and ground samples into one calibration domain. Models are validated per domain.
- Modes: **Rapid fresh** (mix/rotate, 3–5 replicate scans, average, fresh-validated models only) and **Standardized** (grind to defined particle size, fixed depth, multiple orientations, average).

**Pipeline:**
```
Raw → dark ref → white ref → reflectance → absorbance = log10(1/R)
→ bad-band removal → replicate averaging
→ preprocessing candidates: Raw | SNV | MSC | Detrend | SG 1st derivative | SG 2nd derivative
→ PCA / outlier review → PLSR baseline → SVR / RF / XGBoost comparison
→ nested CV → independent validation → applicability-domain check → prediction + uncertainty
```

**Applicability domain:** Spectrum → same preprocessing → PCA → Hotelling T² and Q-residual (or Mahalanobis). Thresholds come from the training data. Statuses: `IN_DOMAIN` (within validated space), `CAUTION` (near or slightly outside), `INVALID` (no precise prediction shown).

**Targets:** core = moisture/DM, crude protein, NDF, ADF. Secondary = starch, fat, energy estimate. Research/future = minerals, digestibility. Do not output a precise nutrient value without an appropriate validated model.

---

## 0.11 Silage measurement and risk engine

**Measurements:** required = pH, internal temperature, ambient temperature, moisture/DM. Advanced = O₂, CO₂. Contextual = ambient RH (never a moisture proxy).

**Rules live in one versioned file:** `apps/api/app/rules/silage_rules.yaml`. Each rule has `id`, `description`, `inputs`, `thresholds`, `source` (citation) and `status: verified | needs_expert_review`. Any threshold you cannot cite is `needs_expert_review` and shown in `docs/SCIENCE_NOTES.md`. A script generates `apps/web/lib/rules/silage_rules.json` from the YAML, so there is one source of truth.

**Parity guarantee:** golden test vectors in `ml/tests/golden/silage_cases.json` run in both pytest and Vitest. The Python and TypeScript engines must agree on every case.

**Interpretation:**
- No universal pH threshold. Interpret pH by crop type, dry matter and fermentation context (e.g. drier or wilted silage tolerates a higher pH than wet silage).
- Do not alert on an absolute temperature alone.

**Inputs:** internal temp, ambient temp, temp difference, rate of rise, O₂ trend, CO₂ trend, days since sealing/opening, pH, moisture/DM, visible mould, storage events (cover removed, opened, rain).

**Outputs (each `low | moderate | high | indeterminate` with contributing factors and an evidence tag):**
air-ingress risk · heating risk · spoilage risk · fermentation-failure risk · mould risk · sensor-health warning.

Missing inputs produce `indeterminate` for the affected output. Never substitute zeros.

---

## 0.12 Fusion and advisory

**Late fusion.** Each modality has an independent interpretation (RGB → visible mould, quality; NIR → nutrients, anomaly, domain; sensors → pH, temp, gases; metadata → feed type, storage history). A rules layer (calibrated meta-model only if paired data supports it) combines them.

**Combination rule:** overall risk takes the **worst supported hazard**, not an average, so a serious signal is never diluted. Output always lists `modalities_used` and `modalities_missing`.

| Inputs present | Result scope |
|---|---|
| Image only | Feed class (if available), visible mould risk, visible foreign matter, colour/texture. Nutrition "Not measured". Urea "cannot be assessed". Mycotoxin "indicative visual risk only". |
| Image + sensors | Adds moisture/storage context, pH, temperature, silage risk |
| Image + NIR | Adds validated nutrients and spectral anomaly screening |
| Image + NIR + sensors + assay | Strongest multimodal screening workflow |

**Advisory chain:** RESULT → ISSUE → ACTION → STORAGE → RISK → NEXT STEP, ending in one decision: **FEED · BLEND · RE-TEST · DISCARD**.
- Conservative and evidence-based. Uncertain or safety-relevant situations recommend confirmatory testing or professional review.
- "FEED" with image-only evidence must read: "No visible problems found. This is not a nutrient or toxin clearance."
- Advisory text lives in i18n keys, never hard-coded strings.
- Veterinarians can annotate or override a recommendation; the override is stored and audited.

**Explainability:** farmer-facing plain language ("High moisture → higher spoilage risk"). Expert-facing: SHAP or feature importance for tabular/tree models, regression coefficients/VIP and influential wavelength bands for PLSR, Grad-CAM only if a CNN exists (otherwise heuristic overlay or occlusion map).

---

## 0.13 Design direction

**Feel:** premium agritech that is scientific, trustworthy, human and modern. Warm editorial paper surfaces, forest-green authority, botanical restraint.

**Tokens:**
```
ivory  #FAF6EC   bone   #F3EDDD   surface #FFFDF7
forest #1F4D3A   deep   #143628   moss    #6B8F5E
sage   #A9BFA0   mist   #E4EBDD   amber   #C98A2B
terracotta #B95C3A   ink #23302A   muted   #6E7A70
```
Use only what each screen needs.

**Type:** display = Fraunces (editorial serif); UI = Instrument Sans or Inter; Hindi = Noto Sans Devanagari or Mukta. Body ≥ 16 px, mobile controls ≥ 48 px, generous whitespace, large headings.

**Surfaces:** main content sits on warm solid surfaces. Frosted glass is reserved for floating nav, top app bar, sticky action bar, modals, bottom sheets, QR verification card and the result-hero overlay. Never nest glass in glass. Always provide a solid fallback and honour `prefers-reduced-transparency`.

**Imagery:** sparse botanical line-art (maize, wheat, fodder, leaf), real feed and silage photography, organic texture. It should read as a serious product, not a farming game.

**Motion:** restrained Framer Motion for page transitions, hover lift, scan animation, result reveal, chart entrance, gentle hero drift. Honour `prefers-reduced-motion`. Analysis sequence copy: "Reading colour and texture…" → "Checking visual anomalies…" → "Processing spectral input…" → "Reviewing sensor measurements…" → "Checking applicability…" → "Combining evidence…" → "Preparing recommendation…".

**Status language:** GOOD / ATTENTION / HIGH RISK. Always colour + icon + text together.

**Avoid:** the generic dark-navy / neon / purple-glow "AI dashboard" look and walls of KPI cards. Lead with charts, tables and timelines.

---

## 0.14 Offline-first and sync

- Installable PWA, service worker, cached app shell, IndexedDB via Dexie.
- Stored locally: sample metadata, images, analysis, advisory, model version, input modalities, provenance, sync state.
- UUIDs and idempotency keys on every record and request.
- Sync states: **Saved on device → Queued → Syncing → Synced → Failed**, plus a visible **SYNC NOW**. Persistent outbox with retry and backoff.
- **Conflict policy:** the server is authoritative for analysis results; the client is authoritative for drafts and offline metadata edits. Last-writer-wins by `updated_at` + `client_id`; every conflict is logged in `sync_conflicts`.
- **Offline analysis (P0):** on-device image-quality checks (blur, exposure, glare), the TypeScript silage rules engine, and advisory templates. Show "Analysed on device — Offline". Visible-mould screening that needs server processing shows "Pending sync".
- **After sync:** show "Updated after Sync" and a **diff** of what changed. Keep the on-device result viewable. Never change a result silently.
- **On-device ONNX inference (P2):** only if a trained model exists.

---

## 0.15 Traceability and security

- Sample ID `FS-YYYYMMDD-XXXX`, generated offline (device-scoped suffix guarantees uniqueness).
- QR payload: verification URL + signed token only. No unnecessary personal data.
- Token: `base64url(payload).base64url(HMAC-SHA256)`, payload = `{sid, iat, v, result_hash}`.
- **Offline QR:** the server key is not on the device, so the offline QR is a provisional pointer labelled "Unverified — pending sync". After sync the server issues the signed token. (P1: per-device Ed25519 key registered at login.)
- Verification page states: **Verified** (signature valid and hash matches record), **Unverified** (unknown or not yet synced), **Tampered** (signature or hash mismatch). It shows sample, result summary, date, source, model version, evidence tags and provenance.
- Security: password hashing (argon2/bcrypt), JWT with expiry, file-type and size validation, image size limits, EXIF stripping, env-based secrets (`.env.example` only), CORS allow-list, rate limits, audit log on sensitive actions. No secrets committed.

---

## 0.16 Internationalisation

- Real i18n architecture (next-intl on web, key-based bundles on API for advisories and PDFs).
- Ship: **English, हिन्दी, Hinglish.**
- Architect for: Bengali, Marathi, Gujarati, Punjabi, Tamil, Telugu, Kannada, Malayalam, Odia (locale files stubbed, `docs/ADD_A_LANGUAGE.md`).
- Translate UI, errors, advisories, PDF reports, QR labels and voice prompts.
- Voice: Web Speech API for advisory readout with enable/disable and language select, where the browser supports it.

---

## 0.17 Global definition of done

- `make dev` starts web + API + DB. `make test` runs pytest, Vitest and the claims lint.
- Every displayed result has an evidence tag and, if predicted, the full envelope.
- Every DEMO/synthetic/simulated source is visibly labelled.
- No hard-coded metrics anywhere.
- `docs/KNOWN_GAPS.md` lists every stub and unbuilt item honestly.
- When evidence is insufficient the product says so. When confirmation is required it points to confirmatory testing.

---
---

# PROMPT A — RESEARCH + PLAN
*(no application code in this phase)*

```
Read CLAUDE.md and docs/PROGRESS.md (create it if missing). This is PHASE A: research and plan only.
Do not write application code.

TASKS
1. Data access: follow CLAUDE.md 0.8 rung 1. Try the official SIH26111 folder. If inaccessible, record
   that and ask me for files (max one question), unless I said PROCEED-FALLBACK.
2. Write data/DATA_AUDIT.md using the audit fields in 0.8. If no official data exists, say so plainly.
3. Research legitimately licensed public datasets for: feed/forage NIR, silage quality, mycotoxin
   spectroscopy, mould images, feed/food quality images. Write docs/DATA_SOURCES.md with domain, matrix,
   sample count, modality, labels, licence, intended use, limitations, and a verdict (use / do not use /
   demo-only). Do not download anything you cannot license.
4. Write docs/PS_SIH26111_EXTRACT.md: the problem statement, its requirements, and a traceability table
   mapping each requirement to a planned feature and its priority (P0/P1/P2).
5. ML task matrix (docs/ML_ARCHITECTURE.md): for Models A-F: input, target, data available today
   (yes / partial / no), status (build / heuristic / demo-only / interface-only), and why.
6. docs/ARCHITECTURE.md with Mermaid diagrams: system context, shared test-node deployment, data flow,
   offline/sync sequence, late-fusion flow.
7. Schema: Mermaid ERD for all tables in 0.9, plus the API contract (route, method, role, request,
   response using the prediction envelope).
8. UI flow: docs/UI_FLOW.md with the screen inventory (23 screens), each tagged P0/P1/P2, plus the
   farmer flow with tap counts to START TEST (max 3).
9. Hardware adapter interfaces and docs/HARDWARE.md (what is real, simulated, or future).
10. docs/VALIDATION_PLAN.md covering the chain from representative sampling to seasonal/geographic
    validation, and the repeatability/reproducibility/operator/instrument studies.
11. Build plan: map Phases B-G to the time in CLAUDE.md 0.2, with the first demo-able vertical slice
    marked and the cut-line stated.

OUTPUT
- A summary of at most 2 pages: what data exists, which ML tasks are supported, what is heuristic or
  demo-only, the plan by phase, top risks.
- At most 5 decisions that need my input, each with your recommended default.
- Update docs/PROGRESS.md.
Then STOP and wait for my reply "APPROVED".
```

**Exit criteria**
- [ ] `data/DATA_AUDIT.md` exists and states honestly what data is or is not available
- [ ] `docs/DATA_SOURCES.md` lists each candidate dataset with licence and verdict
- [ ] ML task matrix marks each model build / heuristic / demo-only / interface-only
- [ ] ERD, API contract, screen inventory and adapter interfaces exist
- [ ] Plan fits the time budget and names the cut-line
- [ ] Agent has stopped and is waiting for `APPROVED`

---

# PROMPT B — FOUNDATIONS

```
Read CLAUDE.md and docs/PROGRESS.md. This is PHASE B: foundations. Plan approved.

TASKS
1. Monorepo per the layout in CLAUDE.md 0.9: pnpm workspace, Makefile, docker-compose (Postgres) with a
   SQLite dev fallback, .env.example, README skeleton, pre-commit/lint config.
2. Backend skeleton: FastAPI app, settings from env, /api/v1 router, GET /health, structured logging,
   CORS allow-list, rate limiting, error envelope.
3. Database: SQLAlchemy 2 models for every table in 0.9; Alembic migrations that apply up AND down;
   `make seed` creates one demo user per role plus demo farms and storage units (marked DEMO).
4. Auth: argon2/bcrypt hashing, JWT access + refresh, POST /auth/login, GET /me, role dependency for
   route-level RBAC, audit-log writer.
5. Design tokens + the /design-system route. P0 set: typography, colours, buttons, status chips, evidence
   tags (all six), cards, forms, alerts, glass surfaces (with solid fallback and reduced-transparency
   handling), empty/loading/error states. Build <EvidenceTag>, <InputCompleteness>, <StatusChip>,
   <DemoBadge> as reusable components now.
6. i18n: next-intl with en, hi, hinglish bundles, language switcher, namespaces (common, farmer, results,
   advisory, errors, report, admin). Stub locale files for the future languages. Write docs/ADD_A_LANGUAGE.md.
7. PWA: manifest, Serwist service worker, cached app shell, offline fallback page, install prompt.
8. Offline skeleton: Dexie schema (samples, images, analyses, advisories, outbox), sync-state store,
   idempotency key helper, sync-status component (Saved on device / Queued / Syncing / Synced / Failed).
9. Test scaffolds: pytest, Vitest, Playwright configured with one passing smoke test each.
10. Create ml/claims_forbidden.txt and the claims_lint test wired into `make test`.

VERIFY (run and paste real output)
- make dev starts web, API and DB
- log in as each of the four roles; a role-restricted route returns 403 for the wrong role
- alembic upgrade head, then downgrade base, then upgrade head, all succeed
- with the network switched off, the app shell and offline page load
- language switch works between en, hi, hinglish
- make test passes, including claims_lint

Update docs/PROGRESS.md and docs/KNOWN_GAPS.md. Commit. STOP and report.
```

**Exit criteria**
- [ ] `make dev` runs the whole stack from a clean clone
- [ ] Four roles can log in; RBAC blocks the wrong role
- [ ] Migrations run up and down
- [ ] Design-system page renders with all six evidence tags and glass fallback
- [ ] en / hi / hinglish switch works; Devanagari renders correctly
- [ ] App shell loads offline
- [ ] Smoke tests and claims lint pass

---

# PROMPT C — ML AND SCIENTIFIC ENGINES

```
Read CLAUDE.md and docs/PROGRESS.md. This is PHASE C: ML and scientific engines.
Follow the data ladder in 0.8 and the claims policy in 0.7. Train ONLY what the data supports.

PIPELINE (ml/): ingest -> clean -> features -> split -> train -> evaluate -> serialize -> infer -> explain
-> tests. One codebase for real and synthetic data.

TASKS
1. Data layer: ingest whatever DATA_AUDIT says is usable. Build the physically plausible NIR synthetic
   generator (ml/synthetic/) and the synthetic silage-sensor generator. Everything synthetic carries
   data_provenance=synthetic_demo.
2. NIR preprocessing module: reflectance, absorbance = log10(1/R), bad-band removal, replicate averaging,
   Raw / SNV / MSC / Detrend / SG-1st / SG-2nd. Preprocessing is a pipeline step chosen INSIDE nested CV.
3. Nutrition models (moisture/DM, CP, NDF, ADF; optional starch/fat): PLSR baseline (components chosen
   inside CV), then SVR, Random Forest, XGBoost/LightGBM comparison. Group-aware splits by sample, batch
   and farm. Independent held-out test set.
4. Applicability domain: PCA + Hotelling T2 + Q-residual, thresholds from training data, statuses
   IN_DOMAIN / CAUTION / INVALID. Tests must prove an obviously out-of-range spectrum returns INVALID and
   a null value.
5. Spectral anomaly: PCA scores + Isolation Forest / One-Class SVM.
6. Silage rules engine (pure Python, apps/api/app/rules/): load silage_rules.yaml, implement 0.11, output
   the six risk outputs with contributing factors. Generate the JSON copy for the web app. Create
   ml/tests/golden/silage_cases.json (>= 25 cases: healthy, high-DM tolerance for higher pH, heating from
   air ingress, fermentation failure, missing inputs -> indeterminate, sensor fault).
7. RGB module: image-quality checks (blur via Laplacian variance, glare, exposure, framing/distance hints
   with the retake messages "Move closer." "Improve lighting." "Hold camera steady."); colour and texture
   features; classical visible-mould heuristic tagged ESTIMATED with documented limits. If a real labelled
   image dataset exists, train the classifier and segmenter and follow the same rules as the NIR models.
8. Strip/assay readers: reference-card detection, white-balance correction, strip-pad detection,
   RGB -> CIELAB, reference comparison. pH-strip reader maps to pH with uncertainty. Urea assay reader
   returns a screening class only. If card or lighting validation fails, return NO number and the
   "Unable to validate test image - retake required." state. Generate synthetic test images (labelled DEMO)
   with a reference card, to test both success and failure paths.
9. Explainability: SHAP for tree models, VIP/coefficients and influential wavelength bands for PLSR,
   overlay/occlusion for the mould heuristic (Grad-CAM only if a CNN exists).
10. Metrics: training writes real metric files (JSON) per model.
    Regression: MAE, RMSE, R2, bias, RPD, error by feed type, applicability-domain rate.
    Classification: accuracy, precision, recall, specificity, F1, AUROC where appropriate, confusion
    matrix, false-negative rate for safety hazards, calibration + Brier score.
11. Serialize models (joblib, ONNX where practical) and register them in a model_registry file/table with
    version, data hash, provenance, metrics path.
12. Auto-generate docs/model_cards/<model>.md: purpose, training dataset, provenance, modality, target,
    preprocessing, metrics, intended use, not-intended use, limitations, failure modes, applicability
    domain, version, hash. Synthetic-trained models carry the synthetic banner.
13. Inference API in ml/infer that returns the full prediction envelope from 0.6.

VERIFY (paste real output)
- `make train` runs end to end and writes metric files and model cards
- pytest for ml/ passes, including leakage tests (no sample appears in two partitions), AD tests,
  golden silage cases, and strip-reader failure path
- print the real metrics table; state clearly whether each model is real-data or synthetic

Update docs/PROGRESS.md, docs/MODEL_LIMITATIONS.md, docs/SCIENCE_NOTES.md (every rule with its source and
its verified / needs_expert_review status). Commit. STOP and report.
```

**Exit criteria**
- [ ] Every trained model has a metric file, model card, version and hash
- [ ] No sample crosses train/test partitions (test proves it)
- [ ] Out-of-range spectrum returns `INVALID` with `value = null`
- [ ] Silage golden cases pass; missing inputs give `indeterminate`, never zeros
- [ ] Strip reader refuses to return a number when validation fails
- [ ] Every synthetic artifact is labelled and flagged in metrics
- [ ] No image-model accuracy is claimed without a real labelled dataset

---

# PROMPT D — BACKEND

```
Read CLAUDE.md and docs/PROGRESS.md. This is PHASE D: backend.

TASKS
1. Samples: CRUD + image upload. Validate MIME and size, strip EXIF, store a compressed copy. Enforce the
   NIR sample-handling fields from 0.10 when a spectrum is attached.
2. POST /analyze: orchestrator that runs each available modality independently, then late fusion per
   0.12. Response = list of prediction envelopes + overall risk (worst supported hazard) + decision
   (FEED/BLEND/RE-TEST/DISCARD) + modalities_used/missing + input-completeness structure.
3. Advisory engine: RESULT -> ISSUE -> ACTION -> STORAGE -> RISK -> NEXT STEP, as i18n keys with
   parameters, returned in en/hi/hinglish. Conservative rules per 0.12. GET /advisories/{analysis_id}.
   Vet override + annotation endpoint (audited).
4. GET /analyses/{id}/explain: farmer text plus expert evidence (importances, bands, overlays).
5. Sensors: POST /sensors/readings, storage units, GET /storage-units/{id}/readings, alert generation
   from the silage engine (never from an absolute temperature alone).
6. tools/iot_sim: a simulator posting realistic trends for three profiles: healthy, air-ingress heating,
   fermentation failure. Readings are stored with data_provenance=simulated_sensor.
7. Sync: POST /sync/push (idempotent, batched) and GET /sync/pull with the conflict policy in 0.14 and
   a sync_conflicts log. A repeated push must not duplicate records.
8. Traceability: sample-ID handling, signed token per 0.15, GET /verify/{sample_id} returning
   Verified / Unverified / Tampered with the summary fields.
9. PDF: POST /reports/{analysis_id}/pdf via ReportLab: FeedShield branding, sample ID, photo, date,
   quality status, measurements, predictions, evidence tags, confidence, uncertainty, recommendations,
   QR, model version, provenance, scientific disclaimer. Language-aware, with a Devanagari font embedded.
10. Analytics: /analytics/overview, /trends, /alerts (tests over time, quality trends, moisture and
    protein distributions, contamination and adulteration events, silage-risk trends, high-risk queue,
    AD failures, confidence rates).
11. Data collection: POST /data-collection/upload (consent flag required, source, device, lighting,
    feed type, batch, location, lab reference, operator). Role-restricted to admin/vet.
12. GET /models reads the model registry and real metric files. Never fabricate a metric.
13. Audit logging on auth, overrides, uploads, deletions, model changes.

VERIFY (paste real output)
- pytest: full workflow tests for feed-only, silage, missing-modality, low-quality image, strip failure,
  out-of-domain NIR, sync idempotency, QR Verified/Unverified/Tampered, RBAC, advisory in 3 languages
- generated PDF opens; extract its text and run claims_lint on it
- iot_sim produces trend data that triggers the expected alerts

Update docs (DATA_FLOW.md, API notes), PROGRESS.md, KNOWN_GAPS.md. Commit. STOP and report.
```

**Exit criteria**
- [ ] `/analyze` returns full envelopes, `modalities_used/missing`, decision and completeness
- [ ] Repeated sync push creates no duplicates; conflicts are logged
- [ ] QR verification returns all three states correctly (tamper test passes)
- [ ] PDF contains every required element and passes claims lint
- [ ] Simulator triggers the intended alerts without absolute-temperature-only triggers
- [ ] `/models` shows only real metrics

---

# PROMPT E — FARMER FRONTEND

```
Read CLAUDE.md and docs/PROGRESS.md. This is PHASE E: farmer frontend. Follow the design direction in 0.13.

TASKS
1. Farmer Home and the flow HOME -> START TEST -> FEED/SILAGE -> CAPTURE -> QUALITY CHECK -> OPTIONAL
   NIR/SENSOR/ASSAY -> SAMPLE DETAILS -> ANALYZE. Maximum 3 taps to START TEST. Hindi/Hinglish first-class,
   icon-led, 48px+ controls.
2. Image capture: camera or file input, framing overlay, plain-background hint, distance/lighting/blur/
   glare checks with retake hints. Poor images are rejected before analysis.
3. Feed Test and Silage Test screens. Optional inputs use the hardware adapters (simulated by default,
   clearly badged). Manual entry is always available and tagged USER-ENTERED.
4. Analysis Processing: the animated 7-step sequence, tied to real progress where possible; respects
   reduced motion.
5. Analysis Result (hero): sample image, quality gauge (GOOD/ATTENTION/HIGH RISK with icon + text),
   sample ID, type, date, confidence, evidence tags, INPUT COMPLETENESS component (checked / not
   available list), modality list, nutrition profile ("Not measured" when absent), contamination and
   adulteration risk with the exact strings from 0.7, silage quality, anomaly map, explanation,
   recommendation.
6. Explainability screen (plain-language for farmers, evidence view for vet/admin).
7. Advisory screen: the RESULT->...->NEXT STEP chain, the decision, voice readout with toggle and language.
8. History, Compare Samples (side by side with evidence tags), Traceability page, QR display, PDF
   download button.
9. Offline: run the full test offline using on-device image-quality checks and the TypeScript silage
   engine (rules JSON generated from the YAML). Show "Analysed on device - Offline". Save to Dexie, queue
   in the outbox. Sync Center screen with states and SYNC NOW. After sync show "Updated after Sync" with a
   diff; keep the earlier on-device result viewable.
10. Settings and Language screens. Error, empty and loading states everywhere.
11. Vitest: component tests, plus the golden-case parity test running the same silage_cases.json as pytest.

VERIFY (paste real output)
- Vitest passes, including the golden parity test
- manual walk-through on a 390x844 viewport: feed-only flow, silage flow, low-quality image rejection,
  offline run, sync, language switch
- claims_lint passes on the i18n bundles

Update PROGRESS.md and KNOWN_GAPS.md. Commit. STOP and report.
```

**Exit criteria**
- [ ] Farmer can start a test in ≤ 3 taps
- [ ] Bad image is rejected with a specific retake hint
- [ ] Result screen shows evidence tags, input completeness, and exact-string wording from 0.7
- [ ] Full silage test works offline; result labelled "Analysed on device — Offline"
- [ ] Sync produces a visible "Updated after Sync" diff, not a silent change
- [ ] TypeScript and Python silage engines agree on all golden cases
- [ ] Works in en, hi, hinglish with correct fonts

---

# PROMPT F — ADMIN, DEMO, TRACEABILITY

```
Read CLAUDE.md and docs/PROGRESS.md. This is PHASE F: admin, demo and traceability.

TASKS
1. Admin analytics (desktop-first): charts, tables, timelines and drill-down first; no KPI-card wall.
   Tests over time, quality trends, moisture and protein distributions, contamination and adulteration
   events, silage-risk trends, high-risk queue, AD failures, confidence rates, geography where available,
   provenance mix. Cooperative manager view scoped to their farms.
2. Model Performance screen: reads the real metric files and registry. Show model, version, dataset,
   provenance, validation type, real metrics, confusion matrix, calibration, SHAP/feature importance,
   AD rate, low-confidence rate, known limitations. Synthetic models show the banner from 0.7.
3. Data Collection dashboard: upload form (consent, source, device, lighting, feed type, batch, location,
   lab reference, operator), mould annotation, attach NIR / sensor logs / lab results, assign sample IDs,
   flag missing metadata, and dataset-growth counters (Samples, RGB Images, Spectra, Lab References,
   Silage Samples, Assay Results, Validated Batches) read from the database.
4. Storage Monitoring: storage units, live and simulated trend charts, alert timeline, sensor-health.
5. Public QR Verification page: Verified / Unverified / Tampered states, glass verification card,
   summary fields, evidence tags, model version, provenance.
6. TRY DEMO (no login) with 5 scenarios: Healthy Feed, Low-Protein Feed, Suspected Urea Adulteration,
   High-Moisture Feed, Spoilage-Risk Silage. Scenario outputs come from RUNNING the real pipeline on
   demo inputs (never hand-typed results), tagged DEMO, with provenance visible. Use licensed or generated
   imagery and record attributions.
7. HERO DEMO: Healthy vs Spoiled Silage, side by side: images, pH, moisture, temperature, visible mould
   regions, heatmap, risk score, explanation, recommendation. The difference must be understood at a glance.
8. Guided judge tour: 6-8 steps, about 3 minutes, with a skip control. Reset Demo restores the initial state.
9. Complete the design-system page for everything now in use (navigation, modals, sheets, charts).
10. Write the 3-minute judge demo script to docs/DEMO_SCRIPT.md, following the order: problem ->
    hero silage comparison -> evidence tags -> NIR + applicability domain -> offline test and sync ->
    QR + PDF -> real metrics and honesty slide -> paired-dataset roadmap.

VERIFY (paste real output)
- every admin chart loads from real API data; the empty state works with an empty database
- the Model Performance screen shows only numbers that exist in the metric files
- demo runs with no login and Reset Demo returns to the start
- a DEMO badge is visible on every synthetic-fed screen

Update PROGRESS.md and KNOWN_GAPS.md. Commit. STOP and report.
```

**Exit criteria**
- [ ] Admin views lead with charts and tables; cooperative manager is scoped correctly
- [ ] Model Performance numbers trace back to metric files
- [ ] Five demo scenarios run through the real pipeline and are labelled DEMO
- [ ] Hero comparison is instantly understandable
- [ ] Judge tour and Reset Demo work
- [ ] Verification page shows all three states

---

# PROMPT G — QA, HARDENING, DOCS

```
Read CLAUDE.md and docs/PROGRESS.md. This is PHASE G: QA, hardening and documentation. The system must
end up runnable from a clean clone.

TASKS
1. Run everything: make test, pytest, ml tests, Vitest, Playwright.
2. Playwright suites: feed workflow, silage workflow, missing modality, low-quality image rejection,
   pH-strip failure, language switching, QR verification (3 states), advisory generation, RBAC, and the
   OFFLINE E2E below.
3. OFFLINE E2E (must pass): go offline -> open app -> run a full sample test -> save -> close and reload
   -> verify data persists -> go online -> sync -> verify the server record exists -> verify the
   "Updated after Sync" result and diff.
4. Screenshots: capture every major screen at 390x844 and 1440x900 into qa/screenshots/. Review each
   screenshot yourself and fix: generic-looking UI, spacing, hierarchy, typography, contrast, tap-target
   size, responsive breakage, loading/error/empty states, missing DEMO badges, glass stacked on glass.
5. Accessibility: axe checks, keyboard navigation, focus states, reduced-motion and reduced-transparency
   behaviour, colour never the sole status signal.
6. Performance: run Lighthouse mobile and REPORT the measured numbers. Compress images, lazy-load charts.
   Do not quote any latency, model size or accuracy figure you did not measure.
7. Honesty audit: run claims_lint over UI strings, docs and PDF text. Manually check that every result
   screen and PDF page shows evidence tags, and that no synthetic result looks like a field result.
8. Security pass: no committed secrets, rate limits active, file validation, EXIF stripped, RBAC on every
   route, audit log entries present.
9. Documentation: README (setup, `make` targets, demo credentials, architecture summary), ARCHITECTURE,
   ML_ARCHITECTURE, DATA_FLOW, UI_FLOW, SCIENCE_NOTES, MODEL_LIMITATIONS, HARDWARE, OFFLINE, DATA_SOURCES,
   PS_SIH26111_EXTRACT, ADD_A_LANGUAGE, model cards, DATA_AUDIT, DEMO_SCRIPT, KNOWN_GAPS.
10. Final checklist: go through the deliverable list below and mark each item DONE / PARTIAL / NOT BUILT
    with one line of evidence. Be honest. Write it to docs/FINAL_CHECKLIST.md.

FINAL DELIVERABLE LIST
FeedShield frontend · premium agritech UI · mobile farmer experience · FastAPI backend · PostgreSQL · RBAC ·
feed testing · silage testing · RGB analysis · NIR pipeline · spectral preprocessing · PLSR baseline ·
comparison models · applicability-domain checks · explainability · pH measurement · pH strip reader ·
temperature monitoring · optional O2/CO2 architecture · assay-reader architecture · adulteration
screening · mycotoxin risk screening · advisory engine · offline-first · offline AI where feasible · sync
engine · QR traceability · PDF reports · admin analytics · data collection module · English · Hindi ·
Hinglish · demo mode · healthy vs spoiled hero demo · model cards · DATA_AUDIT · dataset docs · hardware
docs · scientific limitations · tests · README

Only stop when the app runs from a clean clone. Report what works, what is partial, and what is not built.
```

**Exit criteria**
- [ ] Clean clone → `make dev` → app works
- [ ] All test suites green, including the offline E2E
- [ ] Screenshots reviewed and defects fixed
- [ ] Lighthouse mobile score reported as measured, not assumed
- [ ] Claims lint and manual honesty audit pass
- [ ] `docs/FINAL_CHECKLIST.md` is honest about gaps

---
---

# RECOVERY PROMPTS

**Context reset (new session mid-project)**
```
Read CLAUDE.md and docs/PROGRESS.md. Summarise the current state in 10 lines: what is finished, what is
partial, what is next. Then continue Phase [X] from the first unmet exit criterion. Do not redo finished work.
```

**Too shallow / stubbed**
```
Audit Phase [X] against its exit criteria. List every criterion as MET / PARTIAL / MISSING with evidence
(file path or command output). Fix MISSING items in priority order. Any stub must be labelled in the UI
and listed in docs/KNOWN_GAPS.md.
```

**Honesty audit**
```
Run claims_lint. Then search the UI strings, docs, PDF templates and demo data for: any result without an
evidence tag, any synthetic or simulated source without a DEMO label, any hard-coded metric, any use of
"detects urea/aflatoxin" for RGB, any precise number shown for an INVALID applicability domain. Fix all
findings and report them.
```

**Out of time — apply the cut-line**
```
Time is short. Apply the cut-line in CLAUDE.md 0.3: freeze all P2, then trim P1 from the bottom. Protect
the P0 slice and the honesty rules. List what you are cutting, mark it NOT BUILT in
docs/FINAL_CHECKLIST.md, and use the remaining time to make the hero demo, offline flow, QR and PDF
flawless.
```

**Data folder still unavailable**
```
PROCEED-FALLBACK. Record in data/DATA_AUDIT.md that the official folder was not accessible. Use the data
ladder in CLAUDE.md 0.8 from rung 3 onward. Label all synthetic outputs DEMO.
```
