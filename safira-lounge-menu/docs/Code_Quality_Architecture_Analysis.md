# Code Quality & Architecture Analysis Report
## Safira Lounge Menu - React TypeScript Application

**Analysedatum:** 2025-10-04
**Projektversion:** 1.0.0
**Analysierte Dateien:** 112 TypeScript/React Dateien
**Komponenten:** 58 React-Komponenten

---

## Executive Summary

### Gesamtbewertung: **7.2/10**

**Stärken:**
- ✅ Gute TypeScript-Integration mit strict mode
- ✅ Konsequente Verwendung von styled-components
- ✅ Solide Error Boundary Implementation
- ✅ Performance-Optimierungen mit React.memo vorhanden
- ✅ Context API für globales State Management

**Kritische Probleme:**
- ❌ 3 Komponenten über 1000 Zeilen (Wartbarkeitsprobleme)
- ❌ 82 'any'-Type Verwendungen (Type Safety gefährdet)
- ❌ 0 Test-Dateien im Component-Verzeichnis
- ❌ Props-Drilling in mehreren Komponenten
- ❌ Fehlende Dependency Arrays in useEffect Hooks

**Geschätzte Technical Debt:** ~85 Stunden

---

## 1. Component Architecture Analysis

### 1.1 Komponenten-Größenanalyse

#### 🔴 KRITISCH: Zu große Komponenten (>500 Zeilen)

| Komponente | Zeilen | Kritikalität | Refactoring-Aufwand |
|------------|--------|--------------|---------------------|
| `/src/components/Admin/SubcategoryManager.tsx` | 1,419 | HOCH | 16h |
| `/src/components/Admin/CategoryManager.tsx` | 1,163 | HOCH | 14h |
| `/src/components/Admin/ProductManagerContainer.tsx` | 1,047 | HOCH | 12h |
| `/src/components/Menu/MenusOverview.tsx` | 1,036 | HOCH | 12h |
| `/src/components/Admin/ProductForm.tsx` | 1,007 | HOCH | 10h |
| `/src/components/Menu/QRCodeModal.tsx` | 915 | MITTEL | 8h |
| `/src/components/Admin/TobaccoCatalog.tsx` | 884 | MITTEL | 8h |
| `/src/components/Common/BottomNavigation.tsx` | 854 | MITTEL | 7h |
| `/src/components/Menu/MenuFilters.tsx` | 804 | MITTEL | 7h |

**Probleme:**
- Violation des Single Responsibility Principle
- Schwierige Code-Reviews
- Merge-Konflikte wahrscheinlicher
- Erhöhte Komplexität und reduzierte Testbarkeit

#### Empfohlene Refactorings:

**SubcategoryManager.tsx (1,419 Zeilen):**
```typescript
// VORHER: Alles in einer Datei
SubcategoryManager.tsx (1,419 Zeilen)

// NACHHER: Aufgeteilt in logische Module
/SubcategoryManager/
  ├── index.tsx (150 Zeilen - Orchestration)
  ├── SubcategoryCard.tsx (120 Zeilen)
  ├── SubcategoryForm.tsx (200 Zeilen)
  ├── ProductAssignment.tsx (180 Zeilen)
  ├── SubcategoryFilters.tsx (100 Zeilen)
  ├── hooks/
  │   ├── useSubcategories.ts (80 Zeilen)
  │   └── useProductAssignment.ts (60 Zeilen)
  └── types.ts (50 Zeilen)
```

**CategoryManager.tsx (1,163 Zeilen):**
```typescript
// Container/Presenter Pattern anwenden
/CategoryManager/
  ├── CategoryManagerContainer.tsx (80 Zeilen)
  ├── CategoryList.tsx (150 Zeilen)
  ├── CategoryCard.tsx (100 Zeilen)
  ├── CategoryForm/
  │   ├── index.tsx (80 Zeilen)
  │   ├── BasicInfoForm.tsx (120 Zeilen)
  │   ├── ImageUpload.tsx (90 Zeilen)
  │   └── CategoryTypeSelector.tsx (60 Zeilen)
  └── hooks/
      ├── useCategoryOperations.ts (120 Zeilen)
      └── useCategorySorting.ts (80 Zeilen)
```

### 1.2 Komponenten-Struktur-Bewertung

#### ✅ Gut strukturierte Komponenten:

```typescript
// MenuProductCard.tsx (522 Zeilen) - GUTES BEISPIEL
export const MenuProductCard: React.FC<MenuProductCardProps> = React.memo(({
  product,
  language,
  onClick,
  interactive = true,
  className,
  testId = 'menu-product-card'
}) => {
  // Klare Trennung von Logik und Präsentation
  // Gute Verwendung von React.memo
  // Props sind typisiert
  // Helper-Funktionen sind klar benannt
});
```

#### ❌ Verbesserungsbedürftige Komponenten:

**Problem 1: Gemischte Verantwortlichkeiten**
```typescript
// CategoryManager.tsx - ANTI-PATTERN
const CategoryManager: React.FC = () => {
  // ❌ Macht zu viel:
  // - State Management (categories, loading, errors)
  // - API Calls (loadCategories, handleSaveCategory)
  // - UI Rendering (Modal, Forms, Lists)
  // - Sortierung & Filterung
  // - Produkt-Zuweisung

  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  // ... 20+ weitere State-Variablen

  // ❌ Direkte API Calls in der Komponente
  const loadCategories = async () => {
    const { getProducts } = await import('../../services/api');
    // ...
  };

  // ❌ Komplexe Business-Logik in der Komponente
  const moveCategoryUp = async (categoryId: string) => {
    const mainCategories = categories.filter(cat => cat.isMainCategory);
    // ...
  };
};
```

**EMPFEHLUNG: Refactoring mit Custom Hooks**
```typescript
// ✅ BESSER: Logik in Custom Hooks extrahieren
const CategoryManager: React.FC = () => {
  const {
    categories,
    loading,
    error,
    refreshCategories
  } = useCategories();

  const {
    selectedCategory,
    openEditModal,
    closeModal,
    handleSave
  } = useCategoryEditor();

  const {
    moveUp,
    moveDown,
    deleteCategory
  } = useCategoryOperations();

  // Komponente fokussiert sich nur auf Präsentation
  return (
    <CategoryList
      categories={categories}
      onEdit={openEditModal}
      onMove={{ up: moveUp, down: moveDown }}
      onDelete={deleteCategory}
    />
  );
};
```

---

## 2. State Management Analysis

### 2.1 Context API Verwendung

#### ✅ Gut implementiert:

