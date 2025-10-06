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

// Add version query parameter to CSS and JS files
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

// Write to dist directory or overwrite original
writeFileSync(indexPath, html);

console.log('✅ Cache-busting version injected into index.html');
console.log(`   Version: ${version}`);

