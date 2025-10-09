# Phase 1: Claude Flow Agent Prompts

Diese Datei enthält **fertige Prompts für Claude Flow Agents**, um jeden einzelnen Schritt von Phase 1 automatisiert auszuführen.

**Verwendung:**
```bash
# Einzelnen Agent spawnen:
npx claude-flow@alpha agent spawn --type researcher --prompt "PROMPT_HIER"

# Oder direkt Task orchestrieren:
npx claude-flow@alpha task orchestrate --task "PROMPT_HIER"
```

---

## 🔧 VORBEREITUNG (Pre-Steps)

### Pre-Step 1: Git Backup & Tag erstellen

**Prompt:**
```
You are a DevOps Engineer tasked with creating Git backups before performance optimization.

TASK:
1. Navigate to /Users/umitgencay/Safira/safira-lounge-menu
2. Run: git status
3. Stage all changes: git add .
4. Commit with message: "Pre Phase-1 snapshot - $(date +%Y-%m-%d_%H:%M)"
5. Create backup tag: git tag phase-1-backup-$(date +%Y%m%d_%H%M%S)
6. Verify: git log -1 and git tag | tail -1

HOOKS TO USE:
- npx claude-flow@alpha hooks pre-task --description "Git backup creation"
- npx claude-flow@alpha hooks post-task --task-id "git-backup"

SUCCESS CRITERIA:
- New commit created
- Tag created with timestamp
- No uncommitted changes

REPORT BACK:
- Git commit SHA
- Tag name
- Files staged count
```

**Agent Type:** `coder` oder `cicd-engineer`

---

### Pre-Step 2: Performance Baseline Measurement

**Prompt:**
```
You are a Performance Testing Specialist. Measure current API performance BEFORE optimizations.

TASK:
1. Create directory: mkdir -p docs/performance/measurements
2. Measure API performance:
   curl -w "\n\nPerformance Metrics:\nTime Total: %{time_total}s\nTime Connect: %{time_connect}s\nSize Download: %{size_download} bytes\n" \
     -o /dev/null -s \
     "https://test.safira-lounge.de/safira-api-fixed.php?action=products" \
     > docs/performance/measurements/baseline_before.txt
3. Parse results and extract Time Total
4. Test 3 times and calculate average

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "Baseline measurement"
- npx claude-flow@alpha hooks post-task --task-id "baseline" --memory-key "performance/baseline"

SUCCESS CRITERIA:
- baseline_before.txt created
- Time Total between 0.5s and 2.0s
- File size > 0 bytes

REPORT BACK:
- Average Time Total (seconds)
- Download size (KB)
- Connection time (ms)
- Baseline metric stored in memory
```

**Agent Type:** `perf-analyzer` oder `performance-benchmarker`

---

### Pre-Step 3: Database Backup

**Prompt:**
```
You are a Database Administrator. Create a complete backup of the production database.

TASK:
1. Create backup directory: mkdir -p backups/database
2. Execute mysqldump:
   mysqldump \
     -h db5018522360.hosting-data.io \
     -u dbu3362598 \
     -p'!Aramat1.' \
     dbs14708743 \
     > backups/database/backup_$(date +%Y%m%d_%H%M%S).sql
3. Verify backup size (should be >500 KB)
4. Test backup integrity by checking for "Dump completed"

SECURITY:
- DO NOT log the password
- Store backup path in memory for rollback

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "Database backup"
- npx claude-flow@alpha hooks post-task --task-id "db-backup" --memory-key "backups/database/path"

SUCCESS CRITERIA:
- Backup file created
- File size > 500 KB
- Contains "Dump completed" message

REPORT BACK:
- Backup filename
- File size (MB)
- Number of tables backed up
- Backup path stored in memory

ERROR HANDLING:
- If "Access denied" → verify credentials
- If file < 100 KB → connection interrupted, retry
```

**Agent Type:** `backend-dev` oder `cicd-engineer`

---

### Pre-Step 4: Code Backups

**Prompt:**
```
You are a Release Manager. Create backups of critical PHP files before modification.

TASK:
1. Create backup directory: mkdir -p backups/code
2. Backup these files:
   - cp api/index.php backups/code/index.php.backup
   - cp api/config.php backups/code/config.php.backup
   - cp safira-api-fixed-flat.php backups/code/safira-api-fixed-flat.php.backup
3. Verify all 3 files exist in backups/code/
4. Compare file sizes (original vs backup should match)

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "Code backups"
- npx claude-flow@alpha hooks post-task --task-id "code-backup"

SUCCESS CRITERIA:
- 3 backup files created
- File sizes match originals
- All files in backups/code/

REPORT BACK:
- List of backed up files
- Total backup size
- Checksum verification (optional)
```

**Agent Type:** `coder` or `cicd-engineer`

---

### Pre-Step 5: Create Curl Format File

**Prompt:**
```
You are a Testing Engineer. Create a curl output format file for performance testing.

TASK:
1. Create file: docs/performance/curl-format.txt with this content:
\n
==========================================
Performance Metrics
==========================================
Time Total:       %{time_total}s
Time Connect:     %{time_connect}s
Time Namelookup:  %{time_namelookup}s
Time Pretransfer: %{time_pretransfer}s
Time Starttrans:  %{time_starttransfer}s
Size Download:    %{size_download} bytes
Speed Download:   %{speed_download} bytes/sec
==========================================

2. Verify file created
3. Test with: curl -w "@docs/performance/curl-format.txt" -o /dev/null -s https://test.safira-lounge.de/

HOOKS:
- npx claude-flow@alpha hooks post-task --task-id "curl-format"

SUCCESS CRITERIA:
- File created
- Valid curl format syntax
- Test successful

REPORT BACK:
- File path
- Test result (success/failure)
```

**Agent Type:** `tester` or `coder`

---

## 💾 OPTIMIZATION 1: DATABASE INDEXES

### Step 1.1: Inspect SQL File

