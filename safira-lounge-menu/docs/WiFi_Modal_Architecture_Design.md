# WiFi Modal Container Architecture Design

## Executive Summary

This document outlines the architectural design for a robust container hierarchy for the QRCodeModal component that maintains exact positioning while fixing layout issues. The design follows modern React and CSS best practices with a focus on responsive design and accessibility.

---

## 1. Current State Analysis

### Identified Issues
1. **Layout Instability**: QR code appearance causes content shifts
2. **Container Hierarchy**: Insufficient separation of concerns in layout structure
3. **Flexbox Layout**: Missing proper flex container setup for WiFi info sections
4. **QR Code Centering**: Inconsistent alignment across different viewport sizes
5. **Position Management**: Mixed positioning strategies causing layout conflicts

### Current Container Structure
```
ModalOverlay (fixed)
└── ModalCard (motion.div)
    ├── CloseButton (absolute)
    ├── TabContainer
    ├── Content (direct children)
    │   ├── ModalTitle
    │   ├── ModalInfo
    │   ├── NetworkName
    │   ├── Password
    │   ├── ButtonGroup
    │   └── QRCodeContainer (conditional)
    └── Error (conditional)
```

---

## 2. Architectural Design Principles

### Core Principles
1. **Separation of Concerns**: Clear distinction between layout, content, and presentation
2. **Predictable Layout**: Consistent spacing and positioning regardless of content state
3. **Responsive First**: Mobile-first design with progressive enhancement
4. **Performance**: Minimal reflows and repaints during state changes
5. **Accessibility**: Semantic HTML and ARIA compliance

### Design Patterns
- **Container-Presentational Pattern**: Logical separation of layout and content components
- **Composition over Configuration**: Small, focused components that compose well
- **CSS Grid for Layout**: Grid for overall structure, Flexbox for component alignment
- **Fixed Space Reservation**: Reserve space for dynamic content to prevent shifts

---

## 3. Proposed Container Hierarchy

### Level 1: Modal Overlay (Viewport Layer)
```typescript
ModalOverlay (fixed positioning)
├── Purpose: Full-screen backdrop and click-outside handler
├── Position: fixed
├── Display: flex (center alignment)
├── Z-index: 2000
└── Interaction: Click-to-close handler
```

**Styling Strategy:**
- `position: fixed` - Remove from document flow
- `top: 0; left: 0; width: 100%; height: 100%` - Full viewport coverage
- `display: flex; align-items: center; justify-content: center` - Center modal
- `backdrop-filter: blur(10px)` - Visual depth
- `padding: 20px` - Safe area for mobile

### Level 2: Modal Container (Centering Layer)
```typescript
ModalContainer (new component)
├── Purpose: Centralized container with fixed dimensions
├── Display: flex (column layout)
├── Max-width: Responsive (90vw → 440px)
├── Max-height: 90vh with scroll
└── Box-sizing: border-box
```

**Styling Strategy:**
- Remove positioning from `ModalCard` (currently has `position: relative`)
- Create dedicated centering container
- Handle max dimensions and overflow
- Provide consistent padding

### Level 3: Modal Card (Content Wrapper)
```typescript
ModalCard (styled wrapper)
├── Purpose: Visual styling and animations
├── Display: flex (column layout)
├── Position: relative (for absolute children)
├── Flex: 1 (fill container)
└── Overflow: visible (let container handle scroll)
```

**Styling Strategy:**
- `display: flex; flex-direction: column` - Vertical stacking
- `gap: 16px` - Consistent spacing between sections
- `position: relative` - For CloseButton absolute positioning
- Remove height constraints - let content define height

### Level 4: Content Sections (Component Layer)
```typescript
ModalCard
├── CloseButton (absolute positioned)
├── TabContainer (flex row)
├── ContentContainer (new - flex column)
│   ├── HeaderSection (new - flex column)
│   │   ├── ModalTitle
│   │   └── ModalInfo
│   ├── WiFiInfoSection (new - flex column)
│   │   ├── NetworkName
│   │   └── Password
│   ├── ActionsSection (new - flex column)
│   │   └── ButtonGroup (flex row wrap)
│   └── QRSection (new - flex column, reserved space)
│       └── QRCodeContainer (conditional)
└── ErrorSection (conditional)
```

