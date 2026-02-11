#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Config } from './core/config.js';
import { createLogger } from './core/logger.js';
import { STSService } from './services/sts.service.js';
import { S3Service } from './services/s3.service.js';
import { IAMService } from './services/iam.service.js';
import { S3Tools } from './tools/s3.tools.js';
import { IAMTools } from './tools/iam.tools.js';

/**
 * Main MCP Server
 */
class MCPServer {
  private server: Server;
  private config: Config;
  private logger: ReturnType<typeof createLogger>;
  private s3Tools!: S3Tools;
  private iamTools!: IAMTools;

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
    const region = this.config.getRegion();
    const assumeRoleArn = this.config.getAssumeRoleArn();

    let credentials = undefined;

    if (assumeRoleArn) {
      this.logger.info('Assuming role', { roleArn: assumeRoleArn });
      const stsService = new STSService(region, this.logger);
      const creds = await stsService.assumeRole(
        assumeRoleArn,
        this.config.getSessionDuration()
      );
      credentials = {
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
        sessionToken: creds.sessionToken,
      };
    }

    const s3Service = new S3Service(region, credentials, this.logger);
    const iamService = new IAMService(region, credentials, this.logger);

    this.s3Tools = new S3Tools(s3Service, this.logger);
    this.iamTools = new IAMTools(iamService, this.logger);
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(
      ListToolsRequestSchema,
      async () => ({
        tools: [
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
        ],
      })
    );

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request) => {
        const { name, arguments: args } = request.params;

        try {
          let result: object;

          switch (name) {
            case 'list_s3_buckets':
              result = await this.s3Tools.listBuckets(args);
              break;
            case 'list_s3_objects':
              result = await this.s3Tools.listObjects(args);
              break;
            case 'get_s3_object':
              result = await this.s3Tools.getObject(args);
              break;
            case 'get_s3_bucket_policy':
              result = await this.s3Tools.getBucketPolicy(args);
              break;
            case 'list_iam_users':
              result = await this.iamTools.listUsers(args);
              break;
            case 'get_iam_user':
              result = await this.iamTools.getUser(args);
              break;
            case 'list_iam_roles':
              result = await this.iamTools.listRoles(args);
              break;
            case 'get_iam_role':
              result = await this.iamTools.getRole(args);
              break;
            case 'list_iam_policies':
              result = await this.iamTools.listPolicies(args);
              break;
            case 'get_iam_policy':
              result = await this.iamTools.getPolicy(args);
              break;
            default:
              throw new Error(`Unknown tool: ${name}`);
          }

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
      }
    );
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
