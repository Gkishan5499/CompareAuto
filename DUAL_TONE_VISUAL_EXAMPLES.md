# Dual Tone Colors - Visual Examples

This guide shows how the dual tone colors appear in the UI, with practical examples.

## Color Swatch Display

### Single Tone (Monotone) Colors

```
Circle Swatch (Single Color)

      ▲
     ●●●
    ●   ●
   ●  ⬤  ●  ← Full color filled (e.g., Stealth Black)
    ●   ●
     ●●●
      ▼

Selected State (with ring):
✓ border-primary + ring-offset
```

**Examples:**
- ⚫ Stealth Black
- ⚪ Everest White  
- 🟦 Nebula Blue
- 🟨 Citrine Yellow

### Dual Tone (Split) Colors

```
Circle Swatch (Two Colors)

      ▲
     ███
    ██ ██
   ██ │ ██  ← Colored on left, ring notch shows selection
    ██ ██
     ███
      ▼

Left half: Primary Color
Right half: Secondary Color
Middle divider: Visual split
```

**Examples:**
- 🟨⬛ Citrine Yellow | Stealth Black
- 🟫⬛ Dune Beige | Stealth Black
- 🔴⬛ Tango Red | Stealth Black
- 🟢⚪ Deep Forest | Everest White

## Color Selection UI

### Single Color Selection

```
┌───────────────────────────────────────┐
│      Available Colors (4):            │
│                                        │
│  [⚪]   [⚫]   [🟦]   [🟨]            │
│ White  Black   Blue  Yellow           │
│  8     6       7     5                │
│ photos photos photos photos           │
│                                        │
└───────────────────────────────────────┘
```

Click any color to view its images.

### With Dual Tone Colors

```
┌───────────────────────────────────────┐
│     [Single Tone] [Dual Tone] ←─── Tab│
│                                        │
│  Tab 1: Single Tone                  │
│  ┌─────────────────────────────────┐ │
│  │ Available Colors (4):           │ │
│  │                                  │ │
│  │ [⚪]  [⚫]  [🟦]  [🟨]          │ │
│  │ White Black  Blue  Yellow       │ │
│  └─────────────────────────────────┘ │
│                                        │
│  OR                                    │
│                                        │
│  Tab 2: Dual Tone                    │
│  ┌─────────────────────────────────┐ │
│  │ Available Colors (2):           │ │
│  │                                  │ │
│  │ [🟨⬛]    [🟫⬛]               │ │
│  │  Yellow   Beige                 │ │
│  │   Black   Black                 │ │
│  │  (6)     (4)                   │ │
│  │ photos  photos                  │ │
│  └─────────────────────────────────┘ │
│                                        │
└───────────────────────────────────────┘
```

## Color Swatch Scrolling

For models with many colors, swatches scroll horizontally:

```
┌────────────────────────────────────────────┐
│ ◀ [⚪] [⚫] [🟦] [🟨] [🟢] [🟧] [🟣] ▶    │
│    White Black Blue Yellow Green Orange Purple
│                                              │
│    (Arrow appears when more colors exist)   │
│                                              │
│    Scroll shows more colors →               │
└────────────────────────────────────────────┘
```

## Selected Color Display

After clicking a color, prominent display shows selection:

```
┌────────────────────┐
│   Citrine Yellow   │  ← Color name in box
│   with Stealth     │     (for dual tone: "Primary with Secondary")
│      Black         │
└────────────────────┘
```

### Example States:

**Monotone Selected:**
```
┌────────────┐
│   White    │
└────────────┘
```

**Dual Tone Selected:**
```
┌──────────────────────────┐
│  Citrine Yellow          │
│  with Stealth Black      │
└──────────────────────────┘
```

## Full Colors Tab Example

### Scenario: Mahindra XUV 3XO

```
╔════════════════════════════════════════════╗
║            COLORS (Available Colors)       ║
╠════════════════════════════════════════════╣
║                                            ║
║  [Single Tone] [Dual Tone] ← User clicks  ║
║  ═══════════════════════════════════════  ║
║                                            ║
║  ┌──────────────────────────────────────┐ ║
║  │   Hero Image Section                 │ ║
║  │  ┌────────────────────────────────┐  │ ║
║  │  │  Car Photo (changes per color) │  │ ║
║  │  │  - Main view                   │  │ ║
║  │  │  - Large gallery               │  │ ║
║  │  │  - Professional shots          │  │ ║
║  │  └────────────────────────────────┘  │ ║
║  │  [◀ prev] ▰▰▮▱▱ [next ▶]            │ ║
║  └──────────────────────────────────────┘ ║
║                                            ║
║  Available Colors (4 + 2 Dual Tone):      ║
║                                            ║
║  ◀ [⚪] [⚫] [🟦] [🟨] [🟨⬛] [🟫⬛] ▶   ║
║    White Black Blue Yellow Yellow  Beige   ║
║    (8)   (6)  (7)  (5)    Stealth Stealth  ║
║   photos photo           Black   Black    ║
║                          (6)     (4)      ║
║                          photos  photos   ║
║                                            ║
╚════════════════════════════════════════════╝
```

