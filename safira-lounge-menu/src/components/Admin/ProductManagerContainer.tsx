/**
 * Main ProductManager orchestration component
 * Coordinates all product management functionality with improved architecture
 */

import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaLeaf, FaEuroSign, FaTimes, FaSave, FaLanguage, FaSync } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { Product, Category, TobaccoCatalog } from '../../types/product.types';
import { useProducts } from '../../hooks/useProducts';
// Removed useCategories import - now loading categories directly
import { useBulkOperations } from '../../hooks/useBulkOperations';
import ProductErrorBoundary from '../Common/ProductErrorBoundary';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import BulkActions from './BulkActions';
import { getTobaccoCatalog, addBrandToCatalog, addTobaccoToCatalog, updateProductTranslations, bulkUpdateTobaccoPrice } from '../../services/api';

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
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [bulkPrice, setBulkPrice] = useState('15.00');
  const [translationField, setTranslationField] = useState<'name' | 'description'>('name');
  const [translations, setTranslations] = useState({ de: '', da: '', en: '', tr: '', it: '' });
  const [tobaccoCatalog, setTobaccoCatalog] = useState<TobaccoCatalog>({ brands: [], tobaccos: [] });
  const [selectedBrand, setSelectedBrand] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });

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

  // Load categories directly using SubcategoryManager pattern instead of useCategories hook
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  
  const getCategoryName = useCallback((nameObj: any) => {
    if (typeof nameObj === 'string') return nameObj;
    return nameObj[language] || nameObj['de'] || String(nameObj);
  }, [language]);

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
      
      // Use exact same pattern as SubcategoryManager (line 684)
      const mainCategoriesResponse = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      });
      
      if (mainCategoriesResponse.ok) {
        const data = await mainCategoriesResponse.json();
        const allCategories = data.categories || [];
        
        console.log('ProductManagerContainer - API Response:', allCategories);
        
        // Filter only subcategories (not main categories) - same as SubcategoryManager
        const subCats = allCategories.filter((cat: any) => cat.isMainCategory !== true);
        console.log('ProductManagerContainer - Filtered subcategories:', subCats);
        
        setSubcategories(subCats);
        console.log('ProductManagerContainer - Final subcategories state:', subCats);
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
  }, [loadCategories]);

  // Product form handlers
  const handleAddProduct = () => {
    setEditingProduct(null);
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
      if (editingProduct) {
        await updateProductData(editingProduct.categoryId!, editingProduct.id, formData);
        showNotification('Product successfully updated!', 'success');
      } else {
        const category = formData.category || subcategories[0]?.id;
        await createProduct(category, { ...formData, brand });
        
        // Add to tobacco catalog if it's a shisha product
        if (category === 'shisha-standard' && brand) {
          try {
            await addTobaccoToCatalog({
              name: formData.name,
              description: formData.description,
              brand,
              price: formData.price || 0
            });
          } catch (catalogError) {
            console.error('Failed to add to tobacco catalog:', catalogError);
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
      const result = await addBrandToCatalog(newBrand.trim());
      setTobaccoCatalog(prev => ({ ...prev, brands: result.brands }));
      setSelectedBrand(newBrand.trim());
      setNewBrand('');
      showNotification(`Brand \"${newBrand.trim()}\" was added successfully!`);
    } catch (error) {
      console.error('Failed to add brand:', error);
      showNotification('Failed to add brand', 'error');
    }
  };

  // Category assignment handler
  const handleAssignCategory = async (product: Product, categoryId: string | null) => {
    try {
      // Find the current category that this product belongs to
      const currentCategory = subcategories.find((cat: Category) => 
        cat.items?.some((item: any) => item.id === product.id)
      );
      
      if (currentCategory) {
        // Update the product's categoryId
        await updateProductData(currentCategory.id, product.id, { 
          categoryId: categoryId || undefined 
        });
        showNotification(
          categoryId 
            ? `Product assigned to category successfully!`
            : `Product unassigned from category successfully!`, 
          'success'
        );
      } else {
        showNotification('Could not find product category. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Failed to assign category:', error);
      showNotification('Failed to assign category. Please try again.', 'error');
    }
  };

  // Translation handlers
  const handleOpenTranslation = (product: Product, field: 'name' | 'description') => {
    setEditingProduct(product);
    setTranslationField(field);
    
    const currentValue = product[field];
    if (typeof currentValue === 'object' && currentValue !== null) {
      setTranslations({
        de: currentValue.de || '',
        da: currentValue.da || '',
        en: currentValue.en || '',
        tr: currentValue.tr || '',
        it: currentValue.it || ''
      });
    } else {
      setTranslations({
        de: typeof currentValue === 'string' ? currentValue : '',
        da: '',
        en: '',
        tr: '',
        it: ''
      });
    }
    
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
      <Container>
        <Header>
          <TitleSection>
            <Title>{t('admin.productManagement')}</Title>
            <Subtitle>{filteredCount} of {productCount} products</Subtitle>
          </TitleSection>
          
          <Controls>
            <ActionButton onClick={handleAddProduct}>
              <FaPlus />
              {t('admin.addProduct')}
            </ActionButton>
            
            <ActionButton 
              variant="primary"
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
            </ActionButton>
            
            <ActionButton 
              variant="success"
              onClick={() => window.location.href = '/admin/tobacco-catalog'}
            >
              <FaLeaf />
              Tobacco Catalog
            </ActionButton>
            
            <ActionButton 
              variant="warning"
              onClick={() => setShowBulkPriceModal(true)}
            >
              <FaEuroSign />
              Bulk Price Update
            </ActionButton>
          </Controls>
        </Header>

        <ProductList
          products={filteredProducts}
          categories={subcategories}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onToggleAvailability={toggleAvailability}
          onToggleBadge={toggleBadge}
          onTranslateProduct={handleOpenTranslation}
          onAssignCategory={handleAssignCategory}
          getProductName={getProductName}
          getProductDescription={getProductDescription}
          renderPrice={renderPrice}
          isLoading={isLoading}
        />

        {/* Product Form Modal */}
        <AnimatePresence>
          {showProductForm && (
            <ProductForm
              isOpen={showProductForm}
              editingProduct={editingProduct}
              categories={subcategories}
              tobaccoCatalog={tobaccoCatalog}
              selectedBrand={selectedBrand}
              newBrand={newBrand}
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
                
                <FormGroup>
                  <Label>🇩🇪 German</Label>
                  {translationField === 'description' ? (
                    <TextArea
                      value={translations.de}
                      onChange={(e) => setTranslations(prev => ({ ...prev, de: e.target.value }))}
                      placeholder="German translation..."
                    />
                  ) : (
                    <Input
                      value={translations.de}
                      onChange={(e) => setTranslations(prev => ({ ...prev, de: e.target.value }))}
                      placeholder="German translation..."
                    />
                  )}
                </FormGroup>
                
                <FormGroup>
                  <Label>🇩🇰 Danish</Label>
                  {translationField === 'description' ? (
                    <TextArea
                      value={translations.da}
                      onChange={(e) => setTranslations(prev => ({ ...prev, da: e.target.value }))}
                      placeholder="Danish translation..."
                    />
                  ) : (
                    <Input
                      value={translations.da}
                      onChange={(e) => setTranslations(prev => ({ ...prev, da: e.target.value }))}
                      placeholder="Danish translation..."
                    />
                  )}
                </FormGroup>
                
                <FormGroup>
                  <Label>🇬🇧 English</Label>
                  {translationField === 'description' ? (
                    <TextArea
                      value={translations.en}
                      onChange={(e) => setTranslations(prev => ({ ...prev, en: e.target.value }))}
                      placeholder="English translation..."
                    />
                  ) : (
                    <Input
                      value={translations.en}
                      onChange={(e) => setTranslations(prev => ({ ...prev, en: e.target.value }))}
                      placeholder="English translation..."
                    />
                  )}
                </FormGroup>

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
      </Container>
    </ProductErrorBoundary>
  );
};

export default ProductManagerContainer;