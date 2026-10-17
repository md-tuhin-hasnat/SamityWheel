# AGENT.md — SamityWheel Project Execution & Architecture Standards

> **Project**: SamityWheel (SamityDraw)  
> **Type**: Mobile-First Next.js Progressive Web App (PWA)  
> **Domain**: Monthly Samity (ROSCA / Kisti / Somobay) Deposit Tracker & Non-Repeating Lottery Wheel Draw  
> **Target Framework**: Next.js (App Router), React 19, TypeScript, Tailwind CSS, Serwist / PWA Workbox  

---

## 1. Brand Identity & Design System

### 1.1 Brand Purpose & Positioning
SamityWheel elevates traditional community savings groups (Samity / Kisti / Somobay / ROSCA) into a transparent, secure, and celebratory digital experience. Members contribute a fixed monthly deposit via popular payment rails (bKash, Nagad, Bank Transfer, Cash), submit proof of payment, and participate in a verified, fair, non-repeating monthly lottery wheel draw.

### 1.2 Core Design Tokens

| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| **Primary Indigo** | `#4f46e5` / `#6366f1` | Brand anchor, main actions, active navigation |
| **Deep Midnight Slate** | `#0f172a` | App shell backdrop, dark mode cards, high-contrast badges |
| **Emerald Growth** | `#059669` / `#10b981` | Verified status, savings indicators, success states |
| **Amber Fortune** | `#f59e0b` / `#d97706` | Jackpot pot, lucky winner highlight, pending badges |
| **bKash Magenta** | `#db2777` / `#e11d48` | bKash receipt headers, payment method accents |
| **Nagad Orange** | `#ea580c` / `#f97316` | Nagad receipt headers, payment method accents |
| **Bank Sky** | `#1d4ed8` / `#2563eb` | Bank transfer indicators |
| **Canvas Light** | `#f8fafc` | Main card backgrounds, subtle surfaces |
| **Outer Wrapper Slate**| `#e2e8f0` | Outer viewport background for centered mobile shell |

### 1.3 Typography & Numbers
- **Primary Font**: `Inter` or `Plus Jakarta Sans` (`sans-serif`)
- **Financial Monospace**: `font-mono` (`ui-monospace`, `SFMono-Regular`, `Roboto Mono`) for Transaction IDs (TrxIDs), voucher codes, and precise currency amounts (`BDT 5,000`).
- **Headings**: Semibold (600) to Extrabold (800) for balance cards and winner headlines.

### 1.4 Haptics & Sensory Design
- **Web Audio Engine**: Built-in synthetic audio cues (zero external asset dependency):
  - *Wheel Spoke Tick*: Triangle wave ramp (`600Hz -> 220Hz`, 30ms) triggered on sector crossover during spin.
  - *Victory Fanfare*: Multi-oscillator harmonic chord (`C5, E5, G5, C6`) upon winner selection.
  - *Sound Toggle*: User-persisted mute switch in the header.

---

## 2. Mandatory Skill Usage Matrix

Every agent working on this repository **MUST** consult and apply the installed skills according to this exact trigger matrix:

```
┌───────────────────────────────────────┬─────────────────────────────────────────────────────────────────┐
│ Skill                                 │ When & Where to Trigger                                         │
├───────────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ vercel-react-best-practices           │ Every React/Next.js component, data fetching, memoization,      │
│                                       │ bundle optimization, avoiding waterfalls, zero barrel imports.  │
├───────────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ vercel-composition-patterns           │ Designing UI components, avoiding boolean prop proliferation,   │
│                                       │ building compound components (Wheel, Modal, PaymentForm).       │
├───────────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ frontend-design                       │ Streamlining UI copywriting, eliminating text clutter,          │
│                                       │ distinctive styling, and purposeful, minimal interface copy.    │
├───────────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ ui-ux-pro-max                         │ Touch targets (≥44px), mobile-first ergonomics, compact chips,  │
│                                       │ one-tap actions, high-contrast badges, scannability.            │
├───────────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ 60fps-animation                       │ Canvas wheel rotation, drawer transitions, GPU-only transforms  │
│                                       │ (translate/scale instead of width/height/top/left).             │
├───────────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ accessible-animation                  │ Implementing prefers-reduced-motion tiering: instant or gentle  │
│                                       │ fades for users with vestibular sensitivities.                   │
├───────────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ micro-interaction                     │ Framer Motion (motion/react) press states (scale: 0.96),       │
│                                       │ toast animations, tab switching, receipt sheet expansions.      │
├───────────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ svg-animation                         │ Generating dynamic vector payment receipts, animated checkmarks │
│                                       │ for admin verification, wheel pointer indicator.                │
└───────────────────────────────────────┴─────────────────────────────────────────────────────────────────┘
```

### Detailed Skill Implementation Guidelines

#### A. `vercel-react-best-practices`
1. **Direct non-barrel imports**: Always import icons and components directly (e.g., `import Check from 'lucide-react/dist/esm/icons/check'` or custom SVGs) rather than pulling from broad barrel indexes.
2. **Eliminate waterfalls**: Parallelize independent reads and state updates using `Promise.all` or optimistic local state.
3. **Re-render hygiene**:
   - Hoist static objects, arrays, and SVG templates outside component scope.
   - Use functional state updates (`setPayments(prev => ...)`) to avoid unstable callback references.
   - Split compound hooks so payment state, wheel physics state, and auth session don't cause mutual re-renders.

