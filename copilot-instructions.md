# AWS MCP Readonly-Lite - Copilot Instructions

## Project Overview

This project is a Node.js/TypeScript implementation of a Model Context Protocol (MCP) server providing read-only access to AWS S3 and IAM resources. It follows clean architecture principles with strict separation of concerns.

## Architecture

### Clean Architecture Layers

1. **Core Layer** (`src/core/`)
   - Domain types and interfaces
   - Configuration management
   - Validation schemas (zod)
   - Logging infrastructure

2. **Services Layer** (`src/services/`)
   - AWS SDK interactions
   - Business logic for AWS operations
   - STS role assumption
   - S3 read-only operations
   - IAM read-only operations

3. **Tools Layer** (`src/tools/`)
   - MCP tool definitions
   - Input validation
   - Response formatting
   - Tool handlers

4. **Application Layer** (`src/index.ts`)
   - MCP server setup
   - Request routing
   - Error handling

## Coding Rules and Standards

### TypeScript Configuration

- **Strict Mode**: Always enabled
- **No Implicit Any**: All types must be explicit
- **ESM Modules**: Use ES modules with `.js` extensions in imports
- **No Unused Variables**: Clean up all unused code

### Code Complexity Limits

- **Maximum File Size**: 500 lines per file
- **Maximum Method Size**: 50 lines per method/function
- **Single Responsibility**: Each class/function should have one clear purpose

### DRY Principles

- Avoid code duplication
- Extract common logic into utilities
- Reuse validation schemas
- Share type definitions

### Naming Conventions

- **Files**: kebab-case (e.g., `s3.service.ts`)
- **Classes**: PascalCase (e.g., `S3Service`)
- **Functions/Variables**: camelCase (e.g., `listBuckets`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_ITEMS`)
- **Types/Interfaces**: PascalCase with descriptive names

### Error Handling

- Always use try-catch blocks for async operations
- Log errors with structured context
- Throw meaningful error messages
- Never swallow errors silently

### Logging

- Use structured logging with winston
- Include relevant context in log messages
- Use appropriate log levels:
  - `error`: Critical failures
  - `warn`: Recoverable issues
  - `info`: Important business events
  - `debug`: Detailed debugging information

### AWS SDK Usage

- Use AWS SDK v3 modular imports
- Always handle AWS errors gracefully
- Use proper credential management
- Support role assumption via STS

## Security Guardrails

### Read-Only Access

- **NEVER** implement write operations (PUT, POST, DELETE)
- Only use read/list AWS API calls
- No modification of AWS resources
- No CLI command passthrough

### Allowed Operations

**S3:**
- ListBuckets
- ListObjects
- GetObject (read content)
- GetBucketPolicy

**IAM:**
- ListUsers
- GetUser
- ListRoles
- GetRole
- ListPolicies
- GetPolicy

**STS:**
- AssumeRole (for authentication only)

### Input Validation

- Always validate inputs with zod schemas
- Sanitize all user inputs
- Enforce parameter limits (maxItems, maxKeys)
- Validate AWS ARN formats

### Credentials

- Never hardcode credentials
- Use environment variables
- Support AWS credential chain
- Support role assumption

## Testing Requirements

### Unit Tests

- Minimum 80% code coverage
- Test all business logic
- Mock AWS SDK clients
- Test error scenarios
- Test validation failures

### Test Organization

- Co-locate tests with source files (`.test.ts`)
- Use descriptive test names
- Group related tests with `describe`
- Use `beforeEach` for setup

## Development Workflow

### Before Committing

1. Run `npm run lint` - Check TypeScript
2. Run `npm test` - Run all tests
3. Run `npm run test:coverage` - Verify coverage
4. Run `npm run build` - Ensure build succeeds

### Adding New Features

1. Start with types in `core/types.ts`
2. Add validation schemas in `core/schemas.ts`
3. Implement service in appropriate `services/` file
4. Create tool wrapper in `tools/`
5. Register tool in `index.ts`
6. Write comprehensive tests
7. Update documentation

## Configuration

### Environment Variables

- `AWS_REGION`: AWS region (default: us-east-1)
- `AWS_ASSUME_ROLE_ARN`: Optional role to assume
- `AWS_SESSION_DURATION`: Session duration in seconds (900-43200)
- `LOG_LEVEL`: error|warn|info|debug (default: info)

### AWS Credentials

Use standard AWS credential chain:
1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
2. Shared credentials file (~/.aws/credentials)
3. IAM role (when running on EC2/ECS)
4. Assumed role (when AWS_ASSUME_ROLE_ARN is set)

## Prohibited Actions

### Security

- ❌ No write operations to AWS
- ❌ No CLI command execution
- ❌ No credential logging
- ❌ No raw shell commands

### Code Quality

- ❌ No files over 500 lines
- ❌ No methods over 50 lines
- ❌ No implicit any types
- ❌ No console.log (use logger)
- ❌ No commented-out code in commits

### Dependencies

- ❌ No unnecessary dependencies
- ❌ No dependencies with known vulnerabilities
- ❌ No direct file system access (except for config)

## MCP Protocol Compliance

### Tool Definitions

- Provide clear descriptions
- Define complete input schemas
- Return structured JSON responses
- Handle errors appropriately

### Response Format

```typescript
{
  content: [
    {
      type: 'text',
      text: JSON.stringify(result, null, 2)
    }
  ],
  isError: boolean (optional)
}
```

## Maintenance Guidelines

### Adding New AWS Services

1. Create service in `src/services/`
2. Define types in `src/core/types.ts`
3. Add schemas in `src/core/schemas.ts`
4. Create tools in `src/tools/`
5. Write tests achieving 80%+ coverage
6. Update this document

### Updating Dependencies

1. Check for security vulnerabilities
2. Test thoroughly after updates
3. Update package-lock.json
4. Verify build and tests pass

## Code Review Checklist

- [ ] No files exceed 500 lines
- [ ] No methods exceed 50 lines
- [ ] All inputs validated with zod
- [ ] Errors properly logged
- [ ] Tests written and passing
- [ ] Coverage >= 80%
- [ ] TypeScript strict mode compliance
- [ ] No write operations to AWS
- [ ] Documentation updated
- [ ] Follows clean architecture

## Support and Resources

- MCP Documentation: https://modelcontextprotocol.io
- AWS SDK v3: https://docs.aws.amazon.com/sdk-for-javascript/v3/
- Zod: https://zod.dev
- Vitest: https://vitest.dev
