import type { Conversation, Message } from "@/types/entities";
import { extractCodeBlocksFromMarkdown, extractFormulasFromMarkdown } from "@/lib/utils";

export interface RawChatGPTMappingNode {
  id?: string;
  parent?: string | null;
  children?: string[];
  message?: {
    id?: string;
    author?: {
      role?: string;
      name?: string | null;
    };
    create_time?: number | string | null;
    content?: {
      content_type?: string;
      parts?: Array<string | { text?: string; [key: string]: unknown }>;
      text?: string;
    };
    metadata?: {
      model_slug?: string;
      is_visually_hidden_from_conversation?: boolean;
      [key: string]: unknown;
    };
  } | null;
}

export interface RawChatGPTConversation {
  id?: string;
  conversation_id?: string;
  title?: string | null;
  create_time?: number | string | null;
  update_time?: number | string | null;
  current_node?: string | null;
  default_model_slug?: string | null;
  mapping?: Record<string, RawChatGPTMappingNode>;
  messages?: Array<{
    id?: string;
    role?: string;
    author?: string;
    content?: string;
    create_time?: number | string | null;
  }>;
}

export interface NormalizedConversationBundle {
  conversation: Conversation;
  messages: Message[];
}

function toIsoTimestamp(value: number | string | null | undefined, fallbackIso: string): string {
  if (value === null || value === undefined) return fallbackIso;
  if (typeof value === "number") {
    const ms = value < 1e11 ? value * 1000 : value;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? fallbackIso : d.toISOString();
  }
  if (typeof value === "string") {
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== "") {
      const ms = num < 1e11 ? num * 1000 : num;
      const d = new Date(ms);
      if (!isNaN(d.getTime())) return d.toISOString();
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? fallbackIso : d.toISOString();
  }
  return fallbackIso;
}

function stripMarkdownToPlain(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, (block) =>
      block.replace(/```[a-zA-Z0-9_-]*\n?/, "").replace(/```$/, "")
    )
    .replace(/[#>*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function inferTagsFromContent(title: string, plainText: string, codeLanguages: string[]): string[] {
  const tags = new Set<string>();
  const combined = `${title} ${plainText}`.toLowerCase();

  for (const lang of codeLanguages) {
    if (lang && lang !== "text") {
      tags.add(lang.charAt(0).toUpperCase() + lang.slice(1));
    }
  }

  const keywordMap: Array<[RegExp, string]> = [
    [/\b(quantum|schr[oö]dinger|wavefunction|maxwell|optics|thermodynamics|physics)\b/i, "Physics"],
    [/\b(tree|graph|dijkstra|dynamic programming|avl|binary search|algorithm)\b/i, "Algorithms"],
    [/\b(pointer|malloc|valgrind|posix|kernel|segfault|heap|stack)\b/i, "Systems"],
    [/\b(eigenvalue|matrix|linear algebra|calculus|fourier|integral|theorem)\b/i, "Mathematics"],
    [/\b(pytorch|transformer|attention|neural|backprop|llm|cuda)\b/i, "AI-ML"],
    [/\b(rust|nextjs|react|sqlite|typescript|tailwind)\b/i, "Engineering"],
  ];

  for (const [regex, tag] of keywordMap) {
    if (regex.test(combined)) {
      tags.add(tag);
    }
  }

  if (tags.size === 0) {
    tags.add("Imported");
  }

  return Array.from(tags).slice(0, 5);
}

function extractMessageText(
  content: NonNullable<RawChatGPTMappingNode["message"]>["content"]
): string {
  if (!content) return "";
  if (typeof content.text === "string" && content.text.trim()) {
    return content.text.trim();
  }
  if (Array.isArray(content.parts)) {
    return content.parts
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && typeof part.text === "string") {
          return part.text;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n")
      .trim();
  }
  return "";
}

function traverseMappingNodes(
  mapping: Record<string, RawChatGPTMappingNode>,
  currentNodeId?: string | null
): RawChatGPTMappingNode[] {
  const nodeIds = Object.keys(mapping);
  if (nodeIds.length === 0) return [];

  // Prefer tracing from current_node back to root for the active branch
  if (currentNodeId && mapping[currentNodeId]) {
    const chain: RawChatGPTMappingNode[] = [];
    const visited = new Set<string>();
    let cursor: string | null | undefined = currentNodeId;
    while (cursor && mapping[cursor] && !visited.has(cursor)) {
      visited.add(cursor);
      chain.push(mapping[cursor]);
      cursor = mapping[cursor].parent;
    }
    return chain.reverse();
  }

  // Fallback: DFS from root node(s)
  const roots = nodeIds.filter((id) => !mapping[id].parent || !mapping[mapping[id].parent!]);
  const startIds = roots.length > 0 ? roots : [nodeIds[0]];
  const result: RawChatGPTMappingNode[] = [];
  const visited = new Set<string>();

  const stack = [...startIds.reverse()];
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (visited.has(id) || !mapping[id]) continue;
    visited.add(id);
    result.push(mapping[id]);
    const children = mapping[id].children || [];
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push(children[i]);
    }
  }
  return result;
}

