# PashuPoshan / FeedShield — Polish Baseline Audit (W0)

**Date of Audit:** 2026-09-30  
**Auditor:** FeedShield / PashuPoshan AI Systems Engineering Team  
**Standard:** `FeedShield_Polish_Pass_v2.md` Workstream W0  

---

## 1. Automated Test & Build Baseline

| Test Suite / Gate | Command | Baseline Result | Status |
|---|---|---|---|
| **Scientific Claims Linter** | `python ml/claims_lint.py` | 22 rules, 143 files scanned, 0 violations | `VERIFIED` |
| **Backend & ML Pytest** | `pytest apps/api/tests ml/tests` | 45 passed in 8.51s (Auth/Health: 9, Workflows: 4, ML: 7, Silage Golden: 25) | `VERIFIED` |
| **Silage Engine Parity** | `vitest run test/silageParity.test.ts` | 25/25 golden parity cases passed (0.00% drift between Python & TS) | `VERIFIED` |
| **Frontend Unit & Smoke (Vitest)**| `pnpm --filter web test:run` | 33 passed in 6.70s (Parity: 25, Offline Sync: 3, Smoke: 5) | `VERIFIED` |
| **Playwright Baseline Capture** | `pnpm exec playwright test e2e/capture_baseline.spec.ts` | 68/68 passed in 21.7s (17 routes × 2 viewports × local + live) | `VERIFIED` |
| **Production Build (Next.js 14)** | `pnpm --filter web build` | 21/21 static routes generated, 0 type errors, 0 lint errors | `VERIFIED` |

---

## 2. Screenshot Inventory (`qa/baseline/`)

68 baseline images captured and stored in `qa/baseline/`:
- **Local Production Server (`http://localhost:3000`):**
  - 17 routes @ 1440×900 Desktop (`local_*_1440x900.png`)
  - 17 routes @ 390×844 Mobile (`local_*_390x844.png`)
- **Live Vercel Production Site (`https://pashuposhann.vercel.app`):**
  - 17 routes @ 1440×900 Desktop (`live_*_1440x900.png`)
  - 17 routes @ 390×844 Mobile (`live_*_390x844.png`)

---

## 3. Visual & Functional Defect Register (Pre-Polish)

| Defect ID | Route | Viewport | Defect Description | Target Workstream |
|---|---|---|---|---|
| **DEF-01** | All (`Navbar`) | Desktop (1440×900) | Brand logo text collides with navigation link (`PashuPoshanFeed & Silage Quality`). 8 links + 3 language buttons + sync pill crowd top bar. | **W3** |
| **DEF-02** | All (`Navbar`) | Mobile (390×844) | Mobile top header lacks dedicated thumb-friendly bottom navigation bar. | **W3** |
| **DEF-03** | Global (`<title>`, branding) | All | Product name is PashuPoshan instead of canonical **FeedShield** per Section 1. | **W1 / W2** |
| **DEF-04** | Global (`app/layout.tsx`) | Mobile (390×844) | Viewport meta enforces `maximum-scale=1, user-scalable=no`, blocking zoom and failing accessibility. | **W4** |
| **DEF-05** | Global (`app/layout.tsx`) | All | Theme-color is hard-coded to `#1F4D3A`. Needs scheme-specific media tags and dynamic theme reactivity. | **W1** |
| **DEF-06** | `/` (Home) | All | Hero copy overclaims: *"Instant AI evaluation of … moisture, core bunker heating … directly on your smartphone"*. | **W4** |
| **DEF-07** | `/` (Home) | All | Node card references real cooperative: *"Anand Cooperative Milk Union"*. Must use fictional entity. | **W4** |
| **DEF-08** | `/` (Home) | All | Alert card lacks DEMO and `ESTIMATED` badge. Uses forbidden word *"Detected"* for rule output. | **W4** |
| **DEF-09** | Global (Styling) | All | Dark mode uses generic dark green instead of pitch-black base (`#030303`) with 6 distinct liquid glass depth levels and static ambient glow. | **W1** |
| **DEF-10** | `/settings` & Voice | Mobile & Desktop | Voice output lacks sentence chunking, separate voice language setting (Follow app / Hindi / English), normalizer, and comprehensive test suite. | **W6** |
| **DEF-11** | `/models` | Desktop & Mobile | Four field validation items need explicit localized PENDING chips per Section 11. | **W7** |
| **DEF-12** | PDF & QR | Document | PDF templates need FeedShield canonical branding, multi-language parity (en, hi, hinglish), and verified QR link decoding. | **W8** |

---
**Baseline Phase W0 Gate:** COMPLETE. Proceeding to Workstream W1.
