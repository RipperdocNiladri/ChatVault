"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/ui-store";
import { useVaultData } from "@/hooks/use-vault-data";
import { executeVaultSearch } from "@/lib/search/search-service";
import { MaterialIcon } from "@/components/ui/material-icon";

export function CommandPaletteModal() {
  const router = useRouter();
  const {
    isCommandPaletteOpen,
    closeCommandPalette,
    toggleCommandPalette,
    isShortcutsModalOpen,
    openShortcutsModal,
    closeShortcutsModal,
  } = useUIStore();

  const { conversations, messages, collections, studyNotes } = useVaultData();
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const shortcutsDialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcuts (Cmd/Ctrl+K, Cmd/Ctrl+N, ?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCommandPalette();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n" && !isEditable) {
        e.preventDefault();
        router.push("/collections/new");
      } else if (e.key === "?" && !isEditable) {
        e.preventDefault();
        openShortcutsModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCommandPalette, openShortcutsModal, router]);

  // Manage Command Palette native <dialog> showModal() & light-dismiss fallback
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isCommandPaletteOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      setTimeout(() => inputRef.current?.focus(), 20);
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isCommandPaletteOpen]);

  // Fallback for browsers without closedby="any" support per modern-web-guidance
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => closeCommandPalette();
    dialog.addEventListener("close", handleClose);

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (!isDialogContent) {
        dialog.close();
      }
    };

    if (!("closedBy" in HTMLDialogElement.prototype)) {
      dialog.addEventListener("click", handleBackdropClick);
    }

    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("click", handleBackdropClick);
    };
  }, [closeCommandPalette]);

  // Manage Shortcuts native <dialog>
  useEffect(() => {
    const dialog = shortcutsDialogRef.current;
    if (!dialog) return;
    if (isShortcutsModalOpen) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isShortcutsModalOpen]);

  useEffect(() => {
    const dialog = shortcutsDialogRef.current;
    if (!dialog) return;
    const handleClose = () => closeShortcutsModal();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [closeShortcutsModal]);

  const searchResults = useMemo(() => {
    return executeVaultSearch(
      query,
      conversations,
      messages,
      collections,
      studyNotes
    ).hits.slice(0, 6);
  }, [query, conversations, messages, collections, studyNotes]);

  const navigateTo = (href: string) => {
    closeCommandPalette();
    router.push(href);
  };

  return (
    <>
      <dialog
        ref={dialogRef}
        closedby="any"
        aria-labelledby="command-palette-title"
        className="w-full max-w-2xl rounded-2xl bg-surface-container-high text-on-surface p-0 shadow-2xl border border-outline-variant/30 backdrop:bg-black/75 backdrop:backdrop-blur-md"
      >
        <div className="flex flex-col max-h-[80vh]">
          <h2 id="command-palette-title" className="sr-only">
            ChatVault Global Command & Search Center
          </h2>

          {/* Search Input Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-outline-variant/20 bg-surface-container">
            <MaterialIcon name="manage_search" className="text-secondary text-[22px]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  navigateTo(`/search?q=${encodeURIComponent(query.trim())}`);
                }
              }}
              placeholder="Search titles, prompts, LaTeX formulas, code snippets..."
              className="flex-1 bg-transparent text-on-surface font-body-lg text-body-lg focus:outline-none placeholder:text-outline"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 rounded-md text-outline hover:text-on-surface"
              >
                <MaterialIcon name="close" className="text-[18px]" />
              </button>
            )}
            <button
              type="button"
              onClick={closeCommandPalette}
              className="px-2 py-1 rounded bg-surface-container-lowest text-outline font-label-sm text-label-sm font-mono hover:text-on-surface"
            >
              ESC
            </button>
          </div>

          {/* Results List */}
          <div className="p-3 overflow-y-auto space-y-4">
            {/* Quick Navigation Actions */}
            <div>
              <div className="px-2 pb-1.5 font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Quick Actions
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo(`/search${query ? `?q=${encodeURIComponent(query)}` : ""}`)}
                  className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-highest text-left flex items-center gap-2 transition-colors"
                >
                  <MaterialIcon name="search" className="text-secondary text-[18px]" />
                  <span className="font-body-sm text-body-sm font-medium truncate">Full Search</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo("/imports")}
                  className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-highest text-left flex items-center gap-2 transition-colors"
                >
                  <MaterialIcon name="upload_file" className="text-primary text-[18px]" />
                  <span className="font-body-sm text-body-sm font-medium truncate">Import .zip</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo("/collections/new")}
                  className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-highest text-left flex items-center gap-2 transition-colors"
                >
                  <MaterialIcon name="create_new_folder" className="text-tertiary text-[18px]" />
                  <span className="font-body-sm text-body-sm font-medium truncate">New Collection</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo("/favorites")}
                  className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-highest text-left flex items-center gap-2 transition-colors"
                >
                  <MaterialIcon name="star" className="text-primary text-[18px]" />
                  <span className="font-body-sm text-body-sm font-medium truncate">Favorites</span>
                </button>
              </div>
            </div>

            {/* Matched Conversations */}
            <div>
              <div className="px-2 pb-1.5 flex items-center justify-between font-label-sm text-label-sm text-outline uppercase tracking-wider">
                <span>{query.trim() ? "Matching Conversations" : "Recent Conversations"}</span>
                <span>{searchResults.length} shown</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-6 text-center text-on-surface-variant font-body-md">
                  No conversations matched &ldquo;{query}&rdquo;.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {searchResults.map((hit) => (
                    <button
                      key={hit.conversation.id}
                      type="button"
                      onClick={() => navigateTo(`/conversations/${hit.conversation.id}`)}
                      className="w-full p-3 rounded-xl bg-surface-container hover:bg-surface-container-highest text-left flex items-start justify-between gap-3 transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-body-md text-body-md font-semibold text-on-surface group-hover:text-primary truncate">
                            {hit.conversation.title}
                          </span>
                          {hit.collectionNames[0] && (
                            <span className="px-1.5 py-0.5 rounded bg-primary-container/20 text-primary font-label-sm text-label-sm shrink-0">
                              {hit.collectionNames[0]}
                            </span>
                          )}
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                          {hit.snippet}
                        </p>
                      </div>
                      <MaterialIcon
                        name="arrow_forward"
                        className="text-outline group-hover:text-primary text-[18px] mt-1 shrink-0"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-surface-container-lowest flex items-center justify-between text-outline font-label-sm text-label-sm border-t border-outline-variant/20">
            <div className="flex items-center gap-3">
              <span>↵ Open result</span>
              <span>•</span>
              <span>ESC Close</span>
            </div>
            <span className="text-tertiary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
              MiniSearch Local Full-Text Index
            </span>
          </div>
        </div>
      </dialog>

      {/* Keyboard Shortcuts Reference Modal */}
      <dialog
        ref={shortcutsDialogRef}
        closedby="any"
        aria-labelledby="shortcuts-dialog-title"
        className="w-full max-w-xl rounded-2xl bg-surface-container-high text-on-surface p-space-lg shadow-2xl border border-outline-variant/30 backdrop:bg-black/75 backdrop:backdrop-blur-md"
      >
        <div className="flex flex-col gap-space-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <MaterialIcon name="keyboard" className="text-primary text-[22px]" />
              <h3 id="shortcuts-dialog-title" className="font-headline-sm text-headline-sm text-on-surface">
                Keyboard Shortcuts Cheat Sheet
              </h3>
            </div>
            <button
              type="button"
              onClick={closeShortcutsModal}
              className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
            >
              <MaterialIcon name="close" className="text-[20px]" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-2">
              <span className="font-label-sm text-label-sm text-outline uppercase font-mono">
                Global Commands
              </span>
              <div className="flex items-center justify-between p-2 rounded bg-surface-container">
                <span className="font-body-sm text-body-sm text-on-surface">Command Search</span>
                <kbd className="font-label-sm text-label-sm font-mono text-primary bg-surface-container-lowest px-1.5 py-0.5 rounded">
                  ⌘ / Ctrl + K
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-container">
                <span className="font-body-sm text-body-sm text-on-surface">New Collection</span>
                <kbd className="font-label-sm text-label-sm font-mono text-outline bg-surface-container-lowest px-1.5 py-0.5 rounded">
                  ⌘ / Ctrl + N
                </kbd>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-label-sm text-label-sm text-outline uppercase font-mono">
                Workspace Navigation
              </span>
              <div className="flex items-center justify-between p-2 rounded bg-surface-container">
                <span className="font-body-sm text-body-sm text-on-surface">Shortcut Help</span>
                <kbd className="font-label-sm text-label-sm font-mono text-outline bg-surface-container-lowest px-1.5 py-0.5 rounded">
                  ?
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-container">
                <span className="font-body-sm text-body-sm text-on-surface">Dismiss Dialog</span>
                <kbd className="font-label-sm text-label-sm font-mono text-outline bg-surface-container-lowest px-1.5 py-0.5 rounded">
                  ESC
                </kbd>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={closeShortcutsModal}
              className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface font-body-sm text-body-sm"
            >
              Done
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
