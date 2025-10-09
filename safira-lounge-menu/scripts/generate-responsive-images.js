#!/usr/bin/env node
/**
 * Generate Responsive Images Script
 *
 * Converts category images to WebP format and generates multiple sizes
 * for responsive image loading (srcset).
 *
 * Sizes generated:
 * - 300w: Mobile portrait
 * - 600w: Mobile landscape / Tablet
 * - 900w: Desktop
 * - 1200w: Retina desktop
 *
 * Usage: node scripts/generate-responsive-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_DIR = path.join(__dirname, '../public/images/Produktkategorien');
const OUTPUT_DIR = path.join(__dirname, '../public/images/categories');
const SIZES = [300, 600, 900, 1200];
const WEBP_QUALITY = 82;

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`✅ Created output directory: ${OUTPUT_DIR}`);
}

/**
 * Generate filename for responsive image
 */
function getOutputFilename(inputFile, width) {
  const baseName = path.basename(inputFile, path.extname(inputFile))
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  return `${baseName}_${width}w.webp`;
}

/**
 * Process single image
 */
async function processImage(inputPath, outputDir) {
  const fileName = path.basename(inputPath);
  console.log(`\n📸 Processing: ${fileName}`);

  const stats = fs.statSync(inputPath);
  const originalSizeKB = (stats.size / 1024).toFixed(2);
  console.log(`   Original size: ${originalSizeKB} KB`);

  let totalSaved = 0;

  for (const width of SIZES) {
    const outputFileName = getOutputFilename(inputPath, width);
    const outputPath = path.join(outputDir, outputFileName);

    try {
      await sharp(inputPath)
        .resize(width, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: WEBP_QUALITY })
        .toFile(outputPath);

      const outputStats = fs.statSync(outputPath);
      const outputSizeKB = (outputStats.size / 1024).toFixed(2);
      const saved = stats.size - outputStats.size;
      totalSaved += saved;

      console.log(`   ✅ ${width}w: ${outputSizeKB} KB (saved ${(saved / 1024).toFixed(2)} KB)`);
    } catch (error) {
      console.error(`   ❌ Error generating ${width}w:`, error.message);
    }
  }

  const totalSavedKB = (totalSaved / 1024).toFixed(2);
  const savingsPercent = ((totalSaved / (stats.size * SIZES.length)) * 100).toFixed(1);
  console.log(`   💾 Total saved: ${totalSavedKB} KB (${savingsPercent}%)`);

  return {
    original: fileName,
    originalSize: stats.size,
    totalSaved: totalSaved,
    sizes: SIZES
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('🖼️  Responsive Image Generator\n');
  console.log(`Input:  ${INPUT_DIR}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Sizes:  ${SIZES.join('w, ')}w`);
  console.log(`Quality: ${WEBP_QUALITY}\n`);
  console.log('─'.repeat(60));

  // Get all JPG files
  const files = fs.readdirSync(INPUT_DIR)
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .map(file => path.join(INPUT_DIR, file));

  if (files.length === 0) {
    console.error('❌ No images found in input directory');
    process.exit(1);
  }

  console.log(`\nFound ${files.length} images to process\n`);

  const results = [];
  let totalOriginalSize = 0;
  let totalSaved = 0;

  // Process each image
  for (const file of files) {
    const result = await processImage(file, OUTPUT_DIR);
    results.push(result);
    totalOriginalSize += result.originalSize;
    totalSaved += result.totalSaved;
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Images processed:     ${results.length}`);
  console.log(`Total variants:       ${results.length * SIZES.length}`);
  console.log(`Original total size:  ${(totalOriginalSize / 1024).toFixed(2)} KB`);
  console.log(`New total size:       ${((totalOriginalSize - totalSaved) / 1024).toFixed(2)} KB`);
  console.log(`Total saved:          ${(totalSaved / 1024).toFixed(2)} KB`);
  console.log(`Savings:              ${((totalSaved / totalOriginalSize) * 100).toFixed(1)}%`);
  console.log('═'.repeat(60));

  // Generate manifest
  const manifest = {
    generated: new Date().toISOString(),
    sizes: SIZES,
    quality: WEBP_QUALITY,
    images: results.map(r => ({
      original: r.original,
      baseName: getOutputFilename(path.join(INPUT_DIR, r.original), '').replace(/_w\.webp$/, ''),
      sizes: r.sizes
    }))
  };

  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✅ Manifest saved: ${manifestPath}`);

  console.log('\n🎉 Image generation complete!');
  console.log(`\nNext steps:`);
  console.log(`1. Check generated images in: ${OUTPUT_DIR}`);
  console.log(`2. Update CategoryNavigation.tsx to use srcset`);
  console.log(`3. Upload images to server`);
  console.log(`4. Test responsive loading`);
}

// Run
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
