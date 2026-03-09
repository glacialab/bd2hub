"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────────
   DOCK — macOS-style bottom dock, shared across all pages.

   Usage:
     import Dock from "@/components/Dock";
     <Dock dark={dark} activePath="/tier-list" />
───────────────────────────────────────────────────────────────────────────── */

export interface DockProps {
  dark: boolean;
  /** Highlight the active page icon */
  activePath?: string;
}

interface DockItem {
  label: string;
  icon: string;
  href: string;
  external?: boolean;
}

const DOCK_ITEMS: DockItem[] = [
  { label: "Home",       icon: "🏠", href: "/"          },
  { label: "Tier List",  icon: "📊", href: "/tier-list"  },
  { label: "Characters", icon: "👤", href: "/characters" },
  { label: "Guides",     icon: "📖", href: "/guides"     },
  { label: "Banners",    icon: "💎", href: "/banners"    },
  { label: "Teams",      icon: "🎯", href: "/teams"      },
  { label: "YouTube",    icon: "▶️", href: "https://youtube.com", external: true },
];

/* ─── Single dock icon ─── */
function DockIcon({
  item,
  mouseX,
  dark,
  active,
}: {
  item: DockItem;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  dark: boolean;
  active: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = useSpring(1, { stiffness: 350, damping: 25 });
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() =>
    mouseX.on("change", (mx: number) => {
      if (!ref.current) return;
      const { left, width } = ref.current.getBoundingClientRect();
      const dist = Math.abs(mx - (left + width / 2));
      scale.set(dist < 80 ? 1 + (1 - dist / 80) * 0.55 : 1);
    }),
    [mouseX, scale]
  );

  return (
    <motion.div
      ref={ref}
      style={{ scale }}
      className="relative flex flex-col items-center origin-bottom"
    >
      {/* Tooltip label */}
      <AnimatePresence>
        {showLabel && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.14 }}
            className="absolute -top-9 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold shadow-xl pointer-events-none"
            style={{
              background: dark ? "#1a1b23" : "white",
              color: dark ? "white" : "#111",
              border: `1px solid ${dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)"}`,
            }}
          >
            {item.label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon button */}
      <motion.a
        href={item.href}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
        onMouseEnter={() => setShowLabel(true)}
        onMouseLeave={() => setShowLabel(false)}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl text-xl transition-colors relative"
        style={{
          background: active
            ? "rgba(168,85,247,0.22)"
            : dark
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.06)",
          border: active
            ? "1px solid rgba(168,85,247,0.45)"
            : `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
        }}
        whileTap={{ scale: 0.9 }}
        aria-label={item.label}
      >
        {item.icon}
        {/* Active dot */}
        {active && (
          <span
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
            style={{ background: "#a855f7" }}
          />
        )}
      </motion.a>
    </motion.div>
  );
}

/* ─── Dock container ─── */
export default function Dock({ dark, activePath }: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <>
      {/* Spacer so page content doesn't hide behind dock */}
      <div className="h-28" />

      <motion.nav
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="fixed bottom-5 left-1/2 z-50 flex items-end gap-2 rounded-2xl px-4 py-3"
        style={{
          translateX: "-50%",
          background: dark
            ? "rgba(14,15,22,0.82)"
            : "rgba(255,255,255,0.82)",
          border: `1px solid ${dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)"}`,
          backdropFilter: "blur(24px)",
          boxShadow: dark
            ? "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)"
            : "0 8px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)",
        }}
        aria-label="Site navigation dock"
      >
        {DOCK_ITEMS.map((item) => (
          <DockIcon
            key={item.label}
            item={item}
            mouseX={mouseX}
            dark={dark}
            active={!item.external && activePath === item.href}
          />
        ))}
      </motion.nav>
    </>
  );
}