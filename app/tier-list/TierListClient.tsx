"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Dock from "@/components/Dock";
import { useTheme } from "@/components/useTheme";
import SmoothCursor from "@/components/SmoothCursor";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
interface CostumeData {
  id: string; name: string; rarity: string;
  emoji: string; color: string; description?: string;
  tier?: string; featured?: boolean;
}
interface CharacterJSON {
  slug: string; name: string; title?: string;
  element: string; archetype: string; tier: string;
  stars: number; color: string; colorAlt?: string; emoji: string; rarity?: string;
  modeRatings: Record<string, number>;
  costumes: CostumeData[];
  investmentPriority?: number;
}
interface TierListClientProps { characters: CharacterJSON[]; }

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */
const TIERS = ["SS", "S", "A", "B", "C"] as const;
type TierKey = (typeof TIERS)[number];
const MODES = ["Overall", "Fiend Hunt", "Guild Raid", "Mirror War", "Tower", "Last Night"] as const;
type ModeKey = (typeof MODES)[number];

const TIER_CFG: Record<TierKey, { color: string; glow: string; bg: string; border: string; label: string }> = {
  SS: { color: "#f59e0b", glow: "rgba(245,158,11,0.35)", bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.30)", label: "Meta-Defining" },
  S:  { color: "#a855f7", glow: "rgba(168,85,247,0.35)", bg: "rgba(168,85,247,0.07)", border: "rgba(168,85,247,0.30)", label: "Top Tier"       },
  A:  { color: "#38bdf8", glow: "rgba(56,189,248,0.35)",  bg: "rgba(56,189,248,0.07)",  border: "rgba(56,189,248,0.28)",  label: "Strong Pick"   },
  B:  { color: "#22c55e", glow: "rgba(34,197,94,0.35)",   bg: "rgba(34,197,94,0.07)",   border: "rgba(34,197,94,0.25)",   label: "Situational"   },
  C:  { color: "#94a3b8", glow: "rgba(148,163,184,0.25)", bg: "rgba(148,163,184,0.05)", border: "rgba(148,163,184,0.20)", label: "Niche / Weak"  },
};
const ELEMENT_COLORS: Record<string, string> = {
  Dark: "#a855f7", Light: "#f59e0b", Fire: "#ef4444",
  Wind: "#22c55e", Water: "#38bdf8", Earth: "#a78a2e",
};
const RARITY_COLORS: Record<string, string> = {
  Limited: "#f59e0b", Standard: "#64748b", Upcoming: "#06b6d4",
};

