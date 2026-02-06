const mockGetActiveTrackedPaths = jest.fn().mockReturnValue([]);
const mockRecordSnapshot = jest.fn();

jest.mock('@/lib/db', () => ({
  getActiveTrackedPaths: (...args: unknown[]) => mockGetActiveTrackedPaths(...args),
  recordSnapshot: (...args: unknown[]) => mockRecordSnapshot(...args),
}));

jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

import { countNodes, findNodeByPath, recordHistorySnapshots } from '@/lib/history';
import { FileNode } from '@/types';

const makeFile = (name: string, size: number, filePath?: string): FileNode => ({
  name,
  path: filePath || `/test/${name}`,
  size,
  type: 'file',
  extension: name.split('.').pop(),
});

const makeDir = (name: string, children: FileNode[], dirPath?: string): FileNode => {
  const size = children.reduce((sum, c) => sum + c.size, 0);
  return {
    name,
    path: dirPath || `/test/${name}`,
    size,
    type: 'directory',
    children,
  };
};

describe('countNodes', () => {
  it('counts a single file', () => {
    const file = makeFile('a.txt', 100);
    expect(countNodes(file)).toEqual({ sizeBytes: 100, fileCount: 1, folderCount: 0 });
  });

  it('counts a directory with files', () => {
    const dir = makeDir('root', [makeFile('a.txt', 100), makeFile('b.txt', 200)]);
    const stats = countNodes(dir);
    expect(stats.fileCount).toBe(2);
    expect(stats.folderCount).toBe(1);
    expect(stats.sizeBytes).toBe(300);
  });

  it('counts nested directories', () => {
    const inner = makeDir('inner', [makeFile('c.txt', 50)]);
    const root = makeDir('root', [makeFile('a.txt', 100), inner]);
    const stats = countNodes(root);
    expect(stats.fileCount).toBe(2);
    expect(stats.folderCount).toBe(2); // root + inner
    expect(stats.sizeBytes).toBe(150);
  });

  it('handles empty directory', () => {
    const dir = makeDir('empty', []);
    const stats = countNodes(dir);
    expect(stats.fileCount).toBe(0);
    expect(stats.folderCount).toBe(1);
    expect(stats.sizeBytes).toBe(0);
  });

  it('handles directory with no children property', () => {
    const dir: FileNode = { name: 'dir', path: '/dir', size: 0, type: 'directory' };
    const stats = countNodes(dir);
    expect(stats.fileCount).toBe(0);
    expect(stats.folderCount).toBe(1);
  });
});

describe('findNodeByPath', () => {
  const tree = makeDir(
    'root',
    [
      makeFile('a.txt', 100, '/root/a.txt'),
      makeDir('sub', [makeFile('b.txt', 200, '/root/sub/b.txt')], '/root/sub'),
    ],
    '/root'
  );

  it('finds root node by path', () => {
    const found = findNodeByPath(tree, '/root');
    expect(found).toBe(tree);
  });

  it('finds a direct child file', () => {
    const found = findNodeByPath(tree, '/root/a.txt');
    expect(found).not.toBeNull();
    expect(found!.name).toBe('a.txt');
  });

  it('finds a nested file', () => {
    const found = findNodeByPath(tree, '/root/sub/b.txt');
    expect(found).not.toBeNull();
    expect(found!.name).toBe('b.txt');
  });

  it('finds a subdirectory', () => {
    const found = findNodeByPath(tree, '/root/sub');
    expect(found).not.toBeNull();
    expect(found!.type).toBe('directory');
  });

  it('returns null for non-existent path', () => {
    expect(findNodeByPath(tree, '/root/missing')).toBeNull();
  });

  it('returns null when tree has no children', () => {
    const leaf = makeFile('leaf.txt', 10, '/leaf.txt');
    expect(findNodeByPath(leaf, '/other')).toBeNull();
  });
});

describe('recordHistorySnapshots', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns zero when no active tracked paths', () => {
    mockGetActiveTrackedPaths.mockReturnValue([]);
    const root = makeDir('root', [makeFile('a.txt', 100, '/root/a.txt')], '/root');
    const result = recordHistorySnapshots(root);
    expect(result).toEqual({ recorded: 0, total: 0 });
    expect(mockRecordSnapshot).not.toHaveBeenCalled();
  });

  it('records snapshots for matching tracked paths', () => {
    mockGetActiveTrackedPaths.mockReturnValue([
      { id: 1, path: '/root', label: 'Root', isActive: true },
    ]);
    const root = makeDir('root', [makeFile('a.txt', 100, '/root/a.txt')], '/root');
    const result = recordHistorySnapshots(root);
    expect(result).toEqual({ recorded: 1, total: 1 });
    expect(mockRecordSnapshot).toHaveBeenCalledWith(1, 100, 1, 1);
  });

  it('skips tracked paths not found in scan tree', () => {
    mockGetActiveTrackedPaths.mockReturnValue([
      { id: 1, path: '/missing', label: 'Missing', isActive: true },
    ]);
    const root = makeDir('root', [], '/root');
    const result = recordHistorySnapshots(root);
    expect(result).toEqual({ recorded: 0, total: 1 });
    expect(mockRecordSnapshot).not.toHaveBeenCalled();
  });

  it('records multiple tracked paths', () => {
    mockGetActiveTrackedPaths.mockReturnValue([
      { id: 1, path: '/root', label: 'Root', isActive: true },
      { id: 2, path: '/root/sub', label: 'Sub', isActive: true },
    ]);
    const root = makeDir(
      'root',
      [makeDir('sub', [makeFile('b.txt', 50, '/root/sub/b.txt')], '/root/sub')],
      '/root'
    );
    const result = recordHistorySnapshots(root);
    expect(result).toEqual({ recorded: 2, total: 2 });
    expect(mockRecordSnapshot).toHaveBeenCalledTimes(2);
  });
});
