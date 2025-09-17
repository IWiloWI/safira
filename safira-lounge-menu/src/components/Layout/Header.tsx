import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../Common/LanguageToggle';

const HeaderContainer = styled.header<{ scrolled: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: ${props => props.scrolled 
    ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.92), rgba(255, 240, 255, 0.95))' 
    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.85), rgba(255, 240, 255, 0.90))'};
  backdrop-filter: blur(30px);
  border-bottom: ${props => props.scrolled ? '1px solid rgba(233, 30, 99, 0.4)' : '1px solid rgba(233, 30, 99, 0.3)'};
  box-shadow: 0 4px 30px rgba(233, 30, 99, 0.15);
  transition: all 0.4s ease;
  padding: ${props => props.scrolled ? '15px 0' : '20px 0'};
`;

const HeaderWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
`;

const LogoImg = styled.img`
  height: 60px;
  width: auto;
  filter: drop-shadow(0 0 15px rgba(255, 65, 251, 0.7)) 
          drop-shadow(0 0 25px rgba(255, 255, 255, 0.3));
  transition: all 0.3s ease;

  &:hover {
    filter: drop-shadow(0 0 20px rgba(255, 65, 251, 0.9)) 
            drop-shadow(0 0 35px rgba(255, 255, 255, 0.5));
    transform: scale(1.05);
  }
`;

const LogoText = styled.h1`
  font-family: 'Oswald', sans-serif;
  font-size: 1.8rem;
  color: #1A1A2E;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-left: 15px;
  position: relative;
  font-weight: 800;
  background: linear-gradient(45deg, #E91E63, #FFD700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 8px rgba(233, 30, 99, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #E91E63, #FFD700, transparent);
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(233, 30, 99, 0.3);
  }
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
    margin-left: 10px;
  }
`;

const Nav = styled.nav<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 30px;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    right: ${props => props.isOpen ? '0' : '-100%'};
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.98);
    flex-direction: column;
    justify-content: center;
    transition: right 0.3s ease;
  }
`;

const NavLink = styled(Link)<{ active: boolean }>`
  font-family: 'Aldrich', sans-serif;
  color: ${props => props.active ? '#E91E63' : '#1A1A2E'};
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  transition: all 0.4s ease;
  font-weight: 600;

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: ${props => props.active ? '100%' : '0'};
    height: 3px;
    background: linear-gradient(90deg, #E91E63, #FFD700);
    transition: width 0.4s ease;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(233, 30, 99, 0.4);
  }

  &:hover {
    color: #E91E63;
    text-shadow: 0 2px 8px rgba(233, 30, 99, 0.4);
    transform: translateY(-2px);
    &::after {
      width: 100%;
    }
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
    color: ${props => props.active ? '#E91E63' : '#1A1A2E'};
  }
`;

const MenuToggle = styled.button`
  display: none;
  background: none;
  border: none;
  color: #FF41FB;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1001;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navItems = [
    { path: '/menu', label: t('navigation.menu') },
    { path: '/admin', label: t('navigation.admin') }
  ];

  return (
    <HeaderContainer scrolled={scrolled}>
      <HeaderWrapper>
        <Logo to="/menu">
          <LogoImg src="/images/safira_logo.png" alt="Safira Lounge" />
          <LogoText>Safira</LogoText>
        </Logo>

        <Nav isOpen={mobileMenuOpen}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              active={location.pathname === item.path}
            >
              {item.label}
            </NavLink>
          ))}
          <LanguageToggle />
        </Nav>

        <MenuToggle onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </MenuToggle>
      </HeaderWrapper>
    </HeaderContainer>
  );
};

export default Header;