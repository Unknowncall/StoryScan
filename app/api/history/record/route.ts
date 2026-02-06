import { NextRequest, NextResponse } from 'next/server';
import { getActiveTrackedPaths, recordSnapshot } from '@/lib/db';
import { FileNode } from '@/types';
import { createLogger } from '@/lib/logger';

const logger = createLogger('API /api/history/record');

interface FileNodeStats {
  sizeBytes: number;
  fileCount: number;
  folderCount: number;
}

function countNodes(node: FileNode): FileNodeStats {
  if (node.type === 'file') {
    return { sizeBytes: node.size, fileCount: 1, folderCount: 0 };
  }

  let fileCount = 0;
  let folderCount = 1; // Count this directory
  let sizeBytes = node.size;

  // Size is already computed at each node level by the scan API,
  // so we just need to count files and folders
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

function findNodeByPath(root: FileNode, targetPath: string): FileNode | null {
  if (root.path === targetPath) return root;

  if (root.children) {
    for (const child of root.children) {
      const found = findNodeByPath(child, targetPath);
      if (found) return found;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scanResult } = body;

    if (!scanResult?.root) {
      return NextResponse.json({ error: 'scanResult with root is required' }, { status: 400 });
    }

    const activePaths = getActiveTrackedPaths();
    if (activePaths.length === 0) {
      return NextResponse.json({ recorded: 0 });
    }

    let recorded = 0;

    for (const tracked of activePaths) {
      const node = findNodeByPath(scanResult.root, tracked.path);
      if (node) {
        const stats = countNodes(node);
        recordSnapshot(tracked.id, stats.sizeBytes, stats.fileCount, stats.folderCount);
        recorded++;
        logger.debug(`Recorded snapshot for "${tracked.path}": ${stats.sizeBytes} bytes`);
      }
    }

    logger.info(`Recorded ${recorded}/${activePaths.length} snapshots`);
    return NextResponse.json({ recorded });
  } catch (error) {
    logger.error('Failed to record snapshots:', error);
    return NextResponse.json(
      { error: 'Failed to record snapshots', details: (error as Error).message },
      { status: 500 }
    );
  }
}
