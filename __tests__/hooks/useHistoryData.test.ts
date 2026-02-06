import { renderHook, act, waitFor } from '@testing-library/react';
import { useHistoryData } from '@/hooks/useHistoryData';

global.fetch = jest.fn();

describe('useHistoryData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  const mockSnapshots = [
    {
      trackedPathId: 1,
      sizeBytes: 1000000,
      fileCount: 10,
      folderCount: 2,
      recordedAt: '2024-01-01T00:00:00Z',
    },
    {
      trackedPathId: 1,
      sizeBytes: 1200000,
      fileCount: 12,
      folderCount: 2,
      recordedAt: '2024-01-02T00:00:00Z',
    },
  ];

  /**
   * Helper: sets up fetch mocks for a successful mount sequence.
   * First call returns tracked paths, second call returns snapshots.
   */
  function mockSuccessfulMount(paths = mockTrackedPaths, snapshots = mockSnapshots) {
    (global.fetch as jest.Mock)
      // 1st call: fetchTrackedPaths on mount
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ trackedPaths: paths }),
      })
      // 2nd call: fetchHistory triggered by useEffect when trackedPaths change
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ snapshots }),
      });
  }

  it('fetches tracked paths on mount', async () => {
    mockSuccessfulMount();

    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => {
      expect(result.current.trackedPaths).toEqual(mockTrackedPaths);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/history/tracked-paths');
  });

  it('returns empty historyData when no active tracked paths', async () => {
    const inactivePaths = [
      {
        id: 1,
        path: '/data/movies',
        label: 'Movies',
        isActive: false,
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

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trackedPaths: inactivePaths }),
    });

    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => {
      expect(result.current.trackedPaths).toEqual(inactivePaths);
    });

    // No active paths, so historyData should be empty and no snapshots fetch
    expect(result.current.historyData).toEqual([]);
    // Only the tracked paths fetch should have been called (no snapshots call)
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('fetches history data when tracked paths are available', async () => {
    mockSuccessfulMount();

    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => {
      expect(result.current.historyData.length).toBeGreaterThan(0);
    });

    // Verify the snapshots endpoint was called with the active path IDs and default time range
    expect(global.fetch).toHaveBeenCalledWith('/api/history/snapshots?pathIds=1&range=1M');
  });

  it('groups snapshots by tracked path ID correctly', async () => {
    const multiPathSnapshots = [
      {
        trackedPathId: 1,
        sizeBytes: 1000000,
        fileCount: 10,
        folderCount: 2,
        recordedAt: '2024-01-01T00:00:00Z',
      },
      {
        trackedPathId: 1,
        sizeBytes: 1200000,
        fileCount: 12,
        folderCount: 2,
        recordedAt: '2024-01-02T00:00:00Z',
      },
      {
        trackedPathId: 3,
        sizeBytes: 500000,
        fileCount: 5,
        folderCount: 1,
        recordedAt: '2024-01-01T00:00:00Z',
      },
    ];

    const pathsAllActive = [
      {
        id: 1,
        path: '/data/movies',
        label: 'Movies',
        isActive: true,
        createdAt: '2024-01-01',
      },
      {
        id: 3,
        path: '/data/photos',
        label: 'Photos',
        isActive: true,
        createdAt: '2024-01-03',
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ trackedPaths: pathsAllActive }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ snapshots: multiPathSnapshots }),
      });

    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => {
      expect(result.current.historyData.length).toBe(2);
    });

    // First history entry for path ID 1 should have 2 data points
    const moviesHistory = result.current.historyData.find((h) => h.trackedPath.id === 1);
    expect(moviesHistory).toBeDefined();
    expect(moviesHistory!.dataPoints).toHaveLength(2);
    expect(moviesHistory!.dataPoints[0].sizeBytes).toBe(1000000);
    expect(moviesHistory!.dataPoints[1].sizeBytes).toBe(1200000);

    // Second history entry for path ID 3 should have 1 data point
    const photosHistory = result.current.historyData.find((h) => h.trackedPath.id === 3);
    expect(photosHistory).toBeDefined();
    expect(photosHistory!.dataPoints).toHaveLength(1);
    expect(photosHistory!.dataPoints[0].sizeBytes).toBe(500000);
  });

  it('addTrackedPath sends POST request and refreshes list', async () => {
    mockSuccessfulMount();

    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => {
      expect(result.current.trackedPaths).toEqual(mockTrackedPaths);
    });

    // Mock the POST response and the subsequent fetchTrackedPaths refresh
    const updatedPaths = [
      ...mockTrackedPaths,
      {
        id: 3,
        path: '/data/photos',
        label: 'Photos',
        isActive: true,
        createdAt: '2024-01-03',
      },
    ];

    (global.fetch as jest.Mock)
      // POST request
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 3 }),
      })
      // fetchTrackedPaths refresh
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ trackedPaths: updatedPaths }),
      })
      // fetchHistory triggered by trackedPaths change
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ snapshots: [] }),
      });

    await act(async () => {
      await result.current.addTrackedPath('/data/photos', 'Photos', 'dir-3');
    });

    // Verify POST was called with correct payload
    expect(global.fetch).toHaveBeenCalledWith('/api/history/tracked-paths', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: '/data/photos',
        label: 'Photos',
        directoryConfigId: 'dir-3',
      }),
    });

    await waitFor(() => {
      expect(result.current.trackedPaths).toEqual(updatedPaths);
    });
  });

  it('addTrackedPath throws on error response', async () => {
    mockSuccessfulMount();

    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => {
      expect(result.current.trackedPaths).toEqual(mockTrackedPaths);
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Path already tracked' }),
    });

    await expect(
      act(async () => {
        await result.current.addTrackedPath('/data/movies', 'Movies');
      })
    ).rejects.toThrow('Path already tracked');
  });

  it('removeTrackedPath sends DELETE request and refreshes list', async () => {
    mockSuccessfulMount();

    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => {
      expect(result.current.trackedPaths).toEqual(mockTrackedPaths);
    });

    const remainingPaths = [mockTrackedPaths[1]];

    (global.fetch as jest.Mock)
      // DELETE request
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })
      // fetchTrackedPaths refresh
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ trackedPaths: remainingPaths }),
      });

    await act(async () => {
      await result.current.removeTrackedPath(1);
    });

    // Verify DELETE was called
    expect(global.fetch).toHaveBeenCalledWith('/api/history/tracked-paths/1', { method: 'DELETE' });

    await waitFor(() => {
      expect(result.current.trackedPaths).toEqual(remainingPaths);
    });
  });

  it('toggleTrackedPath sends PATCH request and refreshes list', async () => {
    mockSuccessfulMount();

    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => {
      expect(result.current.trackedPaths).toEqual(mockTrackedPaths);
    });

    const updatedPaths = [mockTrackedPaths[0], { ...mockTrackedPaths[1], isActive: true }];

    (global.fetch as jest.Mock)
      // PATCH request
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })
      // fetchTrackedPaths refresh
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ trackedPaths: updatedPaths }),
      })
      // fetchHistory triggered by trackedPaths change
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ snapshots: mockSnapshots }),
      });

    await act(async () => {
      await result.current.toggleTrackedPath(2, true);
    });

    // Verify PATCH was called with correct payload
    expect(global.fetch).toHaveBeenCalledWith('/api/history/tracked-paths/2', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: true }),
    });

    await waitFor(() => {
      expect(result.current.trackedPaths).toEqual(updatedPaths);
    });
  });

  it('setTimeRange updates the time range and triggers refetch', async () => {
    mockSuccessfulMount();

    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => {
      expect(result.current.trackedPaths).toEqual(mockTrackedPaths);
      expect(result.current.timeRange).toBe('1M');
    });

    // Mock the history refetch triggered by time range change
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ snapshots: mockSnapshots }),
    });

    act(() => {
      result.current.setTimeRange('3M');
    });

    await waitFor(() => {
      expect(result.current.timeRange).toBe('3M');
    });

    // Verify that history was re-fetched with the new time range
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/history/snapshots?pathIds=1&range=3M');
    });
  });

  it('handles fetch errors for tracked paths', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to fetch tracked paths');
    });

    expect(result.current.trackedPaths).toEqual([]);
  });

  it('handles fetch errors for history data', async () => {
    (global.fetch as jest.Mock)
      // Tracked paths fetch succeeds
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ trackedPaths: mockTrackedPaths }),
      })
      // History fetch fails
      .mockResolvedValueOnce({
        ok: false,
      });

    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to fetch history data');
    });

    expect(result.current.historyData).toEqual([]);
  });

  it('refreshHistory re-fetches history data', async () => {
    mockSuccessfulMount();

    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => {
      expect(result.current.historyData.length).toBeGreaterThan(0);
    });

    const updatedSnapshots = [
      {
        trackedPathId: 1,
        sizeBytes: 1500000,
        fileCount: 15,
        folderCount: 3,
        recordedAt: '2024-01-03T00:00:00Z',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ snapshots: updatedSnapshots }),
    });

    await act(async () => {
      await result.current.refreshHistory();
    });

    await waitFor(() => {
      expect(result.current.historyData.length).toBe(1);
      expect(result.current.historyData[0].dataPoints[0].sizeBytes).toBe(1500000);
    });
  });

  it('sets isLoading during history fetch', async () => {
    let resolveHistory: (value: unknown) => void;
    const historyPromise = new Promise((resolve) => {
      resolveHistory = resolve;
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ trackedPaths: mockTrackedPaths }),
      })
      .mockImplementationOnce(() => historyPromise);

    const { result } = renderHook(() => useHistoryData());

    // Wait for tracked paths to load first, then history fetch starts
    await waitFor(() => {
      expect(result.current.trackedPaths).toEqual(mockTrackedPaths);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    // Resolve the history fetch
    await act(async () => {
      resolveHistory!({
        ok: true,
        json: async () => ({ snapshots: mockSnapshots }),
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('converts snapshot recordedAt to Date objects in dataPoints', async () => {
    mockSuccessfulMount();

    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => {
      expect(result.current.historyData.length).toBeGreaterThan(0);
    });

    const dataPoints = result.current.historyData[0].dataPoints;
    expect(dataPoints[0].date).toEqual(new Date('2024-01-01T00:00:00Z'));
    expect(dataPoints[1].date).toEqual(new Date('2024-01-02T00:00:00Z'));
  });

  it('only includes active tracked paths in history data', async () => {
    // mockTrackedPaths has id:1 active and id:2 inactive
    // Even if snapshots exist for id:2, they should not appear in historyData
    const snapshotsWithInactive = [
      ...mockSnapshots,
      {
        trackedPathId: 2,
        sizeBytes: 500000,
        fileCount: 5,
        folderCount: 1,
        recordedAt: '2024-01-01T00:00:00Z',
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ trackedPaths: mockTrackedPaths }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ snapshots: snapshotsWithInactive }),
      });

    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => {
      expect(result.current.historyData.length).toBe(1);
    });

    // Only the active path (id:1) should be present
    expect(result.current.historyData[0].trackedPath.id).toBe(1);
    expect(result.current.historyData[0].trackedPath.label).toBe('Movies');
  });

  it('removeTrackedPath sets error on failure', async () => {
    mockSuccessfulMount();

    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => {
      expect(result.current.trackedPaths).toEqual(mockTrackedPaths);
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    await act(async () => {
      await result.current.removeTrackedPath(1);
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to remove tracked path');
    });
  });

  it('toggleTrackedPath sets error on failure', async () => {
    mockSuccessfulMount();

    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => {
      expect(result.current.trackedPaths).toEqual(mockTrackedPaths);
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    await act(async () => {
      await result.current.toggleTrackedPath(2, true);
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to toggle tracked path');
    });
  });

  it('defaults timeRange to 1M', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trackedPaths: [] }),
    });

    const { result } = renderHook(() => useHistoryData());

    expect(result.current.timeRange).toBe('1M');
  });

  it('handles empty snapshots array from API', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ trackedPaths: mockTrackedPaths }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ snapshots: [] }),
      });

    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => {
      expect(result.current.trackedPaths).toEqual(mockTrackedPaths);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // No snapshots to group, so historyData should be empty
    expect(result.current.historyData).toEqual([]);
  });
});
