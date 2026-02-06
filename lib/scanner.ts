import { promises as fs } from 'fs';
import path from 'path';
import { FileNode } from '@/types';
import { createLogger } from '@/lib/logger';

const logger = createLogger('Scanner');

export function getConfiguredDirectories(): string[] {
  const dirsEnv = process.env.SCAN_DIRECTORIES || '';
  if (!dirsEnv) {
    return ['/data'];
  }
  return dirsEnv
    .split(',')
    .map((d) => d.trim())
    .filter((d) => d.length > 0);
}

export function getTreemapConfig() {
  return {
    maxNodes: parseInt(process.env.TREEMAP_MAX_NODES || '20000', 10),
    maxDepth: parseInt(process.env.TREEMAP_MAX_DEPTH || '5', 10),
    lightThreshold: parseInt(process.env.TREEMAP_LIGHT_THRESHOLD || '5000', 10),
    moderateThreshold: parseInt(process.env.TREEMAP_MODERATE_THRESHOLD || '15000', 10),
    aggressiveThreshold: parseInt(process.env.TREEMAP_AGGRESSIVE_THRESHOLD || '50000', 10),
  };
}

export async function scanDirectory(dirPath: string): Promise<FileNode> {
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
          const childNode = await scanDirectory(fullPath);
          children.push(childNode);
          totalSize += childNode.size;
        } catch (err) {
          logger.warn(`Skipping ${fullPath}:`, err);
        }
      }
    } catch (err) {
      logger.warn(`Cannot read directory ${dirPath}:`, err);
    }

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
