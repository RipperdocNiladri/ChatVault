# ChatVault — Your AI Conversations. Beautifully Organized.

**ChatVault** is a visual-first, local-first AI conversation organizer and transcript reader built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Dexie.js (IndexedDB)**, and **MiniSearch**.

It transforms exported ChatGPT conversation archives (`.zip` or `conversations.json`) into a structured, searchable, and customizable personal library of subject vaults—without sending a single packet of your conversation history to a remote server.

---

## Key Features

1. **Local-First IndexedDB Persistence (`ChatVaultObsidianDB`)**
   - Stores conversations, messages, collections, study notes, import job logs, and user preferences locally in your browser via Dexie.js and `dexie-react-hooks`.
2. **Official ChatGPT Export Ingestion (`/imports`)**
   - Drag and drop an OpenAI `.zip` export or `conversations.json` file.
   - Reconstructs message trees (`mapping` + `current_node`), detects code blocks and LaTeX math formulas, auto-suggests subject tags, and supports `skip`, `overwrite`, or `keep_both` duplicate resolution strategies.
   - Includes a 1-click **Load Sample ChatGPT Export (.json)** test fixture for immediate evaluation.
3. **Customizable Subject Collections & Studio (`/collections`, `/collections/new`, `/collections/[id]/customize`)**
   - Group conversations by course, subject, or engineering project.
   - Live 1:1 preview studio with 6 procedural SVG cover illustrations (`quantum-wave`, `binary-tree`, `memory-registers`, `linear-algebra`, `neural-grid`, `rust-architecture`), custom cover image upload (`<= 3 MB`), 10 subject emblems, and 5 accent color palettes.
4. **Academic & Technical Transcript Reader (`/conversations/[id]`)**
   - Renders Markdown, GFM tables, KaTeX mathematical equations (`remark-math` + `rehype-katex`), and code blocks with 1-click clipboard copy.
   - Includes an auto-saving **Live Study Scratchpad** for personal lecture notes, interactive standing-wave harmonic visualization (`n=1, 2, 3`), extracted formula & code decks, and Markdown (`.md`) transcript export.
5. **Instant Client-Side Full-Text Search (`/search` & `⌘K`)**
   - Powered by **MiniSearch** (BM25 ranking with title/tag/formula/code boosting).
   - Filter by scope (`All`, `Conversations`, `Formulas & Math`, `Code Blocks`, `Study Notes`), collection, provider, or starred status.
6. **Full Vault Backup & Restore (`/settings`)**
   - Export your entire local database as a Zod-validated JSON snapshot and restore it (`merge` or `replace`) at any time.
   - Clean separation between preloaded **Demo Mode** academic sample data and user-imported archives.

---

## Getting Started

### Prerequisites
- Node.js 18.18+ and npm

### Installation & Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the development server at http://localhost:3000
npm run dev
```

### Verification & Testing

```bash
# TypeScript strict type checking
npm run typecheck

# ESLint static analysis
npm run lint

# Vitest unit and integration tests (Importer, MiniSearch, Dexie Repositories)
npm run test

# Production build verification
npm run build

# Playwright end-to-end tests
npm run test:e2e
```

---

## Project Documentation

- [`docs/architecture.md`](./docs/architecture.md) — System architecture, IndexedDB schema, search indexing, and data flow.
- [`docs/design-reference-map.md`](./docs/design-reference-map.md) — Complete screen-to-route and component mapping for all 15 Google Stitch design screens and `obsidian_archive/DESIGN.md`.
- [`docs/implementation-status.md`](./docs/implementation-status.md) — Feature checklist, honest representation notes, and test verification summary.
