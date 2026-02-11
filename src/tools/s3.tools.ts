import type { S3Service } from '../services/s3.service.js';
import type { Logger } from '../core/logger.js';
import type {
  ListBucketsResponse,
  ListObjectsResponse,
  GetObjectResponse,
  GetBucketPolicyResponse,
} from '../core/types.js';
import {
  ListBucketsInputSchema,
  ListObjectsInputSchema,
  GetObjectInputSchema,
  GetBucketPolicyInputSchema,
} from '../core/schemas.js';

/**
 * S3 MCP Tools
 */
export class S3Tools {
  private s3Service: S3Service;
  private logger: Logger;

  constructor(s3Service: S3Service, logger: Logger) {
    this.s3Service = s3Service;
    this.logger = logger;
  }

  async listBuckets(args: unknown): Promise<ListBucketsResponse> {
    ListBucketsInputSchema.parse(args);
    this.logger.info('Tool: list_s3_buckets');

    const buckets = await this.s3Service.listBuckets();
    return {
      buckets: buckets.map((b) => ({
        name: b.name,
        creationDate: b.creationDate?.toISOString(),
      })),
      count: buckets.length,
    };
  }

  async listObjects(args: unknown): Promise<ListObjectsResponse> {
    const input = ListObjectsInputSchema.parse(args);
    this.logger.info('Tool: list_s3_objects', { bucket: input.bucket });

    const objects = await this.s3Service.listObjects(
      input.bucket,
      input.prefix,
      input.maxKeys
    );

    return {
      bucket: input.bucket,
      prefix: input.prefix,
      objects: objects.map((obj) => ({
        key: obj.key,
        size: obj.size,
        lastModified: obj.lastModified?.toISOString(),
        eTag: obj.eTag,
      })),
      count: objects.length,
    };
  }

  async getObject(args: unknown): Promise<GetObjectResponse> {
    const input = GetObjectInputSchema.parse(args);
    this.logger.info('Tool: get_s3_object', {
      bucket: input.bucket,
      key: input.key,
    });

    const content = await this.s3Service.getObject(
      input.bucket,
      input.key
    );

    return {
      bucket: input.bucket,
      key: input.key,
      content,
    };
  }

  async getBucketPolicy(args: unknown): Promise<GetBucketPolicyResponse> {
    const input = GetBucketPolicyInputSchema.parse(args);
    this.logger.info('Tool: get_s3_bucket_policy', {
      bucket: input.bucket,
    });

    const policy = await this.s3Service.getBucketPolicy(input.bucket);

    return {
      bucket: input.bucket,
      policy: policy ? JSON.parse(policy) : null,
    };
  }
}
