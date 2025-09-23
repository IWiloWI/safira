#!/bin/bash
# Upload the schema-corrected API to replace the debug version

echo "Uploading schema-corrected API..."

# Upload the corrected API file
curl -X POST "http://test.safira-lounge.de/safira-api-fixed.php" \
     -H "Content-Type: application/php" \
     --data-binary @builds/v3.8.2-php-fixed/safira-api-fixed.php

echo "Upload completed. Testing the API..."

# Test the API
curl -X GET "http://test.safira-lounge.de/safira-api-fixed.php?action=test"

echo -e "\n\nTesting category creation..."

# Test category creation
curl -X POST "http://test.safira-lounge.de/safira-api-fixed.php?action=create_category" \
     -H "Content-Type: application/json" \
     -d '{"name":{"de":"Test Kategorie","en":"Test Category","da":"Test Kategori"},"description":{"de":"Test Beschreibung","en":"Test Description","da":"Test Beskrivelse"}}'

echo -e "\n\nDone!"