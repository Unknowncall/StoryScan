import React from 'react';
import { render, screen } from '@testing-library/react';
import ComparisonView from '@/components/ComparisonView';
import { DirectoryConfig, FileNode, ScanResult } from '@/types';

// Mock contexts
const mockUseScan = jest.fn();
const mockUseComparison = jest.fn();

jest.mock('@/contexts/ScanContext', () => ({
  ...jest.requireActual('@/contexts/ScanContext'),
  useScan: () => mockUseScan(),
}));

jest.mock('@/contexts/ComparisonContext', () => ({
  ...jest.requireActual('@/contexts/ComparisonContext'),
  useComparison: () => mockUseComparison(),
}));

// Mock child components
jest.mock('@/components/DirectorySelector', () => {
  return function MockDirectorySelector() {
    return <div>DirectorySelector</div>;
  };
});

jest.mock('@/components/Loading', () => {
  return function MockLoading({ message }: { message: string }) {
    return <div>{message}</div>;
  };
});

jest.mock('@/components/ComparisonStats', () => {
  return function MockComparisonStats() {
    return <div>ComparisonStats</div>;
  };
});

jest.mock('@/components/Treemap', () => {
  return function MockTreemap() {
    return <div>Treemap</div>;
  };
});

describe('ComparisonView', () => {
  const mockDirectories: DirectoryConfig[] = [
    { id: 'dir1', name: 'Directory 1', path: '/path/to/dir1' },
    { id: 'dir2', name: 'Directory 2', path: '/path/to/dir2' },
    { id: 'dir3', name: 'Directory 3', path: '/path/to/dir3' },
  ];

  const mockSelectedDirectory: DirectoryConfig = mockDirectories[0];

  const mockNode: FileNode = {
    name: 'root',
    path: '/path/to/dir1',
    size: 1000,
    type: 'directory',
    children: [],
  };

  const mockScanResult: ScanResult = {
    directory: mockSelectedDirectory,
    root: mockNode,
    totalSize: 1000,
    scannedAt: '2024-01-01T00:00:00Z',
  };

  const mockHandleNodeClick = jest.fn();
  const mockScanComparisonDirectory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock ScanContext with default values
    mockUseScan.mockReturnValue({
      directories: mockDirectories,
      selectedDirectory: mockSelectedDirectory,
      scanResult: mockScanResult,
      handleNodeClick: mockHandleNodeClick,
      currentNode: mockNode,
      navigationPath: [],
      handleBreadcrumbNavigate: jest.fn(),
    });

    // Mock ComparisonContext with default values
    mockUseComparison.mockReturnValue({
      isComparisonMode: true,
      comparisonDir: null,
      comparisonScanResult: null,
      isLoadingComparison: false,
      handleEnterComparisonMode: jest.fn(),
      handleExitComparisonMode: jest.fn(),
      scanComparisonDirectory: mockScanComparisonDirectory,
    });
  });

  it('renders comparison instructions when no comparison directory is selected', () => {
    render(<ComparisonView />);
    expect(screen.getByText('Comparison Mode Active')).toBeInTheDocument();
    expect(screen.getByText(/Select a second directory below to compare with/)).toBeInTheDocument();
    expect(screen.getByText('Directory 1')).toBeInTheDocument();
  });

  it('renders directory selector', () => {
    render(<ComparisonView />);
    expect(screen.getByText('Select Directory to Compare')).toBeInTheDocument();
    expect(screen.getAllByText('DirectorySelector').length).toBeGreaterThan(0);
  });

  it('shows loading message when loading comparison', () => {
    mockUseComparison.mockReturnValueOnce({
      isComparisonMode: true,
      comparisonDir: null,
      comparisonScanResult: null,
      isLoadingComparison: true,
      handleEnterComparisonMode: jest.fn(),
      handleExitComparisonMode: jest.fn(),
      scanComparisonDirectory: mockScanComparisonDirectory,
    });
    render(<ComparisonView />);
    expect(screen.getByText('Scanning comparison directory...')).toBeInTheDocument();
  });

  it('does not show loading message when not loading', () => {
    render(<ComparisonView />);
    expect(screen.queryByText('Scanning comparison directory...')).not.toBeInTheDocument();
  });

  it('renders comparison stats when both scans are ready', () => {
    const comparisonDir: DirectoryConfig = mockDirectories[1];
    const comparisonScanResult: ScanResult = {
      directory: comparisonDir,
      root: {
        name: 'root',
        path: '/path/to/dir2',
        size: 2000,
        type: 'directory',
        children: [],
      },
      totalSize: 2000,
      scannedAt: '2024-01-01T00:00:00Z',
    };

    mockUseComparison.mockReturnValueOnce({
      isComparisonMode: true,
      comparisonDir: comparisonDir,
      comparisonScanResult: comparisonScanResult,
      isLoadingComparison: false,
      handleEnterComparisonMode: jest.fn(),
      handleExitComparisonMode: jest.fn(),
      scanComparisonDirectory: mockScanComparisonDirectory,
    } as any);

    render(<ComparisonView />);

    expect(screen.getByText('ComparisonStats')).toBeInTheDocument();
  });

  it('renders two treemaps when both scans are ready', () => {
    const comparisonDir: DirectoryConfig = mockDirectories[1];
    const comparisonScanResult: ScanResult = {
      directory: comparisonDir,
      root: {
        name: 'root',
        path: '/path/to/dir2',
        size: 2000,
        type: 'directory',
        children: [],
      },
      totalSize: 2000,
      scannedAt: '2024-01-01T00:00:00Z',
    };

    mockUseComparison.mockReturnValueOnce({
      isComparisonMode: true,
      comparisonDir: comparisonDir,
      comparisonScanResult: comparisonScanResult,
      isLoadingComparison: false,
      handleEnterComparisonMode: jest.fn(),
      handleExitComparisonMode: jest.fn(),
      scanComparisonDirectory: mockScanComparisonDirectory,
    } as any);

    render(<ComparisonView />);

    // Should render 2 treemaps
    expect(screen.getAllByText('Treemap').length).toBe(2);
  });

  it('displays directory names and paths in treemap cards', () => {
    const comparisonDir: DirectoryConfig = mockDirectories[1];
    const comparisonScanResult: ScanResult = {
      directory: comparisonDir,
      root: {
        name: 'root',
        path: '/path/to/dir2',
        size: 2000,
        type: 'directory',
        children: [],
      },
      totalSize: 2000,
      scannedAt: '2024-01-01T00:00:00Z',
    };

    mockUseComparison.mockReturnValueOnce({
      isComparisonMode: true,
      comparisonDir: comparisonDir,
      comparisonScanResult: comparisonScanResult,
      isLoadingComparison: false,
      handleEnterComparisonMode: jest.fn(),
      handleExitComparisonMode: jest.fn(),
      scanComparisonDirectory: mockScanComparisonDirectory,
    } as any);

    render(<ComparisonView />);

    expect(screen.getByText('Directory 1')).toBeInTheDocument();
    expect(screen.getByText('Directory 2')).toBeInTheDocument();
    expect(screen.getByText('/path/to/dir1')).toBeInTheDocument();
    expect(screen.getByText('/path/to/dir2')).toBeInTheDocument();
  });

  it('does not show comparison instructions when comparison directory is selected', () => {
    const comparisonDir: DirectoryConfig = mockDirectories[1];

    mockUseComparison.mockReturnValueOnce({
      isComparisonMode: true,
      comparisonDir: comparisonDir,
      comparisonScanResult: null,
      isLoadingComparison: false,
      handleEnterComparisonMode: jest.fn(),
      handleExitComparisonMode: jest.fn(),
      scanComparisonDirectory: mockScanComparisonDirectory,
    } as any);

    render(<ComparisonView />);

    expect(screen.queryByText('Comparison Mode Active')).not.toBeInTheDocument();
  });

  it('does not render stats or treemaps when only one scan is ready', () => {
    const comparisonDir: DirectoryConfig = mockDirectories[1];

    mockUseComparison.mockReturnValueOnce({
      isComparisonMode: true,
      comparisonDir: comparisonDir,
      comparisonScanResult: null,
      isLoadingComparison: false,
      handleEnterComparisonMode: jest.fn(),
      handleExitComparisonMode: jest.fn(),
      scanComparisonDirectory: mockScanComparisonDirectory,
    } as any);

    render(<ComparisonView />);

    expect(screen.queryByText('ComparisonStats')).not.toBeInTheDocument();
    expect(screen.queryByText('Treemap')).not.toBeInTheDocument();
  });
});
