# IONOS Deployment Guide - SSL Version

## 📦 Dateien zum Hochladen

### Lokale Dateien (auf deinem Mac):
```
/Users/umitgencay/Safira/safira-lounge-menu/
├── build/                    ← ALLE Dateien aus diesem Ordner
└── safira-api-fixed.php      ← API-Datei
```

## 🎯 IONOS Upload-Ziele

### Root-Verzeichnis (/)
Lade ALLE Dateien aus `build/` in das Root-Verzeichnis:

```
IONOS Root-Verzeichnis/
├── index.html               ← build/index.html
├── .htaccess                ← build/.htaccess (WICHTIG!)
├── static/                  ← build/static/ (kompletter Ordner)
│   ├── css/
│   ├── js/
│   └── media/
├── favicon.ico              ← build/favicon.ico
├── robots.txt               ← build/robots.txt
├── sitemap.xml              ← build/sitemap.xml
├── images/                  ← build/images/
└── safira-api-fixed.php     ← safira-api-fixed.php
```

## 📋 Upload-Schritte mit FileZilla

### 1. FTP-Verbindung einrichten:
- **Server:** test.safira-lounge.de (oder ftp.ionos.de)
- **Port:** 21 (FTP) oder 22 (SFTP - sicherer!)
- **Protokoll:** FTP oder SFTP
- **Benutzername:** [Dein IONOS FTP-User]
- **Passwort:** [Dein IONOS FTP-Passwort]

### 2. Alte Dateien sichern (wichtig!):
1. Auf IONOS verbinden
2. Alle Dateien im Root markieren
3. In einen Ordner "backup_2025-10-06" verschieben

### 3. Neue Dateien hochladen:

#### Option A: Drag & Drop (einfach)
1. Linke Seite (Lokal): Navigiere zu `/Users/umitgencay/Safira/safira-lounge-menu/build/`
2. Rechte Seite (Server): Root-Verzeichnis `/`
3. Markiere ALLE Dateien im build-Ordner (Cmd+A)
4. Ziehe sie auf die rechte Seite
5. Lade `safira-api-fixed.php` separat ins Root hoch

#### Option B: Manuell (kontrolliert)
1. **Lade .htaccess zuerst hoch** (sehr wichtig!)
   - Lokal: `build/.htaccess` → Server: `/.htaccess`

2. **Lade index.html hoch**
   - Lokal: `build/index.html` → Server: `/index.html`

3. **Lade static/ Ordner hoch**
   - Lokal: `build/static/` → Server: `/static/`

4. **Lade restliche Dateien hoch**
   - Lokal: `build/*` → Server: `/`

5. **Lade API-Datei hoch**
   - Lokal: `safira-api-fixed.php` → Server: `/safira-api-fixed.php`

## ✅ Nach dem Upload prüfen:

### 1. Wichtige Dateien kontrollieren:
```
IONOS Root sollte enthalten:
✓ .htaccess              (3.7 KB)
✓ index.html             (~2 KB)
✓ safira-api-fixed.php   (139 KB)
✓ static/js/main.*.js    (~237 KB)
✓ static/css/main.*.css  (~1.5 KB)
```

### 2. Browser-Test:
1. Browser-Cache leeren (Cmd+Shift+R)
2. Öffne: https://test.safira-lounge.de
3. Prüfe: Grünes Schloss-Symbol (SSL aktiv)
4. Console öffnen (F12) → Keine Fehler

### 3. API-Test:
- Öffne: https://test.safira-lounge.de/safira-api-fixed.php?action=test
- Erwartet: JSON mit "status": "success"

## 🔧 Troubleshooting

### Problem: Seite lädt nicht
- Lösung: Prüfe ob `.htaccess` hochgeladen wurde
- Prüfe Dateirechte: `.htaccess` sollte 644 sein

### Problem: "Mixed Content" Fehler
- Lösung: Prüfe dass alle URLs in .env auf HTTPS gesetzt sind
- Browser-Cache leeren

### Problem: API-Fehler
- Lösung: Prüfe CORS-Header in `safira-api-fixed.php`
- Stelle sicher dass URL auf HTTPS gesetzt ist (Zeile 69)

## 📝 Wichtige Hinweise

1. **.htaccess ist kritisch!**
   - Muss als erstes hochgeladen werden
   - Enthält HTTPS-Redirect und React-Routing

2. **Keine Dateien vergessen:**
   - Gesamter build/ Ordner muss hochgeladen werden
   - Alle Unterordner (static/, images/, etc.)

3. **API-URL in safira-api-fixed.php:**
   - Zeile 69: `Access-Control-Allow-Origin: https://test.safira-lounge.de`
   - Muss HTTPS sein!

## 🚀 Schnell-Deployment Script (Optional)

Du kannst auch ein FTP-Upload-Script erstellen:

```bash
# Via LFTP (wenn installiert)
lftp -e "
mirror -R build/ /
put safira-api-fixed.php
bye
" -u USERNAME,PASSWORD test.safira-lounge.de
```

## ✨ Fertig!

Nach erfolgreichem Upload:
- ✅ HTTPS funktioniert
- ✅ Back/Forward Cache aktiv
- ✅ API mit optimierten Headern
- ✅ Alle Performance-Optimierungen aktiv

Teste die Seite unter: https://test.safira-lounge.de
