# FTP Upload Guide - Responsive Images

**Ziel:** 44 responsive WebP-Bilder auf Server hochladen

---

## 📁 Was muss hochgeladen werden:

**Lokaler Pfad:**
```
/Users/umitgencay/Safira/safira-lounge-menu/public/images/categories/
```

**Enthält:**
- 44 WebP-Dateien (11 Kategorien × 4 Größen)
- 1 manifest.json (optional, für Dokumentation)

**Gesamt-Größe:** ~2.3 MB (vs 5.3 MB Original)

---

## 🎯 Server-Ziel:

**Server:** test.safira-lounge.de

**Ziel-Pfad:**
```
/images/categories/
```

**Wichtig:** Der `/images/` Ordner existiert bereits (dort liegt aktuell safira_logo.png)

---

## 📋 Upload-Optionen:

### Option 1: FileZilla (GUI) ⭐ EMPFOHLEN

1. **Verbinden:**
   - Host: `test.safira-lounge.de`
   - Port: `21` (FTP) oder `22` (SFTP)
   - Username: [dein FTP-User]
   - Password: [dein FTP-Passwort]

2. **Navigieren:**
   - Linke Seite (lokal): `/Users/umitgencay/Safira/safira-lounge-menu/public/images/`
   - Rechte Seite (server): `/images/`

3. **Upload:**
   - Rechtsklick auf `categories/` Ordner (links)
   - "Upload" wählen
   - Warten (~1-2 Minuten für 44 Dateien)

4. **Verifizieren:**
   - Rechte Seite: Prüfen ob `/images/categories/` existiert
   - Dateianzahl prüfen: 44 WebP + 1 JSON = 45 Dateien

---

### Option 2: Cyberduck (GUI, macOS)

1. **Neue Verbindung:**
   - Dropdown: FTP oder SFTP
   - Server: `test.safira-lounge.de`
   - Username & Password eingeben

2. **Drag & Drop:**
   - Navigiere zu `/images/` auf Server
   - Drag & Drop `/categories/` Ordner vom Finder

---

### Option 3: Terminal (SFTP/SCP) - Schnell

```bash
# Via SCP (wenn SSH aktiviert)
scp -r /Users/umitgencay/Safira/safira-lounge-menu/public/images/categories \
  username@test.safira-lounge.de:/pfad/zu/webroot/images/

# Via SFTP
sftp username@test.safira-lounge.de
cd /pfad/zu/webroot/images/
put -r /Users/umitgencay/Safira/safira-lounge-menu/public/images/categories
exit
```

---

### Option 4: cPanel File Manager

1. **cPanel Login:**
   - URL: `https://test.safira-lounge.de:2083` (oder dein Hoster-Panel)
   - Login mit Hosting-Zugangsdaten

2. **File Manager öffnen:**
   - Navigiere zu `public_html/images/` (oder webroot)

3. **Upload:**
   - "Upload" Button
   - Wähle alle 44 WebP-Dateien aus `/public/images/categories/`
   - Warten auf Upload

4. **Ordner erstellen:**
   - Falls `/images/categories/` nicht existiert:
   - "New Folder" → Name: `categories`
   - Dateien in den neuen Ordner verschieben

---

## ✅ Verification nach Upload:

### Test 1: Direkter URL-Zugriff
```bash
# Im Browser oder Terminal:
curl -I https://test.safira-lounge.de/images/categories/shisha-safira_600w.webp

# Erwartung: HTTP/1.1 200 OK
# Erwartung: Content-Type: image/webp
```

### Test 2: Alle Größen prüfen
```bash
# 300w
curl -I https://test.safira-lounge.de/images/categories/shisha-safira_300w.webp

# 600w
curl -I https://test.safira-lounge.de/images/categories/shisha-safira_600w.webp

# 900w
curl -I https://test.safira-lounge.de/images/categories/shisha-safira_900w.webp

# 1200w
curl -I https://test.safira-lounge.de/images/categories/shisha-safira_1200w.webp
```

### Test 3: Dateianzahl
```bash
# Via FTP/SFTP: Zähle Dateien in /images/categories/
# Sollte sein: 44 WebP + 1 JSON = 45 Dateien
```

---

## 📊 Upload-Checkliste:

- [ ] FTP-Zugangsdaten bereit
- [ ] Verbindung zu test.safira-lounge.de erfolgreich
- [ ] Navigiert zu `/images/` auf Server
- [ ] `categories/` Ordner hochgeladen (44 WebP-Dateien)
- [ ] Direkter URL-Test erfolgreich (Status 200)
- [ ] Alle 4 Größen erreichbar (300w, 600w, 900w, 1200w)

---

## ⏭️ Nächste Schritte nach Upload:

1. ✅ **SQL ausführen** (`database/update_responsive_image_urls.sql`)
   - Via phpMyAdmin
   - Updated 4 category image URLs

2. ✅ **Code Update** (CategoryNavigation.tsx)
   - Füge `srcset` hinzu
   - Browser wählt optimale Größe

3. ✅ **Build & Deploy**
   - `npm run build`
   - Upload build/ Ordner

4. ✅ **Lighthouse Test**
   - Erwartung: -1,459 KiB savings
   - Performance Score: +15-20 Punkte

---

## 🔒 Sicherheit:

**Backup vor Upload:**
```bash
# Backup existing /images/ folder on server (optional)
# Via FTP: Download /images/ folder to local backup
```

**Rollback:**
- Alte Images sind noch in `/images/category_*` vorhanden
- SQL Rollback via categories_backup_responsive_images table
- Kein Datenverlust-Risiko!

---

## 🎉 Bereit zum Upload!

**Geschätzte Zeit:** 5 Minuten
**Nächster Step:** Upload via FTP → SQL ausführen → Code Update
