# 🚀 IONOS Upload-Anweisung - Safira v3.8.2 PHP Hotfix

## KRITISCH: Richtige Datei-Platzierung

### 1. Frontend-Dateien → `/safira/` Verzeichnis:
```
/safira/index.html
/safira/.htaccess
/safira/static/...
/safira/images/...
/safira/videos/...
/safira/manifest.json
```

### 2. API-Datei → ROOT Verzeichnis (nicht /safira/):
```
/api-fixed.php  (im Hauptverzeichnis, NICHT in /safira/)
```

## ⚠️ WICHTIG: Die API muss außerhalb von /safira/ stehen!

**URL-Struktur:**
- Frontend: `http://test.safira-lounge.de/` (zeigt auf /safira/)
- API: `http://test.safira-lounge.de/api-fixed.php` (im Root)

## Upload-Schritte:

1. **Alle Dateien AUSSER api-fixed.php** → ins `/safira/` Verzeichnis
2. **Nur api-fixed.php** → ins Root-Verzeichnis (oberste Ebene)
3. **Alte API-Dateien löschen** (falls vorhanden):
   - /api/index.php
   - /api/config.php
   - /api/.htaccess

## Test nach Upload:
- `http://test.safira-lounge.de/` → Frontend
- `http://test.safira-lounge.de/api-fixed.php?action=health` → API Test