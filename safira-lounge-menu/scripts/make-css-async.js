#!/usr/bin/env node
/**
 * Post-build script to make CSS non-render-blocking
 * Adds media="print" onload="this.media='all'" to CSS links
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../build/index.html');

console.log('Making CSS async in build/index.html...');

// Read the built index.html
let html = fs.readFileSync(indexPath, 'utf8');

// Replace CSS link tags to make them non-render-blocking
html = html.replace(
  /<link\s+href="([^"]+\.css)"\s+rel="stylesheet">/gi,
  '<link href="$1" rel="stylesheet" media="print" onload="this.media=\'all\'">'
);

// Add noscript fallback for CSS
html = html.replace(
  /<link\s+href="([^"]+\.css)"\s+rel="stylesheet"\s+media="print"\s+onload="this\.media='all'">/gi,
  '<link href="$1" rel="stylesheet" media="print" onload="this.media=\'all\'"><noscript><link href="$1" rel="stylesheet"></noscript>'
);

// Write back
fs.writeFileSync(indexPath, html, 'utf8');

console.log('✅ CSS links are now non-render-blocking!');