**Key Architectural Components:**

#### 4.1 ContentContainer (New Component)
```typescript
const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  align-items: center;
  box-sizing: border-box;

  @media (max-width: 480px) {
    gap: 16px;
  }
`;
```

**Purpose:**
- Main content wrapper with consistent vertical spacing
- Centers all child sections
- Provides responsive gap management

#### 4.2 HeaderSection (New Component)
```typescript
const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  align-items: center;
  text-align: center;
  box-sizing: border-box;
`;
```

**Purpose:**
- Groups title and info text logically
- Consistent spacing between header elements
- Full width for proper text alignment

#### 4.3 WiFiInfoSection (New Component)
```typescript
const WiFiInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 100%;
  align-items: center;
  box-sizing: border-box;

  @media (max-width: 480px) {
    gap: 12px;
  }
`;
```

**Purpose:**
- Groups WiFi credentials (SSID and password)
- Prevents horizontal overflow
- Maintains consistent spacing

#### 4.4 ActionsSection (New Component)
```typescript
const ActionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  align-items: center;
  box-sizing: border-box;
`;
```

**Purpose:**
- Contains ButtonGroup
- Centers action buttons
- Provides structural separation

#### 4.5 QRSection (New Component - Critical)
```typescript
const QRSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: ${props => props.$hasQR ? 'auto' : '0'};
  max-height: ${props => props.$hasQR ? '400px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease, min-height 0.3s ease;
  box-sizing: border-box;
`;
```

**Purpose:**
- **Reserved space strategy** to prevent layout shifts
- Smooth height transitions when QR appears/disappears
- Centers QR code vertically and horizontally
- Overflow management for animations

**Key Innovation:**
- Uses conditional max-height instead of display toggle
- Prevents reflow by reserving space
- Smooth CSS transitions instead of abrupt changes

---

## 4. Fixed/Absolute Positioning Strategy

### Positioning Rules

#### Fixed Positioning (ModalOverlay)
```css
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
z-index: 2000;
```

**Rationale:**
- Removes overlay from document flow
- Ensures full viewport coverage
- Prevents scroll issues on parent containers
- Highest z-index for modal context

#### Relative Positioning (ModalCard)
```css
position: relative;
/* No top, left, right, bottom - natural centering via flexbox parent */
```

**Rationale:**
- Provides positioning context for CloseButton
- Allows natural flexbox centering from parent
- No manual positioning calculations needed

#### Absolute Positioning (CloseButton only)
```css
position: absolute;
top: 15px;
right: 15px;
z-index: 1;
```

**Rationale:**
- Only component that needs absolute positioning
- Positioned relative to ModalCard
- Always visible regardless of scroll state

#### Flow Positioning (All other components)
```css
position: static; /* default, not specified */
```

**Rationale:**
- All content follows natural document flow
- Predictable layout behavior
- Better for responsive design
- Easier maintenance

---

## 5. Flexbox Layout Implementation

### Flex Container Hierarchy

```
ModalOverlay (flex container - center alignment)
└── ModalCard (flex container - vertical layout)
    ├── TabContainer (flex container - horizontal tabs)
    └── ContentContainer (flex container - vertical sections)
        ├── HeaderSection (flex container - vertical text)
        ├── WiFiInfoSection (flex container - vertical credentials)
        ├── ActionsSection (flex container - vertical actions)
        │   └── ButtonGroup (flex container - horizontal buttons)
        └── QRSection (flex container - vertical QR + description)
            └── QRCodeContainer (flex container - vertical QR)
