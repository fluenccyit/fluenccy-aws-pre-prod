# Fluenccy Application Deployment Script for AWS ECS with Fargate (PowerShell)
# This script handles the complete deployment process on Windows

param(
    [string]$Environment = "production",
    [string]$AWSRegion = "us-east-1"
)

# Configuration
$AWSAccountId = (aws sts get-caller-identity --query Account --output text)
$ECRRepository = "${AWSAccountId}.dkr.ecr.${AWSRegion}.amazonaws.com/${Environment}-fluenccy-app"
$ClusterName = "${Environment}-fluenccy-cluster"
$ServiceName = "${Environment}-fluenccy-service"
$TaskDefinitionFamily = "${Environment}-fluenccy-app"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Logging functions
function Log-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Log-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Log-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Log-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Check prerequisites
function Check-Prerequisites {
    Log-Info "Checking prerequisites..."
    
    # Check if AWS CLI is installed
    try {
        aws --version | Out-Null
    }
    catch {
        Log-Error "AWS CLI is not installed. Please install it first."
        exit 1
    }
    
    # Check if Docker is installed
    try {
        docker --version | Out-Null
    }
    catch {
        Log-Error "Docker is not installed. Please install it first."
        exit 1
    }
    
    # Check AWS credentials
    try {
        aws sts get-caller-identity | Out-Null
    }
    catch {
        Log-Error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    }
    
    Log-Success "Prerequisites check passed"
}

# Build and push Docker image
function Build-AndPush-Image {
    Log-Info "Building and pushing Docker image..."
    
    # Login to ECR
    Log-Info "Logging in to Amazon ECR..."
    aws ecr get-login-password --region $AWSRegion | docker login --username AWS --password-stdin $ECRRepository
    
    # Build Docker image
    Log-Info "Building Docker image..."
    docker build -t "${Environment}-fluenccy-app" .
    
    # Tag image for ECR
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    docker tag "${Environment}-fluenccy-app:latest" "${ECRRepository}:latest"
    docker tag "${Environment}-fluenccy-app:latest" "${ECRRepository}:${timestamp}"
    
    # Push image to ECR
    Log-Info "Pushing image to ECR..."
    docker push "${ECRRepository}:latest"
    docker push "${ECRRepository}:${timestamp}"
    
    Log-Success "Docker image built and pushed successfully"
}

