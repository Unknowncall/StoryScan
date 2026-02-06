import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TrackedPathsManager from '@/components/TrackedPathsManager';
import { toast } from 'sonner';

// Mock contexts
const mockAddTrackedPath = jest.fn();
const mockRemoveTrackedPath = jest.fn();
const mockToggleTrackedPath = jest.fn();

const mockUseHistory = jest.fn();
const mockUseScan = jest.fn();

jest.mock('@/contexts/HistoryContext', () => ({
  useHistory: () => mockUseHistory(),
}));

jest.mock('@/contexts/ScanContext', () => ({
  useScan: () => mockUseScan(),
}));

// Mock shadcn/ui Select (Radix UI doesn't render well in jsdom)
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => <div data-testid="select">{children}</div>,
  SelectTrigger: ({ children }: any) => <button data-testid="select-trigger">{children}</button>,
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid={`select-item-${value}`} onClick={() => {}}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

// Mock data
const mockTrackedPaths = [
  {
    id: 1,
    path: '/data/movies',
    label: 'Movies',
    isActive: true,
    createdAt: '2024-01-01',
  },
  {
    id: 2,
    path: '/data/music',
    label: 'Music',
    isActive: false,
    createdAt: '2024-01-02',
  },
];

const mockScanResult = {
  directory: { id: '0', name: 'data', path: '/data' },
  root: {
    name: 'data',
    path: '/data',
    size: 5000000,
    type: 'directory' as const,
    children: [
      {
        name: 'movies',
        path: '/data/movies',
        size: 3000000,
        type: 'directory' as const,
        children: [],
      },
      {
        name: 'music',
        path: '/data/music',
        size: 1000000,
        type: 'directory' as const,
        children: [],
      },
      {
        name: 'photos',
        path: '/data/photos',
        size: 1000000,
        type: 'directory' as const,
        children: [],
      },
    ],
  },
};

// Helper to set up default mocks
function setupMocks(
  overrideHistory: Partial<ReturnType<typeof mockUseHistory>> = {},
  overrideScan: Partial<ReturnType<typeof mockUseScan>> = {}
) {
  mockUseHistory.mockReturnValue({
    trackedPaths: mockTrackedPaths,
    historyData: [],
    timeRange: '1M',
    setTimeRange: jest.fn(),
    isLoading: false,
    error: null,
    addTrackedPath: mockAddTrackedPath,
    removeTrackedPath: mockRemoveTrackedPath,
    toggleTrackedPath: mockToggleTrackedPath,
    refreshHistory: jest.fn(),
    ...overrideHistory,
  });

  mockUseScan.mockReturnValue({
    directories: [],
    selectedDirectory: null,
    scanResult: mockScanResult,
    isLoading: false,
    error: null,
    lastScanTime: null,
    currentNode: null,
    navigationPath: [],
    handleDirectorySelect: jest.fn(),
    handleRefresh: jest.fn(),
    handleNodeClick: jest.fn(),
    handleBreadcrumbNavigate: jest.fn(),
    ...overrideScan,
  });
}

