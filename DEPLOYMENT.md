# Fluenccy Application Deployment Guide

This guide provides comprehensive instructions for deploying the Fluenccy application on AWS ECS with Fargate.

## Architecture Overview

The deployment uses the following AWS services:
- **ECS Fargate**: Container orchestration
- **Application Load Balancer**: Traffic distribution
- **RDS PostgreSQL**: Database
- **ElastiCache Redis**: Caching and background jobs
- **ECR**: Container registry
- **CloudWatch**: Logging and monitoring
- **VPC**: Network isolation

## Prerequisites

### Required Tools
- AWS CLI v2
- Docker Desktop
- Node.js 14.x (for local development)
- Git

### AWS Account Setup
1. Create an AWS account
2. Configure AWS CLI: `aws configure`
3. Ensure you have the following permissions:
   - ECS Full Access
   - ECR Full Access
   - RDS Full Access
   - ElastiCache Full Access
   - CloudFormation Full Access
   - VPC Full Access
   - IAM Full Access

## Deployment Options

### Option 1: Automated Deployment (Recommended)

#### For Linux/macOS:
```bash
./deploy.sh [environment]
```

#### For Windows:
```powershell
.\deploy.ps1 -Environment [environment]
```

### Option 2: Manual Deployment

#### Step 1: Deploy Infrastructure
```bash
# Deploy CloudFormation stack
aws cloudformation deploy \
  --template-file cloudformation-template.yaml \
  --stack-name production-fluenccy-infrastructure \
  --parameter-overrides Environment=production \
  --capabilities CAPABILITY_IAM
```

#### Step 2: Build and Push Docker Image
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t fluenccy-app .

# Tag and push
docker tag fluenccy-app:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/production-fluenccy-app:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/production-fluenccy-app:latest
```

#### Step 3: Deploy ECS Service
```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# Create or update service
aws ecs create-service --cli-input-json file://ecs-service-definition.json
```

## Environment Configuration

### Environment Variables

The application requires the following environment variables:

#### Database Configuration
- `POSTGRES_HOST`: Database host
- `POSTGRES_PORT`: Database port (5432)
- `POSTGRES_DATABASE`: Database name
- `POSTGRES_USER`: Database username
- `POSTGRES_PASSWORD`: Database password

#### Redis Configuration
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port (6379)
- `REDIS_PASSWORD`: Redis password

#### Application Configuration
- `NODE_ENV`: Environment (production/staging/development)
- `PORT`: Application port (3001)

### Secrets Management

The deployment uses AWS Secrets Manager for sensitive configuration:

```bash
# Create database secrets
aws secretsmanager create-secret \
  --name "fluenccy/database" \
  --description "Database credentials" \
  --secret-string '{"host":"your-db-endpoint","port":"5432","database":"fluenccy","username":"postgres","password":"your-password"}'

# Create Redis secrets
aws secretsmanager create-secret \
  --name "fluenccy/redis" \
  --description "Redis credentials" \
  --secret-string '{"host":"your-redis-endpoint","port":"6379","password":"your-password"}'
```

## Monitoring and Logging

### CloudWatch Logs
- Application logs: `/ecs/production-fluenccy-app`
- Log retention: 30 days

### Health Checks
- Application health endpoint: `/api/health`
- Load balancer health checks every 30 seconds

### Monitoring Setup
1. Enable Container Insights on ECS cluster
2. Set up CloudWatch alarms for:
   - CPU utilization > 80%
   - Memory utilization > 80%
   - Task count < 1

## Scaling Configuration

### Auto Scaling
The deployment supports horizontal scaling:

```bash
# Create auto scaling target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/production-fluenccy-cluster/production-fluenccy-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/production-fluenccy-cluster/production-fluenccy-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name production-fluenccy-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

## Security Considerations

### Network Security
- Application runs in private subnets
- Database and Redis in private subnets
- Security groups restrict access
- SSL/TLS encryption in transit

### Data Security
- Database encryption at rest
- Redis encryption in transit
- Secrets stored in AWS Secrets Manager
- IAM roles for least privilege access

### Container Security
- Non-root user in container
- Minimal base image (Alpine Linux)
- Regular security updates
- Image vulnerability scanning

## Troubleshooting

### Common Issues

#### 1. Task Fails to Start
```bash
# Check task logs
aws logs get-log-events \
  --log-group-name /ecs/production-fluenccy-app \
  --log-stream-name ecs/fluenccy-app/TASK_ID
```

#### 2. Database Connection Issues
- Verify security group rules
- Check database endpoint
- Validate credentials in Secrets Manager

#### 3. Load Balancer Health Check Failures
- Verify application health endpoint
- Check security group rules
- Ensure application is listening on port 3001

### Debug Commands

```bash
# Check ECS service status
aws ecs describe-services \
  --cluster production-fluenccy-cluster \
  --services production-fluenccy-service

# Check task definition
aws ecs describe-task-definition \
  --task-definition production-fluenccy-app

# Check load balancer health
aws elbv2 describe-target-health \
  --target-group-arn YOUR_TARGET_GROUP_ARN
```

## Cost Optimization

### Fargate Spot
- Use Fargate Spot for non-critical workloads
- Can reduce costs by up to 70%

### Right-sizing
- Monitor CPU and memory usage
- Adjust task CPU/memory allocation
- Use CloudWatch metrics for optimization

### Database Optimization
- Use RDS Reserved Instances for production
- Enable RDS Performance Insights
- Regular database maintenance

## Backup and Recovery

### Database Backups
- Automated daily backups
- 7-day retention period
- Point-in-time recovery

### Application Backups
- ECR image versioning
- Infrastructure as Code (CloudFormation)
- Configuration in version control

## Maintenance

### Regular Tasks
1. Update Docker images monthly
2. Review and rotate secrets
3. Monitor costs and usage
4. Update security patches
5. Review and update IAM policies

### Updates
```bash
# Update application
./deploy.sh production

# Update infrastructure
aws cloudformation deploy \
  --template-file cloudformation-template.yaml \
  --stack-name production-fluenccy-infrastructure
```

## Support

For issues and questions:
1. Check CloudWatch logs
2. Review ECS service events
3. Verify security group rules
4. Check IAM permissions
5. Contact AWS support if needed

## Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS Fargate Documentation](https://docs.aws.amazon.com/fargate/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
