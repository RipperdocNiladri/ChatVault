import Dexie, { type Table } from "dexie";
import type {
  Conversation,
  Message,
  Collection,
  StudyNote,
  ImportJob,
  UserPreferences,
} from "@/types/entities";
import { registerMigrations } from "./migrations";

export class ChatVaultDB extends Dexie {
  conversations!: Table<Conversation, string>;
  messages!: Table<Message, string>;
  collections!: Table<Collection, string>;
  studyNotes!: Table<StudyNote, string>;
  importJobs!: Table<ImportJob, string>;
  preferences!: Table<UserPreferences, "default">;

  constructor() {
    super("ChatVaultObsidianDB");
    registerMigrations(this);
  }
}

export const db = new ChatVaultDB();
