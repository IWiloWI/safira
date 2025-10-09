#!/usr/bin/env node

/**
 * Category Image Optimization Script
 * Compresses and creates responsive versions of category images using Sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

console.log(`${colors.blue}=== Category Image Optimization ===${colors.reset}\n`);

// Configuration
const INPUT_DIR = path.join(__dirname, '../public/images');
const OUTPUT_DIR = path.join(__dirname, '../public/images/categories');
const SIZES = [300, 600, 900];

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`${colors.green}Created output directory: ${OUTPUT_DIR}${colors.reset}\n`);
}

// Find all category images
const files = fs.readdirSync(INPUT_DIR);
const categoryImages = files.filter(file =>
  file.startsWith('category_') && file.endsWith('.webp')
);

console.log(`${colors.yellow}Found ${categoryImages.length} category images to optimize${colors.reset}\n`);

// Track totals
let totalOriginalSize = 0;
let totalNewSize = 0;
const sqlStatements = [];

// Process each image
async function processImage(filename) {
  const inputPath = path.join(INPUT_DIR, filename);

  // Extract category ID from filename
  const match = filename.match(/category_(\d+)_/);
  if (!match) {
    console.log(`${colors.red}Warning: Could not extract category ID from ${filename}${colors.reset}`);
    return;
  }

  const categoryId = match[1];
  console.log(`${colors.green}Processing: ${filename} (Category ID: ${categoryId})${colors.reset}`);

  // Get original file size
  const originalSize = fs.statSync(inputPath).size;
  totalOriginalSize += originalSize;

  // Process each size
  for (const size of SIZES) {
    const outputFilename = `category_${categoryId}_${size}w.webp`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      console.log(`  ${colors.yellow}⏭  Skipping ${outputFilename} (already exists)${colors.reset}`);
      continue;
    }

    console.log(`  ${colors.blue}📦 Creating ${size}w version...${colors.reset}`);

    try {
      // Resize and optimize with Sharp
      await sharp(inputPath)
        .resize(size, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({
          quality: 85,
          effort: 6
        })
        .toFile(outputPath);

      // Get new file size
      const newSize = fs.statSync(outputPath).size;
      totalNewSize += newSize;

      const originalKB = Math.round(originalSize / 1024);
      const newKB = Math.round(newSize / 1024);
      const savings = Math.round(100 - (newSize * 100 / originalSize));

      console.log(`  ${colors.green}✅ Created: ${outputFilename}${colors.reset}`);
      console.log(`     Original: ${originalKB}KB → New: ${newKB}KB (${savings}% smaller)`);
    } catch (error) {
      console.error(`  ${colors.red}❌ Error processing ${outputFilename}: ${error.message}${colors.reset}`);
    }
  }

  // Generate SQL update statement
  sqlStatements.push(
    `UPDATE categories SET image = '/images/categories/category_${categoryId}_600w.webp' WHERE id = ${categoryId};`
  );

  console.log('');
}

// Main execution
async function main() {
  try {
    // Process all images sequentially
    for (const filename of categoryImages) {
      await processImage(filename);
    }

    // Print summary
    console.log(`${colors.green}=== Optimization Complete! ===${colors.reset}\n`);

    const totalSavings = Math.round(100 - (totalNewSize * 100 / totalOriginalSize));
    console.log(`${colors.blue}Summary:${colors.reset}`);
    console.log(`  Original total: ${Math.round(totalOriginalSize / 1024)}KB`);
    console.log(`  New total: ${Math.round(totalNewSize / 1024)}KB`);
    console.log(`  Total savings: ${totalSavings}%\n`);

    // Print SQL statements
    if (sqlStatements.length > 0) {
      console.log(`${colors.yellow}Database Update SQL:${colors.reset}`);
      console.log('-- Run these SQL statements to update your database:\n');
      sqlStatements.forEach(sql => console.log(sql));
      console.log('');

      // Save SQL to file
      const sqlFile = path.join(__dirname, 'update-category-images.sql');
      fs.writeFileSync(sqlFile, sqlStatements.join('\n'));
      console.log(`${colors.green}SQL statements saved to: ${sqlFile}${colors.reset}\n`);
    }

    console.log(`${colors.green}Done!${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Check if Sharp is available
try {
  require.resolve('sharp');
  main();
} catch (error) {
  console.error(`${colors.red}Error: Sharp is not installed${colors.reset}`);
  console.log('Install with: npm install sharp');
  process.exit(1);
}
