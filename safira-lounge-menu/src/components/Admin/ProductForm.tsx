/**
 * Product creation and editing form component
 * Handles product data input with validation and submission
 */

import React, { memo, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaSave, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { Product } from '../../types/product.types';
import { Category } from '../../types/product.types';
import { useProductForm } from '../../hooks/useProductForm';
import { TobaccoCatalog } from '../../types/product.types';

interface ProductFormProps {
  isOpen: boolean;
  editingProduct: Product | null;
  categories: Category[];
  tobaccoCatalog: TobaccoCatalog;
  selectedBrand: string;
  newBrand: string;
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

const ProductForm: React.FC<ProductFormProps> = memo(({
  isOpen,
  editingProduct,
  categories,
  tobaccoCatalog,
  selectedBrand,
  newBrand,
  onClose,
  onSubmit,
  onBrandSelect,
  onNewBrandChange,
  onAddBrand,
  isSubmitting
}) => {
  const { t, language } = useLanguage();
  
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
    getFormData
  } = useProductForm(
    categories,
    getProductName,
    getProductDescription
  );

  // Load product data when editing
  useEffect(() => {
    if (editingProduct) {
      loadProduct(editingProduct);
    } else {
      resetForm();
    }
  }, [editingProduct, loadProduct, resetForm]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const productData = getFormData();
      await onSubmit(productData, formData.category === 'shisha-standard' ? selectedBrand : undefined);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const getCategoryName = (cat: Category) => {
    if (typeof cat.name === 'string') return cat.name;
    return cat.name[language] || cat.name['de'] || cat.name;
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
            {editingProduct ? t('admin.editProduct') : t('admin.addProduct')}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>{t('admin.productName')}</Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Product name..."
              required
            />
            {validation.errors.name && (
              <ErrorMessage>{validation.errors.name}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label>{t('admin.productDescription')}</Label>
            <TextArea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Product description..."
            />
            {validation.errors.description && (
              <ErrorMessage>{validation.errors.description}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label>{t('admin.productPrice')}</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => updateField('price', e.target.value)}
              placeholder="0.00"
            />
            {validation.errors.price && (
              <ErrorMessage>{validation.errors.price}</ErrorMessage>
            )}
          </FormGroup>

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

          {/* Brand Selection for Shisha Products */}
          {formData.category === 'shisha-standard' && (
            <FormGroup>
              <Label>Tobacco Brand</Label>
              <Select
                value={selectedBrand}
                onChange={(e) => onBrandSelect(e.target.value)}
                required={formData.category === 'shisha-standard'}
              >
                <option value="">Select brand...</option>
                {tobaccoCatalog?.brands?.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                )) || []}
              </Select>
              
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
              {isSubmitting ? 'Saving...' : t('admin.saveChanges')}
            </Button>
          </ModalActions>
        </form>
      </ModalContent>
    </Modal>
  );
});

ProductForm.displayName = 'ProductForm';

export default ProductForm;