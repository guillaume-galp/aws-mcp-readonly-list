---
name: ulysses-aws-readonly
description: Instructions for using the aws-readonly MCP tool for read-only AWS queries (S3, IAM, account inventory). Use when you need to run audited, read-only queries against AWS accounts via the MCP 'aws-readonly' tool. Provide target account and cross-account role ARN to assume.
---

# Ulysses AWS Readonly

## Overview

Execute read-only AWS operations (list S3 buckets, enumerate IAM roles, fetch account metadata) using the `aws-readonly` MCP tool with cross-account role assumption for security and auditability.

## Quick Start

List S3 buckets using the MCP tool:

```python
mcp_aws-readonly_list_s3_buckets()
```

The tool uses default credentials from the environment. For cross-account access (recommended), provide role ARN when available.

## Available Operations

The `aws-readonly` MCP tool provides these read-only operations:

- `mcp_aws-readonly_list_s3_buckets` - List all S3 buckets in the account
- `mcp_aws-readonly_list_iam_roles` - List IAM roles
- `mcp_aws-readonly_list_iam_users` - List IAM users
- `mcp_aws-readonly_list_iam_policies` - List IAM policies
- `mcp_aws-readonly_get_iam_role` - Get details of a specific role
- `mcp_aws-readonly_get_iam_user` - Get details of a specific user
- `mcp_aws-readonly_get_iam_policy` - Get policy document
- `mcp_aws-readonly_get_sts_caller_identity` - Get current caller identity
- `mcp_aws-readonly_assume_iam_role` - Assume a role for cross-account access
- `mcp_aws-readonly_list_s3_objects` - List objects in a specific bucket
- `mcp_aws-readonly_get_s3_object` - Get object content
- `mcp_aws-readonly_get_s3_bucket_policy` - Get bucket policy

## Usage Examples

### List S3 buckets

```python
mcp_aws-readonly_list_s3_buckets()
```

Returns a list of buckets with names and creation dates.

### Get S3 bucket contents

```python
mcp_aws-readonly_list_s3_objects(bucket="my-bucket-name", prefix="path/to/folder/")
```

### Get caller identity

```python
mcp_aws-readonly_get_sts_caller_identity()
```

Returns account ID, ARN, and user ID for debugging credential issues.

### Assume a role

```python
mcp_aws-readonly_assume_iam_role(
    role_arn="arn:aws:iam::123456789012:role/ReadOnlyRole",
    role_session_name="mcp-session"
)
```

## AWS Accounts

Known AWS accounts (update as needed):

- **Management (mgt)**: 375346921771
- **Sandbox (deaas01)**: 396039531712
- **Sandbox (deaas04)**: 135260978790
- **Quality (qua)**: 073284295214
- **Preprod (pre)**: 008978860536
- **Prod (prd)**: 981606773328
- **Prod Legacy (lgc)**: 836496312209
- **Cortex (cortex)**: 288761772474

## Cross-Account Access Pattern

When tools support role assumption parameters (availability varies by MCP implementation):

1. Call `mcp_aws-readonly_assume_iam_role` with the target role ARN
2. Subsequent calls use the assumed role credentials
3. Role ARN pattern: `arn:aws:iam::{account-id}:role/{role-name}`

**Recommended role names:**
- `iam-role-management_cross_account_role` * - Standard cross-account read-only AND **default** (*) role for all accounts
- `MCPReadOnlyRole` - Dedicated MCP access role

## Security Notes

- All operations are read-only; no write/delete permissions
- Credentials sourced from environment (AWS_PROFILE, IAM instance profile, etc.)
- Role assumption provides audit trail and temporary credentials
- Never embed long-lived credentials in skill files

## Troubleshooting

**Credential errors**: "Could not load credentials from any providers"
- Verify AWS credentials configured in environment
- Check AWS_PROFILE environment variable
- Confirm IAM permissions allow the requested operation

**Empty results**: Tool returns successfully but no buckets/resources listed
- Verify you're querying the correct AWS account
- Check IAM permissions for the listing operation
- Confirm resources exist in the account/region

**Cross-account access fails**:
- Verify trust relationship exists between accounts
- Confirm role ARN is correct
- Check role permissions allow the requested operations
