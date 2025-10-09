# Performance Optimization Roadmap
## Von 4.4s auf <200ms - Schritt für Schritt

**Aktueller Status:** 🔴 4,425ms (KRITISCH)
**Ziel:** 🟢 <200ms (95% Verbesserung)
**Stretch Goal:** ⭐ <100ms

---

## 🎯 Phase 1: SOFORTIGE MASSNAHMEN (Quick Wins)
**Zeitaufwand:** 2-4 Stunden
**Erwartete Verbesserung:** 50-70% (auf ~1-2s)

### 1.1 Backend-Code analysieren (30 Min)
```bash
# API-Datei überprüfen
cd /Users/umitgencay/Safira/safira-lounge-menu
```

**Zu prüfen:**
- [ ] Datenbankabfragen zählen (wie viele Queries pro Request?)
- [ ] N+1 Query Problem identifizieren
- [ ] Unnötige JOINs finden
- [ ] Datenmenge prüfen (werden zu viele Daten geladen?)

**Tools:**
```bash
# PHP Debug-Logging aktivieren
# In safira-api-fixed.php am Anfang hinzufügen:
error_reporting(E_ALL);
ini_set('display_errors', 1);
$start_time = microtime(true);

# Am Ende:
$end_time = microtime(true);
error_log("API execution time: " . ($end_time - $start_time));
```

---

### 1.2 Database Query Optimization (1-2 Std)

**Schritt 1: Slow Query Log aktivieren**
```sql
-- In MySQL/MariaDB
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 0.1;  -- Queries > 100ms loggen
SHOW VARIABLES LIKE 'slow_query_log_file';
```

**Schritt 2: Indexes prüfen**
```sql
-- Fehlende Indexes finden
SHOW INDEX FROM products;
SHOW INDEX FROM categories;
SHOW INDEX FROM subcategories;

-- Typische Quick Wins:
CREATE INDEX idx_category_id ON products(categoryId);
CREATE INDEX idx_subcategory_id ON products(subcategoryId);
CREATE INDEX idx_available ON products(available);
CREATE INDEX idx_sort_order ON categories(sortOrder);
```

**Schritt 3: Query Optimization**
```php
// VORHER (langsam):
$products = getAllProducts();
foreach ($products as $product) {
    $product->category = getCategory($product->categoryId);  // N+1 Problem!
}

// NACHHER (schnell):
$products = getAllProductsWithCategories();  // 1 Query mit JOIN
```

---

### 1.3 Response Caching implementieren (1 Std)

**Option A: PHP OpCache (einfachste)**
```php
// In php.ini oder .htaccess
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
opcache.revalidate_freq=2
```

**Option B: Response Caching**
```php
// In safira-api-fixed.php
$cache_key = 'products_' . md5($_GET['action']);
$cache_file = '/tmp/api_cache_' . $cache_key . '.json';
$cache_time = 300; // 5 Minuten

if (file_exists($cache_file) && (time() - filemtime($cache_file)) < $cache_time) {
    header('Content-Type: application/json');
    header('X-Cache: HIT');
    readfile($cache_file);
    exit;
}

// Normale API-Logik hier...
$response = json_encode($data);

file_put_contents($cache_file, $response);
header('X-Cache: MISS');
echo $response;
```

**Erwartete Verbesserung:** 4.4s → 1-2s (cached requests: <100ms)

---

### 1.4 HTTP Headers optimieren (15 Min)

```php
// In safira-api-fixed.php am Anfang
header('Content-Type: application/json; charset=utf-8');

// Caching Headers
header('Cache-Control: public, max-age=300'); // 5 Min Browser-Cache
header('Vary: Accept-Encoding');

// GZIP Compression (wenn noch nicht aktiv)
if (!ob_start('ob_gzhandler')) {
    ob_start();
}
```

---

## 🔧 Phase 2: BACKEND OPTIMIERUNG (Tag 2-3)
**Zeitaufwand:** 1-2 Tage
**Erwartete Verbesserung:** 1-2s → 200-500ms

### 2.1 Database Connection Pooling
```php
// Persistent Connections nutzen
$db = new PDO(
    'mysql:host=localhost;dbname=safira',
    'user',
    'pass',
    [PDO::ATTR_PERSISTENT => true]
);
```

### 2.2 Query Results minimieren
```php
// VORHER: Alle Felder laden
SELECT * FROM products WHERE available = 1;

// NACHHER: Nur benötigte Felder
SELECT id, name, price, image, categoryId
FROM products
WHERE available = 1;
```

### 2.3 Batch Processing für Relationen
```php
// VORHER: N+1 Queries
foreach ($categories as $category) {
    $category->items = getProductsByCategory($category->id);
}

// NACHHER: 2 Queries total
$categoryIds = array_column($categories, 'id');
$products = getProductsByCategories($categoryIds);
$grouped = groupBy($products, 'categoryId');
```

### 2.4 JSON Encoding optimieren
```php
// Schnellere JSON-Generierung
$json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
```

---

## 🚀 Phase 3: SERVER OPTIMIERUNG (Tag 4-5)
**Zeitaufwand:** 2-3 Tage
**Erwartete Verbesserung:** 200-500ms → <200ms

### 3.1 PHP-FPM Konfiguration
```ini
; /etc/php-fpm.d/www.conf
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 500
```

### 3.2 MySQL/MariaDB Tuning
```ini
; /etc/my.cnf
[mysqld]
innodb_buffer_pool_size = 256M
query_cache_size = 64M
query_cache_type = 1
max_connections = 100
thread_cache_size = 8
```

