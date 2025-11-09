import { createLogger, logger, LogLevel } from '@/lib/logger';

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('createLogger', () => {
    it('should create logger with prefix', () => {
      const testLogger = createLogger('TEST');
      testLogger.setEnabled(true);
      testLogger.setLevel(LogLevel.INFO);

      testLogger.info('test message');

      expect(consoleLogSpy).toHaveBeenCalledWith('[TEST] test message');
    });

    it('should create logger without prefix', () => {
      const testLogger = createLogger('');
      testLogger.setEnabled(true);
      testLogger.setLevel(LogLevel.INFO);

      testLogger.info('test message');

      expect(consoleLogSpy).toHaveBeenCalledWith('test message');
    });
  });

  describe('Log Levels', () => {
    it('should log debug messages when level is DEBUG', () => {
      const testLogger = createLogger('TEST');
      testLogger.setEnabled(true);
      testLogger.setLevel(LogLevel.DEBUG);

      testLogger.debug('debug message');

      expect(consoleLogSpy).toHaveBeenCalledWith('[TEST] debug message');
    });

    it('should log info messages when level is INFO', () => {
      const testLogger = createLogger('TEST');
      testLogger.setEnabled(true);
      testLogger.setLevel(LogLevel.INFO);

      testLogger.info('info message');

      expect(consoleLogSpy).toHaveBeenCalledWith('[TEST] info message');
    });

    it('should log warning messages when level is WARN', () => {
      const testLogger = createLogger('TEST');
      testLogger.setEnabled(true);
      testLogger.setLevel(LogLevel.WARN);

      testLogger.warn('warning message');

      expect(consoleWarnSpy).toHaveBeenCalledWith('[TEST] warning message');
    });

    it('should log error messages when level is ERROR', () => {
      const testLogger = createLogger('TEST');
      testLogger.setEnabled(true);
      testLogger.setLevel(LogLevel.ERROR);

      testLogger.error('error message');

      expect(consoleErrorSpy).toHaveBeenCalledWith('[TEST] error message');
    });

    it('should not log debug messages when level is INFO', () => {
      const testLogger = createLogger('TEST');
      testLogger.setEnabled(true);
      testLogger.setLevel(LogLevel.INFO);

      testLogger.debug('debug message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should not log info messages when level is WARN', () => {
      const testLogger = createLogger('TEST');
      testLogger.setEnabled(true);
      testLogger.setLevel(LogLevel.WARN);

      testLogger.info('info message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should not log warning messages when level is ERROR', () => {
      const testLogger = createLogger('TEST');
      testLogger.setEnabled(true);
      testLogger.setLevel(LogLevel.ERROR);

      testLogger.warn('warning message');

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should not log any messages when level is NONE', () => {
      const testLogger = createLogger('TEST');
      testLogger.setEnabled(true);
      testLogger.setLevel(LogLevel.NONE);

      testLogger.debug('debug');
      testLogger.info('info');
      testLogger.warn('warn');
      testLogger.error('error');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Enable/Disable', () => {
    it('should not log when disabled', () => {
      const testLogger = createLogger('TEST');
      testLogger.setEnabled(false);
      testLogger.setLevel(LogLevel.DEBUG);

      testLogger.debug('debug');
      testLogger.info('info');
      testLogger.warn('warn');
      testLogger.error('error');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should log when enabled', () => {
      const testLogger = createLogger('TEST');
      testLogger.setEnabled(true);
      testLogger.setLevel(LogLevel.INFO);

      testLogger.info('info message');

      expect(consoleLogSpy).toHaveBeenCalledWith('[TEST] info message');
    });

    it('should toggle logging on and off', () => {
      const testLogger = createLogger('TEST');
      testLogger.setLevel(LogLevel.INFO);

      testLogger.setEnabled(false);
      testLogger.info('should not log');
      expect(consoleLogSpy).not.toHaveBeenCalled();

      testLogger.setEnabled(true);
      testLogger.info('should log');
      expect(consoleLogSpy).toHaveBeenCalledWith('[TEST] should log');
    });
  });

  describe('Additional Arguments', () => {
    it('should pass additional arguments to console methods', () => {
      const testLogger = createLogger('TEST');
      testLogger.setEnabled(true);
      testLogger.setLevel(LogLevel.INFO);

      const obj = { key: 'value' };
      const arr = [1, 2, 3];

      testLogger.info('message with args', obj, arr);

      expect(consoleLogSpy).toHaveBeenCalledWith('[TEST] message with args', obj, arr);
    });
  });

  describe('Groups', () => {
    it('should create log group with title', () => {
      const testLogger = createLogger('TEST');
      testLogger.setEnabled(true);

      testLogger.group('Group Title');

      expect(consoleLogSpy).toHaveBeenCalledWith('===================================');
      expect(consoleLogSpy).toHaveBeenCalledWith('[TEST] Group Title');
    });

    it('should create log group without title', () => {
      const testLogger = createLogger('TEST');
      testLogger.setEnabled(true);

      testLogger.group();

      expect(consoleLogSpy).toHaveBeenCalledWith('===================================');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    it('should end log group', () => {
      const testLogger = createLogger('TEST');
      testLogger.setEnabled(true);

      testLogger.groupEnd();

      expect(consoleLogSpy).toHaveBeenCalledWith('===================================\n');
    });

    it('should not create groups when disabled', () => {
      const testLogger = createLogger('TEST');
      testLogger.setEnabled(false);

      testLogger.group('Title');
      testLogger.groupEnd();

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('getLevel', () => {
    it('should return current log level', () => {
      const testLogger = createLogger('TEST');
      testLogger.setLevel(LogLevel.DEBUG);

      expect(testLogger.getLevel()).toBe(LogLevel.DEBUG);
    });

    it('should reflect log level changes', () => {
      const testLogger = createLogger('TEST');
      testLogger.setLevel(LogLevel.INFO);
      expect(testLogger.getLevel()).toBe(LogLevel.INFO);

      testLogger.setLevel(LogLevel.ERROR);
      expect(testLogger.getLevel()).toBe(LogLevel.ERROR);
    });
  });

  describe('Default Logger Instance', () => {
    it('should export default logger instance', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
    });
  });
});
