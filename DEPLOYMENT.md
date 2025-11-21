# Focus Zone - Deployment Guide

## Quick Start Deployment

### Prerequisites
- Docker installed on your local machine
- SSH access to your server
- Docker installed on your server
- OpenSSH or similar SSH client

### Option 1: Linux/Mac Deployment

1. **Make the script executable:**
```bash
chmod +x deploy.sh
```

2. **Deploy to your server:**
```bash
# Using default server (update in script)
./deploy.sh

# Or specify server details
./deploy.sh YOUR_SERVER_IP YOUR_USERNAME
```

Example:
```bash
./deploy.sh 10.5.1.17 dialtone
```

### Option 2: Windows Deployment

1. **Run the deployment script:**
```batch
deploy.bat
```

Or with custom server:
```batch
deploy.bat YOUR_SERVER_IP YOUR_USERNAME
```

## What the Deployment Does

1. ✅ Builds Docker image locally
2. ✅ Saves image to tar file
3. ✅ Copies to server via SCP
4. ✅ Loads image on server
5. ✅ Generates secure JWT secret
6. ✅ Starts containers with docker-compose
7. ✅ Creates persistent data directory
8. ✅ Cleans up temporary files

## Server Requirements

- **OS:** Linux (Ubuntu 20.04+ recommended)
- **RAM:** 512MB minimum, 1GB recommended
- **Disk:** 2GB minimum
- **Docker:** Version 20.10+
- **Docker Compose:** Version 2.0+

## Post-Deployment

### Access Your Application

**Local Network:**
```
http://YOUR_SERVER_IP:3000
```

### Manage Your Deployment

**View logs:**
```bash
ssh user@server 'cd /opt/focus-zone && docker-compose logs -f'
```

**Restart application:**
```bash
ssh user@server 'cd /opt/focus-zone && docker-compose restart'
```

**Stop application:**
```bash
ssh user@server 'cd /opt/focus-zone && docker-compose down'
```

**View status:**
```bash
ssh user@server 'cd /opt/focus-zone && docker-compose ps'
```

## Making It Accessible from Internet

### Option 1: Cloudflare Tunnel (Recommended)

1. **Install cloudflared on your server:**
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

2. **Authenticate:**
```bash
cloudflared tunnel login
```

3. **Create tunnel:**
```bash
cloudflared tunnel create focus-zone
```

4. **Create config file** (`~/.cloudflared/config.yml`):
```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/YOUR_USER/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: focus.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

5. **Route DNS:**
```bash
cloudflared tunnel route dns focus-zone focus.yourdomain.com
```

6. **Run tunnel:**
```bash
cloudflared tunnel run focus-zone
```

7. **Set up as service:**
```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

### Option 2: Nginx Reverse Proxy with SSL

1. **Install Nginx and Certbot:**
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

2. **Create Nginx config** (`/etc/nginx/sites-available/focus-zone`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/focus-zone /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. **Get SSL certificate:**
```bash
sudo certbot --nginx -d yourdomain.com
```

### Option 3: Port Forwarding

1. Access your router admin panel (usually 192.168.1.1)
2. Find Port Forwarding settings
3. Forward external port 80/443 to internal IP:3000
4. Update firewall to allow incoming traffic

## Updating Your Deployment

Simply run the deployment script again:

```bash
./deploy.sh
```

This will:
- Build new image
- Stop old containers
- Deploy new version
- Preserve your database

## Backup Your Data

**Manual backup:**
```bash
ssh user@server 'cd /opt/focus-zone && tar -czf backup-$(date +%Y%m%d).tar.gz data/'
scp user@server:/opt/focus-zone/backup-*.tar.gz ./backups/
```

**Automated backup script** (on server):
```bash
#!/bin/bash
# /opt/focus-zone/backup.sh
cd /opt/focus-zone
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz data/
find . -name "backup-*.tar.gz" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /opt/focus-zone/backup.sh
```

## Troubleshooting

### Container won't start
```bash
ssh user@server 'cd /opt/focus-zone && docker-compose logs'
```

### Database issues
```bash
ssh user@server 'cd /opt/focus-zone && ls -la data/'
```

### Port already in use
```bash
ssh user@server 'sudo lsof -i :3000'
```

### Reset everything
```bash
ssh user@server 'cd /opt/focus-zone && docker-compose down -v && rm -rf data/'
./deploy.sh
```

## Environment Variables

Create/edit `/opt/focus-zone/.env` on server:

```env
JWT_SECRET=your-secure-random-string
NODE_ENV=production
PORT=3000
```

## Security Recommendations

1. ✅ Change JWT_SECRET (auto-generated during deployment)
2. ✅ Use HTTPS (via Cloudflare or Nginx with SSL)
3. ✅ Regular backups
4. ✅ Keep Docker updated
5. ✅ Monitor logs for suspicious activity
6. ✅ Use strong passwords for user accounts
7. ✅ Consider fail2ban for SSH protection

## Production Checklist

- [ ] Server has Docker installed
- [ ] SSH access configured
- [ ] Firewall allows port 3000 (or your chosen port)
- [ ] Domain name configured (if using)
- [ ] SSL certificate obtained (if using HTTPS)
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Environment variables set

## Cost Estimates

**Server Options:**
- **DigitalOcean Droplet:** $6/month (1GB RAM)
- **AWS Lightsail:** $5/month (1GB RAM)
- **Linode:** $5/month (1GB RAM)
- **Self-hosted:** $0 (use existing hardware)

**Cloudflare Tunnel:** Free

## Support

For issues:
1. Check logs: `docker-compose logs`
2. Verify container status: `docker-compose ps`
3. Review configuration: `cat .env`
4. Test connectivity: `curl http://localhost:3000`

## Migration from Production Database

To switch from SQLite to PostgreSQL for production:

1. Update `docker-compose.yml`:
```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: focus_zone
      POSTGRES_USER: focus_zone
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  focus-zone:
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://focus_zone:your_password@postgres:5432/focus_zone
```

2. Update `src/lib/db.ts` to use PostgreSQL instead of SQLite

3. Redeploy: `./deploy.sh`
