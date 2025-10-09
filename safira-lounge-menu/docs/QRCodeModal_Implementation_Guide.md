# QRCodeModal - Implementation Guide for Recommended Enhancements

**Component**: QRCodeModal.tsx
**Purpose**: Code snippets for implementing recommended improvements
**Priority Order**: High → Medium → Low

---

## High Priority Enhancements

### 1. Escape Key Handler (Accessibility)

**Priority**: 🔴 High
**Impact**: Better UX and accessibility
**Effort**: 5 minutes

```typescript
// Add to QRCodeModal component (after existing useEffect)

/**
 * Handle escape key to close modal
 */
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };

  if (isOpen) {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }
}, [isOpen, onClose]);
```

---

### 2. Focus Trap Implementation

**Priority**: 🔴 High
**Impact**: Prevents focus from escaping modal
**Effort**: 10 minutes

```bash
# Install dependency
npm install focus-trap-react
```

```typescript
// Add import
import FocusTrap from 'focus-trap-react';

// Wrap ModalCard with FocusTrap
return (
  <AnimatePresence>
    {isOpen && (
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className={className}
        data-testid={testId}
      >
        <FocusTrap
          focusTrapOptions={{
            initialFocus: false,
            escapeDeactivates: true,
            clickOutsideDeactivates: true,
            returnFocusOnDeactivate: true,
          }}
        >
          <ModalCard
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Rest of modal content */}
          </ModalCard>
        </FocusTrap>
      </ModalOverlay>
    )}
  </AnimatePresence>
);
```

---

### 3. ARIA Attributes (Accessibility)

**Priority**: 🔴 High
**Impact**: Better screen reader support
**Effort**: 5 minutes

```typescript
// Update ModalOverlay
<ModalOverlay
  role="dialog"
  aria-modal="true"
  aria-labelledby="qr-modal-title"
  aria-describedby="qr-modal-description"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  onClick={onClose}
  className={className}
  data-testid={testId}
>

// Update ModalTitle
<ModalTitle id="qr-modal-title">{getText('wifiTitle')}</ModalTitle>

// Update ModalInfo
<ModalInfo id="qr-modal-description">{getText('wifiInfo')}</ModalInfo>

// Update TabContainer
<TabContainer role="tablist" aria-label="QR Code Types">
  <Tab
    role="tab"
    aria-selected={activeTab === 'wifi'}
    aria-controls="wifi-panel"
    id="wifi-tab"
    $active={activeTab === 'wifi'}
    onClick={() => handleTabChange('wifi')}
  >
    {getText('wifi')}
  </Tab>
  <Tab
    role="tab"
    aria-selected={activeTab === 'menu'}
    aria-controls="menu-panel"
    id="menu-tab"
    $active={activeTab === 'menu'}
    onClick={() => handleTabChange('menu')}
  >
    {getText('menu')}
  </Tab>
</TabContainer>

// Wrap tab content in panels
<div
  role="tabpanel"
  id="wifi-panel"
  aria-labelledby="wifi-tab"
  hidden={activeTab !== 'wifi'}
>
  {activeTab === 'wifi' && renderWiFiContent()}
</div>

<div
  role="tabpanel"
  id="menu-panel"
  aria-labelledby="menu-tab"
  hidden={activeTab !== 'menu'}
>
  {activeTab === 'menu' && renderMenuContent()}
</div>
```

---

### 4. Input Validation (Security)

**Priority**: 🔴 High
**Impact**: Prevents errors and improves UX
**Effort**: 10 minutes

