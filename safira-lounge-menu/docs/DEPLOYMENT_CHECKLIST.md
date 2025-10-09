# Safira Lounge - Complete Deployment Checklist

**Date:** 2025-10-06
**Status:** ✅ Ready to Deploy

---

## 📦 Files to Upload

### 1. Frontend Build
```
Source: build/*
Target: Server webroot (e.g., /var/www/html/ or public_html/)
```

**Include:**
- ✅ `build/index.html` (with critical CSS + async loading)
- ✅ `build/static/js/main.4d7f0b19.js` (236.62 KB)
- ✅ `build/static/css/main.73148772.css` (1.49 KB)
- ✅ `build/.htaccess` (with 1-year cache headers)
- ✅ `build/robots.txt`
- ✅ `build/sitemap.xml`
- ✅ All other build assets

### 2. Optimized Logo Files
```
Source: public/images/
Target: /images/ on server
```

**Upload these new files:**
- ✅ `safira_logo_120w.webp` (2.7 KB) - replaces 300 KB PNG!
- ✅ `safira_logo_220w.webp` (5.5 KB)
- ✅ `safira_logo_280w.webp` (7.0 KB)

### 3. API Endpoint
```
Source: api/endpoints/image-upload.php
Target: /api/endpoints/image-upload.php on server
```

**Features:**
- Automatic WebP conversion
- Generates 4 responsive sizes (300w, 600w, 900w, 1200w)
- Used by CategoryManager for image uploads

### 4. Database Updates
```
File: database/cleanup_old_images.sql
Execute via: phpMyAdmin or MySQL CLI
```

**SQL to run:**
```sql
-- Update old category image URLs to responsive versions
UPDATE categories SET image_url = '/images/categories/hot-drinks-safira-1_600w.webp' WHERE image_url LIKE '%category_11_%';
UPDATE categories SET image_url = '/images/categories/getraenke-safira_600w.webp' WHERE image_url LIKE '%category_2_%';
UPDATE categories SET image_url = '/images/categories/shisha-safira_600w.webp' WHERE image_url LIKE '%category_1_%' AND id = 1;
UPDATE categories SET image_url = '/images/categories/snacks-safira_600w.webp' WHERE image_url LIKE '%category_10_%';
```

---

## ⚙️ Server Configuration

### Required: Enable HTTP/2

**Why:** HTTP/2 provides multiplexing, reduces latency by ~110ms

**How to check if HTTP/2 is enabled:**
```bash
curl -I --http2 https://test.safira-lounge.de/
# Look for "HTTP/2" in response
```

**How to enable HTTP/2:**

#### Option A: Apache (Most common)
```apache
# In your Apache config or .htaccess
<IfModule mod_http2.c>
    Protocols h2 h2c http/1.1
</IfModule>
```

**Requirements:**
- Apache 2.4.17+
- mod_http2 enabled
- SSL/TLS certificate (HTTPS required for HTTP/2)

**Enable via hosting panel (cPanel/Plesk):**
1. Login to hosting control panel
2. Look for "Apache Configuration" or "HTTP/2"
3. Enable HTTP/2 checkbox
4. Restart Apache

#### Option B: Contact Hosting Support
If you don't have server access:
```
Subject: Enable HTTP/2 for test.safira-lounge.de

Hello,

Please enable HTTP/2 for my domain test.safira-lounge.de.
This will improve page load performance by ~110ms.

Requirements:
- Apache mod_http2 enabled
- HTTPS is already configured

Thank you!
```

### Already Configured: Cache Headers

✅ Cache headers are set via `.htaccess`:
- Images: 1 year cache
- JS/CSS: 1 year cache (immutable)
- HTML: no-cache

---

## ✅ Deployment Steps

### Step 1: Backup Current Site
```bash
# Via FTP: Download current site to local backup
# Via SSH:
cp -r /var/www/html /var/www/html.backup_$(date +%Y%m%d)

# Backup database
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql
```

### Step 2: Upload Build
```bash
# Via FTP client (FileZilla, etc):
1. Connect to server
2. Navigate to webroot (public_html/ or html/)
3. Upload entire build/ folder contents
4. Overwrite existing files when prompted
```

### Step 3: Upload Optimized Images
```bash
# Upload to /images/ folder:
- safira_logo_120w.webp
- safira_logo_220w.webp
- safira_logo_280w.webp

# Verify upload:
https://test.safira-lounge.de/images/safira_logo_120w.webp (should load)
```

### Step 4: Upload API Endpoint
```bash
# Upload to /api/endpoints/
- image-upload.php

# Set permissions:
chmod 755 /api/endpoints/image-upload.php
chmod 755 /images/categories/ (must be writable)

# Verify PHP GD extension:
Create test.php:
<?php
if (function_exists('imagewebp')) {
    echo "✅ WebP supported";
} else {
    echo "❌ WebP NOT supported";
}
?>
```

### Step 5: Run Database Updates
```sql
-- Via phpMyAdmin:
1. Login to phpMyAdmin
2. Select your database
3. Go to SQL tab
4. Paste contents of database/cleanup_old_images.sql
5. Execute

-- Verify:
SELECT id, name_de, image_url FROM categories WHERE id IN (1, 2, 10, 11);
-- Should show /images/categories/*_600w.webp URLs
```

### Step 6: Enable HTTP/2 (if not already enabled)
```bash
# See "Server Configuration" section above
# Contact hosting support if you don't have access
```

### Step 7: Clear Caches
```bash
# Browser cache:
- Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

# Server cache (if using cache plugin):
- Clear via cPanel
- Or delete cache files

# CDN cache (if using CDN):
- Purge CDN cache via control panel
```

