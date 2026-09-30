# FeedShield Database Schema & API Contract

This document provides the canonical specification for all relational tables, schema relationships, and API endpoints per **CLAUDE.md Section 0.9**.

---

## 1. Relational Database Schema (Mermaid ERD)

```mermaid
erDiagram
    ROLES ||--o{ USERS : assigned_to
    USERS ||--o{ FARMS : owns_or_manages
    FARMS ||--o{ STORAGE_UNITS : contains
    FARMS ||--o{ SAMPLES : originates
    DEVICES ||--o{ SPECTRA : acquired_by
    DEVICES ||--o{ SENSOR_READINGS : measured_by

    SAMPLES ||--o{ SAMPLE_IMAGES : has_photo
    SAMPLES ||--o{ SPECTRA : has_spectrum
    SAMPLES ||--o{ SENSOR_READINGS : has_reading
    SAMPLES ||--o{ ASSAYS : has_test_strip
    SAMPLES ||--o{ LABORATORY_RESULTS : benchmarked_against
    SAMPLES ||--o{ ANALYSES : evaluated_in
    SAMPLES ||--o| TRACEABILITY : authenticated_by

    ANALYSES ||--o{ PREDICTIONS : produces
    ANALYSES ||--o{ EVIDENCE : collects
    ANALYSES ||--o| ADVISORIES : generates
    ADVISORIES ||--o{ RECOMMENDATIONS : details

    SAMPLES ||--o{ SYNC_QUEUE : queued_in
    USERS ||--o{ AUDIT_LOGS : performs
    USERS ||--o{ SYNC_CONFLICTS : triggers

    ROLES {
        string id PK
        string name
        string description
    }

    USERS {
        string id PK
        string email UK
        string hashed_password
        string full_name
        string phone
        string role_id FK
        boolean is_active
        datetime created_at
    }

    FARMS {
        string id PK
        string name
        string owner_id FK
        string village
        string district
        string state
        float latitude
        float longitude
        datetime created_at
    }

    STORAGE_UNITS {
        string id PK
        string farm_id FK
        string name
        string unit_type
        float capacity_tons
        datetime sealing_date
        datetime opening_date
    }

    DEVICES {
        string id PK
        string device_type
        string serial_number UK
        string model_name
        string firmware_version
        boolean is_simulated
    }

    SAMPLES {
        string id PK "FS-YYYYMMDD-XXXX"
        string client_id UK
        string farm_id FK
        string storage_unit_id FK
        string sample_type "feed | silage | fodder"
        string crop_or_feed_name
        string physical_form "pellet | mash | chopped_silage | bale"
        datetime collected_at
        string collected_by_id FK
        string sync_status "SAVED_ON_DEVICE | QUEUED | SYNCING | SYNCED | FAILED"
        datetime updated_at
    }

    SAMPLE_IMAGES {
        string id PK
        string sample_id FK
        string file_path
        string thumbnail_path
        integer width
        integer height
        float blur_score
        float glare_score
        float exposure_score
        boolean is_acceptable
    }

    SPECTRA {
        string id PK
        string sample_id FK
        string device_id FK
        string sample_prep "fresh | dried | ground"
        integer replicate_number
        json wavelengths
        json absorbance_values
        datetime acquired_at
    }

    SENSOR_READINGS {
        string id PK
        string sample_id FK
        string storage_unit_id FK
        string device_id FK
        float ph
        float internal_temperature
        float ambient_temperature
        float ambient_humidity
        float o2_percent
        float co2_percent
        string data_provenance
        datetime recorded_at
    }

    ASSAYS {
        string id PK
        string sample_id FK
        string assay_type "urea_strip | aflatoxin_lateral_flow | ph_strip"
        string image_path
        boolean reference_card_detected
        json delta_e_values
        string qualitative_result
        string data_provenance
    }

    LABORATORY_RESULTS {
        string id PK
        string sample_id FK
        string lab_name
        string test_method "Kjeldahl | Soxhlet | VanSoest | HPLC"
        float crude_protein
        float dry_matter
        float ndf
        float adf
        float aflatoxin_b1_ppb
        datetime certified_at
    }

    ANALYSES {
        string id PK
        string sample_id FK
        string overall_risk "GOOD | ATTENTION | HIGH_RISK"
        string action_decision "FEED | BLEND | RE_TEST | DISCARD"
        json modalities_used
        json modalities_missing
        float input_completeness_score
        string triggered_by_id FK
        datetime created_at
    }

    PREDICTIONS {
        string id PK
        string analysis_id FK
        string target_name "dry_matter | crude_protein | ndf | adf | ph"
        float value
        string unit
        string evidence_tag "PREDICTED | ESTIMATED | SENSOR_MEASURED | DEMO"
        float confidence
        json uncertainty
        string model_version
        string data_provenance
        string applicability_domain "IN_DOMAIN | CAUTION | INVALID | NOT_APPLICABLE"
    }

    EVIDENCE {
        string id PK
        string analysis_id FK
        string modality "rgb | nir | sensors | assay"
        string evidence_tag "DETECTED | PREDICTED | ESTIMATED | SENSOR_MEASURED | DEMO"
        string key
        string value_summary
        json details_json
    }

    ADVISORIES {
        string id PK
        string analysis_id FK
        string headline_key
        string issue_key
        string action_key
        string storage_key
        string risk_key
        string next_step_key
        string action_decision "FEED | BLEND | RE_TEST | DISCARD"
        string vet_override_by_id FK
        string vet_annotation
        datetime created_at
    }

    RECOMMENDATIONS {
        string id PK
        string advisory_id FK
        integer step_order
        string recommendation_key
        string severity "info | warning | critical"
    }

    TRACEABILITY {
        string sample_id PK, FK
        string signature_hash
        string signed_token
        string verification_status "Verified | Unverified | Tampered"
        datetime signed_at
    }

    SYNC_QUEUE {
        string id PK
        string client_id
        string payload_json
        string status "pending | in_progress | completed | failed"
        integer retry_count
        datetime created_at
    }

    SYNC_CONFLICTS {
        string id PK
        string sample_id FK
        string client_id
        string conflict_type
        json server_state
        json client_state
        string resolution "server_authoritative | client_authoritative"
        datetime resolved_at
    }

    MODEL_REGISTRY {
        string id PK
        string model_name
        string version
        string modality
        string target_variable
        string data_provenance
        string weights_path
        string metrics_path
        string status "active | archived | candidate"
        datetime trained_at
    }

    AUDIT_LOGS {
        string id PK
        string user_id FK
        string action
        string entity_type
        string entity_id
        json details
        datetime timestamp
    }
```