**Prompt:**
```
You are a Database Analyst. Inspect the performance indexes SQL file.

TASK:
1. Check if file exists: ls -lh database/add_performance_indexes.sql
2. Display first 50 lines: head -50 database/add_performance_indexes.sql
3. Count number of indexes: grep -c "ADD INDEX" database/add_performance_indexes.sql
4. List all index names: grep "ADD INDEX" database/add_performance_indexes.sql | grep -o "idx_[a-z_]*"
5. Identify tables being indexed: grep "ALTER TABLE" database/add_performance_indexes.sql | awk '{print $3}' | sort -u

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "SQL inspection"
- npx claude-flow@alpha hooks post-task --task-id "sql-inspect" --memory-key "database/indexes/count"

SUCCESS CRITERIA:
- File exists
- ~23 indexes found
- Tables: categories, subcategories, products, product_sizes

REPORT BACK:
- Total index count
- List of tables
- List of index names
- Any syntax issues spotted
```

**Agent Type:** `code-analyzer` or `backend-dev`

---

### Step 1.2: Test Database Connection

**Prompt:**
```
You are a Database Engineer. Test connection to production database.

TASK:
1. Execute test query:
   mysql \
     -h db5018522360.hosting-data.io \
     -u dbu3362598 \
     -p'!Aramat1.' \
     dbs14708743 \
     -e "SELECT 1 AS connection_test;"

2. Verify output shows "1"
3. Check connection time

SECURITY:
- DO NOT log password in plain text
- Use secure connection if available

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "Database connection test"
- npx claude-flow@alpha hooks post-task --task-id "db-connect-test"

SUCCESS CRITERIA:
- Connection successful
- Query returns 1
- Connection time < 2 seconds

ERROR HANDLING:
- "Access denied" → Check credentials
- "Can't connect" → Check network/VPN
- Timeout → Check firewall

REPORT BACK:
- Connection status (success/failure)
- Connection time (ms)
- MySQL version
```

**Agent Type:** `backend-dev`

---

### Step 1.3: Show Current Indexes (BEFORE)

**Prompt:**
```
You are a Database Performance Analyst. Document current index state BEFORE optimization.

TASK:
1. Query current indexes on products table:
   mysql -h db5018522360.hosting-data.io -u dbu3362598 -p'!Aramat1.' dbs14708743 \
     -e "SHOW INDEX FROM products;" \
     > docs/performance/measurements/indexes_before.txt

2. Count performance indexes: grep -c "idx_" docs/performance/measurements/indexes_before.txt
3. Do the same for: categories, subcategories, product_sizes
4. Create summary report

HOOKS:
- npx claude-flow@alpha hooks post-task --task-id "indexes-before" --memory-key "database/indexes/before-count"

SUCCESS CRITERIA:
- indexes_before.txt created for all tables
- Index count documented
- PRIMARY key exists

REPORT BACK:
- Current index count per table
- List of existing performance indexes (idx_*)
- Total indexes across all tables
- Store counts in memory for comparison
```

**Agent Type:** `code-analyzer` or `perf-analyzer`

---

### Step 1.4: DRY RUN Syntax Check

**Prompt:**
```
You are a Database Safety Engineer. Perform syntax check WITHOUT modifying production data.

TASK:
1. Execute test index creation (then drop it):
   mysql -h db5018522360.hosting-data.io -u dbu3362598 -p'!Aramat1.' dbs14708743 \
     --execute="
       ALTER TABLE categories ADD INDEX idx_active_main_TEST (is_active, is_main_category, sort_order);
       ALTER TABLE categories DROP INDEX idx_active_main_TEST;
       SELECT 'Syntax OK' AS test_result;
     "

2. Verify "Syntax OK" output
3. Ensure test index was created and dropped

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "SQL syntax dry run"
- npx claude-flow@alpha hooks post-task --task-id "sql-dryrun"

SUCCESS CRITERIA:
- "Syntax OK" message displayed
- No errors in output
- Test index created and dropped successfully

ERROR HANDLING:
- Syntax error → Check SQL file for issues
- Permission error → Verify user has ALTER privileges

REPORT BACK:
- Dry run status (success/failure)
- Any syntax errors found
- Estimated time for full index creation
```

**Agent Type:** `tester` or `backend-dev`

---

### Step 1.5: Apply All Indexes (PRODUCTION)

**Prompt:**
```
You are a Database Migration Specialist. Apply all performance indexes to production database.

⚠️ CRITICAL: This modifies production database!

TASK:
1. Execute SQL file:
   mysql -h db5018522360.hosting-data.io -u dbu3362598 -p'!Aramat1.' dbs14708743 \
     < database/add_performance_indexes.sql \
     2>&1 | tee docs/performance/measurements/index_creation.log

2. Monitor execution time
3. Check for errors: grep -i error docs/performance/measurements/index_creation.log
4. Verify no critical errors (ignore "Duplicate key name" - that's OK)

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "Database index creation (PRODUCTION)"
- npx claude-flow@alpha hooks post-task --task-id "index-creation" --memory-key "database/indexes/created"
- npx claude-flow@alpha hooks notify --message "Database indexes applied to production"

SUCCESS CRITERIA:
- index_creation.log created
- No ERROR messages (except Duplicate key name)
- Execution completed in < 2 minutes

ROLLBACK PLAN:
- If errors: mysql ... < database/rollback_indexes.sql

REPORT BACK:
- Number of indexes created
- Execution time
- Any warnings or errors
- Success/failure status
- Notify team via hooks
```

**Agent Type:** `backend-dev` or `cicd-engineer`

---

### Step 1.6: Verify Indexes (AFTER)

**Prompt:**
```
You are a Database QA Engineer. Verify that all indexes were created successfully.

TASK:
1. Query indexes AFTER creation:
   mysql -h db5018522360.hosting-data.io -u dbu3362598 -p'!Aramat1.' dbs14708743 \
     -e "SHOW INDEX FROM products;" \
     > docs/performance/measurements/indexes_after.txt

2. Count new indexes: grep -c "idx_" docs/performance/measurements/indexes_after.txt
3. Compare BEFORE vs AFTER:
   - BEFORE: stored in memory (database/indexes/before-count)
   - AFTER: current count
   - Delta: AFTER - BEFORE

4. List all new indexes created
5. Verify key indexes exist:
   - idx_name_de
   - idx_category_subcat
   - idx_available

HOOKS:
- npx claude-flow@alpha hooks session-restore --session-id "phase-1"
- npx claude-flow@alpha hooks post-task --task-id "index-verify" --memory-key "database/indexes/after-count"

SUCCESS CRITERIA:
- AFTER count > BEFORE count
- At least 8-11 new indexes created
- All critical indexes present

REPORT BACK:
- BEFORE index count
- AFTER index count
- Delta (new indexes)
- List of new index names
- Verification status (PASS/FAIL)
```

