"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useVaultData } from "@/hooks/use-vault-data";
import { collectionRepository } from "@/db/repositories";
import { CollectionCoverArt } from "./collection-cover-art";
import { MaterialIcon } from "@/components/ui/material-icon";
import type { AccentTheme, CoverStyle } from "@/types/entities";
import { toast } from "sonner";

const ICON_OPTIONS = [
  { id: "science", label: "Physics / Lab" },
  { id: "account_tree", label: "Algorithms" },
  { id: "memory", label: "Systems / CPU" },
  { id: "functions", label: "Mathematics" },
  { id: "neurology", label: "AI & Neural" },
  { id: "rocket_launch", label: "Projects" },
  { id: "terminal", label: "Terminal" },
  { id: "code", label: "Source Code" },
  { id: "menu_book", label: "Literature" },
  { id: "bolt", label: "Electromagnetics" },
];

const ACCENT_OPTIONS: Array<{
  id: AccentTheme;
  name: string;
  hex: string;
  swatchClass: string;
}> = [
  { id: "violet", name: "Electric Violet", hex: "#D0BCFF", swatchClass: "bg-[#d0bcff]" },
  { id: "cyan", name: "Quantum Cyan", hex: "#5DE6FF", swatchClass: "bg-[#5de6ff]" },
  { id: "emerald", name: "Emerald Pulse", hex: "#4EDEA3", swatchClass: "bg-[#4edea3]" },
  { id: "amber", name: "Solar Amber", hex: "#FCD34D", swatchClass: "bg-amber-300" },
  { id: "rose", name: "Crimson Rose", hex: "#FDA4AF", swatchClass: "bg-rose-300" },
];

const PRESET_COVERS: Array<{
  id: CoverStyle;
  title: string;
  subtitle: string;
}> = [
  {
    id: "quantum-wave",
    title: "Harmonic Wavefunction",
    subtitle: "Standing wave interference mesh",
  },
  {
    id: "binary-tree",
    title: "AVL Graph Topology",
    subtitle: "Directed acyclic node hierarchy",
  },
  {
    id: "memory-registers",
    title: "Hex Memory Registers",
    subtitle: "Stack & heap pointer layout",
  },
  {
    id: "linear-algebra",
    title: "Eigenvector Basis",
    subtitle: "Linear transformation axes",
  },
  {
    id: "neural-grid",
    title: "Multi-Head Tensor Mesh",
    subtitle: "Deep attention layer weights",
  },
  {
    id: "rust-architecture",
    title: "Systems IPC Pipeline",
    subtitle: "Daemon & WAL architecture",
  },
];

interface CollectionStudioEditorProps {
  mode: "create" | "edit";
  collectionId?: string;
}

