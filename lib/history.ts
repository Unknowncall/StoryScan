import { getActiveTrackedPaths, recordSnapshot } from '@/lib/db';
import { FileNode } from '@/types';
import { createLogger } from '@/lib/logger';

const logger = createLogger('History');

export interface FileNodeStats {
  sizeBytes: number;
  fileCount: number;
  folderCount: number;
}

export function countNodes(node: FileNode): FileNodeStats {
  if (node.type === 'file') {
    return { sizeBytes: node.size, fileCount: 1, folderCount: 0 };
  }

  let fileCount = 0;
  let folderCount = 1;
  const sizeBytes = node.size;

  if (node.children) {
    for (const child of node.children) {
      if (child.type === 'file') {
        fileCount++;
      } else {
        const childStats = countNodes(child);
        fileCount += childStats.fileCount;
        folderCount += childStats.folderCount;
      }
    }
  }

  return { sizeBytes, fileCount, folderCount };
}

export function findNodeByPath(root: FileNode, targetPath: string): FileNode | null {
  if (root.path === targetPath) return root;

  if (root.children) {
    for (const child of root.children) {
      const found = findNodeByPath(child, targetPath);
      if (found) return found;
    }
  }

  return null;
}

export function recordHistorySnapshots(root: FileNode): { recorded: number; total: number } {
  const activePaths = getActiveTrackedPaths();
  if (activePaths.length === 0) {
    return { recorded: 0, total: 0 };
  }

  let recorded = 0;

  for (const tracked of activePaths) {
    const node = findNodeByPath(root, tracked.path);
    if (node) {
      const stats = countNodes(node);
      recordSnapshot(tracked.id, stats.sizeBytes, stats.fileCount, stats.folderCount);
      recorded++;
      logger.debug(`Recorded snapshot for "${tracked.path}": ${stats.sizeBytes} bytes`);
    }
  }

  logger.info(`Recorded ${recorded}/${activePaths.length} snapshots`);
  return { recorded, total: activePaths.length };
}
