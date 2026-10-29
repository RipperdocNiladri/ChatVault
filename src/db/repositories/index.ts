import { db } from "@/db/database";
import {
  DEFAULT_PREFERENCES,
  DEMO_COLLECTIONS,
  DEMO_CONVERSATIONS,
  DEMO_IMPORT_JOBS,
  DEMO_MESSAGES,
  DEMO_STUDY_NOTES,
} from "@/lib/demo-data";
import { slugify } from "@/lib/utils";
import type {
  Collection,
  Conversation,
  ImportJob,
  Message,
  StudyNote,
  UserPreferences,
} from "@/types/entities";

let initializationPromise: Promise<void> | null = null;

export async function ensureVaultInitialized(): Promise<void> {
  if (typeof window === "undefined") return;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    const existingPrefs = await db.preferences.get("default");
    if (!existingPrefs) {
      await db.preferences.put(DEFAULT_PREFERENCES);
      const count = await db.conversations.count();
      if (count === 0) {
        await seedDemoData(false);
      }
    }
  })();

  return initializationPromise;
}

export async function seedDemoData(markOnboardingComplete = true): Promise<void> {
  await db.transaction(
    "rw",
    [db.collections, db.conversations, db.messages, db.studyNotes, db.importJobs, db.preferences],
    async () => {
      await db.collections.bulkPut(DEMO_COLLECTIONS);
      await db.conversations.bulkPut(DEMO_CONVERSATIONS);
      await db.messages.bulkPut(DEMO_MESSAGES);
      await db.studyNotes.bulkPut(DEMO_STUDY_NOTES);
      await db.importJobs.bulkPut(DEMO_IMPORT_JOBS);

      const prefs = (await db.preferences.get("default")) || DEFAULT_PREFERENCES;
      await db.preferences.put({
        ...prefs,
        demoModeActive: true,
        hasCompletedOnboarding: markOnboardingComplete ? true : prefs.hasCompletedOnboarding,
        updatedAt: new Date().toISOString(),
      });
    }
  );
}

export async function clearDemoData(): Promise<void> {
  await db.transaction(
    "rw",
    [db.collections, db.conversations, db.messages, db.studyNotes, db.importJobs, db.preferences],
    async () => {
      const demoConvIds = await db.conversations
        .filter((c) => Boolean(c.isDemo))
        .primaryKeys();
      const demoColIds = await db.collections
        .filter((c) => Boolean(c.isDemo))
        .primaryKeys();
      const demoMsgIds = await db.messages
        .filter((m) => Boolean(m.isDemo))
        .primaryKeys();
      const demoNoteIds = await db.studyNotes
        .filter((n) => Boolean(n.isDemo))
        .primaryKeys();
      const demoJobIds = await db.importJobs
        .filter((j) => Boolean(j.isDemo))
        .primaryKeys();

      await db.conversations.bulkDelete(demoConvIds);
      await db.collections.bulkDelete(demoColIds);
      await db.messages.bulkDelete(demoMsgIds);
      await db.studyNotes.bulkDelete(demoNoteIds);
      await db.importJobs.bulkDelete(demoJobIds);

      const prefs = (await db.preferences.get("default")) || DEFAULT_PREFERENCES;
      await db.preferences.put({
        ...prefs,
        demoModeActive: false,
        updatedAt: new Date().toISOString(),
      });
    }
  );
}

export async function purgeAllVaultData(): Promise<void> {
  await db.transaction(
    "rw",
    [db.collections, db.conversations, db.messages, db.studyNotes, db.importJobs, db.preferences],
    async () => {
      await db.conversations.clear();
      await db.messages.clear();
      await db.collections.clear();
      await db.studyNotes.clear();
      await db.importJobs.clear();
      await db.preferences.put({
        ...DEFAULT_PREFERENCES,
        demoModeActive: false,
        hasCompletedOnboarding: true,
        updatedAt: new Date().toISOString(),
      });
    }
  );
}

