import cron, { ScheduledTask } from 'node-cron';
import { getConfiguredDirectories, scanDirectory } from '@/lib/scanner';
import { recordHistorySnapshots } from '@/lib/history';
import { createLogger } from '@/lib/logger';

const logger = createLogger('Scheduler');

let task: ScheduledTask | null = null;
let isScanning = false;

function getSchedulerConfig() {
  const enabled = process.env.SCAN_CRON_ENABLED !== 'false';
  const intervalHours = parseFloat(process.env.SCAN_INTERVAL_HOURS || '6');
  const scanOnStart = process.env.SCAN_ON_START !== 'false';
  const cronExpression = process.env.SCAN_CRON_EXPRESSION || '';

  return { enabled, intervalHours, scanOnStart, cronExpression };
}

/**
 * Convert hours to a cron expression.
 * - Whole hours (1-23): "0 *\/N * * *"
 * - Sub-hour (e.g. 0.5 = 30min): "*\/M * * * *"
 * - 24+: "0 0 *\/D * *" (every D days)
 */
function hoursToCron(hours: number): string {
  if (hours <= 0) return '';

  if (hours < 1) {
    const minutes = Math.max(1, Math.round(hours * 60));
    return `*/${minutes} * * * *`;
  }

  if (hours < 24) {
    const wholeHours = Math.max(1, Math.round(hours));
    return `0 */${wholeHours} * * *`;
  }

  const days = Math.max(1, Math.round(hours / 24));
  return `0 0 */${days} * *`;
}

async function runScheduledScan(): Promise<void> {
  if (isScanning) {
    logger.info('Scan already in progress, skipping');
    return;
  }

  isScanning = true;
  const startTime = Date.now();

  try {
    const directories = getConfiguredDirectories();
    logger.info(`Starting scheduled scan of ${directories.length} directories`);

    for (const dir of directories) {
      try {
        logger.info(`Scanning: ${dir}`);
        const result = await scanDirectory(dir);
        const { recorded, total } = recordHistorySnapshots(result);
        logger.info(
          `Scanned ${dir}: ${result.size} bytes, recorded ${recorded}/${total} snapshots`
        );
      } catch (err) {
        logger.error(`Failed to scan ${dir}:`, err);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    logger.info(`Scheduled scan completed in ${duration}s`);
  } finally {
    isScanning = false;
  }
}

export function startScheduler(): void {
  const config = getSchedulerConfig();

  if (!config.enabled || config.intervalHours <= 0) {
    logger.info('Scheduler is disabled');
    return;
  }

  const expression = config.cronExpression || hoursToCron(config.intervalHours);

  if (!cron.validate(expression)) {
    logger.error(`Invalid cron expression: "${expression}"`);
    return;
  }

  task = cron.schedule(expression, () => {
    runScheduledScan();
  });

  logger.info(`Scheduler started: "${expression}" (every ${config.intervalHours}h)`);

  if (config.scanOnStart) {
    setTimeout(() => {
      logger.info('Running initial scan on startup');
      runScheduledScan();
    }, 0);
  }
}

export function stopScheduler(): void {
  if (task) {
    task.stop();
    task = null;
    logger.info('Scheduler stopped');
  }
}

export function getSchedulerStatus(): { running: boolean; scanning: boolean } {
  return {
    running: task !== null,
    scanning: isScanning,
  };
}

// Exported for testing
export { runScheduledScan, hoursToCron, getSchedulerConfig };
