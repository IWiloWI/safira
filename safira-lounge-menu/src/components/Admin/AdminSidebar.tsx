import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaTachometerAlt,
  FaBoxes,
  FaQrcode,
  FaChartBar,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaLeaf,
  FaVideo,
  FaLayerGroup,
  FaDesktop
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const SidebarContainer = styled(motion.aside).withConfig({
  shouldForwardProp: (prop) => !['isOpen'].includes(prop),
})<{ isOpen: boolean }>`
  position: fixed;
  top: 80px;
  left: ${props => props.isOpen ? '0' : '-280px'};
  width: 280px;
  height: calc(100vh - 80px);
  background: rgba(255, 65, 251, 0.1);
  border-right: 2px solid rgba(255, 65, 251, 0.3);
  backdrop-filter: blur(15px);
  padding: 30px 0;
  transition: left 0.3s ease;
  z-index: 100;

  @media (max-width: 968px) {
    top: 0;
    height: 100vh;
    background: rgba(0, 0, 0, 0.95);
  }
`;

const SidebarHeader = styled.div`
  padding: 0 30px 30px;
  border-bottom: 2px solid rgba(255, 65, 251, 0.3);
  margin-bottom: 30px;
`;

const SidebarTitle = styled.h3`
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  color: #FF41FB;
  text-transform: uppercase;
  text-align: center;
  text-shadow: 0 0 15px rgba(255, 65, 251, 0.8);
`;

const SidebarNav = styled.nav`
  padding: 0 20px;
`;

const NavItem = styled(Link).withConfig({
  shouldForwardProp: (prop) => !['active'].includes(prop),
})<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  margin-bottom: 10px;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, rgba(255, 65, 251, 0.3), rgba(255, 65, 251, 0.1))' 
    : 'transparent'};
  border: 2px solid ${props => props.active ? '#FF41FB' : 'transparent'};
  border-radius: 12px;
  color: ${props => props.active ? '#FF41FB' : 'white'};
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(255, 65, 251, 0.2), rgba(255, 65, 251, 0.1));
    border-color: rgba(255, 65, 251, 0.5);
    transform: translateX(5px);
  }

  svg {
    font-size: 1.2rem;
  }
`;

const LogoutButton = styled.button`
  position: absolute;
  bottom: 30px;
  left: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
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
  }
`;

const MobileToggle = styled.button`
  display: none;
  position: fixed;
  top: 90px;
  left: 20px;
  z-index: 101;
  background: rgba(255, 65, 251, 0.9);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 10px;
  cursor: pointer;
  backdrop-filter: blur(10px);

  @media (max-width: 968px) {
    display: block;
  }
`;

const Overlay = styled.div.withConfig({
  shouldForwardProp: (prop) => !['show'].includes(prop),
})<{ show: boolean }>`
  display: none;
  
  @media (max-width: 968px) {
    display: ${props => props.show ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    z-index: 99;
  }
`;

const AdminSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    {
      path: '/admin/dashboard',
      label: t('admin.dashboard'),
      icon: <FaTachometerAlt />
    },
    {
      path: '/admin/products',
      label: t('admin.products'),
      icon: <FaBoxes />
    },
    {
      path: '/admin/subcategories',
      label: 'Unterkategorien',
      icon: <FaLayerGroup />
    },
    {
      path: '/admin/tobacco-catalog',
      label: 'Tabak-Katalog',
      icon: <FaLeaf />
    },
    {
      path: '/admin/videos',
      label: 'Video-Manager',
      icon: <FaVideo />
    },
    {
      path: '/admin/kiosk',
      label: 'Kiosk-Modus',
      icon: <FaDesktop />
    },
    {
      path: '/admin/qr-codes',
      label: t('admin.qrCodes'),
      icon: <FaQrcode />
    },
    {
      path: '/admin/analytics',
      label: t('admin.analytics'),
      icon: <FaChartBar />
    }
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <MobileToggle onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </MobileToggle>

      <Overlay show={isOpen} onClick={() => setIsOpen(false)} />

      <SidebarContainer
        isOpen={isOpen}
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
      >
        <SidebarHeader>
          <SidebarTitle>Admin Panel</SidebarTitle>
        </SidebarHeader>

        <SidebarNav>
          {navItems.map(item => (
            <NavItem
              key={item.path}
              to={item.path}
              active={location.pathname === item.path}
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavItem>
          ))}
        </SidebarNav>

        <LogoutButton onClick={handleLogout}>
          <FaSignOutAlt />
          {t('admin.logout')}
        </LogoutButton>
      </SidebarContainer>
    </>
  );
};

export default AdminSidebar;