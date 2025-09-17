import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaChartBar, 
  FaEye, 
  FaClock, 
  FaMobile, 
  FaDesktop,
  FaGlobe,
  FaQrcode,
  FaUsers,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const AnalyticsContainer = styled.div`
  max-width: 1200px;
`;

const Header = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-family: 'Oswald', sans-serif;
  font-size: 2.5rem;
  color: #FF41FB;
  text-transform: uppercase;
  margin-bottom: 10px;
  text-shadow: 0 0 20px rgba(255, 65, 251, 0.8);
`;

const Subtitle = styled.p`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
`;

const StatsOverview = styled.div`
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

const StatTrend = styled.div<{ positive?: boolean }>`
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

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 40px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: rgba(255, 65, 251, 0.08);
  border: 2px solid rgba(255, 65, 251, 0.2);
  border-radius: 15px;
  padding: 30px;
`;

const ChartTitle = styled.h3`
  font-family: 'Oswald', sans-serif;
  color: #FF41FB;
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-transform: uppercase;
`;

const SimpleChart = styled.div`
  height: 200px;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 10px;
  padding: 20px 0;
  border-bottom: 2px solid rgba(255, 65, 251, 0.3);
  position: relative;
`;

const ChartBar = styled(motion.div)<{ height: number }>`
  background: linear-gradient(to top, #FF41FB, #ff21f5);
  width: 40px;
  height: ${props => props.height}%;
  border-radius: 4px 4px 0 0;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const ChartLabel = styled.span`
  position: absolute;
  bottom: -25px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  width: 100%;
`;

const ChartValue = styled.span`
  position: absolute;
  top: -20px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.7rem;
  color: white;
  background: rgba(0, 0, 0, 0.7);
  padding: 2px 6px;
  border-radius: 4px;
`;

const TopItems = styled.div`
  height: 300px;
  overflow-y: auto;
`;

const TopItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 65, 251, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

const ItemName = styled.span`
  font-family: 'Aldrich', sans-serif;
  color: white;
  font-size: 0.9rem;
`;

const ItemCount = styled.span`
  font-family: 'Oswald', sans-serif;
  color: #FF41FB;
  font-weight: 800;
`;

const TableAnalytics = styled.div`
  margin-top: 30px;
`;

const TableGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const TableCard = styled.div<{ activity: number }>`
  background: ${props => {
    if (props.activity === 0) return 'rgba(108, 117, 125, 0.2)';
    if (props.activity <= 2) return 'rgba(76, 175, 80, 0.2)';
    if (props.activity <= 5) return 'rgba(255, 193, 7, 0.2)';
    return 'rgba(255, 65, 251, 0.2)';
  }};
  border: 2px solid ${props => {
    if (props.activity === 0) return 'rgba(108, 117, 125, 0.5)';
    if (props.activity <= 2) return 'rgba(76, 175, 80, 0.5)';
    if (props.activity <= 5) return 'rgba(255, 193, 7, 0.5)';
    return '#FF41FB';
  }};
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
`;

const TableNumber = styled.div`
  font-family: 'Oswald', sans-serif;
  font-size: 1.2rem;
  color: #FF41FB;
  margin-bottom: 5px;
  font-weight: 800;
`;

const TableScans = styled.div`
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
`;

const DeviceBreakdown = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
`;

const DeviceCard = styled.div`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 65, 251, 0.3);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
`;

const DeviceIcon = styled.div`
  font-size: 2rem;
  color: #FF41FB;
  margin-bottom: 10px;
`;

const DevicePercent = styled.div`
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: #FF41FB;
`;

const DeviceLabel = styled.div`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-top: 5px;
`;