# Deploy infrastructure
function Deploy-Infrastructure {
    Log-Info "Deploying infrastructure with CloudFormation..."
    
    # Create parameters file
    $databasePassword = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))
    $redisPassword = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))
    
    $parameters = @(
        @{
            ParameterKey = "Environment"
            ParameterValue = $Environment
        },
        @{
            ParameterKey = "DatabasePassword"
            ParameterValue = $databasePassword
        },
        @{
            ParameterKey = "RedisPassword"
            ParameterValue = $redisPassword
        }
    ) | ConvertTo-Json -Depth 3
    
    $parameters | Out-File -FilePath "cloudformation-parameters.json" -Encoding UTF8
    
    # Deploy CloudFormation stack
    aws cloudformation deploy `
        --template-file cloudformation-template.yaml `
        --stack-name "${Environment}-fluenccy-infrastructure" `
        --parameter-overrides file://cloudformation-parameters.json `
        --capabilities CAPABILITY_IAM `
        --region $AWSRegion
    
    Log-Success "Infrastructure deployed successfully"
}

# Update task definition with new image
function Update-TaskDefinition {
    Log-Info "Updating ECS task definition..."
    
    # Get current task definition
    $taskDefinition = aws ecs describe-task-definition --task-definition $TaskDefinitionFamily --region $AWSRegion | ConvertFrom-Json
    
    # Update image URI in task definition
    $taskDefinition.taskDefinition.containerDefinitions[0].image = "${ECRRepository}:latest"
    
    # Remove unnecessary fields
    $taskDefinition.taskDefinition.PSObject.Properties.Remove('taskDefinitionArn')
    $taskDefinition.taskDefinition.PSObject.Properties.Remove('revision')
    $taskDefinition.taskDefinition.PSObject.Properties.Remove('status')
    $taskDefinition.taskDefinition.PSObject.Properties.Remove('requiresAttributes')
    $taskDefinition.taskDefinition.PSObject.Properties.Remove('placementConstraints')
    $taskDefinition.taskDefinition.PSObject.Properties.Remove('compatibilities')
    $taskDefinition.taskDefinition.PSObject.Properties.Remove('registeredAt')
    $taskDefinition.taskDefinition.PSObject.Properties.Remove('registeredBy')
    
    # Register new task definition
    $taskDefinition.taskDefinition | ConvertTo-Json -Depth 10 | aws ecs register-task-definition --cli-input-json file:///dev/stdin --region $AWSRegion
    
    Log-Success "Task definition updated successfully"
}

# Deploy ECS service
function Deploy-ECSService {
    Log-Info "Deploying ECS service..."
    
    # Check if service exists
    try {
        $serviceStatus = aws ecs describe-services --cluster $ClusterName --services $ServiceName --region $AWSRegion --query 'services[0].status' --output text
        if ($serviceStatus -eq "ACTIVE") {
            Log-Info "Updating existing ECS service..."
            aws ecs update-service --cluster $ClusterName --service $ServiceName --task-definition $TaskDefinitionFamily --region $AWSRegion
        }
    }
    catch {
        Log-Info "Creating new ECS service..."
        # Get subnet and security group IDs
        $subnets = aws ec2 describe-subnets --filters "Name=tag:Name,Values=${Environment}-fluenccy-public-subnet-*" --query 'Subnets[].SubnetId' --output text
        $securityGroups = aws ec2 describe-security-groups --filters "Name=group-name,Values=${Environment}-fluenccy-ecs-sg" --query 'SecurityGroups[0].GroupId' --output text
        $targetGroupArn = aws elbv2 describe-target-groups --names "${Environment}-fluenccy-tg" --query 'TargetGroups[0].TargetGroupArn' --output text
        
        aws ecs create-service `
            --cluster $ClusterName `
            --service-name $ServiceName `
            --task-definition $TaskDefinitionFamily `
            --desired-count 2 `
            --launch-type FARGATE `
            --platform-version LATEST `
            --network-configuration "awsvpcConfiguration={subnets=[$($subnets -replace '\s+',',')],securityGroups=[$securityGroups],assignPublicIp=ENABLED}" `
            --load-balancers "targetGroupArn=$targetGroupArn,containerName=fluenccy-app,containerPort=3001" `
            --region $AWSRegion
    }
    
    Log-Success "ECS service deployed successfully"
}

# Wait for deployment to complete
function Wait-ForDeployment {
    Log-Info "Waiting for deployment to complete..."
    
    aws ecs wait services-stable --cluster $ClusterName --services $ServiceName --region $AWSRegion
    
    Log-Success "Deployment completed successfully"
}

# Get application URL
function Get-ApplicationUrl {
    Log-Info "Getting application URL..."
    
    $albDns = aws cloudformation describe-stacks --stack-name "${Environment}-fluenccy-infrastructure" --query 'Stacks[0].Outputs[?OutputKey==`ApplicationLoadBalancer`].OutputValue' --output text --region $AWSRegion
    
    Log-Success "Application is available at: http://$albDns"
}

# Cleanup function
function Cleanup {
    Log-Info "Cleaning up temporary files..."
    if (Test-Path "cloudformation-parameters.json") {
        Remove-Item "cloudformation-parameters.json"
    }
}

# Main deployment function
function Main {
    Log-Info "Starting deployment for environment: $Environment"
    
    # Execute deployment steps
    Check-Prerequisites
    Deploy-Infrastructure
    Build-AndPush-Image
    Update-TaskDefinition
    Deploy-ECSService
    Wait-ForDeployment
    Get-ApplicationUrl
    
    Log-Success "Deployment completed successfully!"
}

# Run main function
try {
    Main
}
finally {
    Cleanup
}
