/**
 * Menu Contents Editor Modal
 * Dedicated interface for editing menu package contents
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPlus, FaTrash, FaLanguage, FaGlobeAmericas } from 'react-icons/fa';
import { Product } from '../../types/product.types';
import { useLanguage } from '../../contexts/LanguageContext';
import { translateText } from '../../services/api';

interface MenuContentsEditorProps {
  product: Product;
  onSave: (menuContents: any[]) => void;
  onClose: () => void;
}

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  overflow-y: auto;
`;

const Modal = styled(motion.div)`
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(15, 15, 35, 0.98) 100%);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 20px;
  padding: 30px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(255, 65, 251, 0.3);
  backdrop-filter: blur(10px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(255, 65, 251, 0.2);
`;

const Title = styled.h2`
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  color: #FF41FB;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const CloseButton = styled.button`
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.5);
  border-radius: 8px;
  color: #f44336;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(244, 67, 54, 0.3);
    transform: scale(1.05);
  }
`;

const ProductInfo = styled.div`
  background: rgba(255, 65, 251, 0.08);
  border: 1px solid rgba(255, 65, 251, 0.2);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 25px;
`;

const ProductName = styled.h3`
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  color: #FF41FB;
  margin: 0 0 5px 0;
  text-transform: uppercase;
`;

const ProductDescription = styled.p`
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
`;

const MenuItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
`;

const MenuItem = styled(motion.div)`
  background: rgba(255, 65, 251, 0.05);
  border: 1px solid rgba(255, 65, 251, 0.2);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(255, 65, 251, 0.4);
    box-shadow: 0 5px 15px rgba(255, 65, 251, 0.1);
  }
`;

const MenuItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const MenuItemNumber = styled.span`
  font-family: 'Oswald', sans-serif;
  font-size: 1.2rem;
  color: #FF41FB;
  font-weight: 600;
`;

const DeleteItemButton = styled.button`
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.5);
  border-radius: 8px;
  color: #f44336;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.85rem;

  &:hover {
    background: rgba(244, 67, 54, 0.3);
    transform: translateY(-2px);
  }
`;

const LanguageSection = styled.div`
  margin-bottom: 12px;
  position: relative;
`;

const LanguageLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  gap: 8px;
`;

const TranslateButton = styled.button`
  padding: 12px;
  background: rgba(33, 150, 243, 0.2);
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-radius: 8px;
  color: #2196F3;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;

  &:hover:not(:disabled) {
    background: rgba(33, 150, 243, 0.3);
    border-color: rgba(33, 150, 243, 0.5);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 65, 251, 0.3);
  border-radius: 8px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.95rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #FF41FB;
    box-shadow: 0 0 10px rgba(255, 65, 251, 0.3);
    background: rgba(255, 255, 255, 0.12);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const AddItemButton = styled.button`
  width: 100%;
  padding: 15px;
  background: rgba(76, 175, 80, 0.2);
  border: 1px dashed rgba(76, 175, 80, 0.5);
  border-radius: 12px;
  color: #4CAF50;
  font-family: 'Aldrich', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover {
    background: rgba(76, 175, 80, 0.3);
    border-color: rgba(76, 175, 80, 0.7);
    transform: translateY(-2px);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid rgba(255, 65, 251, 0.2);
`;

const SaveButton = styled.button`
  flex: 1;
  padding: 15px;
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.5);
  border-radius: 12px;
  color: #4CAF50;
  font-family: 'Oswald', sans-serif;
  font-size: 1.1rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(76, 175, 80, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(76, 175, 80, 0.2);
  }
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 15px;
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.5);
  border-radius: 12px;
  color: #f44336;
  font-family: 'Oswald', sans-serif;
  font-size: 1.1rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(244, 67, 54, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(244, 67, 54, 0.2);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Aldrich', sans-serif;
  font-size: 1rem;
`;

// Define active languages outside component to prevent re-creation
const ACTIVE_LANGUAGES = [
  { code: 'de', name: 'Deutsch' },
  { code: 'da', name: 'Danish' },
  { code: 'en', name: 'English' }
];

const MenuContentsEditor: React.FC<MenuContentsEditorProps> = ({ product, onSave, onClose }) => {
  const { language } = useLanguage();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [translating, setTranslating] = useState<{[key: string]: boolean}>({});

  // Translations for the editor
  const translations = {
    title: {
      de: 'Menü-Inhalte Editor',
      en: 'Menu Contents Editor',
      da: 'Menu Indhold Editor',
      tr: 'Menü İçeriği Düzenleyici',
      it: 'Editor Contenuti Menu'
    },
    editingPackage: {
      de: 'Menüpaket-Inhalte bearbeiten',
      en: 'Editing menu package contents',
      da: 'Redigering af menupakke indhold',
      tr: 'Menü paketi içeriğini düzenleme',
      it: 'Modifica contenuti pacchetto menu'
    },
    noItems: {
      de: 'Noch keine Menüpunkte. Klicken Sie auf "Menüpunkt hinzufügen", um zu beginnen.',
      en: 'No menu items yet. Click "Add Menu Item" to start adding items.',
      da: 'Ingen menupunkter endnu. Klik på "Tilføj Menupunkt" for at starte.',
      tr: 'Henüz menü öğesi yok. Öğe eklemek için "Menü Öğesi Ekle"ye tıklayın.',
      it: 'Nessun elemento menu ancora. Clicca "Aggiungi Elemento Menu" per iniziare.'
    },
    item: {
      de: 'Artikel',
      en: 'Item',
      da: 'Artikel',
      tr: 'Öğe',
      it: 'Articolo'
    },
    delete: {
      de: 'Löschen',
      en: 'Delete',
      da: 'Slet',
      tr: 'Sil',
      it: 'Elimina'
    },
    addMenuItem: {
      de: 'Menüpunkt hinzufügen',
      en: 'Add Menu Item',
      da: 'Tilføj Menupunkt',
      tr: 'Menü Öğesi Ekle',
      it: 'Aggiungi Elemento Menu'
    },
    cancel: {
      de: 'Abbrechen',
      en: 'Cancel',
      da: 'Annuller',
      tr: 'İptal',
      it: 'Annulla'
    },
    save: {
      de: 'Menü-Inhalte speichern',
      en: 'Save Menu Contents',
      da: 'Gem Menu Indhold',
      tr: 'Menü İçeriğini Kaydet',
      it: 'Salva Contenuti Menu'
    }
  };

  const t = (key: keyof typeof translations): string => {
    return translations[key][language as keyof typeof translations['title']] || translations[key].en;
  };

  useEffect(() => {
    // Initialize menu items from product
    console.log('🔍 MenuContentsEditor - Loading product:', product);
    console.log('🔍 Product menuContents:', product.menuContents);
    console.log('🔍 Type:', typeof product.menuContents);
    console.log('🔍 Is array?', Array.isArray(product.menuContents));

    if (product.menuContents) {
      if (Array.isArray(product.menuContents)) {
        // New format: array of multilingual objects
        console.log('✅ Setting menu items from array:', product.menuContents);

        // Transform data to match editor format (description_de -> de, etc.)
        const transformedItems = product.menuContents.map((item: any) => {
          const transformed: any = {};

          // Check if item has description_XX format or direct language codes
          if (item.description_de || item.description_en || item.description_da) {
            // Has description_ prefix - transform it
            ACTIVE_LANGUAGES.forEach(lang => {
              transformed[lang.code] = item[`description_${lang.code}`] || '';
            });
          } else {
            // Already in correct format (de, en, da, etc.)
            ACTIVE_LANGUAGES.forEach(lang => {
              transformed[lang.code] = item[lang.code] || '';
            });
          }

          return transformed;
        });

        console.log('🔄 Transformed items:', transformedItems);
        setMenuItems(transformedItems);
      } else if (typeof product.menuContents === 'string') {
        // Old format: convert string to array
        console.log('🔄 Converting string to array format');
        const items = product.menuContents
          .split('\n')
          .filter(line => line.trim())
          .map(line => {
            const item: any = {};
            ACTIVE_LANGUAGES.forEach(lang => {
              item[lang.code] = lang.code === 'de' ? line : '';
            });
            return item;
          });
        console.log('✅ Converted items:', items);
        setMenuItems(items);
      } else {
        console.log('⚠️ Unknown format, starting with empty array');
        setMenuItems([]);
      }
    } else {
      console.log('⚠️ No menu contents found, starting with empty array');
      setMenuItems([]);
    }
  }, [product]);

  const getProductName = (nameObj: any): string => {
    if (typeof nameObj === 'string') return nameObj;
    if (!nameObj) return '';
    return nameObj[language] || nameObj['de'] || nameObj['en'] || '';
  };

  const handleAddItem = () => {
    // Create new item with all active languages initialized to empty string
    const newItem: any = {};
    ACTIVE_LANGUAGES.forEach(lang => {
      newItem[lang.code] = '';
    });
    setMenuItems([...menuItems, newItem]);
  };

  const handleDeleteItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, lang: string, value: string) => {
    const updatedItems = [...menuItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [lang]: value
    };
    setMenuItems(updatedItems);
  };

  const handleTranslate = async (itemIndex: number, targetLang: string) => {
    const item = menuItems[itemIndex];
    const sourceText = item['de'] || item['en'] || item['da'];

    if (!sourceText || !sourceText.trim()) {
      console.warn('No source text to translate');
      return;
    }

    const key = `${itemIndex}-${targetLang}`;
    setTranslating(prev => ({ ...prev, [key]: true }));

    try {
      const translations = await translateText(sourceText, [targetLang as any]);

      if (translations && translations[targetLang]) {
        handleItemChange(itemIndex, targetLang, translations[targetLang]);
      } else {
        console.error('Translation failed: No translation returned');
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslating(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSave = () => {
    // Filter out empty items (where all languages are empty)
    const filteredItems = menuItems.filter(item =>
      Object.values(item).some(val => val && String(val).trim() !== '')
    );
    onSave(filteredItems);
  };

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <Modal
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Header>
          <Title>{t('title')}</Title>
          <CloseButton onClick={onClose}>
            <FaTimes size={20} />
          </CloseButton>
        </Header>

        <ProductInfo>
          <ProductName>{getProductName(product.name)}</ProductName>
          <ProductDescription>{t('editingPackage')}</ProductDescription>
        </ProductInfo>

        {menuItems.length === 0 ? (
          <EmptyState>
            {t('noItems')}
          </EmptyState>
        ) : (
          <MenuItemsList>
            <AnimatePresence>
              {menuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <MenuItemHeader>
                    <MenuItemNumber>{t('item')} {index + 1}</MenuItemNumber>
                    <DeleteItemButton onClick={() => handleDeleteItem(index)}>
                      <FaTrash size={12} />
                      {t('delete')}
                    </DeleteItemButton>
                  </MenuItemHeader>

                  {/* Dynamic language inputs based on active languages */}
                  {ACTIVE_LANGUAGES.map(lang => {
                    const translationKey = `${index}-${lang.code}`;
                    const isTranslating = translating[translationKey];
                    const hasSourceText = item['de'] && item['de'].trim();
                    const isSourceLang = lang.code === 'de';

                    return (
                      <LanguageSection key={lang.code}>
                        <LanguageLabel>
                          <FaLanguage />
                          {lang.name} ({lang.code.toUpperCase()})
                        </LanguageLabel>
                        <InputWrapper>
                          <Input
                            type="text"
                            value={item[lang.code] || ''}
                            onChange={(e) => handleItemChange(index, lang.code, e.target.value)}
                            placeholder={`${lang.name} description...`}
                          />
                          {!isSourceLang && hasSourceText && (
                            <TranslateButton
                              onClick={() => handleTranslate(index, lang.code)}
                              disabled={isTranslating}
                              title={`Translate to ${lang.name}`}
                            >
                              {isTranslating ? '...' : <FaGlobeAmericas size={16} />}
                            </TranslateButton>
                          )}
                        </InputWrapper>
                      </LanguageSection>
                    );
                  })}
                </MenuItem>
              ))}
            </AnimatePresence>
          </MenuItemsList>
        )}

        <AddItemButton onClick={handleAddItem}>
          <FaPlus size={16} />
          {t('addMenuItem')}
        </AddItemButton>

        <ButtonGroup>
          <CancelButton onClick={onClose}>{t('cancel')}</CancelButton>
          <SaveButton onClick={handleSave}>{t('save')}</SaveButton>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
};

export default MenuContentsEditor;
