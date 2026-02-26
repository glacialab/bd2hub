# ⚔️ BD2Hub — Brown Dust 2 Community Hub

> The ultimate fan-made guide, tier list, and toolset for the Brown Dust 2 community.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 15** (App Router) |
| UI Components | **shadcn/ui** |
| Styling | **Tailwind CSS v4** |
| Animations | **Framer Motion** + CSS animations |
| Magic UI | **MagicUI** (striped patterns, etc.) |
| Data | Static JSON files |
| Icons | **Lucide React** |
| Fonts | Google Fonts (Cinzel + Inter) |

---

## 🚀 Project Setup

### 1. Create Next.js 15 App

```bash
npx create-next-app@latest bd2hub \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd bd2hub
```

### 2. Install shadcn/ui

```bash
npx shadcn@latest init
```

When prompted, select:
- **Style:** New York
- **Base color:** Zinc
- **CSS variables:** Yes

### 3. Add shadcn/ui Components

```bash
npx shadcn@latest add card badge button dialog sheet tabs
npx shadcn@latest add navigation-menu dropdown-menu tooltip
npx shadcn@latest add separator skeleton avatar
```

### 4. Install Additional Dependencies

```bash
npm install framer-motion
npm install lucide-react
npm install @radix-ui/react-icons
npm install clsx tailwind-merge
npm install next-themes
```

### 5. Install MagicUI Components

MagicUI has **no separate CLI** — it uses the exact same `shadcn` CLI with an `@magicui/` prefix. No extra init step needed.

```bash
# Characters section
npx shadcn@latest add @magicui/marquee

# Tools / feature cards
npx shadcn@latest add @magicui/bento-grid
npx shadcn@latest add @magicui/border-beam

# Navigation
npx shadcn@latest add @magicui/dock

# Cursor
npx shadcn@latest add @magicui/smooth-cursor

# Theme toggle
npx shadcn@latest add @magicui/animated-theme-toggler

# Hero headline
npx shadcn@latest add @magicui/aurora-text

# Stats
npx shadcn@latest add @magicui/number-ticker

# Callout text
npx shadcn@latest add @magicui/highlighter

# Extras (recommended)
npx shadcn@latest add @magicui/blur-fade
npx shadcn@latest add @magicui/animated-shiny-text
```

Each command copies the component source directly into your `src/components/ui/` folder, just like shadcn components. Then import normally:

```tsx
import { Marquee } from "@/components/ui/marquee"
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid"
import { BorderBeam } from "@/components/ui/border-beam"
import { Dock, DockIcon } from "@/components/ui/dock"
import { SmoothCursor } from "@/components/ui/smooth-cursor"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { AuroraText } from "@/components/ui/aurora-text"
import { NumberTicker } from "@/components/ui/number-ticker"
import { Highlighter } from "@/components/ui/highlighter"
```

> **Note on SmoothCursor:** add `cursor: none !important` globally in `globals.css` to hide the default browser cursor. Keep `cursor: auto` on `input`, `textarea`, `select` so usability isn't lost.

---

## 📁 Project Structure

```
bd2hub/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with fonts, theme provider
│   │   ├── page.tsx                # Main homepage
│   │   ├── globals.css             # CSS variables, base styles
│   │   ├── tier-list/
│   │   │   └── page.tsx
│   │   ├── characters/
│   │   │   ├── page.tsx            # Character list
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # Character guide detail
│   │   ├── guides/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── banners/
│   │   │   └── page.tsx
│   │   ├── teams/
│   │   │   └── page.tsx
│   │   └── builder/
│   │       └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn auto-generated
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturedCharacters.tsx
│   │   │   ├── LatestGuides.tsx
│   │   │   ├── ToolsGrid.tsx
│   │   │   └── BannerCTA.tsx
│   │   ├── characters/
│   │   │   ├── CharacterCard.tsx
│   │   │   ├── CharacterGrid.tsx
│   │   │   └── CharacterProfile.tsx
│   │   ├── tier-list/
│   │   │   ├── TierRow.tsx
│   │   │   └── TierListTable.tsx
│   │   └── shared/
│   │       ├── ElementBadge.tsx
│   │       ├── TierBadge.tsx
│   │       ├── GlowOrb.tsx
│   │       └── AnimatedCounter.tsx
│   │
│   ├── data/                       # Static JSON data files
│   │   ├── characters.json
│   │   ├── guides.json
│   │   ├── banners.json
│   │   ├── tier-list.json
│   │   └── team-comps.json
│   │
│   ├── lib/
│   │   ├── utils.ts                # cn(), clsx helpers
│   │   └── constants.ts            # Game constants, colors, etc.
│   │
│   ├── hooks/
│   │   ├── useScrolled.ts
│   │   └── useFilter.ts
│   │
│   └── types/
│       ├── character.ts
│       ├── guide.ts
│       └── banner.ts
│
├── public/
│   ├── assets/
│   │   ├── characters/             # Character portrait images
│   │   ├── icons/
│   │   │   ├── elements/           # Fire, Water, Wind, etc.
│   │   │   └── roles/              # Warrior, Mage, etc.
│   │   └── backgrounds/
│   └── favicon.ico
│
├── next.config.ts
├── tailwind.config.ts
├── components.json                 # shadcn config
└── package.json
```