```

### Flex Properties by Component

#### ModalOverlay
```css
display: flex;
align-items: center;        /* Vertical centering */
justify-content: center;    /* Horizontal centering */
```

#### ModalCard
```css
display: flex;
flex-direction: column;     /* Vertical stacking */
gap: 0;                     /* Let ContentContainer handle gaps */
```

#### ContentContainer
```css
display: flex;
flex-direction: column;     /* Vertical stacking */
gap: 20px;                  /* Consistent spacing */
align-items: center;        /* Center children horizontally */
width: 100%;               /* Full width for proper alignment */
```

#### WiFiInfoSection
```css
display: flex;
flex-direction: column;     /* Vertical stacking */
gap: 16px;                  /* Space between SSID and password */
align-items: center;        /* Center credentials */
width: 100%;               /* Prevent overflow */
```

#### ButtonGroup
```css
display: flex;
flex-direction: row;        /* Horizontal buttons */
gap: 12px;                  /* Space between buttons */
justify-content: center;    /* Center buttons */
flex-wrap: wrap;            /* Wrap on small screens */
```

#### QRSection
```css
display: flex;
flex-direction: column;     /* Vertical: QR + description */
align-items: center;        /* Center QR horizontally */
justify-content: center;    /* Center QR vertically */
width: 100%;               /* Full width */
```

---

## 6. QR Code Container Design

### QRCodeContainer Architecture

```typescript
const QRCodeContainer = styled(motion.div)`
  /* Layout */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  /* Sizing */
  width: fit-content;
  max-width: 100%;

  /* Spacing */
  padding: 16px;
  margin: 0 auto;              /* Center within parent */

  /* Visual */
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  /* Box model */
  box-sizing: border-box;

  /* QR Image sizing */
  img {
    display: block;
    width: min(200px, calc(100vw - 120px));
    height: min(200px, calc(100vw - 120px));
    max-width: 100%;
    object-fit: contain;
  }

  @media (max-width: 480px) {
    padding: 12px;

    img {
      width: min(180px, calc(100vw - 100px));
      height: min(180px, calc(100vw - 100px));
    }
  }
`;
```

### Centering Strategy

**Multi-Level Centering:**

1. **QRSection Level** (Parent):
   - `display: flex`
   - `align-items: center` - Horizontal centering
   - `justify-content: center` - Vertical centering

2. **QRCodeContainer Level** (Self):
   - `width: fit-content` - Shrink to content size
   - `margin: 0 auto` - Fallback centering
   - `max-width: 100%` - Prevent overflow

3. **Image Level** (Child):
   - `display: block` - Remove inline spacing
   - `min()` function for responsive sizing
   - `object-fit: contain` - Maintain aspect ratio

**Why This Works:**
- Multiple centering strategies ensure consistency
- Responsive sizing prevents overflow
- Flexbox handles alignment automatically
- No manual positioning calculations

---

## 7. Responsive Breakpoints

### Breakpoint Strategy

```typescript
// Mobile First: Base styles for mobile (< 480px)
const Component = styled.div`
  padding: 16px;
  gap: 12px;

  // Tablet: 481px - 768px
  @media (min-width: 481px) and (max-width: 768px) {
    padding: 20px;
    gap: 16px;
  }

  // Desktop: > 768px
  @media (min-width: 769px) {
    padding: 24px;
    gap: 20px;
  }
`;
```

### Dimension Breakpoints

| Component | Mobile (<480px) | Tablet (481-768px) | Desktop (>768px) |
|-----------|----------------|-------------------|-----------------|
| **ModalCard** | max-width: 92vw | max-width: 420px | max-width: 440px |
| **Padding** | 20px 16px | 24px 20px | 28px 24px |
| **Gap** | 16px | 20px | 24px |
| **QR Size** | 180px | 200px | 200px |
| **Font Title** | 1.4rem | 1.8rem | 2rem |
| **Font Body** | 0.85rem | 0.9rem | 0.95rem |

### Responsive Font Sizing

```css
/* Use clamp() for fluid typography */
font-size: clamp(1.4rem, 5vw, 2rem);
/* min: 1.4rem, preferred: 5vw, max: 2rem */
```

---

## 8. Layout Stability Mechanisms

### Problem: Content Shift on QR Code Appearance

**Current Issue:**
- QR code appears via conditional rendering (`{showQR && wifiQR && <QRCodeContainer>}`)
- No space reserved for QR code
- Layout reflows when QR appears, causing visible shift

### Solution: Reserved Space Strategy

#### Approach 1: Fixed Min-Height (Recommended)
```typescript
const QRSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: ${props => props.$isWiFiTab ? '280px' : '0'};
  /* 280px = QRCodeContainer (200px) + padding + description */

  /* Smooth transition */
  transition: min-height 0.3s ease;

  /* Hide overflow during transitions */
  overflow: hidden;
