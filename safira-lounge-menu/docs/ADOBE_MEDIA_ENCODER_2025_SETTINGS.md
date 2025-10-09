# 🎬 Adobe Media Encoder 2025 - Manuelle Preset-Erstellung

## Version: 25.5 (Build 13)

Da Adobe Media Encoder 2025 ein neues Preset-Format verwendet, müssen die Presets manuell erstellt werden.

## 📋 Preset 1: Safira Web - Best Quality 1080p ⭐

### Schritt-für-Schritt Anleitung:

1. **Video in Queue ziehen**
2. **Format wählen:** H.264
3. **Preset wählen:** "Match Source - High bitrate" als Basis
4. **Auf Preset-Namen klicken** (wird blau markiert)

---

### ⚙️ VIDEO-TAB Einstellungen

**Grundeinstellungen:**
```
☑ Breite: 1920
☑ Höhe: 1080
☑ Bildrate: 30
☑ Bildaspekt: Quadratische Pixel (1,0)
☑ Feldreihenfolge: Progressiv
☑ TV-Standard: NTSC
```

**Codierungseinstellungen:**
```
☑ Profil: High
☑ Stufe: 4.2
```

**Bitrate-Einstellungen:**
```
☑ Bitrate-Codierung: VBR, 2 Pass
☑ Ziel-Bitrate [Mbps]: 3
☑ Maximale Bitrate [Mbps]: 5
```

**Erweiterte Einstellungen:**
```
☑ Maximale Renderqualität verwenden: AN (✓)
☑ Mit maximaler Tiefe rendern: AN (✓)
☑ Schlüsselbildabstand (Frames): 30
```

---

### 🔊 AUDIO-TAB Einstellungen

```
☑ Audio-Codec: AAC
☑ Abtastrate: 48000 Hz
☑ Kanäle: Stereo
☑ Bitrate [kbps]: 128
☑ Audioqualität: Hoch
```

---

### 📦 MULTIPLEXER-TAB Einstellungen

```
☑ Format: MP4
☑ Fast Start: AN (✓)
☑ Stream-Kompatibilität: MP4
```

---

### 💾 Preset speichern

1. **Rechtsklick auf das Video** in der Queue
2. **"Codierungsvorgabe speichern"** wählen
3. **Name eingeben:** `Safira Web - Best Quality 1080p`
4. **Beschreibung:** `Optimiert für Web-Streaming. H.264, 1920x1080, VBR 2-Pass, 3 Mbps. ~6-8 MB für 30 Sekunden.`
5. **Speichern**

---

## 📋 Preset 2: Safira Web - HEVC 1080p (50% kleiner)

### VIDEO-TAB:
```
Format: HEVC (H.265)
Breite: 1920
Höhe: 1080
Bildrate: 30
Profil: Main
Bitrate-Codierung: VBR, 1 Pass
Ziel-Bitrate: 2 Mbps
Maximale Bitrate: 4 Mbps
Maximale Renderqualität: AN
```

### AUDIO-TAB:
```
Audio-Codec: AAC
Bitrate: 128 kbps
Abtastrate: 48000 Hz
```

### MULTIPLEXER-TAB:
```
Format: MP4
Fast Start: AN
```

**Name:** `Safira Web - HEVC 1080p`

---

## 📋 Preset 3: Safira Background - Optimized 1080p

### VIDEO-TAB:
```
Format: H.264
Breite: 1920
Höhe: 1080
Bildrate: 24  ← Unterschied!
Profil: High
Bitrate-Codierung: VBR, 2 Pass
Ziel-Bitrate: 1.5 Mbps  ← Niedriger!
Maximale Bitrate: 3 Mbps
Maximale Renderqualität: AN
Schlüsselbildabstand: 48
```

### AUDIO-TAB:
```
Audio-Codec: AAC
Bitrate: 96 kbps  ← Niedriger!
Abtastrate: 48000 Hz
```

### MULTIPLEXER-TAB:
```
Format: MP4
Fast Start: AN
```

**Name:** `Safira Background - Optimized 1080p`