**After selecting "Citrine Yellow with Stealth Black":**

```
╔════════════════════════════════════════════╗
║            COLORS (Available Colors)       ║
╠════════════════════════════════════════════╣
║                                            ║
║  [Single Tone] [Dual Tone] ← Show as Dark ║
║  ═══════════════════════════════════════  ║
║                                            ║
║  ┌──────────────────────────────────────┐ ║
║  │   Hero Image Section                 │ ║
║  │  ┌────────────────────────────────┐  │ ║
║  │  │  Dual Tone Car Photo           │  │ ║
║  │  │  (Yellow with Black accents)   │  │ ║
║  │  │  - Main view                   │  │ ║
║  │  │  - Angles showing colors       │  │ ║
║  │  │  - Professional shots          │  │ ║
║  │  └────────────────────────────────┘  │ ║
║  │  [◀ prev] ▰▮▱▱▱ [next ▶]           │ ║
║  │  1/6 photos                          │ ║
║  └──────────────────────────────────────┘ ║
║                                            ║
║  Available Colors (2):                    ║
║                                            ║
║  ◀ [🟨⬛] [🟫⬛] ▶                       ║
║    Yellow   Beige                        ║
║    Stealth  Stealth                      ║
║    Black   Black                         ║
║   (6)     (4)                           ║
║   photos  photos                        ║
║   ══════                                ║
║   Selected (ring shows)                 ║
║                                            ║
║  ┌────────────────────────────┐          ║
║  │ Citrine Yellow             │          ║
║  │ with Stealth Black         │          ║
║  └────────────────────────────┘          ║
║                                            ║
╚════════════════════════════════════════════╝
```

## Color Output Format

### In Console (Developer Tools)

```javascript
// When selecting monotone color
🎨 ColorSwatches Component Received: {
  monotoneColors: ["White", "Black", "Silver"],
  dualToneColors: [],
  selectedColor: "Black",
  colorMode: "monotone"
}

// When selecting dual tone color
🎨 ColorSwatches Component Received: {
  monotoneColors: ["White", "Black"],
  dualToneColors: [
    { name: "Citrine Yellow with Stealth Black", primary: "Citrine Yellow", secondary: "Stealth Black" }
  ],
  selectedColor: {
    name: "Citrine Yellow with Stealth Black",
    primary: "Citrine Yellow",
    secondary: "Stealth Black"
  },
  colorMode: "dual"
}

// Image matching
🔍 [DUAL TONE: Citrine Yellow with Stealth Black]
  📄 Filename: mahindra_xuv3xo_eq5_citrine_yellow_stealth_black.jpg
  Pattern1 (mahindra_xuv3xo_eq5_citrine_yellow_stealth_black): true
  ✅ MATCHED: Found 6 image(s)
```

## Design System Integration

### 60-30-10 Rule (Premium Design)

The dual tone color display follows the app's premium design:

```
60% Neutral (Background)
├─ White card backgrounds
└─ Cream/beige spacing

30% Primary (Content)
├─ Navy headers
└─ Primary text

10% Accent (Highlights)
├─ Gold ring on selected color
├─ Blue border on active tab
└─ Checkmark on selected swatch
```

### Tailwind Classes Used

```typescript
// Colors
bg-yellow-400      // Citrine Yellow
bg-black          // Stealth Black
bg-white          // Everest White
bg-gray-600       // Galaxy Grey

// Selection States
ring-4 ring-primary        // Blue ring (10% accent)
ring-offset-2              // Ring offset
scale-110                  // Slightly enlarged
border-blue-500           // Blue border for active tab

// Layout
flex gap-4                // Color spacing
overflow-x-auto          // Horizontal scroll
scroll-smooth            // Smooth scrolling
```

## Mobile Responsive

### Desktop (≥1024px)
- Horizontal scrolling with visible arrows
- Large image gallery (4+ columns)
- Multiple colors visible at once

### Tablet (640px - 1024px)
- Reduced gallery size (2-3 columns)
- Arrows still visible for scroll
- Colors in single row with scroll

### Mobile (<640px)
- Full-width gallery (1 column)
- Stacked color swatches (scroll enabled)
- Compact display
- Touch-friendly tap targets (48px minimum)

## Animation States

### Swatch Hover
```
Default:       Hover:         Selected:
border-gray    scale-105      scale-110
opacity-100    opacity-100    ring-4 ring-primary
               cursor-pointer  border-primary
```

### Tab Switch
```
Inactive:              Active:
text-gray-500          text-primary
border-transparent     border-b-2 border-primary
cursor-pointer         (animated underline)
```

### Image Transition
```
On color change:
1. Fade out current images (100ms)
2. Load new images
3. Fade in new images (200ms)
```

---

This visual guide helps in understanding how the dual tone colors work in the actual UI. The implementation provides a smooth and intuitive experience for users to browse different color options.
