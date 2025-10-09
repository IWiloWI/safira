# Main Category Display Fix - Technical Report

## Problem Analysis

### Issue Identified
Main categories were not being displayed in the ProductForm dropdown because the API endpoints were missing critical fields:
- `isMainCategory` (boolean flag to identify main categories)
- `parentPage` (parent category ID for subcategories)

### Root Cause
The database has `is_main_category` and `parent_category_id` columns (as seen in `database-reset-with-subcategories.php:60`), but the API endpoints were not returning these fields to the frontend.

**Frontend expectation (useCategories.ts:64-65):**
```typescript
const mainCats = allCategories.filter((cat: any) => cat.isMainCategory === true);
const subCats = allCategories.filter((cat: any) => cat.isMainCategory !== true);
```

**API was returning (before fix):**
```php
[
    'id' => $category['id'],
    'name' => json_decode($category['name'] ?? '{}'),
    'icon' => $category['icon'],
    'description' => json_decode($category['description'] ?? '{}')
    // ❌ Missing: isMainCategory and parentPage
]
```

## Files Modified

### 1. `/api/endpoints/products.php`
**Location:** Lines 89-110
**Change:** Added `isMainCategory` and `parentPage` fields to category data

```php
$result['categories'][] = [
    'id' => $category['id'],
    'name' => json_decode($category['name'] ?? '{}'),
    'icon' => $category['icon'],
    'description' => json_decode($category['description'] ?? '{}'),
    'isMainCategory' => (bool)($category['is_main_category'] ?? true),  // ✅ Added
    'parentPage' => $category['parent_category_id'] ?? null,            // ✅ Added
    'items' => array_map(function($product) {
        // ... product mapping
    }, array_values($categoryProducts))
];
```

### 2. `/api/endpoints/categories.php`
**Location:** Lines 69-80 (getAllCategories) and 102-111 (getCategory)
**Change:** Added `isMainCategory` and `parentPage` fields to both endpoints

```php
// getAllCategories endpoint
$result = array_map(function($category) {
    return [
        'id' => $category['id'],
        'name' => json_decode($category['name'] ?? '{}'),
        'icon' => $category['icon'],
        'description' => json_decode($category['description'] ?? '{}'),
        'isMainCategory' => (bool)($category['is_main_category'] ?? true),  // ✅ Added
        'parentPage' => $category['parent_category_id'] ?? null             // ✅ Added
    ];
}, $categories);

// getCategory endpoint
$result = [
    'id' => $category['id'],
    'name' => json_decode($category['name'] ?? '{}'),
    'icon' => $category['icon'],
    'description' => json_decode($category['description'] ?? '{}'),
    'isMainCategory' => (bool)($category['is_main_category'] ?? true),  // ✅ Added
    'parentPage' => $category['parent_category_id'] ?? null             // ✅ Added
];
```

## Database Requirements

### Required Columns
The `categories` table must have these columns:
- `is_main_category` (TINYINT(1), default: 1)
- `parent_category_id` (INT(11) or VARCHAR(50), nullable)

### Migration Script Available
Location: `/scripts/database-migration.php` (lines 121-164)

This script automatically:
1. Checks if `parent_category_id` column exists
2. Checks if `is_main_category` column exists
3. Checks if `sort_order` column exists
4. Adds missing columns with proper defaults

**To run migration:**
```bash
php /Users/umitgencay/Safira/safira-lounge-menu/scripts/database-migration.php
```

## Expected Behavior After Fix

### Frontend (ProductForm dropdown)
```typescript
<Select value={formData.category} onChange={...}>
  {categories.map(cat => {
    // Main category option (bold)
    const mainCategoryOption = (
      <option key={cat.id} value={cat.id} style={{ fontWeight: 'bold' }}>
        {getCategoryName(cat)}
      </option>
    );

    // Subcategory options (indented with arrow)
    const subcategoryOptions = cat.subcategories?.map(subcat => (
      <option key={subcat.id} value={subcat.id} style={{ paddingLeft: '20px' }}>
        &nbsp;&nbsp;↳ {getCategoryName(subcat)}
      </option>
    )) || [];

    return [mainCategoryOption, ...subcategoryOptions];
  })}
</Select>
```

### API Response Structure
```json
{
  "categories": [
    {
      "id": "1",
      "name": { "de": "Getränke", "en": "Drinks" },
      "icon": "fa-glass",
      "description": {},
      "isMainCategory": true,        // ✅ Now included
      "parentPage": null,            // ✅ Now included
      "items": [...]
    },
    {
      "id": "2",
      "name": { "de": "Cocktails", "en": "Cocktails" },
      "icon": "fa-cocktail",
      "description": {},
      "isMainCategory": false,       // ✅ Subcategory
      "parentPage": "1",             // ✅ Points to parent
      "items": [...]
    }
  ]
}
```

## Validation Steps

1. **Verify database columns exist:**
   ```sql
   SHOW COLUMNS FROM categories LIKE 'is_main_category';
   SHOW COLUMNS FROM categories LIKE 'parent_category_id';
   ```

2. **Run migration if needed:**
   ```bash
   php scripts/database-migration.php
   ```

3. **Test API endpoint:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost/api/products
   ```

   Check response includes `isMainCategory` and `parentPage` fields

4. **Test frontend:**
   - Open ProductForm (product creation/edit)
   - Check dropdown shows both main categories (bold) and subcategories (indented)
   - Verify both types are selectable
   - Save product with main category assignment
   - Verify it persists correctly

## Summary

### Problem
✅ **Solved**: Main categories were not visible in ProductForm dropdown

### Root Cause
✅ **Fixed**: API endpoints missing `isMainCategory` and `parentPage` fields

### Changes Made
- ✅ Updated `/api/endpoints/products.php` (getAllProducts function)
- ✅ Updated `/api/endpoints/categories.php` (getAllCategories and getCategory functions)
- ✅ Both endpoints now return complete category data structure

### Migration Required
⚠️ **Action Needed**: Run database migration script if columns don't exist:
```bash
php /Users/umitgencay/Safira/safira-lounge-menu/scripts/database-migration.php
```

### Expected Result
After deploying these changes and running migration:
- Main categories will appear in dropdown (bold text)
- Subcategories will appear indented with "↳" symbol
- Both can be selected for product assignment
- Frontend filtering logic will work correctly
