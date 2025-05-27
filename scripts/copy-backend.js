
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

console.log('Kopiere Backend-Dateien zur Produktionsstruktur...');

// Stelle sicher, dass das Zielverzeichnis existiert
if (!existsSync('htdocs')) {
  mkdirSync('htdocs', { recursive: true });
}

if (!existsSync('htdocs/keyeff_callpanel')) {
  mkdirSync('htdocs/keyeff_callpanel', { recursive: true });
}

// Kopiere Backend-Dateien direkt in keyeff_callpanel/backend
copyRecursive('backend', 'htdocs/keyeff_callpanel/backend');
console.log('Backend-Dateien erfolgreich nach htdocs/keyeff_callpanel/backend kopiert!');

console.log('');
console.log('Produktionsstruktur erstellt:');
console.log('htdocs/keyeff_callpanel/');
console.log('├── backend/ (PHP Backend)');
console.log('└── public/  (Frontend Build Output - Document Root)');
console.log('');
console.log('Nächste Schritte für XAMPP:');
console.log('1. Kopiere den gesamten htdocs/keyeff_callpanel Ordner in dein XAMPP htdocs Verzeichnis');
console.log('2. Stelle sicher, dass PHP und MySQL in XAMPP aktiviert sind');
console.log('3. Öffne http://localhost/keyeff_callpanel/public in deinem Browser');
console.log('4. Konfiguriere die Datenbankverbindung in backend/config/database.php falls nötig');
