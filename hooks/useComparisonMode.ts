import { useState, useCallback } from 'react';
import { DirectoryConfig, ScanResult } from '@/types';

interface UseComparisonModeReturn {
  isComparisonMode: boolean;
  comparisonDir: DirectoryConfig | null;
  comparisonScanResult: ScanResult | null;
  isLoadingComparison: boolean;
  handleEnterComparisonMode: () => void;
  handleExitComparisonMode: () => void;
  scanComparisonDirectory: (dir: DirectoryConfig) => Promise<void>;
}

export function useComparisonMode(
  selectedDirectory: DirectoryConfig | null,
  scanResult: ScanResult | null,
  onError: (title: string, description: string) => void
): UseComparisonModeReturn {
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [comparisonDir, setComparisonDir] = useState<DirectoryConfig | null>(null);
  const [comparisonScanResult, setComparisonScanResult] = useState<ScanResult | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);

  const handleEnterComparisonMode = useCallback(() => {
    if (!selectedDirectory || !scanResult) {
      onError('Cannot enter comparison mode', 'Please scan a directory first.');
      return;
    }
    setIsComparisonMode(true);
  }, [selectedDirectory, scanResult, onError]);

  const handleExitComparisonMode = useCallback(() => {
    setIsComparisonMode(false);
    setComparisonDir(null);
    setComparisonScanResult(null);
  }, []);

  const scanComparisonDirectory = useCallback(
    async (dir: DirectoryConfig) => {
      setIsLoadingComparison(true);
      setComparisonScanResult(null);

      try {
        const response = await fetch(`/api/scan?dir=${dir.id}`);

        if (!response.ok) {
          throw new Error('Failed to scan comparison directory');
        }

        const data: ScanResult = await response.json();
        setComparisonDir(dir);
        setComparisonScanResult(data);
      } catch (err) {
        console.error('Error scanning comparison directory:', err);
        onError('Scan failed', 'Failed to scan comparison directory.');
      } finally {
        setIsLoadingComparison(false);
      }
    },
    [onError]
  );

  return {
    isComparisonMode,
    comparisonDir,
    comparisonScanResult,
    isLoadingComparison,
    handleEnterComparisonMode,
    handleExitComparisonMode,
    scanComparisonDirectory,
  };
}
