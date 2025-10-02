# Database Schema Analysis Report

**Date:** 2025-10-02
**Project:** Safira Lounge Menu System
**Issue:** 500 Internal Server Error on Product Create/Update

---

## Executive Summary

**Critical Finding:** The database schema is missing **2 critical columns** (`is_menu_package`, `menu_contents`) that are required by the TypeScript frontend but not present in the MySQL database. This causes SQL INSERT/UPDATE failures resulting in HTTP 500 errors.

**Impact:**
- Cannot create menu packages (combo offers)
- Product updates fail when these fields are included
- Data loss risk if fields are silently ignored

**Solution:** Execute the provided SQL ALTER statements to add missing columns.

---

## 1. TypeScript Interface Requirements

### Product Interface (`src/types/product.types.ts`)

The TypeScript `Product` interface defines these recently added fields:

```typescript
export interface Product extends BaseEntity {
  // ... existing fields ...

  /** Whether this product is a tobacco product (for catalog integration) */
  isTobacco?: boolean;                    // ✅ EXISTS in DB as `is_tobacco`

  /** Whether this product is a menu package */
  isMenuPackage?: boolean;                // ❌ MISSING in DB

  /** Menu package contents description (for menu packages) */
  menuContents?: string;                  // ❌ MISSING in DB

  /** Product image URL */
  imageUrl?: string;                      // ✅ EXISTS as `image_url`

  /** Product thumbnail URL */
  thumbnailUrl?: string;                  // ❌ MISSING in DB

  // ... other optional fields (nutritional, dietary, etc.) ...
}
```

### ProductSize Interface (for variants)

```typescript
export interface ProductSize extends PriceInfo {
  size: string;                           // ✅ EXISTS in `product_sizes` table
  price: number;                          // ✅ EXISTS
  available?: boolean;                    // ✅ EXISTS
  description?: string;                   // ✅ EXISTS
}
```

---

## 2. Current Database Schema

### Main Products Table