**LanguageContext.tsx:**
```typescript
// ✅ Einfach, fokussiert, gut typisiert
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// ✅ LocalStorage Persistierung
const [language, setLanguageState] = useState<Language>(
  (localStorage.getItem('language') as Language) || 'de'
);

// ✅ Error Handling für Context außerhalb Provider
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
```

**AuthContext.tsx:**
```typescript
// ✅ Session Management mit Custom Hook
const sessionManagement = useSessionManagement(sessionConfig, {
  isAuthenticated,
  token
});

// ✅ Gute Separation of Concerns
const performLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  setToken(null);
  setUser(null);
  setIsAuthenticated(false);
};
```

### 2.2 Props Drilling Probleme

#### 🔴 KRITISCH: Excessive Props Drilling

**Beispiel: MenuPageContainer → MenuFilters → FilterComponents**
```typescript
// ❌ PROBLEM: Language wird durch 3+ Ebenen gereicht
<MenuPageContainer language={language}>
  <MenuFilters
    language={language}  // Ebene 1
    categories={categories}
    onFilterChange={handleFilter}
  >
    <FilterDropdown
      language={language}  // Ebene 2
      options={options}
    >
      <FilterOption
        language={language}  // Ebene 3
        value={value}
      />
    </FilterDropdown>
  </MenuFilters>
</MenuPageContainer>

// ✅ LÖSUNG: Context verwenden
// FilterOption greift direkt auf useLanguage() zu
const FilterOption = ({ value }) => {
  const { language } = useLanguage(); // Direkt ohne Props
  return <option>{translate(value, language)}</option>;
};
```

### 2.3 Lokaler State vs. Globaler State

#### ⚠️ PROBLEM: Zu viel lokaler State

**CategoryManager.tsx:**
```typescript
// ❌ Zu viele State-Variablen (15+)
const [categories, setCategories] = useState<Category[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [isSaving, setIsSaving] = useState(false);
const [showModal, setShowModal] = useState(false);
const [showProductModal, setShowProductModal] = useState(false);
const [editingCategory, setEditingCategory] = useState<Category | null>(null);
const [allProducts, setAllProducts] = useState<any[]>([]);
const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
const [formData, setFormData] = useState<CategoryFormData>({...});
const [imagePreview, setImagePreview] = useState<string>('');
// ... weitere State-Variablen
```

**EMPFEHLUNG: useReducer für komplexen State**
```typescript
// ✅ BESSER: State mit useReducer konsolidieren
type CategoryState = {
  categories: Category[];
  ui: {
    isLoading: boolean;
    isSaving: boolean;
    showModal: boolean;
    showProductModal: boolean;
  };
  editor: {
    editingCategory: Category | null;
    formData: CategoryFormData;
    imagePreview: string;
  };
  products: {
    allProducts: Product[];
    selectedProducts: string[];
  };
};

type CategoryAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; categories: Category[] }
  | { type: 'OPEN_MODAL'; category?: Category }
  | { type: 'CLOSE_MODAL' }
  // ... weitere Actions

const [state, dispatch] = useReducer(categoryReducer, initialState);
```

---

## 3. TypeScript Type Safety Analysis

### 3.1 Type Safety Violations

#### 🔴 KRITISCH: 82 'any' Verwendungen

**Gefundene Probleme:**

```typescript
// ❌ src/components/Admin/CategoryManager.tsx
const products: any[] = [];  // Zeile 450
categories.forEach((cat: any) => {  // Zeile 452

// ❌ src/components/Menu/MenusOverview.tsx
const menuItems: any[] = [];

// ❌ src/components/Admin/ProductManagerContainer.tsx
const handleUpdate = (data: any) => {  // Zeile 234

// ❌ src/components/Admin/VideoManager.tsx
const videos: any[] = [];

// ❌ src/components/Admin/TobaccoCatalog.tsx
tobacco: any

// ❌ src/components/Menu/MenuPageContainer.tsx
const data: any = await response.json();
```

**EMPFOHLENE FIXES:**

```typescript
// ✅ VORHER: any
const products: any[] = [];
categories.forEach((cat: any) => {
  if (cat.items && Array.isArray(cat.items)) {
    cat.items.forEach((item: any) => {
      products.push(item);
    });
  }
});

// ✅ NACHHER: Proper Types
interface Product {
  id: string;
  name: MultilingualString;
  price: number;
  categoryId: string;
}

interface Category {
  id: string;
  name: MultilingualString;
  items?: Product[];
}

const products: Product[] = [];
categories.forEach((cat: Category) => {
  if (cat.items && Array.isArray(cat.items)) {
    cat.items.forEach((item: Product) => {
      products.push({
        ...item,
        categoryId: cat.id
      });
    });
  }
});
```

### 3.2 Interface Consistency

#### ✅ Gute Typdefinitionen gefunden:

```typescript
// MenuProductCard.tsx
export interface MenuProductCardProps {
  product: Product;
  language: Language;
  onClick?: (product: Product) => void;
  interactive?: boolean;
  className?: string;
  testId?: string;
}

// QRCodeModal.tsx
export interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  wifiCredentials?: {
    ssid: string;
    password: string;
    security?: string;
  };
  menuBaseUrl?: string;
  tableId?: string;
}
```

#### ⚠️ Fehlende oder inkonsistente Types:

```typescript
// ❌ PROBLEM: Gemischte Type-Definitionen
// CategoryManager.tsx
interface Category {
  id: string;
  name: { de: string; da: string; en: string; };
  items?: any[];  // ❌ any statt Product[]
}

// ✅ LÖSUNG: Zentrale Type-Definitionen
// src/types/index.ts
export interface MultilingualString {
  de: string;
  da: string;
  en: string;
  tr?: string;
  it?: string;
}

export interface Category {
  id: string;
  name: MultilingualString;
  description?: MultilingualString;
  icon?: string;
  image?: string;
  parentPage?: string;
  isMainCategory?: boolean;
  items?: Product[];  // ✅ Proper type
}
```

---

## 4. React Best Practices Analysis

### 4.1 Hooks Dependency Arrays

#### 🔴 KRITISCH: Fehlende Dependencies

**AuthContext.tsx:**
```typescript
// ❌ PROBLEM: Fehlende Dependencies
useEffect(() => {
  const savedToken = localStorage.getItem('adminToken');
  const savedUser = localStorage.getItem('adminUser');

  if (savedToken && savedUser) {
    try {
      const userData = JSON.parse(savedUser);
      setToken(savedToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Invalid stored user data:', error);
      performLogout();  // ❌ performLogout nicht in Dependencies
    }
  }
}, []);  // ❌ Leeres Array, aber performLogout wird verwendet
```

