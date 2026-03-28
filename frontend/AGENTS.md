# CLAUDE.md — Frontend AI Agent Rules & Constraints

> This file defines the rules, conventions, and guardrails for the AI agent working on this project.
> Read this file **completely** before writing any code, creating any file, or making any change.

---

## 🧠 Agent Behavior

### Before Writing Code

1. **Plan first.** For any non-trivial task, output a brief plan (component tree, data flow, API contract) and wait for approval before implementing.
2. **Ask when uncertain.** If the requirement is ambiguous, ask one focused clarifying question. Do not guess and proceed.
3. **List affected files first.** Before any refactor or multi-file change, list all files you intend to touch and explain why.

### During Implementation

- Implement **one component or feature at a time.**
- After each unit, summarize what was done and what comes next.
- Never silently skip edge cases — flag them as `// TODO:` with a short explanation.

### Hard Stops (Do NOT proceed — ask first)

- Changing the folder structure or routing architecture
- Modifying global state management setup (context, zustand store shape, etc.)
- Changing how authentication tokens are stored or transmitted
- Any change that touches more than 5 files at once
- Upgrading or changing major dependencies

---

## 🔢 Incremental Workflow

This is the most important behavioral rule. The agent must never implement an entire feature in one go. Every task must be broken into small, reviewable steps.

### Step Structure

For every task, follow this exact sequence:

```
1. PLAN   → Break task into numbered steps, present to user, wait for approval
2. STEP   → Implement exactly one step
3. REPORT → Write a completion report for that step
4. COMMIT → Provide the git commit message for that step
5. PAUSE  → Wait for explicit "continue" or approval before the next step
```

Never skip directly from STEP to the next STEP. The REPORT → COMMIT → PAUSE sequence is mandatory after every step.

### Planning Format

When breaking down a task, present the plan like this:

```
## Plan: [Feature Name]

Steps:
1. [Step title] — [one-line description of what will be done]
2. [Step title] — [one-line description]
3. [Step title] — [one-line description]
...

Total steps: N
Ready to start with Step 1?
```

Do not begin implementation until the user approves the plan.

### Step Completion Report Format

After completing each step, always output a report in this exact format:

```
## ✅ Step [N] Complete: [Step Title]

**What was done:**
- [bullet: specific action taken]
- [bullet: specific action taken]

**Files changed:**
- `path/to/file.tsx` — [what changed and why]
- `path/to/file.ts` — [what changed and why]

**What to verify:**
- [thing the developer should manually check]
- [thing the developer should manually check]

**Known limitations / TODOs:**
- [anything intentionally skipped or deferred]

---
Next step: [N+1] — [title]
Awaiting your go-ahead to continue.
```

### Commit Message Rules

After every step report, provide a ready-to-use git commit message following the **Conventional Commits** standard.

**Format:**

```
<type>(<scope>): <short summary in imperative mood>

<body: what was done and why, wrapped at 72 chars>

<footer: breaking changes or issue refs if applicable>
```

**Types:**
| Type | When to use |
|---|---|
| `feat` | New component, page, or user-facing feature |
| `fix` | Bug fix |
| `refactor` | Code restructure with no behavior change |
| `style` | CSS/styling changes only |
| `chore` | Config, tooling, dependency updates |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `perf` | Performance improvement |

**Scope** = the domain or component affected, e.g. `auth`, `user-profile`, `api-client`, `button`.

**Rules:**

- Summary line must be ≤ 72 characters
- Summary must use **imperative mood**: "add", "fix", "update" — not "added", "fixed", "updating"
- No period at the end of the summary line
- Body must explain _what_ and _why_, not _how_
- If a step introduces a breaking change, add `BREAKING CHANGE:` in the footer

**Examples:**

```
feat(auth): add login form with zod validation

Implements the login page UI with email/password fields.
Validation uses zod schema defined in lib/validations/auth.ts.
Form disables submit button during submission to prevent double-clicks.
```

```
refactor(api-client): centralize axios instance with interceptors

Moves all fetch calls to a single configured axios client.
Adds request interceptor for JWT injection and response
interceptor for global 401 handling.
```

```
fix(user-profile): handle empty state when avatar url is null

Avatar was crashing with undefined error when the backend
returned null for users who haven't set a profile photo.
```

### What "One Step" Means

