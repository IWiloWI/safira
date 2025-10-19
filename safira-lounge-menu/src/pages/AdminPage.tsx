import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AdminLogin from '../components/Admin/AdminLogin';
import AdminDashboard from '../components/Admin/AdminDashboard';
import ProductManager from '../components/Admin/ProductManager';
// import QRGenerator from '../components/Admin/QRGenerator';
// import Analytics from '../components/Admin/Analytics';
import ResponsiveTobaccoCatalog from '../components/Admin/ResponsiveTobaccoCatalog';
import VideoManager from '../components/Admin/VideoManager';
import CategoryManager from '../components/Admin/CategoryManager';
import SubcategoryManager from '../components/Admin/SubcategoryManager';
import NavigationSettings from '../components/Admin/NavigationSettings';
import { KioskSettings } from '../components/Admin/KioskSettings';
import EventManager from '../components/Admin/EventManager';
import { FaTachometerAlt, FaBoxes, FaLeaf, FaVideo, FaFolder, FaLayerGroup, FaCog, FaSignOutAlt, FaDesktop, FaCalendarAlt } from 'react-icons/fa';
import {
  ResponsiveContainer,
  ResponsivePageHeader,
  ResponsivePageTitle,
  ResponsiveNavBar,
  ResponsiveNavButton,
  ResponsiveMainContent
} from '../styles/AdminLayout';

const AdminPage: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Login page for unauthenticated users
  if (!isAuthenticated) {
    return (
      <ResponsiveContainer>
        <ResponsiveMainContent style={{
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          minHeight: '100vh'
        }}>
          <AdminLogin />
        </ResponsiveMainContent>
      </ResponsiveContainer>
    );
  }

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/admin/products', label: 'Produkte', icon: <FaBoxes /> },
    { path: '/admin/subcategories', label: 'Unterkategorien', icon: <FaLayerGroup /> },
    { path: '/admin/tobacco-catalog', label: 'Tabak-Katalog', icon: <FaLeaf /> },
    { path: '/admin/videos', label: 'Video-Manager', icon: <FaVideo /> },
    { path: '/admin/events', label: 'Events', icon: <FaCalendarAlt /> },
    { path: '/admin/categories', label: 'Kategorien', icon: <FaFolder /> },
    { path: '/admin/navigation', label: 'Navigation', icon: <FaCog /> }
    // { path: '/admin/qr-codes', label: 'QR-Codes', icon: <FaQrcode /> },
    // { path: '/admin/analytics', label: 'Analytics', icon: <FaChartBar /> }
  ];

  return (
    <ResponsiveContainer>
      <ResponsivePageHeader>
        <div className="header-content">
          <ResponsivePageTitle>Admin Panel</ResponsivePageTitle>

          <ResponsiveNavBar>
            {navItems.map(item => (
              <ResponsiveNavButton
                key={item.path}
                $active={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span>{item.label}</span>
              </ResponsiveNavButton>
            ))}
            <ResponsiveNavButton
              onClick={logout}
              style={{
                background: 'rgba(244, 67, 54, 0.2)',
                borderColor: 'rgba(244, 67, 54, 0.5)',
                color: '#f44336'
              }}
            >
              <FaSignOutAlt />
              <span>Abmelden</span>
            </ResponsiveNavButton>
          </ResponsiveNavBar>
        </div>
      </ResponsivePageHeader>

      <ResponsiveMainContent>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/products" element={<ProductManager />} />
          <Route path="/subcategories" element={<SubcategoryManager />} />
          <Route path="/tobacco-catalog" element={<ResponsiveTobaccoCatalog />} />
          <Route path="/videos" element={<VideoManager />} />
          <Route path="/events" element={<EventManager />} />
          <Route path="/categories" element={<CategoryManager />} />
          <Route path="/navigation" element={<NavigationSettings />} />
          <Route path="/kiosk" element={<KioskSettings />} />
          {/* <Route path="/qr-codes" element={<QRGenerator />} /> */}
          {/* <Route path="/analytics" element={<Analytics />} /> */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </ResponsiveMainContent>
    </ResponsiveContainer>
  );
};

export default AdminPage;