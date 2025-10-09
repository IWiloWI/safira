# Phase 2: Image Optimization Plan

**Datum:** 2025-10-06
**Lighthouse Finding:** 2,260 KiB Einsparpotenzial
**Priorität:** HIGH - Größter Performance-Impact

---

## 📊 Lighthouse Analyse

### Probleme identifiziert:

| Datei | Aktuelle Größe | Display Size | Problem | Einsparung |
|-------|----------------|--------------|---------|------------|
| category_11_175….webp | 623 KiB | 600x338 | 1920x1080 geladen | 590 KiB |
| category_10_175….jpg | 571 KiB | 600x338 | JPG statt WebP + falsche Größe | 538 KiB |
| category_1_175….webp | 483 KiB | 600x338 | 1920x1080 geladen | 450 KiB |
| category_2_175….webp | 452 KiB | 600x338 | 1920x1080 geladen | 419 KiB |
| safira_logo.png | 300 KiB | 757x300 | PNG statt WebP + 1920x761 | 263 KiB |

**Gesamt-Einsparung:** 2,260 KiB (2.2 MB!)

---

## 🎯 Optimierungsstrategie

### Problem 1: Bilder zu groß für Display-Größe
**Lösung:** Responsive Images mit `srcset` und `sizes`

**Aktuelle Situation:**
- Server liefert 1920x1080 Bilder
- Browser zeigt nur 600x338 an
- 67% der Pixel-Daten werden verschwendet

**Fix:**
```tsx
<img
  src="/images/category_1_600w.webp"
  srcset="
    /images/category_1_300w.webp 300w,
    /images/category_1_600w.webp 600w,
    /images/category_1_900w.webp 900w,
    /images/category_1_1200w.webp 1200w
  "
  sizes="(max-width: 768px) 100vw, 600px"
  alt="Category"
  loading="lazy"
/>
```

---

### Problem 2: Veraltete Formate (JPG, PNG)
**Lösung:** Konvertierung zu WebP

**Aktuell:**
- category_10 nutzt JPG (kein WebP)
- safira_logo nutzt PNG (300 KiB!)

**WebP Vorteile:**
- 25-35% kleiner als JPG
- 26% kleiner als PNG (bei transparenz)
- Bessere Kompression bei gleicher Qualität

---

### Problem 3: Unoptimierte Kompression
**Lösung:** WebP Quality-Optimierung

**Empfohlene Settings:**
- Photos/Kategorien: Quality 80-85
- Logos: Quality 90 (für Schärfe)
- Thumbnails: Quality 75

---

## 🛠️ Implementierungs-Schritte

### Option A: Serverseitiges Resize (Empfohlen)
**Vorteile:** Keine Code-Änderungen, vollautomatisch

**Setup:**
1. Sharp.js auf Server installieren
2. Image-Proxy Endpoint erstellen
3. Automatisches Resize on-the-fly

**Beispiel:** `/api/image?src=category_1.webp&width=600`

---

### Option B: Build-Time Optimization
**Vorteile:** Zero-Runtime-Kosten

**Setup:**
1. Bilder in verschiedenen Größen generieren
2. `srcset` manuell in Components
3. Build-Script für Image-Generierung

---

### Option C: CDN mit Image Optimization
**Vorteile:** Schnellste Lösung, Caching

**Provider:**
- Cloudflare Images
- Cloudinary
- imgix
- AWS CloudFront + Lambda@Edge

**Cost:** ~$5-20/Monat für kleine Sites

---

## 📋 Detaillierte Todos

### Todo 1: Logo Optimierung (5 Min)
**Datei:** `safira_logo.png` (300 KiB → 37 KiB)

**Schritte:**
1. Exportiere Logo in WebP (Quality 90)
2. Erstelle 3 Größen:
   - `safira_logo_300w.webp` (300px breit)
   - `safira_logo_600w.webp` (600px breit)
   - `safira_logo_900w.webp` (900px breit)
3. Update Code:
   ```tsx
   <img
     src="/images/safira_logo_600w.webp"
     srcset="
       /images/safira_logo_300w.webp 300w,
       /images/safira_logo_600w.webp 600w,
       /images/safira_logo_900w.webp 900w
     "
     sizes="(max-width: 768px) 220px, 280px"
     alt="Safira Lounge"
   />
   ```

**Einsparung:** 263 KiB (88% kleiner!)

---

### Todo 2: Category JPG → WebP (5 Min)
**Datei:** `category_10_175….jpg`

**Schritte:**
1. Konvertiere zu WebP (Quality 82)
2. Update in Datenbank/API
3. Teste Darstellung

**Einsparung:** 233 KiB