```typescript
/**
 * Validate WiFi credentials
 */
const validateWiFiCredentials = (ssid: string, password: string): string | null => {
  if (!ssid?.trim()) {
    return getText('errorEmptySSID');
  }

  if (ssid.length > 32) {
    return getText('errorSSIDTooLong');
  }

  if (!password?.trim()) {
    return getText('errorEmptyPassword');
  }

  if (password.length < 8) {
    return getText('errorPasswordTooShort');
  }

  return null;
};

/**
 * Generate WiFi QR code with validation
 */
const handleGenerateWiFiQR = async () => {
  try {
    const validationError = validateWiFiCredentials(
      wifiCredentials.ssid,
      wifiCredentials.password
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    const qrData = await generateWiFiQR(
      wifiCredentials.ssid,
      wifiCredentials.password,
      wifiCredentials.security
    );
    setWifiQR(qrData.qrCode);
    setShowQR(true);
    setError(null);
  } catch (error) {
    console.error('Failed to generate WiFi QR:', error);
    setError(getText('errorGeneratingQR'));
  }
};

// Add to getText texts object
const texts: Record<string, Record<Language, string>> = {
  // ... existing texts
  errorEmptySSID: {
    de: 'Netzwerkname darf nicht leer sein',
    da: 'Netværksnavn må ikke være tomt',
    en: 'Network name cannot be empty',
    tr: 'Ağ adı boş olamaz',
    it: 'Il nome della rete non può essere vuoto'
  },
  errorSSIDTooLong: {
    de: 'Netzwerkname zu lang (max. 32 Zeichen)',
    da: 'Netværksnavn for langt (maks. 32 tegn)',
    en: 'Network name too long (max 32 characters)',
    tr: 'Ağ adı çok uzun (maks. 32 karakter)',
    it: 'Nome rete troppo lungo (max 32 caratteri)'
  },
  errorEmptyPassword: {
    de: 'Passwort darf nicht leer sein',
    da: 'Adgangskode må ikke være tom',
    en: 'Password cannot be empty',
    tr: 'Şifre boş olamaz',
    it: 'La password non può essere vuota'
  },
  errorPasswordTooShort: {
    de: 'Passwort zu kurz (min. 8 Zeichen)',
    da: 'Adgangskode for kort (min. 8 tegn)',
    en: 'Password too short (min 8 characters)',
    tr: 'Şifre çok kısa (min. 8 karakter)',
    it: 'Password troppo corta (min 8 caratteri)'
  },
  errorGeneratingQR: {
    de: 'Fehler beim Erstellen des QR-Codes',
    da: 'Fejl ved oprettelse af QR-kode',
    en: 'Error generating QR code',
    tr: 'QR kodu oluşturulurken hata',
    it: 'Errore nella generazione del codice QR'
  }
};
```

---

## Medium Priority Enhancements

### 5. Test Suite (Testing)

**Priority**: 🟡 Medium
**Impact**: Ensures component reliability
**Effort**: 30 minutes

```typescript
// Create: src/components/Menu/QRCodeModal.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QRCodeModal } from './QRCodeModal';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock useQRCode hook
jest.mock('../../hooks/useQRCode', () => ({
  useQRCode: () => ({
    generateWiFiQR: jest.fn().mockResolvedValue({ qrCode: 'wifi-qr-data', data: 'wifi-data', type: 'wifi' }),
    generateMenuQR: jest.fn().mockResolvedValue({ qrCode: 'menu-qr-data', data: 'menu-data', type: 'menu' }),
    downloadQR: jest.fn(),
    isGenerating: false,
    error: null,
  }),
}));

describe('QRCodeModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    language: 'en' as const,
    wifiCredentials: {
      ssid: 'TestWiFi',
      password: 'TestPass123',
      security: 'WPA',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when isOpen is true', () => {
    render(<QRCodeModal {...defaultProps} />);
    expect(screen.getByTestId('qr-code-modal')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<QRCodeModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('qr-code-modal')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<QRCodeModal {...defaultProps} />);
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay is clicked', () => {
    render(<QRCodeModal {...defaultProps} />);
    const overlay = screen.getByTestId('qr-code-modal');
    fireEvent.click(overlay);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should not close when modal card is clicked', () => {
    render(<QRCodeModal {...defaultProps} />);
    const card = screen.getByText('WiFi').closest('div');
    if (card) fireEvent.click(card);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should switch to menu tab when menu tab is clicked', () => {
    render(<QRCodeModal {...defaultProps} />);
    const menuTab = screen.getByText('Menu');
    fireEvent.click(menuTab);
    expect(screen.getByText('Menu QR Code')).toBeInTheDocument();
  });

  it('should display WiFi credentials correctly', () => {
    render(<QRCodeModal {...defaultProps} />);
    expect(screen.getByText(/TestWiFi/)).toBeInTheDocument();
    expect(screen.getByText('TestPass123')).toBeInTheDocument();
  });

  it('should show QR code when Show QR Code button is clicked', async () => {
    render(<QRCodeModal {...defaultProps} />);
    const showButton = screen.getByText('Show QR Code');
    fireEvent.click(showButton);

    await waitFor(() => {
      expect(screen.getByAltText('WiFi QR Code')).toBeInTheDocument();
    });
  });

  it('should show download button when QR code is visible', async () => {
    render(<QRCodeModal {...defaultProps} />);
    const showButton = screen.getByText('Show QR Code');
    fireEvent.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('Download')).toBeInTheDocument();
    });
  });

  it('should reset QR when switching tabs', async () => {
    render(<QRCodeModal {...defaultProps} />);

    // Show WiFi QR
    fireEvent.click(screen.getByText('Show QR Code'));
    await waitFor(() => {
      expect(screen.getByAltText('WiFi QR Code')).toBeInTheDocument();
    });

    // Switch to menu tab
    fireEvent.click(screen.getByText('Menu'));

    // QR should be hidden
    expect(screen.queryByAltText('WiFi QR Code')).not.toBeInTheDocument();
  });

  it('should display error message when provided', () => {
    const mockUseQRCode = require('../../hooks/useQRCode').useQRCode;
    mockUseQRCode.mockReturnValue({
      ...mockUseQRCode(),
      error: 'Test error message',
    });

    render(<QRCodeModal {...defaultProps} />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render in German when language is set to "de"', () => {
    render(<QRCodeModal {...defaultProps} language="de" />);
    expect(screen.getByText('WLAN • WiFi')).toBeInTheDocument();
  });
});
```

