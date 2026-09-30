.PHONY: dev test test-backend test-frontend test-claims seed train demo lint clean

# Default environment variables
PYTHON ?= .venv/Scripts/python
PNPM ?= pnpm

dev:
	@echo "Starting FeedShield API and Web Frontend..."
	$(PYTHON) -m uvicorn apps.api.app.main:app --reload --port 8000 &
	$(PNPM) --filter web dev

test: test-claims test-brand test-i18n test-backend test-frontend
	@echo "All FeedShield test suites passed!"

test-brand:
	@echo "Running FeedShield Canonical Identity & Brand Linter..."
	$(PYTHON) scripts/brand_lint.py

test-i18n:
	@echo "Running FeedShield I18N Parity & Script Audit..."
	$(PYTHON) scripts/i18n_audit.py

test-claims:
	@echo "Running FeedShield Claims & Honesty Linter..."
	$(PYTHON) ml/claims_lint.py

test-backend:
	@echo "Running Backend & ML Pytest Suite..."
	$(PYTHON) -m pytest apps/api/tests ml/tests -v

test-frontend:
	@echo "Running Web Vitest Suite..."
	$(PNPM) --filter web test:run

seed:
	@echo "Seeding FeedShield Database with Demo Entities..."
	$(PYTHON) tools/seed/seed_data.py

train:
	@echo "Executing FeedShield ML & Chemometrics Training Pipeline..."
	$(PYTHON) ml/train.py

demo: seed train
	@echo "FeedShield demo environment initialized!"

lint:
	$(PNPM) --filter web lint
	$(PYTHON) -m flake8 apps/api ml || true

clean:
	rm -rf .pytest_cache apps/web/.next coverage dist
