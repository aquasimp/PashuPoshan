import numpy as np
from sklearn.decomposition import PCA


class ApplicabilityDomainEvaluator:
    """
    Evaluates whether a test spectrum resides within the validated
    multivariate chemometric calibration space using Hotelling T² and Q-residual.
    """
    def __init__(self, n_components: int = 5):
        self.n_components = n_components
        self.pca = PCA(n_components=n_components)
        self.t2_95_ = 0.0
        self.t2_99_ = 0.0
        self.q_95_ = 0.0
        self.q_99_ = 0.0
        self.eigenvalues_ = None

    def fit(self, X: np.ndarray):
        X_arr = np.array(X, dtype=float)
        scores = self.pca.fit_transform(X_arr)
        reconstructed = self.pca.inverse_transform(scores)
        residuals = X_arr - reconstructed

        # Eigenvalues (variances of principal components)
        self.eigenvalues_ = np.var(scores, axis=0, ddof=1)
        self.eigenvalues_[self.eigenvalues_ == 0] = 1e-6

        # Hotelling T² for training set
        t2_scores = np.sum((scores ** 2) / self.eigenvalues_, axis=1)
        # Q-residuals (sum of squared reconstruction errors)
        q_scores = np.sum(residuals ** 2, axis=1)

        # Percentile thresholds
        self.t2_95_ = float(np.percentile(t2_scores, 95))
        self.t2_99_ = float(np.percentile(t2_scores, 99))
        self.q_95_ = float(np.percentile(q_scores, 95))
        self.q_99_ = float(np.percentile(q_scores, 99))
        return self

    def evaluate(self, x: np.ndarray) -> dict:
        """
        Evaluates a single spectrum or batch of spectra.
        Returns dict with status ('IN_DOMAIN' | 'CAUTION' | 'INVALID'),
        t2, q, and threshold details.
        """
        x_arr = np.array(x, dtype=float)
        if x_arr.ndim == 1:
            x_arr = x_arr.reshape(1, -1)

        scores = self.pca.transform(x_arr)
        reconstructed = self.pca.inverse_transform(scores)
        residuals = x_arr - reconstructed

        t2_val = float(np.sum((scores ** 2) / self.eigenvalues_, axis=1)[0])
        q_val = float(np.sum(residuals ** 2, axis=1)[0])

        if t2_val > self.t2_99_ or q_val > self.q_99_:
            status = "INVALID"
            message = "Sample outside validated model range — laboratory confirmation recommended."
        elif t2_val > self.t2_95_ or q_val > self.q_95_:
            status = "CAUTION"
            message = "Sample near model boundary — review confidence interval."
        else:
            status = "IN_DOMAIN"
            message = "Within validated calibration domain."

        return {
            "status": status,
            "t2": round(t2_val, 3),
            "q": round(q_val, 5),
            "t2_threshold_95": round(self.t2_95_, 3),
            "t2_threshold_99": round(self.t2_99_, 3),
            "q_threshold_95": round(self.q_95_, 5),
            "q_threshold_99": round(self.q_99_, 5),
            "message": message,
        }
