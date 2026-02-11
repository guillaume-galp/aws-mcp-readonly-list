import type { IAMService } from '../services/iam.service.js';
import type { Logger } from '../core/logger.js';
import {
  ListUsersInputSchema,
  GetUserInputSchema,
  ListRolesInputSchema,
  GetRoleInputSchema,
  ListPoliciesInputSchema,
  GetPolicyInputSchema,
} from '../core/schemas.js';

/**
 * IAM MCP Tools
 */
export class IAMTools {
  private iamService: IAMService;
  private logger: Logger;

  constructor(iamService: IAMService, logger: Logger) {
    this.iamService = iamService;
    this.logger = logger;
  }

  async listUsers(args: unknown): Promise<object> {
    const input = ListUsersInputSchema.parse(args);
    this.logger.info('Tool: list_iam_users');

    const users = await this.iamService.listUsers(input.maxItems);

    return {
      users: users.map((u) => ({
        userName: u.userName,
        userId: u.userId,
        arn: u.arn,
        createDate: u.createDate?.toISOString(),
        passwordLastUsed: u.passwordLastUsed?.toISOString(),
      })),
      count: users.length,
    };
  }

  async getUser(args: unknown): Promise<object> {
    const input = GetUserInputSchema.parse(args);
    this.logger.info('Tool: get_iam_user', { userName: input.userName });

    const user = await this.iamService.getUser(input.userName);

    return {
      userName: user.userName,
      userId: user.userId,
      arn: user.arn,
      createDate: user.createDate?.toISOString(),
      passwordLastUsed: user.passwordLastUsed?.toISOString(),
    };
  }

  async listRoles(args: unknown): Promise<object> {
    const input = ListRolesInputSchema.parse(args);
    this.logger.info('Tool: list_iam_roles');

    const roles = await this.iamService.listRoles(input.maxItems);

    return {
      roles: roles.map((r) => ({
        roleName: r.roleName,
        roleId: r.roleId,
        arn: r.arn,
        createDate: r.createDate?.toISOString(),
        description: r.description,
      })),
      count: roles.length,
    };
  }

  async getRole(args: unknown): Promise<object> {
    const input = GetRoleInputSchema.parse(args);
    this.logger.info('Tool: get_iam_role', { roleName: input.roleName });

    const role = await this.iamService.getRole(input.roleName);

    return {
      roleName: role.roleName,
      roleId: role.roleId,
      arn: role.arn,
      createDate: role.createDate?.toISOString(),
      description: role.description,
    };
  }

  async listPolicies(args: unknown): Promise<object> {
    const input = ListPoliciesInputSchema.parse(args);
    this.logger.info('Tool: list_iam_policies', { scope: input.scope });

    const policies = await this.iamService.listPolicies(
      input.scope,
      input.maxItems
    );

    return {
      scope: input.scope,
      policies: policies.map((p) => ({
        policyName: p.policyName,
        policyId: p.policyId,
        arn: p.arn,
        createDate: p.createDate?.toISOString(),
        description: p.description,
      })),
      count: policies.length,
    };
  }

  async getPolicy(args: unknown): Promise<object> {
    const input = GetPolicyInputSchema.parse(args);
    this.logger.info('Tool: get_iam_policy', {
      policyArn: input.policyArn,
    });

    const policy = await this.iamService.getPolicy(input.policyArn);

    return {
      policyName: policy.policyName,
      policyId: policy.policyId,
      arn: policy.arn,
      createDate: policy.createDate?.toISOString(),
      description: policy.description,
    };
  }
}