---

## 🎨 Design System

### Colors (globals.css)

```css
:root {
  --background: 6 8 16;          /* #060810 — deep navy black */
  --foreground: 255 255 255;
  --purple-accent: 168 85 247;   /* #a855f7 */
  --purple-deep: 124 58 237;     /* #7c3aed */
  --cyan-accent: 6 182 212;      /* #06b6d4 */
  --amber-accent: 245 158 11;    /* #f59e0b */
  --card: 255 255 255 / 0.04;
  --border: 255 255 255 / 0.08;
}
```

### Element Colors

```ts
export const ELEMENT_COLORS = {
  Fire:  "#ef4444",
  Water: "#38bdf8",
  Wind:  "#22c55e",
  Dark:  "#a855f7",
  Light: "#f59e0b",
  Earth: "#a16207",
};
```

### Tier Colors

```ts
export const TIER_COLORS = {
  SS: "#f59e0b",
  S:  "#a855f7",
  A:  "#38bdf8",
  B:  "#22c55e",
  C:  "#ffffff55",
};
```

---

## 📦 Static Data Format

### `src/data/characters.json`

```json
[
  {
    "id": "anastasia",
    "name": "Anastasia",
    "costume": "Winter Witch",
    "element": "Dark",
    "role": "Mage",
    "damage": "Magic",
    "tier": "SS",
    "banner": "Limited",
    "image": "/assets/characters/anastasia.webp",
    "icon": "/assets/characters/icons/anastasia.webp",
    "ratings": {
      "fiendHunter": 9,
      "guildRaid": 8,
      "lastNight": 10,
      "towerOfSalvation": 7,
      "mirrorWar": 9,
      "goldenColosseum": 8
    },
    "skills": [],
    "tags": ["AoE", "DoT", "DPS"],
    "guideSlug": "anastasia-winter-witch"
  }
]
```

### `src/data/banners.json`

```json
[
  {
    "id": "banner-feb-2025",
    "character": "anastasia",
    "startDate": "2025-02-01",
    "endDate": "2025-02-21",
    "type": "Limited",
    "pullValue": 9,
    "notes": "Exceptional DPS for Last Night mode"
  }
]
```

---

## 🖼 Using Game Assets

Game images can be loaded from community sources or self-hosted. For community-sourced assets:

```tsx
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "zormolo.github.io" },
      { protocol: "https", hostname: "dotgg.gg" },
      // Add CDN hostnames as discovered
    ],
  },
};
export default nextConfig;
```

---

## 🏃 Dev Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Export as static site (no server needed!)
npm run build && npm run export

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## 🌐 Deployment

Since this is a fully static frontend, you can deploy to:

```bash
# Vercel (recommended)
npx vercel deploy

# GitHub Pages
npm run build
# → set output: 'export' in next.config.ts
```

---

## 🔮 Planned Features

- [ ] Interactive Tier List with drag-to-rank
- [ ] Character Build Planner (costumes + equipment)
- [ ] Banner Pull Calendar with gem budget calculator
- [ ] Team Composition Builder with synergy analysis
- [ ] Search across all characters + guides
- [ ] Dark / light mode toggle
- [ ] Discord integration for live community activity
- [ ] Filter characters by element, role, tier, banner type

---

*Fan-made community project — not affiliated with Neowiz or Brown Dust 2.*