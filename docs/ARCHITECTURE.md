# FeedShield System Architecture

This document outlines the system topology, deployment paradigms, operational workflows, and data synchronization patterns for FeedShield.

---

## 1. System Context Diagram

```mermaid
C4Context
    title FeedShield High-Level System Context

    Person(farmer, "Dairy Farmer", "Tests feed, checks silage risk, receives vernacular voice advisory.")
    Person(vet, "Veterinarian / Nutritionist", "Reviews evidence, inspects spectral models, overrides recommendations.")
    Person(manager, "Cooperative / BMC Manager", "Oversees testing node, tracks batch quality, monitors storage.")
    Person(admin, "Platform Admin", "Monitors models, audits registries, manages field data collection.")

    System(feedshield_web, "FeedShield Web PWA", "Next.js PWA with on-device offline analysis, Dexie DB, vernacular UI.")
    System(feedshield_api, "FeedShield Backend API", "FastAPI, late fusion, chemometrics, PDF generation, sync engine.")
    SystemDb(database, "Relational Database", "PostgreSQL (production) / SQLite (offline demo fallback).")
    System_Ext(hardware, "Simulated Hardware Layer", "Virtual NIR, digital pH/temp probes, assay reader.")

    Rel(farmer, feedshield_web, "Takes sample, captures image, views advice", "HTTPS / PWA")
    Rel(manager, feedshield_web, "Manages shared node, monitors storage", "HTTPS")
    Rel(vet, feedshield_web, "Annotates results, reviews evidence", "HTTPS")
    Rel(admin, feedshield_web, "Inspects performance, downloads data", "HTTPS")

    Rel(feedshield_web, hardware, "Polls readings / reads test strips", "Hardware Adapters")
    Rel(feedshield_web, feedshield_api, "Syncs drafts, fetches ML models, pushes results", "REST / JSON / JWT")
    Rel(feedshield_api, database, "Persists entities, traces, sync logs", "SQLAlchemy 2")
```

---

## 2. Shared Test-Node Deployment Model

FeedShield recognises that smallholder Indian dairy farmers rarely own ₹50,000+ laboratory instruments. Testing services are deployed through **Shared Testing Nodes**:

```mermaid
graph TD
    subgraph "Rural Dairy Ecosystem"
        BMC["Bulk Milk Chilling Centre (BMC) / Dairy Co-op"]
        KVK["Krishi Vigyan Kendra (KVK) / Extension Centre"]
        VetClinic["Veterinary Dispensary / Mobile Clinic"]
        FPO["Farmer Producer Org (FPO) Warehouse"]
    end

    subgraph "Shared Testing Hardware at Node"
        NodeTablet["Shared Tablet / Mobile (FeedShield PWA)"]
        PortableNIR["Portable NIR Sensor (900-1700nm)"]
        Probe["Digital pH & Temp Probe"]
        AssayKit["Colorimetric Urea/Aflatoxin Test Card"]
    end

    subgraph "Individual Dairy Farmers (Hub & Spoke)"
        F1["Farmer A (Smart/Feature Phone)"]
        F2["Farmer B (Visual Printout / QR)"]
        F3["Farmer C (PWA Offline Mode)"]
    end

    BMC --> NodeTablet
    KVK --> NodeTablet
    VetClinic --> NodeTablet
    FPO --> NodeTablet

    PortableNIR --> NodeTablet
    Probe --> NodeTablet
    AssayKit --> NodeTablet

    NodeTablet -->|Delivers PDF / SMS / Voice / QR| F1
    NodeTablet -->|Printable Verified Certificate| F2
    NodeTablet -->|Direct PWA Sync| F3
```

---

## 3. Multimodal Late Fusion Architecture

FeedShield employs **Late Fusion** where each sensory modality is evaluated by a specialized model or rule-set, followed by a deterministic safety arbiter enforcing the **Worst Supported Hazard** principle.

```mermaid
flowchart TD
    subgraph "Input Modalities"
        Img[RGB Sample Photo]
        Spec[NIR Reflectance Spectrum]
        Sensors[pH, Internal & Ambient Temp]
        Meta[Crop Type, Silage Days, Storage Type]
        Assay[Colorimetric Test Strip Photo]
    end

    subgraph "Independent Analytical Engines"
        ImgEngine["Model D: Image Quality & Visible Mould Heuristic\n(Output: Blur/Glare QA, Mould % [ESTIMATED])"]
        NIREngine["Model A & B: Chemometric Pipeline & Domain Filter\n(Output: DM, CP, NDF, ADF [PREDICTED] or INVALID)"]
        SilageEngine["Model C: Multi-Factor Silage Rules Engine\n(Output: Air-ingress, Heating, Spoilage risks)"]
        AssayEngine["Model E: CIELAB Reference Card Colorimetric Reader\n(Output: Urea / pH screening class)"]
    end

    subgraph "Late Fusion & Decision Arbiter"
        Combiner["Multimodal Safety Arbiter\n(Enforces Worst Supported Hazard)"]
        Completeness["Input Completeness Evaluator\n(Tags Modalities Used vs Missing)"]
    end

    subgraph "Advisory & Output Chain"
        Advisory["Advisory Engine\n(RESULT -> ISSUE -> ACTION -> STORAGE -> RISK -> NEXT STEP)"]
        Action["Action Decision\n[FEED | BLEND | RE-TEST | DISCARD]"]
        Report["Signed QR & ReportLab PDF Generation"]
    end

    Img --> ImgEngine
    Spec --> NIREngine
    Sensors --> SilageEngine
    Meta --> SilageEngine
    Assay --> AssayEngine

    ImgEngine --> Combiner
    NIREngine --> Combiner
    SilageEngine --> Combiner
    AssayEngine --> Combiner

    Combiner --> Completeness
    Completeness --> Advisory
    Advisory --> Action
    Action --> Report
```

---

## 4. Offline-First Synchronization Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Dairy Farmer (Offline in Field)
    participant PWA as FeedShield PWA (Browser/Dexie)
    participant LocalEngine as On-Device Silage Engine
    participant API as FeedShield FastAPI Backend
    participant DB as Central Database

    Note over Farmer, PWA: Device is Offline (No Internet)
    Farmer->>PWA: Capture sample image & enter silage probe readings
    PWA->>LocalEngine: Run local validation & silage rules
    LocalEngine-->>PWA: Produce local prediction envelope & advisory
    PWA->>PWA: Store in IndexedDB with temp UUID & sync_status = "SAVED_ON_DEVICE"
    PWA-->>Farmer: Display "Analysed on device — Offline" with Provisional QR

    Note over Farmer, PWA: Farmer travels to Co-op / Regains Connectivity
    PWA->>PWA: Network state change detected (online)
    Farmer->>PWA: Tap "SYNC NOW" (or automated background sync)
    PWA->>API: POST /api/v1/sync/push (batched samples with idempotency keys)
    API->>API: Check idempotency key & execute full multimodal fusion
    API->>DB: Persist official sample, analyses, predictions, evidence
    API->>API: Sign tamper-evident HMAC-SHA256 verification token
    API-->>PWA: HTTP 200 OK (Server Analysis Record, Signed Token, Sync Acknowledgment)
    PWA->>PWA: Update local record: sync_status = "SYNCED"
    PWA->>PWA: Calculate diff between local heuristic and server verified result
    PWA-->>Farmer: Show "Updated after Sync" with transparent side-by-side diff banner
```
