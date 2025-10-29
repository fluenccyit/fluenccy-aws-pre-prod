@echo off
REM Fluenccy Application Deployment Script for Windows (Batch File Wrapper)
REM This script provides a simple interface to the PowerShell deployment script

setlocal enabledelayedexpansion

REM Configuration
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

set AWS_REGION=%2
if "%AWS_REGION%"=="" set AWS_REGION=us-east-1

echo.
echo ========================================
echo Fluenccy Application Deployment
echo ========================================
echo Environment: %ENVIRONMENT%
echo AWS Region: %AWS_REGION%
echo.

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if errorlevel 1 (
    echo ERROR: PowerShell is not available or not properly configured.
    echo Please ensure PowerShell is installed and accessible.
    pause
    exit /b 1
)

REM Check if AWS CLI is available
aws --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: AWS CLI is not available or not properly configured.
    echo Please install AWS CLI v2 and configure your credentials.
    echo Download from: https://aws.amazon.com/cli/
    pause
    exit /b 1
)

REM Check if Docker is available
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not available or not properly configured.
    echo Please install Docker Desktop for Windows.
    echo Download from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

REM Check if required files exist
if not exist "cloudformation-template.yaml" (
    echo ERROR: cloudformation-template.yaml not found.
    echo Please ensure you are running this script from the project root directory.
    pause
    exit /b 1
)

if not exist "deploy-with-parameters.ps1" (
    echo ERROR: deploy-with-parameters.ps1 not found.
    echo Please ensure the PowerShell deployment script is present.
    pause
    exit /b 1
)

echo All prerequisites check passed!
echo.
echo Starting deployment...
echo.

REM Run the PowerShell deployment script
powershell -ExecutionPolicy Bypass -File "deploy-with-parameters.ps1" -Environment "%ENVIRONMENT%" -AWSRegion "%AWS_REGION%"

if errorlevel 1 (
    echo.
    echo ========================================
    echo DEPLOYMENT FAILED
    echo ========================================
    echo Please check the error messages above and try again.
    echo.
    echo Common issues:
    echo - AWS credentials not configured: run 'aws configure'
    echo - Docker not running: start Docker Desktop
    echo - PowerShell execution policy: run as administrator and set execution policy
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo ========================================
    echo DEPLOYMENT SUCCESSFUL
    echo ========================================
    echo Your Fluenccy application has been deployed successfully!
    echo.
    echo Next steps:
    echo 1. Monitor your application using AWS Console
    echo 2. Set up monitoring and alerting
    echo 3. Configure auto-scaling if needed
    echo.
    pause
)

endlocal
