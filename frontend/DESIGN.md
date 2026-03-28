# Design System — Notion Calm (Financial Tracker)

> Paste this file into your CLAUDE.md, or reference it at the start of any UI task with:
> "Follow the design system defined in DESIGN_SYSTEM.md before writing any UI code."

---

## Philosophy

This app uses a **Notion-calm** design language. The goal is to make personal finance feel
approachable, clear, and stress-free — not like a trading terminal.

Core principles:

- **Typography and whitespace carry hierarchy.** Color is used sparingly, only to mark
  status or category — never decoratively.
- **Nothing shouts.** No vivid brand colors, no gradients, no glows. Every element should
  feel like it belongs on a calm editorial page.
- **Neutral first, semantic second.** The base palette is near-neutral warm grays and
  off-whites. The only "real" colors are the semantic ones: green for positive, red for
  negative. Even those are muted.
- **Consistency over cleverness.** Use the same spacing, radius, and type scale everywhere.
  Surprise the user with clarity, not with visual tricks.

---

## Color Tokens

Define these as CSS custom properties on `:root`. All colors must work in both light and
dark mode. Never hardcode hex values in component code — always reference a token.

### Light Mode

```css
:root {
    /* Backgrounds */
    --color-bg-app: #ffffff; /* page background */
    --color-bg-sidebar: #f7f6f3; /* sidebar, secondary surfaces */
    --color-bg-elevated: #ffffff; /* cards, modals */
    --color-bg-subtle: #f7f6f3; /* stat cards, input fills, hover states */
    --color-bg-hover: #efefed; /* nav item hover, row hover */
    --color-bg-active: #efefed; /* nav item active */

    /* Borders */
    --color-border: #e8e5df; /* default border — dividers, card edges */
    --color-border-strong: #d6d3cc; /* emphasized borders */

    /* Text */
    --color-text-primary: #1a1a1a; /* headings, primary content */
    --color-text-secondary: #6b6b6b; /* labels, metadata, nav items */
    --color-text-tertiary: #9b9b9b; /* hints, timestamps, placeholders */

    /* Semantic — Positive (income, gains, on-track) */
    --color-positive: #448361; /* text */
    --color-positive-bg: #eaf3e9; /* tag/badge background */

    /* Semantic — Negative (expenses over budget, losses) */
    --color-negative: #c0392b; /* text */
    --color-negative-bg: #fcecea; /* tag/badge background */

    /* Semantic — Neutral tag */
    --color-tag-bg: #efefed;
    --color-tag-text: #5a5a5a;

    /* Interactive accent (CTA buttons, links, focus rings) */
    --color-accent: #2b2b2b; /* near-black — buttons, active text links */
    --color-accent-fg: #ffffff; /* text on accent background */
}
```

### Dark Mode

```css
@media (prefers-color-scheme: dark) {
    :root {
        --color-bg-app: #191919;
        --color-bg-sidebar: #202020;
        --color-bg-elevated: #202020;
        --color-bg-subtle: #232323;
        --color-bg-hover: #2c2c2c;
        --color-bg-active: #2c2c2c;

        --color-border: #2f2f2f;
        --color-border-strong: #3a3a3a;

        --color-text-primary: #e8e8e6;
        --color-text-secondary: #9b9b99;
        --color-text-tertiary: #6b6b69;

        --color-positive: #5aa67a;
        --color-positive-bg: #1a2e22;

        --color-negative: #e05a4e;
        --color-negative-bg: #2e1a1a;

        --color-tag-bg: #2c2c2c;
        --color-tag-text: #9b9b99;

        --color-accent: #e8e8e6;
        --color-accent-fg: #191919;
    }
}
```

---

## Typography

The type scale does the heavy lifting. Use weight and size to create hierarchy — not color.

```css
:root {
    --font-sans: "Inter", system-ui, -apple-system, sans-serif;

    /* Scale */
    --text-xs: 11px; /* timestamps, captions, section dividers */
    --text-sm: 13px; /* metadata, secondary labels, nav items */
    --text-base: 15px; /* body text, transaction names */
    --text-lg: 18px; /* card headings, section titles */
    --text-xl: 24px; /* stat values */
    --text-2xl: 28px; /* page title */

    /* Weight */
    --weight-normal: 400;
    --weight-medium: 500;
    --weight-semibold: 600;

    /* Line heights */
    --leading-tight: 1.2;
    --leading-normal: 1.5;
    --leading-relaxed: 1.7;
}
```

