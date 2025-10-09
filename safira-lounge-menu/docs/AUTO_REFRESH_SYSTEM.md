# Auto-Refresh System für Live-Updates

## Übersicht

Das Auto-Refresh System sorgt dafür, dass Kunden-Geräte **automatisch aktualisiert** werden, wenn du im Admin-Panel Änderungen machst (z.B. Produkte löschen, Preise ändern, etc.).

## Wie es funktioniert

### 1. **Polling-basiertes System**
- Kunden-Seite fragt alle 30 Sekunden die API: `?action=version_check`
- API gibt einen **Hash** der letzten Änderung zurück
- Wenn sich der Hash ändert → Seite lädt automatisch neu

### 2. **Was getriggert ein Refresh?**

Änderungen an:
- ✅ **Produkte** (create, update, delete)
- ✅ **Kategorien** (create, update, delete)
- ✅ **Unterkategorien** (create, update, delete)
- ✅ **Preise** (update)
- ✅ **Verfügbarkeit** (available true/false)
- ✅ **Namen & Beschreibungen** (update)
- ✅ **Bilder** (upload/change)

### 3. **User Experience**

**Wenn eine Änderung erkannt wird:**
1. Console Log: `📡 Admin changes detected, reloading menu...`
2. **Optional**: Browser-Benachrichtigung (wenn erlaubt)
3. Wartet 1 Sekunde
4. Lädt Seite komplett neu

**Während des Polling:**
- Läuft im Hintergrund
- Kein Performance-Impact für User
- Sehr kleine API-Anfrage (~100 bytes)

## Technische Details

### Frontend: `useAdminChangeDetection` Hook

```typescript
// In MenuPageContainer.tsx
useAdminChangeDetection({
  interval: 30000, // 30 Sekunden
  enabled: true,   // Immer aktiv auf Kunden-Seiten
  onChangeDetected: () => {
    console.log('📡 Änderungen erkannt, lade neu...');
  }
});
```

### Backend: PHP API Endpoint

```php
// safira-api-fixed.php
case 'version_check':
    // Holt letztes updated_at von products, categories, subcategories
    $stmt = $pdo->query("
        SELECT MAX(updated_at) as last_update FROM (
            SELECT updated_at FROM products
            UNION ALL
            SELECT updated_at FROM categories
            UNION ALL
            SELECT updated_at FROM subcategories
        ) as combined
    ");

    // Erstellt MD5 Hash für effizienten Vergleich
    $hash = md5($lastModified);

    return [
        'hash' => $hash,
        'lastModified' => '2025-10-08 14:30:15'
    ];
```

## Konfiguration

### Polling-Intervall ändern

In `MenuPageContainer.tsx`:

```typescript
useAdminChangeDetection({
  interval: 15000, // 15 Sekunden (schneller)
  // ODER
  interval: 60000, // 60 Sekunden (langsamer, weniger Server-Load)
});
```

**Empfohlen**: 30000ms (30 Sekunden)
- Balance zwischen Aktualität und Server-Last
- User merken keine Verzögerung

### Deaktivieren (falls nötig)

```typescript
useAdminChangeDetection({
  enabled: false // Komplett deaktiviert
});
```

## Testing

### 1. Test im Admin-Panel

1. Öffne Kunden-Seite: `https://test.safira-lounge.de/menu`
2. Öffne DevTools Console (F12)
3. Öffne Admin-Panel in anderem Tab
4. Lösche ein Produkt oder ändere einen Preis
5. Warte max. 30 Sekunden
6. Console sollte zeigen: `📡 Admin changes detected, reloading menu...`
7. Seite lädt automatisch neu

### 2. Test der API

```bash
# Terminal:
curl "https://test.safira-lounge.de/safira-api-fixed.php?action=version_check"

# Erwartete Response:
{
  "success": true,
  "hash": "abc123...",
  "lastModified": "2025-10-08 14:30:15",
  "timestamp": "2025-10-08T14:30:15+00:00"
}
```

### 3. Test Hash-Änderung

1. Erste Anfrage:
   ```json
   {"hash": "abc123"}
   ```

2. Produkt im Admin ändern

3. Zweite Anfrage (nach 30 Sek):
   ```json
   {"hash": "def456"}  // Hash hat sich geändert!
   ```

4. Frontend erkennt Unterschied → Reload

## Performance

