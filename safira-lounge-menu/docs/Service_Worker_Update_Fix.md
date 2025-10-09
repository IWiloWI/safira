# Service Worker Update & Google Fonts CSP Fix

**Date**: 2025-10-07
**Issue**: Service Worker cached old CSP policy, blocking Google Fonts
**Status**: ✅ Fixed - Ready for Deployment

---

## 🐛 Problem

Der Service Worker hat die **alte CSP-Policy gecached**, die Google Fonts blockiert hat:

```
Refused to connect to 'https://fonts.googleapis.com/...'
because it violates CSP directive: "connect-src 'self' https://test.safira-lounge.de"
```

### Warum?

Service Worker:
1. Cached beim ersten Besuch die HTML-Datei mit alter CSP
2. Liefert gecachte Version aus (stale-while-revalidate)
3. Neue CSP-Policy wird nicht geladen, bis Cache gelöscht wird

---

## ✅ Lösung

### 1. Service Worker Version erhöht
**Datei**: `public/service-worker.js`

**Änderung**:
```javascript
// Alt
const CACHE_VERSION = 'v1.0.0';

// Neu
const CACHE_VERSION = 'v1.0.1';
```

**Effekt**:
- Neue Version löscht automatisch alle alten Caches
- Lädt alle Ressourcen neu
- Verwendet neue CSP-Policy

### 2. Service Worker überspringt Google Fonts
Der Service Worker ignoriert bereits externe URLs:

```javascript
// External resources to skip (CSP restrictions)
const SKIP_URLS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'google',
  'gstatic'
];

// In fetch event:
if (SKIP_URLS.some(pattern => url.href.includes(pattern))) {
  return; // Let browser handle normally
}
```

**Effekt**: Google Fonts werden nicht gecached, direkt vom Browser geladen.

---

## 🚀 Deployment-Schritte

### Schritt 1: Build deployen
```bash
# Upload komplettes build/ Verzeichnis zum Server
build/
  ├── index.html          # Neue CSP
  ├── .htaccess           # Aktualisierte CSP
  ├── service-worker.js   # Version v1.0.1
  └── ...
```

### Schritt 2: Service Worker Update erzwingen

Nach dem Deployment müssen User den Service Worker neu laden:

#### Option A: Hard Refresh (empfohlen für Tests)
- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

#### Option B: Service Worker manuell deregistrieren (bei Problemen)
1. Browser DevTools öffnen (`F12`)
2. **Application** Tab öffnen
3. **Service Workers** im linken Menü
4. Bei `safira-lounge-v1.0.0` auf **Unregister** klicken
5. Seite neu laden (`F5`)

#### Option C: Cache komplett löschen (bei hartnäckigen Problemen)
1. Browser DevTools öffnen (`F12`)
2. **Application** Tab
3. **Storage** > **Clear site data**
4. Alle Checkboxen aktivieren
5. **Clear site data** klicken
6. Seite neu laden

---

## 🧪 Verifizierung nach Deployment

### ✅ Service Worker Check
1. Seite öffnen: `https://test.safira-lounge.de/menu`
2. DevTools Console öffnen
3. Nach diesem Log suchen:
   ```
   [SW] Activating service worker...
   [SW] Deleting old cache: safira-lounge-v1.0.0
   [SW] Service worker activated
   ```

### ✅ Google Fonts Check
Console sollte **keine Fehler** mehr zeigen:
```
✅ Keine CSP violations für fonts.googleapis.com
✅ Keine "Refused to connect" Fehler
✅ Fonts laden erfolgreich
```

### ✅ Netzwerk-Tab Check
1. **Network** Tab öffnen
2. Nach `fonts.googleapis.com` filtern
3. Request sollte **Status 200** haben
4. **Nicht** durch Service Worker (kein SW Icon)

---

## 📊 Erwartetes Verhalten

### Nach erfolgreichem Update:

#### Console Output (sauber):
```
✅ [SW] Activating service worker...
✅ [SW] Deleting old cache: safira-lounge-v1.0.0
✅ [SW] Service worker activated
✅ Loading products from API...
✅ Products loaded from API: 4 categories
```

