import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IAMTools } from '../tools/iam.tools.js';
import { IAMService } from '../services/iam.service.js';
import { createLogger } from '../core/logger.js';

vi.mock('../services/iam.service.js');

describe('IAMTools', () => {
  let iamTools: IAMTools;
  let mockIAMService: any;
  let logger: ReturnType<typeof createLogger>;

  beforeEach(() => {
    logger = createLogger('error');
    mockIAMService = {
      listUsers: vi.fn(),
      getUser: vi.fn(),
      listRoles: vi.fn(),
      getRole: vi.fn(),
      listPolicies: vi.fn(),
      getPolicy: vi.fn(),
    };
    iamTools = new IAMTools(mockIAMService, logger);
  });

  describe('listUsers', () => {
    it('should list users', async () => {
      const mockUsers = [
        {
          userName: 'user1',
          userId: 'AIDAI...',
          arn: 'arn:aws:iam::123456789012:user/user1',
          createDate: new Date('2024-01-01'),
        },
      ];

      mockIAMService.listUsers.mockResolvedValue(mockUsers);

      const result = await iamTools.listUsers({});

      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('count', 1);
    });
  });

  describe('getUser', () => {
    it('should get user', async () => {
      const mockUser = {
        userName: 'user1',
        userId: 'AIDAI...',
        arn: 'arn:aws:iam::123456789012:user/user1',
        createDate: new Date('2024-01-01'),
      };

      mockIAMService.getUser.mockResolvedValue(mockUser);

      const result = await iamTools.getUser({ userName: 'user1' });

      expect(result).toHaveProperty('userName', 'user1');
    });

    it('should validate input', async () => {
      await expect(iamTools.getUser({ userName: '' })).rejects.toThrow();
    });
  });

  describe('listRoles', () => {
    it('should list roles', async () => {
      const mockRoles = [
        {
          roleName: 'role1',
          roleId: 'AROAI...',
          arn: 'arn:aws:iam::123456789012:role/role1',
          createDate: new Date('2024-01-01'),
        },
      ];

      mockIAMService.listRoles.mockResolvedValue(mockRoles);

      const result = await iamTools.listRoles({});

      expect(result).toHaveProperty('roles');
      expect(result).toHaveProperty('count', 1);
    });
  });

  describe('getRole', () => {
    it('should get role', async () => {
      const mockRole = {
        roleName: 'role1',
        roleId: 'AROAI...',
        arn: 'arn:aws:iam::123456789012:role/role1',
        createDate: new Date('2024-01-01'),
      };

      mockIAMService.getRole.mockResolvedValue(mockRole);

      const result = await iamTools.getRole({ roleName: 'role1' });

      expect(result).toHaveProperty('roleName', 'role1');
    });

    it('should validate input', async () => {
      await expect(iamTools.getRole({ roleName: '' })).rejects.toThrow();
    });
  });

  describe('listPolicies', () => {
    it('should list policies', async () => {
      const mockPolicies = [
        {
          policyName: 'policy1',
          policyId: 'ANPAI...',
          arn: 'arn:aws:iam::123456789012:policy/policy1',
          createDate: new Date('2024-01-01'),
        },
      ];

      mockIAMService.listPolicies.mockResolvedValue(mockPolicies);

      const result = await iamTools.listPolicies({ scope: 'Local' });

      expect(result).toHaveProperty('policies');
      expect(result).toHaveProperty('count', 1);
      expect(result).toHaveProperty('scope', 'Local');
    });
  });

  describe('getPolicy', () => {
    it('should get policy', async () => {
      const mockPolicy = {
        policyName: 'policy1',
        policyId: 'ANPAI...',
        arn: 'arn:aws:iam::123456789012:policy/policy1',
        createDate: new Date('2024-01-01'),
      };

      mockIAMService.getPolicy.mockResolvedValue(mockPolicy);

      const result = await iamTools.getPolicy({
        policyArn: 'arn:aws:iam::123456789012:policy/policy1',
      });

      expect(result).toHaveProperty('policyName', 'policy1');
    });

    it('should validate input', async () => {
      await expect(iamTools.getPolicy({ policyArn: '' })).rejects.toThrow();
    });
  });
});
