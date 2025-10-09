<?php
/**
 * Image Upload & Processing Endpoint
 *
 * Handles image uploads with automatic:
 * - WebP conversion
 * - Responsive size generation (300w, 600w, 900w, 1200w)
 * - Optimized compression
 *
 * Usage:
 * POST /api/image-upload
 * Body: { "image": "data:image/jpeg;base64,...", "name": "category-name" }
 *
 * Returns: { "success": true, "url": "/images/categories/name_600w.webp", "sizes": [...] }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/**
 * Generate slug from name
 */
function generateSlug($name) {
    $slug = strtolower($name);
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
    $slug = trim($slug, '-');
    return $slug;
}

/**
 * Process uploaded image
 */
function processImage($base64Image, $name) {
    // Validate base64
    if (!preg_match('/^data:image\/(jpeg|jpg|png|webp);base64,/', $base64Image, $matches)) {
        return ['success' => false, 'error' => 'Invalid image format'];
    }

    $imageType = $matches[1];
    $base64Data = preg_replace('/^data:image\/(jpeg|jpg|png|webp);base64,/', '', $base64Image);
    $imageData = base64_decode($base64Data);

    if ($imageData === false) {
        return ['success' => false, 'error' => 'Failed to decode image'];
    }

    // Create image resource from string
    $sourceImage = @imagecreatefromstring($imageData);
    if ($sourceImage === false) {
        return ['success' => false, 'error' => 'Failed to create image resource'];
    }

    // Get original dimensions
    $originalWidth = imagesx($sourceImage);
    $originalHeight = imagesy($sourceImage);

    // Generate slug for filename
    $slug = generateSlug($name);
    $timestamp = time();
    $baseFilename = $slug . '_' . $timestamp;

    // Output directory
    $outputDir = __DIR__ . '/../../public/images/categories/';

    // Create directory if it doesn't exist
    if (!file_exists($outputDir)) {
        mkdir($outputDir, 0755, true);
    }

    // Responsive sizes to generate
    $sizes = [
        ['width' => 300, 'suffix' => '300w', 'quality' => 82],
        ['width' => 600, 'suffix' => '600w', 'quality' => 82],
        ['width' => 900, 'suffix' => '900w', 'quality' => 82],
        ['width' => 1200, 'suffix' => '1200w', 'quality' => 82]
    ];

    $generatedFiles = [];
    $errors = [];

    // Generate each responsive size
    foreach ($sizes as $size) {
        $targetWidth = $size['width'];
        $targetHeight = (int)(($targetWidth / $originalWidth) * $originalHeight);

        // Don't upscale images
        if ($targetWidth > $originalWidth) {
            $targetWidth = $originalWidth;
            $targetHeight = $originalHeight;
        }

        // Create resized image
        $resizedImage = imagecreatetruecolor($targetWidth, $targetHeight);

        // Preserve transparency for PNG/WebP
        imagealphablending($resizedImage, false);
        imagesavealpha($resizedImage, true);

        // Resize
        imagecopyresampled(
            $resizedImage,
            $sourceImage,
            0, 0, 0, 0,
            $targetWidth,
            $targetHeight,
            $originalWidth,
            $originalHeight
        );

        // Generate filename
        $filename = $baseFilename . '_' . $size['suffix'] . '.webp';
        $filepath = $outputDir . $filename;

        // Save as WebP
        if (function_exists('imagewebp')) {
            $success = imagewebp($resizedImage, $filepath, $size['quality']);
        } else {
            // Fallback to JPEG if WebP not supported
            $filename = $baseFilename . '_' . $size['suffix'] . '.jpg';
            $filepath = $outputDir . $filename;
            $success = imagejpeg($resizedImage, $filepath, $size['quality']);
        }

        if ($success) {
            $generatedFiles[] = [
                'width' => $size['width'],
                'suffix' => $size['suffix'],
                'filename' => $filename,
                'url' => '/images/categories/' . $filename,
                'size' => filesize($filepath)
            ];
        } else {
            $errors[] = "Failed to generate {$size['suffix']}";
        }

        imagedestroy($resizedImage);
    }

    // Clean up
    imagedestroy($sourceImage);

    if (count($generatedFiles) === 0) {
        return [
            'success' => false,
            'error' => 'Failed to generate any image sizes',
            'details' => $errors
        ];
    }

    // Return the 600w URL as the default
    $defaultImage = array_filter($generatedFiles, function($img) {
        return $img['suffix'] === '600w';
    });
    $defaultUrl = reset($defaultImage)['url'] ?? $generatedFiles[0]['url'];

    return [
        'success' => true,
        'url' => $defaultUrl,
        'baseFilename' => $baseFilename,
        'sizes' => $generatedFiles,
        'originalSize' => strlen($imageData),
        'totalGenerated' => count($generatedFiles)
    ];
}

/**
 * Main handler
 */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['image']) || !isset($data['name'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Missing required fields: image and name'
        ]);
        exit;
    }

    $result = processImage($data['image'], $data['name']);

    if ($result['success']) {
        http_response_code(200);
        echo json_encode($result);
    } else {
        http_response_code(500);
        echo json_encode($result);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed. Use POST.'
    ]);
}
