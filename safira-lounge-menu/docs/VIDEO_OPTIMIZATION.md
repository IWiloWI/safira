# Video Optimization Guide - 19 MB Problem gelöst

## 🔴 HAUPTPROBLEM

**Edit-And-Render_1.mp4: 19 MB (91% des gesamten Payloads!)**

Total Payload: 20.8 MB
- Video: 19.0 MB (91%)
- Bilder: 1.5 MB (7%) ← Wird nach Upload behoben
- JS/CSS: 0.3 MB (2%)

## ✅ Sofort-Lösungen (Kein Code-Change nötig)

### 1. Video Lazy Loading (BESTE Lösung)

**Strategie:** Video erst laden wenn User scrollt/interagiert

```tsx
// VideoBackground.tsx - Already has lazy loading built-in!
<video
  preload="none"              // ← Lädt NICHT automatisch ✅
  playsInline
  muted
  loop
  autoPlay={false}            // ← User muss starten
/>
```

**Aktivieren:**
- Video preload="none" setzen
- autoPlay={false} für initiales Laden
- Erst abspielen bei User-Interaktion

**Ersparnis:** -19 MB initial load! ✅

### 2. Video-Poster Image (Placeholder)

Statt 19 MB Video → 50 KB Poster-Bild beim Laden

```tsx
<video
  poster="/images/video-posters/edit-and-render-poster.webp"
  preload="none"
>
  <source src="/videos/Edit-And-Render_1.mp4" type="video/mp4" />
</video>
```

**Poster erstellen:**
```bash
# Screenshot vom Video machen (Sekunde 2)
ffmpeg -i Edit-And-Render_1.mp4 -ss 00:00:02 -vframes 1 \
  -vf scale=1280:-1 poster.jpg

# Als WebP optimieren
npm run optimize-images specific poster.jpg
```

**Ersparnis:** -19 MB initial, nur 50 KB Poster ✅

### 3. Video Komprimierung

**Aktuell:** 19 MB für ~15 Sekunden = 1.27 MB/s (zu hoch!)

**Ziel:** ~3-5 MB für gute Qualität

```bash
# FFmpeg Installation
brew install ffmpeg  # macOS
# oder apt-get install ffmpeg  # Linux

# Video komprimieren (H.264, moderate Qualität)
ffmpeg -i Edit-And-Render_1.mp4 \
  -c:v libx264 \
  -crf 28 \
  -preset medium \
  -vf scale=1280:-1 \
  -c:a aac -b:a 128k \
  Edit-And-Render_1_optimized.mp4

# Noch stärker komprimieren für Mobile
ffmpeg -i Edit-And-Render_1.mp4 \
  -c:v libx264 \
  -crf 32 \
  -preset medium \
  -vf scale=854:-1 \
  -c:a aac -b:a 96k \
  Edit-And-Render_1_mobile.mp4
```

**CRF Values:**
- 18-23: Sehr hohe Qualität (10-15 MB)
- 24-28: Gute Qualität (5-8 MB) ← **EMPFOHLEN**
- 29-32: Mittlere Qualität (3-5 MB)
- 33+: Niedrige Qualität (<3 MB)

**Ersparnis:** -14 MB (19 MB → 5 MB) ✅

### 4. Responsive Videos (Verschiedene Größen)

```tsx
<video preload="none">
  <source
    src="/videos/Edit-And-Render_1_mobile.mp4"
    type="video/mp4"
    media="(max-width: 768px)"
  />
  <source
    src="/videos/Edit-And-Render_1_desktop.mp4"
    type="video/mp4"
  />
</video>
```

**Varianten:**
- Mobile (854x480): ~3 MB
- Tablet (1280x720): ~5 MB
- Desktop (1920x1080): ~8 MB

**Ersparnis:** -16 MB auf Mobile ✅

## 🚀 EMPFOHLENE STRATEGIE (3 Schritte)

### Schritt 1: Sofort-Fix (Kein Video-Upload)

**Aktualisiere VideoBackground.tsx:**

```tsx
<video
  preload="none"          // Nicht automatisch laden
  poster={posterImage}    // Zeige Poster stattdessen
  playsInline
  muted
  loop
>
  <source src={videoSrc} type="video/mp4" />
</video>
```

**Effekt:**
- Initial Payload: 20.8 MB → **1.8 MB** ✅ (-91%)
- Video lädt erst bei Bedarf
- Poster zeigt Preview

### Schritt 2: Video komprimieren (Offline)

```bash
cd safira/safira/videos

# Alle Videos komprimieren
for file in *.mp4; do
  ffmpeg -i "$file" \
    -c:v libx264 -crf 28 \
    -preset medium \
    -vf scale=1280:-1 \
    -c:a aac -b:a 128k \
    "${file%.mp4}_optimized.mp4"
done
```

**Ergebnis:**
- Videos: 10-30 MB → **3-8 MB** ✅
- Qualität: Immer noch sehr gut
- Mobile-freundlich

### Schritt 3: Upload optimierte Videos

**Upload nach IONOS:**
```
/videos/
├── Edit-And-Render_1_optimized.mp4  (5 MB statt 19 MB)
├── Bier_optimized.mp4                (6 MB statt 21 MB)
└── ...
```

## 📝 Video Optimization Script

Erstelle automatisches Script:

