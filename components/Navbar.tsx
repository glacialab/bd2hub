"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
export interface NavbarProps {
  /** Current dark-mode state — from useTheme() */
  dark: boolean;
  /** Toggle callback — from useTheme() */
  onToggleDark: () => void;
  /** The href path of the current page, used to highlight the active link.
   *  e.g. "/tier-list" or "/guides" */
  activePath?: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   NAV LINKS — edit here to add/remove pages
───────────────────────────────────────────────────────────────────────────── */
const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Tier List",  href: "/tier-list"  },
  { label: "Characters", href: "/characters" },
  { label: "Guides",     href: "/guides"     },
  { label: "Banners",    href: "/banners"    },
  { label: "Teams",      href: "/teams"      },
  { label: "Tools",      href: "/tools"      },
];

/* ─────────────────────────────────────────────────────────────────────────────
   MOBILE MENU
───────────────────────────────────────────────────────────────────────────── */
function MobileMenu({ dark, activePath, onClose }: { dark: boolean; activePath?: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-x-0 top-full border-b shadow-2xl"
      style={{
        background: dark ? "rgba(8,9,14,0.97)" : "rgba(255,255,255,0.97)",
        borderColor: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
        backdropFilter: "blur(24px)",
      }}
    >
      <nav className="mx-auto max-w-7xl flex flex-col px-6 py-5 gap-1">
        {NAV_LINKS.map((link) => {
          const active = activePath === link.href;
          return (
            <a
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all"
              style={{
                background: active
                  ? "rgba(168,85,247,0.12)"
                  : "transparent",
                color: active
                  ? "#c084fc"
                  : dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)",
              }}
            >
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
              )}
              {link.label}
            </a>
          );
        })}
      </nav>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATED THEME TOGGLER
───────────────────────────────────────────────────────────────────────────── */
function AnimatedThemeToggler({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative h-8 w-14 rounded-full border transition-colors duration-300 cursor-pointer flex-shrink-0"
      style={{
        background: dark ? "#7c3aed" : "#e5e7eb",
        borderColor: dark ? "#6d28d9" : "#d1d5db",
      }}
      aria-label="Toggle theme"
    >
      <motion.div
        animate={{ x: dark ? 24 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="absolute top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm text-sm"
      >
        {dark ? "🌙" : "☀️"}
      </motion.div>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NAVBAR — main export
   
   Usage:
     import Navbar from "@/components/Navbar";
     import { useTheme } from "@/components/useTheme";
 
     const { dark, toggleDark } = useTheme();
     <Navbar dark={dark} onToggleDark={toggleDark} activePath="/tier-list" />
───────────────────────────────────────────────────────────────────────────── */
export default function Navbar({ dark, onToggleDark, activePath }: NavbarProps) {
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const navBg = scrolled
    ? dark
      ? "rgba(8,9,14,0.90)"
      : "rgba(255,255,255,0.90)"
    : "transparent";

  const borderBottom = scrolled
    ? dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)"
    : "1px solid transparent";

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 transition-all duration-300"
      style={{
        background: navBg,
        borderBottom,
        backdropFilter: scrolled ? "blur(20px)" : "none",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 relative">

        {/* ── LOGO ── */}
        <a href="/" className="flex items-center gap-2.5 cursor-pointer flex-shrink-0" aria-label="BD2Hub Home">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white text-sm font-black shadow-lg"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
            }}
          >
            ⚔
          </div>
          <span
            className="text-lg font-extrabold tracking-tight"
            style={{ fontFamily: "'Sora', sans-serif", color: dark ? "white" : "#111" }}
          >
            BD2<span style={{ color: "#a855f7" }}>Hub</span>
          </span>
        </a>

        {/* ── DESKTOP NAV ── */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = activePath === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className="relative px-3.5 py-1.5 text-sm font-medium rounded-xl transition-all"
                style={{
                  color: active
                    ? "#c084fc"
                    : dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                  background: active
                    ? "rgba(168,85,247,0.10)"
                    : "transparent",
                }}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-active-dot"
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: "#a855f7" }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* ── RIGHT ACTIONS ── */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <AnimatedThemeToggler dark={dark} onToggle={onToggleDark} />

          {/* YouTube CTA */}
          <motion.a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="hidden sm:flex cursor-pointer items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-red-500"
            style={{ boxShadow: "0 4px 12px rgba(220,38,38,0.3)" }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1C4.5 20.5 12 20.5 12 20.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.8 15.5V8.5l6.2 3.5-6.2 3.5z" />
            </svg>
            Subscribe
          </motion.a>

          {/* GitHub Star */}
          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="hidden sm:flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors"
            style={{
              background: dark ? "rgba(255,255,255,0.07)" : "#111",
              border: dark ? "1px solid rgba(255,255,255,0.10)" : "none",
              color: "white",
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.4.6.1.82-.26.82-.58v-2.03c-3.34.72-4.04-1.6-4.04-1.6-.54-1.38-1.33-1.74-1.33-1.74-1.08-.74.08-.73.08-.73 1.2.08 1.82 1.23 1.82 1.23 1.06 1.82 2.78 1.29 3.46.99.1-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            ⭐ Star
          </motion.a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex md:hidden items-center justify-center w-9 h-9 rounded-xl transition-colors cursor-pointer"
            style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}
            aria-label="Open menu"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5" style={{ color: dark ? "white" : "#111", width: 18, height: 18 }}>
              {mobileOpen ? (
                <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
              ) : (
                <path fillRule="evenodd" clipRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <MobileMenu dark={dark} activePath={activePath} onClose={() => setMobileOpen(false)} />
      )}
    </header>
  );
}