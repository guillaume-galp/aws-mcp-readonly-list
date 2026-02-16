import type { IAMService } from '../services/iam.service.js';
import type { STSService } from '../services/sts.service.js';
import type { Logger } from '../core/logger.js';
import type {
  ListUsersResponse,
  GetUserResponse,
  ListRolesResponse,
  GetRoleResponse,
  ListPoliciesResponse,
  GetPolicyResponse,
  AssumeIamRoleResponse,
} from '../core/types.js';
import {
  ListUsersInputSchema,
  GetUserInputSchema,
  ListRolesInputSchema,
  GetRoleInputSchema,
  ListPoliciesInputSchema,
  GetPolicyInputSchema,
  AssumeIamRoleInputSchema,
} from '../core/schemas.js';

/**
 * IAM MCP Tools
 */
export class IAMTools {
  private iamService: IAMService;
  private stsService: STSService;
  private logger: Logger;
  private onRoleAssumed?: (credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
  }) => void;

  constructor(
    iamService: IAMService,
    stsService: STSService,
    logger: Logger,
    onRoleAssumed?: (credentials: {
      accessKeyId: string;
      secretAccessKey: string;
      sessionToken: string;
    }) => void
  ) {
    this.iamService = iamService;
    this.stsService = stsService;
    this.logger = logger;
    this.onRoleAssumed = onRoleAssumed;
  }

  async listUsers(args: unknown): Promise<ListUsersResponse> {
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

  async getUser(args: unknown): Promise<GetUserResponse> {
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

  async listRoles(args: unknown): Promise<ListRolesResponse> {
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

  async getRole(args: unknown): Promise<GetRoleResponse> {
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

  async listPolicies(args: unknown): Promise<ListPoliciesResponse> {
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

  async getPolicy(args: unknown): Promise<GetPolicyResponse> {
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

  async assumeRole(args: unknown): Promise<AssumeIamRoleResponse> {
    const input = AssumeIamRoleInputSchema.parse(args);
    this.logger.info('Tool: assume_iam_role', {
      roleArn: input.roleArn,
      sessionDuration: input.sessionDuration,
    });

    const credentials = await this.stsService.assumeRole(
      input.roleArn,
      input.sessionDuration
    );

    // Update services with new credentials if callback is provided
    if (this.onRoleAssumed) {
      this.onRoleAssumed({
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      });
    }

    return {
      roleArn: input.roleArn,
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
      expiration: credentials.expiration.toISOString(),
    };
  }
}
