# ECS Task Definition and Service Deployment Guide

This guide explains how to deploy ECS Task definitions and services using the provided CloudFormation templates.

## Files Overview

- `ecs-task-service-template.yaml` - Main CloudFormation template for ECS resources
- `ecs-task-service-parameters.json.template` - Parameters file template
- `deploy-ecs-service.ps1` - PowerShell deployment script
- `deploy-ecs-service.sh` - Bash deployment script

## Prerequisites

1. **AWS CLI configured** with appropriate permissions
2. **Existing infrastructure** from the main CloudFormation stack:
   - ECS Cluster
   - VPC and subnets
   - Security groups
   - Load balancer and target group
   - RDS database
   - ElastiCache Redis cluster
3. **ECR repository** with your application image
4. **IAM roles** for ECS task execution and task roles

## Step 1: Prepare Parameters File

Copy the template and fill in your values:

```bash
cp ecs-task-service-parameters.json.template ecs-task-service-parameters.json
```

Edit `ecs-task-service-parameters.json` with your actual values:

```json
[
  {
    "ParameterKey": "Environment",
    "ParameterValue": "production"
  },
  {
    "ParameterKey": "ECRRepositoryURI",
    "ParameterValue": "123456789012.dkr.ecr.us-east-1.amazonaws.com/production-fluenccy-app"
  },
  {
    "ParameterKey": "ImageTag",
    "ParameterValue": "latest"
  },
  {
    "ParameterKey": "ECSClusterName",
    "ParameterValue": "production-fluenccy-cluster"
  },
  {
    "ParameterKey": "VPCId",
    "ParameterValue": "vpc-12345678"
  },
  {
    "ParameterKey": "PrivateSubnet1Id",
    "ParameterValue": "subnet-12345678"
  },
  {
    "ParameterKey": "PrivateSubnet2Id",
    "ParameterValue": "subnet-87654321"
  },
  {
    "ParameterKey": "ECSSecurityGroupId",
    "ParameterValue": "sg-12345678"
  },
  {
    "ParameterKey": "TargetGroupArn",
    "ParameterValue": "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/production-fluenccy-tg/1234567890123456"
  },
  {
    "ParameterKey": "DatabaseHost",
    "ParameterValue": "production-fluenccy-db.cluster-xyz.us-east-1.rds.amazonaws.com"
  },
  {
    "ParameterKey": "DatabasePassword",
    "ParameterValue": "your-secure-database-password"
  },
  {
    "ParameterKey": "RedisHost",
    "ParameterValue": "production-fluenccy-redis.xyz.cache.amazonaws.com"
  },
  {
    "ParameterKey": "RedisPassword",
    "ParameterValue": "your-secure-redis-password"
  }
]
```

## Step 2: Deploy Using PowerShell (Windows)

### Create Stack
```powershell
.\deploy-ecs-service.ps1 -StackName "fluenccy-ecs-service" -ParametersFile "ecs-task-service-parameters.json" -CreateStack
```

### Update Stack
```powershell
.\deploy-ecs-service.ps1 -StackName "fluenccy-ecs-service" -ParametersFile "ecs-task-service-parameters.json" -UpdateStack
```

### Delete Stack
```powershell
.\deploy-ecs-service.ps1 -StackName "fluenccy-ecs-service" -DeleteStack
```

### Dry Run (Preview Commands)
```powershell
.\deploy-ecs-service.ps1 -StackName "fluenccy-ecs-service" -ParametersFile "ecs-task-service-parameters.json" -CreateStack -DryRun
```

## Step 3: Deploy Using Bash (Linux/macOS)

### Create Stack
```bash
./deploy-ecs-service.sh --stack-name "fluenccy-ecs-service" --parameters-file "ecs-task-service-parameters.json" --create
```

### Update Stack
```bash
./deploy-ecs-service.sh --stack-name "fluenccy-ecs-service" --parameters-file "ecs-task-service-parameters.json" --update
```

### Delete Stack
```bash
./deploy-ecs-service.sh --stack-name "fluenccy-ecs-service" --delete
```

