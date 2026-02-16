#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { Config } from './core/config.js';
import { createLogger } from './core/logger.js';
import { STSService } from './services/sts.service.js';
import { S3Service } from './services/s3.service.js';
import { IAMService } from './services/iam.service.js';
import { S3Tools } from './tools/s3.tools.js';
import { IAMTools } from './tools/iam.tools.js';

/**
 * Tool definitions for MCP server
 */
const TOOL_DEFINITIONS: Tool[] = [
  {
    name: 'list_s3_buckets',
    description: 'List all S3 buckets in the AWS account',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_s3_objects',
    description: 'List objects in an S3 bucket',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: {
          type: 'string',
          description: 'The name of the S3 bucket',
        },
        prefix: {
          type: 'string',
          description: 'Optional prefix to filter objects',
        },
        maxKeys: {
          type: 'number',
          description: 'Maximum number of keys to return',
          default: 100,
        },
      },
      required: ['bucket'],
    },
  },
  {
    name: 'get_s3_object',
    description: 'Get the content of an S3 object',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: {
          type: 'string',
          description: 'The name of the S3 bucket',
        },
        key: {
          type: 'string',
          description: 'The key of the object',
        },
      },
      required: ['bucket', 'key'],
    },
  },
  {
    name: 'get_s3_bucket_policy',
    description: 'Get the policy of an S3 bucket',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: {
          type: 'string',
          description: 'The name of the S3 bucket',
        },
      },
      required: ['bucket'],
    },
  },
  {
    name: 'list_iam_users',
    description: 'List IAM users in the AWS account',
    inputSchema: {
      type: 'object',
      properties: {
        maxItems: {
          type: 'number',
          description: 'Maximum number of users to return',
          default: 100,
        },
      },
    },
  },
  {
    name: 'get_iam_user',
    description: 'Get details of a specific IAM user',
    inputSchema: {
      type: 'object',
      properties: {
        userName: {
          type: 'string',
          description: 'The name of the IAM user',
        },
      },
      required: ['userName'],
    },
  },
  {
    name: 'list_iam_roles',
    description: 'List IAM roles in the AWS account',
    inputSchema: {
      type: 'object',
      properties: {
        maxItems: {
          type: 'number',
          description: 'Maximum number of roles to return',
          default: 100,
        },
      },
    },
  },
  {
    name: 'get_iam_role',
    description: 'Get details of a specific IAM role',
    inputSchema: {
      type: 'object',
      properties: {
        roleName: {
          type: 'string',
          description: 'The name of the IAM role',
        },
      },
      required: ['roleName'],
    },
  },
  {
    name: 'list_iam_policies',
    description: 'List IAM policies in the AWS account',
    inputSchema: {
      type: 'object',
      properties: {
        scope: {
          type: 'string',
          enum: ['All', 'AWS', 'Local'],
          description: 'The scope of policies to list',
          default: 'Local',
        },
        maxItems: {
          type: 'number',
          description: 'Maximum number of policies to return',
          default: 100,
        },
      },
    },
  },
  {
    name: 'get_iam_policy',
    description: 'Get details of a specific IAM policy',
    inputSchema: {
      type: 'object',
      properties: {
        policyArn: {
          type: 'string',
          description: 'The ARN of the IAM policy',
        },
      },
      required: ['policyArn'],
    },
  },
  {
    name: 'assume_iam_role',
    description: 'Assume an IAM role and get temporary security credentials',
    inputSchema: {
      type: 'object',
      properties: {
        roleArn: {
          type: 'string',
          description: 'The ARN of the IAM role to assume',
        },
        sessionDuration: {
          type: 'number',
          description: 'The duration in seconds for the session (900-43200)',
          default: 3600,
        },
      },
      required: ['roleArn'],
    },
  },
];

/**
 * Main MCP Server
 */
class MCPServer {
  private server: Server;
  private config: Config;
  private logger: ReturnType<typeof createLogger>;
  private s3Tools!: S3Tools;
  private iamTools!: IAMTools;
  private stsService!: STSService;
  private region!: string;
  private s3Service!: S3Service;
  private iamService!: IAMService;

  constructor() {
    this.config = new Config();
    this.logger = createLogger(this.config.getLogLevel());
    this.server = new Server(
      {
        name: 'aws-mcp-readonly-lite',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private async initializeServices(): Promise<void> {
    this.region = this.config.getRegion();
    const assumeRoleArn = this.config.getAssumeRoleArn();

    let credentials = undefined;

    this.stsService = new STSService(this.region, this.logger);

    if (assumeRoleArn) {
      this.logger.info('Assuming role', { roleArn: assumeRoleArn });
      const creds = await this.stsService.assumeRole(
        assumeRoleArn,
        this.config.getSessionDuration()
      );
      credentials = {
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
        sessionToken: creds.sessionToken,
      };
    }

    this.s3Service = new S3Service(this.region, credentials, this.logger);
    this.iamService = new IAMService(this.region, credentials, this.logger);

    this.s3Tools = new S3Tools(this.s3Service, this.logger);
    this.iamTools = new IAMTools(
      this.iamService,
      this.stsService,
      this.logger,
      (credentials) => this.updateServicesWithCredentials(credentials)
    );
  }

  /**
   * Update services with new credentials after assuming a role.
   * This recreates S3 and IAM service instances with the new credentials
   * and updates the existing tool instances to use these new services.
   * Note: MCP protocol processes requests sequentially, so no locking is needed.
   */
  updateServicesWithCredentials(credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
  }): void {
    this.logger.info('Updating services with new credentials');

    this.s3Service = new S3Service(this.region, credentials, this.logger);
    this.iamService = new IAMService(this.region, credentials, this.logger);

    // Update the service references in the existing tool instances
    this.s3Tools.updateService(this.s3Service);
    this.iamTools.updateService(this.iamService);
  }

  private setupListToolsHandler(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOL_DEFINITIONS,
    }));
  }

  private async executeTool(name: string, args: unknown): Promise<object> {
    switch (name) {
      case 'list_s3_buckets':
        return await this.s3Tools.listBuckets(args);
      case 'list_s3_objects':
        return await this.s3Tools.listObjects(args);
      case 'get_s3_object':
        return await this.s3Tools.getObject(args);
      case 'get_s3_bucket_policy':
        return await this.s3Tools.getBucketPolicy(args);
      case 'list_iam_users':
        return await this.iamTools.listUsers(args);
      case 'get_iam_user':
        return await this.iamTools.getUser(args);
      case 'list_iam_roles':
        return await this.iamTools.listRoles(args);
      case 'get_iam_role':
        return await this.iamTools.getRole(args);
      case 'list_iam_policies':
        return await this.iamTools.listPolicies(args);
      case 'get_iam_policy':
        return await this.iamTools.getPolicy(args);
      case 'assume_iam_role':
        return await this.iamTools.assumeRole(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private setupCallToolHandler(): void {
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const result = await this.executeTool(name, args);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        this.logger.error('Tool execution error', {
          tool: name,
          error: error instanceof Error ? error.message : String(error),
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error:
                    error instanceof Error ? error.message : String(error),
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    });
  }

  private setupHandlers(): void {
    this.setupListToolsHandler();
    this.setupCallToolHandler();
  }

  async run(): Promise<void> {
    await this.initializeServices();

    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    this.logger.info('AWS MCP Readonly Lite server started');
  }
}

const server = new MCPServer();
server.run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
