# Fluenccy Application Deployment Script with Parameter Support (PowerShell)
# This script allows you to pass parameters when deploying the CloudFormation stack

param(
    [string]$Environment = "production",
    [string]$AWSRegion = "us-east-1"
)

# Configuration
$StackName = "${Environment}-fluenccy-infrastructure"

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

# Function to generate secure passwords
function Generate-Password {
    $bytes = New-Object Byte[] 32
    [System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
    $password = [System.Convert]::ToBase64String($bytes) -replace '[=+/]', '' | Select-Object -First 25
    return $password
}

# Function to create parameters file
function Create-ParametersFile {
    Log-Info "Creating parameters file..."
    
    # Generate secure passwords
    $DBPassword = Generate-Password
    $RedisPassword = Generate-Password
    
    $parameters = @(
        @{
            ParameterKey = "Environment"
            ParameterValue = $Environment
            UsePreviousValue = $false
        },
        @{
            ParameterKey = "VpcCidr"
            ParameterValue = "10.0.0.0/16"
            UsePreviousValue = $false
        },
        @{
            ParameterKey = "PublicSubnet1Cidr"
            ParameterValue = "10.0.1.0/24"
            UsePreviousValue = $false
        },
        @{
            ParameterKey = "PublicSubnet2Cidr"
            ParameterValue = "10.0.2.0/24"
            UsePreviousValue = $false
        },
        @{
            ParameterKey = "PrivateSubnet1Cidr"
            ParameterValue = "10.0.3.0/24"
            UsePreviousValue = $false
        },
        @{
            ParameterKey = "PrivateSubnet2Cidr"
            ParameterValue = "10.0.4.0/24"
            UsePreviousValue = $false
        },
        @{
            ParameterKey = "DatabasePassword"
            ParameterValue = $DBPassword
            UsePreviousValue = $false
        },
        @{
            ParameterKey = "RedisPassword"
            ParameterValue = $RedisPassword
            UsePreviousValue = $false
        },
        @{
            ParameterKey = "DatabaseInstanceClass"
            ParameterValue = "db.t3.micro"
            UsePreviousValue = $false
        },
        @{
            ParameterKey = "RedisNodeType"
            ParameterValue = "cache.t3.micro"
            UsePreviousValue = $false
        },
        @{
            ParameterKey = "DatabaseAllocatedStorage"
            ParameterValue = "20"
            UsePreviousValue = $false
        },
        @{
            ParameterKey = "DatabaseBackupRetentionPeriod"
            ParameterValue = "7"
            UsePreviousValue = $false
        },
        @{
            ParameterKey = "ECSDesiredCount"
            ParameterValue = "2"
            UsePreviousValue = $false
        },
        @{
            ParameterKey = "ECSCPU"
            ParameterValue = "1024"
            UsePreviousValue = $false
        },
        @{
            ParameterKey = "ECSMemory"
            ParameterValue = "2048"
            UsePreviousValue = $false
        }
    )
    
    $parameters | ConvertTo-Json -Depth 3 | Out-File -FilePath "cloudformation-parameters.json" -Encoding UTF8
    
    Log-Success "Parameters file created with secure passwords"
    Log-Warning "Database Password: $DBPassword"
    Log-Warning "Redis Password: $RedisPassword"
    Log-Warning "Please save these passwords securely!"
    
    # Store passwords for later use
    $script:DBPassword = $DBPassword
    $script:RedisPassword = $RedisPassword
}

# Function to deploy CloudFormation stack
function Deploy-Stack {
    Log-Info "Deploying CloudFormation stack: $StackName"
    
    try {
        aws cloudformation deploy `
            --template-file cloudformation-template.yaml `
            --stack-name $StackName `
            --parameter-overrides file://cloudformation-parameters.json `
            --capabilities CAPABILITY_IAM `
            --region $AWSRegion
        
        Log-Success "CloudFormation stack deployed successfully"
    }
    catch {
        Log-Error "Failed to deploy CloudFormation stack: $_"
        throw
    }
}

# Function to get stack outputs
function Get-Outputs {
    Log-Info "Getting stack outputs..."
    
    try {
        aws cloudformation describe-stacks `
            --stack-name $StackName `
            --region $AWSRegion `
            --query 'Stacks[0].Outputs' `
            --output table
    }
    catch {
        Log-Error "Failed to get stack outputs: $_"
        throw
    }
}

# Function to create secrets in AWS Secrets Manager
function Create-Secrets {
    Log-Info "Creating secrets in AWS Secrets Manager..."
    
    try {
        # Get database endpoint
        $DBEndpoint = aws cloudformation describe-stacks `
            --stack-name $StackName `
            --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' `
            --output text `
            --region $AWSRegion
        
        # Get Redis endpoint
        $RedisEndpoint = aws cloudformation describe-stacks `
            --stack-name $StackName `
            --query 'Stacks[0].Outputs[?OutputKey==`RedisEndpoint`].OutputValue' `
            --output text `
            --region $AWSRegion
        
        # Create database secret
        $dbSecretString = @{
            host = $DBEndpoint
            port = "5432"
            database = "fluenccy"
            username = "postgres"
            password = $script:DBPassword
        } | ConvertTo-Json -Compress
        
        try {
            aws secretsmanager create-secret `
                --name "fluenccy/database" `
                --description "Database credentials for Fluenccy application" `
                --secret-string $dbSecretString `
                --region $AWSRegion
            Log-Success "Database secret created"
        }
        catch {
            Log-Warning "Database secret may already exist: $_"
        }
        
        # Create Redis secret
        $redisSecretString = @{
            host = $RedisEndpoint
            port = "6379"
            password = $script:RedisPassword
        } | ConvertTo-Json -Compress
        
        try {
            aws secretsmanager create-secret `
                --name "fluenccy/redis" `
                --description "Redis credentials for Fluenccy application" `
                --secret-string $redisSecretString `
                --region $AWSRegion
            Log-Success "Redis secret created"
        }
        catch {
            Log-Warning "Redis secret may already exist: $_"
        }
        
        Log-Success "Secrets created in AWS Secrets Manager"
    }
    catch {
        Log-Error "Failed to create secrets: $_"
        throw
    }
}

# Function to update ECS task definition with parameters
function Update-TaskDefinition {
    Log-Info "Updating ECS task definition with parameters..."
    
    try {
        # Read parameters from JSON file
        $parametersJson = Get-Content "cloudformation-parameters.json" | ConvertFrom-Json
        
        $ECS_CPU = ($parametersJson | Where-Object { $_.ParameterKey -eq "ECSCPU" }).ParameterValue
        $ECS_MEMORY = ($parametersJson | Where-Object { $_.ParameterKey -eq "ECSMemory" }).ParameterValue
        $ECS_DESIRED_COUNT = ($parametersJson | Where-Object { $_.ParameterKey -eq "ECSDesiredCount" }).ParameterValue
        
        # Get AWS Account ID
        $AWSAccountId = aws sts get-caller-identity --query Account --output text
        
        # Read task definition template
        $taskDefinitionContent = Get-Content "ecs-task-definition.json" -Raw
        
        # Replace placeholders
        $taskDefinitionContent = $taskDefinitionContent -replace "{{ECS_CPU}}", $ECS_CPU
        $taskDefinitionContent = $taskDefinitionContent -replace "{{ECS_MEMORY}}", $ECS_MEMORY
        $taskDefinitionContent = $taskDefinitionContent -replace "YOUR_ACCOUNT_ID", $AWSAccountId
        $taskDefinitionContent = $taskDefinitionContent -replace "YOUR_REGION", $AWSRegion
        
        # Write updated task definition
        $taskDefinitionContent | Out-File -FilePath "ecs-task-definition-updated.json" -Encoding UTF8
        
        # Read service definition template
        $serviceDefinitionContent = Get-Content "ecs-service-definition.json" -Raw
        
        # Replace placeholders
        $serviceDefinitionContent = $serviceDefinitionContent -replace "{{ECS_DESIRED_COUNT}}", $ECS_DESIRED_COUNT
        $serviceDefinitionContent = $serviceDefinitionContent -replace "fluenccy-cluster", "${Environment}-fluenccy-cluster"
        $serviceDefinitionContent = $serviceDefinitionContent -replace "fluenccy-service", "${Environment}-fluenccy-service"
        $serviceDefinitionContent = $serviceDefinitionContent -replace "fluenccy-app", "${Environment}-fluenccy-app"
        
        # Write updated service definition
        $serviceDefinitionContent | Out-File -FilePath "ecs-service-definition-updated.json" -Encoding UTF8
        
        Log-Success "Task and service definitions updated with parameters"
    }
    catch {
        Log-Error "Failed to update task definition: $_"
        throw
    }
}

# Function to build and push Docker image
function Build-AndPush-Image {
    Log-Info "Building and pushing Docker image..."
    
    try {
        # Get AWS Account ID
        $AWSAccountId = aws sts get-caller-identity --query Account --output text
        $ECRRepository = "${AWSAccountId}.dkr.ecr.${AWSRegion}.amazonaws.com/${Environment}-fluenccy-app"
        
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
    catch {
        Log-Error "Failed to build and push Docker image: $_"
        throw
    }
}

# Function to deploy ECS service
function Deploy-ECSService {
    Log-Info "Deploying ECS service..."
    
    try {
        # Register task definition
        Log-Info "Registering ECS task definition..."
        aws ecs register-task-definition --cli-input-json file://ecs-task-definition-updated.json --region $AWSRegion
        
        # Get cluster name
        $ClusterName = "${Environment}-fluenccy-cluster"
        $ServiceName = "${Environment}-fluenccy-service"
        
        # Check if service exists
        try {
            $serviceStatus = aws ecs describe-services --cluster $ClusterName --services $ServiceName --region $AWSRegion --query 'services[0].status' --output text
            if ($serviceStatus -eq "ACTIVE") {
                Log-Info "Updating existing ECS service..."
                aws ecs update-service --cluster $ClusterName --service $ServiceName --task-definition "${Environment}-fluenccy-app" --region $AWSRegion
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
                --task-definition "${Environment}-fluenccy-app" `
                --desired-count 2 `
                --launch-type FARGATE `
                --platform-version LATEST `
                --network-configuration "awsvpcConfiguration={subnets=[$($subnets -replace '\s+',',')],securityGroups=[$securityGroups],assignPublicIp=ENABLED}" `
                --load-balancers "targetGroupArn=$targetGroupArn,containerName=fluenccy-app,containerPort=3001" `
                --region $AWSRegion
        }
        
        Log-Success "ECS service deployed successfully"
    }
    catch {
        Log-Error "Failed to deploy ECS service: $_"
        throw
    }
}

# Function to wait for deployment to complete
function Wait-ForDeployment {
    Log-Info "Waiting for deployment to complete..."
    
    try {
        $ClusterName = "${Environment}-fluenccy-cluster"
        $ServiceName = "${Environment}-fluenccy-service"
        
        aws ecs wait services-stable --cluster $ClusterName --services $ServiceName --region $AWSRegion
        
        Log-Success "Deployment completed successfully"
    }
    catch {
        Log-Error "Failed to wait for deployment: $_"
        throw
    }
}

# Function to get application URL
function Get-ApplicationUrl {
    Log-Info "Getting application URL..."
    
    try {
        $ALBDns = aws cloudformation describe-stacks `
            --stack-name $StackName `
            --query 'Stacks[0].Outputs[?OutputKey==`ApplicationLoadBalancer`].OutputValue' `
            --output text `
            --region $AWSRegion
        
        Log-Success "Application is available at: http://$ALBDns"
    }
    catch {
        Log-Error "Failed to get application URL: $_"
        throw
    }
}

# Cleanup function
function Cleanup {
    Log-Info "Cleaning up temporary files..."
    
    $filesToRemove = @(
        "cloudformation-parameters.json",
        "ecs-task-definition-updated.json",
        "ecs-service-definition-updated.json"
    )
    
    foreach ($file in $filesToRemove) {
        if (Test-Path $file) {
            Remove-Item $file -Force
        }
    }
}

# Main function
function Main {
    Log-Info "Starting deployment with parameters for environment: $Environment"
    
    try {
        # Execute deployment steps
        Create-ParametersFile
        Deploy-Stack
        Create-Secrets
        Update-TaskDefinition
        Build-AndPush-Image
        Deploy-ECSService
        Wait-ForDeployment
        Get-ApplicationUrl
        Get-Outputs
        
        Log-Success "Deployment with parameters completed successfully!"
        Log-Info "Next steps:"
        Log-Info "1. Your application is now running on ECS Fargate"
        Log-Info "2. Monitor your application using CloudWatch logs"
        Log-Info "3. Set up auto-scaling if needed"
    }
    catch {
        Log-Error "Deployment failed: $_"
        exit 1
    }
    finally {
        Cleanup
    }
}

# Run main function
Main
