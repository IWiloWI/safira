# Server Optimization Guide

## Critical Issues

### 1. Slow Server Response (897ms)
The server is responding too slowly, blocking FCP and LCP. Target: < 200ms

### 2. Back/Forward Cache (bfcache) Disabled
API responses are sending `Cache-Control: no-store` which prevents browser bfcache optimization.

## PHP API Optimization (`safira-api-fixed.php`)

### 1. Enable OPcache (Critical - 50-70% speed improvement)

Add to `php.ini`:
```ini
; OPcache configuration
opcache.enable=1
opcache.enable_cli=0
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.validate_timestamps=0  # Production only
opcache.revalidate_freq=0
opcache.fast_shutdown=1
```

### 2. Database Connection Pooling

Current issue: Each request creates new DB connection (expensive)

**Solution**: Use persistent connections in PHP:
```php
// In safira-api-fixed.php database connection
$options = [
    PDO::ATTR_PERSISTENT => true,  // Enable connection pooling
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
    PDO::ATTR_EMULATE_PREPARES => false,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
];

$pdo = new PDO($dsn, $user, $password, $options);
```

### 3. Query Optimization

Add indexes to frequently queried columns:
```sql
-- Categories table
CREATE INDEX idx_categories_parent ON categories(parent_page);
CREATE INDEX idx_categories_main ON categories(is_main_category);
CREATE INDEX idx_categories_visible ON categories(is_visible);

-- Products table
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_visible ON products(is_visible);
CREATE INDEX idx_products_tobacco ON products(is_tobacco);

-- Composite indexes for common queries
CREATE INDEX idx_products_category_visible ON products(category_id, is_visible);
CREATE INDEX idx_categories_parent_visible ON categories(parent_page, is_visible);
```

### 4. Implement Response Caching & Fix bfcache

**CRITICAL**: Remove `no-store` from Cache-Control headers to enable bfcache:

```php
// In safira-api-fixed.php

// ❌ WRONG - Blocks bfcache
header('Cache-Control: no-cache, no-store, must-revalidate');

// ✅ CORRECT - Allows bfcache with revalidation
header('Cache-Control: public, max-age=300, s-maxage=600'); // 5min client, 10min CDN
header('ETag: ' . md5(json_encode($data)));

// Check if client has cached version
$ifNoneMatch = $_SERVER['HTTP_IF_NONE_MATCH'] ?? '';
if ($ifNoneMatch === md5(json_encode($data))) {
    http_response_code(304); // Not Modified
    exit;
}
```

**Why this matters:**
- `no-store` prevents browser back/forward cache (bfcache)
- bfcache makes back/forward navigation instant
- Can improve perceived performance by 50-90% for return visits

### 5. Use Redis/Memcached for Data Caching

Install Redis:
```bash
sudo apt-get install redis-server php-redis
```

Implement caching:
```php
$redis = new Redis();
$redis->connect('127.0.0.1', 6379);

function getCachedData($key, $callback, $ttl = 300) {
    global $redis;

    $cached = $redis->get($key);
    if ($cached !== false) {
        return json_decode($cached, true);
    }

    $data = $callback();
    $redis->setex($key, $ttl, json_encode($data));
    return $data;
}

// Usage
$categories = getCachedData('categories:all', function() {
    // Database query here
    return $pdo->query("SELECT * FROM categories")->fetchAll();
}, 300); // Cache for 5 minutes
```

### 6. Enable Brotli/Gzip Compression

Apache configuration (`.htaccess` already configured):
```apache
# Brotli (better compression than gzip)
<IfModule mod_brotli.c>
    AddOutputFilterByType BROTLI_COMPRESS application/json text/plain
</IfModule>

# Gzip fallback
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE application/json text/plain
</IfModule>
```

### 7. PHP-FPM Optimization

Configure `php-fpm.conf`:
```ini
pm = dynamic
pm.max_children = 50
pm.start_servers = 10
pm.min_spare_servers = 5
pm.max_spare_servers = 20
pm.max_requests = 500
```

### 8. MySQL/MariaDB Tuning

Add to `my.cnf`:
```ini
[mysqld]
# Query cache
query_cache_type = 1
query_cache_size = 256M
query_cache_limit = 2M

# Buffer pool
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2

# Connection pool
max_connections = 200
thread_cache_size = 16
table_open_cache = 4000
```

### 9. CDN Integration (Optional)

Use Cloudflare or similar CDN:
- Caches API responses at edge locations
- Reduces latency from 897ms to ~50-100ms
- Free tier available

### 10. HTTP/2 & HTTP/3

Enable in Apache:
```bash
sudo a2enmod http2
```

Add to Apache config:
```apache
Protocols h2 h2c http/1.1
H2Direct on
H2Push on
```

## Performance Metrics

### Current State
- Server Response: 897ms ❌
- TTFB (Time to First Byte): ~900ms ❌

### Target State
- Server Response: < 200ms ✅
- TTFB: < 200ms ✅

### Expected Improvements
1. OPcache: -400ms (50%)
2. Connection pooling: -100ms (11%)
3. Query optimization: -150ms (17%)
4. Redis caching: -200ms (22%)
5. HTTP/2 + Compression: -50ms (6%)

**Total estimated improvement: -900ms → ~200ms (78% faster)**

## Testing Commands

```bash
# Test server response time
curl -o /dev/null -s -w 'Total: %{time_total}s\nTTFB: %{time_starttransfer}s\n' https://test.safira-lounge.de/safira-api-fixed.php

# Test compression
curl -H "Accept-Encoding: gzip,deflate,br" -I https://test.safira-lounge.de/safira-api-fixed.php

# Check OPcache status
php -i | grep opcache

# Monitor Redis
redis-cli monitor
```

## Priority Order

1. **Enable OPcache** (Immediate, 50% improvement)
2. **Add database indexes** (30 minutes, 17% improvement)
3. **Enable persistent connections** (5 minutes, 11% improvement)
4. **Implement Redis caching** (1-2 hours, 22% improvement)
5. **Enable HTTP/2** (15 minutes, 6% improvement)

## Monitoring

After implementing optimizations, monitor using:
- Google PageSpeed Insights
- Chrome DevTools Network tab
- Server logs: `tail -f /var/log/apache2/access.log`
- PHP slow query log
- MySQL slow query log

---

**Critical**: The 897ms server response is the #1 bottleneck. Implementing items 1-3 should reduce this to ~300ms immediately.