A step should be **small enough to review in under 5 minutes**. Use these as size guidelines:

| Task type       | One step =                                                       |
| --------------- | ---------------------------------------------------------------- |
| New page        | One route file + layout only (no data fetching yet)              |
| New component   | One component file + its types                                   |
| API integration | One service function + its query hook                            |
| Form            | Schema definition OR form UI OR submission logic (not all three) |
| Refactor        | One file or one concern at a time                                |
| Types           | One domain's type definitions                                    |

If a step would touch more than **3 files**, split it further.

---

## 🏗️ Project Structure

```
src/
├── app/                        # Next.js App Router (pages & layouts)
│   ├── (auth)/                 # Route group: auth pages
│   ├── (dashboard)/            # Route group: protected pages
│   ├── api/                    # Next.js API routes (minimal — prefer backend)
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Root page
├── components/
│   ├── ui/                     # Base design system (Button, Input, Modal, etc.)
│   └── features/               # Feature-specific composite components
├── hooks/                      # Custom React hooks
├── lib/
│   ├── api/                    # API client & service functions
│   │   ├── client.ts           # Axios/fetch base instance
│   │   └── services/           # One file per domain (user.ts, order.ts)
│   ├── utils/                  # Pure utility functions
│   └── validations/            # Zod schemas for forms & API responses
├── store/                      # Global state (Zustand or React Context)
├── types/                      # Global TypeScript type definitions
├── constants/                  # App-wide constants
└── styles/                     # Global CSS / Tailwind config
```

---

## ⚙️ TypeScript Rules

### Strictness

- The project runs with `strict: true` in `tsconfig.json`. Never disable it.
- **No `any`.** If the type is truly unknown, use `unknown` and narrow it.
- **No `@ts-ignore` or `@ts-expect-error`** without a comment explaining why it's unavoidable.
- All function parameters and return types must be explicitly typed.

### Type Definitions

- Use `interface` for object shapes that may be extended; use `type` for unions, intersections, and aliases.
- All API response shapes must be defined in `src/types/` and shared across the codebase.
- Never use inline type literals for anything used more than once.

```typescript
// ✅ Correct
interface User {
  id: string;
  email: string;
  role: "admin" | "member";
}

// ❌ Wrong — scattered inline types
const fetchUser = async (): Promise<{ id: string; email: string }> => { ... }
```

### Enums

- Prefer `as const` objects over TypeScript `enum` for better tree-shaking.

```typescript
// ✅ Preferred
export const Role = {
    ADMIN: "admin",
    MEMBER: "member",
} as const;
export type Role = (typeof Role)[keyof typeof Role];
```

---

## ⚛️ React & Next.js Rules

### Component Design

- **One component per file.** Filename = component name in `PascalCase.tsx`.
- Keep components **small and focused.** If a component exceeds ~150 lines, split it.
- Separate **presentational** (UI only, no data fetching) from **container** (data-aware) components.
- All components must be typed with explicit `props` interfaces.

```typescript
// ✅ Correct
interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
  onClick?: () => void;
}

export const Button = ({ label, variant = "primary", isLoading, onClick }: ButtonProps) => { ... }
```

### Hooks

- Never call hooks conditionally or inside loops.
- Extract reusable stateful logic into custom hooks in `src/hooks/`.
- Custom hook names must start with `use`.
- A hook should do one thing. If it grows beyond ~80 lines, split it.

### Next.js App Router

- Use **Server Components** by default. Only add `"use client"` when the component needs interactivity, browser APIs, or React state/effects.
- Data fetching belongs in Server Components or `route.ts` API handlers — not in client component `useEffect`.
- Use `loading.tsx` and `error.tsx` for every route segment that fetches data.
- Use `next/image` for all images — never raw `<img>` tags.
- Use `next/link` for all internal navigation — never `<a href>`.

### State Management

- **Local state first (`useState`, `useReducer`).** Only escalate to global state when truly needed across unrelated components.
- Global state lives in `src/store/`. Keep store slices small and domain-scoped.
- Never store derived data in state — compute it from existing state or use `useMemo`.
- Never store server data in global client state — use a data-fetching library (React Query / SWR) as the source of truth for server state.

---

## 📱 Responsive Design & Mobile Rules

This section is mandatory for every component and page. Mobile quality is not optional — it is a core deliverable equal in importance to desktop.