### Usage Rules

| Element                 | Size          | Weight              | Color                                                                |
| ----------------------- | ------------- | ------------------- | -------------------------------------------------------------------- |
| Page title              | `--text-2xl`  | `--weight-semibold` | `--color-text-primary`                                               |
| Section heading         | `--text-lg`   | `--weight-medium`   | `--color-text-primary`                                               |
| Body / transaction name | `--text-base` | `--weight-normal`   | `--color-text-primary`                                               |
| Label / metadata        | `--text-sm`   | `--weight-normal`   | `--color-text-secondary`                                             |
| Caption / timestamp     | `--text-xs`   | `--weight-normal`   | `--color-text-tertiary`                                              |
| Stat value              | `--text-xl`   | `--weight-semibold` | `--color-text-primary`                                               |
| Positive amount         | `--text-base` | `--weight-medium`   | `--color-positive`                                                   |
| Negative amount         | `--text-base` | `--weight-medium`   | `--color-text-primary` (not red — red only for "over budget" labels) |

> **Rule:** Never use color to indicate a negative transaction amount in the list view.
> Use `--color-negative` only for status labels ("Over budget"), not for every expense.
> Expenses are neutral — that is normal behavior, not an error state.

---

## Spacing

4px base grid. All spacing values must be multiples of 4.

```css
:root {
    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-5: 20px;
    --space-6: 24px;
    --space-8: 32px;
    --space-10: 40px;
    --space-12: 48px;
}
```

### Layout Spacing Reference

| Context                 | Value                                        |
| ----------------------- | -------------------------------------------- |
| Page horizontal padding | `--space-8` (desktop), `--space-4` (mobile)  |
| Section vertical gap    | `--space-8`                                  |
| Card internal padding   | `--space-5`                                  |
| Between list items      | `--space-1` (tight), `--space-3` (relaxed)   |
| Between label and value | `--space-1`                                  |
| Between stat cards      | `--space-3`                                  |
| Input padding           | `--space-2` vertical, `--space-3` horizontal |
| Sidebar width           | `160px` (desktop), hidden on mobile          |
| Content max-width       | `720px` (reading width for forms/details)    |

---

## Border Radius

Notion uses subtle rounding — enough to feel modern, never pill-shaped or bubbly.

```css
:root {
    --radius-sm: 4px; /* tags, badges, small chips */
    --radius-md: 6px; /* inputs, nav items, small cards */
    --radius-lg: 10px; /* stat cards, modals, main cards */
    --radius-xl: 14px; /* page-level containers, app shell */
}
```

---

## Borders

All borders are `0.5px`. This is intentional — hairline borders feel more refined and
less heavy than 1px. Always use a border color token, never hardcode.

```css
/* Standard border */
border: 0.5px solid var(--color-border);

/* Emphasized border (hover, focus-adjacent) */
border: 0.5px solid var(--color-border-strong);
```

---

## Components

### Stat Card

Used for key metrics: net worth, total spent, amount saved.

```tsx
<div
    style={{
        background: "var(--color-bg-subtle)",
        border: "0.5px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4) var(--space-5)",
    }}
>
    <p
        style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-secondary)",
            marginBottom: "var(--space-1)",
        }}
    >
        Net worth
    </p>
    <p
        style={{
            fontSize: "var(--text-xl)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--color-text-primary)",
        }}
    >
        $48,230
    </p>
    <p
        style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-positive)",
            marginTop: "var(--space-1)",
        }}
    >
        ▲ +2.1% this month
    </p>
</div>
```

### Transaction Row