```sql
CREATE TABLE `products` (
    `id` INT(11) AUTO_INCREMENT PRIMARY KEY,
    `category_id` INT(11),
    `subcategory_id` INT(11),

    -- Multilingual name fields
    `name_de` VARCHAR(255) NOT NULL,
    `name_en` VARCHAR(255),
    `name_tr` VARCHAR(255),
    `name_da` VARCHAR(255),

    -- Multilingual description fields
    `description_de` TEXT,
    `description_en` TEXT,
    `description_tr` TEXT,
    `description_da` TEXT,

    -- Product properties
    `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `image_url` VARCHAR(500),
    `available` TINYINT(1) DEFAULT 1,

    -- Badges
    `badge_new` TINYINT(1) DEFAULT 0,
    `badge_popular` TINYINT(1) DEFAULT 0,
    `badge_limited` TINYINT(1) DEFAULT 0,

    -- Metadata
    `sort_order` INT(11) DEFAULT 999,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Dynamically added by API (may or may not exist)
    `brand` VARCHAR(255) DEFAULT '',           -- ✅ Added dynamically
    `is_tobacco` TINYINT(1) DEFAULT 0,         -- ✅ Added dynamically
    `has_variants` TINYINT(1) DEFAULT 0        -- ✅ From variants migration
)
```

### Product Sizes Table (Variants)

```sql
CREATE TABLE `product_sizes` (
  `id` INT(11) AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT(11) NOT NULL,
  `size` VARCHAR(100) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `available` TINYINT(1) DEFAULT 1,
  `description` TEXT,
  `sort_order` INT(11) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
)
```

---

## 3. Critical Schema Mismatches

### ❌ Missing Columns (Cause of 500 Errors)

| TypeScript Field | Database Column | Status | Severity |
|-----------------|-----------------|--------|----------|
| `isMenuPackage` | `is_menu_package` | ❌ MISSING | **CRITICAL** |
| `menuContents` | `menu_contents` | ❌ MISSING | **CRITICAL** |
| `thumbnailUrl` | `thumbnail_url` | ❌ MISSING | Medium |
| Dietary fields | `is_vegetarian`, `is_vegan`, `is_gluten_free` | ❌ MISSING | Low |
| Product details | `weight`, `alcohol_content`, `temperature`, etc. | ❌ MISSING | Low |
| `allergens` | `allergens` (JSON) | ❌ MISSING | Low |
| `nutritionalInfo` | `nutritional_info` (JSON) | ❌ MISSING | Low |
| `metadata` | `metadata` (JSON) | ❌ MISSING | Low |

### ✅ Correctly Mapped Fields

| TypeScript Field | Database Column | Status |
|-----------------|-----------------|--------|
| `isTobacco` | `is_tobacco` | ✅ WORKING |
| `brand` | `brand` | ✅ WORKING |
| `sizes` | `product_sizes` table | ✅ WORKING |
| `name` | `name_de`, `name_en`, `name_tr`, `name_da` | ✅ WORKING |
| `description` | `description_de`, `description_en`, `description_tr`, `description_da` | ✅ WORKING |
| `price` | `price` | ✅ WORKING |
| `imageUrl` | `image_url` | ✅ WORKING |
| `available` | `available` | ✅ WORKING |
| `badges` | `badge_new`, `badge_popular`, `badge_limited` | ✅ WORKING |

---

## 4. API Implementation Status

### PHP API (safira-api-fixed.php)

**Fully Supported Fields:**
- `is_tobacco` - Lines 220, 265, 1194-1630 (auto-creates column if missing)
- `brand` - Auto-creates column if missing
- `product_sizes` - Full CRUD support via separate table

**NOT Supported (Missing Code):**
- `is_menu_package` - NO CODE FOUND
- `menu_contents` - NO CODE FOUND
- All optional dietary/nutritional fields - NO CODE FOUND

**Dynamic Column Creation:**
The API tries to auto-create missing columns for `brand` and `is_tobacco`:

```php
// From safira-api-fixed.php lines 1210-1216
try {
    $pdo->exec("ALTER TABLE products ADD COLUMN is_tobacco TINYINT(1) DEFAULT 0");
    error_log('✅ Added is_tobacco column to products table');
} catch (PDOException $e) {
    error_log('ℹ️ is_tobacco column might already exist: ' . $e->getMessage());
}
```

However, **this mechanism does NOT exist for `is_menu_package` or `menu_contents`**, causing failures.

---

## 5. Root Cause of 500 Errors

### Error Flow:

1. **Frontend Request:**
   ```typescript
   const product = {
     name: { de: "Shisha-Paket", en: "Shisha Package" },
     price: 49.99,
     isMenuPackage: true,                    // ⚠️ Not in database
     menuContents: "1x Shisha + 2 Getränke", // ⚠️ Not in database
     isTobacco: false,
     brand: "",
     available: true
   };

   api.addProduct(categoryId, product);
   ```

2. **API Processing:**
   - Receives `isMenuPackage` and `menuContents` fields
   - Does NOT validate or map these fields
   - Passes them to SQL INSERT/UPDATE

3. **Database Execution:**
   - SQL tries to insert into non-existent columns
   - MySQL throws error: `Unknown column 'is_menu_package' in 'field list'`
   - PHP catches exception, returns HTTP 500

4. **Frontend Response:**
   - Receives 500 Internal Server Error
   - Shows generic error to user
   - Data is lost

---

## 6. Solution: SQL Schema Updates

### Minimal Fix (Critical Columns Only)

Execute this SQL to fix the immediate 500 errors:

```sql
-- Add menu package support
ALTER TABLE `products`
ADD COLUMN `is_menu_package` TINYINT(1) DEFAULT 0 AFTER `is_tobacco`,
ADD COLUMN `menu_contents` TEXT DEFAULT NULL AFTER `is_menu_package`,
ADD INDEX `idx_is_menu_package` (`is_menu_package`);

-- Add thumbnail support
ALTER TABLE `products`
ADD COLUMN `thumbnail_url` VARCHAR(500) DEFAULT NULL AFTER `image_url`;
```

### Complete Fix (All Optional Fields)

See `/Users/umitgencay/Safira/safira-lounge-menu/docs/SCHEMA_FIX.sql` for the complete migration script.

---

## 7. Required API Updates

After adding database columns, update the PHP API to handle new fields:

### In `create_product` function:

```php
// Add menu package handling
$is_menu_package = isset($input['isMenuPackage']) ? ($input['isMenuPackage'] ? 1 : 0) : 0;
$menu_contents = isset($input['menuContents']) ? $input['menuContents'] : null;