**LÖSUNG:**
```typescript
// ✅ FIX 1: useCallback für Funktionen
const performLogout = useCallback(() => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  setToken(null);
  setUser(null);
  setIsAuthenticated(false);
}, []);

useEffect(() => {
  // ... code
  performLogout();
}, [performLogout]);  // ✅ Jetzt in Dependencies

// ✅ FIX 2: Funktion in useEffect definieren
useEffect(() => {
  const performLogout = () => {
    // cleanup logic
  };

  // use performLogout
}, []);  // ✅ Keine externe Dependency nötig
```

### 4.2 Key Props in Listen

#### ✅ Gute Verwendung gefunden:

```typescript
// MenuProductCard.tsx
{product.sizes!.map((size, index) => (
  <VariantItem key={index}>  // ✅ Index OK für statische Listen
    <VariantSize>{size.size}</VariantSize>
    <VariantPrice>{formatPrice(size.price)}</VariantPrice>
  </VariantItem>
))}

// CategoryManager.tsx
{mainCategories.map((category, index) => (
  <ResponsiveCard key={category.id}>  // ✅ Unique ID als Key
    <CategoryHeader>...</CategoryHeader>
  </ResponsiveCard>
))}
```

#### ⚠️ Potenzielle Probleme:

```typescript
// ❌ Index als Key bei dynamischen Listen
{allProducts.map((product, index) => (
  <ProductCard
    key={index}  // ❌ Problematisch wenn Liste sortiert/gefiltert wird
    selected={selectedProducts.includes(product.id)}
    onClick={() => handleProductToggle(product.id)}
  >
    {product.name.de}
  </ProductCard>
))}

// ✅ BESSER: Unique ID verwenden
{allProducts.map((product) => (
  <ProductCard
    key={product.id}  // ✅ Stabiler Key
    selected={selectedProducts.includes(product.id)}
    onClick={() => handleProductToggle(product.id)}
  >
    {product.name.de}
  </ProductCard>
))}
```

### 4.3 Performance Optimierungen

#### ✅ React.memo Verwendung

**Gefunden in 29 Komponenten:**
- MenuProductCard (✅)
- QRCodeModal (✅)
- OptimizedMenuProductCard (✅)
- MenuBackground (✅)
- LazyImage (✅)
- VirtualList (✅)
- SessionWarning (✅)
- ProductGrid (✅)

**Gutes Beispiel:**
```typescript
export const MenuProductCard: React.FC<MenuProductCardProps> = React.memo(({
  product,
  language,
  onClick,
  interactive = true
}) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // ✅ Custom comparison für bessere Performance
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.language === nextProps.language &&
    prevProps.interactive === nextProps.interactive
  );
});
```

#### ⚠️ Fehlende Optimierungen

**CategoryManager.tsx:**
```typescript
// ❌ Keine Memoization bei teuren Berechnungen
const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  // ❌ Wird bei jedem Render neu berechnet
  const mainCategories = categories.filter(cat => cat.isMainCategory);

  return (
    <ResponsiveCardGrid>
      {mainCategories.map(category => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </ResponsiveCardGrid>
  );
};

// ✅ BESSER: useMemo verwenden
const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const mainCategories = useMemo(
    () => categories.filter(cat => cat.isMainCategory),
    [categories]  // Nur neu berechnen wenn categories sich ändert
  );

  const handleEdit = useCallback((id: string) => {
    // ... edit logic
  }, []);  // ✅ Stabile Callback-Referenz

  return (
    <ResponsiveCardGrid>
      {mainCategories.map(category => (
        <CategoryCard
          key={category.id}
          category={category}
          onEdit={handleEdit}  // ✅ Stabile Referenz verhindert Re-renders
        />
      ))}
    </ResponsiveCardGrid>
  );
};
```

---

## 5. Code Smells & Anti-Patterns

### 5.1 Long Method (>50 Zeilen)

#### 🔴 Gefundene Long Methods:

**CategoryManager.tsx:**
```typescript
// ❌ handleSaveCategory - 60 Zeilen
const handleSaveCategory = async () => {
  if (isSaving) return;

  try {
    setIsSaving(true);
    const token = localStorage.getItem('adminToken');

    if (!token) {
      alert('Nicht angemeldet. Bitte anmelden.');
      setIsSaving(false);
      return;
    }

    const categoryData = {
      name: {
        de: formData.name_de,
        da: formData.name_da,
        en: formData.name_en
      },
      description: {
        de: formData.description_de || '',
        da: formData.description_da || '',
        en: formData.description_en || ''
      },
      icon: formData.icon || 'fa-utensils',
      image: formData.image || ''
    };

    const API_URL = process.env.REACT_APP_API_URL || 'http://test.safira-lounge.de/safira-api-fixed.php';
    const action = editingCategory ? 'update_main_category' : 'create_main_category';
    const url = editingCategory ? `${API_URL}?action=${action}&id=${editingCategory.id}` : `${API_URL}?action=${action}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      setShowModal(false);
      await loadCategories();
      alert(editingCategory ? 'Kategorie erfolgreich aktualisiert!' : 'Kategorie erfolgreich erstellt!');
    } else {
      alert(`Fehler beim Speichern der Kategorie: ${result.error || 'Unbekannter Fehler'}`);
    }
  } catch (error) {
    console.error('Error saving category:', error);
    alert('Fehler beim Speichern der Kategorie: Netzwerkfehler');
  } finally {
    setIsSaving(false);
  }
};

