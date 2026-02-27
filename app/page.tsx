"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import _charactersData from "@/data/characters.json";
import _bossData from "@/data/boss.json";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES  (declared first so the JSON cast below can reference them)
───────────────────────────────────────────────────────────────────────────── */
interface BannerCharacter {
  id: number; name: string; costume: string;
  element: string; role: string; tier: string;
  banner: string; color: string; emoji: string;
}
interface Costume {
  id: string; name: string; rarity: string;
  emoji: string; color: string; description: string; skills: string[];
}
interface BossChar { name: string; image: string; color: string; tier: string; }
interface BossTeam { rank: number; name: string; clearRate: string; avgTurns: number; tags: string[]; chars: BossChar[]; description: string; }
interface Boss {
  name: string; subtitle: string; element: string; difficulty: string; difficultyColor: string;
  description: string; weaknesses: string[]; resistances: string[]; bgImage: string; accentColor: string;
  hotTeams: BossTeam[];
}

interface CharacterDetail {
  id: number; slug: string; name: string; stars: number; rank: string;
  element: string; archetype: string; color: string; emoji: string;
  lore: string; gameplay: string;
  modeRatings: Record<string, number>;
  costumes: Costume[];
}

/* ─────────────────────────────────────────────────────────────────────────────
   DATA — sourced from src/data/characters.json
───────────────────────────────────────────────────────────────────────────── */
const _cd = _charactersData as unknown as {
  bannerCharacters: BannerCharacter[];
  allCharacters:    BannerCharacter[];
  characterDetails: CharacterDetail[];
};
const BANNER_CHARACTERS: BannerCharacter[] = _cd.bannerCharacters ?? [];
const ALL_CHARACTERS:    BannerCharacter[] = _cd.allCharacters    ?? [];
const CHARACTER_DATA:    CharacterDetail[] = _cd.characterDetails ?? [];

const BOSS_FIGHT: Boss = (_bossData as unknown as { boss: Boss }).boss;

/* ─────────────────────────────────────────────────────────────────────────────
   STATIC DATA (UI-only, not from JSON)
───────────────────────────────────────────────────────────────────────────── */
const GUIDES = [
  { title: "Blade Complete Build Guide",    type: "Character", tag: "Updated", reads: "12.4k", date: "Feb 2025", icon: "⚔️" },
  { title: "Tower of Salvation F100 Clear", type: "Content",   tag: "New",     reads: "8.1k",  date: "Feb 2025", icon: "🗼" },
  { title: "Guild Raid Optimization Tips",  type: "Strategy",  tag: "Hot",     reads: "6.7k",  date: "Jan 2025", icon: "🏰" },
  { title: "Reroll Tier List 2025",         type: "Tier List", tag: "Updated", reads: "21k",   date: "Feb 2025", icon: "📋" },
  { title: "Mirror War Beginner's Path",    type: "PvP",       tag: "New",     reads: "4.9k",  date: "Feb 2025", icon: "⚔️" },
];

const STATS = [
  { label: "Characters",        value: 280,  suffix: "+" },
  { label: "Guides",            value: 140,  suffix: "+" },
  { label: "Community Members", value: 8500, suffix: "+" },
  { label: "Tier Lists",        value: 12,   suffix: ""  },
];

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

const MODE_LABELS: Record<string, string> = {
  mirrorWar:        "Mirror War",
  fiendHunter:      "Fiend Hunter",
  guildRaid:        "Guild Raid",
  towerOfSalvation: "Tower",
  lastNight:        "Last Night",
};

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

const ARCHETYPE_COLORS: Record<string, string> = {
  DPS: "#ef4444", "Sub-DPS": "#f97316", Tank: "#38bdf8",
  Healer: "#22c55e", Support: "#06b6d4", Buffer: "#a855f7",
  Mage: "#8b5cf6", Warrior: "#dc2626",
};

const RARITY_COLORS: Record<string, string> = {
  Limited: "#f59e0b", Standard: "#64748b", Upcoming: "#06b6d4",
};

const ELEMENT_ICONS: Record<string, React.ReactNode> = {
  Dark:  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>,
  Light: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="5"/><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2"/></svg>,
  Fire:  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2C9 7 6 9 6 13a6 6 0 0 0 12 0c0-4-3-6-3-9-1 2-2 3.5-2 5a2 2 0 1 1-4 0c0-3 3-5 3-7z"/></svg>,
  Wind:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>,
  Water: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2L6 12a6 6 0 1 0 12 0z"/></svg>,
  Earth: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/><path fill="none" stroke="white" strokeWidth="1" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z"/></svg>,
};

const BANNER_IDS = new Set(BANNER_CHARACTERS.map((c) => c.id));

/* ─────────────────────────────────────────────────────────────────────────────
   TOAST SYSTEM
───────────────────────────────────────────────────────────────────────────── */
type ToastType = "welcome" | "banner" | "info";
interface Toast { id: string; type: ToastType; title: string; body: string; emoji: string; accent: string; cta?: string; }

const TOAST_SEQUENCE: Omit<Toast, "id">[] = [
  { type: "welcome", emoji: "⚔️", title: "Welcome to BD2Hub!", body: "Your ultimate Brown Dust 2 community hub. Tier lists, guides & tools — all in one place.", accent: "#a855f7" },
  { type: "banner", emoji: "🔥", title: "Olivier drops tomorrow!", body: "The fan-favourite returns. Warm up those gems — full pull value analysis is live.", accent: "#f97316", cta: "View banner →" },
  { type: "info", emoji: "📊", title: "Tier list updated", body: "Post-patch rankings are in. Anastasia climbs to top 3 in Mirror War meta.", accent: "#38bdf8" },
];

