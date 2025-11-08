# StoryScan Feature Roadmap

## Overview

This document outlines all planned features for StoryScan, organized by implementation phase.

## Completion Status

### Phase 1: Quick Wins ✅ COMPLETE (4/4)

1. ✅ Top 10 Largest Items Panel (Collapsible Sidebar)
2. ✅ Rescan Button with Auto-Refresh
3. ✅ Search/Filter Bar
4. ✅ File Type Breakdown Chart

### Phase 2: Power User Features ✅ COMPLETE (4/4)

5. ✅ Path Copy to Clipboard
6. ✅ Comparison Mode
7. ✅ Export Functionality
8. ✅ Advanced Filters

### Phase 3: Visual Enhancements 🔄 IN PROGRESS (1/3)

9. ✅ Alternative View Modes (List, Sunburst, Tree)
10. ⏳ Zoom & Pan Controls
11. ⏳ Customizable Color Schemes

### Phase 4-5: In Progress

- Phase 4: Smart Features (0/3)
- Phase 5: UX & Usability (1/3)

**Total Progress: 10/17 features (59%)**

---

## Phase 1: Quick Wins (High Impact, Low Complexity)

### 1. Top 10 Largest Items Panel

**Priority:** High
**Effort:** 2-3 hours
**Dependencies:** None

**Description:**

- Right sidebar or collapsible panel showing the 10 largest files/folders
- Display name, size, and path for each item
- Click to jump directly to that item in the treemap
- Toggle to show "Top 10 Files" vs "Top 10 Folders"

**Implementation:**

- Create `TopItemsPanel.tsx` component
- Add utility function to extract and sort largest items from file tree
- Add state management for panel visibility
- Implement click navigation to specific treemap nodes

**UI Components:**

- Card with scrollable list
- Each item shows: icon, name (truncated), size, mini progress bar
- Hover shows full path in tooltip
- Click highlights in treemap and navigates if in subdirectory

---

### 2. Rescan Button with Auto-Refresh

**Priority:** High
**Effort:** 1-2 hours
**Dependencies:** None

**Description:**

- Manual rescan button to refresh current directory
- Show "Last scanned: X minutes ago"
- Optional auto-refresh at intervals (5min, 15min, 30min, off)
- Loading state during rescan

**Implementation:**

- Add rescan function to main page state
- Create timer for auto-refresh with interval selector
- Add loading spinner during API call
- Update timestamp after successful scan

**UI Components:**

- Button with refresh icon in header
- Dropdown for auto-refresh interval
- Toast notification on successful rescan
- Skeleton loader during rescan

---

### 3. Search/Filter Bar

**Priority:** High
**Effort:** 3-4 hours
**Dependencies:** None

**Description:**

- Search bar to find files/folders by name
- Real-time filtering as you type
- Highlight matching items in treemap
- Show count of matches
- Filter by file extension dropdown

**Implementation:**

- Create `SearchBar.tsx` component
- Add search state and filtering logic
- Highlight matching nodes in treemap with distinct color/border
- Create extension filter from available extensions in data

**UI Components:**

- Input with search icon
- Clear button (X)
- Results count badge
- Extension filter dropdown
- "No results" state

---

### 4. File Type Breakdown Chart

**Priority:** High
**Effort:** 3-4 hours
**Dependencies:** D3.js (already installed)

**Description:**

- Pie chart or bar chart showing space usage by file type
- Categories: Videos, Images, Documents, Audio, Archives, Code, Other
- Click a category to filter treemap to just that type
- Show percentage and absolute size for each type

**Implementation:**

- Create `FileTypeBreakdown.tsx` component
- Add utility to categorize files by extension
- Build D3 pie chart with animations
- Add click handler to filter main treemap

**UI Components:**

- Animated pie/donut chart
- Legend with color coding
- Hover shows exact counts and sizes
- Interactive - click to filter

**Extension Categories:**

```
Videos: .mp4, .mkv, .avi, .mov, .wmv, .flv, .webm, .m4v
Images: .jpg, .jpeg, .png, .gif, .bmp, .svg, .webp, .tiff
Documents: .pdf, .doc, .docx, .txt, .xlsx, .pptx, .odt
Audio: .mp3, .wav, .flac, .aac, .ogg, .m4a, .wma
Archives: .zip, .rar, .7z, .tar, .gz, .bz2, .iso
Code: .js, .ts, .tsx, .py, .java, .cpp, .c, .h, .css, .html
```

---

## Phase 2: Power User Features

### 5. Path Copy to Clipboard

**Priority:** Medium
**Effort:** 1 hour
**Dependencies:** None

**Description:**

