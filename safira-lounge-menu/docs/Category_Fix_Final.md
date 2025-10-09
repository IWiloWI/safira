# Category Display Fix - Final Solution

## Problem Identified

The API was returning **duplicate subcategories** because:

1. **Database has subcategories in TWO places:**
   - `categories` table: Contains BOTH main categories (`is_main_category = 1`) AND subcategories (`is_main_category = 0`)
   - `subcategories` table: Contains the SAME subcategories (with `category_id` pointing to parent)

2. **API was fetching from both tables:**
   ```php
   // Line 98-103: Gets ALL categories (main + sub)
   SELECT * FROM categories WHERE is_active = 1

   // Line 106-111: Gets ALL subcategories again
   SELECT * FROM subcategories WHERE is_active = 1
   ```

3. **This caused duplicates:**
   - Subcategories appeared as flat top-level items (from `categories` table)
   - Same subcategories nested inside main categories (from `subcategories` table)

## Solution Applied

### File Modified: `safira-api-fixed.php`

**Line 98-103:** Changed the SQL query to fetch ONLY main categories

```php
// OLD (fetched ALL categories including subcategories):
$catStmt = $pdo->query("
    SELECT * FROM categories
    WHERE is_active = 1
    ORDER BY sort_order, id
");

// NEW (fetches ONLY main categories):
$catStmt = $pdo->query("
    SELECT * FROM categories
    WHERE is_active = 1 AND (is_main_category = 1 OR is_main_category IS NULL)
    ORDER BY sort_order, id
");
```

### Effect

This change filters out subcategories from the `categories` table, so they only come from the `subcategories` table (nested properly).

## Expected API Response After Fix

```json
{
  "categories": [
    {
      "id": "11",
      "name": {"de": "Menüs", "en": "Menus"},
      "isMainCategory": true,
      "parentPage": "",
      "subcategories": []
    },
    {
      "id": "1",
      "name": {"de": "Shisha", "en": "Hookah"},
      "isMainCategory": true,
      "parentPage": "",
      "subcategories": [
        {"id": "6", "name": {"de": "Klassisch"}},
        {"id": "7", "name": {"de": "Dark Blend"}},
        {"id": "21", "name": {"de": "Traditionell"}}
      ]
    },
    {
      "id": "2",
      "name": {"de": "Getränke", "en": "Drinks"},
      "isMainCategory": true,
      "parentPage": "",
      "subcategories": [
        {"id": "8", "name": {"de": "Softdrinks / Aqua"}},
        ...10 more subcategories
      ]
    },
    {
      "id": "10",
      "name": {"de": "Snacks", "en": "Snacks"},
      "isMainCategory": true,
      "parentPage": "",
      "subcategories": []
    }
  ]
}
```

**NO MORE** flat subcategories like:
```json
{
  "id": "6",
  "name": {"de": "Klassisch"},
  "isMainCategory": false,  // ❌ This should not appear as top-level
  "parentPage": "1"
}
```

## Deployment Instructions

### Option 1: Upload via FTP/SFTP
1. Open FileZilla or similar FTP client
2. Connect to IONOS hosting: `test.safira-lounge.de`
3. Navigate to `/homepages/5/d914788430/htdocs/`
4. Upload `safira-api-fixed.php` (replace existing file)
5. Clear browser cache and test

### Option 2: Copy via SSH (if available)
```bash
scp safira-api-fixed.php ssh_umitgencay@test.safira-lounge.de:/homepages/5/d914788430/htdocs/
```

### Option 3: Upload via IONOS File Manager
1. Log into IONOS control panel
2. Go to Website & Domains → File Manager
3. Navigate to root directory (`/htdocs/`)
4. Upload `safira-api-fixed.php`

## Testing After Deployment

### 1. Test API Response
```bash
curl -s 'http://test.safira-lounge.de/safira-api-fixed.php?action=products' | jq '.categories | length'
# Should return: 4 (only main categories)
# NOT: 17 (with duplicates)
```

### 2. Verify No Duplicates
```bash
curl -s 'http://test.safira-lounge.de/safira-api-fixed.php?action=products' | \
  jq '.categories[] | select(.isMainCategory == false)' | wc -l
# Should return: 0 (no flat subcategories)
```

### 3. Check Nested Structure
```bash
curl -s 'http://test.safira-lounge.de/safira-api-fixed.php?action=products' | \
  jq '.categories[] | select(.id == "1") | .subcategories | length'
# Should return: 3 (Shisha has 3 subcategories nested)
```

### 4. Frontend Test
1. Open http://test.safira-lounge.de/admin/products
2. Click "Neues Produkt" or edit existing product
3. Check category dropdown shows:
   - ✅ **Menüs** (main, bold)
   - ✅ **Shisha** (main, bold)
     - ✅ ↳ Klassisch (sub, indented)
     - ✅ ↳ Dark Blend (sub, indented)
     - ✅ ↳ Traditionell (sub, indented)
   - ✅ **Getränke** (main, bold)
     - ✅ ↳ Softdrinks / Aqua (sub, indented)
     - ...etc
   - ✅ **Snacks** (main, bold)

## Files Changed

| File | Lines | Change |
|------|-------|--------|
| `/Users/umitgencay/Safira/safira-lounge-menu/safira-api-fixed.php` | 98-103 | Added SQL filter: `AND (is_main_category = 1 OR is_main_category IS NULL)` |
| `/Users/umitgencay/Safira/safira-lounge-menu/src/hooks/useCategories.ts` | 58-101 | Already handles both nested and flat structures (no changes needed) |

## Summary

✅ **Problem**: Duplicate subcategories in dropdown
✅ **Root Cause**: Database stores subcategories in TWO tables, API fetched from both
✅ **Solution**: Filter `categories` table to return only main categories
✅ **Next Step**: Upload `safira-api-fixed.php` to server via FTP/SFTP
✅ **Expected Result**: Only main categories at top level, subcategories properly nested
