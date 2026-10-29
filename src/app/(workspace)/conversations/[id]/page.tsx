"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useVaultData } from "@/hooks/use-vault-data";
import {
  conversationRepository,
  studyNoteRepository,
} from "@/db/repositories";
import {
  downloadTextFile,
  formatConversationAsMarkdown,
} from "@/lib/export/backup-service";
import {
  extractCodeBlocksFromMarkdown,
  extractFormulasFromMarkdown,
  formatShortDate,
} from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/material-icon";
import { toast } from "sonner";

export default function ConversationReaderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const convId = params.id;

  const { conversations, messages, collections, studyNotes, preferences } =
    useVaultData();

  const conversation = useMemo(
    () => conversations.find((c) => c.id === convId),
    [conversations, convId]
  );

  const convMessages = useMemo(
    () =>
      messages
        .filter((m) => m.conversationId === convId)
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [messages, convId]
  );

  const existingNote = useMemo(
    () => studyNotes.find((n) => n.conversationId === convId),
    [studyNotes, convId]
  );

  const [inChatQuery, setInChatQuery] = useState("");
  const [noteText, setNoteText] = useState("");
  const [saveState, setSaveState] = useState<"Saved" | "Syncing...">("Saved");
  const [newTagInput, setNewTagInput] = useState("");
  const [quantumStateN, setQuantumStateN] = useState<1 | 2 | 3>(1);
  const [mobileScratchpadOpen, setMobileScratchpadOpen] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync initial note content from DB
  useEffect(() => {
    if (existingNote) {
      setNoteText(existingNote.contentMarkdown);
    }
  }, [existingNote?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Record view timestamp
  useEffect(() => {
    if (convId) {
      conversationRepository.markViewed(convId);
    }
  }, [convId]);

  const handleScratchpadChange = (val: string) => {
    setNoteText(val);
    setSaveState("Syncing...");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      await studyNoteRepository.upsertForConversation(
        convId,
        val,
        existingNote?.title || `Notes: ${conversation?.title.slice(0, 40) || "Session"}`
      );
      setSaveState("Saved");
    }, 450);
  };

  const extractedFormulas = useMemo(() => {
    const allMd = convMessages.map((m) => m.contentMarkdown).join("\n\n");
    return extractFormulasFromMarkdown(allMd);
  }, [convMessages]);

  const extractedCodeBlocks = useMemo(() => {
    const allMd = convMessages.map((m) => m.contentMarkdown).join("\n\n");
    return extractCodeBlocksFromMarkdown(allMd);
  }, [convMessages]);

  const filteredMessages = useMemo(() => {
    const q = inChatQuery.trim().toLowerCase();
    if (!q) return convMessages;
    return convMessages.filter((m) =>
      m.contentPlainText.toLowerCase().includes(q)
    );
  }, [convMessages, inChatQuery]);

  if (!conversation) {
    return (
      <div className="p-margin max-w-4xl mx-auto text-center space-y-4">
        <MaterialIcon name="forum" className="text-outline text-[40px]" />
        <h1 className="font-headline-md text-headline-md text-on-surface">
          Conversation Not Found
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          This transcript may have been deleted or has not been imported yet.
        </p>
        <Link
          href="/conversations"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-body-sm font-semibold"
        >
          Back to All Conversations
        </Link>
      </div>
    );
  }

  const assignedCollections = collections.filter((c) =>
    conversation.collectionIds.includes(c.id)
  );

  const handleToggleFavorite = async () => {
    const next = await conversationRepository.toggleFavorite(conversation.id);
    toast.success(next ? "Saved to Starred Sessions" : "Removed from Starred");
  };

  const handleToggleCollection = async (colId: string) => {
    const exists = conversation.collectionIds.includes(colId);
    const nextIds = exists
      ? conversation.collectionIds.filter((id) => id !== colId)
      : [...conversation.collectionIds, colId];
    await conversationRepository.assignCollections(conversation.id, nextIds);
    toast.success("Updated collection membership");
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagInput.trim().replace(/^#/, "");
    if (!clean) return;
    await conversationRepository.updateTags(conversation.id, [
      ...conversation.tags,
      clean,
    ]);
    setNewTagInput("");
    toast.success(`Added #${clean}`);
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    await conversationRepository.updateTags(
      conversation.id,
      conversation.tags.filter((t) => t !== tagToRemove)
    );
  };

  const handleExportMarkdown = () => {
    const md = formatConversationAsMarkdown(
      conversation,
      convMessages,
      existingNote ? [existingNote] : [],
      assignedCollections.map((c) => c.name)
    );
    const safeName =
      conversation.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 48) || "transcript";
    downloadTextFile(`${safeName}.md`, md, "text/markdown");
    toast.success("Markdown transcript downloaded");
  };

  const handleCopyFullTranscript = () => {
    const md = formatConversationAsMarkdown(
      conversation,
      convMessages,
      existingNote ? [existingNote] : [],
      assignedCollections.map((c) => c.name)
    );
    navigator.clipboard.writeText(md);
    toast.success("Full transcript copied to clipboard");
  };

  const handleDeleteConversation = async () => {
    await conversationRepository.deleteByIds([conversation.id]);
    toast.success("Conversation deleted");
    router.push("/conversations");
  };

  const fontSizeClass =
    preferences.readingFontSize === "lg"
      ? "text-[16px] leading-7"
      : preferences.readingFontSize === "sm"
      ? "text-[13px] leading-5"
      : "text-body-md leading-relaxed";

  return (
    <div className="flex flex-col w-full pb-20 lg:pb-8">
      {/* Top Contextual Breadcrumb & Action Bar */}
      <div className="px-gutter-mobile lg:px-margin py-3 bg-surface-container-lowest border-b border-outline-variant/15 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/conversations"
            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            title="Back to Conversations"
          >
            <MaterialIcon name="arrow_back" className="text-[18px]" />
          </Link>
          <MaterialIcon name="folder_open" className="text-primary text-[16px]" />
          <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-outline uppercase tracking-wider truncate">
            <Link href="/collections" className="hover:text-on-surface">
              Vaults
            </Link>
            <span>/</span>
            {assignedCollections[0] ? (
              <Link
                href={`/collections/${assignedCollections[0].id}`}
                className="text-primary hover:underline truncate"
              >
                {assignedCollections[0].name}
              </Link>
            ) : (
              <span>Unassigned</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label="Favorite Transcript"
            className={`px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center gap-1.5 font-label-sm text-label-sm transition-colors ${
              conversation.isFavorite ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            <MaterialIcon
              name="star"
              filled={conversation.isFavorite}
              className="text-[16px]"
            />
            <span>{conversation.isFavorite ? "Starred" : "Star"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyFullTranscript}
            className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm flex items-center gap-1.5 transition-colors"
          >
            <MaterialIcon name="content_copy" className="text-[15px]" />
            <span className="hidden sm:inline">Copy All</span>
          </button>

          <button
            type="button"
            onClick={handleExportMarkdown}
            className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <MaterialIcon name="file_download" className="text-[16px]" />
            <span>Export .md</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteConversation}
            aria-label="Delete conversation"
            className="p-1.5 rounded-lg bg-surface-container hover:bg-error-container text-outline hover:text-on-error-container transition-colors"
            title="Delete Conversation"
          >
            <MaterialIcon name="delete" className="text-[16px]" />
          </button>
        </div>
      </div>

      {/* Main Two-Column Reader Layout */}
      <div className="max-w-7xl w-full mx-auto px-gutter-mobile lg:px-margin pt-space-lg grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left/Center Column: Transcript Thread (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-space-lg">
          {/* Transcript Metadata Header Card */}
          <section className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/15 space-y-3 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-highest font-code text-label-sm text-tertiary">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                  <span>{conversation.modelName || conversation.sourceProvider}</span>
                </span>
                <span className="font-label-sm text-label-sm text-outline">
                  • {conversation.wordCount} words • {convMessages.length} turns
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-outline">
                  READ ONLY ARCHIVE
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-outline">
                {formatShortDate(conversation.createdAt)}
              </span>
            </div>

            <h1 className="font-headline-md text-headline-md text-on-surface font-semibold">
              {conversation.title}
            </h1>

            {/* Tags & Collection Assignment */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {conversation.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-error ml-0.5"
                    aria-label={`Remove tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}

              <form onSubmit={handleAddTag} className="inline-flex items-center">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="+ Add tag..."
                  className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm border border-outline-variant/25 focus:outline-none focus:border-primary w-28"
                />
              </form>
            </div>

            {/* In-conversation Search Bar */}
            <div className="pt-2 flex items-center gap-2">
              <div className="flex-1 flex items-center bg-surface-container-lowest rounded-lg px-3 py-1.5 border border-outline-variant/20">
                <MaterialIcon name="find_in_page" className="text-outline text-[16px] mr-2" />
                <input
                  type="text"
                  value={inChatQuery}
                  onChange={(e) => setInChatQuery(e.target.value)}
                  placeholder="Find within this conversation transcript..."
                  className="w-full bg-transparent text-on-surface font-body-sm text-body-sm focus:outline-none placeholder:text-outline"
                />
                {inChatQuery && (
                  <button
                    type="button"
                    onClick={() => setInChatQuery("")}
                    className="text-outline hover:text-on-surface"
                  >
                    <MaterialIcon name="close" className="text-[14px]" />
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Interactive Standing Wave Harmonics Widget for Schrödinger Session */}
          {conversation.id === "conv-schrodinger-wave-equation" && (
            <section
              id="formula-section"
              className="p-space-md rounded-xl bg-surface-container-low border border-primary/25 space-y-3 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase">
                    Interactive Standing Wave Harmonics
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Probability Density |ψₙ(x)|² in 1D Infinite Potential Well
                  </h2>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg">
                  {([1, 2, 3] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setQuantumStateN(n)}
                      className={`px-2.5 py-1 rounded font-label-sm text-label-sm transition-all ${
                        quantumStateN === n
                          ? "bg-primary text-on-primary font-semibold"
                          : "text-outline hover:text-on-surface"
                      }`}
                    >
                      n={n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative w-full h-44 rounded-lg bg-surface-container-lowest p-3 flex flex-col justify-end overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-4 bg-error-container/30 flex items-center justify-center">
                  <span className="font-code text-[9px] text-error -rotate-90">V=∞</span>
                </div>
                <div className="absolute inset-y-0 right-0 w-4 bg-error-container/30 flex items-center justify-center">
                  <span className="font-code text-[9px] text-error rotate-90">V=∞</span>
                </div>
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 130">
                  <defs>
                    <linearGradient id="waveFillGrad" x1="0%" x2="100%" y1="0%" y2="0%">
                      <stop offset="0%" stopColor="#5de6ff" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="#a078ff" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#5de6ff" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  <line
                    stroke="#33353a"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                    x1="12"
                    x2="388"
                    y1="115"
                    y2="115"
                  />
                  <path
                    d={
                      quantumStateN === 1
                        ? "M 12 115 Q 200 -5 388 115 Z"
                        : quantumStateN === 2
                        ? "M 12 115 Q 106 -5 200 115 Q 294 -5 388 115 Z"
                        : "M 12 115 Q 75 -5 137 115 Q 200 -5 263 115 Q 325 -5 388 115 Z"
                    }
                    fill="url(#waveFillGrad)"
                  />
                  <path
                    d={
                      quantumStateN === 1
                        ? "M 12 115 Q 200 -5 388 115"
                        : quantumStateN === 2
                        ? "M 12 115 Q 106 -5 200 115 Q 294 -5 388 115"
                        : "M 12 115 Q 75 -5 137 115 Q 200 -5 263 115 Q 325 -5 388 115"
                    }
                    fill="none"
                    stroke="#d0bcff"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  />
                </svg>
                <div className="flex items-center justify-between px-3 pt-1 font-label-sm text-label-sm text-outline">
                  <span>x = 0</span>
                  <span className="text-primary font-code">
                    {quantumStateN === 1
                      ? "Ground State (n=1): 0 Interior Nodes"
                      : quantumStateN === 2
                      ? "1st Excited State (n=2): 1 Central Node"
                      : "2nd Excited State (n=3): 2 Interior Nodes"}
                  </span>
                  <span>x = L</span>
                </div>
              </div>
            </section>
          )}

          {/* Message Turns Thread */}
          <div className="space-y-space-md">
            {filteredMessages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <article
                  key={msg.id}
                  className={`rounded-2xl p-space-md lg:p-space-lg transition-all border ${
                    isUser
                      ? "bg-surface-container-high/85 border-outline-variant/25"
                      : "bg-surface-container-low border-outline-variant/15 shadow-md"
                  }`}
                >
                  {/* Turn Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-outline-variant/15">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-code text-label-sm font-semibold ${
                          isUser
                            ? "bg-primary/20 text-primary"
                            : "bg-tertiary/20 text-tertiary"
                        }`}
                      >
                        {isUser ? "U" : "AI"}
                      </div>
                      <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                        {msg.authorName || (isUser ? preferences.userName : conversation.modelName)}
                      </span>
                      <span className="font-label-sm text-label-sm text-outline">
                        • Turn #{idx + 1}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(msg.contentMarkdown);
                        toast.success("Message Markdown copied");
                      }}
                      className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-highest text-outline hover:text-on-surface font-label-sm text-label-sm flex items-center gap-1 transition-colors"
                    >
                      <MaterialIcon name="content_copy" className="text-[13px]" />
                      <span>Copy</span>
                    </button>
                  </div>

                  {/* Safe Markdown + KaTeX + Code Block Renderer */}
                  <div className={`space-y-3 text-on-surface ${fontSizeClass}`}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        h1: ({ children }) => (
                          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold pt-2">
                            {children}
                          </h2>
                        ),
                        h2: ({ children }) => (
                          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold pt-2">
                            {children}
                          </h3>
                        ),
                        h3: ({ children }) => (
                          <h4 className="font-headline-sm text-[16px] text-primary font-semibold pt-2">
                            {children}
                          </h4>
                        ),
                        p: ({ children }) => (
                          <p className="leading-relaxed text-on-surface">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-5 space-y-1 text-on-surface-variant">
                            {children}
                          </ol>
                        ),
                        code: ({ className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || "");
                          const rawCode = String(children).replace(/\n$/, "");
                          const isMultiline = Boolean(match) || rawCode.includes("\n");

                          if (!isMultiline) {
                            return (
                              <code
                                className="px-1.5 py-0.5 rounded bg-surface-container-lowest font-code text-secondary text-[13px]"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          }

                          const lang = match?.[1] || "code";
                          return (
                            <div className="my-3 rounded-xl bg-surface-container-lowest overflow-hidden border border-outline-variant/25 shadow-inner">
                              <div className="flex items-center justify-between px-3.5 py-2 bg-surface-container border-b border-outline-variant/15">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-error/70" />
                                  <span className="w-2.5 h-2.5 rounded-full bg-secondary/70" />
                                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary/70" />
                                  <span className="font-code text-label-sm text-secondary uppercase ml-1">
                                    {lang}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(rawCode);
                                    toast.success(`${lang.toUpperCase()} snippet copied`);
                                  }}
                                  className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-label-sm flex items-center gap-1"
                                >
                                  <MaterialIcon name="content_copy" className="text-[13px]" />
                                  <span>Copy Code</span>
                                </button>
                              </div>
                              <pre
                                className={`p-3.5 font-code text-[12.5px] leading-5 text-on-surface overflow-x-auto ${
                                  preferences.codeBlockWrap ? "whitespace-pre-wrap" : "whitespace-pre"
                                }`}
                              >
                                <code>{rawCode}</code>
                              </pre>
                            </div>
                          );
                        },
                      }}
                    >
                      {msg.contentMarkdown}
                    </ReactMarkdown>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Right Column: Study Notes Scratchpad, Collections & Extracted Assets (4 cols on lg) */}
        <aside className="lg:col-span-4 space-y-space-md">
          {/* Auto-Saving Study Scratchpad */}
          <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-3 sticky top-20 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MaterialIcon name="edit_note" className="text-secondary text-[20px]" />
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Study Scratchpad
                </h2>
              </div>
              <span
                className={`font-label-sm text-label-sm font-mono ${
                  saveState === "Saved" ? "text-tertiary" : "text-secondary"
                }`}
              >
                {saveState}
              </span>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Personal study annotations and exam takeaways. Automatically persisted to local
              IndexedDB.
            </p>

            <textarea
              aria-label="Study notes scratchpad"
              value={noteText}
              onChange={(e) => handleScratchpadChange(e.target.value)}
              rows={7}
              placeholder="- Add key lecture takeaways, exam reminders, or edge cases..."
              className="w-full p-3 rounded-lg bg-surface-container-lowest text-on-surface font-code text-body-sm border border-outline-variant/25 focus:outline-none focus:border-primary resize-y"
            />

            {/* Collection Membership Checkboxes */}
            <div className="pt-2 border-t border-outline-variant/15 space-y-2">
              <span className="font-label-sm text-label-sm text-outline uppercase block">
                Assigned Subject Vaults
              </span>
              <div className="flex flex-wrap gap-1.5">
                {collections.map((col) => {
                  const active = conversation.collectionIds.includes(col.id);
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => handleToggleCollection(col.id)}
                      className={`px-2.5 py-1 rounded-lg font-label-sm text-label-sm transition-all flex items-center gap-1 ${
                        active
                          ? "bg-primary-container text-on-primary-container font-semibold"
                          : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <MaterialIcon
                        name={active ? "check" : "add"}
                        className="text-[13px]"
                      />
                      <span>{col.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Extracted Formula Deck */}
            {extractedFormulas.length > 0 && (
              <div className="pt-2 border-t border-outline-variant/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-primary uppercase">
                    Extracted LaTeX ({extractedFormulas.length})
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">1-Click Copy</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {extractedFormulas.map((latex, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-surface-container flex items-center justify-between gap-2"
                    >
                      <code className="font-code text-[11px] text-on-surface truncate">
                        {latex}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(latex);
                          toast.success("LaTeX formula copied");
                        }}
                        className="p-1 rounded bg-surface-container-highest text-outline hover:text-primary shrink-0"
                        title="Copy LaTeX"
                      >
                        <MaterialIcon name="content_copy" className="text-[14px]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Code Blocks */}
            {extractedCodeBlocks.length > 0 && (
              <div className="pt-2 border-t border-outline-variant/15 space-y-2">
                <span className="font-label-sm text-label-sm text-secondary uppercase block">
                  Extracted Code Blocks ({extractedCodeBlocks.length})
                </span>
                <div className="space-y-1.5">
                  {extractedCodeBlocks.map((block, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-surface-container flex items-center justify-between gap-2"
                    >
                      <span className="font-code text-label-sm text-secondary uppercase">
                        {block.language} snippet #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(block.code);
                          toast.success("Code block copied");
                        }}
                        className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface font-label-sm text-label-sm"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile Sticky Reader Action Bar (matching chatvault_mobile_conversation_reader) */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 z-30 bg-surface-container-lowest/95 backdrop-blur-xl px-gutter-mobile py-2 border-t border-outline-variant/20">
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setMobileScratchpadOpen((v) => !v)}
            className="flex-1 py-2 px-3 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center gap-1.5 font-label-md text-label-md"
          >
            <MaterialIcon name="edit_note" className="text-secondary text-[16px]" />
            <span>Scratchpad</span>
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
          </button>
          <button
            type="button"
            onClick={handleExportMarkdown}
            className="py-2 px-4 rounded-lg bg-primary text-on-primary flex items-center justify-center gap-1.5 font-label-md text-label-md font-semibold"
          >
            <MaterialIcon name="file_download" className="text-[16px]" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Mobile Slide-Up Scratchpad Drawer */}
      {mobileScratchpadOpen && (
        <div className="lg:hidden fixed inset-x-0 bottom-16 z-50 bg-surface-container-low rounded-t-2xl p-4 shadow-2xl border-t border-outline-variant/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MaterialIcon name="edit_note" className="text-secondary text-[18px]" />
              <span className="font-headline-sm text-headline-sm text-on-surface">
                Live Reader Scratchpad
              </span>
              <span className="font-label-sm text-label-sm text-tertiary font-mono">
                {saveState}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileScratchpadOpen(false)}
              className="p-1 text-outline hover:text-on-surface"
            >
              <MaterialIcon name="close" className="text-[20px]" />
            </button>
          </div>
          <textarea
            value={noteText}
            onChange={(e) => handleScratchpadChange(e.target.value)}
            rows={4}
            placeholder="Write study notes..."
            className="w-full p-3 rounded-lg bg-surface-container-lowest text-on-surface font-code text-body-sm"
          />
        </div>
      )}
    </div>
  );
}
