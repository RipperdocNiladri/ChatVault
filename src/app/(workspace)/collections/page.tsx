"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useVaultData } from "@/hooks/use-vault-data";
import { collectionRepository } from "@/db/repositories";
import { CollectionCard } from "@/components/collections/collection-card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { toast } from "sonner";

export default function MyCollectionsPage() {
  const { collections, conversations } = useVaultData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "favorites">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredCollections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return collections.filter((col) => {
      if (filterTab === "favorites" && !col.isFavorite) return false;
      if (q) {
        const hay = `${col.name} ${col.description} ${col.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [collections, searchQuery, filterTab]);

  const handleToggleFavorite = async (id: string) => {
    const next = await collectionRepository.toggleFavorite(id);
    toast.success(next ? "Collection added to Favorites" : "Removed from Favorites");
  };

  const handleDeleteCollection = async (id: string) => {
    const target = collections.find((c) => c.id === id);
    await collectionRepository.delete(id);
    toast.success(`Deleted "${target?.name || "Collection"}" (conversations preserved)`);
  };

  return (
    <div className="p-gutter-mobile lg:p-margin max-w-7xl mx-auto space-y-space-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md">
        <div>
          <span className="font-label-md text-label-md text-primary uppercase tracking-wider">
            Curated Knowledge Architecture
          </span>
          <h1 className="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface mt-1">
            My Subject Collections ({filteredCollections.length})
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Organize your imported AI dialogues by course, research domain, or engineering stack.
          </p>
        </div>

        <Link
          href="/collections/new"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-body-sm text-body-sm font-semibold shadow-lg shadow-primary/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <MaterialIcon name="add" className="text-[18px]" />
          <span>New Collection</span>
        </Link>
      </div>

      {/* Filter & View Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-space-md rounded-xl bg-surface-container-low border border-outline-variant/15">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md transition-colors ${
              filterTab === "all"
                ? "bg-primary text-on-primary font-semibold"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            All Vaults ({collections.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("favorites")}
            className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md flex items-center gap-1 transition-colors ${
              filterTab === "favorites"
                ? "bg-primary text-on-primary font-semibold"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <MaterialIcon name="star" filled className="text-[14px]" />
            <span>Starred ({collections.filter((c) => c.isFavorite).length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex-1 sm:w-64 flex items-center bg-surface-container-lowest rounded-lg px-3 py-1.5 border border-outline-variant/25">
            <MaterialIcon name="search" className="text-outline text-[18px] mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search collections..."
              className="w-full bg-transparent text-on-surface font-body-sm text-body-sm focus:outline-none placeholder:text-outline"
            />
          </div>

          <div className="flex items-center bg-surface-container p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`p-1.5 rounded ${
                viewMode === "grid" ? "bg-surface-container-highest text-primary" : "text-outline"
              }`}
            >
              <MaterialIcon name="grid_view" className="text-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={`p-1.5 rounded ${
                viewMode === "list" ? "bg-surface-container-highest text-primary" : "text-outline"
              }`}
            >
              <MaterialIcon name="view_list" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Collections Grid or List */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter"
            : "flex flex-col gap-space-md"
        }
      >
        {filteredCollections.map((col) => {
          const colConvs = conversations.filter((c) => c.collectionIds.includes(col.id));
          const codeTotal = colConvs.reduce((s, c) => s + c.codeBlockCount, 0);
          const formulaTotal = colConvs.reduce((s, c) => s + c.formulaCount, 0);

          return (
            <CollectionCard
              key={col.id}
              collection={col}
              conversationCount={colConvs.length}
              codeCount={codeTotal}
              formulaCount={formulaTotal}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDeleteCollection}
            />
          );
        })}

        {/* Create New Collection Card */}
        <Link
          href="/collections/new"
          className="rounded-xl border-2 border-dashed border-outline-variant/30 hover:border-primary/60 bg-surface-container-lowest/50 hover:bg-surface-container-low transition-all p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[260px] group"
        >
          <div className="w-12 h-12 rounded-2xl bg-surface-container-high group-hover:bg-primary/20 text-outline group-hover:text-primary flex items-center justify-center transition-colors">
            <MaterialIcon name="create_new_folder" className="text-[26px]" />
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Create New Subject Vault
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs mt-1">
              Launch the Customization Studio to configure cover art, icon, and accent colors.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