### The Mobile-First Mandate

**Always build mobile layout first, then layer on tablet and desktop styles.** This is not a suggestion — it is the default implementation order.

- Start with zero-breakpoint styles (the base CSS that applies to all screens).
- Layer `sm:`, `md:`, `lg:`, `xl:` modifiers on top to progressively enhance.
- Never write desktop-only styles and attempt to "undo" them for mobile.

```tsx
// ✅ Correct — mobile first
<div className="flex flex-col gap-4 p-4 md:flex-row md:gap-8 md:p-8">

// ❌ Wrong — desktop first, then overriding
<div className="flex flex-row gap-8 p-8 sm:flex-col sm:gap-4 sm:p-4">
```

### Breakpoint System

Use Tailwind's standard breakpoints consistently. Never invent custom breakpoints unless there is a documented, specific need.

| Breakpoint | Min-width | Typical target                  |
| ---------- | --------- | ------------------------------- |
| _(none)_   | 0px       | Mobile portrait (360–390px)     |
| `sm`       | 640px     | Mobile landscape / large phones |
| `md`       | 768px     | Tablets                         |
| `lg`       | 1024px    | Small laptops                   |
| `xl`       | 1280px    | Desktops                        |
| `2xl`      | 1536px    | Large monitors                  |

**Design and test at 390px (iPhone 14) and 360px (common Android) as the primary mobile targets.**

### Layout Rules for Mobile

- **Single-column layouts are the default.** Multi-column grids must only appear at `md:` and above unless content genuinely benefits from side-by-side display at small sizes (e.g., a 2-column icon grid).
- **No horizontal scrollbars.** Every page must fit within the viewport width at any breakpoint. Use `overflow-x-hidden` on the root layout as a safety net, and fix the underlying cause — never rely on it alone.
- **Avoid fixed widths on block elements.** Prefer `w-full`, `max-w-*`, and `min-w-0` (to fix flexbox overflow bugs).
- **Flexbox children must have `min-w-0`** if they contain text that could overflow.

```tsx
// ✅ Prevents text overflow in flex children
<div className="flex gap-2">
    <Icon className="shrink-0" />
    <span className="min-w-0 truncate">{longText}</span>
</div>
```

### Touch & Interaction

- **Minimum tap target size: 44×44px** on all interactive elements (buttons, links, checkboxes, toggles). Use `min-h-[44px] min-w-[44px]` or padding to meet this requirement.
- **No hover-only interactions.** Any functionality exposed on `hover` must also be accessible via tap/focus. Do not hide critical actions behind hover states.
- **Avoid `title` attribute tooltips** for important information — they are inaccessible on touch devices.
- **Swipe and scroll must feel native.** Use `-webkit-overflow-scrolling: touch` and `scroll-smooth` where appropriate. Do not block native scroll behavior with JavaScript unless absolutely necessary.
- **Avoid `pointer-events: none` patterns** that make elements tappable but non-interactive on touch screens.

### Typography on Mobile

- **Minimum body font size: 16px (`text-base`)** on mobile. Never use `text-sm` or smaller for body copy — it causes iOS to zoom in on form fields and is hard to read.
- **Heading scale must shrink on mobile.** A `text-5xl` desktop heading should step down to `text-3xl` or `text-2xl` on mobile.

```tsx
// ✅ Correct — responsive heading
<h1 className="text-2xl font-bold sm:text-3xl lg:text-5xl">

// ❌ Wrong — desktop size on all screens
<h1 className="text-5xl font-bold">
```

- **Line length still matters on mobile.** Use `max-w-prose` or `max-w-[65ch]` on body text containers — even on small screens, very wide text (caused by padding issues) is hard to read.
- **Word breaks.** Add `break-words` or `overflow-wrap: break-word` to any container that renders user-generated or dynamic text to prevent layout breakage.

### Navigation Patterns

- **Desktop nav ≠ mobile nav.** A horizontal navbar with text links is almost always wrong on mobile. Use one of these patterns instead:
    - **Hamburger menu** with a full-screen or slide-in drawer (for apps with many nav items)
    - **Bottom tab bar** (for mobile-first apps with 3–5 primary destinations)
    - **Simplified top bar** with icon-only or condensed links (for simple sites)