const Analytics: React.FC = () => {
  const { t } = useLanguage();
  const [analyticsData, setAnalyticsData] = useState({
    totalViews: 0,
    qrScans: 0,
    avgSessionTime: '0:00',
    mobileUsers: 0,
    desktopUsers: 0,
    tableActivity: {} as { [key: string]: number },
    popularCategories: [] as { name: string; views: number }[],
    hourlyData: [] as { hour: string; views: number }[]
  });

  useEffect(() => {
    // Simulate loading analytics data
    // In a real app, this would come from your analytics API
    const tableAnalytics = JSON.parse(localStorage.getItem('tableAnalytics') || '[]');
    
    // Process table activity
    const tableActivity: { [key: string]: number } = {};
    tableAnalytics.forEach((access: any) => {
      tableActivity[access.tableId] = (tableActivity[access.tableId] || 0) + 1;
    });

    // Generate mock data
    const mockData = {
      totalViews: 1247,
      qrScans: tableAnalytics.length,
      avgSessionTime: '2:34',
      mobileUsers: Math.floor(1247 * 0.78), // 78% mobile
      desktopUsers: Math.floor(1247 * 0.22), // 22% desktop
      tableActivity,
      popularCategories: [
        { name: 'Shisha Standard', views: 456 },
        { name: 'Cocktails', views: 342 },
        { name: 'Mocktails', views: 289 },
        { name: 'Softdrinks', views: 234 },
        { name: 'Red Bull', views: 198 },
        { name: 'Snacks', views: 167 }
      ],
      hourlyData: [
        { hour: '15:00', views: 23 },
        { hour: '16:00', views: 45 },
        { hour: '17:00', views: 67 },
        { hour: '18:00', views: 89 },
        { hour: '19:00', views: 123 },
        { hour: '20:00', views: 156 },
        { hour: '21:00', views: 198 },
        { hour: '22:00', views: 234 },
        { hour: '23:00', views: 203 },
        { hour: '00:00', views: 145 },
        { hour: '01:00', views: 87 }
      ]
    };

    setAnalyticsData(mockData);
  }, []);

  const maxHourlyViews = Math.max(...analyticsData.hourlyData.map(d => d.views));

  // Generate table cards for tables 1-20
  const renderTableCards = () => {
    const tables = Array.from({ length: 20 }, (_, i) => (i + 1).toString());
    return tables.map(tableId => {
      const scans = analyticsData.tableActivity[tableId] || 0;
      return (
        <TableCard key={tableId} activity={scans}>
          <TableNumber>Tisch {tableId}</TableNumber>
          <TableScans>{scans} Scans</TableScans>
        </TableCard>
      );
    });
  };

  return (
    <AnalyticsContainer>
      <Header>
        <Title>{t('admin.analytics')}</Title>
        <Subtitle>
          Einblicke in die Nutzung Ihrer digitalen Speisekarte
        </Subtitle>
      </Header>

      <StatsOverview>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatHeader>
            <StatIcon>
              <FaEye />
            </StatIcon>
            <StatTrend positive>
              <FaArrowUp />
              +12%
            </StatTrend>
          </StatHeader>
          <StatValue>{analyticsData.totalViews.toLocaleString()}</StatValue>
          <StatLabel>Gesamte Aufrufe</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatHeader>
            <StatIcon>
              <FaQrcode />
            </StatIcon>
            <StatTrend positive>
              <FaArrowUp />
              +8%
            </StatTrend>
          </StatHeader>
          <StatValue>{analyticsData.qrScans}</StatValue>
          <StatLabel>QR-Code Scans</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatHeader>
            <StatIcon>
              <FaClock />
            </StatIcon>
            <StatTrend>
              <FaArrowDown />
              -3%
            </StatTrend>
          </StatHeader>
          <StatValue>{analyticsData.avgSessionTime}</StatValue>
          <StatLabel>Ø Sitzungsdauer</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatHeader>
            <StatIcon>
              <FaUsers />
            </StatIcon>
            <StatTrend positive>
              <FaArrowUp />
              +15%
            </StatTrend>
          </StatHeader>
          <StatValue>
            {((analyticsData.mobileUsers + analyticsData.desktopUsers) / 7).toFixed(0)}
          </StatValue>
          <StatLabel>Ø Tägl. Nutzer</StatLabel>
        </StatCard>
      </StatsOverview>

      <ChartsSection>
        <ChartCard>
          <ChartTitle>Stündliche Aufrufe</ChartTitle>
          <SimpleChart>
            {analyticsData.hourlyData.map((data, index) => (
              <ChartBar
                key={data.hour}
                height={(data.views / maxHourlyViews) * 100}
                initial={{ height: 0 }}
                animate={{ height: (data.views / maxHourlyViews) * 100 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
              >
                <ChartValue>{data.views}</ChartValue>
                <ChartLabel>{data.hour}</ChartLabel>
              </ChartBar>
            ))}
          </SimpleChart>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Beliebte Kategorien</ChartTitle>
          <TopItems>
            {analyticsData.popularCategories.map((category, index) => (
              <TopItem key={category.name}>
                <ItemName>{category.name}</ItemName>
                <ItemCount>{category.views}</ItemCount>
              </TopItem>
            ))}
          </TopItems>
        </ChartCard>
      </ChartsSection>

      <ChartCard>
        <ChartTitle>Gerätenutzung</ChartTitle>
        <DeviceBreakdown>
          <DeviceCard>
            <DeviceIcon>
              <FaMobile />
            </DeviceIcon>
            <DevicePercent>
              {Math.round((analyticsData.mobileUsers / (analyticsData.mobileUsers + analyticsData.desktopUsers)) * 100)}%
            </DevicePercent>
            <DeviceLabel>Mobile ({analyticsData.mobileUsers})</DeviceLabel>
          </DeviceCard>
          <DeviceCard>
            <DeviceIcon>
              <FaDesktop />
            </DeviceIcon>
            <DevicePercent>
              {Math.round((analyticsData.desktopUsers / (analyticsData.mobileUsers + analyticsData.desktopUsers)) * 100)}%
            </DevicePercent>
            <DeviceLabel>Desktop ({analyticsData.desktopUsers})</DeviceLabel>
          </DeviceCard>
        </DeviceBreakdown>
      </ChartCard>

      <TableAnalytics>
        <ChartTitle>Tischaktivität</ChartTitle>
        <p style={{ 
          fontFamily: 'Aldrich, sans-serif', 
          color: 'rgba(255, 255, 255, 0.6)', 
          fontSize: '0.9rem',
          marginBottom: '20px'
        }}>
          QR-Code Scans pro Tisch - Grau: 0, Grün: 1-2, Gelb: 3-5, Pink: 6+
        </p>
        <TableGrid>
          {renderTableCards()}
        </TableGrid>
      </TableAnalytics>
    </AnalyticsContainer>
  );
};

export default Analytics;