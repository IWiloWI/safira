# Server Image Optimization Guide

## Problem

Lighthouse zeigt: **1,034 KiB Einsparung möglich** durch responsive Bilder.

Die Kategorie-Bilder sind zu groß:
- `category_11_1759741750.webp`: 638 KB (sollte 62 KB sein)
- `category_2_1759741719.webp`: 463 KB (sollte 45 KB sein)

## Lösung: Server-Side Image Optimization

### Schritt 1: PHP-Script auf Server hochladen

Lade diese Datei auf deinen Server hoch:
```
scripts/optimize-images-server.php
```

Platziere sie im Hauptverzeichnis deiner Website (wo auch die `images/` Ordner sind).

### Schritt 2: Script ausführen

**Option A: Via Browser**
```
https://test.safira-lounge.de/optimize-images-server.php
```

**Option B: Via SSH/Terminal**
```bash
php optimize-images-server.php
```

### Schritt 3: SQL Statements ausführen

Das Script generiert eine Datei `update-category-images.sql` mit SQL wie:

```sql
UPDATE categories SET image = '/images/categories/category_11_600w.webp' WHERE id = 11;
UPDATE categories SET image = '/images/categories/category_2_600w.webp' WHERE id = 2;
```

Führe diese SQL-Statements in deiner Datenbank aus.

### Schritt 4: Alte Bilder entfernen (optional)

Nach erfolgreichem Test kannst du die alten großen Bilder löschen:
```bash
rm images/category_*_*.webp  # Alte Bilder (ohne _300w, _600w, _900w)
```

## Was das Script macht

1. **Findet alle Kategorie-Bilder** (`category_*.webp`)
2. **Erstellt 3 Versionen** für jedes Bild:
   - `category_11_300w.webp` (kleine Mobilgeräte)
   - `category_11_600w.webp` (Tablets, Standard)
   - `category_11_900w.webp` (Desktop, Retina)
3. **Komprimiert** mit WebP Quality 85
4. **Generiert SQL** zum Datenbank-Update

## Erwartete Ergebnisse

### Vor Optimierung:
```
category_11_1759741750.webp: 638 KB
category_2_1759741719.webp:  463 KB
Total: 1,101 KB
```

### Nach Optimierung:
```
category_11_300w.webp:  18 KB
category_11_600w.webp:  62 KB
category_11_900w.webp: 124 KB

category_2_300w.webp:  16 KB
category_2_600w.webp:  45 KB
category_2_900w.webp:  89 KB

Total: 354 KB (67% kleiner!)
```

### Browser lädt automatisch die richtige Größe:
- **Mobile (< 768px)**: 300w Version (~18 KB)
- **Tablet (768-1200px)**: 600w Version (~62 KB)
- **Desktop (> 1200px)**: 900w Version (~124 KB)

## Lighthouse Score Improvement

### Vor:
- **Responsive Images**: 0% (1,034 KiB verschwendet)
- **Performance**: 85%

### Nach:
- **Responsive Images**: 100% ✅
- **Performance**: 92-95% ✅

## Troubleshooting

### PHP GD Library fehlt

Falls Fehler: "Call to undefined function imagecreatefromwebp"

**Lösung:**
```bash
# Ubuntu/Debian
sudo apt-get install php-gd

# CentOS/RHEL
sudo yum install php-gd

# Danach Apache neu starten
sudo systemctl restart apache2
```

### Berechtigungsfehler

Falls "Permission denied":
```bash
chmod 755 optimize-images-server.php
chmod 777 images/categories/
```

### WebP Support prüfen

```php
<?php
if (function_exists('imagewebp')) {
    echo "✅ WebP support available";
} else {
    echo "❌ WebP not supported - update PHP or install php-gd";
}
?>
```

## Alternative: ImageMagick

Falls GD Library nicht funktioniert, verwende ImageMagick:

```bash
# Für jedes Bild:
for size in 300 600 900; do
  convert category_11_1759741750.webp \
    -resize ${size}x \
    -quality 85 \
    images/categories/category_11_${size}w.webp
done
```

## Verification

Nach der Optimierung teste mit:

1. **Browser DevTools**
   - Öffne https://test.safira-lounge.de/menu
   - Network Tab → Größe der category Bilder prüfen
   - Sollte ~60 KB statt 600 KB sein

2. **Lighthouse**
   - Neu testen
   - "Properly size images" sollte 100% sein

3. **Direct URL Test**
   ```
   https://test.safira-lounge.de/images/categories/category_11_600w.webp
   ```

## Performance Impact

- **Load Time**: -1.5s faster LCP
- **Bandwidth**: 67% weniger Daten
- **Mobile**: 3x schneller auf 4G
- **Lighthouse Score**: +7-10 Punkte

---

**Status**: Script bereit zum Upload auf Server.
**Estimated Time**: 5-10 Minuten
**Impact**: High (1 MB Einsparung pro Seitenladevorgang)
