# ChatVault Architecture

## 1. Architectural Overview

ChatVault is a **single-root, local-first Next.js 14 App Router** application. All persistence, archive parsing, full-text indexing, and backup serialization run entirely in the user's browser.

```text
chatvault/
├── src/
│   ├── app/
│   │   ├── (marketing)/page.tsx                  # / (Landing Page)
│   │   ├── onboarding/page.tsx                   # /onboarding (Guided Vault Setup)
│   │   ├── (workspace)/
│   │   │   ├── layout.tsx                        # Workspace Shell (Sidebar + Header + Mobile Nav + ⌘K)
│   │   │   ├── dashboard/page.tsx                # /dashboard
│   │   │   ├── conversations/page.tsx            # /conversations
│   │   │   ├── conversations/[id]/page.tsx       # /conversations/[id] (Reader + Scratchpad)
│   │   │   ├── collections/page.tsx              # /collections
│   │   │   ├── collections/new/page.tsx          # /collections/new (Studio)
│   │   │   ├── collections/[id]/page.tsx         # /collections/[id] (Collection Details)
│   │   │   ├── collections/[id]/customize/page.tsx # /collections/[id]/customize (Studio)
│   │   │   ├── search/page.tsx                   # /search (Global Search Command Center)
│   │   │   ├── imports/page.tsx                  # /imports (Import Center)
│   │   │   ├── favorites/page.tsx                # /favorites (Starred Deck & Study Review)
│   │   │   ├── recent/page.tsx                   # /recent (Chronological History)
│   │   │   └── settings/page.tsx                 # /settings (Themes, Storage Diagnostics, Backup)
│   ├── components/
│   │   ├── collections/                          # CollectionCard, CollectionCoverArt, CollectionStudioEditor
│   │   ├── conversations/                        # ConversationCard
│   │   ├── layout/                               # AppSidebar, AppHeader, MobileNavigation, WorkspaceShell
│   │   ├── search/                               # CommandPaletteModal (⌘K & Shortcuts <dialog>)
│   │   └── ui/                                   # MaterialIcon
│   ├── db/
│   │   ├── database.ts                           # Dexie instance (ChatVaultObsidianDB)
│   │   ├── migrations.ts                         # IndexedDB stores & compound indexes
│   │   ├── schema.ts                             # Zod validation schemas for all entities & backups
│   │   └── repositories/index.ts                 # Transactional CRUD & demo data lifecycle
│   ├── hooks/
│   │   └── use-vault-data.ts                     # Reactive dexie-react-hooks (useLiveQuery)
│   ├── lib/
│   │   ├── demo-data.ts                          # Realistic academic/engineering demo dataset
│   │   ├── export/backup-service.ts              # JSON snapshot export/restore & Markdown generator
│   │   ├── importers/                            # ChatGPT .zip & conversations.json parser & normalizer
│   │   ├── search/                               # MiniSearch BM25 indexer & query executor
│   │   └── utils.ts                              # Date, byte, formula & code extraction utilities
│   ├── store/
│   │   └── ui-store.ts                           # Zustand transient UI state (modals, selections)
│   └── types/
│       └── entities.ts                           # Strict TypeScript domain models
└── tests/
    ├── unit/                                     # Vitest unit tests (importer, search)
    ├── integration/                              # Vitest + fake-indexeddb repository & backup tests
    └── e2e/                                      # Playwright browser tests
```

---

## 2. Client-Side Data Layer (`Dexie.js` + `IndexedDB`)

Database name: `ChatVaultObsidianDB`

| Table | Primary Key | Indexed Fields | Purpose |
| :--- | :--- | :--- | :--- |
| `conversations` | `id` | `externalId, sourceProvider, title, createdAt, updatedAt, importedAt, *collectionIds, *tags, isFavorite, isArchived, isDemo, lastViewedAt` | Normalized conversation metadata, counts, and featured snippet |
| `messages` | `id` | `conversationId, externalMessageId, role, orderIndex, isDemo, [conversationId+orderIndex]` | Ordered user/assistant turns in Markdown and plain text |
| `collections` | `id` | `&slug, name, isFavorite, isDefault, isDemo, sortOrder, updatedAt` | Subject vaults with custom icons, accents, and cover art |
| `studyNotes` | `id` | `conversationId, messageId, *tags, isPinned, isDemo, updatedAt` | Persistent per-conversation study notes |
| `importJobs` | `id` | `sourceType, status, startedAt, isDemo` | Audit log of imported `.zip` and `.json` archives |
| `preferences` | `id` (`"default"`) | `id` | Theme mode, accent palette, reader font size, and onboarding state |

---

## 3. ChatGPT Import & Normalization Pipeline

1. **Defensive File Validation (`src/lib/importers/file-validation.ts`)**:
   - Enforces a 100 MB upload file limit and a 250 MB expanded JSON safety cap to prevent browser memory exhaustion or ZIP-bomb attacks.
2. **Archive Extraction (`src/lib/importers/chatgpt/parser.ts`)**:
   - Uses `JSZip` to locate `conversations.json` inside `.zip` archives or reads `.json` files directly.
3. **Tree Traversal & Normalization (`src/lib/importers/chatgpt/normalizer.ts`)**:
   - Walks the `mapping` object from `current_node` back to the root node (or falls back to DFS from root) to reconstruct the active conversation branch in chronological order.
   - Extracts fenced code blocks (` ```lang `) and LaTeX math expressions (`$$...$$`, `$...$`), computes word and turn counts, and infers initial subject tags.
4. **Duplicate Detection & Transactional Commit (`src/lib/importers/import-service.ts`)**:
   - Matches incoming `externalId` against existing IndexedDB records and applies the user's chosen strategy (`skip`, `overwrite`, or `keep_both`) inside an atomic Dexie transaction.

---

## 4. Browser-Side Full-Text Search (`MiniSearch`)

`src/lib/search/indexer.ts` and `src/lib/search/search-service.ts` build an in-memory BM25 index from IndexedDB records with field-level boosting:
- `title` (`3.5x`), `tagsText` (`2.5x`), `formulasText` (`2.2x`), `collectionsText` (`2.0x`), `codeText` (`1.8x`), `notesText` (`1.8x`), `summary` (`1.5x`), and `messagesText` (`1.0x`).
- Supports prefix matching and fuzzy matching (`0.2`), plus post-filtering by scope (`all`, `conversations`, `formulas`, `code`, `notes`), collection, provider, and favorites.
