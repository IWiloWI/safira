/**
 * Product creation and editing form component
 * Handles product data input with validation and submission
 */

import React, { memo, useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaSave, FaTimes, FaLanguage } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { Product } from '../../types/product.types';
import { Category } from '../../types/product.types';
import { useProductForm } from '../../hooks/useProductForm';
import { TobaccoCatalog } from '../../types/product.types';
import { translateText } from '../../services/api';

interface ProductFormProps {
  isOpen: boolean;
  editingProduct: Product | null;
  categories: Category[];
  tobaccoCatalog: TobaccoCatalog;
  selectedBrand: string;
  newBrand: string;
  productType?: 'regular' | 'tobacco' | 'menu-package'; // NEW: Product type selection
  onClose: () => void;
  onSubmit: (formData: any, brand?: string) => Promise<void>;
  onBrandSelect: (brand: string) => void;
  onNewBrandChange: (brand: string) => void;
  onAddBrand: () => Promise<void>;
  isSubmitting: boolean;
}

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

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
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

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const Select = styled.select`
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
  }

  option {
    background: #1a1a1a;
    color: white;
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
  margin-top: 5px;
`;

const BrandSection = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const AddBrandButton = styled.button`
  padding: 10px 15px;
  background: linear-gradient(135deg, #FF41FB, #ff21f5);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  
  input[type="checkbox"] {
    accent-color: #FF41FB;
  }
`;

const VariantsSection = styled.div`
  border: 2px solid rgba(255, 65, 251, 0.2);
  border-radius: 10px;
  padding: 15px;
  margin-top: 10px;
  background: rgba(255, 65, 251, 0.05);
`;

const VariantsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const VariantsToggle = styled.button`
  background: none;
  border: none;
  color: #FF41FB;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #ff21f5;
  }
`;

const VariantItem = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
`;

const VariantInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 65, 251, 0.3);
  border-radius: 6px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #FF41FB;
  }
`;

const RemoveVariantButton = styled.button`
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.5);
  border-radius: 6px;
  color: #f44336;
  padding: 8px 12px;
  cursor: pointer;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;

  &:hover {
    background: rgba(244, 67, 54, 0.3);
  }
`;

const AddVariantButton = styled.button`
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.5);
  border-radius: 6px;
  color: #4CAF50;
  padding: 8px 15px;
  cursor: pointer;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;

  &:hover {
    background: rgba(76, 175, 80, 0.3);
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

const TranslationButton = styled(motion.button)`
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border: none;
  border-radius: 6px;
  color: white;
  padding: 8px 12px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #45a049, #4CAF50);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #666;
  }
`;

const FieldContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TranslationOptions = styled.div`
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TranslationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Aldrich', sans-serif;
  color: #4CAF50;
  font-size: 0.9rem;
  text-transform: uppercase;
`;

const TranslationCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  cursor: pointer;

  input {
    accent-color: #4CAF50;
    cursor: pointer;
  }

  &:hover {
    color: #4CAF50;
  }
`;

const TranslateAllButton = styled(TranslationButton)`
  width: 100%;
  justify-content: center;
  margin-top: 10px;
`;

