"use client";

import React, { useEffect, useRef, useState } from "react";
import { useVaultData } from "@/hooks/use-vault-data";
import {
  clearDemoData,
  getVaultStorageDiagnostics,
  preferencesRepository,
  purgeAllVaultData,
  seedDemoData,
} from "@/db/repositories";
import {
  downloadTextFile,
  exportFullVaultBackupJson,
  restoreFullVaultBackupJson,
} from "@/lib/export/backup-service";
import { useUIStore } from "@/store/ui-store";
import { MaterialIcon } from "@/components/ui/material-icon";
import { formatBytes } from "@/lib/utils";
import type { AccentTheme } from "@/types/entities";
import { toast } from "sonner";

export default function SettingsPage() {
  const { preferences, conversations } = useVaultData();
  const { openShortcutsModal } = useUIStore();
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const [diagnostics, setDiagnostics] = useState({
    conversationCount: 0,
    messageCount: 0,
    collectionCount: 0,
    noteCount: 0,
    jobCount: 0,
    transcriptBytes: 0,
    collectionBytes: 0,
    notesBytes: 0,
    totalBytes: 0,
  });
  const [restoreMode, setRestoreMode] = useState<"merge" | "replace">("merge");
  const [confirmPurge, setConfirmPurge] = useState(false);

  useEffect(() => {
    getVaultStorageDiagnostics().then(setDiagnostics);
  }, [conversations.length]);

  const handleUpdatePref = async (
    patch: Parameters<typeof preferencesRepository.update>[0],
    msg = "Preferences updated locally"
  ) => {
    await preferencesRepository.update(patch);
    toast.success(msg);
  };

  const handleExportBackup = async () => {
    const json = await exportFullVaultBackupJson();
    const datePart = new Date().toISOString().slice(0, 10);
    downloadTextFile(
      `chatvault-backup-${datePart}.json`,
      json,
      "application/json"
    );
    toast.success("Downloaded full ChatVault JSON backup");
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const res = await restoreFullVaultBackupJson(text, restoreMode);
      const updatedDiag = await getVaultStorageDiagnostics();
      setDiagnostics(updatedDiag);
      toast.success(
        `Restored ${res.conversationsRestored} conversations and ${res.collectionsRestored} collections`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to restore backup file"
      );
    } finally {
      e.target.value = "";
    }
  };

  const handlePurgeVault = async () => {
    await purgeAllVaultData();
    const updatedDiag = await getVaultStorageDiagnostics();
    setDiagnostics(updatedDiag);
    setConfirmPurge(false);
    toast.success("All local IndexedDB vault records have been purged.");
  };

  return (
    <div className="p-gutter-mobile lg:p-margin max-w-6xl mx-auto space-y-space-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md border-b border-outline-variant/15 pb-4">
        <div>
          <span className="font-label-md text-label-md text-primary uppercase tracking-wider">
            System Configuration &amp; Storage
          </span>
          <h1 className="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface mt-1">
            Settings &amp; Personalization
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Customize your Obsidian Archive theme, typography, and local IndexedDB backup lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={async () => {
              await preferencesRepository.reset();
              toast.info("Restored default preferences");
            }}
            className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-body-sm text-body-sm font-semibold shadow-md flex items-center gap-1.5"
          >
            <MaterialIcon name="download" className="text-[18px]" />
            <span>Export Vault Backup</span>
          </button>
        </div>
      </div>

      {/* 1. Atmospheric Theme & Accent Palette */}
      <section className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/15 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <MaterialIcon name="palette" className="text-primary text-[20px]" />
              <span>Appearance &amp; Atmospheric Surface</span>
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Select your preferred dark canvas luminance and accent color tokens.
            </p>
          </div>
        </div>

        {/* Theme Mode Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(
            [
              {
                id: "obsidian",
                title: "Obsidian Archive",
                subtitle: "Signature #111318 deep slate",
                bgPreview: "bg-[#111318]",
              },
              {
                id: "carbon",
                title: "OLED Carbon",
                subtitle: "Pure high-contrast #07080A",
                bgPreview: "bg-[#07080a]",
              },
              {
                id: "slate",
                title: "Academic Slate",
                subtitle: "Softened #151922 studio tone",
                bgPreview: "bg-[#151922]",
              },
            ] as const
          ).map((theme) => {
            const active = preferences.themeMode === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() =>
                  handleUpdatePref(
                    { themeMode: theme.id },
                    `Atmospheric theme set to ${theme.title}`
                  )
                }
                className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between gap-3 ${
                  active
                    ? "bg-surface-container-high border-primary ring-2 ring-primary/40"
                    : "bg-surface-container border-outline-variant/20 hover:border-outline"
                }`}
              >
                <div className={`w-full h-12 rounded-lg ${theme.bgPreview} border border-white/10`} />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-body-md text-body-md font-semibold text-on-surface">
                      {theme.title}
                    </div>
                    <div className="font-label-sm text-label-sm text-outline">
                      {theme.subtitle}
                    </div>
                  </div>
                  <MaterialIcon
                    name={active ? "check_circle" : "radio_button_unchecked"}
                    filled={active}
                    className={active ? "text-primary text-[20px]" : "text-outline text-[20px]"}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Accent Swatches */}
        <div className="space-y-2 pt-2">
          <span className="font-label-sm text-label-sm text-outline uppercase block">
            Primary Accent Token
          </span>
          <div className="flex flex-wrap gap-2.5">
            {(
              [
                { id: "violet", label: "Electric Violet", dot: "bg-[#d0bcff]" },
                { id: "cyan", label: "Quantum Cyan", dot: "bg-[#5de6ff]" },
                { id: "emerald", label: "Emerald Pulse", dot: "bg-[#4edea3]" },
                { id: "amber", label: "Solar Amber", dot: "bg-amber-300" },
                { id: "rose", label: "Crimson Rose", dot: "bg-rose-300" },
              ] as Array<{ id: AccentTheme; label: string; dot: string }>
            ).map((swatch) => {
              const active = preferences.accentTheme === swatch.id;
              return (
                <button
                  key={swatch.id}
                  type="button"
                  onClick={() =>
                    handleUpdatePref(
                      { accentTheme: swatch.id },
                      `Accent palette updated to ${swatch.label}`
                    )
                  }
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-2 border transition-all ${
                    active
                      ? "bg-surface-container-high border-primary text-on-surface font-semibold"
                      : "bg-surface-container border-outline-variant/20 text-on-surface-variant"
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${swatch.dot}`} />
                  <span className="font-body-sm text-body-sm">{swatch.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reading Font Size & Code Wrap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-surface-container flex items-center justify-between">
            <div>
              <div className="font-body-sm text-body-sm font-semibold text-on-surface">
                Reader Font Scale
              </div>
              <div className="font-label-sm text-label-sm text-outline">
                Transcript body &amp; equation size
              </div>
            </div>
            <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg">
              {(["sm", "md", "lg"] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() =>
                    handleUpdatePref({ readingFontSize: sz }, `Reader font size set to ${sz.toUpperCase()}`)
                  }
                  className={`px-2.5 py-1 rounded font-label-sm text-label-sm uppercase ${
                    preferences.readingFontSize === sz
                      ? "bg-primary text-on-primary font-semibold"
                      : "text-outline hover:text-on-surface"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <label className="p-4 rounded-xl bg-surface-container flex items-center justify-between cursor-pointer">
            <div>
              <div className="font-body-sm text-body-sm font-semibold text-on-surface">
                Wrap Long Code Lines
              </div>
              <div className="font-label-sm text-label-sm text-outline">
                Prevent horizontal scroll in transcript code blocks
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.codeBlockWrap}
              onChange={(e) =>
                handleUpdatePref({ codeBlockWrap: e.target.checked })
              }
              className="w-5 h-5 accent-primary"
            />
          </label>
        </div>
      </section>

      {/* 2. Local IndexedDB Storage Diagnostics & Backup */}
      <section className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/15 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <MaterialIcon name="database" className="text-secondary text-[20px]" />
              <span>Local IndexedDB Vault Diagnostics</span>
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Live breakdown of browser-persisted tables (`ChatVaultObsidianDB`).
            </p>
          </div>
          <span className="font-code text-label-md text-tertiary">
            Total Used: {formatBytes(diagnostics.totalBytes)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-surface-container">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Conversations
            </span>
            <div className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-1">
              {diagnostics.conversationCount}
            </div>
            <span className="font-code text-label-sm text-secondary">
              {diagnostics.messageCount} messages
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-container">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Collections
            </span>
            <div className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-1">
              {diagnostics.collectionCount}
            </div>
            <span className="font-code text-label-sm text-primary">
              {formatBytes(diagnostics.collectionBytes)}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-container">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Study Notes
            </span>
            <div className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-1">
              {diagnostics.noteCount}
            </div>
            <span className="font-code text-label-sm text-tertiary">
              {formatBytes(diagnostics.notesBytes)}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-container">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Search Engine
            </span>
            <div className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-1">
              MiniSearch
            </div>
            <span className="font-code text-label-sm text-outline">
              Client-Side BM25
            </span>
          </div>
        </div>

        {/* Backup Export & Restore Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-surface-container space-y-3">
            <div className="font-body-md text-body-md font-semibold text-on-surface">
              Export Complete Vault Snapshot (.json)
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Downloads all conversations, messages, custom collections, study notes, and
              preferences into a portable JSON archive.
            </p>
            <button
              type="button"
              onClick={handleExportBackup}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-semibold flex items-center gap-1.5"
            >
              <MaterialIcon name="download" className="text-[16px]" />
              <span>Download Backup JSON</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-surface-container space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-body-md text-body-md font-semibold text-on-surface">
                Restore Vault Snapshot (.json)
              </span>
              <select
                aria-label="Restore mode"
                value={restoreMode}
                onChange={(e) => setRestoreMode(e.target.value as "merge" | "replace")}
                className="px-2 py-1 rounded bg-surface-container-lowest text-on-surface font-label-sm text-label-sm border border-outline-variant/30"
              >
                <option value="merge">Merge with current</option>
                <option value="replace">Replace current</option>
              </select>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Restore a previously exported ChatVault backup file with full Zod schema validation.
            </p>
            <input
              ref={restoreInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleRestoreFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => restoreInputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface font-body-sm text-body-sm font-medium flex items-center gap-1.5"
            >
              <MaterialIcon name="upload_file" className="text-[16px] text-secondary" />
              <span>Select Backup JSON to Restore</span>
            </button>
          </div>
        </div>

        {/* Demo Data & Danger Zone */}
        <div className="pt-3 border-t border-outline-variant/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await seedDemoData(true);
                const updatedDiag = await getVaultStorageDiagnostics();
                setDiagnostics(updatedDiag);
                toast.success("Sample demo conversations restored");
              }}
              className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm"
            >
              Reload Sample Demo Data
            </button>
            <button
              type="button"
              onClick={async () => {
                await clearDemoData();
                const updatedDiag = await getVaultStorageDiagnostics();
                setDiagnostics(updatedDiag);
                toast.success("Cleared sample demo records");
              }}
              className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-body-sm text-body-sm"
            >
              Clear Demo Data Only
            </button>
          </div>

          {confirmPurge ? (
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm text-error">
                Confirm permanent deletion?
              </span>
              <button
                type="button"
                onClick={handlePurgeVault}
                className="px-3 py-1.5 rounded-lg bg-error text-on-error font-label-sm text-label-sm font-semibold"
              >
                Yes, Purge All
              </button>
              <button
                type="button"
                onClick={() => setConfirmPurge(false)}
                className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmPurge(true)}
              className="px-3.5 py-2 rounded-lg bg-error-container/40 hover:bg-error-container text-error hover:text-on-error-container font-body-sm text-body-sm transition-colors flex items-center gap-1.5"
            >
              <MaterialIcon name="delete_forever" className="text-[18px]" />
              <span>Purge Entire Local Vault</span>
            </button>
          )}
        </div>
      </section>

      {/* 3. Keyboard Shortcuts & System Info */}
      <section className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/15 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-surface-container-highest text-primary">
            <MaterialIcon name="keyboard" className="text-[22px]" />
          </div>
          <div>
            <div className="font-body-md text-body-md font-semibold text-on-surface">
              Interactive Hotkey Reference
            </div>
            <div className="font-label-sm text-label-sm text-outline">
              View keyboard shortcuts for Command Search (`⌘K`), New Vault (`⌘N`), and modal
              navigation (`?`).
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={openShortcutsModal}
          className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-sm text-body-sm flex items-center gap-2 shrink-0"
        >
          <span>View Shortcuts</span>
          <kbd className="px-1.5 py-0.5 rounded bg-surface-container-lowest text-primary font-mono text-xs">
            ?
          </kbd>
        </button>
      </section>
    </div>
  );
}
