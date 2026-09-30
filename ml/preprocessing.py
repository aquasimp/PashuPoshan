import numpy as np
from scipy.signal import savgol_filter
from sklearn.base import BaseEstimator, TransformerMixin


def reflectance_to_absorbance(reflectance: np.ndarray, eps: float = 1e-6) -> np.ndarray:
    """Calculates absorbance A = log10(1 / R)."""
    r_clipped = np.clip(reflectance, eps, 1.0)
    return np.log10(1.0 / r_clipped)


def remove_bad_bands(
    wavelengths: np.ndarray,
    spectra: np.ndarray,
    min_w: float = 920.0,
    max_w: float = 1680.0
) -> tuple[np.ndarray, np.ndarray]:
    """Removes boundary bands prone to high detector noise."""
    mask = (wavelengths >= min_w) & (wavelengths <= max_w)
    return wavelengths[mask], spectra[..., mask]


def average_replicates(spectra_replicates: np.ndarray) -> np.ndarray:
    """Takes median across replicate scans of the same sample."""
    return np.median(spectra_replicates, axis=0)


class StandardNormalVariate(BaseEstimator, TransformerMixin):
    """SNV: centers each individual spectrum and scales by standard deviation."""
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_arr = np.array(X, dtype=float)
        mean = np.mean(X_arr, axis=1, keepdims=True)
        std = np.std(X_arr, axis=1, keepdims=True)
        std[std == 0] = 1.0
        return (X_arr - mean) / std


class Detrend(BaseEstimator, TransformerMixin):
    """Detrend: fits a linear or quadratic polynomial trend and subtracts it."""
    def __init__(self, degree: int = 1):
        self.degree = degree

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_arr = np.array(X, dtype=float)
        n_samples, n_features = X_arr.shape
        x_coords = np.arange(n_features)
        transformed = np.zeros_like(X_arr)
        for i in range(n_samples):
            coeffs = np.polyfit(x_coords, X_arr[i], self.degree)
            trend = np.polyval(coeffs, x_coords)
            transformed[i] = X_arr[i] - trend
        return transformed


class SavitzkyGolayTransformer(BaseEstimator, TransformerMixin):
    """Savitzky-Golay derivative filter."""
    def __init__(self, window_length: int = 15, polyorder: int = 2, deriv: int = 1):
        self.window_length = window_length
        self.polyorder = polyorder
        self.deriv = deriv

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_arr = np.array(X, dtype=float)
        # Ensure window_length is odd and <= n_features
        w = self.window_length
        if w % 2 == 0:
            w += 1
        w = min(w, X_arr.shape[1] if X_arr.shape[1] % 2 != 0 else X_arr.shape[1] - 1)
        return savgol_filter(X_arr, window_length=w, polyorder=self.polyorder, deriv=self.deriv, axis=1)


class MultiplicativeScatterCorrection(BaseEstimator, TransformerMixin):
    """MSC: fits each spectrum against a reference mean spectrum."""
    def __init__(self):
        self.reference_mean_ = None

    def fit(self, X, y=None):
        X_arr = np.array(X, dtype=float)
        self.reference_mean_ = np.mean(X_arr, axis=0)
        return self

    def transform(self, X):
        if self.reference_mean_ is None:
            raise ValueError("MSC transformer must be fitted before transforming.")
        X_arr = np.array(X, dtype=float)
        transformed = np.zeros_like(X_arr)
        ref = self.reference_mean_
        for i in range(X_arr.shape[0]):
            fit = np.polyfit(ref, X_arr[i], 1, full=True)
            slope = fit[0][0]
            intercept = fit[0][1]
            transformed[i] = (X_arr[i] - intercept) / (slope if slope != 0 else 1.0)
        return transformed
