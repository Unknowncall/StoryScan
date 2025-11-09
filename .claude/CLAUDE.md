# StoryScan - Claude Context

**Last Updated:** 2025-11-08
**Version:** 1.6.1 (Phase 1, 2 Complete + Major Refactoring + Component Breakdown + Dark Mode Fix)
**Status:** Active Development - Enhanced Code Organization

## Project Overview

StoryScan is a **beautiful web-based disk usage visualizer** for Unraid servers, inspired by WinDirStat and DaisyDisk. Unlike existing solutions (ncdu, Disk Usage Explorer), StoryScan prioritizes aesthetics and user experience while providing powerful visualization and analysis tools.

**Key Differentiator:** This is not just another functional disk analyzer - it's designed to be BEAUTIFUL and delightful to use.

---

## Current State

### What's Built (v1.1.0)

**Core Functionality:**

- ✅ Directory scanning API with recursive file tree generation
- ✅ Interactive treemap visualization using D3.js
- ✅ Click-to-navigate into subdirectories
- ✅ Breadcrumb navigation with path copy
- ✅ Dark/Light mode toggle
- ✅ Responsive hover tooltips with file details
- ✅ Color-coded by file type/extension
- ✅ Statistics dashboard (total size, file count, folder count)
- ✅ Beautiful shadcn/ui component library integration

**Phase 1 Features (Complete):**

- ✅ **Top 10 Largest Items Panel** - Collapsible right sidebar with filter by all/files/folders, click to navigate
- ✅ **Rescan with Auto-Refresh** - Manual refresh + auto-refresh intervals (5m/15m/30m/1h)
- ✅ **Search & Filter Bar** - Real-time search with extension filtering and match count
- ✅ **File Type Breakdown Chart** - D3.js donut chart with clickable categories

**Phase 2 Features (Complete!):**

- ✅ **Path Copy to Clipboard** - Copy paths in Unix/Windows/Unraid formats with toast notifications
- ✅ **Export Functionality** - Export scan results as CSV or JSON with metadata and download
- ✅ **Advanced Filters** - Filter by size range and file age with presets and active filter chips
- ✅ **Comparison Mode** - Side-by-side directory comparison with split-screen treemaps and detailed stats

**Phase 3 Features (Partial - Simplified):**

- ✅ **Alternative View Modes** - 2 visualization modes: Treemap and Tree views
  - **Treemap View:** Original D3.js rectangular treemap (existing)
  - **Tree View:** Collapsible folder tree structure (manual expand/collapse per node)
- ❌ **Sunburst Chart** - Removed (performance issues, complexity)
- ❌ **List View** - Removed (redundant with Tree view)
- ⏳ **Zoom & Pan Controls** - Coming next
- ⏳ **Customizable Color Schemes** - Coming later

**Phase 5 Features (Partial):**

- ✅ **Shareable Links** - Generate URLs with current state, QR codes for mobile access
  - URL state synchronization
  - Share button with modal
  - QR code generation
  - Copy to clipboard
- ⏳ **Keyboard Shortcuts** - Coming later
- ⏳ **Settings Panel** - Coming later

**Major Refactoring (Complete):**

- ✅ **Custom Hooks** - Extracted logic from page.tsx into 4 custom hooks:
  - `useDirectoryScan` - Directory scanning, auto-refresh, and loading states (105 lines, 6 tests)
  - `useNavigation` - Tree navigation and breadcrumb logic (70 lines, 8 tests)
  - `useFileFiltering` - Search, extension, type, size, and date filtering (159 lines, 10 tests)
  - `useComparisonMode` - Comparison mode state management (69 lines, 6 tests)
- ✅ **Layout Components** - Extracted UI sections into 4 layout components:
  - `Header` - Navigation bar with controls and actions (211 lines, 22 tests)
  - `MainContent` - Main content area for single view (150 lines, 13 tests)
  - `ComparisonView` - Comparison mode UI (123 lines, 12 tests)
  - `Sidebar` - Right sidebar with top items (68 lines, 12 tests)
