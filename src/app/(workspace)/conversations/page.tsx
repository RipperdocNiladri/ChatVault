"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useVaultData } from "@/hooks/use-vault-data";
import { conversationRepository } from "@/db/repositories";
import { ConversationCard } from "@/components/conversations/conversation-card";
import { MaterialIcon } from "@/components/ui/material-icon";
import {
  downloadTextFile,
  formatConversationAsMarkdown,
} from "@/lib/export/backup-service";
import { toast } from "sonner";

export default function AllConversationsPage() {
  const { conversations, collections, messages, studyNotes } = useVaultData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [contentFilter, setContentFilter] = useState<
    "all" | "favorites" | "code" | "math"
  >("all");
  const [sortBy, setSortBy] = useState<
    "recent" | "oldest" | "alpha" | "messages"
  >("recent");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkTagInput, setBulkTagInput] = useState("");
  const [showBulkTagPrompt, setShowBulkTagPrompt] = useState(false);

  const collectionMap = useMemo(
    () => new Map(collections.map((c) => [c.id, c.name])),
    [collections]
  );

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = conversations.filter((conv) => {
      if (
        selectedCollection !== "all" &&
        !conv.collectionIds.includes(selectedCollection)
      ) {
        return false;
      }
      if (
        selectedProvider !== "all" &&
        conv.sourceProvider !== selectedProvider
      ) {
        return false;
      }
      if (contentFilter === "favorites" && !conv.isFavorite) return false;
      if (contentFilter === "code" && !conv.hasCode) return false;
      if (contentFilter === "math" && !conv.hasMath) return false;

      if (q) {
        const hay = `${conv.title} ${conv.summary} ${conv.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "alpha") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "messages") {
        return b.messageCount - a.messageCount;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [
    conversations,
    searchQuery,
    selectedCollection,
    selectedProvider,
    contentFilter,
    sortBy,
  ]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredConversations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredConversations.map((c) => c.id));
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const next = await conversationRepository.toggleFavorite(id);
    toast.success(next ? "Starred conversation" : "Removed from starred");
  };

  const handleDeleteOne = async (id: string) => {
    await conversationRepository.deleteByIds([id]);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    toast.success("Conversation deleted from local vault");
  };

  const handleBulkAssignCollection = async (collectionId: string) => {
    if (!collectionId || selectedIds.length === 0) return;
    await conversationRepository.bulkAssignCollection(selectedIds, collectionId);
    const colName = collectionMap.get(collectionId) || "Collection";
    toast.success(`Assigned ${selectedIds.length} chats to ${colName}`);
    setSelectedIds([]);
  };

  const handleBulkAddTag = async () => {
    if (!bulkTagInput.trim() || selectedIds.length === 0) return;
    await conversationRepository.bulkAddTag(selectedIds, bulkTagInput);
    toast.success(`Added #${bulkTagInput.trim().replace(/^#/, "")} to ${selectedIds.length} chats`);
    setBulkTagInput("");
    setShowBulkTagPrompt(false);
    setSelectedIds([]);
  };

  const handleBulkExport = () => {
    const targetIds = new Set(selectedIds);
    const selectedConvs = conversations.filter((c) => targetIds.has(c.id));
    if (selectedConvs.length === 0) return;

    const combined = selectedConvs
      .map((conv) => {
        const convMsgs = messages
          .filter((m) => m.conversationId === conv.id)
          .sort((a, b) => a.orderIndex - b.orderIndex);
        const convNotes = studyNotes.filter((n) => n.conversationId === conv.id);
        const colNames = conv.collectionIds
          .map((cid) => collectionMap.get(cid))
          .filter(Boolean) as string[];
        return formatConversationAsMarkdown(conv, convMsgs, convNotes, colNames);
      })
      .join("\n\n\n");

    downloadTextFile(
      `chatvault-transcripts-${selectedConvs.length}.md`,
      combined,
      "text/markdown"
    );
    toast.success(`Exported ${selectedConvs.length} transcripts as Markdown`);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    await conversationRepository.deleteByIds(selectedIds);
    setSelectedIds([]);
    toast.success(`Deleted ${count} conversations`);
  };

  return (
    <div className="p-gutter-mobile lg:p-margin max-w-7xl mx-auto space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md">
        <div>
          <span className="font-label-md text-label-md text-primary uppercase tracking-wider">
            Archive Repository
          </span>
          <h1 className="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface mt-1">
            All Conversations ({filteredConversations.length})
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Filter, tag, bulk-organize, and export your imported AI transcripts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/imports"
            className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-body-sm text-body-sm font-semibold flex items-center gap-1.5 shadow-md"
          >
            <MaterialIcon name="upload_file" className="text-[18px]" />
            <span>Import Archive</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/15 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative flex items-center bg-surface-container-lowest rounded-lg px-3 py-2 border border-outline-variant/25">
            <MaterialIcon name="search" className="text-outline text-[18px] mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, summary, or #tag..."
              className="w-full bg-transparent text-on-surface font-body-sm text-body-sm focus:outline-none placeholder:text-outline"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-outline hover:text-on-surface"
              >
                <MaterialIcon name="close" className="text-[16px]" />
              </button>
            )}
          </div>

          {/* Collection Filter */}
          <div className="md:col-span-3">
            <select
              aria-label="Filter by collection"
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="w-full h-full px-3 py-2 rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm border border-outline-variant/25 focus:outline-none focus:border-primary"
            >
              <option value="all">All Collections</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          {/* Provider Filter */}
          <div className="md:col-span-2">
            <select
              aria-label="Filter by AI provider"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full h-full px-3 py-2 rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm border border-outline-variant/25 focus:outline-none focus:border-primary"
            >
              <option value="all">All Providers</option>
              <option value="chatgpt">ChatGPT</option>
              <option value="claude">Claude</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              aria-label="Sort conversations"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "recent" | "oldest" | "alpha" | "messages")
              }
              className="w-full h-full px-3 py-2 rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm border border-outline-variant/25 focus:outline-none focus:border-primary"
            >
              <option value="recent">Sort: Most Recent</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="alpha">Sort: Title A–Z</option>
              <option value="messages">Sort: Most Turns</option>
            </select>
          </div>
        </div>

        {/* Content Type Filter Pills & Select All */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            {(
              [
                { id: "all", label: "All Transcripts", icon: "forum" },
                { id: "favorites", label: "Starred", icon: "star" },
                { id: "code", label: "Has Code", icon: "code" },
                { id: "math", label: "Has Formulas", icon: "functions" },
              ] as const
            ).map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setContentFilter(pill.id)}
                className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm flex items-center gap-1.5 transition-all ${
                  contentFilter === pill.id
                    ? "bg-primary text-on-primary font-semibold"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <MaterialIcon name={pill.icon} className="text-[14px]" />
                <span>{pill.label}</span>
              </button>
            ))}
          </div>

          {filteredConversations.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="font-label-sm text-label-sm text-secondary hover:underline"
            >
              {selectedIds.length === filteredConversations.length
                ? "Deselect All"
                : `Select All (${filteredConversations.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar when items selected */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 rounded-xl bg-surface-container-high border border-primary/40 flex flex-wrap items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-primary text-on-primary font-label-md text-label-md font-semibold">
              {selectedIds.length} Selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="font-label-sm text-label-sm text-outline hover:text-on-surface"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              aria-label="Bulk assign to collection"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkAssignCollection(e.target.value);
                  e.target.value = "";
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm border border-outline-variant/30"
            >
              <option value="" disabled>
                Move to Collection...
              </option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>

            {showBulkTagPrompt ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={bulkTagInput}
                  onChange={(e) => setBulkTagInput(e.target.value)}
                  placeholder="Tag name..."
                  className="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm border border-primary/40 w-32"
                />
                <button
                  type="button"
                  onClick={handleBulkAddTag}
                  className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold"
                >
                  Apply
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowBulkTagPrompt(true)}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface font-body-sm text-body-sm flex items-center gap-1"
              >
                <MaterialIcon name="sell" className="text-[16px]" />
                <span>Add Tag</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleBulkExport}
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface font-body-sm text-body-sm flex items-center gap-1"
            >
              <MaterialIcon name="download" className="text-[16px]" />
              <span>Export .md</span>
            </button>

            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm flex items-center gap-1"
            >
              <MaterialIcon name="delete" className="text-[16px]" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Conversations Grid */}
      {filteredConversations.length === 0 ? (
        <div className="rounded-2xl bg-surface-container-low p-12 text-center space-y-3 border border-outline-variant/15">
          <MaterialIcon name="search_off" className="text-outline text-[36px]" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            No Matching Conversations Found
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
            Try clearing your search or filter criteria, or import a ChatGPT conversation archive.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCollection("all");
              setSelectedProvider("all");
              setContentFilter("all");
            }}
            className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-body-sm text-body-sm"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {filteredConversations.map((conv) => (
            <ConversationCard
              key={conv.id}
              conversation={conv}
              collectionNames={conv.collectionIds
                .map((cid) => collectionMap.get(cid))
                .filter(Boolean) as string[]}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDeleteOne}
              selected={selectedIds.includes(conv.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