- Click icon next to breadcrumb to copy full path
- Support multiple formats: Unix, Windows (SMB), Unraid
- Toast notification on successful copy
- Copy from anywhere: breadcrumb, hover tooltip, context menu

**Implementation:**

- Add clipboard API integration
- Create copy button component
- Add format selector (Unix: `/mnt/user/path`, SMB: `\\server\share\path`)
- Store server name in environment variable

**UI Components:**

- Copy icon button (clipboard icon)
- Format selector dropdown
- Success toast with copied path preview

---

### 6. Comparison Mode

**Priority:** Medium
**Effort:** 6-8 hours
**Dependencies:** None

**Description:**

- Select two directories to compare side-by-side
- Split-screen view with two treemaps
- Highlight differences in size
- Show which directory uses more space
- Useful for before/after cleanup comparisons

**Implementation:**

- Add comparison mode toggle
- Create split-screen layout component
- Manage two separate scan states
- Add visual indicators for size differences
- Create comparison summary stats

**UI Components:**

- "Enter Comparison Mode" button
- Two directory selectors
- Split treemap view (50/50 or adjustable divider)
- Comparison stats card (total diff, largest diffs)
- Exit comparison mode button

---

### 7. Export Functionality

**Priority:** Medium
**Effort:** 2-3 hours
**Dependencies:** None

**Description:**

- Export scan results as CSV or JSON
- CSV: path, size, type, modified date
- JSON: complete tree structure
- Save for historical comparison
- Import previously saved scans

**Implementation:**

- Create export utility functions
- Add CSV generation (flatten tree to rows)
- Add JSON download (preserve tree structure)
- Add import functionality
- Store metadata (scan date, directory, version)

**UI Components:**

- Export dropdown button (CSV/JSON)
- Import button
- File picker dialog
- Download triggers browser download
- Success/error notifications

---

### 8. Advanced Filters

**Priority:** Medium
**Effort:** 4-5 hours
**Dependencies:** Search/Filter Bar (Phase 1)

**Description:**

- Filter by size range (show only files > 1GB, < 100MB, etc.)
- Filter by date modified (older than X days/months/years)
- Combine multiple filters (large old files)
- Save filter presets
- Show filter chips/tags when active

**Implementation:**

- Create `AdvancedFilters.tsx` component
- Add filter state management
- Implement filtering logic for size and date
- Create filter preset system
- Add clear all filters button

**UI Components:**

- Filter panel (expandable/collapsible)
- Size range sliders
- Date picker or quick presets (1 week, 1 month, 1 year)
- Active filter chips
- Preset dropdown (save, load, delete presets)

---

## Phase 3: Visual Enhancements

### 9. Alternative View Modes

**Priority:** Low
**Effort:** 8-10 hours
**Dependencies:** None

**Description:**

- List view with sortable columns
- Sunburst chart (circular treemap alternative)
- Tree view (traditional folder tree)
- Switch between views seamlessly
- Preserve navigation state across views

**Implementation:**

**List View:**

- Create `ListView.tsx` component
- Table with columns: Name, Size, Type, Modified, Path
- Sortable columns
- Pagination for large datasets
- Click to navigate into directories

**Sunburst Chart:**

- Create `SunburstChart.tsx` component
- D3 sunburst layout
- Center shows current directory
- Rings represent depth levels
- Click to zoom in/out

**Tree View:**

- Create `TreeView.tsx` component
- Collapsible folder tree
- Show sizes next to each item
- Expand/collapse all buttons
- Virtual scrolling for performance

**UI Components:**

- View mode selector (tabs or dropdown)
- Each view component
- Shared navigation state
- Transition animations between views

---

### 10. Zoom & Pan Controls

**Priority:** Low
**Effort:** 4-5 hours
**Dependencies:** D3.js zoom behavior

**Description:**

- Zoom in/out on treemap using mouse wheel or buttons
- Pan around when zoomed in using drag
- Minimap showing current viewport
- Reset zoom button
- Smooth animations

**Implementation:**

- Add D3 zoom behavior to treemap
- Create zoom controls UI
- Add minimap component (small overview)
- Implement zoom constraints (min/max)
- Add reset zoom button

**UI Components:**

- Zoom in/out buttons
- Reset zoom button (fit to screen)
- Minimap overlay (bottom right)
- Zoom level indicator

---

### 11. Customizable Color Schemes

**Priority:** Low
**Effort:** 3-4 hours
**Dependencies:** Settings Panel (Phase 4)

**Description:**

- Multiple color schemes beyond light/dark
- Color by: file type, age, size, depth
- Predefined palettes: Warm, Cool, High Contrast, Monochrome
- Custom color picker for advanced users
- Preview before applying

**Implementation:**

