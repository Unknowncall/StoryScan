jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

import { getConfiguredDirectories, getTreemapConfig, scanDirectory } from '@/lib/scanner';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('getConfiguredDirectories', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns /data when SCAN_DIRECTORIES is not set', () => {
    delete process.env.SCAN_DIRECTORIES;
    expect(getConfiguredDirectories()).toEqual(['/data']);
  });

  it('returns /data when SCAN_DIRECTORIES is empty', () => {
    process.env.SCAN_DIRECTORIES = '';
    expect(getConfiguredDirectories()).toEqual(['/data']);
  });

  it('parses a single directory', () => {
    process.env.SCAN_DIRECTORIES = '/mnt/media';
    expect(getConfiguredDirectories()).toEqual(['/mnt/media']);
  });

  it('parses multiple comma-separated directories', () => {
    process.env.SCAN_DIRECTORIES = '/mnt/media, /mnt/downloads , /mnt/backups';
    expect(getConfiguredDirectories()).toEqual(['/mnt/media', '/mnt/downloads', '/mnt/backups']);
  });

  it('filters out empty segments', () => {
    process.env.SCAN_DIRECTORIES = '/mnt/media,,/mnt/downloads';
    expect(getConfiguredDirectories()).toEqual(['/mnt/media', '/mnt/downloads']);
  });
});

describe('getTreemapConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns default values when no env vars set', () => {
    delete process.env.TREEMAP_MAX_NODES;
    delete process.env.TREEMAP_MAX_DEPTH;
    delete process.env.TREEMAP_LIGHT_THRESHOLD;
    delete process.env.TREEMAP_MODERATE_THRESHOLD;
    delete process.env.TREEMAP_AGGRESSIVE_THRESHOLD;
    expect(getTreemapConfig()).toEqual({
      maxNodes: 20000,
      maxDepth: 5,
      lightThreshold: 5000,
      moderateThreshold: 15000,
      aggressiveThreshold: 50000,
    });
  });

  it('reads custom values from env vars', () => {
    process.env.TREEMAP_MAX_NODES = '10000';
    process.env.TREEMAP_MAX_DEPTH = '3';
    process.env.TREEMAP_LIGHT_THRESHOLD = '2000';
    process.env.TREEMAP_MODERATE_THRESHOLD = '8000';
    process.env.TREEMAP_AGGRESSIVE_THRESHOLD = '30000';
    expect(getTreemapConfig()).toEqual({
      maxNodes: 10000,
      maxDepth: 3,
      lightThreshold: 2000,
      moderateThreshold: 8000,
      aggressiveThreshold: 30000,
    });
  });
});

describe('scanDirectory', () => {
  let tmpDir: string;

  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'scanner-test-'));
    // Create test structure:
    // tmpDir/
    //   file1.txt (11 bytes)
    //   subdir/
    //     file2.json (15 bytes)
    await fs.writeFile(path.join(tmpDir, 'file1.txt'), 'hello world');
    await fs.mkdir(path.join(tmpDir, 'subdir'));
    await fs.writeFile(path.join(tmpDir, 'subdir', 'file2.json'), '{"key":"value"}');
  });

  afterAll(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('scans a single file', async () => {
    const result = await scanDirectory(path.join(tmpDir, 'file1.txt'));
    expect(result.name).toBe('file1.txt');
    expect(result.type).toBe('file');
    expect(result.extension).toBe('txt');
    expect(result.size).toBe(11);
  });

  it('scans a directory recursively', async () => {
    const result = await scanDirectory(tmpDir);
    expect(result.type).toBe('directory');
    expect(result.children).toHaveLength(2);
    expect(result.size).toBe(26); // 11 + 15
  });

  it('sorts children by size descending', async () => {
    const result = await scanDirectory(tmpDir);
    const names = result.children!.map((c) => c.name);
    // subdir (15 bytes) should come before file1.txt (11 bytes)
    expect(names[0]).toBe('subdir');
    expect(names[1]).toBe('file1.txt');
  });

  it('includes modifiedTime on nodes', async () => {
    const result = await scanDirectory(path.join(tmpDir, 'file1.txt'));
    expect(result.modifiedTime).toBeDefined();
    expect(typeof result.modifiedTime).toBe('number');
  });

  it('handles nested directories', async () => {
    const result = await scanDirectory(tmpDir);
    const subdir = result.children!.find((c) => c.name === 'subdir');
    expect(subdir).toBeDefined();
    expect(subdir!.type).toBe('directory');
    expect(subdir!.children).toHaveLength(1);
    expect(subdir!.children![0].name).toBe('file2.json');
    expect(subdir!.children![0].extension).toBe('json');
  });
});
