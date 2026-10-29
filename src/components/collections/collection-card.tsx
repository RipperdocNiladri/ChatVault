"use client";

import React from "react";
import Link from "next/link";
import type { Collection } from "@/types/entities";
import { CollectionCoverArt, getAccentClasses } from "./collection-cover-art";
import { MaterialIcon } from "@/components/ui/material-icon";
import { formatRelativeDate, cn } from "@/lib/utils";

interface CollectionCardProps {
  collection: Collection;
  conversationCount: number;
  codeCount?: number;
  formulaCount?: number;
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function CollectionCard({
  collection,
  conversationCount,
  codeCount = 0,
  formulaCount = 0,
  onToggleFavorite,
  onDelete,
}: CollectionCardProps) {
  const accent = getAccentClasses(collection.accentColor);

  return (
    <div className="group rounded-xl bg-surface-container-low hover:bg-surface-container transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-2xl border border-outline-variant/15">
      <div>
        <div className="relative">
          <Link href={`/collections/${collection.id}`} className="block">
            <CollectionCoverArt
              coverStyle={collection.coverStyle}
              accentColor={collection.accentColor}
              coverImageUrl={collection.coverImageUrl}
            />
          </Link>

          {/* Top Left Icon Badge */}
          <div
            className={cn(
              "absolute top-3 left-3 w-9 h-9 rounded-lg bg-surface-container-lowest/85 backdrop-blur-md flex items-center justify-center shadow-md border border-white/10",
              accent.text
            )}
          >
            <MaterialIcon name={collection.icon} className="text-[20px]" />
          </div>

          {/* Top Right Actions */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/85 backdrop-blur-md font-label-sm text-label-sm text-on-surface border border-white/10">
              {conversationCount} {conversationCount === 1 ? "Chat" : "Chats"}
            </span>
            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite(collection.id);
                }}
                aria-label={
                  collection.isFavorite ? "Remove collection from favorites" : "Favorite collection"
                }
                className={cn(
                  "w-8 h-8 rounded-lg bg-surface-container-lowest/85 backdrop-blur-md flex items-center justify-center transition-colors border border-white/10",
                  collection.isFavorite
                    ? "text-primary"
                    : "text-outline hover:text-on-surface"
                )}
              >
                <MaterialIcon
                  name="star"
                  filled={collection.isFavorite}
                  className="text-[18px]"
                />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-space-md space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/collections/${collection.id}`}
              className="font-headline-sm text-headline-sm text-on-surface font-semibold group-hover:text-primary transition-colors line-clamp-1"
            >
              {collection.name}
            </Link>
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 min-h-[36px]">
            {collection.description || "Curated AI conversations and study notes."}
          </p>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {collection.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-space-md py-3 bg-surface-container/60 flex items-center justify-between text-outline font-label-sm text-label-sm border-t border-outline-variant/10">
        <div className="flex items-center gap-3">
          {formulaCount > 0 && (
            <span className="flex items-center gap-1 text-primary">
              <MaterialIcon name="functions" className="text-[14px]" />
              {formulaCount}
            </span>
          )}
          {codeCount > 0 && (
            <span className="flex items-center gap-1 text-secondary">
              <MaterialIcon name="code" className="text-[14px]" />
              {codeCount}
            </span>
          )}
          <span>Updated {formatRelativeDate(collection.updatedAt)}</span>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href={`/collections/${collection.id}/customize`}
            className="p-1.5 rounded-md hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors"
            title="Customize Collection Studio"
          >
            <MaterialIcon name="palette" className="text-[16px]" />
          </Link>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(collection.id)}
              className="p-1.5 rounded-md hover:bg-error-container/40 text-outline hover:text-error transition-colors"
              title="Delete Collection"
            >
              <MaterialIcon name="delete" className="text-[16px]" />
            </button>
          )}
          <Link
            href={`/collections/${collection.id}`}
            className="p-1.5 rounded-md hover:bg-surface-container-high text-primary transition-colors"
            title="Open Collection"
          >
            <MaterialIcon name="arrow_forward" className="text-[16px]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
