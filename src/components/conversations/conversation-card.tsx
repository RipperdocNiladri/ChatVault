"use client";

import React from "react";
import Link from "next/link";
import type { Conversation } from "@/types/entities";
import { MaterialIcon } from "@/components/ui/material-icon";
import { formatShortDate, cn } from "@/lib/utils";
import { toast } from "sonner";

interface ConversationCardProps {
  conversation: Conversation;
  collectionNames?: string[];
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function ConversationCard({
  conversation,
  collectionNames = [],
  onToggleFavorite,
  onDelete,
  selected = false,
  onToggleSelect,
}: ConversationCardProps) {
  const providerDotColor =
    conversation.sourceProvider === "claude"
      ? "bg-secondary"
      : conversation.sourceProvider === "gemini"
      ? "bg-primary"
      : "bg-tertiary";

  return (
    <div
      className={cn(
        "p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all duration-200 group flex flex-col justify-between gap-space-sm relative shadow-sm hover:shadow-xl border",
        selected ? "border-primary/60 bg-surface-container" : "border-outline-variant/15"
      )}
    >
      <div className="space-y-space-sm">
        {/* Header Metadata */}
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs flex-wrap">
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggleSelect(conversation.id)}
                aria-label={`Select ${conversation.title}`}
                className="w-4 h-4 rounded bg-surface-container border-outline-variant text-primary focus:ring-primary mr-1 cursor-pointer"
              />
            )}
            {collectionNames.map((colName) => (
              <span
                key={colName}
                className="px-2 py-0.5 rounded bg-primary-container/20 text-primary-fixed-dim font-label-sm text-label-sm font-semibold tracking-wider uppercase"
              >
                {colName}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              <span className={cn("w-1.5 h-1.5 rounded-full", providerDotColor)} />
              {conversation.modelName || conversation.sourceProvider}
            </span>
            <span className="text-outline font-label-sm text-label-sm">
              • {formatShortDate(conversation.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onToggleFavorite(conversation.id);
                }}
                aria-label={conversation.isFavorite ? "Unfavorite conversation" : "Favorite conversation"}
                className={cn(
                  "p-1.5 rounded-lg hover:bg-surface-container-high transition-colors",
                  conversation.isFavorite ? "text-primary" : "text-outline hover:text-on-surface"
                )}
                title={conversation.isFavorite ? "Starred" : "Star conversation"}
              >
                <MaterialIcon
                  name="star"
                  filled={conversation.isFavorite}
                  className="text-[20px]"
                />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(conversation.id);
                }}
                aria-label="Delete conversation"
                className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/20 transition-colors"
                title="Delete conversation"
              >
                <MaterialIcon name="delete" className="text-[18px]" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Summary */}
        <div>
          <Link
            href={`/conversations/${conversation.id}`}
            className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2 block"
          >
            {conversation.title}
          </Link>
          <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mt-1">
            {conversation.summary}
          </p>
        </div>

        {/* Featured Snippet Block (Math / Code / Trace) */}
        {conversation.featuredSnippet && (
          <div className="p-space-sm rounded-lg bg-surface-container-lowest font-code text-code text-on-surface flex items-center justify-between gap-2 shadow-inner border border-outline-variant/10">
            <div className="flex items-center gap-2 min-w-0 overflow-x-auto">
              <span className="px-1.5 py-0.5 rounded bg-surface-container text-secondary font-label-sm text-label-sm shrink-0">
                {conversation.featuredSnippet.type}
              </span>
              <code className="font-code text-[12px] text-primary-fixed truncate">
                {conversation.featuredSnippet.content}
              </code>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(conversation.featuredSnippet!.content);
                toast.success("Snippet copied to clipboard");
              }}
              className="p-1 rounded text-outline hover:text-on-surface shrink-0"
              title="Copy snippet"
            >
              <MaterialIcon name="content_copy" className="text-[14px]" />
            </button>
          </div>
        )}
      </div>

      {/* Footer Tags & Turn Count */}
      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
        <div className="flex items-center gap-1.5 flex-wrap">
          {conversation.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface-variant"
            >
              #{tag}
            </span>
          ))}
          <span className="font-label-sm text-label-sm text-outline ml-1">
            {conversation.messageCount} msgs
          </span>
        </div>

        <Link
          href={`/conversations/${conversation.id}`}
          className="font-label-sm text-label-sm text-outline flex items-center gap-1 group-hover:text-primary transition-colors shrink-0"
        >
          Open Transcript
          <MaterialIcon name="arrow_forward" className="text-[14px]" />
        </Link>
      </div>
    </div>
  );
}
