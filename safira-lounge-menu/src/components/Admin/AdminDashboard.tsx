import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaBoxes, 
  FaQrcode, 
  FaChartBar, 
  FaUsers,
  FaEye,
  FaArrowUp,
  FaLeaf,
  FaSignOutAlt,
  FaVideo
} from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getProducts, getAnalytics } from '../../services/api';

const DashboardContainer = styled.div`
  max-width: 1200px;
`;

const DashboardHeader = styled.div`
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const DashboardHeaderContent = styled.div`
  flex: 1;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(244, 67, 54, 0.2);
  border: 2px solid rgba(244, 67, 54, 0.5);
  border-radius: 12px;
  color: #f44336;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(244, 67, 54, 0.3);
    border-color: #f44336;
    box-shadow: 0 5px 15px rgba(244, 67, 54, 0.3);
    transform: translateY(-2px);
  }
`;

const DashboardTitle = styled.h1`
  font-family: 'Oswald', sans-serif;
  font-size: 2.5rem;
  color: #FF41FB;
  text-transform: uppercase;
  margin-bottom: 10px;
  text-shadow: 0 0 20px rgba(255, 65, 251, 0.8);
`;

const DashboardSubtitle = styled.p`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 65, 251, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 15px;
  padding: 25px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    border-color: #FF41FB;
    box-shadow: 0 10px 30px rgba(255, 65, 251, 0.2);
    transform: translateY(-5px);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #FF41FB, #ff21f5);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
`;

const StatTrend = styled.div.withConfig({
  shouldForwardProp: (prop) => !['positive'].includes(prop),
})<{ positive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${props => props.positive ? '#4CAF50' : '#f44336'};
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
`;

const StatValue = styled.div`
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: #FF41FB;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const ActionCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(255, 65, 251, 0.2), rgba(255, 65, 251, 0.1));
  border: 2px solid rgba(255, 65, 251, 0.4);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #FF41FB;
    box-shadow: 0 10px 25px rgba(255, 65, 251, 0.3);
    transform: translateY(-3px);
  }
`;

const ActionIcon = styled.div`
  font-size: 2.5rem;
  color: #FF41FB;
  margin-bottom: 15px;
`;

const ActionTitle = styled.h3`
  font-family: 'Oswald', sans-serif;
  color: #FF41FB;
  font-size: 1.2rem;
  margin-bottom: 8px;
  text-transform: uppercase;
`;

const ActionDescription = styled.p`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.4;
`;

const RecentActivity = styled.div`
  background: rgba(255, 65, 251, 0.08);
  border: 2px solid rgba(255, 65, 251, 0.2);
  border-radius: 15px;
  padding: 30px;
`;

const ActivityHeader = styled.h2`
  font-family: 'Oswald', sans-serif;
  color: #FF41FB;
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-transform: uppercase;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 65, 251, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityTime = styled.span`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  min-width: 60px;
`;

const ActivityDescription = styled.span`
  font-family: 'Aldrich', sans-serif;
  color: white;
  font-size: 0.9rem;
`;

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
      const totalProducts = productsData.categories.reduce((acc, cat) => acc + cat.items.length, 0);
      const activeProducts = productsData.categories.reduce((acc, cat) => 
        acc + cat.items.filter((item: any) => item.available !== false).length, 0);
      const totalCategories = productsData.categories.length;

      // Load analytics data
      let qrScans = 0;
      let activityData: Array<{time: string, description: string, timestamp: string, type: string, user?: string, data: any}> = [];
      
      try {
        const analyticsData = await getAnalytics();
        qrScans = analyticsData.totalQRScans || 0;
        activityData = analyticsData.recentActivity || [];
      } catch (analyticsError) {
        console.log('Analytics not available, using defaults');
        // Fallback activity data
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

      setStats({
        totalProducts,
        activeProducts,
        totalCategories,
        qrScans
      });
      
      setRecentActivity(activityData);
      
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
    },
    {
      icon: <FaQrcode />,
      title: 'QR-Codes erstellen',
      description: 'QR-Codes für Tische generieren und herunterladen',
      action: () => window.location.href = '/admin/qr-codes'
    },
    {
      icon: <FaChartBar />,
      title: 'Analytics anzeigen',
      description: 'Statistiken und Berichte einsehen',
      action: () => window.location.href = '/admin/analytics'
    }
  ];


  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardHeaderContent>
          <DashboardTitle>{t('admin.dashboard')}</DashboardTitle>
          <DashboardSubtitle>
            Verwalten Sie Ihre Safira Lounge Speisekarte
          </DashboardSubtitle>
        </DashboardHeaderContent>
        <LogoutButton onClick={logout}>
          <FaSignOutAlt />
          {t('admin.logout')}
        </LogoutButton>
      </DashboardHeader>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatHeader>
            <StatIcon>
              <FaBoxes />
            </StatIcon>
            {!isLoading && (
              <StatTrend positive={stats.totalProducts > 100}>
                <FaArrowUp />
                {stats.totalProducts > 100 ? '+' : ''}
                {Math.round((stats.totalProducts / 100) * 100)}%
              </StatTrend>
            )}
          </StatHeader>
          <StatValue>{isLoading ? '...' : stats.totalProducts}</StatValue>
          <StatLabel>Gesamt Produkte</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatHeader>
            <StatIcon>
              <FaEye />
            </StatIcon>
            {!isLoading && (
              <StatTrend positive={stats.activeProducts > stats.totalProducts * 0.8}>
                <FaArrowUp />
                {Math.round((stats.activeProducts / stats.totalProducts) * 100)}%
              </StatTrend>
            )}
          </StatHeader>
          <StatValue>{isLoading ? '...' : stats.activeProducts}</StatValue>
          <StatLabel>Verfügbare Produkte</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatHeader>
            <StatIcon>
              <FaUsers />
            </StatIcon>
          </StatHeader>
          <StatValue>{isLoading ? '...' : stats.totalCategories}</StatValue>
          <StatLabel>Kategorien</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatHeader>
            <StatIcon>
              <FaQrcode />
            </StatIcon>
            {!isLoading && stats.qrScans > 0 && (
              <StatTrend positive>
                <FaArrowUp />
                {stats.qrScans} Scans
              </StatTrend>
            )}
          </StatHeader>
          <StatValue>{isLoading ? '...' : stats.qrScans}</StatValue>
          <StatLabel>QR-Code Scans</StatLabel>
        </StatCard>
      </StatsGrid>

      <QuickActions>
        {quickActions.map((action, index) => (
          <ActionCard
            key={index}
            onClick={action.action}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ActionIcon>{action.icon}</ActionIcon>
            <ActionTitle>{action.title}</ActionTitle>
            <ActionDescription>{action.description}</ActionDescription>
          </ActionCard>
        ))}
      </QuickActions>

      <RecentActivity>
        <ActivityHeader>Letzte Aktivitäten</ActivityHeader>
        {recentActivity.map((activity, index) => (
          <ActivityItem key={index}>
            <ActivityTime>{activity.time}</ActivityTime>
            <ActivityDescription>
              <strong>{activity.user || 'Admin'}:</strong> {activity.description}
            </ActivityDescription>
          </ActivityItem>
        ))}
      </RecentActivity>
    </DashboardContainer>
  );
};

export default AdminDashboard;