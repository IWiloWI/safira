# Menu-Package Feature Test Plan

## Overview
This document outlines the complete testing flow for the menu-package feature, from creation through editing to customer-facing display.

## Feature Description
The menu-package feature allows administrators to create special menu items that contain multiple components (e.g., "Breakfast Combo" with coffee, pastry, and juice).

## Data Structure

### Backend Storage
- **isMenuPackage**: `boolean` - Flag indicating this is a menu package
- **menuContents**: `string` - Serialized JSON array of menu items
- **Example**: `'[{"title":"Kaffee","description":"Espresso oder Americano"},{"title":"Croissant","description":"Frisch gebacken"}]'`

### Frontend Form State
```typescript
interface MenuPackageItem {
  title: string;
  description: string;
}

interface ProductFormData {
  isMenuPackage: boolean;
  menuItems: MenuPackageItem[]; // Array for form editing
  menuContents?: string; // Serialized for API submission
}
```

### Frontend Display
The `MenuProductCard` component displays menu items in a styled list below the product description.

## Test Flow

### 1. Creation Flow ✓

**Path**: Admin Panel → Product Manager → Add Product → "Menü-Paket"

**Steps**:
1. Click "Produkt hinzufügen" button
2. ProductTypeSelector modal opens with 3 options
3. Click "Menü-Paket" card (with FaClipboardList icon)
4. ProductForm opens with title "📋 Menü-Paket Hinzufügen"
5. Fill required fields:
   - Name: "Frühstücks-Paket"
   - Description: "Perfekter Start in den Tag"
   - Price: "12.50"
   - Category: "Specials"
6. Scroll to "Menü-Inhalt" section
7. Click "+ Menü-Artikel hinzufügen" button
8. Fill first item:
   - Title: "Kaffee"
   - Description: "Espresso oder Americano"
9. Click "+ Menü-Artikel hinzufügen" again
10. Fill second item:
   - Title: "Croissant"
   - Description: "Frisch gebacken"
11. Add third item:
   - Title: "Orangensaft"
   - Description: "Frisch gepresst, 0,2L"
12. Click "Speichern" button

**Expected Result**:
- Product is created with `isMenuPackage: true`
- `menuContents` contains serialized JSON array with 3 items
- Success message appears
- Product appears in product list with 📋 icon

**Validation Checks**:
- At least one menu item is required
- Title field is required for each item
- Empty items should show validation error

### 2. Editing Flow ✓

**Path**: Admin Panel → Product Manager → [Find Menu-Package] → Edit

**Steps**:
1. Find "Frühstücks-Paket" in product list
2. Click edit icon (pencil)
3. ProductForm opens with existing data pre-filled
4. Verify all fields are correctly loaded:
   - Name, description, price, category
   - All 3 menu items with titles and descriptions
5. Modify second item:
   - Change "Croissant" to "Butter-Croissant"
   - Update description to "Mit Bio-Butter gebacken"
6. Remove third item (Orangensaft) by clicking "Entfernen"
7. Add new fourth item:
   - Title: "Marmelade"
   - Description: "Hausgemachte Erdbeer-Marmelade"
8. Click "Speichern" button

**Expected Result**:
- Product is updated with new menu items
- menuContents reflects changes (3 items now)
- Changes are immediately visible in product list

**Validation Checks**:
- Existing data loads correctly from `menuContents` string
- Parsing handles JSON correctly
- Menu item count updates properly

### 3. Frontend Display Flow ✓

**Path**: Customer Menu → Category → Menu-Package Product

**Steps**:
1. Navigate to customer-facing menu page
2. Select category containing "Frühstücks-Paket"
3. Find the menu-package product card
4. Verify display elements:
   - Product name appears prominently
   - Description is visible
   - Price displays correctly
   - Menu items section appears below description
   - Each menu item shows:
     - Title (bold)
     - Description (lighter text)

**Expected Result**:
- MenuProductCard component properly renders menu items
- `getMenuItems()` function correctly parses `menuContents`
- MenuItemsContainer and MenuItem styled components display properly
- Layout is responsive on mobile devices

**Display Code Reference**:
```typescript
// MenuProductCard.tsx:398-401
const getMenuItems = (): string[] => {
  if (!product.isMenuPackage || !product.menuContents) {
    return [];
  }
  // Parse menuContents JSON and extract formatted strings
  const items = JSON.parse(product.menuContents || '[]');
  return items.map(item => `${item.title}: ${item.description}`);
};

// MenuProductCard.tsx:507-514
{menuItems.length > 0 && (
  <MenuItemsContainer>
    {menuItems.map((item, index) => (
      <MenuItem key={index}>
        {item}
      </MenuItem>
    ))}
  </MenuItemsContainer>
)}
```

