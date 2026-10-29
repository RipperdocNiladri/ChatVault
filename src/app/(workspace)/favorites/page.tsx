"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useVaultData } from "@/hooks/use-vault-data";
import {
  collectionRepository,
  conversationRepository,
} from "@/db/repositories";
import { CollectionCard } from "@/components/collections/collection-card";
import { ConversationCard } from "@/components/conversations/conversation-card";
import { MaterialIcon } from "@/components/ui/material-icon";
import {
  downloadTextFile,
  formatConversationAsMarkdown,
} from "@/lib/export/backup-service";
import {
  extractCodeBlocksFromMarkdown,
  extractFormulasFromMarkdown,
} from "@/lib/utils";
import { toast } from "sonner";

export default function FavoritesPage() {
  const { conversations, collections, messages, studyNotes } = useVaultData();

  const [filterText, setFilterText] = useState("");
  const [studyModalOpen, setStudyModalOpen] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [revealAnswer, setRevealAnswer] = useState(false);

  const starredCollections = useMemo(
    () => collections.filter((c) => c.isFavorite),
    [collections]
  );

  const starredConversations = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    return conversations.filter((c) => {
      if (!c.isFavorite) return false;
      if (q) {
        const hay = `${c.title} ${c.summary} ${c.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [conversations, filterText]);

  const collectionMap = useMemo(
    () => new Map(collections.map((c) => [c.id, c.name])),
    [collections]
  );

  // Extract real formulas and code snippets from starred conversations
  const starredFormulas = useMemo(() => {
    const list: Array<{ title: string; latex: string; convId: string }> = [];
    for (const conv of starredConversations) {
      const convMsgs = messages.filter((m) => m.conversationId === conv.id);
      const md = convMsgs.map((m) => m.contentMarkdown).join("\n\n");
      const extracted = extractFormulasFromMarkdown(md);
      for (const f of extracted.slice(0, 2)) {
        list.push({ title: conv.title, latex: f, convId: conv.id });
      }
    }
    return list.slice(0, 6);
  }, [starredConversations, messages]);

  const starredCodeBlocks = useMemo(() => {
    const list: Array<{ title: string; language: string; code: string; convId: string }> = [];
    for (const conv of starredConversations) {
      const convMsgs = messages.filter((m) => m.conversationId === conv.id);
      const md = convMsgs.map((m) => m.contentMarkdown).join("\n\n");
      const extracted = extractCodeBlocksFromMarkdown(md);
      for (const b of extracted.slice(0, 1)) {
        list.push({
          title: conv.title,
          language: b.language,
          code: b.code,
          convId: conv.id,
        });
      }
    }
    return list.slice(0, 3);
  }, [starredConversations, messages]);

  const handleExportStarredSynthesis = () => {
    if (starredConversations.length === 0) {
      toast.error("Star at least one conversation to export a synthesis bundle.");
      return;
    }
    const content = starredConversations
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

    downloadTextFile("chatvault-starred-synthesis.md", content, "text/markdown");
    toast.success("Downloaded Starred Synthesis Markdown bundle");
  };

  const activeFlashcard = starredConversations[cardIndex] || starredConversations[0];

  return (
    <div className="p-gutter-mobile lg:p-margin max-w-7xl mx-auto space-y-space-xl">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
        <div>
          <span className="font-label-md text-label-md text-primary uppercase tracking-wider">
            High-Signal Knowledge Deck
          </span>
          <h1 className="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface mt-1">
            Starred Favorites ({starredConversations.length} Dialogues •{" "}
            {starredCollections.length} Vaults)
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Quick access to your pinned derivations, exam review transcripts, extracted LaTeX
            equations, and reference implementations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (starredConversations.length === 0) {
                toast.error("No starred conversations available for review.");
                return;
              }
              setCardIndex(0);
              setRevealAnswer(false);
              setStudyModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-sm text-body-sm font-medium flex items-center gap-2 border border-outline-variant/25"
          >
            <MaterialIcon name="school" className="text-tertiary text-[18px]" />
            <span>Study Review Deck</span>
          </button>

          <button
            type="button"
            onClick={handleExportStarredSynthesis}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-body-sm text-body-sm font-semibold shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <MaterialIcon name="auto_awesome" className="text-[18px]" />
            <span>Compile Synthesis (.md)</span>
          </button>
        </div>
      </div>

      {/* Starred Collections Strip */}
      {starredCollections.length > 0 && (
        <section className="space-y-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
            <MaterialIcon name="folder_special" className="text-primary text-[20px]" />
            <span>Pinned Subject Vaults ({starredCollections.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {starredCollections.map((col) => {
              const colConvs = conversations.filter((c) => c.collectionIds.includes(col.id));
              return (
                <CollectionCard
                  key={col.id}
                  collection={col}
                  conversationCount={colConvs.length}
                  codeCount={colConvs.reduce((s, c) => s + c.codeBlockCount, 0)}
                  formulaCount={colConvs.reduce((s, c) => s + c.formulaCount, 0)}
                  onToggleFavorite={(id) => collectionRepository.toggleFavorite(id)}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Main Split: Starred Conversations (8 cols) + Formula & Code Deck (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 space-y-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <MaterialIcon name="star" filled className="text-primary text-[20px]" />
              <span>Starred Transcripts ({starredConversations.length})</span>
            </h2>

            <div className="flex items-center bg-surface-container-low rounded-lg px-3 py-1.5 border border-outline-variant/25">
              <MaterialIcon name="search" className="text-outline text-[16px] mr-2" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Filter starred chats..."
                className="bg-transparent text-on-surface font-body-sm text-body-sm focus:outline-none placeholder:text-outline"
              />
            </div>
          </div>

          {starredConversations.length === 0 ? (
            <div className="rounded-2xl bg-surface-container-low p-10 text-center space-y-3 border border-outline-variant/15">
              <MaterialIcon name="star_border" className="text-outline text-[34px]" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                No Starred Conversations Yet
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
                Click the star icon on any conversation card or inside the transcript reader to pin
                important sessions here.
              </p>
              <Link
                href="/conversations"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-body-sm font-semibold"
              >
                Browse All Conversations
              </Link>
            </div>
          ) : (
            <div className="space-y-space-md">
              {starredConversations.map((conv) => (
                <ConversationCard
                  key={conv.id}
                  conversation={conv}
                  collectionNames={conv.collectionIds
                    .map((cid) => collectionMap.get(cid))
                    .filter(Boolean) as string[]}
                  onToggleFavorite={(id) => conversationRepository.toggleFavorite(id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Formula Deck & Pinned Code Blocks */}
        <aside className="lg:col-span-4 space-y-space-md">
          {/* Formula Quick-Copy Deck */}
          <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/15 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MaterialIcon name="functions" className="text-primary text-[18px]" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Formula Deck
                </h3>
              </div>
              <span className="font-label-sm text-label-sm text-outline">1-Click LaTeX</span>
            </div>

            {starredFormulas.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Formulas from your starred conversations will appear here.
              </p>
            ) : (
              <div className="space-y-2">
                {starredFormulas.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-label-sm text-label-sm text-outline truncate">
                        {item.title}
                      </div>
                      <code className="font-code text-[12px] text-primary block truncate mt-0.5">
                        {item.latex}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(item.latex);
                        toast.success("LaTeX copied to clipboard");
                      }}
                      className="p-1.5 rounded-md bg-surface-container-highest text-outline hover:text-primary shrink-0"
                      title="Copy LaTeX"
                    >
                      <MaterialIcon name="content_copy" className="text-[15px]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pinned Code Snippets */}
          <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/15 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MaterialIcon name="terminal" className="text-tertiary text-[18px]" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Pinned Code Blocks
                </h3>
              </div>
              <span className="font-label-sm text-label-sm text-tertiary">
                {starredCodeBlocks.length} Snippets
              </span>
            </div>

            {starredCodeBlocks.map((snip, idx) => (
              <div
                key={idx}
                className="p-space-sm rounded-lg bg-surface-container space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-code text-label-sm text-secondary uppercase">
                    {snip.language}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(snip.code);
                      toast.success("Code snippet copied");
                    }}
                    className="text-outline hover:text-on-surface"
                  >
                    <MaterialIcon name="content_copy" className="text-[15px]" />
                  </button>
                </div>
                <pre className="font-code text-[11px] text-on-surface/90 overflow-x-auto max-h-28">
                  <code>{snip.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Interactive Study Review Modal */}
      {studyModalOpen && activeFlashcard && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-surface-container-high rounded-2xl p-space-lg shadow-2xl border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MaterialIcon name="auto_stories" className="text-tertiary text-[20px]" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Study Session: Recall #{cardIndex + 1} of {starredConversations.length}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setStudyModalOpen(false)}
                className="p-1 text-outline hover:text-on-surface"
              >
                <MaterialIcon name="close" className="text-[20px]" />
              </button>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container space-y-2">
              <span className="font-label-sm text-label-sm text-primary uppercase font-semibold">
                {activeFlashcard.tags.map((t) => `#${t}`).join(" • ")}
              </span>
              <h4 className="font-headline-sm text-headline-sm text-on-surface">
                {activeFlashcard.title}
              </h4>
              {revealAnswer && (
                <div className="p-3 rounded-lg bg-surface-container-lowest text-on-surface-variant font-body-sm text-body-sm space-y-2 mt-2 border border-tertiary/25">
                  <p>{activeFlashcard.summary}</p>
                  {activeFlashcard.featuredSnippet && (
                    <code className="block font-code text-tertiary text-xs">
                      {activeFlashcard.featuredSnippet.content}
                    </code>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setRevealAnswer((v) => !v)}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface font-body-sm text-body-sm"
              >
                {revealAnswer ? "Hide Summary" : "Reveal Summary"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRevealAnswer(false);
                    setCardIndex((prev) => (prev + 1) % starredConversations.length);
                  }}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-semibold"
                >
                  Next Card →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
