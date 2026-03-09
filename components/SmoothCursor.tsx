"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

/**
 * SmoothCursor — Arrow + MagicUI Pointer hybrid
 *
 * • Spring-tracked SVG arrow replaces the system cursor globally (hide with cursor-none on the page root)
 * • On cursor:pointer elements → arrow tilts & tints violet,
 *   a MagicUI-style label chip appears with the element's text,
 *   and a soft radial glow halo blooms behind (slower spring = trailing depth effect)
 * • Ring fallback shown when element is interactive but has no readable label
 *
 * Drop this anywhere inside a layout/page that has `cursor-none` on its root div.
 * It mounts fixed overlays at z-[9996] and z-[9999] so it floats above everything.
 *
 * Usage:
 *   import SmoothCursor from "@/components/SmoothCursor";
 *   <SmoothCursor />
 */
export default function SmoothCursor() {
  const cx = useMotionValue(-200);
  const cy = useMotionValue(-200);

  // Fast spring for the arrow itself — snappy but not instant
  const sx = useSpring(cx, { stiffness: 420, damping: 36, mass: 0.55 });
  const sy = useSpring(cy, { stiffness: 420, damping: 36, mass: 0.55 });

  // Slower spring for the trailing halo — lags behind = depth / MagicUI Pointer feel
  const hx = useSpring(cx, { stiffness: 180, damping: 26, mass: 0.9 });
  const hy = useSpring(cy, { stiffness: 180, damping: 26, mass: 0.9 });

  const [ptr,   setPtr]   = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cx.set(e.clientX);
      cy.set(e.clientY);

      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const isPtr = !!(el && getComputedStyle(el).cursor === "pointer");
      setPtr(isPtr);

      if (isPtr && el) {
        const closest = el.closest("button, a, [role=button]") as HTMLElement | null;
        const raw =
          el.getAttribute("aria-label")              ||
          el.getAttribute("title")                   ||
          closest?.getAttribute("aria-label")        ||
          closest?.textContent?.trim().replace(/\s+/g, " ").slice(0, 24) ||
          "";
        setLabel(raw);
      } else {
        setLabel("");
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [cx, cy]);

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
                width: 56,
                height: 56,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(109,40,217,0.30) 0%, rgba(109,40,217,0.07) 55%, transparent 100%)",
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
        {/* Arrow SVG — tilts and tints violet on pointer elements */}
        <motion.svg
          width="22"
          height="27"
          viewBox="0 0 22 27"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{
            scale:  ptr ? 1.1  : 1,
            rotate: ptr ? -14  : 0,
            x:      ptr ? -1   : 0,
            y:      ptr ? -1   : 0,
          }}
          transition={{ type: "spring", stiffness: 440, damping: 28 }}
        >
          {/* Drop shadow path */}
          <path
            d="M3 2.5L3 21L8.5 16L12.5 24L15.5 22.5L11.5 14.5L18.5 14.5L3 2.5Z"
            fill="rgba(0,0,0,0.20)"
            transform="translate(1,1.5)"
          />
          {/* Arrow body — tints violet on pointer */}
          <motion.path
            d="M3 2.5L3 21L8.5 16L12.5 24L15.5 22.5L11.5 14.5L18.5 14.5L3 2.5Z"
            animate={{ fill: ptr ? "#ede9fe" : "#ffffff" }}
            transition={{ duration: 0.16 }}
            stroke="#6d28d9"
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
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
                boxShadow:
                  "0 4px 18px rgba(109,40,217,0.50), inset 0 0 0 1px rgba(255,255,255,0.14)",
                letterSpacing: "0.015em",
              }}
            >
              <span
                className="shrink-0 animate-pulse rounded-full bg-white/80"
                style={{ width: 6, height: 6 }}
              />
              {label}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Ring fallback — interactive but no readable label ── */}
        <AnimatePresence>
          {ptr && !label && (
            <motion.div
              key="ring"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.5, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.18 }}
              className="absolute rounded-full border-2 border-violet-500"
              style={{ top: -12, left: -12, width: 44, height: 44 }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}