`;
```

**Usage:**
```tsx
<QRSection $isWiFiTab={activeTab === 'wifi'}>
  <AnimatePresence>
    {showQR && wifiQR && (
      <QRCodeContainer>...</QRCodeContainer>
    )}
  </AnimatePresence>
</QRSection>
```

**Benefits:**
- Prevents layout shift entirely
- Space always reserved when on WiFi tab
- Smooth transitions via CSS
- No JavaScript reflow calculations

#### Approach 2: CSS Grid Template Rows (Alternative)
```typescript
const ContentContainer = styled.div`
  display: grid;
  grid-template-rows:
    auto          /* Header */
    auto          /* WiFi Info */
    auto          /* Actions */
    minmax(280px, auto); /* QR Section - minimum space reserved */
  gap: 20px;
`;
```

**Benefits:**
- More explicit layout control
- Guaranteed minimum space
- Better for complex layouts

**Trade-offs:**
- Less flexible than flexbox
- Harder to maintain with dynamic content

### Recommended Approach: Hybrid Strategy

```typescript
// Use flexbox for flexibility + reserved min-height for stability
const QRSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: ${props => props.$showQR ? 'flex-start' : 'center'};

  /* Reserved space when tab is active */
  min-height: ${props => {
    if (!props.$isActiveTab) return '0';
    return props.$showQR ? 'auto' : '280px';
  }};

  /* Max height for smooth transitions */
  max-height: ${props => props.$showQR ? '400px' : '0'};

  /* Smooth height transitions */
  transition: max-height 0.3s ease, min-height 0.3s ease;

  /* Hide content during collapse */
  overflow: hidden;

  /* Box model */
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    min-height: ${props => {
      if (!props.$isActiveTab) return '0';
      return props.$showQR ? 'auto' : '250px';
    }};
  }
`;
```

**Why This Works:**
1. **Reserved Space**: `min-height` prevents collapse
2. **Smooth Transitions**: CSS transitions for height changes
3. **Overflow Control**: Hides content during animations
4. **Responsive**: Adjusts space for mobile screens
5. **Conditional**: Only reserves space on active tab

---

## 9. Animation Strategy

### Current Animation Issues
1. Framer Motion animations compete with CSS transitions
2. Layout shifts cause janky animations
3. No coordination between appearance and layout

### Proposed Animation Architecture

#### Layer 1: Modal Entrance (Framer Motion)
```tsx
<ModalOverlay
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  <ModalCard
    initial={{ opacity: 0, scale: 0.9, y: 50 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: 50 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
```

**Rationale:**
- Framer Motion for complex entrance/exit animations
- Handles AnimatePresence mounting/unmounting
- Smooth modal appearance from bottom

#### Layer 2: QR Code Appearance (Framer Motion)
```tsx
<AnimatePresence mode="wait">
  {showQR && wifiQR && (
    <QRCodeContainer
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
```

**Rationale:**
- Scale animation for QR code appearance
- `mode="wait"` prevents overlap during transitions
- Coordinates with reserved space to prevent shift

#### Layer 3: Height Transitions (CSS)
```css
/* QRSection height transition */
transition: max-height 0.3s ease, min-height 0.3s ease;
```

**Rationale:**
- CSS for simple height changes
- Better performance than JS animations
- Synchronizes with Framer Motion timing (0.3s)

### Animation Coordination

**Timeline:**
```
0ms:    User clicks "Show QR Code"
        ├─ QRSection max-height: 0 → 400px (CSS, 300ms)
        └─ QRCodeContainer opacity: 0 → 1, scale: 0.8 → 1 (Framer, 300ms)

300ms:  Animations complete
        └─ QR code fully visible and centered
```

**Key Synchronization Points:**
1. Both animations run simultaneously
2. Same duration (300ms) for consistency
3. Reserved space prevents layout shift
4. Opacity + scale feels natural and smooth

---

## 10. Box Model and Spacing

### Box-Sizing Strategy

**Global Rule:**
```css
* {
  box-sizing: border-box;
}
```

**Applied to All Components:**
```typescript
const Component = styled.div`
  box-sizing: border-box;
  /* Padding and border included in width/height */
`;
```

**Why This Matters:**
- Prevents unexpected overflow
- Predictable sizing calculations
- Easier responsive design
- `width: 100%` works as expected

### Spacing System

**Consistent Gap Hierarchy:**
```typescript
// Large gaps (between major sections)
ContentContainer: gap: 20px;

// Medium gaps (between related elements)
WiFiInfoSection: gap: 16px;

// Small gaps (between buttons)
ButtonGroup: gap: 12px;

// Tiny gaps (between text elements)
HeaderSection: gap: 12px;
```

**Padding System:**
```typescript
// Container padding
ModalCard: padding: 24px 20px;

// Component padding
QRCodeContainer: padding: 16px;
Password: padding: 16px 12px;

// Button padding
ActionButton: padding: 10px 24px;
```

**Margin System:**
```typescript
// Prefer gap over margin for consistency
// Only use margin for specific cases:

// Auto-centering
QRCodeContainer: margin: 0 auto;

// Specific spacing overrides (avoid if possible)
ModalTitle: margin: 0 0 20px 0;
```

---

## 11. Implementation Checklist

### Phase 1: Structural Changes
- [ ] Create new styled components:
  - [ ] `ContentContainer`
  - [ ] `HeaderSection`
  - [ ] `WiFiInfoSection`
  - [ ] `ActionsSection`
  - [ ] `QRSection`
- [ ] Update `ModalCard` to use `gap` instead of child margins
- [ ] Remove unnecessary `position: relative` and margins
- [ ] Add `box-sizing: border-box` to all components

### Phase 2: Layout Implementation
- [ ] Wrap content in `ContentContainer`
- [ ] Group title and info in `HeaderSection`
- [ ] Group SSID and password in `WiFiInfoSection`
- [ ] Wrap `ButtonGroup` in `ActionsSection`
- [ ] Wrap `QRCodeContainer` in `QRSection` with reserved space

### Phase 3: Positioning Updates
- [ ] Verify `ModalOverlay` fixed positioning
- [ ] Verify `ModalCard` relative positioning (for CloseButton only)
- [ ] Ensure `CloseButton` absolute positioning
- [ ] Remove all other positioning declarations

### Phase 4: Flexbox Implementation
- [ ] Add flex display to all container components
- [ ] Set proper flex-direction for each container
- [ ] Add alignment properties (align-items, justify-content)
- [ ] Implement gap properties for spacing

### Phase 5: QR Code Centering
- [ ] Implement multi-level centering in QRSection
- [ ] Add `width: fit-content` to QRCodeContainer
- [ ] Verify responsive sizing with `min()` function
- [ ] Test centering across all breakpoints

### Phase 6: Responsive Refinement
- [ ] Verify mobile styles (< 480px)
- [ ] Verify tablet styles (481-768px)
- [ ] Verify desktop styles (> 768px)
- [ ] Test `clamp()` font sizing
- [ ] Test QR code responsive sizing

### Phase 7: Animation Integration
- [ ] Implement reserved space in QRSection
- [ ] Add CSS transitions for height changes
- [ ] Coordinate Framer Motion animations
- [ ] Test appearance/disappearance smoothness

### Phase 8: Testing
- [ ] Test modal opening/closing
- [ ] Test tab switching
- [ ] Test QR code show/hide
- [ ] Test responsive behavior
- [ ] Test on multiple devices/browsers
- [ ] Verify no layout shifts
- [ ] Performance testing (reflows/repaints)

---

## 12. Code Examples

### Complete Container Structure

```tsx
export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  language,
  // ... other props
}) => {
  const [activeTab, setActiveTab] = useState<QRModalTab>('wifi');
  const [showQR, setShowQR] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalCard
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton onClick={onClose}>✕</CloseButton>

            <TabContainer>
              <Tab $active={activeTab === 'wifi'} onClick={() => setActiveTab('wifi')}>
                WiFi
              </Tab>
              <Tab $active={activeTab === 'menu'} onClick={() => setActiveTab('menu')}>
                Menu
              </Tab>
            </TabContainer>

            <ContentContainer>
              <HeaderSection>
                <ModalTitle>WLAN • WiFi</ModalTitle>
                <ModalInfo>Kostenloses WLAN für unsere Gäste</ModalInfo>
              </HeaderSection>

              {activeTab === 'wifi' && (
                <>
                  <WiFiInfoSection>
                    <NetworkName>📶 Safira_Guest</NetworkName>
                    <Password>Safira2024</Password>
                  </WiFiInfoSection>

                  <ActionsSection>
                    <ButtonGroup>
                      <ActionButton variant="primary" onClick={handleToggleQR}>
                        {showQR ? 'Hide QR' : 'Show QR'}
                      </ActionButton>
                      {showQR && (
                        <ActionButton variant="secondary" onClick={handleDownload}>
                          Download
                        </ActionButton>
                      )}
                    </ButtonGroup>
                  </ActionsSection>

                  <QRSection $isActiveTab={true} $showQR={showQR}>
                    <AnimatePresence mode="wait">
                      {showQR && wifiQR && (
                        <QRCodeContainer
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3 }}
                        >
                          <img src={wifiQR} alt="WiFi QR Code" />
                          <QRDescription>
                            Scan QR code for automatic connection
                          </QRDescription>
                        </QRCodeContainer>
                      )}
                    </AnimatePresence>
                  </QRSection>
                </>
              )}
            </ContentContainer>
          </ModalCard>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};
