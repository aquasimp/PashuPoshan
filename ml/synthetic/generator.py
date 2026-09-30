import os
import json
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple

WAVELENGTHS = np.arange(900, 1702, 2)  # 401 bands: 900, 902, ..., 1700 nm


def generate_single_spectrum(
    dm_pct: float,
    cp_pct: float,
    ndf_pct: float,
    adf_pct: float,
    particle_scatter: float = 1.0,
    baseline_offset: float = 0.2,
    noise_level: float = 0.002,
) -> np.ndarray:
    """
    Generates a physically plausible NIR absorbance spectrum (900-1700 nm)
    based on chemical absorption bands + light scattering physics.
    """
    w = WAVELENGTHS
    absorbance = np.zeros_like(w, dtype=float)

    # 1. Baseline & Multiplicative Scatter (Mie/Rayleigh scattering in powdered/chopped feed)
    # Higher scattering causes a positive baseline offset and a spectral slope
    slope = 0.00015 * particle_scatter
    absorbance += baseline_offset + slope * (w - 900)

    # 2. Water / Moisture Bands
    # Moisture content = (100 - dm_pct) / 100
    moisture_frac = (100.0 - dm_pct) / 100.0
    # Strong fundamental O-H stretch first overtone at 1450 nm (width sigma ~ 35 nm)
    absorbance += moisture_frac * 1.8 * np.exp(-0.5 * ((w - 1450) / 35.0) ** 2)
    # O-H combination band shoulder at 1190 nm (sigma ~ 25 nm)
    absorbance += moisture_frac * 0.45 * np.exp(-0.5 * ((w - 1190) / 25.0) ** 2)

    # 3. Protein Absorption Bands (N-H stretch)
    cp_frac = cp_pct / 100.0
    # First overtone of N-H symmetric stretch at 1510 nm (sigma ~ 22 nm)
    absorbance += cp_frac * 2.2 * np.exp(-0.5 * ((w - 1510) / 22.0) ** 2)
    # Protein combination band at 1680 nm (sigma ~ 20 nm)
    absorbance += cp_frac * 1.1 * np.exp(-0.5 * ((w - 1680) / 20.0) ** 2)
    # Secondary amide band at 1020 nm
    absorbance += cp_frac * 0.3 * np.exp(-0.5 * ((w - 1020) / 18.0) ** 2)

    # 4. Fiber Components (Cellulose, Hemicellulose, Lignin: NDF & ADF)
    ndf_frac = ndf_pct / 100.0
    adf_frac = adf_pct / 100.0
    # C-H stretch 1st overtone in cellulose at 1490 nm
    absorbance += ndf_frac * 0.9 * np.exp(-0.5 * ((w - 1490) / 28.0) ** 2)
    # Lignin aromatic ring C-H band at 1670 nm
    absorbance += adf_frac * 1.0 * np.exp(-0.5 * ((w - 1670) / 24.0) ** 2)
    # Hemicellulose / Pentosan band at 1220 nm
    absorbance += (ndf_frac - adf_frac) * 0.5 * np.exp(-0.5 * ((w - 1220) / 20.0) ** 2)

    # 5. Instrumental Gaussian White Noise (InGaAs photodiode detector)
    noise = np.random.normal(0, noise_level, size=w.shape)
    absorbance += noise

    return absorbance


def generate_synthetic_dataset(
    n_samples: int = 1200,
    seed: int = 42,
) -> Tuple[pd.DataFrame, np.ndarray]:
    """
    Generates n_samples with realistic constituent distributions,
    group-aware batch/farm structures, and reflectance spectra.
    """
    np.random.seed(seed)
    crops = ["maize_silage", "sorghum_silage", "compound_feed", "green_fodder"]

    records = []
    spectra_list = []

    # Create 20 distinct farms, each with 3-5 production batches
    n_farms = 20
    farms = [f"farm_{i:02d}" for i in range(1, n_farms + 1)]

    for i in range(n_samples):
        sample_id = f"SYNTH-{i+1:05d}"
        farm_id = np.random.choice(farms)
        batch_id = f"{farm_id}-batch_{np.random.randint(1, 6):02d}"
        crop_type = np.random.choice(crops, p=[0.40, 0.25, 0.25, 0.10])

        if crop_type == "compound_feed":
            # Concentrate pellet/mash: high DM, high protein, moderate fiber
            dm = np.clip(np.random.normal(88.0, 3.0), 80.0, 94.0)
            cp = np.clip(np.random.normal(20.0, 3.5), 14.0, 28.0)
            ndf = np.clip(np.random.normal(32.0, 4.0), 22.0, 44.0)
            adf = np.clip(ndf * np.random.uniform(0.50, 0.65), 12.0, 28.0)
            scatter = np.random.uniform(0.8, 1.4)
        elif crop_type in ["maize_silage", "sorghum_silage"]:
            # Silage: low-to-moderate DM (28-45%), moderate CP (7-11%), high fiber
            dm = np.clip(np.random.normal(34.0, 5.0), 20.0, 52.0)
            cp = np.clip(np.random.normal(8.5, 1.2), 6.0, 13.0)
            ndf = np.clip(np.random.normal(48.0, 6.0), 36.0, 65.0)
            adf = np.clip(ndf * np.random.uniform(0.55, 0.70), 22.0, 45.0)
            scatter = np.random.uniform(1.1, 1.8)
        else:
            # Green fodder: low DM (15-28%), high moisture
            dm = np.clip(np.random.normal(22.0, 3.5), 12.0, 32.0)
            cp = np.clip(np.random.normal(12.0, 2.5), 7.0, 18.0)
            ndf = np.clip(np.random.normal(55.0, 5.0), 40.0, 68.0)
            adf = np.clip(ndf * np.random.uniform(0.55, 0.68), 24.0, 46.0)
            scatter = np.random.uniform(1.2, 2.0)

        offset = np.random.uniform(0.15, 0.35)
        spec = generate_single_spectrum(dm, cp, ndf, adf, scatter, offset)

        records.append({
            "sample_id": sample_id,
            "farm_id": farm_id,
            "batch_id": batch_id,
            "crop_type": crop_type,
            "dry_matter_pct": round(float(dm), 2),
            "crude_protein_pct": round(float(cp), 2),
            "ndf_pct": round(float(ndf), 2),
            "adf_pct": round(float(adf), 2),
            "data_provenance": "synthetic_demo",
        })
        spectra_list.append(spec)

    df = pd.DataFrame(records)
    spectra_array = np.array(spectra_list)
    return df, spectra_array


def save_synthetic_dataset(output_dir: str = "data/synthetic_demo"):
    os.makedirs(output_dir, exist_ok=True)
    df, spectra = generate_synthetic_dataset()

    meta_path = os.path.join(output_dir, "synthetic_nir_metadata.csv")
    spec_path = os.path.join(output_dir, "synthetic_nir_spectra.npy")
    wavelengths_path = os.path.join(output_dir, "wavelengths.json")

    df.to_csv(meta_path, index=False)
    np.save(spec_path, spectra)
    with open(wavelengths_path, "w") as f:
        json.dump(WAVELENGTHS.tolist(), f)

    print(f"[INFO] Synthetic NIR dataset generated: {len(df)} samples across {len(WAVELENGTHS)} bands.")
    print(f"       Saved to: {meta_path} & {spec_path}")
    return df, spectra


if __name__ == "__main__":
    save_synthetic_dataset()