function ToastItem({ toast, onDismiss, dark }: { toast: Toast; onDismiss: (id: string) => void; dark: boolean }) {
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!hovered) timerRef.current = setTimeout(() => onDismiss(toast.id), 5400);
    return () => clearTimeout(timerRef.current);
  }, [hovered, toast.id, onDismiss]);

  return (
    <motion.div layout initial={{ opacity: 0, x: 72, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 72, scale: 0.88, transition: { duration: 0.2 } }} transition={{ type: "spring", stiffness: 400, damping: 32 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className={`relative w-80 overflow-hidden rounded-2xl border shadow-2xl select-none ${dark ? "bg-[#0f1017]/95 border-white/10 backdrop-blur-2xl" : "bg-white/95 border-neutral-200 backdrop-blur-2xl"}`}
      style={{ boxShadow: `0 0 0 1px ${toast.accent}22, 0 24px 60px -8px ${toast.accent}28` }}>
      <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${toast.accent}, ${toast.accent}55, transparent)` }} />
      <div className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden rounded-b-2xl bg-white/5">
        <motion.div className="h-full origin-left" style={{ background: toast.accent + "70" }} initial={{ scaleX: 1 }} animate={!hovered ? { scaleX: 0 } : {}} transition={{ duration: 5.4, ease: "linear" }} />
      </div>
      <div className="flex items-start gap-3 p-4 pb-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: toast.accent + "18", border: `1px solid ${toast.accent}35` }}>{toast.emoji}</div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className={`text-sm font-bold leading-snug ${dark ? "text-white" : "text-neutral-900"}`}>{toast.title}</p>
          <p className={`mt-0.5 text-xs leading-relaxed ${dark ? "text-neutral-400" : "text-neutral-500"}`}>{toast.body}</p>
          {toast.cta && <button className="mt-2.5 rounded-lg px-3 py-1 text-[11px] font-bold cursor-pointer transition-all hover:brightness-110" style={{ background: toast.accent + "20", color: toast.accent, border: `1px solid ${toast.accent}40` }}>{toast.cta}</button>}
        </div>
        <button onClick={() => onDismiss(toast.id)} className={`mt-0.5 shrink-0 rounded-lg p-1 cursor-pointer transition-colors ${dark ? "text-neutral-600 hover:text-white hover:bg-white/10" : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>
      </div>
    </motion.div>
  );
}

function ToastProvider({ dark }: { dark: boolean }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const firedRef = useRef(false);
  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    if (typeof window !== "undefined" && sessionStorage.getItem("bd2hub-welcomed")) return;
    sessionStorage.setItem("bd2hub-welcomed", "1");
    const delays = [1200, 4500, 8000];
    const timers: ReturnType<typeof setTimeout>[] = [];
    TOAST_SEQUENCE.forEach((t, i) => {
      timers.push(setTimeout(() => setToasts((prev) => [...prev, { ...t, id: `toast-${i}-${Date.now()}` }]), delays[i]));
    });
    return () => timers.forEach(clearTimeout);
  }, []);
  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));
  return (
    <div className="fixed bottom-28 right-5 z-[9990] flex flex-col-reverse gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => <div key={toast.id} className="pointer-events-auto"><ToastItem toast={toast} onDismiss={dismiss} dark={dark} /></div>)}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SMOOTH CURSOR — Arrow + MagicUI Pointer hybrid
   • Spring-tracked arrow replaces the system cursor globally
   • On cursor:pointer elements → arrow tilts & tints violet,
     a MagicUI-style label chip appears above with the element text,
     and a soft radial glow halo blooms (slower spring = trailing effect)
───────────────────────────────────────────────────────────────────────────── */
function SmoothCursor() {
  const cx = useMotionValue(-200);
  const cy = useMotionValue(-200);
  // Fast spring for the arrow itself
  const sx = useSpring(cx, { stiffness: 420, damping: 36, mass: 0.55 });
  const sy = useSpring(cy, { stiffness: 420, damping: 36, mass: 0.55 });
  // Slower spring for the trailing halo (MagicUI Pointer feel)
  const hx = useSpring(cx, { stiffness: 180, damping: 26, mass: 0.9 });
  const hy = useSpring(cy, { stiffness: 180, damping: 26, mass: 0.9 });

  const [ptr, setPtr] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const m = (e: MouseEvent) => {
      cx.set(e.clientX);
      cy.set(e.clientY);
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const isPtr = !!(el && getComputedStyle(el).cursor === "pointer");
      setPtr(isPtr);
      if (isPtr && el) {
        const closest = el.closest("button,a,[role=button]") as HTMLElement | null;
        const raw =
          el.getAttribute("aria-label") ||
          el.getAttribute("title") ||
          closest?.getAttribute("aria-label") ||
          closest?.textContent?.trim().replace(/\s+/g, " ").slice(0, 24) ||
          "";
        setLabel(raw);
      } else {
        setLabel("");
      }
    };
    window.addEventListener("mousemove", m);
    return () => window.removeEventListener("mousemove", m);
  }, []);

  return (
    <>
      {/* ── Trailing halo (slower spring → lags behind = depth) ── */}
      <motion.div
        style={{ x: hx, y: hy, translateX: "-50%", translateY: "-50%" }}
        className="pointer-events-none fixed top-0 left-0 z-[9996]"
      >
        <AnimatePresence>
          {ptr && (
            <motion.div
              key="halo"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(109,40,217,0.30) 0%, rgba(109,40,217,0.07) 55%, transparent 100%)",
                filter: "blur(3px)",
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Arrow + label layer (fast spring) ── */}
      <motion.div
        style={{ x: sx, y: sy }}
        className="pointer-events-none fixed top-0 left-0 z-[9999]"
      >
        {/* Arrow SVG — tilts and tints on hover */}
        <motion.svg
          width="22" height="27" viewBox="0 0 22 27"
          fill="none" xmlns="http://www.w3.org/2000/svg"
          animate={{ scale: ptr ? 1.1 : 1, rotate: ptr ? -14 : 0, x: ptr ? -1 : 0, y: ptr ? -1 : 0 }}
          transition={{ type: "spring", stiffness: 440, damping: 28 }}
        >
          {/* Shadow */}
          <path d="M3 2.5L3 21L8.5 16L12.5 24L15.5 22.5L11.5 14.5L18.5 14.5L3 2.5Z"
            fill="rgba(0,0,0,0.20)" transform="translate(1,1.5)" />
          {/* Body */}
          <motion.path
            d="M3 2.5L3 21L8.5 16L12.5 24L15.5 22.5L11.5 14.5L18.5 14.5L3 2.5Z"
            animate={{ fill: ptr ? "#ede9fe" : "#ffffff" }}
            transition={{ duration: 0.16 }}
            stroke="#6d28d9" strokeWidth="1.6"
            strokeLinejoin="round" strokeLinecap="round"
          />
        </motion.svg>

        {/* ── MagicUI Pointer label chip ── */}
        <AnimatePresence>
          {ptr && label && (
            <motion.div
              key="chip"
              initial={{ opacity: 0, scale: 0.7, y: 8, x: -2 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: 8 }}
              transition={{ type: "spring", stiffness: 520, damping: 30 }}
              className="absolute left-5 top-0 flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
                color: "#fff",
                boxShadow: "0 4px 18px rgba(109,40,217,0.50), inset 0 0 0 1px rgba(255,255,255,0.14)",
                letterSpacing: "0.015em",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse shrink-0" />
              {label}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Ring fallback (when there is no label text) ── */}
        <AnimatePresence>
          {ptr && !label && (
            <motion.div
              key="ring"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.5, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.18 }}
              className="absolute -top-3 -left-3 h-11 w-11 rounded-full border-2 border-violet-500"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   BORDER BEAM
───────────────────────────────────────────────────────────────────────────── */
function BorderBeam({ size = 200, duration = 12, colorFrom = "#a855f7", colorTo = "#06b6d4" }: { size?: number; duration?: number; colorFrom?: string; colorTo?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <motion.div style={{ width: size, height: size, background: `conic-gradient(from 0deg, transparent 0%, ${colorFrom} 10%, ${colorTo} 20%, transparent 30%)`, offsetPath: `rect(0 auto auto 0 round 9999px)` }} animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration, repeat: Infinity, ease: "linear" }} className="absolute aspect-square" />
      <div className="absolute inset-[1px] rounded-[inherit] bg-[inherit]" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   AURORA TEXT
───────────────────────────────────────────────────────────────────────────── */
function AuroraText({ children, className = "", colors = ["#a855f7", "#06b6d4", "#f59e0b", "#8b5cf6"], speed = 1 }: { children: React.ReactNode; className?: string; colors?: string[]; speed?: number }) {
  return (
    <span className={`relative inline-block ${className}`} aria-label={typeof children === "string" ? children : undefined}
      style={{ backgroundImage: `linear-gradient(90deg, ${[...colors, ...colors].join(",")})`, backgroundSize: "300% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: `auroraShift ${3 / speed}s linear infinite` }}>
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NUMBER TICKER
───────────────────────────────────────────────────────────────────────────── */
function NumberTicker({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const dur = 1600, start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);
  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   HIGHLIGHTER
───────────────────────────────────────────────────────────────────────────── */
function Highlighter({ children, action = "highlight", color = "#a855f733" }: { children: React.ReactNode; action?: "highlight" | "underline"; color?: string }) {
  if (action === "underline") return <span className="relative inline-block">{children}<span className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full" style={{ background: color }} /></span>;
  return <mark className="relative rounded-sm px-0.5 not-italic" style={{ background: color, color: "inherit" }}>{children}</mark>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   MARQUEE
───────────────────────────────────────────────────────────────────────────── */
function Marquee({ children, reverse = false, pauseOnHover = true, className = "", gap = 16, duration = "30s" }: { children: React.ReactNode; reverse?: boolean; pauseOnHover?: boolean; className?: string; gap?: number; duration?: string }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const pause  = () => rowRef.current?.querySelectorAll<HTMLElement>(".mq-track").forEach(el => { el.style.animationPlayState = "paused"; });
  const resume = () => rowRef.current?.querySelectorAll<HTMLElement>(".mq-track").forEach(el => { el.style.animationPlayState = "running"; });
  return (
    <div ref={rowRef} className={`flex flex-row ${className}`} style={{ "--gap": `${gap}px`, "--duration": duration } as React.CSSProperties} onMouseEnter={pauseOnHover ? pause : undefined} onMouseLeave={pauseOnHover ? resume : undefined}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="mq-track flex shrink-0 gap-[var(--gap)] flex-row items-center" style={{ animation: `marqueeH var(--duration) linear infinite ${reverse ? "reverse" : "normal"}` }}>
          {children}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DOCK
───────────────────────────────────────────────────────────────────────────── */
function DockIcon({ item, mouseX, dark }: { item: typeof DOCK_ITEMS[0]; mouseX: ReturnType<typeof useMotionValue>; dark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = useSpring(1, { stiffness: 350, damping: 25 });
  const [label, setLabel] = useState(false);
  useEffect(() => mouseX.on("change", (mx: number) => {
    if (!ref.current) return;
    const { left, width } = ref.current.getBoundingClientRect();
    const dist = Math.abs(mx - (left + width / 2));
    scale.set(dist < 80 ? 1 + (1 - dist / 80) * 0.6 : 1);
  }), [mouseX]);
  return (
    <motion.div ref={ref} style={{ scale }} className="relative flex flex-col items-center origin-bottom">
      <AnimatePresence>
        {label && <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className={`absolute -top-9 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium shadow-lg pointer-events-none ${dark ? "bg-neutral-800 text-white border border-white/10" : "bg-white text-neutral-800 border border-neutral-200 shadow-sm"}`}>{item.label}</motion.div>}
      </AnimatePresence>
      <motion.button onMouseEnter={() => setLabel(true)} onMouseLeave={() => setLabel(false)} onClick={() => item.href && (window.location.href = item.href)}
        className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl text-xl transition-colors ${dark ? "bg-white/10 hover:bg-white/20 border border-white/10" : "bg-neutral-100 hover:bg-neutral-200 border border-neutral-200"}`}>
        {item.icon}
      </motion.button>
    </motion.div>
  );
}

function Dock({ items, dark }: { items: typeof DOCK_ITEMS; dark: boolean }) {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.div onMouseMove={(e) => mouseX.set(e.clientX)} onMouseLeave={() => mouseX.set(Infinity)}
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-end gap-2 rounded-2xl px-4 py-3 backdrop-blur-xl w-fit ${dark ? "bg-neutral-900/80 border border-white/10" : "bg-white/80 border border-neutral-200 shadow-xl"}`}>
      {items.map((item) => <DockIcon key={item.label} item={item} mouseX={mouseX} dark={dark} />)}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATED THEME TOGGLER
───────────────────────────────────────────────────────────────────────────── */
function AnimatedThemeToggler({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`relative h-8 w-14 rounded-full border transition-colors duration-300 cursor-pointer ${dark ? "bg-violet-600 border-violet-500" : "bg-neutral-200 border-neutral-300"}`} aria-label="Toggle theme">
      <motion.div animate={{ x: dark ? 24 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 35 }} className="absolute top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm text-sm">
        {dark ? "🌙" : "☀️"}
      </motion.div>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TEXT ANIMATE
───────────────────────────────────────────────────────────────────────────── */
function TextAnimate({ children, delay = 0, className = "", by = "word" }: { children: string; delay?: number; className?: string; by?: "word" | "character" }) {
  const units = by === "word" ? children.split(" ") : children.split("");
  return (
    <span className={`inline ${className}`} aria-label={children}>
      {units.map((unit, i) => (
        <motion.span key={i} className="inline-block" initial={{ opacity: 0, filter: "blur(8px)", y: 12 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} transition={{ duration: 0.35, delay: delay + i * (by === "word" ? 0.06 : 0.03), ease: [0.22, 1, 0.36, 1] }}>
          {unit}{by === "word" ? "\u00a0" : ""}
        </motion.span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   STAR RATING
───────────────────────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────────────────────
   ELEMENT & TIER BADGES
───────────────────────────────────────────────────────────────────────────── */
function ElementBadge({ element }: { element: string }) {
  const c = ELEMENT_COLORS[element] || "#888";
  return <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ background: c + "20", border: `1px solid ${c}50`, color: c }}>{ELEMENT_ICONS[element]}{element}</span>;
}

function TierBadge({ tier }: { tier: string }) {
  const c = TIER_COLORS[tier] || "#888";
  return <span className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black shrink-0" style={{ background: c + "20", border: `2px solid ${c}`, color: c }}>{tier}</span>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   CHARACTER CARD (banner marquee row)
───────────────────────────────────────────────────────────────────────────── */
function CharacterCard({ char, dark, onOpen }: { char: BannerCharacter; dark: boolean; onOpen: (id: number) => void }) {
  return (
    <motion.div whileHover={{ y: -6, scale: 1.04 }} transition={{ type: "spring", stiffness: 400, damping: 22 }} onClick={() => onOpen(char.id)}
      className={`relative mx-2 w-60 shrink-0 overflow-hidden rounded-xl border p-4 cursor-pointer group ${dark ? "bg-neutral-900 border-white/8 hover:border-violet-500/50" : "bg-white border-neutral-200 hover:border-violet-300 shadow-sm hover:shadow-xl"}`}
      style={{ boxShadow: undefined }}>
      {/* Glow on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" style={{ boxShadow: `inset 0 0 30px ${char.color}18` }} />
      <div className="mb-3 flex h-36 items-center justify-center rounded-lg text-7xl relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${char.color}22, ${char.color}06)`, border: `1px solid ${char.color}30` }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`, backgroundSize: "16px 16px" }} />
        <span className="relative z-10 drop-shadow-lg" style={{ filter: `drop-shadow(0 0 16px ${char.color}50)` }}>{char.emoji}</span>
      </div>
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className={`font-bold tracking-tight text-sm ${dark ? "text-white" : "text-neutral-900"}`}>{char.name}</p>
        <TierBadge tier={char.tier} />
      </div>
      <p className={`text-[11px] mb-2.5 ${dark ? "text-neutral-500" : "text-neutral-400"}`}>{char.costume}</p>
      <ElementBadge element={char.element} />
      {(char.banner === "Limited" || char.banner === "Upcoming") && (
        <span className={`absolute top-3 right-3 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${char.banner === "Limited" ? "bg-amber-500/15 border-amber-500/30 text-amber-500" : "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"}`}>
          {char.banner === "Limited" ? "Limited" : "Soon"}
        </span>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CHARACTER PILL (all-characters marquee rows)
───────────────────────────────────────────────────────────────────────────── */
function CharacterPill({ char, dark, onOpen }: { char: BannerCharacter; dark: boolean; onOpen: (id: number) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="relative shrink-0 mx-2" style={{ width: 260, height: 92 }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => onOpen(char.id)}>
      <motion.div animate={{ y: hovered ? -6 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute inset-0 flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer ${dark ? "bg-neutral-900 border-white/8" : "bg-white border-neutral-200 shadow-sm"}`}
        style={{ borderColor: hovered ? (dark ? char.color + "60" : char.color + "50") : undefined, boxShadow: hovered ? `0 8px 28px -4px ${char.color}40` : undefined, transition: "border-color 0.15s, box-shadow 0.15s" }}>
        <div className="flex h-14 w-14 items-center justify-center rounded-lg text-[32px] shrink-0" style={{ background: `linear-gradient(135deg, ${char.color}25, ${char.color}08)`, border: `1px solid ${char.color}35` }}>{char.emoji}</div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-bold leading-tight truncate ${dark ? "text-white" : "text-neutral-900"}`}>{char.name}</p>
          <p className={`text-[11px] truncate mt-0.5 ${dark ? "text-neutral-500" : "text-neutral-400"}`}>{char.costume}</p>
          <div className="mt-1.5"><ElementBadge element={char.element} /></div>
        </div>
        <TierBadge tier={char.tier} />
        {char.banner === "Limited" && <span className="absolute -top-1.5 -right-1 rounded-md bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-500 uppercase">L</span>}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   BOSS FIGHT SECTION
───────────────────────────────────────────────────────────────────────────── */
function BossSection({ dark }: { dark: boolean }) {
  const [activeTeam, setActiveTeam] = useState(0);
  const boss = BOSS_FIGHT;
  const team = boss.hotTeams[activeTeam];

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: 860 }}>

      {/* ── Full-bleed background ── */}
      <div className="absolute inset-0 z-0">
        {/* Boss background image */}
        <div className="absolute inset-0" style={{ backgroundImage: `url(${boss.bgImage})`, backgroundSize: "cover", backgroundPosition: "center top" }} />
        {/* Heavy left overlay for text legibility, lightens toward right to show bg art */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(105deg, rgba(6,4,14,0.97) 0%, rgba(12,6,28,0.92) 35%, rgba(18,8,40,0.72) 58%, rgba(8,5,20,0.45) 100%)" }} />
        {/* Top/bottom vignette */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 25%, transparent 72%, rgba(0,0,0,0.60) 100%)" }} />
        {/* Pulsing violet glow behind boss art zone */}
        <motion.div className="absolute right-[4%] top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{ width: 680, height: 680, background: "radial-gradient(circle, rgba(168,85,247,0.20) 0%, rgba(109,40,217,0.09) 42%, transparent 70%)" }}
          animate={{ scale: [1, 1.07, 1], opacity: [0.45, 0.85, 0.45] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Particle streaks */}
        {[...Array(10)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full pointer-events-none"
            style={{
              width: 1.5,
              height: 36 + (i * 8) % 52,
              background: `linear-gradient(180deg, ${i % 2 === 0 ? "#a855f7" : "#ef4444"}88, transparent)`,
              left: `${7 + i * 9}%`,
              top: `${14 + (i % 4) * 17}%`,
            }}
            animate={{ y: [0, 55, 0], opacity: [0, 0.55, 0] }}
            transition={{ duration: 2.6 + i * 0.38, repeat: Infinity, delay: i * 0.27, ease: "easeInOut" }}
          />
        ))}
        {/* Fine scan-line texture */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.022) 0px, rgba(0,0,0,0.022) 1px, transparent 1px, transparent 4px)" }} />
      </div>

      {/* ── Content ── */}
      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 py-20 md:py-28 lg:py-36">
        <div className="flex flex-col gap-14 lg:grid lg:grid-cols-2 lg:gap-20 items-start">

          {/* ═══════════════════════════════
              LEFT — Boss identity
          ═══════════════════════════════ */}
          <div className="w-full">

            {/* Eyebrow */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.48 }}
              className="mb-7 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-red-400">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                World Boss
              </span>
              <span className="h-px w-8" style={{ background: "rgba(239,68,68,0.45)" }} />
              <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border"
                style={{ background: boss.difficultyColor + "22", borderColor: boss.difficultyColor + "55", color: boss.difficultyColor }}>
                {boss.difficulty}
              </span>
              <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-purple-500/30 bg-purple-500/10 text-purple-400">
                {boss.element}
              </span>
            </motion.div>

            {/* Boss name — big */}
            <motion.h2 initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.07 }}
              className="text-5xl sm:text-6xl lg:text-[4.5rem] xl:text-8xl font-extrabold tracking-tight leading-[0.93] text-white"
              style={{ fontFamily: "'Sora',sans-serif", textShadow: "0 0 70px rgba(168,85,247,0.55), 0 4px 8px rgba(0,0,0,0.9)" }}>
              {boss.name}
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
              className="mt-3 text-sm font-semibold tracking-[0.22em] text-purple-400 uppercase">
              {boss.subtitle}
            </motion.p>

            {/* Description — larger text */}
            <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.21 }}
              className="mt-7 text-base leading-[1.75] text-neutral-300 max-w-lg">
              {boss.description}
            </motion.p>

            {/* Weakness / Resistance */}
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.28 }}
              className="mt-9 flex flex-wrap gap-7">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-3">Weak to</p>
                <div className="flex gap-2 flex-wrap">
                  {boss.weaknesses.map((el) => {
                    const c = ELEMENT_COLORS[el] || "#888";
                    return (
                      <span key={el} className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold border"
                        style={{ background: c + "22", borderColor: c + "55", color: c }}>
                        {ELEMENT_ICONS[el]}{el}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-3">Resists</p>
                <div className="flex gap-2 flex-wrap">
                  {boss.resistances.map((el) => (
                    <span key={el} className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold border"
                      style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "#6b7280" }}>
                      {ELEMENT_ICONS[el]}{el}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.35 }}
              className="mt-10 flex flex-wrap gap-3">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-xl px-7 py-4 text-sm font-bold text-white cursor-pointer"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 12px 36px rgba(124,58,237,0.52)" }}>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                </svg>
                Full Boss Guide
              </motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-xl border px-7 py-4 text-sm font-semibold cursor-pointer"
                style={{ borderColor: "rgba(168,85,247,0.4)", color: "#d8b4fe", background: "rgba(168,85,247,0.09)" }}>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                View All Teams
              </motion.button>
            </motion.div>
          </div>

          {/* ═══════════════════════════════
              RIGHT — Hot Teams panel
          ═══════════════════════════════ */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.12 }}
            className="w-full">

            {/* Panel header */}
            <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-amber-400 mb-1">🔥 Meta Teams</p>
                <h3 className="text-2xl font-extrabold text-white" style={{ fontFamily: "'Sora',sans-serif" }}>
                  Hot Teams vs <span className="text-purple-300">{boss.name}</span>
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-neutral-500 shrink-0 mb-0.5">Updated Feb 2025</span>
            </div>

            {/* Team selector tabs */}
            <div className="flex gap-2 mb-6">
              {boss.hotTeams.map((t, i) => (
                <button key={i} onClick={() => setActiveTeam(i)}
                  className="relative flex-1 rounded-xl border py-3 px-2 text-xs font-bold cursor-pointer transition-all"
                  style={{
                    borderColor: activeTeam === i ? "rgba(168,85,247,0.65)" : "rgba(255,255,255,0.08)",
                    background: activeTeam === i ? "rgba(168,85,247,0.16)" : "rgba(255,255,255,0.03)",
                    color: activeTeam === i ? "#d8b4fe" : "#6b7280",
                  }}>
                  <span className="block text-[10px] font-black text-amber-400">#{t.rank}</span>
                  <span className="block truncate mt-0.5">{t.name}</span>
                  {activeTeam === i && (
                    <motion.div layoutId="team-active-bar" className="absolute bottom-0 inset-x-4 h-[2px] rounded-full"
                      style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7)" }} />
                  )}
                </button>
              ))}
            </div>

            {/* Active team card */}
            <AnimatePresence mode="wait">
              <motion.div key={activeTeam}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
                className="rounded-2xl border p-5 sm:p-7"
                style={{
                  background: "linear-gradient(150deg, rgba(109,40,217,0.15) 0%, rgba(16,8,36,0.60) 55%, rgba(255,255,255,0.02) 100%)",
                  borderColor: "rgba(168,85,247,0.28)",
                  boxShadow: "0 0 0 1px rgba(168,85,247,0.10), 0 28px 72px rgba(0,0,0,0.60)",
                  backdropFilter: "blur(14px)",
                }}>

                {/* Stats strip */}
                <div className="flex items-center gap-5 mb-7 pb-6 border-b border-white/[0.07] flex-wrap sm:flex-nowrap">
                  <div className="text-center shrink-0">
                    <p className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Sora',sans-serif" }}>{team.clearRate}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mt-1">Clear Rate</p>
                  </div>
                  <div className="h-12 w-px shrink-0 hidden sm:block" style={{ background: "rgba(255,255,255,0.07)" }} />
                  <div className="text-center shrink-0">
                    <p className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Sora',sans-serif" }}>{team.avgTurns}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mt-1">Avg Turns</p>
                  </div>
                  <div className="h-12 w-px shrink-0 hidden sm:block" style={{ background: "rgba(255,255,255,0.07)" }} />
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {team.tags.map((tag) => (
                      <span key={tag} className="rounded-full px-3 py-1.5 text-[10px] font-bold"
                        style={{ background: "rgba(168,85,247,0.18)", color: "#c4b5fd", border: "1px solid rgba(168,85,247,0.32)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ── 5 Character portraits in a row ── */}
                <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-7">
                  {team.chars.map((char, ci) => (
                    <motion.div key={char.name}
                      initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: ci * 0.07, type: "spring", stiffness: 360, damping: 26 }}
                      className="flex flex-col items-center gap-2">

                      {/* Portrait */}
                      <div className="relative w-full group cursor-pointer" style={{ aspectRatio: "2/3" }}>
                        {/* Hover glow ring */}
                        <div className="absolute -inset-[2px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                          style={{ boxShadow: `0 0 0 2px ${char.color}, 0 0 28px ${char.color}55` }} />

                        {/* Image container */}
                        <div className="relative w-full h-full rounded-xl overflow-hidden"
                          style={{
                            background: `linear-gradient(170deg, ${char.color}28, ${char.color}06)`,
                            border: `1.5px solid ${char.color}42`,
                            boxShadow: `0 8px 28px ${char.color}20`,
                          }}>
                          <img src={char.image} alt={char.name}
                            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.06]" />
                          {/* Bottom gradient name strip */}
                          <div className="absolute bottom-0 inset-x-0 h-2/5 pointer-events-none"
                            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)" }} />
                        </div>

                        {/* Tier badge — top right */}
                        <span className="absolute -top-2 -right-2 z-20 flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-black shadow-lg"
                          style={{
                            background: TIER_COLORS[char.tier] + "28",
                            border: `2px solid ${TIER_COLORS[char.tier]}85`,
                            color: TIER_COLORS[char.tier],
                            boxShadow: `0 0 12px ${TIER_COLORS[char.tier]}45`,
                          }}>
                          {char.tier}
                        </span>
                      </div>

                      {/* Name */}
                      <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-300 text-center leading-tight w-full truncate px-0.5" title={char.name}>
                        {char.name}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Team description */}
                <p className="text-sm leading-relaxed text-neutral-400 mb-6">{team.description}</p>

                {/* CTA button */}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full rounded-xl py-3.5 text-sm font-bold cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    background: "rgba(124,58,237,0.18)",
                    border: "1px solid rgba(124,58,237,0.45)",
                    color: "#c4b5fd",
                  }}>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                  Open in Team Builder →
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MODE RATING BAR
───────────────────────────────────────────────────────────────────────────── */
function ModeRatingBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-[11px] font-semibold text-neutral-400 truncate">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${value * 10}%` }} transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} />
      </div>
      <span className="w-6 shrink-0 text-right text-[11px] font-bold tabular-nums" style={{ color }}>{value}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CHARACTER MODAL — greatly enhanced
───────────────────────────────────────────────────────────────────────────── */
type ModalTab = "lore" | "gameplay" | "ratings" | "costume";

function CharacterModal({ char, dark, onClose }: { char: CharacterDetail; dark: boolean; onClose: () => void }) {
  const [costumeIdx, setCostumeIdx] = useState(0);
  const [tab, setTab] = useState<ModalTab>("lore");
  const [animKey, setAnimKey] = useState(0);

  const costume = char.costumes[costumeIdx];
  const ec = ELEMENT_COLORS[char.element] || "#888";
  const tc = TIER_COLORS[char.rank] || "#888";
  const ac = ARCHETYPE_COLORS[char.archetype] || "#888";
  const rc = RARITY_COLORS[costume.rarity] || "#888";
  const isOnBanner = BANNER_IDS.has(char.id);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const switchCostume = (idx: number) => { setCostumeIdx(idx); setAnimKey((k) => k + 1); setTab("costume"); };

  const TABS: { id: ModalTab; label: string; icon: string }[] = [
    { id: "lore",     label: "Lore",     icon: "📖" },
    { id: "gameplay", label: "Gameplay", icon: "⚔️" },
    { id: "ratings",  label: "Ratings",  icon: "📊" },
    { id: "costume",  label: "Costume",  icon: "👗" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[9980] flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-blur-xl" style={{ background: dark ? "rgba(4,5,10,0.88)" : "rgba(0,0,0,0.55)" }} />

      {/* Modal panel — wider, radius 5px as requested */}
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 32 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 32 }} transition={{ type: "spring", stiffness: 360, damping: 30 }} onClick={(e) => e.stopPropagation()}
        className={`relative flex w-full max-w-5xl flex-col overflow-hidden border shadow-2xl ${dark ? "bg-[#0c0d15] border-white/8" : "bg-white border-neutral-200/80"}`}
        style={{ borderRadius: 5, height: "88vh", maxHeight: "88vh", boxShadow: `0 0 0 1px ${char.color}22, 0 40px 100px -16px ${char.color}40, 0 24px 48px -8px rgba(0,0,0,0.6)` }}>

        {/* ── Top accent bar ── */}
        <div className="absolute inset-x-0 top-0 h-[3px] z-20" style={{ background: `linear-gradient(90deg, ${char.color}, ${char.color}88, ${ec}55, transparent)` }} />

        {/* ── Ambient glow ── */}
        <div className="pointer-events-none absolute top-0 right-0 h-[500px] w-[500px] rounded-full blur-[130px] z-0" style={{ background: char.color, opacity: dark ? 0.08 : 0.05, transform: "translate(40%,-40%)" }} />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full blur-[100px] z-0" style={{ background: ec, opacity: dark ? 0.05 : 0.03, transform: "translate(-40%,40%)" }} />

        {/* ════════════════════════════════════════════════════
            HERO HEADER — full-width, two columns
        ════════════════════════════════════════════════════ */}
        <div className="relative z-10 flex shrink-0 overflow-hidden" style={{ minHeight: 300, borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>

          {/* Left — Art panel */}
          <AnimatePresence mode="wait">
            <motion.div key={`art-${costumeIdx}`} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex shrink-0 flex-col items-center justify-center gap-4 p-8"
              style={{ width: 260, background: `linear-gradient(145deg, ${costume.color}22 0%, ${costume.color}06 60%, transparent 100%)`, borderRight: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(${dark ? "white" : "black"} 1px, transparent 1px), linear-gradient(90deg, ${dark ? "white" : "black"} 1px, transparent 1px)`, backgroundSize: "20px 20px" }} />

              {/* Emoji / art */}
              <motion.div key={`emoji-${costumeIdx}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 280, damping: 20, delay: 0.08 }}
                className="relative text-[120px] select-none leading-none" style={{ filter: `drop-shadow(0 0 40px ${costume.color}70)` }}>
                {costume.emoji}
              </motion.div>

              {/* Rarity pill */}
              <span className="relative z-10 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest border" style={{ background: rc + "18", color: rc, borderColor: rc + "40" }}>
                {costume.rarity}
              </span>

              {isOnBanner && (
                <span className="absolute top-4 left-4 rounded-lg bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  On Banner
                </span>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Right — Info */}
          <div className="relative z-10 flex flex-1 flex-col justify-between p-7 min-w-0">
            {/* Top row: name + close */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <TextAnimate key={`name-${costumeIdx}`} className={`text-4xl font-extrabold tracking-tight leading-tight ${dark ? "text-white" : "text-neutral-900"}`} by="character" delay={0.04}>
                    {char.name}
                  </TextAnimate>
                  <motion.p key={`cname-${costumeIdx}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className={`mt-1 text-base font-medium ${dark ? "text-neutral-400" : "text-neutral-500"}`}>
                    {costume.name}
                  </motion.p>
                </div>
                <button onClick={onClose} className={`shrink-0 cursor-pointer rounded-xl p-2.5 transition-all mt-0.5 ${dark ? "text-neutral-500 hover:text-white hover:bg-white/8 border border-white/8" : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 border border-neutral-200"}`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                </button>
              </div>

              {/* Badges row */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="flex flex-wrap items-center gap-2 mb-5">
                <StarRating stars={char.stars} color={tc} />
                <span className="flex items-center justify-center h-7 px-3 rounded-lg text-xs font-black border" style={{ background: tc + "20", borderColor: tc + "50", color: tc }}>{char.rank}</span>
                <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border" style={{ background: ec + "18", borderColor: ec + "40", color: ec }}>{ELEMENT_ICONS[char.element]}{char.element}</span>
                <span className="flex items-center rounded-full px-3 py-1 text-xs font-bold border" style={{ background: ac + "18", borderColor: ac + "40", color: ac }}>{char.archetype}</span>
              </motion.div>

              {/* Skills */}
              <motion.div key={`skills-${costumeIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.24 }}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${dark ? "text-neutral-600" : "text-neutral-400"}`}>Active Skills</p>
                <div className="flex flex-wrap gap-2">
                  {costume.skills.map((skill, si) => (
                    <motion.span key={skill} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.28 + si * 0.06 }}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border ${dark ? "bg-white/5 border-white/10 text-neutral-300" : "bg-neutral-50 border-neutral-200 text-neutral-700"}`}>
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: char.color }} />
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Costume quick switcher (if multiple) */}
            {char.costumes.length > 1 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="mt-5">
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${dark ? "text-neutral-600" : "text-neutral-400"}`}>Costumes ({char.costumes.length})</p>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {char.costumes.map((c, idx) => {
                    const rc2 = RARITY_COLORS[c.rarity] || "#888";
                    const active = idx === costumeIdx;
                    return (
                      <motion.button key={c.id} whileHover={{ y: -2 }} onClick={() => switchCostume(idx)}
                        className="relative shrink-0 flex flex-col items-center gap-1 rounded-xl border px-3 py-2 cursor-pointer transition-all"
                        style={{ borderColor: active ? char.color + "80" : dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)", background: active ? char.color + "18" : dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", boxShadow: active ? `0 0 16px ${char.color}35` : undefined, minWidth: 64 }}>
                        <span className="text-2xl">{c.emoji}</span>
                        <span className="text-[9px] font-bold text-center max-w-[64px] truncate leading-tight" style={{ color: active ? char.color : dark ? "#6b7280" : "#9ca3af" }}>{c.name}</span>
                        <span className="text-[8px] font-bold uppercase" style={{ color: rc2 }}>{c.rarity}</span>
                        {active && <motion.div layoutId="costume-dot" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ background: char.color }} />}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            BODY — tab bar + content
        ════════════════════════════════════════════════════ */}
        <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
          {/* Tab bar */}
          <div className={`flex gap-1 px-6 pt-4 pb-3 shrink-0 ${dark ? "bg-[#0c0d15]" : "bg-white"}`} style={{ borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}` }}>
            {TABS.map(({ id, label, icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`relative cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition-all flex items-center gap-1.5 ${tab === id ? dark ? "text-white" : "text-neutral-900" : dark ? "text-neutral-500 hover:text-neutral-300" : "text-neutral-400 hover:text-neutral-600"}`}>
                <span className="text-base">{icon}</span>
                {label}
                {tab === id && (
                  <motion.div layoutId="modal-tab-pill" className="absolute inset-0 rounded-xl -z-10" style={{ background: char.color + "20", border: `1px solid ${char.color}35` }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-7 py-6">
            <AnimatePresence mode="wait">
              {tab === "ratings" ? (
                <motion.div key="ratings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-5 ${dark ? "text-neutral-500" : "text-neutral-400"}`}>Performance by Game Mode</p>
                  <div className="flex flex-col gap-3.5">
                    {Object.entries(char.modeRatings).map(([mode, val]) => (
                      <ModeRatingBar key={mode} label={MODE_LABELS[mode] || mode} value={val} color={char.color} />
                    ))}
                  </div>
                  {/* Overall score */}
                  <div className={`mt-6 flex items-center gap-3 rounded-2xl border p-4 ${dark ? "bg-white/[0.03] border-white/8" : "bg-neutral-50 border-neutral-200"}`}>
                    <div className="text-3xl font-extrabold" style={{ color: char.color, fontFamily: "'Sora',sans-serif" }}>
                      {(Object.values(char.modeRatings).reduce((a, b) => a + b, 0) / Object.values(char.modeRatings).length).toFixed(1)}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${dark ? "text-white" : "text-neutral-900"}`}>Overall Rating</p>
                      <p className={`text-xs ${dark ? "text-neutral-500" : "text-neutral-400"}`}>Average across all modes</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key={`${tab}-${animKey}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
                  {tab === "costume" && (
                    <div className={`mb-5 flex items-center gap-3 rounded-xl border p-4 ${dark ? "bg-white/[0.03] border-white/8" : "bg-neutral-50 border-neutral-200"}`}>
                      <span className="text-3xl">{costume.emoji}</span>
                      <div>
                        <p className={`font-bold text-sm ${dark ? "text-white" : "text-neutral-900"}`}>{costume.name}</p>
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border mt-1 inline-block" style={{ background: rc + "18", color: rc, borderColor: rc + "40" }}>{costume.rarity}</span>
                      </div>
                    </div>
                  )}
                  <TextAnimate className={`text-sm leading-[1.85] ${dark ? "text-neutral-300" : "text-neutral-600"}`} by="word" delay={0.03}>
                    {tab === "lore" ? char.lore : tab === "gameplay" ? char.gameplay : costume.description}
                  </TextAnimate>
                  {tab === "gameplay" && (
                    <div className={`mt-5 rounded-xl border p-4 ${dark ? "bg-violet-500/5 border-violet-500/15" : "bg-violet-50 border-violet-200"}`}>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-violet-500 mb-2">💡 Quick Tip</p>
                      <p className={`text-xs leading-relaxed ${dark ? "text-neutral-400" : "text-neutral-500"}`}>Check the Ratings tab to see which game modes this character excels in. Build your team around their strengths.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Guide page CTA footer ── */}
        <div className={`shrink-0 flex items-center justify-between px-7 py-4 border-t ${dark ? "border-white/6 bg-[#0c0d15]" : "border-neutral-100 bg-white"}`}>
          <p className={`text-xs ${dark ? "text-neutral-600" : "text-neutral-400"}`}>Want full builds, team comps &amp; videos?</p>
          <motion.a
            href={`/guides/${char.slug}`}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white cursor-pointer shadow-lg"
            style={{ background: `linear-gradient(135deg, ${char.color}, ${char.color}bb)`, boxShadow: `0 4px 18px ${char.color}45` }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            View {char.name}&apos;s Guide
          </motion.a>
        </div>
        {/* BorderBeam on modal */}
        <BorderBeam colorFrom={char.color} colorTo={ec} duration={10} size={300} />
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   GUIDE ROW
───────────────────────────────────────────────────────────────────────────── */
function GuideRow({ guide, dark, i }: { guide: typeof GUIDES[0]; dark: boolean; i: number }) {
  const tagColors: Record<string, string> = { New: "#22c55e", Updated: "#38bdf8", Hot: "#ef4444" };
  const tc = tagColors[guide.tag] || "#888";
  return (
    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} whileHover={{ x: 4 }}
      className={`flex items-center gap-3 py-3.5 border-b cursor-pointer transition-colors ${dark ? "border-white/5 hover:bg-white/[0.02]" : "border-neutral-100 hover:bg-neutral-50"}`}>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${dark ? "bg-white/5 border border-white/8" : "bg-neutral-100 border border-neutral-200"}`}>{guide.icon}</div>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${dark ? "text-white" : "text-neutral-800"}`}>{guide.title}</p>
        <p className={`text-xs mt-0.5 ${dark ? "text-neutral-500" : "text-neutral-400"}`}>{guide.type} · {guide.reads} reads</p>
      </div>
      <span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: tc + "18", border: `1px solid ${tc}40`, color: tc }}>{guide.tag}</span>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function BD2Hub() {
  const [dark, setDark] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [charSearch, setCharSearch] = useState("");
  const [filterElement, setFilterElement] = useState("");
  const [filterTier, setFilterTier] = useState("");
  const [modalChar, setModalChar] = useState<CharacterDetail | null>(null);

  const openModal = (charId: number) => { const d = CHARACTER_DATA.find((c) => c.id === charId); if (d) setModalChar(d); };
  const closeModal = () => setModalChar(null);

  useEffect(() => {
    const saved = localStorage.getItem("bd2hub-theme");
    setDark(saved === "dark");
    setThemeReady(true);
  }, []);
  useEffect(() => {
    if (!themeReady) return;
    localStorage.setItem("bd2hub-theme", dark ? "dark" : "light");
  }, [dark, themeReady]);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const bg    = dark ? "bg-[#08090e]" : "bg-neutral-50";
  const text  = dark ? "text-white"   : "text-neutral-900";
  const muted = dark ? "text-neutral-400" : "text-neutral-500";
  const border= dark ? "border-white/8" : "border-neutral-200";
  const card  = dark ? "bg-neutral-900 border-white/8" : "bg-white border-neutral-200 shadow-sm";
  const navBg = scrolled ? (dark ? "bg-[#08090e]/90 border-b border-white/8 backdrop-blur-xl" : "bg-white/90 border-b border-neutral-200 backdrop-blur-xl") : "bg-transparent";

  /* Filtered characters */
  const filteredChars = ALL_CHARACTERS.filter((c) => {
    const q = charSearch.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.costume.toLowerCase().includes(q) || c.element.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) || c.tier.toLowerCase().includes(q);
    const matchEl = !filterElement || c.element === filterElement;
    const matchTr = !filterTier || c.tier === filterTier;
    return matchQ && matchEl && matchTr;
  });

  const isSearching = !!(charSearch.trim() || filterElement || filterTier);
  const chunkSize = Math.ceil(filteredChars.length / 3) || 1;
  const rows = [filteredChars.slice(0, chunkSize), filteredChars.slice(chunkSize, chunkSize * 2), filteredChars.slice(chunkSize * 2)];
  const rowDurations = ["42s", "36s", "48s"];

  const elements = [...new Set(ALL_CHARACTERS.map((c) => c.element))];
  const tiers    = ["SS", "S", "A", "B"];

  return (
    <div className={`relative min-h-screen ${bg} ${text} cursor-none overflow-x-hidden`} style={{ fontFamily: "'DM Sans', 'Sora', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Sora:wght@400;600;700;800&display=swap');
        @keyframes auroraShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes marqueeH { from{transform:translateX(0)} to{transform:translateX(calc(-100% - var(--gap,16px)))} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        a,button,[role="button"],.cursor-pointer { cursor: pointer !important; }
        input,textarea { cursor: text !important; }
        .no-scrollbar::-webkit-scrollbar { display:none; }
        .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      <SmoothCursor />
      <ToastProvider dark={dark} />

      <AnimatePresence>
        {modalChar && <CharacterModal char={modalChar} dark={dark} onClose={closeModal} />}
      </AnimatePresence>

      {/* ── NAVBAR ── */}
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${navBg}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 text-white text-sm font-black shadow-lg shadow-violet-500/25">⚔</div>
            <span className="text-lg font-extrabold tracking-tight" style={{ fontFamily: "'Sora',sans-serif" }}>BD2<span className="text-violet-500">Hub</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((l) => <a key={l} className={`text-sm font-medium transition-colors hover:text-violet-500 cursor-pointer ${muted}`}>{l}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <AnimatedThemeToggler dark={dark} onToggle={() => setDark(!dark)} />
            <motion.a href="https://youtube.com" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/25 hover:bg-red-500 transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1C4.5 20.5 12 20.5 12 20.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.8 15.5V8.5l6.2 3.5-6.2 3.5z" /></svg>
              Subscribe
            </motion.a>
            <motion.a href="https://github.com" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${dark ? "bg-white/8 border border-white/12 text-white hover:bg-white/14" : "bg-neutral-900 text-white hover:bg-neutral-700 shadow-sm"}`}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.4.6.1.82-.26.82-.58v-2.03c-3.34.72-4.04-1.6-4.04-1.6-.54-1.38-1.33-1.74-1.33-1.74-1.08-.74.08-.73.08-.73 1.2.08 1.82 1.23 1.82 1.23 1.06 1.82 2.78 1.29 3.46.99.1-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" /></svg>
              ⭐ Star
            </motion.a>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
          <div className="absolute right-1/4 bottom-1/3 h-80 w-80 rounded-full bg-cyan-500/15 blur-[100px]" />
          <div className="absolute left-2/3 top-2/3 h-64 w-64 rounded-full bg-amber-500/10 blur-[90px]" />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(${dark ? "white" : "black"} 1px, transparent 1px), linear-gradient(90deg, ${dark ? "white" : "black"} 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`mb-6 flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold ${dark ? "border-violet-500/30 bg-violet-500/10 text-violet-400" : "border-violet-300 bg-violet-50 text-violet-600"}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
          Community-Powered · Updated Daily
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mb-4 max-w-4xl text-5xl font-extrabold leading-[1.08] tracking-tight md:text-7xl lg:text-8xl" style={{ fontFamily: "'Sora',sans-serif" }}>
          Master{" "}
          <AuroraText colors={["#a855f7", "#7c3aed", "#06b6d4", "#a855f7"]} speed={0.7}>Brown Dust 2</AuroraText>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`mb-10 max-w-xl text-lg leading-relaxed ${muted}`}>
          The ultimate guide, tier list and toolset. Build the{" "}
          <Highlighter action="highlight" color="#a855f730">perfect team</Highlighter>,{" "}
          <Highlighter action="underline" color="#06b6d4">pull smart</Highlighter>, climb every leaderboard.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex flex-wrap items-center justify-center gap-3 mb-20">
          <button className="relative overflow-hidden rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/30 hover:bg-violet-500 transition-all hover:scale-[1.02] cursor-pointer">Explore Tier List →</button>
          <button className={`rounded-xl border px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.02] cursor-pointer ${dark ? "border-white/15 text-white hover:bg-white/5" : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"}`}>Browse Guides</button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className={`relative grid grid-cols-2 gap-px overflow-hidden rounded-2xl border md:grid-cols-4 ${border}`}>
          {STATS.map((s) => (
            <div key={s.label} className={`flex flex-col items-center px-8 py-5 ${dark ? "bg-white/[0.03]" : "bg-white"}`}>
              <span className={`text-3xl font-extrabold tracking-tight ${dark ? "text-white" : "text-neutral-900"}`} style={{ fontFamily: "'Sora',sans-serif" }}><NumberTicker value={s.value} suffix={s.suffix} /></span>
              <span className={`mt-1 text-xs font-medium uppercase tracking-widest ${muted}`}>{s.label}</span>
            </div>
          ))}
        </motion.div>

        <div className="absolute bottom-8 flex flex-col items-center gap-2 opacity-30">
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} className="h-5 w-px rounded-full" style={{ background: dark ? "white" : "black" }} />
        </div>
      </section>

      {/* ── BANNER CHARACTERS ── */}
      <section className={`border-y py-14 ${border} overflow-hidden`}>
        <div className="mx-auto mb-6 max-w-7xl px-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-1 text-violet-500">Current Banners</p>
          <h2 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: "'Sora',sans-serif" }}>Featured Characters</h2>
        </div>
        <div className="w-full overflow-hidden">
          <Marquee pauseOnHover gap={16} duration="25s" className="py-2">
            {BANNER_CHARACTERS.map((c) => <CharacterCard key={c.id} char={c} dark={dark} onOpen={openModal} />)}
          </Marquee>
        </div>

        {/* ── All Characters + filters ── */}
        <div className="mx-auto mt-14 max-w-7xl px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1 text-cyan-500">Complete Roster</p>
              <h2 className="text-xl font-extrabold tracking-tight" style={{ fontFamily: "'Sora',sans-serif" }}>
                All Characters
                {isSearching && <span className={`ml-2 text-sm font-normal ${muted}`}>— {filteredChars.length} result{filteredChars.length !== 1 ? "s" : ""}</span>}
              </h2>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Element filter */}
              <div className="flex items-center gap-1.5">
                {elements.map((el) => {
                  const c = ELEMENT_COLORS[el] || "#888";
                  const active = filterElement === el;
                  return (
                    <button key={el} onClick={() => setFilterElement(active ? "" : el)}
                      className="rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer"
                      style={{ background: active ? c + "25" : "transparent", borderColor: active ? c + "70" : dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: active ? c : dark ? "#6b7280" : "#9ca3af" }}>
                      {el}
                    </button>
                  );
                })}
              </div>

              {/* Tier filter */}
              <div className="flex items-center gap-1.5">
                {tiers.map((t) => {
                  const c = TIER_COLORS[t] || "#888";
                  const active = filterTier === t;
                  return (
                    <button key={t} onClick={() => setFilterTier(active ? "" : t)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black border transition-all cursor-pointer"
                      style={{ background: active ? c + "25" : "transparent", borderColor: active ? c + "70" : dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: active ? c : dark ? "#4b5563" : "#9ca3af" }}>
                      {t}
                    </button>
                  );
                })}
              </div>

              {/* Search */}
              <div className="relative">
                <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${muted}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                <input type="text" placeholder="Search…" value={charSearch} onChange={(e) => setCharSearch(e.target.value)}
                  className={`w-44 rounded-xl border pl-9 pr-8 py-2 text-sm outline-none transition-all ${dark ? "bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-violet-500/60" : "bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-violet-400 shadow-sm"}`} />
                <AnimatePresence>
                  {charSearch && <motion.button initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} onClick={() => setCharSearch("")}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${dark ? "text-neutral-500 hover:text-white" : "text-neutral-400 hover:text-neutral-700"}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  </motion.button>}
                </AnimatePresence>
              </div>

              {/* Clear all */}
              <AnimatePresence>
                {isSearching && (
                  <motion.button initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} onClick={() => { setCharSearch(""); setFilterElement(""); setFilterTier(""); }}
                    className="rounded-lg px-3 py-1.5 text-[11px] font-bold text-violet-400 hover:text-violet-300 border border-violet-500/20 hover:border-violet-500/40 bg-violet-500/5 transition-all cursor-pointer">
                    Clear all
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Characters display */}
        <AnimatePresence mode="wait">
          {filteredChars.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mx-auto flex flex-col items-center justify-center py-16 text-center" style={{ width: "70%" }}>
              <span className="text-5xl mb-4">🔍</span>
              <p className={`text-sm font-medium ${muted}`}>No characters match your filters</p>
              <button onClick={() => { setCharSearch(""); setFilterElement(""); setFilterTier(""); }} className="mt-3 text-xs font-semibold text-violet-500 hover:text-violet-400 transition-colors cursor-pointer">Clear filters →</button>
            </motion.div>
          ) : isSearching ? (
            <motion.div key="grid" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-auto px-6" style={{ width: "70%" }}>
              <div className="flex flex-wrap gap-2 pb-2">
                {filteredChars.map((c) => <CharacterPill key={c.id} char={c} dark={dark} onOpen={openModal} />)}
              </div>
            </motion.div>
          ) : (
            <motion.div key="marquees" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mx-auto" style={{ width: "70%" }}>
                {rows.map((row, ri) => (
                  <div key={ri} style={{ overflowX: "hidden", overflowY: "visible", paddingTop: 10, paddingBottom: 4, marginTop: ri > 0 ? 4 : 0 }}>
                    <Marquee pauseOnHover gap={14} duration={rowDurations[ri]} reverse={ri === 1}>
                      {row.map((c) => <CharacterPill key={c.id} char={c} dark={dark} onOpen={openModal} />)}
                    </Marquee>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── BENTO TOOLS ── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-violet-500">Everything You Need</p>
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl" style={{ fontFamily: "'Sora',sans-serif" }}>
            <Highlighter action="highlight" color="#a855f722">Community</Highlighter> Tools
          </h2>
          <p className={`mt-3 max-w-lg text-base ${muted}`}>All the tools you need to dominate every game mode — built by the community, for the community.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[160px]">
          {/* Hero card */}
          <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 400 }}
            className={`relative col-span-1 md:col-span-2 md:row-span-2 overflow-hidden rounded-2xl border p-7 cursor-pointer ${card}`}>
            <div className="pointer-events-none absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 30% 50%, #a855f7 0%, transparent 70%)" }} />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-4 text-5xl">📊</div>
                <h3 className={`text-2xl font-extrabold tracking-tight ${dark ? "text-white" : "text-neutral-900"}`} style={{ fontFamily: "'Sora',sans-serif" }}>Interactive Tier List</h3>
                <p className={`mt-2 text-sm leading-relaxed max-w-xs ${muted}`}>All <Highlighter action="underline" color="#a855f7">280+ characters</Highlighter> ranked by meta strength across every game mode.</p>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <span className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white cursor-pointer hover:bg-violet-500 transition-colors">Open Tier List →</span>
                <span className={`text-xs font-medium ${muted}`}>Updated weekly</span>
              </div>
            </div>
            <BorderBeam colorFrom="#a855f7" colorTo="#06b6d4" duration={8} />
          </motion.div>

          {[
            { icon: "🛠", title: "Build Planner",  desc: "Plan costumes, skills & equipment.", color: "#06b6d4" },
            { icon: "💎", title: "Banner Tracker",  desc: "Know exactly when to pull.",         color: "#f59e0b" },
            { icon: "🎯", title: "Team Builder",    desc: "Build synergistic team comps.",      color: "#22c55e" },
            { icon: "🏆", title: "PvP Guide",       desc: "Climb Mirror War & Colosseum.",      color: "#ef4444" },
            { icon: "📚", title: "Guides Hub",      desc: "In-depth guides for every mode.",    color: "#a855f7" },
          ].map((t) => (
            <motion.div key={t.title} whileHover={{ y: -3, scale: 1.01 }} transition={{ type: "spring", stiffness: 400 }}
              className={`relative overflow-hidden rounded-2xl border p-5 cursor-pointer group ${card}`}>
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ background: `radial-gradient(circle at 30% 50%, ${t.color} 0%, transparent 70%)` }} />
              <div className="relative z-10">
                <div className="mb-3 text-3xl">{t.icon}</div>
                <h3 className={`font-bold tracking-tight ${dark ? "text-white" : "text-neutral-900"}`}>{t.title}</h3>
                <p className={`mt-1 text-xs leading-relaxed ${muted}`}>{t.desc}</p>
              </div>
              <div className="absolute bottom-4 right-4 text-xs font-bold transition-transform group-hover:translate-x-0.5" style={{ color: t.color }}>→</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── BOSS FIGHT + HOT TEAMS ── */}
      <BossSection dark={dark} />

      {/* ── GUIDES + STATS ── */}
      <section className={`border-t ${border}`}>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 divide-y md:grid-cols-2 md:divide-y-0 md:divide-x px-0" style={{ borderColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)" }}>
          <div className="px-8 py-16">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-500">Latest Content</p>
            <h2 className="mb-6 text-2xl font-extrabold tracking-tight" style={{ fontFamily: "'Sora',sans-serif" }}>Recent Guides</h2>
            <div>{GUIDES.map((g, i) => <GuideRow key={i} guide={g} dark={dark} i={i} />)}</div>
            <a className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-500 hover:text-amber-400 transition-colors cursor-pointer">Browse all guides <span>→</span></a>
          </div>

          <div className="px-8 py-16 flex flex-col justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-cyan-500">By the Numbers</p>
              <h2 className="mb-6 text-2xl font-extrabold tracking-tight" style={{ fontFamily: "'Sora',sans-serif" }}>
                The most complete <Highlighter action="highlight" color="#06b6d430">BD2 resource</Highlighter>
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {STATS.map((s) => (
                  <div key={s.label} className={`rounded-2xl border p-5 ${dark ? "bg-white/[0.03] border-white/8" : "bg-neutral-50 border-neutral-200"}`}>
                    <div className="text-3xl font-extrabold tracking-tight text-violet-500" style={{ fontFamily: "'Sora',sans-serif" }}><NumberTicker value={s.value} suffix={s.suffix} /></div>
                    <div className={`mt-1 text-xs font-medium ${muted}`}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`relative overflow-hidden rounded-2xl border p-6 ${dark ? "bg-gradient-to-br from-violet-950/60 to-neutral-900 border-violet-500/20" : "bg-gradient-to-br from-violet-50 to-white border-violet-200"}`}>
              <div className="pointer-events-none absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 80% 20%, #a855f7 0%, transparent 60%)" }} />
              <div className="relative">
                <p className="text-lg font-extrabold" style={{ fontFamily: "'Sora',sans-serif" }}>Never miss a banner</p>
                <p className={`mt-1 text-sm ${muted}`}>Get notified when your wishlist characters arrive — with full pull value analysis.</p>
                <button className="mt-4 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/25 cursor-pointer">Set up alerts 💎</button>
              </div>
              <BorderBeam colorFrom="#a855f7" colorTo="#f59e0b" duration={10} />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={`border-t ${border} px-8 py-10`}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-400 text-white text-xs font-black">⚔</div>
            <span className="font-extrabold tracking-tight" style={{ fontFamily: "'Sora',sans-serif" }}>BD2<span className="text-violet-500">Hub</span></span>
          </div>
          <p className={`text-xs ${muted}`}>Fan-made · Not affiliated with Neowiz or Brown Dust 2</p>
          <div className="flex gap-5">
            {["YouTube", "GitHub", "Twitter"].map((l) => <a key={l} className={`text-xs font-medium hover:text-violet-500 transition-colors cursor-pointer ${muted}`}>{l}</a>)}
          </div>
        </div>
      </footer>

      <Dock items={DOCK_ITEMS} dark={dark} />
      <div className="h-28" />
    </div>
  );
}