#### B. `vercel-composition-patterns`
1. **Compound components over boolean flags**:
   - Don't write `<ReceiptViewer isModal isDownloadable isPending isVerified />`.
   - Compose: `<Receipt.Root><Receipt.Header /><Receipt.Preview /><Receipt.Actions /></Receipt.Root>`.
2. **Explicit variants**: Use `<MemberBadge variant="winner" />` and `<MemberBadge variant="eligible" />` rather than nested ternary logic.
3. **State decoupling**: Keep the `SamityProvider` context as the single source of truth for group members, cycle months, and ledger transactions.

#### C. `60fps-animation` & `micro-interaction`
1. **Wheel Spin Engine**:
   - Execute canvas rotation on `requestAnimationFrame` with cubic deceleration: `1 - Math.pow(1 - progress, 3)`.
   - Never mutate DOM layout properties (`top`, `margin`, `width`) during animation; mutate canvas transform matrices or composited CSS transforms (`transform: rotate(...)`).
2. **Press feedback**:
   - All interactive cards and buttons must provide instant tactile feedback: `active:scale-[0.97] transition-transform duration-100`.

#### D. `accessible-animation`
1. Provide a fallback for `prefers-reduced-motion: reduce`:
   - Wheel spin simplifies to a brief 300ms cross-fade to the winning slice with an announcement, rather than an intense 3.4-second multi-spin cycle.
   - Screen-shake and confetti are gated behind `prefers-reduced-motion: no-preference`.

---

## 3. PWA (Progressive Web App) Architecture

The application must be fully installable on Android, iOS, and Desktop as a standalone PWA.

### 3.1 PWA Checklist & Standards
- [ ] **Web App Manifest (`public/manifest.json` or `app/manifest.ts`)**:
  - `name`: "SamityWheel — Monthly Samity Deposit & Lottery Draw"
  - `short_name`: "SamityWheel"
  - `start_url`: "/"
  - `display`: "standalone"
  - `background_color`: "#0f172a"
  - `theme_color`: "#4f46e5"
  - `orientation`: "portrait"
  - `icons`: 192x192, 512x512, maskable 512x512.
- [ ] **Service Worker & Offline Storage**:
  - Offline-first cache strategy with Stale-While-Revalidate for app assets and offline LocalStorage/IndexedDB backup for payment ledger and winners history.
- [ ] **Install Prompt**:
  - Custom install banner (`BeforeInstallPromptEvent`) encouraging members to add SamityWheel to their home screen.
- [ ] **Viewport & Mobile Status Bar**:
  - Safe-area insets (`env(safe-area-inset-bottom)`, `viewport-fit=cover`).
  - Mobile bottom navigation bar permanently pinned above device gesture bar.

---

## 4. Domain Logic & Business Rules

1. **Fixed Monthly Amount**: Configurable by Admin (default: `BDT 5,000`).
2. **Payment Channels**:
   - `bKash`: Mobile wallet TrxID + screenshot attachment.
   - `Nagad`: Mobile wallet TrxID + screenshot attachment.
   - `Bank Transfer`: Bank reference + receipt screenshot.
   - `Cash on Hand`: Admin handover note + verified receipt.
3. **Admin Verification Workflow**:
   - Submitted payments enter `pending` state.
   - Only `verified` payments accumulate into the **Monthly Pot** (`pot = verifiedCount * fixedAmount`).
4. **Strict Non-Repeating Wheel Draw**:
   - Members who have already won in previous months of the current cycle are **excluded** from the wheel slices.
   - Slices automatically recalculate based on `users.filter(u => u.role === 'member' && !u.hasWon)`.
   - When all members have won once, the cycle completes with full celebration and reset options.
5. **Cycle Progression**:
   - Admin can advance to the next month (`August 2026 -> September 2026 -> October 2026...`).
   - History logs preserve each month's pot, winner, and payment ledger.

---

## 5. Repository Directory Structure

```
/
├── .agents/
│   └── skills/                 # Installed skills (vercel, animation, etc.)
├── public/
│   ├── icons/                  # PWA icons (192, 512, maskable)
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with fonts, PWA meta, theme provider
│   │   ├── page.tsx            # Main multi-view app shell
│   │   ├── manifest.ts         # Next.js dynamic or static manifest
│   │   └── sw.ts               # Serwist service worker worker entry
│   ├── components/
│   │   ├── common/             # Toast, Modal, Header, QuickSwitcher, BottomNav
│   │   ├── dashboard/          # Balance card, quick stats, recent ledger
│   │   ├── deposit/            # Payment form, method selector, receipt preview
│   │   ├── wheel/              # Canvas wheel engine, audio synthesizer, winner banner
│   │   ├── winners/            # Roster list, cycle progress, past winners
│   │   └── admin/              # Verification queue, fixed deposit setting, draw controls
│   ├── context/
│   │   └── SamityContext.tsx   # React 19 Context for unified state management
│   ├── hooks/
│   │   ├── useAudioSynth.ts    # Web Audio synthesis for ticks and fanfare
│   │   ├── useLotteryWheel.ts  # Wheel animation & physics loop
│   │   └── usePWAInstall.ts    # PWA install prompt handler
│   ├── lib/
│   │   ├── mockData.ts         # High-fidelity initial seed data
│   │   ├── receiptSvg.ts       # Dynamic SVG receipt generator
│   │   └── storage.ts          # LocalStorage / IndexedDB persistence wrapper
│   └── types/
│       └── samity.ts           # Type definitions (User, Payment, Winner, Month)
├── AGENT.md                    # This document
└── README.md
```
