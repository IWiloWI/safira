/**
 * Main ProductManager orchestration component
 * Coordinates all product management functionality with improved architecture
 */

import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaLeaf, FaEuroSign, FaTimes, FaSave, FaLanguage, FaSync } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  ResponsivePageTitle,
  ResponsiveMainContent,
  ResponsiveCardGrid,
  ResponsiveCard,
  ResponsiveButton,
  ResponsiveFormGroup,
  ResponsiveLabel,
  ResponsiveInput,
  ResponsiveLoadingContainer,
  ResponsiveEmptyState
} from '../../styles/AdminLayout';
import { Product, Category, TobaccoCatalog } from '../../types/product.types';
import { useProducts } from '../../hooks/useProducts';
// Removed useCategories import - now loading categories directly
import { useBulkOperations } from '../../hooks/useBulkOperations';
import ProductErrorBoundary from '../Common/ProductErrorBoundary';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import BulkActions from './BulkActions';
import ProductTypeSelector from './ProductTypeSelector';
import MenuContentsEditor from './MenuContentsEditor';
import api, { getTobaccoCatalog, addBrandToCatalog, addTobaccoToCatalog, updateProductTranslations, bulkUpdateTobaccoPrice, updateProductSubcategory, translateText } from '../../services/api';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
`;

const TitleSection = styled.div``;

const Title = styled.h1`
  font-family: 'Oswald', sans-serif;
  font-size: 2.5rem;
  color: #FF41FB;
  text-transform: uppercase;
  margin-bottom: 10px;
  text-shadow: 0 0 20px rgba(255, 65, 251, 0.8);
