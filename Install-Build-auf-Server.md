
# KeyEff CallPanel - Server Installation Guide

## Voraussetzungen

### Server Requirements
- PHP 8.0+ mit folgenden Extensions:
  - mysqli
  - json
  - curl
  - openssl
- MySQL/MariaDB 8.0+
- Apache/Nginx Webserver
- SSL-Zertifikat (empfohlen)

### VPN/SIP Requirements (optional)
- OpenVPN Client
- SIP Client Libraries
- WebRTC Support

## Installation

### 1. Build erstellen
```bash
# Entwicklungsumgebung
npm install
npm run build
```

### 2. Server-Struktur anlegen
```
/var/www/keyeff/
├── htdocs/
│   ├── backend/ (NICHT öffentlich zugänglich)
│   │   ├── api/
│   │   ├── config/
│   │   ├── models/
│   │   └── sql/
│   └── public/ (Document Root)
│       ├── index.html
│       ├── assets/
│       └── api/ (Proxy zu backend)
```

### 3. Dateien übertragen
```bash
# Build-Dateien nach public/ kopieren
cp -r htdocs/public/* /var/www/keyeff/htdocs/public/

# Backend-Dateien nach backend/ kopieren
cp -r htdocs/backend/* /var/www/keyeff/htdocs/backend/
```

### 4. Apache Konfiguration
```apache
<VirtualHost *:80>
    ServerName keyeff.example.com
    DocumentRoot /var/www/keyeff/htdocs/public
    
    # Redirect HTTP to HTTPS
    Redirect permanent / https://keyeff.example.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName keyeff.example.com
    DocumentRoot /var/www/keyeff/htdocs/public
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    # Security Headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    
    # Backend API Proxy
    ProxyPass /api/ http://localhost/backend/api/
    ProxyPassReverse /api/ http://localhost/backend/api/
    
    # Deny access to backend directory
    <Directory "/var/www/keyeff/htdocs/backend">
        Require all denied
    </Directory>
    
    # SPA Fallback
    <Directory "/var/www/keyeff/htdocs/public">
        Options -Indexes
        AllowOverride All
        Require all granted
        
        # React Router Support
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

### 5. .htaccess Dateien

#### public/.htaccess
```apache
RewriteEngine On
RewriteBase /

# Handle Angular and React Router
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE text/html
</IfModule>
```

#### backend/.htaccess
```apache
# Deny all access to backend directory
<RequireAll>
    Require all denied
</RequireAll>
```

### 6. Datenbank Setup
```bash
# 1. Datenbank erstellen
mysql -u root -p
CREATE DATABASE keyeff_callpanel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'keyeff_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON keyeff_callpanel.* TO 'keyeff_user'@'localhost';
FLUSH PRIVILEGES;

# 2. Schema importieren
mysql -u keyeff_user -p keyeff_callpanel < backend/sql/database.sql

# 3. Migration ausführen
mysql -u keyeff_user -p keyeff_callpanel < backend/sql/migration_001_templates_and_sessions.sql
```

### 7. Konfiguration anpassen

#### backend/config/database.php
```php
<?php
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'keyeff_user');
define('DB_PASSWORD', 'secure_password');
define('DB_DATABASE', 'keyeff_callpanel');

function getDBConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_SERVER . ";dbname=" . DB_DATABASE . ";charset=utf8mb4",
            DB_USERNAME,
            DB_PASSWORD,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
        return $pdo;
    } catch(PDOException $e) {
        die("Connection failed: " . $e->getMessage());
    }
}
?>
```

### 8. Verbindungskonfiguration (Optional)
```bash
# Kopiere Template und passe an
cp config-templates/connection-config.example.php backend/config/connection-config.php
```

### 9. Berechtigungen setzen
```bash
# Webserver User (meist www-data)
chown -R www-data:www-data /var/www/keyeff/
chmod -R 755 /var/www/keyeff/htdocs/public/
chmod -R 750 /var/www/keyeff/htdocs/backend/
chmod 600 /var/www/keyeff/htdocs/backend/config/database.php
```

### 10. Systemd Service für VPN (Optional)
```ini
# /etc/systemd/system/keyeff-vpn.service
[Unit]
Description=KeyEff VPN Connection
After=network.target

[Service]
Type=simple
User=www-data
ExecStart=/usr/sbin/openvpn --config /var/www/keyeff/config/client.ovpn
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Wartung

### Logs überwachen
```bash
# Apache Logs
tail -f /var/log/apache2/error.log
tail -f /var/log/apache2/access.log

# PHP Logs
tail -f /var/log/php8.1-fpm.log
```

### Backup
```bash
# Datenbank Backup
mysqldump -u keyeff_user -p keyeff_callpanel > backup_$(date +%Y%m%d_%H%M%S).sql

# Dateien Backup
tar -czf keyeff_backup_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/keyeff/
```

### Updates
```bash
# 1. Backup erstellen
# 2. Neue Build-Dateien übertragen
# 3. Datenbank-Migrationen ausführen
# 4. Cache leeren (falls vorhanden)
```

## Troubleshooting

### Häufige Probleme
1. **API 500 Fehler**: Database-Verbindung prüfen
2. **CORS Fehler**: Header Konfiguration prüfen
3. **Routing Fehler**: .htaccess Regeln prüfen
4. **VPN Probleme**: Zertifikate und Konfiguration prüfen

### Debug-Modus aktivieren
```php
// In backend/config/config.php
define('DEBUG_MODE', true);
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## Sicherheit

### Empfohlene Maßnahmen
- Regelmäßige Updates
- Starke Passwörter
- Firewall Konfiguration
- SSL/TLS Verschlüsselung
- Backup-Strategie
- Log-Monitoring
- Intrusion Detection

### Firewall Regeln
```bash
# Nur HTTPS und SSH erlauben
ufw allow 22/tcp
ufw allow 443/tcp
ufw deny 80/tcp
ufw enable
```
