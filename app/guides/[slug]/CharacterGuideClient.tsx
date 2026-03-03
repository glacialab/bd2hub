// app/guides/[slug]/CharacterGuideClient.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import type { CharacterGuide } from "@/types/character-guide";

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────────────────────── */
const ELEMENT_COLORS: Record<string, string> = {
  Dark: "#a855f7", Light: "#f59e0b", Fire: "#ef4444",
  Wind: "#22c55e", Water: "#38bdf8", Earth: "#a78a2e",
};
const TIER_COLORS: Record<string, string> = {
  SS: "#f59e0b", S: "#a855f7", A: "#38bdf8", B: "#22c55e", C: "#94a3b8",
};
const PRIORITY_COLORS: Record<string, string> = {
  "BiS": "#f59e0b", "Strong Alt": "#38bdf8", "Budget": "#22c55e",
};
const NAV_LINKS = ["Tier List", "Characters", "Guides", "Banners", "Teams", "Tools"];
const DOCK_ITEMS = [
  { label: "Home",       icon: "🏠", href: "/" },
  { label: "Tier List",  icon: "📊", href: "/tier-list" },
  { label: "Characters", icon: "👤", href: "/characters" },
  { label: "Guides",     icon: "📖", href: "/guides" },
  { label: "Banners",    icon: "💎", href: "/banners" },
  { label: "Teams",      icon: "🎯", href: "/teams" },
  { label: "YouTube",    icon: "▶️", href: "https://youtube.com" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   SMALL SHARED COMPONENTS
───────────────────────────────────────────────────────────────────────────── */
function BorderBeam({ colorFrom, colorTo, duration = 8, size = 200 }: {
  colorFrom: string; colorTo: string; duration?: number; size?: number;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <motion.div className="absolute"
        style={{ width: size, height: size, borderRadius: "50%", background: `conic-gradient(from 0deg,transparent 75%,${colorFrom},${colorTo},transparent)`, filter: "blur(1px)", opacity: 0.6 }}
        animate={{ rotate: 360 }} transition={{ duration, repeat: Infinity, ease: "linear" }} />
    </div>
  );
}

function StarRating({ stars, color }: { stars: number; color: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="w-4 h-4" fill={i < stars ? color : "none"} stroke={color} strokeWidth={1.5}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ModeRatingBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-[11px] font-semibold text-neutral-400 truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/8 overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg,${color},${color}bb)` }}
          initial={{ width: 0 }} whileInView={{ width: `${value * 10}%` }} viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} />
      </div>
      <span className="w-5 shrink-0 text-right text-[11px] font-bold tabular-nums" style={{ color }}>{value}</span>
    </div>
  );
}

function SmoothCursor({ color }: { color: string }) {
  const cx = useMotionValue(-200); const cy = useMotionValue(-200);
  const sx = useSpring(cx, { stiffness: 420, damping: 36, mass: 0.55 });
  const sy = useSpring(cy, { stiffness: 420, damping: 36, mass: 0.55 });
  const [ptr, setPtr] = useState(false);
  useEffect(() => {
    const m = (e: MouseEvent) => {
      cx.set(e.clientX); cy.set(e.clientY);
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      setPtr(!!(el && getComputedStyle(el).cursor === "pointer"));
    };
    window.addEventListener("mousemove", m);
    return () => window.removeEventListener("mousemove", m);
  }, []);
  return (
    <motion.div style={{ x: sx, y: sy, translateX: "-2px", translateY: "-2px" }} className="pointer-events-none fixed top-0 left-0 z-[9999]">
      <motion.svg width="20" height="24" viewBox="0 0 20 24" fill="none"
        animate={{ rotate: ptr ? -12 : 0, scale: ptr ? 0.88 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
        <path d="M4 2L4 18L7.5 14.5L10.5 21L13 20L10 13.5L15 13.5L4 2Z"
          fill={ptr ? color : "white"} stroke={ptr ? color : "#0c0d15"} strokeWidth="1.2" />
      </motion.svg>
    </motion.div>
  );
}

function Dock({ dark }: { dark: boolean }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9900]">
      <div className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2 shadow-2xl backdrop-blur-2xl ${dark ? "bg-[#0c0d15]/90 border-white/10" : "bg-white/90 border-neutral-200"}`}>
        {DOCK_ITEMS.map((item) => (
          <a key={item.label} href={item.href} className={`group relative flex flex-col items-center justify-center rounded-xl p-2.5 transition-all cursor-pointer hover:-translate-y-1 ${dark ? "hover:bg-white/10" : "hover:bg-neutral-100"}`}>
            <span className="text-xl">{item.icon}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TABS
───────────────────────────────────────────────────────────────────────────── */
type Tab = "overview" | "costumes" | "weapons" | "teams" | "tips";
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview",  label: "Overview",         icon: "📖" },
  { id: "costumes",  label: "Costumes & Skills", icon: "👗" },
  { id: "weapons",   label: "Weapons & Gear",    icon: "⚔️" },
  { id: "teams",     label: "Team Comps",        icon: "🎯" },
  { id: "tips",      label: "Tips & Tricks",     icon: "💡" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN CLIENT COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function CharacterGuideClient({ char }: { char: CharacterGuide }) {
  const [dark, setDark] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [activeCostume, setActiveCostume] = useState(0);
  const [activeTeam, setActiveTeam] = useState(0);

  const c = char.color;
  const cAlt = char.colorAlt ?? char.color;
  const elementColor = ELEMENT_COLORS[char.element] ?? char.color;
  const tierColor = TIER_COLORS[char.tier] ?? "#888";
  const costume = char.costumes[activeCostume];
  const team = char.teams?.[activeTeam];

  // Theme helpers
  const bg    = dark ? "bg-[#08090f]"                   : "bg-neutral-50";
  const card  = dark ? "bg-neutral-900/80 border-white/8"   : "bg-white border-neutral-200";
  const muted = dark ? "text-neutral-400"                : "text-neutral-500";
  const head  = dark ? "text-white"                      : "text-neutral-900";
  const bdr   = dark ? "border-white/6"                  : "border-neutral-200";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`} style={{ fontFamily: "'Inter',sans-serif", cursor: "none" }}>
      <SmoothCursor color={c} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
        * { cursor: none !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${c}44; border-radius: 2px; }
      `}</style>

      {/* ── NAVBAR ── */}
      <header className={`sticky top-0 z-50 border-b ${bdr} backdrop-blur-2xl ${dark ? "bg-[#08090f]/85" : "bg-white/85"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <a href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-400 text-white text-xs font-black">⚔</div>
            <span className="font-extrabold tracking-tight text-sm" style={{ fontFamily: "'Sora',sans-serif" }}>BD2<span className="text-violet-500">Hub</span></span>
          </a>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <a key={l} href={`/${l.toLowerCase().replace(" ", "-")}`}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${l === "Guides" ? "bg-sky-500/15 text-sky-400" : dark ? "text-neutral-400 hover:text-white hover:bg-white/8" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"}`}>
                {l}
              </a>
            ))}
          </nav>
          <button onClick={() => setDark(!dark)} className={`rounded-xl border p-2.5 transition-all cursor-pointer ${dark ? "border-white/10 bg-white/5 text-neutral-400 hover:text-white" : "border-neutral-200 bg-neutral-100 text-neutral-600"}`}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              {dark ? <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                    : <><circle cx="12" cy="12" r="5" /><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2" fill="none" /></>}
            </svg>
          </button>
        </div>
      </header>

      {/* ── BREADCRUMB ── */}
      <div className="mx-auto max-w-7xl px-6 pt-5">
        <div className="flex items-center gap-2 text-xs font-medium">
          <a href="/" className={`cursor-pointer hover:text-violet-400 transition-colors ${muted}`}>Home</a>
          <span className={muted}>/</span>
          <a href="/guides" className={`cursor-pointer hover:text-violet-400 transition-colors ${muted}`}>Guides</a>
          <span className={muted}>/</span>
          <span className="font-semibold" style={{ color: c }}>{char.name}</span>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: 420 }}>
        {/* Animated background derived from character color */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0" style={{ background: dark ? `linear-gradient(135deg,#020817 0%,${c}08 40%,#071525 100%)` : `linear-gradient(135deg,#f8fafc 0%,${c}15 40%,#f0f9ff 100%)` }} />
          <motion.div className="absolute right-[8%] top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{ width: 500, height: 500, background: `radial-gradient(circle,${c}28 0%,${c}08 55%,transparent 70%)` }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute left-[5%] top-[20%] rounded-full pointer-events-none"
            style={{ width: 280, height: 280, background: `radial-gradient(circle,${c}15 0%,transparent 70%)` }}
            animate={{ scale: [1, 1.07, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
          {/* Element-themed floating particles */}
          {[...Array(10)].map((_, i) => (
            <motion.div key={i} className="absolute pointer-events-none text-xs select-none" style={{ color: c, left: `${5 + i * 9}%`, top: `${15 + (i % 3) * 25}%`, opacity: 0 }}
              animate={{ opacity: [0, 0.35, 0], y: [0, -25, -55], rotate: [0, 180, 360] }}
              transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}>✦</motion.div>
          ))}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg,rgba(0,0,0,0.012) 0px,rgba(0,0,0,0.012) 1px,transparent 1px,transparent 4px)" }} />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-14">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-10">

            {/* Portrait */}
            <motion.div initial={{ opacity: 0, x: -32, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="relative shrink-0 flex items-center justify-center"
              style={{ width: 190, height: 190, borderRadius: 22, background: `linear-gradient(145deg,${c}30 0%,${c}08 70%)`, border: `1px solid ${c}40`, boxShadow: `0 0 60px ${c}30,0 0 120px ${c}15` }}>
              <div className="absolute inset-0 opacity-[0.04] rounded-[inherit]" style={{ backgroundImage: "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)", backgroundSize: "16px 16px" }} />
              <motion.span className="text-[100px] select-none leading-none relative z-10" style={{ filter: `drop-shadow(0 0 28px ${c}80)` }}
                animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
                {char.emoji}
              </motion.span>
              <BorderBeam colorFrom={c} colorTo={cAlt} duration={6} size={170} />
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, type: "spring", stiffness: 280, damping: 24 }} className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border" style={{ color: c, borderColor: c + "50", background: c + "15" }}>Character Guide</span>
                {/* Element badge */}
                <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest"
                  style={{ background: elementColor + "20", border: `1px solid ${elementColor}50`, color: elementColor }}>{char.element}</span>
                {/* Tier badge */}
                <span className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black shrink-0"
                  style={{ background: tierColor + "20", border: `2px solid ${tierColor}`, color: tierColor }}>{char.tier}</span>
                <span className={`text-xs font-bold uppercase tracking-widest ${muted}`}>{char.archetype}</span>
              </div>

              <h1 className={`text-5xl md:text-6xl font-extrabold tracking-tight mb-1 ${head}`} style={{ fontFamily: "'Sora',sans-serif" }}>{char.name}</h1>
              {char.title && <p className="text-lg font-semibold mb-3" style={{ color: c }}>{char.title}</p>}
              <StarRating stars={char.stars} color={c} />

              <p className={`mt-4 text-sm leading-relaxed max-w-xl ${muted}`}>{char.overview.slice(0, 200)}…</p>

              {/* External links */}
              {char.externalLinks && char.externalLinks.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-5">
                  {char.externalLinks.map((link, li) => (
                    <a key={li} href={link.url} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold cursor-pointer transition-all ${li === 0 ? "text-white hover:brightness-110" : dark ? "border-white/10 text-neutral-300 hover:text-white hover:border-violet-400/50" : "border-neutral-300 text-neutral-700"}`}
                      style={li === 0 ? { background: `linear-gradient(135deg,${c},${cAlt})`, boxShadow: `0 4px 18px ${c}40`, border: "none" } : {}}>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Mode Ratings card */}
            <motion.div initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, type: "spring", stiffness: 280, damping: 24 }}
              className={`shrink-0 rounded-2xl border p-5 w-full md:w-56 ${card}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: c }}>Mode Ratings</p>
              <div className="flex flex-col gap-3">
                {Object.entries(char.modeRatings).map(([mode, val]) => (
                  <ModeRatingBar key={mode} label={mode} value={val} color={c} />
                ))}
              </div>
              <div className={`mt-4 pt-4 border-t ${bdr} flex items-center gap-2`}>
                <div className="text-2xl font-extrabold" style={{ color: c, fontFamily: "'Sora',sans-serif" }}>
                  {(Object.values(char.modeRatings).reduce((a, b) => a + b, 0) / Object.values(char.modeRatings).length).toFixed(1)}
                </div>
                <div><p className={`text-xs font-bold ${head}`}>Overall</p><p className={`text-[10px] ${muted}`}>avg. across modes</p></div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── STICKY TAB BAR ── */}
      <div className={`sticky top-[57px] z-40 border-b ${bdr} backdrop-blur-2xl ${dark ? "bg-[#08090f]/90" : "bg-white/90"}`}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {TABS.map(({ id, label, icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`relative shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${activeTab === id ? head : `${muted} hover:text-violet-400`}`}>
                <span>{icon}</span>{label}
                {activeTab === id && (
                  <motion.div layoutId="guide-tab-pill" className="absolute inset-0 rounded-xl -z-10"
                    style={{ background: c + "20", border: `1px solid ${c}40` }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          CONTENT PANELS
      ───────────────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-6 py-10 pb-40">
        <AnimatePresence mode="wait">

          {/* ══ OVERVIEW ══ */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left: lore + gameplay */}
              <div className="lg:col-span-2 flex flex-col gap-5">
                <div className={`rounded-2xl border p-6 ${card}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: c }}>Character Lore</p>
                  <p className={`text-sm leading-[1.85] ${muted}`}>{char.lore}</p>
                </div>

                <div className={`rounded-2xl border p-6 ${card}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: c }}>Gameplay Overview</p>
                  <p className={`text-sm leading-[1.85] ${muted}`}>{char.overview}</p>
                  {char.keyInsight && (
                    <div className={`mt-5 rounded-xl border p-4`} style={{ background: c + "08", borderColor: c + "25" }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: c }}>💡 Key Insight</p>
                      <p className={`text-xs leading-relaxed ${muted}`}>{char.keyInsight}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: stats + synergies + investment */}
              <div className="flex flex-col gap-4">
                <div className={`rounded-2xl border p-5 ${card}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: c }}>Character Info</p>
                  {[
                    ["Element",        char.element],
                    ["Archetype",      char.archetype],
                    ["Role",           char.archetype],
                    ["Rarity",         char.rarity],
                    ["Overall Tier",   char.tier],
                    ...(char.fhAppearance ? [["FH Appearance", char.fhAppearance]] : []),
                  ].map(([label, value]) => (
                    <div key={label} className={`flex items-center justify-between py-2.5 border-b ${bdr} last:border-0`}>
                      <span className={`text-xs font-medium ${muted}`}>{label}</span>
                      <span className={`text-xs font-bold ${head}`}>{value}</span>
                    </div>
                  ))}
                </div>

                {char.synergies && char.synergies.length > 0 && (
                  <div className={`rounded-2xl border p-5 ${card}`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: c }}>Best Paired With</p>
                    {char.synergies.map(({ name, note, emoji }) => (
                      <div key={name} className={`flex items-center gap-3 py-2.5 border-b ${bdr} last:border-0`}>
                        <span className="text-xl">{emoji}</span>
                        <div><p className={`text-xs font-bold ${head}`}>{name}</p><p className={`text-[10px] ${muted}`}>{note}</p></div>
                      </div>
                    ))}
                  </div>
                )}

                {char.investmentPriority !== undefined && (
                  <div className={`rounded-2xl border p-5 ${card}`} style={{ borderColor: c + "30" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: c }}>Investment Priority</p>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-2.5 flex-1 rounded-full overflow-hidden bg-white/8">
                        <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg,${c},${cAlt})` }}
                          initial={{ width: 0 }} whileInView={{ width: `${char.investmentPriority * 10}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }} />
                      </div>
                      <span className="text-sm font-extrabold" style={{ color: c }}>{char.investmentPriority}/10</span>
                    </div>
                    {char.investmentNote && <p className={`text-xs leading-relaxed ${muted}`}>{char.investmentNote}</p>}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ══ COSTUMES & SKILLS ══ */}
          {activeTab === "costumes" && (
            <motion.div key="costumes" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              {/* Costume selector */}
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                {char.costumes.map((cos, i) => {
                  const rc = cos.rarity === "Limited" ? "#f59e0b" : cos.rarity === "Upcoming" ? "#06b6d4" : "#64748b";
                  const isActive = activeCostume === i;
                  return (
                    <motion.button key={cos.id} whileHover={{ y: -3 }} onClick={() => setActiveCostume(i)}
                      className="relative shrink-0 flex flex-col items-center gap-2 rounded-xl border px-5 py-3 cursor-pointer transition-all"
                      style={{ borderColor: isActive ? cos.color + "80" : dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)", background: isActive ? cos.color + "18" : dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", boxShadow: isActive ? `0 0 20px ${cos.color}30` : undefined, minWidth: 88 }}>
                      <span className="text-3xl">{cos.emoji}</span>
                      <span className="text-[10px] font-bold text-center leading-tight max-w-[80px]" style={{ color: isActive ? cos.color : dark ? "#6b7280" : "#9ca3af" }}>{cos.name}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border" style={{ color: rc, borderColor: rc + "40", background: rc + "15" }}>{cos.rarity}</span>
                      {isActive && <motion.div layoutId="costume-dot" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ background: cos.color }} />}
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={costume.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  <div className="lg:col-span-2 flex flex-col gap-5">
                    {/* Costume detail card */}
                    <div className={`rounded-2xl border p-7 relative overflow-hidden ${card}`} style={{ borderColor: costume.color + "30" }}>
                      <div className="pointer-events-none absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px]" style={{ background: costume.color + "20", transform: "translate(30%,-30%)" }} />
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl" style={{ background: costume.color + "20", border: `1px solid ${costume.color}40` }}>{costume.emoji}</div>
                          <div>
                            <h2 className={`text-xl font-extrabold ${head}`} style={{ fontFamily: "'Sora',sans-serif" }}>{costume.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border" style={{ color: costume.color, borderColor: costume.color + "40", background: costume.color + "15" }}>{costume.rarity}</span>
                              {costume.spCost && <span className={`text-xs ${muted}`}>{costume.spCost}</span>}
                              {costume.cooldown && <span className={`text-xs ${muted}`}>· CD: {costume.cooldown}</span>}
                            </div>
                          </div>
                        </div>
                        <p className={`text-sm leading-[1.85] ${muted}`}>{costume.description}</p>
                      </div>
                      <BorderBeam colorFrom={costume.color} colorTo={c} duration={7} size={140} />
                    </div>

                    {/* Skills */}
                    {costume.skills && costume.skills.length > 0 && (
                      <div className={`rounded-2xl border p-6 ${card}`}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: c }}>Skills</p>
                        <div className="flex flex-col gap-3">
                          {costume.skills.map((skill, si) => {
                            // skills can be a string (from characters.json) or object (from guide JSON)
                            const skillName = typeof skill === "string" ? skill : skill.name;
                            const skillDesc = typeof skill === "string" ? null : skill.desc;
                            const skillTags = typeof skill === "string" ? [] : (skill.tags ?? []);
                            return (
                              <motion.div key={si} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: si * 0.08 }}
                                className={`rounded-xl border p-4 ${dark ? "bg-white/[0.02] border-white/6" : "bg-neutral-50 border-neutral-200"}`}>
                                <div className="flex items-start justify-between gap-3 mb-1.5">
                                  <p className={`text-sm font-bold ${head}`}>{skillName}</p>
                                  {skillTags.length > 0 && (
                                    <div className="flex gap-1.5 flex-wrap justify-end">
                                      {skillTags.map((tag) => <span key={tag} className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: c + "20", color: c }}>{tag}</span>)}
                                    </div>
                                  )}
                                </div>
                                {skillDesc && <p className={`text-xs leading-relaxed ${muted}`}>{skillDesc}</p>}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar: upgrade + tips */}
                  <div className="flex flex-col gap-4">
                    {costume.upgrade && (
                      <div className={`rounded-2xl border p-5 ${card}`}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: c }}>Upgrade Requirements</p>
                        {([["Minimum", costume.upgrade.min, "#22c55e"], ["Recommended (-1SP)", costume.upgrade.recommended, c], ["Ideal", costume.upgrade.ideal, "#f59e0b"]] as [string, string, string][]).map(([label, value, clr]) => (
                          <div key={label} className={`flex items-center justify-between py-3 border-b ${bdr} last:border-0`}>
                            <span className={`text-xs font-medium ${muted}`}>{label}</span>
                            <span className="text-sm font-extrabold px-3 py-0.5 rounded-lg" style={{ background: clr + "18", color: clr, border: `1px solid ${clr}35` }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {costume.tips && costume.tips.length > 0 && (
                      <div className={`rounded-2xl border p-5 ${card}`}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: c }}>Costume Tips</p>
                        <div className="flex flex-col gap-3">
                          {costume.tips.map((tip, ti) => (
                            <div key={ti} className={`flex gap-2.5 text-xs leading-relaxed ${muted}`}>
                              <span className="shrink-0 mt-0.5 font-bold" style={{ color: c }}>›</span><span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* ══ WEAPONS & GEAR ══ */}
          {activeTab === "weapons" && (
            <motion.div key="weapons" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <div className="lg:col-span-2">
                {char.weapons && char.weapons.length > 0 ? (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: c }}>Recommended Weapons</p>
                    <div className="flex flex-col gap-4">
                      {char.weapons.map((w, wi) => {
                        const pc = PRIORITY_COLORS[w.priority] ?? c;
                        return (
                          <motion.div key={wi} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: wi * 0.1 }}
                            className={`rounded-2xl border p-6 relative overflow-hidden ${card}`} style={{ borderColor: wi === 0 ? "#f59e0b33" : undefined }}>
                            {wi === 0 && <div className="pointer-events-none absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px]" style={{ background: "#f59e0b15", transform: "translate(20%,-20%)" }} />}
                            <div className="relative z-10">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className={`text-base font-extrabold ${head}`} style={{ fontFamily: "'Sora',sans-serif" }}>{w.name}</h3>
                                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: pc + "20", color: pc }}>{w.priority}</span>
                                {w.type && <span className={`text-xs ${muted}`}>{w.type}</span>}
                              </div>
                              {w.stats && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {w.stats.map((s) => <span key={s} className="text-[11px] font-bold px-2.5 py-1 rounded-lg" style={{ background: c + "18", color: c, border: `1px solid ${c}30` }}>{s}</span>)}
                                </div>
                              )}
                              {w.description && <p className={`text-xs leading-relaxed ${muted}`}>{w.description}</p>}
                            </div>
                            {wi === 0 && <BorderBeam colorFrom="#f59e0b" colorTo={c} duration={9} size={110} />}
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className={`rounded-2xl border p-8 text-center ${card}`}>
                    <p className={`text-2xl mb-2`}>⚔️</p>
                    <p className={`text-sm font-semibold ${head}`}>Weapon data coming soon</p>
                    <p className={`text-xs mt-1 ${muted}`}>This guide is being updated with weapon recommendations.</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {char.gear && char.gear.length > 0 && (
                  <div className={`rounded-2xl border p-5 ${card}`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: c }}>Gear Priority</p>
                    {char.gear.map((g, gi) => (
                      <div key={gi} className={`flex items-center gap-3 py-3 border-b ${bdr} last:border-0`}>
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-black" style={{ background: c + "20", color: c }}>{gi + 1}</span>
                        <div><p className={`text-xs font-bold ${head}`}>{g.slot}</p><p className={`text-[10px] ${muted}`}>{g.stat}</p></div>
                      </div>
                    ))}
                  </div>
                )}
                {char.statPriority && char.statPriority.length > 0 && (
                  <div className={`rounded-2xl border p-5`} style={{ background: c + "08", borderColor: c + "25" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: c }}>Stat Priority Order</p>
                    {char.statPriority.map((s, si) => (
                      <div key={s} className="flex items-center gap-2 py-1.5">
                        <span className="text-[10px] font-bold w-4" style={{ color: c }}>{si + 1}.</span>
                        <span className={`text-xs ${muted}`}>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
                {char.potentialUpgrades && char.potentialUpgrades.length > 0 && (
                  <div className={`rounded-2xl border p-5 ${card}`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: c }}>Potential Upgrades</p>
                    <div className={`text-xs leading-relaxed ${muted} space-y-2.5`}>
                      {char.potentialUpgrades.map((p, pi) => (
                        <p key={pi}><strong className={head}>{p.label}:</strong> {p.note}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ══ TEAMS ══ */}
          {activeTab === "teams" && (
            <motion.div key="teams" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              {char.teams && char.teams.length > 0 ? (
                <>
                  {/* Team selector */}
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {char.teams.map((t, ti) => (
                      <button key={ti} onClick={() => setActiveTeam(ti)}
                        className={`shrink-0 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all ${activeTeam === ti ? "" : `${muted} ${dark ? "border-white/8 hover:border-white/20" : "border-neutral-200"}`}`}
                        style={activeTeam === ti ? { borderColor: c + "60", background: c + "15", color: c } : {}}>
                        {t.mode}
                        {t.clearRate && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: activeTeam === ti ? c + "30" : dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>{t.clearRate}</span>}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {team && (
                      <motion.div key={activeTeam} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        <div className="lg:col-span-2 flex flex-col gap-5">
                          <div className={`rounded-2xl border p-6 ${card}`}>
                            <div className="flex items-start justify-between gap-4 mb-5">
                              <h3 className={`text-lg font-extrabold ${head}`} style={{ fontFamily: "'Sora',sans-serif" }}>{team.name}</h3>
                              {team.tags && <div className="flex gap-1.5 flex-wrap">{team.tags.map((tag) => <span key={tag} className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg" style={{ background: c + "18", color: c }}>{tag}</span>)}</div>}
                            </div>

                            {/* Members grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-5">
                              {team.members.map((m, mi) => (
                                <motion.div key={mi} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: mi * 0.07, type: "spring", stiffness: 300 }}
                                  className="flex flex-col items-center gap-2 rounded-xl border p-3"
                                  style={m.isCore ? { borderColor: m.color + "60", background: m.color + "12", boxShadow: `0 0 20px ${m.color}20` } : { borderColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)", background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                                  <div className="h-12 w-12 flex items-center justify-center rounded-xl text-3xl" style={{ background: m.color + "20", border: `1px solid ${m.color}35` }}>{m.emoji}</div>
                                  <p className={`text-[11px] font-bold text-center leading-tight ${head}`}>{m.name}</p>
                                  <p className={`text-[9px] text-center ${muted}`}>{m.role}</p>
                                  {m.isCore && <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full" style={{ background: m.color + "30", color: m.color }}>Core</span>}
                                </motion.div>
                              ))}
                            </div>

                            <p className={`text-sm leading-[1.8] ${muted}`}>{team.description}</p>
                          </div>

                          {/* Rotation */}
                          {team.rotation && team.rotation.length > 0 && (
                            <div className={`rounded-2xl border p-5`} style={{ background: c + "08", borderColor: c + "25" }}>
                              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: c }}>⚡ Turn Rotation</p>
                              {team.rotation.map(({ turn, action }) => (
                                <div key={turn} className="flex gap-3 items-start py-1.5">
                                  <span className="text-[10px] font-black uppercase shrink-0 mt-0.5 px-2 py-0.5 rounded-md" style={{ background: c + "25", color: c }}>{turn}</span>
                                  <span className={`text-xs leading-relaxed ${muted}`}>{action}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Sidebar */}
                        <div className="flex flex-col gap-4">
                          <div className={`rounded-2xl border p-5 ${card}`}>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: c }}>Team Roster</p>
                            {team.members.map((m, mi) => (
                              <div key={mi} className={`flex items-center gap-3 py-2.5 border-b ${bdr} last:border-0`}>
                                <span className="text-xl">{m.emoji}</span>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-bold ${head}`}>{m.name}</p>
                                  <p className={`text-[10px] ${muted} leading-tight truncate`}>{m.costume}</p>
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0" style={{ background: c + "18", color: c }}>{m.role}</span>
                              </div>
                            ))}
                          </div>

                          <div className={`rounded-2xl border p-5 ${card}`}>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: c }}>Chain Math</p>
                            <p className={`text-xs leading-relaxed ${muted}`}>Every 10 chains on a target adds 100% bonus damage to the next hit. Stack 60-100+ chains and your carry's hit becomes a 600-1000%+ multiplier on top of base damage.</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className={`rounded-2xl border p-8 text-center ${card}`}>
                  <p className="text-2xl mb-2">🎯</p>
                  <p className={`text-sm font-semibold ${head}`}>Team data coming soon</p>
                  <p className={`text-xs mt-1 ${muted}`}>Team compositions for this character are being researched.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ══ TIPS & TRICKS ══ */}
          {activeTab === "tips" && (
            <motion.div key="tips" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="max-w-4xl">
              {char.tips && char.tips.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    {char.tips.map((tip, ti) => (
                      <motion.div key={ti} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ti * 0.08 }}
                        className={`rounded-2xl border p-6 relative overflow-hidden group cursor-default ${card}`}
                        whileHover={{ y: -3, boxShadow: `0 12px 40px ${c}20` }}>
                        <div className="pointer-events-none absolute top-0 right-0 w-24 h-24 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: c + "25", transform: "translate(20%,-20%)" }} />
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-3"><span className="text-2xl">{tip.icon}</span><h3 className={`text-sm font-extrabold ${head}`}>{tip.title}</h3></div>
                          <p className={`text-sm leading-[1.8] ${muted}`}>{tip.body}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Benchmarks */}
                  {char.benchmarks && char.benchmarks.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                      className={`relative overflow-hidden rounded-2xl border p-6`} style={{ background: dark ? `linear-gradient(135deg,${c}10,#0c0d15)` : `linear-gradient(135deg,${c}10,white)`, borderColor: c + "25" }}>
                      <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px]" style={{ background: c + "15", transform: "translate(20%,-30%)" }} />
                      <div className="relative">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: c }}>🏆 Competitive Benchmarks</p>
                        <div className="grid grid-cols-3 gap-6">
                          {char.benchmarks.map(({ value, label }) => (
                            <div key={label} className="text-center">
                              <p className="text-2xl font-extrabold" style={{ color: c, fontFamily: "'Sora',sans-serif" }}>{value}</p>
                              <p className={`text-xs mt-1 leading-snug ${muted}`}>{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <BorderBeam colorFrom={c} colorTo={cAlt} duration={10} size={130} />
                    </motion.div>
                  )}
                </>
              ) : (
                <div className={`rounded-2xl border p-8 text-center ${card}`}>
                  <p className="text-2xl mb-2">💡</p>
                  <p className={`text-sm font-semibold ${head}`}>Tips coming soon</p>
                  <p className={`text-xs mt-1 ${muted}`}>Community tips for this character are being collected.</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── FOOTER ── */}
      <footer className={`border-t ${bdr} px-8 py-10`}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-400 text-white text-xs font-black">⚔</div>
            <span className="font-extrabold tracking-tight" style={{ fontFamily: "'Sora',sans-serif" }}>BD2<span className="text-violet-500">Hub</span></span>
          </div>
          <p className={`text-xs ${muted}`}>Fan-made · Not affiliated with Neowiz or Brown Dust 2</p>
          <div className="flex gap-5">{["YouTube", "GitHub", "Twitter"].map((l) => <a key={l} className={`text-xs font-medium hover:text-violet-400 transition-colors cursor-pointer ${muted}`}>{l}</a>)}</div>
        </div>
      </footer>

      <Dock dark={dark} />
      <div className="h-28" />
    </div>
  );
}