import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MainContent from '@/components/MainContent';
import { FileNode, AdvancedFilters } from '@/types';

// Mock contexts
const mockUseScan = jest.fn();
const mockUseAppState = jest.fn();
const mockUseFilter = jest.fn();

jest.mock('@/contexts/ScanContext', () => ({
  ...jest.requireActual('@/contexts/ScanContext'),
  useScan: () => mockUseScan(),
}));

jest.mock('@/contexts/AppStateContext', () => ({
  ...jest.requireActual('@/contexts/AppStateContext'),
  useAppState: () => mockUseAppState(),
}));

jest.mock('@/contexts/FilterContext', () => ({
  ...jest.requireActual('@/contexts/FilterContext'),
  useFilter: () => mockUseFilter(),
}));

// Mock child components
jest.mock('@/components/Stats', () => {
  return function MockStats() {
    return <div>Stats</div>;
  };
});

jest.mock('@/components/SearchBar', () => {
  return function MockSearchBar() {
    return <div>SearchBar</div>;
  };
});

jest.mock('@/components/AdvancedFiltersPanel', () => {
  return function MockAdvancedFiltersPanel() {
    return <div>AdvancedFiltersPanel</div>;
  };
});

jest.mock('@/components/Breadcrumb', () => {
  return function MockBreadcrumb() {
    return <div>Breadcrumb</div>;
  };
});

jest.mock('@/components/Treemap', () => {
  return function MockTreemap() {
    return <div>Treemap</div>;
  };
});

jest.mock('@/components/TreeView', () => {
  return function MockTreeView() {
    return <div>TreeView</div>;
  };
});

jest.mock('@/components/FileTypeBreakdown', () => {
  return function MockFileTypeBreakdown() {
    return <div>FileTypeBreakdown</div>;
  };
});

jest.mock('@/components/HistoryView', () => {
  return function MockHistoryView() {
    return <div>HistoryView</div>;
  };
});