---

## 2. API Contract Specifications (`/api/v1`)

### Authentication & Authorization
* `POST /api/v1/auth/login`
  * Request: `{"email": "farmer@example.com", "password": "password123"}`
  * Response: `{"access_token": "...", "refresh_token": "...", "token_type": "bearer", "user": {"id": "...", "role": "farmer", "full_name": "..."}}`
* `GET /api/v1/auth/me`
  * Headers: `Authorization: Bearer <token>`
  * Response: User profile with permissions.

### Sample Ingestion & Analysis Orchestrator
* `POST /api/v1/samples`
  * Roles: `farmer`, `cooperative_manager`, `veterinarian`, `admin`
  * Request: Sample metadata (type, crop name, farm ID, collection date).
* `POST /api/v1/samples/{id}/image`
  * Multipart form file upload. Strips EXIF, checks Laplacian blur, stores thumbnail.
* `POST /api/v1/analyze`
  * Request:
    ```json
    {
      "sample_id": "FS-20260930-A101",
      "client_id": "client-uuid-1234",
      "image_id": "img-uuid",
      "spectrum_id": "spec-uuid",
      "sensor_data": {
        "ph": 4.1,
        "internal_temperature": 27.5,
        "ambient_temperature": 24.0,
        "crop_type": "maize_silage",
        "days_since_sealing": 45
      }
    }
    ```
  * Response (incorporating canonical prediction envelope):
    ```json
    {
      "analysis_id": "ana-uuid-99",
      "sample_id": "FS-20260930-A101",
      "overall_risk": "GOOD",
      "action_decision": "FEED",
      "input_completeness": {
        "score": 0.75,
        "modalities_used": ["rgb", "sensors"],
        "modalities_missing": ["nir", "assay"]
      },
      "predictions": [
        {
          "target": "ph",
          "value": 4.1,
          "unit": "pH",
          "evidence_tag": "SENSOR-MEASURED",
          "confidence": 0.95,
          "uncertainty": {"type": "interval", "lower": 4.0, "upper": 4.2, "level": 0.95},
          "model_version": "probe-cal-1.0",
          "data_provenance": "simulated_sensor",
          "modalities_used": ["sensors"],
          "modalities_missing": ["nir"],
          "applicability_domain": "IN_DOMAIN"
        }
      ],
      "silage_assessment": {
        "air_ingress_risk": "low",
        "heating_risk": "low",
        "spoilage_risk": "low",
        "fermentation_failure_risk": "low",
        "mould_risk": "low",
        "sensor_health_warning": "normal"
      },
      "advisory": {
        "headline": "Optimal Silage Fermentation",
        "chain": {
          "result": "Normal lactic acid preservation with stable internal temperature.",
          "issue": "None detected.",
          "action": "Proceed with planned daily feeding ration.",
          "storage": "Keep pit face cleanly cut; reseal plastic sheet tightly after feeding.",
          "risk": "Low spoilage hazard under current airtight management.",
          "next_step": "Re-check core temperature if pit remains open during rain."
        },
        "decision": "FEED"
      }
    }
    ```

### Public Traceability & Verification
* `GET /api/v1/verify/{sample_id}?token={signature_token}`
  * No authentication required.
  * Status returns:
    * `status: "Verified"` (Cryptographic signature valid, hash matched)
    * `status: "Unverified"` (Provisional offline scan, pending central sync)
    * `status: "Tampered"` (Signature invalid or record altered)
  * Returns sample ID, timestamp, model version, evidence tags, and provenance badge.

### Report Generation
* `POST /api/v1/reports/{analysis_id}/pdf`
  * Returns binary PDF stream branded with FeedShield, QR code, bilingual headings, and scientific disclaimers.
