# Modal Component Hierarchy & Architecture

## Visual Component Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                      VIEWPORT (100vw × 100vh)                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              ModalOverlay (position: fixed)                │  │
│  │  ╔═══════════════════════════════════════════════════════╗  │  │
│  │  ║          DESKTOP: padding: 16px                       ║  │  │
│  │  ║          MOBILE:  padding: 0                          ║  │  │
│  │  ║  ┌─────────────────────────────────────────────────┐  ║  │  │
│  │  ║  │            ModalCard                            │  ║  │  │
│  │  ║  │  ┌───────────────────────────────────────────┐  │  ║  │  │
│  │  ║  │  │  DESKTOP: max-width: 460px               │  │  ║  │  │
│  │  ║  │  │  MOBILE:  width: 100vw                   │  │  ║  │  │
│  │  ║  │  │  ┌────────────────────────────────────┐  │  │  ║  │  │
│  │  ║  │  │  │     ModalHeader                    │  │  │  ║  │  │
│  │  ║  │  │  │  [Close Button] [Title]            │  │  │  ║  │  │
│  │  ║  │  │  └────────────────────────────────────┘  │  │  ║  │  │
│  │  ║  │  │  ┌────────────────────────────────────┐  │  │  ║  │  │
│  │  ║  │  │  │     TabContainer (Optional)        │  │  │  ║  │  │
│  │  ║  │  │  │  [WiFi Tab] [Menu Tab]             │  │  │  ║  │  │
│  │  ║  │  │  └────────────────────────────────────┘  │  │  ║  │  │
│  │  ║  │  │  ┌────────────────────────────────────┐  │  │  ║  │  │
│  │  ║  │  │  │     Content Section                │  │  │  ║  │  │
│  │  ║  │  │  │  ┌──────────────────────────────┐  │  │  │  ║  │  │
│  │  ║  │  │  │  │   WifiCard / Grid            │  │  │  │  ║  │  │
│  │  ║  │  │  │  │   MOBILE: Breakout full-width│  │  │  │  ║  │  │
│  │  ║  │  │  │  └──────────────────────────────┘  │  │  │  ║  │  │
│  │  ║  │  │  │  ┌──────────────────────────────┐  │  │  │  ║  │  │
│  │  ║  │  │  │  │   QRCodeContainer            │  │  │  │  ║  │  │
│  │  ║  │  │  │  │   Centered, responsive size  │  │  │  │  ║  │  │
│  │  ║  │  │  │  └──────────────────────────────┘  │  │  │  ║  │  │
│  │  ║  │  │  └────────────────────────────────────┘  │  │  ║  │  │
│  │  ║  │  └───────────────────────────────────────────┘  │  ║  │  │
│  │  ║  └─────────────────────────────────────────────────┘  ║  │  │
│  │  ╚═══════════════════════════════════════════════════════╝  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Desktop Layout (>768px)

```
┌────────────── VIEWPORT (100vw) ──────────────┐
│  ◄──16px──►                    ◄──16px──►    │
│  ┌────────────────────────────────────────┐  │
│  │      ModalOverlay (padding: 16px)      │  │
│  │  ┌──────────────────────────────────┐  │  │
│  │  │   ModalCard (max-width: 460px)   │  │  │
│  │  │  ┌────────────────────────────┐  │  │  │
│  │  │  │  Padding: 32px 28px        │  │  │  │
│  │  │  │  ┌──────────────────────┐  │  │  │  │
│  │  │  │  │   Content            │  │  │  │  │
│  │  │  │  │   width: 100%        │  │  │  │  │
│  │  │  │  └──────────────────────┘  │  │  │  │
│  │  │  └────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────┘  │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

## Mobile Layout (≤480px)

```
┌─────── VIEWPORT (100vw) ───────┐
│ ModalOverlay (padding: 0)      │
│┌──────────────────────────────┐│
││  ModalCard (width: 100vw)    ││
││ ┌──────────────────────────┐ ││
││ │ Padding: 24px 16px       │ ││
││ │ ┌──────────────────────┐ │ ││
││ │ │  WifiCard            │ │ ││
││ │ │  ◄─(-16px)           │ │ ││
││ │ │  Breakout full-width │ │ ││
││ │ │  width: calc(100%+32)│ │ ││
││ │ │                      │ │ ││
││ │ └──────────────────────┘ │ ││
││ └──────────────────────────┘ ││
│└──────────────────────────────┘│
└────────────────────────────────┘
```

## Breakout Pattern Visualization

```
Parent Container (ModalCard)
├─ padding-left: 16px
├─ padding-right: 16px
└─ width: 100vw

Child Component (WifiCard) - Breakout
├─ margin-left: -16px     ◄── Negative margin
├─ margin-right: -16px    ◄── Cancels parent padding
├─ width: calc(100% + 32px)  ◄── 100% + (2 × 16px)
└─ Result: Full viewport width (100vw)

Visual:
┌────────────────────────────────┐
│ ModalCard padding: 16px        │
│ ┌──────────────────────────┐   │
│ │ Normal Content           │   │
│ └──────────────────────────┘   │
┌────────────────────────────────┐ ◄── Breakout Component
│ Full-width WifiCard            │     (extends beyond parent)
└────────────────────────────────┘
│ ┌──────────────────────────┐   │
│ │ Normal Content           │   │
│ └──────────────────────────┘   │
└────────────────────────────────┘
```

## Responsive Width Formula

```
Desktop:
  Overlay: 100vw (fixed)
  Card: min(460px, 100vw - 32px)
  Content: Card width - padding

Mobile (≤480px):
  Overlay: 100vw (fixed)
  Card: 100vw (no max-width)
  Content Standard: 100vw - 32px (16px × 2)
  Content Breakout: 100vw (negative margins)

