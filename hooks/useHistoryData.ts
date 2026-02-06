import { useState, useEffect, useCallback } from 'react';
import { TrackedPath, TrackedPathHistory, HistoryTimeRange, HistoryDataPoint } from '@/types';

interface UseHistoryDataReturn {
  trackedPaths: TrackedPath[];
  historyData: TrackedPathHistory[];
  timeRange: HistoryTimeRange;
  setTimeRange: (range: HistoryTimeRange) => void;
  isLoading: boolean;
  error: string | null;
  addTrackedPath: (path: string, label: string, dirConfigId?: string) => Promise<void>;
  removeTrackedPath: (id: number) => Promise<void>;
  toggleTrackedPath: (id: number, isActive: boolean) => Promise<void>;
  refreshHistory: () => Promise<void>;
}

export function useHistoryData(): UseHistoryDataReturn {
  const [trackedPaths, setTrackedPaths] = useState<TrackedPath[]>([]);
  const [historyData, setHistoryData] = useState<TrackedPathHistory[]>([]);
  const [timeRange, setTimeRange] = useState<HistoryTimeRange>('1M');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackedPaths = useCallback(async () => {
    try {
      const response = await fetch('/api/history/tracked-paths');
      if (!response.ok) throw new Error('Failed to fetch tracked paths');
      const data = await response.json();
      setTrackedPaths(data.trackedPaths || []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    const activeIds = trackedPaths.filter((p) => p.isActive).map((p) => p.id);
    if (activeIds.length === 0) {
      setHistoryData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/history/snapshots?pathIds=${activeIds.join(',')}&range=${timeRange}`
      );
      if (!response.ok) throw new Error('Failed to fetch history data');
      const data = await response.json();

      // Group snapshots by tracked path
      const grouped: Record<number, HistoryDataPoint[]> = {};
      for (const snap of data.snapshots || []) {
        if (!grouped[snap.trackedPathId]) {
          grouped[snap.trackedPathId] = [];
        }
        grouped[snap.trackedPathId].push({
          date: new Date(snap.recordedAt),
          sizeBytes: snap.sizeBytes,
          fileCount: snap.fileCount,
          folderCount: snap.folderCount,
        });
      }

      const histories: TrackedPathHistory[] = trackedPaths
        .filter((p) => p.isActive && grouped[p.id])
        .map((p) => ({
          trackedPath: p,
          dataPoints: grouped[p.id],
        }));

      setHistoryData(histories);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [trackedPaths, timeRange]);

  const addTrackedPath = useCallback(
    async (path: string, label: string, dirConfigId?: string) => {
      try {
        const response = await fetch('/api/history/tracked-paths', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path, label, directoryConfigId: dirConfigId }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add tracked path');
        }
        await fetchTrackedPaths();
      } catch (err) {
        throw err;
      }
    },
    [fetchTrackedPaths]
  );

  const removeTrackedPath = useCallback(
    async (id: number) => {
      try {
        const response = await fetch(`/api/history/tracked-paths/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to remove tracked path');
        await fetchTrackedPaths();
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [fetchTrackedPaths]
  );

  const toggleTrackedPath = useCallback(
    async (id: number, isActive: boolean) => {
      try {
        const response = await fetch(`/api/history/tracked-paths/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive }),
        });
        if (!response.ok) throw new Error('Failed to toggle tracked path');
        await fetchTrackedPaths();
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [fetchTrackedPaths]
  );

  const refreshHistory = useCallback(async () => {
    await fetchHistory();
  }, [fetchHistory]);

  // Fetch tracked paths on mount
  useEffect(() => {
    fetchTrackedPaths();
  }, [fetchTrackedPaths]);

  // Fetch history when tracked paths or time range change
  useEffect(() => {
    if (trackedPaths.length > 0) {
      fetchHistory();
    }
  }, [trackedPaths, timeRange, fetchHistory]);

  return {
    trackedPaths,
    historyData,
    timeRange,
    setTimeRange,
    isLoading,
    error,
    addTrackedPath,
    removeTrackedPath,
    toggleTrackedPath,
    refreshHistory,
  };
}