**Agent Type:** `tester` or `code-analyzer`

---

### Step 1.7: Performance Test After Indexes

**Prompt:**
```
You are a Performance Testing Engineer. Measure API performance AFTER database indexes.

TASK:
1. Run performance test:
   curl -w "@docs/performance/curl-format.txt" -o /dev/null -s \
     "https://test.safira-lounge.de/safira-api-fixed.php?action=products" \
     > docs/performance/measurements/after_indexes.txt

2. Extract Time Total from result
3. Retrieve baseline from memory (performance/baseline)
4. Calculate improvement:
   - BEFORE: baseline time
   - AFTER: new time
   - Improvement % = ((BEFORE - AFTER) / BEFORE) * 100

5. Run test 3 times and average results

HOOKS:
- npx claude-flow@alpha hooks session-restore --session-id "phase-1"
- npx claude-flow@alpha hooks post-task --task-id "perf-after-indexes" --memory-key "performance/after-indexes"

SUCCESS CRITERIA:
- Time Total reduced by 30-60%
- Response still valid (status 200)
- Consistent results across 3 tests

REPORT BACK:
- BEFORE time (from baseline)
- AFTER time (average of 3 tests)
- Improvement percentage
- Pass/Fail status (expecting >30% improvement)
- Store result in memory
```

**Agent Type:** `perf-analyzer` or `performance-benchmarker`

---

## 🗜️ OPTIMIZATION 2: GZIP COMPRESSION

### Step 2.1: Check Current GZIP Status

**Prompt:**
```
You are a Web Performance Analyst. Check if GZIP compression is already enabled.

TASK:
1. Test current API response headers:
   curl -I -H "Accept-Encoding: gzip" \
     "https://test.safira-lounge.de/safira-api-fixed.php?action=products" \
     | grep -i "content-encoding"

2. Check result:
   - If empty → GZIP NOT enabled (proceed)
   - If "gzip" → GZIP already enabled (skip optimization)

3. Also test response size:
   - Without GZIP: curl -s -H "Accept-Encoding: identity" ... | wc -c
   - With GZIP: curl -s -H "Accept-Encoding: gzip" ... | wc -c

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "GZIP status check"
- npx claude-flow@alpha hooks post-task --task-id "gzip-check" --memory-key "gzip/initial-status"

SUCCESS CRITERIA:
- GZIP status determined (enabled/disabled)
- Response sizes measured

REPORT BACK:
- GZIP status (enabled/disabled)
- Current response size
- Recommendation (enable/skip)
```

**Agent Type:** `perf-analyzer`

---

### Step 2.2: Enable GZIP in api/index.php

**Prompt:**
```
You are a Backend Developer. Enable GZIP compression in the API entry point.

TASK:
1. Verify backup exists: ls -lh backups/code/index.php.backup
2. Read current file: head -10 api/index.php
3. Add GZIP code after require_once:
   - Find line with: require_once __DIR__ . '/config.php';
   - Add after it:
     // Enable GZIP compression
     if (!ob_start('ob_gzhandler')) {
         ob_start();
     }

4. Use Edit tool to modify file (preserve exact formatting)

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "Enable GZIP"
- npx claude-flow@alpha hooks post-edit --file "api/index.php" --memory-key "edits/gzip"
- npx claude-flow@alpha hooks post-task --task-id "gzip-enable"

SUCCESS CRITERIA:
- File modified successfully
- GZIP code added in correct location
- No syntax errors

REPORT BACK:
- Line number where code was inserted
- Code snippet added
- File modified status
```

**Agent Type:** `coder` or `backend-dev`

---

### Step 2.3: PHP Syntax Check

**Prompt:**
```
You are a QA Engineer. Verify PHP syntax after GZIP modification.

TASK:
1. Run PHP linter: php -l api/index.php
2. Check for "No syntax errors detected"
3. If errors found:
   - Show error details
   - Rollback: cp backups/code/index.php.backup api/index.php

HOOKS:
- npx claude-flow@alpha hooks post-task --task-id "gzip-syntax-check"

SUCCESS CRITERIA:
- "No syntax errors detected" message
- No warnings

ROLLBACK IF NEEDED:
- cp backups/code/index.php.backup api/index.php

REPORT BACK:
- Syntax check status (PASS/FAIL)
- Any errors found
- Rollback performed (yes/no)
```

**Agent Type:** `tester`

---

### Step 2.4: Test GZIP Compression

**Prompt:**
```
You are a Performance Tester. Verify GZIP compression is working.

TASK:
1. Deploy to server (if needed)
2. Wait 10 seconds for server reload
3. Test GZIP 3 times:
   for i in {1..3}; do
     curl -I -H "Accept-Encoding: gzip" \
       "https://test.safira-lounge.de/safira-api-fixed.php?action=products" \
       | grep -E "(HTTP|Content-Encoding|Content-Length)"
     sleep 1
   done

4. Verify "Content-Encoding: gzip" in all responses

HOOKS:
- npx claude-flow@alpha hooks post-task --task-id "gzip-test" --memory-key "gzip/enabled"

SUCCESS CRITERIA:
- "Content-Encoding: gzip" in response
- Content-Length reduced (vs uncompressed)
- Consistent across 3 tests

REPORT BACK:
- GZIP enabled (yes/no)
- Content-Length with GZIP (bytes)
- Compression ratio
```

**Agent Type:** `tester` or `perf-analyzer`

---

### Step 2.5: Measure Payload Reduction

