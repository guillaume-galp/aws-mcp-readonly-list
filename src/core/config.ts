import { ServerConfigSchema } from './schemas.js';
import type { ServerConfig } from './types.js';

/**
 * Configuration management with validation
 */
export class Config {
  private config: ServerConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): ServerConfig {
    const rawConfig = {
      region: process.env.AWS_REGION || 'us-east-1',
      assumeRoleArn: process.env.AWS_ASSUME_ROLE_ARN,
      sessionDuration: process.env.AWS_SESSION_DURATION
        ? parseInt(process.env.AWS_SESSION_DURATION, 10)
        : 3600,
      logLevel: (process.env.LOG_LEVEL || 'info') as
        | 'error'
        | 'warn'
        | 'info'
        | 'debug',
    };

    return ServerConfigSchema.parse(rawConfig);
  }

  get(): ServerConfig {
    return { ...this.config };
  }

  getRegion(): string {
    return this.config.region;
  }

  getAssumeRoleArn(): string | undefined {
    return this.config.assumeRoleArn;
  }

  getSessionDuration(): number {
    return this.config.sessionDuration || 3600;
  }

  getLogLevel(): 'error' | 'warn' | 'info' | 'debug' {
    return this.config.logLevel;
  }
}
