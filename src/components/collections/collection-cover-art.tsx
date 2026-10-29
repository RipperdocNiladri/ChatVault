import React from "react";
import type { AccentTheme, CoverStyle } from "@/types/entities";
import { cn } from "@/lib/utils";

interface CollectionCoverArtProps {
  coverStyle: CoverStyle;
  accentColor: AccentTheme;
  coverImageUrl?: string | null;
  className?: string;
}

export function getAccentClasses(accentColor: AccentTheme) {
  switch (accentColor) {
    case "cyan":
      return {
        text: "text-secondary",
        bgSoft: "bg-secondary/15",
        border: "border-secondary/30",
        badge: "bg-secondary/15 text-secondary",
        glow: "from-secondary/20 via-surface-container-lowest to-surface-container",
      };
    case "emerald":
      return {
        text: "text-tertiary",
        bgSoft: "bg-tertiary/15",
        border: "border-tertiary/30",
        badge: "bg-tertiary/15 text-tertiary",
        glow: "from-tertiary/20 via-surface-container-lowest to-surface-container",
      };
    case "amber":
      return {
        text: "text-amber-300",
        bgSoft: "bg-amber-400/15",
        border: "border-amber-400/30",
        badge: "bg-amber-400/15 text-amber-300",
        glow: "from-amber-400/20 via-surface-container-lowest to-surface-container",
      };
    case "rose":
      return {
        text: "text-rose-300",
        bgSoft: "bg-rose-400/15",
        border: "border-rose-400/30",
        badge: "bg-rose-400/15 text-rose-300",
        glow: "from-rose-400/20 via-surface-container-lowest to-surface-container",
      };
    case "violet":
    default:
      return {
        text: "text-primary",
        bgSoft: "bg-primary/15",
        border: "border-primary/30",
        badge: "bg-primary/15 text-primary",
        glow: "from-primary-container/25 via-surface-container-lowest to-surface-container",
      };
  }
}

