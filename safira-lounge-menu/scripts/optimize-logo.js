#!/usr/bin/env node
/**
 * Optimize Safira logo - convert to WebP with multiple sizes
 * Input: safira_logo.png (300KB, 1920x761)
 * Output: Multiple WebP sizes for responsive loading
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '../public/images');
const OUTPUT_DIR = path.join(__dirname, '../public/images');
const INPUT_FILE = path.join(INPUT_DIR, 'safira_logo.png');

// Logo sizes for different viewports
const LOGO_SIZES = [
  { width: 280, suffix: '280w', quality: 85 }, // Desktop/tablet
  { width: 220, suffix: '220w', quality: 85 }, // Mobile
  { width: 120, suffix: '120w', quality: 85 }  // Small mobile/favicon
];

async function optimizeLogo() {
  console.log('🎨 Optimizing Safira logo...\n');

  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Logo not found: ${INPUT_FILE}`);
    process.exit(1);
  }

  // Get original dimensions
  const metadata = await sharp(INPUT_FILE).metadata();
  console.log(`Original: ${metadata.width}x${metadata.height} (${(fs.statSync(INPUT_FILE).size / 1024).toFixed(1)} KB)\n`);

  const generated = [];

  for (const size of LOGO_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `safira_logo_${size.suffix}.webp`);

    await sharp(INPUT_FILE)
      .resize(size.width, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: size.quality })
      .toFile(outputPath);

    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(1);

    console.log(`✅ ${size.suffix}: ${sizeKB} KB`);
    generated.push({
      width: size.width,
      file: `safira_logo_${size.suffix}.webp`,
      size: sizeKB
    });
  }

  console.log(`\n✅ Generated ${generated.length} optimized logo files!`);
  console.log('\nUsage in code:');
  console.log('<img');
  console.log('  src="/images/safira_logo_280w.webp"');
  console.log('  srcSet="');
  console.log('    /images/safira_logo_120w.webp 120w,');
  console.log('    /images/safira_logo_220w.webp 220w,');
  console.log('    /images/safira_logo_280w.webp 280w');
  console.log('  "');
  console.log('  sizes="(max-width: 768px) 220px, 280px"');
  console.log('  alt="Safira Lounge"');
  console.log('  fetchPriority="high"');
  console.log('/>');
}

optimizeLogo().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