// Conversations Repository
export const conversationRepository = {
  async getAll(): Promise<Conversation[]> {
    return db.conversations.orderBy("updatedAt").reverse().toArray();
  },

  async getById(id: string): Promise<Conversation | undefined> {
    return db.conversations.get(id);
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    return db.messages
      .where("conversationId")
      .equals(conversationId)
      .sortBy("orderIndex");
  },

  async markViewed(id: string): Promise<void> {
    const conv = await db.conversations.get(id);
    if (!conv) return;
    await db.conversations.update(id, {
      lastViewedAt: new Date().toISOString(),
    });
  },

  async toggleFavorite(id: string): Promise<boolean> {
    const conv = await db.conversations.get(id);
    if (!conv) return false;
    const nextState = !conv.isFavorite;
    await db.conversations.update(id, {
      isFavorite: nextState,
      updatedAt: new Date().toISOString(),
    });
    return nextState;
  },

  async updateTags(id: string, tags: string[]): Promise<void> {
    const clean = Array.from(new Set(tags.map((t) => t.trim().replace(/^#/, "")).filter(Boolean)));
    await db.conversations.update(id, {
      tags: clean,
      updatedAt: new Date().toISOString(),
    });
  },

  async assignCollections(id: string, collectionIds: string[]): Promise<void> {
    await db.conversations.update(id, {
      collectionIds: Array.from(new Set(collectionIds)),
      updatedAt: new Date().toISOString(),
    });
  },

  async bulkAssignCollection(conversationIds: string[], collectionId: string): Promise<void> {
    await db.transaction("rw", db.conversations, async () => {
      for (const id of conversationIds) {
        const conv = await db.conversations.get(id);
        if (conv) {
          const nextCols = Array.from(new Set([...conv.collectionIds, collectionId]));
          await db.conversations.update(id, {
            collectionIds: nextCols,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    });
  },

  async bulkAddTag(conversationIds: string[], tag: string): Promise<void> {
    const cleanTag = tag.trim().replace(/^#/, "");
    if (!cleanTag) return;
    await db.transaction("rw", db.conversations, async () => {
      for (const id of conversationIds) {
        const conv = await db.conversations.get(id);
        if (conv) {
          const nextTags = Array.from(new Set([...conv.tags, cleanTag]));
          await db.conversations.update(id, {
            tags: nextTags,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    });
  },

  async deleteByIds(conversationIds: string[]): Promise<void> {
    await db.transaction("rw", [db.conversations, db.messages, db.studyNotes], async () => {
      await db.conversations.bulkDelete(conversationIds);
      for (const convId of conversationIds) {
        await db.messages.where("conversationId").equals(convId).delete();
        await db.studyNotes.where("conversationId").equals(convId).delete();
      }
    });
  },
};

// Collections Repository
export const collectionRepository = {
  async getAll(): Promise<Collection[]> {
    return db.collections.orderBy("sortOrder").toArray();
  },

  async getById(id: string): Promise<Collection | undefined> {
    const direct = await db.collections.get(id);
    if (direct) return direct;
    return db.collections.where("slug").equals(id).first();
  },

  async save(
    input: Omit<Collection, "id" | "slug" | "createdAt" | "updatedAt" | "sortOrder"> & {
      id?: string;
      sortOrder?: number;
    }
  ): Promise<Collection> {
    const now = new Date().toISOString();
    const existing = input.id ? await db.collections.get(input.id) : undefined;
    const baseSlug = slugify(input.name);
    const id = existing?.id || input.id || `col-${baseSlug}-${Date.now().toString(36)}`;
    const slug = existing?.slug || `${baseSlug}-${id.slice(-4)}`;
    const count = await db.collections.count();

    const record: Collection = {
      id,
      name: input.name.trim(),
      slug,
      description: input.description.trim(),
      icon: input.icon || "folder_special",
      accentColor: input.accentColor || "violet",
      coverStyle: input.coverStyle || "quantum-wave",
      coverImageUrl: input.coverImageUrl ?? null,
      tags: Array.from(new Set(input.tags.map((t) => t.trim().replace(/^#/, "")).filter(Boolean))),
      isFavorite: input.isFavorite ?? false,
      isDefault: input.isDefault ?? false,
      isDemo: existing?.isDemo ?? false,
      sortOrder: existing?.sortOrder ?? input.sortOrder ?? count + 1,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    await db.collections.put(record);
    return record;
  },

  async toggleFavorite(id: string): Promise<boolean> {
    const col = await db.collections.get(id);
    if (!col) return false;
    const nextState = !col.isFavorite;
    await db.collections.update(id, {
      isFavorite: nextState,
      updatedAt: new Date().toISOString(),
    });
    return nextState;
  },

  async delete(id: string): Promise<void> {
    await db.transaction("rw", [db.collections, db.conversations], async () => {
      await db.collections.delete(id);
      const affected = await db.conversations
        .where("collectionIds")
        .equals(id)
        .toArray();
      for (const conv of affected) {
        await db.conversations.update(conv.id, {
          collectionIds: conv.collectionIds.filter((cid) => cid !== id),
          updatedAt: new Date().toISOString(),
        });
      }
    });
  },
};

// Study Notes Repository
export const studyNoteRepository = {
  async getByConversationId(conversationId: string): Promise<StudyNote[]> {
    return db.studyNotes
      .where("conversationId")
      .equals(conversationId)
      .reverse()
      .sortBy("updatedAt");
  },

  async upsertForConversation(
    conversationId: string,
    contentMarkdown: string,
    title = "Study Scratchpad",
    tags: string[] = []
  ): Promise<StudyNote> {
    const existing = await db.studyNotes
      .where("conversationId")
      .equals(conversationId)
      .first();
    const now = new Date().toISOString();

    const record: StudyNote = existing
      ? {
          ...existing,
          title: title || existing.title,
          contentMarkdown,
          tags: tags.length > 0 ? tags : existing.tags,
          updatedAt: now,
        }
      : {
          id: `note-${conversationId}-${Date.now().toString(36)}`,
          conversationId,
          messageId: null,
          title,
          contentMarkdown,
          tags,
          isPinned: true,
          isDemo: false,
          createdAt: now,
          updatedAt: now,
        };

    await db.studyNotes.put(record);
    return record;
  },

  async delete(id: string): Promise<void> {
    await db.studyNotes.delete(id);
  },
};

// Preferences Repository
export const preferencesRepository = {
  async get(): Promise<UserPreferences> {
    const prefs = await db.preferences.get("default");
    return prefs || DEFAULT_PREFERENCES;
  },

  async update(patch: Partial<Omit<UserPreferences, "id">>): Promise<UserPreferences> {
    const current = await this.get();
    const updated: UserPreferences = {
      ...current,
      ...patch,
      id: "default",
      updatedAt: new Date().toISOString(),
    };
    await db.preferences.put(updated);
    return updated;
  },

  async reset(): Promise<UserPreferences> {
    const resetPrefs: UserPreferences = {
      ...DEFAULT_PREFERENCES,
      hasCompletedOnboarding: true,
      updatedAt: new Date().toISOString(),
    };
    await db.preferences.put(resetPrefs);
    return resetPrefs;
  },
};

// Storage Diagnostics
export async function getVaultStorageDiagnostics() {
  const [conversations, messages, collections, notes, jobs] = await Promise.all([
    db.conversations.toArray(),
    db.messages.toArray(),
    db.collections.toArray(),
    db.studyNotes.toArray(),
    db.importJobs.toArray(),
  ]);

  const jsonBytes = (obj: unknown) => new Blob([JSON.stringify(obj)]).size;
  const transcriptBytes = jsonBytes(conversations) + jsonBytes(messages);
  const collectionBytes = jsonBytes(collections);
  const notesBytes = jsonBytes(notes) + jsonBytes(jobs);
  const totalBytes = transcriptBytes + collectionBytes + notesBytes;

  return {
    conversationCount: conversations.length,
    messageCount: messages.length,
    collectionCount: collections.length,
    noteCount: notes.length,
    jobCount: jobs.length,
    transcriptBytes,
    collectionBytes,
    notesBytes,
    totalBytes,
  };
}

export async function recordImportJob(job: ImportJob): Promise<void> {
  await db.importJobs.put(job);
}
