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
  background: linear-gradient(135deg, rgba(20, 20, 30, 0.95), rgba(30, 15, 40, 0.95));
  border: 2px solid rgba(255, 65, 251, 0.4);
  border-radius: 24px;
  padding: 50px 40px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  backdrop-filter: blur(20px);
  text-align: center;
  box-shadow: 0 20px 60px rgba(255, 65, 251, 0.2);

  @media (max-width: 768px) {
    padding: 30px 20px;
    max-width: 95%;
    max-height: 85vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
`;

const ModalTitle = styled.h2`
  font-family: 'Oswald', sans-serif;
  background: linear-gradient(135deg, #FF41FB, #FFD700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2.2rem;
  text-transform: uppercase;
  margin: 0;
  letter-spacing: 2px;
  font-weight: 800;

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1.2rem;

  &:hover {
    color: #FF41FB;
    background: rgba(255, 65, 251, 0.15);
    border-color: rgba(255, 65, 251, 0.4);
    transform: rotate(90deg);
  }
`;

const Subtitle = styled.p`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.05rem;
  margin-bottom: 50px;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 35px;
  }
`;

const TypeOptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  max-width: 100%;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 20px;
    max-width: 400px;
    margin: 0 auto;
  }
`;

const TypeOption = styled(motion.button)`
  background: linear-gradient(135deg, rgba(255, 65, 251, 0.08), rgba(255, 215, 0, 0.05));
  border: 2px solid rgba(255, 65, 251, 0.25);
  border-radius: 20px;
  padding: 40px 25px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  color: white;
  font-family: 'Aldrich', sans-serif;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 280px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(255, 65, 251, 0.15), transparent 70%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover {
    border-color: #FF41FB;
    background: linear-gradient(135deg, rgba(255, 65, 251, 0.18), rgba(255, 215, 0, 0.12));
    box-shadow: 0 15px 40px rgba(255, 65, 251, 0.3),
                0 0 60px rgba(255, 65, 251, 0.15);
    transform: translateY(-8px) scale(1.02);

    &::before {
      opacity: 1;
    }

    .icon {
      transform: scale(1.15) rotate(5deg);
      filter: drop-shadow(0 5px 15px rgba(255, 65, 251, 0.5));
    }

    .title {
      color: #FFD700;
      text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
    }
  }

  &:active {
    transform: translateY(-4px) scale(0.98);
  }

  .icon {
    font-size: 4rem;
    margin-bottom: 20px;
    display: block;
    color: #FF41FB;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 3px 8px rgba(255, 65, 251, 0.3));
  }

  .title {
    font-size: 1.3rem;
    font-weight: bold;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #FF41FB;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
  }

  .description {
    font-size: 0.92rem;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.5;
    position: relative;
    z-index: 1;
    max-width: 90%;
  }

  @media (max-width: 968px) {
    min-height: 240px;
    padding: 35px 25px;

    .icon {
      font-size: 3.5rem;
      margin-bottom: 18px;
    }

    .title {
      font-size: 1.2rem;
      margin-bottom: 10px;
    }

    .description {
      font-size: 0.88rem;
    }
  }

  @media (max-width: 480px) {
    min-height: 220px;
    padding: 30px 20px;

    .icon {
      font-size: 3rem;
    }

    .title {
      font-size: 1.1rem;
    }

    .description {
      font-size: 0.85rem;
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