- **Never show a horizontal scrolling nav bar** as the primary navigation on mobile unless it is clearly a secondary tab/filter bar (e.g., category pills).
- **Active state must be obvious** on mobile nav — users cannot rely on hover to discover where they are.
- Mobile menu open/close must be fully keyboard accessible and trap focus when open.

```tsx
// Pattern: responsive nav
<nav>
    {/* Desktop: shown at md and above */}
    <ul className="hidden md:flex gap-6">...</ul>

    {/* Mobile: hamburger trigger */}
    <button className="md:hidden" aria-label="Open menu">
        <MenuIcon />
    </button>
</nav>;

{
    /* Mobile drawer */
}
{
    isMenuOpen && (
        <div
            className="fixed inset-0 z-50 bg-white md:hidden"
            role="dialog"
            aria-modal="true"
        >
            ...
        </div>
    );
}
```

### Images & Media

- **All images must use `next/image`** with explicit `width`/`height` or `fill` + a sized container — never let images cause layout shift.
- **Use `sizes` prop** on `next/image` to tell the browser the rendered size at each breakpoint, enabling correct srcset selection.

```tsx
// ✅ Correct — responsive image with sizes hint
<Image
    src="/hero.jpg"
    alt="Hero image"
    fill
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    className="object-cover"
/>
```

- **Avoid auto-playing video** on mobile — it consumes data. Use `preload="none"` and a poster image. Always include `playsinline` for iOS.
- **SVG icons must have explicit size classes** (`w-5 h-5`) — never rely on intrinsic SVG dimensions, which vary by file.

### Forms on Mobile

- **Input font size must be at least 16px** (`text-base`). iOS Safari zooms in on inputs with `font-size < 16px` and does not zoom back — this is a critical UX bug.
- **Input type matters on mobile.** Use the correct `type` attribute to trigger the right keyboard:
    - `type="email"` → email keyboard with `@` key
    - `type="tel"` → numeric keypad
    - `type="number"` → numeric keyboard (add `inputMode="numeric"` for better mobile support)
    - `type="search"` → search keyboard with return key labeled "Search"
    - `type="url"` → URL keyboard
- **Use `inputMode`** for fine-grained keyboard control (e.g., `inputMode="decimal"` for price inputs).
- **`autocomplete` attributes** must be set on all standard fields (name, email, password, address) to enable autofill.
- **Labels must always be visible** — never hidden or `placeholder`-only. On small screens, stacked labels (above the input) are preferred over inline/side labels.
- **Error messages must appear near the field**, not only at the top of the form. On mobile, users often cannot see the top of a long form.
- **Submit buttons must be full-width (`w-full`) on mobile** unless there is a strong reason for a narrower button.
- **Avoid multi-column form layouts on mobile.** Stack all fields vertically at the base breakpoint.

```tsx
// ✅ Correct mobile form field
<div className="flex flex-col gap-1">
  <label htmlFor="email" className="text-sm font-medium">Email</label>
  <input
    id="email"
    type="email"
    autoComplete="email"
    className="w-full rounded-md border px-3 py-2 text-base" {/* text-base = 16px, prevents iOS zoom */}
  />
  {error && <p className="text-sm text-red-600">{error}</p>}
</div>
```

### Spacing & Density on Mobile

- **Increase padding on mobile, not decrease it.** Touch targets need more breathing room than mouse-driven UIs, not less.
- **Use consistent padding on page edges.** The safe minimum is `px-4` (16px) on mobile. Never allow content to touch the screen edge.
- **Safe area insets for notched devices.** Use `pb-safe` / `env(safe-area-inset-*)` for bottom-docked elements (FABs, bottom bars) to avoid the home indicator.

```tsx
// ✅ Correct — respects notch/home indicator
<div className="fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)] bg-white border-t">
    <nav className="flex justify-around py-2">...</nav>
</div>
```

- **Card and list item padding:** minimum `p-4` on mobile; `p-6` on desktop.
- **Section vertical spacing:** minimum `py-8` on mobile; `py-16` or more on desktop.

### Tables on Mobile

Tables are notoriously problematic on small screens. Never let a data table cause horizontal scrolling on the page level.

Choose one of these strategies based on the data:

1. **Horizontal scroll container** — wrap the table in `overflow-x-auto` so only the table scrolls, not the page.

```tsx
<div className="overflow-x-auto rounded-md border">
    <table className="min-w-full">...</table>
</div>
```