- Create color scheme configuration
- Add color scheme selector
- Update treemap to use selected scheme
- Create color generation utilities for different modes
- Save preference to localStorage

**UI Components:**

- Color scheme dropdown
- Palette preview swatches
- Color by selector (type/age/size/depth)
- Custom color picker (advanced)
- Live preview

**Predefined Schemes:**

```
Default: Blue/Green gradient
Warm: Orange/Red/Yellow
Cool: Blue/Cyan/Purple
High Contrast: Bright colors on dark
Monochrome: Grayscale with size intensity
Rainbow: Full spectrum
File Type: Distinct color per category
```

---

## Phase 4: Smart Features (Require Backend Changes)

### 12. Duplicate File Detection

**Priority:** Medium
**Effort:** 6-8 hours
**Dependencies:** Backend API changes

**Description:**

- Find files with identical names and sizes
- Option for hash-based duplicate detection (slower but accurate)
- Group duplicates together
- Show potential space savings
- Click to view all copies

**Implementation:**

**Backend (`app/api/duplicates/route.ts`):**

- Add endpoint to find duplicates
- Name + size matching (fast)
- Optional MD5/SHA256 hashing (slow but accurate)
- Return groups of duplicate files

**Frontend:**

- Create `DuplicatesPanel.tsx` component
- Display duplicate groups
- Show space that could be saved
- Highlight duplicates in treemap
- Link to file locations

**UI Components:**

- "Find Duplicates" button
- Loading state (can take time)
- Duplicate groups list
- Each group shows: file name, size, count, locations
- "Keep/Delete" actions (future enhancement)

---

### 13. Stale File Finder

**Priority:** Medium
**Effort:** 4-5 hours
**Dependencies:** Backend API changes (file metadata)

**Description:**

- Highlight files not accessed/modified in X time
- Color code by age (green=recent, red=very old)
- Quick filter presets (> 6 months, > 1 year, > 2 years)
- Show potential archive candidates
- Sort by oldest first

**Implementation:**

**Backend:**

- Include `mtime` (modified time) and `atime` (access time) in scan results
- Add filter parameter for date ranges

**Frontend:**

- Add age-based coloring to treemap
- Create `StaleFilesPanel.tsx` component
- List oldest files first
- Quick filter buttons

**UI Components:**

- Age color coding toggle
- Stale files panel
- Age filter slider
- List of oldest files
- Archive/Delete suggestions

**Color Coding:**

```
< 1 month: Green
1-6 months: Yellow
6-12 months: Orange
> 1 year: Red
> 2 years: Dark Red
```

---

### 14. Space Prediction Tool

**Priority:** Low
**Effort:** 2-3 hours
**Dependencies:** None (frontend only)

**Description:**

- "What if" analysis
- Select items in treemap
- Show total space that would be freed
- Visual indication of impact
- Selection basket/cart

**Implementation:**

- Add selection mode toggle
- Multi-select capability in treemap
- Calculate total size of selected items
- Show impact percentage
- Selection summary panel

**UI Components:**

- "Selection Mode" toggle
- Selected items list (basket)
- Total space prediction display
- Impact visualization (progress bar)
- Clear selection button

---

## Phase 5: UX & Usability

### 15. Keyboard Shortcuts

**Priority:** Medium
**Effort:** 3-4 hours
**Dependencies:** None

**Description:**

- Navigate efficiently with keyboard
- Show help overlay with `?`
- Common shortcuts for power users
- Customizable shortcuts (future)

**Implementation:**

- Create keyboard event listener system
- Add shortcut handling to main app
- Create help overlay component
- Add visual indicators for keyboard focus

**Keyboard Shortcuts:**

```
?           - Show help overlay
/           - Focus search bar
Esc         - Clear search / Go up one level / Close panels
←           - Navigate back in breadcrumb
→           - Navigate forward
Backspace   - Go up one level
Space       - Toggle selection (selection mode)
Ctrl/Cmd+C  - Copy current path
Ctrl/Cmd+R  - Rescan current directory
Ctrl/Cmd+E  - Export data
D           - Toggle dark mode
T           - Toggle top items panel
F           - Toggle filters
1-4         - Switch view modes
+/-         - Zoom in/out
0           - Reset zoom
```

**UI Components:**

- Help overlay (modal with shortcut list)
- Keyboard focus indicators
- Toast showing triggered action

---

### 16. Settings Panel

**Priority:** Medium
**Effort:** 3-4 hours
**Dependencies:** None

**Description:**

- Centralized settings management
- Adjust visualization parameters
- Set default directory
- Configure auto-refresh
- Appearance settings
- Import/Export settings

**Implementation:**

- Create `SettingsPanel.tsx` component
- Settings state management (localStorage)
- Settings categories: Appearance, Behavior, Performance, Advanced
- Reset to defaults button

