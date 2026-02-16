import { z } from 'zod';

/**
 * Server configuration schema
 */
export const ServerConfigSchema = z.object({
  region: z.string().min(1, 'Region is required'),
  assumeRoleArn: z.string().optional(),
  sessionDuration: z.number().min(900).max(43200).optional(),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

/**
 * S3 tool input schemas
 */
export const ListBucketsInputSchema = z.object({});

export const ListObjectsInputSchema = z.object({
  bucket: z.string().min(1, 'Bucket name is required'),
  prefix: z.string().optional(),
  maxKeys: z.number().min(1).max(1000).default(100),
});

export const GetObjectInputSchema = z.object({
  bucket: z.string().min(1, 'Bucket name is required'),
  key: z.string().min(1, 'Object key is required'),
});

export const GetBucketPolicyInputSchema = z.object({
  bucket: z.string().min(1, 'Bucket name is required'),
});

/**
 * IAM tool input schemas
 */
export const ListUsersInputSchema = z.object({
  maxItems: z.number().min(1).max(1000).default(100),
});

export const GetUserInputSchema = z.object({
  userName: z.string().min(1, 'User name is required'),
});

export const ListRolesInputSchema = z.object({
  maxItems: z.number().min(1).max(1000).default(100),
});

export const GetRoleInputSchema = z.object({
  roleName: z.string().min(1, 'Role name is required'),
});

export const ListPoliciesInputSchema = z.object({
  scope: z.enum(['All', 'AWS', 'Local']).default('Local'),
  maxItems: z.number().min(1).max(1000).default(100),
});

export const GetPolicyInputSchema = z.object({
  policyArn: z.string().min(1, 'Policy ARN is required'),
});

export const AssumeIamRoleInputSchema = z.object({
  roleArn: z.string().min(1, 'Role ARN is required'),
  sessionDuration: z.number().min(900).max(43200).default(3600),
});

export const GetCallerIdentityInputSchema = z.object({});
