
# KeyEff Call Panel - Build Installation Guide

Diese Anleitung beschreibt die Installation des production-ready Builds von KeyEff Call Panel auf Ihrem Server.

## Serveranforderungen

- **Web Server**: Apache 2.4+ oder Nginx 1.18+
- **PHP**: Version 8.0 oder höher
- **MySQL/MariaDB**: Version 8.0+ / 10.4+
- **SSL-Zertifikat**: Für HTTPS (empfohlen)
- **Speicherplatz**: Mindestens 1GB verfügbar

## Ordnerstruktur auf dem Server

```
/htdocs/
├── backend/               # Niemals öffentlich erreichbar
│   ├── config/
│   │   └── config.php     # DB, SMTP, Secrets
│   ├── api/
│   ├── models/
│   └── sql/
└── public/                # Einzig freigegebener Ordner
    ├── index.html         # Build-Dateien
    ├── assets/
    └── api/               # Öffentlicher API-Zugang
```

## 1. Build erstellen

Auf Ihrem Entwicklungsrechner:

```bash
# Projekt klonen oder aktualisieren
git clone <your-repository>
cd keyeff-call-panel

# Dependencies installieren
npm install

# Production Build erstellen
npm run build
```

## 2. Server vorbereiten

### 2.1 Backend Setup

1. Erstellen Sie die Ordnerstruktur:
```bash
mkdir -p /htdocs/backend/config
mkdir -p /htdocs/public
```

2. Kopieren Sie das Backend:
```bash
# Backend-Dateien hochladen (außerhalb des öffentlichen Bereichs)
scp -r backend/* user@server:/htdocs/backend/
```

3. Konfigurieren Sie `config.php`:
```php
<?php
// Datenbank-Konfiguration
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'ihr_db_user');
define('DB_PASSWORD', 'ihr_sicheres_passwort');
define('DB_DATABASE', 'keyeff_production');

// JWT Secret
define('JWT_SECRET', 'ihr_sehr_sicherer_random_string_64_zeichen_lang');
define('JWT_EXPIRE', 86400);

// SMTP-Konfiguration
define('SMTP_HOST', 'smtp.ihr-provider.de');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'noreply@ihre-domain.de');
define('SMTP_PASSWORD', 'smtp_passwort');
define('SMTP_FROM_EMAIL', 'noreply@ihre-domain.de');
define('SMTP_FROM_NAME', 'KeyEff Call Panel');

// API-Schlüssel und Secrets
define('KEYEFF_API_KEY', 'ihr_keyeff_api_key');
define('ENCRYPTION_KEY', 'ihr_32_zeichen_encryption_key');

// Base URLs
define('FRONTEND_URL', 'https://ihre-domain.de');
define('API_BASE_URL', '/api');
?>
```

### 2.2 Frontend Setup

1. Kopieren Sie die Build-Dateien:
```bash
# Build-Dateien in den öffentlichen Ordner
scp -r dist/* user@server:/htdocs/public/
```

2. Erstellen Sie API-Proxy-Dateien:
```bash
mkdir -p /htdocs/public/api
```

## 3. Datenbank einrichten

1. Erstellen Sie die Produktionsdatenbank:
```sql
CREATE DATABASE keyeff_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'keyeff_user'@'localhost' IDENTIFIED BY 'sicheres_passwort';
GRANT ALL PRIVILEGES ON keyeff_production.* TO 'keyeff_user'@'localhost';
FLUSH PRIVILEGES;
```

2. Importieren Sie das Schema:
```bash
mysql -u keyeff_user -p keyeff_production < /htdocs/backend/sql/database.sql
mysql -u keyeff_user -p keyeff_production < /htdocs/backend/sql/filialen.sql
mysql -u keyeff_user -p keyeff_production < /htdocs/backend/sql/templates.sql
```

## 4. API-Proxy einrichten

Erstellen Sie API-Proxy-Dateien im öffentlichen Ordner:

```bash
# Für jede API-Route eine Proxy-Datei
echo '<?php require_once "../../backend/api/auth/login.php"; ?>' > /htdocs/public/api/login.php
echo '<?php require_once "../../backend/api/auth/verify.php"; ?>' > /htdocs/public/api/verify.php
# ... weitere API-Endpoints
```

Oder verwenden Sie einen generischen Proxy:

```php
<?php
// /htdocs/public/api/index.php
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$path = str_replace('/api/', '', $path);

$backendFile = "../../backend/api/" . $path . ".php";

if (file_exists($backendFile)) {
    require_once $backendFile;
} else {
    http_response_code(404);
    echo json_encode(['error' => 'API endpoint not found']);
}
?>
```

## 5. Apache-Konfiguration

### 5.1 Virtual Host
```apache
<VirtualHost *:443>
    ServerName ihre-domain.de
    DocumentRoot /htdocs/public
    
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    # Security Headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    
    # API-Proxy
    Alias /api /htdocs/public/api
    
    <Directory "/htdocs/public">
        AllowOverride All
        Require all granted
        
        # SPA Routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Backend-Schutz
    <Directory "/htdocs/backend">
        Require all denied
    </Directory>
</VirtualHost>

# HTTP zu HTTPS Weiterleitung
<VirtualHost *:80>
    ServerName ihre-domain.de
    Redirect permanent / https://ihre-domain.de/
</VirtualHost>
```

### 5.2 .htaccess für public-Ordner
```apache
# /htdocs/public/.htaccess
RewriteEngine On

# HTTPS Redirect
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API Rewriting
RewriteRule ^api/(.*)$ api/index.php [L,QSA]

# SPA Routing
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security
<Files "*.php">
    Require all granted
</Files>

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

## 6. Sicherheit

### 6.1 Backend-Schutz
```apache
# /htdocs/backend/.htaccess
Require all denied
```

### 6.2 Datei-Berechtigungen
```bash
# Backend (nicht öffentlich)
chmod -R 750 /htdocs/backend
chown -R www-data:www-data /htdocs/backend

# Public (öffentlich)
chmod -R 755 /htdocs/public
chown -R www-data:www-data /htdocs/public

# Config (besonders sicher)
chmod 600 /htdocs/backend/config/config.php
```

## 7. Testing

1. **Frontend testen**:
   - Besuchen Sie https://ihre-domain.de
   - Prüfen Sie, ob die Anwendung lädt

2. **API testen**:
   - GET https://ihre-domain.de/api/verify.php
   - Sollte JSON-Response zurückgeben

3. **Login testen**:
   - Mit den Standard-Anmeldedaten testen
   - Admin-Zugang prüfen

## 8. Produktions-Optimierungen

### 8.1 PHP-Optimierung
```ini
; php.ini Anpassungen
memory_limit = 256M
max_execution_time = 60
upload_max_filesize = 10M
post_max_size = 10M
display_errors = Off
log_errors = On
```

### 8.2 MySQL-Optimierung
```sql
-- Indexe für bessere Performance
CREATE INDEX idx_call_logs_date ON call_logs(call_date);
CREATE INDEX idx_customers_phone ON customers(phone_number);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
```

### 8.3 Monitoring einrichten
- Logrotation für PHP/Apache Logs
- Datenbank-Backup-Strategie
- SSL-Zertifikat Renewal
- Überwachung der Festplattennutzung

## 9. Wartung

### 9.1 Updates deployen
```bash
# Neuen Build erstellen
npm run build

# Backup erstellen
cp -r /htdocs/public /htdocs/backup-$(date +%Y%m%d)

# Neue Version deployen
rsync -av dist/ user@server:/htdocs/public/
```

### 9.2 Datenbank-Backup
```bash
# Tägliches Backup
mysqldump -u keyeff_user -p keyeff_production > backup-$(date +%Y%m%d).sql
```

## 10. Troubleshooting

### 10.1 Häufige Probleme

**Problem**: "API endpoint not found"
- Lösung: Prüfen Sie API-Proxy-Konfiguration

**Problem**: "Database connection failed"
- Lösung: Prüfen Sie config.php und DB-Verbindung

**Problem**: "403 Forbidden"
- Lösung: Prüfen Sie Datei-Berechtigungen

**Problem**: SPA-Routing funktioniert nicht
- Lösung: Prüfen Sie .htaccess RewriteRules

### 10.2 Log-Dateien
- Apache: `/var/log/apache2/error.log`
- PHP: `/var/log/php/error.log`
- MySQL: `/var/log/mysql/error.log`

## Support

Bei Problemen:
1. Prüfen Sie die Log-Dateien
2. Testen Sie die API-Endpoints direkt
3. Überprüfen Sie die Datenbank-Verbindung
4. Kontaktieren Sie das Entwicklerteam

---

**Wichtiger Hinweis**: Diese Installation ist für Produktionsumgebungen optimiert. Verwenden Sie starke Passwörter und halten Sie das System aktuell.