describe('MainContent', () => {
  const mockSetViewMode = jest.fn();
  const mockSetSearchQuery = jest.fn();
  const mockSetExtensionFilter = jest.fn();
  const mockSetTypeFilter = jest.fn();
  const mockSetAdvancedFilters = jest.fn();
  const mockHandleNodeClick = jest.fn();
  const mockHandleBreadcrumbNavigate = jest.fn();

  const mockNode: FileNode = {
    name: 'root',
    path: '/path/to/root',
    size: 1000,
    type: 'directory',
    children: [],
  };

  const mockAdvancedFilters: AdvancedFilters = {
    size: { enabled: false },
    date: { enabled: false },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock ScanContext
    mockUseScan.mockReturnValue({
      currentNode: mockNode,
      scanResult: { root: mockNode, scannedAt: '2024-01-01T00:00:00Z' },
      navigationPath: [],
      handleNodeClick: mockHandleNodeClick,
      handleBreadcrumbNavigate: mockHandleBreadcrumbNavigate,
    });

    // Mock AppStateContext
    mockUseAppState.mockReturnValue({
      viewMode: 'treemap',
      setViewMode: mockSetViewMode,
    });

    // Mock FilterContext
    mockUseFilter.mockReturnValue({
      searchQuery: '',
      extensionFilter: null,
      typeFilter: null,
      advancedFilters: mockAdvancedFilters,
      filteredNode: null,
      matchCount: 0,
      availableExtensions: ['.txt', '.js', '.ts'],
      setSearchQuery: mockSetSearchQuery,
      setExtensionFilter: mockSetExtensionFilter,
      setTypeFilter: mockSetTypeFilter,
      setAdvancedFilters: mockSetAdvancedFilters,
    });
  });

  it('returns null when currentNode is not provided', () => {
    mockUseScan.mockReturnValueOnce({
      currentNode: null,
      scanResult: null,
    });
    const { container } = render(<MainContent />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all main sections when currentNode is provided', () => {
    render(<MainContent />);
    expect(screen.getByText('Stats')).toBeInTheDocument();
    expect(screen.getByText('SearchBar')).toBeInTheDocument();
    expect(screen.getByText('AdvancedFiltersPanel')).toBeInTheDocument();
    expect(screen.getByText('FileTypeBreakdown')).toBeInTheDocument();
  });

  it('renders view mode selector with Treemap, Tree, and History buttons', () => {
    render(<MainContent />);
    expect(screen.getByText('View:')).toBeInTheDocument();
    // Use getAllByText since "Treemap" appears in both button and mock component
    const treemapElements = screen.getAllByText('Treemap');
    expect(treemapElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Tree')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('calls setViewMode when Treemap button is clicked', () => {
    mockUseAppState.mockReturnValueOnce({
      viewMode: 'tree',
      setViewMode: mockSetViewMode,
    });
    render(<MainContent />);
    const treemapElements = screen.getAllByText('Treemap');
    const treemapButton = treemapElements.find((el) => el.closest('button'))?.closest('button');
    fireEvent.click(treemapButton!);
    expect(mockSetViewMode).toHaveBeenCalledWith('treemap');
  });

  it('calls setViewMode when Tree button is clicked', () => {
    render(<MainContent />);
    const treeButton = screen.getByText('Tree').closest('button');
    fireEvent.click(treeButton!);
    expect(mockSetViewMode).toHaveBeenCalledWith('tree');
  });

  it('shows breadcrumb when navigation path has items', () => {
    mockUseScan.mockReturnValueOnce({
      currentNode: mockNode,
      scanResult: { root: mockNode, scannedAt: '2024-01-01T00:00:00Z' },
      navigationPath: ['root', 'folder1'],
      handleNodeClick: mockHandleNodeClick,
      handleBreadcrumbNavigate: mockHandleBreadcrumbNavigate,
    });
    render(<MainContent />);
    expect(screen.getByText('Breadcrumb')).toBeInTheDocument();
  });

  it('does not show breadcrumb when navigation path is empty', () => {
    render(<MainContent />);
    expect(screen.queryByText('Breadcrumb')).not.toBeInTheDocument();
  });

  it('renders Treemap when viewMode is treemap', () => {
    const { container } = render(<MainContent />);
    // Check that the treemap visualization is rendered (MockTreemap)
    const treemapDiv = container.querySelector('.h-\\[600px\\]');
    expect(treemapDiv).toBeInTheDocument();
    expect(treemapDiv?.textContent).toContain('Treemap');
  });

  it('renders TreeView when viewMode is tree', () => {
    mockUseAppState.mockReturnValueOnce({
      viewMode: 'tree',
      setViewMode: mockSetViewMode,
    });
    const { container } = render(<MainContent />);
    // Check that the tree visualization is rendered (MockTreeView)
    const treeDiv = container.querySelector('.h-\\[600px\\]');
    expect(treeDiv).toBeInTheDocument();
    expect(treeDiv?.textContent).toContain('TreeView');
  });

  it('uses filteredNode when available', () => {
    const filteredNode: FileNode = {
      name: 'filtered',
      path: '/path/to/filtered',
      size: 500,
      type: 'directory',
      children: [],
    };

    mockUseFilter.mockReturnValueOnce({
      searchQuery: '',
      extensionFilter: null,
      typeFilter: null,
      advancedFilters: mockAdvancedFilters,
      filteredNode,
      matchCount: 0,
      availableExtensions: ['.txt', '.js', '.ts'],
      setSearchQuery: mockSetSearchQuery,
      setExtensionFilter: mockSetExtensionFilter,
      setTypeFilter: mockSetTypeFilter,
      setAdvancedFilters: mockSetAdvancedFilters,
    });

    const { container } = render(<MainContent />);
    // The component should render with filteredNode data
    const visualizationDiv = container.querySelector('.h-\\[600px\\]');
    expect(visualizationDiv).toBeInTheDocument();
  });

  it('uses currentNode when filteredNode is not available', () => {
    const { container } = render(<MainContent />);
    // The component should render with currentNode data
    const visualizationDiv = container.querySelector('.h-\\[600px\\]');
    expect(visualizationDiv).toBeInTheDocument();
  });

  it('renders HistoryView when viewMode is history', () => {
    mockUseAppState.mockReturnValueOnce({
      viewMode: 'history',
      setViewMode: mockSetViewMode,
    });
    render(<MainContent />);
    expect(screen.getByText('HistoryView')).toBeInTheDocument();
  });

  it('hides SearchBar, AdvancedFiltersPanel, FileTypeBreakdown in history mode', () => {
    mockUseAppState.mockReturnValueOnce({
      viewMode: 'history',
      setViewMode: mockSetViewMode,
    });
    render(<MainContent />);
    expect(screen.queryByText('SearchBar')).not.toBeInTheDocument();
    expect(screen.queryByText('AdvancedFiltersPanel')).not.toBeInTheDocument();
    expect(screen.queryByText('FileTypeBreakdown')).not.toBeInTheDocument();
  });

  it('hides Breadcrumb in history mode even with navigation path', () => {
    mockUseScan.mockReturnValueOnce({
      currentNode: mockNode,
      scanResult: { root: mockNode, scannedAt: '2024-01-01T00:00:00Z' },
      navigationPath: ['root', 'folder1'],
      handleNodeClick: mockHandleNodeClick,
      handleBreadcrumbNavigate: mockHandleBreadcrumbNavigate,
    });
    mockUseAppState.mockReturnValueOnce({
      viewMode: 'history',
      setViewMode: mockSetViewMode,
    });
    render(<MainContent />);
    expect(screen.queryByText('Breadcrumb')).not.toBeInTheDocument();
  });

  it('still shows Stats in history mode', () => {
    mockUseAppState.mockReturnValueOnce({
      viewMode: 'history',
      setViewMode: mockSetViewMode,
    });
    render(<MainContent />);
    expect(screen.getByText('Stats')).toBeInTheDocument();
  });

  it('calls setViewMode when History button is clicked', () => {
    render(<MainContent />);
    const historyButton = screen.getByText('History').closest('button');
    fireEvent.click(historyButton!);
    expect(mockSetViewMode).toHaveBeenCalledWith('history');
  });
});
