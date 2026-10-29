import MiniSearch from "minisearch";
import type {
  Collection,
  Conversation,
  Message,
  StudyNote,
} from "@/types/entities";
import { extractCodeBlocksFromMarkdown, extractFormulasFromMarkdown } from "@/lib/utils";

export interface IndexedConversationDocument {
  id: string;
  title: string;
  summary: string;
  tagsText: string;
  collectionsText: string;
  messagesText: string;
  codeText: string;
  formulasText: string;
  notesText: string;
  sourceProvider: string;
  isFavorite: boolean;
  hasCode: boolean;
  hasMath: boolean;
  hasNotes: boolean;
  collectionIds: string[];
  updatedAt: string;
}

export function buildConversationSearchIndex(
  conversations: Conversation[],
  messages: Message[],
  collections: Collection[],
  studyNotes: StudyNote[]
): {
  miniSearch: MiniSearch<IndexedConversationDocument>;
  documentsById: Map<string, IndexedConversationDocument>;
  formulasByConvId: Map<string, string[]>;
  codeBlocksByConvId: Map<string, Array<{ language: string; code: string }>>;
} {
  const collectionMap = new Map(collections.map((c) => [c.id, c.name]));
  const messagesByConv = new Map<string, Message[]>();
  for (const m of messages) {
    const list = messagesByConv.get(m.conversationId) || [];
    list.push(m);
    messagesByConv.set(m.conversationId, list);
  }

  const notesByConv = new Map<string, StudyNote[]>();
  for (const n of studyNotes) {
    const list = notesByConv.get(n.conversationId) || [];
    list.push(n);
    notesByConv.set(n.conversationId, list);
  }

  const documentsById = new Map<string, IndexedConversationDocument>();
  const formulasByConvId = new Map<string, string[]>();
  const codeBlocksByConvId = new Map<
    string,
    Array<{ language: string; code: string }>
  >();

  const miniSearch = new MiniSearch<IndexedConversationDocument>({
    fields: [
      "title",
      "tagsText",
      "collectionsText",
      "summary",
      "formulasText",
      "codeText",
      "notesText",
      "messagesText",
    ],
    storeFields: [
      "id",
      "title",
      "sourceProvider",
      "isFavorite",
      "hasCode",
      "hasMath",
      "hasNotes",
      "collectionIds",
      "updatedAt",
    ],
    searchOptions: {
      boost: {
        title: 3.5,
        tagsText: 2.5,
        collectionsText: 2.0,
        formulasText: 2.2,
        codeText: 1.8,
        notesText: 1.8,
        summary: 1.5,
        messagesText: 1.0,
      },
      prefix: true,
      fuzzy: 0.2,
    },
  });

  const docs: IndexedConversationDocument[] = [];

  for (const conv of conversations) {
    const convMessages = messagesByConv.get(conv.id) || [];
    const convNotes = notesByConv.get(conv.id) || [];
    const allMarkdown = convMessages.map((m) => m.contentMarkdown).join("\n\n");
    const formulas = extractFormulasFromMarkdown(allMarkdown);
    if (
      conv.featuredSnippet?.type === "MATH" &&
      !formulas.includes(conv.featuredSnippet.content)
    ) {
      formulas.unshift(conv.featuredSnippet.content);
    }
    const codeBlocks = extractCodeBlocksFromMarkdown(allMarkdown);

    formulasByConvId.set(conv.id, formulas);
    codeBlocksByConvId.set(conv.id, codeBlocks);

    const doc: IndexedConversationDocument = {
      id: conv.id,
      title: conv.title,
      summary: conv.summary,
      tagsText: conv.tags.join(" "),
      collectionsText: conv.collectionIds
        .map((cid) => collectionMap.get(cid) || "")
        .join(" "),
      messagesText: convMessages.map((m) => m.contentPlainText).join(" "),
      codeText: codeBlocks.map((b) => `${b.language} ${b.code}`).join("\n"),
      formulasText: formulas.join(" "),
      notesText: convNotes
        .map((n) => `${n.title} ${n.contentMarkdown} ${n.tags.join(" ")}`)
        .join(" "),
      sourceProvider: conv.sourceProvider,
      isFavorite: conv.isFavorite,
      hasCode: conv.hasCode || codeBlocks.length > 0,
      hasMath: conv.hasMath || formulas.length > 0,
      hasNotes: convNotes.length > 0,
      collectionIds: conv.collectionIds,
      updatedAt: conv.updatedAt,
    };

    docs.push(doc);
    documentsById.set(conv.id, doc);
  }

  miniSearch.addAll(docs);

  return {
    miniSearch,
    documentsById,
    formulasByConvId,
    codeBlocksByConvId,
  };
}
