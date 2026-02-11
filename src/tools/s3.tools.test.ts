import { describe, it, expect, vi, beforeEach } from 'vitest';
import { S3Tools } from '../tools/s3.tools.js';
import { createLogger } from '../core/logger.js';

describe('S3Tools', () => {
  let s3Tools: S3Tools;
  let mockS3Service: any;
  let logger: ReturnType<typeof createLogger>;

  beforeEach(() => {
    logger = createLogger('error');
    mockS3Service = {
      listBuckets: vi.fn(),
      listObjects: vi.fn(),
      getObject: vi.fn(),
      getBucketPolicy: vi.fn(),
    };
    s3Tools = new S3Tools(mockS3Service, logger);
  });

  describe('listBuckets', () => {
    it('should list buckets', async () => {
      const mockBuckets = [
        { name: 'bucket1', creationDate: new Date('2024-01-01') },
        { name: 'bucket2', creationDate: new Date('2024-02-01') },
      ];

      mockS3Service.listBuckets.mockResolvedValue(mockBuckets);

      const result = await s3Tools.listBuckets({});

      expect(result).toHaveProperty('buckets');
      expect(result).toHaveProperty('count', 2);
      expect((result as any).buckets).toHaveLength(2);
    });
  });

  describe('listObjects', () => {
    it('should list objects', async () => {
      const mockObjects = [
        {
          key: 'file1.txt',
          size: 1024,
          lastModified: new Date('2024-01-01'),
        },
      ];

      mockS3Service.listObjects.mockResolvedValue(mockObjects);

      const result = await s3Tools.listObjects({
        bucket: 'my-bucket',
        prefix: 'data/',
      });

      expect(result).toHaveProperty('bucket', 'my-bucket');
      expect(result).toHaveProperty('objects');
      expect((result as any).objects).toHaveLength(1);
    });

    it('should validate input', async () => {
      await expect(s3Tools.listObjects({ bucket: '' })).rejects.toThrow();
    });
  });

  describe('getObject', () => {
    it('should get object', async () => {
      mockS3Service.getObject.mockResolvedValue('file content');

      const result = await s3Tools.getObject({
        bucket: 'my-bucket',
        key: 'file.txt',
      });

      expect(result).toHaveProperty('bucket', 'my-bucket');
      expect(result).toHaveProperty('key', 'file.txt');
      expect(result).toHaveProperty('content', 'file content');
    });

    it('should validate input', async () => {
      await expect(
        s3Tools.getObject({ bucket: 'test', key: '' })
      ).rejects.toThrow();
    });
  });

  describe('getBucketPolicy', () => {
    it('should get bucket policy', async () => {
      const mockPolicy = JSON.stringify({ Version: '2012-10-17' });
      mockS3Service.getBucketPolicy.mockResolvedValue(mockPolicy);

      const result = await s3Tools.getBucketPolicy({
        bucket: 'my-bucket',
      });

      expect(result).toHaveProperty('bucket', 'my-bucket');
      expect(result).toHaveProperty('policy');
      expect((result as any).policy).toHaveProperty('Version');
    });

    it('should handle empty policy', async () => {
      mockS3Service.getBucketPolicy.mockResolvedValue('');

      const result = await s3Tools.getBucketPolicy({
        bucket: 'my-bucket',
      });

      expect((result as any).policy).toBeNull();
    });
  });
});