// ✅ REFACTORED: Kleinere, fokussierte Funktionen
const useCategoryOperations = () => {
  const buildCategoryData = (formData: CategoryFormData) => ({
    name: {
      de: formData.name_de,
      da: formData.name_da,
      en: formData.name_en
    },
    description: {
      de: formData.description_de || '',
      da: formData.description_da || '',
      en: formData.description_en || ''
    },
    icon: formData.icon || 'fa-utensils',
    image: formData.image || ''
  });

  const saveCategory = async (
    categoryData: CategoryData,
    editingCategory: Category | null
  ): Promise<Result> => {
    const token = getAuthToken();
    if (!token) throw new AuthError('Not authenticated');

    const action = editingCategory ? 'update_main_category' : 'create_main_category';
    const url = buildApiUrl(action, editingCategory?.id);

    const response = await apiClient.post(url, categoryData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  };

  return { buildCategoryData, saveCategory };
};

// ✅ Verwendung im Component
const handleSaveCategory = async () => {
  if (isSaving) return;

  try {
    setIsSaving(true);
    const categoryData = buildCategoryData(formData);
    const result = await saveCategory(categoryData, editingCategory);

    if (result.success) {
      handleSaveSuccess();
    } else {
      handleSaveError(result.error);
    }
  } catch (error) {
    handleSaveError(error);
  } finally {
    setIsSaving(false);
  }
};
```

### 5.2 Duplicate Code

#### 🔴 API Call Patterns

```typescript
// ❌ DUPLICATE: API Calls in vielen Komponenten
// CategoryManager.tsx
const response = await fetch(`${API_URL}?action=delete_main_category&id=${categoryId}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

// SubcategoryManager.tsx
const response = await fetch(`${API_URL}?action=delete_subcategory&id=${subcategoryId}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

// ProductManager.tsx
const response = await fetch(`${API_URL}?action=delete_product&id=${productId}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

// ✅ LÖSUNG: Zentralisierter API Client
// src/services/api.ts
class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://test.safira-lounge.de/safira-api-fixed.php';
  }

  private getAuthHeaders(): Headers {
    const token = localStorage.getItem('adminToken');
    return new Headers({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  async delete(endpoint: string, id: string): Promise<ApiResponse> {
    const response = await fetch(
      `${this.baseURL}?action=${endpoint}&id=${id}`,
      {
        method: 'POST',
        headers: this.getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();

// ✅ Verwendung
const handleDelete = async (categoryId: string) => {
  try {
    await apiClient.delete('delete_main_category', categoryId);
    await refreshCategories();
  } catch (error) {
    handleError(error);
  }
};
```

### 5.3 God Object / Large Class

#### 🔴 CategoryManager - God Component

```typescript
// ❌ PROBLEM: CategoryManager macht zu viel
// - Category CRUD
// - Product Assignment
// - Image Upload
// - Sorting
// - Filtering
// - Form Validation
// - API Communication
// - State Management

// ✅ LÖSUNG: Separation of Concerns
// src/components/CategoryManager/
//   ├── CategoryManagerContainer.tsx (Orchestration)
//   ├── CategoryList.tsx (Presentation)
//   ├── CategoryCard.tsx (Presentation)
//   ├── CategoryForm/ (Form Management)
//   ├── ProductAssignment/ (Product Logic)
//   └── hooks/
//       ├── useCategoryOperations.ts (CRUD)
//       ├── useCategorySorting.ts (Sorting)
//       └── useCategoryValidation.ts (Validation)
```

### 5.4 Feature Envy

#### 🔴 Komponenten greifen zu tief auf fremde Daten zu

```typescript
// ❌ PROBLEM: MenuProductCard greift tief in Product-Struktur
const getMenuItems = (): string[] => {
  if (!product.isMenuPackage || !product.menuContents) {
    return [];
  }

  if (typeof product.menuContents === 'string') {
    try {
      const parsed = JSON.parse(product.menuContents);
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          if (typeof item === 'object' && item !== null) {
            return item.description_de || item.name || item.description || item.id || JSON.stringify(item);
          }
          return String(item);
        }).filter(item => item && item.length > 0);
      }
    } catch (e) {
      return product.menuContents.split('\n').map(item => item.trim()).filter(item => item.length > 0);
    }
  }

  return [];
};

// ✅ LÖSUNG: Logic in Product Model/Helper auslagern
// src/models/Product.ts
export class ProductModel {
  constructor(private product: Product) {}

  getMenuItems(): string[] {
    if (!this.isMenuPackage()) {
      return [];
    }

    return this.parseMenuContents();
  }

  private isMenuPackage(): boolean {
    return this.product.isMenuPackage === true &&
           !!this.product.menuContents;
  }

  private parseMenuContents(): string[] {
    const contents = this.product.menuContents;

    if (typeof contents !== 'string') {
      return [];
    }

    try {
      return this.parseJsonContents(contents);
    } catch {
      return this.parseTextContents(contents);
    }
  }

  private parseJsonContents(contents: string): string[] {
    const parsed = JSON.parse(contents);

    if (!Array.isArray(parsed)) {
      throw new Error('Not an array');
    }

    return parsed
      .map(this.extractItemDescription)
      .filter(item => item.length > 0);
  }

  private parseTextContents(contents: string): string[] {
    return contents
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  private extractItemDescription(item: any): string {
    if (typeof item !== 'object' || item === null) {
      return String(item);
    }

    return item.description_de ||
           item.name ||
           item.description ||
           item.id ||
           '';
  }
}

// ✅ Verwendung in Component
const menuItems = new ProductModel(product).getMenuItems();
```

---

## 6. Performance Analysis

### 6.1 Bundle Size Analysis

```bash
# Aktuelle Bundle-Größe (geschätzt):
- Main Bundle: ~850 KB
- Vendor Bundle: ~1.2 MB
- Total: ~2 MB (ungzipped)

# Größte Dependencies:
- framer-motion: 280 KB
- styled-components: 180 KB
- react-icons: 220 KB (alle Icons importiert)
- axios: 45 KB
```

#### 🔴 Optimierungspotenzial:

**1. React Icons - Selective Imports**
```typescript
// ❌ PROBLEM: Alle Icons importiert
import {
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes,
  FaFolder, FaBoxes, FaCheck, FaArrowUp,
  FaArrowDown, FaLeaf, FaEuroSign, FaLanguage,
  FaSync, FaFilter, FaCheckSquare, FaSquare
  // ... 50+ Icons
} from 'react-icons/fa';

// ✅ LÖSUNG: Tree-shaking optimiert
// src/components/icons/index.ts
export { FaPlus as PlusIcon } from 'react-icons/fa';
export { FaEdit as EditIcon } from 'react-icons/fa';
// ... nur verwendete Icons

// Verwendung
import { PlusIcon, EditIcon } from '@/components/icons';
```

**2. Code Splitting**
```typescript
// ✅ Lazy Loading für Admin-Bereich
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const CategoryManager = lazy(() => import('./components/Admin/CategoryManager'));
const ProductManager = lazy(() => import('./components/Admin/ProductManager'));

// ✅ Route-based Code Splitting
<Route path="/admin/*" element={
  <Suspense fallback={<LoadingSpinner />}>
    <AdminRoutes />
  </Suspense>
} />
```

### 6.2 Rendering Performance

#### 🔴 Unnötige Re-Renders

**Problem: Context Updates triggern alle Consumer**
```typescript
// ❌ PROBLEM: Jede Language-Änderung rendert alle Komponenten neu
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n, t } = useTranslation();
  const [language, setLanguageState] = useState<Language>('de');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
  };

  // ❌ Jede State-Änderung erstellt neues Context-Value-Object
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// ✅ LÖSUNG: useMemo für Context Value
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n, t } = useTranslation();
  const [language, setLanguageState] = useState<Language>('de');

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
  }, [i18n]);

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
```

### 6.3 Memory Leaks

#### ⚠️ Potenzielle Memory Leaks

**Problem: Event Listeners nicht cleanup**
```typescript
// ❌ QRCodeModal.tsx
useEffect(() => {
  if (!isOpen) {
    setShowQR(false);
    setActiveTab('wifi');
  }
  // ❌ Kein Cleanup wenn Modal geschlossen wird während QR generiert wird
}, [isOpen]);

// ✅ LÖSUNG: AbortController verwenden
const handleGenerateWiFiQR = async () => {
  const controller = new AbortController();

  try {
    const qrData = await generateWiFiQR(
      wifiCredentials.ssid,
      wifiCredentials.password,
      wifiCredentials.security,
      { signal: controller.signal }  // ✅ Abortable
    );
    setWifiQR(qrData.qrCode);
    setShowQR(true);
  } catch (error) {
    if (error.name === 'AbortError') return;  // ✅ Ignoriere aborts
    console.error('Failed to generate WiFi QR:', error);
  }

  return () => controller.abort();  // ✅ Cleanup
};
```

---

## 7. Error Handling & Boundaries

### 7.1 Error Boundary Implementation

#### ✅ Gut implementiert:

**ErrorBoundary.tsx:**
```typescript
// ✅ Vollständige Error Boundary mit:
// - Error State Management
// - Error Logging (Dev & Prod)
// - Custom Fallback UI
// - Retry Mechanism
// - Unique Error IDs für Tracking

class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary Caught Error [${this.state.errorId}]`);
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRefresh = () => {
    this.setState({ hasError: false, error: undefined });
  };
}
```

#### ⚠️ Fehlende Error Boundaries

**Problem: Nicht alle Routen geschützt**
```typescript
// ❌ Admin Routes ohne Error Boundary
<Route path="/admin" element={<AdminDashboard />} />
<Route path="/admin/categories" element={<CategoryManager />} />

// ✅ LÖSUNG: Error Boundaries um kritische Bereiche
<Route path="/admin/*" element={
  <ErrorBoundary
    fallback={<AdminErrorFallback />}
    onError={(error) => logToErrorService(error)}
  >
    <AdminRoutes />
  </ErrorBoundary>
} />
```

### 7.2 API Error Handling

#### 🔴 Inkonsistentes Error Handling

```typescript
// ❌ PROBLEM: Unterschiedliche Error Patterns
// CategoryManager.tsx
try {
  const response = await fetch(url);
  const result = await response.json();
  if (response.ok && result.success) {
    // success
  } else {
    alert(`Fehler: ${result.error || 'Unbekannter Fehler'}`);
  }
} catch (error) {
  console.error('Error:', error);
  alert('Netzwerkfehler');
}

// SubcategoryManager.tsx
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Request failed');
  }
  const data = await response.json();
  // success
} catch (error) {
  showErrorNotification(error.message);
}

