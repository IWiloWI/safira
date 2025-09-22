# API Workaround für IONOS

## Problem
Der `/api` Ordner kann kein PHP ausführen (500 Error bei allen PHP-Dateien).

## Lösung
Legen Sie die API-Dateien direkt ins `/safira` Verzeichnis.

## Upload-Anweisungen:

1. **Test-Datei hochladen:**
   - `safira-api-test.php` → nach `/safira/api-test.php`
   - Testen: http://test.safira-lounge.de/safira/api-test.php
   - Sollte "TEST OK" zeigen

2. **Haupt-API hochladen:**
   - `safira-api.php` → nach `/safira/api.php`

3. **Frontend-API URLs ändern:**
   Die API-URLs müssen geändert werden von:
   ```
   http://test.safira-lounge.de/api/products
   ```
   zu:
   ```
   http://test.safira-lounge.de/safira/api.php?path=products
   ```

## API Endpoints:

- Health: `http://test.safira-lounge.de/safira/api.php?path=health`
- Test: `http://test.safira-lounge.de/safira/api.php?path=test-connection`
- Products: `http://test.safira-lounge.de/safira/api.php?path=products`
- Categories: `http://test.safira-lounge.de/safira/api.php?path=categories`
- Settings: `http://test.safira-lounge.de/safira/api.php?path=settings`

## Frontend anpassen:

Die `src/services/api.ts` muss geändert werden:

```typescript
const API_BASE_URL = 'http://test.safira-lounge.de/safira/api.php';

// Statt /products
const response = await api.get('?path=products');
```

Dies umgeht das Problem mit dem `/api` Verzeichnis.