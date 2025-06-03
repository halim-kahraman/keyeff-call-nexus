
# KeyEff CallPanel - Production Server Installation Guide

## Overview

This guide covers the complete production deployment process using the new webapp structure created by `npm run build`.

## Server Requirements

### Minimum Requirements
- **Operating System**: Linux (Ubuntu 20.04+ recommended)
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **PHP**: 8.0+ with extensions:
  - mysqli, json, curl, openssl, mbstring, zip
- **Database**: MySQL 8.0+ or MariaDB 10.5+
- **Memory**: 2GB RAM minimum, 4GB recommended
- **Storage**: 10GB minimum, SSD recommended
- **SSL**: Valid SSL certificate (Let's Encrypt recommended)

### Optional Features
- **VPN Support**: OpenVPN client for secure connections
- **SIP Integration**: Asterisk or FreePBX compatibility
- **Email**: SMTP server for notifications

## Pre-Deployment Configuration

### 1. Update Configuration Files

**CRITICAL: Update these files BEFORE building for production:**

#### Environment Configuration (.env)
```env
# Update with your production domain
VITE_API_BASE_URL=https://your-domain.com/backend/api
```

#### Backend Configuration (backend/config/config.php)
```php
// Production URLs
define('API_URL', 'https://your-domain.com/backend');
define('APP_URL', 'https://your-domain.com');

// CORS Origins for your domain
function setCorsHeaders() {
    $allowed_origins = [
        'https://your-domain.com',
        'https://www.your-domain.com'
    ];
    
    if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
    } else {
        header("Access-Control-Allow-Origin: https://your-domain.com");
    }
    
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
}

// Security Configuration
define('JWT_SECRET', 'your-unique-32-character-secret-key-here');
define('DEBUG_MODE', false);  // IMPORTANT: Disable in production

// Email Configuration (optional)
define('MAIL_HOST', 'smtp.your-domain.com');
define('MAIL_PORT', 587);
define('MAIL_USERNAME', 'noreply@your-domain.com');
define('MAIL_PASSWORD', 'your-email-password');
define('MAIL_FROM', 'noreply@your-domain.com');
```

#### Database Configuration (backend/config/database.php)
```php
// Production database settings
define('DB_SERVER', 'localhost');  // or your DB server IP
define('DB_USERNAME', 'keyeff_prod_user');
define('DB_PASSWORD', 'your-strong-production-password');
define('DB_DATABASE', 'keyeff_production');
```

### 2. Build for Production
```bash
# Build with production configuration
npm run build
```

This creates the deployment-ready `webapp/` structure:
```
webapp/
├── backend/              # Complete PHP backend
│   ├── api/             # REST API endpoints
│   ├── config/          # Configuration files
│   ├── models/          # Database models
│   ├── sql/             # Database schemas
│   └── utils/           # Utility functions
└── public/              # Frontend build (Document Root)
    ├── index.html       # Main application
    ├── assets/          # Compiled CSS/JS/images
    └── .htaccess        # Apache rewrite rules
```

## Server Installation

### 1. Server Preparation

#### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### Install Required Software
```bash
# Apache, PHP, MySQL
sudo apt install apache2 php8.1 php8.1-mysql php8.1-curl php8.1-json php8.1-mbstring php8.1-zip mysql-server -y

# Enable required Apache modules
sudo a2enmod rewrite ssl headers
sudo systemctl restart apache2
```

#### Secure MySQL Installation
```bash
sudo mysql_secure_installation
```

### 2. Database Setup

#### Create Production Database
```bash
sudo mysql -u root -p

CREATE DATABASE keyeff_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'keyeff_prod_user'@'localhost' IDENTIFIED BY 'your-strong-password-here';
GRANT ALL PRIVILEGES ON keyeff_production.* TO 'keyeff_prod_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Import Database Schema
```bash
# Upload and import your database schema
mysql -u keyeff_prod_user -p keyeff_production < /path/to/webapp/backend/sql/database.sql

# Import initial data (filialen, etc.)
mysql -u keyeff_prod_user -p keyeff_production < /path/to/webapp/backend/sql/filialen.sql
```

### 3. File Deployment

#### Upload webapp Folder
```bash
# Upload webapp folder to server
# Recommended location: /var/www/your-domain.com/

sudo mkdir -p /var/www/your-domain.com
sudo chown -R $USER:www-data /var/www/your-domain.com

# Upload webapp contents
# Method 1: SCP
scp -r webapp/* user@your-server:/var/www/your-domain.com/

# Method 2: SFTP, FTP, or hosting panel file manager
```

#### Set Proper Permissions
```bash
# Set ownership
sudo chown -R www-data:www-data /var/www/your-domain.com/

# Set directory permissions
sudo find /var/www/your-domain.com/ -type d -exec chmod 755 {} \;

# Set file permissions
sudo find /var/www/your-domain.com/ -type f -exec chmod 644 {} \;

# Secure backend configuration
sudo chmod 600 /var/www/your-domain.com/backend/config/database.php
sudo chmod 750 /var/www/your-domain.com/backend/
```

### 4. Apache Virtual Host Configuration

#### Create Virtual Host File
```bash
sudo nano /etc/apache2/sites-available/your-domain.com.conf
```

#### Virtual Host Configuration
```apache
# HTTP Virtual Host (redirects to HTTPS)
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    DocumentRoot /var/www/your-domain.com/public
    
    # Redirect all HTTP to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

# HTTPS Virtual Host
<VirtualHost *:443>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    DocumentRoot /var/www/your-domain.com/public
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/your-domain.com.crt
    SSLCertificateKeyFile /etc/ssl/private/your-domain.com.key
    SSLCertificateChainFile /etc/ssl/certs/your-domain.com-chain.crt
    
    # Security Headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    
    # Document Root Configuration
    <Directory "/var/www/your-domain.com/public">
        Options -Indexes -FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Additional security
        <Files "*.php">
            Require all denied
        </Files>
    </Directory>
    
    # Deny direct access to backend directory
    <Directory "/var/www/your-domain.com/backend">
        Require all denied
    </Directory>
    
    # API Access Configuration
    <Location "/backend/api">
        # Allow API access from your domain only
        SetEnvIf Origin "^https://your-domain\.com$" CORS_ALLOW_ORIGIN=$1
        SetEnvIf Origin "^https://www\.your-domain\.com$" CORS_ALLOW_ORIGIN=$1
        Header always set Access-Control-Allow-Origin %{CORS_ALLOW_ORIGIN}e env=CORS_ALLOW_ORIGIN
        Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
        Header always set Access-Control-Allow-Credentials true
    </Location>
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/your-domain.com_error.log
    CustomLog ${APACHE_LOG_DIR}/your-domain.com_access.log combined
</VirtualHost>
```

#### Enable Site and SSL
```bash
# Enable the site
sudo a2ensite your-domain.com.conf

# Disable default site
sudo a2dissite 000-default.conf

# Test configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2
```

### 5. SSL Certificate Setup

#### Using Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache -y

# Obtain SSL certificate
sudo certbot --apache -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

#### Manual SSL Certificate
If using a purchased SSL certificate:
```bash
# Copy certificate files
sudo cp your-domain.com.crt /etc/ssl/certs/
sudo cp your-domain.com.key /etc/ssl/private/
sudo cp your-domain.com-chain.crt /etc/ssl/certs/

# Set permissions
sudo chmod 644 /etc/ssl/certs/your-domain.com.crt
sudo chmod 600 /etc/ssl/private/your-domain.com.key
sudo chmod 644 /etc/ssl/certs/your-domain.com-chain.crt
```

### 6. PHP Configuration

#### Optimize PHP Settings
```bash
sudo nano /etc/php/8.1/apache2/php.ini
```

```ini
# Security Settings
expose_php = Off
display_errors = Off
log_errors = On
error_log = /var/log/php/error.log

# Performance Settings
memory_limit = 256M
max_execution_time = 300
max_input_time = 300
post_max_size = 50M
upload_max_filesize = 50M

# Session Security
session.cookie_secure = On
session.cookie_httponly = On
session.cookie_samesite = Strict
session.use_strict_mode = On

# File Upload Security
file_uploads = On
allow_url_fopen = Off
allow_url_include = Off
```

#### Create PHP Error Log Directory
```bash
sudo mkdir -p /var/log/php
sudo chown www-data:www-data /var/log/php
sudo chmod 755 /var/log/php
```

#### Restart Services
```bash
sudo systemctl restart apache2
sudo systemctl restart mysql
```

## Security Hardening

### 1. Firewall Configuration
```bash
# Install and configure UFW
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Check status
sudo ufw status
```

### 2. Fail2Ban Installation
```bash
# Install Fail2Ban
sudo apt install fail2ban -y

# Configure for Apache
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[apache-auth]
enabled = true

[apache-badbots]
enabled = true

[apache-noscript]
enabled = true

[apache-overflows]
enabled = true

[ssh]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
```

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Additional Security Measures

#### Disable Unnecessary Services
```bash
# Check running services
sudo systemctl list-unit-files --state=enabled

# Disable unnecessary services (example)
sudo systemctl disable bluetooth
sudo systemctl disable cups
```

#### Regular Updates
```bash
# Create update script
sudo nano /usr/local/bin/security-updates.sh
```

```bash
#!/bin/bash
apt update
apt upgrade -y
apt autoremove -y
apt autoclean
```

```bash
sudo chmod +x /usr/local/bin/security-updates.sh

# Add to crontab for weekly updates
sudo crontab -e
# Add line: 0 2 * * 0 /usr/local/bin/security-updates.sh
```

## Monitoring and Maintenance

### 1. Log Monitoring
```bash
# Apache logs
sudo tail -f /var/log/apache2/your-domain.com_error.log
sudo tail -f /var/log/apache2/your-domain.com_access.log

# PHP logs
sudo tail -f /var/log/php/error.log

# MySQL logs
sudo tail -f /var/log/mysql/error.log
```

### 2. Performance Monitoring
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Check system resources
htop
df -h
free -h
```

### 3. Backup Strategy

#### Database Backup Script
```bash
sudo nano /usr/local/bin/backup-database.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/keyeff"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="keyeff_production"
DB_USER="keyeff_prod_user"
DB_PASS="your-password"

mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# File backup
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /var/www/your-domain.com/

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-database.sh

# Add to crontab for daily backups
sudo crontab -e
# Add line: 0 3 * * * /usr/local/bin/backup-database.sh
```

## Testing and Verification

### 1. Functionality Tests
```bash
# Test website accessibility
curl -I https://your-domain.com

# Test API endpoints
curl -X GET https://your-domain.com/backend/api/auth/login.php

# Test SSL configuration
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

### 2. Security Tests
```bash
# SSL test
curl -I https://your-domain.com | grep -i "strict-transport-security"

# Headers test
curl -I https://your-domain.com | grep -i "x-frame-options"
```

### 3. Performance Tests
```bash
# Load testing (install apache2-utils first)
sudo apt install apache2-utils -y
ab -n 100 -c 10 https://your-domain.com/
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Website Not Loading
- Check Apache status: `sudo systemctl status apache2`
- Check DNS configuration
- Verify Document Root path
- Check file permissions

#### 2. API Connection Errors
- Verify CORS configuration in `config.php`
- Check API endpoint URLs
- Review Apache error logs
- Test database connection

#### 3. SSL Certificate Issues
- Verify certificate installation
- Check certificate expiry: `openssl x509 -in /etc/ssl/certs/your-domain.com.crt -text -noout`
- Test SSL configuration: `sudo apache2ctl configtest`

#### 4. Database Connection Errors
- Verify database credentials
- Check MySQL service: `sudo systemctl status mysql`
- Test connection: `mysql -u keyeff_prod_user -p keyeff_production`

## Post-Deployment Checklist

- [ ] Website loads correctly at https://your-domain.com
- [ ] SSL certificate is valid and working
- [ ] All API endpoints respond correctly
- [ ] Login system works with 2FA
- [ ] Database connections are stable
- [ ] Security headers are properly set
- [ ] Firewall is configured and active
- [ ] Backups are scheduled and working
- [ ] Monitoring is in place
- [ ] Error logs are being generated
- [ ] Performance is acceptable
- [ ] All configuration files are secured

## Maintenance Schedule

### Daily
- Monitor error logs
- Check system resources
- Verify backup completion

### Weekly
- Review access logs
- Update system packages
- Check SSL certificate status

### Monthly
- Review security logs
- Test backup restoration
- Performance optimization
- Security audit

This installation guide ensures a secure, performant, and maintainable production deployment of the KeyEff Call Panel.
