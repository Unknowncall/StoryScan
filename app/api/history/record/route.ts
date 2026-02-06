import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';
import { countNodes, findNodeByPath } from '@/lib/history';
import { getActiveTrackedPaths, recordSnapshot } from '@/lib/db';

const logger = createLogger('API /api/history/record');

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