export function CollectionStudioEditor({
  mode,
  collectionId,
}: CollectionStudioEditorProps) {
  const router = useRouter();
  const { collections, conversations } = useVaultData();

  const existingCollection = collections.find(
    (c) => c.id === collectionId || c.slug === collectionId
  );

  const [name, setName] = useState("Quantum Mechanics & Optics");
  const [description, setDescription] = useState(
    "Schrödinger wave equations, infinite square well derivations, and relativistic electrodynamics notes."
  );
  const [icon, setIcon] = useState("science");
  const [accentColor, setAccentColor] = useState<AccentTheme>("violet");
  const [coverStyle, setCoverStyle] = useState<CoverStyle>("quantum-wave");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("Quantum, Optics, Waveforms");
  const [isFavorite, setIsFavorite] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && existingCollection) {
      setName(existingCollection.name);
      setDescription(existingCollection.description);
      setIcon(existingCollection.icon);
      setAccentColor(existingCollection.accentColor);
      setCoverStyle(existingCollection.coverStyle);
      setCoverImageUrl(existingCollection.coverImageUrl);
      setTagsInput(existingCollection.tags.join(", "));
      setIsFavorite(existingCollection.isFavorite);
      setIsDefault(existingCollection.isDefault);
    } else if (mode === "create") {
      setName("");
      setDescription("");
      setIcon("science");
      setAccentColor("violet");
      setCoverStyle("quantum-wave");
      setCoverImageUrl(null);
      setTagsInput("Study, Notes");
      setIsFavorite(false);
      setIsDefault(false);
    }
  }, [mode, existingCollection?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const parsedTags = tagsInput
    .split(",")
    .map((t) => t.trim().replace(/^#/, ""))
    .filter(Boolean);

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP, SVG).");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Cover image must be under 3 MB for local IndexedDB storage.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCoverImageUrl(reader.result);
        setCoverStyle("custom-image");
        toast.success("Custom cover artwork loaded");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Collection title is required.");
      toast.error("Please enter a collection title.");
      return;
    }
    setErrorMsg(null);

    const saved = await collectionRepository.save({
      id: mode === "edit" ? existingCollection?.id : undefined,
      name: name.trim(),
      description: description.trim(),
      icon,
      accentColor,
      coverStyle,
      coverImageUrl,
      tags: parsedTags.length > 0 ? parsedTags : ["General"],
      isFavorite,
      isDefault,
    });

    toast.success(
      mode === "edit"
        ? `Updated "${saved.name}" collection`
        : `Created "${saved.name}" collection`
    );
    router.push(`/collections/${saved.id}`);
  };

  const handleResetDefaults = () => {
    if (mode === "edit" && existingCollection) {
      setName(existingCollection.name);
      setDescription(existingCollection.description);
      setIcon(existingCollection.icon);
      setAccentColor(existingCollection.accentColor);
      setCoverStyle(existingCollection.coverStyle);
      setCoverImageUrl(existingCollection.coverImageUrl);
      setTagsInput(existingCollection.tags.join(", "));
      toast.info("Reverted to saved collection settings");
    } else {
      setName("");
      setDescription("");
      setIcon("science");
      setAccentColor("violet");
      setCoverStyle("quantum-wave");
      setCoverImageUrl(null);
      setTagsInput("Study, Notes");
      toast.info("Reset studio fields");
    }
  };

  const handleDelete = async () => {
    if (mode !== "edit" || !existingCollection) return;
    await collectionRepository.delete(existingCollection.id);
    toast.success(`Deleted "${existingCollection.name}" collection`);
    router.push("/collections");
  };

  const chatCount = existingCollection
    ? conversations.filter((c) => c.collectionIds.includes(existingCollection.id)).length
    : 0;

  return (
    <div className="p-gutter-mobile lg:p-margin max-w-7xl mx-auto space-y-space-lg">
      {/* Studio Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/15 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-label-sm text-label-sm text-outline uppercase">
            <Link href="/collections" className="hover:text-on-surface">
              My Collections
            </Link>
            <span>/</span>
            <span className="text-primary">
              {mode === "edit" ? "Customize Studio" : "New Subject Vault"}
            </span>
          </div>
          <h1 className="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface">
            {mode === "edit"
              ? `Customize Vault: ${existingCollection?.name || name}`
              : "Collection Customization Studio"}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm"
          >
            Reset
          </button>
          {mode === "edit" && existingCollection && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-3.5 py-2 rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm flex items-center gap-1"
            >
              <MaterialIcon name="delete" className="text-[16px]" />
              <span>Delete</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-body-sm text-body-sm font-semibold shadow-lg shadow-primary/25 flex items-center gap-1.5"
          >
            <MaterialIcon name="check_circle" className="text-[18px]" />
            <span>{mode === "edit" ? "Save Changes" : "Deploy Vault"}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column: Studio Controls (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-space-md">
          {/* 1. Identity & Description */}
          <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/15 space-y-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <MaterialIcon name="edit_square" className="text-primary text-[20px]" />
              <span>1. Vault Identity &amp; Taxonomy</span>
            </h2>

            <div className="space-y-1.5">
              <label
                htmlFor="collection-name-input"
                className="font-label-sm text-label-sm text-outline uppercase block"
              >
                Collection Title *
              </label>
              <input
                id="collection-name-input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="e.g., Quantum Mechanics & Optics"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-body-lg text-body-lg border border-outline-variant/30 focus:outline-none focus:border-primary"
              />
              {errorMsg && (
                <p className="font-label-sm text-label-sm text-error">{errorMsg}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="collection-desc-input"
                className="font-label-sm text-label-sm text-outline uppercase block"
              >
                Academic / Technical Description
              </label>
              <textarea
                id="collection-desc-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe the courses, derivations, or projects stored in this collection..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant/30 focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="collection-tags-input"
                className="font-label-sm text-label-sm text-outline uppercase block"
              >
                Subject Tags (comma-separated)
              </label>
              <input
                id="collection-tags-input"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Quantum, Optics, LaTeX, Midterm"
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest text-on-surface font-code text-body-sm border border-outline-variant/30 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* 2. Icon & Accent Palette */}
          <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/15 space-y-5">
            <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <MaterialIcon name="palette" className="text-secondary text-[20px]" />
              <span>2. Emblem Icon &amp; Accent Aura</span>
            </h2>

            {/* Icon Grid */}
            <div className="space-y-2">
              <span className="font-label-sm text-label-sm text-outline uppercase block">
                Select Subject Emblem
              </span>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setIcon(opt.id)}
                    title={opt.label}
                    className={`h-11 rounded-xl flex items-center justify-center transition-all ${
                      icon === opt.id
                        ? "bg-primary text-on-primary ring-2 ring-primary/50 scale-105"
                        : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <MaterialIcon name={opt.id} className="text-[20px]" />
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color Swatches */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase">
                  Accent Color Theme
                </span>
                <span className="font-code text-label-sm text-primary">
                  {ACCENT_OPTIONS.find((a) => a.id === accentColor)?.name} (
                  {ACCENT_OPTIONS.find((a) => a.id === accentColor)?.hex})
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {ACCENT_OPTIONS.map((swatch) => {
                  const active = accentColor === swatch.id;
                  return (
                    <button
                      key={swatch.id}
                      type="button"
                      onClick={() => setAccentColor(swatch.id)}
                      className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all border ${
                        active
                          ? "bg-surface-container-high border-primary text-on-surface shadow-md scale-105"
                          : "bg-surface-container border-outline-variant/20 text-on-surface-variant"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full ${swatch.swatchClass}`} />
                      <span className="font-body-sm text-body-sm">{swatch.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Cover Artwork Preset or Custom Upload */}
          <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/15 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                <MaterialIcon name="Wallpaper" className="text-tertiary text-[20px]" />
                <span>3. Procedural SVG Cover or Custom Image</span>
              </h2>
              {coverImageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setCoverImageUrl(null);
                    setCoverStyle("quantum-wave");
                  }}
                  className="font-label-sm text-label-sm text-error hover:underline"
                >
                  Remove Custom Image
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PRESET_COVERS.map((preset) => {
                const isSelected = !coverImageUrl && coverStyle === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setCoverImageUrl(null);
                      setCoverStyle(preset.id);
                    }}
                    className={`group rounded-xl overflow-hidden text-left border transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/50 bg-surface-container-high"
                        : "border-outline-variant/20 bg-surface-container hover:border-outline"
                    }`}
                  >
                    <CollectionCoverArt
                      coverStyle={preset.id}
                      accentColor={accentColor}
                      className="h-20"
                    />
                    <div className="p-2.5">
                      <div className="font-body-sm text-body-sm font-semibold text-on-surface truncate">
                        {preset.title}
                      </div>
                      <div className="font-label-sm text-label-sm text-outline truncate">
                        {preset.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Cover Image Upload */}
            <div className="pt-2">
              <label className="w-full p-4 rounded-xl border border-dashed border-outline-variant/40 hover:border-primary bg-surface-container-lowest/60 flex items-center justify-between cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <MaterialIcon name="add_photo_alternate" className="text-secondary text-[24px]" />
                  <div>
                    <div className="font-body-sm text-body-sm font-medium text-on-surface">
                      Upload Custom Cover Artwork (PNG, JPG, WebP, SVG)
                    </div>
                    <div className="font-label-sm text-label-sm text-outline">
                      Stored locally in IndexedDB • Max 3 MB
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-surface-container-high font-label-sm text-label-sm text-on-surface">
                  Browse File
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </form>

        {/* Right Column: Live Interactive Card Preview (5 cols) */}
        <aside className="lg:col-span-5 space-y-space-md">
          <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-4 sticky top-20">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-primary uppercase tracking-wider">
                Real-Time Studio Preview
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container font-code text-label-sm text-tertiary">
                1:1 Card Render
              </span>
            </div>

            {/* Live Card Preview */}
            <div className="rounded-xl bg-surface-container overflow-hidden shadow-2xl border border-outline-variant/25">
              <div className="relative">
                <CollectionCoverArt
                  coverStyle={coverStyle}
                  accentColor={accentColor}
                  coverImageUrl={coverImageUrl}
                />
                <div className="absolute top-3 left-3 w-9 h-9 rounded-lg bg-surface-container-lowest/85 backdrop-blur-md flex items-center justify-center text-primary border border-white/10">
                  <MaterialIcon name={icon} className="text-[20px]" />
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-surface-container-lowest/85 backdrop-blur-md font-label-sm text-label-sm text-on-surface border border-white/10">
                  {chatCount} Chats
                </div>
              </div>

              <div className="p-space-md space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    {name.trim() || "Untitled Subject Vault"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsFavorite((v) => !v)}
                    className={isFavorite ? "text-primary" : "text-outline"}
                  >
                    <MaterialIcon name="star" filled={isFavorite} className="text-[20px]" />
                  </button>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {description.trim() ||
                    "Describe your collection to preview how it appears across your dashboard and vault gallery."}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {(parsedTags.length > 0 ? parsedTags : ["PreviewTag"]).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Preferences Toggles */}
            <div className="space-y-2 pt-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container cursor-pointer">
                <div>
                  <div className="font-body-sm text-body-sm font-medium text-on-surface">
                    Pin to Favorites
                  </div>
                  <div className="font-label-sm text-label-sm text-outline">
                    Show in Starred Vaults &amp; Sidebar
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container cursor-pointer">
                <div>
                  <div className="font-body-sm text-body-sm font-medium text-on-surface">
                    Default Import Target
                  </div>
                  <div className="font-label-sm text-label-sm text-outline">
                    Pre-select when importing new ChatGPT archives
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
              </label>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
