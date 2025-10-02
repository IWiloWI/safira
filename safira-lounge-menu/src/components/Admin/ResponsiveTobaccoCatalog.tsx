import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaTrash, FaCog, FaSync, FaLeaf } from 'react-icons/fa';
import {
  ResponsivePageTitle,
  ResponsiveMainContent,
  ResponsiveCardGrid,
  ResponsiveCard,
  ResponsiveButton,
  ResponsiveFormGroup,
  ResponsiveLabel,
  ResponsiveInput,
  ResponsiveSelect,
  ResponsiveLoadingContainer,
  ResponsiveEmptyState
} from '../../styles/AdminLayout';
import {
  getTobaccoCatalog,
  addTobaccoToMenu,
  removeTobaccoFromCatalog,
  debugTobaccoSystem,
  syncExistingTobacco,
  TobaccoCatalog as TobaccoCatalogType,
  TobaccoItem
} from '../../services/api';

const ResponsiveTobaccoCatalog: React.FC = () => {
  const [catalog, setCatalog] = useState<TobaccoCatalogType | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [isDebugging, setIsDebugging] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const catalogData = await getTobaccoCatalog();
      setCatalog(catalogData);
      console.log('Tobacco catalog loaded:', catalogData);
    } catch (error) {
      console.error('Failed to load tobacco catalog:', error);
      setCatalog({ brands: [], tobaccos: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleDebug = async () => {
    try {
      setIsDebugging(true);
      console.log('🔍 DEBUG: Calling tobacco system debug...');
      const debugData = await debugTobaccoSystem();
      console.log('🔍 TOBACCO SYSTEM DEBUG:', debugData);
    } catch (error) {
      console.error('❌ DEBUG: Failed to debug tobacco system:', error);
      console.log('Debug failed:', error);
    } finally {
      setIsDebugging(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      console.log('🔄 SYNC: Syncing existing tobacco products...');
      const syncData = await syncExistingTobacco();
      console.log('🔄 SYNC: Sync response:', syncData);
      console.log('🔄 SYNC RESULT:', syncData);
      console.log('Loading tobacco catalog...');
      await loadCatalog();
    } catch (error) {
      console.error('❌ SYNC: Failed to sync tobacco products:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddToMenu = async (tobacco: TobaccoItem) => {
    try {
      // Use tobacco ID and appropriate category for menu addition
      await addTobaccoToMenu(tobacco.id?.toString() || '', 'tobacco-category');
      await loadCatalog();
    } catch (error) {
      console.error('Failed to add tobacco to menu:', error);
    }
  };

  const handleRemoveFromCatalog = async (tobacco: TobaccoItem) => {
    if (!window.confirm(`Möchten Sie "${tobacco.name}" wirklich aus dem Katalog entfernen?`)) {
      return;
    }

    try {
      await removeTobaccoFromCatalog(tobacco.id!);
      await loadCatalog();
    } catch (error) {
      console.error('Failed to remove tobacco from catalog:', error);
    }
  };

  // Helper function to get text value from FlexibleText
  const getTextValue = (text: any): string => {
    if (typeof text === 'string') return text;
    if (text && text.de) return text.de;
    if (text && text.en) return text.en;
    return '';
  };

  const filteredTobaccos = catalog?.tobaccos?.filter(tobacco => {
    const tobaccoName = getTextValue(tobacco.name).toLowerCase();
    const tobaccoBrand = tobacco.brand.toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = tobaccoName.includes(searchLower) || tobaccoBrand.includes(searchLower);
    const matchesBrand = !selectedBrand || tobacco.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  }) || [];

  const uniqueBrands = Array.from(new Set(catalog?.tobaccos?.map(t => t.brand) || [])).sort();

  if (loading) {
    return (
      <ResponsiveLoadingContainer>
        <div style={{ textAlign: 'center', color: '#FF1493' }}>
          <FaLeaf size={40} />
          <p style={{ marginTop: '10px', fontFamily: 'Aldrich, sans-serif' }}>
            Lade Tabak-Katalog...
          </p>
        </div>
      </ResponsiveLoadingContainer>
    );
  }

  return (
    <ResponsiveMainContent>
      <ResponsivePageTitle style={{ marginBottom: '30px', textAlign: 'center' }}>
        Tabak-Katalog
      </ResponsivePageTitle>
      <p style={{
        textAlign: 'center',
        marginBottom: '40px',
        fontFamily: 'Aldrich, sans-serif',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '1.1rem'
      }}>
        Verwalten Sie Ihre Shisha-Tabaksorten
      </p>

      {/* Controls */}
      <ResponsiveCard style={{ marginBottom: '30px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          alignItems: 'end'
        }}>
          <ResponsiveFormGroup style={{ marginBottom: 0 }}>
            <ResponsiveLabel>Tabaksorten durchsuchen</ResponsiveLabel>
            <div style={{ position: 'relative' }}>
              <ResponsiveInput
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nach Name oder Marke suchen..."
                style={{ paddingRight: '40px' }}
              />
              <FaSearch style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.5)',
                opacity: 0.5
              }} />
            </div>
          </ResponsiveFormGroup>

          <ResponsiveFormGroup style={{ marginBottom: 0 }}>
            <ResponsiveLabel>Alle Marken</ResponsiveLabel>
            <ResponsiveSelect
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">Alle Marken</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </ResponsiveSelect>
          </ResponsiveFormGroup>

          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <ResponsiveButton
              $variant="secondary"
              $size="small"
              onClick={handleDebug}
              disabled={isDebugging}
              style={{
                background: 'rgba(255, 152, 0, 0.2)',
                borderColor: 'rgba(255, 152, 0, 0.5)',
                color: '#ff9800'
              }}
            >
              <FaCog />
              {isDebugging ? 'Debug...' : 'Debug System'}
            </ResponsiveButton>

            <ResponsiveButton
              $variant="secondary"
              $size="small"
              onClick={handleSync}
              disabled={isSyncing}
              style={{
                background: 'rgba(76, 175, 80, 0.2)',
                borderColor: 'rgba(76, 175, 80, 0.5)',
                color: '#4caf50'
              }}
            >
              <FaSync />
              {isSyncing ? 'Sync...' : 'Sync Products'}
            </ResponsiveButton>
          </div>
        </div>
      </ResponsiveCard>

      {/* Results */}
      {filteredTobaccos.length === 0 ? (
        <ResponsiveEmptyState>
          <div className="empty-icon">
            <FaLeaf />
          </div>
          <div className="empty-title">Noch keine Tabaksorten im Katalog vorhanden.</div>
          <div className="empty-description">
            {catalog?.tobaccos?.length === 0 ? (
              <>
                Klicken Sie auf "Sync Products" um vorhandene Tabakprodukte zu synchronisieren,
                oder erstellen Sie neue Tabakprodukte in der Produktverwaltung.
              </>
            ) : (
              'Versuchen Sie es mit anderen Suchbegriffen oder wählen Sie eine andere Marke.'
            )}
          </div>
        </ResponsiveEmptyState>
      ) : (
        <ResponsiveCardGrid>
          {filteredTobaccos.map((tobacco) => (
            <ResponsiveCard key={tobacco.id}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px'
              }}>
                <h3 style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: '1.2rem',
                  color: '#FF1493',
                  margin: 0,
                  textTransform: 'uppercase'
                }}>
                  {getTextValue(tobacco.name)}
                </h3>
                <span style={{
                  background: 'rgba(255, 20, 147, 0.1)',
                  color: '#FF1493',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontFamily: 'Aldrich, sans-serif',
                  fontWeight: '600'
                }}>
                  {tobacco.brand}
                </span>
              </div>

              {tobacco.description && (
                <p style={{
                  fontFamily: 'Aldrich, sans-serif',
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginBottom: '15px',
                  lineHeight: '1.5'
                }}>
                  {getTextValue(tobacco.description)}
                </p>
              )}

              {tobacco.price && (
                <div style={{
                  fontSize: '1.1rem',
                  fontFamily: 'Oswald, sans-serif',
                  color: '#FF1493',
                  fontWeight: '800',
                  marginBottom: '20px'
                }}>
                  {tobacco.price}€
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <ResponsiveButton
                  $size="small"
                  onClick={() => handleAddToMenu(tobacco)}
                  style={{ flex: 1, minWidth: '120px' }}
                >
                  <FaPlus />
                  Zur Karte
                </ResponsiveButton>

                <ResponsiveButton
                  $variant="danger"
                  $size="small"
                  onClick={() => handleRemoveFromCatalog(tobacco)}
                >
                  <FaTrash />
                </ResponsiveButton>
              </div>
            </ResponsiveCard>
          ))}
        </ResponsiveCardGrid>
      )}

      {/* Statistics */}
      <ResponsiveCard style={{ marginTop: '30px', textAlign: 'center' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <div style={{
              fontSize: '1.5rem',
              fontFamily: 'Oswald, sans-serif',
              color: '#FF1493',
              fontWeight: '800'
            }}>
              {catalog?.tobaccos?.length || 0}
            </div>
            <div style={{
              fontSize: '0.8rem',
              fontFamily: 'Aldrich, sans-serif',
              color: 'rgba(255, 255, 255, 0.6)',
              textTransform: 'uppercase'
            }}>
              Tabaksorten
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '1.5rem',
              fontFamily: 'Oswald, sans-serif',
              color: '#FF1493',
              fontWeight: '800'
            }}>
              {uniqueBrands.length}
            </div>
            <div style={{
              fontSize: '0.8rem',
              fontFamily: 'Aldrich, sans-serif',
              color: 'rgba(255, 255, 255, 0.6)',
              textTransform: 'uppercase'
            }}>
              Marken
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '1.5rem',
              fontFamily: 'Oswald, sans-serif',
              color: '#FF1493',
              fontWeight: '800'
            }}>
              {filteredTobaccos.length}
            </div>
            <div style={{
              fontSize: '0.8rem',
              fontFamily: 'Aldrich, sans-serif',
              color: 'rgba(255, 255, 255, 0.6)',
              textTransform: 'uppercase'
            }}>
              Gefiltert
            </div>
          </div>
        </div>
      </ResponsiveCard>
    </ResponsiveMainContent>
  );
};

export default ResponsiveTobaccoCatalog;