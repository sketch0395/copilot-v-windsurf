#!/bin/bash

# Focus Zone Deployment Script for Docker
# Usage: ./deploy.sh [server-ip] [server-user]

set -e

echo "🚀 Starting Focus Zone Deployment..."

# Configuration - Update these defaults or pass as arguments
SERVER_IP="${1:-10.5.1.17}"
SERVER_USER="${2:-dialtone}"
APP_NAME="focus-zone"
REMOTE_PATH="/home/${SERVER_USER}/focus-zone"
PORT="4001"

echo "📦 Building Docker image locally..."
docker build -t ${APP_NAME}:latest .

echo "💾 Saving Docker image to tar file..."
docker save ${APP_NAME}:latest > ${APP_NAME}.tar

echo "📤 Copying files to server ${SERVER_IP}..."
scp ${APP_NAME}.tar ${SERVER_USER}@${SERVER_IP}:/tmp/
scp docker-compose.yml ${SERVER_USER}@${SERVER_IP}:/tmp/
scp .env.example ${SERVER_USER}@${SERVER_IP}:/tmp/ 2>/dev/null || echo "⚠️  No .env.example found"

echo "🚀 Deploying on server..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    # Configuration from parent shell
    REMOTE_PATH="/home/dialtone/focus-zone"
    APP_NAME="focus-zone"
    PORT="4001"

    # Create application directory
    echo "📁 Creating application directory..."
    mkdir -p ${REMOTE_PATH}
    cd ${REMOTE_PATH}

    # Stop existing containers
    echo "🛑 Stopping existing containers..."
    docker compose down 2>/dev/null || true

    # Load new image
    echo "📥 Loading new Docker image..."
    docker load < /tmp/${APP_NAME}.tar

    # Copy compose file
    echo "📋 Setting up configuration..."
    cp /tmp/docker-compose.yml .

    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        echo "🔐 Creating .env file..."
        if [ -f /tmp/.env.example ]; then
            cp /tmp/.env.example .env
            # Generate a random JWT secret
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
    rm /tmp/${APP_NAME}.tar
    rm /tmp/docker-compose.yml
    rm /tmp/.env.example 2>/dev/null || true

    echo ""
    echo "✅ Focus Zone deployed successfully!"
    echo "🌐 Application running on port ${PORT}"
    echo ""
    docker compose ps
    echo ""
    echo "📊 Recent logs:"
    docker compose logs --tail=20
ENDSSH

echo ""
echo "🧹 Cleaning up local files..."
rm ${APP_NAME}.tar

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Your Focus Zone is now running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 Local Network: http://${SERVER_IP}:${PORT}"
echo "🔗 To access externally, set up:"
echo "   • Port forwarding on your router"
echo "   • Cloudflare tunnel"
echo "   • Nginx reverse proxy with SSL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Useful commands:"
echo "  ssh ${SERVER_USER}@${SERVER_IP} 'cd ${REMOTE_PATH} && docker compose logs -f'"
echo "  ssh ${SERVER_USER}@${SERVER_IP} 'cd ${REMOTE_PATH} && docker compose restart'"
echo "  ssh ${SERVER_USER}@${SERVER_IP} 'cd ${REMOTE_PATH} && docker compose down'"
echo ""
