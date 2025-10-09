import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaBoxes,
  // FaQrcode,  // deaktiviert
  // FaChartBar,  // deaktiviert
  FaUsers,
  FaEye,
  FaArrowUp,
  FaLeaf,
  FaVideo,
  FaCog
} from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getProducts, getAnalytics } from '../../services/api';
import {
  ResponsivePageTitle,
  ResponsiveMainContent,
  ResponsiveStatsGrid,
  ResponsiveStatCard,
  ResponsiveCardGrid,
  ResponsiveCard,
  ResponsiveButton,
  ResponsiveLoadingContainer,
  ResponsiveEmptyState
} from '../../styles/AdminLayout';

// Using responsive components from AdminLayout

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalCategories: 0,
    qrScans: 0
  });
  const [recentActivity, setRecentActivity] = useState<Array<{time: string, description: string, timestamp: string, type: string, user?: string, data: any}>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load products data
      const productsData = await getProducts();
      console.log('[AdminDashboard] Products data:', productsData);

      // Count products including subcategories
      let totalProducts = 0;
      let activeProducts = 0;
      let totalCategories = 0;

      productsData.categories.forEach(cat => {
        // Count main category items
        totalProducts += cat.items?.length || 0;
        activeProducts += cat.items?.filter((item: any) => item.available !== false).length || 0;
        totalCategories++;

        // Count subcategory items
        if (cat.subcategories && Array.isArray(cat.subcategories)) {
          cat.subcategories.forEach(subcat => {
            totalProducts += subcat.items?.length || 0;
            activeProducts += subcat.items?.filter((item: any) => item.available !== false).length || 0;
            totalCategories++; // Count subcategories as categories too
          });
        }
      });

      console.log('[AdminDashboard] Counts:', { totalProducts, activeProducts, totalCategories });

      // Load analytics data
      let qrScans = 0;
      let activityData: Array<{time: string, description: string, timestamp: string, type: string, user?: string, data: any}> = [];

      try {
        const analyticsData = await getAnalytics();
        qrScans = analyticsData.totalQRScans || 0;
        activityData = analyticsData.recentActivity || [];
        console.log('[AdminDashboard] Analytics loaded:', { qrScans, activityCount: activityData.length });
      } catch (analyticsError) {
        console.log('[AdminDashboard] Analytics not available, using fallback data');
      }

      // Always provide fallback activity data if none available
      if (!activityData || activityData.length === 0) {
        console.log('[AdminDashboard] Creating fallback activity data');
        activityData = [
          {
            time: 'Heute',
            description: `Dashboard mit ${totalProducts} Produkten geladen`,
            timestamp: new Date().toISOString(),
            type: 'system',
            user: 'System',
            data: {}
          },
          {
            time: 'Heute',
            description: `${activeProducts} Produkte sind verfügbar`,
            timestamp: new Date().toISOString(),
            type: 'system',
            user: 'System',
            data: {}
          },
          {
            time: 'Heute',
            description: `${totalCategories} Kategorien im System`,
            timestamp: new Date().toISOString(),
            type: 'system',
            user: 'System',
            data: {}
          }
        ];
      }

      console.log('[AdminDashboard] Final activity data:', activityData);

      setStats({
        totalProducts,
        activeProducts,
        totalCategories,
        qrScans
      });

      setRecentActivity(activityData);
      console.log('[AdminDashboard] State updated with stats:', { totalProducts, activeProducts, totalCategories, activityCount: activityData.length });
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Fallback to basic data
      setRecentActivity([
        { 
          time: 'Fehler', 
          description: 'Daten konnten nicht geladen werden',
          timestamp: new Date().toISOString(),
          type: 'error',
          user: 'System',
          data: {}
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      icon: <FaBoxes />,
      title: 'Produkte verwalten',
      description: 'Neue Produkte hinzufügen oder bestehende bearbeiten',
      action: () => window.location.href = '/admin/products'
    },
    {
      icon: <FaLeaf />,
      title: 'Tabak-Katalog',
      description: 'Shisha-Tabaksorten verwalten und zur Karte hinzufügen',
      action: () => window.location.href = '/admin/tobacco-catalog'
    },
    {
      icon: <FaVideo />,
      title: 'Video-Manager',
      description: 'Hintergrundvideos für Kategorien verwalten und ersetzen',
      action: () => window.location.href = '/admin/videos'
    }
    // QR-Codes und Analytics deaktiviert
    // {
    //   icon: <FaQrcode />,
    //   title: 'QR-Codes erstellen',
    //   description: 'QR-Codes für Tische generieren und herunterladen',
    //   action: () => window.location.href = '/admin/qr-codes'
    // },
    // {
    //   icon: <FaChartBar />,
    //   title: 'Analytics anzeigen',
    //   description: 'Statistiken und Berichte einsehen',
    //   action: () => window.location.href = '/admin/analytics'
    // }
  ];


  if (isLoading) {
    return (
      <ResponsiveLoadingContainer>
        <div className="loading-spinner">Lade Dashboard...</div>
      </ResponsiveLoadingContainer>
    );
  }

  return (
    <ResponsiveMainContent>
      <ResponsivePageTitle style={{ marginBottom: '30px', textAlign: 'center' }}>
        Dashboard
      </ResponsivePageTitle>
      <p style={{
        textAlign: 'center',
        marginBottom: '40px',
        fontFamily: 'Aldrich, sans-serif',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '1.1rem'
      }}>
        Verwalten Sie Ihre Safira Lounge Speisekarte
      </p>

      <ResponsiveStatsGrid>
        <ResponsiveStatCard>
          <div className="stat-number">
            <FaBoxes style={{ marginRight: '10px', color: '#FF41FB' }} />
            {stats.totalProducts}
          </div>
          <div className="stat-label">Gesamt Produkte</div>
        </ResponsiveStatCard>

        <ResponsiveStatCard>
          <div className="stat-number">
            <FaEye style={{ marginRight: '10px', color: '#FF41FB' }} />
            {stats.activeProducts}
          </div>
          <div className="stat-label">Verfügbare Produkte</div>
        </ResponsiveStatCard>

        <ResponsiveStatCard>
          <div className="stat-number">
            <FaUsers style={{ marginRight: '10px', color: '#FF41FB' }} />
            {stats.totalCategories}
          </div>
          <div className="stat-label">Kategorien</div>
        </ResponsiveStatCard>

        {/* QR-Code Scans deaktiviert
        <ResponsiveStatCard>
          <div className="stat-number">
            <FaQrcode style={{ marginRight: '10px', color: '#FF41FB' }} />
            {stats.qrScans}
          </div>
          <div className="stat-label">QR-Code Scans</div>
        </ResponsiveStatCard> */}
      </ResponsiveStatsGrid>

      <ResponsiveCardGrid>
        {quickActions.map((action, index) => (
          <ResponsiveCard
            key={index}
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px'
            }}
            onClick={action.action}
          >
            <div style={{
              fontSize: '2.5rem',
              color: '#FF41FB',
              marginBottom: '10px'
            }}>
              {action.icon}
            </div>
            <h3 style={{
              fontFamily: 'Oswald, sans-serif',
              color: '#FF41FB',
              fontSize: '1.2rem',
              margin: '0 0 8px 0',
              textTransform: 'uppercase'
            }}>
              {action.title}
            </h3>
            <p style={{
              fontFamily: 'Aldrich, sans-serif',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.9rem',
              lineHeight: '1.4',
              margin: 0
            }}>
              {action.description}
            </p>
          </ResponsiveCard>
        ))}
      </ResponsiveCardGrid>

      <ResponsiveCard style={{ marginTop: '30px' }}>
        <h2 style={{
          fontFamily: 'Oswald, sans-serif',
          color: '#FF41FB',
          fontSize: '1.5rem',
          marginBottom: '20px',
          textTransform: 'uppercase',
          textAlign: 'center'
        }}>
          Letzte Aktivitäten
        </h2>
        {recentActivity.length === 0 ? (
          <ResponsiveEmptyState>
            <div className="empty-icon">
              <FaCog />
            </div>
            <div className="empty-title">Keine Aktivitäten</div>
            <div className="empty-description">Es sind noch keine Aktivitäten vorhanden.</div>
          </ResponsiveEmptyState>
        ) : (
          recentActivity.map((activity, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '12px 0',
                borderBottom: index < recentActivity.length - 1 ? '1px solid rgba(255, 20, 147, 0.1)' : 'none'
              }}
            >
              <span style={{
                fontFamily: 'Aldrich, sans-serif',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.8rem',
                minWidth: '60px'
              }}>
                {activity.time}
              </span>
              <span style={{
                fontFamily: 'Aldrich, sans-serif',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.9rem'
              }}>
                <strong>{activity.user || 'Admin'}:</strong> {activity.description}
              </span>
            </div>
          ))
        )}
      </ResponsiveCard>
    </ResponsiveMainContent>
  );
};

export default AdminDashboard;