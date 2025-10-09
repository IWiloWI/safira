# 📦 Adobe Media Encoder Presets - Installationsanleitung

## 🎯 Übersicht der Presets

Sie haben **4 optimierte Presets** für verschiedene Anwendungsfälle erhalten:

### 1️⃣ **Safira_Web_Best_Quality_1080p.epr** ⭐ EMPFOHLEN
- **Format:** H.264, 1920x1080, 30 fps
- **Bitrate:** 3 Mbps (Target), 5 Mbps (Max)
- **Encoding:** VBR, 2 Pass (beste Qualität)
- **Audio:** AAC 128 kbps
- **Dateigröße:** ~6-8 MB für 30 Sekunden
- **Verwendung:** Restaurant-Displays, beste Qualität für Web

### 2️⃣ **Safira_Web_HEVC_1080p.epr** 💾 50% KLEINER
- **Format:** H.265/HEVC, 1920x1080, 30 fps
- **Bitrate:** 2 Mbps (Target), 4 Mbps (Max)
- **Encoding:** VBR, 1 Pass
- **Audio:** AAC 128 kbps
- **Dateigröße:** ~4-6 MB für 30 Sekunden
- **Verwendung:** Wenn maximale Kompression benötigt wird
- ⚠️ **Hinweis:** Nicht alle Browser unterstützen H.265

### 3️⃣ **Safira_Background_Optimized_1080p.epr** 🎨 HINTERGRÜNDE
- **Format:** H.264, 1920x1080, 24 fps
- **Bitrate:** 1.5 Mbps (Target), 3 Mbps (Max)
- **Encoding:** VBR, 2 Pass
- **Audio:** AAC 96 kbps
- **Dateigröße:** ~3-5 MB für 30 Sekunden
- **Verwendung:** Hintergrund-Videos, Loops, maximale Kompression

### 4️⃣ **Safira_Mobile_720p.epr** 📱 MOBILE
- **Format:** H.264, 1280x720, 30 fps
- **Bitrate:** 1.5 Mbps (Target), 2.5 Mbps (Max)
- **Encoding:** VBR, 2 Pass
- **Audio:** AAC 96 kbps
- **Dateigröße:** ~2-3 MB für 30 Sekunden
- **Verwendung:** Mobile Geräte, Tablets, langsame Verbindungen

---

## 📥 Installation der Presets

### **Methode 1: Automatischer Import (Empfohlen)**

1. **Öffne Adobe Media Encoder**
2. **Klicke auf "Preset"** (oben im Fenster)
3. **Wähle "Vorgabe importieren..."**
4. **Navigiere zum Ordner** mit den .epr-Dateien
5. **Wähle alle 4 .epr-Dateien aus** (mit Cmd+Klick / Strg+Klick)
6. **Klicke "Öffnen"**
7. ✅ **Fertig!** Die Presets erscheinen jetzt in deiner Preset-Liste

### **Methode 2: Manuelles Kopieren**

**macOS:**
```
~/Documents/Adobe/Adobe Media Encoder/[Version]/Presets/
```

**Windows:**
```
C:\Users\[Username]\Documents\Adobe\Adobe Media Encoder\[Version]\Presets\
```

1. **Kopiere alle 4 .epr-Dateien** in diesen Ordner
2. **Starte Adobe Media Encoder neu**
3. ✅ Presets erscheinen in der Preset-Liste

---

## 🎬 Verwendung der Presets

### **Einzelnes Video exportieren:**

1. **Ziehe dein Video** in die Queue von Adobe Media Encoder
2. **Klicke auf "Preset"** neben dem Video
3. **Wähle:** "Safira Web - Best Quality 1080p" ⭐
4. **Wähle Ausgabeort** (Output File)
5. **Klicke auf "Start Queue"** (grüner Play-Button)

### **Mehrere Videos gleichzeitig:**

1. **Ziehe alle Videos** in die Queue
2. **Markiere alle Videos** (Cmd+A / Strg+A)
3. **Rechtsklick** → "Vorgabe anwenden"
4. **Wähle:** "Safira Web - Best Quality 1080p"
5. **Start Queue**

### **Watch Folder (Automatische Verarbeitung):**

1. **File** → **Add Watch Folder**
2. **Source:** Ordner mit Quell-Videos wählen
3. **Output:** Ausgabeordner wählen
4. **Preset:** "Safira Web - Best Quality 1080p"
5. → Videos werden automatisch verarbeitet, sobald sie in den Ordner gezogen werden

---

## 📊 Welches Preset soll ich verwenden?

| Anwendungsfall | Empfohlenes Preset | Dateigröße (30s) |
|----------------|-------------------|------------------|
| Restaurant-Display (beste Qualität) | **Best Quality 1080p** ⭐ | 6-8 MB |
| Kleinste Dateigröße (moderne Browser) | **HEVC 1080p** | 4-6 MB |
| Hintergrund-Videos / Loops | **Background Optimized** | 3-5 MB |
| Mobile Geräte / Tablets | **Mobile 720p** | 2-3 MB |