Calculation Example (480px viewport):
  Card width: 100vw = 480px
  Card padding: 16px left + 16px right
  Content width: 480px - 32px = 448px
  Breakout width: calc(100% + 32px) = 448px + 32px = 480px ✓
```

## Z-Index Hierarchy

```
Level 5: Modal Overlay & Card (z-index: 2000)
         ├─ ModalOverlay: 2000
         └─ ModalCard: inherits from overlay

Level 4: Modal Content (z-index: 1)
         ├─ Header, Tabs, Buttons: 1
         └─ QR Code, Cards: 1

Level 3: Navigation Modals (z-index: 1001)
         └─ DropupMenu: 1001

Level 2: Modal Backdrop (z-index: 1999)
         └─ ModalOverlay backdrop: 1999

Level 1: Bottom Navigation (z-index: 100)
         └─ NavContainer: 100

Base: Page Content (z-index: auto)
```

## Component Interaction Flow

```
User Action → Modal Open
     ↓
1. ModalOverlay renders
   └─ Apply responsive padding
      └─ Desktop: 16px
      └─ Mobile: 0
     ↓
2. ModalCard renders inside
   └─ Apply responsive width
      └─ Desktop: max 460px, centered
      └─ Mobile: 100vw, full-width
     ↓
3. Content components render
   └─ Normal content: Use parent width
   └─ Breakout content: Negative margins
     ↓
4. Animation complete
   └─ Modal fully visible and interactive
```

## Styled Components Architecture

```typescript
// Base Modal System
ModalOverlay (Container)
  ↓
  ├─ Manages viewport overlay
  ├─ Controls responsive padding
  ├─ Handles backdrop/blur
  └─ Contains ModalCard

ModalCard (Content Wrapper)
  ↓
  ├─ Manages content width
  ├─ Controls border radius
  ├─ Handles internal padding
  └─ Contains all modal content

Content Components (Children)
  ↓
  ├─ Inherit parent width
  ├─ Apply breakout pattern if needed
  ├─ Manage own spacing
  └─ Render final UI
```

## Padding Inheritance Chain

```
Desktop (>768px):
  Viewport
    └─ ModalOverlay: padding 16px
         └─ ModalCard: max-width 460px, padding 32px 28px
              └─ Content: width 100% (of card)
                   └─ Effective width: 460px - 56px = 404px

Mobile (≤480px):
  Viewport
    └─ ModalOverlay: padding 0
         └─ ModalCard: width 100vw, padding 24px 16px
              └─ Content Normal: width 100% (of card)
                   └─ Effective width: 100vw - 32px
              └─ Content Breakout: width calc(100% + 32px)
                   └─ Effective width: 100vw ✓
```

## Responsive Transform Points

```
Breakpoint Cascade:

360px ──────► Extra Small Mobile
              ├─ Card padding: 20px 12px
              ├─ QR size: 160px
              └─ Font scaling

480px ──────► Small Mobile
              ├─ Card padding: 24px 16px
              ├─ QR size: 180px
              └─ Full-width triggers

768px ──────► Tablet Threshold
              ├─ Card padding: 24px 20px
              ├─ QR size: 200px
              └─ Centered modal begins

769px+ ─────► Desktop
              ├─ Card padding: 32px 28px
              ├─ QR size: 220px
              └─ Max-width constraints
```

## State Management Flow

```
Modal State Machine:

[Closed] ─────► Open Event ─────► [Opening]
   ▲                                    │
   │                                    ▼
   │                            [Fully Open]
   │                                    │
   │                                    ▼
   └────── Close Event ◄───────── [Closing]

Component Lifecycle:
  1. isOpen changes to true
  2. AnimatePresence triggers entry
  3. ModalOverlay fades in
  4. ModalCard scales & slides in
  5. Content renders with animation
  6. Interactive state reached

  Reverse on close
```

## Performance Optimization Points

```
Critical Render Path:

Initial Render
  └─ ModalOverlay (fixed position)
       └─ Backdrop blur (GPU layer)
            └─ ModalCard (transform)
                 └─ Content (layout)

Optimization Techniques:
  ├─ will-change: transform (ModalCard)
  ├─ transform: translateZ(0) (GPU acceleration)
  ├─ backdrop-filter (composite layer)
  ├─ contain: layout (content isolation)
  └─ Lazy load QR generation
```

## Accessibility Tree

```
Modal Accessibility Structure:

[role="dialog"]
  └─ ModalOverlay (aria-modal="true")
       └─ ModalCard
            ├─ [role="heading"] ModalTitle
            ├─ [role="button"] CloseButton (aria-label)
            ├─ [role="tablist"] TabContainer (optional)
            │    ├─ [role="tab"] WiFi Tab
            │    └─ [role="tab"] Menu Tab
            ├─ [role="tabpanel"] Content Area
            │    ├─ WifiCard
            │    ├─ QRCodeContainer
            │    └─ ActionButtons
            └─ Focus Trap Container
```

## Summary

This architecture provides:

1. **Clear Hierarchy**: Overlay → Card → Content
2. **Responsive Strategy**: Mobile-first with breakout pattern
3. **Clean Separation**: Each component has single responsibility
4. **Predictable Behavior**: Consistent width calculations
5. **Performance**: GPU-accelerated, optimized renders
6. **Accessibility**: Proper ARIA structure

---

**Key Architectural Principles:**
- Overlay manages padding (0 on mobile)
- Card manages width (100vw on mobile)
- Content inherits naturally
- Breakout pattern for edge-to-edge
- Progressive enhancement desktop → mobile