describe('TrackedPathsManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  // 1. Renders "Tracked Paths" title
  it('renders the "Tracked Paths" title', () => {
    render(<TrackedPathsManager />);
    expect(screen.getByText('Tracked Paths')).toBeInTheDocument();
  });

  // 2. Shows empty state when no tracked paths
  it('shows empty state when no tracked paths', () => {
    setupMocks({ trackedPaths: [] });
    render(<TrackedPathsManager />);
    expect(screen.getByText(/No paths tracked yet/i)).toBeInTheDocument();
  });

  // 3. Renders list of tracked paths with labels
  it('renders list of tracked paths with labels', () => {
    render(<TrackedPathsManager />);
    expect(screen.getByText('Movies')).toBeInTheDocument();
    expect(screen.getByText('Music')).toBeInTheDocument();
  });

  // 4. Shows "paused" badge for inactive paths
  it('shows "paused" badge for inactive paths', () => {
    render(<TrackedPathsManager />);
    // Music is inactive (isActive: false), so it should have a "paused" badge
    const pausedBadges = screen.getAllByText('paused');
    expect(pausedBadges).toHaveLength(1);
  });

  // 5. Does not show "paused" badge for active paths
  it('does not show "paused" badge for active paths', () => {
    setupMocks({
      trackedPaths: [
        { id: 1, path: '/data/movies', label: 'Movies', isActive: true, createdAt: '2024-01-01' },
      ],
    });
    render(<TrackedPathsManager />);
    expect(screen.queryByText('paused')).not.toBeInTheDocument();
  });

  // 6. Shows path text for each tracked path
  it('shows path text for each tracked path', () => {
    render(<TrackedPathsManager />);
    expect(screen.getByText('/data/movies')).toBeInTheDocument();
    expect(screen.getByText('/data/music')).toBeInTheDocument();
  });

  // 7. Renders remove button for each tracked path
  it('renders a remove button for each tracked path', () => {
    render(<TrackedPathsManager />);
    const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
    expect(removeButtons).toHaveLength(2);
    expect(screen.getByLabelText('Remove Movies')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Music')).toBeInTheDocument();
  });

  // 8. Renders checkbox for each tracked path
  it('renders a checkbox for each tracked path', () => {
    render(<TrackedPathsManager />);
    const toggleMovies = screen.getByLabelText('Toggle tracking for Movies');
    const toggleMusic = screen.getByLabelText('Toggle tracking for Music');
    expect(toggleMovies).toBeInTheDocument();
    expect(toggleMusic).toBeInTheDocument();
  });

  // 9. Shows "Add a path to track" label
  it('shows "Add a path to track" label', () => {
    render(<TrackedPathsManager />);
    expect(screen.getByText('Add a path to track')).toBeInTheDocument();
  });

  // 10. Renders select dropdown for path selection
  it('renders select dropdown for path selection', () => {
    render(<TrackedPathsManager />);
    expect(screen.getByTestId('select')).toBeInTheDocument();
    expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
    expect(screen.getByText('Select a directory...')).toBeInTheDocument();
  });

  // 11. Filters out already-tracked paths from dropdown
  it('filters out already-tracked paths from the dropdown', () => {
    render(<TrackedPathsManager />);
    // /data/movies and /data/music are already tracked, so they should NOT appear as select items
    expect(screen.queryByTestId('select-item-/data/movies')).not.toBeInTheDocument();
    expect(screen.queryByTestId('select-item-/data/music')).not.toBeInTheDocument();
    // /data/photos and /data (root) should be available
    expect(screen.getByTestId('select-item-/data/photos')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-/data')).toBeInTheDocument();
  });

  // 12. Calls removeTrackedPath and shows toast when remove button is clicked
  it('calls removeTrackedPath and shows toast when remove button is clicked', async () => {
    mockRemoveTrackedPath.mockResolvedValue(undefined);
    render(<TrackedPathsManager />);

    const removeMovies = screen.getByLabelText('Remove Movies');
    fireEvent.click(removeMovies);

    await waitFor(() => {
      expect(mockRemoveTrackedPath).toHaveBeenCalledWith(1);
    });
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Stopped tracking "Movies"');
    });
  });

  // 13. Calls toggleTrackedPath when checkbox is toggled
  it('calls toggleTrackedPath when checkbox is toggled', () => {
    render(<TrackedPathsManager />);

    const toggleMusic = screen.getByLabelText('Toggle tracking for Music');
    fireEvent.click(toggleMusic);

    expect(mockToggleTrackedPath).toHaveBeenCalledWith(2, true);
  });

  // 14. Shows "Scan a directory first" when no scan result
  it('shows "Scan a directory first" when no scan result and no tracked paths in dropdown', () => {
    setupMocks({ trackedPaths: [] }, { scanResult: null });
    render(<TrackedPathsManager />);
    expect(screen.getByText('Scan a directory first')).toBeInTheDocument();
  });

  // 15. Shows "All paths already tracked" when every path is tracked
  it('shows "All paths already tracked" when every path is tracked', () => {
    const allTracked = [
      { id: 1, path: '/data', label: 'Data', isActive: true, createdAt: '2024-01-01' },
      { id: 2, path: '/data/movies', label: 'Movies', isActive: true, createdAt: '2024-01-01' },
      { id: 3, path: '/data/music', label: 'Music', isActive: true, createdAt: '2024-01-01' },
      { id: 4, path: '/data/photos', label: 'Photos', isActive: true, createdAt: '2024-01-01' },
    ];
    setupMocks({ trackedPaths: allTracked });
    render(<TrackedPathsManager />);
    expect(screen.getByText('All paths already tracked')).toBeInTheDocument();
  });

  // 16. Only includes directories (not files) in dropdown paths
  it('only includes directories in the dropdown, not files', () => {
    const scanWithFiles = {
      ...mockScanResult,
      root: {
        ...mockScanResult.root,
        children: [
          ...mockScanResult.root.children,
          {
            name: 'readme.txt',
            path: '/data/readme.txt',
            size: 500,
            type: 'file' as const,
          },
        ],
      },
    };
    setupMocks({ trackedPaths: [] }, { scanResult: scanWithFiles });
    render(<TrackedPathsManager />);
    // File should not appear in dropdown
    expect(screen.queryByTestId('select-item-/data/readme.txt')).not.toBeInTheDocument();
    // Directories should appear
    expect(screen.getByTestId('select-item-/data/movies')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-/data/photos')).toBeInTheDocument();
  });
});
