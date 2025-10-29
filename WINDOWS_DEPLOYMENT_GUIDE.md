# Windows Deployment Guide for Fluenccy Application

This guide provides step-by-step instructions for deploying the Fluenccy application on Windows using PowerShell and AWS CLI.

## Prerequisites

### Required Software
1. **PowerShell 5.1+** (Windows 10/11 comes with this)
2. **AWS CLI v2** - Download from [AWS CLI Downloads](https://aws.amazon.com/cli/)
3. **Docker Desktop for Windows** - Download from [Docker Desktop](https://www.docker.com/products/docker-desktop/)
4. **Git for Windows** - Download from [Git for Windows](https://git-scm.com/download/win)

### Installation Steps

#### 1. Install AWS CLI v2
```powershell
# Download and run the AWS CLI v2 installer
# Or use winget (Windows Package Manager)
winget install Amazon.AWSCLI
```

#### 2. Install Docker Desktop
```powershell
# Download from Docker website or use winget
winget install Docker.DockerDesktop
```

#### 3. Configure AWS CLI
```powershell
# Configure AWS credentials
aws configure
# Enter your Access Key ID, Secret Access Key, Region, and Output format
```

## Deployment Options

### Option 1: Automated PowerShell Script (Recommended)

#### Quick Start
```powershell
# Run the automated deployment script
.\deploy-with-parameters.ps1 -Environment production

# For staging environment
.\deploy-with-parameters.ps1 -Environment staging
```

#### What the Script Does
1. **Generates secure passwords** for database and Redis
2. **Creates CloudFormation parameters file**
3. **Deploys infrastructure** (VPC, RDS, ElastiCache, ECS, etc.)
4. **Creates AWS Secrets Manager entries**
5. **Builds and pushes Docker image** to ECR
6. **Deploys ECS service** with Fargate
7. **Waits for deployment** to complete
8. **Provides application URL**

### Option 2: Manual Step-by-Step Deployment

#### Step 1: Create Parameters File
```powershell
# Copy the template
Copy-Item "cloudformation-parameters.json.template" "cloudformation-parameters.json"

# Edit the parameters file with your values
notepad cloudformation-parameters.json
```

#### Step 2: Deploy Infrastructure
```powershell
aws cloudformation deploy `
  --template-file cloudformation-template.yaml `
  --stack-name production-fluenccy-infrastructure `
  --parameter-overrides file://cloudformation-parameters.json `
  --capabilities CAPABILITY_IAM
```

#### Step 3: Build and Push Docker Image
```powershell
# Get AWS Account ID
$AWSAccountId = aws sts get-caller-identity --query Account --output text

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWSAccountId.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t production-fluenccy-app .

# Tag and push
docker tag production-fluenccy-app:latest $AWSAccountId.dkr.ecr.us-east-1.amazonaws.com/production-fluenccy-app:latest
docker push $AWSAccountId.dkr.ecr.us-east-1.amazonaws.com/production-fluenccy-app:latest
```

#### Step 4: Deploy ECS Service
```powershell
# Register task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# Create ECS service
aws ecs create-service --cli-input-json file://ecs-service-definition.json
```

## PowerShell Script Features

### Automatic Password Generation
The script automatically generates secure passwords using .NET cryptography:
```powershell
function Generate-Password {
    $bytes = New-Object Byte[] 32
    [System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
    $password = [System.Convert]::ToBase64String($bytes) -replace '[=+/]', '' | Select-Object -First 25
    return $password
}
```

### Error Handling
- Comprehensive try-catch blocks
- Detailed error messages
- Automatic cleanup on failure

### Logging
- Color-coded output (Info, Success, Warning, Error)
- Progress indicators
- Detailed status messages

## Windows-Specific Considerations

### PowerShell Execution Policy
If you get execution policy errors, run:
```powershell
# Set execution policy for current user
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or for the entire system (requires admin)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

### Docker Desktop Requirements
- **WSL 2** must be enabled
- **Hyper-V** must be enabled (for older Windows versions)
- **Virtualization** must be enabled in BIOS

### File Path Issues
The script handles Windows file paths correctly:
```powershell
# Uses forward slashes for AWS CLI compatibility
$taskDefinitionContent = Get-Content "ecs-task-definition.json" -Raw
```

## Environment-Specific Deployments

### Development Environment
```powershell
.\deploy-with-parameters.ps1 -Environment development
```
- Uses smaller instance types
- Single ECS task
- Minimal resources

### Staging Environment
```powershell
.\deploy-with-parameters.ps1 -Environment staging
```
- Medium instance types
- 2 ECS tasks
- Production-like setup

### Production Environment
```powershell
.\deploy-with-parameters.ps1 -Environment production
```
- Larger instance types
- Multiple ECS tasks
- High availability setup

## Customization

### Custom Parameters
You can modify the script to use custom values:

```powershell
# Edit the Create-ParametersFile function
$parameters = @(
    @{
        ParameterKey = "DatabaseInstanceClass"
        ParameterValue = "db.t3.small"  # Change from db.t3.micro
        UsePreviousValue = $false
    },
    @{
        ParameterKey = "ECSCPU"
        ParameterValue = "2048"  # Change from 1024
        UsePreviousValue = $false
    }
    # ... other parameters
)
```

### Custom AWS Region
```powershell
# Set environment variable
$env:AWS_REGION = "eu-west-1"

# Or pass as parameter
.\deploy-with-parameters.ps1 -Environment production -AWSRegion eu-west-1
```

## Troubleshooting

### Common Issues

#### 1. PowerShell Execution Policy
```powershell
# Error: "execution of scripts is disabled on this system"
# Solution:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 2. Docker Not Running
```powershell
# Error: "Cannot connect to the Docker daemon"
# Solution: Start Docker Desktop and wait for it to be ready
```

#### 3. AWS Credentials Not Configured
```powershell
# Error: "Unable to locate credentials"
# Solution:
aws configure
```

#### 4. Permission Denied
```powershell
# Error: "Access Denied"
# Solution: Ensure your AWS user has the required permissions
```

### Debug Commands

```powershell
# Check AWS configuration
aws sts get-caller-identity

# Check Docker status
docker --version
docker info

# Check PowerShell version
$PSVersionTable.PSVersion

# Check if required files exist
Test-Path "cloudformation-template.yaml"
Test-Path "ecs-task-definition.json"
Test-Path "ecs-service-definition.json"
```

### Log Analysis

```powershell
# View CloudFormation stack events
aws cloudformation describe-stack-events --stack-name production-fluenccy-infrastructure

# View ECS service events
aws ecs describe-services --cluster production-fluenccy-cluster --services production-fluenccy-service

# View application logs
aws logs get-log-events --log-group-name /ecs/production-fluenccy-app --log-stream-name ecs/fluenccy-app/TASK_ID
```

## Security Best Practices

### Password Management
- Passwords are generated securely using .NET cryptography
- Passwords are stored in AWS Secrets Manager
- No passwords are logged or stored in plain text

### Network Security
- Application runs in private subnets
- Database and Redis in private subnets
- Security groups restrict access
- SSL/TLS encryption in transit

### IAM Permissions
The script requires the following AWS permissions:
- CloudFormation Full Access
- ECS Full Access
- ECR Full Access
- RDS Full Access
- ElastiCache Full Access
- Secrets Manager Full Access
- VPC Full Access
- IAM Full Access

## Monitoring and Maintenance

### CloudWatch Integration
- Application logs: `/ecs/production-fluenccy-app`
- Infrastructure monitoring
- Performance metrics

### Health Checks
- Application health endpoint: `/api/health`
- Load balancer health checks
- ECS service health monitoring

### Scaling
```powershell
# Update desired count
aws ecs update-service --cluster production-fluenccy-cluster --service production-fluenccy-service --desired-count 5

# Set up auto-scaling
aws application-autoscaling register-scalable-target --service-namespace ecs --resource-id service/production-fluenccy-cluster/production-fluenccy-service --scalable-dimension ecs:service:DesiredCount --min-capacity 2 --max-capacity 10
```

## Cleanup

### Remove Infrastructure
```powershell
# Delete CloudFormation stack (this will remove all resources)
aws cloudformation delete-stack --stack-name production-fluenccy-infrastructure

# Wait for deletion to complete
aws cloudformation wait stack-delete-complete --stack-name production-fluenccy-infrastructure
```

### Remove Docker Images
```powershell
# Remove local Docker images
docker rmi production-fluenccy-app
docker rmi YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/production-fluenccy-app:latest
```

## Support

For issues and questions:
1. Check PowerShell execution policy
2. Verify AWS credentials and permissions
3. Ensure Docker Desktop is running
4. Check CloudWatch logs for application issues
5. Review ECS service events
6. Contact AWS support if needed

## Additional Resources

- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)
- [Docker Desktop for Windows](https://docs.docker.com/desktop/windows/)
- [PowerShell Documentation](https://docs.microsoft.com/en-us/powershell/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS Fargate Documentation](https://docs.aws.amazon.com/fargate/)
