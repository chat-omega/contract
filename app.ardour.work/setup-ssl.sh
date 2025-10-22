#!/bin/bash

# SSL Setup Script for app.ardour.work
set -e

echo "🔒 Setting up SSL certificates for app.ardour.work..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run this script as root (sudo ./setup-ssl.sh)${NC}"
  exit 1
fi

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Installing certbot...${NC}"
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Create SSL directory
mkdir -p nginx/ssl

# Domain configuration
DOMAIN="app.ardour.work"
EMAIL="admin@ardour.work"  # Change this to your email

echo -e "${YELLOW}Setting up SSL for domain: ${DOMAIN}${NC}"

# Check if certificates already exist
if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    echo -e "${GREEN}✓ SSL certificates already exist${NC}"
    
    # Copy existing certificates
    cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem nginx/ssl/${DOMAIN}.crt
    cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem nginx/ssl/${DOMAIN}.key
    
    echo -e "${GREEN}✓ Certificates copied to nginx/ssl/${NC}"
else
    echo -e "${YELLOW}Obtaining new SSL certificates...${NC}"
    
    # Stop nginx temporarily for certificate generation
    systemctl stop nginx 2>/dev/null || true
    
    # Obtain SSL certificate using standalone mode
    certbot certonly --standalone \
        --email ${EMAIL} \
        --agree-tos \
        --no-eff-email \
        --domains ${DOMAIN}
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ SSL certificates obtained successfully${NC}"
        
        # Copy certificates to nginx directory
        cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem nginx/ssl/${DOMAIN}.crt
        cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem nginx/ssl/${DOMAIN}.key
        
        echo -e "${GREEN}✓ Certificates copied to nginx/ssl/${NC}"
    else
        echo -e "${RED}✗ Failed to obtain SSL certificates${NC}"
        echo -e "${YELLOW}Make sure:${NC}"
        echo -e "${YELLOW}1. Domain ${DOMAIN} points to this server${NC}"
        echo -e "${YELLOW}2. Port 80 is open and not blocked by firewall${NC}"
        echo -e "${YELLOW}3. No other service is running on port 80${NC}"
        exit 1
    fi
fi

# Set proper permissions for SSL files
chown -R root:root nginx/ssl
chmod 600 nginx/ssl/*.key
chmod 644 nginx/ssl/*.crt

# Create auto-renewal cron job
echo -e "${YELLOW}Setting up auto-renewal...${NC}"
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --hook 'systemctl reload nginx'") | crontab -

# Update nginx configuration for SSL
echo -e "${YELLOW}Updating nginx configuration...${NC}"

# Create nginx config for the domain
cat > /etc/nginx/sites-available/app.ardour.work << EOF
# HTTP redirect to HTTPS
server {
    listen 80;
    server_name app.ardour.work www.app.ardour.work;
    
    # Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other HTTP traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server - Proxy to Docker containers
server {
    listen 443 ssl http2;
    server_name app.ardour.work www.app.ardour.work;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/app.ardour.work/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.ardour.work/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # API routes - proxy to backend container
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        
        # Timeouts
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }

    # Frontend routes - proxy to frontend container
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Security
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/app.ardour.work /etc/nginx/sites-enabled/

# Remove default nginx site if it exists
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
if nginx -t; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
    systemctl restart nginx
    systemctl enable nginx
    echo -e "${GREEN}✓ Nginx restarted successfully${NC}"
else
    echo -e "${RED}✗ Nginx configuration is invalid${NC}"
    exit 1
fi

echo -e "\n${GREEN}=== SSL Setup Complete ===${NC}"
echo -e "${GREEN}✓ SSL certificates installed${NC}"
echo -e "${GREEN}✓ Nginx configured for HTTPS${NC}"
echo -e "${GREEN}✓ Auto-renewal configured${NC}"
echo -e "\n${YELLOW}Your site should now be accessible at:${NC}"
echo -e "${GREEN}https://app.ardour.work${NC}"

# Check certificate status
echo -e "\n${YELLOW}Certificate information:${NC}"
certbot certificates

echo -e "\n${GREEN}🔒 SSL setup completed successfully!${NC}"