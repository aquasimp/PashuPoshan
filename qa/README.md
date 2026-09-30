# FeedShield QA & Visual Verification

This directory contains QA assets, responsive breakpoint verification notes, and screenshots for mobile (390x844) and desktop (1440x900) views.

## Verification Checklist

1. **Responsive Mobile Check (390x844 - iPhone / Pixel standard):**
   - [x] Sticky Header with Brand, Online/Offline indicator, and Language Selector.
   - [x] Primary 1-tap "Start New Test" button fits in first viewport without scrolling.
   - [x] Storage warnings render in high-contrast amber box with readable text.
   - [x] Minimum 48px touch targets on all interactive controls.
   - [x] Vernacular voice audio player accessible with one thumb tap.

2. **Desktop View (1440x900):**
   - [x] 2-column and 4-column balanced grid layouts.
   - [x] Side-by-side Hero Demo (`/demo/hero`) clearly displays anatomy of healthy vs spoiled silage.
   - [x] Admin Command Center (`/admin`) presents tabular chemometrics metrics (RMSEP, R², RPD).

3. **Accessibility & Contrast:**
   - [x] Color tokens adhere to WCAG AA 4.5:1 contrast standards.
   - [x] System supports `prefers-reduced-motion` and `prefers-reduced-transparency`.
   - [x] Evidence tags and risk chips are distinguished by color, iconography, and text label (never color alone).
