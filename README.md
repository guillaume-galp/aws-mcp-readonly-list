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

## Architecture

```
src/
├── core/           # Domain types, schemas, config, logging
├── services/       # AWS SDK interactions (S3, IAM, STS)
├── tools/          # MCP tool definitions
└── index.ts        # MCP server entry point
```

## Installation

```bash
npm install
```

## Configuration

Configure via environment variables:

```bash
# Required
export AWS_REGION=us-east-1

# Optional - for role assumption
export AWS_ASSUME_ROLE_ARN=arn:aws:iam::123456789012:role/ReadOnlyRole
export AWS_SESSION_DURATION=3600

# Optional - logging
export LOG_LEVEL=info  # error|warn|info|debug
```

AWS credentials are obtained via the standard AWS credential chain:
1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
2. Shared credentials file (~/.aws/credentials)
3. IAM role (when running on EC2/ECS)
4. Assumed role (when AWS_ASSUME_ROLE_ARN is set)

## Usage

### Build

```bash
npm run build
```

### Run

```bash
npm start
```

### Development

```bash
npm run dev  # Watch mode
```

### Testing

```bash
npm test                # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report
```

### Linting

```bash
npm run lint
```

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

See [copilot-instructions.md](./copilot-instructions.md) for detailed coding rules and guardrails.

## Development Guidelines

1. Follow clean architecture principles
2. Write tests for all new features
3. Maintain 80%+ code coverage
4. Use zod for input validation
5. Log appropriately with winston
6. Never implement write operations

## License

MIT
