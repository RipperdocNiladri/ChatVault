"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useVaultData } from "@/hooks/use-vault-data";
import {
  executeVaultSearch,
  type SearchScope,
} from "@/lib/search/search-service";
import { MaterialIcon } from "@/components/ui/material-icon";
import { formatShortDate } from "@/lib/utils";
import { toast } from "sonner";

function GlobalSearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialScope = (searchParams.get("scope") as SearchScope) || "all";

  const { conversations, messages, collections, studyNotes } = useVaultData();

  const [query, setQuery] = useState(initialQ);
  const [scope, setScope] = useState<SearchScope>(initialScope);
  const [collectionId, setCollectionId] = useState<string>("all");
  const [provider, setProvider] = useState<string>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    if (initialQ) setQuery(initialQ);
    if (initialScope) setScope(initialScope);
  }, [initialQ, initialScope]);

  const { hits, counts } = useMemo(() => {
    return executeVaultSearch(
      query,
      conversations,
      messages,
      collections,
      studyNotes,
      {
        scope,
        collectionId,
        provider,
        favoritesOnly,
      }
    );
  }, [
    query,
    conversations,
    messages,
    collections,
    studyNotes,
    scope,
    collectionId,
    provider,
    favoritesOnly,
  ]);

  const topFormulaHit = useMemo(
    () => hits.find((h) => Boolean(h.matchedFormula)),
    [hits]
  );

  const topCodeHit = useMemo(
    () => hits.find((h) => Boolean(h.matchedCode)),
    [hits]
  );

  return (
    <div className="p-gutter-mobile lg:p-margin max-w-7xl mx-auto space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-surface-container-low border border-outline-variant/20 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
            <span className="font-label-sm text-label-sm text-tertiary">
              MiniSearch BM25 Local Full-Text Index • Zero Cloud Latency
            </span>
          </div>
          <h1 className="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface">
            Global Search Command Center
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Instant full-text retrieval across conversation titles, prompts, responses, LaTeX
            formulas, code blocks, and study notes.
          </p>
        </div>
      </div>

      {/* Omnisearch Input & Filter Bar */}
      <div className="p-space-md rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-4 shadow-xl">
        <div className="flex items-center gap-3 bg-surface-container-lowest rounded-xl px-4 py-3 border border-outline-variant/30 focus-within:border-primary">
          <MaterialIcon name="manage_search" className="text-secondary text-[24px]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${conversations.length} conversations, equations, code snippets...`}
            className="flex-1 bg-transparent text-on-surface font-body-lg text-body-lg focus:outline-none placeholder:text-outline"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search query"
              className="p-1.5 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface"
            >
              <MaterialIcon name="close" className="text-[16px]" />
            </button>
          )}
        </div>

        {/* Scope Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(
              [
                { id: "all", label: "All Results", count: counts.all, icon: "apps" },
                {
                  id: "conversations",
                  label: "Conversations",
                  count: counts.conversations,
                  icon: "forum",
                },
                {
                  id: "formulas",
                  label: "Formulas & Math",
                  count: counts.formulas,
                  icon: "functions",
                },
                { id: "code", label: "Code Blocks", count: counts.code, icon: "code" },
                { id: "notes", label: "Study Notes", count: counts.notes, icon: "edit_note" },
              ] as const
            ).map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setScope(pill.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-all ${
                  scope === pill.id
                    ? "bg-primary text-on-primary font-semibold shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <MaterialIcon name={pill.icon} className="text-[14px]" />
                <span>{pill.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    scope === pill.id
                      ? "bg-black/20 text-on-primary"
                      : "bg-surface-container-highest text-outline"
                  }`}
                >
                  {pill.count}
                </span>
              </button>
            ))}
          </div>

          {/* Secondary Metadata Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              aria-label="Filter search by collection"
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm border border-outline-variant/25"
            >
              <option value="all">All Collections</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter search by provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm border border-outline-variant/25"
            >
              <option value="all">All Providers</option>
              <option value="chatgpt">ChatGPT</option>
              <option value="claude">Claude</option>
              <option value="gemini">Gemini</option>
            </select>

            <button
              type="button"
              onClick={() => setFavoritesOnly((v) => !v)}
              className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm flex items-center gap-1 border ${
                favoritesOnly
                  ? "bg-primary/20 border-primary text-primary font-semibold"
                  : "bg-surface-container border-outline-variant/25 text-on-surface-variant"
              }`}
            >
              <MaterialIcon name="star" filled={favoritesOnly} className="text-[14px]" />
              <span>Starred Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Suggesters if query empty */}
      {!query.trim() && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-label-sm text-label-sm text-outline uppercase">
            Quick Queries:
          </span>
          {[
            "Schrödinger equation",
            "Valgrind ring_free",
            "AVL rotateLeftRight",
            "MultiHeadAttention",
            "PRAGMA journal_mode=WAL",
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuery(suggestion)}
              className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary font-code text-label-sm transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Highlighted Formula & Code Match Cards */}
      {(topFormulaHit || topCodeHit) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {topFormulaHit && topFormulaHit.matchedFormula && (
            <div className="rounded-xl bg-surface-container p-space-md border border-primary/25 shadow-lg flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold">
                  <MaterialIcon name="functions" className="text-[14px]" />
                  <span>Extracted Formula Match</span>
                </span>
                <span className="font-code text-label-sm text-tertiary">
                  BM25 Score: {topFormulaHit.score}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-container-lowest font-code text-secondary text-center overflow-x-auto">
                {topFormulaHit.matchedFormula}
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(topFormulaHit.matchedFormula!);
                    toast.success("LaTeX formula copied to clipboard");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-sm text-body-sm flex items-center gap-1.5"
                >
                  <MaterialIcon name="content_copy" className="text-[15px]" />
                  <span>Copy LaTeX</span>
                </button>
                <Link
                  href={`/conversations/${topFormulaHit.conversation.id}`}
                  className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-semibold flex items-center gap-1.5"
                >
                  <span>Open Transcript</span>
                  <MaterialIcon name="arrow_forward" className="text-[15px]" />
                </Link>
              </div>
            </div>
          )}

          {topCodeHit && topCodeHit.matchedCode && (
            <div className="rounded-xl bg-surface-container p-space-md border border-secondary/25 shadow-lg flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/20 text-secondary font-label-sm text-label-sm font-semibold">
                  <MaterialIcon name="terminal" className="text-[14px]" />
                  <span>Matched {topCodeHit.matchedCode.language.toUpperCase()} Snippet</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(topCodeHit.matchedCode!.code);
                    toast.success("Code snippet copied");
                  }}
                  className="px-2.5 py-1 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center gap-1"
                >
                  <MaterialIcon name="content_copy" className="text-[13px]" />
                  <span>Copy Code</span>
                </button>
              </div>

              <pre className="p-3 rounded-lg bg-surface-container-lowest font-code text-[12px] text-on-surface overflow-x-auto max-h-28">
                <code>{topCodeHit.matchedCode.code}</code>
              </pre>

              <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                <span className="truncate">From: {topCodeHit.conversation.title}</span>
                <Link
                  href={`/conversations/${topCodeHit.conversation.id}`}
                  className="text-secondary hover:underline shrink-0 flex items-center gap-1"
                >
                  <span>View in Reader</span>
                  <MaterialIcon name="chevron_right" className="text-[14px]" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Results List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            Matched Excerpts ({hits.length})
          </span>
          <span className="font-label-sm text-label-sm text-outline">
            Sorted by BM25 Relevance
          </span>
        </div>

        {hits.length === 0 ? (
          <div className="rounded-2xl bg-surface-container-low p-12 text-center space-y-3 border border-outline-variant/15">
            <MaterialIcon name="search_off" className="text-outline text-[36px]" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              No Results Found for &ldquo;{query}&rdquo;
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
              Try broadening your search terms or switching the scope filter back to &ldquo;All
              Results&rdquo;.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {hits.map((hit) => (
              <article
                key={hit.conversation.id}
                className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all border border-outline-variant/15 space-y-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-tertiary" />
                    <span className="font-label-sm text-label-sm text-primary uppercase font-semibold">
                      {hit.collectionNames.join(" • ") || "General Archive"}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-tertiary font-label-sm text-label-sm">
                      {hit.conversation.modelName || hit.conversation.sourceProvider}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-label-sm text-label-sm text-outline">
                    <span>Relevance {hit.score}</span>
                    <span>•</span>
                    <span>{formatShortDate(hit.conversation.createdAt)}</span>
                  </div>
                </div>

                <Link
                  href={`/conversations/${hit.conversation.id}`}
                  className="font-headline-sm text-headline-sm text-on-surface hover:text-primary transition-colors block font-semibold"
                >
                  {hit.conversation.title}
                </Link>

                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {hit.snippet}
                </p>

                {hit.matchedNote && (
                  <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-tertiary/20 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <MaterialIcon name="edit_note" className="text-tertiary text-[16px]" />
                      <span className="font-body-sm text-body-sm text-on-surface truncate">
                        Note: {hit.matchedNote.contentMarkdown}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 text-outline font-label-sm text-label-sm border-t border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MaterialIcon name="forum" className="text-[14px]" />
                      {hit.conversation.messageCount} turns
                    </span>
                    {hit.conversation.formulaCount > 0 && (
                      <span className="flex items-center gap-1 text-primary">
                        <MaterialIcon name="functions" className="text-[14px]" />
                        {hit.conversation.formulaCount} formulas
                      </span>
                    )}
                    {hit.conversation.codeBlockCount > 0 && (
                      <span className="flex items-center gap-1 text-secondary">
                        <MaterialIcon name="code" className="text-[14px]" />
                        {hit.conversation.codeBlockCount} code blocks
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/conversations/${hit.conversation.id}`}
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Open Transcript</span>
                    <MaterialIcon name="arrow_forward" className="text-[14px]" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GlobalSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-margin text-center text-outline font-label-md">
          Loading Search Index...
        </div>
      }
    >
      <GlobalSearchContent />
    </Suspense>
  );
}
