import { renderHook, act } from '@testing-library/react';
import { useNavigation } from '@/hooks/useNavigation';
import { ScanResult } from '@/types';

describe('useNavigation', () => {
  const mockScanResult: ScanResult = {
    directory: { id: '0', name: 'root', path: '/root' },
    root: {
      name: 'root',
      path: '/root',
      size: 3000,
      type: 'directory',
      children: [
        {
          name: 'folder1',
          path: '/root/folder1',
          size: 1000,
          type: 'directory',
          children: [
            {
              name: 'subfolder',
              path: '/root/folder1/subfolder',
              size: 500,
              type: 'directory',
              children: [],
            },
          ],
        },
        {
          name: 'file.txt',
          path: '/root/file.txt',
          size: 100,
          type: 'file',
          extension: 'txt',
        },
      ],
    },
    totalSize: 3000,
    scannedAt: new Date().toISOString(),
  };

  it('initializes with root node when scan result is provided', () => {
    const { result } = renderHook(() => useNavigation(mockScanResult));

    expect(result.current.currentNode).toEqual(mockScanResult.root);
    expect(result.current.navigationPath).toEqual([]);
  });

  it('handles node click for directory', () => {
    const { result } = renderHook(() => useNavigation(mockScanResult));

    act(() => {
      result.current.handleNodeClick(mockScanResult.root.children![0]);
    });

    expect(result.current.currentNode).toEqual(mockScanResult.root.children![0]);
    expect(result.current.navigationPath).toEqual(['folder1']);
  });

  it('ignores node click for files', () => {
    const { result } = renderHook(() => useNavigation(mockScanResult));

    act(() => {
      result.current.handleNodeClick(mockScanResult.root.children![1]);
    });

    expect(result.current.currentNode).toEqual(mockScanResult.root);
    expect(result.current.navigationPath).toEqual([]);
  });

  it('handles breadcrumb navigation to root', () => {
    const { result } = renderHook(() => useNavigation(mockScanResult));

    act(() => {
      result.current.handleNodeClick(mockScanResult.root.children![0]);
    });

    expect(result.current.navigationPath).toEqual(['folder1']);

    act(() => {
      result.current.handleBreadcrumbNavigate(0);
    });

    expect(result.current.currentNode).toEqual(mockScanResult.root);
    expect(result.current.navigationPath).toEqual([]);
  });

  it('handles breadcrumb navigation to intermediate path', () => {
    const { result } = renderHook(() => useNavigation(mockScanResult));

    const folder1 = mockScanResult.root.children![0];
    const subfolder = folder1.children![0];

    act(() => {
      result.current.handleNodeClick(folder1);
    });

    act(() => {
      result.current.handleNodeClick(subfolder);
    });

    expect(result.current.navigationPath).toEqual(['folder1', 'subfolder']);

    act(() => {
      result.current.handleBreadcrumbNavigate(1);
    });

    expect(result.current.currentNode).toEqual(folder1);
    expect(result.current.navigationPath).toEqual(['folder1']);
  });

  it('resets navigation to root', () => {
    const { result } = renderHook(() => useNavigation(mockScanResult));

    act(() => {
      result.current.handleNodeClick(mockScanResult.root.children![0]);
    });

    expect(result.current.navigationPath).toEqual(['folder1']);

    act(() => {
      result.current.resetNavigation();
    });

    expect(result.current.currentNode).toEqual(mockScanResult.root);
    expect(result.current.navigationPath).toEqual([]);
  });

  it('resets when scan result changes', () => {
    const { result, rerender } = renderHook(({ scanResult }) => useNavigation(scanResult), {
      initialProps: { scanResult: mockScanResult },
    });

    act(() => {
      result.current.handleNodeClick(mockScanResult.root.children![0]);
    });

    expect(result.current.navigationPath).toEqual(['folder1']);

    const newScanResult: ScanResult = {
      ...mockScanResult,
      root: {
        name: 'newroot',
        path: '/newroot',
        size: 500,
        type: 'directory',
        children: [],
      },
    };

    rerender({ scanResult: newScanResult });

    expect(result.current.currentNode).toEqual(newScanResult.root);
    expect(result.current.navigationPath).toEqual([]);
  });

  it('handles null scan result', () => {
    const { result } = renderHook(() => useNavigation(null));

    expect(result.current.currentNode).toBeNull();
    expect(result.current.navigationPath).toEqual([]);
  });
});