// Update INSERT query
$stmt = $pdo->prepare("
    INSERT INTO products (
        ..., is_menu_package, menu_contents, ...
    ) VALUES (
        ..., ?, ?, ...
    )
");
$stmt->execute([..., $is_menu_package, $menu_contents, ...]);
```

### In `update_product` function:

```php
// Add to update fields
if (isset($input['isMenuPackage'])) {
    $updateFields[] = "is_menu_package = ?";
    $updateValues[] = $input['isMenuPackage'] ? 1 : 0;
}

if (isset($input['menuContents'])) {
    $updateFields[] = "menu_contents = ?";
    $updateValues[] = $input['menuContents'];
}
```

### In product retrieval (GET requests):

```php
// Add to product mapping
'isMenuPackage' => (bool)($product['is_menu_package'] ?? false),
'menuContents' => $product['menu_contents'] ?? null,
'thumbnailUrl' => $product['thumbnail_url'] ?? null,
```

---

## 8. Testing Plan

### After Schema Migration:

1. **Verify columns exist:**
   ```sql
   DESCRIBE products;
   SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_NAME = 'products'
   AND COLUMN_NAME IN ('is_menu_package', 'menu_contents');
   ```

2. **Test product creation:**
   - Create regular product (should work)
   - Create menu package with `isMenuPackage: true` (should work after fix)
   - Create product with variants (should work)

3. **Test product updates:**
   - Update regular product to menu package
   - Update menu package contents
   - Verify fields persist correctly

4. **Test API responses:**
   - GET /api/products should return new fields
   - Verify TypeScript type safety (no errors)

---

## 9. Recommendations

### Immediate Actions (Required):
1. ✅ Execute `SCHEMA_FIX.sql` on production database
2. ✅ Update PHP API to handle `is_menu_package` and `menu_contents`
3. ✅ Test product creation/update flows
4. ✅ Deploy and verify no more 500 errors

### Short-term (1-2 weeks):
1. Add `thumbnail_url` support for image optimization
2. Implement API validation for new fields
3. Add unit tests for menu package functionality
4. Update API documentation

### Long-term (1-3 months):
1. Consider adding dietary/nutritional columns for future features
2. Implement JSON column support for flexible metadata
3. Add database migration versioning system
4. Create automated schema validation tests

---

## 10. Files Modified

- `/Users/umitgencay/Safira/safira-lounge-menu/docs/SCHEMA_FIX.sql` - ✅ NEW
- `/Users/umitgencay/Safira/safira-lounge-menu/docs/SCHEMA_ANALYSIS_REPORT.md` - ✅ NEW
- `.swarm/memory.db` - ✅ Updated with analysis data

---

## 11. Related Issues

- Git status shows modifications to TypeScript types (`src/types/product.types.ts`)
- API service has been updated (`src/services/api.ts`)
- Product components reference new fields (ProductForm, ProductCard)
- Database migrations exist for variants but not for menu packages

---

## Appendix: Field Mapping Reference

| Frontend (TypeScript) | API (PHP) | Database (MySQL) | Status |
|----------------------|-----------|------------------|--------|
| `id` | `id` | `id` INT(11) | ✅ |
| `name` (multilingual) | `name_de`, `name_en`, etc. | `name_de`, `name_en`, `name_tr`, `name_da` VARCHAR(255) | ✅ |
| `description` (multilingual) | `description_de`, etc. | `description_de`, `description_en`, etc. TEXT | ✅ |
| `price` | `price` | `price` DECIMAL(10,2) | ✅ |
| `sizes` | `sizes[]` | `product_sizes` table | ✅ |
| `available` | `available` | `available` TINYINT(1) | ✅ |
| `categoryId` | `category_id` | `category_id` INT(11) | ✅ |
| `badges.neu` | `badge_new` | `badge_new` TINYINT(1) | ✅ |
| `badges.beliebt` | `badge_popular` | `badge_popular` TINYINT(1) | ✅ |
| `badges.kurze_zeit` | `badge_limited` | `badge_limited` TINYINT(1) | ✅ |
| `brand` | `brand` | `brand` VARCHAR(255) | ✅ |
| `isTobacco` | `is_tobacco` | `is_tobacco` TINYINT(1) | ✅ |
| `isMenuPackage` | ❌ NOT HANDLED | ❌ MISSING | ❌ |
| `menuContents` | ❌ NOT HANDLED | ❌ MISSING | ❌ |
| `thumbnailUrl` | ❌ NOT HANDLED | ❌ MISSING | ❌ |
| `imageUrl` | `image_url` | `image_url` VARCHAR(500) | ✅ |
| `createdAt` | `created_at` | `created_at` TIMESTAMP | ✅ |
| `updatedAt` | `updated_at` | `updated_at` TIMESTAMP | ✅ |

---

**End of Report**
