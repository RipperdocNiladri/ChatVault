"use client";

import React from "react";
import Link from "next/link";
import { useUIStore } from "@/store/ui-store";
import { useVaultData } from "@/hooks/use-vault-data";
import { clearDemoData, seedDemoData } from "@/db/repositories";
import { MaterialIcon } from "@/components/ui/material-icon";
import { toast } from "sonner";

export function AppHeader() {
  const { openCommandPalette, openShortcutsModal } = useUIStore();
  const { conversations } = useVaultData();

  const hasDemoItems = conversations.some((c) => c.isDemo);

  const handleToggleDemoData = async () => {
    if (hasDemoItems) {
      await clearDemoData();
      toast.success("Demo sample conversations cleared. Your vault is now clean.");
    } else {
      await seedDemoData(true);
      toast.success("Sample academic & engineering conversations loaded.");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-surface/85 backdrop-blur-xl px-gutter-mobile lg:px-margin py-space-sm flex items-center justify-between gap-space-md border-b border-outline-variant/15">
      {/* Left: Mobile Brand + Search Trigger */}
      <div className="flex items-center gap-space-sm flex-1 max-w-xl">
        <Link
          href="/dashboard"
          className="lg:hidden w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0"
          aria-label="ChatVault Home"
        >
          <MaterialIcon name="terminal" className="text-[20px]" />
        </Link>

        <button
          type="button"
          onClick={openCommandPalette}
          className="w-full flex items-center justify-between bg-surface-container-lowest hover:bg-surface-container px-space-md py-2 rounded-lg transition-all border border-outline-variant/20 hover:border-primary/40 text-left group"
        >
          <div className="flex items-center gap-space-sm min-w-0">
            <MaterialIcon
              name="search"
              className="text-outline group-hover:text-secondary text-[18px]"
            />
            <span className="font-body-md text-body-md text-outline truncate">
              Search {conversations.length} conversations, code blocks, LaTeX formulas...
            </span>
          </div>
          <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm shrink-0 ml-2">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-space-xs sm:gap-space-sm">
        {/* Demo Mode Indicator / Reset Toggle */}
        <button
          type="button"
          onClick={handleToggleDemoData}
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant transition-colors border border-outline-variant/20"
          title={
            hasDemoItems
              ? "Click to clear preloaded demo data"
              : "Click to load sample demo conversations"
          }
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              hasDemoItems ? "bg-secondary" : "bg-tertiary"
            }`}
          />
          <span>{hasDemoItems ? "Demo Data Active • Clear" : "Load Demo Data"}</span>
        </button>

        <Link
          href="/collections/new"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm transition-colors"
        >
          <MaterialIcon name="create_new_folder" className="text-primary text-[18px]" />
          <span>New Vault</span>
        </Link>

        <Link
          href="/imports"
          className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
          title="Import ChatGPT Archive"
          aria-label="Import ChatGPT Archive"
        >
          <MaterialIcon name="upload_file" className="text-[20px]" />
        </Link>

        <button
          type="button"
          onClick={openShortcutsModal}
          className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
          title="Keyboard Shortcuts (?)"
          aria-label="Keyboard Shortcuts"
        >
          <MaterialIcon name="keyboard" className="text-[20px]" />
        </button>
      </div>
    </header>
  );
}
