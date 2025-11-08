import { useMemo } from 'react';
import { FileNode, AdvancedFilters } from '@/types';

interface UseFileFilteringReturn {
  filteredNode: FileNode | null;
  matchCount: number;
  availableExtensions: string[];
}

interface UseFileFilteringProps {
  currentNode: FileNode | null;
  searchQuery: string;
  extensionFilter: string | null;
  typeFilter: string | null;
  advancedFilters: AdvancedFilters;
}

// File type categories
const FILE_TYPE_CATEGORIES: Record<string, string[]> = {
  Videos: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v'],
  Images: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff'],
  Documents: ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'pptx', 'odt'],
  Audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'],
  Archives: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'iso'],
  Code: ['js', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'css', 'html', 'jsx', 'json', 'xml'],
};

function matchesTypeCategory(node: FileNode, category: string): boolean {
  if (node.type !== 'file' || !node.extension) return false;

  const ext = node.extension.toLowerCase();
  return FILE_TYPE_CATEGORIES[category]?.includes(ext) || false;
}

export function useFileFiltering({
  currentNode,
  searchQuery,
  extensionFilter,
  typeFilter,
  advancedFilters,
}: UseFileFilteringProps): UseFileFilteringReturn {
  // Get available extensions
  const availableExtensions = useMemo(() => {
    if (!currentNode) return [];
    const extensions = new Set<string>();

    function collectExtensions(node: FileNode) {
      if (node.type === 'file' && node.extension) {
        extensions.add(node.extension);
      }
      if (node.children) {
        node.children.forEach(collectExtensions);
      }
    }

    collectExtensions(currentNode);
    return Array.from(extensions);
  }, [currentNode]);

  // Filter and search logic
  const { filteredNode, matchCount } = useMemo(() => {
    if (!currentNode) return { filteredNode: null, matchCount: 0 };

    let count = 0;
    const query = searchQuery.toLowerCase();
    const hasSearch = query.length > 0;
    const hasExtFilter = extensionFilter !== null;
    const hasTypeFilter = typeFilter !== null;
    const hasSizeFilter = advancedFilters.size.enabled;
    const hasDateFilter = advancedFilters.date.enabled;

    if (!hasSearch && !hasExtFilter && !hasTypeFilter && !hasSizeFilter && !hasDateFilter) {
      return { filteredNode: currentNode, matchCount: 0 };
    }

    // Helper to check if node matches filters
    function matchesFilters(node: FileNode): boolean {
      let matches = true;

      if (hasSearch) {
        matches = matches && node.name.toLowerCase().includes(query);
      }

      if (hasExtFilter && node.type === 'file') {
        matches = matches && node.extension === extensionFilter;
      }

      if (hasTypeFilter) {
        matches = matches && matchesTypeCategory(node, typeFilter);
      }

      if (hasSizeFilter) {
        const { min, max } = advancedFilters.size;
        if (min !== undefined && node.size < min) {
          matches = false;
        }
        if (max !== undefined && node.size > max) {
          matches = false;
        }
      }

      if (hasDateFilter && advancedFilters.date.olderThan) {
        if (node.modifiedTime) {
          const now = Date.now();
          const ageInDays = (now - node.modifiedTime) / (1000 * 60 * 60 * 24);
          if (ageInDays < advancedFilters.date.olderThan) {
            matches = false;
          }
        } else {
          // If no modified time, exclude from date filter
          matches = false;
        }
      }

      return matches;
    }

    // Filter tree recursively
    function filterNode(node: FileNode): FileNode | null {
      const nodeMatches = matchesFilters(node);

      if (node.type === 'file') {
        if (nodeMatches) {
          count++;
          return node;
        }
        return null;
      }

      // For directories, recursively filter children
      if (node.children) {
        const filteredChildren = node.children
          .map(filterNode)
          .filter((child): child is FileNode => child !== null);

        if (filteredChildren.length > 0 || nodeMatches) {
          if (nodeMatches) count++;
          return {
            ...node,
            children: filteredChildren,
            size: filteredChildren.reduce((sum, child) => sum + child.size, 0),
          };
        }
      }

      return null;
    }

    const filtered = filterNode(currentNode);
    return { filteredNode: filtered || currentNode, matchCount: count };
  }, [currentNode, searchQuery, extensionFilter, typeFilter, advancedFilters]);

  return {
    filteredNode,
    matchCount,
    availableExtensions,
  };
}
