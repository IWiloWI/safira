# Image Path Debugging

## Problem
Category images showing as broken on frontend after PHP API fix.

## What to Check

### 1. Network Tab Analysis
Open DevTools → Network tab → Filter "Img" and check:
- What URLs are being requested?
- What HTTP status codes? (404 = not found, 200 = OK)
- Are the paths correct?

### 2. Expected vs Actual Paths

**Expected (what should load):**
```
https://test.safira-lounge.de/images/categories/category_11_600w.webp
https://test.safira-lounge.de/images/categories/category_2_600w.webp
https://test.safira-lounge.de/images/categories/category_1_600w.webp
```

**Check on Server:**
Via FTP/FileZilla, verify these files exist:
```
/images/categories/category_11_600w.webp
/images/categories/category_2_600w.webp
/images/categories/category_1_600w.webp
```

### 3. Possible Issues

#### Issue A: Files not in correct location
**Solution:** Move optimized images to `/images/categories/` folder on server

#### Issue B: Wrong base URL in frontend
**Check:** Does frontend prepend correct base URL?
- Should be: `https://test.safira-lounge.de`
- Not: `http://` or missing domain

#### Issue C: Case sensitivity (Linux servers)
**Check:** File names match exactly (lowercase)
- `category_11_600w.webp` ✅
- `Category_11_600W.webp` ❌

### 4. Quick Test

Test direct URL in browser:
```
https://test.safira-lounge.de/images/categories/category_11_600w.webp
```

**If 404:** Files not uploaded or wrong location
**If 200:** Files exist, problem is in frontend path construction

### 5. API Response Check

Test API endpoint:
```
https://test.safira-lounge.de/safira-api-fixed.php?action=products
```

Look for `image` field in response. Should show:
```json
{
  "id": "11",
  "name": {"de": "Menüs"},
  "image": "/images/categories/category_11_600w.webp"
}
```

## Next Steps

1. Open browser DevTools → Network tab
2. Reload page
3. Filter by "Img"
4. Screenshot the failed image requests
5. Check what URLs are being requested
6. Verify those files exist on server in that exact location