---

## 🧪 Post-Deployment Testing

### Test 1: Logo Loads Correctly
```bash
# Check logo is WebP and responsive
1. Open: https://test.safira-lounge.de
2. DevTools → Network → Images
3. Look for: safira_logo_280w.webp (should be ~7 KB)
4. On mobile: should load safira_logo_220w.webp (~5.5 KB)
5. In header: safira_logo_120w.webp (~2.7 KB)
```

### Test 2: Responsive Images Work
```bash
# Check category images use srcset
1. Open: https://test.safira-lounge.de
2. DevTools → Elements
3. Inspect category image
4. Should see srcset with 4 sizes: 300w, 600w, 900w, 1200w
5. Network tab: verify correct size loaded based on viewport
```

### Test 3: Cache Headers Active
```bash
curl -I https://test.safira-lounge.de/images/safira_logo_120w.webp

# Should see:
Cache-Control: public, max-age=31536000, immutable
```

### Test 4: CSS Non-Blocking
```bash
# View page source
1. Right-click → View Page Source
2. Look for CSS link tag
3. Should have: media="print" onload="this.media='all'"
```

### Test 5: HTTP/2 Enabled
```bash
curl -I --http2 https://test.safira-lounge.de/

# Should see:
HTTP/2 200
```

### Test 6: Lighthouse Audit
```bash
1. Open Chrome DevTools
2. Lighthouse tab
3. Run Performance audit (Mobile)
4. Expected scores:
   - Performance: 85-95
   - "Properly size images": ✅ Passed
   - "Efficient cache policy": ✅ Passed
   - "robots.txt valid": ✅ Passed
   - "Render-blocking resources": ✅ Passed
```

---

## 📊 Expected Performance Improvements

### Before Optimization:
- **Performance Score:** 65-70
- **LCP:** ~3.2s
- **Image Payload:** 2,428 KB
- **Render Blocking:** 380ms
- **Cache:** None

### After Deployment:
- **Performance Score:** 85-95 ⚡
- **LCP:** ~1.1s (-66%)
- **Image Payload:** ~170 KB (-93%)
- **Render Blocking:** 0ms (-100%)
- **Cache:** 1,470 KB cached (1 year)
- **HTTP/2:** -110ms latency

### Total Bandwidth Savings:
- **First Load:** -2,551 KB (-93%)
- **Repeat Visit:** -1,470 KB (cached)

---

## 🔄 Rollback Plan

### If Issues Occur:

**Database Rollback:**
```sql
-- Restore from backup_YYYYMMDD.sql
mysql -u username -p database_name < backup_20251006.sql
```

**Code Rollback:**
```bash
# Restore from backup
cp -r /var/www/html.backup_20251006/* /var/www/html/

# Or via FTP: Download backup, upload to server
```

**Clear Browser Cache:**
```bash
# Users may need to clear cache to see old version
Ctrl+Shift+Delete (browsers)
```

---

## 📝 Files Changed Summary

### New Files Created:
```
scripts/optimize-logo.js                      # Logo optimization script
scripts/make-css-async.js                     # CSS async loader
database/cleanup_old_images.sql               # DB migration
public/images/safira_logo_120w.webp          # Optimized logo (2.7 KB)
public/images/safira_logo_220w.webp          # Optimized logo (5.5 KB)
public/images/safira_logo_280w.webp          # Optimized logo (7 KB)
public/robots.txt                             # SEO
public/sitemap.xml                            # SEO
```

### Modified Files:
```
public/index.html                             # Critical CSS + async loading
public/.htaccess                              # 1-year cache headers
src/pages/HomePage.tsx                        # Logo srcset
src/components/Layout/Header.tsx              # Logo srcset
src/components/Menu/MenuHeader.tsx            # Logo srcset
package.json                                  # Build script
```

---

## 🎯 Success Criteria

After deployment, verify all checkboxes:

- [ ] Lighthouse Performance: **85-95**
- [ ] LCP: **< 1.5s**
- [ ] Image payload: **< 200 KB**
- [ ] Logo WebP loading: **~7 KB**
- [ ] Cache headers: **max-age=31536000**
- [ ] robots.txt: **✅ Valid**
- [ ] CSS: **Non-blocking**
- [ ] HTTP/2: **Enabled** (if supported by host)
- [ ] No console errors
- [ ] Images responsive on mobile/desktop

---

## 📞 Support & Troubleshooting

### Issue: HTTP/2 not available
**Solution:** Contact hosting provider to enable mod_http2

### Issue: WebP not working in PHP
**Solution:** Install PHP GD extension with WebP support
```bash
sudo apt-get install php-gd  # Debian/Ubuntu
sudo systemctl restart apache2
```

### Issue: Images not loading
**Solution:** Check file permissions
```bash
chmod 755 /images/categories/
chmod 644 /images/*.webp
```

### Issue: Cache not working
**Solution:** Verify mod_headers and mod_expires enabled
```bash
# In Apache config:
a2enmod headers
a2enmod expires
systemctl restart apache2
```

---

## 🎉 Deployment Complete!

Once all steps are completed:

1. ✅ Run Lighthouse audit
2. ✅ Verify Performance score 85+
3. ✅ Check image sizes in Network tab
4. ✅ Confirm HTTP/2 enabled
5. ✅ Test on mobile device
6. ✅ Celebrate! 🚀

**Expected result:** Safira Lounge menu loads **66% faster** with **93% less bandwidth**!