## Styled Components

### ProductForm Components
- **Modal**: Dark background with gradient overlay
- **ModalContent**: Gradient border (pink/gold), rounded corners, custom scrollbar
- **ModalTitle**: Gradient text, uppercase, bold
- **Label**: Gradient text for form labels
- **Input/TextArea**: Semi-transparent background, pink border on focus
- **VariantItem**: Menu item container with hover effects
- **AddVariantButton**: Green gradient, uppercase text
- **RemoveVariantButton**: Red background with hover effects

### MenuProductCard Components
- **MenuItemsContainer**: Container for menu items list
- **MenuItem**: Individual menu item display

## API Integration

### Create Product
```typescript
// POST /safira-api-fixed.php?action=create_product
{
  name: "Frühstücks-Paket",
  description: "Perfekter Start in den Tag",
  price: "12.50",
  category: "specials",
  isMenuPackage: true,
  menuContents: '[{"title":"Kaffee","description":"Espresso oder Americano"},{"title":"Croissant","description":"Frisch gebacken"}]'
}
```

### Update Product
```typescript
// PUT /safira-api-fixed.php?action=update_product
{
  id: "product-123",
  name: "Frühstücks-Paket",
  isMenuPackage: true,
  menuContents: '[{"title":"Kaffee","description":"..."},{"title":"Butter-Croissant","description":"..."}]'
}
```

### Get Products
```typescript
// GET /safira-api-fixed.php?action=products
// Response includes:
{
  products: [
    {
      id: "product-123",
      name: "Frühstücks-Paket",
      isMenuPackage: true,
      menuContents: '[...]',
      // ... other fields
    }
  ]
}
```

## Known Issues & Considerations

### Parsing Menu Items
- `useProductForm.ts:159-180` - `parseMenuItems()` function handles JSON parsing
- Validates each item has at least a title
- Returns empty array on parse errors

### Validation
- At least one menu item required for menu packages
- Title is mandatory, description is optional
- Empty items are filtered out during submission

### Data Transformation
```typescript
// Form state (array) → API submission (string)
const packageItemsString = JSON.stringify(
  formData.menuItems
    .filter(item => item.title.trim())
    .map(item => ({
      title: item.title,
      description: item.description || ''
    }))
);
```

### Display Format
```typescript
// API response (string) → Display format (string array)
const items = JSON.parse(product.menuContents || '[]');
return items.map(item => `${item.title}: ${item.description}`);
```

## Testing Checklist

- [ ] **Creation**: Create new menu-package with 3 items
- [ ] **Validation**: Try to save with empty items (should fail)
- [ ] **Validation**: Try to save with no items (should fail)
- [ ] **Editing**: Edit existing menu-package
- [ ] **Editing**: Add new items during edit
- [ ] **Editing**: Remove items during edit
- [ ] **Editing**: Modify existing items during edit
- [ ] **Display**: Verify customer-facing display shows all items
- [ ] **Display**: Check mobile responsiveness
- [ ] **API**: Verify data persists correctly in database
- [ ] **API**: Verify JSON serialization is correct

## Success Criteria

✅ **Creation Flow**:
- ProductTypeSelector shows 3 options with correct styling
- ProductForm opens with menu-package-specific title
- Menu items section appears with add/remove controls
- Form validates menu items correctly
- API receives correctly formatted data

✅ **Editing Flow**:
- Existing menu items load from menuContents string
- All menu item operations work (add/remove/update)
- Changes persist to database
- Product list reflects updates

✅ **Display Flow**:
- MenuProductCard shows menu items in styled list
- Parsing handles various data formats
- Mobile responsive layout
- Clear visual hierarchy

## Build Status

✅ **Production Build**: Compiled successfully
- Main bundle: 20.76 kB
- No blocking errors
- Only linting warnings (unused imports)

## Next Steps

1. Run full manual test following this plan
2. Create automated E2E tests with Playwright/Cypress
3. Add unit tests for `parseMenuItems()` function
4. Consider i18n support for menu item descriptions
5. Add menu-package icon in product list view

---

**Document Created**: 2025-10-09
**Last Updated**: 2025-10-09
**Status**: Ready for Testing
