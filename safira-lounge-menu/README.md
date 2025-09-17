# 🌟 Safira Lounge - Digital Menu System

Eine moderne, responsive digitale Speisekarte für die Safira Lounge Shisha Bar in Flensburg. Entwickelt mit React, TypeScript und Node.js mit einem kompletten Admin-Panel, QR-Code-Generator und mehrsprachiger Unterstützung.

## ✨ Features

### 🎨 Design & UX
- **Neon-Pink Design** (#FF41FB) entsprechend der Original-Elementor-Vorlage
- **Video-Hintergrund** mit Overlay für atmosphärischen Look
- **Custom Fonts**: Kallisto für Überschriften, Aldrich für Beschreibungen
- **Animationen** mit Framer Motion für moderne UX
- **Mobile-First** responsive Design

### 📱 Kern-Features
- **Komplette Speisekarte** mit allen Safira Lounge Produkten
- **3-sprachiges System**: Deutsch, Dänisch, Englisch
- **Live-Suche** mit Filterung nach Kategorien
- **QR-Code System** für tischspezifische Menüs
- **Echtzeit-Verfügbarkeit** von Produkten

### 🔧 Admin-Panel
- **Produktverwaltung**: Hinzufügen, Bearbeiten, Löschen
- **Preismanagement**: Einzel- und Bulk-Updates
- **QR-Code Generator**: Einzeln oder in Masse
- **Analytics Dashboard**: Nutzungsstatistiken und Trends
- **Multi-Language Content**: Verwaltung aller Sprachversionen

### 📊 Analytics & Tracking
- **Tischaktivität**: QR-Code Scans pro Tisch
- **Besucherstatistiken**: Views, Verweildauer, Geräte-Info
- **Beliebte Kategorien**: Welche Menüs werden am meisten angesehen
- **Stündliche Trends**: Nutzungsmuster über den Tag

## 🗂️ Produktkatalog

Die Anwendung enthält die komplette Safira Lounge Speisekarte:

### 🍽️ Safira Menüs
- **Single Menü** - 1x Shisha, 1x Cocktail/Mocktail (20€)
- **Duo Menü** - 2x Shisha, 2x Getränke, Nachos/Snack Box (50€)
- **Party Menü** - Komplett-Paket für Gruppen (100€)

### 💨 Shisha-Auswahl
- **Standard Tabak** (15€): Aqua Mentha, Al Massiva, 187, Holster, etc.
- **Premium Head** (18€): Phunnel + Kaloud Lotus
- **Traditionell** (15€): Doppel Apfel, Traube Minze

### 🍹 Getränke
- **Softdrinks**: Coca Cola, Schweppes, Mineralwasser
- **Red Bull**: Alle Editionen und Geschmacksrichtungen
- **Eistee & Limonade**: Elephant Bay Sortiment
- **Kaffee & Tee**: Hausgemachte Spezialitäten
- **Cocktails**: Über 13 verschiedene Cocktails
- **Mocktails**: Alkoholfreie Alternativen
- **Wein & Sekt**: Erlesene Auswahl

### 🍿 Snacks
- **Nachos** (8,50€)
- **Snack-Box** (5,50€): Haribo, NicNacs, Pringles, M&M's
- **Einzelne Snacks** (2,50€)

## 🚀 Installation & Setup

### Voraussetzungen
- Node.js (≥ 16.0.0)
- npm oder yarn
- Git

### 1. Repository klonen
```bash
git clone https://github.com/your-username/safira-lounge-menu.git
cd safira-lounge-menu
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Environment-Variablen konfigurieren
```bash
cp .env.example .env
# Bearbeiten Sie die .env Datei nach Bedarf
```

### 4. Development-Server starten
```bash
# Frontend (Port 3000)
npm start

# Backend (Port 5000) 
npm run server

# Beide gleichzeitig
npm run dev
```

### 5. Production Build
```bash
npm run build
node server/index.js
```

## 📁 Projekt-Struktur

```
safira-lounge-menu/
├── public/                 # Statische Assets
│   ├── images/            # Logos, Icons
│   ├── videos/            # Hintergrund-Videos
│   └── fonts/             # Custom Fonts (Kallisto)
├── src/
│   ├── components/        # React Komponenten
│   │   ├── Common/        # Wiederverwendbare Komponenten
│   │   ├── Layout/        # Header, Navigation
│   │   ├── Menu/          # Menü-spezifische Komponenten
│   │   └── Admin/         # Admin-Panel Komponenten
│   ├── contexts/          # React Context (Auth, Language)
│   ├── data/              # JSON Datenfiles
│   ├── hooks/             # Custom React Hooks
│   ├── i18n/              # Internationalisierung
│   ├── pages/             # Seiten-Komponenten
│   ├── services/          # API Services
│   └── styles/            # CSS & Styled Components
├── server/                # Express.js Backend
│   ├── data/              # Server-seitige Daten
│   ├── uploads/           # Hochgeladene Dateien
│   └── index.js           # Haupt-Server Datei
└── README.md
```

## 🎨 Design-System

### Farben
- **Primary**: #FF41FB (Neon-Pink)
- **Secondary**: #FFFFFF (Weiß)
- **Background**: #000000 (Schwarz)
- **Accent**: #003BFF1A (Blaue Nuance)

### Typografie
- **Headlines**: Kallisto Font, Uppercase, 800 Weight
- **Body Text**: Aldrich Font, Medium Weight
- **Preise**: Kallisto Font, Bold (800)

### Effekte
- **Text Shadow**: Pink Glow (rgba(255, 65, 251, 0.76))
- **Box Shadow**: 25px Blur (rgba(255, 21, 237, 0.34))
- **Border Radius**: 86px (Bilder), 53px (Container)

## 🔧 API-Endpunkte

### Authentication
- `POST /api/auth/login` - Admin Login

### Products
- `GET /api/products` - Alle Produkte abrufen
- `PUT /api/products` - Produkte aktualisieren
- `POST /api/products/:categoryId/items` - Produkt hinzufügen
- `PUT /api/products/:categoryId/items/:itemId` - Produkt bearbeiten
- `DELETE /api/products/:categoryId/items/:itemId` - Produkt löschen

### QR Codes
- `POST /api/qr/generate` - QR-Code generieren

### Analytics
- `GET /api/analytics` - Analytics-Daten abrufen
- `POST /api/analytics/track` - Event tracken

### File Upload
- `POST /api/upload` - Datei hochladen

## 🌍 Mehrsprachigkeit

Das System unterstützt drei Sprachen:
- **Deutsch** (Primär)
- **Dänisch** 
- **Englisch**

Alle Produktnamen, Beschreibungen und UI-Texte werden automatisch übersetzt. Neue Sprachen können einfach in `/src/data/translations.json` hinzugefügt werden.

## 📱 QR-Code System

### Funktionalität
- **Tischspezifische URLs**: `/table/{tableId}`
- **Bulk-Generation**: Mehrere QR-Codes auf einmal
- **PDF-Export**: Druckfertige QR-Code-Blätter
- **Analytics**: Tracking von QR-Code Scans

### Verwendung
1. Admin-Panel → QR-Codes
2. Tischnummer eingeben
3. QR-Code generieren
4. Als PNG herunterladen oder drucken

## 🔐 Admin-Zugang

### Standard-Zugangsdaten (Demo)
- **Benutzername**: `admin`
- **Passwort**: `safira2024`

⚠️ **Wichtig**: Ändern Sie diese Zugangsdaten in der Produktionsumgebung!

## 📊 Analytics Features

### Dashboard-Metriken
- Gesamte Seitenaufrufe
- QR-Code Scans
- Durchschnittliche Sitzungsdauer
- Geräte-Verteilung (Mobile/Desktop)

### Erweiterte Analysen
- Stündliche Nutzungstrends
- Beliebte Menü-Kategorien
- Tisch-Aktivitätskarte
- Benutzer-Demografie

## 🚀 Deployment

### Produktions-Deployment
1. Environment-Variablen für Produktion setzen
2. `npm run build` ausführen
3. Server auf VPS/Cloud-Provider deployen
4. SSL-Zertifikat einrichten (Let's Encrypt empfohlen)
5. Domain verknüpfen

### Empfohlene Hosting-Optionen
- **Frontend**: Netlify, Vercel
- **Backend**: DigitalOcean, AWS EC2, Heroku
- **CDN**: Cloudflare
- **SSL**: Let's Encrypt

## 🔧 Entwicklung

### Development Scripts
```bash
npm start          # Frontend Development Server
npm run server     # Backend Development Server  
npm run dev        # Beide gleichzeitig
npm run build      # Production Build
npm test           # Tests ausführen
```

### Code-Standards
- **TypeScript** für Type Safety
- **ESLint** für Code Quality
- **Prettier** für Code Formatting
- **Styled Components** für CSS-in-JS

## 📝 Lizenz

Dieses Projekt wurde speziell für die Safira Lounge entwickelt. Alle Rechte vorbehalten.

## 🤝 Support

Bei Fragen oder Problemen:
- **GitHub Issues**: Erstellen Sie ein Issue im Repository
- **Email**: info@safira-lounge.de
- **Telefon**: +49 461 123456

## 🚀 Features für die Zukunft

### Geplante Erweiterungen
- **Online-Bestellung**: Integration eines Bestellsystems
- **Tischreservierung**: Reservierungsmanagement
- **Push-Notifications**: Für Sonderangebote
- **Kundenbewertungen**: Bewertungssystem
- **Inventory Management**: Lagerbestandsverwaltung
- **Staff-App**: Mobile App für Servicepersonal

### Technische Verbesserungen
- **Progressive Web App** (PWA) Features
- **Offline-Modus** mit Service Workers
- **Real-time Updates** mit WebSocket
- **Advanced Analytics** mit Machine Learning
- **Multi-Location Support** für Franchise

---

**Entwickelt mit ❤️ für die Safira Lounge**

*Norderstraße 11-13, 24939 Flensburg*