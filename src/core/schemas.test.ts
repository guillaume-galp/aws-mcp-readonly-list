import { describe, it, expect } from 'vitest';
import {
  ServerConfigSchema,
  ListBucketsInputSchema,
  ListObjectsInputSchema,
  GetObjectInputSchema,
  GetBucketPolicyInputSchema,
  ListUsersInputSchema,
  GetUserInputSchema,
  ListRolesInputSchema,
  GetRoleInputSchema,
  ListPoliciesInputSchema,
  GetPolicyInputSchema,
} from '../core/schemas.js';

describe('Schemas', () => {
  describe('ServerConfigSchema', () => {
    it('should validate valid configuration', () => {
      const config = {
        region: 'us-east-1',
        logLevel: 'info',
      };

      expect(() => ServerConfigSchema.parse(config)).not.toThrow();
    });

    it('should reject empty region', () => {
      const config = {
        region: '',
        logLevel: 'info',
      };

      expect(() => ServerConfigSchema.parse(config)).toThrow();
    });

    it('should set default log level', () => {
      const config = {
        region: 'us-east-1',
      };

      const result = ServerConfigSchema.parse(config);
      expect(result.logLevel).toBe('info');
    });

    it('should validate session duration bounds', () => {
      const configLow = {
        region: 'us-east-1',
        sessionDuration: 800,
      };

      expect(() => ServerConfigSchema.parse(configLow)).toThrow();

      const configHigh = {
        region: 'us-east-1',
        sessionDuration: 50000,
      };

      expect(() => ServerConfigSchema.parse(configHigh)).toThrow();
    });
  });

  describe('S3 Schemas', () => {
    it('should validate ListBucketsInput', () => {
      expect(() => ListBucketsInputSchema.parse({})).not.toThrow();
    });

    it('should validate ListObjectsInput', () => {
      const input = {
        bucket: 'my-bucket',
        prefix: 'data/',
        maxKeys: 50,
      };

      expect(() => ListObjectsInputSchema.parse(input)).not.toThrow();
    });

    it('should reject empty bucket name', () => {
      const input = {
        bucket: '',
      };

      expect(() => ListObjectsInputSchema.parse(input)).toThrow();
    });

    it('should validate GetObjectInput', () => {
      const input = {
        bucket: 'my-bucket',
        key: 'file.txt',
      };

      expect(() => GetObjectInputSchema.parse(input)).not.toThrow();
    });

    it('should validate GetBucketPolicyInput', () => {
      const input = {
        bucket: 'my-bucket',
      };

      expect(() => GetBucketPolicyInputSchema.parse(input)).not.toThrow();
    });
  });

  describe('IAM Schemas', () => {
    it('should validate ListUsersInput', () => {
      const input = {
        maxItems: 50,
      };

      expect(() => ListUsersInputSchema.parse(input)).not.toThrow();
    });

    it('should validate GetUserInput', () => {
      const input = {
        userName: 'john-doe',
      };

      expect(() => GetUserInputSchema.parse(input)).not.toThrow();
    });

    it('should reject empty user name', () => {
      const input = {
        userName: '',
      };

      expect(() => GetUserInputSchema.parse(input)).toThrow();
    });

    it('should validate ListRolesInput', () => {
      const input = {
        maxItems: 50,
      };

      expect(() => ListRolesInputSchema.parse(input)).not.toThrow();
    });

    it('should validate GetRoleInput', () => {
      const input = {
        roleName: 'admin-role',
      };

      expect(() => GetRoleInputSchema.parse(input)).not.toThrow();
    });

    it('should validate ListPoliciesInput', () => {
      const input = {
        scope: 'Local' as const,
        maxItems: 50,
      };

      expect(() => ListPoliciesInputSchema.parse(input)).not.toThrow();
    });

    it('should validate GetPolicyInput', () => {
      const input = {
        policyArn: 'arn:aws:iam::123456789012:policy/MyPolicy',
      };

      expect(() => GetPolicyInputSchema.parse(input)).not.toThrow();
    });
  });
});
