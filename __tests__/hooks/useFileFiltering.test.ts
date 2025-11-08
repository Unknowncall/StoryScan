import { renderHook } from '@testing-library/react';
import { useFileFiltering } from '@/hooks/useFileFiltering';
import { FileNode, AdvancedFilters } from '@/types';

describe('useFileFiltering', () => {
  const mockNode: FileNode = {
    name: 'root',
    path: '/root',
    size: 5000,
    type: 'directory',
    children: [
      {
        name: 'video.mp4',
        path: '/root/video.mp4',
        size: 2000,
        type: 'file',
        extension: 'mp4',
        modifiedTime: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
      },
      {
        name: 'document.pdf',
        path: '/root/document.pdf',
        size: 500,
        type: 'file',
        extension: 'pdf',
        modifiedTime: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
      },
      {
        name: 'image.jpg',
        path: '/root/image.jpg',
        size: 100,
        type: 'file',
        extension: 'jpg',
        modifiedTime: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
      },
    ],
  };

  const defaultFilters: AdvancedFilters = {
    size: { enabled: false },
    date: { enabled: false },
  };

  it('returns unfiltered node when no filters are active', () => {
    const { result } = renderHook(() =>
      useFileFiltering({
        currentNode: mockNode,
        searchQuery: '',
        extensionFilter: null,
        typeFilter: null,
        advancedFilters: defaultFilters,
      })
    );

    expect(result.current.filteredNode).toEqual(mockNode);
    expect(result.current.matchCount).toBe(0);
  });

  it('filters by search query', () => {
    const { result } = renderHook(() =>
      useFileFiltering({
        currentNode: mockNode,
        searchQuery: 'video',
        extensionFilter: null,
        typeFilter: null,
        advancedFilters: defaultFilters,
      })
    );

    expect(result.current.matchCount).toBe(1);
    expect(result.current.filteredNode?.children).toHaveLength(1);
    expect(result.current.filteredNode?.children?.[0].name).toBe('video.mp4');
  });

  it('filters by extension', () => {
    const { result } = renderHook(() =>
      useFileFiltering({
        currentNode: mockNode,
        searchQuery: '',
        extensionFilter: 'pdf',
        typeFilter: null,
        advancedFilters: defaultFilters,
      })
    );

    expect(result.current.filteredNode?.children).toHaveLength(1);
    expect(result.current.filteredNode?.children?.[0].name).toBe('document.pdf');
  });

  it('filters by type category', () => {
    const { result } = renderHook(() =>
      useFileFiltering({
        currentNode: mockNode,
        searchQuery: '',
        extensionFilter: null,
        typeFilter: 'Videos',
        advancedFilters: defaultFilters,
      })
    );

    expect(result.current.matchCount).toBe(1);
    expect(result.current.filteredNode?.children?.[0].name).toBe('video.mp4');
  });

  it('filters by size range', () => {
    const { result } = renderHook(() =>
      useFileFiltering({
        currentNode: mockNode,
        searchQuery: '',
        extensionFilter: null,
        typeFilter: null,
        advancedFilters: {
          size: { enabled: true, min: 500, max: 2000 },
          date: { enabled: false },
        },
      })
    );

    expect(result.current.matchCount).toBe(2);
    expect(result.current.filteredNode?.children?.map((c) => c.name)).toEqual([
      'video.mp4',
      'document.pdf',
    ]);
  });

  it('filters by date', () => {
    const { result } = renderHook(() =>
      useFileFiltering({
        currentNode: mockNode,
        searchQuery: '',
        extensionFilter: null,
        typeFilter: null,
        advancedFilters: {
          size: { enabled: false },
          date: { enabled: true, olderThan: 7 },
        },
      })
    );

    expect(result.current.matchCount).toBe(1);
    expect(result.current.filteredNode?.children?.[0].name).toBe('video.mp4');
  });

  it('combines multiple filters', () => {
    const { result } = renderHook(() =>
      useFileFiltering({
        currentNode: mockNode,
        searchQuery: 'doc',
        extensionFilter: 'pdf',
        typeFilter: null,
        advancedFilters: {
          size: { enabled: true, min: 100, max: 1000 },
          date: { enabled: false },
        },
      })
    );

    expect(result.current.matchCount).toBe(1);
    expect(result.current.filteredNode?.children?.[0].name).toBe('document.pdf');
  });

  it('collects available extensions', () => {
    const { result } = renderHook(() =>
      useFileFiltering({
        currentNode: mockNode,
        searchQuery: '',
        extensionFilter: null,
        typeFilter: null,
        advancedFilters: defaultFilters,
      })
    );

    expect(result.current.availableExtensions).toContain('mp4');
    expect(result.current.availableExtensions).toContain('pdf');
    expect(result.current.availableExtensions).toContain('jpg');
  });

  it('handles null current node', () => {
    const { result } = renderHook(() =>
      useFileFiltering({
        currentNode: null,
        searchQuery: '',
        extensionFilter: null,
        typeFilter: null,
        advancedFilters: defaultFilters,
      })
    );

    expect(result.current.filteredNode).toBeNull();
    expect(result.current.matchCount).toBe(0);
    expect(result.current.availableExtensions).toEqual([]);
  });
});
