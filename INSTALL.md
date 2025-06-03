
# KeyEff Call Panel - Complete Installation Guide

This comprehensive guide covers local development setup, testing, and production deployment of the KeyEff Call Panel platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Database Configuration](#database-configuration)
4. [Development Testing](#development-testing)
5. [Production Build Process](#production-build-process)
6. [Production Deployment](#production-deployment)
7. [URL Configuration for Production](#url-configuration-for-production)
8. [Server Configuration](#server-configuration)
9. [Security Setup](#security-setup)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### Development Environment
- [Node.js](https://nodejs.org/) (Version 18.x or higher)
- [PHP](https://www.php.net/) (Version 8.0 or higher) with extensions:
  - mysqli, json, curl, openssl
- [MySQL](https://www.mysql.com/) or [MariaDB](https://mariadb.org/) (Version 8.0+)
- [Git](https://git-scm.com/)
- Local web server ([XAMPP](https://www.apachefriends.org/) or [WAMP](https://www.wampserver.com/))

### Production Environment
- Web server (Apache/Nginx) with PHP 8.0+
- MySQL/MariaDB database server
- SSL certificate (required for production)
- Domain name and DNS configuration

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-repo/keyeff-call-panel.git
cd keyeff-call-panel
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create `.env` file in project root:
```env
VITE_API_BASE_URL=http://keyeff.local/backend/api
```

### 4. Setup Local Web Server

**For XAMPP:**
1. Copy `backend/` folder to `C:/xampp/htdocs/keyeff.local/backend/`
2. Add to `C:/Windows/System32/drivers/etc/hosts`:
   ```
   127.0.0.1 keyeff.local
   ```
3. Configure Apache virtual host in `httpd-vhosts.conf`:
   ```apache
   <VirtualHost *:80>
       ServerName keyeff.local
       DocumentRoot "C:/xampp/htdocs/keyeff.local"
       <Directory "C:/xampp/htdocs/keyeff.local">
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```

## Database Configuration

### 1. Create Database
```sql
CREATE DATABASE keyeff_callpanel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'keyeff_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON keyeff_callpanel.* TO 'keyeff_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Import Schema
```bash
# Import main database structure
mysql -u keyeff_user -p keyeff_callpanel < backend/sql/database.sql

# Import sample data (optional for development)
mysql -u keyeff_user -p keyeff_callpanel < backend/sql/filialen.sql
```

### 3. Configure Database Connection
Edit `backend/config/database.php`:
```php
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'keyeff_user');
define('DB_PASSWORD', 'secure_password_here');
define('DB_DATABASE', 'keyeff_callpanel');
```

## Development Testing

### 1. Start Development Server
```bash
npm run dev
```
Application available at: `http://localhost:5173`

### 2. Test API Connection
Visit: `http://keyeff.local/backend/api/auth/login.php`
Should return JSON response indicating method not allowed (normal for GET request).

### 3. Test Login
Use development credentials:
- **Admin**: admin@keyeff.de / password
- **Telefonist**: telefonist@keyeff.de / password
- **Filialleiter**: filialleiter@keyeff.de / password

## Production Build Process

### 1. Update Configuration for Production

**Important: Update these files BEFORE building for production:**

#### Update .env
```env
VITE_API_BASE_URL=https://your-domain.com/backend/api
```

#### Update backend/config/config.php
```php
// Change these URLs to your production domain
define('API_URL', 'https://your-domain.com/backend');
define('APP_URL', 'https://your-domain.com');

// Update CORS origins
function setCorsHeaders() {
    $allowed_origins = [
        'https://your-domain.com',
        'https://www.your-domain.com'  // Add www if used
    ];
    // ... rest of function
}

// IMPORTANT: Change JWT secret for security
define('JWT_SECRET', 'your-unique-secure-secret-key-here');

// Disable debug mode in production
define('DEBUG_MODE', false);
```

#### Update backend/config/database.php for Production
```php
define('DB_SERVER', 'your-production-db-host');
define('DB_USERNAME', 'your-production-db-user');
define('DB_PASSWORD', 'your-production-db-password');
define('DB_DATABASE', 'your-production-db-name');
```

### 2. Build for Production
```bash
npm run build
```

This creates the `webapp/` folder with:
```
webapp/
├── backend/     # Complete PHP backend
└── public/      # Frontend build (Document Root)
```

## Production Deployment

### 1. Server Setup

**Upload Files:**
- Upload entire `webapp/` folder to your server
- Common location: `/var/www/html/webapp/` or `/public_html/webapp/`

**Set Document Root:**
- Point your domain's Document Root to `webapp/public/`
- NOT to `webapp/` - the public folder must be the web root!

### 2. Database Setup on Production Server

```bash
# Create production database
mysql -u root -p
CREATE DATABASE your_production_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'prod_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON your_production_db.* TO 'prod_user'@'localhost';

# Import schema
mysql -u prod_user -p your_production_db < webapp/backend/sql/database.sql
```

### 3. File Permissions
```bash
# Set proper permissions
chown -R www-data:www-data /var/www/html/webapp/
chmod -R 755 /var/www/html/webapp/public/
chmod -R 750 /var/www/html/webapp/backend/
chmod 600 /var/www/html/webapp/backend/config/database.php
```

## URL Configuration for Production

### Critical URLs to Update

When moving from development to production (your-domain.com), update these locations:

#### 1. Frontend Configuration (.env)
```env
# BEFORE BUILD - Update this first!
VITE_API_BASE_URL=https://your-domain.com/backend/api
```

#### 2. Backend Configuration (backend/config/config.php)
```php
// API and App URLs
define('API_URL', 'https://your-domain.com/backend');
define('APP_URL', 'https://your-domain.com');

// CORS Origins
$allowed_origins = [
    'https://your-domain.com',
    'https://www.your-domain.com'  // if using www subdomain
];
```

#### 3. Database Configuration (backend/config/database.php)
```php
define('DB_SERVER', 'your-production-server');     // Often 'localhost' or IP
define('DB_USERNAME', 'your-production-username');
define('DB_PASSWORD', 'your-production-password');
define('DB_DATABASE', 'your-production-database');
```

### Important Notes:
- **Always update URLs BEFORE running `npm run build`**
- If you change URLs after building, you must rebuild
- Use HTTPS in production (required for security)
- Ensure www and non-www versions are handled consistently

## Server Configuration

### Apache Configuration

#### Virtual Host Example
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    Redirect permanent / https://your-domain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    DocumentRoot /var/www/html/webapp/public
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/your/certificate.crt
    SSLCertificateKeyFile /path/to/your/private.key
    SSLCertificateChainFile /path/to/your/chain.crt
    
    # Security Headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    
    # Document Root Configuration
    <Directory "/var/www/html/webapp/public">
        Options -Indexes
        AllowOverride All
        Require all granted
        
        # React Router Support (already in .htaccess)
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Deny access to backend via web (security)
    <Directory "/var/www/html/webapp/backend">
        Require all denied
    </Directory>
</VirtualHost>
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://your-domain.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    root /var/www/html/webapp/public;
    index index.html;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Security Headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    # React Router Support
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API Backend
    location /backend/ {
        # Internal access only - not directly accessible
        deny all;
    }
}
```

## Security Setup

### 1. SSL Certificate
```bash
# Using Let's Encrypt (free)
certbot --apache -d your-domain.com -d www.your-domain.com
```

### 2. Security Configuration
```php
// In backend/config/config.php
// Change default JWT secret
define('JWT_SECRET', 'your-unique-32-character-secret-key');

// Disable debug mode
define('DEBUG_MODE', false);

// Enable security headers
ini_set('session.cookie_secure', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Strict');
```

### 3. Database Security
- Use strong passwords (minimum 16 characters)
- Limit database user privileges
- Regular backups
- Monitor access logs

### 4. Firewall Configuration
```bash
# Example UFW rules
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (redirects to HTTPS)
ufw allow 443/tcp   # HTTPS
ufw enable
```

## Troubleshooting

### Common Issues

#### 1. API Connection Errors
**Symptoms**: Frontend can't connect to backend
**Solutions**:
- Check if URLs in `.env` and `config.php` match
- Verify CORS configuration
- Check SSL certificate validity
- Ensure backend folder has correct permissions

#### 2. Database Connection Errors
**Symptoms**: "Database connection failed"
**Solutions**:
- Verify database credentials in `database.php`
- Check if MySQL service is running
- Ensure database exists and user has privileges
- Check firewall settings

#### 3. Routing Issues
**Symptoms**: Page refresh shows 404 errors
**Solutions**:
- Verify `.htaccess` file exists in `public/` folder
- Check Apache mod_rewrite is enabled
- Ensure Document Root points to `webapp/public/`

#### 4. Permission Errors
**Symptoms**: "Permission denied" errors
**Solutions**:
```bash
# Fix permissions
chown -R www-data:www-data /var/www/html/webapp/
chmod -R 755 /var/www/html/webapp/public/
chmod -R 750 /var/www/html/webapp/backend/
```

#### 5. SSL Issues
**Symptoms**: "Not secure" warnings, HTTPS errors
**Solutions**:
- Verify SSL certificate installation
- Check certificate chain completeness
- Ensure all URLs use HTTPS
- Test SSL configuration: `openssl s_client -connect your-domain.com:443`

### Debug Steps

1. **Check Apache/Nginx Logs**:
   ```bash
   tail -f /var/log/apache2/error.log
   tail -f /var/log/nginx/error.log
   ```

2. **Test API Endpoints**:
   ```bash
   curl -X GET https://your-domain.com/backend/api/auth/login.php
   ```

3. **Database Connection Test**:
   ```php
   // Create test file in webapp/backend/
   <?php
   require_once 'config/database.php';
   $conn = getDBConnection();
   echo "Database connected successfully!";
   ?>
   ```

### Getting Help

1. Check server error logs
2. Enable debug mode temporarily
3. Test individual components
4. Verify all configuration files
5. Contact hosting provider for server-specific issues

## Post-Deployment Checklist

- [ ] Frontend loads correctly at your-domain.com
- [ ] All API endpoints respond correctly
- [ ] Login system works with 2FA
- [ ] Database connections are stable
- [ ] SSL certificate is valid and working
- [ ] All URLs are HTTPS
- [ ] Security headers are set
- [ ] Backups are configured
- [ ] Monitoring is in place
- [ ] DNS is properly configured
- [ ] Email notifications work (if configured)

## Maintenance

### Regular Tasks
- **Daily**: Monitor error logs
- **Weekly**: Check SSL certificate expiry
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Full backup and disaster recovery test

### Update Process
1. Test updates in staging environment
2. Backup production database and files
3. Update code and configuration
4. Run database migrations if needed
5. Clear caches and restart services
6. Verify functionality

This installation guide ensures a smooth transition from development to production deployment.
