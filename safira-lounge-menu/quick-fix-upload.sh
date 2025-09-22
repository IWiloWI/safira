#!/bin/bash

echo "🚀 Safira Lounge v3.8.2 - Schnelle Reparatur"
echo "============================================"

BUILD_DIR="/Users/umitgencay/Safira/safira-lounge-menu/builds/v3.8.2-php-fixed"

echo "📁 Überprüfe Build-Verzeichnis..."
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build-Verzeichnis nicht gefunden: $BUILD_DIR"
    exit 1
fi

echo "✅ Build-Verzeichnis gefunden"
echo ""

echo "📋 Zu hochladende Dateien:"
echo "Frontend → /safira/ Verzeichnis:"
ls -la "$BUILD_DIR" | grep -E "(index.html|static|images|videos|manifest.json|\.htaccess)"

echo ""
echo "API → Root Verzeichnis:"
ls -la "$BUILD_DIR" | grep "api-fixed.php"

echo ""
echo "🔧 NÄCHSTE SCHRITTE:"
echo "1. Alle Dateien AUSSER api-fixed.php ins /safira/ Verzeichnis uploaden"
echo "2. api-fixed.php ins ROOT-Verzeichnis uploaden"
echo "3. Frontend testen: http://test.safira-lounge.de/"
echo "4. API testen: http://test.safira-lounge.de/api-fixed.php?action=health"

echo ""
echo "📂 Upload-Struktur:"
echo "/safira/index.html"
echo "/safira/.htaccess"
echo "/safira/static/js/main.7220ac41.js"
echo "/safira/static/css/main.73148772.css"
echo "/safira/images/*"
echo "/safira/videos/*"
echo "/api-fixed.php (im Root!)"