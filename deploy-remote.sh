#!/bin/bash
# Remote deployment script (executed on the server)

REMOTE_PATH="/opt/focus-zone"
APP_NAME="focus-zone"
PORT="3000"

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p ${REMOTE_PATH}
sudo chown ${USER}:${USER} ${REMOTE_PATH}
cd ${REMOTE_PATH}

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

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

# Start services
echo "🚀 Starting containers..."
docker-compose up -d

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
docker-compose ps
echo ""
echo "📊 Recent logs:"
docker-compose logs --tail=20
