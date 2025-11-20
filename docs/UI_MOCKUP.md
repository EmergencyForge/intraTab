# Configuration Menu UI Mockup

This document provides a text-based visualization of the in-game configuration menu.

## Menu Layout

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  IntraTab Konfiguration                                                 [×] ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐ ║
║  │ Allgemeine Einstellungen                                               │ ║
║  ├────────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                        │ ║
║  │  Framework-Erkennung:        [Automatisch ▼]                          │ ║
║  │  IntraRP URL:                [https://deine-url.de/enotf/     ]       │ ║
║  │  Debug Modus:                [ ⚪─────── ] OFF                        │ ║
║  │  Öffnungstaste:              [F9 ▼]                                   │ ║
║  │                                                                        │ ║
║  └────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐ ║
║  │ Item Anforderungen                                                     │ ║
║  ├────────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                        │ ║
║  │  Item erforderlich:          [ ───────⚪ ] ON                         │ ║
║  │  Erforderliches Item:        [tablet                          ]       │ ║
║  │                                                                        │ ║
║  └────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐ ║
║  │ Erlaubte Jobs                                                          │ ║
║  ├────────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                        │ ║
║  │  ┌─────────┐ ┌─────────────┐ ┌──────────────────┐ ┌───────┐         │ ║
║  │  │police ×│ │ambulance ×│ │firedepartment ×│ │admin ×│         │ ║
║  │  └─────────┘ └─────────────┘ └──────────────────┘ └───────┘         │ ║
║  │                                                                        │ ║
║  │  [Job Name eingeben              ] [Hinzufügen]                       │ ║
║  │                                                                        │ ║
║  └────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐ ║
║  │ Animation & Prop                                                       │ ║
║  ├────────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                        │ ║
║  │  Prop verwenden:             [ ───────⚪ ] ON                         │ ║
║  │  Prop Model:                 [prop_cs_tablet             ]            │ ║
║  │                                                                        │ ║
║  └────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐ ║
║  │ EMD Synchronisierung                                                   │ ║
║  ├────────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                        │ ║
║  │  EMD Sync aktiviert:         [ ⚪─────── ] OFF                        │ ║
║  │  PHP Endpoint:               [https://deine-url.de/api/emd-sync.php] │ ║
║  │  API Key:                    [••••••••••••••              ]           │ ║
║  │  Sync Interval (ms):         [30000                       ]           │ ║
║  │                                                                        │ ║
║  └────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐ ║
║  │                [Auf Standardwerte zurücksetzen]                        │ ║
║  └────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## Color Scheme

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Top Bar)                                            │
│ Background: Dark Blue (#0a1a3a)                             │
│ Text: White (#ffffff)                                       │
│ Close Button: Red (#dc3545)                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ MAIN PANEL                                                  │
│ Background: Blue Gradient (#1e3c72 → #2a5298)              │
│ Sections: Semi-transparent white overlay                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ INPUTS & CONTROLS                                           │
│ Input Fields: Semi-transparent white background             │
│ Text: White (#ffffff)                                       │
│ Borders: Light white (#ffffff, 20% opacity)                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TOGGLE SWITCHES                                             │
│ OFF State: White/Grey (20% opacity)                         │
│ ON State: Green (#28a745)                                   │
│ Slider: White circle                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ BUTTONS                                                     │
│ Add Job: Green (#28a745)                                    │
│ Remove Job: Red (#dc3545)                                   │
│ Reset: Red (#dc3545)                                        │
│ Hover: Slightly darker shade                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ JOB TAGS                                                    │
│ Background: White (15% opacity)                             │
│ Border: White (20% opacity)                                 │
│ Text: White (#ffffff)                                       │
│ Remove Button: Red background                               │
└─────────────────────────────────────────────────────────────┘
```

## Interaction Flow

### Opening Menu
```
Player presses key or types /intrarp-config
                ↓
Permission check (intrarp.config)
                ↓
        ┌───────┴────────┐
        │                │
    ✅ Allowed      ❌ Denied
        │                │
   Open Menu      Show Error
```

### Making Changes
```
User modifies setting
        ↓
Change detected (onChange event)
        ↓
Send to server (NUI callback)
        ↓
Server validates input
        ↓
    ┌───┴────┐
    │        │
  Valid   Invalid
    │        │
    ↓        ↓
  Save    Reject
    │        │
    ↓        └──→ Error notification
Broadcast to all clients
    ↓
Update local config
    ↓
Success notification
```

### Job Management
```
Add Job:
  Type job name → Click "Hinzufügen" → Validate → Add to list → Save

Remove Job:
  Click × on job tag → Remove from list → Save → Update UI
```

## Responsive Behavior

### Desktop (> 1200px)
- Full width layout (max 900px)
- Two-column label/input layout
- Large fonts (16px+)

### Tablet (768px - 1200px)
- 95% width
- Slightly smaller fonts (14px)
- Maintained two-column layout

### Mobile (< 768px)
- 98% width
- Stacked label/input (single column)
- Smaller fonts (12px)
- Compact buttons

## Animations

### Menu Open
- Fade in (opacity 0 → 1)
- Scale animation (0.9 → 1.0)
- Duration: 300ms

### Menu Close
- Fade out (opacity 1 → 0)
- Scale animation (1.0 → 0.8)
- Duration: 300ms

### Hover Effects
- Buttons: translateY(-1px) + shadow
- Toggle switches: brightness increase
- Job tags: background opacity increase

## Accessibility

### Keyboard Navigation
- ✅ Tab navigation through all inputs
- ✅ ESC to close menu
- ✅ Enter in job input to add job

### Screen Readers
- Semantic HTML structure
- Label associations
- ARIA attributes where needed

### High Contrast Mode
- Increased border visibility
- Higher contrast text
- Clearer focus indicators

## Browser Compatibility

The NUI is compatible with:
- ✅ Chromium Embedded Framework (FiveM)
- ✅ Modern CSS features (flexbox, grid)
- ✅ ES6+ JavaScript

## Notes

- The UI is embedded within the game using FiveM's NUI system
- All changes are made in real-time without page refreshes
- The menu appears as an overlay on top of the game
- Background is semi-transparent to maintain game visibility
- Menu automatically centers on screen
- All text is in German (matching the target audience)
