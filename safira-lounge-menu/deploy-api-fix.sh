#!/bin/bash

echo "🚀 Deploying Category Fix to IONOS..."
echo "======================================"

# Die aktualisierte API-Datei
LOCAL_FILE="/Users/umitgencay/Safira/safira-lounge-menu/safira-api-fixed.php"

# IONOS FTP Details (bitte ergänzen)
FTP_HOST="test.safira-lounge.de"
FTP_USER="DEIN_FTP_USER"  # Bitte ergänzen
FTP_PASS="DEIN_FTP_PASS"  # Bitte ergänzen
REMOTE_PATH="/safira-api-fixed.php"

echo "📁 Datei: $LOCAL_FILE"
echo "🌐 Server: $FTP_HOST"
echo "📂 Ziel: $REMOTE_PATH"
echo ""

# Prüfe ob die Datei existiert
if [ ! -f "$LOCAL_FILE" ]; then
    echo "❌ Fehler: Datei nicht gefunden!"
    exit 1
fi

echo "⚠️  WICHTIG: Du musst die FTP-Zugangsdaten im Skript ergänzen!"
echo ""
echo "Alternative: Manuelle Upload-Methoden:"
echo ""
echo "1️⃣  Via FileZilla (empfohlen):"
echo "   - Öffne FileZilla"
echo "   - Host: $FTP_HOST"
echo "   - Upload: $LOCAL_FILE → /"
echo ""
echo "2️⃣  Via IONOS File Manager:"
echo "   - Gehe zu: https://www.ionos.de/hosting/file-manager"
echo "   - Navigiere zu /htdocs/"
echo "   - Upload: $LOCAL_FILE"
echo ""
echo "3️⃣  Via curl (wenn FTP-Credentials bekannt):"
echo "   curl -T $LOCAL_FILE ftp://$FTP_HOST/$REMOTE_PATH --user USERNAME:PASSWORD"
echo ""

# Wenn FTP-Credentials vorhanden, uncomment:
# echo "📤 Uploading..."
# curl -T "$LOCAL_FILE" "ftp://$FTP_HOST$REMOTE_PATH" --user "$FTP_USER:$FTP_PASS"
# if [ $? -eq 0 ]; then
#     echo "✅ Upload erfolgreich!"
#     echo "🧪 Teste API..."
#     curl -s "http://test.safira-lounge.de/safira-api-fixed.php?action=products" | jq '.categories | length'
# else
#     echo "❌ Upload fehlgeschlagen!"
# fi
