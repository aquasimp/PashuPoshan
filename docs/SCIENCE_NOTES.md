# FeedShield Scientific Foundations & Rules Registry

This document records the scientific citations, fermentation chemistry formulas, and verification statuses for every heuristic threshold implemented in `apps/api/app/rules/silage_rules.yaml`.

---

## 1. Silage pH Benchmarks by Crop & Moisture Matrix

| Crop Type | Normal pH Range | Critical High pH Ceiling | Scientific Citation | Verification Status |
|---|---|---|---|---|
| **Maize Silage (Corn)** | 3.70 – 4.20 | 4.60 | Kung, L., et al. (2018). *Silage review: Interpretation of chemical characteristics of silage.* Journal of Dairy Science, 101(5), 4020-4033. | **verified** |
| **Sorghum Silage (Jowar)** | 3.90 – 4.40 | 4.80 | McDonald, P., et al. (1991). *The Biochemistry of Silage.* Chalcombe Publications, Marlow, UK. | **verified** |
| **Grass / Legume Silage** | 4.30 – 4.80 | 5.20 | USDA Agricultural Research Service (2015). *Silage Management Standards & Quality Indicators.* | **verified** |
| **Unspecified Fodder (Default)** | 3.80 – 4.30 | 4.70 | Agronomic Rule of Thumb | **needs_expert_review** |

---

## 2. Dry Matter & Moisture Interactions

* **High Dry Matter (Wilted Silage, DM $\ge$ 45%):**
  * Water activity $a_w$ is restricted, limiting lactic acid bacterial proliferation; hence preservation achieves stability at a higher pH.
  * Applied tolerance bump: $+0.35\text{ pH}$.
  * Citation: Pahlow, G., et al. (2003). *Microbiology of ensiling.* Silage Science and Technology, 42, 31-93.
  * Status: **verified**
* **Low Dry Matter (High Moisture Silage, DM $<$ 30%):**
  * If $\text{pH} > 4.5$, clostridial spores (*Clostridium tyrobutyricum*, *C. butyricum*) ferment lactic acid into butyric acid, degrading protein into ammonia and causing unpalatable foul odor.
  * Status: **verified**

---

## 3. Aerobic Deterioration & Heating Dynamics

* **Temperature Differential Rule:**
  * Heating Warning: $T_{\text{internal}} - T_{\text{ambient}} \ge 5.0^\circ\text{C}$
  * Critical Aerobic Spoilage: $T_{\text{internal}} - T_{\text{ambient}} \ge 10.0^\circ\text{C}$
  * Heating Rate Alarm: $\ge 1.5^\circ\text{C} / \text{day}$
  * Citation: Holmes, B. J., & Muck, R. E. (2007). *Silage bunker management and aerobic stability considerations.* University of Wisconsin Extension.
  * Status: **verified**
