# PowerShell Deployment Script for Focus Zone
# Usage: .\deploy.ps1

Write-Host "🚀 Starting Focus Zone Deployment..." -ForegroundColor Green

# Configuration
# Application settings
$APP_NAME = "focus-zone"
$PORT     = "4001"

# Deployment mode selection: SSH or Local
$deployMode = Read-Host "Choose deployment mode ('ssh' or 'local') [ssh]"
if ([string]::IsNullOrWhiteSpace($deployMode)) { $deployMode = 'ssh' }
if ($deployMode -eq 'local') {
    Write-Host "⚙️  Local deployment selected" -ForegroundColor Yellow
    try {
        Write-Host "📦 Building and deploying locally..." -ForegroundColor Blue
        docker compose down 2>$null
        docker compose up -d --build
        Write-Host "✅ Local deployment completed! Application running on http://localhost:$PORT" -ForegroundColor Green
        exit 0
    } catch {
        Write-Host "❌ Local deployment failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
# SSH branch
} else {
    $SERVER_IP = Read-Host "Enter SSH server IP or hostname"
    $SERVER_USER = Read-Host "Enter SSH username"
}

# Remote deployment path
$REMOTE_PATH = "/home/$SERVER_USER/focus-zone"

try {
    Write-Host "📦 Building Docker image locally..." -ForegroundColor Blue
    docker build -t "${APP_NAME}:latest" .
    if ($LASTEXITCODE -ne 0) { throw "Docker build failed" }

    Write-Host "💾 Saving Docker image to tar file..." -ForegroundColor Blue
    docker save "${APP_NAME}:latest" -o "${APP_NAME}.tar"
    if ($LASTEXITCODE -ne 0) { throw "Docker save failed" }

    Write-Host "📤 Copying files to server ${SERVER_IP}..." -ForegroundColor Blue
    scp "${APP_NAME}.tar" "${SERVER_USER}@${SERVER_IP}:/tmp/"
    scp "docker-compose.yml" "${SERVER_USER}@${SERVER_IP}:/tmp/"
    
    # Copy .env.example if it exists
    if (Test-Path ".env.example") {
        scp ".env.example" "${SERVER_USER}@${SERVER_IP}:/tmp/" 2>$null
    } else {
        Write-Host "⚠️  No .env.example found" -ForegroundColor Yellow
    }

    Write-Host "🚀 Deploying on server..." -ForegroundColor Blue
    
    # Create a properly formatted Unix script
    $unixScript = @'
# Create application directory
echo "📁 Creating application directory..."
mkdir -p /home/dialtone/focus-zone
cd /home/dialtone/focus-zone

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose down 2>/dev/null || true

# Load new image
echo "📥 Loading new Docker image..."
docker load < /tmp/focus-zone.tar

# Copy compose file
echo "📋 Setting up configuration..."
cp /tmp/docker-compose.yml .

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔐 Creating .env file..."
    if [ -f /tmp/.env.example ]; then
        cp /tmp/.env.example .env
        JWT_SECRET=$(openssl rand -base64 32)
        sed -i "s/your-secret-key-change-in-production/${JWT_SECRET}/" .env
        echo "✅ Generated random JWT_SECRET"
    else
        echo "JWT_SECRET=$(openssl rand -base64 32)" > .env
    fi
fi

# Create data directory
mkdir -p data
chmod 777 data

# Start services
echo "🚀 Starting containers..."
docker compose up -d

# Wait for container to be healthy
echo "⏳ Waiting for application to start..."
sleep 5

# Clean up
echo "🧹 Cleaning up temporary files..."
rm /tmp/focus-zone.tar
rm /tmp/docker-compose.yml
rm /tmp/.env.example 2>/dev/null || true

echo ""
echo "✅ Focus Zone deployed successfully!"
echo "🌐 Application running on port 4001"
echo ""
docker compose ps
echo ""
echo "📊 Recent logs:"
docker compose logs --tail=20
'@

    # Save script to temp file with Unix line endings
    $tempScript = "$env:TEMP\deploy_script.sh"
    $unixScript -replace "`r`n", "`n" | Out-File -FilePath $tempScript -Encoding ASCII -NoNewline
    
    # Copy and execute the script
    scp $tempScript "${SERVER_USER}@${SERVER_IP}:/tmp/deploy_script.sh"
    ssh "${SERVER_USER}@${SERVER_IP}" "chmod +x /tmp/deploy_script.sh && /tmp/deploy_script.sh && rm /tmp/deploy_script.sh"
    if ($LASTEXITCODE -ne 0) { throw "SSH deployment failed" }

    Write-Host "🧹 Cleaning up local files..." -ForegroundColor Blue
    Remove-Item "${APP_NAME}.tar" -Force -ErrorAction SilentlyContinue
    Remove-Item "$env:TEMP\deploy_script.sh" -Force -ErrorAction SilentlyContinue

    Write-Host ""
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "🌐 Your Focus Zone is now running!" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "📍 Local Network: http://${SERVER_IP}:${PORT}" -ForegroundColor Yellow
    Write-Host "🔗 To access externally, set up:" -ForegroundColor White
    Write-Host "   • Port forwarding on your router" -ForegroundColor White
    Write-Host "   • Cloudflare tunnel" -ForegroundColor White
    Write-Host "   • Nginx reverse proxy with SSL" -ForegroundColor White
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Useful commands:" -ForegroundColor White
    Write-Host "  ssh ${SERVER_USER}@${SERVER_IP} 'cd ${REMOTE_PATH} && docker compose logs -f'" -ForegroundColor Gray
    Write-Host "  ssh ${SERVER_USER}@${SERVER_IP} 'cd ${REMOTE_PATH} && docker compose restart'" -ForegroundColor Gray
    Write-Host "  ssh ${SERVER_USER}@${SERVER_IP} 'cd ${REMOTE_PATH} && docker compose down'" -ForegroundColor Gray
    Write-Host ""

} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
