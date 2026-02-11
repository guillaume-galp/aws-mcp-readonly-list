import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Config } from '../core/config.js';

describe('Config', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should load default configuration', () => {
    const config = new Config();
    const cfg = config.get();

    expect(cfg.region).toBe('us-east-1');
    expect(cfg.logLevel).toBe('info');
  });

  it('should load configuration from environment variables', () => {
    process.env.AWS_REGION = 'us-west-2';
    process.env.AWS_ASSUME_ROLE_ARN =
      'arn:aws:iam::123456789012:role/test';
    process.env.AWS_SESSION_DURATION = '7200';
    process.env.LOG_LEVEL = 'debug';

    const config = new Config();
    const cfg = config.get();

    expect(cfg.region).toBe('us-west-2');
    expect(cfg.assumeRoleArn).toBe('arn:aws:iam::123456789012:role/test');
    expect(cfg.sessionDuration).toBe(7200);
    expect(cfg.logLevel).toBe('debug');
  });

  it('should use default region when empty', () => {
    process.env.AWS_REGION = '';

    const config = new Config();
    expect(config.getRegion()).toBe('us-east-1');
  });

  it('should validate session duration bounds', () => {
    process.env.AWS_SESSION_DURATION = '300';

    expect(() => new Config()).toThrow();
  });

  it('should provide getter methods', () => {
    process.env.AWS_REGION = 'eu-west-1';
    const config = new Config();

    expect(config.getRegion()).toBe('eu-west-1');
    expect(config.getLogLevel()).toBe('info');
    expect(config.getSessionDuration()).toBe(3600);
  });
});
