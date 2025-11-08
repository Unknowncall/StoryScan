# CI/CD Release Strategy Guide

This document describes a complete CI/CD release strategy for Python applications using GitHub Actions, Docker, and automated versioning. Use this as a blueprint to implement the same strategy in other applications.

## Table of Contents

- [Overview](#overview)
- [Branch Strategy](#branch-strategy)
- [Release Types](#release-types)
- [CI/CD Pipeline Architecture](#cicd-pipeline-architecture)
- [Pre-Commit Hooks](#pre-commit-hooks)
- [Makefile Commands](#makefile-commands)
- [Docker Strategy](#docker-strategy)
- [Implementation Guide](#implementation-guide)
- [Usage Examples](#usage-examples)

---

## Overview

This strategy provides:

- **Automated pre-releases** on every push to `main` branch
- **Production releases** via semantic version tags (e.g., `v1.0.0`)
- **Multi-stage CI/CD pipeline** (lint → test → build → release)
- **Docker image publishing** to GitHub Container Registry
- **Multi-architecture support** (amd64 + arm64)
- **Automatic changelog generation** from git commits
- **Pre-commit hooks** for local quality gates
- **Comprehensive testing** with coverage reports

---

## Branch Strategy

### Main Branches

- **`main`**: Production-ready code
  - Triggers pre-releases automatically on push
  - Protected branch (requires PR reviews)
  - Always deployable

- **`develop`**: Integration branch
  - Feature branches merge here first
  - Runs full CI pipeline
  - No automatic releases

### Feature Branches

- Branch from `develop`
- Naming: `feature/description` or `fix/description`
- Create PR to `develop` when ready
- CI runs on all PRs

### Release Flow

```
feature/foo → develop (PR) → main (PR) → auto pre-release
                                       ↓
                               git tag v1.0.0 → production release
```

---

## Release Types

### 1. Pre-Releases (Automatic)

**Triggered by:** Push to `main` branch

**Version Format:** `v{major}.{minor}.{patch+1}-pre.{build_number}`

- Example: `v0.1.5-pre.123`
- Auto-increments patch version from latest tag
- Appends build number for uniqueness

**Docker Tags:**

- `{version}` (e.g., `v0.1.5-pre.123`)
- `latest-pre`

**Use Case:**

- Testing in staging environments
- Early access testing
- Internal validation

### 2. Production Releases (Manual)

**Triggered by:** Creating a git tag matching `v*.*.*`

**Version Format:** `v{major}.{minor}.{patch}`

- Example: `v1.0.0`
- Follows semantic versioning
- No build number suffix

**Docker Tags:**

- `{version}` (e.g., `1.0.0`)
- `{major}.{minor}` (e.g., `1.0`)
- `{major}` (e.g., `1`)
- `latest`

**Use Case:**

- Production deployments
- Stable releases
- Customer-facing versions

---

## CI/CD Pipeline Architecture

The pipeline consists of 4 main jobs that run sequentially:

### Job 1: Lint (Always Runs)

**Purpose:** Code quality checks

**Steps:**

1. Checkout code
2. Set up Python 3.11
3. Install dependencies
4. Run flake8 (syntax errors, style)
5. Run pylint (code quality)

**Continues on error:** Yes (warnings don't fail the build)

**Runs on:** All pushes and PRs

### Job 2: Test (Depends on Lint)

**Purpose:** Run test suite with coverage

**Steps:**

1. Checkout code
2. Set up Python 3.11
3. Install dependencies
4. Run pytest with coverage
5. Upload coverage to Codecov (optional)

**Coverage settings:**

- Generates XML report
- Shows terminal output
- Fails if tests fail (not coverage)

**Runs on:** All pushes and PRs

### Job 3: Build Docker (Depends on Test)

**Purpose:** Build and publish Docker images

**Steps:**

1. Checkout code
2. Set up Docker Buildx
3. Login to GitHub Container Registry
4. Extract metadata (tags, labels)
5. Build multi-arch image (amd64 + arm64)
6. Push image (not on PRs)

**Conditional:** Skips if triggered by a tag (production handles that)

**Runs on:** Pushes to `main`/`develop` (not PRs)

### Job 4a: Create Pre-Release (Depends on Lint + Test + Build)

**Purpose:** Auto-create pre-release on main branch

**Steps:**

1. Checkout code with full history
2. Get latest tag (or default to v0.0.0)
3. Calculate new version with build number
4. Generate changelog from commits
5. Create GitHub pre-release
6. Build and push Docker image with pre-release tags

**Conditional:** Only runs on pushes to `main` (not tags, not PRs)

**Runs on:** Push to `main` branch

### Job 4b: Create Production Release (Depends on Lint + Test)

**Purpose:** Create production release from version tag

**Steps:**

1. Checkout code with full history
2. Extract version from tag
3. Generate changelog from commits since last tag
4. Create GitHub production release
5. Build and push Docker image with production tags

**Conditional:** Only runs when a version tag is pushed (e.g., `v1.0.0`)

**Runs on:** Tag push matching `v*.*.*`

---

## Pre-Commit Hooks

Local quality gates that run before each commit.

### Configuration File: `.pre-commit-config.yaml`

**Hooks (in order):**

1. **Standard File Checks:**
   - Trim trailing whitespace
   - Fix end of files
   - Check YAML/JSON syntax
   - Check for large files (>1MB)
   - Check for merge conflicts
   - Check for case conflicts
   - Fix mixed line endings (enforce LF)

2. **Code Formatting:**
   - **Black:** Format Python code (120 char lines)
   - **isort:** Sort imports (black-compatible)

3. **Linting:**
   - **Pylint:** Run code quality checks (excludes tests/venv)

4. **Testing:**
   - **Pytest:** Run full test suite

### Setup Commands:

```bash
# Install pre-commit hooks (one-time)
make pre-commit-install

# Run hooks manually
make pre-commit-run

# Skip hooks (emergency only)
git commit --no-verify
```

---

## Makefile Commands

### Local Development

```bash
make install          # Create venv + install dependencies
make dev              # Install and start dev server
make run              # Start FastAPI with hot reload
make run-prod         # Start without reload (production mode)
make clean            # Remove venv and cache files
```

### Testing

```bash
make test             # Run all tests
make test-verbose     # Run with verbose output
make test-cov         # Run with coverage report
make test-cov-html    # Generate HTML coverage report
make test-watch       # Watch mode (re-run on changes)
```

### Linting and Code Quality

```bash
make lint             # Run pylint
make format           # Format with black + isort
make lint-fix         # Format then lint
make pre-commit-install    # Install pre-commit hooks
make pre-commit-run        # Run all hooks manually
```

### Docker

```bash
make docker-build            # Build Docker image
make docker-run              # Run container
make docker-stop             # Stop container
make docker-logs             # View logs
make docker-clean            # Remove container + image
make docker-compose-up       # Start with compose
make docker-compose-down     # Stop compose
```

---

## Docker Strategy

### Dockerfile Best Practices

- Based on `python:3.11-slim` (smaller image)
- Multi-stage build (if needed)
- Non-root user (`appuser`)
- Health check endpoint
- Optimized layer caching
- Environment variables for configuration

### Docker Image Tags

**Development/Feature Branches:**

- `branch-name` (e.g., `develop`, `feature-foo`)

**Pull Requests:**

- `pr-123` (PR number)

**Pre-Releases (main branch):**

- `v0.1.5-pre.123` (versioned)
- `latest-pre` (rolling)

**Production Releases (tags):**

- `1.0.0` (exact version)
- `1.0` (minor version)
- `1` (major version)
- `latest` (rolling)

### Multi-Architecture Support

- Built for: `linux/amd64` and `linux/arm64`
- Uses Docker Buildx
- Single manifest for both architectures
- Pull the right arch automatically

### Registry

- **GitHub Container Registry (ghcr.io)**
- URL: `ghcr.io/{owner}/{repo}`
- Authentication: Uses `GITHUB_TOKEN` (automatic)
- Public or private (configurable)

---

## Implementation Guide

### Step 1: Set Up Repository Structure

Create the following files in your repository:

**`.github/workflows/ci-cd.yml`** - Copy the entire GitHub Actions workflow

**`.pre-commit-config.yaml`** - Copy the pre-commit configuration

**`Makefile`** - Copy all make targets for development and CI/CD

**Configuration Files:**

- `.pylintrc` - Pylint rules
- `.coveragerc` - Coverage configuration
- `pytest.ini` - Pytest settings
- `.dockerignore` - Files to exclude from Docker builds
- `Dockerfile` - Container definition
- `docker-compose.yml` - Docker Compose orchestration

### Step 2: Configure Python Project

**`requirements.txt`** - Add testing and linting dependencies:

```
# Testing
pytest>=8.0.0
pytest-asyncio>=0.21.1
pytest-cov>=4.1.0
pytest-mock>=3.12.0

# Linting
pylint>=3.0.3
black>=23.12.1
isort>=5.13.2
flake8>=6.1.0

# Pre-commit
pre-commit>=3.6.0
```

Install dependencies:

```bash
make install
make pre-commit-install
```

### Step 3: Set Up Docker

**Dockerfile Example:**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "index:app", "--host", "0.0.0.0", "--port", "8000"]
```

Test locally:

```bash
make docker-build
make docker-run
```

### Step 4: Configure GitHub Repository

**Branch Protection Rules (Settings → Branches):**

For `main`:

- ✅ Require pull request reviews (1 approver)
- ✅ Require status checks (lint, test)
- ✅ Require branches to be up to date
- ✅ Do not allow bypassing the above settings

For `develop`:

- ✅ Require status checks (lint, test)

**Secrets and Variables:**

- `GITHUB_TOKEN` is automatic (no setup needed)
- Add `CODECOV_TOKEN` if using Codecov (optional)

**GitHub Container Registry:**

- Go to Settings → Actions → General
- Enable "Read and write permissions"
- Images will be published to `ghcr.io/{owner}/{repo}`

### Step 5: Test the Pipeline

**Test Pre-Release:**

```bash
# Make a change
git checkout -b feature/test-ci
echo "# Test" >> README.md
git add README.md
git commit -m "Test CI pipeline"

# Pre-commit hooks will run locally
# Push to GitHub
git push -u origin feature/test-ci

# Create PR to develop (CI runs)
# Merge PR to develop (CI runs again)
# Create PR from develop to main
# Merge to main → PRE-RELEASE created automatically
```

**Test Production Release:**

```bash
# After merging to main, create a production release
git checkout main
git pull

# Tag and push
git tag v1.0.0
git push origin v1.0.0

# Production release created automatically
```

### Step 6: Verify Results

**Check CI/CD Runs:**

- GitHub → Actions tab
- View workflow runs
- Check each job (lint, test, build, release)

**Check Releases:**

- GitHub → Releases
- See pre-releases (marked as "Pre-release")
- See production releases

**Check Docker Images:**

- GitHub → Packages
- See all published images
- Verify tags are correct

**Pull and Run Image:**

```bash
# Pull pre-release
docker pull ghcr.io/{owner}/{repo}:latest-pre

# Pull production
docker pull ghcr.io/{owner}/{repo}:latest

# Run
docker run -p 8000:8000 ghcr.io/{owner}/{repo}:latest
```

---

## Usage Examples

### Developer Workflow

**Day-to-day development:**

```bash
# 1. Create feature branch
git checkout develop
git pull
git checkout -b feature/new-feature

# 2. Make changes
# ... edit files ...

# 3. Commit (pre-commit hooks run automatically)
git add .
git commit -m "Add new feature"

# 4. Push and create PR
git push -u origin feature/new-feature
# Create PR on GitHub to develop

# 5. After approval, merge PR
# CI runs on develop branch
```

**Promoting to production:**

```bash
# 1. Create PR from develop to main
# Review changes carefully

# 2. Merge PR to main
# → Pre-release created automatically (e.g., v1.2.4-pre.156)

# 3. Test pre-release in staging
docker pull ghcr.io/{owner}/{repo}:latest-pre

# 4. If tests pass, create production release
git checkout main
git pull
git tag v1.2.4
git push origin v1.2.4

# → Production release created automatically
```

### Hotfix Workflow

**For urgent production fixes:**

```bash
# 1. Branch from main
git checkout main
git pull
git checkout -b hotfix/critical-bug

# 2. Fix the issue
# ... make changes ...

# 3. Commit and push
git add .
git commit -m "Fix critical bug"
git push -u origin hotfix/critical-bug

# 4. Create PR directly to main
# Review and merge

# 5. Create production release immediately
git checkout main
git pull
git tag v1.2.5
git push origin v1.2.5

# 6. Backport to develop
git checkout develop
git pull
git merge main
git push
```

### Release Versioning

**Semantic Versioning Rules:**

- **Patch** (v1.2.X): Bug fixes, minor improvements

  ```bash
  git tag v1.2.3
  ```

- **Minor** (v1.X.0): New features, backwards compatible

  ```bash
  git tag v1.3.0
  ```

- **Major** (vX.0.0): Breaking changes
  ```bash
  git tag v2.0.0
  ```

### Docker Deployment

**Using pre-release in staging:**

```bash
# docker-compose.staging.yml
version: '3.8'
services:
  app:
    image: ghcr.io/{owner}/{repo}:latest-pre
    ports:
      - "8000:8000"
    env_file:
      - .env.staging
```

**Using production release:**

```bash
# docker-compose.production.yml
version: '3.8'
services:
  app:
    image: ghcr.io/{owner}/{repo}:1.2.4  # Pin to specific version
    ports:
      - "8000:8000"
    env_file:
      - .env.production
    restart: always
```

**Rolling updates:**

```bash
# Update to latest version
docker-compose pull
docker-compose up -d

# Verify deployment
docker-compose ps
docker-compose logs -f
```

---

## Viewing CI/CD Runs in VS Code

### Option 1: GitHub Pull Requests Extension (Recommended)

Install "GitHub Pull Requests and Issues" extension:

- View workflow runs in sidebar
- See check status on branches
- Click on failed checks for logs
- Real-time status updates

### Option 2: GitHub CLI

Use `gh` CLI in VS Code terminal:

```bash
# Install
brew install gh
gh auth login

# View runs
gh run list --limit 5

# Watch current run
gh run watch

# View failed logs
gh run view --log-failed
```

**Add to shell config for convenience:**

```bash
# Add to ~/.zshrc (permanent)
export GH_PAGER=''  # Disable pager for clean output
alias ghr='gh run list --limit 5'
alias ghrw='gh run watch'

# Reload
source ~/.zshrc
```

**Or add to Makefile:**

```makefile
ci-status:
	@gh run list --limit 5 | cat

ci-watch:
	@gh run watch
```

---

## Customization Tips

### Adjust Version Numbering

Edit the `create-prerelease` job in `.github/workflows/ci-cd.yml`:

```yaml
# Current: v{major}.{minor}.{patch+1}-pre.{build}
NEW_VERSION="v${MAJOR}.${MINOR}.${NEW_PATCH}-pre.${GITHUB_RUN_NUMBER}"

# Alternative: Use commit SHA
NEW_VERSION="v${MAJOR}.${MINOR}.${NEW_PATCH}-pre.${GITHUB_SHA::7}"

# Alternative: Use date
NEW_VERSION="v${MAJOR}.${MINOR}.${NEW_PATCH}-pre.$(date +%Y%m%d)"
```

### Add Deployment Jobs

Add a deployment job after production release:

```yaml
deploy-production:
  name: Deploy to Production
  runs-on: ubuntu-latest
  needs: create-production-release
  if: startsWith(github.ref, 'refs/tags/v')

  steps:
    - name: Deploy to server
      run: |
        # SSH into server
        # Pull new image
        # Restart services
        # Run health checks
```

### Add Notifications

Send notifications on release:

```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "New release: ${{ steps.version.outputs.version }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Different Languages/Frameworks

**For Node.js:**

- Replace `pytest` with `npm test`
- Replace `pylint` with `eslint`
- Replace `black` with `prettier`
- Use `node:18-alpine` base image

**For Go:**

- Use `go test ./...`
- Use `golangci-lint run`
- Use `golang:1.21-alpine` base image

**For Rust:**

- Use `cargo test`
- Use `cargo clippy`
- Use `rust:1.75` base image

---

## Troubleshooting

### Pre-commit hooks failing

```bash
# Update hooks
pre-commit autoupdate

# Clear cache
pre-commit clean

# Reinstall
pre-commit install --install-hooks
```

### Docker build failing in CI

- Check `.dockerignore` includes test files
- Verify all dependencies in `requirements.txt`
- Test locally: `make docker-build`

### Release not created

- Check branch protection rules
- Verify `GITHUB_TOKEN` has write permissions
- Check workflow logs for errors

### Docker image not pushed

- Verify GitHub Container Registry is enabled
- Check Actions permissions (Settings → Actions)
- Ensure not running on a PR (PRs don't push)

---

## Benefits of This Strategy

✅ **Automated Testing:** Every commit runs full test suite
✅ **Code Quality:** Linting on every commit (local + CI)
✅ **Fast Feedback:** Pre-commit hooks catch issues early
✅ **Safe Deployments:** Pre-releases test before production
✅ **Rollback Ready:** Every release has a Docker image
✅ **Changelog Automation:** Generated from commit messages
✅ **Multi-Arch Support:** Works on x86 and ARM (M1/M2)
✅ **Zero Config:** Uses GitHub tokens (no external secrets)
✅ **Developer Friendly:** Local and CI environments match

---

## Quick Reference

### Common Commands

```bash
# Local development
make install && make run

# Before committing
make lint-fix && make test

# Test Docker build
make docker-build && make docker-run

# View CI status
gh run list --limit 5

# Create production release
git tag v1.0.0 && git push origin v1.0.0
```

### Commit Message Format

Follow conventional commits for better changelogs:

```
feat: Add user authentication
fix: Resolve memory leak in worker
docs: Update API documentation
refactor: Simplify database queries
test: Add integration tests for API
chore: Update dependencies
```

---

## Next Steps

After implementing this strategy:

1. **Document your release process** in your README
2. **Train your team** on the workflow
3. **Set up monitoring** for production releases
4. **Configure automatic deployments** (optional)
5. **Add integration tests** to CI pipeline
6. **Set up staging environment** for pre-releases
7. **Configure alerts** for failed deployments

---

**Last Updated:** November 2025
**Compatible With:** GitHub Actions, Docker, Python 3.8+
**License:** Use freely in any project
