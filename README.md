# aws-mcp-readonly-lite

A Node.js/TypeScript lite AWS MCP (Model Context Protocol) server with read-only permissions to S3 and IAM resources, designed for safe local use in your favorite IDE.

You may switch accounts by assuming a role with the `mcp_aws-readonly_assume_iam_role` tool, or by configuring your AWS CLI profiles and using the `AWS_PROFILE` environment variable.

Configure the skill in `.github/skills/aws-readonly/SKILL.md` in your IDE to use this MCP server, and then you can ask questions like:

- switch to the quality account and list S3 buckets
- show me the IAM users in the preprod account
- get the contents of a file in the prod account

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
AWS_REGION=eu-west-1

# Optional - for role assumption
# AWS_ASSUME_ROLE_ARN=arn:aws:iam::123456789012:role/ReadOnlyRole
# AWS_SESSION_DURATION=3600

# Optional - logging
LOG_LEVEL=info
```

### Step 2: Configure AWS Credentials

This MCP server uses the **AWS default credential chain** and supports multiple authentication methods:

**Recommended Options:**

1. **AWS CLI Profile** (Best for local development)
   ```bash
   # Configure using AWS CLI
   aws configure

   # Or use a specific profile
   export AWS_PROFILE=your-profile-name
   ```

2. **AWS SSO** (Best for enterprise environments)
   ```bash
   # Configure SSO
   aws configure sso

   # Login to SSO
   aws sso login --profile your-sso-profile

   # Use the SSO profile
   export AWS_PROFILE=your-sso-profile
   ```

3. **Shared Credentials File** (~/.aws/credentials)
   ```ini
   [default]
   aws_access_key_id = YOUR_ACCESS_KEY
   aws_secret_access_key = YOUR_SECRET_KEY
   ```

**Note:** The server never requires hardcoded credentials in environment variables or configuration files. It automatically discovers credentials through the AWS SDK's standard credential chain.

### Step 3: Configure MCP in VSCode Settings

1. Open VSCode Settings (JSON) by pressing `Cmd/Ctrl + Shift + P` and selecting **"Preferences: Open User Settings (JSON)"**

2. Add the MCP server configuration to your settings:

```json
{
  "servers": {
		"aws-readonly": {
			"type": "stdio",
			"command": "npx",
			"args": [
				"aws-mcp-readonly-lite@1.1.2"
			],
			"env": {
				"AWS_REGION": "eu-west-1",
				"LOG_LEVEL": "info",
				"AWS_PROFILE": "cross-mgmt"
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
- For AWS_PROFILE: `AWS_PROFILE=your-profile aws sts get-caller-identity`
- For SSO: Ensure you're logged in with `aws sso login --profile your-profile`
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
AWS_REGION=eu-west-1

# Optional - for role assumption
AWS_ASSUME_ROLE_ARN=arn:aws:iam::123456789012:role/ReadOnlyRole
AWS_SESSION_DURATION=3600

# Optional - logging
LOG_LEVEL=info  # error|warn|info|debug
```

### AWS Credentials

AWS credentials are automatically obtained via the **AWS SDK default credential chain**, which checks the following sources in order:

1. **Environment variables** (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN)
2. **AWS_PROFILE** environment variable to use a specific profile
3. **Shared credentials file** (~/.aws/credentials)
4. **Shared configuration file** (~/.aws/config) for SSO profiles
5. **IAM role** (when running on EC2/ECS)
6. **Assumed role** (when AWS_ASSUME_ROLE_ARN is set)

**This design ensures:**

- ✅ Support for AWS_PROFILE
- ✅ Support for AWS SSO
- ✅ Local development friendly
- ✅ CI/CD friendly
- ✅ Cloud-native (works on EC2/ECS)
- ✅ Secure by design (no hardcoded credentials required)

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

### STS Tools

#### assume_iam_role
Assumes an IAM role and returns temporary security credentials.

**Input:**
```json
{
  "roleArn": "arn:aws:iam::123456789012:role/MyRole",
  "sessionDuration": 3600  // optional, default 3600 (1 hour), range 900-43200
}
```

**Output:**
```json
{
  "roleArn": "arn:aws:iam::123456789012:role/MyRole",
  "accessKeyId": "ASIA...",
  "secretAccessKey": "...",
  "sessionToken": "...",
  "expiration": "2024-01-01T01:00:00.000Z"
}
```

#### get_sts_caller_identity
Gets the current STS caller identity (user/role being used).

**Input:** None

**Output:**
```json
{
  "userId": "AIDAI...",
  "account": "123456789012",
  "arn": "arn:aws:iam::123456789012:user/my-user"
}
```

## Security

This server implements **read-only** access only. No write, update, or delete operations are supported.

**Allowed Operations:**
- S3: ListBuckets, ListObjects, GetObject, GetBucketPolicy
- IAM: ListUsers, GetUser, ListRoles, GetRole, ListPolicies, GetPolicy
- STS: AssumeRole, GetCallerIdentity

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
