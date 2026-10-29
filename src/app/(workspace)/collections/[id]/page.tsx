"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useVaultData } from "@/hooks/use-vault-data";
import {
  collectionRepository,
  conversationRepository,
} from "@/db/repositories";
import { CollectionCoverArt } from "@/components/collections/collection-cover-art";
import { ConversationCard } from "@/components/conversations/conversation-card";
import { MaterialIcon } from "@/components/ui/material-icon";
import {
  downloadTextFile,
  formatConversationAsMarkdown,
} from "@/lib/export/backup-service";
import { toast } from "sonner";

export default function CollectionDetailsPage() {
  const params = useParams<{ id: string }>();
  const { collections, conversations, messages, studyNotes } = useVaultData();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>("all");
  const [showAddChatSelect, setShowAddChatSelect] = useState(false);

  const collection = useMemo(
    () =>
      collections.find(
        (c) => c.id === params.id || c.slug === params.id
      ),
    [collections, params.id]
  );

  const collectionConversations = useMemo(() => {
    if (!collection) return [];
    return conversations.filter((c) => c.collectionIds.includes(collection.id));
  }, [conversations, collection]);

  const unassignedConversations = useMemo(() => {
    if (!collection) return [];
    return conversations.filter((c) => !c.collectionIds.includes(collection.id));
  }, [conversations, collection]);

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return collectionConversations.filter((c) => {
      if (
        activeTag !== "all" &&
        !c.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase())
      ) {
        return false;
      }
      if (q) {
        const hay = `${c.title} ${c.summary} ${c.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [collectionConversations, searchQuery, activeTag]);

  const allCollectionTags = useMemo(() => {
    const set = new Set<string>(collection?.tags || []);
    for (const c of collectionConversations) {
      for (const t of c.tags) set.add(t);
    }
    return Array.from(set);
  }, [collection, collectionConversations]);

  if (!collection) {
    return (
      <div className="p-margin max-w-4xl mx-auto text-center space-y-4">
        <MaterialIcon name="folder_off" className="text-outline text-[40px]" />
        <h1 className="font-headline-md text-headline-md text-on-surface">
          Collection Not Found
        </h1>
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-body-sm font-semibold"
        >
          Back to My Collections
        </Link>
      </div>
    );
  }

  const totalFormulas = collectionConversations.reduce(
    (s, c) => s + c.formulaCount,
    0
  );
  const totalCodeBlocks = collectionConversations.reduce(
    (s, c) => s + c.codeBlockCount,
    0
  );

  const handleToggleCollectionFav = async () => {
    const next = await collectionRepository.toggleFavorite(collection.id);
    toast.success(next ? "Collection starred" : "Collection unstarred");
  };

  const handleAddConversationToVault = async (convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;
    await conversationRepository.assignCollections(convId, [
      ...conv.collectionIds,
      collection.id,
    ]);
    toast.success(`Added "${conv.title}" to ${collection.name}`);
    setShowAddChatSelect(false);
  };

  const handleExportCollectionMarkdown = () => {
    if (collectionConversations.length === 0) {
      toast.error("No conversations in this collection to export.");
      return;
    }
    const content = collectionConversations
      .map((conv) => {
        const convMsgs = messages
          .filter((m) => m.conversationId === conv.id)
          .sort((a, b) => a.orderIndex - b.orderIndex);
        const convNotes = studyNotes.filter((n) => n.conversationId === conv.id);
        return formatConversationAsMarkdown(conv, convMsgs, convNotes, [
          collection.name,
        ]);
      })
      .join("\n\n\n");

    downloadTextFile(
      `${collection.slug}-synthesis.md`,
      content,
      "text/markdown"
    );
    toast.success(`Exported ${collection.name} synthesis bundle`);
  };

  return (
    <div className="p-gutter-mobile lg:p-margin max-w-7xl mx-auto space-y-space-xl">
      {/* Collection Hero Banner */}
      <div className="rounded-2xl bg-surface-container-low overflow-hidden border border-outline-variant/20 shadow-xl">
        <div className="relative">
          <CollectionCoverArt
            coverStyle={collection.coverStyle}
            accentColor={collection.accentColor}
            coverImageUrl={collection.coverImageUrl}
            className="h-44"
          />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Link
              href="/collections"
              className="px-3 py-1.5 rounded-lg bg-surface-container-lowest/85 backdrop-blur-md text-on-surface font-label-sm text-label-sm flex items-center gap-1 border border-white/10"
            >
              <MaterialIcon name="arrow_back" className="text-[14px]" />
              <span>All Collections</span>
            </Link>
          </div>
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleCollectionFav}
              className="px-3 py-1.5 rounded-lg bg-surface-container-lowest/85 backdrop-blur-md text-on-surface font-label-sm text-label-sm flex items-center gap-1 border border-white/10"
            >
              <MaterialIcon
                name="star"
                filled={collection.isFavorite}
                className={collection.isFavorite ? "text-primary text-[16px]" : "text-outline text-[16px]"}
              />
              <span>{collection.isFavorite ? "Starred" : "Star"}</span>
            </button>
            <Link
              href={`/collections/${collection.id}/customize`}
              className="px-3 py-1.5 rounded-lg bg-surface-container-lowest/85 backdrop-blur-md text-primary font-label-sm text-label-sm flex items-center gap-1 border border-white/10"
            >
              <MaterialIcon name="palette" className="text-[16px]" />
              <span>Customize Studio</span>
            </Link>
          </div>
        </div>

        <div className="p-space-lg flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center">
                <MaterialIcon name={collection.icon} className="text-[22px]" />
              </div>
              <h1 className="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface">
                {collection.name}
              </h1>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {collection.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-surface-container text-center">
              <div className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                {collectionConversations.length}
              </div>
              <div className="font-label-sm text-label-sm text-outline uppercase">
                Dialogs
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-surface-container text-center">
              <div className="font-headline-sm text-headline-sm text-primary font-semibold">
                {totalFormulas}
              </div>
              <div className="font-label-sm text-label-sm text-outline uppercase">
                Formulas
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-surface-container text-center">
              <div className="font-headline-sm text-headline-sm text-secondary font-semibold">
                {totalCodeBlocks}
              </div>
              <div className="font-label-sm text-label-sm text-outline uppercase">
                Code Blocks
              </div>
            </div>
            <button
              type="button"
              onClick={handleExportCollectionMarkdown}
              className="px-4 py-3 rounded-xl bg-primary text-on-primary font-body-sm text-body-sm font-semibold flex items-center gap-1.5 shadow-md"
            >
              <MaterialIcon name="download" className="text-[18px]" />
              <span>Export Synthesis .md</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Add Conversation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-space-md rounded-xl bg-surface-container-low border border-outline-variant/15">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTag("all")}
            className={`px-3 py-1 rounded-full font-label-sm text-label-sm ${
              activeTag === "all"
                ? "bg-primary text-on-primary font-semibold"
                : "bg-surface-container text-on-surface-variant"
            }`}
          >
            All Topics ({collectionConversations.length})
          </button>
          {allCollectionTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1 rounded-full font-label-sm text-label-sm ${
                activeTag === tag
                  ? "bg-primary text-on-primary font-semibold"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface-container-lowest rounded-lg px-3 py-1.5 border border-outline-variant/25">
            <MaterialIcon name="search" className="text-outline text-[16px] mr-1.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${collection.name}...`}
              className="bg-transparent text-on-surface font-body-sm text-body-sm focus:outline-none placeholder:text-outline w-48"
            />
          </div>

          {unassignedConversations.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAddChatSelect((v) => !v)}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-sm text-body-sm flex items-center gap-1"
            >
              <MaterialIcon name="add" className="text-[16px] text-primary" />
              <span>Add Chat</span>
            </button>
          )}
        </div>
      </div>

      {showAddChatSelect && unassignedConversations.length > 0 && (
        <div className="p-4 rounded-xl bg-surface-container-high border border-primary/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-body-sm text-body-sm text-on-surface">
            Assign an existing conversation into <strong>{collection.name}</strong>:
          </span>
          <select
            aria-label="Select conversation to add to collection"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) handleAddConversationToVault(e.target.value);
            }}
            className="px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm border border-outline-variant/30"
          >
            <option value="" disabled>
              Select a conversation...
            </option>
            {unassignedConversations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Conversations in this Collection */}
      {filteredConversations.length === 0 ? (
        <div className="rounded-2xl bg-surface-container-low p-10 text-center space-y-3 border border-outline-variant/15">
          <MaterialIcon name="forum" className="text-outline text-[32px]" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            No Conversations in This View
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
            Add existing conversations using the &ldquo;Add Chat&rdquo; button above or import a new
            ChatGPT archive directly into {collection.name}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {filteredConversations.map((conv) => (
            <ConversationCard
              key={conv.id}
              conversation={conv}
              collectionNames={[collection.name]}
              onToggleFavorite={(id) => conversationRepository.toggleFavorite(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
