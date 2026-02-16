import {
  STSClient,
  AssumeRoleCommand,
  GetCallerIdentityCommand,
} from '@aws-sdk/client-sts';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import type { Logger } from '../core/logger.js';
import type { AssumedRoleCredentials } from '../core/types.js';

/**
 * STS service for assuming roles
 */
export class STSService {
  private client: STSClient;
  private logger: Logger;

  constructor(region: string, logger: Logger) {
    this.client = new STSClient({ 
      region,
      credentials: defaultProvider()
    });
    this.logger = logger;
  }

  async assumeRole(
    roleArn: string,
    sessionDuration: number
  ): Promise<AssumedRoleCredentials> {
    this.logger.info('Assuming role', { roleArn });

    try {
      const command = new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: `aws-mcp-readonly-${Date.now()}`,
        DurationSeconds: sessionDuration,
      });

      const response = await this.client.send(command);

      if (!response.Credentials) {
        throw new Error('No credentials returned from AssumeRole');
      }

      return {
        accessKeyId: response.Credentials.AccessKeyId!,
        secretAccessKey: response.Credentials.SecretAccessKey!,
        sessionToken: response.Credentials.SessionToken!,
        expiration: response.Credentials.Expiration!,
      };
    } catch (error) {
      this.logger.error('Failed to assume role', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getCallerIdentity(): Promise<{
    userId: string;
    account: string;
    arn: string;
  }> {
    this.logger.info('Getting caller identity');

    try {
      const command = new GetCallerIdentityCommand({});
      const response = await this.client.send(command);

      return {
        userId: response.UserId || 'unknown',
        account: response.Account || 'unknown',
        arn: response.Arn || 'unknown',
      };
    } catch (error) {
      this.logger.error('Failed to get caller identity', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