#### Keine Fehler mehr:
```
❌ GONE: Refused to connect to 'https://fonts.googleapis.com'
❌ GONE: CSP violation for fonts
❌ GONE: Fetch API cannot load fonts
❌ GONE: GET fonts net::ERR_ABORTED 404
```

---

## 🔧 Technische Details

### Service Worker Caching-Strategie

1. **Network-first**: API-Calls (`/api/`, `/safira-api-fixed.php`)
   - Versucht Netzwerk zuerst
   - Fallback auf Cache bei Offline

2. **Cache-first**: Statische Assets (`/static/`, `/images/`, `/videos/`)
   - Lädt aus Cache (schnell)
   - Update im Hintergrund

3. **Stale-while-revalidate**: HTML-Dateien
   - Liefert gecachte Version sofort
   - Lädt neue Version im Hintergrund
   - **Problem**: Alte CSP wurde gecached

4. **Skip**: Externe URLs (Google Fonts)
   - Service Worker ignoriert komplett
   - Browser lädt direkt
   - CSP aus HTML wird verwendet

### Warum Version-Bump hilft

```javascript
// activate Event
event.waitUntil(
  caches.keys()
    .then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME) // v1.0.1
          .map((name) => {
            console.log('[SW] Deleting old cache:', name); // v1.0.0
            return caches.delete(name);
          })
      );
    })
);
```

**Effekt**: Alle Caches mit alter Version (`v1.0.0`) werden gelöscht, neue CSP wird geladen.

---

## 🚨 Troubleshooting

### Problem: Fonts laden immer noch nicht

**Lösung 1**: Service Worker manuell deregistrieren (siehe oben)

**Lösung 2**: Cache komplett löschen (siehe oben)

**Lösung 3**: Inkognito-Modus testen
- Öffne `https://test.safira-lounge.de/menu` im Inkognito-Modus
- Kein gecachter Service Worker
- Sollte sofort funktionieren

### Problem: Service Worker registriert sich nicht neu

**Check**:
```javascript
// In Browser Console eingeben:
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Registered SWs:', regs);
  regs.forEach(reg => console.log('SW URL:', reg.active?.scriptURL));
});
```

**Erwartete Ausgabe**:
```
SW URL: https://test.safira-lounge.de/service-worker.js
```

**Fix**: Service Worker manuell neu registrieren
```javascript
// In Console:
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(reg => reg.unregister()))
  .then(() => location.reload());
```

### Problem: CSP immer noch alt

**Check**: Welche CSP wird verwendet?
```javascript
// In Console:
console.log(document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content);
```

**Erwartete Ausgabe** (sollte enthalten):
```
connect-src 'self'
  http://test.safira-lounge.de
  https://test.safira-lounge.de
  https://fonts.googleapis.com
  https://fonts.gstatic.com
```

**Fix**: HTML-Cache löschen (siehe oben)

---

## 📝 Zusammenfassung

### Was wurde geändert:
1. ✅ Service Worker Version: `v1.0.0` → `v1.0.1`
2. ✅ Service Worker überspringt Google Fonts (bereits vorhanden)
3. ✅ CSP aktualisiert (fonts.googleapis.com + fonts.gstatic.com)
4. ✅ Alte Caches werden automatisch gelöscht

### Was passiert nach Deployment:
1. User lädt Seite
2. Neuer Service Worker (v1.0.1) wird erkannt
3. Alter Cache (v1.0.0) wird gelöscht
4. Neue CSP-Policy wird geladen
5. Google Fonts funktionieren

### User-Aktion erforderlich:
- **Nein** für neue Besucher
- **Ja** für User mit gecachtem Service Worker:
  - Hard Refresh: `Ctrl+Shift+R` / `Cmd+Shift+R`
  - Oder: Cache löschen in DevTools

---

## ✅ Deployment-Checkliste

- [x] Service Worker Version erhöht (v1.0.1)
- [x] Build erstellt
- [x] .htaccess aktualisiert
- [ ] Build auf Server deployen
- [ ] Service Worker Aktivierung prüfen (Console Log)
- [ ] Google Fonts laden testen (Network Tab)
- [ ] Keine CSP Violations (Console)
- [ ] Hard Refresh auf Test-Geräten
- [ ] Inkognito-Test durchführen

**Status**: Ready for deployment! 🚀
