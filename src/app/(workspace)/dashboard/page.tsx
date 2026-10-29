"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useVaultData } from "@/hooks/use-vault-data";
import { collectionRepository, conversationRepository } from "@/db/repositories";
import { CollectionCard } from "@/components/collections/collection-card";
import { ConversationCard } from "@/components/conversations/conversation-card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useUIStore } from "@/store/ui-store";
import { toast } from "sonner";

export default function DashboardPage() {
  const { conversations, collections, studyNotes, preferences } = useVaultData();
  const { openCommandPalette } = useUIStore();

  const stats = useMemo(() => {
    const favoriteCount = conversations.filter((c) => c.isFavorite).length;
    const formulaCount = conversations.reduce((acc, c) => acc + (c.formulaCount || 0), 0);
    const codeCount = conversations.reduce((acc, c) => acc + (c.codeBlockCount || 0), 0);
    return {
      totalConversations: conversations.length,
      totalCollections: collections.length,
      favoriteCount,
      formulaCount,
      codeCount,
      notesCount: studyNotes.length,
    };
  }, [conversations, collections, studyNotes]);

  const collectionMap = useMemo(
    () => new Map(collections.map((c) => [c.id, c.name])),
    [collections]
  );

  const handleToggleConvFavorite = async (id: string) => {
    const next = await conversationRepository.toggleFavorite(id);
    toast.success(next ? "Added to Favorites" : "Removed from Favorites");
  };

  const handleToggleColFavorite = async (id: string) => {
    const next = await collectionRepository.toggleFavorite(id);
    toast.success(next ? "Collection starred" : "Collection unstarred");
  };

  return (
    <div className="p-gutter-mobile lg:p-margin max-w-7xl mx-auto space-y-space-xl">
      {/* Top Welcome Hero & Quick Actions */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant/20">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {preferences.userName} • 100% Offline IndexedDB Vault
            </span>
          </div>
          <h1 className="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface">
            Knowledge Command Center
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Browse your subject vaults, review mathematical derivations and code blocks, or import a
            new ChatGPT conversation archive.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:flex items-center gap-2.5">
          <Link
            href="/imports"
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-body-sm text-body-sm font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20"
          >
            <MaterialIcon name="file_upload" className="text-[18px]" />
            <span>Import .zip</span>
          </Link>
          <Link
            href="/collections/new"
            className="px-3.5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-sm text-body-sm font-medium flex items-center justify-center gap-1.5"
          >
            <MaterialIcon name="create_new_folder" className="text-primary text-[18px]" />
            <span>New Vault</span>
          </Link>
          <button
            type="button"
            onClick={openCommandPalette}
            className="px-3.5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-sm text-body-sm font-medium flex items-center justify-center gap-1.5"
          >
            <MaterialIcon name="manage_search" className="text-secondary text-[18px]" />
            <span>Search</span>
          </button>
        </div>
      </section>

      {/* Metrics Bento Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
        <Link
          href="/conversations"
          className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant/15 flex flex-col justify-between gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Total Conversations
            </span>
            <MaterialIcon name="forum" className="text-primary text-[20px]" />
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface font-semibold">
            {stats.totalConversations}
          </div>
          <span className="font-label-sm text-label-sm text-tertiary">
            Indexed for instant retrieval
          </span>
        </Link>

        <Link
          href="/collections"
          className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant/15 flex flex-col justify-between gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Subject Collections
            </span>
            <MaterialIcon name="folder_special" className="text-secondary text-[20px]" />
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface font-semibold">
            {stats.totalCollections}
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Customizable visual vaults
          </span>
        </Link>

        <Link
          href="/favorites"
          className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant/15 flex flex-col justify-between gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Starred Favorites
            </span>
            <MaterialIcon name="star" filled className="text-primary text-[20px]" />
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface font-semibold">
            {stats.favoriteCount}
          </div>
          <span className="font-label-sm text-label-sm text-primary">
            High-signal exam &amp; reference chats
          </span>
        </Link>

        <Link
          href="/search?scope=formulas"
          className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant/15 flex flex-col justify-between gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Code &amp; Formulas
            </span>
            <MaterialIcon name="functions" className="text-tertiary text-[20px]" />
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface font-semibold">
            {stats.codeCount + stats.formulaCount}
          </div>
          <span className="font-label-sm text-label-sm text-secondary">
            {stats.codeCount} code blocks • {stats.formulaCount} equations
          </span>
        </Link>
      </section>

      {/* Active Subject Collections Grid */}
      <section className="space-y-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MaterialIcon name="folder_special" className="text-primary text-[22px]" />
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Subject Collections
            </h2>
          </div>
          <Link
            href="/collections"
            className="font-label-md text-label-md text-secondary hover:underline flex items-center gap-1"
          >
            <span>View All ({collections.length})</span>
            <MaterialIcon name="arrow_forward" className="text-[16px]" />
          </Link>
        </div>

        {collections.length === 0 ? (
          <div className="rounded-2xl bg-surface-container-low p-8 text-center space-y-3 border border-outline-variant/15">
            <p className="font-body-lg text-body-lg text-on-surface">
              No subject collections created yet.
            </p>
            <Link
              href="/collections/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-body-sm font-semibold"
            >
              <MaterialIcon name="add" className="text-[18px]" />
              <span>Create First Collection</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {collections.slice(0, 6).map((col) => {
              const colConvs = conversations.filter((c) => c.collectionIds.includes(col.id));
              const codeTotal = colConvs.reduce((s, c) => s + c.codeBlockCount, 0);
              const formulaTotal = colConvs.reduce((s, c) => s + c.formulaCount, 0);

              return (
                <CollectionCard
                  key={col.id}
                  collection={col}
                  conversationCount={colConvs.length}
                  codeCount={codeTotal}
                  formulaCount={formulaTotal}
                  onToggleFavorite={handleToggleColFavorite}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Conversations & Study Notes Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Recent Conversations List */}
        <div className="lg:col-span-8 space-y-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MaterialIcon name="forum" className="text-secondary text-[22px]" />
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Recent AI Dialogues
              </h2>
            </div>
            <Link
              href="/conversations"
              className="font-label-md text-label-md text-secondary hover:underline flex items-center gap-1"
            >
              <span>All Conversations</span>
              <MaterialIcon name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>

          {conversations.length === 0 ? (
            <div className="rounded-2xl bg-surface-container-low p-8 text-center space-y-3 border border-outline-variant/15">
              <MaterialIcon name="cloud_upload" className="text-primary text-[32px]" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Your Vault is Ready for Import
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
                Upload your ChatGPT `.zip` or `conversations.json` export to populate your vault, or
                enable Demo Data from the top bar.
              </p>
              <Link
                href="/imports"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-body-sm font-semibold"
              >
                <MaterialIcon name="upload_file" className="text-[18px]" />
                <span>Go to Import Center</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-space-md">
              {conversations.slice(0, 4).map((conv) => (
                <ConversationCard
                  key={conv.id}
                  conversation={conv}
                  collectionNames={conv.collectionIds
                    .map((cid) => collectionMap.get(cid))
                    .filter(Boolean) as string[]}
                  onToggleFavorite={handleToggleConvFavorite}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pinned Study Notes & Quick Import Widget */}
        <div className="lg:col-span-4 space-y-space-md">
          <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/15 space-y-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MaterialIcon name="edit_note" className="text-tertiary text-[20px]" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Pinned Study Notes
                </h3>
              </div>
              <span className="font-label-sm text-label-sm text-outline">
                {studyNotes.length} saved
              </span>
            </div>

            {studyNotes.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant py-4">
                Open any conversation transcript to write and auto-save personal study notes.
              </p>
            ) : (
              <div className="space-y-2.5">
                {studyNotes.slice(0, 3).map((note) => (
                  <Link
                    key={note.id}
                    href={`/conversations/${note.conversationId}`}
                    className="block p-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-body-sm text-body-sm font-semibold text-on-surface truncate">
                        {note.title}
                      </span>
                      <MaterialIcon
                        name="open_in_new"
                        className="text-outline text-[14px] shrink-0"
                      />
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      {note.contentMarkdown}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Local Privacy Status Card */}
          <div className="p-space-md rounded-xl bg-gradient-to-br from-surface-container-high to-surface-container-low border border-outline-variant/20 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-tertiary/15 text-tertiary flex items-center justify-center">
                <MaterialIcon name="shield_lock" className="text-[18px]" />
              </div>
              <div>
                <h3 className="font-body-md text-body-md font-semibold text-on-surface">
                  Zero-Cloud Telemetry Active
                </h3>
                <span className="font-label-sm text-label-sm text-tertiary">
                  100% Local Browser Storage
                </span>
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              All transcripts, MiniSearch indexes, and custom covers are persisted inside local
              IndexedDB tables.
            </p>
            <Link
              href="/settings"
              className="w-full py-2 px-3 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors"
            >
              <MaterialIcon name="download" className="text-[16px]" />
              <span>Backup or Restore Vault</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