- ✅ **Code Organization** - Reduced page.tsx from 838 to 255 lines (70% reduction)
- ✅ **View Simplification** - Removed redundant views (Sunburst, ListView) for performance and simplicity

**Performance Optimizations:**

- ✅ Depth limiting (max 6 levels)
- ✅ Size filtering (min 0.01% of total)
- ✅ Node count limiting (max 2000 items)
- ✅ Smart label rendering (only on cells large enough)
- ✅ Adaptive borders and styling for small items
- ✅ Debounced search (300ms)
- ✅ Memoized filtering and computations

**Quality Assurance:**

- ✅ 274 passing tests (259 unit + 15 E2E)
- ✅ Jest + React Testing Library for component tests
- ✅ Playwright for E2E tests
- ✅ 100% test pass rate
- ✅ Phase 1 features fully tested (30 tests)
- ✅ Phase 2 features fully tested (70 tests)
  - Path Copy (12 tests)
  - Export (24 tests)
  - Advanced Filters (20 tests)
  - Comparison Mode (14 tests)
- ✅ Phase 3 features fully tested (16 tests)
  - TreeView (8 tests)
- ✅ Phase 5 features fully tested (16 tests)
  - Shareable Links - ShareButton (10 tests)
  - Shareable Links - useUrlState (6 tests)
- ✅ Custom hooks fully tested (36 tests)
  - useDirectoryScan (6 tests)
  - useNavigation (8 tests)
  - useFileFiltering (10 tests)
  - useComparisonMode (6 tests)
  - useUrlState (6 tests)
- ✅ Utility functions fully tested (39 tests)
- ✅ Layout components fully tested (52 tests)
  - Header (22 tests)
  - ComparisonView (12 tests)
  - MainContent (13 tests)
  - Sidebar (12 tests)

**DevOps:**

- ✅ Full CI/CD pipeline with GitHub Actions
- ✅ Pre-commit hooks (husky + lint-staged)
- ✅ Automated releases (pre-release on main, production on tags)
- ✅ Multi-arch Docker builds (amd64 + arm64)
- ✅ GitHub Container Registry integration
- ✅ Comprehensive Makefile for all developer workflows

---

## Tech Stack

### Frontend

- **Framework:** Next.js 14.2.3 (App Router)
- **Language:** TypeScript 5.4.5
- **UI Library:** shadcn/ui (Radix UI primitives)
  - Components: Button, Card, Input, Select, Separator, Dropdown Menu, Dialog, Checkbox, Badge, Label, Toggle, Toggle Group, Sonner (Toast)
- **Styling:** Tailwind CSS 3.4.3
- **Animations:** Framer Motion 11.2.10
- **Visualization:** D3.js 7.9.0
- **Dependencies:** Zod 3.x (validation), lucide-react (icons), sonner (toast notifications)

### Testing

- **Unit Tests:** Jest 30.2.0 + React Testing Library 16.3.0
- **E2E Tests:** Playwright 1.56.1
- **Coverage:** Codecov integration

### DevOps

- **CI/CD:** GitHub Actions
- **Containers:** Docker (multi-stage builds)
- **Registry:** GitHub Container Registry (ghcr.io)
- **Pre-commit:** Husky 9.1.7 + lint-staged 16.2.6
- **Code Quality:** ESLint 8.57.0 + Prettier 3.6.2

### Infrastructure

- **Deployment Target:** Unraid servers (Docker container)
- **Runtime:** Node.js (via Docker)
- **Port:** 3000

---

## Project Structure