**Prompt:**
```
You are a Performance Analyst. Measure payload size reduction from GZIP.

TASK:
1. Measure uncompressed size:
   curl -s -H "Accept-Encoding: identity" \
     "https://test.safira-lounge.de/safira-api-fixed.php?action=products" \
     | wc -c > docs/performance/measurements/payload_uncompressed.txt

2. Measure compressed size:
   curl -s -H "Accept-Encoding: gzip" \
     "https://test.safira-lounge.de/safira-api-fixed.php?action=products" \
     | wc -c > docs/performance/measurements/payload_gzipped.txt

3. Calculate compression:
   - Uncompressed: X bytes
   - Compressed: Y bytes
   - Reduction: ((X - Y) / X) * 100 %

HOOKS:
- npx claude-flow@alpha hooks post-task --task-id "payload-measurement" --memory-key "gzip/compression-ratio"

SUCCESS CRITERIA:
- Compression ratio 70-85%
- Both files created

REPORT BACK:
- Uncompressed size (bytes)
- Compressed size (bytes)
- Reduction percentage
- Expected: ~80% reduction
```

**Agent Type:** `perf-analyzer` or `performance-benchmarker`

---

## 🕒 OPTIMIZATION 3: HTTP CACHE HEADERS

### Step 3.1: Check Current Cache Headers

**Prompt:**
```
You are a Web Performance Analyst. Check current HTTP caching configuration.

TASK:
1. Query response headers:
   curl -I "https://test.safira-lounge.de/safira-api-fixed.php?action=products" \
     | grep -E "(Cache|ETag|Expires|Last-Modified)" \
     > docs/performance/measurements/cache_headers_before.txt

2. Analyze results:
   - Cache-Control present?
   - ETag present?
   - Expires or Last-Modified?

3. Determine if caching is configured

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "Cache headers check"
- npx claude-flow@alpha hooks post-task --task-id "cache-check" --memory-key "cache/initial-status"

SUCCESS CRITERIA:
- Headers captured
- Status determined (configured/not configured)

REPORT BACK:
- Current cache headers (if any)
- Caching status (yes/no)
- Recommendation (enable/skip)
```

**Agent Type:** `perf-analyzer`

---

### Step 3.2: Modify sendJson() Function

**Prompt:**
```
You are a Backend Developer. Add HTTP caching to the API response function.

TASK:
1. Verify backup: ls -lh backups/code/config.php.backup
2. Read current function: grep -A 10 "function sendJson" api/config.php
3. Locate sendJson() function (around line 52-56)
4. Replace with enhanced version:

function sendJson($data, $status = 200) {
    http_response_code($status);

    // Add HTTP caching headers
    $etag = md5(json_encode($data));
    header('Cache-Control: public, max-age=300'); // 5 minutes
    header('ETag: "' . $etag . '"');

    // Check if client has cached version (304 Not Modified)
    $clientEtag = $_SERVER['HTTP_IF_NONE_MATCH'] ?? '';
    if ($clientEtag === '"' . $etag . '"') {
        http_response_code(304);
        exit;
    }

    echo json_encode($data);
    exit();
}

5. Use Edit tool with exact string replacement

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "Add cache headers"
- npx claude-flow@alpha hooks post-edit --file "api/config.php" --memory-key "edits/cache-headers"
- npx claude-flow@alpha hooks post-task --task-id "cache-enable"

SUCCESS CRITERIA:
- Function modified correctly
- No syntax errors
- ETag logic added

REPORT BACK:
- Function location (line number)
- Modification status (success/failure)
- Backup confirmed
```

**Agent Type:** `coder` or `backend-dev`

---

### Step 3.3: PHP Syntax Check

**Prompt:**
```
You are a QA Engineer. Verify PHP syntax after cache header modification.

TASK:
1. Run: php -l api/config.php
2. Check for "No syntax errors detected"
3. If errors:
   - Rollback: cp backups/code/config.php.backup api/config.php
   - Report error details

HOOKS:
- npx claude-flow@alpha hooks post-task --task-id "cache-syntax-check"

SUCCESS CRITERIA:
- No syntax errors
- Valid PHP code

ROLLBACK IF NEEDED:
- cp backups/code/config.php.backup api/config.php

REPORT BACK:
- Syntax check status (PASS/FAIL)
- Error details (if any)
- Rollback status
```

**Agent Type:** `tester`

---

### Step 3.4: Test Cache-Control Header

**Prompt:**
```
You are a Cache Testing Specialist. Test HTTP Cache-Control and ETag functionality.

TASK:
1. Deploy to server (if needed)
2. Wait 10 seconds

3. TEST 1 - Fresh Request (expect 200):
   curl -I "https://test.safira-lounge.de/safira-api-fixed.php?action=products" \
     | grep -E "(HTTP|Cache-Control|ETag)"

4. Save ETag from response

5. TEST 2 - Cached Request (expect 304):
   curl -I -H "If-None-Match: <SAVED_ETAG>" \
     "https://test.safira-lounge.de/safira-api-fixed.php?action=products" \
     | grep "HTTP"

HOOKS:
- npx claude-flow@alpha hooks post-task --task-id "cache-test" --memory-key "cache/etag-test"

SUCCESS CRITERIA:
- TEST 1: HTTP/1.1 200 OK with Cache-Control and ETag
- TEST 2: HTTP/1.1 304 Not Modified

REPORT BACK:
- Test 1 status (200 OK?)
- Cache-Control value
- ETag value
- Test 2 status (304 Not Modified?)
- Overall status (PASS/FAIL)
```

**Agent Type:** `tester` or `perf-analyzer`

---

### Step 3.5: Performance Test with Cache

**Prompt:**
```
You are a Performance Analyst. Measure cache performance improvement.

TASK:
1. Run 10 requests with ETag simulation:
   - First request: No ETag (200 OK)
   - Next 9 requests: With ETag (304 Not Modified)

2. Measure time for each:
   for i in {1..10}; do
     TIME=$(curl -w "%{time_total}" -o /dev/null -s \
       -H "If-None-Match: <ETAG>" \
       "https://test.safira-lounge.de/safira-api-fixed.php?action=products")
     echo "Request $i: ${TIME}s"
   done

3. Calculate:
   - Average 200 response time
   - Average 304 response time
   - Improvement: ((200_time - 304_time) / 200_time) * 100%

HOOKS:
- npx claude-flow@alpha hooks post-task --task-id "cache-perf" --memory-key "cache/performance"

SUCCESS CRITERIA:
- 304 responses 90-95% faster than 200
- Consistent performance

REPORT BACK:
- Average 200 response time (ms)
- Average 304 response time (ms)
- Improvement percentage
- Expected: 90-95% faster
```

**Agent Type:** `performance-benchmarker`

---

