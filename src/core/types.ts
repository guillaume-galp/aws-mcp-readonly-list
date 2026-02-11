/**
 * Core type definitions for the AWS MCP Server
 */

export interface ServerConfig {
  region: string;
  assumeRoleArn?: string;
  sessionDuration?: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

export interface AssumedRoleCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: Date;
}

export interface S3ObjectInfo {
  key: string;
  size?: number;
  lastModified?: Date;
  eTag?: string;
}

export interface S3BucketInfo {
  name: string;
  creationDate?: Date;
}

export interface IAMUserInfo {
  userName: string;
  userId: string;
  arn: string;
  createDate?: Date;
  passwordLastUsed?: Date;
}

export interface IAMRoleInfo {
  roleName: string;
  roleId: string;
  arn: string;
  createDate?: Date;
  description?: string;
}

export interface IAMPolicyInfo {
  policyName: string;
  policyId: string;
  arn: string;
  createDate?: Date;
  description?: string;
}

/**
 * Tool response types
 */
export interface ListBucketsResponse {
  buckets: Array<{
    name: string;
    creationDate?: string;
  }>;
  count: number;
}

export interface ListObjectsResponse {
  bucket: string;
  prefix?: string;
  objects: Array<{
    key: string;
    size?: number;
    lastModified?: string;
    eTag?: string;
  }>;
  count: number;
}

export interface GetObjectResponse {
  bucket: string;
  key: string;
  content: string;
}

export interface GetBucketPolicyResponse {
  bucket: string;
  policy: object | null;
}

export interface ListUsersResponse {
  users: Array<{
    userName: string;
    userId: string;
    arn: string;
    createDate?: string;
    passwordLastUsed?: string;
  }>;
  count: number;
}

export interface GetUserResponse {
  userName: string;
  userId: string;
  arn: string;
  createDate?: string;
  passwordLastUsed?: string;
}

export interface ListRolesResponse {
  roles: Array<{
    roleName: string;
    roleId: string;
    arn: string;
    createDate?: string;
    description?: string;
  }>;
  count: number;
}

export interface GetRoleResponse {
  roleName: string;
  roleId: string;
  arn: string;
  createDate?: string;
  description?: string;
}

export interface ListPoliciesResponse {
  scope: string;
  policies: Array<{
    policyName: string;
    policyId: string;
    arn: string;
    createDate?: string;
    description?: string;
  }>;
  count: number;
}

export interface GetPolicyResponse {
  policyName: string;
  policyId: string;
  arn: string;
  createDate?: string;
  description?: string;
}