```
StoryScan/
├── app/
│   ├── api/
│   │   └── scan/
│   │       └── route.ts          # Directory scanning API endpoint
│   ├── globals.css               # Global styles with CSS variables
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main application page
├── components/
│   ├── ui/                       # shadcn/ui components (button, card, etc.)
│   ├── Breadcrumb.tsx           # Navigation breadcrumb with path copy
│   ├── DirectorySelector.tsx   # Directory picker dropdown
│   ├── Loading.tsx              # Loading spinner
│   ├── Stats.tsx                # Statistics cards
│   ├── Treemap.tsx              # D3 treemap visualization
│   ├── TopItemsPanel.tsx        # Top 10 largest items sidebar
│   ├── SearchBar.tsx            # Search with extension filter
│   ├── FileTypeBreakdown.tsx   # D3 donut chart
│   ├── AdvancedFiltersPanel.tsx # Size/date filters
│   ├── ComparisonStats.tsx      # Side-by-side comparison
│   ├── TreeView.tsx             # Collapsible tree view
│   └── ShareButton.tsx          # Shareable links with QR code
├── hooks/
│   ├── useDirectoryScan.ts      # Directory scanning logic
│   ├── useNavigation.ts         # Navigation state management
│   ├── useFileFiltering.ts      # Search and filtering logic
│   ├── useComparisonMode.ts     # Comparison mode logic
│   ├── useUrlState.ts           # URL state synchronization
│   └── use-toast.ts             # Toast notifications
├── lib/
│   └── utils.ts                 # Utilities (formatting, export, clipboard)
├── types/
│   └── index.ts                 # TypeScript type definitions
├── __tests__/                   # Jest unit tests
├── e2e/                         # Playwright E2E tests
├── public/                      # Static assets
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # CI/CD pipeline
├── .husky/                      # Git hooks
├── Dockerfile                   # Multi-stage Docker build
├── Makefile                     # Developer commands
├── jest.config.js              # Jest configuration
├── playwright.config.ts        # Playwright configuration
├── tailwind.config.ts          # Tailwind configuration
├── next.config.mjs             # Next.js configuration
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration

Documentation:
├── README.md                   # Project overview
├── QUICKSTART.md              # Quick start guide
├── PROJECT_SUMMARY.md         # Detailed project summary
├── RELEASE_WORKFLOW.md        # Release and deployment guide
├── TESTING.md                 # Testing documentation
├── FEATURE_ROADMAP.md         # Planned features (17 features)
└── claude.md                  # This file
```

---

## Key Files to Know

### Core Application Files

**`app/page.tsx`**

- Main application component (recently refactored)
- Uses 4 custom hooks for logic separation
- Manages UI state (dark mode, sidebar, view mode, filters)
- Integrates Header, MainContent, ComparisonView, and Sidebar components
- Reduced from 578 to 255 lines (56% reduction from original 578)
- ~255 lines

**`app/api/scan/route.ts`**

- Backend API endpoint for directory scanning
- Recursively scans file system
- Returns JSON tree structure
- Handles SCAN_DIRECTORIES environment variable
- ~150 lines

**`components/Treemap.tsx`**

- D3.js treemap visualization
- Performance optimizations (depth, size, count limits)
- Interactive (click, hover, navigate)
- Smart label rendering
- ~200 lines

**`components/TopItemsPanel.tsx`** (Phase 1)

- Displayed in collapsible right sidebar
- Shows top 10 largest files/folders/all
- Filter toggle buttons
- Click to navigate
- Copy path button on hover
- Sidebar slides in from right with smooth animations
- Overlay background when open
- ~190 lines

**`components/SearchBar.tsx`** (Phase 1)

- Real-time search with debouncing
- Extension filter dropdown
- Match count display
- Clear filters button
- ~140 lines

**`components/FileTypeBreakdown.tsx`** (Phase 1)

- D3.js donut chart visualization
- File type categorization (Videos, Images, Documents, etc.)
- Click to filter by type
- Animated rendering
- ~290 lines

**`components/Breadcrumb.tsx`** (Phase 2)

- Navigation breadcrumb with path segments
- Copy path dropdown (Unix/Windows/Unraid formats)
- Toast notifications
- Check mark feedback
- ~115 lines

**`components/ComparisonStats.tsx`** (Phase 2)

- Side-by-side directory comparison statistics
- Size difference calculations with percentages
- File and folder count comparisons
- Color-coded increase/decrease indicators
- "Larger Directory" winner display
- ~195 lines

**`components/TreeView.tsx`** (Phase 3)

- Collapsible folder tree structure
- Manual expand/collapse per node (no expand all functionality)
- Shows file/folder icons and sizes
- Navigate by clicking folder names
- Indented hierarchy visualization
- Item count display
- Fully tested (8 tests)
- ~123 lines

