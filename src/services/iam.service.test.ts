import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IAMService } from '../services/iam.service.js';
import { createLogger } from '../core/logger.js';
import { IAMClient } from '@aws-sdk/client-iam';

vi.mock('@aws-sdk/client-iam', () => ({
  IAMClient: vi.fn(),
  ListUsersCommand: vi.fn(),
  GetUserCommand: vi.fn(),
  ListRolesCommand: vi.fn(),
  GetRoleCommand: vi.fn(),
  ListPoliciesCommand: vi.fn(),
  GetPolicyCommand: vi.fn(),
}));

describe('IAMService', () => {
  let iamService: IAMService;
  let logger: ReturnType<typeof createLogger>;
  let mockSend: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    logger = createLogger('error');
    mockSend = vi.fn();
    (IAMClient as any).mockImplementation(() => ({
      send: mockSend,
    }));
    iamService = new IAMService('us-east-1', undefined, logger);
  });

  describe('listUsers', () => {
    it('should list users successfully', async () => {
      const mockResponse = {
        Users: [
          {
            UserName: 'user1',
            UserId: 'AIDAI...',
            Arn: 'arn:aws:iam::123456789012:user/user1',
            CreateDate: new Date('2024-01-01'),
          },
        ],
      };

      mockSend.mockResolvedValue(mockResponse);

      const result = await iamService.listUsers();

      expect(result).toHaveLength(1);
      expect(result[0].userName).toBe('user1');
    });

    it('should return empty array when no users', async () => {
      mockSend.mockResolvedValue({});

      const result = await iamService.listUsers();

      expect(result).toEqual([]);
    });
  });

  describe('getUser', () => {
    it('should get user successfully', async () => {
      const mockResponse = {
        User: {
          UserName: 'user1',
          UserId: 'AIDAI...',
          Arn: 'arn:aws:iam::123456789012:user/user1',
          CreateDate: new Date('2024-01-01'),
        },
      };

      mockSend.mockResolvedValue(mockResponse);

      const result = await iamService.getUser('user1');

      expect(result.userName).toBe('user1');
    });

    it('should throw error when user not found', async () => {
      mockSend.mockResolvedValue({});

      await expect(iamService.getUser('nonexistent')).rejects.toThrow(
        'User nonexistent not found'
      );
    });
  });

  describe('listRoles', () => {
    it('should list roles successfully', async () => {
      const mockResponse = {
        Roles: [
          {
            RoleName: 'role1',
            RoleId: 'AROAI...',
            Arn: 'arn:aws:iam::123456789012:role/role1',
            CreateDate: new Date('2024-01-01'),
          },
        ],
      };

      mockSend.mockResolvedValue(mockResponse);

      const result = await iamService.listRoles();

      expect(result).toHaveLength(1);
      expect(result[0].roleName).toBe('role1');
    });
  });

  describe('getRole', () => {
    it('should get role successfully', async () => {
      const mockResponse = {
        Role: {
          RoleName: 'role1',
          RoleId: 'AROAI...',
          Arn: 'arn:aws:iam::123456789012:role/role1',
          CreateDate: new Date('2024-01-01'),
        },
      };

      mockSend.mockResolvedValue(mockResponse);

      const result = await iamService.getRole('role1');

      expect(result.roleName).toBe('role1');
    });

    it('should throw error when role not found', async () => {
      mockSend.mockResolvedValue({});

      await expect(iamService.getRole('nonexistent')).rejects.toThrow(
        'Role nonexistent not found'
      );
    });
  });

  describe('listPolicies', () => {
    it('should list policies successfully', async () => {
      const mockResponse = {
        Policies: [
          {
            PolicyName: 'policy1',
            PolicyId: 'ANPAI...',
            Arn: 'arn:aws:iam::123456789012:policy/policy1',
            CreateDate: new Date('2024-01-01'),
          },
        ],
      };

      mockSend.mockResolvedValue(mockResponse);

      const result = await iamService.listPolicies();

      expect(result).toHaveLength(1);
      expect(result[0].policyName).toBe('policy1');
    });

    it('should handle different scopes', async () => {
      mockSend.mockResolvedValue({ Policies: [] });

      await iamService.listPolicies('AWS');

      expect(mockSend).toHaveBeenCalled();
    });
  });

  describe('getPolicy', () => {
    it('should get policy successfully', async () => {
      const mockResponse = {
        Policy: {
          PolicyName: 'policy1',
          PolicyId: 'ANPAI...',
          Arn: 'arn:aws:iam::123456789012:policy/policy1',
          CreateDate: new Date('2024-01-01'),
        },
      };

      mockSend.mockResolvedValue(mockResponse);

      const result = await iamService.getPolicy(
        'arn:aws:iam::123456789012:policy/policy1'
      );

      expect(result.policyName).toBe('policy1');
    });

    it('should throw error when policy not found', async () => {
      mockSend.mockResolvedValue({});

      await expect(
        iamService.getPolicy('arn:aws:iam::123456789012:policy/nonexistent')
      ).rejects.toThrow();
    });
  });
});
