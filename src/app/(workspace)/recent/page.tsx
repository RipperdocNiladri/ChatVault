"use client";

import React, { useMemo, useState } from "react";
import { useVaultData } from "@/hooks/use-vault-data";
import { conversationRepository } from "@/db/repositories";
import { ConversationCard } from "@/components/conversations/conversation-card";
import { MaterialIcon } from "@/components/ui/material-icon";

export default function RecentConversationsPage() {
  const { conversations, collections } = useVaultData();
  const [filterText, setFilterText] = useState("");

  const collectionMap = useMemo(
    () => new Map(collections.map((c) => [c.id, c.name])),
    [collections]
  );

  const recentConversations = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    return [...conversations]
      .filter((c) => {
        if (!q) return true;
        return `${c.title} ${c.summary} ${c.tags.join(" ")}`
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => {
        const aTime = new Date(a.lastViewedAt || a.updatedAt).getTime();
        const bTime = new Date(b.lastViewedAt || b.updatedAt).getTime();
        return bTime - aTime;
      });
  }, [conversations, filterText]);

  return (
    <div className="p-gutter-mobile lg:p-margin max-w-7xl mx-auto space-y-space-lg">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md">
        <div>
          <span className="font-label-md text-label-md text-secondary uppercase tracking-wider">
            Chronological History
          </span>
          <h1 className="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface mt-1">
            Recent Conversations ({recentConversations.length})
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Ordered by your most recently viewed and updated transcripts.
          </p>
        </div>

        <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-2 border border-outline-variant/25">
          <MaterialIcon name="search" className="text-outline text-[18px] mr-2" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter recent history..."
            className="bg-transparent text-on-surface font-body-sm text-body-sm focus:outline-none placeholder:text-outline"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {recentConversations.map((conv) => (
          <ConversationCard
            key={conv.id}
            conversation={conv}
            collectionNames={conv.collectionIds
              .map((cid) => collectionMap.get(cid))
              .filter(Boolean) as string[]}
            onToggleFavorite={(id) => conversationRepository.toggleFavorite(id)}
          />
        ))}
      </div>
    </div>
  );
}
