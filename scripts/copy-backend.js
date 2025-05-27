
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

console.log('Copying backend files to production structure...');

// Ensure the destination directory exists
if (!existsSync('htdocs')) {
  mkdirSync('htdocs', { recursive: true });
}

if (!existsSync('htdocs/keyeff_callpanel')) {
  mkdirSync('htdocs/keyeff_callpanel', { recursive: true });
}

// Copy backend files
copyRecursive('backend', 'htdocs/keyeff_callpanel/backend');
console.log('Backend files copied successfully to htdocs/keyeff_callpanel/backend!');

console.log('');
console.log('Production structure created:');
console.log('htdocs/keyeff_callpanel/');
console.log('├── backend/ (PHP Backend - not publicly accessible)');
console.log('└── public/  (Frontend build output - Document Root)');
console.log('');
console.log('Next steps:');
console.log('1. Configure your web server to point Document Root to htdocs/keyeff_callpanel/public/');
console.log('2. Ensure htdocs/keyeff_callpanel/backend/ is NOT accessible from web');
console.log('3. Configure database connection in backend/config/database.php');
