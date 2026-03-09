# ⚔️ BD2Hub

> **The ultimate community-powered resource for Brown Dust 2** — tier lists, character guides, boss strategies, team builders, and banner tracking. All in one place.

![Next.js](https://img.shields.io/badge/Next.js-App_Router-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.x-EF0075?logo=framer&logoColor=white)

---

## ✨ Features

### 🏠 Hub Homepage (`BD2HubClient`)
- **Hero section** with animated aurora text, stat tickers, and live community numbers
- **Featured Costumes** marquee — automatically populated from `featured: true` flags in character JSON data
- **Complete Roster** with three-row animated marquee, element/tier filter chips, and live search
- **Bento tools grid** — Tier List, Build Planner, Banner Tracker, Team Builder, PvP Guide, Guides Hub
- **Boss Fight section** with full-bleed cinematic background, weakness/resistance display, and hot-team panel with tab switcher
- **Recent Guides** panel with read counts and tag badges
- **Animated macOS-style Dock** with proximity-scaled icons
- **Custom smooth cursor** — spring-tracked arrow that tilts on hover, with a MagicUI-style label chip and trailing radial glow
- **Sequential Toast system** — welcome, banner alert, and tier list update notifications per session
- **Dark / Light mode** with animated toggle, persisted to `localStorage`

### 📊 Tier List (`TierListClient`)
- SS / S / A / B / C tier rows with glowing tier headers
- Filter by **element**, **archetype**, and **game mode** (Overall, Fiend Hunt, Guild Raid, Mirror War, Tower, Last Night)
- Mode-aware ratings pulled directly from character JSON
- Rarity badges (Limited / Standard / Upcoming)

### 👤 Character Browser (`CharactersClient`)
- Full roster grid with element icons, tier badges, and archetype labels
- Click-through to detailed character modal with tabbed view: **Lore**, **Gameplay**, **Ratings**, **Costume**
- Animated mode-rating bars per character

### 📖 Character Guide (`CharacterGuideClient`)
- Per-character deep-dive pages driven by JSON data
- Costume switcher, skill list, synergy recommendations, investment priority
- External links (banner guides, Fiend Hunt guides, team builders)

### 🃏 Character Modal (shared)
- Animated hero header with emoji art, rarity pill, star rating, element & archetype badges
- Costume quick-switcher with active indicator
- Tabbed body: lore, gameplay tips, mode ratings chart, costume description
- `BorderBeam` animated accent on the modal frame
- Footer CTA linking to the character's full guide page

---

## 🗂️ Project Structure

```
/
├── app/
│   ├── page.tsx                  # Homepage server component (loads character JSONs + boss data)
│   ├── tier-list/
│   │   └── page.tsx
│   ├── characters/
│   │   └── page.tsx
│   └── guides/[slug]/
│       └── page.tsx
├── components/
│   ├── BD2HubClient.tsx          # Homepage mega-client
│   ├── TierListClient.tsx        # Tier list page
│   ├── CharactersClient.tsx      # Characters browser
│   ├── CharacterGuideClient.tsx  # Per-character guide
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Dock.tsx
│   ├── SmoothCursor.tsx
│   └── useTheme.ts
└── data/
    ├── blade.json
    ├── eclipse.json
    ├── liberta.json
    ├── wilhelmina.json
    └── ...                       # One JSON file per character
```

---

## 🧩 Character JSON Schema

Each character is defined by a single JSON file. Here's the full shape:

```jsonc
{
  "slug": "blade",
  "name": "Blade",
  "title": "Apostle of Cocytus",
  "element": "Dark",           // Dark | Light | Fire | Wind | Water | Earth
  "archetype": "Physical / DPS",
  "tier": "S",                 // SS | S | A | B | C
  "stars": 5,
  "color": "#a855f7",
  "colorAlt": "#7c3aed",
  "emoji": "⚔️",
  "rarity": "5★ Limited",
  "lore": "...",
  "overview": "...",           // Shown in the Gameplay tab
  "keyInsight": "...",
  "investmentPriority": 10,    // 1–10
  "investmentNote": "...",
  "fhAppearance": "~65% of top physical FH runs",
  "modeRatings": {
    "mirrorWar": 9,
    "fiendHunter": 10,
    "guildRaid": 8,
    "towerOfSalvation": 9,
    "lastNight": 7
  },
  "costumes": [
    {
      "id": "blade-apostle",
      "name": "Apostle of Cocytus",
      "rarity": "Limited",     // Limited | Standard | Upcoming
      "emoji": "⚔️",
      "color": "#a855f7",
      "description": "...",
      "featured": true,        // true → appears in the Featured Costumes banner section
      "skills": [
        { "name": "Cocytus Strike", "desc": "...", "tags": ["AoE"] }
      ],
      "spCost": "3",
      "cooldown": "5 turns",
      "upgrade": { "min": "0/5", "recommended": "3/5", "ideal": "5/5" },
      "tips": ["..."]
    }
  ],
  "synergies": [
    { "name": "Wilhelmina", "note": "Amplifies Blade's burst turns.", "emoji": "🌸" }
  ],
  "externalLinks": [
    { "label": "Banner Guide", "url": "https://...", "icon": "external" }
  ]
}
```

**To add a new character:** create a new JSON file following the schema above, then import and pass it wherever `characters: CharacterJSON[]` is consumed.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm / pnpm / yarn

### Installation

```bash
git clone https://github.com/your-username/bd2hub.git
cd bd2hub
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Data | Static JSON files (per character) |
| Fonts | DM Sans · Sora (Google Fonts) |

---

## 🤝 Contributing

Contributions are very welcome — especially new character JSON files and guide content!

1. Fork the repo
2. Create a branch: `git checkout -b feat/add-character-anastasia`
3. Add or edit character data in `/data/`
4. Open a pull request with a short description of your changes

For UI contributions, please match the existing design token conventions (`ELEMENT_COLORS`, `TIER_COLORS`, `ARCHETYPE_COLORS`) defined at the top of each client component.

---

## ⚠️ Disclaimer

BD2Hub is a fan-made project and is **not affiliated with Neowiz or the Brown Dust 2 development team**. All game assets, character names, and trademarks belong to their respective owners.

---

## 📄 License

MIT © BD2Hub Contributors