### Dry Run (Preview Commands)
```bash
./deploy-ecs-service.sh --stack-name "fluenccy-ecs-service" --parameters-file "ecs-task-service-parameters.json" --create --dry-run
```

## Step 4: Manual Deployment (Alternative)

If you prefer to use AWS CLI directly:

### Create Stack
```bash
aws cloudformation create-stack \
  --stack-name fluenccy-ecs-service \
  --template-body file://ecs-task-service-template.yaml \
  --parameters file://ecs-task-service-parameters.json \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

### Update Stack
```bash
aws cloudformation update-stack \
  --stack-name fluenccy-ecs-service \
  --template-body file://ecs-task-service-template.yaml \
  --parameters file://ecs-task-service-parameters.json \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

## Template Features

### ECS Task Definition
- **Fargate compatibility** with configurable CPU and memory
- **ECR image reference** with parameterized repository URI and tag
- **Environment variables** for database and Redis connections
- **Health checks** with configurable path and timing
- **CloudWatch logging** integration
- **IAM roles** for task execution and application permissions

### ECS Service
- **Load balancer integration** with target group
- **Auto scaling** with CPU-based target tracking
- **Deployment configuration** with circuit breaker
- **Network configuration** with VPC and security groups
- **Execute command** enabled for debugging

### Auto Scaling
- **Target tracking** based on CPU utilization (70% target)
- **Scale out/scale in cooldowns** (5 minutes each)
- **Min capacity**: 1 task
- **Max capacity**: 10 tasks

## Parameters Reference

| Parameter | Description | Default | Required |
|-----------|-------------|---------|----------|
| `Environment` | Environment name | production | No |
| `ECRRepositoryURI` | ECR repository URI | - | Yes |
| `ImageTag` | Docker image tag | latest | No |
| `ECSClusterName` | ECS cluster name | production-fluenccy-cluster | No |
| `VPCId` | VPC ID | - | Yes |
| `PrivateSubnet1Id` | Private subnet 1 ID | - | Yes |
| `PrivateSubnet2Id` | Private subnet 2 ID | - | Yes |
| `ECSSecurityGroupId` | ECS security group ID | - | Yes |
| `TargetGroupArn` | Target group ARN | - | Yes |
| `TaskCPU` | Task CPU units | 1024 | No |
| `TaskMemory` | Task memory (MB) | 2048 | No |
| `DesiredCount` | Desired task count | 2 | No |
| `ContainerPort` | Container port | 3001 | No |
| `HealthCheckPath` | Health check path | /api/health | No |
| `DatabaseHost` | Database host | - | Yes |
| `DatabasePassword` | Database password | - | Yes |
| `RedisHost` | Redis host | - | Yes |
| `RedisPassword` | Redis password | - | Yes |

## Outputs

The template provides the following outputs:

- **TaskDefinitionArn**: ECS Task Definition ARN
- **ServiceArn**: ECS Service ARN
- **ServiceName**: ECS Service Name
- **AutoScalingTargetArn**: Auto Scaling Target ARN

## Troubleshooting

### Common Issues

1. **Stack creation fails with "Role does not exist"**
   - Ensure the IAM roles referenced in the template exist
   - Check that the role names match your existing infrastructure

2. **Service fails to start**
   - Verify the ECR repository URI and image tag
   - Check that the security groups allow traffic on the container port
   - Ensure the target group is properly configured

3. **Health checks fail**
   - Verify the health check path exists in your application
   - Check that the application is listening on the correct port
   - Review CloudWatch logs for application errors

### Monitoring

- **CloudWatch Logs**: Application logs are sent to `/ecs/{environment}-fluenccy-app`
- **ECS Console**: Monitor service status and task health
- **Load Balancer**: Check target group health in the EC2 console

## Security Considerations

- Database and Redis passwords are passed as environment variables
- Consider using AWS Secrets Manager for production deployments
- Ensure security groups follow the principle of least privilege
- Enable VPC Flow Logs for network monitoring

## Next Steps

After successful deployment:

1. **Test the application** by accessing the load balancer DNS name
2. **Monitor performance** using CloudWatch metrics
3. **Set up alerts** for service health and scaling events
4. **Configure CI/CD** to automatically update the service with new images
