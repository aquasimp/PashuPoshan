# SIH26111 Problem Statement & Requirements Traceability Matrix

**Problem Statement Code:** SIH26111  
**Title:** Smart AI-Enabled Rapid Feed and Silage Quality Testing System for Dairy Farmers  
**Ministry / Department:** Ministry of Fisheries, Animal Husbandry & Dairying / Department of Animal Husbandry & Dairying  
**Theme:** Agriculture, FoodTech & Rural Development  

---

## 1. Problem Context & Objectives

Indian dairy farming is dominated by smallholder farmers with 2–5 cattle. Cattle feed (concentrates, green fodder, dry roughage, and silage) constitutes 60–70% of dairy operational expenses and directly dictates milk yield, milk fat/SNF, and animal health.

Key challenges addressed:
1. **Slow & Inaccessible Lab Testing:** Traditional wet-chemistry testing (Kjeldahl for protein, Soxhlet for fat, Van Soest for fiber) takes 5–15 days and costs ₹1,500–₹5,000 per sample, which is impractical for daily feeding decisions.
2. **Quality Variation & Adulteration:** Feed concentrates are frequently adulterated with urea, sand, marble powder, or low-quality fillers.
3. **Silage Spoilage & Aerobic Deterioration:** Improper compaction, late harvesting, or air-ingress cause secondary fermentation, butyric acid buildup, mold growth, and mycotoxins (e.g. Aflatoxin M1 in milk).
4. **Connectivity Constraints:** Rural farms frequently have intermittent or no mobile connectivity during silage pit openings or feeding times.
5. **Language & Usability Barriers:** Smallholder farmers require intuitive, visual, vernacular (Hindi/Hinglish), and voice-enabled recommendations.

---

## 2. Requirements Traceability Matrix

| Requirement ID | SIH26111 Requirement | FeedShield Feature | Tier | Implementation Mechanism |
|---|---|---|---|---|
| **REQ-01** | Rapid Silage Quality Assessment | Silage Multi-Factor Risk Engine | **P0** | Fusion of pH + probe/internal temp + ambient temp + moisture/DM into air-ingress, heating, spoilage, fermentation failure, and mold risks. |
| **REQ-02** | Rapid Feed Quality Screening | Multimodal Visual & Quality Triage | **P0** | On-device image quality verification, visual mould estimation, physical form detection, explicit scientific disclaimer banners. |
| **REQ-03** | Rapid Nutrient Estimation | Chemometric NIR Regression Pipeline | **P1** | PLSR baseline, SVR, RF, XGBoost comparison for Moisture/DM, CP, NDF, ADF with Hotelling T² / Q-residual applicability domain check. |
| **REQ-04** | Adulteration & Contamination Screening | Urea Colorimetric Reader & Sand/Silica Warning | **P1** | Reference-card normalized CIELAB colorimetric reading for urea screening; indicative screening banners with lab referral. |
| **REQ-05** | Offline-First Operation | Progressive Web App & Local Dexie Store | **P0** | On-device image QA, pure TypeScript silage rules engine, IndexedDB local persistence, outbox queue with sync diff display. |
| **REQ-06** | Traceability & Authenticity | Unique Sample ID & Signed QR Verification | **P0** | `FS-YYYYMMDD-XXXX` ID format, tamper-evident HMAC-SHA256 signature, public verification portal (Verified/Unverified/Tampered). |
| **REQ-07** | Farmer-Centric Actionable Advisory | Decision Hierarchy (Feed/Blend/Re-test/Discard) | **P0** | Structured advisory (Result → Issue → Action → Storage → Risk → Next Step) with Web Speech API audio readout. |
| **REQ-08** | Multilingual & Vernacular Support | Full i18n Architecture | **P0** | English, Hindi (हिन्दी), and Hinglish with Devanagari font rendering; architecture stubbed for 9 additional regional languages. |
| **REQ-09** | Role-Based Access Control (RBAC) | 4-Tier Security Model | **P0** | `farmer`, `cooperative_manager`, `veterinarian`, `admin` roles with route-level and API token enforcement. |
| **REQ-10** | Continuous Silage Pit / Storage Monitoring | IoT Telemetry Simulator & Pit Trend Charts | **P1** | Trend charts for temperature difference (internal vs ambient) and heating rates with early-warning threshold alerts. |
| **REQ-11** | Transparent & Honest Scientific Claims | Evidence Tagging & Claims Policy | **P0** | Standardized tags (`DETECTED`, `PREDICTED`, `ESTIMATED`, `USER-ENTERED`, `SENSOR-MEASURED`, `DEMO`), prediction envelopes, claims linter. |
| **REQ-12** | Paired Field Dataset Collection | Data Ingestion & Annotation Portal | **P1** | Administrative portal for gathering paired images, spectra, sensor readings, and laboratory reference ground truth. |
| **REQ-13** | Audit Trail & Professional Override | Veterinary Annotation & Audit Log | **P1** | Allows qualified veterinarians to review, annotate, or override advisory decisions with complete audit logging. |
| **REQ-14** | Offline Hardware Adaptability | Simulated & Extensible Hardware Adapters | **P0/P1** | TypeScript adapter layer for NIR, pH, Temp, Gas, and Assay readers; simulated drivers with clear UI badging. |