/* ── Design tokens — single source of truth for every color in the file ── */
interface Tokens {
  bg: string; surface: string; surfaceHov: string;
  border: string; borderHov: string;
  text: string; textMuted: string; textFaint: string;
  controlBg: string; inputBg: string; inputBorder: string;
  stickyBg: string; divider: string;
}
function tokens(dark: boolean): Tokens {
  return dark ? {
    bg:          "#08090e",
    surface:     "rgba(255,255,255,0.03)",
    surfaceHov:  "rgba(255,255,255,0.06)",
    border:      "rgba(255,255,255,0.07)",
    borderHov:   "rgba(255,255,255,0.18)",
    text:        "#ffffff",
    textMuted:   "rgba(255,255,255,0.42)",
    textFaint:   "rgba(255,255,255,0.22)",
    controlBg:   "rgba(255,255,255,0.05)",
    inputBg:     "rgba(255,255,255,0.05)",
    inputBorder: "rgba(255,255,255,0.10)",
    stickyBg:    "rgba(8,9,14,0.92)",
    divider:     "rgba(255,255,255,0.07)",
  } : {
    bg:          "#f2f2f7",
    surface:     "rgba(255,255,255,0.80)",
    surfaceHov:  "rgba(255,255,255,0.95)",
    border:      "rgba(0,0,0,0.09)",
    borderHov:   "rgba(0,0,0,0.18)",
    text:        "#0f0f14",
    textMuted:   "rgba(0,0,0,0.48)",
    textFaint:   "rgba(0,0,0,0.28)",
    controlBg:   "rgba(0,0,0,0.05)",
    inputBg:     "rgba(255,255,255,0.80)",
    inputBorder: "rgba(0,0,0,0.12)",
    stickyBg:    "rgba(242,242,247,0.93)",
    divider:     "rgba(0,0,0,0.08)",
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   DATA HELPERS
───────────────────────────────────────────────────────────────────────────── */
interface CharEntry {
  kind: "character"; id: string; slug: string; name: string; title?: string;
  element: string; archetype: string; color: string; emoji: string;
  tier: TierKey; score: number; costumes: CostumeData[]; modeRatings: Record<string, number>;
}
interface CostumeEntry {
  kind: "costume"; id: string; charName: string; charSlug: string;
  charEmoji: string; name: string; rarity: string; emoji: string; color: string;
  tier: TierKey; score: number;
}
type Entry = CharEntry | CostumeEntry;

function avgRatings(char: CharacterJSON, mode: ModeKey): number {
  const r = char.modeRatings;
  if (mode === "Overall") {
    const vals = Object.values(r).filter(v => typeof v === "number") as number[];
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }
  return (r as any)[mode] ?? 0;
}
function scoreTier(s: number): TierKey {
  if (s >= 9) return "SS"; if (s >= 7.5) return "S";
  if (s >= 6) return "A";  if (s >= 4.5) return "B"; return "C";
}
function buildCharEntries(chars: CharacterJSON[], mode: ModeKey): CharEntry[] {
  return chars.map(c => {
    const score = avgRatings(c, mode);
    return { kind: "character", id: c.slug, slug: c.slug, name: c.name, title: c.title,
      element: c.element, archetype: c.archetype, color: c.color, emoji: c.emoji,
      tier: scoreTier(score), score, costumes: c.costumes, modeRatings: c.modeRatings };
  });
}
function buildCostumeEntries(chars: CharacterJSON[], mode: ModeKey): CostumeEntry[] {
  const out: CostumeEntry[] = [];
  for (const c of chars) for (const cos of c.costumes) {
    let score = avgRatings(c, mode);
    if (cos.rarity === "Limited") score = Math.min(10, score + 0.5);
    else if (cos.rarity === "Standard") score = Math.max(0, score - 0.5);
    out.push({ kind: "costume", id: `${c.slug}-${cos.id}`, charName: c.name, charSlug: c.slug,
      charEmoji: c.emoji, name: cos.name, rarity: cos.rarity, emoji: cos.emoji,
      color: cos.color || c.color, tier: cos.tier ? (cos.tier as TierKey) : scoreTier(score), score });
  }
  return out;
}
function groupByTier<T extends Entry>(entries: T[]): Record<TierKey, T[]> {
  const g: Record<TierKey, T[]> = { SS: [], S: [], A: [], B: [], C: [] };
  for (const e of entries) g[e.tier].push(e);
  for (const t of TIERS) g[t].sort((a, b) => b.score - a.score);
  return g;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SCORE BAR
───────────────────────────────────────────────────────────────────────────── */
function ScoreBar({ score, color, dark }: { score: number; color: string; dark: boolean }) {
  return (
    <div style={{ width:"100%", height:3, borderRadius:4, overflow:"hidden", background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
      <motion.div style={{ height:"100%", borderRadius:4, background: color }}
        initial={{ width: 0 }} animate={{ width: `${score * 10}%` }}
        transition={{ duration: 0.55, ease: "easeOut" }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CHARACTER CARD
───────────────────────────────────────────────────────────────────────────── */
function CharCard({ entry, mode, dark }: { entry: CharEntry; mode: ModeKey; dark: boolean }) {
  const [hov, setHov] = useState(false);
  const tk = tokens(dark);
  const cfg = TIER_CFG[entry.tier];
  const elemColor = ELEMENT_COLORS[entry.element] ?? "#64748b";

  return (
    <motion.div layout
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 320, damping: 28 }}
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      style={{
        position:"relative", cursor:"pointer", userSelect:"none", borderRadius:14, overflow:"hidden",
        background: hov ? tk.surfaceHov : tk.surface,
        border: `1px solid ${hov ? entry.color + "55" : tk.border}`,
        boxShadow: hov ? `0 8px 28px -6px ${entry.color}30` : "none",
        transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
      }}>
      {/* Top accent stripe */}
      <div style={{ height:3, background:`linear-gradient(90deg, ${entry.color}, transparent)` }} />
      {/* Hov glow */}
      {hov && <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:`radial-gradient(circle at 50% 0%, ${entry.color}18 0%, transparent 65%)` }} />}

      <div style={{ position:"relative", padding:"12px 14px", display:"flex", flexDirection:"column", gap:9 }}>
        {/* Header row */}
        <div style={{ display:"flex", alignItems:"flex-start", gap:9 }}>
          <span style={{ fontSize:24, flexShrink:0, lineHeight:1 }}>{entry.emoji}</span>
          <div style={{ minWidth:0, flex:1 }}>
            <p style={{ fontSize:13, fontWeight:700, lineHeight:1.2, margin:0, color: tk.text, fontFamily:"'Sora',sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {entry.name}
            </p>
            {entry.title && <p style={{ fontSize:10, margin:"2px 0 0", color: tk.textFaint, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.title}</p>}
          </div>
          {/* Element badge */}
          <span style={{ flexShrink:0, borderRadius:999, padding:"2px 7px", fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", background: elemColor+"22", color: elemColor, border:`1px solid ${elemColor}44` }}>
            {entry.element}
          </span>
        </div>

        {/* Score row */}
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", color: tk.textFaint }}>
              {mode === "Overall" ? "avg" : mode}
            </span>
            <span style={{ fontSize:12, fontWeight:700, tabularNums: true, color: cfg.color } as any}>{entry.score.toFixed(1)}</span>
          </div>
          <ScoreBar score={entry.score} color={entry.color} dark={dark} />
        </div>

        {/* Footer row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:10, color: tk.textFaint }}>{entry.archetype}</span>
          <span style={{ fontSize:10, color: tk.textFaint }}>{entry.costumes.length} costumes</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   COSTUME CARD
───────────────────────────────────────────────────────────────────────────── */
function CostumeCard({ entry, dark }: { entry: CostumeEntry; dark: boolean }) {
  const [hov, setHov] = useState(false);
  const tk = tokens(dark);
  const cfg = TIER_CFG[entry.tier];
  const rc = RARITY_COLORS[entry.rarity] ?? "#64748b";

  return (
    <motion.div layout
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 320, damping: 28 }}
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      style={{
        position:"relative", cursor:"pointer", userSelect:"none", borderRadius:14, overflow:"hidden",
        background: hov ? tk.surfaceHov : tk.surface,
        border: `1px solid ${hov ? entry.color + "48" : tk.border}`,
        boxShadow: hov ? `0 8px 24px -6px ${entry.color}25` : "none",
        transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
      }}>
      <div style={{ height:3, background:`linear-gradient(90deg, ${entry.color}cc, transparent)` }} />
      {hov && <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:`radial-gradient(circle at 50% 0%, ${entry.color}14 0%, transparent 65%)` }} />}

      <div style={{ position:"relative", padding:"11px 13px", display:"flex", flexDirection:"column", gap:8 }}>
        {/* Costume name + emoji */}
        <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
          <span style={{ fontSize:20, flexShrink:0, lineHeight:1, marginTop:2 }}>{entry.emoji}</span>
          <p style={{ fontSize:12, fontWeight:700, lineHeight:1.3, margin:0, color: tk.text, fontFamily:"'Sora',sans-serif",
            display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" } as any}>
            {entry.name}
          </p>
        </div>

        {/* Character source */}
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:14, lineHeight:1 }}>{entry.charEmoji}</span>
          <span style={{ fontSize:10, color: tk.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.charName}</span>
        </div>

        {/* Rarity + score */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:9, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em",
            padding:"2px 7px", borderRadius:999, background: rc+"18", color: rc, border:`1px solid ${rc}33` }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background: rc, flexShrink:0, display:"inline-block" }} />
            {entry.rarity}
          </span>
          <span style={{ fontSize:12, fontWeight:700, color: cfg.color }}>{entry.score.toFixed(1)}</span>
        </div>
        <ScoreBar score={entry.score} color={entry.color} dark={dark} />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TIER ROW
───────────────────────────────────────────────────────────────────────────── */
function TierRow({ tier, entries, viewMode, mode, dark }: {
  tier: TierKey; entries: Entry[]; viewMode: "character" | "costume"; mode: ModeKey; dark: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [headerHov, setHeaderHov] = useState(false);
  const tk = tokens(dark);
  const cfg = TIER_CFG[tier];
  if (entries.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ borderRadius:18, overflow:"hidden", border:`1px solid ${cfg.border}`,
        background: dark ? cfg.bg : cfg.bg.replace("0.07","0.04") }}>

      {/* Collapsible header */}
      <button onClick={() => setCollapsed(c => !c)}
        onMouseEnter={() => setHeaderHov(true)} onMouseLeave={() => setHeaderHov(false)}
        style={{ width:"100%", display:"flex", alignItems:"center", gap:16, padding:"16px 20px",
          cursor:"pointer", border:"none", background: headerHov ? tk.surfaceHov : "transparent",
          textAlign:"left", transition:"background 0.18s" }}>

        {/* Tier badge */}
        <div style={{ width:56, height:56, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:24, fontWeight:900, flexShrink:0, fontFamily:"'Sora',sans-serif",
          background:`linear-gradient(135deg, ${cfg.color}28, ${cfg.color}10)`,
          border:`2px solid ${cfg.color}55`, color: cfg.color,
          boxShadow:`0 0 18px ${cfg.glow}`, textShadow:`0 0 16px ${cfg.glow}` }}>
          {tier}
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:8, marginBottom:6 }}>
            <span style={{ fontSize:13, fontWeight:700, color: tk.text }}>{cfg.label}</span>
            <span style={{ fontSize:11, fontWeight:600, padding:"2px 9px", borderRadius:999,
              background: cfg.color+"20", color: cfg.color }}>
              {entries.length} {viewMode === "costume" ? "costumes" : "characters"}
            </span>
          </div>
          {/* Sparkbar */}
          <div style={{ display:"flex", gap:2, height:4 }}>
            {entries.slice(0, 24).map((e, i) => (
              <div key={i} style={{ flex:1, borderRadius:3, background: e.color+"65", maxWidth:26 }} />
            ))}
          </div>
        </div>

        <motion.span animate={{ rotate: collapsed ? -90 : 0 }} transition={{ duration: 0.18 }}
          style={{ fontSize:14, color: tk.textFaint, flexShrink:0 }}>▾</motion.span>
      </button>

      {/* Cards panel */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.26, ease: "easeInOut" }}
            style={{ overflow:"hidden" }}>
            <div style={{ padding:"4px 16px 20px" }}>
              <div style={{ height:1, background: tk.divider, marginBottom:14 }} />
              <div style={{ display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))" }}>
                <AnimatePresence mode="popLayout">
                  {entries.map(e => e.kind === "character"
                    ? <CharCard key={e.id} entry={e as CharEntry} mode={mode} dark={dark} />
                    : <CostumeCard key={e.id} entry={e as CostumeEntry} dark={dark} />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   STATS BAR
───────────────────────────────────────────────────────────────────────────── */
function StatsBar({ characters, dark }: { characters: CharacterJSON[]; dark: boolean }) {
  const tk = tokens(dark);
  const totalCostumes = characters.reduce((s, c) => s + c.costumes.length, 0);
  const tierCounts = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const c of characters) acc[c.tier] = (acc[c.tier] ?? 0) + 1;
    return acc;
  }, [characters]);

  return (
    <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:16, fontSize:12 }}>
      <span style={{ fontWeight:600, color: tk.textMuted }}>
        {characters.length} characters · {totalCostumes} costumes
      </span>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {TIERS.map(t => tierCounts[t] ? (
          <span key={t} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background: TIER_CFG[t].color, display:"inline-block" }} />
            <span style={{ color: TIER_CFG[t].color, fontWeight:600 }}>{t}</span>
            <span style={{ color: tk.textFaint }}>{tierCounts[t]}</span>
          </span>
        ) : null)}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function TierListClient({ characters }: TierListClientProps) {
  const { dark, toggleDark, themeReady } = useTheme();
  const [viewMode, setViewMode] = useState<"character" | "costume">("character");
  const [activeMode, setActiveMode] = useState<ModeKey>("Overall");
  const [filterElement, setFilterElement] = useState<string>("All");
  const [search, setSearch] = useState("");

  const tk = tokens(dark);

  const elements = useMemo(() => {
    const elems = Array.from(new Set(characters.map(c => c.element))).sort();
    return ["All", ...elems];
  }, [characters]);

  const filteredChars = useMemo(() => {
    let chars = characters;
    if (filterElement !== "All") chars = chars.filter(c => c.element === filterElement);
    if (search.trim()) {
      const q = search.toLowerCase();
      chars = chars.filter(c =>
        c.name.toLowerCase().includes(q) || c.archetype.toLowerCase().includes(q) ||
        c.element.toLowerCase().includes(q) || c.costumes.some(cos => cos.name.toLowerCase().includes(q))
      );
    }
    return chars;
  }, [characters, filterElement, search]);

  const charEntries  = useMemo(() => buildCharEntries(filteredChars, activeMode),   [filteredChars, activeMode]);
  const costumeEntries = useMemo(() => buildCostumeEntries(filteredChars, activeMode), [filteredChars, activeMode]);
  const charGroups   = useMemo(() => groupByTier(charEntries),   [charEntries]);
  const costumeGroups = useMemo(() => groupByTier(costumeEntries), [costumeEntries]);

  const groups    = viewMode === "character" ? charGroups    : costumeGroups;
  const allEntries = viewMode === "character" ? charEntries  : costumeEntries;

  /* Particle canvas */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 32 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.3 + 0.4,
      opacity: Math.random() * 0.22 + 0.04,
      speed: Math.random() * 0.22 + 0.07,
      color: ["#a855f7","#f59e0b","#38bdf8"][Math.floor(Math.random() * 3)],
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.opacity * 255).toString(16).padStart(2, "0");
        ctx.fill();
        p.y -= p.speed;
        if (p.y < -4) p.y = canvas.height + 4;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  /* Prevent flash of wrong theme before localStorage is read */
  if (!themeReady) return null;

  return (
    <div style={{ minHeight:"100vh", background: tk.bg, fontFamily:"'DM Sans','Sora',sans-serif", position:"relative", transition:"background 0.3s", cursor:"none" }}>
      {/* ── SMOOTH CURSOR ── */}
      <SmoothCursor />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(168,85,247,0.4); border-radius:4px; }
        .tl-btn { transition:all 0.18s; cursor:pointer !important; }
        a, button, [role='button'], .tl-btn { cursor: pointer !important; }
        * { cursor: none !important; }
        input, textarea { cursor: text !important; }
        .tl-btn:hover { opacity:0.85; }
      `}</style>

      {/* ── NAVBAR ── */}
      <Navbar dark={dark} onToggleDark={toggleDark} activePath="/tier-list" />

      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{ position:"fixed", inset:0, width:"100%", height:"100%", pointerEvents:"none", opacity: dark?0.5:0.15, zIndex:0 }} />

      {/* Mesh glows */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", top:"-10%", left:"-5%", width:"50%", height:"60%", background:`radial-gradient(ellipse, ${dark?"rgba(168,85,247,0.08)":"rgba(168,85,247,0.04)"} 0%, transparent 70%)`, filter:"blur(40px)" }} />
        <div style={{ position:"absolute", bottom:"10%", right:"-5%", width:"40%", height:"50%", background:`radial-gradient(ellipse, ${dark?"rgba(56,189,248,0.06)":"rgba(56,189,248,0.03)"} 0%, transparent 70%)`, filter:"blur(40px)" }} />
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"55%", height:"40%", background:`radial-gradient(ellipse, ${dark?"rgba(245,158,11,0.04)":"rgba(245,158,11,0.02)"} 0%, transparent 70%)`, filter:"blur(60px)" }} />
      </div>

      <div style={{ position:"relative", zIndex:1 }}>

        {/* ── HERO — pt-28 clears fixed 64px navbar ── */}
        <div style={{ borderBottom:`1px solid ${tk.border}`, padding:"7rem 2rem 3rem", transition:"border-color 0.3s" }}>
          <div style={{ maxWidth:1280, margin:"0 auto" }}>
            {/* Breadcrumb */}
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:22, fontSize:12, color: tk.textFaint }}>
              <a href="/" style={{ color: tk.textFaint, textDecoration:"none" }}
                onMouseEnter={e=>(e.currentTarget.style.color=tk.textMuted)}
                onMouseLeave={e=>(e.currentTarget.style.color=tk.textFaint)}>BD2Hub</a>
              <span>›</span>
              <span style={{ color:"#a855f7" }}>Tier List</span>
            </div>

            <div style={{ display:"flex", flexWrap:"wrap", alignItems:"flex-end", justifyContent:"space-between", gap:24 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <div style={{ height:1, width:32, background:"linear-gradient(90deg,#a855f7,transparent)" }} />
                  <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"#a855f7" }}>Brown Dust 2</span>
                </div>
                <h1 style={{ fontSize:"clamp(2rem,6vw,3.75rem)", fontWeight:900, letterSpacing:"-0.025em", lineHeight:1.05, color: tk.text, fontFamily:"'Sora',sans-serif", margin:0, transition:"color 0.3s" }}>
                  Tier List
                  <span style={{ display:"block", background:"linear-gradient(135deg,#a855f7,#38bdf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                    Rankings
                  </span>
                </h1>
                <p style={{ fontSize:14, color: tk.textMuted, maxWidth:420, lineHeight:1.7, marginTop:12, transition:"color 0.3s" }}>
                  All characters and costumes ranked by meta strength. Switch between{" "}
                  <span style={{ color:"#c084fc", fontWeight:600 }}>Character</span> and{" "}
                  <span style={{ color:"#fbbf24", fontWeight:600 }}>Costume</span> views, filter by mode, or search.
                </p>
              </div>

              {/* Stat pills */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
                {[
                  { label:"Characters", value: characters.length, color:"#a855f7" },
                  { label:"Costumes",   value: characters.reduce((s,c)=>s+c.costumes.length,0), color:"#f59e0b" },
                  { label:"Modes",      value: 5, color:"#38bdf8" },
                ].map(s => (
                  <div key={s.label} style={{ borderRadius:14, border:`1px solid ${s.color}30`, background: s.color+"0d", padding:"12px 18px", textAlign:"center", minWidth:84 }}>
                    <div style={{ fontSize:22, fontWeight:900, color:s.color, fontFamily:"'Sora',sans-serif" }}>{s.value}</div>
                    <div style={{ fontSize:10, color: tk.textFaint, fontWeight:500, marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── STICKY CONTROLS — top:64px sits flush below the fixed navbar ── */}
        <div style={{ position:"sticky", top:64, zIndex:30, borderBottom:`1px solid ${tk.border}`, background: tk.stickyBg, backdropFilter:"blur(20px)", transition:"background 0.3s, border-color 0.3s" }}>
          <div style={{ maxWidth:1280, margin:"0 auto", padding:"10px 2rem", display:"flex", flexDirection:"column", gap:10 }}>

            {/* Row 1: View toggle + Mode pills */}
            <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:12 }}>

              {/* View toggle */}
              <div style={{ display:"flex", background: tk.controlBg, border:`1px solid ${tk.border}`, borderRadius:12, padding:3, gap:3, flexShrink:0 }}>
                {(["character","costume"] as const).map(v => {
                  const active = viewMode === v;
                  return (
                    <button key={v} className="tl-btn"
                      onClick={() => setViewMode(v)}
                      style={{
                        padding:"7px 15px", borderRadius:9, fontSize:12, fontWeight:700, fontFamily:"'Sora',sans-serif",
                        border: active ? "1px solid rgba(168,85,247,0.42)" : "1px solid transparent",
                        background: active ? "linear-gradient(135deg,rgba(168,85,247,0.28),rgba(168,85,247,0.14))" : "transparent",
                        color: active ? "#c084fc" : tk.textMuted,
                        boxShadow: active ? "0 2px 10px rgba(168,85,247,0.22)" : "none",
                        cursor:"pointer",
                      }}>
                      {v === "character" ? "👤 Character" : "👗 Costume"}
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div style={{ width:1, height:22, background: tk.divider, flexShrink:0 }} />

              {/* Mode pills */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {MODES.map(m => {
                  const active = activeMode === m;
                  return (
                    <button key={m} className="tl-btn"
                      onClick={() => setActiveMode(m)}
                      style={{
                        padding:"5px 12px", borderRadius:999, fontSize:12, fontWeight:600, cursor:"pointer",
                        border: `1px solid ${active ? "rgba(168,85,247,0.5)" : tk.border}`,
                        background: active ? "rgba(168,85,247,0.15)" : tk.controlBg,
                        color: active ? "#c084fc" : tk.textMuted,
                        whiteSpace:"nowrap",
                      }}>
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Search + element filter + count */}
            <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:8 }}>
              {/* Search */}
              <div style={{ position:"relative", flex:1, minWidth:180, maxWidth:280 }}>
                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14, color: tk.textFaint, pointerEvents:"none" }}>🔍</span>
                <input type="text" placeholder="Search characters, costumes…"
                  value={search} onChange={e => setSearch(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = "rgba(168,85,247,0.55)"; e.target.style.background = tk.inputBg; }}
                  onBlur={e => { e.target.style.borderColor = tk.inputBorder; }}
                  style={{ width:"100%", padding:"9px 14px 9px 34px", borderRadius:11,
                    border:`1px solid ${tk.inputBorder}`, background: tk.inputBg,
                    color: tk.text, fontSize:13, outline:"none",
                    fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.18s",
                  }} />
              </div>

              {/* Element filter */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {elements.map(el => {
                  const color = el === "All" ? "#a855f7" : (ELEMENT_COLORS[el] ?? "#64748b");
                  const active = filterElement === el;
                  return (
                    <button key={el} className="tl-btn"
                      onClick={() => setFilterElement(el)}
                      style={{ padding:"4px 11px", borderRadius:999, fontSize:11, fontWeight:600, cursor:"pointer",
                        background: active ? color+"20" : tk.controlBg,
                        border: `1px solid ${active ? color+"55" : tk.border}`,
                        color: active ? color : tk.textMuted,
                      }}>
                      {el}
                    </button>
                  );
                })}
              </div>

              {/* Count */}
              <span style={{ fontSize:11, color: tk.textFaint, marginLeft:"auto" }}>{allEntries.length} shown</span>
            </div>
          </div>
        </div>

        {/* ── TIER LIST ── */}
        <main style={{ maxWidth:1280, margin:"0 auto", padding:"1.75rem 2rem" }}>
          <div style={{ marginBottom:18 }}>
            <StatsBar characters={filteredChars} dark={dark} />
          </div>

          {/* Mode banner */}
          {activeMode !== "Overall" && (
            <motion.div key={activeMode} initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
              style={{ marginBottom:18, borderRadius:12, border:"1px solid rgba(168,85,247,0.22)",
                background: dark ? "rgba(168,85,247,0.07)" : "rgba(168,85,247,0.05)",
                padding:"10px 16px", display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:18 }}>🎯</span>
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:"#c084fc", margin:0 }}>Showing rankings for: {activeMode}</p>
                <p style={{ fontSize:11, color: tk.textMuted, margin:"3px 0 0" }}>
                  {viewMode === "costume" ? "Costumes rated by their usefulness in this specific mode." : "Characters ranked by their average performance in this mode."}
                </p>
              </div>
            </motion.div>
          )}

          {/* Tier rows */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <AnimatePresence mode="wait">
              <motion.div key={`${viewMode}-${activeMode}-${filterElement}-${search}`}
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.16 }}
                style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {TIERS.map(tier => (
                  <TierRow key={tier} tier={tier} entries={groups[tier]} viewMode={viewMode} mode={activeMode} dark={dark} />
                ))}
                {allEntries.length === 0 && (
                  <div style={{ textAlign:"center", padding:"5rem 0", color: tk.textMuted }}>
                    <div style={{ fontSize:44, marginBottom:14 }}>🔍</div>
                    <p style={{ fontSize:17, fontWeight:600, color: tk.text, margin:0 }}>No results found</p>
                    <p style={{ fontSize:13, marginTop:6, color: tk.textMuted }}>Try adjusting your search or filters</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Legend */}
          <div style={{ marginTop:44, borderRadius:18, border:`1px solid ${tk.border}`, background: tk.surface, padding:24, transition:"background 0.3s, border-color 0.3s" }}>
            <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.14em", color: tk.textFaint, margin:"0 0 16px" }}>
              Rating Legend
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:16 }}>
              {TIERS.map(tier => {
                const cfg = TIER_CFG[tier];
                const range = tier==="SS"?"9.0–10":tier==="S"?"7.5–8.9":tier==="A"?"6.0–7.4":tier==="B"?"4.5–5.9":"0–4.4";
                return (
                  <div key={tier} style={{ display:"flex", alignItems:"center", gap:12, flex:1, minWidth:190 }}>
                    <div style={{ width:38, height:38, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:13, fontWeight:900, flexShrink:0, fontFamily:"'Sora',sans-serif",
                      background: cfg.color+"22", border:`1.5px solid ${cfg.color}44`, color: cfg.color }}>
                      {tier}
                    </div>
                    <p style={{ fontSize:12, fontWeight:500, color: tk.textMuted, margin:0 }}>
                      <span style={{ color: tk.text, fontWeight:700 }}>{range}</span> · {cfg.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <p style={{ textAlign:"center", fontSize:11, color: tk.textFaint, marginTop:24, paddingBottom:20 }}>
            Ratings are community-based estimates. Meta evolves — check back after each major patch.
          </p>
        </main>

        {/* ── FOOTER ── */}
        <Footer dark={dark} />
      </div>

      {/* ── DOCK ── */}
      <Dock dark={dark} activePath="/tier-list" />
    </div>
  );
}