```

### New Styled Components

```typescript
// Main content wrapper
const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  align-items: center;
  box-sizing: border-box;

  @media (max-width: 480px) {
    gap: 16px;
  }
`;

// Header section (title + info)
const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  align-items: center;
  text-align: center;
  box-sizing: border-box;
`;

// WiFi credentials section
const WiFiInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 100%;
  align-items: center;
  box-sizing: border-box;

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

// Actions section (buttons)
const ActionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  align-items: center;
  box-sizing: border-box;
`;

// QR section with reserved space
const QRSection = styled.div<{ $isActiveTab: boolean; $showQR: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: ${props => props.$showQR ? 'flex-start' : 'center'};
  width: 100%;
  box-sizing: border-box;

  /* Reserved space to prevent layout shift */
  min-height: ${props => {
    if (!props.$isActiveTab) return '0';
    return props.$showQR ? 'auto' : '280px';
  }};

  max-height: ${props => props.$showQR ? '400px' : '0'};

  /* Smooth transitions */
  transition: max-height 0.3s ease, min-height 0.3s ease;
  overflow: hidden;

  @media (max-width: 480px) {
    min-height: ${props => {
      if (!props.$isActiveTab) return '0';
      return props.$showQR ? 'auto' : '250px';
    }};
  }
`;
```

---

## 13. Performance Considerations

### Layout Performance

**Avoid Reflows:**
- Use `transform` and `opacity` for animations (GPU accelerated)
- Reserve space for dynamic content
- Use `will-change` sparingly for animated elements

```css
/* QRCodeContainer with performance optimization */
const QRCodeContainer = styled(motion.div)`
  /* ... other styles ... */

  /* Hint to browser for optimization */
  will-change: transform, opacity;

  /* Use GPU-accelerated properties */
  transform: translateZ(0);
`;
```

**Minimize Repaints:**
- Use CSS transitions over JavaScript animations when possible
- Batch DOM updates
- Use `AnimatePresence` mode="wait" to prevent overlapping renders

### Rendering Performance

**React Optimizations:**
```tsx
// Memoize expensive computations
const getText = useMemo(() =>
  (key: string) => texts[key]?.[language] || texts[key]?.de || key,
  [language]
);

