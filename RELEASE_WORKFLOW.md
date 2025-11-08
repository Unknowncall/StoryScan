# StoryScan Release Workflow

## Overview

StoryScan uses an automated CI/CD pipeline with GitHub Actions for releases and deployments.

## Release Types

### 1. Pre-Releases (Automatic)

**Triggered by:** Push to `main` branch

**Version Format:** `v{major}.{minor}.{patch+1}-pre.{build_number}`

- Example: `v1.0.5-pre.123`
- Auto-increments patch version from latest tag
- Appends GitHub Actions build number

**Docker Tags:**

- `v1.0.5-pre.123` (specific version)
- `latest-pre` (rolling pre-release)

**Use Case:**

- Staging environment testing
- Internal validation
- QA testing

### 2. Production Releases (Manual)

**Triggered by:** Creating a git tag matching `v*.*.*`

**Version Format:** `v{major}.{minor}.{patch}`

- Example: `v1.0.0`
- Follows semantic versioning
- No build number suffix

**Docker Tags:**

- `1.0.0` (exact version)
- `1.0` (minor version)
- `1` (major version)
- `latest` (rolling production)

**Use Case:**

- Production deployments
- Stable releases
- Unraid deployment

---

## Branch Strategy

```
feature/foo → develop (PR) → main (PR) → auto pre-release
                                       ↓
                               git tag v1.0.0 → production release
```

### Branches

- **`main`** - Production-ready code, triggers pre-releases
- **`develop`** - Integration branch for features
- **`feature/*`** - Feature development branches
- **`hotfix/*`** - Emergency production fixes

---

## CI/CD Pipeline

### Job Flow

```
Lint → Test → Build Docker → Create Release
  ↓      ↓          ↓              ↓
 ESLint  Jest    Multi-Arch    Pre-release
  +     +E2E       Image         or
TypeCheck Playwright           Production
```

### Jobs

1. **Lint**
   - ESLint for code quality
   - TypeScript type checking
   - Continues on warnings

2. **Test**
   - Jest unit tests (44 tests)
   - Playwright E2E tests (15 tests)
   - Coverage report to Codecov

3. **Build Docker**
   - Multi-architecture (amd64 + arm64)
   - GitHub Container Registry
   - Skipped for PRs

4. **Create Release**
   - Pre-release (main branch)
   - Production release (version tags)
   - Auto-generated changelog
   - Docker image with tags

---

## Developer Workflow

### Daily Development

```bash
# 1. Create feature branch from develop
git checkout develop
git pull
git checkout -b feature/new-feature

# 2. Make changes and commit
# (Pre-commit hooks run automatically)
git add .
git commit -m "feat: Add new feature"

# 3. Push and create PR to develop
git push -u origin feature/new-feature
# Create PR on GitHub → develop

# 4. After approval, merge PR
# CI runs on develop branch
```

### Promoting to Production

```bash
# 1. Create PR from develop to main
# Review changes carefully

# 2. Merge PR to main
# → Pre-release created automatically (e.g., v1.2.4-pre.156)

# 3. Test pre-release
docker pull ghcr.io/YOUR_USERNAME/storyscan:latest-pre
docker run -p 3000:3000 ghcr.io/YOUR_USERNAME/storyscan:latest-pre

# 4. If tests pass, create production release
git checkout main
git pull
git tag v1.2.4
git push origin v1.2.4
# → Production release created automatically
```

### Hotfix Workflow

```bash
# 1. Branch from main
git checkout main
git pull
git checkout -b hotfix/critical-bug

# 2. Fix and commit
git add .
git commit -m "fix: Critical bug fix"

# 3. Push and create PR to main
git push -u origin hotfix/critical-bug
# Create PR → main

# 4. After merge, create immediate release
git checkout main
git pull
git tag v1.2.5
git push origin v1.2.5

# 5. Backport to develop
git checkout develop
git pull
git merge main
git push
```

---

## Using the Makefile

### Setup

```bash
make setup              # Complete environment setup
make install            # Install dependencies only
make pre-commit-install # Install git hooks
```

### Development

```bash
make dev                # Start dev server
make build              # Production build
make start              # Start production server
make clean              # Clean build artifacts
```

### Testing

```bash
make test               # Unit tests only
make test-e2e           # E2E tests only
make test-all           # All tests
make test-coverage      # With coverage report
make verify             # Quality + all tests
```

### Code Quality

```bash
make lint               # Run ESLint
make lint-fix           # Auto-fix issues
make format             # Format with Prettier
make typecheck          # TypeScript check
make quality            # All quality checks
```

### Docker

```bash
make docker-build       # Build image
make docker-run         # Run container
make docker-stop        # Stop container
make docker-logs        # View logs
make docker-clean       # Remove everything
make deploy-local       # Build + run
```

### CI/CD

```bash
make ci-status          # View workflow status
make ci-watch           # Watch current run
make ci-view            # View last run logs
```

### Releases

