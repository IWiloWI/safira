import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, 
  FaPlus, 
  FaTrash,
  FaTimes,
  FaCheck
} from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getTobaccoCatalog,
  addTobaccoToMenu,
  removeTobaccoFromCatalog,
  TobaccoCatalog as TobaccoCatalogType,
  TobaccoItem,
  debugTobaccoSystem,
  syncExistingTobacco
} from '../../services/api';

const CatalogContainer = styled.div`
  max-width: 1200px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
`;

const Title = styled.h1`
  font-family: 'Oswald', sans-serif;
  font-size: 2.5rem;
  color: #FF41FB;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 0 0 20px rgba(255, 65, 251, 0.8);
`;

const Subtitle = styled.p`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin: 5px 0 0 0;
`;

const Controls = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 12px 40px 12px 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 25px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  min-width: 250px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #FF41FB;
    box-shadow: 0 0 20px rgba(255, 65, 251, 0.3);
  }
`;

const SearchContainer = styled.div`
  position: relative;
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
`;

const BrandFilter = styled.select`
  padding: 10px 15px;
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

const TobaccosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const TobaccoCard = styled(motion.div)`
  background: rgba(255, 65, 251, 0.08);
  border: 2px solid rgba(255, 65, 251, 0.2);
  border-radius: 15px;
  padding: 20px;
  position: relative;
  backdrop-filter: blur(10px);
`;

const TobaccoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const TobaccoInfo = styled.div`
  flex: 1;
`;

const TobaccoName = styled.h3`
  font-family: 'Oswald', sans-serif;
  font-size: 1.3rem;
  color: #FF41FB;
  margin-bottom: 5px;
  text-transform: uppercase;
`;

const TobaccoBrand = styled.span`
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 8px;
`;

const TobaccoActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ variant?: 'danger' | 'success' }>`
  background: ${props => 
    props.variant === 'danger' ? 'rgba(244, 67, 54, 0.2)' : 
    props.variant === 'success' ? 'rgba(76, 175, 80, 0.2)' :
    'rgba(255, 65, 251, 0.2)'};
  border: 1px solid ${props => 
    props.variant === 'danger' ? 'rgba(244, 67, 54, 0.5)' : 
    props.variant === 'success' ? 'rgba(76, 175, 80, 0.5)' :
    'rgba(255, 65, 251, 0.5)'};
  border-radius: 8px;
  color: ${props => 
    props.variant === 'danger' ? '#f44336' : 
    props.variant === 'success' ? '#4CAF50' :
    '#FF41FB'};
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => 
      props.variant === 'danger' ? 'rgba(244, 67, 54, 0.3)' : 
      props.variant === 'success' ? 'rgba(76, 175, 80, 0.3)' :
      'rgba(255, 65, 251, 0.3)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TobaccoPrice = styled.div`
  font-family: 'Oswald', sans-serif;
  font-size: 1.2rem;
  font-weight: 800;
  color: #FF41FB;
  margin: 10px 0;
`;

const TobaccoDescription = styled.p`
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
  margin: 10px 0;
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(51, 51, 51, 0.95));
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  backdrop-filter: blur(10px);
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
  font-size: 1.5rem;
  margin: 0;
  text-transform: uppercase;
