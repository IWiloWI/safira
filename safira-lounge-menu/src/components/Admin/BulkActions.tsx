/**
 * Bulk operations component for products
 * Handles bulk actions like price updates, deletion, exports
 */

import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEuroSign, 
  FaTrash, 
  FaDownload, 
  FaEye, 
  FaEyeSlash,
  FaTimes,
  FaSave
} from 'react-icons/fa';
import { Product, BulkPriceUpdateResult } from '../../types/product.types';
import { useBulkOperations } from '../../hooks/useBulkOperations';

interface BulkActionsProps {
  selectedProducts: Product[];
  onBulkPriceUpdate: (categoryId: string, newPrice: number) => Promise<BulkPriceUpdateResult>;
  onBulkDelete: (products: Product[]) => Promise<void>;
  onBulkToggleAvailability: (products: Product[], available: boolean) => Promise<void>;
  onClearSelection: () => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const BulkContainer = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 65, 251, 0.15);
  border: 2px solid rgba(255, 65, 251, 0.4);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(15px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 100;
  min-width: 400px;
`;

const BulkHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const BulkTitle = styled.h3`
  font-family: 'Oswald', sans-serif;
  color: #FF41FB;
  font-size: 1.2rem;
  text-transform: uppercase;
  margin: 0;
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

const BulkActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const BulkButton = styled.button<{ variant?: 'danger' | 'success' | 'warning' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: ${props => {
    if (props.variant === 'danger') return 'linear-gradient(135deg, #f44336, #d32f2f)';
    if (props.variant === 'success') return 'linear-gradient(135deg, #4CAF50, #45a049)';
    if (props.variant === 'warning') return 'linear-gradient(135deg, #FF9800, #f57c00)';
    return 'linear-gradient(135deg, #FF41FB, #ff21f5)';
  }};
  border: none;
  border-radius: 8px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
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
`;

const ModalContent = styled(motion.div)`
  background: rgba(255, 65, 251, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  backdrop-filter: blur(15px);
`;

const ModalTitle = styled.h2`
  font-family: 'Oswald', sans-serif;
  color: #FF41FB;
  font-size: 1.6rem;
  text-transform: uppercase;
  margin-bottom: 20px;
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

const ModalActions = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 25px;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin: 15px 0;
  
  &::after {
    content: '';
    display: block;
    width: ${props => props.progress}%;
    height: 100%;
    background: linear-gradient(135deg, #FF41FB, #ff21f5);
    transition: width 0.3s ease;
  }
`;

const BulkActionsComponent: React.FC<BulkActionsProps> = memo(({
  selectedProducts,
  onBulkPriceUpdate,
  onBulkDelete,
  onBulkToggleAvailability,
  onClearSelection,
  showNotification
}) => {
  const {
    isProcessing,
    progress,
    error,
    bulkUpdatePrices,
    bulkDeleteProducts,
    bulkToggleAvailability,
    bulkExportProducts
  } = useBulkOperations();

  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newPrice, setNewPrice] = useState('15.00');

  const handleBulkPriceUpdate = async () => {
    try {
      const price = parseFloat(newPrice);
      if (isNaN(price) || price <= 0) {
        showNotification('Please enter a valid price.', 'error');
        return;
      }

      // Assume shisha-standard category for tobacco products
      const result = await onBulkPriceUpdate('shisha-standard', price);
      showNotification(`${result.updatedCount} products updated to €${price}!`, 'success');
      setShowPriceModal(false);
    } catch (error) {
      showNotification('Failed to update prices. Please try again.', 'error');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const result = await bulkDeleteProducts(selectedProducts);
      showNotification(result.message, result.failureCount > 0 ? 'error' : 'success');
      setShowDeleteModal(false);
      onClearSelection();
    } catch (error) {
      showNotification('Failed to delete products. Please try again.', 'error');
    }
  };

  const handleBulkToggleAvailability = async (available: boolean) => {
    try {
      const result = await bulkToggleAvailability(selectedProducts, available);
      showNotification(result.message, result.failureCount > 0 ? 'error' : 'success');
      onClearSelection();
    } catch (error) {
      showNotification('Failed to update availability. Please try again.', 'error');
    }
  };

  const handleBulkExport = async (format: 'csv' | 'json' | 'excel') => {
    try {
      await bulkExportProducts(selectedProducts, format);
      showNotification(`Exported ${selectedProducts.length} products to ${format.toUpperCase()}!`, 'success');
    } catch (error) {
      showNotification('Failed to export products. Please try again.', 'error');
    }
  };

  if (selectedProducts.length === 0) {
    return null;
  }

  return (
    <>
      <BulkContainer
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <BulkHeader>
          <BulkTitle>{selectedProducts.length} Products Selected</BulkTitle>
          <CloseButton onClick={onClearSelection}>
            <FaTimes />
          </CloseButton>
        </BulkHeader>

        {isProcessing && (
          <ProgressBar progress={progress} />
        )}

        <BulkActions>
          <BulkButton 
            variant="warning"
            onClick={() => setShowPriceModal(true)}
            disabled={isProcessing}
          >
            <FaEuroSign />
            Update Prices
          </BulkButton>

          <BulkButton 
            variant="success"
            onClick={() => handleBulkToggleAvailability(true)}
            disabled={isProcessing}
          >
            <FaEye />
            Make Available
          </BulkButton>

          <BulkButton 
            onClick={() => handleBulkToggleAvailability(false)}
            disabled={isProcessing}
          >
            <FaEyeSlash />
            Make Unavailable
          </BulkButton>

          <BulkButton 
            onClick={() => handleBulkExport('csv')}
            disabled={isProcessing}
          >
            <FaDownload />
            Export CSV
          </BulkButton>

          <BulkButton 
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            disabled={isProcessing}
          >
            <FaTrash />
            Delete Selected
          </BulkButton>
        </BulkActions>

        {error && (
          <div style={{ 
            color: '#f44336', 
            fontSize: '0.9rem', 
            marginTop: '10px',
            fontFamily: 'Aldrich, sans-serif'
          }}>
            {error}
          </div>
        )}
      </BulkContainer>

      {/* Price Update Modal */}
      <AnimatePresence>
        {showPriceModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowPriceModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <ModalTitle>Bulk Price Update</ModalTitle>
              
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                fontFamily: 'Aldrich, sans-serif',
                marginBottom: '20px'
              }}>
                This will update the price for {selectedProducts.length} selected products.
              </p>
              
              <FormGroup>
                <Label>New Price (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="15.00"
                />
              </FormGroup>

              <ModalActions>
                <BulkButton onClick={() => setShowPriceModal(false)}>
                  <FaTimes />
                  Cancel
                </BulkButton>
                <BulkButton 
                  variant="warning"
                  onClick={handleBulkPriceUpdate}
                  disabled={isProcessing}
                >
                  <FaEuroSign />
                  Update Prices
                </BulkButton>
              </ModalActions>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <ModalTitle>Delete Products</ModalTitle>
              
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                fontFamily: 'Aldrich, sans-serif',
                marginBottom: '20px'
              }}>
                Are you sure you want to delete {selectedProducts.length} selected products? 
                This action cannot be undone.
              </p>

              <ModalActions>
                <BulkButton onClick={() => setShowDeleteModal(false)}>
                  <FaTimes />
                  Cancel
                </BulkButton>
                <BulkButton 
                  variant="danger"
                  onClick={handleBulkDelete}
                  disabled={isProcessing}
                >
                  <FaTrash />
                  Delete Products
                </BulkButton>
              </ModalActions>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
});

BulkActionsComponent.displayName = 'BulkActions';

export default BulkActionsComponent;