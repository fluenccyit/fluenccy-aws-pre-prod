# CloudFormation Parameters Guide

This document lists all the parameters that were missing from the original CloudFormation template and how to use them.

## Missing Parameters (Now Added)

### 1. **DatabasePassword** ⚠️ **REQUIRED**
- **Type**: String
- **Description**: Password for the RDS PostgreSQL database
- **Constraints**: 8-128 characters, NoEcho (hidden in console)
- **Example**: `"MySecurePassword123!"`

### 2. **RedisPassword** ⚠️ **REQUIRED**
- **Type**: String
- **Description**: Password for the ElastiCache Redis cluster
- **Constraints**: 8-128 characters, NoEcho (hidden in console)
- **Example**: `"MySecureRedisPassword456!"`

### 3. **DatabaseInstanceClass** (Optional)
- **Type**: String
- **Default**: `db.t3.micro`
- **Allowed Values**: `db.t3.micro`, `db.t3.small`, `db.t3.medium`, `db.t3.large`, `db.t3.xlarge`, `db.t3.2xlarge`
- **Description**: RDS instance class for the database

### 4. **RedisNodeType** (Optional)
- **Type**: String
- **Default**: `cache.t3.micro`
- **Allowed Values**: `cache.t3.micro`, `cache.t3.small`, `cache.t3.medium`, `cache.t3.large`, `cache.t3.xlarge`, `cache.t3.2xlarge`
- **Description**: ElastiCache node type for Redis cluster

### 5. **DatabaseAllocatedStorage** (Optional)
- **Type**: Number
- **Default**: `20`
- **Range**: 20-1000 GB
- **Description**: Allocated storage for RDS database

### 6. **DatabaseBackupRetentionPeriod** (Optional)
- **Type**: Number
- **Default**: `7`
- **Range**: 0-35 days
- **Description**: Backup retention period for RDS database

### 7. **ECSDesiredCount** (Optional)
- **Type**: Number
- **Default**: `2`
- **Range**: 1-10 tasks
- **Description**: Desired number of ECS tasks

### 8. **ECSCPU** (Optional)
- **Type**: String
- **Default**: `1024`
- **Allowed Values**: `256`, `512`, `1024`, `2048`, `4096`
- **Description**: CPU units for ECS tasks (1024 = 1 vCPU)

### 9. **ECSMemory** (Optional)
- **Type**: String
- **Default**: `2048`
- **Allowed Values**: `512`, `1024`, `2048`, `3072`, `4096`, `5120`, `6144`, `7168`, `8192`
- **Description**: Memory for ECS tasks (MB)

## How to Deploy with Parameters

### Option 1: Using Parameters File (Recommended)

1. **Copy the template file:**
   ```bash
   cp cloudformation-parameters.json.template cloudformation-parameters.json
   ```

2. **Edit the parameters file:**
   ```bash
   # Edit cloudformation-parameters.json and replace the placeholder values
   nano cloudformation-parameters.json
   ```

3. **Deploy the stack:**
   ```bash
   aws cloudformation deploy \
     --template-file cloudformation-template.yaml \
     --stack-name production-fluenccy-infrastructure \
     --parameter-overrides file://cloudformation-parameters.json \
     --capabilities CAPABILITY_IAM
   ```

### Option 2: Using Command Line Parameters

```bash
aws cloudformation deploy \
  --template-file cloudformation-template.yaml \
  --stack-name production-fluenccy-infrastructure \
  --parameter-overrides \
    Environment=production \
    DatabasePassword=MySecurePassword123! \
    RedisPassword=MySecureRedisPassword456! \
    DatabaseInstanceClass=db.t3.small \
    RedisNodeType=cache.t3.small \
    DatabaseAllocatedStorage=50 \
    DatabaseBackupRetentionPeriod=14 \
    ECSDesiredCount=3 \
    ECSCPU=2048 \
    ECSMemory=4096 \
  --capabilities CAPABILITY_IAM
```