```tsx
<div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-2) var(--space-3)",
        borderRadius: "var(--radius-md)",
        // hover: background var(--color-bg-hover)
    }}
>
    {/* Icon */}
    <div
        style={{
            width: 28,
            height: 28,
            borderRadius: "var(--radius-md)",
            background: "var(--color-bg-hover)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            color: "var(--color-text-secondary)",
            flexShrink: 0,
        }}
    >
        ☕
    </div>

    {/* Details */}
    <div style={{ flex: 1, minWidth: 0 }}>
        <p
            style={{
                fontSize: "var(--text-base)",
                color: "var(--color-text-primary)",
                fontWeight: "var(--weight-medium)",
            }}
        >
            Blue Bottle Coffee
        </p>
        <p
            style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-tertiary)",
            }}
        >
            Food & Drink · Today, 9:14 AM
        </p>
    </div>

    {/* Amount — neutral color for expenses */}
    <p
        style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-primary)",
            fontWeight: "var(--weight-medium)",
        }}
    >
        -$6.50
    </p>
</div>
```

### Tag / Badge

```tsx
/* Positive tag */
<span style={{
  fontSize: 'var(--text-xs)',
  padding: '2px 8px',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--color-positive-bg)',
  color: 'var(--color-positive)',
}}>
  Income
</span>

/* Negative/warning tag */
<span style={{
  fontSize: 'var(--text-xs)',
  padding: '2px 8px',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--color-negative-bg)',
  color: 'var(--color-negative)',
}}>
  Over budget
</span>

/* Neutral tag */
<span style={{
  fontSize: 'var(--text-xs)',
  padding: '2px 8px',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--color-tag-bg)',
  color: 'var(--color-tag-text)',
}}>
  Groceries
</span>
```

### Primary Button

```tsx
<button
    style={{
        background: "var(--color-accent)",
        color: "var(--color-accent-fg)",
        border: "none",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-2) var(--space-5)",
        fontSize: "var(--text-sm)",
        fontWeight: "var(--weight-medium)",
        cursor: "pointer",
        // hover: opacity 0.85
        // active: transform scale(0.98)
    }}
>
    Add transaction
</button>
```

### Ghost Button

```tsx
<button
    style={{
        background: "transparent",
        color: "var(--color-text-secondary)",
        border: "0.5px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-2) var(--space-5)",
        fontSize: "var(--text-sm)",
        fontWeight: "var(--weight-medium)",
        cursor: "pointer",
        // hover: background var(--color-bg-hover)
    }}
>
    Cancel
</button>
```

### Text Input

```tsx
<input
    style={{
        width: "100%",
        background: "var(--color-bg-subtle)",
        border: "0.5px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-2) var(--space-3)",
        fontSize: "var(--text-base)" /* NEVER below 16px — prevents iOS zoom */,
        color: "var(--color-text-primary)",
        outline: "none",
        // focus: border-color var(--color-border-strong), box-shadow 0 0 0 3px rgba(0,0,0,0.06)
    }}
    placeholder="Amount"
/>
```

### Section Divider with Label

```tsx
<div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
    <div
        style={{ flex: 1, height: "0.5px", background: "var(--color-border)" }}
    />
    <span
        style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-tertiary)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
        }}
    >
        Recent transactions
    </span>
    <div
        style={{ flex: 1, height: "0.5px", background: "var(--color-border)" }}
    />
</div>
```

### Sidebar Navigation Item

```tsx
<div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        padding: "var(--space-1) var(--space-2)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)",
        color: isActive
            ? "var(--color-text-primary)"
            : "var(--color-text-secondary)",
        fontWeight: isActive ? "var(--weight-medium)" : "var(--weight-normal)",
        background: isActive ? "var(--color-bg-active)" : "transparent",
        cursor: "pointer",
        // hover (if not active): background var(--color-bg-hover)
    }}
>
    <span style={{ fontSize: 14, width: 16 }}>{icon}</span>
    {label}
</div>
```

---

## Layout Structure