## 🔒 OPTIMIZATION 4: SECURITY HEADERS

### Step 4.1: Check for .htaccess

**Prompt:**
```
You are a DevOps Engineer. Check if .htaccess exists and create backup.

TASK:
1. Check for file: ls -la | grep htaccess
2. If exists:
   - Create backup: cp .htaccess backups/code/.htaccess.backup
3. If not exists:
   - Create empty file: touch .htaccess
4. Verify file permissions

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "htaccess check"
- npx claude-flow@alpha hooks post-task --task-id "htaccess-check"

SUCCESS CRITERIA:
- .htaccess exists or created
- Backup created (if existed)
- Correct permissions (644)

REPORT BACK:
- File exists (yes/no)
- Backup created (yes/no)
- File permissions
- Ready for modification
```

**Agent Type:** `cicd-engineer`

---

### Step 4.2: Check Current Security Headers

**Prompt:**
```
You are a Security Analyst. Audit current security headers.

TASK:
1. Test current headers:
   curl -I "https://test.safira-lounge.de/" \
     | grep -E "(X-Frame|X-Content-Type|Referrer-Policy|X-XSS|Strict-Transport)" \
     > docs/performance/measurements/security_headers_before.txt

2. Analyze results:
   - X-Frame-Options present?
   - X-Content-Type-Options present?
   - Referrer-Policy present?
   - X-XSS-Protection present?
   - HSTS present?

3. Count current security headers

HOOKS:
- npx claude-flow@alpha hooks post-task --task-id "security-audit" --memory-key "security/headers-before"

SUCCESS CRITERIA:
- Headers captured
- Count documented

REPORT BACK:
- Number of security headers found
- List of missing headers
- Security score (0-5)
```

**Agent Type:** `security-manager` or `reviewer`

---

### Step 4.3: Add Security Headers to .htaccess

**Prompt:**
```
You are a Security Engineer. Add comprehensive security headers to .htaccess.

TASK:
1. Read current .htaccess
2. Add at the END of file:

# ==============================================================================
# Security Headers - Added [$(date +%Y-%m-%d)]
# ==============================================================================

<IfModule mod_headers.c>
    # Prevent clickjacking attacks
    Header always set X-Frame-Options "SAMEORIGIN"

    # Prevent MIME type sniffing
    Header always set X-Content-Type-Options "nosniff"

    # Referrer policy for privacy
    Header always set Referrer-Policy "strict-origin-when-cross-origin"

    # XSS Protection (legacy but still useful)
    Header always set X-XSS-Protection "1; mode=block"

    # Optional: HSTS (only if using HTTPS)
    # Uncomment if valid SSL certificate exists
    # Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</IfModule>

3. Use Write or Edit tool to modify

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "Add security headers"
- npx claude-flow@alpha hooks post-edit --file ".htaccess" --memory-key "edits/security-headers"
- npx claude-flow@alpha hooks post-task --task-id "security-add"

SUCCESS CRITERIA:
- Headers added successfully
- No duplicate headers
- Valid Apache syntax

REPORT BACK:
- Headers added count (4)
- File modification status
- Line numbers of changes
```

**Agent Type:** `coder` or `security-manager`

---

### Step 4.4: Git Commit Security Changes

**Prompt:**
```
You are a Release Manager. Commit security header changes.

TASK:
1. Stage .htaccess: git add .htaccess
2. Commit: git commit -m "feat: Add security headers to .htaccess"
3. Create tag: git tag phase1-security-headers
4. Verify: git log -1

HOOKS:
- npx claude-flow@alpha hooks post-task --task-id "security-commit"

SUCCESS CRITERIA:
- Commit created
- Tag created
- Changes tracked in Git

REPORT BACK:
- Commit SHA
- Tag name
- Files changed
```

**Agent Type:** `cicd-engineer`

---

### Step 4.5: Deploy .htaccess to Server

**Prompt:**
```
You are a Deployment Engineer. Deploy .htaccess to production server.

TASK:
1. Identify deployment method:
   - SFTP/SCP
   - FTP
   - cPanel
   - rsync

2. Deploy .htaccess to webroot
3. Verify file on server
4. Wait 10 seconds for server reload

SECURITY:
- Ensure file permissions: 644
- Do not expose sensitive info

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "Deploy htaccess"
- npx claude-flow@alpha hooks post-task --task-id "htaccess-deploy"
- npx claude-flow@alpha hooks notify --message ".htaccess deployed to production"

SUCCESS CRITERIA:
- File uploaded successfully
- Server reloaded
- No errors

REPORT BACK:
- Deployment method used
- Upload timestamp
- File verification status
- Any errors
```

**Agent Type:** `cicd-engineer`

---

### Step 4.6: Verify Security Headers (AFTER)

**Prompt:**
```
You are a Security QA Engineer. Verify security headers are active.

TASK:
1. Wait 15 seconds for propagation
2. Test headers:
   curl -I "https://test.safira-lounge.de/" \
     | grep -E "(X-Frame|X-Content-Type|Referrer-Policy|X-XSS)" \
     > docs/performance/measurements/security_headers_after.txt

3. Compare BEFORE vs AFTER:
   - Before: stored in memory (security/headers-before)
   - After: current count

4. Verify all 4 headers present:
   - X-Frame-Options: SAMEORIGIN
   - X-Content-Type-Options: nosniff
   - Referrer-Policy: strict-origin-when-cross-origin
   - X-XSS-Protection: 1; mode=block

HOOKS:
- npx claude-flow@alpha hooks session-restore --session-id "phase-1"
- npx claude-flow@alpha hooks post-task --task-id "security-verify" --memory-key "security/headers-after"

SUCCESS CRITERIA:
- All 4 headers present
- Headers match configuration
- No errors

REPORT BACK:
- Headers found (4/4?)
- BEFORE count vs AFTER count
- Missing headers (if any)
- Verification status (PASS/FAIL)
```

**Agent Type:** `tester` or `security-manager`

---

### Step 4.7: Security Score Test