```bash
make version            # Show current version
make release-patch      # Create v1.0.X release
make release-minor      # Create v1.X.0 release
make release-major      # Create vX.0.0 release
```

---

## Release Commands

### Create Production Release

**Patch Release (Bug fixes):**

```bash
make release-patch
# Or manually:
git tag v1.0.1
git push origin v1.0.1
```

**Minor Release (New features):**

```bash
make release-minor
# Or manually:
git tag v1.1.0
git push origin v1.1.0
```

**Major Release (Breaking changes):**

```bash
make release-major
# Or manually:
git tag v2.0.0
git push origin v2.0.0
```

---

## Docker Deployment

### Pull Images

```bash
# Pre-release (staging)
docker pull ghcr.io/YOUR_USERNAME/storyscan:latest-pre

# Production (latest)
docker pull ghcr.io/YOUR_USERNAME/storyscan:latest

# Specific version
docker pull ghcr.io/YOUR_USERNAME/storyscan:1.0.0
```

### Run Container

```bash
docker run -d \
  --name storyscan \
  -p 3000:3000 \
  -e SCAN_DIRECTORIES=/data/media,/data/downloads \
  -v /mnt/user/media:/data/media:ro \
  -v /mnt/user/downloads:/data/downloads:ro \
  ghcr.io/YOUR_USERNAME/storyscan:latest
```

### Docker Compose (Staging)

```yaml
# docker-compose.staging.yml
version: '3.8'
services:
  storyscan:
    image: ghcr.io/YOUR_USERNAME/storyscan:latest-pre
    ports:
      - '3000:3000'
    environment:
      - SCAN_DIRECTORIES=/data/media,/data/downloads
    volumes:
      - /mnt/user/media:/data/media:ro
      - /mnt/user/downloads:/data/downloads:ro
    restart: unless-stopped
```

### Docker Compose (Production)

```yaml
# docker-compose.production.yml
version: '3.8'
services:
  storyscan:
    image: ghcr.io/YOUR_USERNAME/storyscan:1.0.0 # Pin to specific version
    ports:
      - '3000:3000'
    environment:
      - SCAN_DIRECTORIES=/data/media,/data/downloads,/data/backups
    volumes:
      - /mnt/user/media:/data/media:ro
      - /mnt/user/downloads:/data/downloads:ro
      - /mnt/user/backups:/data/backups:ro
    restart: always
    mem_limit: 2g
```

---

## Pre-Commit Hooks

Hooks run automatically before each commit:

1. **Lint-staged** - Format and lint changed files
2. **Tests** - Run full test suite

### Setup

```bash
make pre-commit-install
```

### Run Manually

```bash
make pre-commit-run
```

### Skip (Emergency only)

```bash
git commit --no-verify -m "Emergency fix"
```

---

## Semantic Versioning

Follow semantic versioning for releases:

### Patch (v1.0.X)

- Bug fixes
- Minor improvements
- Documentation updates
- No API changes

### Minor (v1.X.0)

- New features
- Backwards compatible
- API additions
- New components

### Major (vX.0.0)

- Breaking changes
- API redesign
- Major refactoring
- Migration required

---

## Commit Message Format

Use conventional commits for better changelogs:

```
feat: Add user authentication
fix: Resolve memory leak in treemap
docs: Update API documentation
refactor: Simplify directory scanning
test: Add integration tests for API
chore: Update dependencies
style: Format code with prettier
perf: Optimize treemap rendering
```

---

## Monitoring Releases

### GitHub UI

- Go to Actions tab
- View workflow runs
- Check job logs
- Download artifacts

### GitHub CLI

```bash
# Install
brew install gh
gh auth login

# View runs
gh run list --limit 10

# Watch current run
gh run watch

# View logs
gh run view --log
```

### Releases Page

- GitHub → Releases
- View all releases
- Download assets
- View changelogs

### Packages Page

- GitHub → Packages
- View Docker images
- See all tags
- Pull instructions

---

## Troubleshooting

### Pre-commit hooks failing

```bash
# Update hooks
npm install -D husky lint-staged

# Reinstall
npx husky install
chmod +x .husky/pre-commit
```

### Docker build failing in CI

- Check `.dockerignore` is correct
- Verify all dependencies in `package.json`
- Test locally: `make docker-build`

### Release not created

- Check branch protection rules
- Verify `GITHUB_TOKEN` permissions
- Check workflow logs

### Tests failing in CI

- Run locally: `make test-all`
- Check environment differences
- Review Playwright configuration

---

## Quick Reference

```bash
# Setup new environment
make setup

# Daily development
make dev

# Before committing
make verify

# Create release
make release-patch

# View CI status
make ci-status

# Deploy locally
make deploy-local
```

---

## Next Steps

1. ✅ Push to GitHub to trigger first CI run
2. ✅ Configure branch protection rules
3. ✅ Create first pre-release (merge to main)
4. ✅ Test pre-release in staging
5. ✅ Create first production release (git tag)
6. ✅ Deploy to Unraid with production image

**Your CI/CD pipeline is ready! 🚀**
