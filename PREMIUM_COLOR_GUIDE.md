# Premium Color System - 60-30-10 Rule

## Overview
This design follows the **60-30-10 color rule** for a balanced, high-end aesthetic that creates visual hierarchy and sophistication.

---

## Color Distribution

### 60% - Neutral Base (The Canvas)
**Purpose:** Creates space, cleanliness, and breathing room

**Colors:**
- **Cream/Off-White:** `hsl(40 20% 97%)` - Main background
- **Pure White:** `hsl(0 0% 100%)` - Card surfaces
- **Light Beige:** `hsl(40 15% 94%)` - Muted backgrounds

**Usage:**
```tsx
// Main backgrounds
<div className="bg-background">

// Card surfaces  
<div className="bg-card">

// Muted areas
<div className="bg-muted">

// Direct premium color
<div className="bg-premium-cream">
```

**Where to Use:**
- Page backgrounds
- Large content areas
- Spacing between sections
- Card backgrounds

---

### 30% - Dominant Premium (The Mood)
**Purpose:** Establishes sophistication and brand personality

**Colors:**
- **Deep Navy:** `hsl(220 40% 20%)` - Primary brand color
- **Charcoal Gray:** `hsl(0 0% 25%)` - Secondary option
- **Navy Variations:**
  - Light: `hsl(220 35% 30%)`
  - Dark: `hsl(220 45% 12%)`

**Usage:**
```tsx
// Headers and navigation
<nav className="bg-primary text-primary-foreground">

// Major sections
<header className="bg-premium-navy text-premium-cream">

// Important text
<h1 className="text-primary">

// Secondary elements
<div className="bg-secondary">

// Sidebar
<aside className="bg-sidebar text-sidebar-foreground">
```

**Where to Use:**
- Headers and navigation bars
- Sidebars
- Large headings (h1, h2)
- Footer backgrounds
- Hero sections
- Important CTAs backgrounds (when inverted with gold text)

---

### 10% - Metallic/Jewel Accent (The Highlight)
**Purpose:** Creates focal points and guides user attention

**Colors:**
- **Rich Gold:** `hsl(45 100% 51%)` - Primary accent
- **Gold Variations:**
  - Light: `hsl(45 100% 60%)` - Hover states
  - Dark: `hsl(45 100% 42%)` - Active states
  - Muted: `hsl(45 70% 85%)` - Subtle backgrounds
- **Emerald (Alternative):** `hsl(158 64% 35%)` - Success states

**Usage:**
```tsx
// Primary CTA buttons
<button className="bg-accent text-accent-foreground hover:bg-accent-light">
  Book Now
</button>

// Gold accent with shadow
<button className="bg-premium-gold shadow-gold">
  Get Started
</button>

// Icons and highlights
<Icon className="text-accent" />

// Borders and focus rings
<input className="focus:ring-accent" />

// Hover states
<div className="hover:border-accent-light">

// Success indicators
<div className="text-success">
```

**Where to Use (SPARINGLY - only 10%):**
- Primary call-to-action buttons
- Important links
- Active states
- Icons for emphasis
- Pricing highlights
- Special badges
- Focus indicators
- Success notifications

---

## Complete Usage Examples

### Example 1: Hero Section
```tsx
<section className="bg-primary text-primary-foreground py-20">
  <div className="container">
    <h1 className="text-5xl font-bold mb-4">
      Find Your Perfect Car
    </h1>
    <p className="text-lg opacity-90 mb-8">
      Premium selection, unbeatable prices
    </p>
    <button className="bg-accent text-accent-foreground px-8 py-4 rounded-lg 
                       hover:bg-accent-light shadow-gold transition-all">
      Browse Collection
    </button>
  </div>
</section>
```

**Distribution:**
- 60%: Text content area (implicit cream when not specified)
- 30%: Navy background
- 10%: Gold button

---

### Example 2: Card Layout
```tsx
<div className="bg-background p-8"> {/* 60% - Neutral base */}
  <div className="grid gap-6">
    <div className="bg-card p-6 rounded-lg shadow-premium-md"> {/* 60% - White card */}
      <h3 className="text-primary text-2xl mb-4"> {/* 30% - Navy text */}
        Premium Sedan
      </h3>
      <p className="text-muted-foreground mb-6"> {/* 60% - Neutral text */}
        Luxury meets performance in this exceptional vehicle
      </p>
      <div className="flex items-center justify-between">
        <span className="text-3xl font-bold text-primary"> {/* 30% */}
          $45,000
        </span>
        <button className="bg-accent text-accent-foreground px-6 py-2 
                         rounded-md hover:bg-accent-light shadow-gold"> {/* 10% */}
          View Details
        </button>
      </div>
    </div>
  </div>
</div>
```