export function CollectionCoverArt({
  coverStyle,
  accentColor,
  coverImageUrl,
  className,
}: CollectionCoverArtProps) {
  const accent = getAccentClasses(accentColor);

  if (coverImageUrl) {
    return (
      <div
        className={cn(
          "relative w-full h-36 overflow-hidden bg-surface-container-lowest",
          className
        )}
      >
        <img
          src={coverImageUrl}
          alt="Collection cover"
          className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/30 to-transparent" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full h-36 overflow-hidden bg-gradient-to-br flex items-center justify-center",
        accent.glow,
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, rgba(208,188,255,0.28) 1px, transparent 0)",
          backgroundSize: "16px 16px",
        }}
      />

      {coverStyle === "quantum-wave" && (
        <svg
          className="w-full h-24 px-4 opacity-90 group-hover:scale-105 transition-transform duration-500"
          fill="none"
          viewBox="0 0 320 96"
        >
          <path
            d="M0 48 Q 40 8, 80 48 T 160 48 T 240 48 T 320 48"
            stroke="#d0bcff"
            strokeOpacity="0.65"
            strokeWidth="2.2"
          />
          <path
            d="M0 48 Q 40 88, 80 48 T 160 48 T 240 48 T 320 48"
            stroke="#5de6ff"
            strokeDasharray="4 4"
            strokeOpacity="0.45"
            strokeWidth="1.5"
          />
          <circle cx="80" cy="48" fill="#d0bcff" r="4" />
          <circle cx="160" cy="48" fill="#5de6ff" r="5" />
          <circle cx="240" cy="48" fill="#4edea3" r="4" />
        </svg>
      )}

      {coverStyle === "binary-tree" && (
        <svg
          className="w-full h-28 px-6 opacity-90 group-hover:scale-105 transition-transform duration-500"
          fill="none"
          viewBox="0 0 320 96"
        >
          <line stroke="#5de6ff" strokeOpacity="0.45" strokeWidth="1.6" x1="160" x2="100" y1="20" y2="52" />
          <line stroke="#5de6ff" strokeOpacity="0.45" strokeWidth="1.6" x1="160" x2="220" y1="20" y2="52" />
          <line stroke="#d0bcff" strokeOpacity="0.4" strokeWidth="1.5" x1="100" x2="65" y1="52" y2="80" />
          <line stroke="#d0bcff" strokeOpacity="0.4" strokeWidth="1.5" x1="100" x2="135" y1="52" y2="80" />
          <line stroke="#4edea3" strokeOpacity="0.4" strokeWidth="1.5" x1="220" x2="185" y1="52" y2="80" />
          <line stroke="#4edea3" strokeOpacity="0.4" strokeWidth="1.5" x1="220" x2="255" y1="52" y2="80" />
          <circle cx="160" cy="20" fill="#111318" r="8" stroke="#5de6ff" strokeWidth="2" />
          <circle cx="100" cy="52" fill="#111318" r="7" stroke="#d0bcff" strokeWidth="2" />
          <circle cx="220" cy="52" fill="#111318" r="7" stroke="#4edea3" strokeWidth="2" />
          <circle cx="65" cy="80" fill="#5de6ff" fillOpacity="0.7" r="4.5" />
          <circle cx="135" cy="80" fill="#d0bcff" fillOpacity="0.7" r="4.5" />
          <circle cx="185" cy="80" fill="#4edea3" fillOpacity="0.7" r="4.5" />
          <circle cx="255" cy="80" fill="#5de6ff" fillOpacity="0.7" r="4.5" />
        </svg>
      )}

      {coverStyle === "memory-registers" && (
        <div className="grid grid-cols-4 gap-2 px-6 w-full max-w-[270px] opacity-90 group-hover:scale-105 transition-transform duration-500">
          <div className="h-9 rounded bg-surface-container/90 border border-tertiary/30 flex items-center justify-center font-code text-[10px] text-tertiary">
            0x7FFF00
          </div>
          <div className="h-9 rounded bg-tertiary/20 border border-tertiary/50 flex items-center justify-center font-code text-[10px] text-tertiary font-semibold">
            *ptr_a
          </div>
          <div className="h-9 rounded bg-surface-container/90 border border-secondary/30 flex items-center justify-center font-code text-[10px] text-secondary">
            malloc()
          </div>
          <div className="h-9 rounded bg-surface-container/90 border border-outline-variant/40 flex items-center justify-center font-code text-[10px] text-outline">
            0x0000A4
          </div>
          <div className="h-7 rounded bg-surface-container/70 flex items-center justify-center font-code text-[9px] text-outline">
            STACK
          </div>
          <div className="h-7 rounded bg-surface-container/70 flex items-center justify-center font-code text-[9px] text-primary">
            HEAP
          </div>
          <div className="h-7 rounded bg-tertiary/15 flex items-center justify-center font-code text-[9px] text-tertiary">
            FREE: 0
          </div>
          <div className="h-7 rounded bg-surface-container/70 flex items-center justify-center font-code text-[9px] text-secondary">
            RAII
          </div>
        </div>
      )}

      {coverStyle === "linear-algebra" && (
        <svg
          className="w-full h-28 px-6 opacity-90 group-hover:scale-105 transition-transform duration-500"
          fill="none"
          viewBox="0 0 320 96"
        >
          <line stroke="#494454" strokeDasharray="3 3" strokeWidth="1" x1="40" x2="280" y1="76" y2="76" />
          <line stroke="#494454" strokeDasharray="3 3" strokeWidth="1" x1="80" x2="80" y1="12" y2="88" />
          <path d="M 80 76 L 210 24" stroke="#d0bcff" strokeLinecap="round" strokeWidth="2.5" />
          <path d="M 80 76 L 245 58" stroke="#5de6ff" strokeLinecap="round" strokeWidth="2" />
          <polygon fill="#d0bcff" points="214,22 203,23 207,30" />
          <polygon fill="#5de6ff" points="249,57 239,54 240,62" />
          <text fill="#d0bcff" fontFamily="monospace" fontSize="11" x="218" y="24">
            λ₁v₁
          </text>
          <text fill="#5de6ff" fontFamily="monospace" fontSize="11" x="252" y="60">
            λ₂v₂
          </text>
        </svg>
      )}

      {coverStyle === "neural-grid" && (
        <svg
          className="w-full h-28 px-8 opacity-90 group-hover:scale-105 transition-transform duration-500"
          fill="none"
          viewBox="0 0 320 96"
        >
          {[24, 48, 72].map((y1) =>
            [18, 48, 78].map((y2) => (
              <line
                key={`l1-${y1}-${y2}`}
                stroke="#5de6ff"
                strokeOpacity="0.28"
                strokeWidth="1.2"
                x1="70"
                x2="160"
                y1={y1}
                y2={y2}
              />
            ))
          )}
          {[18, 48, 78].map((y1) =>
            [32, 64].map((y2) => (
              <line
                key={`l2-${y1}-${y2}`}
                stroke="#d0bcff"
                strokeOpacity="0.32"
                strokeWidth="1.2"
                x1="160"
                x2="250"
                y1={y1}
                y2={y2}
              />
            ))
          )}
          {[24, 48, 72].map((y) => (
            <circle key={`c1-${y}`} cx="70" cy={y} fill="#5de6ff" r="4.5" />
          ))}
          {[18, 48, 78].map((y) => (
            <circle key={`c2-${y}`} cx="160" cy={y} fill="#d0bcff" r="5.5" />
          ))}
          {[32, 64].map((y) => (
            <circle key={`c3-${y}`} cx="250" cy={y} fill="#4edea3" r="5" />
          ))}
        </svg>
      )}

      {coverStyle === "rust-architecture" && (
        <div className="flex items-center gap-3 px-6 opacity-90 group-hover:scale-105 transition-transform duration-500">
          <div className="px-3 py-2 rounded-lg bg-surface-container/90 border border-tertiary/40 font-code text-[11px] text-tertiary">
            daemon.rs
          </div>
          <span className="font-code text-outline text-xs">⇄</span>
          <div className="px-3 py-2 rounded-lg bg-surface-container/90 border border-primary/40 font-code text-[11px] text-primary">
            SQLite WAL
          </div>
          <span className="font-code text-outline text-xs">⇄</span>
          <div className="px-3 py-2 rounded-lg bg-surface-container/90 border border-secondary/40 font-code text-[11px] text-secondary">
            UI Vault
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface-container-low to-transparent pointer-events-none" />
    </div>
  );
}
