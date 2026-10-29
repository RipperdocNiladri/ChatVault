import { z } from "zod";

export const AIProviderSchema = z.enum(["chatgpt", "claude", "gemini", "other"]);
export const AccentThemeSchema = z.enum(["violet", "cyan", "emerald", "amber", "rose"]);
export const CoverStyleSchema = z.enum([
  "quantum-wave",
  "binary-tree",
  "memory-registers",
  "linear-algebra",
  "neural-grid",
  "rust-architecture",
  "custom-image",
]);

export const ConversationSchema = z.object({
  id: z.string().min(1),
  externalId: z.string().nullable(),
  sourceProvider: AIProviderSchema,
  modelName: z.string().optional(),
  title: z.string().min(1),
  summary: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  importedAt: z.string(),
  collectionIds: z.array(z.string()),
  tags: z.array(z.string()),
  isFavorite: z.boolean(),
  isArchived: z.boolean(),
  isDemo: z.boolean().optional(),
  messageCount: z.number().int().nonnegative(),
  wordCount: z.number().int().nonnegative(),
  codeBlockCount: z.number().int().nonnegative(),
  formulaCount: z.number().int().nonnegative(),
  hasCode: z.boolean(),
  hasMath: z.boolean(),
  lastViewedAt: z.string().nullable(),
  featuredSnippet: z
    .object({
      type: z.enum(["MATH", "CODE", "TRACE", "LOGIC", "QUERY"]),
      label: z.string().optional(),
      content: z.string(),
    })
    .optional(),
});

export const MessageSchema = z.object({
  id: z.string().min(1),
  conversationId: z.string().min(1),
  externalMessageId: z.string().nullable(),
  role: z.enum(["user", "assistant", "system", "tool"]),
  authorName: z.string().nullable(),
  contentMarkdown: z.string(),
  contentPlainText: z.string(),
  createdAt: z.string().nullable(),
  orderIndex: z.number().int().nonnegative(),
  hasCode: z.boolean(),
  codeLanguages: z.array(z.string()),
  isDemo: z.boolean().optional(),
});

export const CollectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Collection name is required").max(80),
  slug: z.string().min(1),
  description: z.string().max(500),
  icon: z.string().min(1),
  accentColor: AccentThemeSchema,
  coverStyle: CoverStyleSchema,
  coverImageUrl: z.string().nullable(),
  tags: z.array(z.string()),
  isFavorite: z.boolean(),
  isDefault: z.boolean(),
  isDemo: z.boolean().optional(),
  sortOrder: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const StudyNoteSchema = z.object({
  id: z.string().min(1),
  conversationId: z.string().min(1),
  messageId: z.string().nullable(),
  title: z.string(),
  contentMarkdown: z.string(),
  tags: z.array(z.string()),
  isPinned: z.boolean(),
  isDemo: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ImportJobSchema = z.object({
  id: z.string().min(1),
  fileName: z.string(),
  fileSizeBytes: z.number().nonnegative(),
  sourceType: z.enum(["chatgpt_zip", "chatgpt_json", "chatvault_backup"]),
  status: z.enum(["pending", "parsing", "completed", "failed"]),
  totalConversationsFound: z.number().int().nonnegative(),
  conversationsImported: z.number().int().nonnegative(),
  DuplicatesSkipped: z.number().int().nonnegative(),
  invalidSkipped: z.number().int().nonnegative(),
  errorMessage: z.string().nullable(),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
  isDemo: z.boolean().optional(),
});

export const UserPreferencesSchema = z.object({
  id: z.literal("default"),
  userName: z.string().min(1),
  userRole: z.string(),
  themeMode: z.enum(["obsidian", "carbon", "slate"]),
  accentTheme: AccentThemeSchema,
  readingFontSize: z.enum(["sm", "md", "lg"]),
  readingDensity: z.enum(["compact", "comfortable", "spacious"]),
  codeBlockWrap: z.boolean(),
  codeLineNumbers: z.boolean(),
  reducedMotion: z.boolean(),
  defaultCollectionView: z.enum(["grid", "list"]),
  hasCompletedOnboarding: z.boolean(),
  demoModeActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ChatVaultBackupSchema = z.object({
  version: z.number(),
  exportedAt: z.string(),
  app: z.literal("chatvault"),
  conversations: z.array(ConversationSchema),
  messages: z.array(MessageSchema),
  collections: z.array(CollectionSchema),
  studyNotes: z.array(StudyNoteSchema),
  importJobs: z.array(ImportJobSchema),
  preferences: UserPreferencesSchema.optional(),
});
