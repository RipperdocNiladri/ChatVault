# Google Stitch Design Reference Map

All 15 Google Stitch screens from `stitch_chatvault_ai_knowledge_organizer.zip` and the `obsidian_archive/DESIGN.md` design system specification were inspected (`code.html` and `screen.png`) and mapped to Next.js App Router routes and reusable React components.

## 1. Screen-to-Route Mapping

| # | Stitch Design Directory | Target Next.js Route | Primary Implementation Files |
| :--- | :--- | :--- | :--- |
| 1 | `chatvault_landing_page` | `/` | `src/app/(marketing)/page.tsx` |
| 2 | `chatvault_welcome_onboarding` | `/onboarding` | `src/app/onboarding/page.tsx` |
| 3 | `chatvault_dashboard` | `/dashboard` (Desktop) | `src/app/(workspace)/dashboard/page.tsx` |
| 4 | `chatvault_all_conversations` | `/conversations` | `src/app/(workspace)/conversations/page.tsx` |
| 5 | `chatvault_conversation_reader` | `/conversations/[id]` (Desktop) | `src/app/(workspace)/conversations/[id]/page.tsx` |
| 6 | `chatvault_my_collections` | `/collections` | `src/app/(workspace)/collections/page.tsx` |
| 7 | `chatvault_collection_details_engineering_physics` | `/collections/[id]` | `src/app/(workspace)/collections/[id]/page.tsx` |
| 8 | `chatvault_global_search_command_center` | `/search` (Desktop) & `⌘K` Modal | `src/app/(workspace)/search/page.tsx`, `src/components/search/command-palette-modal.tsx` |
| 9 | `chatvault_import_center` | `/imports` | `src/app/(workspace)/imports/page.tsx` |
| 10 | `chatvault_customize_collection_studio` | `/collections/new` & `/collections/[id]/customize` | `src/components/collections/collection-editor.tsx` |
| 11 | `chatvault_favorites` | `/favorites` | `src/app/(workspace)/favorites/page.tsx` |
| 12 | `chatvault_settings_personalization` | `/settings` | `src/app/(workspace)/settings/page.tsx` |
| 13 | `chatvault_mobile_dashboard` | `/dashboard` (Mobile `< 1024px`) | `src/app/(workspace)/dashboard/page.tsx`, `src/components/layout/mobile-navigation.tsx` |
| 14 | `chatvault_mobile_global_search` | `/search` (Mobile `< 1024px`) | `src/app/(workspace)/search/page.tsx` |
| 15 | `chatvault_mobile_conversation_reader` | `/conversations/[id]` (Mobile `< 1024px`) | `src/app/(workspace)/conversations/[id]/page.tsx` (includes sticky bottom action bar & slide-up scratchpad drawer) |
| — | *(Navigation requirement)* | `/recent` | `src/app/(workspace)/recent/page.tsx` |

---

## 2. Design System Token Translation (`obsidian_archive/DESIGN.md` & Stitch Tailwind Config)

- **Surface Hierarchy**:
  - `surface-container-lowest`: `#0c0e13` (code blocks, formula wells, search input wells)
  - `surface` / `background`: `#111318` (main application canvas)
  - `surface-container-low`: `#1a1b21` (sidebar, primary cards)
  - `surface-container`: `#1e1f25` (interactive chips, secondary containers)
  - `surface-container-high`: `#282a2f` (elevated hover states, active cards, modals)
  - `surface-container-highest`: `#33353a` (badges, switches)
- **Accent Tokens**:
  - `primary`: `#d0bcff` / `primary-container`: `#a078ff` (Electric Violet)
  - `secondary`: `#5de6ff` / `secondary-container`: `#00cbe6` (Quantum Cyan)
  - `tertiary`: `#4edea3` / `tertiary-container`: `#00a572` (Emerald Pulse — local status & verified badges)
  - `error`: `#ffb4ab` / `error-container`: `#93000a`
- **Typography**:
  - `Geist` for display, headlines, and body copy.
  - `JetBrains Mono` for technical metadata, timestamps, LaTeX source previews, and code blocks.

---

## 3. Honest Feature Representation Adjustments

Several static Stitch HTML prototypes contained decorative labels suggesting server-side or AI-model features (`Vector Semantic Hybrid 0.94`, `WASM ONNX Embeddings`, `Automatic AI Chat Classification`). Per engineering guidelines:
- All search badges honestly report **MiniSearch BM25 Local Full-Text Index • IndexedDB Cache**.
- **Compile Synthesis (.md)** on `/favorites` and `/collections/[id]` is wired to a real client-side Markdown compiler that bundles all transcripts, formulas, and study notes in that view into a downloadable `.md` file.
- **Study Review Deck** on `/favorites` launches an interactive recall modal powered by your actual starred conversations in IndexedDB.
