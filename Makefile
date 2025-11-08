.PHONY: help install dev build start test test-watch test-e2e test-all lint format clean docker-build docker-run docker-stop docker-logs docker-clean docker-compose-up docker-compose-down pre-commit-install pre-commit-run ci-status ci-watch release

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "StoryScan - Makefile Commands"
	@echo "=============================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development Commands
install: ## Install dependencies
	@echo "Installing dependencies..."
	npm ci
	@echo "✓ Dependencies installed"

install-dev: ## Install dependencies including dev tools
	@echo "Installing all dependencies..."
	npm install
	npm install -D husky lint-staged prettier eslint
	@echo "✓ Development dependencies installed"

dev: install ## Install and start development server
	@echo "Starting development server..."
	npm run dev

build: ## Build production bundle
	@echo "Building production bundle..."
	npm run build
	@echo "✓ Build complete"

start: build ## Start production server
	@echo "Starting production server..."
	npm start

clean: ## Remove node_modules and build artifacts
	@echo "Cleaning up..."
	rm -rf node_modules
	rm -rf .next
	rm -rf out
	rm -rf dist
	rm -rf coverage
	rm -rf playwright-report
	rm -rf test-results
	@echo "✓ Cleaned"

# Testing Commands
test: ## Run unit tests
	@echo "Running unit tests..."
	npm test

test-watch: ## Run tests in watch mode
	@echo "Running tests in watch mode..."
	npm run test:watch

test-e2e: ## Run E2E tests with Playwright
	@echo "Installing Playwright browsers..."
	npx playwright install chromium
	@echo "Running E2E tests..."
	npm run test:e2e

test-e2e-ui: ## Run E2E tests with Playwright UI
	@echo "Running E2E tests with UI..."
	npm run test:e2e:ui

test-coverage: ## Run tests with coverage
	@echo "Running tests with coverage..."
	npm run test:coverage
	@echo "✓ Coverage report generated in ./coverage"

test-all: test test-e2e ## Run all tests (unit + E2E)
	@echo "✓ All tests complete"

# Code Quality Commands
lint: ## Run ESLint
	@echo "Running ESLint..."
	npm run lint

lint-fix: ## Run ESLint with auto-fix
	@echo "Running ESLint with auto-fix..."
	npx eslint . --ext .ts,.tsx,.js,.jsx --fix

format: ## Format code with Prettier
	@echo "Formatting code..."
	npx prettier --write "**/*.{ts,tsx,js,jsx,json,css,md}"
	@echo "✓ Code formatted"

format-check: ## Check code formatting
	@echo "Checking code formatting..."
	npx prettier --check "**/*.{ts,tsx,js,jsx,json,css,md}"

typecheck: ## Run TypeScript type checking
	@echo "Running TypeScript type check..."
	npx tsc --noEmit
	@echo "✓ Type check passed"

quality: lint typecheck test ## Run all quality checks
	@echo "✓ All quality checks passed"

# Pre-commit Hooks
pre-commit-install: ## Install pre-commit hooks
	@echo "Installing pre-commit hooks..."
	npm install -D husky lint-staged
	npx husky install
	chmod +x .husky/pre-commit
	@echo "✓ Pre-commit hooks installed"

pre-commit-run: ## Run pre-commit hooks manually
	@echo "Running pre-commit hooks..."
	npx lint-staged
	npm test
	@echo "✓ Pre-commit checks passed"

# Docker Commands
docker-build: ## Build Docker image
	@echo "Building Docker image..."
	docker build -t storyscan:latest .
	@echo "✓ Docker image built"

docker-run: ## Run Docker container
	@echo "Running Docker container..."
	docker run -d \
		--name storyscan \
		-p 3000:3000 \
		-e SCAN_DIRECTORIES=/data \
		-v $(PWD):/data:ro \
		storyscan:latest
	@echo "✓ Container started on http://localhost:3000"