// ProductManager.tsx
apiCall()
  .then(data => handleSuccess(data))
  .catch(error => handleError(error));

// ✅ LÖSUNG: Einheitlicher Error Handler
// src/utils/errorHandler.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: unknown): never => {
  if (error instanceof ApiError) {
    // Unterschiedliches Handling basierend auf Status
    switch (error.status) {
      case 401:
        // Redirect to login
        window.location.href = '/admin/login';
        break;
      case 403:
        showNotification('Keine Berechtigung', 'error');
        break;
      case 404:
        showNotification('Ressource nicht gefunden', 'error');
        break;
      case 500:
        showNotification('Serverfehler', 'error');
        logToErrorService(error);
        break;
      default:
        showNotification(error.message, 'error');
    }
  } else if (error instanceof TypeError) {
    showNotification('Netzwerkfehler', 'error');
  } else {
    showNotification('Unbekannter Fehler', 'error');
    console.error(error);
  }

  throw error;
};

// ✅ Verwendung
try {
  const result = await apiClient.deleteCategory(categoryId);
  handleSuccess(result);
} catch (error) {
  handleApiError(error);
}
```

---

## 8. Testing Analysis

### 8.1 Test Coverage

#### 🔴 KRITISCH: Keine Component Tests

```bash
# Gefundene Tests:
/src/tests/TobaccoCatalog.test.tsx
/src/tests/integration/tobacco-workflow.test.tsx

# Component-Verzeichnis:
0 Test-Dateien in /src/components/
```

**FEHLENDE Tests für kritische Komponenten:**
- CategoryManager (1,163 Zeilen) - 0 Tests
- SubcategoryManager (1,419 Zeilen) - 0 Tests
- ProductManagerContainer (1,047 Zeilen) - 0 Tests
- MenusOverview (1,036 Zeilen) - 0 Tests
- QRCodeModal (915 Zeilen) - 0 Tests

#### EMPFOHLENE Test-Strategie:

**1. Unit Tests für Business Logic:**
```typescript
// src/hooks/__tests__/useCategoryOperations.test.ts
describe('useCategoryOperations', () => {
  it('should create category with multilingual names', async () => {
    const { result } = renderHook(() => useCategoryOperations());

    const categoryData = {
      name: { de: 'Getränke', da: 'Drikkevarer', en: 'Drinks' },
      icon: 'fa-glass'
    };

    await act(async () => {
      await result.current.createCategory(categoryData);
    });

    expect(result.current.categories).toContainEqual(
      expect.objectContaining({ name: categoryData.name })
    );
  });

  it('should handle API errors gracefully', async () => {
    const { result } = renderHook(() => useCategoryOperations());

    mockApiClient.createCategory.mockRejectedValue(
      new ApiError(500, 'Server Error')
    );

    await expect(
      result.current.createCategory({})
    ).rejects.toThrow('Server Error');
  });
});
```

**2. Integration Tests für Komponenten:**
```typescript
// src/components/Admin/__tests__/CategoryManager.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryManager from '../CategoryManager';

