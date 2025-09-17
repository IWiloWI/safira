# ChatGPT Auto-Translation Setup

Die App unterstützt jetzt automatische Übersetzungen mit ChatGPT/OpenAI.

## Setup

1. **OpenAI API Key erhalten:**
   - Gehe zu [OpenAI API](https://platform.openai.com/api-keys)
   - Erstelle einen Account oder logge dich ein
   - Generiere einen neuen API Key

2. **API Key konfigurieren:**
   - Öffne die `.env` Datei im Projekt-Root
   - Ersetze `your_openai_api_key_here` mit deinem echten API Key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Server neu starten:**
   ```bash
   npm run server
   ```

## Funktionen

### Automatische Übersetzung
- **Neue Produkte:** Wenn du ein neues Produkt hinzufügst und Name/Beschreibung auf Deutsch eingibst, werden automatisch dänische und englische Übersetzungen erstellt.
- **Intelligent:** Behält Markennamen bei und übersetzt nur beschreibende Teile.

### Manuelle Übersetzung (API)
- `POST /api/translate` - Text übersetzen
- `POST /api/translate/product` - Ganzes Produkt übersetzen  
- `GET /api/translate/status` - Übersetzungs-Status prüfen

## Beispiel Produkterstellung

**Eingabe:**
```json
{
  "name": "Holster - Watermelon",
  "description": "Saftige Wassermelone mit intensiver Frische",
  "price": 15
}
```

**Automatisches Ergebnis:**
```json
{
  "name": {
    "de": "Holster - Watermelon",
    "da": "Holster - Vandmelon", 
    "en": "Holster - Watermelon"
  },
  "description": {
    "de": "Saftige Wassermelone mit intensiver Frische",
    "da": "Saftig vandmelon med intens friskhed",
    "en": "Juicy watermelon with intense freshness"
  },
  "price": 15
}
```

## Kosten

- ChatGPT 3.5 Turbo: ~$0.001-0.002 pro Übersetzung
- Sehr günstig für gelegentliche Nutzung
- Übersetzungen werden nur bei neuen Produkten automatisch erstellt

## Status prüfen

```bash
curl http://localhost:5001/api/translate/status
```

## Troubleshooting

- **"Translation service not configured"**: API Key noch nicht gesetzt oder ungültig
- **"insufficient_quota" oder 429 Fehler**: OpenAI Account hat kein Guthaben mehr oder Quota überschritten
  - Gehe zu [OpenAI Billing](https://platform.openai.com/account/billing) um Guthaben aufzuladen
  - Kostenpunkt: ~$5 reichen für hunderte von Übersetzungen
- **Übersetzung schlägt fehl**: Überprüfe OpenAI Account-Guthaben
- **Server-Fehler**: Überprüfe ob `.env` Datei korrekt ist und Server neu gestartet wurde

## Status des aktuellen API Keys

Der API Key ist konfiguriert und funktioniert, aber das OpenAI Konto benötigt Guthaben für die Nutzung. 
Die Integration ist bereit - sobald Guthaben aufgeladen wird, werden automatische Übersetzungen aktiviert.