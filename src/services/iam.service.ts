import {
  IAMClient,
  ListUsersCommand,
  GetUserCommand,
  ListRolesCommand,
  GetRoleCommand,
  ListPoliciesCommand,
  GetPolicyCommand,
} from '@aws-sdk/client-iam';
import type { Logger } from '../core/logger.js';
import type {
  IAMUserInfo,
  IAMRoleInfo,
  IAMPolicyInfo,
} from '../core/types.js';

/**
 * IAM service for read-only operations
 */
export class IAMService {
  private client: IAMClient;
  private logger: Logger;

  constructor(region: string, credentials: any, logger: Logger) {
    this.client = new IAMClient({
      region,
      credentials: credentials || undefined,
    });
    this.logger = logger;
  }

  async listUsers(maxItems: number = 100): Promise<IAMUserInfo[]> {
    this.logger.debug('Listing IAM users', { maxItems });

    try {
      const command = new ListUsersCommand({
        MaxItems: maxItems,
      });
      const response = await this.client.send(command);

      return (
        response.Users?.map((user) => ({
          userName: user.UserName!,
          userId: user.UserId!,
          arn: user.Arn!,
          createDate: user.CreateDate,
          passwordLastUsed: user.PasswordLastUsed,
        })) || []
      );
    } catch (error) {
      this.logger.error('Failed to list users', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getUser(userName: string): Promise<IAMUserInfo> {
    this.logger.debug('Getting IAM user', { userName });

    try {
      const command = new GetUserCommand({
        UserName: userName,
      });
      const response = await this.client.send(command);

      if (!response.User) {
        throw new Error(`User ${userName} not found`);
      }

      return {
        userName: response.User.UserName!,
        userId: response.User.UserId!,
        arn: response.User.Arn!,
        createDate: response.User.CreateDate,
        passwordLastUsed: response.User.PasswordLastUsed,
      };
    } catch (error) {
      this.logger.error('Failed to get user', {
        userName,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async listRoles(maxItems: number = 100): Promise<IAMRoleInfo[]> {
    this.logger.debug('Listing IAM roles', { maxItems });

    try {
      const command = new ListRolesCommand({
        MaxItems: maxItems,
      });
      const response = await this.client.send(command);

      return (
        response.Roles?.map((role) => ({
          roleName: role.RoleName!,
          roleId: role.RoleId!,
          arn: role.Arn!,
          createDate: role.CreateDate,
          description: role.Description,
        })) || []
      );
    } catch (error) {
      this.logger.error('Failed to list roles', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getRole(roleName: string): Promise<IAMRoleInfo> {
    this.logger.debug('Getting IAM role', { roleName });

    try {
      const command = new GetRoleCommand({
        RoleName: roleName,
      });
      const response = await this.client.send(command);

      if (!response.Role) {
        throw new Error(`Role ${roleName} not found`);
      }

      return {
        roleName: response.Role.RoleName!,
        roleId: response.Role.RoleId!,
        arn: response.Role.Arn!,
        createDate: response.Role.CreateDate,
        description: response.Role.Description,
      };
    } catch (error) {
      this.logger.error('Failed to get role', {
        roleName,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async listPolicies(
    scope: 'All' | 'AWS' | 'Local' = 'Local',
    maxItems: number = 100
  ): Promise<IAMPolicyInfo[]> {
    this.logger.debug('Listing IAM policies', { scope, maxItems });

    try {
      const command = new ListPoliciesCommand({
        Scope: scope,
        MaxItems: maxItems,
      });
      const response = await this.client.send(command);

      return (
        response.Policies?.map((policy) => ({
          policyName: policy.PolicyName!,
          policyId: policy.PolicyId!,
          arn: policy.Arn!,
          createDate: policy.CreateDate,
          description: policy.Description,
        })) || []
      );
    } catch (error) {
      this.logger.error('Failed to list policies', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getPolicy(policyArn: string): Promise<IAMPolicyInfo> {
    this.logger.debug('Getting IAM policy', { policyArn });

    try {
      const command = new GetPolicyCommand({
        PolicyArn: policyArn,
      });
      const response = await this.client.send(command);

      if (!response.Policy) {
        throw new Error(`Policy ${policyArn} not found`);
      }

      return {
        policyName: response.Policy.PolicyName!,
        policyId: response.Policy.PolicyId!,
        arn: response.Policy.Arn!,
        createDate: response.Policy.CreateDate,
        description: response.Policy.Description,
      };
    } catch (error) {
      this.logger.error('Failed to get policy', {
        policyArn,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