describe('CategoryManager', () => {
  beforeEach(() => {
    mockApiClient.getCategories.mockResolvedValue([
      { id: '1', name: { de: 'Test', da: 'Test', en: 'Test' } }
    ]);
  });

  it('should render category list', async () => {
    render(<CategoryManager />);

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  it('should open modal when clicking add button', async () => {
    render(<CategoryManager />);

    const addButton = screen.getByText('Neue Kategorie hinzufügen');
    fireEvent.click(addButton);

    expect(screen.getByText('Neue Kategorie')).toBeInTheDocument();
  });

  it('should validate form before submitting', async () => {
    render(<CategoryManager />);

    // Open modal
    fireEvent.click(screen.getByText('Neue Kategorie hinzufügen'));

    // Try to save without filling required fields
    const saveButton = screen.getByText('Speichern');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Name ist erforderlich/i)).toBeInTheDocument();
    });
  });
});
```

**3. Accessibility Tests:**
```typescript
// src/components/Menu/__tests__/QRCodeModal.a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import QRCodeModal from '../QRCodeModal';

expect.extend(toHaveNoViolations);

describe('QRCodeModal Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <QRCodeModal
        isOpen={true}
        onClose={() => {}}
        language="de"
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should be keyboard navigable', () => {
    render(
      <QRCodeModal
        isOpen={true}
        onClose={() => {}}
        language="de"
      />
    );

    // Tab through elements
    userEvent.tab();
    expect(screen.getByText('WiFi')).toHaveFocus();

    userEvent.tab();
    expect(screen.getByText('Menü')).toHaveFocus();
  });
});
```

---

## 9. Security Analysis

### 9.1 XSS Vulnerabilities

#### ✅ Gut: React's Auto-Escaping

React escaped automatisch alle Werte in JSX, aber:

#### ⚠️ Potenzielle Risiken:

**1. Dynamisches HTML (dangerouslySetInnerHTML):**
```typescript
// ⚠️ Prüfen ob irgendwo verwendet wird
grep -r "dangerouslySetInnerHTML" src/
// Ergebnis: Keine Verwendung gefunden ✅
```

**2. URL Injection:**
```typescript
// ❌ PROBLEM: Unvalidierte URLs
const menuBaseUrl = menuBaseUrl || window.location.origin;
const qrData = await generateMenuQR(tableId, menuBaseUrl);

// ✅ LÖSUNG: URL Validierung
const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    // Nur HTTPS erlauben (oder HTTP in Development)
    if (parsed.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
      throw new Error('Only HTTPS URLs allowed in production');
    }
    return parsed.toString();
  } catch {
    return process.env.REACT_APP_DEFAULT_URL || 'https://safira-lounge.de';
  }
};
```

### 9.2 Authentication & Authorization

#### 🔴 KRITISCH: Token Storage in localStorage

```typescript
// ❌ PROBLEM: JWT in localStorage
localStorage.setItem('adminToken', jwtToken);
localStorage.setItem('adminUser', JSON.stringify(userData));

// RISIKO:
// - XSS kann Token stehlen
// - Token nicht automatisch gelöscht bei Browser-Schließung
```

**EMPFEHLUNG:**
```typescript
// ✅ LÖSUNG: HTTP-Only Cookies (Backend-Änderung erforderlich)
// Backend setzt Cookie:
res.cookie('authToken', jwtToken, {
  httpOnly: true,    // Nicht von JS zugreifbar
  secure: true,      // Nur über HTTPS
  sameSite: 'strict', // CSRF Protection
  maxAge: 15 * 60 * 1000 // 15 Minuten
});

// Frontend:
// - Kein manuelles Token-Handling
// - Cookies werden automatisch bei Requests mitgesendet
// - Token nicht von JavaScript zugreifbar

// ODER: SessionStorage als Zwischenlösung
// Wird automatisch beim Schließen des Tabs gelöscht
sessionStorage.setItem('adminToken', jwtToken);
```

### 9.3 CSRF Protection

#### ⚠️ Fehlende CSRF Protection

```typescript
// ❌ Keine CSRF Tokens in Formularen
const handleSaveCategory = async () => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      // ❌ Kein CSRF Token
    },
    body: JSON.stringify(categoryData)
  });
};

// ✅ LÖSUNG: CSRF Token aus Meta-Tag
<meta name="csrf-token" content="${csrfToken}">

const getCsrfToken = (): string => {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (!token) throw new Error('CSRF token not found');
  return token;
};

const apiClient = {
  post: async (url: string, data: any) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken(),  // ✅ CSRF Protection
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });
  }
};
```

---

## 10. Detaillierte Refactoring-Empfehlungen

### Priority 1: CRITICAL (Sofort angehen)

#### 1.1 Komponenten aufspalten (Est: 40h)

**SubcategoryManager.tsx (1,419 Zeilen → ~800 Zeilen gesamt):**
```
Phase 1 (8h): Extrahiere Form-Komponenten
  - SubcategoryForm.tsx
  - SubcategoryFormFields.tsx
  - ImageUploadField.tsx

Phase 2 (8h): Extrahiere Custom Hooks
  - useSubcategoryOperations.ts (CRUD)
  - useProductSelection.ts
  - useSubcategoryValidation.ts

Phase 3 (4h): Refactor zu Container/Presenter
  - SubcategoryManagerContainer.tsx (Logik)
  - SubcategoryList.tsx (Präsentation)
  - SubcategoryCard.tsx (Präsentation)
```

**CategoryManager.tsx (1,163 Zeilen → ~600 Zeilen gesamt):**
```
Phase 1 (6h): State Management mit useReducer
Phase 2 (6h): Custom Hooks extrahieren
Phase 3 (4h): Komponenten aufspalten
```

#### 1.2 Type Safety verbessern (Est: 16h)

```
Phase 1 (8h): Alle 'any' Types ersetzen
  - Zentrale Type-Definitionen erstellen
  - Product, Category, User Types konsolidieren
  - API Response Types definieren

Phase 2 (4h): Strict Type Guards
  - Type predicates für Runtime Checks
  - Zod oder Yup für Validation

Phase 3 (4h): Generic Types für wiederverwendbare Komponenten
```

#### 1.3 Test Coverage aufbauen (Est: 24h)

```
Phase 1 (8h): Critical Path Tests
  - AuthContext
  - CategoryManager CRUD
  - ProductManager CRUD

Phase 2 (8h): Component Tests
  - Menu Components
  - Form Components
  - Modal Components

Phase 3 (8h): Integration Tests
  - User Workflows
  - API Integration
```

### Priority 2: HIGH (Nächste 2 Wochen)

#### 2.1 Performance Optimierung (Est: 12h)

```
Phase 1 (4h): Code Splitting
  - Route-based splitting
  - Component lazy loading
  - Vendor chunk optimization

Phase 2 (4h): Memoization
  - useMemo für teure Berechnungen
  - useCallback für Callbacks
  - React.memo für häufig re-rendernde Components

