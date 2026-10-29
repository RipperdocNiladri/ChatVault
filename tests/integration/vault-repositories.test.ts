import { describe, it, expect, beforeEach } from "vitest";
import {
  clearDemoData,
  collectionRepository,
  conversationRepository,
  purgeAllVaultData,
  seedDemoData,
  studyNoteRepository,
} from "@/db/repositories";
import {
  commitImportBundles,
  createSampleChatGPTExportJson,
  parseChatGPTJsonString,
} from "@/lib/importers/import-service";
import {
  exportFullVaultBackupJson,
  restoreFullVaultBackupJson,
} from "@/lib/export/backup-service";

describe("Vault Repositories, Duplicate Detection & Backup Lifecycle", () => {
  beforeEach(async () => {
    await purgeAllVaultData();
  });

  it("creates, edits, favorites, and deletes collections while preserving conversations", async () => {
    await seedDemoData(true);

    const created = await collectionRepository.save({
      name: "Operating Systems Internals",
      description: "Virtual memory paging and epoll event loops",
      icon: "memory",
      accentColor: "cyan",
      coverStyle: "memory-registers",
      coverImageUrl: null,
      tags: ["Kernel", "Paging"],
      isFavorite: false,
      isDefault: false,
    });

    expect(created.id).toContain("col-operating-systems-internals");

    const favState = await collectionRepository.toggleFavorite(created.id);
    expect(favState).toBe(true);

    const allConvsBefore = await conversationRepository.getAll();
    await conversationRepository.bulkAssignCollection(
      [allConvsBefore[0].id],
      created.id
    );

    await collectionRepository.delete(created.id);
    const updatedConv = await conversationRepository.getById(allConvsBefore[0].id);
    expect(updatedConv).toBeDefined();
    expect(updatedConv?.collectionIds).not.toContain(created.id);
  });

  it("handles duplicate detection (skip vs keep_both) during ChatGPT import", async () => {
    const sampleJson = createSampleChatGPTExportJson();
    const parsed = parseChatGPTJsonString(sampleJson);

    const firstCommit = await commitImportBundles(parsed.bundles, {
      fileName: "sample.json",
      fileSizeBytes: 1024,
      sourceType: "chatgpt_json",
      duplicateStrategy: "skip",
    });
    expect(firstCommit.job.conversationsImported).toBe(2);
    expect(firstCommit.job.DuplicatesSkipped).toBe(0);

    // Second commit with skip strategy should skip both duplicates
    const secondCommit = await commitImportBundles(parsed.bundles, {
      fileName: "sample.json",
      fileSizeBytes: 1024,
      sourceType: "chatgpt_json",
      duplicateStrategy: "skip",
    });
    expect(secondCommit.job.conversationsImported).toBe(0);
    expect(secondCommit.job.DuplicatesSkipped).toBe(2);

    // Third commit with keep_both should import 2 new copies
    const thirdCommit = await commitImportBundles(parsed.bundles, {
      fileName: "sample.json",
      fileSizeBytes: 1024,
      sourceType: "chatgpt_json",
      duplicateStrategy: "keep_both",
    });
    expect(thirdCommit.job.conversationsImported).toBe(2);
    const all = await conversationRepository.getAll();
    expect(all).toHaveLength(4);
  });

  it("persists study notes and exports/restores full vault backup JSON", async () => {
    await seedDemoData(true);
    await studyNoteRepository.upsertForConversation(
      "conv-schrodinger-wave-equation",
      "Updated quantum exam note content",
      "Quantum Note"
    );

    const backupJson = await exportFullVaultBackupJson();
    await purgeAllVaultData();
    expect(await conversationRepository.getAll()).toHaveLength(0);

    const restored = await restoreFullVaultBackupJson(backupJson, "replace");
    expect(restored.conversationsRestored).toBeGreaterThan(0);

    const notes = await studyNoteRepository.getByConversationId(
      "conv-schrodinger-wave-equation"
    );
    expect(notes[0].contentMarkdown).toContain("Updated quantum exam note content");

    await clearDemoData();
  });
});