```
┌─────────────────────────────────────────────────┐
│  App shell (--color-bg-app)                     │
│  ┌──────────┬──────────────────────────────┐    │
│  │ Sidebar  │ Main content                 │    │
│  │ 160px    │ max-width 720px, centered    │    │
│  │ bg-sidebar│                             │    │
│  │          │  Page title (--text-2xl)     │    │
│  │  Nav     │  ↕ --space-8                 │    │
│  │  items   │  Stat cards (3-col grid)     │    │
│  │          │  ↕ --space-8                 │    │
│  │          │  Section divider             │    │
│  │          │  ↕ --space-3                 │    │
│  │          │  Transaction list            │    │
│  └──────────┴──────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

- On mobile (`< 768px`): sidebar collapses into a bottom tab bar.
- Content area has `padding: var(--space-8)` on desktop, `var(--space-4)` on mobile.
- Stat cards use `display: grid; grid-template-columns: repeat(3, 1fr)` on desktop,
  `repeat(2, 1fr)` on tablet, `1fr` on mobile.

---

## 📱 Mobile & Responsive

Mobile is a first-class target, not an afterthought. Every component and page must be
designed mobile-first: write base styles for the smallest screen, then layer on larger
breakpoints with `@media` queries.

### Breakpoints

```css
/* No prefix  → 0px+    Mobile portrait  (360–390px) — design here first */
/* --bp-sm    → 640px+  Mobile landscape / large phones                  */
/* --bp-md    → 768px+  Tablets — sidebar appears, 2-col stat grid       */
/* --bp-lg    → 1024px+ Desktop — full layout, 3-col stat grid           */

:root {
    --bp-sm: 640px;
    --bp-md: 768px;
    --bp-lg: 1024px;
}
```

Primary test targets: **390px** (iPhone 14) and **360px** (common Android).
Always verify at both before marking a step complete.

---

### Layout: Mobile vs Desktop

```
MOBILE (< 768px)                    DESKTOP (≥ 768px)
─────────────────────────────       ──────────────────────────────────────
┌───────────────────────────┐       ┌──────────┬───────────────────────┐
│  Top bar                  │       │          │ Main content           │
│  [title]        [+ Add]   │       │ Sidebar  │ max-width 720px        │
├───────────────────────────┤       │ 160px    │                        │
│                           │       │          │ Page title             │
│  Stat cards               │       │ Nav      │ Stat cards (3-col)     │
│  (1-col stack)            │       │ items    │ Section divider        │
│                           │       │          │ Transaction list       │
│  Section divider          │       │          │                        │
│                           │       └──────────┴───────────────────────┘
│  Transaction list         │
│                           │       Sidebar: 160px fixed left
│                           │       Content: padding var(--space-8)
├───────────────────────────┤
│  Bottom tab bar           │
│  [icon][icon][icon][icon] │
└───────────────────────────┘

Content: padding var(--space-4) sides
No horizontal overflow at any width
```

---

### Bottom Tab Bar

Replaces the sidebar entirely on mobile. Hidden at `768px` and above.

```tsx
/* Bottom tab bar — mobile only */
<nav style={{
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: 56,
  paddingBottom: 'env(safe-area-inset-bottom)', /* notch/home indicator */
  background: 'var(--color-bg-sidebar)',
  borderTop: '0.5px solid var(--color-border)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  zIndex: 100,
  /* hide on desktop: */
  /* @media (min-width: 768px) { display: none } */
}}>
  {tabs.map(tab => (
    <button key={tab.id} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3,
      minWidth: 44,       /* touch target width  */
      minHeight: 44,      /* touch target height */
      padding: 'var(--space-2)',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: isActive(tab) ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
    }}>
      <span style={{ fontSize: 18 }}>{tab.icon}</span>
      <span style={{
        fontSize: 10,
        fontWeight: isActive(tab) ? 'var(--weight-medium)' : 'var(--weight-normal)',
      }}>
        {tab.label}
      </span>
    </button>
  ))}
</nav>

/* Reserve space so content isn't hidden behind the tab bar */
<main style={{ paddingBottom: 'calc(56px + env(safe-area-inset-bottom))' }}>
  {children}
</main>
```

Tab bar contains 4 items max: Overview, Transactions, Budget, Goals.
Labels are always visible — never icon-only on a financial app where clarity matters.

---

### Top Bar (Mobile)

A minimal top bar replaces the sidebar header on mobile.

```tsx
/* Mobile top bar */
<header
    style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--space-3) var(--space-4)",
        background: "var(--color-bg-app)",
        borderBottom: "0.5px solid var(--color-border)",
        minHeight: 52,
        /* hide on desktop: */
        /* @media (min-width: 768px) { display: none } */
    }}
>
    <h1
        style={{
            fontSize: "var(--text-lg)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--color-text-primary)",
        }}
    >
        Overview
    </h1>
    <button
        style={{
            minWidth: 44,
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--color-accent)",
            color: "var(--color-accent-fg)",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-lg)",
            cursor: "pointer",
        }}
    >
        +
    </button>