**Settings Categories:**

**Appearance:**

- Color scheme
- View mode default
- Font size
- Show/hide tooltips
- Animation speed

**Behavior:**

- Default directory
- Auto-refresh interval
- Open links in new tab
- Confirmation dialogs

**Performance:**

- Max depth (treemap)
- Min size percentage
- Max nodes
- Animation enabled/disabled

**Advanced:**

- Debug mode
- API endpoint override
- Cache settings
- Log level

**UI Components:**

- Settings button (gear icon)
- Settings modal/panel
- Tabbed categories
- Various input types (toggle, slider, dropdown, text)
- Reset button
- Import/Export settings JSON

---

### 17. Shareable Links ✅ COMPLETE

**Priority:** Low
**Effort:** 2-3 hours
**Dependencies:** None

**Description:**

- Generate URL with current state
- Share specific directory view
- Bookmark frequently checked paths
- QR code for mobile access
- Short URL generation (optional)

**Implementation:** ✅ COMPLETE

- ✅ URL state synchronization with useUrlState hook
- ✅ Encode directory path, filters, view mode in URL
- ✅ Share button component with modal
- ✅ Copy link to clipboard functionality
- ✅ QR code generation (qrcode.react)

**URL Parameters:**

```
?dir=0&path=media/movies
&view=treemap
&search=video
&ext=mp4
&type=Videos
&minSize=1000000
&maxSize=10000000
&olderThan=30
```

**UI Components:** ✅ COMPLETE

- ✅ Share button (share icon) in header
- ✅ Share modal with:
  - Full URL (copyable input field)
  - QR code (200x200px SVG)
  - Copy button with success state
- ✅ Toast notifications for copy feedback
- ✅ Overlay close and modal close buttons

---

## Implementation Strategy

### Phase Prioritization

**Phase 1 (Week 1-2):** Quick Wins

- Top 10 Panel
- Rescan Button
- Search/Filter
- File Type Breakdown

**Phase 2 (Week 3-4):** Power User

- Path Copy
- Comparison Mode
- Export/Import
- Advanced Filters

**Phase 3 (Week 5-6):** Visual Enhancements

- Alternative Views
- Zoom & Pan
- Color Schemes

**Phase 4 (Week 7-8):** Smart Features

- Duplicate Detection
- Stale File Finder
- Space Prediction

**Phase 5 (Week 9-10):** UX & Usability

- Keyboard Shortcuts
- Settings Panel
- Shareable Links

---

## Technical Considerations

### State Management

With this many features, consider migrating to a proper state management solution:

- React Context (current approach, works for now)
- Zustand (lightweight, recommended)
- Redux Toolkit (if complexity increases significantly)

### Performance

- Implement virtualization for list views (react-window)
- Web Workers for expensive computations (duplicates, hashing)
- IndexedDB for caching scan results
- Service Worker for offline support

### Testing

- Unit tests for all new utilities
- Component tests for new UI components
- E2E tests for critical user flows
- Performance testing for large datasets

### API Changes

Several features require backend modifications:

- Duplicate detection endpoint
- File metadata (dates) in scan results
- Advanced filtering on backend
- Caching layer for repeated scans

### Mobile Responsiveness

- Responsive layouts for all new components
- Touch-friendly controls
- Mobile-optimized views
- Progressive Web App (PWA) support

---

## Success Metrics

### User Engagement

- Time on site
- Features used per session
- Return visitor rate

### Performance

- Initial load time < 2s
- Scan time benchmarks
- Treemap render time < 500ms

### User Satisfaction

- Feature usage analytics
- User feedback collection
- Issue reports

---

## Future Considerations

### Advanced Features (Post-Roadmap)

- Machine learning for cleanup suggestions
- Scheduled scans with notifications
- Multi-server support (multiple Unraid servers)
- File preview capabilities
- Bulk operations (move, delete, archive)
- Integration with Unraid API
- Plugin system for extensibility
- Mobile app (React Native)

### Enterprise Features

- User authentication
- Multi-user support
- Activity logging
- Audit trails
- Role-based permissions
- API for third-party integrations

---

## Notes

- All features should maintain the "beautiful" design aesthetic
- Accessibility (WCAG 2.1 AA) should be considered for all new components
- All new code should include TypeScript types
- All new features should have corresponding tests
- Documentation should be updated with each feature
- Changelog should track all additions

---

**Last Updated:** 2025-11-08
**Status:** Phase 1 & 2 Complete! Phase 5 Shareable Links Complete! (10/17 features - 59%)
**Current Version:** 1.5.0
**Test Coverage:** 201 passing tests (186 unit + 15 E2E)