**Prompt:**
```
You are a Security Analyst. Test security score improvement.

TASK:
1. Use securityheaders.com API or browser test
2. URL: https://securityheaders.com/?q=https://test.safira-lounge.de
3. Compare score before/after
4. Expected improvement: F/D → B/A

ALTERNATIVE (if API not available):
- Use Mozilla Observatory
- Use webhint.io

HOOKS:
- npx claude-flow@alpha hooks post-task --task-id "security-score" --memory-key "security/score"

SUCCESS CRITERIA:
- Score improved
- Grade: B or higher
- All critical headers present

REPORT BACK:
- Security score/grade
- Improvement (before → after)
- Remaining issues (if any)
- Recommendations
```

**Agent Type:** `security-manager` or `reviewer`

---

## 🖼️ OPTIMIZATION 5: IMAGE LAZY LOADING

### Step 5.1: Find Images Without Lazy Loading

**Prompt:**
```
You are a Frontend Code Analyst. Find all img tags without lazy loading.

TASK:
1. Search for img tags:
   grep -r '<img ' src/components --include="*.tsx" --include="*.jsx" \
     | grep -v 'loading="lazy"' \
     > docs/performance/measurements/images_without_lazy.txt

2. Count results: wc -l docs/performance/measurements/images_without_lazy.txt
3. Show sample (first 10): head -10 docs/performance/measurements/images_without_lazy.txt
4. Identify patterns (src, className, etc.)

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "Find images without lazy loading"
- npx claude-flow@alpha hooks post-task --task-id "find-images" --memory-key "images/count-before"

SUCCESS CRITERIA:
- List created
- Count documented
- Sample shown

REPORT BACK:
- Total img tags without lazy loading
- Sample file paths
- Most common patterns
- Estimated modification effort
```

**Agent Type:** `code-analyzer` or `researcher`

---

### Step 5.2: Extract Unique Files

**Prompt:**
```
You are a Code Organizer. Create a list of files to modify.

TASK:
1. Extract unique filenames:
   cut -d':' -f1 docs/performance/measurements/images_without_lazy.txt \
     | sort -u \
     > docs/performance/measurements/files_to_update.txt

2. Count files: wc -l docs/performance/measurements/files_to_update.txt
3. Show list: cat docs/performance/measurements/files_to_update.txt

HOOKS:
- npx claude-flow@alpha hooks post-task --task-id "file-list" --memory-key "images/files-to-update"

SUCCESS CRITERIA:
- Unique files listed
- No duplicates

REPORT BACK:
- Total files to modify
- File paths
- Estimate time (1-2 min per file)
```

**Agent Type:** `code-analyzer`

---

### Step 5.3: Backup All Affected Files

**Prompt:**
```
You are a Backup Specialist. Create backups of all files before modification.

TASK:
1. Create backup directory: mkdir -p backups/code/lazy-loading
2. For each file in files_to_update.txt:
   - Copy to backups/code/lazy-loading/
3. Verify all backups created
4. Compare file sizes (should match originals)

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "Backup files for lazy loading"
- npx claude-flow@alpha hooks post-task --task-id "lazy-backup"

SUCCESS CRITERIA:
- All files backed up
- Sizes match originals
- No corruption

REPORT BACK:
- Files backed up count
- Total backup size
- Backup directory path
```

**Agent Type:** `coder`

---

### Step 5.4: Test Modification on ONE File

**Prompt:**
```
You are a Frontend Developer. Test lazy loading modification on ONE file first.

TASK:
1. Select first file: TEST_FILE=$(head -1 docs/performance/measurements/files_to_update.txt)
2. Create pre-modification backup: cp "$TEST_FILE" "${TEST_FILE}.pre-lazy"
3. Modify file:
   - Find all: <img (.*)>
   - Replace with: <img $1 loading="lazy">
   - Use Edit tool with exact string matching

4. Show diff: diff "${TEST_FILE}.pre-lazy" "$TEST_FILE"

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "Test lazy loading modification"
- npx claude-flow@alpha hooks post-edit --file "$TEST_FILE" --memory-key "edits/lazy-test"
- npx claude-flow@alpha hooks post-task --task-id "lazy-test"

SUCCESS CRITERIA:
- File modified
- loading="lazy" added
- No duplicate attributes
- Valid JSX syntax

REPORT BACK:
- Test file path
- Number of img tags modified
- Diff output
- Syntax valid (yes/no)
```

**Agent Type:** `coder`

---

### Step 5.5: TypeScript Syntax Check (Test File)

**Prompt:**
```
You are a TypeScript QA Engineer. Verify TypeScript syntax after lazy loading change.

TASK:
1. Run TypeScript check on test file:
   npx tsc --noEmit --project tsconfig.json | grep "TEST_FILE"

2. If errors:
   - Show error details
   - Rollback test file

HOOKS:
- npx claude-flow@alpha hooks post-task --task-id "lazy-ts-check"

SUCCESS CRITERIA:
- No TypeScript errors
- Valid JSX syntax

ROLLBACK IF NEEDED:
- cp "${TEST_FILE}.pre-lazy" "$TEST_FILE"

REPORT BACK:
- TypeScript check status (PASS/FAIL)
- Errors (if any)
- Rollback performed (yes/no)
```

**Agent Type:** `tester`

---

### Step 5.6: Apply to ALL Files

**Prompt:**
```
You are a Frontend Developer. Apply lazy loading to ALL files.

⚠️ ONLY proceed if Step 5.5 passed!

TASK:
1. For each file in files_to_update.txt:
   - Create .pre-lazy backup
   - Modify: Add loading="lazy" to all <img> tags
   - Use Edit tool with careful string matching

2. Track results:
   - Files modified successfully
   - Files with errors

3. DO NOT modify if:
   - File already has loading="lazy"
   - img tag is in a comment
   - Syntax would break

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "Apply lazy loading to all files"
- For each file: npx claude-flow@alpha hooks post-edit --file "$FILE" --memory-key "edits/lazy-$FILE"
- npx claude-flow@alpha hooks post-task --task-id "lazy-apply-all"

SUCCESS CRITERIA:
- All files modified
- No syntax errors
- Backups created

REPORT BACK:
- Files modified count
- img tags updated count
- Files with errors (if any)
- Overall status
```

**Agent Type:** `coder`

---

### Step 5.7: Full TypeScript Build Check