### Option 3: Using the Automated Script

```bash
# The script will generate secure passwords automatically
./deploy-with-parameters.sh production
```

## Example Parameters File

```json
[
  {
    "ParameterKey": "Environment",
    "ParameterValue": "production"
  },
  {
    "ParameterKey": "DatabasePassword",
    "ParameterValue": "MySecurePassword123!"
  },
  {
    "ParameterKey": "RedisPassword",
    "ParameterValue": "MySecureRedisPassword456!"
  },
  {
    "ParameterKey": "DatabaseInstanceClass",
    "ParameterValue": "db.t3.small"
  },
  {
    "ParameterKey": "RedisNodeType",
    "ParameterValue": "cache.t3.small"
  },
  {
    "ParameterKey": "DatabaseAllocatedStorage",
    "ParameterValue": "50"
  },
  {
    "ParameterKey": "DatabaseBackupRetentionPeriod",
    "ParameterValue": "14"
  },
  {
    "ParameterKey": "ECSDesiredCount",
    "ParameterValue": "3"
  },
  {
    "ParameterKey": "ECSCPU",
    "ParameterValue": "2048"
  },
  {
    "ParameterKey": "ECSMemory",
    "ParameterValue": "4096"
  }
]
```

## Security Best Practices

### Password Requirements
- **Minimum 8 characters**
- **Use a mix of uppercase, lowercase, numbers, and special characters**
- **Avoid common words or patterns**
- **Store passwords securely (use AWS Secrets Manager)**

### Example Secure Passwords
```bash
# Generate secure passwords using OpenSSL
openssl rand -base64 32 | tr -d "=+/" | cut -c1-25

# Or using Python
python3 -c "import secrets, string; print(''.join(secrets.choice(string.ascii_letters + string.digits + '!@#$%^&*') for _ in range(25)))"
```

## Cost Optimization Parameters

### Development Environment
```json
{
  "DatabaseInstanceClass": "db.t3.micro",
  "RedisNodeType": "cache.t3.micro",
  "DatabaseAllocatedStorage": "20",
  "ECSDesiredCount": "1",
  "ECSCPU": "512",
  "ECSMemory": "1024"
}
```

### Production Environment
```json
{
  "DatabaseInstanceClass": "db.t3.small",
  "RedisNodeType": "cache.t3.small",
  "DatabaseAllocatedStorage": "100",
  "ECSDesiredCount": "3",
  "ECSCPU": "2048",
  "ECSMemory": "4096"
}
```

## Troubleshooting

### Common Issues

1. **Parameter validation errors:**
   - Check parameter values match allowed values
   - Ensure passwords meet minimum requirements
   - Verify numeric values are within ranges

2. **Stack creation fails:**
   - Check AWS permissions
   - Verify region availability
   - Ensure no naming conflicts

3. **Resource creation fails:**
   - Check resource limits
   - Verify subnet availability
   - Check security group rules

### Validation Commands

```bash
# Validate template
aws cloudformation validate-template --template-body file://cloudformation-template.yaml

# Check parameter values
aws cloudformation describe-stacks --stack-name production-fluenccy-infrastructure --query 'Stacks[0].Parameters'
```

## Next Steps After Deployment

1. **Create secrets in AWS Secrets Manager:**
   ```bash
   aws secretsmanager create-secret \
     --name "fluenccy/database" \
     --secret-string '{"host":"your-db-endpoint","port":"5432","database":"fluenccy","username":"postgres","password":"your-password"}'
   ```

2. **Build and push Docker image:**
   ```bash
   docker build -t fluenccy-app .
   docker tag fluenccy-app:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/production-fluenccy-app:latest
   docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/production-fluenccy-app:latest
   ```

3. **Deploy ECS service:**
   ```bash
   aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
   aws ecs create-service --cli-input-json file://ecs-service-definition.json
   ```