</header>
```

---

### Touch Targets

Every interactive element must meet the **44×44px minimum** touch target size.
This is non-negotiable on mobile — small targets cause mis-taps and frustration.

```tsx
/* ✅ Correct — padding inflates the tap area without changing visual size */
<button style={{
  minWidth: 44,
  minHeight: 44,
  padding: 'var(--space-2) var(--space-3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}}>
  <span style={{ fontSize: 16 }}>✕</span>  {/* icon visually small, tap area large */}
</button>

/* ❌ Wrong — 24px icon with no padding = untappable */
<button style={{ width: 24, height: 24 }}>✕</button>
```

Transaction rows must have `minHeight: 52px` to be comfortably tappable.
Tab bar items must have `minWidth: 44px` and `minHeight: 44px`.
Form inputs must have `minHeight: 44px`.

---

### Touch States

Hover states are invisible on touch devices. Every interactive element needs an
`:active` state in addition to `:hover`.

```css
/* Transaction row */
.tx-row:hover {
    background: var(--color-bg-hover);
}
.tx-row:active {
    background: var(--color-bg-active);
    opacity: 0.7;
}

/* Button */
.btn-primary:active {
    transform: scale(0.97);
    opacity: 0.85;
}

/* Tab bar item */
.tab-item:active {
    opacity: 0.6;
}
```

Never use hover-only interactions to reveal critical information or actions.
Swipe-to-delete on transaction rows is acceptable as an enhancement, but a visible
delete action must also exist (e.g. tap row → show action menu).

---

### Typography on Mobile

Headings must scale down on small screens. Never use the full desktop size on mobile.

```css
/* Page title */
.page-title {
    font-size: var(--text-xl); /* 24px on mobile */
}
@media (min-width: 768px) {
    .page-title {
        font-size: var(--text-2xl); /* 28px on desktop */
    }
}

/* Stat value */
.stat-value {
    font-size: var(--text-lg); /* 18px on mobile — 24px would crowd 3 cards */
}
@media (min-width: 768px) {
    .stat-value {
        font-size: var(--text-xl); /* 24px on desktop */
    }
}
```

Minimum body font size is always `var(--text-base)` (15px). Never go below this —
iOS Safari zooms in on inputs with `font-size < 16px` and does not zoom back out.

Long transaction names must truncate cleanly, not overflow:

```tsx
/* Transaction name — truncate with ellipsis on overflow */
<p
    style={{
        fontSize: "var(--text-base)",
        color: "var(--color-text-primary)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        minWidth: 0 /* required — flex children don't shrink below content size by default */,
    }}
>
    Blue Bottle Coffee on Market Street
</p>
```

The transaction row's middle column must have `flex: 1; minWidth: 0` so it can
shrink and allow the amount column to stay visible.

---

### Stat Card Grid

```css
.stat-grid {
    display: grid;
    gap: var(--space-3);
    grid-template-columns: 1fr; /* mobile: single column */
}

@media (min-width: 480px) {
    .stat-grid {
        grid-template-columns: repeat(2, 1fr); /* large phones: 2 columns */
    }
}

@media (min-width: 768px) {
    .stat-grid {
        grid-template-columns: repeat(3, 1fr); /* tablet+: 3 columns */
    }
}
```

Use `grid-template-columns: minmax(0, 1fr)` if card content causes overflow.

---

### Forms on Mobile

```tsx
/* Full-width inputs and submit button on mobile */
<div
    style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
>
    <div
        style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-1)",
        }}
    >
        <label
            style={{
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-medium)",
                color: "var(--color-text-secondary)",
            }}
        >
            Amount
        </label>
        <input
            type="number"
            inputMode="decimal" /* shows numeric keyboard with decimal on mobile */
            autoComplete="off"
            style={{
                width: "100%",
                minHeight: 44 /* touch target */,
                fontSize: "var(--text-base)" /* ≥ 16px — prevents iOS zoom */,
                padding: "var(--space-2) var(--space-3)",
                background: "var(--color-bg-subtle)",
                border: "0.5px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-primary)",
            }}
        />
    </div>

    {/* Submit button — full width on mobile */}
    <button
        style={{
            width: "100%",
            minHeight: 44,
            background: "var(--color-accent)",
            color: "var(--color-accent-fg)",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-base)",
            fontWeight: "var(--weight-medium)",
            cursor: "pointer",
        }}
    >
        Save transaction
    </button>