---

## 📋 Preset 4: Safira Mobile - 720p

### VIDEO-TAB:
```
Format: H.264
Breite: 1280  ← 720p!
Höhe: 720
Bildrate: 30
Profil: High
Stufe: 4.0
Bitrate-Codierung: VBR, 2 Pass
Ziel-Bitrate: 1.5 Mbps
Maximale Bitrate: 2.5 Mbps
Maximale Renderqualität: AN
Schlüsselbildabstand: 30
```

### AUDIO-TAB:
```
Audio-Codec: AAC
Bitrate: 96 kbps
Abtastrate: 48000 Hz
```

### MULTIPLEXER-TAB:
```
Format: MP4
Fast Start: AN
```

**Name:** `Safira Mobile - 720p`

---

## 🎯 Verwendung

### Einzelnes Video:
1. Video in Queue ziehen
2. **Preset wählen:** "Safira Web - Best Quality 1080p"
3. **Start Queue** klicken

### Mehrere Videos (Batch):
1. Alle Videos in Queue ziehen
2. Alle markieren (Strg+A / Cmd+A)
3. **Rechtsklick** → "Vorgabe anwenden"
4. **"Safira Web - Best Quality 1080p"** wählen
5. **Start Queue**

### Watch Folder (Automatisch):
1. **File** → **Add Watch Folder**
2. **Source:** Quell-Ordner wählen
3. **Output:** Ziel-Ordner wählen
4. **Preset:** "Safira Web - Best Quality 1080p"
5. Videos werden automatisch verarbeitet

---

## 📊 Preset-Vergleich

| Preset | Auflösung | FPS | Bitrate | Dateigröße (30s) | Verwendung |
|--------|-----------|-----|---------|-----------------|------------|
| **Best Quality 1080p** ⭐ | 1920x1080 | 30 | 3 Mbps | 6-8 MB | Restaurant-Displays |
| **HEVC 1080p** | 1920x1080 | 30 | 2 Mbps | 4-6 MB | Kleinste Dateien |
| **Background Optimized** | 1920x1080 | 24 | 1.5 Mbps | 3-5 MB | Hintergrund-Loops |
| **Mobile 720p** | 1280x720 | 30 | 1.5 Mbps | 2-3 MB | Mobile Geräte |

---

## 🔧 Anpassungen

### Kleinere Datei (niedrigere Qualität):
```
Ziel-Bitrate: 2 Mbps (statt 3 Mbps)
Maximale Bitrate: 3 Mbps (statt 5 Mbps)
```

### Größere Datei (höhere Qualität):
```
Ziel-Bitrate: 4 Mbps (statt 3 Mbps)
Maximale Bitrate: 7 Mbps (statt 5 Mbps)
```

### Frame Rate ändern:
```
24 fps → Kleinere Datei, für Loops
30 fps → Standard
60 fps → Sehr flüssig, große Datei
```

---

## ✅ Checkliste

Nach dem Erstellen überprüfen:

- [x] Format: H.264 (oder HEVC)
- [x] VBR, 2 Pass Encoding
- [x] Maximale Renderqualität: AN
- [x] Fast Start: AN (Multiplexer-Tab)
- [x] AAC Audio
- [x] Preset gespeichert

---

## 🚨 Wichtige Hinweise

1. **Fast Start** IMMER aktivieren für Web-Videos
2. **VBR 2-Pass** dauert länger, aber beste Qualität
3. **HEVC** nicht alle Browser unterstützen (Safari: ja, Firefox: teilweise)
4. **Quellmaterial** bestimmt Endqualität - schlechte Quelle = schlechtes Ergebnis

---

## 💡 Tipps

- Starte mit **"Best Quality 1080p"** für beste Balance
- Teste verschiedene Presets für dein Material
- Vergleiche Dateigröße vs. Qualität
- Verwende **Watch Folder** für Automatisierung
- Hardware-Beschleunigung aktivieren: **Preferences → General → Enable GPU Acceleration**

---

**Viel Erfolg beim Optimieren! 🎬**
