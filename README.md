# aws-mcp-readonly-lite

A Node.js/TypeScript lite AWS MCP (Model Context Protocol) server with read-only permissions to S3 and IAM resources, designed for safe local use in your favorite IDE.

## Features

- ✅ **Read-only AWS Access**: Safe exploration of S3 and IAM resources
- ✅ **Clean Architecture**: Well-structured code following DRY and SOLID principles
- ✅ **Type-Safe**: Strict TypeScript configuration with comprehensive type checking
- ✅ **Validation**: Zod schemas for all inputs
- ✅ **Structured Logging**: Winston-based logging with multiple levels
- ✅ **Role Assumption**: Support for STS AssumeRole for role-based access
- ✅ **Comprehensive Tests**: 80%+ code coverage with vitest
- ✅ **MCP Protocol**: Full compliance with Model Context Protocol

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Setup in VSCode](#setup-in-vscode)
- [Configuration](#configuration)
- [Available Tools](#available-tools)
- [Development](#development)
- [Architecture](#architecture)
- [Security](#security)
- [License](#license)

## Prerequisites

Before setting up this MCP server, ensure you have:

- **Node.js** >= 18.x installed
- **npm** >= 9.x installed
- **AWS credentials** configured (see [AWS Configuration](#configuration))
- **VSCode** with GitHub Copilot extension (for VSCode setup)

## Installation

Install the package globally from npm:

```bash
npm install -g aws-mcp-readonly-lite
```

Or use with `npx` without installing (recommended for VSCode MCP setup):

```bash
npx aws-mcp-readonly-lite
```

## Setup in VSCode

To use this MCP server with GitHub Copilot in VSCode, follow these steps:

### Step 1: Configure Environment Variables

Create a `.env` file in the project root (or set system environment variables):

```bash
# Required
AWS_REGION=us-east-1

# Optional - for role assumption
# AWS_ASSUME_ROLE_ARN=arn:aws:iam::123456789012:role/ReadOnlyRole
# AWS_SESSION_DURATION=3600

# Optional - logging
LOG_LEVEL=info
```

### Step 2: Configure AWS Credentials

Ensure your AWS credentials are configured. Choose one of these methods:

**Option 1: AWS Credentials File** (Recommended)
```bash
# Configure using AWS CLI
aws configure

# Or manually edit ~/.aws/credentials
[default]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
```

**Option 2: Environment Variables**
```bash
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
export AWS_REGION=us-east-1
```

### Step 3: Configure MCP in VSCode Settings

1. Open VSCode Settings (JSON) by pressing `Cmd/Ctrl + Shift + P` and selecting **"Preferences: Open User Settings (JSON)"**

2. Add the MCP server configuration to your settings:

```json
{
  "github.copilot.chat.mcp.enabled": true,
  "github.copilot.chat.mcp.servers": {
    "aws-readonly": {
      "command": "npx",
      "args": [
        "aws-mcp-readonly-lite"
      ],
      "env": {
        "AWS_REGION": "us-east-1",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### Step 4: Verify the Setup

1. Restart VSCode to apply the MCP configuration
2. Open GitHub Copilot Chat in VSCode
3. The MCP server should now be available and you can use commands like:
   - "List my S3 buckets"
   - "Show IAM users in my account"
   - "Get contents of bucket my-bucket"

### Troubleshooting

**Server not starting?**
- Ensure `npx` is available (comes with Node.js/npm)
- Check VSCode Output panel → "GitHub Copilot Chat" for error messages
- Try running `npx aws-mcp-readonly-lite` in terminal to see if it works

**AWS credentials not working?**
- Verify credentials with: `aws sts get-caller-identity`
- Check that AWS_REGION is set correctly
- Ensure your IAM user/role has read permissions for S3 and IAM

**No MCP tools available in Copilot?**
- Ensure `github.copilot.chat.mcp.enabled` is set to `true`
- Restart VSCode after changing settings
- Check that you have the latest version of GitHub Copilot extension

## Configuration

### Environment Variables

Configure via environment variables or `.env` file:

```bash
# Required
AWS_REGION=us-east-1

# Optional - for role assumption
AWS_ASSUME_ROLE_ARN=arn:aws:iam::123456789012:role/ReadOnlyRole
AWS_SESSION_DURATION=3600

# Optional - logging
LOG_LEVEL=info  # error|warn|info|debug
```

### AWS Credentials

AWS credentials are obtained via the standard AWS credential chain:
1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
2. Shared credentials file (~/.aws/credentials)
3. IAM role (when running on EC2/ECS)
4. Assumed role (when AWS_ASSUME_ROLE_ARN is set)

## Development

> **Note**: This section is for developers who want to contribute to or modify the package. If you just want to use the MCP server, follow the [Installation](#installation) instructions above.

### Local Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/guillaume-galp/aws-mcp-readonly-list.git
   cd aws-mcp-readonly-list
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

### Build

```bash
npm run build
```

### Run Locally

```bash
npm start
```

### Development Mode

```bash
npm run dev  # Watch mode with auto-rebuild
```

### Testing

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report
```

### Linting

```bash
npm run lint            # Type check with TypeScript
```

## Architecture

```
src/
├── core/           # Domain types, schemas, config, logging
├── services/       # AWS SDK interactions (S3, IAM, STS)
├── tools/          # MCP tool definitions
└── index.ts        # MCP server entry point
```

### Clean Architecture Layers

1. **Core Layer**: Domain types, configuration, validation schemas, logging
2. **Services Layer**: AWS SDK interactions and business logic
3. **Tools Layer**: MCP tool definitions and handlers
4. **Application Layer**: MCP server setup and request routing

## Available Tools

### S3 Tools

#### list_s3_buckets
Lists all S3 buckets in the AWS account.

**Input:** None

**Output:**
```json
{
  "buckets": [
    {
      "name": "my-bucket",
      "creationDate": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### list_s3_objects
Lists objects in an S3 bucket.

**Input:**
```json
{
  "bucket": "my-bucket",
  "prefix": "data/",     // optional
  "maxKeys": 100         // optional, default 100
}
```

**Output:**
```json
{
  "bucket": "my-bucket",
  "objects": [
    {
      "key": "data/file.txt",
      "size": 1024,
      "lastModified": "2024-01-01T00:00:00.000Z",
      "eTag": "abc123"
    }
  ],
  "count": 1
}
```

#### get_s3_object
Gets the content of an S3 object.

**Input:**
```json
{
  "bucket": "my-bucket",
  "key": "file.txt"
}
```

**Output:**
```json
{
  "bucket": "my-bucket",
  "key": "file.txt",
  "content": "file contents here"
}
```

#### get_s3_bucket_policy
Gets the policy of an S3 bucket.

**Input:**
```json
{
  "bucket": "my-bucket"
}
```

**Output:**
```json
{
  "bucket": "my-bucket",
  "policy": {
    "Version": "2012-10-17",
    "Statement": []
  }
}
```

### IAM Tools

#### list_iam_users
Lists IAM users in the AWS account.

**Input:**
```json
{
  "maxItems": 100  // optional, default 100
}
```

**Output:**
```json
{
  "users": [
    {
      "userName": "john-doe",
      "userId": "AIDAI...",
      "arn": "arn:aws:iam::123456789012:user/john-doe",
      "createDate": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### get_iam_user
Gets details of a specific IAM user.

**Input:**
```json
{
  "userName": "john-doe"
}
```

#### list_iam_roles
Lists IAM roles in the AWS account.

**Input:**
```json
{
  "maxItems": 100  // optional, default 100
}
```

#### get_iam_role
Gets details of a specific IAM role.

**Input:**
```json
{
  "roleName": "MyRole"
}
```

#### list_iam_policies
Lists IAM policies in the AWS account.

**Input:**
```json
{
  "scope": "Local",  // optional: All|AWS|Local, default Local
  "maxItems": 100    // optional, default 100
}
```

#### get_iam_policy
Gets details of a specific IAM policy.

**Input:**
```json
{
  "policyArn": "arn:aws:iam::123456789012:policy/MyPolicy"
}
```

## Security

This server implements **read-only** access only. No write, update, or delete operations are supported.

**Allowed Operations:**
- S3: ListBuckets, ListObjects, GetObject, GetBucketPolicy
- IAM: ListUsers, GetUser, ListRoles, GetRole, ListPolicies, GetPolicy
- STS: AssumeRole (for authentication)

**Not Allowed:**
- Any write operations (PUT, POST, DELETE)
- Raw CLI command execution
- Modification of AWS resources

## Code Quality Standards

- **Maximum file size**: 500 lines
- **Maximum method size**: 50 lines
- **Test coverage**: 80%+ required
- **TypeScript**: Strict mode enabled
- **Validation**: All inputs validated with zod
- **Logging**: Structured logging with winston

See [copilot-instructions.md](./.github/copilot-instructions.md) for detailed coding rules and guardrails.

## Development Guidelines

1. Follow clean architecture principles
2. Write tests for all new features
3. Maintain 80%+ code coverage
4. Use zod for input validation
5. Log appropriately with winston
6. Never implement write operations

## License

MIT
