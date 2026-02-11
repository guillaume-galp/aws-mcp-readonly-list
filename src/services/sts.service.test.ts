import { describe, it, expect, vi, beforeEach } from 'vitest';
import { STSService } from '../services/sts.service.js';
import { createLogger } from '../core/logger.js';
import { STSClient } from '@aws-sdk/client-sts';

vi.mock('@aws-sdk/client-sts', () => ({
  STSClient: vi.fn(),
  AssumeRoleCommand: vi.fn(),
}));

describe('STSService', () => {
  let stsService: STSService;
  let logger: ReturnType<typeof createLogger>;
  let mockSend: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    logger = createLogger('error');
    mockSend = vi.fn();
    (STSClient as any).mockImplementation(() => ({
      send: mockSend,
    }));
    stsService = new STSService('us-east-1', logger);
  });

  it('should assume role successfully', async () => {
    const mockCredentials = {
      Credentials: {
        AccessKeyId: 'AKIA...',
        SecretAccessKey: 'secret',
        SessionToken: 'token',
        Expiration: new Date('2024-12-31'),
      },
    };

    mockSend.mockResolvedValue(mockCredentials);

    const result = await stsService.assumeRole(
      'arn:aws:iam::123456789012:role/test',
      3600
    );

    expect(result.accessKeyId).toBe('AKIA...');
    expect(result.secretAccessKey).toBe('secret');
    expect(result.sessionToken).toBe('token');
    expect(result.expiration).toBeInstanceOf(Date);
  });

  it('should throw error when no credentials returned', async () => {
    mockSend.mockResolvedValue({});

    await expect(
      stsService.assumeRole('arn:aws:iam::123456789012:role/test', 3600)
    ).rejects.toThrow('No credentials returned from AssumeRole');
  });

  it('should handle AWS SDK errors', async () => {
    mockSend.mockRejectedValue(new Error('Access denied'));

    await expect(
      stsService.assumeRole('arn:aws:iam::123456789012:role/test', 3600)
    ).rejects.toThrow('Access denied');
  });
});
