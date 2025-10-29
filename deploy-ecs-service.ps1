# PowerShell script to deploy ECS Task Definition and Service
param(
    [Parameter(Mandatory=$true)]
    [string]$StackName,
    
    [Parameter(Mandatory=$true)]
    [string]$ParametersFile,
    
    [string]$Region = "us-east-1",
    
    [switch]$CreateStack,
    
    [switch]$UpdateStack,
    
    [switch]$DeleteStack,
    
    [switch]$DryRun
)

# Validate parameters
if (-not (Test-Path $ParametersFile)) {
    Write-Error "Parameters file not found: $ParametersFile"
    exit 1
}

# AWS CLI commands
$awsCmd = "aws"
$templateFile = "ecs-task-service-template.yaml"

# Check if template file exists
if (-not (Test-Path $templateFile)) {
    Write-Error "Template file not found: $templateFile"
    exit 1
}

# Validate CloudFormation template
Write-Host "Validating CloudFormation template..." -ForegroundColor Yellow
$validateCmd = "$awsCmd cloudformation validate-template --template-body file://$templateFile --region $Region"
if ($DryRun) {
    Write-Host "DRY RUN: $validateCmd" -ForegroundColor Cyan
} else {
    Invoke-Expression $validateCmd
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Template validation failed"
        exit 1
    }
    Write-Host "Template validation successful" -ForegroundColor Green
}

# Deploy stack
if ($CreateStack) {
    Write-Host "Creating CloudFormation stack: $StackName" -ForegroundColor Yellow
    $createCmd = "$awsCmd cloudformation create-stack --stack-name $StackName --template-body file://$templateFile --parameters file://$ParametersFile --capabilities CAPABILITY_NAMED_IAM --region $Region"
    
    if ($DryRun) {
        Write-Host "DRY RUN: $createCmd" -ForegroundColor Cyan
    } else {
        Invoke-Expression $createCmd
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Stack creation failed"
            exit 1
        }
        
        Write-Host "Stack creation initiated. Waiting for completion..." -ForegroundColor Yellow
        $waitCmd = "$awsCmd cloudformation wait stack-create-complete --stack-name $StackName --region $Region"
        Invoke-Expression $waitCmd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Stack created successfully!" -ForegroundColor Green
        } else {
            Write-Error "Stack creation failed or timed out"
            exit 1
        }
    }
}
elseif ($UpdateStack) {
    Write-Host "Updating CloudFormation stack: $StackName" -ForegroundColor Yellow
    $updateCmd = "$awsCmd cloudformation update-stack --stack-name $StackName --template-body file://$templateFile --parameters file://$ParametersFile --capabilities CAPABILITY_NAMED_IAM --region $Region"
    
    if ($DryRun) {
        Write-Host "DRY RUN: $updateCmd" -ForegroundColor Cyan
    } else {
        Invoke-Expression $updateCmd
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Stack update failed"
            exit 1
        }
        
        Write-Host "Stack update initiated. Waiting for completion..." -ForegroundColor Yellow
        $waitCmd = "$awsCmd cloudformation wait stack-update-complete --stack-name $StackName --region $Region"
        Invoke-Expression $waitCmd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Stack updated successfully!" -ForegroundColor Green
        } else {
            Write-Error "Stack update failed or timed out"
            exit 1
        }
    }
}
elseif ($DeleteStack) {
    Write-Host "Deleting CloudFormation stack: $StackName" -ForegroundColor Yellow
    $deleteCmd = "$awsCmd cloudformation delete-stack --stack-name $StackName --region $Region"
    
    if ($DryRun) {
        Write-Host "DRY RUN: $deleteCmd" -ForegroundColor Cyan
    } else {
        Invoke-Expression $deleteCmd
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Stack deletion failed"
            exit 1
        }
        
        Write-Host "Stack deletion initiated. Waiting for completion..." -ForegroundColor Yellow
        $waitCmd = "$awsCmd cloudformation wait stack-delete-complete --stack-name $StackName --region $Region"
        Invoke-Expression $waitCmd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Stack deleted successfully!" -ForegroundColor Green
        } else {
            Write-Error "Stack deletion failed or timed out"
            exit 1
        }
    }
}
else {
    Write-Host "No action specified. Use -CreateStack, -UpdateStack, or -DeleteStack" -ForegroundColor Red
    exit 1
}

# Show stack outputs
if (-not $DeleteStack -and -not $DryRun) {
    Write-Host "`nStack Outputs:" -ForegroundColor Yellow
    $outputsCmd = "$awsCmd cloudformation describe-stacks --stack-name $StackName --region $Region --query 'Stacks[0].Outputs' --output table"
    Invoke-Expression $outputsCmd
}

Write-Host "`nDeployment completed!" -ForegroundColor Green
