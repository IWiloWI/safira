/**
 * WiFiLogin.jsx - WiFi login modal/overlay component
 * Provides secure WiFi authentication with multiple connection methods
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationIcon from './NavigationIcon';

const CONNECTION_METHODS = {
  PASSWORD: 'password',
  QR: 'qr',
  WPS: 'wps',
  GUEST: 'guest'
};

const CONNECTION_STATUS = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  FAILED: 'failed',
  TIMEOUT: 'timeout'
};

const WiFiLogin = ({
  onConnect = () => {},
  onClose = () => {},
  language = 'en',
  availableNetworks = [],
  showQRCode = true,
  showWPS = true,
  showGuestAccess = true,
  autoDetectNetworks = true,
  className = '',
  testId = 'wifi-login',
  ...props
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState(CONNECTION_METHODS.PASSWORD);
  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATUS.IDLE);
  const [networks, setNetworks] = useState(availableNetworks);
  const [isScanning, setIsScanning] = useState(false);
  const [rememberNetwork, setRememberNetwork] = useState(true);
  const [error, setError] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');

  const modalRef = useRef(null);
  const passwordInputRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const connectionTimeoutRef = useRef(null);

  // Translations
  const translations = {
    en: {
      title: 'WiFi Connection',
      selectNetwork: 'Select Network',
      password: 'Password',
      connect: 'Connect',
      connecting: 'Connecting...',
      connected: 'Connected!',
      failed: 'Connection failed',
      timeout: 'Connection timeout',
      cancel: 'Cancel',
      close: 'Close',
      scanNetworks: 'Scan Networks',
      scanning: 'Scanning...',
      noNetworks: 'No networks found',
      rememberNetwork: 'Remember this network',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      guestAccess: 'Guest Access',
      qrCode: 'Scan QR Code',
      wpsConnect: 'WPS Connection',
      pushWpsButton: 'Push WPS button on router',
      enterWpsPin: 'Enter WPS PIN',
      invalidPassword: 'Invalid password',
      networkUnavailable: 'Network unavailable',
      signalStrength: 'Signal strength'
    },
    de: {
      title: 'WLAN-Verbindung',
      selectNetwork: 'Netzwerk auswählen',
      password: 'Passwort',
      connect: 'Verbinden',
      connecting: 'Verbinde...',
      connected: 'Verbunden!',
      failed: 'Verbindung fehlgeschlagen',
      timeout: 'Verbindungs-Timeout',
      cancel: 'Abbrechen',
      close: 'Schließen',
      scanNetworks: 'Netzwerke scannen',
      scanning: 'Scanne...',
      noNetworks: 'Keine Netzwerke gefunden',
      rememberNetwork: 'Netzwerk merken',
      showPassword: 'Passwort anzeigen',
      hidePassword: 'Passwort verbergen',
      guestAccess: 'Gastzugang',
      qrCode: 'QR-Code scannen',
      wpsConnect: 'WPS-Verbindung',
      pushWpsButton: 'WPS-Taste am Router drücken',
      enterWpsPin: 'WPS-PIN eingeben',
      invalidPassword: 'Ungültiges Passwort',
      networkUnavailable: 'Netzwerk nicht verfügbar',
      signalStrength: 'Signalstärke'
    },
    da: {
      title: 'WiFi Forbindelse',
      selectNetwork: 'Vælg Netværk',
      password: 'Adgangskode',
      connect: 'Forbind',
      connecting: 'Forbinder...',
      connected: 'Forbundet!',
      failed: 'Forbindelse fejlede',
      timeout: 'Forbindelse timeout',
      cancel: 'Annuller',
      close: 'Luk',
      scanNetworks: 'Scan Netværk',
      scanning: 'Scanner...',
      noNetworks: 'Ingen netværk fundet',
      rememberNetwork: 'Husk dette netværk',
      showPassword: 'Vis adgangskode',
      hidePassword: 'Skjul adgangskode',
      guestAccess: 'Gæsteadgang',
      qrCode: 'Scan QR Kode',
      wpsConnect: 'WPS Forbindelse',
      pushWpsButton: 'Tryk WPS knap på router',
      enterWpsPin: 'Indtast WPS PIN',
      invalidPassword: 'Ugyldig adgangskode',
      networkUnavailable: 'Netværk utilgængeligt',
      signalStrength: 'Signalstyrke'
    }
  };

  const t = translations[language] || translations.en;

  // Auto-scan networks on mount
  useEffect(() => {
    if (autoDetectNetworks && networks.length === 0) {
      handleScanNetworks();
    }
  }, [autoDetectNetworks, networks.length]);

  // Focus password input when network is selected
  useEffect(() => {
    if (selectedNetwork && connectionMethod === CONNECTION_METHODS.PASSWORD) {
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  }, [selectedNetwork, connectionMethod]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
    };
  }, []);

  // Handle network scanning
  const handleScanNetworks = async () => {
    setIsScanning(true);
    setError('');
    
    try {
      // Simulate network scanning with mock data if no networks provided
      if (availableNetworks.length === 0) {
        scanTimeoutRef.current = setTimeout(() => {
          const mockNetworks = [
            { ssid: 'Safira-Guest', secured: false, strength: 95, channel: 6 },
            { ssid: 'Safira-Staff', secured: true, strength: 90, channel: 1 },
            { ssid: 'Restaurant-5G', secured: true, strength: 75, channel: 11 },
            { ssid: 'Free-WiFi', secured: false, strength: 60, channel: 6 },
          ];
          setNetworks(mockNetworks);
          setIsScanning(false);
        }, 2000);
      } else {
        // Use provided networks
        setNetworks(availableNetworks);
        setIsScanning(false);
      }
    } catch (err) {
      setError('Failed to scan networks');
      setIsScanning(false);
    }
  };

  // Handle connection attempt
  const handleConnect = async () => {
    if (!selectedNetwork && connectionMethod !== CONNECTION_METHODS.GUEST) {
      setError('Please select a network');
      return;
    }

    if (connectionMethod === CONNECTION_METHODS.PASSWORD && !password && selectedNetwork?.secured) {
      setError(t.invalidPassword);
      return;
    }

    setConnectionStatus(CONNECTION_STATUS.CONNECTING);
    setError('');

    // Start connection timeout
    connectionTimeoutRef.current = setTimeout(() => {
      setConnectionStatus(CONNECTION_STATUS.TIMEOUT);
    }, 15000);

    try {
      // Simulate connection process
      const connectionData = {
        network: selectedNetwork,
        method: connectionMethod,
        password: connectionMethod === CONNECTION_METHODS.PASSWORD ? password : null,
        remember: rememberNetwork
      };

      // Mock connection delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Clear timeout
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }

      // Simulate success/failure
      const success = Math.random() > 0.2; // 80% success rate
      
      if (success) {
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);
        
        // Call success callback
        setTimeout(() => {
          onConnect(connectionData);
          handleClose();
        }, 1500);
        
      } else {
        setConnectionStatus(CONNECTION_STATUS.FAILED);
        setError('Connection failed. Please check credentials.');
      }

    } catch (err) {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      setConnectionStatus(CONNECTION_STATUS.FAILED);
      setError(err.message || 'Connection failed');
    }
  };

  // Handle guest access
  const handleGuestAccess = () => {
    setConnectionMethod(CONNECTION_METHODS.GUEST);
    setSelectedNetwork({ ssid: 'Guest Access', secured: false });
    handleConnect();
  };

  // Handle QR code generation
  const generateQRCode = () => {
    if (!selectedNetwork) return;
    
    const wifiString = `WIFI:T:${selectedNetwork.secured ? 'WPA' : 'nopass'};S:${selectedNetwork.ssid};P:${password};H:false;;`;
    setQrCodeData(wifiString);
  };

  // Handle close
  const handleClose = () => {
    // Clear any ongoing operations
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
    
    onClose();
  };

  // Get signal strength icon
  const getSignalIcon = (strength) => {
    if (strength >= 80) return 'wifi-strong';
    if (strength >= 60) return 'wifi-medium';
    if (strength >= 40) return 'wifi-weak';
    return 'wifi-none';
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      y: 50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`wifi-login-overlay ${className}`}
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        data-testid={testId}
        {...props}
      >
        <motion.div
          ref={modalRef}
          className="wifi-login-modal"
          variants={modalVariants}
          role="dialog"
          aria-labelledby="wifi-login-title"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <h2 id="wifi-login-title" className="modal-title">
              {t.title}
            </h2>
            <button
              className="close-button"
              onClick={handleClose}
              aria-label={t.close}
            >
              <NavigationIcon icon="x" size="medium" />
            </button>
          </div>

          {/* Content */}
          <div className="modal-content">
            {/* Connection method tabs */}
            <div className="method-tabs">
              <button
                className={`method-tab ${connectionMethod === CONNECTION_METHODS.PASSWORD ? 'active' : ''}`}
                onClick={() => setConnectionMethod(CONNECTION_METHODS.PASSWORD)}
              >
                <NavigationIcon icon="wifi" size="small" />
                {t.password}
              </button>

              {showQRCode && (
                <button
                  className={`method-tab ${connectionMethod === CONNECTION_METHODS.QR ? 'active' : ''}`}
                  onClick={() => setConnectionMethod(CONNECTION_METHODS.QR)}
                >
                  <NavigationIcon icon="qr-code" size="small" />
                  {t.qrCode}
                </button>
              )}

              {showWPS && (
                <button
                  className={`method-tab ${connectionMethod === CONNECTION_METHODS.WPS ? 'active' : ''}`}
                  onClick={() => setConnectionMethod(CONNECTION_METHODS.WPS)}
                >
                  <NavigationIcon icon="radio" size="small" />
                  WPS
                </button>
              )}
            </div>

            {/* Network selection */}
            {(connectionMethod === CONNECTION_METHODS.PASSWORD || connectionMethod === CONNECTION_METHODS.QR) && (
              <div className="network-section">
                <div className="section-header">
                  <h3>{t.selectNetwork}</h3>
                  <button
                    className={`scan-button ${isScanning ? 'scanning' : ''}`}
                    onClick={handleScanNetworks}
                    disabled={isScanning}
                  >
                    <NavigationIcon 
                      icon="refresh" 
                      size="small" 
                      className={isScanning ? 'spinning' : ''}
                    />
                    {isScanning ? t.scanning : t.scanNetworks}
                  </button>
                </div>

                {networks.length > 0 ? (
                  <motion.div
                    className="network-list"
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {networks.map((network, index) => (
                      <motion.button
                        key={`${network.ssid}-${index}`}
                        className={`network-item ${selectedNetwork?.ssid === network.ssid ? 'selected' : ''}`}
                        onClick={() => setSelectedNetwork(network)}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="network-info">
                          <div className="network-name">
                            {network.ssid}
                            {!network.secured && (
                              <span className="open-badge">Open</span>
                            )}
                          </div>
                          {network.channel && (
                            <div className="network-details">
                              Channel {network.channel}
                            </div>
                          )}
                        </div>
                        
                        <div className="network-indicators">
                          <NavigationIcon
                            icon={getSignalIcon(network.strength)}
                            size="small"
                            color={network.strength >= 60 ? 'success' : 'warning'}
                            aria-label={`${t.signalStrength}: ${network.strength}%`}
                          />
                          {network.secured && (
                            <NavigationIcon icon="lock" size="small" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                ) : (
                  <div className="empty-state">
                    <NavigationIcon icon="wifi-off" size="large" color="muted" />
                    <p>{t.noNetworks}</p>
                  </div>
                )}
              </div>
            )}

            {/* Password input */}
            {connectionMethod === CONNECTION_METHODS.PASSWORD && selectedNetwork?.secured && (
              <div className="password-section">
                <div className="password-field">
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    className="password-input"
                    placeholder={t.password}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleConnect();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? t.hidePassword : t.showPassword}
                  >
                    <NavigationIcon 
                      icon={showPassword ? 'eye-off' : 'eye'} 
                      size="small" 
                    />
                  </button>
                </div>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberNetwork}
                    onChange={(e) => setRememberNetwork(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  {t.rememberNetwork}
                </label>
              </div>
            )}

            {/* QR Code display */}
            {connectionMethod === CONNECTION_METHODS.QR && selectedNetwork && (
              <div className="qr-section">
                {qrCodeData ? (
                  <div className="qr-display">
                    <div className="qr-placeholder">
                      <NavigationIcon icon="qr-code" size="xxlarge" />
                      <p>QR Code for {selectedNetwork.ssid}</p>
                    </div>
                  </div>
                ) : (
                  <button
                    className="generate-qr-button"
                    onClick={generateQRCode}
                    disabled={!selectedNetwork || (selectedNetwork.secured && !password)}
                  >
                    <NavigationIcon icon="qr-code" size="medium" />
                    Generate QR Code
                  </button>
                )}
              </div>
            )}

            {/* WPS instructions */}
            {connectionMethod === CONNECTION_METHODS.WPS && (
              <div className="wps-section">
                <div className="wps-instructions">
                  <NavigationIcon icon="radio" size="large" />
                  <p>{t.pushWpsButton}</p>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <NavigationIcon icon="alert-circle" size="small" color="error" />
                {error}
              </motion.div>
            )}

            {/* Connection status */}
            {connectionStatus !== CONNECTION_STATUS.IDLE && (
              <div className={`connection-status ${connectionStatus}`}>
                <div className="status-content">
                  {connectionStatus === CONNECTION_STATUS.CONNECTING && (
                    <>
                      <NavigationIcon icon="loader" size="medium" className="spinning" />
                      {t.connecting}
                    </>
                  )}
                  {connectionStatus === CONNECTION_STATUS.CONNECTED && (
                    <>
                      <NavigationIcon icon="check-circle" size="medium" color="success" />
                      {t.connected}
                    </>
                  )}
                  {connectionStatus === CONNECTION_STATUS.FAILED && (
                    <>
                      <NavigationIcon icon="x-circle" size="medium" color="error" />
                      {t.failed}
                    </>
                  )}
                  {connectionStatus === CONNECTION_STATUS.TIMEOUT && (
                    <>
                      <NavigationIcon icon="clock" size="medium" color="warning" />
                      {t.timeout}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            {showGuestAccess && connectionMethod !== CONNECTION_METHODS.GUEST && (
              <button
                className="guest-button"
                onClick={handleGuestAccess}
              >
                <NavigationIcon icon="users" size="small" />
                {t.guestAccess}
              </button>
            )}

            <div className="action-buttons">
              <button
                className="cancel-button"
                onClick={handleClose}
              >
                {t.cancel}
              </button>
              
              <button
                className="connect-button primary"
                onClick={handleConnect}
                disabled={
                  connectionStatus === CONNECTION_STATUS.CONNECTING ||
                  (!selectedNetwork && connectionMethod !== CONNECTION_METHODS.GUEST) ||
                  (connectionMethod === CONNECTION_METHODS.PASSWORD && selectedNetwork?.secured && !password)
                }
              >
                {connectionStatus === CONNECTION_STATUS.CONNECTING ? t.connecting : t.connect}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WiFiLogin;