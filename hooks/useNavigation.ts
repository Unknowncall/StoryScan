import { useState, useCallback, useEffect } from 'react';
import { FileNode, ScanResult } from '@/types';

interface UseNavigationReturn {
  currentNode: FileNode | null;
  navigationPath: string[];
  handleNodeClick: (node: FileNode) => void;
  handleBreadcrumbNavigate: (index: number) => void;
  resetNavigation: () => void;
}

export function useNavigation(scanResult: ScanResult | null): UseNavigationReturn {
  const [currentNode, setCurrentNode] = useState<FileNode | null>(null);
  const [navigationPath, setNavigationPath] = useState<string[]>([]);

  // Reset navigation when scan result changes
  useEffect(() => {
    if (scanResult) {
      setCurrentNode(scanResult.root);
      setNavigationPath([]);
    } else {
      setCurrentNode(null);
      setNavigationPath([]);
    }
  }, [scanResult]);

  const handleNodeClick = useCallback((node: FileNode) => {
    if (node.type === 'directory') {
      setCurrentNode(node);
      setNavigationPath((prev) => [...prev, node.name]);
    }
  }, []);

  const handleBreadcrumbNavigate = useCallback(
    (index: number) => {
      if (!scanResult) return;

      if (index === 0) {
        setCurrentNode(scanResult.root);
        setNavigationPath([]);
      } else {
        const newPath = navigationPath.slice(0, index);
        let node = scanResult.root;

        for (const segment of newPath) {
          const child = node.children?.find((c) => c.name === segment);
          if (child) {
            node = child;
          }
        }

        setCurrentNode(node);
        setNavigationPath(newPath);
      }
    },
    [scanResult, navigationPath]
  );

  const resetNavigation = useCallback(() => {
    if (scanResult) {
      setCurrentNode(scanResult.root);
      setNavigationPath([]);
    }
  }, [scanResult]);

  return {
    currentNode,
    navigationPath,
    handleNodeClick,
    handleBreadcrumbNavigate,
    resetNavigation,
  };
}