2. **Card-based reflow** — at mobile breakpoints, transform table rows into stacked cards using CSS or conditional rendering.

```tsx
{
    /* Desktop table */
}
<table className="hidden md:table">...</table>;

{
    /* Mobile cards */
}
<ul className="flex flex-col gap-3 md:hidden">
    {rows.map((row) => (
        <MobileRowCard key={row.id} data={row} />
    ))}
</ul>;
```

3. **Column prioritization** — hide less critical columns on mobile with `hidden md:table-cell`.

Always choose the strategy that best preserves data readability. Document which strategy was chosen and why in a `// TODO:` comment if it is non-obvious.

### Modals & Overlays on Mobile

- **Full-screen on mobile.** Modals should use `fixed inset-0` on mobile and transition to a centered dialog at `md:` and above.
- **Scrollable content inside modals.** If modal content may exceed viewport height, use `overflow-y-auto` on the content area — never let the modal itself overflow the screen.
- **Close affordance must be obvious.** Include a clearly labeled close button (not just an `×` icon — add `aria-label="Close"`). On mobile, a full-width "Cancel" button at the bottom is often more ergonomic than a top-right `×`.
- **Prevent background scroll** when a modal is open (`overflow: hidden` on `<body>`).

```tsx
// ✅ Responsive modal
<div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
    <div
        className="
    w-full rounded-t-2xl bg-white p-6
    md:w-auto md:min-w-[480px] md:rounded-2xl
    max-h-[90vh] overflow-y-auto
  "
    >
        {children}
        <button className="mt-4 w-full md:w-auto" onClick={onClose}>
            Cancel
        </button>
    </div>
</div>
```

### Mobile-Specific Testing Checklist

Every component and page must be verified at these checkpoints before marking a step complete:

**Viewports to test:**

- [ ] 360px wide (small Android)
- [ ] 390px wide (iPhone 14 / common iOS)
- [ ] 768px wide (tablet portrait)
- [ ] 1280px wide (desktop)

**Layout checks:**

- [ ] No horizontal overflow / scrollbar at any mobile width
- [ ] No text clipped or truncated unintentionally
- [ ] No elements overlapping each other
- [ ] Page padding present on all edges (minimum 16px left/right)
- [ ] Images scale correctly and do not overflow containers

**Interaction checks:**

- [ ] All tap targets are at least 44×44px
- [ ] No hover-only interactions
- [ ] Form inputs do not trigger iOS zoom (font-size ≥ 16px)
- [ ] Correct keyboard types appear for each input
- [ ] Mobile navigation is present and functional

**Content checks:**

- [ ] Long text wraps cleanly (no overflow, no awkward breaks)
- [ ] Tables or data-heavy content handle mobile gracefully
- [ ] Headings scale down appropriately on small screens
- [ ] Modals/drawers are full-screen or near-full-screen on mobile

Add this to the Step Completion Report under **"What to verify"** for any UI step.

---

## 🎨 UI/UX Rules

### Design Principles

- **Consistency first.** All spacing, colors, typography, and border-radii must come from the design system tokens — never use arbitrary pixel values.
- **Accessibility is non-negotiable.** Every interactive element must be keyboard-navigable and have appropriate ARIA attributes.
- **Mobile-first.** Design and implement for small screens first, then scale up with responsive breakpoints. See the **Responsive Design & Mobile Rules** section for full requirements.
- **Feedback for every action.** Loading states, success states, and error states must be handled for all async operations — never leave the user with a frozen UI.

### Typography

- Use a consistent type scale — define it in the design system, never hardcode `font-size` values outside of it.
- Line length for body text: keep between **60–80 characters** (`max-w-prose`).
- Heading hierarchy must match semantic HTML (`h1` → `h2` → `h3`). Never skip levels for styling purposes.
- **On mobile, all body text must be at least `text-base` (16px).** See Mobile Rules for full typography guidance.

### Color & Contrast

- All text must meet **WCAG AA contrast ratio** (4.5:1 for normal text, 3:1 for large text).
- Never convey information using color alone — always pair with an icon, label, or pattern.
- Interactive elements must have visible `:focus-visible` styles.

### Spacing & Layout

- Use the 4px base grid system. All spacing values must be multiples of 4.
- Clickable targets must be at least **44×44px** on touch devices.
- Avoid layout shift — reserve space for dynamic content (images, async data) to prevent CLS.

