export type AIProvider = "chatgpt" | "claude" | "gemini" | "other";

export type AccentTheme = "violet" | "cyan" | "emerald" | "amber" | "rose";

export type CoverStyle =
  | "quantum-wave"
  | "binary-tree"
  | "memory-registers"
  | "linear-algebra"
  | "neural-grid"
  | "rust-architecture"
  | "custom-image";

export interface ExtractedSnippet {
  id: string;
  type: "formula" | "code";
  label: string;
  language?: string;
  content: string;
  conversationId: string;
  conversationTitle: string;
}

export interface Conversation {
  id: string;
  externalId: string | null;
  sourceProvider: AIProvider;
  modelName?: string;
  title: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  importedAt: string;
  collectionIds: string[];
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  isDemo?: boolean;
  messageCount: number;
  wordCount: number;
  codeBlockCount: number;
  formulaCount: number;
  hasCode: boolean;
  hasMath: boolean;
  lastViewedAt: string | null;
  featuredSnippet?: {
    type: "MATH" | "CODE" | "TRACE" | "LOGIC" | "QUERY";
    label?: string;
    content: string;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  externalMessageId: string | null;
  role: "user" | "assistant" | "system" | "tool";
  authorName: string | null;
  contentMarkdown: string;
  contentPlainText: string;
  createdAt: string | null;
  orderIndex: number;
  hasCode: boolean;
  codeLanguages: string[];
  isDemo?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  accentColor: AccentTheme;
  coverStyle: CoverStyle;
  coverImageUrl: string | null;
  tags: string[];
  isFavorite: boolean;
  isDefault: boolean;
  isDemo?: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudyNote {
  id: string;
  conversationId: string;
  messageId: string | null;
  title: string;
  contentMarkdown: string;
  tags: string[];
  isPinned: boolean;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ImportJob {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  sourceType: "chatgpt_zip" | "chatgpt_json" | "chatvault_backup";
  status: "pending" | "parsing" | "completed" | "failed";
  totalConversationsFound: number;
  conversationsImported: number;
  DuplicatesSkipped: number;
  invalidSkipped: number;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
  isDemo?: boolean;
}

export interface UserPreferences {
  id: "default";
  userName: string;
  userRole: string;
  themeMode: "obsidian" | "carbon" | "slate";
  accentTheme: AccentTheme;
  readingFontSize: "sm" | "md" | "lg";
  readingDensity: "compact" | "comfortable" | "spacious";
  codeBlockWrap: boolean;
  codeLineNumbers: boolean;
  reducedMotion: boolean;
  defaultCollectionView: "grid" | "list";
  hasCompletedOnboarding: boolean;
  demoModeActive: boolean;
  createdAt: string;
  updatedAt: string;
}
