# IONOS API Fix - Verlegung nach /safira

## Problem
- `/api` Verzeichnis blockiert PHP (500 Error)
- `/safira` funktioniert (diagnostic.php läuft)

## Lösung
API-Dateien nach `/safira` verlegen

## Upload-Schritte:

### 1. Test-Upload
Laden Sie hoch:
- `api-test-connection.php` → nach `/safira/api-test-connection.php`

Testen Sie:
```
http://test.safira-lounge.de/safira/api-test-connection.php
```
→ Sollte JSON mit "success" zeigen

### 2. Weitere API-Dateien
Falls Test funktioniert, laden Sie hoch:
- `api-products.php` → nach `/safira/api-products.php`

### 3. Frontend-URLs anpassen
Die src/services/api.ts muss geändert werden:

```typescript
// Alt:
const API_BASE_URL = 'http://test.safira-lounge.de/api';

// Neu:
const API_BASE_URL = 'http://test.safira-lounge.de/safira';

// URLs ändern:
'/products' → '/api-products.php'
'/categories' → '/api-categories.php'
'/test-connection' → '/api-test-connection.php'
```

### 4. Neue URL-Struktur:
- Test: http://test.safira-lounge.de/safira/api-test-connection.php
- Products: http://test.safira-lounge.de/safira/api-products.php
- Categories: http://test.safira-lounge.de/safira/api-categories.php

## Warum das funktioniert:
- diagnostic.php läuft in /safira
- Also funktioniert PHP in /safira
- Nur /api ist von IONOS blockiert