const ProductForm: React.FC<ProductFormProps> = memo(({
  isOpen,
  editingProduct,
  categories,
  tobaccoCatalog,
  selectedBrand,
  newBrand,
  productType = 'regular', // Default to regular if not specified
  onClose,
  onSubmit,
  onBrandSelect,
  onNewBrandChange,
  onAddBrand,
  isSubmitting
}) => {
  const { t, language } = useLanguage();
  const [translating, setTranslating] = useState<{ name: boolean; description: boolean }>({
    name: false,
    description: false
  });
  const [shouldTranslate, setShouldTranslate] = useState<{ name: boolean; description: boolean }>({
    name: false,
    description: true  // Description enabled by default
  });

  // Memoize the callback functions to prevent infinite re-renders
  const getProductName = useCallback((name: any) => 
    typeof name === 'string' ? name : name[language] || name['de'] || '', 
    [language]
  );
  
  const getProductDescription = useCallback((desc: any) => 
    typeof desc === 'string' ? desc : desc?.[language] || desc?.['de'] || '', 
    [language]
  );
  
  const {
    formData,
    validation,
    updateField,
    updateBadge,
    resetForm,
    loadProduct,
    validateForm,
    getFormData,
    // Variant actions
    addVariant,
    removeVariant,
    updateVariant,
    toggleVariants,
    // Menu package actions
    addMenuItem,
    removeMenuItem,
    updateMenuItem
  } = useProductForm(
    categories,
    getProductName,
    getProductDescription
  );

  // Helper to get category display name
  const getCategoryName = useCallback((category: Category) => {
    return typeof category.name === 'string' ? category.name : category.name[language] || category.name['de'] || category.id;
  }, [language]);

  // Check if current category is Shisha/Tobacco (brand names should not be translated)
  const isShishaCategory = useCallback(() => {
    const categoryId = formData.category?.toLowerCase() || '';
    return categoryId.includes('shisha') ||
           categoryId.includes('tobacco') ||
           categoryId.includes('tabak');
  }, [formData.category]);

  // Update translation checkboxes when category changes
  useEffect(() => {
    if (isShishaCategory()) {
      // For Shisha: Only description should be translated by default
      setShouldTranslate({ name: false, description: true });
    } else {
      // For other categories: Both can be translated
      setShouldTranslate({ name: true, description: true });
    }
  }, [formData.category, isShishaCategory]);

  // Translation handler for all selected fields

  // Load product data when editing or set initial tobacco flag based on product type
  useEffect(() => {
    if (editingProduct) {
      loadProduct(editingProduct);
    } else {
      resetForm();
      // Auto-set flags based on product type selection
      if (productType === 'tobacco') {
        updateField('isTobacco', true);
      } else if (productType === 'menu-package') {
        updateField('isMenuPackage', true);
      }
    }
  }, [editingProduct, loadProduct, resetForm, productType, updateField]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🚀 ========== FORM SUBMIT START ==========');
    console.log('📋 Form State:', formData);
    console.log('📋 Product Type:', productType);
    console.log('📋 Is Menu Package:', formData.isMenuPackage);
    console.log('📋 Menu Items:', formData.menuItems);
    console.log('📋 Menu Contents:', formData.menuContents);

    console.log('🔍 Starting validation...');
    if (!validateForm()) {
      console.error('❌ VALIDATION FAILED - Form submit cancelled');
      return;
    }
    console.log('✅ Validation passed');

    try {
      console.log('🔄 Getting form data...');
      let productData = getFormData();
      console.log('📦 Product Data to submit:', productData);

      // Auto-translate selected fields before saving
      if (shouldTranslate.name && formData.name) {
        console.log('Auto-translating product name...');
        setTranslating(prev => ({ ...prev, name: true }));
        try {
          const nameTranslations = await translateText(formData.name);
          productData = {
            ...productData,
            name: {
              de: nameTranslations.de || formData.name,
              en: nameTranslations.en || formData.name,
              da: nameTranslations.da || formData.name,
              tr: nameTranslations.tr || formData.name
            }
          };
          console.log('Name translated:', nameTranslations);
        } catch (error) {
          console.error('Name translation failed:', error);
        } finally {
          setTranslating(prev => ({ ...prev, name: false }));
        }
      }

      if (shouldTranslate.description && formData.description) {
        console.log('Auto-translating product description...');
        setTranslating(prev => ({ ...prev, description: true }));
        try {
          const descTranslations = await translateText(formData.description);
          productData = {
            ...productData,
            description: {
              de: descTranslations.de || formData.description,
              en: descTranslations.en || formData.description,
              da: descTranslations.da || formData.description,
              tr: descTranslations.tr || formData.description
            }
          };
          console.log('Description translated:', descTranslations);
        } catch (error) {
          console.error('Description translation failed:', error);
        } finally {
          setTranslating(prev => ({ ...prev, description: false }));
        }
      }

      console.log('📤 Submitting product data to API...');
      console.log('📤 Final product data:', JSON.stringify(productData, null, 2));

      await onSubmit(productData, formData.category === 'shisha-standard' ? selectedBrand : undefined);

      console.log('✅ ========== FORM SUBMIT SUCCESS ==========');
    } catch (error) {
      console.error('❌ ========== FORM SUBMIT ERROR ==========');
      console.error('❌ Error:', error);
      console.error('❌ Error Stack:', error instanceof Error ? error.stack : 'No stack trace');
    }
  };


  if (!isOpen) return null;

  return (
    <Modal
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <ModalContent
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        <ModalHeader>
          <ModalTitle>
            {editingProduct
              ? t('admin.editProduct')
              : productType === 'tobacco'
                ? '🚬 Tabak-Produkt Hinzufügen'
                : productType === 'menu-package'
                  ? '📋 Menü-Paket Hinzufügen'
                  : t('admin.addProduct')
            }
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>{t('admin.productName')}</Label>
            <FieldContainer>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Product name..."
                required
              />
            </FieldContainer>
            {validation.errors.name && (
              <ErrorMessage>{validation.errors.name}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label>{t('admin.productDescription')}</Label>
            <FieldContainer>
              <TextArea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Product description..."
              />
            </FieldContainer>
            {validation.errors.description && (
              <ErrorMessage>{validation.errors.description}</ErrorMessage>
            )}
          </FormGroup>

          {/* Translation Options */}
          {(formData.name || formData.description) && (
            <FormGroup>
              <TranslationOptions>
                <TranslationHeader>
                  <FaLanguage />
                  ChatGPT Auto-Übersetzung (DE → EN/DA)
                </TranslationHeader>

                <div>
                  <TranslationCheckbox>
                    <input
                      type="checkbox"
                      checked={shouldTranslate.name}
                      onChange={(e) => setShouldTranslate(prev => ({ ...prev, name: e.target.checked }))}
                      disabled={isShishaCategory()}
                    />
                    Produktname übersetzen
                    {isShishaCategory() && <span style={{ color: '#ff9800', marginLeft: '8px' }}>(Markennamen bleiben unverändert)</span>}
                  </TranslationCheckbox>

                  <TranslationCheckbox>
                    <input
                      type="checkbox"
                      checked={shouldTranslate.description}
                      onChange={(e) => setShouldTranslate(prev => ({ ...prev, description: e.target.checked }))}
                    />
                    Beschreibung übersetzen
                  </TranslationCheckbox>
                </div>

              </TranslationOptions>
            </FormGroup>
          )}

          <FormGroup>
            <Label>
              {t('admin.productPrice')}
              {formData.hasVariants && (
                <span style={{ color: '#FF6B35', fontSize: '0.8rem', marginLeft: '8px' }}>
                  (wird bei aktivierten Varianten ignoriert)
                </span>
              )}
            </Label>
            <Input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => updateField('price', e.target.value)}
              placeholder="0.00"
              disabled={formData.hasVariants}
              style={{
                opacity: formData.hasVariants ? 0.5 : 1,
                cursor: formData.hasVariants ? 'not-allowed' : 'text'
              }}
            />
            {validation.errors.price && (
              <ErrorMessage>{validation.errors.price}</ErrorMessage>
            )}
          </FormGroup>

          {/* Product Variants Section - Right after price */}
          <VariantsSection>
            <VariantsHeader>
              <Label>Produktvarianten (z.B. verschiedene Größen)</Label>
              <VariantsToggle
                type="button"
                onClick={toggleVariants}
              >
                {formData.hasVariants ? 'Varianten deaktivieren' : 'Varianten aktivieren'}
              </VariantsToggle>
            </VariantsHeader>

            {formData.hasVariants && (
              <>
                {formData.sizes.map((variant, index) => (
                  <VariantItem key={index}>
                    <VariantInput
                      type="text"
                      placeholder="Größe (z.B. 0,3L, Klein, etc.)"
                      value={variant.size}
                      onChange={(e) => updateVariant(index, 'size', e.target.value)}
                    />
                    <VariantInput
                      type="number"
                      step="0.01"
                      placeholder="Preis"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                    />
                    <RemoveVariantButton
                      type="button"
                      onClick={() => removeVariant(index)}
                    >
                      Entfernen
                    </RemoveVariantButton>
                  </VariantItem>
                ))}

                <AddVariantButton
                  type="button"
                  onClick={addVariant}
                >
                  + Variante hinzufügen
                </AddVariantButton>

                {formData.sizes.length === 0 && (
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', textAlign: 'center', margin: '10px 0' }}>
                    Keine Varianten hinzugefügt. Klicke auf "Variante hinzufügen" um zu beginnen.
                  </p>
                )}
              </>
            )}
          </VariantsSection>

          <FormGroup>
            <Label>{t('admin.productCategory')}</Label>
            <Select
              value={formData.category}
              onChange={(e) => {
                const newCategory = e.target.value;
                updateField('category', newCategory);
                updateField('price', newCategory === 'shisha-standard' && !editingProduct ? '15.00' : formData.price);
                onBrandSelect(''); // Reset brand selection
              }}
              required
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {String(getCategoryName(cat))}
                </option>
              ))}
            </Select>
            {validation.errors.category && (
              <ErrorMessage>{validation.errors.category}</ErrorMessage>
            )}
          </FormGroup>

          {/* Tobacco Product Checkbox - Only show for regular products or when editing */}
          {(productType === 'regular' || editingProduct) && (
            <FormGroup>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.isTobacco}
                  onChange={(e) => updateField('isTobacco', e.target.checked)}
                />
                🚬 Ist Tabak-Produkt
              </CheckboxLabel>
            </FormGroup>
          )}

          {/* Tobacco Brand Selection - Show for tobacco products or when tobacco checkbox is checked */}
          {(productType === 'tobacco' || formData.isTobacco) && (
            <FormGroup>
              <Label>
                🚬 Tabak-Marke
                {(productType === 'tobacco' || formData.isTobacco) && <span style={{ color: '#ff6b35', marginLeft: '8px' }}>(Erforderlich)</span>}
              </Label>
              <Select
                value={selectedBrand || formData.brand || ''}
                onChange={(e) => {
                  const brandValue = e.target.value;
                  onBrandSelect(brandValue);
                  updateField('brand', brandValue);
                }}
                required={productType === 'tobacco' || formData.isTobacco}
              >
                <option value="">Select brand...</option>
                {tobaccoCatalog?.brands?.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                )) || []}
              </Select>

              {/* Show selected brand confirmation */}
              {(selectedBrand || formData.brand) && (
                <div style={{
                  color: '#4CAF50',
                  fontSize: '0.85rem',
                  marginTop: '5px',
                  fontFamily: 'Aldrich, sans-serif'
                }}>
                  ✓ Ausgewählte Marke: <strong>{selectedBrand || formData.brand}</strong>
                </div>
              )}

              <BrandSection>
                <Input
                  value={newBrand}
                  onChange={(e) => onNewBrandChange(e.target.value)}
                  placeholder="Add new brand..."
                  style={{ flex: 1 }}
                />
                <AddBrandButton
                  type="button"
                  onClick={onAddBrand}
                  disabled={!newBrand.trim()}
                >
                  Add
                </AddBrandButton>
              </BrandSection>

              {validation.errors.brand && (
                <ErrorMessage>{validation.errors.brand}</ErrorMessage>
              )}
            </FormGroup>
          )}

          {/* Menu Package Contents - Show only for menu-package type */}
          {(productType === 'menu-package' || formData.isMenuPackage) && (
            <VariantsSection>
              <VariantsHeader>
                <Label>
                  📋 Menü-Inhalte
                  <span style={{ color: '#ff6b35', marginLeft: '8px' }}>(Erforderlich)</span>
                </Label>
              </VariantsHeader>

              <div style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.85rem',
                marginBottom: '15px',
                fontFamily: 'Aldrich, sans-serif'
              }}>
                Geben Sie die einzelnen Bestandteile des Menüs ein.
              </div>

              {formData.menuItems.map((item, index) => (
                <VariantItem key={index}>
                  <VariantInput
                    type="text"
                    placeholder="Beschreibung (z.B. Burger, Pommes, Getränk)"
                    value={item.name}
                    onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <RemoveVariantButton
                    type="button"
                    onClick={() => removeMenuItem(index)}
                  >
                    Entfernen
                  </RemoveVariantButton>
                </VariantItem>
              ))}

              <AddVariantButton
                type="button"
                onClick={addMenuItem}
              >
                + Menü-Artikel hinzufügen
              </AddVariantButton>

              {formData.menuItems.length === 0 && (
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', textAlign: 'center', margin: '10px 0' }}>
                  Klicken Sie auf "+ Menü-Artikel hinzufügen", um Inhalte zu definieren.
                </p>
              )}

              {validation.errors.menuContents && (
                <ErrorMessage>{validation.errors.menuContents}</ErrorMessage>
              )}
            </VariantsSection>
          )}

          <FormGroup>
            <Label>Badges</Label>
            <CheckboxGroup>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.badges.neu}
                  onChange={(e) => updateBadge('neu', e.target.checked)}
                />
                🟢 {t('product.badges.neu')}
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.badges.kurze_zeit}
                  onChange={(e) => updateBadge('kurze_zeit', e.target.checked)}
                />
                🟠 {t('product.badges.kurze_zeit')}
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.badges.beliebt}
                  onChange={(e) => updateBadge('beliebt', e.target.checked)}
                />
                🔴 {t('product.badges.beliebt')}
              </CheckboxLabel>
            </CheckboxGroup>
          </FormGroup>


          <FormGroup>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => updateField('available', e.target.checked)}
              />
              {t('admin.productAvailable')}
            </CheckboxLabel>
          </FormGroup>

          <ModalActions>
            <Button 
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              <FaTimes />
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !validation.isValid}
            >
              <FaSave />
{editingProduct ? (isSubmitting ? 'Speichere...' : 'Änderungen speichern') : (isSubmitting || translating.name || translating.description ? 'Erstelle Produkt...' : 'Produkt erstellen')}
            </Button>
          </ModalActions>
        </form>
      </ModalContent>
    </Modal>
  );
});

ProductForm.displayName = 'ProductForm';

export default ProductForm;