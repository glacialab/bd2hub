"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "bd2hub-theme";
const DEFAULT_DARK = true; // site default when no preference saved

/**
 * Shared dark-mode hook — reads from / writes to localStorage.
 *
 * Returns:
 *   dark        — boolean, current theme
 *   toggleDark  — flip the theme and persist immediately
 *   themeReady  — false until localStorage has been read client-side;
 *                 use this to suppress first-render flash (return null while !themeReady)
 *
 * Usage in any client component:
 *   const { dark, toggleDark, themeReady } = useTheme();
 *   if (!themeReady) return null;  // prevents flash
 */
export function useTheme() {
  // Start with undefined so we know we haven't read localStorage yet
  const [dark, setDark] = useState<boolean | undefined>(undefined);

  // On mount (client only) — read the saved preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "dark")  { setDark(true);  return; }
      if (saved === "light") { setDark(false); return; }
      // Nothing saved yet → use site default and write it so future loads are instant
      setDark(DEFAULT_DARK);
      localStorage.setItem(STORAGE_KEY, DEFAULT_DARK ? "dark" : "light");
    } catch {
      // Private-browsing / storage blocked
      setDark(DEFAULT_DARK);
    }
  }, []);

  const toggleDark = () => {
    setDark(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, next ? "dark" : "light"); } catch {}
      return next;
    });
  };

  const themeReady = dark !== undefined;

  return {
    dark: dark ?? DEFAULT_DARK, // fallback so TypeScript is happy; component should guard with themeReady
    toggleDark,
    themeReady,
  };
}