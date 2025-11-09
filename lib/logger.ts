/**
 * Logger utility for StoryScan
 * Provides structured logging with log levels and environment-aware behavior
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LoggerConfig {
  level: LogLevel;
  prefix?: string;
  enabled?: boolean;
}

class Logger {
  private level: LogLevel;
  private prefix: string;
  private enabled: boolean;

  constructor(config: LoggerConfig = { level: LogLevel.INFO, enabled: true }) {
    this.level = config.level;
    this.prefix = config.prefix || '';
    this.enabled = config.enabled ?? true;
  }

  /**
   * Set the minimum log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Check if logging is enabled for a specific level
   */
  private shouldLog(level: LogLevel): boolean {
    return this.enabled && level >= this.level;
  }

  /**
   * Format log message with prefix
   */
  private formatMessage(message: string): string {
    return this.prefix ? `[${this.prefix}] ${message}` : message;
  }

  /**
   * Debug level logging
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage(message), ...args);
    }
  }

  /**
   * Info level logging
   */
  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage(message), ...args);
    }
  }

  /**
   * Warning level logging
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(message), ...args);
    }
  }

  /**
   * Error level logging
   */
  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(message), ...args);
    }
  }

  /**
   * Start a log group with separator
   */
  group(title?: string): void {
    if (this.enabled) {
      console.log('===================================');
      if (title) {
        console.log(this.formatMessage(title));
      }
    }
  }

  /**
   * End a log group with separator
   */
  groupEnd(): void {
    if (this.enabled) {
      console.log('===================================\n');
    }
  }
}

/**
 * Get log level from environment variable
 */
function getLogLevelFromEnv(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase();

  switch (envLevel) {
    case 'DEBUG':
      return LogLevel.DEBUG;
    case 'INFO':
      return LogLevel.INFO;
    case 'WARN':
      return LogLevel.WARN;
    case 'ERROR':
      return LogLevel.ERROR;
    case 'NONE':
      return LogLevel.NONE;
    default:
      // Default to INFO in development, WARN in production
      return process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.INFO;
  }
}

/**
 * Check if logging is enabled from environment
 */
function isLoggingEnabled(): boolean {
  const envEnabled = process.env.ENABLE_LOGGING;

  if (envEnabled !== undefined) {
    return envEnabled === 'true' || envEnabled === '1';
  }

  // Default to enabled in development, disabled in test
  return process.env.NODE_ENV !== 'test';
}

/**
 * Create a logger instance with optional prefix
 */
export function createLogger(prefix: string): Logger {
  return new Logger({
    level: getLogLevelFromEnv(),
    prefix,
    enabled: isLoggingEnabled(),
  });
}

/**
 * Default logger instance (no prefix)
 */
export const logger = new Logger({
  level: getLogLevelFromEnv(),
  enabled: isLoggingEnabled(),
});

export default logger;
