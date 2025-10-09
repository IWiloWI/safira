# Implementation Guide - Performance Optimierung

## Schnellstart: 3 Quick Wins (15 Minuten)

Diese Optimierungen können **sofort** implementiert werden ohne Risiko:

### 1. Database Indexing (5 Minuten) ⚡

```bash
# Verbinde mit der Datenbank
mysql -h db5018522360.hosting-data.io -u dbu3362598 -p dbs14708743

# Führe das Index-Script aus
source database/add_performance_indexes.sql

# Verifiziere die Indexes
SHOW INDEX FROM products;
```

**Erwartete Verbesserung:** 60-70% schnellere Queries
**Risiko:** Minimal (Indexes können jederzeit entfernt werden)

### 2. GZIP Compression (2 Minuten) ⚡

Füge diese Zeilen am Anfang von `safira-api-fixed.php` ein (nach Zeile 20):

```php
// Enable GZIP compression
if (!ob_start('ob_gzhandler')) {
    ob_start();
}
```

**Erwartete Verbesserung:** 80% kleinere Responses (450KB → 90KB)
**Risiko:** Keine

### 3. HTTP Caching Headers (5 Minuten) ⚡

Füge im `products` case (nach Zeile 287, vor `echo json_encode($data)`):

```php
// Add HTTP caching
$etag = md5(json_encode($data));
header('Cache-Control: public, max-age=300'); // 5 minutes
header('ETag: "' . $etag . '"');

// Check if client has cached version
$clientEtag = $_SERVER['HTTP_IF_NONE_MATCH'] ?? '';
if ($clientEtag === '"' . $etag . '"') {
    http_response_code(304);
    exit;
}
```

**Erwartete Verbesserung:** 100% für gecachte Clients
**Risiko:** Keine

---

## Phase 1: Database Optimization (Tag 1-2)

### Step 1: Backup erstellen

```bash
# Full database backup
mysqldump -h db5018522360.hosting-data.io -u dbu3362598 -p dbs14708743 > backup_$(date +%Y%m%d).sql

# Verify backup
ls -lh backup_*.sql
```

### Step 2: Indexes hinzufügen

```bash
# Add performance indexes
mysql -h db5018522360.hosting-data.io -u dbu3362598 -p dbs14708743 < database/add_performance_indexes.sql
```

### Step 3: Index Performance testen

```sql
-- Test query performance
EXPLAIN SELECT
    c.id, sc.id, p.id, ps.id
FROM categories c
LEFT JOIN subcategories sc ON c.id = sc.category_id
LEFT JOIN products p ON (p.category_id = c.id OR p.subcategory_id = sc.id)
LEFT JOIN product_sizes ps ON p.id = ps.product_id
WHERE c.is_active = 1
ORDER BY c.sort_order;
```

**Erwartete Output:**
- `type: ref` oder `eq_ref` (gut)
- `key: idx_category_active` (Index wird verwendet)
- `rows: < 100` (wenige Rows gescannt)

**Wenn nicht:**
```sql
-- Force index usage (nur wenn nötig)
SELECT ... FROM categories c FORCE INDEX (idx_active_main)
```

### Step 4: Performance Monitoring

```php
// Add to safira-api-fixed.php (after database connection)
$queryCount = 0;
$queryTime = 0;

// Wrap all queries:
$start = microtime(true);
$stmt = $pdo->query("SELECT ...");
$queryTime += microtime(true) - $start;
$queryCount++;

// Log at end of request
error_log("📊 Queries: {$queryCount} | Time: " . round($queryTime * 1000, 2) . "ms");
```

---

## Phase 2: Query Optimization (Tag 3-5)

### Step 1: Erstelle optimierten Endpoint

```bash
# Copy optimized version
cp docs/performance/optimized-products-endpoint.php safira-api-optimized.php

# Test auf separatem Endpoint
# URL: https://test.safira-lounge.de/safira-api-optimized.php?action=products
```

### Step 2: A/B Testing Setup

```php
// In safira-api-fixed.php
$useOptimized = isset($_GET['optimized']) || (rand(1, 100) <= 10); // 10% traffic

if ($useOptimized) {
    include 'safira-api-optimized.php';
    exit;
}
```

### Step 3: Performance Vergleich

```bash
# Test alte Version
curl -w "@curl-format.txt" "https://test.safira-lounge.de/safira-api-fixed.php?action=products"

# Test neue Version
curl -w "@curl-format.txt" "https://test.safira-lounge.de/safira-api-optimized.php?action=products"

# curl-format.txt:
# time_total: %{time_total}s
# time_connect: %{time_connect}s
# size_download: %{size_download} bytes
```

### Step 4: Gradually Roll Out