</div>
```

Input `type` and `inputMode` rules for this app:

| Field            | `type`   | `inputMode` |
| ---------------- | -------- | ----------- |
| Amount           | `number` | `decimal`   |
| Description      | `text`   | `text`      |
| Date             | `date`   | —           |
| Category search  | `search` | `text`      |
| Email (settings) | `email`  | `email`     |

Never use multi-column form layouts on mobile. Stack all fields vertically.

---

### Modals & Bottom Sheets

On mobile, modals become **bottom sheets** — they slide up from the bottom of the
screen and take up most of the viewport. Centered dialog modals are desktop-only.

```tsx
/* Bottom sheet wrapper — mobile */
<div
    style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end" /* anchored to bottom */,
        background: "rgba(0, 0, 0, 0.4)",
    }}
>
    <div
        style={{
            background: "var(--color-bg-elevated)",
            borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
            padding: "var(--space-5)",
            paddingBottom: "calc(var(--space-5) + env(safe-area-inset-bottom))",
            maxHeight: "90vh",
            overflowY: "auto",
        }}
    >
        {/* Drag handle */}
        <div
            style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                background: "var(--color-border-strong)",
                margin: "0 auto var(--space-5)",
            }}
        />

        {/* Sheet content */}
        {children}

        {/* Full-width close / cancel */}
        <button
            style={{
                width: "100%",
                minHeight: 44,
                marginTop: "var(--space-4)",
                background: "transparent",
                border: "0.5px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-base)",
                color: "var(--color-text-secondary)",
                cursor: "pointer",
            }}
        >
            Cancel
        </button>
    </div>
</div>
```

When a bottom sheet is open: prevent background scroll with `overflow: hidden` on `<body>`.
Focus must be trapped inside the sheet while it is open.

Desktop equivalent: a centered modal with `max-width: 480px` and a visible close button.

```css
/* Responsive modal — bottom sheet on mobile, dialog on desktop */
.modal-container {
    /* mobile: bottom sheet (see above) */
}
@media (min-width: 768px) {
    .modal-container {
        align-items: center; /* center vertically */
        justify-content: center; /* center horizontally */
    }
    .modal-content {
        border-radius: var(--radius-xl);
        max-width: 480px;
        width: 100%;
        padding-bottom: var(--space-5); /* no safe area needed on desktop */
    }
}
```

---

### Safe Area Insets

Required on iPhones with a notch or Dynamic Island and on Android devices with a
gesture navigation bar. Always wrap fixed bottom elements with safe area padding.

```css
/* Bottom tab bar */
.tab-bar {
    padding-bottom: env(safe-area-inset-bottom);
    /* This adds ~34px on iPhone 14, 0 on devices with no home indicator */
}

/* Any content that follows the tab bar */
.main-content {
    padding-bottom: calc(56px + env(safe-area-inset-bottom));
}

