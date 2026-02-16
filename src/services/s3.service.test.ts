import { describe, it, expect, vi, beforeEach } from 'vitest';
import { S3Service } from '../services/s3.service.js';
import { createLogger } from '../core/logger.js';
import { S3Client } from '@aws-sdk/client-s3';

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(),
  ListBucketsCommand: vi.fn(),
  ListObjectsV2Command: vi.fn(),
  GetObjectCommand: vi.fn(),
  GetBucketPolicyCommand: vi.fn(),
}));

vi.mock('@aws-sdk/credential-provider-node', () => ({
  defaultProvider: vi.fn(() => vi.fn()),
}));

describe('S3Service', () => {
  let s3Service: S3Service;
  let logger: ReturnType<typeof createLogger>;
  let mockSend: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    logger = createLogger('error');
    mockSend = vi.fn();
    (S3Client as any).mockImplementation(() => ({
      send: mockSend,
    }));
    s3Service = new S3Service('us-east-1', undefined, logger);
  });

  describe('listBuckets', () => {
    it('should list buckets successfully', async () => {
      const mockResponse = {
        Buckets: [
          { Name: 'bucket1', CreationDate: new Date('2024-01-01') },
          { Name: 'bucket2', CreationDate: new Date('2024-02-01') },
        ],
      };

      mockSend.mockResolvedValue(mockResponse);

      const result = await s3Service.listBuckets();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('bucket1');
      expect(result[1].name).toBe('bucket2');
    });

    it('should return empty array when no buckets', async () => {
      mockSend.mockResolvedValue({});

      const result = await s3Service.listBuckets();

      expect(result).toEqual([]);
    });

    it('should handle errors', async () => {
      mockSend.mockRejectedValue(new Error('Access denied'));

      await expect(s3Service.listBuckets()).rejects.toThrow('Access denied');
    });
  });

  describe('listObjects', () => {
    it('should list objects successfully', async () => {
      const mockResponse = {
        Contents: [
          {
            Key: 'file1.txt',
            Size: 1024,
            LastModified: new Date('2024-01-01'),
            ETag: 'etag1',
          },
          {
            Key: 'file2.txt',
            Size: 2048,
            LastModified: new Date('2024-02-01'),
            ETag: 'etag2',
          },
        ],
      };

      mockSend.mockResolvedValue(mockResponse);

      const result = await s3Service.listObjects('my-bucket');

      expect(result).toHaveLength(2);
      expect(result[0].key).toBe('file1.txt');
      expect(result[0].size).toBe(1024);
    });

    it('should handle prefix and maxKeys', async () => {
      mockSend.mockResolvedValue({ Contents: [] });

      await s3Service.listObjects('my-bucket', 'data/', 50);

      expect(mockSend).toHaveBeenCalled();
    });
  });

  describe('getObject', () => {
    it('should get object content successfully', async () => {
      const mockBody = {
        transformToString: vi.fn().mockResolvedValue('file content'),
      };

      mockSend.mockResolvedValue({ Body: mockBody });

      const result = await s3Service.getObject('my-bucket', 'file.txt');

      expect(result).toBe('file content');
    });

    it('should throw error when no body', async () => {
      mockSend.mockResolvedValue({});

      await expect(
        s3Service.getObject('my-bucket', 'file.txt')
      ).rejects.toThrow('No body in response');
    });
  });

  describe('getBucketPolicy', () => {
    it('should get bucket policy successfully', async () => {
      const policy = JSON.stringify({ Version: '2012-10-17' });
      mockSend.mockResolvedValue({ Policy: policy });

      const result = await s3Service.getBucketPolicy('my-bucket');

      expect(result).toBe(policy);
    });

    it('should return empty string when no policy', async () => {
      mockSend.mockResolvedValue({});

      const result = await s3Service.getBucketPolicy('my-bucket');

      expect(result).toBe('');
    });

    it('should handle NoSuchBucketPolicy error gracefully', async () => {
      const error = new Error('The bucket policy does not exist');
      error.name = 'NoSuchBucketPolicy';
      mockSend.mockRejectedValue(error);

      const result = await s3Service.getBucketPolicy('my-bucket');

      expect(result).toBe('');
    });
  });
});