**`components/ShareButton.tsx`** (Phase 5)

- Share button with ShadCN Dialog modal
- Migrated from custom modal to Radix UI Dialog component
- Displays current shareable URL
- QR code generation (200x200px)
- Copy to clipboard functionality
- Success/error toast notifications
- Darker backdrop (bg-black/80) for better focus
- Supports Escape key to close
- Fully tested (9 tests)
- ~130 lines

**`components/Header.tsx`** (Layout Component)

- Top navigation bar with logo and title
- Controls: dark mode toggle, refresh, auto-refresh selector
- Action buttons: export, comparison mode, share, sidebar toggle
- Last scan time display with relative formatting
- Fully tested (22 tests)
- ~211 lines

**`components/MainContent.tsx`** (Layout Component)

- Main content area for normal single directory view
- Integrates Stats, SearchBar, AdvancedFiltersPanel, FileTypeBreakdown
- View mode selector (Treemap/Tree toggle)
- Breadcrumb navigation
- Visualization area with conditional rendering
- Fully tested (13 tests)
- ~150 lines

**`components/ComparisonView.tsx`** (Layout Component)

- Comparison mode specific UI
- Instructions card when no comparison selected
- Directory selector for second directory
- Split-screen treemap view for side-by-side comparison
- Comparison statistics display
- Fully tested (12 tests)
- ~123 lines

**`components/Sidebar.tsx`** (Layout Component)

- Right sidebar for top items panel
- Slide-in animation with overlay
- Close button and click-outside-to-close
- Integrates TopItemsPanel component
- Fully tested (12 tests)
- ~68 lines

**`hooks/useUrlState.ts`** (Phase 5)

- URL state synchronization logic
- Parse URL parameters to application state
- Update URL without page reload
- Support for all filter and view mode parameters
- Fully tested (6 tests)
- ~170 lines

**`lib/utils.ts`**

- Utility functions for formatting (bytes, numbers, percentages)
- Color generation for file types
- Path formatting (Unix/Windows/Unraid)
- Clipboard copy functionality
- Export utilities (CSV/JSON generation)
- Download file functionality
- className merging (cn function)
- ~240 lines

### Configuration Files

**`package.json`**

- All dependencies and dev dependencies
- Scripts: dev, build, start, test, test:e2e, lint
- Current version tracking

**`Dockerfile`**

- Multi-stage build (deps, builder, runner)
- Optimized for production
- Non-root user
- ~60 lines

**`.github/workflows/ci-cd.yml`**

- 5 jobs: lint, test, build-docker, create-prerelease, create-production-release
- Runs on push to main/develop and on tags
- Publishes to GitHub Container Registry
- ~250 lines

**`Makefile`**

- 50+ developer commands
- Categories: dev, test, docker, ci, release, quality
- Run `make help` to see all commands

---

## Environment Variables

**Development:**

```bash
SCAN_DIRECTORIES=/Users/zach/Documents/Development/StoryScan
```

**Production (Unraid):**

```bash
SCAN_DIRECTORIES=/data/media,/data/downloads,/data/backups
```

**Docker:**

```bash
docker run -d \
  --name storyscan \
  -p 3000:3000 \
  -e SCAN_DIRECTORIES=/data/media,/data/downloads \
  -v /mnt/user/media:/data/media:ro \
  -v /mnt/user/downloads:/data/downloads:ro \
  ghcr.io/USERNAME/storyscan:latest
```

---

## Development Workflow

### Setup

```bash
make setup              # Complete environment setup
# OR manually:
npm ci
npx playwright install chromium
npx husky install
```

### Daily Development

```bash
make dev                # Start dev server (http://localhost:3000)
make test               # Run unit tests
make test-e2e           # Run E2E tests
make verify             # Run all quality checks + tests
```

### Code Quality

```bash
make lint               # ESLint
make format             # Prettier
make typecheck          # TypeScript
make quality            # All quality checks
```

### Pre-commit Hooks

Automatically run on `git commit`:

1. lint-staged (format + lint changed files)
2. npm test (all unit tests)

To skip (emergency only):