`;

const CloseButton = styled.button`
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.5);
  border-radius: 50%;
  color: #f44336;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(244, 67, 54, 0.3);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 10px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #FF41FB;
  }

  option {
    background: #1a1a1a;
    color: white;
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
  font-size: 0.9rem;
  cursor: pointer;

  input[type="checkbox"] {
    accent-color: #FF41FB;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 25px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 10px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;

  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #FF41FB, #ff21f5);
    color: white;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(255, 65, 251, 0.4);
    }
  ` : `
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DebugButton = styled(motion.button)`
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  border: none;
  border-radius: 10px;
  color: white;
  padding: 10px 16px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: linear-gradient(135deg, #E55A2B, #E8851A);
    box-shadow: 0 5px 15px rgba(255, 107, 53, 0.4);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const NotificationContainer = styled(motion.div)<{ type: 'success' | 'error' }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${props => props.type === 'success' 
    ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(56, 142, 60, 0.9))'
    : 'linear-gradient(135deg, rgba(244, 67, 54, 0.9), rgba(211, 47, 47, 0.9))'};
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  z-index: 1001;
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.type === 'success' 
    ? 'rgba(76, 175, 80, 0.5)' 
    : 'rgba(244, 67, 54, 0.5)'};
`;

const TobaccoCatalog: React.FC = () => {
  const { t } = useLanguage();
  const [catalog, setCatalog] = useState<TobaccoCatalogType>({ brands: [], tobaccos: [] });
  const [filteredTobaccos, setFilteredTobaccos] = useState<TobaccoItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddToMenuModal, setShowAddToMenuModal] = useState(false);
  const [selectedTobacco, setSelectedTobacco] = useState<TobaccoItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('shisha-standard');
  const [badges, setBadges] = useState({
    neu: false,
    kurze_zeit: false,
    beliebt: false
  });
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tobaccoToDelete, setTobaccoToDelete] = useState<TobaccoItem | null>(null);

  // Dummy categories for selection
  const categories = [
    { id: 'shisha-standard', name: 'Shisha Standard' },
    { id: 'shisha-premium', name: 'Shisha Premium' },
    { id: 'specials', name: 'Specials' }
  ];

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 4000);
  }, []);

  const loadCatalog = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Loading tobacco catalog...');
      
      // Try authenticated API first
      try {
        const catalogData = await getTobaccoCatalog();
        setCatalog(catalogData);
        console.log('Tobacco catalog loaded successfully:', catalogData);
      } catch (authError) {
        console.log('Authenticated request failed, trying direct fetch:', authError);
        
        // Fallback: Direct fetch without authentication
        const response = await fetch('/api/tobacco-catalog');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const catalogData = await response.json();
        setCatalog(catalogData);
        console.log('Tobacco catalog loaded via direct fetch:', catalogData);
      }
    } catch (error) {
      console.error('Failed to load tobacco catalog:', error);
      showNotification('Fehler beim Laden des Tabak-Katalogs', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const filterTobaccos = useCallback(() => {
    let filtered = catalog?.tobaccos || [];

    if (selectedBrand !== 'all') {
      filtered = filtered.filter(tobacco => tobacco.brand === selectedBrand);
    }

    if (searchQuery) {
      filtered = filtered.filter(tobacco => {
        const name = typeof tobacco.name === 'string' ? tobacco.name : tobacco.name.de || '';
        const description = typeof tobacco.description === 'string' ? tobacco.description : tobacco.description?.de || '';
        const searchTerm = searchQuery.toLowerCase();
        
        return name.toLowerCase().includes(searchTerm) ||
               description.toLowerCase().includes(searchTerm) ||
               tobacco.brand.toLowerCase().includes(searchTerm);
      });
    }

    setFilteredTobaccos(filtered);
  }, [catalog?.tobaccos, selectedBrand, searchQuery]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    filterTobaccos();
  }, [catalog, searchQuery, selectedBrand, filterTobaccos]);

  const handleAddToMenu = (tobacco: TobaccoItem) => {
    setSelectedTobacco(tobacco);
    setShowAddToMenuModal(true);
  };

  const confirmAddToMenu = async () => {
    if (!selectedTobacco) return;

    try {
      setIsLoading(true);
      await addTobaccoToMenu(selectedTobacco.id, selectedCategory, badges);
      
      const tobaccoName = typeof selectedTobacco.name === 'string' 
        ? selectedTobacco.name 
        : selectedTobacco.name.de || 'Unbekannt';
      
      showNotification(`"${tobaccoName}" wurde zur Speisekarte hinzugefügt!`);
      setShowAddToMenuModal(false);
      setSelectedTobacco(null);
      setBadges({ neu: false, kurze_zeit: false, beliebt: false });
    } catch (error) {
      console.error('Failed to add tobacco to menu:', error);
      showNotification('Fehler beim Hinzufügen zur Speisekarte', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTobacco = (tobacco: TobaccoItem) => {
    setTobaccoToDelete(tobacco);
    setShowConfirmModal(true);
  };

  const confirmDeleteTobacco = async () => {
    if (!tobaccoToDelete) return;

    try {
      setIsLoading(true);
      await removeTobaccoFromCatalog(tobaccoToDelete.id);
      await loadCatalog();
      const tobaccoName = typeof tobaccoToDelete.name === 'string' ? tobaccoToDelete.name : tobaccoToDelete.name.de;
      showNotification(`"${tobaccoName}" wurde aus dem Katalog entfernt`);
    } catch (error) {
      console.error('Failed to remove tobacco:', error);
      showNotification('Fehler beim Entfernen der Tabaksorte', 'error');
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
      setTobaccoToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setTobaccoToDelete(null);
  };

  const getTobaccoName = (name: any): string => {
    if (typeof name === 'string') return name;
    if (typeof name === 'object' && name) {
      return name.de || name.en || Object.values(name)[0] || 'Unbekannt';
    }
    return 'Unbekannt';
  };

  const getTobaccoDescription = (description?: any): string => {
    if (!description) return '';
    if (typeof description === 'string') return description;
    if (typeof description === 'object' && description) {
      return description.de || description.en || Object.values(description)[0] || '';
    }
    return '';
  };

  return (
    <CatalogContainer>
      <Header>
        <div>
          <Title>Tabak-Katalog</Title>
          <Subtitle>Verwalten Sie Ihre Shisha-Tabaksorten</Subtitle>
        </div>
        <Controls>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Tabaksorten durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon />
          </SearchContainer>
          
          <BrandFilter
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            <option value="all">Alle Marken</option>
            {catalog?.brands?.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            )) || []}
          </BrandFilter>

          {/* Debug buttons */}
          <DebugButton
            onClick={async () => {
              try {
                const debugData = await debugTobaccoSystem();
                console.log('🔍 TOBACCO SYSTEM DEBUG:', debugData);
                alert(`Debug Info:
• Tobacco Products: ${debugData.debug_info?.tobacco_products_count || 0}
• Catalog Entries: ${debugData.debug_info?.catalog_entries_count || 0}
• Recent Products: ${debugData.debug_info?.recent_tobacco_products?.length || 0}

Check console for detailed output.`);
              } catch (error) {
                console.error('Debug failed:', error);
                alert('Debug failed - check console');
              }
            }}
          >
            🔍 Debug System
          </DebugButton>

          <DebugButton
            onClick={async () => {
              try {
                const syncData = await syncExistingTobacco();
                console.log('🔄 SYNC RESULT:', syncData);
                alert(`Sync Complete:
• Added: ${syncData.added || 0} products
• Total found: ${syncData.total_products || 0} products

Refreshing catalog...`);
                await loadCatalog();
              } catch (error) {
                console.error('Sync failed:', error);
                alert('Sync failed - check console');
              }
            }}
          >
            🔄 Sync Products
          </DebugButton>
        </Controls>
      </Header>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'rgba(255, 255, 255, 0.6)' }}>
          Wird geladen...
        </div>
      ) : (
        <TobaccosGrid>
          {filteredTobaccos.map((tobacco) => (
            <TobaccoCard
              key={tobacco.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TobaccoHeader>
                <TobaccoInfo>
                  <TobaccoName>{getTobaccoName(tobacco.name)}</TobaccoName>
                  <TobaccoBrand>{tobacco.brand}</TobaccoBrand>
                </TobaccoInfo>
                <TobaccoActions>
                  <ActionButton
                    variant="success"
                    onClick={() => handleAddToMenu(tobacco)}
                    title="Zur Speisekarte hinzufügen"
                  >
                    <FaPlus />
                  </ActionButton>
                  <ActionButton
                    variant="danger"
                    onClick={() => handleRemoveTobacco(tobacco)}
                    title="Aus Katalog entfernen"
                  >
                    <FaTrash />
                  </ActionButton>
                </TobaccoActions>
              </TobaccoHeader>

              {getTobaccoDescription(tobacco.description) && (
                <TobaccoDescription>
                  {getTobaccoDescription(tobacco.description)}
                </TobaccoDescription>
              )}

              {tobacco.price && (
                <TobaccoPrice>{tobacco.price.toFixed(2)} €</TobaccoPrice>
              )}
            </TobaccoCard>
          ))}
        </TobaccosGrid>
      )}

      {filteredTobaccos.length === 0 && !isLoading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px', 
          color: 'rgba(255, 255, 255, 0.6)',
          fontFamily: 'Aldrich'
        }}>
          {(catalog?.tobaccos?.length || 0) === 0 
            ? 'Noch keine Tabaksorten im Katalog vorhanden.' 
            : 'Keine Tabaksorten gefunden.'}
        </div>
      )}

      {/* Add to Menu Modal */}
      <AnimatePresence>
        {showAddToMenuModal && selectedTobacco && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowAddToMenuModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <ModalHeader>
                <ModalTitle>Zur Speisekarte hinzufügen</ModalTitle>
                <CloseButton onClick={() => setShowAddToMenuModal(false)}>
                  <FaTimes />
                </CloseButton>
              </ModalHeader>

              <FormGroup>
                <Label>Tabaksorte</Label>
                <div style={{ 
                  padding: '12px 15px', 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: '10px',
                  color: 'white',
                  fontFamily: 'Aldrich'
                }}>
                  <strong>{getTobaccoName(selectedTobacco.name)}</strong> - {selectedTobacco.brand}
                </div>
              </FormGroup>

              <FormGroup>
                <Label>Kategorie</Label>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Badges</Label>
                <CheckboxGroup>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={badges.neu}
                      onChange={(e) => setBadges(prev => ({ ...prev, neu: e.target.checked }))}
                    />
                    Neu
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={badges.kurze_zeit}
                      onChange={(e) => setBadges(prev => ({ ...prev, kurze_zeit: e.target.checked }))}
                    />
                    Kurze Zeit
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={badges.beliebt}
                      onChange={(e) => setBadges(prev => ({ ...prev, beliebt: e.target.checked }))}
                    />
                    Beliebt
                  </CheckboxLabel>
                </CheckboxGroup>
              </FormGroup>

              <ButtonGroup>
                <Button variant="secondary" onClick={() => setShowAddToMenuModal(false)}>
                  Abbrechen
                </Button>
                <Button 
                  variant="primary" 
                  onClick={confirmAddToMenu}
                  disabled={isLoading}
                >
                  <FaCheck style={{ marginRight: '8px' }} />
                  Hinzufügen
                </Button>
              </ButtonGroup>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {showConfirmModal && tobaccoToDelete && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && cancelDelete()}
          >
            <ModalContent
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <ModalHeader>
                <ModalTitle>Tabaksorte löschen</ModalTitle>
                <CloseButton onClick={cancelDelete}>
                  <FaTimes />
                </CloseButton>
              </ModalHeader>

              <div style={{ 
                marginBottom: '25px',
                textAlign: 'center',
                fontFamily: 'Aldrich',
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                <p>Möchten Sie die Tabaksorte wirklich aus dem Katalog entfernen?</p>
                <div style={{ 
                  margin: '20px 0',
                  padding: '15px',
                  background: 'rgba(255, 65, 251, 0.1)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 65, 251, 0.3)'
                }}>
                  <strong style={{ color: '#FF41FB' }}>
                    {getTobaccoName(tobaccoToDelete.name)}
                  </strong>
                  <br />
                  <small style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    {tobaccoToDelete.brand}
                  </small>
                </div>
              </div>

              <ButtonGroup>
                <Button variant="secondary" onClick={cancelDelete}>
                  Abbrechen
                </Button>
                <Button 
                  variant="primary" 
                  onClick={confirmDeleteTobacco}
                  disabled={isLoading}
                  style={{ 
                    background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                    color: 'white'
                  }}
                >
                  <FaTrash style={{ marginRight: '8px' }} />
                  Löschen
                </Button>
              </ButtonGroup>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>

      {/* Notification */}
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
    </CatalogContainer>
  );
};

export default TobaccoCatalog;