// Memoize static content
const renderHeaderSection = useMemo(() => (
  <HeaderSection>
    <ModalTitle>{getText('wifiTitle')}</ModalTitle>
    <ModalInfo>{getText('wifiInfo')}</ModalInfo>
  </HeaderSection>
), [getText]);
```

**Component Memoization:**
```tsx
// Already implemented at component level
export const QRCodeModal: React.FC<QRCodeModalProps> = React.memo(({
  // ... props
}) => {
  // ... implementation
});
```

### Memory Management

**Cleanup on Unmount:**
```tsx
useEffect(() => {
  if (!isOpen) {
    // Clear QR codes to free memory
    setWifiQR(null);
    setMenuQR(null);
    setShowQR(false);
  }
}, [isOpen]);
```

---

## 14. Accessibility Considerations

### Keyboard Navigation

**Focus Management:**
```tsx
// Focus trap within modal
useEffect(() => {
  if (isOpen) {
    const modalElement = modalRef.current;
    if (modalElement) {
      const focusableElements = modalElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }
}, [isOpen]);

// Escape key handler
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);
```

### ARIA Attributes

```tsx
<ModalOverlay
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <ModalCard>
    <ModalTitle id="modal-title">WLAN • WiFi</ModalTitle>
    <ModalInfo id="modal-description">
      Kostenloses WLAN für unsere Gäste
    </ModalInfo>

    <TabContainer role="tablist">
      <Tab
        role="tab"
        aria-selected={activeTab === 'wifi'}
        aria-controls="wifi-panel"
      >
        WiFi
      </Tab>
    </TabContainer>

    <div role="tabpanel" id="wifi-panel" aria-labelledby="wifi-tab">
      {/* WiFi content */}
    </div>
  </ModalCard>
