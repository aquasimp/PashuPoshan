# FeedShield — AI-Powered Feed & Silage Intelligence

> **SIH 2026 · Problem Statement SIH26111**  
> *Smart AI-Enabled Rapid Feed and Silage Quality Testing System for Dairy Farmers*  
> Ministry of Fisheries, Animal Husbandry & Dairying · Department of Animal Husbandry & Dairying  
> **Tagline:** *Test. Understand. Act.*

---

## 🌾 Overview

**FeedShield** is a rapid screening, measurement, prediction, and decision-support platform designed for Indian dairy farmers and rural milk cooperatives. By combining on-device computer vision, portable Near-Infrared (NIR) chemometrics, digital probe telemetry, and an expert silage fermentation risk engine, FeedShield empowers farmers to detect spoilage, prevent mycotoxicosis, verify feed purity, and optimize milk yield.

FeedShield strictly enforces the **Honesty Policy**: every prediction carries an `<EvidenceTag>` (`DETECTED`, `PREDICTED`, `ESTIMATED`, `USER-ENTERED`, `SENSOR-MEASURED`, `DEMO`), an uncertainty interval, an applicability domain check, and clear laboratory referral when out-of-domain.

---

## 🚀 Key Features

* **📱 Mobile-First Offline PWA:** Complete silage quality evaluation and image quality checks operate without internet in the field. Local storage via Dexie / IndexedDB with automatic sync diffing.
* **🧪 Multimodal Late Fusion:** Independent processing of RGB imagery, NIR diffuse reflectance spectra, and digital probes (pH, temperature) unified under the **Worst Supported Hazard** safety principle.
* **🛡️ Expert Silage Risk Engine:** Interprets fermentation risks (air ingress, heating rate, secondary fermentation, mold risk) based on crop type and moisture context, with 100% parity between Python and TypeScript.
* **🔒 Cryptographic Traceability:** Unique `FS-YYYYMMDD-XXXX` sample IDs with HMAC-SHA256 signatures, public QR verification (Verified / Unverified / Tampered), and downloadable bilingual PDF certificates.
* **🗣️ Vernacular & Voice-Enabled:** Full support for English, Hindi (हिन्दी), and Hinglish with Web Speech API audio readout of advisories.
* **👥 4-Tier Role-Based Access Control:** Dedicated interfaces for `Farmer`, `Cooperative Manager`, `Veterinarian`, and `Admin`.

---

## 🛠️ Technology Stack

* **Frontend (`apps/web`):** Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Lucide icons, Recharts, Dexie.js, next-intl, Vitest.
* **Backend (`apps/api`):** Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, ReportLab, PyJWT / Passlib (Bcrypt).
* **Machine Learning (`ml/`):** scikit-learn (PLSR, SVR, Random Forest, Isolation Forest), OpenCV, NumPy, SciPy.
* **Database:** SQLite (local development and demo) & PostgreSQL (production via Docker).

---

## ⚡ Quick Start

### 1. Prerequisites
* Python 3.11+ (or `uv`)
* Node.js v18+ and `pnpm` (or `npm`)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-org/feedshield.git
cd feedshield

# Install web dependencies
pnpm install

# Install python dependencies
pip install -r apps/api/requirements.txt
```

### 3. Initialize Demo Environment
```bash
# Train chemometric models & generate model cards
python ml/train.py

# Seed database with demo accounts & farm records
python tools/seed/seed_data.py
```

### 4. Run Development Servers
```bash
# Terminal 1: Backend API (port 8000)
uvicorn apps.api.app.main:app --reload --port 8000

# Terminal 2: Web PWA (port 3000)
pnpm --filter web dev
```

Visit [http://localhost:3000](http://localhost:3000) to access FeedShield.

---

## 🔑 Demo Credentials

| Role | Email | Password | Primary Interface |
|---|---|---|---|
| **Farmer** | `farmer@feedshield.in` | `Farmer@123` | Mobile-first test flow, voice advisory, QR |
| **Coop Manager** | `manager@feedshield.in` | `Manager@123` | Multi-farmer batches, bunker monitoring |
| **Veterinarian** | `vet@feedshield.in` | `Vet@123` | Spectral evidence, clinical overrides |
| **Admin** | `admin@feedshield.in` | `Admin@123` | Model performance, data collection |

---

## 📜 Claims Policy & Honesty Enforcement

FeedShield code, documentation, and user interfaces are guarded by a continuous integration claims linter (`ml/claims_lint.py`). Run the linter anytime via:
```bash
python ml/claims_lint.py
```
