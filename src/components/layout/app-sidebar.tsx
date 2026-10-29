"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useVaultData } from "@/hooks/use-vault-data";
import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/utils";

const PRIMARY_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "space_dashboard" },
  { label: "All Conversations", href: "/conversations", icon: "forum" },
  { label: "My Collections", href: "/collections", icon: "folder_special" },
  { label: "Global Search", href: "/search", icon: "manage_search" },
  { label: "Favorites", href: "/favorites", icon: "star" },
  { label: "Recent", href: "/recent", icon: "history" },
  { label: "Import Center", href: "/imports", icon: "cloud_upload" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { collections, conversations, preferences } = useVaultData();

  return (
    <aside className="hidden lg:flex w-[260px] flex-shrink-0 bg-surface-container-low flex-col justify-between p-space-md select-none border-r border-outline-variant/15">
      <div className="flex flex-col gap-space-lg">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-space-xs">
          <Link href="/dashboard" className="flex items-center gap-space-sm group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-container to-inverse-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
              <MaterialIcon name="terminal" className="text-[20px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-semibold">
                ChatVault
              </span>
              <span className="font-label-sm text-label-sm text-outline tracking-wider uppercase">
                Obsidian v2.4
              </span>
            </div>
          </Link>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-tertiary font-label-sm text-label-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
            Local
          </span>
        </div>

        {/* Primary Action CTA */}
        <Link
          href="/imports"
          className="w-full py-2.5 px-space-md rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary font-body-md text-body-md font-semibold flex items-center justify-center gap-space-sm shadow-lg shadow-primary-container/20 hover:opacity-95 transition-all"
        >
          <MaterialIcon name="upload_file" className="text-[18px]" />
          <span>Import Chats</span>
        </Link>

        {/* Main Navigation */}
        <nav aria-label="Workspace navigation" className="flex flex-col gap-1">
          <div className="px-space-sm py-1 font-label-sm text-label-sm text-outline uppercase tracking-wider">
            Workspace
          </div>
          {PRIMARY_NAV.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between px-space-sm py-2 rounded-lg transition-all",
                  isActive
                    ? "bg-primary-container text-on-primary-container font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                )}
              >
                <div className="flex items-center gap-space-sm">
                  <MaterialIcon
                    name={item.icon}
                    filled={isActive && item.icon === "star"}
                    className="text-[20px]"
                  />
                  <span className="font-body-md text-body-md">{item.label}</span>
                </div>
                {item.href === "/conversations" && conversations.length > 0 && (
                  <span
                    className={cn(
                      "font-label-sm text-label-sm px-1.5 py-0.5 rounded",
                      isActive
                        ? "bg-black/20 text-on-primary-container"
                        : "bg-surface-container text-outline"
                    )}
                  >
                    {conversations.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Pinned Collections */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-space-sm py-1">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Subject Vaults
            </span>
            <Link
              href="/collections/new"
              className="text-outline hover:text-primary transition-colors"
              title="Create Collection"
            >
              <MaterialIcon name="add" className="text-[16px]" />
            </Link>
          </div>
          <div className="flex flex-col gap-1 max-h-44 overflow-y-auto pr-1">
            {collections.slice(0, 5).map((col) => {
              const active = pathname === `/collections/${col.id}`;
              const dotColor =
                col.accentColor === "cyan"
                  ? "bg-secondary"
                  : col.accentColor === "emerald"
                  ? "bg-tertiary"
                  : "bg-primary";
              return (
                <Link
                  key={col.id}
                  href={`/collections/${col.id}`}
                  className={cn(
                    "flex items-center justify-between px-space-sm py-1.5 rounded-lg text-body-sm transition-colors",
                    active
                      ? "bg-surface-container-high text-on-surface font-medium"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={cn("w-2 h-2 rounded-full shrink-0", dotColor)} />
                    <span className="truncate">{col.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom User & Local Storage Status */}
      <div className="flex flex-col gap-space-sm pt-space-md border-t border-outline-variant/15">
        <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              IndexedDB Engine
            </span>
            <span className="font-label-sm text-label-sm text-tertiary">
              {conversations.length} Chats
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-container-lowest overflow-hidden">
            <div className="w-1/3 h-full bg-gradient-to-r from-primary to-secondary rounded-full" />
          </div>
          <span className="font-label-sm text-label-sm text-outline">
            100% Local Browser Storage
          </span>
        </div>

        <Link
          href="/settings"
          className="flex items-center justify-between px-space-xs py-1 rounded-lg hover:bg-surface-container transition-colors"
        >
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-label-md text-label-md">
              {preferences.userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-body-sm text-body-sm text-on-surface font-medium">
                {preferences.userName}
              </span>
              <span className="font-label-sm text-label-sm text-outline">
                {preferences.userRole}
              </span>
            </div>
          </div>
          <MaterialIcon name="unfold_more" className="text-outline text-[18px]" />
        </Link>
      </div>
    </aside>
  );
}
