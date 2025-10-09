/**
 * Product Type Selection Modal
 * Allows users to choose between regular product or tobacco product creation
 */

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaTimes, FaLeaf, FaUtensils, FaClipboardList } from 'react-icons/fa';

interface ProductTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'regular' | 'tobacco' | 'menu-package') => void;
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
  padding: 40px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  backdrop-filter: blur(15px);
  text-align: center;

  @media (max-width: 768px) {
    padding: 25px 15px;
    max-width: 95%;
    max-height: 85vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const ModalTitle = styled.h2`
  font-family: 'Oswald', sans-serif;
  color: #FF41FB;
  font-size: 1.8rem;
  text-transform: uppercase;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
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

const Subtitle = styled.p`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  margin-bottom: 40px;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 25px;
  }
`;

const TypeOptionsContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 15px;
    flex-direction: column;
    align-items: center;
  }
`;

const TypeOption = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 15px;
  padding: 30px 20px;
  width: 200px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  font-family: 'Aldrich', sans-serif;

  &:hover {
    border-color: #FF41FB;
    background: rgba(255, 65, 251, 0.2);
    box-shadow: 0 10px 30px rgba(255, 65, 251, 0.3);
    transform: translateY(-5px);
  }

  .icon {
    font-size: 3rem;
    margin-bottom: 15px;
    display: block;
    color: #FF41FB;
  }

  .title {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 10px;
    text-transform: uppercase;
  }

  .description {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.4;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 280px;
    padding: 25px 15px;

    .icon {
      font-size: 2.5rem;
      margin-bottom: 12px;
    }

    .title {
      font-size: 1.1rem;
      margin-bottom: 8px;
    }

    .description {
      font-size: 0.85rem;
    }
  }

  @media (max-width: 480px) {
    padding: 20px 12px;

    .icon {
      font-size: 2rem;
    }

    .title {
      font-size: 1rem;
    }

    .description {
      font-size: 0.8rem;
    }
  }
`;

const ProductTypeSelector: React.FC<ProductTypeSelectorProps> = ({
  isOpen,
  onClose,
  onSelectType
}) => {
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
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <ModalHeader>
          <ModalTitle>Produkttyp Auswählen</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <Subtitle>
          Wähle den Typ des Produkts aus, das du hinzufügen möchtest:
        </Subtitle>

        <TypeOptionsContainer>
          <TypeOption
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectType('regular')}
          >
            <FaUtensils className="icon" />
            <div className="title">Reguläres Produkt</div>
            <div className="description">
              Getränke, Essen, Snacks und andere normale Produkte
            </div>
          </TypeOption>

          <TypeOption
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectType('tobacco')}
          >
            <FaLeaf className="icon" />
            <div className="title">Tabak-Produkt</div>
            <div className="description">
              Shisha-Tabak mit Markenauswahl und automatischer Katalog-Integration
            </div>
          </TypeOption>

          <TypeOption
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectType('menu-package')}
          >
            <FaClipboardList className="icon" />
            <div className="title">Menü-Paket</div>
            <div className="description">
              Menü mit mehreren Produkten, die Sie selbst beschreiben können
            </div>
          </TypeOption>
        </TypeOptionsContainer>
      </ModalContent>
    </Modal>
  );
};

export default ProductTypeSelector;