</ModalOverlay>
```

### Screen Reader Support

**Announcements:**
```tsx
// Live region for QR code status
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {showQR ? 'QR code displayed' : 'QR code hidden'}
</div>
```

---

## 15. Testing Strategy

### Visual Regression Testing

**Key Test Cases:**
1. Modal opening animation
2. Tab switching
3. QR code appearance/disappearance
4. Responsive breakpoints (mobile, tablet, desktop)
5. Overflow scenarios (long text, large QR codes)

### Layout Stability Testing

**Metrics to Monitor:**
```javascript
// Cumulative Layout Shift (CLS)
// Target: < 0.1 (good)
// Measure: Before and after QR code appearance

// Test with PerformanceObserver
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'layout-shift') {
      console.log('Layout shift:', entry.value);
    }
  }
});
observer.observe({ entryTypes: ['layout-shift'] });
```

### Accessibility Testing

**Tools:**
- axe DevTools
- Lighthouse accessibility audit
- Keyboard navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)

### Cross-Browser Testing

**Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

---

## 16. Migration Path

### Step-by-Step Migration

#### Step 1: Add New Components (Non-Breaking)
```tsx
// Add new styled components at bottom of file
const ContentContainer = styled.div`...`;
const HeaderSection = styled.div`...`;
// ... etc.
```

#### Step 2: Wrap Existing Content (Gradual)
```tsx
// Original
<ModalCard>
  <ModalTitle>...</ModalTitle>
  <ModalInfo>...</ModalInfo>
  // ...
</ModalCard>

// Wrapped (non-breaking change)
<ModalCard>
  <ContentContainer>
    <HeaderSection>
      <ModalTitle>...</ModalTitle>
      <ModalInfo>...</ModalInfo>
    </HeaderSection>
    // ...
  </ContentContainer>
</ModalCard>
```

#### Step 3: Remove Old Margins (Breaking)
```tsx
// Update ModalTitle to remove margin
const ModalTitle = styled.h3`
  // Remove: margin: 0 0 20px 0;
  margin: 0; // Let parent gap handle spacing
  // ... other styles
`;
```

#### Step 4: Implement Reserved Space (Critical)
```tsx
// Add QRSection with reserved space
<QRSection $isActiveTab={activeTab === 'wifi'} $showQR={showQR}>
  <AnimatePresence mode="wait">
    {showQR && wifiQR && (
      <QRCodeContainer>...</QRCodeContainer>
    )}
  </AnimatePresence>
</QRSection>
```

#### Step 5: Test and Validate
- Visual testing
- Layout shift measurement
- Accessibility audit
- Performance profiling

---

## 17. Maintenance Guidelines

### Future Modifications

**Adding New Content Sections:**
```tsx
// 1. Create styled component with flexbox
const NewSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  align-items: center;
  box-sizing: border-box;
