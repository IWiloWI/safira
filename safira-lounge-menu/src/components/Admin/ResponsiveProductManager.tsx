import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaTags } from 'react-icons/fa';
import {
  ResponsivePageTitle,
  ResponsiveCardGrid,
  ResponsiveCard,
  ResponsiveButton,
  ResponsiveFormGroup,
  ResponsiveLabel,
  ResponsiveInput,
  ResponsiveSelect,
  ResponsiveLoadingContainer,
  ResponsiveEmptyState,
  ResponsiveStatsGrid,
  ResponsiveStatCard
} from '../../styles/AdminLayout';

// This is a simplified responsive wrapper for the existing ProductManager
// The full implementation would need to be migrated from the existing component

interface Product {
  id: string;
  name_de: string;
  brand?: string;
  price: number;
  category: string;
  available: boolean;
  isTobacco?: boolean;
}

const ResponsiveProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // This would connect to the existing ProductManager logic
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockProducts: Product[] = [
        {
          id: '1',
          name_de: 'Aperol Spritz',
          brand: 'Aperol',
          price: 8.50,
          category: 'Getränke',
          available: true
        },
        {
          id: '2',
          name_de: 'African Crush',
          brand: 'Aqua Mentha',
          price: 15.00,
          category: 'Klassisch',
          available: true,
          isTobacco: true
        }
      ];
      setProducts(mockProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name_de.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map(p => p.category))).sort();
  const stats = {
    total: products.length,
    available: products.filter(p => p.available).length,
    tobacco: products.filter(p => p.isTobacco).length,
    categories: categories.length
  };

  if (loading) {
    return (
      <ResponsiveLoadingContainer>
        <div style={{ textAlign: 'center', color: '#FF1493' }}>
          <FaTags size={40} />
          <p style={{ marginTop: '10px', fontFamily: 'Aldrich, sans-serif' }}>
            Lade Produkte...
          </p>
        </div>
      </ResponsiveLoadingContainer>
    );
  }

  return (
    <div>
      <ResponsivePageTitle style={{ textAlign: 'center', marginBottom: '10px' }}>
        Produktverwaltung
      </ResponsivePageTitle>
      <p style={{
        textAlign: 'center',
        marginBottom: '30px',
        fontFamily: 'Aldrich, sans-serif',
        color: 'rgba(26, 26, 46, 0.8)'
      }}>
        {products.length} von {products.length} Produkten
      </p>

      {/* Statistics */}
      <ResponsiveStatsGrid>
        <ResponsiveStatCard>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Gesamt Produkte</div>
        </ResponsiveStatCard>
        <ResponsiveStatCard>
          <div className="stat-number">{stats.available}</div>
          <div className="stat-label">Verfügbar</div>
        </ResponsiveStatCard>
        <ResponsiveStatCard>
          <div className="stat-number">{stats.tobacco}</div>
          <div className="stat-label">Tabakprodukte</div>
        </ResponsiveStatCard>
        <ResponsiveStatCard>
          <div className="stat-number">{stats.categories}</div>
          <div className="stat-label">Kategorien</div>
        </ResponsiveStatCard>
      </ResponsiveStatsGrid>

      {/* Controls */}
      <ResponsiveCard style={{ marginBottom: '30px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          alignItems: 'end'
        }}>
          <ResponsiveButton
            onClick={() => setShowAddForm(true)}
            style={{ gridColumn: 'span 1' }}
          >
            <FaPlus />
            Produkt hinzufügen
          </ResponsiveButton>

          <ResponsiveFormGroup style={{ marginBottom: 0 }}>
            <ResponsiveLabel>Kategorien</ResponsiveLabel>
            <ResponsiveSelect
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Alle Kategorien</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </ResponsiveSelect>
          </ResponsiveFormGroup>

          <ResponsiveFormGroup style={{ marginBottom: 0 }}>
            <ResponsiveLabel>Sortierung</ResponsiveLabel>
            <ResponsiveSelect defaultValue="name-az">
              <option value="name-az">Name A-Z</option>
              <option value="name-za">Name Z-A</option>
              <option value="price-low">Preis aufsteigend</option>
              <option value="price-high">Preis absteigend</option>
            </ResponsiveSelect>
          </ResponsiveFormGroup>

          <ResponsiveFormGroup style={{ marginBottom: 0 }}>
            <ResponsiveLabel>Suche</ResponsiveLabel>
            <div style={{ position: 'relative' }}>
              <ResponsiveInput
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Produktname oder Marke..."
                style={{ paddingRight: '40px' }}
              />
              <FaSearch style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#1a1a2e',
                opacity: 0.5
              }} />
            </div>
          </ResponsiveFormGroup>
        </div>
      </ResponsiveCard>

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <ResponsiveEmptyState>
          <div className="empty-icon">
            <FaTags />
          </div>
          <div className="empty-title">Keine Produkte gefunden</div>
          <div className="empty-description">
            {products.length === 0 ?
              'Erstellen Sie Ihr erstes Produkt.' :
              'Versuchen Sie es mit anderen Suchbegriffen oder Filtern.'
            }
          </div>
        </ResponsiveEmptyState>
      ) : (
        <ResponsiveCardGrid>
          {filteredProducts.map((product) => (
            <ResponsiveCard key={product.id}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px'
              }}>
                <h3 style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: '1.1rem',
                  color: '#FF1493',
                  margin: 0,
                  textTransform: 'uppercase',
                  flex: 1
                }}>
                  {product.name_de}
                </h3>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}>
                  {product.isTobacco && (
                    <span style={{
                      background: 'rgba(76, 175, 80, 0.2)',
                      color: '#4caf50',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontFamily: 'Aldrich, sans-serif'
                    }}>
                      Tabak
                    </span>
                  )}
                  <span style={{
                    background: product.available ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                    color: product.available ? '#4caf50' : '#f44336',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontFamily: 'Aldrich, sans-serif'
                  }}>
                    {product.available ? 'Verfügbar' : 'Nicht verfügbar'}
                  </span>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '10px',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <div>
                  {product.brand && (
                    <p style={{
                      fontFamily: 'Aldrich, sans-serif',
                      fontSize: '0.9rem',
                      color: '#1a1a2e',
                      margin: '0 0 5px 0',
                      fontWeight: '600'
                    }}>
                      {product.brand}
                    </p>
                  )}
                  <p style={{
                    fontFamily: 'Aldrich, sans-serif',
                    fontSize: '0.8rem',
                    color: 'rgba(26, 26, 46, 0.7)',
                    margin: 0
                  }}>
                    {product.category}
                  </p>
                </div>

                <div style={{
                  fontSize: '1.2rem',
                  fontFamily: 'Oswald, sans-serif',
                  color: '#FF1493',
                  fontWeight: '800'
                }}>
                  {product.price}€
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <ResponsiveButton
                  $variant="secondary"
                  $size="small"
                  style={{ flex: 1, minWidth: '80px' }}
                >
                  <FaEdit />
                  Bearbeiten
                </ResponsiveButton>

                <ResponsiveButton
                  $variant="danger"
                  $size="small"
                >
                  <FaTrash />
                </ResponsiveButton>
              </div>
            </ResponsiveCard>
          ))}
        </ResponsiveCardGrid>
      )}

      {/* Note about full functionality */}
      <ResponsiveCard style={{
        marginTop: '30px',
        textAlign: 'center',
        background: 'rgba(255, 152, 0, 0.1)',
        borderColor: 'rgba(255, 152, 0, 0.3)'
      }}>
        <p style={{
          fontFamily: 'Aldrich, sans-serif',
          color: '#ff9800',
          margin: 0,
          fontSize: '0.9rem'
        }}>
          <strong>Hinweis:</strong> Dies ist die responsive Voransicht der Produktverwaltung.
          Die vollständige Funktionalität wird über die bestehende ProductManager-Komponente bereitgestellt.
        </p>
      </ResponsiveCard>
    </div>
  );
};

export default ResponsiveProductManager;