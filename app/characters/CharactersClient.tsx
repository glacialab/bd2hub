"use client";

import {
  useState, useEffect, useRef, useMemo, useCallback,
} from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Dock from "@/components/Dock";
import SmoothCursor from "@/components/SmoothCursor";
import { useTheme } from "@/components/useTheme";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
export interface CostumeData {
  id: string;
  name: string;
  rarity: "Limited" | "Standard" | "Upcoming" | string;
  emoji: string;
  color: string;
  description: string;
  featured?: boolean;
  videoUrl?: string;
  skills?: any[];
}

export interface CharacterJSON {
  slug: string;
  name: string;
  title?: string;
  element: string;
  archetype: string;
  tier: string;
  stars: number;
  color: string;
  colorAlt?: string;
  emoji: string;
  rarity?: string;
  lore?: string;
  overview?: string;
  modeRatings: Record<string, number>;
  costumes: CostumeData[];
  investmentPriority?: number;
}

export interface CharactersClientProps {
  characters: CharacterJSON[];
}

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────────────────────── */
const ELEMENT_COLORS: Record<string, string> = {
  Dark: "#a855f7", Light: "#f59e0b", Fire: "#ef4444",
  Wind: "#22c55e", Water: "#38bdf8", Earth: "#a78a2e",
};
const ELEMENT_ICONS: Record<string, string> = {
  Dark: "🌑", Light: "✨", Fire: "🔥", Wind: "🌀", Water: "💧", Earth: "🌿",
};
const TIER_COLORS: Record<string, string> = {
  SS: "#f59e0b", S: "#a855f7", A: "#38bdf8", B: "#22c55e", C: "#94a3b8",
};
const RARITY_COLORS: Record<string, string> = {
  Limited: "#f59e0b", Standard: "#64748b", Upcoming: "#06b6d4",
};
const ARCHETYPE_COLORS: Record<string, string> = {
  DPS: "#ef4444", "Sub-DPS": "#f97316", Tank: "#38bdf8",
  Healer: "#22c55e", Support: "#06b6d4", Buffer: "#a855f7",
  Mage: "#8b5cf6", Warrior: "#dc2626",
};

