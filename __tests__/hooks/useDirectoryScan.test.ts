import { renderHook, act, waitFor } from '@testing-library/react';
import { useDirectoryScan } from '@/hooks/useDirectoryScan';

global.fetch = jest.fn();

describe('useDirectoryScan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const mockDirectories = [
    { id: '0', name: 'test-dir', path: '/test/path' },
    { id: '1', name: 'another-dir', path: '/another/path' },
  ];

  const mockScanResult = {
    directory: mockDirectories[0],
    root: {
      name: 'test-dir',
      path: '/test/path',
      size: 1000,
      type: 'directory' as const,
      children: [],
    },
    totalSize: 1000,
    scannedAt: new Date().toISOString(),
  };

  it('loads directories on mount', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ directories: mockDirectories }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockScanResult,
      });

    const { result } = renderHook(() => useDirectoryScan());

    await waitFor(() => {
      expect(result.current.directories).toEqual(mockDirectories);
      expect(result.current.selectedDirectory).toEqual(mockDirectories[0]);
    });
  });

  it('scans directory on selection', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ directories: mockDirectories }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockScanResult,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockScanResult,
      });

    const { result } = renderHook(() => useDirectoryScan());

    await waitFor(() => {
      expect(result.current.selectedDirectory).toBeTruthy();
    });

    act(() => {
      result.current.handleDirectorySelect(mockDirectories[1]);
    });

    await waitFor(() => {
      expect(result.current.selectedDirectory).toEqual(mockDirectories[1]);
    });
  });

  it('handles refresh', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ directories: mockDirectories }),
      })
      .mockResolvedValue({
        ok: true,
        json: async () => mockScanResult,
      });

    const { result } = renderHook(() => useDirectoryScan());

    await waitFor(() => {
      expect(result.current.scanResult).toBeTruthy();
    });

    act(() => {
      result.current.handleRefresh();
    });

    // Calls: 1 load dirs + 1 initial scan + 1 history record + 1 refresh scan + 1 history record = 5
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(5);
    });
  });

  it('handles auto-refresh interval', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ directories: mockDirectories }),
      })
      .mockResolvedValue({
        ok: true,
        json: async () => mockScanResult,
      });

    const { result } = renderHook(() => useDirectoryScan(5000));

    await waitFor(() => {
      expect(result.current.selectedDirectory).toBeTruthy();
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/scan?dir=0');
    });
  });

  it('handles scan errors', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ directories: mockDirectories }),
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    const { result } = renderHook(() => useDirectoryScan());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });

  it('sets loading state during scan', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ directories: mockDirectories }),
      })
      .mockImplementationOnce(
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

    const { result } = renderHook(() => useDirectoryScan());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
