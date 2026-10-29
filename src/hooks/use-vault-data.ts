"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/database";
import { DEFAULT_PREFERENCES } from "@/lib/demo-data";
import { ensureVaultInitialized } from "@/db/repositories";

export function useVaultInit() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    ensureVaultInitialized().then(() => {
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return ready;
}

export function useVaultData() {
  const ready = useVaultInit();

  const conversations = useLiveQuery(
    () => db.conversations.orderBy("updatedAt").reverse().toArray(),
    [],
    []
  );

  const collections = useLiveQuery(
    () => db.collections.orderBy("sortOrder").toArray(),
    [],
    []
  );

  const messages = useLiveQuery(() => db.messages.toArray(), [], []);

  const studyNotes = useLiveQuery(
    () => db.studyNotes.orderBy("updatedAt").reverse().toArray(),
    [],
    []
  );

  const importJobs = useLiveQuery(
    () => db.importJobs.orderBy("startedAt").reverse().toArray(),
    [],
    []
  );

  const preferences = useLiveQuery(
    async () => (await db.preferences.get("default")) || DEFAULT_PREFERENCES,
    [],
    DEFAULT_PREFERENCES
  );

  return {
    ready,
    conversations,
    collections,
    messages,
    studyNotes,
    importJobs,
    preferences,
  };
}
