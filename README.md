
# KeyEff Call Panel - Professional Telemarketing Platform

## Project Overview

KeyEff Call Panel is a comprehensive web-based communication and sales management tool designed for internal telemarketing operations. The platform provides GDPR-compliant customer contact tracking, integrated SIP calling, appointment management, and detailed analytics.

## Project Structure

```
keyeff-call-panel/
├── webapp/                     # Production build output
│   ├── backend/               # PHP Backend API
│   │   ├── api/              # REST API endpoints
│   │   ├── config/           # Configuration files
│   │   ├── models/           # Database models
│   │   └── sql/              # Database schemas
│   └── public/               # Frontend build (Document Root)
│       ├── index.html        # Main application
│       ├── assets/           # Compiled CSS/JS
│       └── .htaccess         # Apache configuration
├── src/                      # React source code
├── backend/                  # PHP source files
└── scripts/                  # Build scripts
```

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: PHP 8.0+, MySQL/MariaDB
- **Build System**: Vite with custom build scripts
- **Authentication**: JWT with 2FA
- **Communication**: WebRTC, SIP integration

## Quick Start

### Development Setup

1. **Clone and Install**:
```bash
git clone <YOUR_GIT_URL>
cd keyeff-call-panel
npm install
```

2. **Configure Environment**:
```bash
# Create .env file
echo "VITE_API_BASE_URL=http://keyeff.local/backend/api" > .env
```

3. **Start Development**:
```bash
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# This creates:
# webapp/
# ├── backend/    (Complete PHP backend)
# └── public/     (Frontend build - set as Document Root)
```

## Deployment Guide

### For Production Server (your-domain.com)

**Step 1: Update Configuration URLs**

Before building for production, update these files:

1. **Update .env**:
```env
VITE_API_BASE_URL=https://your-domain.com/backend/api
```

2. **Update backend/config/config.php**:
```php
define('API_URL', 'https://your-domain.com/backend');
define('APP_URL', 'https://your-domain.com');

// Update CORS origins
$allowed_origins = [
    'https://your-domain.com',
    'https://www.your-domain.com'  // if using www
];
```

3. **Update backend/config/database.php**:
```php
define('DB_SERVER', 'your-server-hostname');
define('DB_USERNAME', 'your-production-username');
define('DB_PASSWORD', 'your-production-password');
define('DB_DATABASE', 'your-production-database');
```

**Step 2: Build and Deploy**

```bash
# 1. Build with production settings
npm run build

# 2. Upload webapp/ folder to your server
# 3. Set Document Root to webapp/public/
# 4. Import database schema from webapp/backend/sql/
```

**Step 3: Server Configuration**

- Set Document Root to: `/path/to/webapp/public/`
- Ensure PHP 8.0+ with mysqli, json, curl extensions
- Configure SSL certificate for HTTPS
- Set proper file permissions (755 for directories, 644 for files)

### Apache Virtual Host Example

```apache
<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot /var/www/webapp/public
    
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    # Security headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set Strict-Transport-Security "max-age=31536000"
    
    <Directory "/var/www/webapp/public">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

## Development vs Production URLs

### Development (Local):
- Frontend: `http://localhost:5173`
- Backend API: `http://keyeff.local/backend/api` (via proxy)
- Database: `localhost:3306`

### Production (your-domain.com):
- Frontend: `https://your-domain.com`
- Backend API: `https://your-domain.com/backend/api`
- Database: `your-server:3306`

## Security Considerations

- Always use HTTPS in production
- Change JWT_SECRET in backend/config/config.php
- Use strong database passwords
- Configure proper file permissions
- Enable PHP security settings
- Regular security updates

## Support

For issues and feature requests, please check the documentation in the `INSTALL.md` file or contact the development team.

## License

Professional license - Internal use only.