### 3.3 Nginx/Apache Optimization
```nginx
# Nginx Caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 365d;
    add_header Cache-Control "public, immutable";
}

# API Caching
location /safira-api-fixed.php {
    fastcgi_cache_valid 200 5m;
    fastcgi_cache_bypass $http_pragma;
}
```

---

## 🔐 Phase 4: SSL & SECURITY (Parallel zu Phase 2-3)
**Zeitaufwand:** 2-4 Stunden
**Erwartete Verbesserung:** Security + Professionelles Setup

### 4.1 SSL Zertifikat installieren

**Option A: Let's Encrypt (KOSTENLOS, empfohlen)**
```bash
# Auf dem Server
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# SSL Zertifikat generieren
sudo certbot --nginx -d test.safira-lounge.de

# Auto-Renewal testen
sudo certbot renew --dry-run
```

**Option B: IONOS/Hoster SSL**
- Im IONOS Control Panel SSL aktivieren
- Automatische Installation
- Meist 2-24 Stunden Aktivierungszeit

### 4.2 HTTPS erzwingen
```nginx
# Nginx: HTTP → HTTPS Redirect
server {
    listen 80;
    server_name test.safira-lounge.de;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name test.safira-lounge.de;

    ssl_certificate /etc/letsencrypt/live/test.safira-lounge.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/test.safira-lounge.de/privkey.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000" always;
}
```

---

## 📊 Phase 5: MONITORING & VALIDATION
**Fortlaufend**

### 5.1 Performance Monitoring Setup
```bash
# Automatische Performance Tests
cat > monitor-api.sh << 'EOF'
#!/bin/bash
for i in {1..10}; do
    curl -w "Test $i: %{time_total}s\n" \
         -o /dev/null -s \
         "http://test.safira-lounge.de/safira-api-fixed.php?action=products"
    sleep 1
done
EOF

chmod +x monitor-api.sh
./monitor-api.sh
```

### 5.2 Benchmark nach jeder Optimierung
```bash
# Vor Änderung
npx claude-flow@alpha hooks pre-task --description "Before optimization X"
./monitor-api.sh > before.txt

# Nach Änderung
./monitor-api.sh > after.txt
npx claude-flow@alpha hooks post-task --task-id "optimization-x" --memory-key "performance/opt-x"

# Vergleich
echo "Improvement: $(($(cat before.txt) - $(cat after.txt)))ms"
```

---

## 🎯 PRIORITY MATRIX

### KRITISCH (Heute starten):
1. ✅ Backend-Code analysieren
2. ✅ Database Indexes prüfen
3. ✅ Response Caching implementieren
4. ✅ Slow Queries identifizieren

### HOCH (Diese Woche):
5. ⬜ Query Optimization (N+1 fixes)
6. ⬜ SSL Zertifikat installieren
7. ⬜ OpCache aktivieren
8. ⬜ GZIP Compression

### MITTEL (Nächste Woche):
9. ⬜ Connection Pooling
10. ⬜ Server Configuration Tuning
11. ⬜ CDN Setup prüfen
12. ⬜ Monitoring implementieren

---

## 📈 ERFOLGS-METRIKEN

| Phase | Ziel | Aktuell | Status |
|-------|------|---------|--------|
| Baseline | - | 4,425ms | 🔴 |
| Phase 1 | <2,000ms | - | ⬜ |
| Phase 2 | <500ms | - | ⬜ |
| Phase 3 | <200ms | - | ⬜ |
| Stretch | <100ms | - | ⬜ |

---

## 🔍 DEBUGGING CHECKLIST

**Wenn Performance nicht verbessert:**

- [ ] PHP Error Log checken: `tail -f /var/log/php-fpm/error.log`
- [ ] MySQL Slow Query Log: `tail -f /var/log/mysql/slow.log`
- [ ] Network Latency testen: `ping test.safira-lounge.de`
- [ ] Server Resources: `top`, `htop`, `free -h`
- [ ] Database Status: `SHOW PROCESSLIST;`
- [ ] PHP-FPM Status: `systemctl status php-fpm`

---

## 💡 QUICK WIN COMMANDS

```bash
# 1. Database Indexes erstellen
mysql -u root -p safira << 'EOF'
ALTER TABLE products ADD INDEX idx_category (categoryId);
ALTER TABLE products ADD INDEX idx_subcategory (subcategoryId);
ALTER TABLE products ADD INDEX idx_available (available);
OPTIMIZE TABLE products;
EOF

# 2. OpCache Status prüfen
php -i | grep opcache

# 3. Cache leeren
php -r "opcache_reset();"
rm -rf /tmp/api_cache_*

# 4. Performance Test
for i in {1..5}; do
    curl -w "Time: %{time_total}s\n" -o /dev/null -s \
    "http://test.safira-lounge.de/safira-api-fixed.php?action=products"
done
```

---

## 📞 NÄCHSTE SCHRITTE - KONKRET

**JETZT SOFORT:**
```bash
# 1. Backend-Datei öffnen und analysieren
cd /Users/umitgencay/Safira/safira-lounge-menu
# PHP-Datei finden (wahrscheinlich im Backend-Verzeichnis)

# 2. Performance-Logging hinzufügen
# 3. Database Queries zählen
# 4. Quick Caching implementieren
```

**Soll ich mit der Code-Analyse beginnen?**
- Backend PHP-Datei analysieren
- Database Schema prüfen
- Quick Wins implementieren