### Server-Last

**Polling-Anfrage:**
- Request Size: ~150 bytes
- Response Size: ~100 bytes
- Database Query: Sehr schnell (MAX() query mit Index)

**Bei 100 aktiven Kunden:**
- Anfragen pro Minute: 100 × 2 = 200 requests
- Daten-Transfer: 200 × 250 bytes = 50 KB/min
- Sehr geringe Last!

### Optimierungen

1. **Index auf updated_at Spalten** (automatisch vorhanden)
2. **Keine Response-Caching** für version_check
3. **MD5 Hash** statt ganzer Timestamp-Vergleich
4. **UNION ALL** statt UNION (schneller)

## Troubleshooting

### Problem: Seite refresht nicht

**Check 1: Console Logs**
```javascript
// Sollte alle 30 Sek erscheinen:
[AdminChangeDetection] Checking for changes...
```

**Check 2: API erreichbar?**
```bash
curl "https://test.safira-lounge.de/safira-api-fixed.php?action=version_check"
```

**Check 3: Hook enabled?**
```typescript
// In MenuPageContainer.tsx
enabled: true // Muss true sein!
```

### Problem: Seite refresht zu oft

**Mögliche Ursache:** `updated_at` ändert sich ständig

**Fix:** Check ob Auto-Update-Triggers in DB aktiv sind:
```sql
-- Check Triggers
SHOW TRIGGERS WHERE `Table` = 'products';
```

### Problem: Browser-Benachrichtigungen funktionieren nicht

**Normal!** Benachrichtigungen sind optional und brauchen User-Erlaubnis.

**Aktivieren:**
1. Browser fragt nach Permission
2. User muss "Zulassen" klicken
3. Danach funktionieren Benachrichtigungen

## Erweiterte Features (Optional)

### Silent Refresh (ohne Page Reload)

Statt kompletten Reload nur Daten neu laden:

```typescript
useAdminChangeDetection({
  onChangeDetected: async () => {
    // Lade nur neue Daten, kein Reload
    await refetchProducts();
    await refetchCategories();
    // Zeige Toast-Notification
    showToast('Menü aktualisiert!');
  }
});
```

**Nachteil:** Komplexer, kann zu Sync-Problemen führen.
**Vorteil:** User-Erlebnis smoother.

### Differenzielle Updates

Nur geänderte Produkte updaten:

```php
// API Endpoint: version_check_details
case 'version_check_details':
    return [
        'hash' => $hash,
        'changedProducts' => [1, 5, 23],
        'deletedProducts' => [15],
        'changedCategories' => [2]
    ];
```

**Aktuell nicht implementiert** - aber möglich für zukünftige Optimierung.

## Best Practices

### 1. **Polling nur auf Kunden-Seiten**
```typescript
// ❌ Nicht im Admin-Panel!
const isAdminPage = window.location.pathname.includes('/admin');

useAdminChangeDetection({
  enabled: !isAdminPage
});
```

### 2. **Graceful Degradation**
Wenn API nicht erreichbar:
- Weiter versuchen (auto-reconnect)
- Keine Fehler-Popups
- Silent Fallback zu normaler Nutzung

### 3. **User-Feedback geben**
```typescript
onChangeDetected: () => {
  // Zeige kurze Nachricht
  showToast('Neue Änderungen verfügbar, lädt...', 1000);

  // Dann reload
  setTimeout(() => window.location.reload(), 1000);
}
```

## Monitoring

### Console Logs beobachten

**Normal:**
```
[AdminChangeDetection] Initial hash stored
[AdminChangeDetection] Checking for changes... (alle 30 Sek)
```

**Änderung erkannt:**
```
[AdminChangeDetection] 🔄 Changes detected! Refreshing page...
📡 Admin changes detected, reloading menu...
```

**Fehler:**
```
[AdminChangeDetection] Error checking for changes: NetworkError
```

## Zusammenfassung

✅ **Automatisches Refresh** bei Admin-Änderungen
✅ **30 Sekunden Polling-Intervall**
✅ **Sehr geringe Server-Last**
✅ **Funktioniert mit allen Admin-Änderungen**
✅ **Keine User-Interaktion nötig**
✅ **Graceful Degradation** bei Fehlern

**Status**: ✅ Produktionsbereit
**Performance Impact**: Minimal
**User Experience**: Exzellent
