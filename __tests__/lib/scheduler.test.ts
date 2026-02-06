const mockSchedule = jest.fn();
const mockValidate = jest.fn().mockReturnValue(true);

jest.mock('node-cron', () => ({
  schedule: (...args: unknown[]) => mockSchedule(...args),
  validate: (...args: unknown[]) => mockValidate(...args),
}));

const mockScanDirectory = jest.fn();
const mockGetConfiguredDirectories = jest.fn().mockReturnValue([]);

jest.mock('@/lib/scanner', () => ({
  scanDirectory: (...args: unknown[]) => mockScanDirectory(...args),
  getConfiguredDirectories: () => mockGetConfiguredDirectories(),
}));

const mockRecordHistorySnapshots = jest.fn().mockReturnValue({ recorded: 0, total: 0 });

jest.mock('@/lib/history', () => ({
  recordHistorySnapshots: (...args: unknown[]) => mockRecordHistorySnapshots(...args),
}));

jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

import {
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
  runScheduledScan,
  hoursToCron,
  getSchedulerConfig,
} from '@/lib/scheduler';

describe('hoursToCron', () => {
  it('returns empty string for 0 hours', () => {
    expect(hoursToCron(0)).toBe('');
  });

  it('returns empty string for negative hours', () => {
    expect(hoursToCron(-1)).toBe('');
  });

  it('converts sub-hour to minutes', () => {
    expect(hoursToCron(0.5)).toBe('*/30 * * * *');
  });

  it('converts very small intervals to 1 minute minimum', () => {
    expect(hoursToCron(0.01)).toBe('*/1 * * * *');
  });

  it('converts 1 hour', () => {
    expect(hoursToCron(1)).toBe('0 */1 * * *');
  });

  it('converts 6 hours', () => {
    expect(hoursToCron(6)).toBe('0 */6 * * *');
  });

  it('converts 12 hours', () => {
    expect(hoursToCron(12)).toBe('0 */12 * * *');
  });

  it('converts 24 hours to daily', () => {
    expect(hoursToCron(24)).toBe('0 0 */1 * *');
  });

  it('converts 48 hours to every 2 days', () => {
    expect(hoursToCron(48)).toBe('0 0 */2 * *');
  });
});

describe('getSchedulerConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns defaults when no env vars set', () => {
    delete process.env.SCAN_CRON_ENABLED;
    delete process.env.SCAN_INTERVAL_HOURS;
    delete process.env.SCAN_ON_START;
    delete process.env.SCAN_CRON_EXPRESSION;

    const config = getSchedulerConfig();
    expect(config.enabled).toBe(true);
    expect(config.intervalHours).toBe(6);
    expect(config.scanOnStart).toBe(true);
    expect(config.cronExpression).toBe('');
  });

  it('disables when SCAN_CRON_ENABLED=false', () => {
    process.env.SCAN_CRON_ENABLED = 'false';
    expect(getSchedulerConfig().enabled).toBe(false);
  });

  it('reads custom interval', () => {
    process.env.SCAN_INTERVAL_HOURS = '12';
    expect(getSchedulerConfig().intervalHours).toBe(12);
  });

  it('disables scan on start when SCAN_ON_START=false', () => {
    process.env.SCAN_ON_START = 'false';
    expect(getSchedulerConfig().scanOnStart).toBe(false);
  });

  it('reads custom cron expression', () => {
    process.env.SCAN_CRON_EXPRESSION = '0 3 * * *';
    expect(getSchedulerConfig().cronExpression).toBe('0 3 * * *');
  });
});

describe('startScheduler / stopScheduler', () => {
  const originalEnv = process.env;
  let mockTask: { stop: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    process.env = { ...originalEnv };
    delete process.env.SCAN_CRON_ENABLED;
    delete process.env.SCAN_INTERVAL_HOURS;
    delete process.env.SCAN_ON_START;
    delete process.env.SCAN_CRON_EXPRESSION;

    mockTask = { stop: jest.fn() };
    mockSchedule.mockReturnValue(mockTask);
    mockValidate.mockReturnValue(true);

    // Ensure clean state
    stopScheduler();
  });

  afterEach(() => {
    stopScheduler();
    jest.useRealTimers();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('starts and reports running status', () => {
    startScheduler();
    expect(mockSchedule).toHaveBeenCalled();
    expect(getSchedulerStatus().running).toBe(true);
  });

  it('stops and reports not running', () => {
    startScheduler();
    stopScheduler();
    expect(mockTask.stop).toHaveBeenCalled();
    expect(getSchedulerStatus().running).toBe(false);
  });

  it('does not start when disabled', () => {
    process.env.SCAN_CRON_ENABLED = 'false';
    startScheduler();
    expect(mockSchedule).not.toHaveBeenCalled();
    expect(getSchedulerStatus().running).toBe(false);
  });

  it('does not start when interval is 0', () => {
    process.env.SCAN_INTERVAL_HOURS = '0';
    startScheduler();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('does not start with invalid cron expression', () => {
    process.env.SCAN_CRON_EXPRESSION = 'invalid';
    mockValidate.mockReturnValue(false);
    startScheduler();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('uses custom cron expression when provided', () => {
    process.env.SCAN_CRON_EXPRESSION = '0 3 * * *';
    startScheduler();
    expect(mockSchedule).toHaveBeenCalledWith('0 3 * * *', expect.any(Function));
  });

  it('uses hoursToCron-derived expression by default', () => {
    process.env.SCAN_INTERVAL_HOURS = '6';
    startScheduler();
    expect(mockSchedule).toHaveBeenCalledWith('0 */6 * * *', expect.any(Function));
  });

  it('stopScheduler is safe to call when not running', () => {
    expect(() => stopScheduler()).not.toThrow();
  });
});

describe('runScheduledScan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConfiguredDirectories.mockReturnValue(['/mnt/media']);
    mockScanDirectory.mockResolvedValue({
      name: 'media',
      path: '/mnt/media',
      size: 1000,
      type: 'directory',
      children: [],
    });
    mockRecordHistorySnapshots.mockReturnValue({ recorded: 1, total: 1 });
  });

  it('scans all configured directories', async () => {
    mockGetConfiguredDirectories.mockReturnValue(['/mnt/a', '/mnt/b']);
    mockScanDirectory.mockResolvedValue({
      name: 'dir',
      path: '/mnt/dir',
      size: 100,
      type: 'directory',
      children: [],
    });

    await runScheduledScan();

    expect(mockScanDirectory).toHaveBeenCalledTimes(2);
    expect(mockScanDirectory).toHaveBeenCalledWith('/mnt/a');
    expect(mockScanDirectory).toHaveBeenCalledWith('/mnt/b');
  });

  it('records history after scanning', async () => {
    await runScheduledScan();
    expect(mockRecordHistorySnapshots).toHaveBeenCalledTimes(1);
  });

  it('continues scanning other directories if one fails', async () => {
    mockGetConfiguredDirectories.mockReturnValue(['/mnt/bad', '/mnt/good']);
    mockScanDirectory.mockRejectedValueOnce(new Error('Permission denied')).mockResolvedValueOnce({
      name: 'good',
      path: '/mnt/good',
      size: 100,
      type: 'directory',
      children: [],
    });

    await runScheduledScan();

    expect(mockScanDirectory).toHaveBeenCalledTimes(2);
    expect(mockRecordHistorySnapshots).toHaveBeenCalledTimes(1);
  });

  it('reports scanning=false after completion', async () => {
    await runScheduledScan();
    expect(getSchedulerStatus().scanning).toBe(false);
  });
});
