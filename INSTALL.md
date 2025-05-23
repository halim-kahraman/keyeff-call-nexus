
# KeyEff Call Panel Installation Guide

Diese Anleitung hilft Ihnen dabei, die KeyEff Call Panel Plattform lokal zu installieren, zu konfigurieren und zu testen. Nach Abschluss können Sie die Anwendung auch in eine Produktionsumgebung überführen.

## Inhaltsverzeichnis

1. [Voraussetzungen](#voraussetzungen)
2. [Repository klonen](#repository-klonen)
3. [Frontend einrichten](#frontend-einrichten)
4. [Backend einrichten](#backend-einrichten)
5. [Datenbank einrichten](#datenbank-einrichten)
6. [Anwendung starten](#anwendung-starten)
7. [Entwicklung und Tests](#entwicklung-und-tests)
8. [Build für Produktion](#build-für-produktion)
9. [Deployment auf lokalem Server](#deployment-auf-lokalem-server)
10. [Fehlerbehebung](#fehlerbehebung)

## Voraussetzungen

Stellen Sie sicher, dass folgende Software installiert ist:

- [Node.js](https://nodejs.org/) (Version 16.x oder höher)
- [PHP](https://www.php.net/) (Version 8.0 oder höher)
- [MySQL](https://www.mysql.com/) oder [MariaDB](https://mariadb.org/) (Version 10.x oder höher)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [XAMPP](https://www.apachefriends.org/) oder [WAMP](https://www.wampserver.com/) (für lokalen PHP-Server)

## Repository klonen

1. Öffnen Sie Ihre Kommandozeile/Terminal
2. Navigieren Sie zum gewünschten Installationsordner
3. Führen Sie den Befehl aus:

```bash
git clone https://github.com/ihr-repo/keyeff-call-panel.git
cd keyeff-call-panel
```

## Frontend einrichten

1. Öffnen Sie das Projekt in Visual Studio Code:

```bash
code .
```

2. Installieren Sie die Frontend-Abhängigkeiten:

```bash
npm install
```

3. Erstellen Sie eine `.env` Datei im Hauptverzeichnis des Projekts mit folgenden Inhalten:

```env
VITE_API_URL=http://localhost:8080
```

## Backend einrichten

1. Navigieren Sie zum `backend`-Ordner im Projekt:

```bash
cd backend
```

2. Erstellen Sie eine Kopie der Konfigurationsvorlage:

```bash
cp config/config.sample.php config/config.php
```

3. Bearbeiten Sie `config/config.php` und aktualisieren Sie die Datenbank-Einstellungen:

```php
// Datenbank-Konfiguration
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'ihr_username');
define('DB_PASSWORD', 'ihr_passwort');
define('DB_DATABASE', 'keyeff_callpanel');

// JWT Secret für Authentifizierung
define('JWT_SECRET', 'ein_sicherer_zufaelliger_string');
define('JWT_EXPIRE', 86400); // 24 Stunden in Sekunden
```

4. Platzieren Sie den gesamten `backend`-Ordner in Ihrem lokalen Webserver-Verzeichnis:
   - Bei XAMPP: `C:/xampp/htdocs/keyeff-backend`
   - Bei WAMP: `C:/wamp/www/keyeff-backend`

5. Konfigurieren Sie den Webserver, um CORS-Anfragen von Ihrem Frontend zu erlauben, indem Sie die `.htaccess` Datei anpassen oder eine erstellen, falls noch nicht vorhanden:

```apache
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
```

## Datenbank einrichten

1. Erstellen Sie eine neue MySQL-Datenbank:
   
   - Öffnen Sie phpMyAdmin (http://localhost/phpmyadmin)
   - Erstellen Sie eine neue Datenbank namens `keyeff_callpanel`
   - Wählen Sie die Datenbank aus

2. Importieren Sie das Datenbankschema:
   
   - Gehen Sie zum Tab "Import"
   - Wählen Sie die Datei `backend/sql/database.sql` aus
   - Klicken Sie auf "Ausführen"

3. Importieren Sie die Filialen-Daten:
   
   - Gehen Sie erneut zum Tab "Import"
   - Wählen Sie die Datei `backend/sql/filialen.sql` aus
   - Klicken Sie auf "Ausführen"

4. Überprüfen Sie, ob die Tabellen korrekt erstellt wurden.

## Anwendung starten

### Frontend starten (Entwicklungsmodus)

1. Navigieren Sie zum Hauptverzeichnis des Projekts
2. Führen Sie den Befehl aus:

```bash
npm run dev
```

3. Die Anwendung wird unter `http://localhost:5173` verfügbar sein

### Backend prüfen

1. Öffnen Sie einen Browser und rufen Sie `http://localhost:8080/keyeff-backend/api/auth/verify.php` auf
2. Sie sollten eine JSON-Antwort sehen, die anzeigt, dass der Server läuft

## Entwicklung und Tests

### Login-Daten für Tests

Verwenden Sie die folgenden Anmeldeinformationen für Tests:

- **Admin**: admin@keyeff.de / password
- **Telefonist**: telefonist@keyeff.de / password  
- **Filialleiter**: filialleiter@keyeff.de / password

### Änderungen am Frontend

Nachdem Sie Änderungen am Frontend-Code vorgenommen haben, werden diese automatisch durch den Vite Development Server aktualisiert.

### Änderungen am Backend

Bei Änderungen an PHP-Dateien müssen Sie lediglich die Seite im Browser aktualisieren, um die Änderungen zu sehen.

### Änderungen an der Datenbank

Wenn Sie Änderungen am Datenbankschema vornehmen:

1. Aktualisieren Sie die Datei `backend/sql/database.sql`
2. Führen Sie die entsprechenden SQL-Befehle manuell über phpMyAdmin aus

## Build für Produktion

### Frontend build erstellen

1. Navigieren Sie zum Hauptverzeichnis des Projekts
2. Führen Sie den Befehl aus:

```bash
npm run build
```

3. Die optimierten Dateien werden im `dist`-Verzeichnis erstellt

## Deployment auf lokalem Server

Um die Anwendung als Produktionsversion auf dem lokalen Server zu deployen und CORS-Probleme zu vermeiden:

1. Erstellen Sie einen Build wie oben beschrieben
2. Kopieren Sie den Inhalt des `dist`-Ordners in einen neuen Ordner im Webserver-Verzeichnis:
   - Bei XAMPP: `C:/xampp/htdocs/keyeff`
   - Bei WAMP: `C:/wamp/www/keyeff`

3. Kopieren Sie den `backend`-Ordner in denselben Ordner:
   - Bei XAMPP: `C:/xampp/htdocs/keyeff/backend`
   - Bei WAMP: `C:/wamp/www/keyeff/backend`

4. Erstellen Sie eine `.htaccess` Datei im Hauptverzeichnis (`keyeff`) mit folgendem Inhalt:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /keyeff/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /keyeff/index.html [L]
</IfModule>
```

5. Aktualisieren Sie die `.env` Datei im Hauptverzeichnis Ihres Projekts bevor Sie den Build erstellen:

```env
VITE_API_URL=/keyeff
```

6. Erstellen Sie den Build erneut und kopieren Sie ihn wie in den Schritten 1-2 beschrieben.

7. Die Anwendung ist nun unter `http://localhost/keyeff` verfügbar und die API unter `http://localhost/keyeff/backend/api`.

## Dummy-Daten löschen (für Produktionsumgebung)

Sobald die Entwicklungs- und Testphase abgeschlossen ist, können Sie alle Dummy-Daten aus der Datenbank entfernen, bevor Sie in die Produktion wechseln:

1. Verwenden Sie das neu erstellte Admin-Tool zum Löschen von Dummy-Daten (zugänglich nur für Admin-Benutzer)
2. Oder führen Sie die folgenden SQL-Befehle aus:

```sql
-- Dummy-Kunden löschen
DELETE FROM customers WHERE import_source = 'manual' AND id > 3;

-- Dummy-Anrufe löschen
TRUNCATE TABLE call_logs;

-- Dummy-Termine löschen
TRUNCATE TABLE appointments;

-- Dummy-Kampagnen löschen
TRUNCATE TABLE campaigns;
TRUNCATE TABLE campaign_customers;

-- Reset der Auto-Increment-Werte
ALTER TABLE call_logs AUTO_INCREMENT = 1;
ALTER TABLE appointments AUTO_INCREMENT = 1;
ALTER TABLE campaigns AUTO_INCREMENT = 1;
```

## Fehlerbehebung

### Frontend kann nicht mit Backend kommunizieren

1. Überprüfen Sie die `.env` Datei und stellen Sie sicher, dass `VITE_API_URL` korrekt gesetzt ist
2. Vergewissern Sie sich, dass Ihr Backend-Server läuft
3. Überprüfen Sie die CORS-Konfiguration in der `.htaccess` Datei des Backends

### Datenbank-Verbindungsfehler

1. Überprüfen Sie die Datenbank-Einstellungen in `backend/config/config.php`
2. Stellen Sie sicher, dass der MySQL/MariaDB-Server läuft
3. Überprüfen Sie, ob die Datenbank `keyeff_callpanel` existiert

### PHP-Fehler

1. Aktivieren Sie die PHP-Fehleranzeige für die Entwicklung:
   - Bearbeiten Sie die PHP-Konfiguration (php.ini)
   - Setzen Sie `display_errors = On` und `error_reporting = E_ALL`
2. Überprüfen Sie die Webserver-Logs für detaillierte Fehlerinformationen

### Die Anwendung wird nach dem Build nicht korrekt angezeigt

1. Überprüfen Sie, ob alle Dateien korrekt in das Webserver-Verzeichnis kopiert wurden
2. Stellen Sie sicher, dass die `.htaccess` Datei korrekt konfiguriert ist
3. Löschen Sie den Browser-Cache oder öffnen Sie die Seite im Inkognito-Modus

Bei weiteren Problemen, überprüfen Sie die Konsolenausgabe des Browsers (F12) auf JavaScript-Fehler oder die Netzwerk-Anfragen auf API-Fehler.
