
import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';

const copyRecursive = (src, dest) => {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  
  const items = readdirSync(src);
  items.forEach(item => {
    const srcPath = join(src, item);
    const destPath = join(dest, item);
    
    if (statSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  });
};

console.log('Kopiere Backend-Dateien zur webapp-Struktur...');

// Stelle sicher, dass das webapp-Verzeichnis existiert
if (!existsSync('webapp')) {
  mkdirSync('webapp', { recursive: true });
}

// Kopiere Backend-Dateien in webapp/backend
copyRecursive('backend', 'webapp/backend');
console.log('Backend-Dateien erfolgreich nach webapp/backend kopiert!');

console.log('');
console.log('Webapp-Struktur erstellt:');
console.log('webapp/');
console.log('├── backend/ (PHP Backend)');
console.log('└── public/  (Frontend Build Output)');
console.log('');
console.log('Deployment-Anweisungen:');
console.log('1. Kopiere den gesamten webapp-Ordner auf deinen Server');
console.log('2. Setze den Document Root auf webapp/public/');
console.log('3. Stelle sicher, dass PHP und MySQL verfügbar sind');
console.log('4. Konfiguriere die Datenbankverbindung in webapp/backend/config/database.php');
console.log('5. Für lokale Tests: Kopiere webapp-Inhalt nach htdocs/keyeff/');
