#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Generate version based on current timestamp
const version = Date.now();

console.log(`🔨 Building with cache-busting version: ${version}`);

// Read index.html
const indexPath = join(__dirname, 'index.html');
let html = readFileSync(indexPath, 'utf-8');

// Add version query parameter to CSS and JS files in HTML
html = html.replace(
  /href="([^"]+\.css)"/g,
  `href="$1?v=${version}"`
);

html = html.replace(
  /src="([^"]+\.js)"/g,
  `src="$1?v=${version}"`
);

html = html.replace(
  /href="([^"]+\.svg)"/g,
  `href="$1?v=${version}"`
);

// Write updated HTML
writeFileSync(indexPath, html);

console.log('✅ Cache-busting version injected into index.html');

// Process JavaScript files to version their imports
const jsFiles = ['app.js', 'ui.js', 'firebase-service.js', 'firebase-config.js'];

jsFiles.forEach(file => {
  const filePath = join(__dirname, file);
  try {
    let content = readFileSync(filePath, 'utf-8');

    // Add version to ES6 imports: from './file.js' -> from './file.js?v=timestamp'
    content = content.replace(
      /from\s+['"](\.[^'"]+\.js)['"]/g,
      `from '$1?v=${version}'`
    );

    // Add version to dynamic imports: import('./file.js') -> import('./file.js?v=timestamp')
    content = content.replace(
      /import\s*\(\s*['"](\.[^'"]+\.js)['"]\s*\)/g,
      `import('$1?v=${version}')`
    );

    writeFileSync(filePath, content);
    console.log(`✅ Cache-busting version injected into ${file}`);
  } catch (error) {
    // File might not exist, skip it
    if (error.code !== 'ENOENT') {
      console.warn(`⚠️  Could not process ${file}: ${error.message}`);
    }
  }
});

console.log(`\n🎉 Build complete! Version: ${version}`);
