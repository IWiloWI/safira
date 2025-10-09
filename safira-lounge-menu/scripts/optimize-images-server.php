<?php
/**
 * Server-Side Image Optimization Script
 * Upload this to your server and run via browser or CLI
 *
 * Usage: php optimize-images-server.php
 * Or: https://test.safira-lounge.de/optimize-images-server.php
 */

// Configuration
$INPUT_DIR = __DIR__ . '/images';
$OUTPUT_DIR = __DIR__ . '/images/categories';
$SIZES = [300, 600, 900];

// Create output directory
if (!file_exists($OUTPUT_DIR)) {
    mkdir($OUTPUT_DIR, 0755, true);
    echo "✅ Created output directory: $OUTPUT_DIR\n";
}

echo "=== Category Image Optimization ===\n\n";

// Find all category images
$files = glob($INPUT_DIR . '/category_*.webp');
echo "Found " . count($files) . " category images to optimize\n\n";

$totalOriginal = 0;
$totalNew = 0;
$sqlStatements = [];

// Process each image
foreach ($files as $inputPath) {
    $filename = basename($inputPath);

    // Extract category ID
    if (!preg_match('/category_(\d+)_/', $filename, $matches)) {
        echo "⚠️  Could not extract category ID from $filename\n";
        continue;
    }

    $categoryId = $matches[1];
    echo "📦 Processing: $filename (Category ID: $categoryId)\n";

    $originalSize = filesize($inputPath);
    $totalOriginal += $originalSize;

    // Load original image
    $sourceImage = imagecreatefromwebp($inputPath);
    if (!$sourceImage) {
        echo "❌ Failed to load $filename\n";
        continue;
    }

    $originalWidth = imagesx($sourceImage);
    $originalHeight = imagesy($sourceImage);

    // Process each size
    foreach ($SIZES as $size) {
        $outputFilename = "category_{$categoryId}_{$size}w.webp";
        $outputPath = $OUTPUT_DIR . '/' . $outputFilename;

        // Skip if exists
        if (file_exists($outputPath)) {
            echo "  ⏭  Skipping $outputFilename (already exists)\n";
            continue;
        }

        echo "  🔧 Creating {$size}w version...\n";

        // Calculate new dimensions
        $newWidth = $size;
        $newHeight = intval($originalHeight * ($size / $originalWidth));

        // Create resized image
        $resizedImage = imagecreatetruecolor($newWidth, $newHeight);

        // Enable transparency
        imagealphablending($resizedImage, false);
        imagesavealpha($resizedImage, true);

        // Resize
        imagecopyresampled(
            $resizedImage, $sourceImage,
            0, 0, 0, 0,
            $newWidth, $newHeight,
            $originalWidth, $originalHeight
        );

        // Save as WebP with quality 85
        imagewebp($resizedImage, $outputPath, 85);
        imagedestroy($resizedImage);

        $newSize = filesize($outputPath);
        $totalNew += $newSize;

        $originalKB = round($originalSize / 1024);
        $newKB = round($newSize / 1024);
        $savings = round(100 - ($newSize * 100 / $originalSize));

        echo "  ✅ Created: $outputFilename\n";
        echo "     Original: {$originalKB}KB → New: {$newKB}KB ({$savings}% smaller)\n";
    }

    imagedestroy($sourceImage);

    // Generate SQL
    $sqlStatements[] = "UPDATE categories SET image = '/images/categories/category_{$categoryId}_600w.webp' WHERE id = {$categoryId};";

    echo "\n";
}

// Summary
echo "=== Optimization Complete! ===\n\n";

$totalSavings = round(100 - ($totalNew * 100 / $totalOriginal));
echo "Summary:\n";
echo "  Original total: " . round($totalOriginal / 1024) . "KB\n";
echo "  New total: " . round($totalNew / 1024) . "KB\n";
echo "  Total savings: {$totalSavings}%\n\n";

// Save SQL
if (!empty($sqlStatements)) {
    $sqlFile = __DIR__ . '/update-category-images.sql';
    file_put_contents($sqlFile, implode("\n", $sqlStatements));

    echo "Database Update SQL:\n";
    echo "-- Run these SQL statements to update your database:\n\n";
    foreach ($sqlStatements as $sql) {
        echo "$sql\n";
    }
    echo "\n";
    echo "✅ SQL statements saved to: $sqlFile\n\n";
}

echo "Done! 🚀\n";
echo "\nNext Steps:\n";
echo "1. Run the SQL statements in your database\n";
echo "2. Test the images: https://test.safira-lounge.de/images/categories/\n";
echo "3. Clear browser cache and test Lighthouse again\n";
?>