---

### 6. User-Facing Error Display

**Priority**: 🟡 Medium
**Impact**: Better user experience
**Effort**: 5 minutes

```typescript
// Add styled component for error display
const ErrorMessage = styled.div`
  margin-top: 12px;
  padding: 12px 16px;
  background: linear-gradient(145deg, rgba(255, 68, 68, 0.1), rgba(255, 0, 0, 0.08));
  border: 2px solid rgba(255, 68, 68, 0.4);
  border-radius: 12px;
  color: #ff4444;
  font-family: 'Aldrich', sans-serif;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  text-align: center;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    font-size: 0.85rem;
    padding: 10px 14px;
  }
`;

// Replace error display in component
{error && (
  <ErrorMessage role="alert" aria-live="polite">
    ⚠️ {error}
  </ErrorMessage>
)}
```

---

### 7. Client-Side QR Generation

**Priority**: 🟡 Medium
**Impact**: Better privacy, no external dependency
**Effort**: 15 minutes

```bash
# Install client-side QR code library
npm install qrcode
npm install --save-dev @types/qrcode
```

```typescript
// Update useQRCode.ts

import QRCode from 'qrcode';

/**
 * Generate QR code using client-side library
 */
const generateQRCode = useCallback(async (
  data: string,
  type: 'wifi' | 'menu' | 'custom' = 'custom'
): Promise<QRCodeData> => {
  setIsGenerating(true);
  setError(null);

  try {
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: defaultSize,
      margin: 2,
      errorCorrectionLevel: errorCorrectionLevel,
      color: {
        dark: '#1A1A2E',  // QR code color
        light: '#FFFFFF', // Background color
      },
    });

    const qrCodeData: QRCodeData = {
      qrCode: qrCodeDataURL,
      data,
      type
    };

    setQRCodes(prev => [...prev, qrCodeData]);
    return qrCodeData;
  } catch (err) {
    const errorMessage = 'Failed to generate QR code';
    setError(errorMessage);
    throw new Error(errorMessage);
  } finally {
    setIsGenerating(false);
  }
}, [defaultSize, errorCorrectionLevel]);
```

---

### 8. Loading Skeleton

**Priority**: 🟡 Medium
**Impact**: Better perceived performance
**Effort**: 10 minutes

```typescript
// Add styled component for loading skeleton
const LoadingSkeleton = styled.div`
  width: 200px;
  height: 200px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1) 25%,
    rgba(255, 65, 251, 0.1) 50%,
    rgba(255, 255, 255, 0.1) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @media (max-width: 480px) {
    width: 180px;
    height: 180px;
  }
`;

// Update QRCodeContainer to show skeleton while loading
<AnimatePresence>
  {showQR && (
    <QRCodeContainer
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      {isGenerating ? (
        <LoadingSkeleton />
      ) : wifiQR ? (
        <>
          <img src={wifiQR} alt="WiFi QR Code" />
          <QRDescription>{getText('qrDescription')}</QRDescription>
        </>
      ) : null}
    </QRCodeContainer>
  )}
</AnimatePresence>
```

---

## Low Priority Enhancements

### 9. Usage Documentation

**Priority**: 🟢 Low
**Impact**: Easier onboarding for developers
**Effort**: 15 minutes