**Prompt:**
```
You are a Build Engineer. Run full TypeScript check after all modifications.

TASK:
1. Run: npm run typecheck
2. If errors:
   - List affected files
   - Provide error details
   - Suggest rollback strategy

3. If success:
   - Proceed to next step

HOOKS:
- npx claude-flow@alpha hooks post-task --task-id "lazy-full-ts-check"

SUCCESS CRITERIA:
- "Found 0 errors" message
- All files type-safe

ERROR HANDLING:
- If errors: Rollback affected files from .pre-lazy backups
- Fix manually or skip problematic files

REPORT BACK:
- TypeScript check status (PASS/FAIL)
- Error count
- Affected files (if errors)
- Recommendations
```

**Agent Type:** `tester` or `cicd-engineer`

---

### Step 5.8: Git Commit Lazy Loading

**Prompt:**
```
You are a Release Manager. Commit lazy loading changes.

TASK:
1. Review changes: git diff --stat src/components
2. Show sample diff: git diff src/components | head -50
3. If changes look good:
   - git add src/components
   - git commit -m "feat: Add lazy loading to images for better performance"
   - git tag phase1-lazy-loading

4. Verify: git log -1

HOOKS:
- npx claude-flow@alpha hooks post-task --task-id "lazy-commit"

SUCCESS CRITERIA:
- Commit created
- Tag created
- Changes tracked

REPORT BACK:
- Commit SHA
- Tag name
- Files changed count
- Lines added/removed
```

**Agent Type:** `cicd-engineer`

---

### Step 5.9: Production Build Test

**Prompt:**
```
You are a Build Engineer. Test production build after lazy loading changes.

TASK:
1. Run production build: npm run build
2. Check exit code: echo $?
3. If build fails:
   - Show error log
   - Identify failing files
   - Suggest rollback

4. If build succeeds:
   - Check bundle size: ls -lh dist/ or build/
   - Compare with previous build

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "Production build test"
- npx claude-flow@alpha hooks post-task --task-id "lazy-build"

SUCCESS CRITERIA:
- Build successful (exit code 0)
- No errors
- Bundle created

REPORT BACK:
- Build status (success/failure)
- Build time
- Bundle size
- Any warnings
- Next steps (deploy/rollback)
```

**Agent Type:** `cicd-engineer`

---

### Step 5.10: Browser Test Lazy Loading

**Prompt:**
```
You are a Manual QA Tester. Verify lazy loading works in browser.

TASK:
1. Deploy build to test server (if not auto-deployed)
2. Open: https://test.safira-lounge.de
3. Open DevTools → Network tab
4. Filter: Images
5. Scroll page slowly
6. Observe:
   - Images load on-demand (not all at once)
   - Loading triggered when scrolling near image
   - No broken images

7. Test on:
   - Desktop (Chrome)
   - Mobile (responsive mode)

HOOKS:
- npx claude-flow@alpha hooks post-task --task-id "lazy-browser-test" --memory-key "images/lazy-verified"

SUCCESS CRITERIA:
- Images load on-demand
- No broken images
- Performance improved (fewer initial requests)

REPORT BACK:
- Lazy loading working (yes/no)
- Initial image requests (should be lower)
- Any issues found
- Screenshots (if possible)
```

**Agent Type:** `tester`

---

## 📊 FINAL VERIFICATION

### Final Step 1: Measure Overall Performance

**Prompt:**
```
You are a Performance Engineer. Measure final performance after ALL Phase 1 optimizations.

TASK:
1. Run comprehensive performance test:
   curl -w "@docs/performance/curl-format.txt" -o /dev/null -s \
     "https://test.safira-lounge.de/safira-api-fixed.php?action=products" \
     > docs/performance/measurements/final_performance.txt

2. Run test 5 times and average results
3. Retrieve baseline from memory
4. Calculate total improvement

HOOKS:
- npx claude-flow@alpha hooks session-restore --session-id "phase-1"
- npx claude-flow@alpha hooks post-task --task-id "final-perf" --memory-key "performance/phase1-final"

SUCCESS CRITERIA:
- 60-70% overall improvement
- Consistent results

REPORT BACK:
- BEFORE (baseline): X seconds
- AFTER (final): Y seconds
- Total improvement: Z%
- All metrics (time, size, etc.)
```

**Agent Type:** `performance-benchmarker`

---

### Final Step 2: Generate Comparison Report

**Prompt:**
```
You are a Performance Analyst. Create comprehensive before/after comparison report.

TASK:
1. Retrieve from memory:
   - performance/baseline
   - performance/after-indexes
   - performance/phase1-final
   - gzip/compression-ratio
   - cache/performance
   - security/headers-before
   - security/headers-after
   - images/count-before

2. Create report: docs/performance/measurements/phase1_comparison.txt
3. Include:
   - API performance timeline
   - Security headers comparison
   - Database indexes added
   - File modifications summary

HOOKS:
- npx claude-flow@alpha hooks session-restore --session-id "phase-1"
- npx claude-flow@alpha hooks post-task --task-id "comparison-report"

SUCCESS CRITERIA:
- Report created
- All metrics included
- Clear before/after

REPORT BACK:
- Report file path
- Summary of improvements
- Highlight best wins
```

**Agent Type:** `code-analyzer` or `researcher`

---

### Final Step 3: Create Completion Report

**Prompt:**
```
You are a Technical Writer. Create Phase 1 completion documentation.

TASK:
1. Create: docs/performance/PHASE_1_COMPLETED.md
2. Include:
   - Date and duration
   - All 5 optimizations (with checkmarks)
   - Performance metrics before/after
   - Git commits and tags created
   - Backup locations
   - Rollback instructions
   - Next steps (Phase 2)

3. Use template from PHASE_1_DETAILED_STEPS.md (final section)

HOOKS:
- npx claude-flow@alpha hooks post-task --task-id "completion-report"
- npx claude-flow@alpha hooks notify --message "Phase 1 completed successfully! 🎉"

SUCCESS CRITERIA:
- Document created
- All sections filled
- Professional formatting

REPORT BACK:
- Document path
- Summary paragraph
- Recommendation for Phase 2
```

**Agent Type:** `api-docs` or `researcher`

---

## 🚀 BATCH EXECUTION PROMPTS

### Execute ALL Pre-Steps in Parallel

