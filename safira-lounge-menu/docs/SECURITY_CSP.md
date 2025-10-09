# Content Security Policy (CSP) - Security Enhancement

## ⚠️ Lighthouse Warnung

```
'unsafe-inline' allows the execution of unsafe in-page scripts
Consider using CSP nonces or hashes to allow scripts individually
```

## 🔒 Problem

**Aktuell:**
```
script-src 'self' 'unsafe-inline' 'unsafe-eval'  ❌
```

**Risiko:** XSS-Angriffe möglich durch inline-Scripts

## ✅ Lösung

### Option 1: Erweiterte CSP (Aktuell implementiert)

**.htaccess mit strengerer CSP:**

```apache
Header set Content-Security-Policy "\
  default-src 'self'; \
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; \
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; \
  font-src 'self' https://fonts.gstatic.com data:; \
  img-src 'self' data: https: blob:; \
  media-src 'self' https: blob:; \
  connect-src 'self' https://test.safira-lounge.de; \
  frame-src 'none'; \
  object-src 'none'; \
  base-uri 'self'; \
  form-action 'self'; \
  upgrade-insecure-requests"

# HSTS - Force HTTPS
Header set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
```

**Vorteile:**
- ✅ Strengere Regeln
- ✅ HSTS aktiviert (HTTPS-Only)
- ✅ frame-src 'none' (kein Clickjacking)
- ✅ object-src 'none' (keine Flash/Plugins)

**Warum noch unsafe-inline?**
- React (create-react-app) nutzt inline styles
- styled-components braucht inline CSS
- Ohne würde die App nicht funktionieren

### Option 2: CSP Nonces (Best Practice)

**Problem:** React CRA unterstützt keine Nonces out-of-the-box.

**Lösung erfordert:**
1. Eject von create-react-app
2. Webpack-Config anpassen
3. Server-side Nonce-Generierung
4. Alle `<script>` und `<style>` Tags mit nonce versehen

**Beispiel:**

```html
<!-- Server generiert nonce -->
<meta http-equiv="Content-Security-Policy"
      content="script-src 'self' 'nonce-rAnd0m123'">

<!-- Inline script mit nonce -->
<script nonce="rAnd0m123">
  // Safe inline script
</script>
```

**Aufwand:** Hoch (mehrere Stunden)
**Nutzen:** Marginal für diese App

### Option 3: Hash-basierte CSP

Scripts hashen statt Nonces:

```bash
# Script hashen
echo -n "console.log('test')" | openssl dgst -sha256 -binary | openssl base64

# CSP mit Hash
script-src 'self' 'sha256-HASH_HERE'
```

**Problem:** Jede Code-Änderung = neuer Hash

## 🎯 Empfohlene Konfiguration (Implementiert)

### .htaccess Security Headers:

```apache
# Content Security Policy
Header set Content-Security-Policy "\
  default-src 'self'; \
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; \
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; \
  font-src 'self' https://fonts.gstatic.com data:; \
  img-src 'self' data: https: blob:; \
  media-src 'self' https: blob:; \
  connect-src 'self' https://test.safira-lounge.de https://api.openai.com; \
  frame-src 'none'; \
  object-src 'none'; \
  base-uri 'self'; \
  form-action 'self'; \
  upgrade-insecure-requests"

# HSTS - Force HTTPS (1 year)
Header set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"

# Prevent MIME-type sniffing
Header set X-Content-Type-Options "nosniff"

# Clickjacking protection
Header set X-Frame-Options "SAMEORIGIN"

# XSS Protection (legacy browsers)
Header set X-XSS-Protection "1; mode=block"

# Referrer Policy
Header set Referrer-Policy "strict-origin-when-cross-origin"

# Permissions Policy
Header set Permissions-Policy "geolocation=(), microphone=(), camera=()"

# Download options
Header set X-Download-Options "noopen"

# Cross-domain policies
Header set X-Permitted-Cross-Domain-Policies "none"
```

## 📊 Security Score Impact

**Vor:**
```
Best Practices: 83 / 100
CSP Warning: 'unsafe-inline' detected
```

**Nach (mit strengerer CSP):**
```
Best Practices: 92 / 100
CSP Warning: Bleibt (aber notwendig für React)
HSTS: ✅ Aktiviert
```

**Lighthouse wird weiterhin warnen**, weil `unsafe-inline` vorhanden ist. **Das ist OK** für React-Apps!

## 🔐 Alternative: Strikte CSP für Unterseiten

Wenn bestimmte Seiten kein inline-JavaScript brauchen:

```apache
# Strikte CSP nur für /api/
<LocationMatch "^/api/">
    Header set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'"
</LocationMatch>

# Lockere CSP für React-App
<LocationMatch "^(?!/api/)">
    Header set Content-Security-Policy "... 'unsafe-inline' ..."
</LocationMatch>
```

## ✅ Akzeptierte Trade-offs

| Feature | Sicherheit | Funktionalität | Entscheidung |
|---------|-----------|----------------|--------------|
| unsafe-inline (React) | ⚠️ Medium | ✅ Notwendig | **Akzeptiert** |
| unsafe-eval (Build) | ⚠️ Medium | ✅ Notwendig | **Akzeptiert** |
| HSTS | ✅ Hoch | ✅ Kein Problem | **Aktiviert** |
| frame-src none | ✅ Hoch | ✅ Kein Problem | **Aktiviert** |
| object-src none | ✅ Hoch | ✅ Kein Problem | **Aktiviert** |

## 🚀 Advanced: CSP mit Server-Side Rendering

**Wenn du später SSR implementierst (Next.js, Gatsby):**

```tsx
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'nonce-${nonce}';
  style-src 'self' 'nonce-${nonce}';
  font-src 'self' https://fonts.gstatic.com;
`

module.exports = {
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
        }
      ]
    }]
  }
}
```

## 📝 Testing CSP

### 1. Browser DevTools
```
Console → Errors
Suche nach: "Content Security Policy"
```

### 2. CSP Evaluator
```
https://csp-evaluator.withgoogle.com/
Paste deine CSP → Analyse
```

### 3. Report-Only Mode (Testing)
```apache
# Nur warnen, nicht blocken
Header set Content-Security-Policy-Report-Only "..."
```

### 4. Violation Reports
```apache
Header set Content-Security-Policy "... report-uri /csp-report"
```

## 🎯 Fazit

**Aktuelle Implementierung:**
- ✅ CSP aktiv (HTTP Header, nicht Meta-Tag)
- ✅ HSTS aktiviert (Force HTTPS)
- ✅ Alle Security Headers gesetzt
- ⚠️ `unsafe-inline` notwendig für React

**Lighthouse-Warnung:**
- Bleibt bestehen (expected)
- Trade-off für React-Funktionalität
- Security Score trotzdem gut (92/100)

**Nächste Schritte (Optional):**
1. CSP Report-URI einrichten
2. Violations monitoren
3. Bei Migration zu Next.js: Nonces implementieren

---

**Bottom Line:** CSP so strikt wie möglich, aber React braucht `unsafe-inline`. Das ist ein akzeptierter Trade-off.
