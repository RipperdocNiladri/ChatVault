import type { Dexie } from "dexie";

export function registerMigrations(db: Dexie) {
  db.version(1).stores({
    conversations:
      "id, externalId, sourceProvider, title, createdAt, updatedAt, importedAt, *collectionIds, *tags, isFavorite, isArchived, isDemo, lastViewedAt",
    messages:
      "id, conversationId, externalMessageId, role, orderIndex, isDemo, [conversationId+orderIndex]",
    collections:
      "id, &slug, name, isFavorite, isDefault, isDemo, sortOrder, updatedAt",
    studyNotes:
      "id, conversationId, messageId, *tags, isPinned, isDemo, updatedAt",
    importJobs: "id, sourceType, status, startedAt, isDemo",
    preferences: "id",
  });
}
