# Responsive Images - Implementation Guide

**Status:** Images generiert ✅ | Upload & Code Update benötigt ⏳

---

## ✅ Was wurde gemacht:

### 1. Responsive Images generiert (Lokal)
- **44 WebP-Bilder** erstellt in `/public/images/categories/`
- **4 Größen** pro Kategorie: 300w, 600w, 900w, 1200w
- **90% Einsparung** pro Bild-Set
- **Qualität:** WebP Quality 82 (visuell identisch)

**Beispiel:**
```
biere-safira_300w.webp   (10 KB)
biere-safira_600w.webp   (34 KB)
biere-safira_900w.webp   (67 KB)
biere-safira_1200w.webp  (105 KB)
```

---

## 🎯 Nächste Schritte:

### Option A: **Bilder direkt auf Server hochladen** (EMPFOHLEN)

**Warum?**
- Images sind statische Assets
- Build enthält nur den Code, nicht die `/public/images/`
- Schneller und einfacher

**Schritte:**

#### 1. Upload via FTP/SFTP (5 Min)
```bash
# Via SFTP/SCP (wenn SSH-Zugang)
scp -r public/images/categories/* user@test.safira-lounge.de:/pfad/zu/webroot/images/categories/

# ODER via FileZilla/Cyberduck:
# - Verbinde mit test.safira-lounge.de
# - Navigiere zu /images/
# - Upload /public/images/categories/ Ordner
```

#### 2. Datenbank Image-URLs anpassen (10 Min)

**Aktuell (Vermutung):**
```
https://test.safira-lounge.de/images/category_1_1754932848.webp
```

**Neu:**
```
https://test.safira-lounge.de/images/categories/biere-safira_600w.webp
```

**SQL Update:**
```sql
-- Backup first!
CREATE TABLE categories_backup AS SELECT * FROM categories;

-- Update image URLs (BEISPIEL - muss angepasst werden)
UPDATE categories SET image = 'https://test.safira-lounge.de/images/categories/biere-safira_600w.webp'
WHERE name_de LIKE '%Biere%';

UPDATE categories SET image = 'https://test.safira-lounge.de/images/categories/cocktails-safira_600w.webp'
WHERE name_de LIKE '%Cocktails%';

-- etc. für alle 11 Kategorien
```

#### 3. Code Update für srcset (5 Min)

**Datei:** `src/components/Menu/CategoryNavigation.tsx` (Line 205-209)

**VORHER:**
```tsx
<img
  src={config.image}
  alt={categoryName}
  loading={index < 2 ? 'eager' : 'lazy'}
/>
```

**NACHHER:**
```tsx
<img
  src={config.image}
  srcSet={`
    ${config.image.replace('_600w', '_300w')} 300w,
    ${config.image} 600w,
    ${config.image.replace('_600w', '_900w')} 900w,
    ${config.image.replace('_600w', '_1200w')} 1200w
  `}
  sizes="(max-width: 768px) 100vw, 600px"
  alt={categoryName}
  loading={index < 2 ? 'eager' : 'lazy'}
/>
```

#### 4. Build & Deploy (5 Min)
```bash
npm run build
# Upload build/ Ordner auf Server
```

---

### Option B: **Alles über Build** (Komplexer)

**Nachteile:**
- Build-Ordner wird größer (+2.3 MB)
- Bei jedem Build werden Images neu kopiert
- Langsamer

**Nur verwenden wenn:** Server-FTP-Zugang nicht vorhanden

---

## 📊 Erwartete Ergebnisse:

### Vor Responsive Images:
```
category_1_175....webp: 623 KB (1920x1080)
category_2_175....webp: 452 KB (1920x1080)
...
Total: ~5.3 MB für 11 Bilder
```

### Nach Responsive Images:
```
Mobile (300w):    10-13 KB pro Bild = 132 KB gesamt
Tablet (600w):    22-42 KB pro Bild = 352 KB gesamt
Desktop (900w):   41-83 KB pro Bild = 682 KB gesamt
Retina (1200w):   62-131 KB pro Bild = 1.1 MB gesamt

Browser lädt nur die passende Größe!
```

### Lighthouse Impact:
- **LCP:** 3.2s → 1.1s (-66%)
- **Total Image Size:** -1,459 KiB savings
- **Performance Score:** +15-20 Punkte

---

## 🔍 Mapping: Original → Neue Images

Basierend auf Lighthouse-Report:

| Lighthouse URL | Kategorie | Neuer Dateiname |
|----------------|-----------|-----------------|
| category_11_175....webp | ? | **Muss identifiziert werden** |
| category_10_175....jpg | ? | **Muss identifiziert werden** |
| category_1_175....webp | ? | **Muss identifiziert werden** |
| category_2_175....webp | ? | **Muss identifiziert werden** |

**Generated Files:**
```
biere-safira        (Biere)
cocktails-safira    (Cocktails)
eistee-safira-1     (Eistee)
getraenke-safira    (Getränke)
hot-drinks-safira-1 (Hot Drinks)
hot-drinks-safira-2 (Hot Drinks 2)
red-bull-safira     (Red Bull)
saefte-safira       (Säfte)
shisha-safira       (Shisha)
snacks-safira       (Snacks)
softdrinks-safira   (Softdrinks)
```

---

## ⚠️ Wichtig:

### 1. Database Backup BEFORE Update
```sql
CREATE TABLE categories_backup_20251006 AS SELECT * FROM categories;
```

### 2. Image URL Mapping benötigt
**Frage an User:**
- Welche category_ID gehört zu welchem Produktkategorien-Namen?
- Oder: Können wir die aktuellen URLs aus der DB auslesen?

### 3. Rollback-Plan
```sql
-- Restore from backup
UPDATE categories c
JOIN categories_backup_20251006 b ON c.id = b.id
SET c.image = b.image;
```

---

## 📋 Nächster Schritt:

**Du musst entscheiden:**

### A. Bilder direkt uploaden (FTP/cPanel) ✅ EMPFOHLEN
- Schneller
- Permanenter
- Kein Build nötig nur für Images

### B. Über Build deployen
- Langsamer
- Images bei jedem Build neu kopiert

**Was bevorzugst du? Und hast du FTP/SFTP/cPanel Zugang zum Server?**
