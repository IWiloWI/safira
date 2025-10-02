#!/bin/bash

# Deploy Videos und .htaccess Script für Safira Lounge
echo "🎬 Deploying Videos to test.safira-lounge.de..."

# Erstelle temporäres tar-Archiv mit Videos und .htaccess
echo "📦 Creating deployment archive..."
cd safira
tar -czf ../videos-deployment.tar.gz videos/ .htaccess

# Upload zur Server
echo "📤 Uploading to server..."
cd ..
scp videos-deployment.tar.gz your-server:/path/to/safira/

echo "🚀 Videos und .htaccess erfolgreich gepackt!"
echo "📋 Manuelle Server-Schritte:"
echo "1. SSH zu Server: ssh your-server"
echo "2. Navigate zu safira Verzeichnis: cd /path/to/safira/"
echo "3. Extract: tar -xzf videos-deployment.tar.gz"
echo "4. Test Video URL: curl -I 'http://test.safira-lounge.de/safira/videos/Home_Rosen_Background_2.mp4'"
echo "5. Erwarteter Content-Type: video/mp4"

# Cleanup
rm videos-deployment.tar.gz

echo "✅ Deployment vorbereitet!"