### Component States

Every interactive component must explicitly handle:

- `default` — normal state
- `hover` — visual feedback on mouse-over
- `focus` — keyboard navigation indicator
- `active` — pressed/clicked state
- `disabled` — non-interactive state with reduced opacity
- `loading` — async operation in progress
- `error` — failed state with clear messaging
- `empty` — no data state with helpful guidance

### Forms

- Every input must have a visible `<label>` — never rely on `placeholder` as a label.
- Show inline validation errors immediately after a field is blurred (`onBlur`), not only on submit.
- Disable the submit button during submission to prevent double-clicks.
- Use `zod` for all form validation schemas — keep them in `src/lib/validations/`.
- **On mobile, submit buttons must be full-width.** See Mobile Rules for full form guidance.

---

## 🔌 Backend Integration Rules

### API Client Setup

- All HTTP calls go through a single configured client in `src/lib/api/client.ts`.
- Never call `fetch()` or `axios` directly in components or hooks — always go through the service layer.
- The base URL and all API keys must come from environment variables (`.env.local`).

```typescript
// src/lib/api/client.ts
import axios from "axios";

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 10_000,
});

// Attach JWT from storage on every request
apiClient.interceptors.request.use((config) => {
    const token = getAccessToken(); // from cookie or memory
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 globally — trigger token refresh or logout
apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        if (error.response?.status === 401) {
            // handle refresh / redirect to login
        }
        return Promise.reject(error);
    },
);
```

### Service Layer

- One service file per backend domain: `src/lib/api/services/user.ts`, `order.ts`, etc.
- Service functions are plain async functions — they call the API client and return typed data.
- Never put error handling UI logic (toasts, alerts) inside services — throw errors and let the caller handle UI.

```typescript
// src/lib/api/services/user.ts
import { apiClient } from "../client";
import type { User, UserUpdatePayload } from "@/types/user";

export const getMe = async (): Promise<User> => {
    const { data } = await apiClient.get<User>("/users/me");
    return data;
};

export const updateUser = async (
    id: string,
    payload: UserUpdatePayload,
): Promise<User> => {
    const { data } = await apiClient.patch<User>(`/users/${id}`, payload);
    return data;
};
```

### Data Fetching

- Use **React Query** (`@tanstack/react-query`) for all client-side data fetching — never raw `useEffect` + `useState` for server data.
- Query keys must be defined as constants to avoid typos and enable proper cache invalidation.
- Always handle `isLoading`, `isError`, and empty states in the UI.

```typescript
// ✅ Correct
export const USER_KEYS = {
    me: ["user", "me"] as const,
    byId: (id: string) => ["user", id] as const,
};

const { data: user, isLoading } = useQuery({
    queryKey: USER_KEYS.me,
    queryFn: getMe,
});
```

### Authentication

- Store JWT access tokens in **memory** (not `localStorage`) when possible. Use `httpOnly` cookies for refresh tokens.
- Never store sensitive user data (roles, permissions) exclusively on the client — always re-validate with the backend.
- Protect routes using middleware (`middleware.ts`) for server-side auth checks, not just client-side redirects.

### Environment Variables

- All public env vars must be prefixed with `NEXT_PUBLIC_`.
- Never expose secret API keys to the client — call your own Next.js API route instead, which calls the third-party service server-side.
- Maintain a `.env.example` file with all required keys (no values) committed to the repo.

### Error Handling

- All API errors must be caught and surfaced with a user-friendly message — never show raw error objects or stack traces.
- Use a global error boundary for unexpected client-side crashes.
- Network errors (timeout, offline) must be handled gracefully with retry guidance.

---

## 🧹 Clean Code Standards

### General

- **Clarity over cleverness.** Code is read far more than it is written.
- Functions must do **one thing.** If you need "and" to describe what a function does, split it.
- Max function length: **~40 lines.** Max file length: **~300 lines.**
- No magic numbers or magic strings — extract them as named constants.

### Naming