docker-stop: ## Stop Docker container
	@echo "Stopping Docker container..."
	docker stop storyscan || true
	docker rm storyscan || true
	@echo "✓ Container stopped"

docker-logs: ## View Docker container logs
	docker logs -f storyscan

docker-shell: ## Open shell in Docker container
	docker exec -it storyscan sh

docker-clean: docker-stop ## Remove Docker container and image
	@echo "Removing Docker image..."
	docker rmi storyscan:latest || true
	@echo "✓ Docker cleaned"

docker-compose-up: ## Start with Docker Compose
	@echo "Starting with Docker Compose..."
	docker-compose up -d
	@echo "✓ Services started"

docker-compose-down: ## Stop Docker Compose
	@echo "Stopping Docker Compose..."
	docker-compose down
	@echo "✓ Services stopped"

docker-compose-logs: ## View Docker Compose logs
	docker-compose logs -f

# CI/CD Commands
ci-status: ## View GitHub Actions workflow status
	@command -v gh >/dev/null 2>&1 || { echo "GitHub CLI (gh) not installed. Install: brew install gh"; exit 1; }
	@gh run list --limit 10

ci-watch: ## Watch current GitHub Actions run
	@command -v gh >/dev/null 2>&1 || { echo "GitHub CLI (gh) not installed. Install: brew install gh"; exit 1; }
	@gh run watch

ci-view: ## View last GitHub Actions run
	@command -v gh >/dev/null 2>&1 || { echo "GitHub CLI (gh) not installed. Install: brew install gh"; exit 1; }
	@gh run view --log

# Release Commands
release-patch: ## Create a patch release (v1.0.X)
	@echo "Current version:"
	@git describe --tags --abbrev=0 2>/dev/null || echo "No tags yet"
	@echo ""
	@echo "Enter new patch version (e.g., v1.0.1):"
	@read version; \
	git tag -a $$version -m "Release $$version"; \
	git push origin $$version
	@echo "✓ Release tag pushed. CI/CD will create the release."

release-minor: ## Create a minor release (v1.X.0)
	@echo "Current version:"
	@git describe --tags --abbrev=0 2>/dev/null || echo "No tags yet"
	@echo ""
	@echo "Enter new minor version (e.g., v1.1.0):"
	@read version; \
	git tag -a $$version -m "Release $$version"; \
	git push origin $$version
	@echo "✓ Release tag pushed. CI/CD will create the release."

release-major: ## Create a major release (vX.0.0)
	@echo "Current version:"
	@git describe --tags --abbrev=0 2>/dev/null || echo "No tags yet"
	@echo ""
	@echo "Enter new major version (e.g., v2.0.0):"
	@read version; \
	git tag -a $$version -m "Release $$version"; \
	git push origin $$version
	@echo "✓ Release tag pushed. CI/CD will create the release."

version: ## Show current version
	@git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0 (no tags yet)"

# Utility Commands
serve: build ## Build and serve production build
	@echo "Serving production build..."
	npm start

analyze: ## Analyze bundle size
	@echo "Building with bundle analyzer..."
	ANALYZE=true npm run build

update-deps: ## Update all dependencies
	@echo "Updating dependencies..."
	npm update
	@echo "✓ Dependencies updated"

audit: ## Run security audit
	@echo "Running security audit..."
	npm audit
	@echo "Running audit fix..."
	npm audit fix
	@echo "✓ Security audit complete"

# Full workflow commands
verify: quality test-all ## Run full verification (quality + tests)
	@echo "✓ Full verification passed"

deploy-local: docker-build docker-run ## Build and run with Docker locally
	@echo "✓ Deployed locally"

# Setup new environment
setup: install pre-commit-install ## Complete setup for new environment
	@echo "Installing Playwright browsers..."
	npx playwright install chromium
	@echo ""
	@echo "✓ Environment setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  - Run 'make dev' to start development server"
	@echo "  - Run 'make test-all' to run all tests"
	@echo "  - Run 'make docker-build' to build Docker image"
