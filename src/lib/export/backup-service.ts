import { db } from "@/db/database";
import { ChatVaultBackupSchema } from "@/db/schema";
import type { Conversation, Message, StudyNote } from "@/types/entities";

export async function exportFullVaultBackupJson(): Promise<string> {
  const [conversations, messages, collections, studyNotes, importJobs, preferences] =
    await Promise.all([
      db.conversations.toArray(),
      db.messages.toArray(),
      db.collections.toArray(),
      db.studyNotes.toArray(),
      db.importJobs.toArray(),
      db.preferences.get("default"),
    ]);

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: "chatvault" as const,
    conversations,
    messages,
    collections,
    studyNotes,
    importJobs,
    preferences,
  };

  return JSON.stringify(payload, null, 2);
}

export async function restoreFullVaultBackupJson(
  jsonString: string,
  mode: "merge" | "replace" = "merge"
): Promise<{ conversationsRestored: number; collectionsRestored: number }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error("Invalid JSON file. Could not parse backup archive.");
  }

  const validated = ChatVaultBackupSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(
      `Invalid ChatVault backup schema: ${validated.error.issues[0]?.message || "Schema mismatch"}`
    );
  }

  const data = validated.data;

  await db.transaction(
    "rw",
    [
      db.conversations,
      db.messages,
      db.collections,
      db.studyNotes,
      db.importJobs,
      db.preferences,
    ],
    async () => {
      if (mode === "replace") {
        await db.conversations.clear();
        await db.messages.clear();
        await db.collections.clear();
        await db.studyNotes.clear();
        await db.importJobs.clear();
      }

      await db.collections.bulkPut(data.collections);
      await db.conversations.bulkPut(data.conversations);
      await db.messages.bulkPut(data.messages);
      await db.studyNotes.bulkPut(data.studyNotes);
      await db.importJobs.bulkPut(data.importJobs);
      if (data.preferences) {
        await db.preferences.put(data.preferences);
      }
    }
  );

  return {
    conversationsRestored: data.conversations.length,
    collectionsRestored: data.collections.length,
  };
}

export function formatConversationAsMarkdown(
  conversation: Conversation,
  messages: Message[],
  notes: StudyNote[] = [],
  collectionNames: string[] = []
): string {
  const lines: string[] = [];
  lines.push(`# ${conversation.title}`);
  lines.push("");
  lines.push(`- **Provider:** ${conversation.modelName || conversation.sourceProvider}`);
  lines.push(`- **Created:** ${new Date(conversation.createdAt).toLocaleString()}`);
  if (collectionNames.length > 0) {
    lines.push(`- **Collections:** ${collectionNames.join(", ")}`);
  }
  if (conversation.tags.length > 0) {
    lines.push(`- **Tags:** ${conversation.tags.map((t) => `#${t}`).join(" ")}`);
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  for (const msg of messages) {
    const speaker =
      msg.role === "user"
        ? `### 👤 ${msg.authorName || "User"}`
        : `### 🤖 ${msg.authorName || conversation.modelName || "Assistant"}`;
    lines.push(speaker);
    lines.push("");
    lines.push(msg.contentMarkdown);
    lines.push("");
  }

  if (notes.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## 📝 Personal Study Notes");
    lines.push("");
    for (const note of notes) {
      lines.push(`### ${note.title}`);
      lines.push("");
      lines.push(note.contentMarkdown);
      lines.push("");
    }
  }

  lines.push("---");
  lines.push("*Exported from ChatVault — Local-First AI Knowledge Organizer*");
  return lines.join("\n");
}

export function downloadTextFile(filename: string, content: string, mimeType = "text/plain") {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