```bash
git commit --no-verify -m "Emergency fix"
```

### Release Process

**Pre-release (automatic on main):**

```bash
git push origin main
# Creates v1.0.X-pre.BUILD_NUMBER
# Publishes to ghcr.io with :latest-pre tag
```

**Production release (manual via tag):**

```bash
make release-patch      # v1.0.X
make release-minor      # v1.X.0
make release-major      # vX.0.0
# Publishes to ghcr.io with :latest and :1.0.0 tags
```

---

## Feature Roadmap

See `FEATURE_ROADMAP.md` for complete details.

**17 planned features across 5 phases:**

### Phase 1: Quick Wins (2 weeks)

1. Top 10 Largest Items Panel
2. Rescan Button with Auto-Refresh
3. Search/Filter Bar
4. File Type Breakdown Chart

### Phase 2: Power User (2 weeks)

5. Path Copy to Clipboard
6. Comparison Mode
7. Export Functionality (CSV/JSON)
8. Advanced Filters

### Phase 3: Visual Enhancements (2 weeks)

9. Alternative View Modes (List, Sunburst, Tree)
10. Zoom & Pan Controls
11. Customizable Color Schemes

### Phase 4: Smart Features (2 weeks)

12. Duplicate File Detection
13. Stale File Finder
14. Space Prediction Tool

### Phase 5: UX & Usability (2 weeks)

15. Keyboard Shortcuts
16. Settings Panel
17. Shareable Links

**Current Focus:** Phase 1 complete, Phase 2 in progress (Path Copy done, Export/Import next)

---

## Important Design Principles

### 1. Beauty First

- This is NOT a utilitarian tool
- Every component should be polished and delightful
- Animations and transitions matter
- Color choices should be intentional and aesthetically pleasing

### 2. Performance Matters

- Large directory trees (millions of files) should be handled gracefully
- Render only what's necessary
- Smart filtering and limiting
- Smooth 60fps animations

### 3. User Experience

- Intuitive navigation
- Helpful tooltips and feedback
- Keyboard shortcuts for power users
- Responsive design (desktop + tablet + mobile)

### 4. Code Quality

- TypeScript for type safety
- Comprehensive test coverage
- Clean, readable code
- Proper error handling

### 5. Maintainability

- Well-documented code
- Consistent patterns
- Reusable components
- Clear separation of concerns

### 6. Test & Document Everything (CRITICAL)

- **ALWAYS write tests when adding new code** - No exceptions
- **ALWAYS update .claude/claude.md when making changes** - Keep documentation current
- Tests must be written BEFORE marking a feature as complete
- Documentation updates are part of the implementation, not optional
- This is not negotiable - tests and docs are as important as the code itself

---

## Common Tasks

### Adding a New Component

1. Create component in `components/` or `components/ui/`
2. Use TypeScript for props
3. Follow shadcn/ui patterns if applicable
4. Add unit tests in `__tests__/components/`
5. Update this file if it's a major component

### Adding a New API Endpoint

1. Create route in `app/api/[name]/route.ts`
2. Export GET/POST/etc functions
3. Return NextResponse.json()
4. Add E2E tests in `e2e/`
5. Update types in `types/index.ts` if needed

### Adding a New Utility Function

1. Add to `lib/utils.ts` or create new file in `lib/`
2. Write unit tests in `__tests__/lib/`
3. Export from module
4. Document with JSDoc comments

### Updating Styles

1. Use Tailwind classes when possible
2. Use CSS variables from `globals.css` for theming
3. Test in both light and dark mode
4. Ensure responsive design (mobile/tablet/desktop)

### Performance Optimization

Current optimization parameters (can be adjusted):

- `maxDepth`: 6 levels
- `minSizePercentage`: 0.01%
- `maxNodes`: 2000 items

Located in: `components/Treemap.tsx:27-29`

---

## Testing

### Unit Tests (Jest + RTL)

