# Deployment Instructions for test.safira-lounge.de

## Deployment-Struktur für IONOS (HTTP)

Diese Anleitung beschreibt das Deployment der Safira Lounge Menu App auf http://test.safira-lounge.de

### Wichtige URLs:
- **Frontend**: http://test.safira-lounge.de/safira
- **API**: http://test.safira-lounge.de/api
- **Domain zeigt auf**: `/safira` Verzeichnis im Webspace

## Upload-Struktur auf IONOS

```
Webspace Root/
├── safira/                    # <- Domain zeigt hierauf
│   ├── index.html             # React App Entry Point
│   ├── .htaccess              # SPA Routing Rules
│   ├── manifest.json
│   ├── static/                # React Build Dateien
│   │   ├── css/
│   │   └── js/
│   ├── images/                # Bilder
│   ├── videos/                # Videos
│   └── fonts/                 # Schriftarten
│
└── api/                       # PHP Backend (außerhalb von /safira)
    ├── index.php              # API Router
    ├── config.php             # Database Config
    ├── .htaccess              # API Routing
    ├── endpoints/             # API Endpoints
    │   ├── products.php
    │   ├── categories.php
    │   ├── settings.php
    │   └── auth.php
    └── test-connection.php    # DB Test Script
```

## Schritt-für-Schritt Deployment

### 1. Upload via FTP/FileZilla

1. **Verbindung zu IONOS herstellen**:
   - Server: Ihre IONOS FTP-Adresse
   - Benutzer: Ihr FTP-Benutzer
   - Passwort: Ihr FTP-Passwort
   - Port: 21 (oder wie von IONOS angegeben)

2. **Frontend Upload** (in `/safira` Verzeichnis):
   - Alle Dateien aus diesem Ordner AUSSER `/api`
   - Struktur beibehalten (static, images, videos, etc.)
   - `.htaccess` muss mit hochgeladen werden!

3. **API Upload** (in Root, NICHT in `/safira`):
   - Den kompletten `api` Ordner ins Root hochladen
   - Struktur: `/api` (parallel zu `/safira`)

### 2. Datenbank prüfen

Test der Datenbankverbindung:
```
http://test.safira-lounge.de/api/test-connection.php
```

Erwartete Antwort:
```json
{
  "status": "success",
  "message": "Database connection successful",
  "database": "dbs14708743",
  "host": "db5018522360.hosting-data.io"
}
```

### 3. API Endpoints testen

- **Produkte abrufen**: http://test.safira-lounge.de/api/products
- **Settings abrufen**: http://test.safira-lounge.de/api/settings
- **Health Check**: http://test.safira-lounge.de/api/health

### 4. Frontend testen

1. Öffnen Sie: http://test.safira-lounge.de/safira
2. Prüfen Sie:
   - Lädt die App?
   - Werden Produkte angezeigt?
   - Funktioniert die Navigation?
   - Admin-Login: http://test.safira-lounge.de/safira/admin

### 5. Admin-Zugang

- **URL**: http://test.safira-lounge.de/safira/admin
- **Username**: admin
- **Password**: safira2024

## Wichtige Hinweise

### HTTP vs HTTPS
- Aktuell läuft alles über HTTP (test.safira-lounge.de)
- Für Production mit SSL müssen die URLs in den Dateien angepasst werden

### CORS-Konfiguration
- API erlaubt nur Requests von `http://test.safira-lounge.de`
- Bei Domain-Änderungen muss `api/config.php` angepasst werden

### Session-Management
- PHP Sessions für Admin-Auth
- Cookies sind auf HTTP eingestellt (nicht secure)

### Performance
- Statische Assets werden gecached (.htaccess Regeln)
- Gzip-Kompression ist aktiviert

## Fehlerbehebung

### "Parking Page" wird angezeigt
- Prüfen Sie, ob die Domain auf `/safira` zeigt
- `.htaccess` muss vorhanden sein

### API gibt 404 zurück
- Prüfen Sie, ob `/api` im Root liegt (nicht in `/safira`)
- `.htaccess` in `/api` prüfen

### CORS-Fehler
- `api/config.php` prüfen - richtige Domain eingetragen?
- Browser-Cache leeren

### Keine Produkte sichtbar
- Datenbank-Verbindung testen
- Browser-Console auf Fehler prüfen
- API direkt aufrufen und Response prüfen

## Kontakt bei Problemen

Bei Problemen mit dem Deployment:
1. Browser-Console auf Fehler prüfen (F12)
2. API-Endpoints direkt testen
3. PHP Error-Logs auf IONOS prüfen

## Nach erfolgreichem Deployment

1. Alle Funktionen testen
2. Admin-Bereich prüfen
3. Produkte anlegen/bearbeiten testen
4. Mobile Ansicht testen

---

**Hinweis**: Diese Version ist für HTTP-Deployment optimiert. Für HTTPS-Production müssen alle URLs entsprechend angepasst werden.