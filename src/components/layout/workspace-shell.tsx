"use client";

import React from "react";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { MobileNavigation } from "./mobile-navigation";
import { CommandPaletteModal } from "@/components/search/command-palette-modal";
import { useVaultData } from "@/hooks/use-vault-data";

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const { preferences } = useVaultData();

  return (
    <div
      data-theme={preferences.themeMode}
      data-accent={preferences.accentTheme}
      className="flex h-screen w-full overflow-hidden bg-surface text-on-surface"
    >
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-surface pb-20 lg:pb-0">
        <AppHeader />
        <main className="flex-1 w-full">{children}</main>
      </div>
      <MobileNavigation />
      <CommandPaletteModal />
    </div>
  );
}