---

### Todo 3: Responsive Category Images (15 Min)
**Alle Category Images**

**Schritte:**
1. Generiere 4 Größen pro Bild:
   - 300w (Mobile Portrait)
   - 600w (Mobile Landscape / Tablet)
   - 900w (Desktop)
   - 1200w (Retina Desktop)

2. Update CategoryNavigation Component:
   ```tsx
   <img
     src={`/images/category_${id}_600w.webp`}
     srcset={`
       /images/category_${id}_300w.webp 300w,
       /images/category_${id}_600w.webp 600w,
       /images/category_${id}_900w.webp 900w,
       /images/category_${id}_1200w.webp 1200w
     `}
     sizes="(max-width: 768px) 100vw, 600px"
     alt={categoryName}
     loading={index < 2 ? 'eager' : 'lazy'}
   />
   ```

**Einsparung:** 1,459 KiB

---

### Todo 4: WebP Kompression erhöhen (5 Min)
**Existierende WebP Dateien**

**Schritte:**
1. Re-export mit Quality 80 (statt 95)
2. Visuelle Qualität prüfen
3. Deploy

**Einsparung:** ~305 KiB

---

## 🔧 Tools für Image-Optimierung

### Online Tools:
- **Squoosh.app** (Google) - Manual, kostenlos
- **TinyPNG** - Automatisch, kostenlos
- **Cloudflare Workers** - Automatisch, $5/Monat

### CLI Tools:
```bash
# Sharp (Node.js)
npm install sharp
sharp input.jpg -o output.webp --webp quality=82

# cwebp (Google)
cwebp -q 82 input.jpg -o output.webp

# ImageMagick
convert input.jpg -quality 82 output.webp
```

### Batch-Script Beispiel:
```bash
#!/bin/bash
# Generate responsive images

for file in images/category_*.{jpg,webp,png}; do
  filename=$(basename "$file" | cut -d. -f1)

  # 300w
  sharp "$file" --resize 300 --webp 82 -o "images/${filename}_300w.webp"

  # 600w
  sharp "$file" --resize 600 --webp 82 -o "images/${filename}_600w.webp"

  # 900w
  sharp "$file" --resize 900 --webp 82 -o "images/${filename}_900w.webp"

  # 1200w
  sharp "$file" --resize 1200 --webp 82 -o "images/${filename}_1200w.webp"
done
```

---

## 📈 Erwartete Ergebnisse

### Performance Metriken:

| Metrik | Vorher | Nachher | Verbesserung |
|--------|--------|---------|--------------|
| Total Image Size | 2,428 KiB | 168 KiB | **-93%** |
| LCP (Largest Contentful Paint) | ~3.2s | ~1.1s | **-66%** |
| FCP (First Contentful Paint) | ~1.8s | ~0.9s | **-50%** |
| Lighthouse Performance | 65 | 85-90 | **+20-25** |

### Mobile Impact:
- 3G: -8 Sekunden Ladezeit
- 4G: -3 Sekunden Ladezeit
- 5G: -1 Sekunde Ladezeit

---

## ⚠️ Vorsichtsmaßnahmen

### Vor der Implementierung:
1. ✅ Backup aller Original-Bilder
2. ✅ Test auf verschiedenen Geräten
3. ✅ Visuelle Qualität vergleichen
4. ✅ Git Commit vor Image-Ersetzung

### Rollback-Plan:
```bash
# Restore original images
cp backups/images/*.{jpg,png,webp} public/images/

# Revert code changes
git revert HEAD
```

---

## 🎯 Priorität & Zeitplan

### CRITICAL (Do First):
1. **Logo WebP Conversion** (5 min) - 263 KiB savings
2. **Category JPG → WebP** (5 min) - 233 KiB savings

**Quick Win:** 496 KiB in 10 Minuten!

### HIGH (Same Day):
3. **Responsive Category Images** (15 min) - 1,459 KiB savings

### MEDIUM (This Week):
4. **WebP Compression Tuning** (5 min) - 305 KiB savings

**Total Time:** 30 Minuten
**Total Savings:** 2,260 KiB (2.2 MB = 93% kleiner!)

---

## 📞 Nächste Schritte

### Sofort machbar (KEIN Code-Change):
1. Bilder mit Squoosh.app optimieren
2. Neue WebP-Dateien auf Server hochladen
3. Alte Dateien überschreiben
4. Lighthouse Re-Test

### Mit Code-Änderungen (Empfohlen):
1. Responsive Images generieren
2. `srcset` in Components implementieren
3. Build & Deploy
4. Lighthouse Score: 85-90+

**Welche Option bevorzugst du?**