---

### Example 3: Navigation Bar
```tsx
<nav className="bg-sidebar text-sidebar-foreground"> {/* 30% - Navy */}
  <div className="container flex items-center justify-between py-4">
    <div className="text-2xl font-bold">
      <span className="text-accent">Campare</span> {/* 10% - Gold */}
      <span>Car</span>
    </div>
    
    <div className="flex gap-6">
      <a href="#" className="hover:text-accent transition-colors"> {/* 10% - Gold hover */}
        Buy
      </a>
      <a href="#" className="hover:text-accent transition-colors">
        Sell
      </a>
      <a href="#" className="hover:text-accent transition-colors">
        Compare
      </a>
    </div>
    
    <button className="bg-accent text-accent-foreground px-6 py-2 
                     rounded-md hover:bg-accent-light shadow-gold"> {/* 10% */}
      Sign In
    </button>
  </div>
</nav>
```

---

## Color Palette Reference

### Quick Copy Values

#### Neutral Base (60%)
```css
--background: 40 20% 97%      /* Cream */
--card: 0 0% 100%             /* White */
--muted: 40 15% 94%           /* Light beige */
```

#### Dominant Premium (30%)
```css
--primary: 220 40% 20%        /* Deep navy */
--secondary: 0 0% 25%         /* Charcoal */
--primary-light: 220 35% 30%  /* Light navy */
--primary-dark: 220 45% 12%   /* Dark navy */
```

#### Metallic Accent (10%)
```css
--accent: 45 100% 51%         /* Rich gold */
--accent-light: 45 100% 60%   /* Light gold */
--accent-dark: 45 100% 42%    /* Deep gold */
--accent-muted: 45 70% 85%    /* Soft gold */
--success: 158 64% 35%        /* Emerald */
```

---

## Tailwind Utility Classes

### Premium Shortcuts
```tsx
// Direct access to premium colors
bg-premium-navy        // Deep navy
bg-premium-charcoal    // Charcoal
bg-premium-cream       // Cream
bg-premium-white       // Pure white
bg-premium-gold        // Rich gold
bg-premium-gold-light  // Light gold
bg-premium-gold-dark   // Deep gold
bg-premium-emerald     // Emerald

// Premium shadows
shadow-gold           // Gold glow
shadow-premium-sm     // Small premium shadow
shadow-premium-md     // Medium premium shadow
shadow-premium-lg     // Large premium shadow
shadow-premium-xl     // Extra large premium shadow
```

---

## Best Practices

### DO ✅
- Use cream/white backgrounds for 60% of your layout
- Reserve navy/charcoal for headers, navigation, and key sections (30%)
- Use gold accents sparingly for CTAs and highlights (10%)
- Maintain high contrast for readability
- Use gold for focus states and active elements
- Layer white cards on cream backgrounds for depth

### DON'T ❌
- Don't overuse gold - it loses its premium feel
- Don't use gold for large backgrounds
- Don't mix all three colors equally
- Don't use low-contrast color combinations
- Don't ignore the 60-30-10 ratio
- Don't make everything "premium" - contrast is key

---

## Component Patterns

### Button Variants
```tsx
// Primary CTA (Gold - 10%)
<button className="bg-accent text-accent-foreground hover:bg-accent-light shadow-gold">

// Secondary (Navy - 30%)  
<button className="bg-primary text-primary-foreground hover:bg-primary-light">

// Ghost (Neutral - 60%)
<button className="bg-transparent border border-border hover:bg-muted">

// Outline with gold accent
<button className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
```

### Card Variants
```tsx
// Standard card (60% - White on cream)
<div className="bg-card border border-border rounded-lg shadow-premium-md">

// Premium card (30% navy with gold accent)
<div className="bg-primary text-primary-foreground border-l-4 border-accent rounded-lg">

// Highlighted card (gold border - 10%)
<div className="bg-card border-2 border-accent rounded-lg shadow-gold">
```

---

## Accessibility Notes

- Navy on cream: WCAG AAA compliant for large text
- Gold on navy: WCAG AA compliant
- Ensure gold is not the only indicator (add icons/labels)
- White backgrounds provide maximum contrast
- Dark mode inverts the scheme while maintaining ratios

---

## Dark Mode

In dark mode, the scheme intelligently inverts:
- **60% Base:** Deep charcoal backgrounds
- **30% Dominant:** Lighter navy/gray elements  
- **10% Accent:** Brighter gold for visibility

The ratios remain the same, ensuring consistent premium feel.