`;

const Subtitle = styled.p`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
`;

const ActionButton = styled(motion.button)<{ variant?: 'primary' | 'success' | 'warning' }>`
  padding: 12px 25px;
  background: ${props => {
    if (props.variant === 'success') return 'linear-gradient(135deg, #4CAF50, #45a049)';
    if (props.variant === 'warning') return 'linear-gradient(135deg, #FF9800, #f57c00)';
    return 'linear-gradient(135deg, #FF41FB, #ff21f5)';
  }};
  border: none;
  border-radius: 10px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    box-shadow: 0 5px 20px rgba(255, 65, 251, 0.4);
    transform: translateY(-2px);
  }
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: rgba(255, 65, 251, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 20px;
  padding: 30px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  backdrop-filter: blur(15px);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const ModalTitle = styled.h2`
  font-family: 'Oswald', sans-serif;
  color: #FF41FB;
  font-size: 1.8rem;
  text-transform: uppercase;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    color: #FF41FB;
    background: rgba(255, 65, 251, 0.1);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-family: 'Aldrich', sans-serif;
  color: #FF41FB;
  font-size: 0.9rem;
  margin-bottom: 8px;
  text-transform: uppercase;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 10px;
  color: white;
  font-family: 'Aldrich', sans-serif;

  &:focus {
    outline: none;
    border-color: #FF41FB;
    box-shadow: 0 0 15px rgba(255, 65, 251, 0.3);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 10px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  min-height: 80px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #FF41FB;
    box-shadow: 0 0 15px rgba(255, 65, 251, 0.3);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
`;

const Button = styled(motion.button)<{ variant?: 'secondary' }>`
  padding: 12px 25px;
  background: ${props => props.variant === 'secondary' 
    ? 'transparent' 
    : 'linear-gradient(135deg, #FF41FB, #ff21f5)'};
  border: 2px solid #FF41FB;
  border-radius: 10px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    box-shadow: 0 5px 20px rgba(255, 65, 251, 0.4);
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const NotificationContainer = styled(motion.div)<{ type: 'success' | 'error' }>`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  background: ${props => props.type === 'success' 
    ? 'linear-gradient(135deg, #4CAF50, #45a049)' 
    : 'linear-gradient(135deg, #dc3545, #c82333)'};
  color: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ProductManagerContainer: React.FC = () => {
  const { t, language } = useLanguage();

  // State management
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [showProductTypeSelector, setShowProductTypeSelector] = useState(false); // NEW: Product type selection
  const [showProductForm, setShowProductForm] = useState(false);
  const [showMenuContentsEditor, setShowMenuContentsEditor] = useState(false); // NEW: Menu contents editor
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<'regular' | 'tobacco' | 'menu-package'>('regular'); // NEW: Selected product type
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [bulkPrice, setBulkPrice] = useState('15.00');
  const [translationField, setTranslationField] = useState<'name' | 'description'>('name');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [activeLanguages, setActiveLanguages] = useState<Array<{code: string, name: string, flag: string}>>([]);
  const [tobaccoCatalog, setTobaccoCatalog] = useState<TobaccoCatalog>({ brands: [], tobaccos: [] });
  const [selectedBrand, setSelectedBrand] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });

  // Load categories with both main categories and subcategories
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const getCategoryName = useCallback((nameObj: any) => {
    if (typeof nameObj === 'string') return nameObj;
    return nameObj[language] || nameObj['de'] || String(nameObj);
  }, [language]);

  // OLD HARDCODED FUNCTION - REPLACED WITH MANUAL TOBACCO FLAG
  // This function is no longer used as tobacco detection is now handled via the manual
  // tobacco checkbox in the product form (isTobacco flag)
  /*
  const isShishaOrTobaccoCategory = useCallback((categoryId: string): boolean => {
    const tobaccoCategoryIds = [
      'shisha-standard',
      'shisha',
      'tabak',
      'tobacco',
      '1', // Shisha Tabak main category
      'subcat_4', // Fruchtig subcategory
      'subcat_5', // Minzig subcategory
    ];

    // Also check by category name/description for flexibility
    const category = subcategories.find(cat => cat.id === categoryId);
    if (category) {
      const categoryName = getCategoryName(category.name).toLowerCase();
      const tobaccoKeywords = ['shisha', 'tabak', 'tobacco', 'wasserpfeife'];
      const hasKeyword = tobaccoKeywords.some(keyword => categoryName.includes(keyword));

      return tobaccoCategoryIds.includes(categoryId) || hasKeyword;
    }

    return tobaccoCategoryIds.includes(categoryId);
  }, [subcategories, getCategoryName]);
  */

  // Custom hooks
  const {
    products,
    filteredProducts,
    isLoading,
    error,
    loadProducts,
    createProduct,
    updateProductData,
    removeProduct,
    toggleAvailability,
    toggleBadge,
    bulkUpdatePrices,
    getProductName,
    getProductDescription,
    renderPrice
  } = useProducts(language);

  // Load active languages from navigation settings
  const loadActiveLanguages = async () => {
    try {
      const response = await api.get('?action=get_active_languages');
      if (response.data.success && response.data.data.active_languages) {
        setActiveLanguages(response.data.data.active_languages);
      }
    } catch (error) {
      console.error('Failed to load active languages:', error);
      // Fallback to default languages
      setActiveLanguages([
        {code: 'de', name: 'Deutsch', flag: '🇩🇪'},
        {code: 'en', name: 'English', flag: '🇬🇧'},
        {code: 'da', name: 'Dansk', flag: '🇩🇰'}
      ]);
    }
  };


  // Load tobacco catalog
  React.useEffect(() => {
    const loadTobaccoCatalog = async () => {
      try {
        const catalog = await getTobaccoCatalog();
        setTobaccoCatalog(catalog);
      } catch (error) {
        console.error('Failed to load tobacco catalog:', error);
      }
    };
    loadTobaccoCatalog();
  }, []);

  // Show notification
  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 4000);
  }, []);

  // Load categories using SubcategoryManager pattern
  const loadCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      const token = localStorage.getItem('adminToken');
      
      // Use the correct PHP API endpoint
      const API_URL = process.env.REACT_APP_API_URL || 'https://test.safira-lounge.de/safira-api-fixed.php';
      const mainCategoriesResponse = await fetch(`${API_URL}?action=products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      });
      
      if (mainCategoriesResponse.ok) {
        const data = await mainCategoriesResponse.json();
        const allCategories = data.categories || [];

        // Separate main categories and subcategories
        const mainCategories: any[] = [];
        const allSubcategories: any[] = [];
        const seenIds = new Set<string>();

        allCategories.forEach((cat: any) => {
          if (cat.isMainCategory === true) {
            // Normalize subcategory IDs to have "subcat_" prefix for consistency with API
            const normalizedSubcategories = (cat.subcategories || []).map((subcat: any) => ({
              ...subcat,
              id: `subcat_${subcat.id}`
            }));

            // Store main category with normalized subcategories
            mainCategories.push({
              ...cat,
              subcategories: normalizedSubcategories
            });

            // Also extract subcategories for ProductList filtering
            normalizedSubcategories.forEach((subcat: any) => {
              if (!seenIds.has(subcat.id)) {
                seenIds.add(subcat.id);
                allSubcategories.push({
                  ...subcat,
                  parentCategoryId: cat.id,
                  parentCategoryName: cat.name
                });
              }
            });
          } else if (cat.isMainCategory === false) {
            // Standalone subcategory (shouldn't happen with fixed API, but handle it)
            const subcatId = cat.id.toString();
            if (!seenIds.has(subcatId)) {
              seenIds.add(subcatId);
              allSubcategories.push(cat);
            }
          }
        });

        console.log('[ProductManagerContainer] Main categories loaded:', mainCategories);
        console.log('[ProductManagerContainer] All subcategories loaded (deduplicated):', allSubcategories);

        setCategories(mainCategories); // Store main categories with nested subcategories
        setSubcategories(allSubcategories); // Store flat subcategories for filtering
        showNotification('Kategorien geladen', 'success');
      } else {
        console.error('Failed to load categories:', mainCategoriesResponse.status);
        showNotification('Fehler beim Laden der Kategorien', 'error');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      showNotification('Fehler beim Laden der Kategorien', 'error');
    } finally {
      setIsLoadingCategories(false);
    }
  }, [showNotification]);

  // Load categories on component mount
  React.useEffect(() => {
    loadCategories();
    loadActiveLanguages();
  }, [loadCategories]);

  // Product form handlers
  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductTypeSelector(true); // Show type selector first
  };

  // Handle product type selection
  const handleProductTypeSelection = (type: 'regular' | 'tobacco' | 'menu-package') => {
    setSelectedProductType(type);
    setShowProductTypeSelector(false);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await removeProduct(productToDelete.categoryId!, productToDelete.id);
      // Force reload products to update UI after deletion
      await loadProducts();
      showNotification('Product successfully deleted!', 'success');
    } catch (error) {
      showNotification('Failed to delete product. Please try again.', 'error');
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const handleProductSubmit = async (formData: any, brand?: string) => {
    try {
      // 🔍 DEBUG: Log submission data
      console.log('🔍 CONTAINER DEBUG - handleProductSubmit called:');
      console.log('📦 Form Data received:', formData);
      console.log('🏷️ Brand:', brand);
      console.log('📂 Available subcategories:', subcategories);

      if (editingProduct) {
        console.log('✏️ EDITING existing product:', editingProduct);
        await updateProductData(editingProduct.categoryId!, editingProduct.id, formData);
        showNotification('Product successfully updated!', 'success');
      } else {
        // Use category_id from formData (which is what useProductForm sends)
        const category = formData.category_id || formData.category || subcategories[0]?.id;
        console.log('🆕 CREATING new product with category:', category);
        console.log('📋 Full data being sent to createProduct:', { ...formData, brand });
        await createProduct(category, { ...formData, brand });
        
        // Add to tobacco catalog if tobacco flag is set
        if (formData.isTobacco && brand) {
          try {
            await addTobaccoToCatalog({
              name: typeof formData.name === 'string' ? formData.name : formData.name?.de || '',
              description: typeof formData.description === 'string' ? formData.description : formData.description?.de || '',
              brand,
              price: formData.price || 0
            });
            console.log('✅ Product automatically added to tobacco catalog (manual flag)');
          } catch (catalogError) {
            console.error('❌ Failed to add to tobacco catalog:', catalogError);
            // Don't fail the main product creation if catalog addition fails
          }
        }
        
        showNotification('Product successfully added!', 'success');
      }
      setShowProductForm(false);
      setSelectedBrand('');
      setNewBrand('');
    } catch (error) {
      showNotification('Failed to save product. Please try again.', 'error');
      throw error;
    }
  };

  // Brand management
  const handleAddBrand = async () => {
    if (!newBrand.trim()) return;

    try {
      const brandName = newBrand.trim();
      const result = await addBrandToCatalog(brandName);

      // Update tobacco catalog with new brands list
      setTobaccoCatalog(prev => ({ ...prev, brands: result.brands }));

      // Set the newly added brand as selected
      setSelectedBrand(brandName);

      // Clear the new brand input
      setNewBrand('');

      showNotification(`Brand "${brandName}" was added successfully!`);
    } catch (error) {
      console.error('Failed to add brand:', error);
      showNotification('Failed to add brand', 'error');
    }
  };

  // Category assignment handler
  const handleAssignCategory = async (product: Product, categoryId: string | null) => {
    try {
      if (categoryId && categoryId !== 'unassigned') {
        // Use the new updateProductSubcategory API
        await updateProductSubcategory(product.id, categoryId);
        showNotification('Product assigned to subcategory successfully!', 'success');
      } else {
        // Handle unassigning - set to null subcategory
        await updateProductSubcategory(product.id, '');
        showNotification('Product unassigned from subcategory successfully!', 'success');
      }

      // Reload products to reflect changes
      await loadProducts();
    } catch (error) {
      console.error('Failed to assign category:', error);
      showNotification('Failed to assign category. Please try again.', 'error');
    }
  };

  // Variants/Menu Contents edit handler
  const handleEditVariants = (product: Product) => {
    setEditingProduct(product);

    // Check if product is a menu package
    if (product.isMenuPackage) {
      // Open dedicated menu contents editor for menu packages
      setShowMenuContentsEditor(true);
    } else {
      // Open product form for regular products with variants/sizes
      setShowProductForm(true);
    }
  };

  // Menu Contents editor handlers
  const handleSaveMenuContents = async (menuContents: any[]) => {
    if (!editingProduct) return;

    try {
      await updateProductData(
        editingProduct.categoryId!,
        editingProduct.id,
        { menuContents } as any
      );
      showNotification('Menu contents updated successfully!', 'success');
      setShowMenuContentsEditor(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to update menu contents:', error);
      showNotification('Failed to update menu contents. Please try again.', 'error');
    }
  };

  const handleCloseMenuContentsEditor = () => {
    setShowMenuContentsEditor(false);
    setEditingProduct(null);
  };

  // Translation handlers
  const handleOpenTranslation = (product: Product, field: 'name' | 'description') => {
    setEditingProduct(product);
    setTranslationField(field);

    const currentValue = product[field];
    const newTranslations: Record<string, string> = {};

    // Initialize translations for all active languages
    activeLanguages.forEach(lang => {
      if (typeof currentValue === 'object' && currentValue !== null) {
        newTranslations[lang.code] = (currentValue as any)[lang.code] || '';
      } else {
        newTranslations[lang.code] = lang.code === 'de' ? (currentValue || '') : '';
      }
    });

    setTranslations(newTranslations);
    setShowTranslationModal(true);
  };

  const handleSaveTranslations = async () => {
    if (!editingProduct) return;

    try {
      await updateProductTranslations(
        editingProduct.categoryId!,
        editingProduct.id,
        translationField,
        translations
      );
      await loadProducts();
      setShowTranslationModal(false);
      showNotification('Translations saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save translations:', error);
      showNotification('Failed to save translations. Please try again.', 'error');
    }
  };

  const handleAutoTranslate = async () => {
    if (!editingProduct) return;

    try {
      // Get the German text (source text)
      const sourceText = translations['de'] || '';
      if (!sourceText.trim()) {
        showNotification('Please enter German text first to translate from.', 'error');
        return;
      }

      setNotification({ show: true, message: 'Generating translations...', type: 'success' });

      // Get all target languages (all except German)
      const targetLanguages = activeLanguages
        .filter(lang => lang.code !== 'de')
        .map(lang => lang.code as any); // Type assertion for compatibility with Language type

      // Call the translation API
      const translationResult = await translateText(sourceText, targetLanguages);

      // Update the translations state with ChatGPT results
      const updatedTranslations = { ...translations };
      Object.entries(translationResult).forEach(([langCode, translation]) => {
        if (langCode !== 'de') {
          updatedTranslations[langCode] = translation;
        }
      });

      setTranslations(updatedTranslations);
      showNotification('Automatic translations generated successfully!', 'success');
    } catch (error) {
      console.error('Failed to auto-translate:', error);
      showNotification('Failed to generate translations. Please try again.', 'error');
    }
  };

  // Bulk operations
  const handleBulkPriceUpdate = async () => {
    try {
      const price = parseFloat(bulkPrice);
      if (isNaN(price) || price <= 0) {
        showNotification('Please enter a valid price.', 'error');
        return;
      }

      const result = await bulkUpdateTobaccoPrice('shisha-standard', price);
      showNotification(`${result.updatedCount} tobacco products successfully updated to €${price}!`, 'success');
      setShowBulkPriceModal(false);
    } catch (error) {
      console.error('Failed to update bulk prices:', error);
      showNotification('Failed to update prices. Please try again.', 'error');
    }
  };

  // Memoized values
  const productCount = useMemo(() => products.length, [products]);
  const filteredCount = useMemo(() => filteredProducts.length, [filteredProducts]);

  return (
    <ProductErrorBoundary>
      <ResponsiveMainContent>
        <ResponsivePageTitle style={{ textAlign: 'center', marginBottom: '10px' }}>
          {t('admin.productManagement')}
        </ResponsivePageTitle>
        <p style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontFamily: 'Aldrich, sans-serif',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.1rem'
        }}>
          {filteredCount} von {productCount} Produkten
        </p>

        <div style={{
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '30px'
        }}>
          <ResponsiveButton onClick={handleAddProduct}>
            <FaPlus />
            {t('admin.addProduct')}
          </ResponsiveButton>

          <ResponsiveButton
            onClick={() => {
              console.log('Force refreshing categories...');
              loadCategories();
              // Force reload from server by clearing any cached state
              window.dispatchEvent(new Event('categoriesUpdated'));
              showNotification('Kategorien neu geladen', 'success');
            }}
            title="Kategorieliste neu laden"
          >
            <FaSync />
            Kategorien
          </ResponsiveButton>

          <ResponsiveButton
            onClick={() => window.location.href = '/admin/tobacco-catalog'}
          >
            <FaLeaf />
            Tobacco Catalog
          </ResponsiveButton>

          <ResponsiveButton
            onClick={() => setShowBulkPriceModal(true)}
          >
            <FaEuroSign />
            Bulk Price Update
          </ResponsiveButton>
        </div>

        <ProductList
          products={filteredProducts}
          categories={categories}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onToggleAvailability={toggleAvailability}
          onToggleBadge={toggleBadge}
          onTranslateProduct={handleOpenTranslation}
          onAssignCategory={handleAssignCategory}
          onEditVariants={handleEditVariants}
          getProductName={getProductName}
          getProductDescription={getProductDescription}
          renderPrice={renderPrice}
          isLoading={isLoading}
        />

        {/* Product Type Selection Modal */}
        <AnimatePresence>
          {showProductTypeSelector && (
            <ProductTypeSelector
              isOpen={showProductTypeSelector}
              onClose={() => setShowProductTypeSelector(false)}
              onSelectType={handleProductTypeSelection}
            />
          )}
        </AnimatePresence>

        {/* Product Form Modal */}
        <AnimatePresence>
          {showProductForm && (
            <ProductForm
              isOpen={showProductForm}
              editingProduct={editingProduct}
              categories={categories}
              tobaccoCatalog={tobaccoCatalog}
              selectedBrand={selectedBrand}
              newBrand={newBrand}
              productType={editingProduct ? undefined : selectedProductType} // Pass product type for new products
              onClose={() => {
                setShowProductForm(false);
                setSelectedBrand('');
                setNewBrand('');
              }}
              onSubmit={handleProductSubmit}
              onBrandSelect={setSelectedBrand}
              onNewBrandChange={setNewBrand}
              onAddBrand={handleAddBrand}
              isSubmitting={isLoading}
            />
          )}
        </AnimatePresence>

        {/* Menu Contents Editor Modal */}
        <AnimatePresence>
          {showMenuContentsEditor && editingProduct && (
            <MenuContentsEditor
              product={editingProduct}
              onSave={handleSaveMenuContents}
              onClose={handleCloseMenuContentsEditor}
            />
          )}
        </AnimatePresence>

        {/* Translation Modal */}
        <AnimatePresence>
          {showTranslationModal && (
            <Modal
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.target === e.currentTarget && setShowTranslationModal(false)}
            >
              <ModalContent>
                <ModalHeader>
                  <ModalTitle>
                    <FaLanguage style={{ marginRight: '10px' }} />
                    {translationField === 'name' ? 'Title Translations' : 'Description Translations'}
                  </ModalTitle>
                  <CloseButton onClick={() => setShowTranslationModal(false)}>
                    <FaTimes />
                  </CloseButton>
                </ModalHeader>
                
                {activeLanguages.map(lang => (
                  <FormGroup key={lang.code}>
                    <Label>{lang.flag} {lang.name}</Label>
                    {translationField === 'description' ? (
                      <TextArea
                        value={translations[lang.code] || ''}
                        onChange={(e) => setTranslations(prev => ({ ...prev, [lang.code]: e.target.value }))}
                        placeholder={`${lang.name} translation...`}
                      />
                    ) : (
                      <Input
                        value={translations[lang.code] || ''}
                        onChange={(e) => setTranslations(prev => ({ ...prev, [lang.code]: e.target.value }))}
                        placeholder={`${lang.name} translation...`}
                      />
                    )}
                  </FormGroup>
                ))}

                {/* Auto-translate button */}
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <Button
                    variant="secondary"
                    onClick={handleAutoTranslate}
                    disabled={isLoading || !translations['de']?.trim()}
                    style={{
                      background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                      borderColor: '#4CAF50'
                    }}
                  >
                    <FaLanguage />
                    Auto-Generate Translations
                  </Button>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.8rem',
                    marginTop: '5px',
                    fontFamily: 'Aldrich, sans-serif'
                  }}>
                    Uses ChatGPT to translate German text to other languages
                  </div>
                </div>

                <ModalActions>
                  <Button 
                    variant="secondary"
                    onClick={() => setShowTranslationModal(false)}
                  >
                    <FaTimes />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveTranslations}
                    disabled={isLoading}
                  >
                    <FaSave />
                    {isLoading ? 'Saving...' : 'Save Translations'}
                  </Button>
                </ModalActions>
              </ModalContent>
            </Modal>
          )}
        </AnimatePresence>

        {/* Bulk Price Update Modal */}
        <AnimatePresence>
          {showBulkPriceModal && (
            <Modal
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.target === e.currentTarget && setShowBulkPriceModal(false)}
            >
              <ModalContent>
                <ModalHeader>
                  <ModalTitle>
                    <FaEuroSign style={{ marginRight: '10px' }} />
                    Bulk Price Update for Tobacco Products
                  </ModalTitle>
                  <CloseButton onClick={() => setShowBulkPriceModal(false)}>
                    <FaTimes />
                  </CloseButton>
                </ModalHeader>
                
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontFamily: 'Aldrich, sans-serif',
                  marginBottom: '20px'
                }}>
                  This will update the price for all tobacco products.
                </p>
                
                <FormGroup>
                  <Label>New Price (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    placeholder="15.00"
                  />
                </FormGroup>

                <ModalActions>
                  <Button 
                    variant="secondary"
                    onClick={() => setShowBulkPriceModal(false)}
                  >
                    <FaTimes />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleBulkPriceUpdate}
                    disabled={isLoading}
                  >
                    <FaEuroSign />
                    {isLoading ? 'Updating...' : 'Update Prices'}
                  </Button>
                </ModalActions>
              </ModalContent>
            </Modal>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && productToDelete && (
            <Modal
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}
            >
              <ModalContent>
                <ModalHeader>
                  <ModalTitle>Delete Product</ModalTitle>
                  <CloseButton onClick={() => setShowDeleteModal(false)}>
                    <FaTimes />
                  </CloseButton>
                </ModalHeader>
                
                <p style={{ 
                  color: 'white', 
                  fontSize: '1.1rem', 
                  lineHeight: '1.5',
                  fontFamily: 'Aldrich, sans-serif'
                }}>
                  Are you sure you want to delete the product{' '}
                  <strong style={{ color: '#FF41FB' }}>
                    "{getProductName(productToDelete.name)}"
                  </strong>?
                </p>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  fontSize: '0.9rem', 
                  marginTop: '15px',
                  fontFamily: 'Aldrich, sans-serif'
                }}>
                  This action cannot be undone.
                </p>

                <ModalActions>
                  <Button 
                    variant="secondary" 
                    onClick={() => setShowDeleteModal(false)}
                  >
                    <FaTimes />
                    Cancel
                  </Button>
                  <Button 
                    onClick={confirmDeleteProduct}
                    style={{ 
                      background: 'linear-gradient(135deg, #dc3545, #c82333)',
                      borderColor: '#dc3545' 
                    }}
                    disabled={isLoading}
                  >
                    <FaTimes />
                    {isLoading ? 'Deleting...' : 'Delete'}
                  </Button>
                </ModalActions>
              </ModalContent>
            </Modal>
          )}
        </AnimatePresence>

        {/* Bulk Actions */}
        <BulkActions
          selectedProducts={selectedProducts}
          onBulkPriceUpdate={async (categoryId, newPrice) => {
            const result = await bulkUpdateTobaccoPrice(categoryId, newPrice);
            await loadProducts();
            return result;
          }}
          onBulkDelete={async (products) => {
            for (const product of products) {
              await removeProduct(product.categoryId!, product.id);
            }
          }}
          onBulkToggleAvailability={async (products, available) => {
            for (const product of products) {
              await updateProductData(product.categoryId!, product.id, { available });
            }
          }}
          onClearSelection={() => setSelectedProducts([])}
          showNotification={showNotification}
        />

        {/* Notifications */}
        <AnimatePresence>
          {notification.show && (
            <NotificationContainer
              type={notification.type}
              initial={{ opacity: 0, x: 300, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {notification.type === 'success' ? '✅' : '❌'} {notification.message}
            </NotificationContainer>
          )}
        </AnimatePresence>
      </ResponsiveMainContent>
    </ProductErrorBoundary>
  );
};

export default ProductManagerContainer;