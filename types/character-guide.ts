// src/types/character-guide.ts
// Full TypeScript schema for all character guide JSON files.
// Every field except the core identity ones is optional —
// this lets you ship a minimal JSON and fill in the rest later.

export interface SkillEntry {
  name: string;
  desc?: string;
  tags?: string[];
}

export interface CostumeGuide {
  /** Unique ID matching the costume across bannerCharacters / characterDetails */
  id: string;
  name: string;
  rarity: "Limited" | "Standard" | "Upcoming";
  emoji: string;
  /** Hex color for this costume's accent */
  color: string;

  // ── Guide-specific fields (optional, not in the base characters.json) ──
  spCost?: string;
  cooldown?: string;
  upgrade?: {
    min: string;
    recommended: string;
    ideal: string;
  };
  description?: string;
  /** Each item can be a plain skill name string (backward-compat) OR a full SkillEntry */
  skills?: (string | SkillEntry)[];
  tips?: string[];
}

export interface WeaponEntry {
  name: string;
  type?: string;
  priority: string;        // "BiS" | "Strong Alt" | "Budget" | any custom label
  stats?: string[];
  description?: string;
}

export interface GearSlot {
  slot: string;            // "Armor" | "Helmet" | "Gloves" | "Boots" | etc.
  stat: string;            // "ATK %" | "Crit DMG %" | etc.
}

export interface PotentialUpgrade {
  label: string;           // e.g. "Iron Monarch P3"
  note: string;            // e.g. "CD reduction — mandatory"
}

export interface TeamMember {
  name: string;
  role: string;
  costume: string;
  emoji: string;
  color: string;
  /** Marks this member as the guide's character — gets highlighted in the UI */
  isCore?: boolean;
}

export interface RotationStep {
  turn: string;            // e.g. "T0 Setup" | "T1+"
  action: string;
}

export interface TeamComp {
  name: string;
  mode: string;            // "Fiend Hunt" | "Last Night" | "Guild Raid" | etc.
  clearRate?: string;      // "S Tier" | "A+ Tier" | etc.
  description: string;
  tags?: string[];
  rotation?: RotationStep[];
  members: TeamMember[];
}

export interface TipEntry {
  icon: string;            // emoji
  title: string;
  body: string;
}

export interface ExternalLink {
  label: string;
  url: string;
  icon?: "external" | "book" | "gem";
}

export interface BenchmarkEntry {
  value: string;           // e.g. "~70%" | "80-100+"
  label: string;
}

export interface SynergyEntry {
  name: string;
  note: string;
  emoji: string;
}

// ── Root document ──────────────────────────────────────────────────────────
export interface CharacterGuide {
  // Identity (required)
  slug: string;
  name: string;
  element: string;
  archetype: string;
  tier: string;
  stars: number;
  color: string;
  emoji: string;
  rarity: string;
  modeRatings: Record<string, number>;
  costumes: CostumeGuide[];

  // Flavor (optional but highly recommended)
  title?: string;
  colorAlt?: string;
  lore?: string;
  overview?: string;
  keyInsight?: string;

  // Metadata (optional)
  investmentPriority?: number;         // 1-10
  investmentNote?: string;
  fhAppearance?: string;               // e.g. "~70% of top runs"
  externalLinks?: ExternalLink[];
  synergies?: SynergyEntry[];

  // Weapons & gear (optional)
  weapons?: WeaponEntry[];
  gear?: GearSlot[];
  statPriority?: string[];
  potentialUpgrades?: PotentialUpgrade[];

  // Teams (optional)
  teams?: TeamComp[];

  // Tips (optional)
  tips?: TipEntry[];
  benchmarks?: BenchmarkEntry[];
}