function tk(dark: boolean) {
  return {
    bg:          dark ? "#08090e"                   : "#f2f2f7",
    surface:     dark ? "rgba(255,255,255,0.035)"   : "rgba(255,255,255,0.90)",
    surfaceHov:  dark ? "rgba(255,255,255,0.065)"   : "rgba(255,255,255,1)",
    border:      dark ? "rgba(255,255,255,0.08)"    : "rgba(0,0,0,0.09)",
    text:        dark ? "#ffffff"                   : "#0f0f14",
    textMuted:   dark ? "rgba(255,255,255,0.45)"    : "rgba(0,0,0,0.48)",
    textFaint:   dark ? "rgba(255,255,255,0.22)"    : "rgba(0,0,0,0.28)",
    inputBg:     dark ? "rgba(255,255,255,0.05)"    : "rgba(255,255,255,0.90)",
    inputBorder: dark ? "rgba(255,255,255,0.10)"    : "rgba(0,0,0,0.12)",
    pillBg:      dark ? "rgba(255,255,255,0.05)"    : "rgba(0,0,0,0.04)",
    pillBorder:  dark ? "rgba(255,255,255,0.08)"    : "rgba(0,0,0,0.09)",
    stickyBg:    dark ? "rgba(8,9,14,0.93)"         : "rgba(242,242,247,0.93)",
    cardBg:      dark ? "rgba(14,15,22,0.96)"       : "rgba(255,255,255,0.96)",
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   BANNER SLIDE TYPE
───────────────────────────────────────────────────────────────────────────── */
interface BannerSlide {
  charSlug: string; charName: string; charTitle?: string;
  costumeName: string; costumeId: string;
  rarity: string; description: string; color: string;
  emoji: string; element: string; archetype: string; tier: string;
  videoUrl?: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   BANNER VIDEO SLIDE VIEW
───────────────────────────────────────────────────────────────────────────── */
function BannerSlideView({ slide, isActive, dark }: { slide: BannerSlide; isActive: boolean; dark: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const t = tk(dark);
  const rc = RARITY_COLORS[slide.rarity] ?? "#64748b";
  const ec = ELEMENT_COLORS[slide.element] ?? "#888";
  const tierC = TIER_COLORS[slide.tier] ?? "#888";

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) { v.currentTime = 0; v.play().catch(() => {}); }
    else v.pause();
  }, [isActive]);

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
  });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>

      {/* ── Video background (full bleed) ── */}
      {slide.videoUrl ? (
        <video ref={videoRef} src={slide.videoUrl} loop muted playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 1 }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "8%" }}>
          <motion.div
            initial={{ scale: 0.82, opacity: 0 }}
            animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0.88, opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: "clamp(140px, 18vw, 260px)", lineHeight: 1, userSelect: "none",
              filter: `drop-shadow(0 0 80px ${slide.color}75) drop-shadow(0 0 160px ${slide.color}40)` }}
          >
            {slide.emoji}
          </motion.div>
        </div>
      )}

      {/* Layered gradients over video — only cover left side for text legibility */}
      <div style={{ position: "absolute", inset: 0,
        background: dark
          ? `linear-gradient(100deg, rgba(8,9,14,0.92) 0%, rgba(8,9,14,0.72) 28%, rgba(8,9,14,0.15) 52%, transparent 68%)`
          : `linear-gradient(100deg, rgba(242,242,247,0.94) 0%, rgba(242,242,247,0.75) 28%, rgba(242,242,247,0.15) 52%, transparent 68%)` }} />
      <div style={{ position: "absolute", inset: "72% 0 0 0",
        background: `linear-gradient(to bottom, transparent, ${dark ? "rgba(8,9,14,0.85)" : "rgba(242,242,247,0.85)"})` }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 40% 60% at 8% 50%, ${slide.color}08 0%, transparent 70%)` }} />

      {/* Accent line — top */}
      <div style={{ position: "absolute", inset: "0 0 auto 0", height: 3,
        background: `linear-gradient(90deg, ${slide.color}, ${slide.color}77, transparent 65%)` }} />
      <div style={{ position: "absolute", inset: "0 auto 0 0", width: 3,
        background: `linear-gradient(180deg, ${slide.color}88, transparent 55%)` }} />

      {/* Content */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(2rem, 5vw, 4rem)", width: "100%" }}>
          <div style={{ maxWidth: 560 }}>

            {/* Pill row */}
            <motion.div {...anim(0.06)} style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
              {[
                { label: slide.rarity, color: rc },
                { label: `${ELEMENT_ICONS[slide.element]} ${slide.element}`, color: ec },
                { label: `${slide.tier} Tier`, color: tierC },
              ].map(p => (
                <span key={p.label} style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "4px 11px", borderRadius: 999, fontSize: 10,
                  fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
                  background: p.color + "22", color: p.color, border: `1px solid ${p.color}45`,
                  backdropFilter: "blur(8px)",
                }}>{p.label}</span>
              ))}
            </motion.div>

            {/* Costume name */}
            <motion.p {...anim(0.10)} style={{ fontSize: "clamp(13px, 1.4vw, 16px)", fontWeight: 600, color: t.textMuted, marginBottom: 6, letterSpacing: "0.01em" }}>
              {slide.costumeName}
            </motion.p>

            {/* Character name */}
            <motion.h2
              initial={{ opacity: 0, x: -32 }}
              animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.14 }}
              style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.2rem)", fontWeight: 900, letterSpacing: "-0.03em",
                lineHeight: 1, color: t.text, fontFamily: "'Sora', sans-serif", marginBottom: 4 }}>
              {slide.charName}
            </motion.h2>

            {/* Title */}
            {slide.charTitle && (
              <motion.p {...anim(0.20)} style={{ fontSize: 14, color: slide.color, fontWeight: 600, marginBottom: 16, letterSpacing: "0.025em" }}>
                — {slide.charTitle}
              </motion.p>
            )}

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }} animate={isActive ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
              transition={{ delay: 0.26, duration: 0.45, ease: "easeOut" }}
              style={{ height: 2, width: 44, borderRadius: 2, marginBottom: 16, background: `linear-gradient(90deg, ${slide.color}, transparent)`, transformOrigin: "left" }} />

            {/* Description */}
            <motion.p {...anim(0.28)} style={{ fontSize: "clamp(13px, 1.3vw, 15px)", color: t.textMuted, lineHeight: 1.78, marginBottom: 26, maxWidth: 430 }}>
              {slide.description.length > 180 ? slide.description.slice(0, 180) + "…" : slide.description}
            </motion.p>

            {/* CTAs */}
            <motion.div {...anim(0.36)} style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <motion.a href={`/guides/${slide.charSlug}`}
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 22px", borderRadius: 12, textDecoration: "none",
                  background: `linear-gradient(135deg, ${slide.color}, ${slide.color}bb)`, color: "#fff",
                  fontSize: 13, fontWeight: 700, letterSpacing: "0.01em",
                  boxShadow: `0 8px 26px -4px ${slide.color}55`,
                }}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                View Character
              </motion.a>
              <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
                  background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
                  border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.13)"}`,
                  color: t.text, backdropFilter: "blur(12px)",
                }}>
                <span style={{ fontSize: 15 }}>👗</span>
                Costume Details
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CINEMATIC BANNER SLIDER
───────────────────────────────────────────────────────────────────────────── */
function CinematicBanner({ slides, dark }: { slides: BannerSlide[]; dark: boolean }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const DURATION = 7000;
  const t = tk(dark);

  const goTo = useCallback((i: number) => setCurrent(i), []);
  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = setInterval(next, DURATION);
    return () => clearInterval(id);
  }, [next, paused, slides.length, current]);

  const slide = slides[current];

  return (
    <div style={{ width: "100%", padding: "16px 24px 32px", display: "flex", justifyContent: "center" }}>
    <div
      style={{
        position: "relative", width: "100%", maxWidth: 1400,
        height: "clamp(480px, 70vh, 740px)",
        borderRadius: 20,
        overflow: "hidden",
      }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>

      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }} style={{ position: "absolute", inset: 0 }}>
          <BannerSlideView slide={slide} isActive={true} dark={dark} />
        </motion.div>
      </AnimatePresence>

      {/* ── Slide counter (top-right) ── */}
      <div style={{
        position: "absolute", top: 22, right: 22, zIndex: 20,
        padding: "5px 13px", borderRadius: 999, backdropFilter: "blur(12px)",
        background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.12)",
        fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)",
        fontFamily: "'Sora', sans-serif", display: "flex", alignItems: "center", gap: 5,
      }}>
        <span style={{ color: slide.color }}>{String(current + 1).padStart(2, "0")}</span>
        <span style={{ opacity: 0.4 }}>/</span>
        <span>{String(slides.length).padStart(2, "0")}</span>
      </div>

      {/* ── Progress dots (bottom center) ── */}
      {slides.length > 1 && (
        <div style={{
          position: "absolute", bottom: 26, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 8, zIndex: 20,
        }}>
          {slides.map((s, i) => (
            <button key={i} onClick={() => goTo(i)}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
              <motion.div
                animate={{ width: i === current ? 36 : 7, background: i === current ? slide.color : "rgba(255,255,255,0.3)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ height: 7, borderRadius: 4, overflow: "hidden", position: "relative" }}>
                {i === current && !paused && (
                  <motion.div key={`p-${current}`}
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                    transition={{ duration: DURATION / 1000, ease: "linear" }}
                    style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.38)", transformOrigin: "left", borderRadius: 4 }} />
                )}
              </motion.div>
            </button>
          ))}
        </div>
      )}

      {/* ── Prev / Next ── */}
      {slides.length > 1 && [
        { fn: prev, icon: "‹", side: "left" as const },
        { fn: next, icon: "›", side: "right" as const },
      ].map(({ fn, icon, side }) => (
        <motion.button key={side} onClick={fn}
          whileHover={{ scale: 1.1, background: "rgba(255,255,255,0.18)" }}
          whileTap={{ scale: 0.93 }}
          style={{
            position: "absolute", top: "50%", transform: "translateY(-50%)",
            [side]: 18, zIndex: 20, width: 46, height: 46, borderRadius: "50%",
            background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(12px)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, color: "rgba(255,255,255,0.85)", fontWeight: 300, lineHeight: 1,
          }}>
          {icon}
        </motion.button>
      ))}

      {/* ── Right thumbnail strip (desktop) ── */}
      {slides.length > 1 && (
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: 88, zIndex: 15,
          display: "flex", flexDirection: "column", alignItems: "flex-end",
          justifyContent: "center", gap: 3, padding: "24px 0",
          background: "linear-gradient(to left, rgba(0,0,0,0.28), transparent)",
        }}>
          {slides.map((s, i) => (
            <motion.button key={i} onClick={() => goTo(i)}
              whileHover={{ x: -5 }}
              animate={{ opacity: i === current ? 1 : 0.42, x: i === current ? -7 : 0 }}
              style={{
                width: i === current ? 62 : 50, height: 54, flexShrink: 0,
                borderRadius: "8px 0 0 8px", cursor: "pointer", border: "none",
                borderLeft: `3px solid ${i === current ? s.color : "transparent"}`,
                background: i === current ? `linear-gradient(135deg, ${s.color}30, ${s.color}10)` : "rgba(255,255,255,0.07)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                transition: "width 0.25s",
              }} title={s.charName}>
              <span style={{ fontSize: 21, lineHeight: 1 }}>{s.emoji}</span>
              {i === current && <span style={{ fontSize: 8, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", maxWidth: 54, overflow: "hidden", whiteSpace: "nowrap" }}>{s.charName}</span>}
            </motion.button>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CHARACTER CARD  (3-D tilt + animated reveal)
───────────────────────────────────────────────────────────────────────────── */
/* ── Fixed card dimensions ── */
const CARD_ART_H  = 168; // px — art panel, never changes
const CARD_INFO_H = 152; // px — info panel, never changes
// Total card height = CARD_ART_H + CARD_INFO_H = 320px always

function CharacterCard({ char, dark, index }: { char: CharacterJSON; dark: boolean; index: number }) {
  const [hov, setHov] = useState(false);
  const t = tk(dark);
  const ec = ELEMENT_COLORS[char.element] ?? "#888";
  const tierC = TIER_COLORS[char.tier] ?? "#94a3b8";

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(my, { stiffness: 200, damping: 28 });
  const rotY = useSpring(mx, { stiffness: 200, damping: 28 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 8);
    my.set(((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -6);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      layout transition={{ duration: 0.4, delay: Math.min(index * 0.025, 0.5), ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ perspective: 900, cursor: "pointer" }}
    >
      <motion.div style={{
        rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d",
        borderRadius: 18, overflow: "hidden",
        /* ── Fixed total height — art + info always sums to the same value ── */
        height: CARD_ART_H + CARD_INFO_H,
        display: "flex", flexDirection: "column",
        border: `1px solid ${hov ? char.color + "55" : t.border}`,
        background: t.cardBg,
        boxShadow: hov
          ? `0 22px 50px -8px ${char.color}32, 0 4px 16px -4px rgba(0,0,0,0.18), inset 0 0 0 1px ${char.color}18`
          : "0 2px 14px -3px rgba(0,0,0,0.10)",
        transition: "border-color 0.22s, box-shadow 0.22s", position: "relative",
      }}>

        {/* ── Art panel — fixed height ── */}
        <div style={{
          position: "relative",
          height: CARD_ART_H,
          flexShrink: 0,
          overflow: "hidden",
          background: `linear-gradient(148deg, ${char.color}24 0%, ${char.color}08 50%, ${dark ? "rgba(8,9,14,1)" : "rgba(248,248,253,1)"} 100%)`,
        }}>
          {/* Grid texture */}
          <div style={{ position: "absolute", inset: 0, opacity: dark ? 0.038 : 0.055,
            backgroundImage: `linear-gradient(${dark?"white":"#333"} 1px,transparent 1px),linear-gradient(90deg,${dark?"white":"#333"} 1px,transparent 1px)`,
            backgroundSize: "22px 22px" }} />

          {/* Glow blob */}
          <div style={{ position: "absolute", top: "18%", left: "50%", transform: "translateX(-50%)",
            width: 110, height: 110, borderRadius: "50%", background: char.color + "28",
            filter: "blur(30px)", opacity: hov ? 1 : 0.5, transition: "opacity 0.3s" }} />

          {/* Emoji portrait */}
          <motion.div
            animate={{ y: hov ? -7 : 0, scale: hov ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 86, lineHeight: 1, userSelect: "none",
              filter: hov ? `drop-shadow(0 0 30px ${char.color}88)` : "drop-shadow(0 4px 10px rgba(0,0,0,0.22))",
              transition: "filter 0.3s",
            }}>
            {char.emoji}
          </motion.div>

          {/* Tier badge — top left */}
          <div style={{
            position: "absolute", top: 11, left: 11,
            padding: "3px 9px", borderRadius: 999, fontSize: 10, fontWeight: 900,
            background: tierC + "25", color: tierC, border: `1px solid ${tierC}50`,
            fontFamily: "'Sora',sans-serif", backdropFilter: "blur(8px)",
          }}>{char.tier}</div>

          {/* Stars — top right */}
          <div style={{ position: "absolute", top: 12, right: 12, fontSize: 10, color: "#f59e0b", letterSpacing: "0.04em" }}>
            {"★".repeat(char.stars)}
          </div>

          {/* Costume count — bottom right */}
          <div style={{
            position: "absolute", bottom: 9, right: 11,
            padding: "2px 8px", borderRadius: 999, fontSize: 9, fontWeight: 700,
            background: "rgba(0,0,0,0.38)", color: "rgba(255,255,255,0.82)",
            border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(8px)",
          }}>👗 {char.costumes.length}</div>

          {/* Bottom fade into card bg */}
          <div style={{ position: "absolute", inset: "55% 0 0 0",
            background: `linear-gradient(to bottom, transparent, ${dark?"rgba(14,15,22,0.96)":"rgba(255,255,255,0.96)"})` }} />
        </div>

        {/* ── Info panel — fixed height, flex column so costume strip always anchors to bottom ── */}
        <div style={{
          height: CARD_INFO_H,
          flexShrink: 0,
          padding: "13px 15px 14px",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Name — always 1 line */}
          <p style={{
            fontSize: 15, fontWeight: 800, color: t.text, fontFamily: "'Sora',sans-serif",
            margin: 0, letterSpacing: "-0.01em", lineHeight: 1.2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            flexShrink: 0,
          }}>
            {char.name}
          </p>

          {/* Title — always occupies exactly 18px whether present or not */}
          <p style={{
            fontSize: 10, color: t.textFaint, margin: "4px 0 0",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            height: 14, flexShrink: 0,
          }}>
            {char.title ?? ""}
          </p>

          {/* Element + archetype badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10, flexShrink: 0 }}>
            <span style={{
              padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
              background: ec + "18", color: ec, border: `1px solid ${ec}38`,
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              {ELEMENT_ICONS[char.element]} {char.element}
            </span>
            <span style={{
              padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 600,
              background: t.pillBg, color: t.textMuted, border: `1px solid ${t.pillBorder}`,
            }}>
              {char.archetype}
            </span>
          </div>

          {/* Spacer pushes costume strip to the bottom */}
          <div style={{ flex: 1 }} />

          {/* Divider */}
          <div style={{ height: 1, background: t.border, marginBottom: 10, flexShrink: 0 }} />

          {/* Costume strip — always at bottom */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <span style={{
              fontSize: 9, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.07em", color: t.textFaint, flexShrink: 0,
            }}>
              Costumes
            </span>
            <div style={{ display: "flex", gap: 3, overflow: "hidden" }}>
              {char.costumes.slice(0, 5).map(cos => {
                const rc = RARITY_COLORS[cos.rarity] ?? "#64748b";
                return (
                  <motion.div key={cos.id} whileHover={{ scale: 1.25, y: -2 }} title={cos.name}
                    style={{
                      width: 24, height: 24, borderRadius: 6, flexShrink: 0, fontSize: 13,
                      background: rc + "1e", border: `1px solid ${rc}3a`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                    {cos.emoji}
                  </motion.div>
                );
              })}
              {char.costumes.length > 5 && (
                <div style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0, fontSize: 8, fontWeight: 700,
                  background: t.pillBg, border: `1px solid ${t.pillBorder}`, color: t.textFaint,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  +{char.costumes.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hover overlay */}
        <AnimatePresence>
          {hov && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                background: dark ? "rgba(8,9,14,0.42)" : "rgba(255,255,255,0.42)",
                backdropFilter: "blur(2px)", borderRadius: "inherit", pointerEvents: "none",
              }}>
              <div style={{
                padding: "10px 22px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                background: `linear-gradient(135deg, ${char.color}, ${char.color}cc)`,
                color: "#fff", boxShadow: `0 8px 24px -4px ${char.color}55`,
                pointerEvents: "auto",
              }}>
                View Character →
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom accent sweep */}
        <motion.div animate={{ opacity: hov ? 1 : 0, scaleX: hov ? 1 : 0 }} transition={{ duration: 0.22 }}
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent, ${char.color}, transparent)`,
            transformOrigin: "center",
          }} />
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FILTER BAR
───────────────────────────────────────────────────────────────────────────── */
interface FilterState { search: string; element: string; archetype: string; rarity: string; sort: "name-asc"|"name-desc"|"tier"|"costumes"; }

function FilterBar({ filters, onChange, elements, archetypes, dark }: {
  filters: FilterState; onChange: (f: Partial<FilterState>) => void;
  elements: string[]; archetypes: string[]; dark: boolean;
}) {
  const t = tk(dark);
  const isFiltered = !!(filters.search || filters.element || filters.archetype || filters.rarity || filters.sort !== "name-asc");

  const pill = (active: boolean, color?: string) => ({
    padding: "5px 13px", borderRadius: 999, fontSize: 11, fontWeight: 600,
    cursor: "pointer" as const, whiteSpace: "nowrap" as const, transition: "all 0.18s",
    background: active ? (color ? color + "20" : "rgba(168,85,247,0.16)") : t.pillBg,
    border: `1px solid ${active ? (color ? color + "52" : "rgba(168,85,247,0.48)") : t.pillBorder}`,
    color: active ? (color ?? "#c084fc") : t.textMuted,
  });

  return (
    <div style={{
      position: "sticky", top: 64, zIndex: 30,
      background: t.stickyBg, backdropFilter: "blur(24px)",
      borderBottom: `1px solid ${t.border}`,
      transition: "background 0.3s, border-color 0.3s",
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "12px 24px 10px" }}>

        {/* Row 1: Search + Sort + Clear */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 10 }}>

          {/* Search */}
          <div style={{ position: "relative", flex: "0 0 auto", width: 240 }}>
            <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.4 }} width="13" height="13" viewBox="0 0 20 20" fill={t.text}>
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input type="text" placeholder="Search characters…" value={filters.search} onChange={e => onChange({ search: e.target.value })}
              onFocus={e => { e.target.style.borderColor = "rgba(168,85,247,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(168,85,247,0.12)"; }}
              onBlur={e => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ width: "100%", padding: "8px 32px 8px 32px", borderRadius: 12, border: `1.5px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif", transition: "border-color 0.18s, box-shadow 0.18s" }} />
            <AnimatePresence>
              {filters.search && (
                <motion.button initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                  onClick={() => onChange({ search: "" })}
                  style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: t.textFaint, display: "flex", padding: 2 }}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: t.border, flexShrink: 0 }} />

          {/* Sort label */}
          <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: t.textFaint, flexShrink: 0 }}>Sort</span>

          {/* Sort pills */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {([ { k: "name-asc", l: "A → Z" }, { k: "name-desc", l: "Z → A" }, { k: "tier", l: "Tier" }, { k: "costumes", l: "Costumes" } ] as const).map(s => (
              <motion.button key={s.k} onClick={() => onChange({ sort: s.k })}
                whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
                style={pill(filters.sort === s.k)}>{s.l}</motion.button>
            ))}
          </div>

          {/* Clear all — far right */}
          <AnimatePresence>
            {isFiltered && (
              <motion.button initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                onClick={() => onChange({ search: "", element: "", archetype: "", rarity: "", sort: "name-asc" })}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                Clear filters
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Row 2: Element / Archetype / Rarity filters */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 }}>

          {/* Element group */}
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: t.textFaint, marginRight: 2 }}>Element</span>
          {elements.map(el => (
            <motion.button key={el} onClick={() => onChange({ element: filters.element === el ? "" : el })}
              whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}
              style={pill(filters.element === el, ELEMENT_COLORS[el])}>
              {ELEMENT_ICONS[el]} {el}
            </motion.button>
          ))}

          <div style={{ width: 1, height: 16, background: t.border, flexShrink: 0, margin: "0 4px" }} />

          {/* Archetype group */}
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: t.textFaint, marginRight: 2 }}>Class</span>
          {archetypes.map(a => (
            <motion.button key={a} onClick={() => onChange({ archetype: filters.archetype === a ? "" : a })}
              whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}
              style={pill(filters.archetype === a, ARCHETYPE_COLORS[a])}>
              {a}
            </motion.button>
          ))}

          <div style={{ width: 1, height: 16, background: t.border, flexShrink: 0, margin: "0 4px" }} />

          {/* Rarity group */}
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: t.textFaint, marginRight: 2 }}>Rarity</span>
          {["Limited", "Standard", "Upcoming"].map(r => (
            <motion.button key={r} onClick={() => onChange({ rarity: filters.rarity === r ? "" : r })}
              whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}
              style={pill(filters.rarity === r, RARITY_COLORS[r])}>
              {r}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────────────────────────────────────── */
function SectionHeader({ eyebrow, title, dark }: { eyebrow: string; title: string; dark: boolean }) {
  const t = tk(dark);
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
        <div style={{ height: 1, width: 26, background: "linear-gradient(90deg, #a855f7, transparent)" }} />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#a855f7" }}>{eyebrow}</span>
      </div>
      <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)", fontWeight: 900, letterSpacing: "-0.025em", color: t.text, fontFamily: "'Sora',sans-serif", margin: 0, lineHeight: 1.15 }}>{title}</h2>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function CharactersClient({ characters }: CharactersClientProps) {
  const { dark, toggleDark, themeReady } = useTheme();
  const t = tk(dark);

  const [filters, setFilters] = useState<FilterState>({ search: "", element: "", archetype: "", rarity: "", sort: "name-asc" });
  const updateFilter = useCallback((f: Partial<FilterState>) => setFilters(prev => ({ ...prev, ...f })), []);

  const bannerSlides = useMemo<BannerSlide[]>(() => {
    const slides: BannerSlide[] = [];
    for (const ch of characters) {
      for (const cos of ch.costumes) {
        if (cos.featured) slides.push({
          charSlug: ch.slug, charName: ch.name, charTitle: ch.title,
          costumeName: cos.name, costumeId: cos.id, rarity: cos.rarity,
          description: cos.description, color: cos.color || ch.color,
          emoji: cos.emoji || ch.emoji, element: ch.element, archetype: ch.archetype,
          tier: ch.tier, videoUrl: cos.videoUrl,
        });
      }
    }
    return slides;
  }, [characters]);

  const { elements, archetypes } = useMemo(() => ({
    elements: [...new Set(characters.map(c => c.element))].sort(),
    archetypes: [...new Set(characters.map(c => c.archetype))].sort(),
  }), [characters]);

  const filtered = useMemo(() => {
    let arr = characters;
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      arr = arr.filter(c => c.name.toLowerCase().includes(q) || (c.title ?? "").toLowerCase().includes(q) || c.element.toLowerCase().includes(q) || c.archetype.toLowerCase().includes(q) || c.costumes.some(cos => cos.name.toLowerCase().includes(q)));
    }
    if (filters.element) arr = arr.filter(c => c.element === filters.element);
    if (filters.archetype) arr = arr.filter(c => c.archetype === filters.archetype);
    if (filters.rarity) arr = arr.filter(c => c.costumes.some(cos => cos.rarity === filters.rarity));
    arr = [...arr];
    if (filters.sort === "name-asc") arr.sort((a, b) => a.name.localeCompare(b.name));
    else if (filters.sort === "name-desc") arr.sort((a, b) => b.name.localeCompare(a.name));
    else if (filters.sort === "tier") { const O = ["SS","S","A","B","C"]; arr.sort((a,b) => O.indexOf(a.tier) - O.indexOf(b.tier)); }
    else if (filters.sort === "costumes") arr.sort((a, b) => b.costumes.length - a.costumes.length);
    return arr;
  }, [characters, filters]);

  const totalCostumes = useMemo(() => characters.reduce((s, c) => s + c.costumes.length, 0), [characters]);

  if (!themeReady) return null;

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'DM Sans','Sora',sans-serif", position: "relative", cursor: "none", transition: "background 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(168,85,247,0.4);border-radius:4px;}
        a,button,[role='button']{cursor:pointer!important;}
        input,textarea{cursor:text!important;}
        *{cursor:none!important;}
        .no-scrollbar::-webkit-scrollbar{display:none;}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}
      `}</style>

      <SmoothCursor />
      <Navbar dark={dark} onToggleDark={toggleDark} activePath="/characters" />

      {/* Ambient glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-5%", right: "10%", width: "45%", height: "55%", background: `radial-gradient(ellipse, ${dark?"rgba(168,85,247,0.07)":"rgba(168,85,247,0.04)"} 0%, transparent 70%)`, filter: "blur(50px)" }} />
        <div style={{ position: "absolute", bottom: "15%", left: "5%", width: "35%", height: "40%", background: `radial-gradient(ellipse, ${dark?"rgba(56,189,248,0.05)":"rgba(56,189,248,0.03)"} 0%, transparent 70%)`, filter: "blur(40px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ══ CINEMATIC BANNER ══ */}
        <div style={{ paddingTop: 64 }}>
          {bannerSlides.length > 0 ? (
            <CinematicBanner slides={bannerSlides} dark={dark} />
          ) : (
            <div style={{ height: 460, display: "flex", alignItems: "center", justifyContent: "center",
              borderBottom: `1px solid ${t.border}`,
              background: dark ? "linear-gradient(135deg,rgba(168,85,247,0.06),rgba(56,189,248,0.04))" : "linear-gradient(135deg,rgba(168,85,247,0.04),rgba(56,189,248,0.02))" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 50, marginBottom: 14 }}>💎</div>
                <p style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: "0 0 6px" }}>No Featured Costumes</p>
                <p style={{ fontSize: 13, color: t.textMuted }}>Add <code style={{ fontFamily: "monospace", fontSize: 12, padding: "1px 5px", background: t.pillBg, borderRadius: 5 }}>featured: true</code> to a costume in the JSON.</p>
              </div>
            </div>
          )}
        </div>



        {/* ══ FILTER BAR ══ */}
        <FilterBar filters={filters} onChange={updateFilter} elements={elements} archetypes={archetypes} dark={dark} />

        {/* ══ CHARACTER GRID ══ */}
        <main style={{ maxWidth: 1400, margin: "0 auto", padding: "2.5rem 24px 2.5rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
            <SectionHeader eyebrow="Complete Roster" title="All Characters" dark={dark} />
            <motion.span key={filtered.length} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: t.pillBg, border: `1px solid ${t.pillBorder}`, color: t.textMuted,
                marginBottom: 28, flexShrink: 0, alignSelf: "flex-end" }}>
              {filtered.length} / {characters.length}
            </motion.span>
          </div>

          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ textAlign: "center", padding: "5rem 0" }}>
                <div style={{ fontSize: 50, marginBottom: 14 }}>🔍</div>
                <p style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: "0 0 7px" }}>No characters found</p>
                <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 20 }}>Try adjusting your filters or search term</p>
                <button onClick={() => setFilters({ search:"", element:"", archetype:"", rarity:"", sort:"name-asc" })}
                  style={{ padding: "10px 22px", borderRadius: 12, fontSize: 13, fontWeight: 600,
                    background: "rgba(168,85,247,0.14)", border: "1px solid rgba(168,85,247,0.38)", color: "#c084fc", cursor: "pointer" }}>
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
                style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                <AnimatePresence mode="popLayout">
                  {filtered.map((char, i) => (
                    <CharacterCard key={char.slug} char={char} dark={dark} index={i} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {filtered.length > 0 && (
            <p style={{ textAlign: "center", fontSize: 11, color: t.textFaint, marginTop: 36, paddingBottom: 4 }}>
              Showing all {filtered.length} characters · Click any card to view their full guide
            </p>
          )}
        </main>

        {/* ══ ELEMENT BREAKDOWN ══ */}
        <div style={{ borderTop: `1px solid ${t.border}`, background: dark ? "rgba(255,255,255,0.014)" : "rgba(0,0,0,0.018)", padding: "2.5rem 24px" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            <SectionHeader eyebrow="By Element" title="Element Distribution" dark={dark} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {elements.map(el => {
                const color = ELEMENT_COLORS[el] ?? "#888";
                const count = characters.filter(c => c.element === el).length;
                const pct = Math.round((count / characters.length) * 100);
                const active = filters.element === el;
                return (
                  <motion.button key={el} whileHover={{ y: -3, scale: 1.02 }}
                    onClick={() => updateFilter({ element: active ? "" : el })}
                    style={{ flex: 1, minWidth: 130, padding: "15px 17px", borderRadius: 14, cursor: "pointer",
                      background: active ? color+"1e" : t.surface, border: `1px solid ${active ? color+"52" : t.border}`,
                      boxShadow: active ? `0 4px 18px -4px ${color}32` : "none", textAlign: "left", transition: "all 0.22s" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                      <span style={{ fontSize: 19 }}>{ELEMENT_ICONS[el]}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color }}>{pct}%</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 3 }}>{el}</div>
                    <div style={{ fontSize: 11, color: t.textFaint }}>{count} characters</div>
                    <div style={{ marginTop: 9, height: 3, borderRadius: 2, background: t.border, overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                        style={{ height: "100%", background: color, borderRadius: 2 }} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        <Footer dark={dark} />
      </div>

      <Dock dark={dark} activePath="/characters" />
    </div>
  );
}