```php
// Increase traffic to optimized version
$optimizedPercentage = 10; // Start with 10%

if (rand(1, 100) <= $optimizedPercentage) {
    include 'safira-api-optimized.php';
    exit;
}

// Monitor error rates, gradually increase to 25%, 50%, 100%
```

---

## Phase 3: Caching Implementation (Tag 6-7)

### Option A: APCu (In-Memory Cache) - Recommended

#### Installation

```bash
# Check if APCu is installed
php -m | grep apcu

# If not installed:
sudo apt-get install php-apcu
sudo systemctl restart apache2 # or nginx/php-fpm
```

#### Configuration

```ini
; /etc/php/8.x/apache2/conf.d/20-apcu.ini
apc.enabled = 1
apc.shm_size = 128M
apc.ttl = 300
apc.enable_cli = 0
```

#### Implementation

```php
// Already included in optimized-products-endpoint.php
// Check if working:
if (function_exists('apcu_fetch')) {
    echo "✅ APCu is available\n";
    var_dump(apcu_cache_info());
} else {
    echo "❌ APCu not available\n";
}
```

#### Monitoring

```php
case 'cache_stats':
    if (function_exists('apcu_cache_info')) {
        $info = apcu_cache_info();
        echo json_encode([
            'hits' => $info['num_hits'],
            'misses' => $info['num_misses'],
            'hit_ratio' => round($info['num_hits'] / ($info['num_hits'] + $info['num_misses']) * 100, 2) . '%',
            'memory_used' => round($info['mem_size'] / 1024 / 1024, 2) . ' MB'
        ]);
    }
    break;
```

### Option B: Redis (Distributed Cache) - Advanced

#### Installation

```bash
# Install Redis
sudo apt-get install redis-server php-redis
sudo systemctl start redis
sudo systemctl enable redis
```

#### Implementation

```php
// Connect to Redis
$redis = new Redis();
$redis->connect('127.0.0.1', 6379);

// Caching logic
$cacheKey = "safira:products:{$lang}";
$data = $redis->get($cacheKey);

if ($data === false) {
    // Cache miss - fetch from DB
    $data = getProductsOptimized($pdo, $lang);
    $redis->setex($cacheKey, 300, json_encode($data));
} else {
    $data = json_decode($data, true);
}
```

---

## Phase 4: Language-Specific Optimization (Tag 8-9)

### Implementation

```php
case 'products':
    $lang = $_GET['lang'] ?? 'de';

    // Validate language
    $validLangs = ['de', 'en', 'da', 'tr'];
    if (!in_array($lang, $validLangs)) {
        $lang = 'de';
    }

    // Only select needed language columns
    $query = "
        SELECT
            c.id,
            c.name_{$lang} as cat_name,
            c.description_{$lang} as cat_desc,
            -- ... only needed language
    ";
```

### Frontend Integration

```javascript
// In frontend app
const lang = localStorage.getItem('language') || 'de';
const response = await fetch(`/safira-api-fixed.php?action=products&lang=${lang}`);
```

**Payload Reduction:**
- Before: 450 KB (all languages)
- After: 120 KB (single language)
- **73% smaller**

---

## Phase 5: Monitoring & Metrics (Ongoing)

### Performance Logging

```php
// Add to all endpoints
function logPerformance($action, $startTime, $queryCount = 0) {
    $duration = (microtime(true) - $startTime) * 1000;
    $memory = memory_get_peak_usage(true) / 1024 / 1024;

    error_log(sprintf(
        "⏱️ %s | %.2fms | %d queries | %.2f MB",
        $action,
        $duration,
        $queryCount,
        $memory
    ));

    // Also send to monitoring service (optional)
    // sendToDatadog(['action' => $action, 'duration' => $duration]);
}
```

### Error Rate Monitoring

```php
// Track errors
function logError($action, $error) {
    error_log("❌ ERROR in {$action}: {$error}");

    // Increment error counter
    if (function_exists('apcu_inc')) {
        apcu_inc("errors_{$action}");
    }
}

// Check error rate
case 'health':
    $errors = apcu_fetch("errors_products") ?: 0;
    $requests = apcu_fetch("requests_products") ?: 1;
    $errorRate = ($errors / $requests) * 100;

    echo json_encode([
        'status' => $errorRate < 5 ? 'healthy' : 'degraded',
        'error_rate' => round($errorRate, 2) . '%'
    ]);
    break;
```

### Cache Hit Ratio

