import { describe, it, expect } from 'vitest';
import { createLogger } from '../core/logger.js';

describe('Logger', () => {
  it('should create logger with default level', () => {
    const logger = createLogger();
    expect(logger).toBeDefined();
  });

  it('should create logger with custom level', () => {
    const logger = createLogger('debug');
    expect(logger).toBeDefined();
  });

  it('should have error method', () => {
    const logger = createLogger();
    expect(logger.error).toBeDefined();
    logger.error('Test error');
  });

  it('should have warn method', () => {
    const logger = createLogger();
    expect(logger.warn).toBeDefined();
    logger.warn('Test warning');
  });

  it('should have info method', () => {
    const logger = createLogger();
    expect(logger.info).toBeDefined();
    logger.info('Test info');
  });

  it('should have debug method', () => {
    const logger = createLogger();
    expect(logger.debug).toBeDefined();
    logger.debug('Test debug');
  });

  it('should log with metadata', () => {
    const logger = createLogger();
    logger.info('Test with metadata', { key: 'value' });
  });

  it('should allow changing log level', () => {
    const logger = createLogger('error');
    logger.setLevel('debug');
    logger.debug('This should work');
  });
});