export function normalizeChatGPTConversation(
  raw: RawChatGPTConversation,
  index = 0,
  targetCollectionIds: string[] = []
): NormalizedConversationBundle | null {
  if (!raw || typeof raw !== "object") return null;

  const nowIso = new Date().toISOString();
  const externalId =
    (typeof raw.id === "string" && raw.id.trim()) ||
    (typeof raw.conversation_id === "string" && raw.conversation_id.trim()) ||
    null;

  const convId = externalId
    ? `conv-${externalId.replace(/[^a-zA-Z0-9_-]/g, "")}`
    : `conv-import-${Date.now()}-${index}`;

  const createdAt = toIsoTimestamp(raw.create_time, nowIso);
  const updatedAt = toIsoTimestamp(raw.update_time, createdAt);

  const normalizedMessages: Message[] = [];
  let detectedModel = raw.default_model_slug || "ChatGPT";

  if (raw.mapping && typeof raw.mapping === "object") {
    const orderedNodes = traverseMappingNodes(raw.mapping, raw.current_node);
    for (const node of orderedNodes) {
      const msg = node.message;
      if (!msg) continue;
      if (msg.metadata?.is_visually_hidden_from_conversation) continue;

      const rawRole = msg.author?.role || "user";
      if (rawRole !== "user" && rawRole !== "assistant" && rawRole !== "system" && rawRole !== "tool") {
        continue;
      }

      const contentMarkdown = extractMessageText(msg.content);
      if (!contentMarkdown) continue;
      // Skip empty system preambles
      if (rawRole === "system" && contentMarkdown.length < 5) continue;

      if (msg.metadata?.model_slug && typeof msg.metadata.model_slug === "string") {
        detectedModel = msg.metadata.model_slug;
      }

      const codeBlocks = extractCodeBlocksFromMarkdown(contentMarkdown);
      const codeLanguages = Array.from(new Set(codeBlocks.map((b) => b.language)));

      normalizedMessages.push({
        id: `${convId}-msg-${normalizedMessages.length + 1}`,
        conversationId: convId,
        externalMessageId: msg.id || node.id || null,
        role: rawRole,
        authorName:
          rawRole === "user"
            ? msg.author?.name || "User"
            : msg.author?.name || detectedModel || "ChatGPT",
        contentMarkdown,
        contentPlainText: stripMarkdownToPlain(contentMarkdown),
        createdAt: toIsoTimestamp(msg.create_time, createdAt),
        orderIndex: normalizedMessages.length,
        hasCode: codeBlocks.length > 0,
        codeLanguages,
        isDemo: false,
      });
    }
  } else if (Array.isArray(raw.messages)) {
    for (const m of raw.messages) {
      if (!m || typeof m.content !== "string" || !m.content.trim()) continue;
      const role =
        m.role === "assistant" || m.role === "system" || m.role === "tool"
          ? m.role
          : "user";
      const contentMarkdown = m.content.trim();
      const codeBlocks = extractCodeBlocksFromMarkdown(contentMarkdown);
      const codeLanguages = Array.from(new Set(codeBlocks.map((b) => b.language)));

      normalizedMessages.push({
        id: `${convId}-msg-${normalizedMessages.length + 1}`,
        conversationId: convId,
        externalMessageId: m.id || null,
        role,
        authorName: m.author || (role === "user" ? "User" : "ChatGPT"),
        contentMarkdown,
        contentPlainText: stripMarkdownToPlain(contentMarkdown),
        createdAt: toIsoTimestamp(m.create_time, createdAt),
        orderIndex: normalizedMessages.length,
        hasCode: codeBlocks.length > 0,
        codeLanguages,
        isDemo: false,
      });
    }
  }

  if (normalizedMessages.length === 0) {
    return null;
  }

  const allMarkdown = normalizedMessages.map((m) => m.contentMarkdown).join("\n\n");
  const allPlain = normalizedMessages.map((m) => m.contentPlainText).join(" ");
  const allCodeBlocks = extractCodeBlocksFromMarkdown(allMarkdown);
  const allFormulas = extractFormulasFromMarkdown(allMarkdown);
  const allLanguages = Array.from(
    new Set(normalizedMessages.flatMap((m) => m.codeLanguages))
  );

  const wordCount = allPlain
    .split(/\s+/)
    .filter(Boolean).length;

  const firstAssistant = normalizedMessages.find((m) => m.role === "assistant");
  const firstUser = normalizedMessages.find((m) => m.role === "user");
  const fallbackTitle = firstUser
    ? firstUser.contentPlainText.slice(0, 64)
    : "Untitled Conversation";
  const title =
    typeof raw.title === "string" && raw.title.trim() && raw.title.trim() !== "New chat"
      ? raw.title.trim()
      : fallbackTitle;

  const summarySource = firstAssistant?.contentPlainText || firstUser?.contentPlainText || title;
  const summary =
    summarySource.length > 200 ? `${summarySource.slice(0, 197)}...` : summarySource;

  let featuredSnippet: Conversation["featuredSnippet"] | undefined;
  if (allFormulas.length > 0) {
    featuredSnippet = {
      type: "MATH",
      label: "Extracted Formula",
      content: allFormulas[0].slice(0, 100),
    };
  } else if (allCodeBlocks.length > 0) {
    featuredSnippet = {
      type: "CODE",
      label: allCodeBlocks[0].language || "snippet",
      content: allCodeBlocks[0].code.split("\n")[0].slice(0, 100),
    };
  }

  const conversation: Conversation = {
    id: convId,
    externalId,
    sourceProvider: "chatgpt",
    modelName: String(detectedModel),
    title,
    summary,
    createdAt,
    updatedAt,
    importedAt: nowIso,
    collectionIds: targetCollectionIds,
    tags: inferTagsFromContent(title, allPlain, allLanguages),
    isFavorite: false,
    isArchived: false,
    isDemo: false,
    messageCount: normalizedMessages.length,
    wordCount,
    codeBlockCount: allCodeBlocks.length,
    formulaCount: allFormulas.length,
    hasCode: allCodeBlocks.length > 0,
    hasMath: allFormulas.length > 0,
    lastViewedAt: null,
    featuredSnippet,
  };

  return {
    conversation,
    messages: normalizedMessages,
  };
}