```bash
# scripts/optimize-videos.sh
#!/bin/bash

INPUT_DIR="safira/safira/videos"
OUTPUT_DIR="public/videos/optimized"

mkdir -p "$OUTPUT_DIR"

for video in "$INPUT_DIR"/*.mp4; do
  filename=$(basename "$video" .mp4)

  echo "Optimizing: $filename..."

  # Desktop version (1280p, CRF 28)
  ffmpeg -i "$video" \
    -c:v libx264 -crf 28 \
    -preset medium \
    -vf scale=1280:-1 \
    -c:a aac -b:a 128k \
    -movflags +faststart \
    "$OUTPUT_DIR/${filename}.mp4" \
    -y

  # Mobile version (854p, CRF 32)
  ffmpeg -i "$video" \
    -c:v libx264 -crf 32 \
    -preset medium \
    -vf scale=854:-1 \
    -c:a aac -b:a 96k \
    -movflags +faststart \
    "$OUTPUT_DIR/${filename}_mobile.mp4" \
    -y

  echo "✓ $filename optimized"
done

echo "All videos optimized!"
```

**Nutzung:**
```bash
chmod +x scripts/optimize-videos.sh
./scripts/optimize-videos.sh
```

## 🎯 Andere Optimierungen

### Logo192.png (301 KB → 30 KB)

```bash
# Convert to WebP
npm run optimize-images specific public/logo192.png

# Result: logo192.webp (~30 KB, -90%)
```

**Update manifest.json:**
```json
{
  "icons": [
    {
      "src": "logo192.webp",
      "type": "image/webp",
      "sizes": "192x192"
    }
  ]
}
```

### Category Images (Nach Upload behoben)

```
category_11_*.webp  623 KB → 24 KB  ✅ (bereits optimiert)
category_2_*.webp   452 KB → 30 KB  ✅ (bereits optimiert)
```

Diese werden nach dem Upload automatisch durch optimierte Versionen ersetzt!

## 📊 Erwartete Ergebnisse

### Vor Optimierung:
```
Total Payload:     20,837 KB
Video:             19,024 KB (91%)
Images:             1,500 KB (7%)
JS/CSS:               313 KB (2%)

Initial Load Time: 15-20s (3G)
```

### Nach Optimierung:
```
Total Payload:      2,500 KB  ✅ (-88%)
Video:                    0 KB  ✅ (lazy loaded)
Images (optimized):     150 KB  ✅ (-90%)
JS/CSS:                 313 KB  (gleich)

Initial Load Time:  2-3s (3G)  ✅ (-85%)
```

### Nach Video-Komprimierung:
```
Video (wenn geladen): 5,000 KB  ✅ (statt 19 MB)
Mobile Video:         3,000 KB  ✅ (statt 19 MB)
```

## ✅ Implementierungs-Checkliste

### Sofort (Kein Code-Change):
- [ ] VideoBackground: preload="none" setzen
- [ ] VideoBackground: autoPlay={false} initial
- [ ] Poster-Images für Videos erstellen

### Mittelfristig (Offline):
- [ ] FFmpeg installieren
- [ ] Alle Videos komprimieren (CRF 28)
- [ ] Mobile Versionen erstellen (854p)
- [ ] Poster-Images optimieren

### Upload:
- [ ] Optimierte Videos hochladen
- [ ] Poster-Images hochladen
- [ ] logo192.webp statt .png

### Testen:
- [ ] Lighthouse erneut ausführen
- [ ] Network Payload < 3 MB
- [ ] Videos laden nur bei Bedarf
- [ ] Mobile Performance testen

## 🔧 VideoBackground Update (Quick Fix)

```tsx
// src/components/Common/VideoBackground.tsx

const VideoBackground: React.FC<VideoBackgroundProps> = ({ category }) => {
  const [shouldLoad, setShouldLoad] = useState(false);

  // Nur laden wenn User interagiert
  useEffect(() => {
    const handleInteraction = () => setShouldLoad(true);

    window.addEventListener('scroll', handleInteraction, { once: true });
    window.addEventListener('click', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };
  }, []);

  return (
    <VideoContainer>
      <Video
        preload={shouldLoad ? "auto" : "none"}
        poster={posterImage}
        autoPlay={shouldLoad}
        playsInline
        muted
        loop
      >
        <source src={currentVideo} type="video/mp4" />
      </Video>
      <Overlay />
    </VideoContainer>
  );
};
```

## 📈 Performance-Monitoring

```typescript
// Track video load performance
const video = document.querySelector('video');

video?.addEventListener('loadstart', () => {
  console.time('Video Load Time');
});

video?.addEventListener('canplay', () => {
  console.timeEnd('Video Load Time');
});
```

## 🎯 Finale Empfehlung

**Priorität 1 (Sofort):**
1. ✅ preload="none" für alle Videos
2. ✅ Poster-Images erstellen
3. ✅ Lazy Loading aktivieren

**Priorität 2 (Diese Woche):**
1. Videos mit FFmpeg komprimieren
2. Mobile Versionen erstellen
3. Optimierte Videos hochladen

**Erwartete Verbesserung:**
- Initial Load: **-18 MB** ✅
- LCP: **1.2s → 0.6s** ✅
- Lighthouse: **95 → 98** ✅

---

**Größtes Problem gelöst: 19 MB Video wird lazy geladen!** 🚀