```bash
npm test                # Run all unit tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

**Coverage:** 238 tests across utilities, components, custom hooks, and layout components

### E2E Tests (Playwright)

```bash
npm run test:e2e        # Run E2E tests
npm run test:e2e:ui     # Run with UI
```

**Coverage:** 15 tests for API and user flows

### All Tests

```bash
make test-all           # 253 total tests (238 unit + 15 E2E)
npm test                # Run unit tests only (238 tests)
npm run test:e2e        # Run E2E tests only (15 tests)
```

---

## Deployment

### Local Docker Build

```bash
make docker-build       # Build image
make docker-run         # Run container
make docker-logs        # View logs
make docker-stop        # Stop container
```

### Production (Unraid)

```bash
docker pull ghcr.io/USERNAME/storyscan:latest
docker run -d \
  --name storyscan \
  -p 3000:3000 \
  -e SCAN_DIRECTORIES=/data/media,/data/downloads \
  -v /mnt/user/media:/data/media:ro \
  -v /mnt/user/downloads:/data/downloads:ro \
  ghcr.io/USERNAME/storyscan:latest
```

Access at: `http://unraid-server-ip:3000`

---

## Known Issues & Limitations

### Current Limitations

1. No user authentication (single-user app)
2. No persistent storage (scans are ephemeral)
3. No background scanning (scan on-demand only)
4. Limited to configured directories via ENV
5. No file operations (view-only)

### Performance Considerations

- Very large directories (>1M files) may be slow to scan
- Browser memory usage increases with dataset size
- Initial scan can take 30s-2min for multi-TB directories

### Browser Compatibility

- Modern browsers only (Chrome, Firefox, Safari, Edge)
- ES2020+ JavaScript required
- No IE11 support

---

## Future Considerations

### State Management

Current: React useState + props
Consider: Zustand or Redux Toolkit when complexity increases

### Caching

Current: No caching
Consider: IndexedDB for scan result caching

### Backend

Current: Next.js API routes
Consider: Separate Node.js backend if compute needs increase

### Database

Current: None (stateless)
Consider: SQLite/PostgreSQL for historical tracking

---

## Git Workflow

### Branches

- `main` - Production-ready code (triggers pre-releases)
- `develop` - Integration branch
- `feature/*` - Feature branches
- `hotfix/*` - Emergency fixes

### Commit Convention

```
feat: Add new feature
fix: Fix a bug
docs: Documentation changes
refactor: Code refactoring
test: Add or update tests
chore: Maintenance tasks
style: Code style changes
perf: Performance improvements
```

### Creating a Feature

```bash
git checkout develop
git pull
git checkout -b feature/my-feature
# Make changes
git add .
git commit -m "feat: Add my feature"
git push -u origin feature/my-feature
# Create PR to develop
```

---

## Troubleshooting

### Dev Server Won't Start

```bash
# Check if port 3000 is in use
lsof -i :3000
# Kill process if needed
kill -9 <PID>
# Or use different port
PORT=3001 npm run dev
```

### Tests Failing

```bash
# Clear cache
rm -rf .next node_modules coverage
npm ci
# Run tests again
make test-all
```

### Docker Build Issues

```bash
# Check Docker daemon
docker info
# Rebuild without cache
docker build --no-cache -t storyscan:latest .
# Check logs
docker logs storyscan
```

### TypeScript Errors

```bash
# Check types
make typecheck
# Update @types packages
npm update @types/node @types/react @types/d3
```

### Next.js Build Error (useSearchParams)

If you get the error "useSearchParams() should be wrapped in a suspense boundary":

1. **Wrap in Suspense** - Any component using `useSearchParams()` must be wrapped in a `<Suspense>` boundary
2. In `app/page.tsx`, the `HomeContent` component is wrapped in `<Suspense fallback={<Loading />}>`
3. This allows Next.js to properly handle static generation and client-side search params
4. The Suspense fallback shows the loading spinner while the component hydrates

### E2E Tests Failing in CI

If E2E tests are failing in CI with scan errors:

1. **Check SCAN_DIRECTORIES Environment Variable** - The CI workflow must set `SCAN_DIRECTORIES` to a valid directory
2. The `.github/workflows/ci-cd.yml` sets it to `${{ github.workspace }}` for the test job
3. Without this, the scan API defaults to `/data` which doesn't exist in CI
4. The E2E test "should toggle dark mode" checks for theme toggle functionality, not a specific initial state