`;

// 2. Add to ContentContainer
<ContentContainer>
  <HeaderSection>...</HeaderSection>
  <WiFiInfoSection>...</WiFiInfoSection>
  <NewSection>
    {/* New content */}
  </NewSection>
  <ActionsSection>...</ActionsSection>
</ContentContainer>
```

**Modifying Spacing:**
```tsx
// Update gap in parent container
const ContentContainer = styled.div`
  gap: 24px; // Increased from 20px
  // ...
`;

// Avoid adding margins to children
// ❌ Bad
const ChildComponent = styled.div`
  margin-top: 20px; // Don't do this
`;

// ✅ Good
// Let parent gap handle spacing
```

### Code Organization

**File Structure:**
```
QRCodeModal.tsx
├── Imports
├── Animations (keyframes)
├── Layout Components (Overlay, Card, Containers)
├── Content Components (Title, Info, etc.)
├── Interactive Components (Buttons, Tabs)
├── Interfaces
├── Component Implementation
└── Export
```

---

## 18. Conclusion

### Architecture Summary

This architecture design provides:

1. **Robust Container Hierarchy**: Clear separation of layout, content, and presentation
2. **Stable Positioning**: Fixed overlay, relative card, minimal absolute positioning
3. **Flexible Layout**: Flexbox-based system with proper alignment and spacing
4. **Centered QR Codes**: Multi-level centering strategy with responsive sizing
5. **No Layout Shifts**: Reserved space strategy prevents content jumps
6. **Responsive Design**: Mobile-first approach with proper breakpoints
7. **Performance**: GPU-accelerated animations, minimal reflows
8. **Accessibility**: ARIA compliance, keyboard navigation, screen reader support
9. **Maintainability**: Clear patterns, consistent spacing, easy to modify

### Key Innovations

1. **Reserved Space Strategy**: QRSection reserves space to prevent layout shifts
2. **Hybrid Animation**: CSS transitions + Framer Motion for smooth, performant animations
3. **Multi-Level Centering**: Ensures QR code stays centered across all devices
4. **Gap-Based Spacing**: Consistent, maintainable spacing system
5. **Responsive Sizing**: `clamp()` and `min()` functions for fluid layouts

### Next Steps

1. Review this architecture with team
2. Implement changes following migration path
3. Test thoroughly across devices and browsers
4. Monitor performance metrics
5. Gather user feedback
6. Iterate based on findings

---

## Appendix A: Complete Styled Components Reference

```typescript
// Layout Components
const ModalOverlay = styled(motion.div)`...`;
const ModalCard = styled(motion.div)`...`;
const ContentContainer = styled.div`...`;

// Section Components
const HeaderSection = styled.div`...`;
const WiFiInfoSection = styled.div`...`;
const ActionsSection = styled.div`...`;
const QRSection = styled.div<{ $isActiveTab: boolean; $showQR: boolean }>`...`;

// Content Components
const ModalTitle = styled.h3`...`;
const ModalInfo = styled.div`...`;
const NetworkName = styled.div`...`;
const Password = styled.div`...`;
const QRDescription = styled.div`...`;

// Interactive Components
const CloseButton = styled.button`...`;
const TabContainer = styled.div`...`;
const Tab = styled.button<{ $active: boolean }>`...`;
const ButtonGroup = styled.div`...`;
const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`...`;

// QR Components
const QRCodeContainer = styled(motion.div)`...`;
```

---

## Appendix B: Component Props Reference

```typescript
interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  wifiCredentials?: {
    ssid: string;
    password: string;
    security?: string;
  };
  menuBaseUrl?: string;
  tableId?: string;
  className?: string;
  testId?: string;
}

interface QRSectionProps {
  $isActiveTab: boolean;
  $showQR: boolean;
}

interface TabProps {
  $active: boolean;
}

interface ActionButtonProps {
  variant?: 'primary' | 'secondary';
}
```

---

**Document Version**: 1.0
**Last Updated**: 2025-10-02
**Author**: System Architecture Designer
**Status**: Ready for Implementation
