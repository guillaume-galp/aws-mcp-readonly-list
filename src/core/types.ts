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
