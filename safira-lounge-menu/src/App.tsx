import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import './styles/globals.css';
import './i18n/config';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { KioskProvider } from './contexts/KioskContext';
import ErrorBoundary from './components/Common/ErrorBoundary';
import { KioskExitButton } from './components/Common/KioskExitButton';
import SkipLink from './components/Common/SkipLink';
import LiveRegion from './components/Common/LiveRegion';
import PagePreloader from './components/Common/PagePreloader';
import { usePageTransition } from './hooks/usePageTransition';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import AdminPage from './pages/AdminPage';
import TablePage from './pages/TablePage';

const AppContainer = styled.div`
  min-height: 100vh;
  height: 100vh;
  position: relative;
  background: #000;
  
  /* Mobile viewport fixes */
  @supports (-webkit-touch-callout: none) {
    /* iOS Safari */
    height: -webkit-fill-available;
    min-height: -webkit-fill-available;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  min-height: 100vh;
  height: 100vh;
  
  @supports (-webkit-touch-callout: none) {
    height: -webkit-fill-available;
    min-height: -webkit-fill-available;
  }
`;

const AppContent: React.FC = () => {
  const { isLoading } = usePageTransition({ minLoadTime: 500 });

  return (
    <AppContainer>
      {/* Page transition preloader */}
      <PagePreloader isLoading={isLoading} loadingText="Lädt..." />

      {/* Skip navigation for keyboard users */}
      <SkipLink href="main-content">Skip to main content</SkipLink>
      <SkipLink href="navigation">Skip to navigation</SkipLink>

      {/* Global live region for screen reader announcements */}
      <LiveRegion
        id="global-announcements"
        priority="polite"
        aria-label="Global status updates"
      />

      {/* Kiosk Exit Button (only shown in kiosk mode) */}
      <KioskExitButton />

      <ContentWrapper id="main-content" role="main">
        <ErrorBoundary>
          <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route 
                      path="/menu" 
                      element={
                        <ErrorBoundary>
                          <MenuPage />
                        </ErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/menu/:category" 
                      element={
                        <ErrorBoundary>
                          <MenuPage />
                        </ErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/admin/*" 
                      element={
                        <ErrorBoundary>
                          <AdminPage />
                        </ErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/table/:tableId" 
                      element={
                        <ErrorBoundary>
                          <TablePage />
                        </ErrorBoundary>
                      } 
                    />
          </Routes>
        </ErrorBoundary>
      </ContentWrapper>
    </AppContainer>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <KioskProvider>
          <LanguageProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </LanguageProvider>
        </KioskProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;