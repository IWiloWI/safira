import React, { useState } from 'react';
import styled from 'styled-components';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AdminLogin from '../components/Admin/AdminLogin';
import AdminDashboard from '../components/Admin/AdminDashboard';
import ProductManager from '../components/Admin/ProductManager';
import QRGenerator from '../components/Admin/QRGenerator';
import Analytics from '../components/Admin/Analytics';
import TobaccoCatalog from '../components/Admin/TobaccoCatalog';
import AdminSidebar from '../components/Admin/AdminSidebar';
import VideoManager from '../components/Admin/VideoManager';
import CategoryManager from '../components/Admin/CategoryManager';
import SubcategoryManager from '../components/Admin/SubcategoryManager';
import NavigationSettings from '../components/Admin/NavigationSettings';
import { FaTachometerAlt, FaBoxes, FaLeaf, FaQrcode, FaChartBar, FaBars, FaVideo, FaFolder, FaLayerGroup, FaCog } from 'react-icons/fa';

const AdminContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const AdminHeader = styled.div`
  background: rgba(255, 65, 251, 0.1);
  border-bottom: 2px solid rgba(255, 65, 251, 0.3);
  padding: 15px 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  backdrop-filter: blur(15px);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const AdminTitle = styled.h1`
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  color: #FF41FB;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 0 0 10px rgba(255, 65, 251, 0.5);
`;

const NavButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: ${props => props.$active ? 'rgba(255, 65, 251, 0.3)' : 'transparent'};
  border: 2px solid ${props => props.$active ? '#FF41FB' : 'rgba(255, 65, 251, 0.3)'};
  border-radius: 8px;
  color: ${props => props.$active ? '#FF41FB' : 'rgba(255, 255, 255, 0.8)'};
  font-family: 'Aldrich', sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 65, 251, 0.2);
    border-color: #FF41FB;
    color: #FF41FB;
    transform: translateY(-1px);
  }

  svg {
    font-size: 1rem;
  }
`;

const AdminMainContent = styled.div`
  display: flex;
  flex: 1;
`;

const AdminContent = styled.div`
  flex: 1;
  padding: 40px;
  margin-left: 280px;

  @media (max-width: 968px) {
    margin-left: 0;
    padding: 20px;
  }
`;

const LoginContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
`;

const AdminPage: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <LoginContainer>
        <AdminLogin />
      </LoginContainer>
    );
  }

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/admin/products', label: 'Produkte', icon: <FaBoxes /> },
    { path: '/admin/subcategories', label: 'Unterkategorien', icon: <FaLayerGroup /> },
    { path: '/admin/tobacco-catalog', label: 'Tabak-Katalog', icon: <FaLeaf /> },
    { path: '/admin/videos', label: 'Video-Manager', icon: <FaVideo /> },
    { path: '/admin/categories', label: 'Kategorien', icon: <FaFolder /> },
    { path: '/admin/navigation', label: 'Navigation', icon: <FaCog /> },
    { path: '/admin/qr-codes', label: 'QR-Codes', icon: <FaQrcode /> },
    { path: '/admin/analytics', label: 'Analytics', icon: <FaChartBar /> }
  ];

  return (
    <AdminContainer>
      <AdminHeader>
        <AdminTitle>Admin Panel</AdminTitle>
        {navItems.map(item => (
          <NavButton 
            key={item.path}
            $active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            {item.label}
          </NavButton>
        ))}
        <NavButton onClick={logout} style={{ marginLeft: 'auto', background: 'rgba(244, 67, 54, 0.2)', borderColor: 'rgba(244, 67, 54, 0.5)', color: '#f44336' }}>
          Abmelden
        </NavButton>
      </AdminHeader>
      
      <AdminMainContent>
        <AdminSidebar />
        <AdminContent>
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/products" element={<ProductManager />} />
            <Route path="/subcategories" element={<SubcategoryManager />} />
            <Route path="/tobacco-catalog" element={<TobaccoCatalog />} />
            <Route path="/videos" element={<VideoManager />} />
            <Route path="/categories" element={<CategoryManager />} />
            <Route path="/navigation" element={<NavigationSettings />} />
            <Route path="/qr-codes" element={<QRGenerator />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </AdminContent>
      </AdminMainContent>
    </AdminContainer>
  );
};

export default AdminPage;