import { useState, useEffect, useCallback } from 'react';
import { DirectoryConfig, ScanResult } from '@/types';

interface UseDirectoryScanReturn {
  directories: DirectoryConfig[];
  selectedDirectory: DirectoryConfig | null;
  scanResult: ScanResult | null;
  isLoading: boolean;
  error: string | null;
  lastScanTime: Date | null;
  loadDirectories: () => Promise<void>;
  scanDirectory: (dir: DirectoryConfig) => Promise<void>;
  handleDirectorySelect: (dir: DirectoryConfig) => void;
  handleRefresh: () => void;
}

export function useDirectoryScan(autoRefreshInterval: number = 0): UseDirectoryScanReturn {
  const [directories, setDirectories] = useState<DirectoryConfig[]>([]);
  const [selectedDirectory, setSelectedDirectory] = useState<DirectoryConfig | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);

  const loadDirectories = useCallback(async () => {
    try {
      const response = await fetch('/api/scan');
      const data = await response.json();

      if (data.directories) {
        setDirectories(data.directories);
        if (data.directories.length > 0) {
          setSelectedDirectory(data.directories[0]);
          scanDirectory(data.directories[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load directories:', err);
      setError('Failed to load directories');
    }
  }, []);

  const scanDirectory = useCallback(async (dir: DirectoryConfig) => {
    setIsLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const response = await fetch(`/api/scan?dir=${dir.id}`);

      if (!response.ok) {
        throw new Error('Failed to scan directory');
      }

      const data: ScanResult = await response.json();
      setScanResult(data);
      setLastScanTime(new Date());
    } catch (err) {
      console.error('Error scanning directory:', err);
      setError('Failed to scan directory. Please check if the path is accessible.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDirectorySelect = useCallback(
    (dir: DirectoryConfig) => {
      setSelectedDirectory(dir);
      scanDirectory(dir);
    },
    [scanDirectory]
  );

  const handleRefresh = useCallback(() => {
    if (selectedDirectory) {
      scanDirectory(selectedDirectory);
    }
  }, [selectedDirectory, scanDirectory]);

  // Load directories on mount
  useEffect(() => {
    loadDirectories();
  }, [loadDirectories]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefreshInterval === 0 || !selectedDirectory) return;

    const intervalId = setInterval(() => {
      scanDirectory(selectedDirectory);
    }, autoRefreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefreshInterval, selectedDirectory, scanDirectory]);

  return {
    directories,
    selectedDirectory,
    scanResult,
    isLoading,
    error,
    lastScanTime,
    loadDirectories,
    scanDirectory,
    handleDirectorySelect,
    handleRefresh,
  };
}