```typescript
/**
 * QRCodeModal Component
 *
 * A responsive modal component that displays WiFi and menu QR codes with multilingual support.
 *
 * @example
 * ```tsx
 * import { QRCodeModal } from './components/Menu/QRCodeModal';
 *
 * function App() {
 *   const [isModalOpen, setIsModalOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setIsModalOpen(true)}>Show QR Codes</button>
 *
 *       <QRCodeModal
 *         isOpen={isModalOpen}
 *         onClose={() => setIsModalOpen(false)}
 *         language="en"
 *         wifiCredentials={{
 *           ssid: 'MyRestaurant_WiFi',
 *           password: 'SecurePassword123',
 *           security: 'WPA'
 *         }}
 *         tableId="table-5"
 *         menuBaseUrl="https://myrestaurant.com"
 *       />
 *     </>
 *   );
 * }
 * ```
 *
 * @example With custom styling
 * ```tsx
 * <QRCodeModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   language="de"
 *   className="custom-modal"
 *   testId="restaurant-qr-modal"
 * />
 * ```
 *
 * @example Menu QR only
 * ```tsx
 * <QRCodeModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   language="en"
 *   tableId="table-12"
 *   // WiFi credentials optional
 * />
 * ```
 */
```

---

### 10. Password Visibility Toggle

**Priority**: 🟢 Low
**Impact**: Enhanced UX and security
**Effort**: 10 minutes

```typescript
// Add state for password visibility
const [showPassword, setShowPassword] = useState(false);

// Update Password component
const PasswordContainer = styled.div`
  position: relative;
  width: 100%;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #E91E63;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    color: #FF41FB;
    transform: translateY(-50%) scale(1.1);
  }
`;

// In renderWiFiContent
<PasswordContainer>
  <Password>
    {showPassword ? wifiCredentials.password : '•'.repeat(wifiCredentials.password.length)}
  </Password>
  <PasswordToggle
    onClick={() => setShowPassword(!showPassword)}
    aria-label={showPassword ? 'Hide password' : 'Show password'}
    type="button"
  >
    {showPassword ? '👁️' : '👁️‍🗨️'}
  </PasswordToggle>
</PasswordContainer>
```

---

### 11. Larger QR Codes on Tablets

**Priority**: 🟢 Low
**Impact**: Better scanability on medium screens
**Effort**: 5 minutes

```typescript
// Update QRCodeContainer
const QRCodeContainer = styled(motion.div)`
  // ... existing styles

  img {
    display: block;
    width: 200px;
    height: 200px;
    max-width: 100%;
    object-fit: contain;
  }

  // Add tablet-specific sizing
  @media (min-width: 481px) and (max-width: 768px) {
    img {
      width: 240px;
      height: 240px;
    }
  }

  @media (max-width: 480px) {
    padding: 12px;
    margin-top: 16px;

    img {
      width: 180px;
      height: 180px;
    }
  }

  @media (max-width: 360px) {
    img {
      width: 160px;
      height: 160px;
    }
  }
`;
```

---

## Implementation Priority Matrix

| Enhancement | Priority | Effort | Impact | When to Implement |
|-------------|----------|--------|--------|-------------------|
| Escape Key Handler | High | 5 min | High | Sprint 1 |
| Focus Trap | High | 10 min | High | Sprint 1 |
| ARIA Attributes | High | 5 min | High | Sprint 1 |
| Input Validation | High | 10 min | Medium | Sprint 1 |
| Test Suite | Medium | 30 min | High | Sprint 2 |
| Error Display | Medium | 5 min | Medium | Sprint 2 |
| Client-Side QR | Medium | 15 min | Medium | Sprint 2 |
| Loading Skeleton | Medium | 10 min | Low | Sprint 3 |
| Documentation | Low | 15 min | Low | Sprint 3 |
| Password Toggle | Low | 10 min | Low | Sprint 3 |
| Tablet QR Size | Low | 5 min | Low | Sprint 3 |

---

## Estimated Total Implementation Time

- **Sprint 1 (High Priority)**: ~30 minutes
- **Sprint 2 (Medium Priority)**: ~50 minutes
- **Sprint 3 (Low Priority)**: ~30 minutes
- **Total**: ~110 minutes (1.8 hours)

---

## Testing After Implementation

After implementing each enhancement, verify:

1. ✅ Component still builds without errors
2. ✅ All existing functionality works
3. ✅ New features work as expected
4. ✅ Accessibility tools pass (axe DevTools)
5. ✅ Visual regression tests pass
6. ✅ Performance metrics maintained

---

**Last Updated**: 2025-10-02
**Maintainer**: Development Team
**Status**: Ready for Implementation
