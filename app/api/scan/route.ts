import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { FileNode } from '@/types';
import { createLogger } from '@/lib/logger';

// Logger instance for API endpoints
const logger = createLogger('API /api/scan');

// Validation schemas
const scanQuerySchema = z.object({
  dir: z.string().regex(/^\d+$/, 'Directory index must be a number').optional(),
});

// Get configured directories from environment variable
function getConfiguredDirectories(): string[] {
  const dirsEnv = process.env.SCAN_DIRECTORIES || '';
  if (!dirsEnv) {
    // Default to /data if no directories configured
    return ['/data'];
  }
  return dirsEnv
    .split(',')
    .map((d) => d.trim())
    .filter((d) => d.length > 0);
}

async function getDirectorySize(dirPath: string): Promise<FileNode> {
  const stats = await fs.stat(dirPath);
  const name = path.basename(dirPath);

  if (stats.isFile()) {
    return {
      name,
      path: dirPath,
      size: stats.size,
      type: 'file',
      extension: path.extname(name).slice(1).toLowerCase() || undefined,
      modifiedTime: stats.mtimeMs,
    };
  }

  if (stats.isDirectory()) {
    let totalSize = 0;
    const children: FileNode[] = [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        try {
          const childNode = await getDirectorySize(fullPath);
          children.push(childNode);
          totalSize += childNode.size;
        } catch (err) {
          // Skip files/directories we can't access
          logger.warn(`Skipping ${fullPath}:`, err);
        }
      }
    } catch (err) {
      logger.warn(`Cannot read directory ${dirPath}:`, err);
    }

    // Sort children by size (largest first)
    children.sort((a, b) => b.size - a.size);

    return {
      name,
      path: dirPath,
      size: totalSize,
      type: 'directory',
      children,
      modifiedTime: stats.mtimeMs,
    };
  }

  return {
    name,
    path: dirPath,
    size: 0,
    type: 'file',
    modifiedTime: stats.mtimeMs,
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const dirIndex = searchParams.get('dir');

  logger.group('Request received');
  logger.info(`URL: ${request.url}`);
  logger.info(`Directory index: ${dirIndex ?? 'null (list directories)'}`);
  logger.groupEnd();

  // Validate query parameters
  const validation = scanQuerySchema.safeParse({ dir: dirIndex ?? undefined });
  if (!validation.success) {
    logger.error('❌ Validation failed:', validation.error.issues);
    return NextResponse.json(
      {
        error: 'Invalid query parameters',
        details: validation.error.issues.map((e: { message: string }) => e.message).join(', '),
      },
      { status: 400 }
    );
  }

  const configuredDirs = getConfiguredDirectories();
  logger.info(`Configured directories (${configuredDirs.length}):`, configuredDirs);

  // If no specific directory requested, return list of available directories
  if (dirIndex === null) {
    const directories = configuredDirs.map((dir, index) => ({
      id: index.toString(),
      name: path.basename(dir) || dir,
      path: dir,
    }));
    logger.info(`✅ Returning directory list (${directories.length} directories)`);
    logger.info(`Response time: ${Date.now() - startTime}ms`);
    logger.groupEnd();
    return NextResponse.json({ directories });
  }

  const index = parseInt(dirIndex, 10);
  if (index < 0 || index >= configuredDirs.length) {
    logger.error(`❌ Directory index out of range: ${index} (max: ${configuredDirs.length - 1})`);
    logger.info(`Response time: ${Date.now() - startTime}ms`);
    logger.groupEnd();
    return NextResponse.json({ error: 'Directory index out of range' }, { status: 400 });
  }

  const targetDir = configuredDirs[index];
  logger.info(`📂 Starting scan of: ${targetDir} (index: ${index})`);

  try {
    // Check if directory exists
    await fs.access(targetDir);
    logger.info(`✓ Directory exists and is accessible`);

    const scanStartTime = Date.now();
    const result = await getDirectorySize(targetDir);
    const scanDuration = Date.now() - scanStartTime;

    logger.info(`✅ Scan completed successfully`);
    logger.info(`Total size: ${result.size} bytes`);
    logger.info(`Children: ${result.children?.length ?? 0} items`);
    logger.info(`Scan duration: ${scanDuration}ms`);
    logger.info(`Total response time: ${Date.now() - startTime}ms`);
    logger.groupEnd();

    return NextResponse.json({
      directory: {
        id: index.toString(),
        name: path.basename(targetDir) || targetDir,
        path: targetDir,
      },
      root: result,
      totalSize: result.size,
      scannedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`❌ Error scanning directory:`, error);
    logger.info(`Response time: ${Date.now() - startTime}ms`);
    logger.groupEnd();
    return NextResponse.json(
      { error: 'Failed to scan directory', details: (error as Error).message },
      { status: 500 }
    );
  }
}
