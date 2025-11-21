@echo off
REM Focus Zone Deployment Script for Docker (Windows)
REM Usage: deploy.bat [server-ip] [server-user]

echo.
echo 🚀 Starting Focus Zone Deployment...
echo.

REM Configuration - Update these defaults or pass as arguments
set SERVER_IP=%1
set SERVER_USER=%2
set APP_NAME=focus-zone
set REMOTE_PATH=/opt/focus-zone
set PORT=3000

if "%SERVER_IP%"=="" set SERVER_IP=10.5.1.17
if "%SERVER_USER%"=="" set SERVER_USER=dialtone

echo 📦 Building Docker image locally...
docker build -t %APP_NAME%:latest .
if errorlevel 1 (
    echo ❌ Docker build failed!
    exit /b 1
)

echo.
echo 💾 Saving Docker image to tar file...
docker save %APP_NAME%:latest > %APP_NAME%.tar
if errorlevel 1 (
    echo ❌ Failed to save Docker image!
    exit /b 1
)

echo.
echo 📤 Copying files to server %SERVER_IP%...
scp %APP_NAME%.tar %SERVER_USER%@%SERVER_IP%:/tmp/
scp docker-compose.yml %SERVER_USER%@%SERVER_IP%:/tmp/
scp .env.example %SERVER_USER%@%SERVER_IP%:/tmp/ 2>nul || echo ⚠️  No .env.example found

echo.
echo 🚀 Deploying on server...
ssh %SERVER_USER%@%SERVER_IP% "bash -s" < deploy-remote.sh

echo.
echo 🧹 Cleaning up local files...
del %APP_NAME%.tar

echo.
echo ✅ Deployment completed successfully!
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🌐 Your Focus Zone is now running!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📍 Local Network: http://%SERVER_IP%:%PORT%
echo 🔗 To access externally, set up:
echo    • Port forwarding on your router
echo    • Cloudflare tunnel
echo    • Nginx reverse proxy with SSL
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

pause
