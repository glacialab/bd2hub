"use client";

/* ─────────────────────────────────────────────────────────────────────────────
   FOOTER — shared across all pages
   
   Usage:
     import Footer from "@/components/Footer";
     <Footer dark={dark} />
───────────────────────────────────────────────────────────────────────────── */

export interface FooterProps {
  dark: boolean;
}

const SOCIAL_LINKS = [
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1C4.5 20.5 12 20.5 12 20.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.8 15.5V8.5l6.2 3.5-6.2 3.5z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.4.6.1.82-.26.82-.58v-2.03c-3.34.72-4.04-1.6-4.04-1.6-.54-1.38-1.33-1.74-1.33-1.74-1.08-.74.08-.73.08-.73 1.2.08 1.82 1.23 1.82 1.23 1.06 1.82 2.78 1.29 3.46.99.1-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Discord",
    href: "https://discord.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
      </svg>
    ),
  },
];

const FOOTER_LINKS: { section: string; links: { label: string; href: string }[] }[] = [
  {
    section: "Content",
    links: [
      { label: "Tier List",   href: "/tier-list"  },
      { label: "Characters",  href: "/characters" },
      { label: "Guides",      href: "/guides"     },
      { label: "Banners",     href: "/banners"    },
    ],
  },
  {
    section: "Tools",
    links: [
      { label: "Team Builder", href: "/teams"     },
      { label: "Build Planner", href: "/tools"   },
      { label: "PvP Guide",    href: "/pvp"       },
      { label: "Reroll Guide", href: "/reroll"    },
    ],
  },
  {
    section: "Community",
    links: [
      { label: "Discord",     href: "https://discord.com" },
      { label: "YouTube",     href: "https://youtube.com" },
      { label: "GitHub",      href: "https://github.com"  },
      { label: "Twitter / X", href: "https://twitter.com" },
    ],
  },
];

export default function Footer({ dark }: FooterProps) {
  const muted = dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)";
  const borderColor = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

  return (
    <footer
      className="w-full"
      style={{ borderTop: `1px solid ${borderColor}`, background: dark ? "#08090e" : "#fafafa" }}
    >
      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-6 sm:px-8 pt-14 pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-5">
            <a href="/" className="flex items-center gap-2.5 w-fit cursor-pointer">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl text-white text-sm font-black shadow-lg"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" }}
              >
                ⚔
              </div>
              <span className="text-lg font-extrabold tracking-tight" style={{ fontFamily: "'Sora', sans-serif", color: dark ? "white" : "#111" }}>
                BD2<span style={{ color: "#a855f7" }}>Hub</span>
              </span>
            </a>

            <p className="text-xs leading-relaxed max-w-[200px]" style={{ color: muted }}>
              The most complete community-powered Brown Dust 2 resource. Tier lists, guides, and tools — all free.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex items-center justify-center w-8 h-8 rounded-xl transition-all cursor-pointer"
                  style={{
                    background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                    border: `1px solid ${borderColor}`,
                    color: dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#a855f7";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(168,85,247,0.4)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(168,85,247,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
                    (e.currentTarget as HTMLElement).style.borderColor = borderColor;
                    (e.currentTarget as HTMLElement).style.background = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((section) => (
            <div key={section.section} className="flex flex-col gap-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: "#a855f7" }}>
                {section.section}
              </p>
              <ul className="flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-xs font-medium transition-colors cursor-pointer"
                      style={{ color: muted }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#c084fc"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = muted; }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="mx-auto max-w-7xl px-6 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-3"
        style={{ borderTop: `1px solid ${borderColor}` }}
      >
        <p className="text-[11px]" style={{ color: muted }}>
          © {new Date().getFullYear()} BD2Hub · Fan-made · Not affiliated with Neowiz or Brown Dust 2
        </p>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[11px]" style={{ color: muted }}>Updated daily</p>
        </div>
      </div>
    </footer>
  );
}