Phase 3 (4h): Bundle Size Reduction
  - Tree-shaking für react-icons
  - Unused dependencies entfernen
  - Dynamic imports
```

#### 2.2 Error Handling standardisieren (Est: 8h)

```
Phase 1 (4h): API Error Handler
  - Zentrale Error Classes
  - Error Interceptor
  - Error Notification System

Phase 2 (4h): Error Boundaries erweitern
  - Granulare Error Boundaries
  - Error Recovery Strategies
  - Error Reporting Integration
```

### Priority 3: MEDIUM (Nächster Sprint)

#### 3.1 State Management verbessern (Est: 16h)

```
Phase 1 (6h): useReducer für komplexe State
  - CategoryManager
  - ProductManager
  - FormState Management

Phase 2 (6h): Context Optimization
  - Context Splitting
  - useMemo für Context Values
  - Custom Hooks für Context

Phase 3 (4h): Props Drilling eliminieren
  - Context für gemeinsame Props
  - Composition Pattern
```

#### 3.2 Code Duplication entfernen (Est: 12h)

```
Phase 1 (6h): API Client refactoring
  - Zentraler API Client
  - Request/Response Interceptors
  - Error Handling

Phase 2 (6h): Shared Components
  - Form Components
  - Modal Components
  - Button Components
```

### Priority 4: LOW (Backlog)

#### 4.1 Accessibility verbessern (Est: 8h)

```
- ARIA Labels ergänzen
- Keyboard Navigation testen
- Screen Reader Tests
- Color Contrast prüfen
```

#### 4.2 Documentation (Est: 16h)

```
- Component Documentation
- API Documentation
- Architecture Documentation
- Contributing Guidelines
```

---

## 11. Konkrete Code-Beispiele für Refactorings

### 11.1 CategoryManager Refactoring

**VORHER: CategoryManager.tsx (1,163 Zeilen)**

**NACHHER: Modulare Struktur**

```typescript
// src/features/categories/CategoryManager/index.tsx (150 Zeilen)
import { useCategoryOperations } from './hooks/useCategoryOperations';
import { useCategoryEditor } from './hooks/useCategoryEditor';
import { CategoryList } from './components/CategoryList';
import { CategoryEditorModal } from './components/CategoryEditorModal';

export const CategoryManager: React.FC = () => {
  const {
    categories,
    loading,
    error,
    refreshCategories
  } = useCategoryOperations();

  const {
    isEditing,
    editingCategory,
    openEditor,
    closeEditor,
    handleSave
  } = useCategoryEditor(refreshCategories);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <>
      <CategoryList
        categories={categories}
        onEdit={openEditor}
        onAdd={() => openEditor(null)}
      />

      <CategoryEditorModal
        isOpen={isEditing}
        category={editingCategory}
        onClose={closeEditor}
        onSave={handleSave}
      />
    </>
  );
};

// src/features/categories/CategoryManager/hooks/useCategoryOperations.ts (120 Zeilen)
export const useCategoryOperations = () => {
  const [state, dispatch] = useReducer(categoryReducer, initialState);

  const loadCategories = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });

    try {
      const data = await categoryApi.getAll();
      dispatch({ type: 'LOAD_SUCCESS', categories: data });
    } catch (error) {
      dispatch({ type: 'LOAD_ERROR', error });
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories: state.categories,
    loading: state.loading,
    error: state.error,
    refreshCategories: loadCategories
  };
};

// src/features/categories/CategoryManager/hooks/useCategoryEditor.ts (100 Zeilen)
export const useCategoryEditor = (onSaveSuccess: () => void) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const openEditor = useCallback((category: Category | null) => {
    setEditingCategory(category);
    setIsEditing(true);
  }, []);

  const closeEditor = useCallback(() => {
    setIsEditing(false);
    setEditingCategory(null);
  }, []);

  const handleSave = useCallback(async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, data);
      } else {
        await categoryApi.create(data);
      }

      closeEditor();
      onSaveSuccess();
      showNotification('Kategorie gespeichert', 'success');
    } catch (error) {
      handleApiError(error);
    }
  }, [editingCategory, closeEditor, onSaveSuccess]);

  return {
    isEditing,
    editingCategory,
    openEditor,
    closeEditor,
    handleSave
  };
};

// src/features/categories/CategoryManager/components/CategoryList.tsx (120 Zeilen)
interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onAdd: () => void;
}

export const CategoryList: React.FC<CategoryListProps> = React.memo(({
  categories,
  onEdit,
  onAdd
}) => {
  const mainCategories = useMemo(
    () => categories.filter(cat => cat.isMainCategory),
    [categories]
  );

  return (
    <Container>
      <Header>
        <Title>Kategorien</Title>
        <AddButton onClick={onAdd}>
          <PlusIcon /> Neue Kategorie
        </AddButton>
      </Header>

      <CardGrid>
        {mainCategories.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={() => onEdit(category)}
          />
        ))}
      </CardGrid>
    </Container>
  );
});

// src/features/categories/CategoryManager/components/CategoryEditorModal.tsx (200 Zeilen)
interface CategoryEditorModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<void>;
}

export const CategoryEditorModal: React.FC<CategoryEditorModalProps> = ({
  isOpen,
  category,
  onClose,
  onSave
}) => {
  const { formData, handleChange, validateForm } = useCategoryForm(category);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        {category ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
      </ModalHeader>

      <CategoryForm
        data={formData}
        onChange={handleChange}
      />

      <ModalActions>
        <Button variant="secondary" onClick={onClose}>
          Abbrechen
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? 'Speichert...' : 'Speichern'}
        </Button>
      </ModalActions>
    </Modal>
  );
};
```

**Vorteile des Refactorings:**
- ✅ Komponente von 1,163 → 150 Zeilen (87% Reduktion)
- ✅ Logik in wiederverwendbare Hooks extrahiert
- ✅ Klare Separation of Concerns
- ✅ Einfacher zu testen (jeder Hook isoliert testbar)
- ✅ Bessere Code-Lesbarkeit
- ✅ Einfachere Wartung

### 11.2 API Client Refactoring

**VORHER: Duplicate API Calls überall**

**NACHHER: Zentraler Type-Safe API Client**

```typescript
// src/services/api/client.ts
import { z } from 'zod';

// Response Schemas mit Zod
const CategorySchema = z.object({
  id: z.string(),
  name: z.object({
    de: z.string(),
    da: z.string(),
    en: z.string()
  }),
  description: z.object({
    de: z.string(),
    da: z.string(),
    en: z.string()
  }).optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  isMainCategory: z.boolean().optional(),
  items: z.array(z.any()).optional()
});

