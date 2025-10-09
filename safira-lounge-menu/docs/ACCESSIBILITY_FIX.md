# Accessibility Fix - Heading Order

## ❌ Problem

Lighthouse Warnung:
```
Heading elements are not in a sequentially-descending order
Failing Element: <h3>GETRÄNKE-KATEGORIEN</h3>
```

**Issue:** Seite springt direkt zu `h3`, ohne `h1` und `h2`.

## ✅ Lösung

### 1. Heading-Hierarchie korrigieren

**Aktuell:**
```tsx
// DrinksCategoryLayout.tsx
const CategoryTitle = styled.h2`...`;  // Direkt h2, kein h1 auf der Seite
```

**Richtig:**
```tsx
// Seiten-Hierarchie:
h1 → Safira Lounge (Haupttitel)
  h2 → GETRÄNKE-KATEGORIEN (Kategorie-Titel)
    h3 → Subcategories (falls vorhanden)
      h4 → Product names (falls als Headings)
```

### 2. Quick Fix (Minimal Change)

**Option A: Logo als h1 mit visuell verstecktem Text**

```tsx
// MenuHeader.tsx
const VisuallyHidden = styled.span`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

<LogoSection>
  <h1>
    <VisuallyHidden>Safira Lounge Menü</VisuallyHidden>
    <LogoImg src="/images/safira_logo_280w.webp" alt="" />
  </h1>
</LogoSection>
```

**Option B: Kategorie-Titel als h1**

```tsx
// DrinksCategoryLayout.tsx
const CategoryTitle = styled.h1`  // h2 → h1
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  // ... rest bleibt gleich
`;
```

### 3. Vollständige Struktur (Empfohlen)

```tsx
// HomePage.tsx - Hauptseite
<h1>Willkommen bei Safira Lounge</h1>
<h2>Unsere Kategorien</h2>

// MenuPage.tsx - Kategorie-Seite
<h1>Safira Lounge</h1>
<h2>Getränke</h2>
<h3>Cocktails</h3>  // Subcategory
```

## 🚀 Implementierung

### Datei 1: src/components/Menu/MenuHeader.tsx

```tsx
// Add VisuallyHidden component
const VisuallyHidden = styled.span`
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0,0,0,0) !important;
  white-space: nowrap !important;
  border: 0 !important;
`;

// Update LogoSection
<LogoSection>
  <h1 style={{ margin: 0, padding: 0 }}>
    <VisuallyHidden>Safira Lounge Menü</VisuallyHidden>
    <LogoImg
      src="/images/safira_logo_280w.webp"
      alt=""  // Empty alt because h1 has text
      aria-hidden="true"  // Hide from screen readers
    />
  </h1>
</LogoSection>
```

### Datei 2: src/components/Menu/DrinksCategoryLayout.tsx

**Behalte h2** (jetzt korrekt nach h1):

```tsx
const CategoryTitle = styled.h2`  // Bleibt h2
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  // ... rest unchanged
`;
```

### Datei 3: src/components/Menu/SubcategoryTabs.tsx

**Falls vorhanden, nutze h3:**

```tsx
const SubcategoryTitle = styled.h3`  // h3 für Subcategories
  // ...
`;
```

## 📊 Erwartetes Ergebnis

**Vor:**
```
(keine h1)
  <h2>GETRÄNKE-KATEGORIEN</h2>  ❌
```

**Nach:**
```
<h1>Safira Lounge Menü</h1>  ✅ (visuell versteckt)
  <h2>GETRÄNKE-KATEGORIEN</h2>  ✅ (jetzt korrekt)
    <h3>Cocktails</h3>  ✅ (optional für Subs)
```

## 🔧 Alternative: ARIA Labels

Falls du die Struktur nicht ändern willst:

```tsx
// Behalte visuell alles gleich, aber füge ARIA hinzu
<header role="banner" aria-label="Safira Lounge">
  <LogoImg src="..." alt="Safira Lounge" role="heading" aria-level="1" />
</header>

<CategoryTitle role="heading" aria-level="2">
  GETRÄNKE-KATEGORIEN
</CategoryTitle>
```

## ✅ Testing

### Manual Check
```bash
# Browser DevTools → Elements
# Suche nach: h1, h2, h3, h4

Richtige Reihenfolge:
✓ h1 (1x pro Seite)
✓ h2 (mehrere erlaubt)
✓ h3 (innerhalb h2)
✓ h4 (innerhalb h3)
```

### Lighthouse
```bash
# Nach Fix:
✓ Heading elements are in sequentially-descending order
✓ Accessibility Score: +5 Punkte
```

### Screen Reader Test
```bash
# VoiceOver (Mac): Cmd+F5
# Navigate with: Ctrl+Option+Cmd+H (next heading)

Expected:
1. "Heading level 1: Safira Lounge Menü"
2. "Heading level 2: Getränke-Kategorien"
3. "Heading level 3: Cocktails"
```

## 🎯 Empfohlene Lösung

**Schnellste Fix (5 Minuten):**

1. MenuHeader.tsx → Logo in `<h1>` mit VisuallyHidden Text
2. DrinksCategoryLayout.tsx → Behalte `<h2>`
3. Done ✅

**Code:**

```tsx
// src/components/Menu/MenuHeader.tsx

const VisuallyHidden = styled.span`
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0,0,0,0) !important;
  white-space: nowrap !important;
  border: 0 !important;
`;

// In component:
<h1 style={{ margin: 0, padding: 0, lineHeight: 0 }}>
  <VisuallyHidden>Safira Lounge Digital Menu</VisuallyHidden>
  <LogoImg src="/images/safira_logo_280w.webp" alt="" />
</h1>
```

## 📈 Performance Impact

- **Bundle Size:** +0 KB (inline styles)
- **Runtime:** +0ms (pure CSS)
- **Accessibility:** +5 Lighthouse points ✅
- **SEO:** Improved semantic structure ✅

## 🔍 Other Accessibility Improvements

While fixing headings, also check:

### 1. Skip Links
```tsx
<SkipLink href="#main-content">
  Skip to main content
</SkipLink>
```

### 2. ARIA Landmarks
```tsx
<header role="banner">...</header>
<nav role="navigation">...</nav>
<main role="main" id="main-content">...</main>
<footer role="contentinfo">...</footer>
```

### 3. Button Labels
```tsx
<button aria-label="Zurück zur Hauptseite">
  ←
</button>
```

### 4. Image Alt Text
```tsx
<img src="cocktail.webp" alt="Bunter Cocktail mit Früchten" />
// NOT: alt="cocktail-image.jpg"
```

---

**Bottom Line:** Füge `<h1>` im MenuHeader hinzu, behalte `<h2>` für Kategorien.
Warnung verschwindet! ✅