| Entity               | Convention                    | Example                       |
| -------------------- | ----------------------------- | ----------------------------- |
| Components           | `PascalCase`                  | `UserProfileCard`             |
| Hooks                | `camelCase` with `use` prefix | `useAuthUser`                 |
| Utilities & services | `camelCase`                   | `formatCurrency`              |
| Types & interfaces   | `PascalCase`                  | `ApiResponse<T>`              |
| Constants            | `UPPER_SNAKE_CASE`            | `MAX_FILE_SIZE`               |
| Event handlers       | `handle` prefix               | `handleSubmit`, `handleClose` |
| Boolean variables    | `is/has/can` prefix           | `isLoading`, `hasPermission`  |
| CSS classes          | Tailwind utility classes      | follow design system only     |

### Comments

- Write comments to explain **why**, not **what**. The code explains what.
- Remove all `console.log` before committing. Use a proper logger for intentional output.
- TODO comments must include context: `// TODO: replace with backend pagination once API v2 is live`

### Imports

- Organize imports in order: 1) React/Next.js, 2) third-party, 3) internal (`@/`), 4) relative.
- Use absolute imports via `@/` alias — never `../../../` deep relative paths.
- No unused imports.

---

## 🚫 Never Do These

| Rule                                       | Reason                                |
| ------------------------------------------ | ------------------------------------- |
| `any` type                                 | Defeats TypeScript entirely           |
| Raw `fetch/axios` in components            | Bypasses the service layer            |
| Storing secrets in `NEXT_PUBLIC_` env vars | Exposed to the browser                |
| `localStorage` for JWT access tokens       | XSS vulnerability                     |
| `<img>` instead of `next/image`            | Misses optimization & LCP             |
| `<a href>` for internal links              | Bypasses Next.js routing              |
| `useEffect` for data fetching              | Use React Query instead               |
| Hardcoded colors or spacing                | Breaks design system consistency      |
| Placeholder text as field label            | Accessibility failure                 |
| Ignoring loading/error/empty states        | Broken UX                             |
| `console.log` in committed code            | Noise in production                   |
| `@ts-ignore` without explanation           | Hides real type errors                |
| Business logic in JSX                      | Unreadable and untestable             |
| Desktop-first CSS                          | Forces painful overrides for mobile   |
| Fixed widths on block elements             | Causes overflow on small screens      |
| `font-size < 16px` on form inputs          | Triggers iOS Safari zoom bug          |
| Hover-only interactions                    | Inaccessible on touch devices         |
| Tap targets smaller than 44×44px           | Unreliable on touch screens           |
| Horizontal overflow at any breakpoint      | Broken mobile layout                  |
| Using `title` tooltips for key info        | Invisible on touch devices            |
| Multi-column form layout on mobile         | Cramped and error-prone               |
| Page-level horizontal scroll from tables   | Use `overflow-x-auto` wrapper         |
| Small-screen modal as centered dialog      | Should be full-screen or bottom sheet |
| Horizontal navbar on mobile                | Use drawer or bottom tab bar          |

---

## ✅ Pre-Commit Checklist

Before marking any task as complete, verify:

**Code quality:**

- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] No `any` types introduced
- [ ] No `console.log` statements left in
- [ ] All interactive components handle: loading, error, and empty states
- [ ] All new forms have validation with `zod`
- [ ] All images use `next/image`, all links use `next/link`
- [ ] No secrets in client-side environment variables
- [ ] All API calls go through the service layer

**Accessibility:**

- [ ] Interactive elements are keyboard accessible
- [ ] Color contrast meets WCAG AA
- [ ] All inputs have visible labels
- [ ] ARIA attributes present where needed

**Responsive / Mobile (mandatory for every UI change):**

- [ ] Built mobile-first (base styles for mobile, breakpoints for larger screens)
- [ ] No horizontal overflow at 360px, 390px, 768px, or 1280px
- [ ] All tap targets are at least 44×44px
- [ ] Form input font-size is at least 16px (prevents iOS zoom)
- [ ] Correct `type` and `inputMode` attributes on all form inputs
- [ ] No hover-only interactions
- [ ] Mobile navigation pattern implemented (drawer/bottom bar, not horizontal links)
- [ ] Tables wrapped in `overflow-x-auto` or reflowed as cards on mobile
- [ ] Modals are full-screen or bottom-sheet on mobile
- [ ] Headings scale down appropriately on small screens (`text-2xl sm:text-3xl lg:text-5xl`)
- [ ] Images have correct `sizes` prop for responsive srcset
- [ ] Safe area insets applied to any bottom-docked elements
- [ ] Component tested at 360px, 390px, 768px, and 1280px widths
