import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { FileNode } from '@/types';

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
          console.warn(`Skipping ${fullPath}:`, err);
        }
      }
    } catch (err) {
      console.warn(`Cannot read directory ${dirPath}:`, err);
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
  const searchParams = request.nextUrl.searchParams;
  const dirIndex = searchParams.get('dir');

  // Validate query parameters
  const validation = scanQuerySchema.safeParse({ dir: dirIndex ?? undefined });
  if (!validation.success) {
    return NextResponse.json(
      {
        error: 'Invalid query parameters',
        details: validation.error.issues.map((e: { message: string }) => e.message).join(', '),
      },
      { status: 400 }
    );
  }

  const configuredDirs = getConfiguredDirectories();

  // If no specific directory requested, return list of available directories
  if (dirIndex === null) {
    return NextResponse.json({
      directories: configuredDirs.map((dir, index) => ({
        id: index.toString(),
        name: path.basename(dir) || dir,
        path: dir,
      })),
    });
  }

  const index = parseInt(dirIndex, 10);
  if (index < 0 || index >= configuredDirs.length) {
    return NextResponse.json({ error: 'Directory index out of range' }, { status: 400 });
  }

  const targetDir = configuredDirs[index];

  try {
    // Check if directory exists
    await fs.access(targetDir);

    const result = await getDirectorySize(targetDir);

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
    console.error('Error scanning directory:', error);
    return NextResponse.json(
      { error: 'Failed to scan directory', details: (error as Error).message },
      { status: 500 }
    );
  }
}
