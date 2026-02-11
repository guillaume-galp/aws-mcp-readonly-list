import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  GetBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import type { AwsCredentialIdentity } from '@aws-sdk/types';
import type { Logger } from '../core/logger.js';
import type { S3BucketInfo, S3ObjectInfo } from '../core/types.js';

/**
 * S3 service for read-only operations
 */
export class S3Service {
  private client: S3Client;
  private logger: Logger;

  constructor(
    region: string,
    credentials: AwsCredentialIdentity | undefined,
    logger: Logger
  ) {
    this.client = new S3Client({
      region,
      credentials,
    });
    this.logger = logger;
  }

  async listBuckets(): Promise<S3BucketInfo[]> {
    this.logger.debug('Listing S3 buckets');

    try {
      const command = new ListBucketsCommand({});
      const response = await this.client.send(command);

      return (
        response.Buckets?.map((bucket) => ({
          name: bucket.Name!,
          creationDate: bucket.CreationDate,
        })) || []
      );
    } catch (error) {
      this.logger.error('Failed to list buckets', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async listObjects(
    bucket: string,
    prefix?: string,
    maxKeys: number = 100
  ): Promise<S3ObjectInfo[]> {
    this.logger.debug('Listing S3 objects', { bucket, prefix, maxKeys });

    try {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });
      const response = await this.client.send(command);

      return (
        response.Contents?.map((object) => ({
          key: object.Key!,
          size: object.Size,
          lastModified: object.LastModified,
          eTag: object.ETag,
        })) || []
      );
    } catch (error) {
      this.logger.error('Failed to list objects', {
        bucket,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getObject(bucket: string, key: string): Promise<string> {
    this.logger.debug('Getting S3 object', { bucket, key });

    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      const response = await this.client.send(command);

      if (!response.Body) {
        throw new Error('No body in response');
      }

      return await response.Body.transformToString();
    } catch (error) {
      this.logger.error('Failed to get object', {
        bucket,
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getBucketPolicy(bucket: string): Promise<string> {
    this.logger.debug('Getting bucket policy', { bucket });

    try {
      const command = new GetBucketPolicyCommand({
        Bucket: bucket,
      });
      const response = await this.client.send(command);

      return response.Policy || '';
    } catch (error) {
      // Handle the common case where a bucket has no policy
      if (
        error instanceof Error &&
        (error.name === 'NoSuchBucketPolicy' ||
          (error as any).Code === 'NoSuchBucketPolicy')
      ) {
        this.logger.debug('No bucket policy found', { bucket });
        return '';
      }

      this.logger.error('Failed to get bucket policy', {
        bucket,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