### Dark Mode Not Working

If dark mode toggle isn't working:

1. **CSS Specificity:** Ensure `.dark` selector is OUTSIDE `@layer base` in `globals.css` (inside the layer causes specificity issues)
2. Check that `window.matchMedia` is available (browser compatibility)
3. Verify `jest.setup.js` has the matchMedia mock for tests
4. Ensure `AppStateContext.tsx` checks for `window.matchMedia` existence
5. Check browser console for errors
6. Verify Tailwind config has `darkMode: 'class'`
7. Inspect `<html>` element in browser DevTools to confirm `dark` class is being added/removed

---

## Resources

### Documentation

- Next.js 14 Docs: https://nextjs.org/docs
- shadcn/ui: https://ui.shadcn.com
- D3.js: https://d3js.org
- Tailwind CSS: https://tailwindcss.com
- Playwright: https://playwright.dev

### Project Docs

- README.md - Project overview
- QUICKSTART.md - Getting started
- RELEASE_WORKFLOW.md - CI/CD details
- FEATURE_ROADMAP.md - Future features
- TESTING.md - Testing guidelines

### External Tools

- GitHub Actions: CI/CD automation
- GitHub Container Registry: Docker images
- Codecov: Test coverage tracking

---

## Quick Reference

### Most Common Commands

```bash
make dev                # Start development
make test-all           # Run all tests
make verify             # Quality checks + tests
make docker-build       # Build Docker image
make release-patch      # Create release
make help               # Show all commands
```

### Key Ports

- **3000** - Development server
- **3001** - Backup dev server (if 3000 in use)

### Key Directories

- `components/` - React components
- `app/` - Next.js app router pages and API
- `lib/` - Utility functions
- `__tests__/` - Unit tests
- `e2e/` - E2E tests

---

## Contact & Support

**Repository:** (Add GitHub URL when available)
**Issues:** (Add GitHub Issues URL)
**Discussions:** (Add GitHub Discussions URL)

---

## Status Indicators

**Build Status:** ✅ Passing (274/274 tests)
**Coverage:** ✅ Excellent (All features, hooks, and layout components fully tested)
**CI/CD:** ✅ Configured and working
**Docker:** ✅ Multi-arch builds working
**Documentation:** ✅ Comprehensive and up-to-date
**Performance:** ✅ Optimized for large datasets
**Phase 1:** ✅ Complete (4/4 features) + 30 tests
**Phase 2:** ✅ Complete (4/4 features) + 70 tests
**Phase 3:** 🔄 Partial (1/3 features) - Alternative View Modes (2 views: Treemap & Tree) + 16 tests
**Phase 5:** 🔄 Partial (1/3 features) - Shareable Links complete + 16 tests
**Refactoring:** ✅ Complete - Custom hooks (36 tests) + Layout components (52 tests), Code organization improved 70%

---

**For next Claude session:**

- ✅ Phase 1 is complete and fully tested (4/4 features + 30 tests)
- ✅ Phase 2 is complete and fully tested (4/4 features + 70 tests)
  - Path Copy (12 tests)
  - Export (24 tests)
  - Advanced Filters (20 tests)
  - Comparison Mode (14 tests)
- 🔄 Phase 3 is partial (simplified)
  - ✅ Alternative View Modes - 2 views (Treemap, Tree) + 16 tests
  - ❌ Sunburst Chart - Removed (performance)
  - ❌ List View - Removed (redundant)
  - ⏳ Zoom & Pan Controls - Next to implement
  - ⏳ Customizable Color Schemes - After Zoom & Pan
- 🔄 Phase 5 is partial
  - ✅ Shareable Links - Complete (URL state, QR codes, share modal) + 16 tests
  - ⏳ Keyboard Shortcuts - Coming later
  - ⏳ Settings Panel - Coming later
