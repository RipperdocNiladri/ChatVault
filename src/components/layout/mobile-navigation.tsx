"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/utils";

const MOBILE_TABS = [
  { label: "Home", href: "/dashboard", icon: "inventory_2" },
  { label: "Vaults", href: "/collections", icon: "folder_copy" },
  { label: "Search", href: "/search", icon: "manage_search" },
  { label: "Favorites", href: "/favorites", icon: "bookmark_star" },
  { label: "Settings", href: "/settings", icon: "tune" },
];

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 pb-safe bg-surface/95 backdrop-blur-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.45)] border-t border-outline-variant/20"
    >
      <div className="flex justify-around items-center h-16 px-gutter-mobile max-w-md mx-auto">
        {MOBILE_TABS.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/dashboard" && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[56px] h-12 transition-all active:scale-95",
                isActive
                  ? "text-primary font-semibold relative after:content-[''] after:absolute after:bottom-1 after:w-1 after:h-1 after:rounded-full after:bg-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <MaterialIcon
                name={tab.icon}
                filled={isActive}
                className="text-[22px]"
              />
              <span className="font-label-sm text-label-sm tracking-tight">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
