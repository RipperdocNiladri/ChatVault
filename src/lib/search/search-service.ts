import type {
  Collection,
  Conversation,
  Message,
  StudyNote,
} from "@/types/entities";
import { buildConversationSearchIndex } from "./indexer";

export type SearchScope =
  | "all"
  | "conversations"
  | "code"
  | "formulas"
  | "notes";

export interface SearchFilterOptions {
  scope?: SearchScope;
  collectionId?: string | null;
  provider?: string | null;
  favoritesOnly?: boolean;
  tag?: string | null;
}

export interface SearchHit {
  conversation: Conversation;
  collectionNames: string[];
  score: number;
  matchedTerms: string[];
  snippet: string;
  matchedFormula?: string;
  matchedCode?: { language: string; code: string };
  matchedNote?: StudyNote;
}

function buildExcerpt(text: string, query: string, maxLen = 220): string {
  if (!text) return "";
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text;
  }

  const terms = cleanQuery.split(/\s+/).filter((t) => t.length > 1);
  const lower = text.toLowerCase();
  let matchIdx = lower.indexOf(cleanQuery);
  if (matchIdx === -1 && terms.length > 0) {
    for (const term of terms) {
      matchIdx = lower.indexOf(term);
      if (matchIdx !== -1) break;
    }
  }

  if (matchIdx === -1) {
    return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text;
  }

  const start = Math.max(0, matchIdx - 60);
  const end = Math.min(text.length, matchIdx + maxLen - 60);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";
  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}

export function executeVaultSearch(
  query: string,
  conversations: Conversation[],
  messages: Message[],
  collections: Collection[],
  studyNotes: StudyNote[],
  filters: SearchFilterOptions = {}
): {
  hits: SearchHit[];
  counts: {
    all: number;
    conversations: number;
    code: number;
    formulas: number;
    notes: number;
  };
} {
  const {
    miniSearch,
    documentsById,
    formulasByConvId,
    codeBlocksByConvId,
  } = buildConversationSearchIndex(
    conversations,
    messages,
    collections,
    studyNotes
  );

  const convMap = new Map(conversations.map((c) => [c.id, c]));
  const colNameMap = new Map(collections.map((c) => [c.id, c.name]));
  const notesByConv = new Map<string, StudyNote[]>();
  for (const n of studyNotes) {
    const list = notesByConv.get(n.conversationId) || [];
    list.push(n);
    notesByConv.set(n.conversationId, list);
  }

  const trimmed = query.trim();
  let candidateHits: Array<{
    id: string;
    score: number;
    terms: string[];
  }> = [];

  if (trimmed.length > 0) {
    const rawResults = miniSearch.search(trimmed);
    const maxScore = rawResults.length > 0 ? rawResults[0].score || 1 : 1;
    candidateHits = rawResults.map((r) => ({
      id: r.id,
      score: Math.min(0.99, Math.max(0.5, Number(((r.score / maxScore) * 0.98).toFixed(2)))),
      terms: r.terms,
    }));
  } else {
    candidateHits = conversations.map((c) => ({
      id: c.id,
      score: 1.0,
      terms: [],
    }));
  }

  // Apply metadata filters first (collection, provider, favorites, tag)
  const baseFiltered = candidateHits.filter((item) => {
    const conv = convMap.get(item.id);
    if (!conv) return false;
    if (
      filters.collectionId &&
      filters.collectionId !== "all" &&
      !conv.collectionIds.includes(filters.collectionId)
    ) {
      return false;
    }
    if (
      filters.provider &&
      filters.provider !== "all" &&
      conv.sourceProvider !== filters.provider
    ) {
      return false;
    }
    if (filters.favoritesOnly && !conv.isFavorite) {
      return false;
    }
    if (
      filters.tag &&
      !conv.tags.some((t) => t.toLowerCase() === filters.tag!.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const allHits: SearchHit[] = baseFiltered
    .map((item) => {
      const conv = convMap.get(item.id)!;
      const doc = documentsById.get(item.id);
      const formulas = formulasByConvId.get(item.id) || [];
      const codeBlocks = codeBlocksByConvId.get(item.id) || [];
      const convNotes = notesByConv.get(item.id) || [];

      const snippetSource =
        doc?.messagesText || conv.summary || doc?.notesText || conv.title;
      const snippet = buildExcerpt(snippetSource, trimmed);

      return {
        conversation: conv,
        collectionNames: conv.collectionIds
          .map((cid) => colNameMap.get(cid))
          .filter(Boolean) as string[],
        score: item.score,
        matchedTerms: item.terms,
        snippet,
        matchedFormula: formulas[0],
        matchedCode: codeBlocks[0],
        matchedNote: convNotes[0],
      };
    });

  const counts = {
    all: allHits.length,
    conversations: allHits.length,
    code: allHits.filter((h) => h.conversation.hasCode || Boolean(h.matchedCode)).length,
    formulas: allHits.filter((h) => h.conversation.hasMath || Boolean(h.matchedFormula)).length,
    notes: allHits.filter((h) => Boolean(h.matchedNote)).length,
  };

  const scope = filters.scope || "all";
  const scopedHits = allHits.filter((h) => {
    if (scope === "code") return h.conversation.hasCode || Boolean(h.matchedCode);
    if (scope === "formulas") return h.conversation.hasMath || Boolean(h.matchedFormula);
    if (scope === "notes") return Boolean(h.matchedNote);
    return true;
  });

  return {
    hits: scopedHits,
    counts,
  };
}
