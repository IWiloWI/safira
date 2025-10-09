/**
 * Image Optimization Script
 * Generates responsive images with optimal compression
 * Reduces image sizes by ~80% while maintaining quality
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  // Image sizes for responsive images
  sizes: [
    { width: 300, suffix: '_300w' },
    { width: 600, suffix: '_600w' },
    { width: 900, suffix: '_900w' },
    { width: 1200, suffix: '_1200w' }
  ],

  // WebP quality settings (lower = smaller files)
  quality: {
    high: 85,      // For hero images
    medium: 75,    // For category images
    low: 65        // For thumbnails
  },

  // Input/Output directories
  inputDir: path.join(__dirname, '../public/images'),
  outputDir: path.join(__dirname, '../public/images/optimized')
};

/**
 * Optimize a single image to multiple responsive sizes
 */
async function optimizeImage(inputPath, options = {}) {
  const {
    quality = CONFIG.quality.medium,
    generateResponsive = true
  } = options;

  const filename = path.basename(inputPath, path.extname(inputPath));
  const relativePath = path.relative(CONFIG.inputDir, path.dirname(inputPath));
  const outputPath = path.join(CONFIG.outputDir, relativePath);

  // Ensure output directory exists
  await fs.mkdir(outputPath, { recursive: true });

  const results = [];

  if (generateResponsive) {
    // Generate multiple sizes
    for (const size of CONFIG.sizes) {
      const outputFile = path.join(outputPath, `${filename}${size.suffix}.webp`);

      await sharp(inputPath)
        .resize(size.width, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({
          quality,
          effort: 6 // Max compression effort (0-6)
        })
        .toFile(outputFile);

      const stats = await fs.stat(outputFile);
      results.push({
        size: size.width,
        file: outputFile,
        bytes: stats.size,
        kb: Math.round(stats.size / 1024)
      });
    }
  } else {
    // Single optimized version
    const outputFile = path.join(outputPath, `${filename}.webp`);

    await sharp(inputPath)
      .webp({ quality, effort: 6 })
      .toFile(outputFile);

    const stats = await fs.stat(outputFile);
    results.push({
      file: outputFile,
      bytes: stats.size,
      kb: Math.round(stats.size / 1024)
    });
  }

  return results;
}

/**
 * Find all images in a directory
 */
async function findImages(dir, extensions = ['.jpg', '.jpeg', '.png', '.webp']) {
  const images = [];

  async function scan(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory() && entry.name !== 'optimized') {
        await scan(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.includes(ext)) {
          images.push(fullPath);
        }
      }
    }
  }

  await scan(dir);
  return images;
}

/**
 * Optimize all category images
 */
async function optimizeCategoryImages() {
  console.log('🖼️  Optimizing category images...\n');

  const categoryDir = path.join(CONFIG.inputDir, 'categories');

  try {
    const images = await findImages(categoryDir);
    console.log(`Found ${images.length} category images\n`);

    let totalOriginal = 0;
    let totalOptimized = 0;

    for (const imagePath of images) {
      const filename = path.basename(imagePath);
      const originalStats = await fs.stat(imagePath);
      totalOriginal += originalStats.size;

      console.log(`📁 ${filename} (${Math.round(originalStats.size / 1024)} KB)`);

      const results = await optimizeImage(imagePath, {
        quality: CONFIG.quality.medium,
        generateResponsive: true
      });

      for (const result of results) {
        totalOptimized += result.bytes;
        const savings = originalStats.size - result.bytes;
        const savingsPercent = Math.round((savings / originalStats.size) * 100);

        console.log(`  ✓ ${result.size}w: ${result.kb} KB (-${savingsPercent}%)`);
      }
      console.log('');
    }

    const totalSavings = totalOriginal - totalOptimized;
    const savingsPercent = Math.round((totalSavings / totalOriginal) * 100);

    console.log('✅ OPTIMIZATION COMPLETE\n');
    console.log(`Original:  ${Math.round(totalOriginal / 1024)} KB`);
    console.log(`Optimized: ${Math.round(totalOptimized / 1024)} KB`);
    console.log(`Saved:     ${Math.round(totalSavings / 1024)} KB (-${savingsPercent}%)\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

/**
 * Optimize specific images (for manual use)
 */
async function optimizeSpecific(imagePaths, quality = 'medium') {
  console.log('🖼️  Optimizing specific images...\n');

  for (const imagePath of imagePaths) {
    const fullPath = path.join(CONFIG.inputDir, imagePath);

    try {
      const filename = path.basename(fullPath);
      const originalStats = await fs.stat(fullPath);

      console.log(`📁 ${filename} (${Math.round(originalStats.size / 1024)} KB)`);

      const results = await optimizeImage(fullPath, {
        quality: CONFIG.quality[quality],
        generateResponsive: true
      });

      for (const result of results) {
        const savings = originalStats.size - result.bytes;
        const savingsPercent = Math.round((savings / originalStats.size) * 100);

        console.log(`  ✓ ${result.size}w: ${result.kb} KB (-${savingsPercent}%)`);
      }
      console.log('');

    } catch (error) {
      console.error(`❌ Error processing ${imagePath}:`, error.message);
    }
  }
}

/**
 * Generate srcset string for responsive images
 */
function generateSrcSet(imageName, basePath = '/images/optimized') {
  const name = path.basename(imageName, path.extname(imageName));

  return CONFIG.sizes
    .map(size => `${basePath}/${name}${size.suffix}.webp ${size.width}w`)
    .join(', ');
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === 'categories') {
    optimizeCategoryImages();
  } else if (args[0] === 'specific') {
    const images = args.slice(1);
    if (images.length === 0) {
      console.error('❌ Please provide image paths');
      console.log('Usage: node optimize-images.js specific path/to/image1.jpg path/to/image2.png');
      process.exit(1);
    }
    optimizeSpecific(images);
  } else {
    console.log('Usage:');
    console.log('  node optimize-images.js                    # Optimize all category images');
    console.log('  node optimize-images.js categories         # Same as above');
    console.log('  node optimize-images.js specific [paths]   # Optimize specific images');
  }
}

module.exports = {
  optimizeImage,
  optimizeCategoryImages,
  optimizeSpecific,
  generateSrcSet,
  CONFIG
};