/* Bottom sheet */
.sheet-content {
    padding-bottom: calc(var(--space-5) + env(safe-area-inset-bottom));
}
```

---

### Overflow & Scroll Rules

- **No horizontal scrollbars on the page.** Every page must fit within the viewport
  width at any breakpoint. Use `overflow-x: hidden` on the root layout as a safety
  net, but always find and fix the underlying cause — never rely on clipping alone.
- **Transaction lists scroll vertically** inside the main content area — never inside
  a fixed-height inner container that competes with the page scroll.
- **No nested scroll containers** unless absolutely necessary (e.g. a bottom sheet
  with long content). When used, the inner scroll container must have explicit height.

---

## What to Avoid

| ❌ Never do this                           | ✅ Do this instead                          |
| ------------------------------------------ | ------------------------------------------- |
| Gradient backgrounds or fills              | Flat solid tokens only                      |
| Drop shadows (`box-shadow` with blur)      | Use `0.5px` borders for elevation           |
| Vivid accent colors (purple, blue, teal)   | Near-black accent (`--color-accent`)        |
| Red for all expense amounts                | Red only for "over budget" status labels    |
| ALL CAPS headings for page titles          | Sentence case everywhere                    |
| Colored icon backgrounds per category      | Uniform `--color-bg-hover` icon bg          |
| `font-weight: 700` or `800`                | Max weight is `600` (`--weight-semibold`)   |
| `border-radius > 14px`                     | Max is `--radius-xl: 14px`                  |
| Multiple font families                     | One font: Inter / system-ui                 |
| Arbitrary pixel values for spacing         | Always use `--space-*` tokens               |
| `border: 1px` or thicker                   | Always `border: 0.5px`                      |
| Placeholder text as the only label         | Visible `<label>` above every input         |
| Decorative dividers or ornaments           | Plain `0.5px` horizontal lines only         |
| Horizontal sidebar on mobile               | Bottom tab bar with labels                  |
| Centered dialog modal on mobile            | Bottom sheet sliding up from bottom         |
| Touch targets smaller than 44×44px         | `minWidth: 44` + `minHeight: 44`            |
| Hover-only reveal of actions or info       | Always pair with a tap/active state         |
| Desktop-first CSS that fights mobile       | Mobile-first base styles, `@media` up       |
| Fixed-width block elements                 | `width: 100%` + `max-width` where needed    |
| `flex` child without `minWidth: 0` on text | Always add `minWidth: 0` to truncate safely |
| `font-size < 16px` on any input            | `font-size: var(--text-base)` minimum       |
| Missing `inputMode` on number fields       | `inputMode="decimal"` for amount inputs     |
| Bottom-docked elements ignoring home bar   | Always add `env(safe-area-inset-bottom)`    |
| Page-level horizontal scroll               | Find and fix the overflow source            |
| Multi-column form layout on mobile         | Single column, stacked fields only          |

---

## Design Checklist (per UI step)

Before marking any UI step complete, verify:

**Visual design:**

- [ ] All colors reference `--color-*` tokens — no hardcoded hex values
- [ ] Dark mode tested — all text readable, no invisible elements
- [ ] No gradients, shadows with blur, or glow effects used
- [ ] Positive states use `--color-positive`, over-budget states use `--color-negative`
- [ ] Expense amounts in transaction lists are neutral (`--color-text-primary`), not red
- [ ] All borders are `0.5px solid var(--color-border)`
- [ ] All text is sentence case
- [ ] Font weight does not exceed `600` (`--weight-semibold`)
- [ ] All spacing uses `--space-*` tokens (multiples of 4px)
- [ ] Interactive elements have hover, focus, and active states defined

**Mobile layout (test at 360px and 390px):**

- [ ] No horizontal overflow or scrollbar at any mobile width
- [ ] Sidebar is hidden — bottom tab bar is visible and functional
- [ ] Bottom tab bar has `env(safe-area-inset-bottom)` padding
- [ ] Main content has `padding-bottom` to clear the tab bar
- [ ] Top bar visible on mobile with page title and primary action
- [ ] Stat cards stack to 1-column on mobile
- [ ] Page horizontal padding is `var(--space-4)` (16px) on mobile

**Touch & interaction:**

- [ ] All interactive elements are at least 44×44px
- [ ] Transaction rows are at least 52px tall
- [ ] All interactive elements have an `:active` touch state
- [ ] No hover-only interactions used for critical functionality

**Typography & text:**

- [ ] Page title scales down on mobile (`--text-xl` mobile, `--text-2xl` desktop)
- [ ] Stat values scale down on mobile (`--text-lg` mobile, `--text-xl` desktop)
- [ ] Transaction names truncate with ellipsis — no horizontal overflow
- [ ] Flex children containing text have `minWidth: 0`

**Forms:**

- [ ] All inputs have a visible `<label>` element above them
- [ ] All inputs have `minHeight: 44px`
- [ ] All inputs have `font-size: var(--text-base)` (≥ 16px) — prevents iOS zoom
- [ ] Amount input has `type="number"` and `inputMode="decimal"`
- [ ] Submit button is full-width on mobile
- [ ] Form fields are single-column on mobile

**Modals:**

- [ ] Modals render as bottom sheets on mobile (slide up from bottom)
- [ ] Bottom sheet has drag handle and full-width cancel button
- [ ] Bottom sheet content has `env(safe-area-inset-bottom)` padding
- [ ] Background scroll is prevented when sheet is open
- [ ] Focus is trapped inside the sheet while open