**Empfehlung:** Starte mit **"Best Quality 1080p"** - beste Balance aus Qualität und Größe!

---

## 🔧 Preset anpassen

Falls du ein Preset anpassen möchtest:

1. **Wähle das Preset** in der Queue aus
2. **Klicke auf den Preset-Namen** (wird blau)
3. **Ändere Einstellungen** in den Tabs (Video, Audio, Multiplexer)
4. **Optional:** "Codierungsvorgabe speichern" → Eigenes Preset erstellen

### **Häufige Anpassungen:**

**Kleinere Datei (niedrigere Qualität):**
```
Video-Tab → Bitrate-Einstellungen:
  Ziel-Bitrate: 2 Mbps (statt 3 Mbps)
  Maximale Bitrate: 3 Mbps (statt 5 Mbps)
```

**Größere Datei (höhere Qualität):**
```
Video-Tab → Bitrate-Einstellungen:
  Ziel-Bitrate: 4 Mbps (statt 3 Mbps)
  Maximale Bitrate: 7 Mbps (statt 5 Mbps)
```

**Frame Rate ändern:**
```
Video-Tab → Grundeinstellungen:
  Bildrate: 24 fps (für Loops, kleinere Datei)
  Bildrate: 30 fps (Standard)
  Bildrate: 60 fps (sehr flüssig, größere Datei)
```

---

## ✅ Checkliste: Optimale Export-Einstellungen

Nach dem Import der Presets, überprüfe:

- [x] **Fast Start aktiviert** (Multiplexer-Tab)
- [x] **VBR, 2 Pass Encoding** (Video-Tab)
- [x] **Maximale Renderqualität** (Video-Tab)
- [x] **AAC Audio 128 kbps** (Audio-Tab)
- [x] **MP4 Format** (Multiplexer-Tab)

Alle diese Einstellungen sind bereits in den Presets vorkonfiguriert! ✅

---

## 🚨 Häufige Probleme & Lösungen

### **Problem: Preset erscheint nicht in der Liste**
**Lösung:**
- Adobe Media Encoder neu starten
- Überprüfe, ob die .epr-Datei im richtigen Ordner liegt
- Preset manuell importieren über "Vorgabe importieren..."

### **Problem: Export ist sehr langsam**
**Lösung:**
- Normal bei VBR 2-Pass Encoding (beste Qualität)
- Alternative: HEVC Preset verwenden (1-Pass, schneller)
- Hardware-Beschleunigung aktivieren: Preferences → General → Enable Mercury Playback Engine GPU Acceleration

### **Problem: Datei ist zu groß**
**Lösung:**
- Verwende "Background Optimized" Preset
- Oder passe Bitrate manuell an (siehe "Preset anpassen")
- Frame Rate auf 24 fps reduzieren

### **Problem: Qualität ist nicht gut genug**
**Lösung:**
- Verwende "Best Quality 1080p" statt "Background Optimized"
- Erhöhe Target Bitrate auf 4-5 Mbps
- Überprüfe Quellmaterial (schlecht = schlechtes Ergebnis)

---

## 💡 Tipps für beste Ergebnisse

1. **Quellmaterial:** Je besser die Quelle, desto besser das Ergebnis
2. **Zwei-Pass-Encoding:** Dauert länger, aber 10-20% bessere Qualität
3. **Fast Start:** IMMER aktivieren für Web-Videos (ist bereits in Presets)
4. **Bitrate anpassen:** Teste verschiedene Bitraten für dein Material
5. **Format wählen:**
   - H.264 für maximale Kompatibilität ✅
   - H.265 für kleinste Dateien (moderne Browser)

---

## 📞 Support

**Bei Fragen oder Problemen:**
- Überprüfe diese Anleitung
- Teste verschiedene Presets
- Vergleiche Dateigrößen und Qualität

**Empfohlener Workflow:**
1. Teste "Best Quality 1080p" Preset ⭐
2. Überprüfe Dateigröße und Qualität
3. Falls zu groß: "Background Optimized" verwenden
4. Falls zu klein: Bitrate manuell erhöhen

---

## 🎯 Zusammenfassung

✅ **4 Presets installiert:**
- Best Quality 1080p (Standard) ⭐
- HEVC 1080p (50% kleiner)
- Background Optimized (maximale Kompression)
- Mobile 720p (Tablets/Phones)

✅ **Alle Presets optimiert für:**
- Web-Streaming
- Schneller Start
- Beste Qualität/Größe-Balance
- Restaurant-Hintergründe

✅ **Empfehlung:**
Starte mit **"Safira Web - Best Quality 1080p"** für die beste Qualität!

---

**Viel Erfolg beim Optimieren deiner Videos! 🎬**