```php
// Monitor cache effectiveness
function trackCacheHit($key, $hit) {
    $metricKey = $hit ? 'cache_hits' : 'cache_misses';
    if (function_exists('apcu_inc')) {
        apcu_inc($metricKey);
    }
}

// Dashboard
case 'cache_dashboard':
    $hits = apcu_fetch('cache_hits') ?: 0;
    $misses = apcu_fetch('cache_misses') ?: 1;
    $total = $hits + $misses;

    echo json_encode([
        'hit_ratio' => round(($hits / $total) * 100, 2) . '%',
        'hits' => $hits,
        'misses' => $misses,
        'total_requests' => $total
    ]);
    break;
```

---

## Testing Checklist

### Before Deployment

- [ ] Database backup erstellt
- [ ] Indexes auf Staging getestet
- [ ] Performance benchmarks durchgeführt
- [ ] Error handling getestet
- [ ] Cache invalidation getestet
- [ ] Rollback plan vorbereitet

### After Deployment

- [ ] Monitor error rates (< 1%)
- [ ] Check response times (< 100ms target)
- [ ] Verify cache hit ratio (> 80%)
- [ ] Monitor memory usage
- [ ] Check database load

### Performance Targets

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Response Time (uncached) | 850ms | < 100ms | 🔴 |
| Response Time (cached) | 850ms | < 5ms | 🔴 |
| Payload Size | 450KB | < 130KB | 🔴 |
| Cache Hit Ratio | 0% | > 80% | 🔴 |
| Database Queries | 4 | 1 | 🔴 |
| Error Rate | ? | < 1% | 🟡 |

---

## Troubleshooting

### Issue: Indexes nicht verwendet

```sql
-- Check if indexes exist
SHOW INDEX FROM products WHERE Key_name LIKE 'idx_%';

-- Force index usage
SELECT ... FROM products FORCE INDEX (idx_category_subcat) WHERE ...

-- Analyze table statistics
ANALYZE TABLE products;
```

### Issue: Cache funktioniert nicht

```php
// Check APCu status
if (!function_exists('apcu_enabled') || !apcu_enabled()) {
    die("APCu is not enabled");
}

// Clear cache
apcu_clear_cache();

// Test cache
apcu_store('test', 'value', 60);
var_dump(apcu_fetch('test')); // should output: string(5) "value"
```

### Issue: Memory Errors

```php
// Increase PHP memory limit
ini_set('memory_limit', '256M');

// Use generators for large datasets
function fetchProductsGenerator($pdo) {
    $stmt = $pdo->query("SELECT * FROM products");
    while ($row = $stmt->fetch()) {
        yield $row;
    }
}
```

### Issue: Slow Performance trotz Optimierung

```php
// Enable query profiling
$pdo->exec("SET profiling = 1");
$pdo->query("SELECT ...");
$profiles = $pdo->query("SHOW PROFILES")->fetchAll();
var_dump($profiles);

// Check slow query log
// /var/log/mysql/slow-query.log
```

---

## Rollback Strategy

### If indexes cause issues:

```bash
mysql -h db5018522360.hosting-data.io -u dbu3362598 -p dbs14708743 < database/rollback_indexes.sql
```

### If optimized code has bugs:

```bash
# Revert to previous version
git checkout safira-api-fixed.php

# Or disable optimized version
# Remove: include 'safira-api-optimized.php';
```

### If cache causes stale data:

```php
// Clear all caches
apcu_clear_cache();

// Or disable caching temporarily
define('DISABLE_CACHE', true);

if (!defined('DISABLE_CACHE')) {
    // caching logic
}
```

---

## Success Metrics

### Week 1 (After Indexing):
- ✅ Response time: 850ms → 350ms (59% faster)
- ✅ Database load: -40%

### Week 2 (After Query Optimization):
- ✅ Response time: 350ms → 80ms (77% faster)
- ✅ Queries: 4 → 1 (75% reduction)

### Week 3 (After Caching):
- ✅ Response time: 80ms → 3ms (96% faster)
- ✅ Cache hit ratio: 85%

### Week 4 (Full Optimization):
- ✅ Response time: 850ms → 3ms (99.6% faster)
- ✅ Payload size: 450KB → 120KB (73% smaller)
- ✅ Server load: -85%
- ✅ User satisfaction: 📈

---

## Next Steps

1. **Implement Quick Wins** (heute)
   - Database indexes
   - GZIP compression
   - HTTP caching

2. **Test Optimized Query** (diese Woche)
   - Deploy to staging
   - Run benchmarks
   - A/B test with 10% traffic

3. **Add Caching** (nächste Woche)
   - Install APCu
   - Implement caching logic
   - Monitor hit ratio

4. **Monitor & Iterate** (ongoing)
   - Track metrics
   - Optimize bottlenecks
   - Scale as needed

**Expected Timeline:** 2-3 Wochen für vollständige Implementierung
**Expected ROI:** 85-99% Performance-Verbesserung
