// Mock better-sqlite3 entirely since it's a native module incompatible with jsdom
const mockAll = jest.fn().mockReturnValue([]);
const mockRun = jest.fn().mockReturnValue({ lastInsertRowid: 0, changes: 0 });
const mockGet = jest.fn();
const mockExec = jest.fn();
const mockPragma = jest.fn();
const mockClose = jest.fn();

const mockPrepare = jest.fn(() => ({
  all: mockAll,
  run: mockRun,
  get: mockGet,
}));

const mockDbInstance = {
  prepare: mockPrepare,
  exec: mockExec,
  pragma: mockPragma,
  close: mockClose,
};

jest.mock('better-sqlite3', () => {
  return jest.fn(() => mockDbInstance);
});

// Mock fs for directory existence checks
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
}));

// Mock the logger
jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

import Database from 'better-sqlite3';
import fs from 'fs';

// We need to re-import the module fresh for each test to reset the singleton `db`
// Instead, we use closeDatabaseConnection to reset state between tests.
let dbModule: typeof import('@/lib/db');

beforeAll(async () => {
  dbModule = await import('@/lib/db');
});

describe('Database Layer (lib/db.ts)', () => {
  beforeEach(() => {
    // Close any existing connection to reset the module singleton
    dbModule.closeDatabaseConnection();
    // Clear all mocks AFTER close so the Database constructor mock stays intact
    jest.clearAllMocks();
  });

  describe('getDatabase (initialization)', () => {
    it('should create the data directory if it does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);

      dbModule.getAllTrackedPaths(); // triggers getDatabase()

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    });

    it('should not create the data directory if it already exists', () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);

      dbModule.getAllTrackedPaths(); // triggers getDatabase()

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it('should set WAL journal mode and enable foreign keys', () => {
      dbModule.getAllTrackedPaths(); // triggers getDatabase()

      expect(mockPragma).toHaveBeenCalledWith('journal_mode = WAL');
      expect(mockPragma).toHaveBeenCalledWith('foreign_keys = ON');
    });

    it('should initialize the schema via exec', () => {
      dbModule.getAllTrackedPaths(); // triggers getDatabase()

      expect(mockExec).toHaveBeenCalledTimes(1);
      const schemaSQL = mockExec.mock.calls[0][0];
      expect(schemaSQL).toContain('CREATE TABLE IF NOT EXISTS tracked_paths');
      expect(schemaSQL).toContain('CREATE TABLE IF NOT EXISTS history_snapshots');
      expect(schemaSQL).toContain('CREATE INDEX IF NOT EXISTS idx_snapshots_tracked_path');
      expect(schemaSQL).toContain('CREATE INDEX IF NOT EXISTS idx_snapshots_recorded_at');
    });

    it('should construct Database with the correct path', () => {
      dbModule.getAllTrackedPaths(); // triggers getDatabase()

      expect(Database).toHaveBeenCalledWith(expect.stringContaining('storyscan.db'));
    });

    it('should reuse existing database connection on subsequent calls', () => {
      dbModule.getAllTrackedPaths(); // first call - creates connection
      dbModule.getAllTrackedPaths(); // second call - reuses

      // Database constructor should only be called once
      expect(Database).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAllTrackedPaths', () => {
    it('should return tracked paths with isActive converted to boolean true', () => {
      mockAll.mockReturnValueOnce([
        {
          id: 1,
          path: '/data/media',
          label: 'Media',
          directoryConfigId: 'abc',
          createdAt: '2025-01-01T00:00:00Z',
          isActive: 1,
        },
      ]);

      const result = dbModule.getAllTrackedPaths();

      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
      expect(result[0].path).toBe('/data/media');
      expect(result[0].label).toBe('Media');
    });

    it('should return tracked paths with isActive converted to boolean false', () => {
      mockAll.mockReturnValueOnce([
        {
          id: 2,
          path: '/data/downloads',
          label: 'Downloads',
          directoryConfigId: null,
          createdAt: '2025-01-02T00:00:00Z',
          isActive: 0,
        },
      ]);

      const result = dbModule.getAllTrackedPaths();

      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(false);
    });

    it('should prepare the correct SQL query with column aliases', () => {
      mockAll.mockReturnValueOnce([]);

      dbModule.getAllTrackedPaths();

      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('directory_config_id as directoryConfigId')
      );
      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('ORDER BY created_at DESC'));
    });

    it('should return an empty array when no tracked paths exist', () => {
      mockAll.mockReturnValueOnce([]);

      const result = dbModule.getAllTrackedPaths();

      expect(result).toEqual([]);
    });

    it('should return multiple tracked paths with correct boolean conversion', () => {
      mockAll.mockReturnValueOnce([
        {
          id: 1,
          path: '/a',
          label: 'A',
          directoryConfigId: null,
          createdAt: '2025-01-01',
          isActive: 1,
        },
        {
          id: 2,
          path: '/b',
          label: 'B',
          directoryConfigId: null,
          createdAt: '2025-01-02',
          isActive: 0,
        },
        {
          id: 3,
          path: '/c',
          label: 'C',
          directoryConfigId: 'x',
          createdAt: '2025-01-03',
          isActive: 1,
        },
      ]);

      const result = dbModule.getAllTrackedPaths();

      expect(result).toHaveLength(3);
      expect(result[0].isActive).toBe(true);
      expect(result[1].isActive).toBe(false);
      expect(result[2].isActive).toBe(true);
    });
  });

  describe('addTrackedPath', () => {
    it('should insert a new tracked path with all parameters', () => {
      mockRun.mockReturnValueOnce({ lastInsertRowid: 42 });

      const result = dbModule.addTrackedPath('/data/media', 'Media Files', 'config-123');

      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tracked_paths')
      );
      expect(mockRun).toHaveBeenCalledWith('/data/media', 'Media Files', 'config-123');
      expect(result.id).toBe(42);
      expect(result.path).toBe('/data/media');
      expect(result.label).toBe('Media Files');
      expect(result.directoryConfigId).toBe('config-123');
      expect(result.isActive).toBe(true);
      expect(result.createdAt).toBeDefined();
    });

    it('should pass null for directoryConfigId when not provided', () => {
      mockRun.mockReturnValueOnce({ lastInsertRowid: 1 });

      dbModule.addTrackedPath('/data/downloads', 'Downloads');

      expect(mockRun).toHaveBeenCalledWith('/data/downloads', 'Downloads', null);
    });

    it('should return the lastInsertRowid as the id', () => {
      mockRun.mockReturnValueOnce({ lastInsertRowid: 99 });

      const result = dbModule.addTrackedPath('/data/backups', 'Backups');

      expect(result.id).toBe(99);
    });
  });

  describe('updateTrackedPath', () => {
    it('should update only the label when label is provided', () => {
      dbModule.updateTrackedPath(1, { label: 'New Label' });

      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('label = ?'));
      expect(mockRun).toHaveBeenCalledWith('New Label', 1);
    });

    it('should update only isActive when isActive is provided (true)', () => {
      dbModule.updateTrackedPath(5, { isActive: true });

      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('is_active = ?'));
      expect(mockRun).toHaveBeenCalledWith(1, 5);
    });

    it('should update only isActive when isActive is provided (false)', () => {
      dbModule.updateTrackedPath(5, { isActive: false });

      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('is_active = ?'));
      expect(mockRun).toHaveBeenCalledWith(0, 5);
    });

    it('should update both label and isActive when both are provided', () => {
      dbModule.updateTrackedPath(3, { label: 'Updated', isActive: false });

      const sql = mockPrepare.mock.calls.find(
        (call: string[]) => typeof call[0] === 'string' && call[0].includes('UPDATE tracked_paths')
      );
      expect(sql).toBeDefined();
      expect((sql as string[])[0]).toContain('label = ?');
      expect((sql as string[])[0]).toContain('is_active = ?');
      expect(mockRun).toHaveBeenCalledWith('Updated', 0, 3);
    });

    it('should do nothing when no updates are provided', () => {
      dbModule.updateTrackedPath(1, {});

      const updateCalls = mockPrepare.mock.calls.filter(
        (call: string[]) => typeof call[0] === 'string' && call[0].includes('UPDATE')
      );
      expect(updateCalls).toHaveLength(0);
    });
  });

  describe('deleteTrackedPath', () => {
    it('should delete the tracked path by id', () => {
      dbModule.deleteTrackedPath(7);

      expect(mockPrepare).toHaveBeenCalledWith('DELETE FROM tracked_paths WHERE id = ?');
      expect(mockRun).toHaveBeenCalledWith(7);
    });
  });

  describe('recordSnapshot', () => {
    it('should insert a snapshot with all parameters', () => {
      dbModule.recordSnapshot(1, 1048576, 100, 10);

      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO history_snapshots')
      );
      expect(mockRun).toHaveBeenCalledWith(1, 1048576, 100, 10);
    });

    it('should insert a snapshot with zero counts', () => {
      dbModule.recordSnapshot(5, 0, 0, 0);

      expect(mockRun).toHaveBeenCalledWith(5, 0, 0, 0);
    });
  });

  describe('getSnapshots', () => {
    it('should query with 1W range filter', () => {
      mockAll.mockReturnValueOnce([]);

      dbModule.getSnapshots([1], '1W');

      const sql = mockPrepare.mock.calls.find(
        (call: string[]) => typeof call[0] === 'string' && call[0].includes('history_snapshots')
      );
      expect(sql).toBeDefined();
      expect((sql as string[])[0]).toContain('-7 days');
    });

    it('should query with 1M range filter', () => {
      mockAll.mockReturnValueOnce([]);

      dbModule.getSnapshots([1], '1M');

      const sql = mockPrepare.mock.calls.find(
        (call: string[]) => typeof call[0] === 'string' && call[0].includes('-1 month')
      );
      expect(sql).toBeDefined();
    });

    it('should query with 3M range filter', () => {
      mockAll.mockReturnValueOnce([]);

      dbModule.getSnapshots([1], '3M');

      const sql = mockPrepare.mock.calls.find(
        (call: string[]) => typeof call[0] === 'string' && call[0].includes('-3 months')
      );
      expect(sql).toBeDefined();
    });

    it('should query with 6M range filter', () => {
      mockAll.mockReturnValueOnce([]);

      dbModule.getSnapshots([1], '6M');

      const sql = mockPrepare.mock.calls.find(
        (call: string[]) => typeof call[0] === 'string' && call[0].includes('-6 months')
      );
      expect(sql).toBeDefined();
    });

    it('should query with 1Y range filter', () => {
      mockAll.mockReturnValueOnce([]);

      dbModule.getSnapshots([1], '1Y');

      const sql = mockPrepare.mock.calls.find(
        (call: string[]) => typeof call[0] === 'string' && call[0].includes('-1 year')
      );
      expect(sql).toBeDefined();
    });

    it('should query with no date filter for ALL range', () => {
      mockAll.mockReturnValueOnce([]);

      dbModule.getSnapshots([1, 2], 'ALL');

      const sql = mockPrepare.mock.calls.find(
        (call: string[]) => typeof call[0] === 'string' && call[0].includes('history_snapshots')
      );
      expect(sql).toBeDefined();
      expect((sql as string[])[0]).not.toContain('datetime');
    });

    it('should default to no date filter for unknown range value', () => {
      mockAll.mockReturnValueOnce([]);

      dbModule.getSnapshots([1], 'UNKNOWN_RANGE');

      const sql = mockPrepare.mock.calls.find(
        (call: string[]) => typeof call[0] === 'string' && call[0].includes('history_snapshots')
      );
      expect(sql).toBeDefined();
      expect((sql as string[])[0]).not.toContain('datetime');
    });

    it('should generate correct placeholders for multiple path IDs', () => {
      mockAll.mockReturnValueOnce([]);

      dbModule.getSnapshots([1, 2, 3], 'ALL');

      const sql = mockPrepare.mock.calls.find(
        (call: string[]) => typeof call[0] === 'string' && call[0].includes('history_snapshots')
      );
      expect(sql).toBeDefined();
      expect((sql as string[])[0]).toContain('?,?,?');
    });

    it('should pass path IDs as spread arguments to all()', () => {
      mockAll.mockReturnValueOnce([]);

      dbModule.getSnapshots([10, 20], '1W');

      expect(mockAll).toHaveBeenCalledWith(10, 20);
    });

    it('should return the rows from the query', () => {
      const mockRows = [
        {
          id: 1,
          trackedPathId: 1,
          sizeBytes: 500,
          fileCount: 10,
          folderCount: 2,
          recordedAt: '2025-06-01',
        },
        {
          id: 2,
          trackedPathId: 1,
          sizeBytes: 600,
          fileCount: 12,
          folderCount: 2,
          recordedAt: '2025-06-02',
        },
      ];
      mockAll.mockReturnValueOnce(mockRows);

      const result = dbModule.getSnapshots([1], 'ALL');

      expect(result).toEqual(mockRows);
      expect(result).toHaveLength(2);
    });

    it('should include ORDER BY recorded_at ASC in the query', () => {
      mockAll.mockReturnValueOnce([]);

      dbModule.getSnapshots([1], 'ALL');

      const sql = mockPrepare.mock.calls.find(
        (call: string[]) =>
          typeof call[0] === 'string' && call[0].includes('ORDER BY recorded_at ASC')
      );
      expect(sql).toBeDefined();
    });
  });

  describe('getActiveTrackedPaths', () => {
    it('should only query for active paths (is_active = 1)', () => {
      mockAll.mockReturnValueOnce([]);

      dbModule.getActiveTrackedPaths();

      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('WHERE is_active = 1'));
    });

    it('should convert isActive to boolean for active paths', () => {
      mockAll.mockReturnValueOnce([
        {
          id: 1,
          path: '/active',
          label: 'Active',
          directoryConfigId: null,
          createdAt: '2025-01-01',
          isActive: 1,
        },
      ]);

      const result = dbModule.getActiveTrackedPaths();

      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
    });

    it('should return empty array when no active paths exist', () => {
      mockAll.mockReturnValueOnce([]);

      const result = dbModule.getActiveTrackedPaths();

      expect(result).toEqual([]);
    });
  });

  describe('closeDatabaseConnection', () => {
    it('should close the database and allow re-initialization', () => {
      // Trigger getDatabase to set the internal db
      dbModule.getAllTrackedPaths();
      expect(Database).toHaveBeenCalledTimes(1);

      // Close the connection
      dbModule.closeDatabaseConnection();
      expect(mockClose).toHaveBeenCalledTimes(1);

      // Trigger getDatabase again - should create new connection
      jest.clearAllMocks();
      mockAll.mockReturnValueOnce([]);
      dbModule.getAllTrackedPaths();
      expect(Database).toHaveBeenCalledTimes(1); // New instance created
    });

    it('should be safe to call when no connection exists', () => {
      // Connection was already closed in beforeEach, call again
      dbModule.closeDatabaseConnection();

      // Should not throw, and close should not be called since there's no connection
      expect(mockClose).not.toHaveBeenCalled();
    });
  });
});
