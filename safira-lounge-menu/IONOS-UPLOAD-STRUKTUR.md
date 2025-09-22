# IONOS Upload-Struktur - EXAKTE ANLEITUNG

## ⚠️ WICHTIG: Die Domain zeigt auf ROOT, nicht auf /safira!

Das ist das Problem! Die Struktur muss anders sein:

## Korrekte Upload-Struktur:

```
/ (IONOS Webspace Root - hierauf zeigt test.safira-lounge.de)
│
├── index.html              ← React App (aus build/)
├── .htaccess              ← Routing Rules (aus build/)
├── manifest.json
├── asset-manifest.json
│
├── static/                ← JS/CSS Dateien
│   ├── css/
│   │   └── main.*.css
│   └── js/
│       └── main.*.js
│
├── images/                ← Bilder
│   └── safira_logo.png
│
├── videos/                ← Videos
│
├── fonts/                 ← Schriftarten
│
├── api/                   ← PHP Backend
│   ├── index.php
│   ├── config.php
│   ├── .htaccess
│   ├── test-connection.php
│   └── endpoints/
│       ├── products.php
│       ├── categories.php
│       ├── settings.php
│       └── auth.php
│
└── diagnostic.php         ← Diagnose-Script

```

## Upload-Schritte für FileZilla:

### 1. Verbindung herstellen
- Server: Ihre IONOS FTP-Adresse
- Benutzer: Ihr FTP-Benutzer
- Passwort: Ihr FTP-Passwort
- Port: 21

### 2. LÖSCHEN Sie zuerst den /safira Ordner
Der ist falsch! Die Domain zeigt auf ROOT.

### 3. Upload ins ROOT-Verzeichnis:

#### A) Frontend-Dateien (aus safira-deployment-http/):
Laden Sie diese Dateien/Ordner direkt ins ROOT:
- ✅ index.html
- ✅ .htaccess
- ✅ manifest.json
- ✅ asset-manifest.json
- ✅ static/ (kompletter Ordner)
- ✅ images/ (kompletter Ordner)
- ✅ videos/ (kompletter Ordner)
- ✅ fonts/ (kompletter Ordner)

#### B) API (aus safira-deployment-http/api/):
- ✅ api/ (kompletter Ordner ins ROOT)

#### C) Diagnostic Script:
- ✅ diagnostic.php (ins ROOT)

### 4. WICHTIG: Keine Unterordner!
- ❌ NICHT: /safira/index.html
- ✅ RICHTIG: /index.html (direkt im Root)

- ❌ NICHT: /safira/api/
- ✅ RICHTIG: /api/ (direkt im Root)

## Nach dem Upload testen:

1. **Diagnostic**: http://test.safira-lounge.de/diagnostic.php
2. **Frontend**: http://test.safira-lounge.de/
3. **API Test**: http://test.safira-lounge.de/api/test-connection.php

## Falls die Domain doch auf /safira zeigen soll:

Dann müssen wir neu bauen mit:
```bash
PUBLIC_URL=/ npm run build
```

Und die .env.production anpassen!

---

**AKTUELL**: Die Domain zeigt auf ROOT, daher müssen ALLE Dateien ins ROOT!