import { renderHook, act, waitFor } from '@testing-library/react';
import { useComparisonMode } from '@/hooks/useComparisonMode';
import { DirectoryConfig, ScanResult } from '@/types';

global.fetch = jest.fn();

describe('useComparisonMode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockDirectory: DirectoryConfig = {
    id: '0',
    name: 'test-dir',
    path: '/test/path',
  };

  const mockScanResult: ScanResult = {
    directory: mockDirectory,
    root: {
      name: 'test-dir',
      path: '/test/path',
      size: 1000,
      type: 'directory',
      children: [],
    },
    totalSize: 1000,
    scannedAt: new Date().toISOString(),
  };

  const mockOnError = jest.fn();

  it('initializes with comparison mode off', () => {
    const { result } = renderHook(() =>
      useComparisonMode(mockDirectory, mockScanResult, mockOnError)
    );

    expect(result.current.isComparisonMode).toBe(false);
    expect(result.current.comparisonDir).toBeNull();
    expect(result.current.comparisonScanResult).toBeNull();
  });

  it('enters comparison mode when directory is selected', () => {
    const { result } = renderHook(() =>
      useComparisonMode(mockDirectory, mockScanResult, mockOnError)
    );

    act(() => {
      result.current.handleEnterComparisonMode();
    });

    expect(result.current.isComparisonMode).toBe(true);
  });

  it('shows error when entering comparison mode without directory', () => {
    const { result } = renderHook(() => useComparisonMode(null, null, mockOnError));

    act(() => {
      result.current.handleEnterComparisonMode();
    });

    expect(mockOnError).toHaveBeenCalledWith(
      'Cannot enter comparison mode',
      'Please scan a directory first.'
    );
    expect(result.current.isComparisonMode).toBe(false);
  });

  it('exits comparison mode and clears state', () => {
    const { result } = renderHook(() =>
      useComparisonMode(mockDirectory, mockScanResult, mockOnError)
    );

    act(() => {
      result.current.handleEnterComparisonMode();
    });

    expect(result.current.isComparisonMode).toBe(true);

    act(() => {
      result.current.handleExitComparisonMode();
    });

    expect(result.current.isComparisonMode).toBe(false);
    expect(result.current.comparisonDir).toBeNull();
    expect(result.current.comparisonScanResult).toBeNull();
  });

  it('scans comparison directory', async () => {
    const comparisonDir: DirectoryConfig = {
      id: '1',
      name: 'comparison-dir',
      path: '/comparison/path',
    };

    const comparisonScanResult: ScanResult = {
      directory: comparisonDir,
      root: {
        name: 'comparison-dir',
        path: '/comparison/path',
        size: 2000,
        type: 'directory',
        children: [],
      },
      totalSize: 2000,
      scannedAt: new Date().toISOString(),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => comparisonScanResult,
    });

    const { result } = renderHook(() =>
      useComparisonMode(mockDirectory, mockScanResult, mockOnError)
    );

    act(() => {
      result.current.scanComparisonDirectory(comparisonDir);
    });

    await waitFor(() => {
      expect(result.current.comparisonDir).toEqual(comparisonDir);
      expect(result.current.comparisonScanResult).toEqual(comparisonScanResult);
    });
  });

  it('handles comparison scan errors', async () => {
    const comparisonDir: DirectoryConfig = {
      id: '1',
      name: 'comparison-dir',
      path: '/comparison/path',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    const { result } = renderHook(() =>
      useComparisonMode(mockDirectory, mockScanResult, mockOnError)
    );

    act(() => {
      result.current.scanComparisonDirectory(comparisonDir);
    });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        'Scan failed',
        'Failed to scan comparison directory.'
      );
    });
  });

  it('sets loading state during comparison scan', async () => {
    const comparisonDir: DirectoryConfig = {
      id: '1',
      name: 'comparison-dir',
      path: '/comparison/path',
    };

    (global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => mockScanResult,
              }),
            100
          )
        )
    );

    const { result } = renderHook(() =>
      useComparisonMode(mockDirectory, mockScanResult, mockOnError)
    );

    act(() => {
      result.current.scanComparisonDirectory(comparisonDir);
    });

    expect(result.current.isLoadingComparison).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingComparison).toBe(false);
    });
  });
});