**Prompt:**
```
You are a Swarm Coordinator. Execute all Phase 1 preparation steps in parallel.

TASK:
Spawn 5 agents concurrently:
1. Git Backup Agent (Pre-Step 1)
2. Performance Baseline Agent (Pre-Step 2)
3. Database Backup Agent (Pre-Step 3)
4. Code Backup Agent (Pre-Step 4)
5. Curl Format Agent (Pre-Step 5)

Wait for all agents to complete, then compile results.

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "Phase 1 preparation (parallel)"
- npx claude-flow@alpha hooks session-end --export-metrics true
- npx claude-flow@alpha hooks notify --message "Phase 1 preparation complete"

SUCCESS CRITERIA:
- All 5 agents complete successfully
- All backups created
- Baseline measured

REPORT BACK:
- Agent completion status (5/5)
- Any failures
- Time saved vs sequential
- Ready to proceed to optimizations
```

**Agent Type:** `task-orchestrator` or `swarm-coordinator`

---

### Execute Database Optimization (Steps 1.1-1.7)

**Prompt:**
```
You are a Database Optimization Specialist. Execute complete database index optimization workflow.

TASK:
Run steps 1.1 through 1.7 sequentially:
1. Inspect SQL file
2. Test connection
3. Show indexes BEFORE
4. DRY RUN syntax check
5. Apply indexes (PRODUCTION)
6. Verify indexes AFTER
7. Performance test

Use hooks for coordination and memory storage.

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "Database optimization workflow"
- npx claude-flow@alpha hooks session-restore --session-id "phase-1"
- npx claude-flow@alpha hooks post-task --task-id "db-optimization-complete"
- npx claude-flow@alpha hooks notify --message "Database indexes applied"

SUCCESS CRITERIA:
- All steps complete
- Indexes applied
- 30-60% performance improvement

REPORT BACK:
- Indexes added count
- Performance improvement %
- Time taken
- Status (success/failure)
```

**Agent Type:** `backend-dev` or `database-specialist`

---

### Execute Frontend Optimization (Steps 5.1-5.10)

**Prompt:**
```
You are a Frontend Optimization Specialist. Execute complete lazy loading workflow.

TASK:
Run steps 5.1 through 5.10 sequentially:
1. Find images without lazy loading
2. Extract unique files
3. Backup all files
4. Test on ONE file
5. TypeScript check test file
6. Apply to ALL files
7. Full TypeScript check
8. Git commit
9. Production build
10. Browser test

HOOKS:
- npx claude-flow@alpha hooks pre-task --description "Lazy loading workflow"
- npx claude-flow@alpha hooks post-task --task-id "lazy-loading-complete"
- npx claude-flow@alpha hooks notify --message "Lazy loading applied to all images"

SUCCESS CRITERIA:
- All images modified
- Build successful
- Browser test passed

REPORT BACK:
- Files modified count
- img tags updated count
- Build status
- Browser test result
```

**Agent Type:** `coder` or `frontend-specialist`

---

## 🎯 USAGE INSTRUCTIONS

### For Single Steps:
```bash
# Example: Execute Database Backup (Pre-Step 3)
npx claude-flow@alpha agent spawn \
  --type backend-dev \
  --prompt "$(cat PHASE_1_CLAUDE_FLOW_PROMPTS.md | sed -n '/Pre-Step 3: Database Backup/,/Agent Type:/p')"
```

### For Full Workflow:
```bash
# Execute entire Phase 1
npx claude-flow@alpha task orchestrate \
  --strategy sequential \
  --tasks phase1_tasks.json
```

### For Parallel Execution:
```bash
# Run all Pre-Steps in parallel
npx claude-flow@alpha swarm init --topology mesh --maxAgents 5
npx claude-flow@alpha task orchestrate \
  --strategy parallel \
  --prompt "$(cat PHASE_1_CLAUDE_FLOW_PROMPTS.md | sed -n '/Execute ALL Pre-Steps in Parallel/,/Agent Type:/p')"
```

---

## 📊 MEMORY KEYS USED

All agents store results in memory for coordination:

- `performance/baseline` - Initial API performance
- `performance/after-indexes` - Performance after DB indexes
- `performance/phase1-final` - Final Phase 1 performance
- `database/indexes/before-count` - Index count before
- `database/indexes/after-count` - Index count after
- `database/indexes/created` - List of created indexes
- `gzip/initial-status` - GZIP status before
- `gzip/enabled` - GZIP enabled confirmation
- `gzip/compression-ratio` - Compression percentage
- `cache/initial-status` - Cache status before
- `cache/etag-test` - ETag test results
- `cache/performance` - Cache performance metrics
- `security/headers-before` - Security headers before
- `security/headers-after` - Security headers after
- `security/score` - Security score
- `images/count-before` - Images without lazy loading
- `images/files-to-update` - Files to modify
- `images/lazy-verified` - Browser verification
- `backups/database/path` - Database backup location
- `edits/*` - All file edits tracked

---

## 🔄 ROLLBACK PROMPTS

### Rollback Database Indexes

**Prompt:**
```
You are a Database Recovery Specialist. Rollback all performance indexes.

TASK:
1. Execute: mysql -h db5018522360.hosting-data.io -u dbu3362598 -p'!Aramat1.' dbs14708743 \
     < database/rollback_indexes.sql
2. Verify indexes removed
3. Test API performance (should return to baseline)

HOOKS:
- npx claude-flow@alpha hooks notify --message "Database indexes rolled back"

SUCCESS CRITERIA:
- Indexes removed
- No errors
- Database restored to pre-optimization state

REPORT BACK:
- Rollback status
- Indexes removed count
- Performance after rollback
```

### Rollback ALL Phase 1 Changes

**Prompt:**
```
You are a Disaster Recovery Specialist. Rollback ALL Phase 1 changes.

TASK:
1. Database: mysql ... < database/rollback_indexes.sql
2. Code: git reset --hard phase-1-backup-YYYYMMDD_HHMMSS
3. Files: cp backups/code/*.backup ./
4. Verify all rollbacks successful

HOOKS:
- npx claude-flow@alpha hooks notify --message "Phase 1 completely rolled back"

SUCCESS CRITERIA:
- All changes reverted
- System restored to pre-Phase 1 state

REPORT BACK:
- Rollback status
- Components reverted
- Current system state
```

---

**END OF CLAUDE FLOW PROMPTS**