const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional()
});

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL ||
      'http://test.safira-lounge.de/safira-api-fixed.php';
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('adminToken');
  }

  private getHeaders(): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });

    const token = this.getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private async request<T>(
    action: string,
    options: RequestInit = {},
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(this.baseURL);
    url.searchParams.set('action', action);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        response.status,
        errorText || `HTTP ${response.status}`,
        null
      );
    }

    const data = await response.json();

    // Validate response with Zod
    const validated = ApiResponseSchema.parse(data);

    if (!validated.success) {
      throw new ApiError(
        400,
        validated.error || 'Request failed',
        validated.data
      );
    }

    return validated.data as T;
  }

  // Type-safe methods
  async get<T>(action: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(action, { method: 'GET' }, params);
  }

  async post<T>(
    action: string,
    body: any,
    params?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(
      action,
      {
        method: 'POST',
        body: JSON.stringify(body)
      },
      params
    );
  }

  async delete<T>(action: string, id: string): Promise<T> {
    return this.request<T>(
      action,
      { method: 'POST' },
      { id }
    );
  }
}

export const apiClient = new ApiClient();

// src/services/api/category.api.ts
import { z } from 'zod';
import { apiClient } from './client';

const CategoryArraySchema = z.array(CategorySchema);

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const data = await apiClient.get('get_categories');
    return CategoryArraySchema.parse(data);
  },

  getById: async (id: string): Promise<Category> => {
    const data = await apiClient.get('get_category', { id });
    return CategorySchema.parse(data);
  },

  create: async (category: Omit<Category, 'id'>): Promise<Category> => {
    const data = await apiClient.post('create_main_category', category);
    return CategorySchema.parse(data);
  },

  update: async (id: string, category: Partial<Category>): Promise<Category> => {
    const data = await apiClient.post(
      'update_main_category',
      category,
      { id }
    );
    return CategorySchema.parse(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete('delete_main_category', id);
  }
};

// Verwendung in Components/Hooks
import { categoryApi } from '@/services/api/category.api';

const useCategoryOperations = () => {
  const loadCategories = async () => {
    try {
      const categories = await categoryApi.getAll();
      // categories ist type-safe: Category[]
      setCategories(categories);
    } catch (error) {
      handleApiError(error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoryApi.delete(id);
      await loadCategories();
      showNotification('Kategorie gelöscht', 'success');
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        showNotification(
          'Kategorie enthält noch Produkte und kann nicht gelöscht werden',
          'error'
        );
      } else {
        handleApiError(error);
      }
    }
  };

  return { loadCategories, deleteCategory };
};
```

**Vorteile:**
- ✅ Type-safe API Calls mit Zod Validation
- ✅ Zentrales Error Handling
- ✅ DRY - keine Duplicate API Logic
- ✅ Einfache Mock-Erstellung für Tests
- ✅ Request/Response Interceptors möglich

---

## 12. Geschätzte Umsetzung

### Gesamtübersicht

| Kategorie | Aufwand (Stunden) | Priorität |
|-----------|-------------------|-----------|
| Component Refactoring | 40 | CRITICAL |
| Type Safety | 16 | CRITICAL |
| Test Coverage | 24 | CRITICAL |
| Performance | 12 | HIGH |
| Error Handling | 8 | HIGH |
| State Management | 16 | MEDIUM |
| Code Duplication | 12 | MEDIUM |
| Accessibility | 8 | LOW |
| Documentation | 16 | LOW |
| **TOTAL** | **152 Stunden** | |

### Sprint-Plan (2-Wochen-Sprints)

**Sprint 1 (CRITICAL Priority):**
- SubcategoryManager Refactoring (16h)
- CategoryManager Refactoring (16h)
- Type Safety - Phase 1 (8h)

**Sprint 2 (CRITICAL Priority):**
- ProductManagerContainer Refactoring (12h)
- Type Safety - Phase 2+3 (8h)
- Test Coverage - Phase 1 (8h)

**Sprint 3 (HIGH Priority):**
- Test Coverage - Phase 2+3 (16h)
- Performance - Phase 1+2 (8h)

**Sprint 4 (HIGH/MEDIUM Priority):**
- Performance - Phase 3 (4h)
- Error Handling (8h)
- State Management - Phase 1 (6h)

**Sprint 5 (MEDIUM Priority):**
- State Management - Phase 2+3 (10h)
- Code Duplication (12h)

**Sprint 6 (LOW Priority):**
- Accessibility (8h)
- Documentation (16h)

---

## 13. Zusammenfassung & Nächste Schritte

### Kritische Probleme (Sofort angehen):

1. **Component Size**: 3 Komponenten >1000 Zeilen → Refactoring auf <300 Zeilen
2. **Type Safety**: 82 'any' Verwendungen → Alle durch proper Types ersetzen
3. **Test Coverage**: 0% → Mindestens 60% für kritische Pfade
4. **Props Drilling**: Excessive nesting → Context oder Composition Pattern

### Empfohlene Reihenfolge:

**Woche 1-2:**
1. SubcategoryManager refactoren (höchste Komplexität)
2. Type Safety für API Responses
3. Erste Tests für kritische Flows

**Woche 3-4:**
4. CategoryManager refactoren
5. Zentrale API Client erstellen
6. Component Tests erweitern

**Woche 5-6:**
7. Performance Optimierungen
8. Error Handling standardisieren
9. State Management mit useReducer

### Erfolgskriterien:

✅ **Keine Komponente >500 Zeilen**
✅ **0 'any' Types in Production Code**
✅ **>60% Test Coverage für kritische Komponenten**
✅ **Zentraler, type-safe API Client**
✅ **Konsistentes Error Handling**
✅ **<2s Initial Load Time**
✅ **Accessibility Score >90%**

### Tools & Setup:

```bash
# ESLint für Type Checking
npm install --save-dev @typescript-eslint/eslint-plugin

# Testing Setup
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event jest-axe

# Zod für Runtime Validation
npm install zod

# Bundle Analysis
npm install --save-dev webpack-bundle-analyzer
```

### Monitoring & Metriken:

- Bundle Size vor/nach Optimierung tracken
- Test Coverage Reports generieren
- Performance Metrics (Lighthouse) vor/nach
- TypeScript Strict Mode schrittweise aktivieren

---

**Erstellt am:** 2025-10-04
**Nächste Review:** Nach Sprint 2
**Verantwortlich:** Development Team