- ✅ Major refactoring complete (custom hooks, layout components, code organization)
- Total: 274 tests passing (259 unit + 15 E2E)
- **Testing:** All components, hooks, and layout components tested
- **Code Quality:** page.tsx reduced from 838 to 255 lines (70% reduction)
- **Current Progress: 10/17 features (59%)**
- See FEATURE_ROADMAP.md for details
- **Recent Changes:**
  - **Fixed Next.js Build Error (Suspense Boundary)** - Resolved Docker build failure:
    - Wrapped HomeContent component in Suspense boundary
    - Fixed "useSearchParams() should be wrapped in a suspense boundary" error
    - Added Suspense import to page.tsx
    - Build now completes successfully in Docker/CI
    - All 259 unit tests still passing
  - **Fixed E2E Test Failures in CI** - Resolved E2E test failures in GitHub Actions:
    - Added `SCAN_DIRECTORIES` environment variable to CI workflow test job
    - Set to `${{ github.workspace }}` to scan the project directory in CI
    - Fixed dark mode toggle E2E test to check for state change instead of specific initial state
    - All 15 E2E tests now passing in CI (5 API tests + 10 homepage tests)
    - Total test count: 274 tests (259 unit + 15 E2E)
  - **Fixed Dialog Component Z-Index Issues** - Resolved ShareButton modal positioning:
    - Increased Dialog overlay z-index from z-50 to z-[100]
    - Increased Dialog content z-index from z-50 to z-[110]
    - Dialog now properly overlays entire application (not just header)
    - Dialog centers correctly on viewport (not just header area)
    - Updated ShareButton to use shadcn Label and Input components
    - Improved QR code section with dark:bg-white for consistent white background
    - All ShareButton tests passing (9/9)
  - **Migrated to Sonner Toast Notifications** - Replaced custom toast with shadcn/ui Sonner:
    - Installed sonner component (modern, accessible toast library)
    - Replaced all useToast() hooks with direct toast.success/error/info imports
    - Updated ShareButton, Breadcrumb, TopItemsPanel, page.tsx, ComparisonContext
    - Removed dependency on custom use-toast hook
    - Updated layout.tsx to use Sonner Toaster component
    - Added sonner mocking to jest.setup.js for testing
    - Cleaner API: toast.success(), toast.error() instead of toast({ variant })
    - All tests passing (259 total, same as before migration)
  - **Comprehensive shadcn/ui Component Migration** - Replaced native HTML with shadcn components:
    - Installed new components: Checkbox, Badge, Label, Toggle, Toggle Group
    - Replaced native checkboxes with Checkbox component in AdvancedFiltersPanel
    - Replaced badge divs with Badge component (filter chips, counts)
    - Replaced native buttons with Button component in TreeView
    - Replaced native label elements with Label component throughout
    - Added ToggleGroup for view mode selector (Treemap/Tree toggle)
    - Added ToggleGroup for filter buttons in TopItemsPanel (All/Files/Folders)
    - Fixed nested button issue in TopItemsPanel by using div with click handlers
    - All modified component tests passing (41/41 tests)
    - Improved accessibility with proper ARIA labels and semantic HTML
  - **Migrated ShareButton to ShadCN Dialog** - Replaced custom modal with Radix UI Dialog:
    - Installed shadcn/ui Dialog component
    - Refactored ShareButton to use Dialog, DialogContent, DialogHeader components
    - Improved backdrop darkness from bg-black/50 to bg-black/80 for better modal focus
    - Added Escape key support (built-in with Radix Dialog)
    - Updated tests to work with Dialog component (9 tests, all passing)
    - Replaced deprecated QRCode `includeMargin` prop with `marginSize`
  - **Fixed dark mode toggle issue** - Complete fix for theme switching:
    - Root cause: `.dark` CSS selector was inside `@layer base`, causing specificity issues
    - Moved `.dark` selector outside `@layer base` in globals.css for proper CSS variable overrides
    - Added window.matchMedia mock to jest.setup.js for testing compatibility
    - Made AppStateContext defensive by checking window.matchMedia existence
    - All AppStateContext tests now passing (7/7)
    - Dark mode now properly toggles between light and dark themes in the UI
  - Broke down page.tsx into 4 layout components (Header, MainContent, ComparisonView, Sidebar)
  - Added 52 new tests for layout components
  - Improved code maintainability and separation of concerns
