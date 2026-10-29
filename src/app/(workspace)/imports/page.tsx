"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useVaultData } from "@/hooks/use-vault-data";
import {
  commitImportBundles,
  createSampleChatGPTExportJson,
  parseChatGPTJsonString,
  previewImportFile,
  type DuplicateResolutionStrategy,
} from "@/lib/importers/import-service";
import type { NormalizedConversationBundle } from "@/lib/importers/chatgpt/normalizer";
import { MaterialIcon } from "@/components/ui/material-icon";
import { formatBytes, formatRelativeDate } from "@/lib/utils";
import { toast } from "sonner";

export default function ImportCenterPage() {
  const router = useRouter();
  const { collections, importJobs } = useVaultData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [activeFileMeta, setActiveFileMeta] = useState<{
    name: string;
    size: number;
    sourceType: "chatgpt_zip" | "chatgpt_json";
  } | null>(null);
  const [previewBundles, setPreviewBundles] = useState<NormalizedConversationBundle[]>([]);
  const [selectedConvIds, setSelectedConvIds] = useState<string[]>([]);
  const [targetCollectionId, setTargetCollectionId] = useState<string>("");
  const [duplicateStrategy, setDuplicateStrategy] =
    useState<DuplicateResolutionStrategy>("skip");
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  const handleFileProcess = async (file: File) => {
    setIsParsing(true);
    setParseErrors([]);
    try {
      const result = await previewImportFile(
        file,
        targetCollectionId ? [targetCollectionId] : []
      );
      if (result.errors.length > 0) {
        setParseErrors(result.errors);
        setPreviewBundles([]);
        toast.error(result.errors[0]);
      } else {
        setActiveFileMeta({
          name: file.name,
          size: file.size,
          sourceType: file.name.toLowerCase().endsWith(".zip")
            ? "chatgpt_zip"
            : "chatgpt_json",
        });
        setPreviewBundles(result.bundles);
        setSelectedConvIds(result.bundles.map((b) => b.conversation.id));
        toast.success(`Parsed ${result.bundles.length} conversations from ${file.name}`);
      }
    } finally {
      setIsParsing(false);
    }
  };

  const handleLoadSampleExport = () => {
    const sampleJson = createSampleChatGPTExportJson();
    const result = parseChatGPTJsonString(
      sampleJson,
      targetCollectionId ? [targetCollectionId] : []
    );
    setActiveFileMeta({
      name: "chatgpt-sample-conversations.json",
      size: new Blob([sampleJson]).size,
      sourceType: "chatgpt_json",
    });
    setParseErrors([]);
    setPreviewBundles(result.bundles);
    setSelectedConvIds(result.bundles.map((b) => b.conversation.id));
    toast.success(
      `Loaded ${result.bundles.length} sample ChatGPT conversations ready for import!`
    );
  };

  const handleCommitImport = async () => {
    if (previewBundles.length === 0 || selectedConvIds.length === 0 || !activeFileMeta) {
      toast.error("Please select at least one conversation to import.");
      return;
    }

    setIsCommitting(true);
    try {
      const summary = await commitImportBundles(previewBundles, {
        fileName: activeFileMeta.name,
        fileSizeBytes: activeFileMeta.size,
        sourceType: activeFileMeta.sourceType,
        duplicateStrategy,
        selectedConversationIds: selectedConvIds,
        targetCollectionIds: targetCollectionId ? [targetCollectionId] : [],
        totalFound: previewBundles.length,
      });

      toast.success(
        `Imported ${summary.job.conversationsImported} conversations (${summary.job.DuplicatesSkipped} duplicates skipped)`
      );
      setPreviewBundles([]);
      setActiveFileMeta(null);
      router.push("/conversations");
    } finally {
      setIsCommitting(false);
    }
  };

  const toggleSelectConv = (id: string) => {
    setSelectedConvIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-gutter-mobile lg:p-margin max-w-7xl mx-auto space-y-space-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md">
        <div>
          <span className="font-label-md text-label-md text-secondary uppercase tracking-wider">
            Local Archive Ingestion Pipeline
          </span>
          <h1 className="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface mt-1">
            Import Center
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Import your official ChatGPT `.zip` export or `conversations.json` file. All parsing,
            tree normalization, and MiniSearch indexing run 100% locally in your browser.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSampleExport}
          className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-sm text-body-sm font-medium flex items-center gap-2 border border-outline-variant/25 self-start sm:self-auto"
        >
          <MaterialIcon name="science" className="text-secondary text-[18px]" />
          <span>Load Sample ChatGPT Export (.json)</span>
        </button>
      </div>

      {/* Main Grid: Dropzone + Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left 8 Cols: Dropzone & Preview Table */}
        <div className="lg:col-span-8 space-y-space-lg">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileProcess(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                fileInputRef.current?.click();
              }
            }}
            className={`rounded-2xl border-2 border-dashed p-8 lg:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-outline-variant/40 hover:border-primary/60 bg-surface-container-low"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.json,application/zip,application/json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileProcess(file);
              }}
              className="hidden"
            />

            <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shadow-inner">
              <MaterialIcon
                name={isParsing ? "sync" : "folder_zip"}
                className={`text-[34px] ${isParsing ? "animate-spin" : ""}`}
              />
            </div>

            <div className="space-y-1">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                {isParsing
                  ? "Parsing Archive & Reconstructing Message Trees..."
                  : "Drop ChatGPT .zip Archive or conversations.json Here"}
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto">
                Supports official OpenAI export bundles up to 100 MB. Zero network packets leave
                your device.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <span className="px-4 py-2 rounded-xl bg-primary text-on-primary font-body-sm text-body-sm font-semibold">
                Select Export File
              </span>
            </div>
          </div>

          {/* Error Alert */}
          {parseErrors.length > 0 && (
            <div className="p-4 rounded-xl bg-error-container/30 border border-error/40 text-on-error-container flex items-start gap-3">
              <MaterialIcon name="error" className="text-error text-[20px] mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-body-md text-body-md font-semibold">
                  Import Validation Error
                </h3>
                <p className="font-body-sm text-body-sm">{parseErrors.join(" ")}</p>
              </div>
            </div>
          )}

          {/* Parsed Preview Queue */}
          {previewBundles.length > 0 && activeFileMeta && (
            <div className="p-space-lg rounded-2xl bg-surface-container-low border border-primary/30 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/15 pb-3">
                <div>
                  <span className="font-label-sm text-label-sm text-tertiary uppercase">
                    Ready to Commit • {activeFileMeta.name} ({formatBytes(activeFileMeta.size)})
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Discovered {previewBundles.length} Valid Conversations ({selectedConvIds.length}{" "}
                    selected)
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedConvIds(
                        selectedConvIds.length === previewBundles.length
                          ? []
                          : previewBundles.map((b) => b.conversation.id)
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm"
                  >
                    {selectedConvIds.length === previewBundles.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                  <button
                    type="button"
                    disabled={isCommitting || selectedConvIds.length === 0}
                    onClick={handleCommitImport}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-body-sm text-body-sm font-semibold shadow-md flex items-center gap-1.5"
                  >
                    <MaterialIcon name="check_circle" className="text-[18px]" />
                    <span>
                      {isCommitting
                        ? "Importing..."
                        : `Import ${selectedConvIds.length} Conversations`}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {previewBundles.map((bundle) => {
                  const conv = bundle.conversation;
                  const checked = selectedConvIds.includes(conv.id);
                  return (
                    <label
                      key={conv.id}
                      className={`p-3 rounded-xl flex items-start justify-between gap-3 cursor-pointer border transition-colors ${
                        checked
                          ? "bg-surface-container border-primary/40"
                          : "bg-surface-container-lowest border-outline-variant/15 opacity-70"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelectConv(conv.id)}
                          className="mt-1 w-4 h-4 accent-primary"
                        />
                        <div className="min-w-0">
                          <div className="font-body-md text-body-md font-semibold text-on-surface truncate">
                            {conv.title}
                          </div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                            {conv.summary}
                          </div>
                          <div className="flex items-center gap-2 mt-1 font-label-sm text-label-sm text-outline">
                            <span>{conv.messageCount} turns</span>
                            <span>•</span>
                            <span>{conv.wordCount} words</span>
                            {conv.hasCode && <span className="text-secondary">• Code</span>}
                            {conv.hasMath && <span className="text-primary">• LaTeX</span>}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Import History Log */}
          <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/15 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                <MaterialIcon name="history" className="text-primary text-[20px]" />
                <span>Import Activity Log</span>
              </h3>
              <span className="font-label-sm text-label-sm text-outline">
                {importJobs.length} recorded jobs
              </span>
            </div>

            {importJobs.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                No import jobs recorded yet.
              </p>
            ) : (
              <div className="space-y-2">
                {importJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3 rounded-xl bg-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <MaterialIcon
                        name="check_circle"
                        className="text-tertiary text-[20px] shrink-0"
                      />
                      <div>
                        <div className="font-body-sm text-body-sm font-semibold text-on-surface">
                          {job.fileName}
                        </div>
                        <div className="font-label-sm text-label-sm text-outline">
                          {formatBytes(job.fileSizeBytes)} •{" "}
                          {formatRelativeDate(job.completedAt || job.startedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 font-label-sm text-label-sm">
                      <span className="px-2 py-0.5 rounded bg-tertiary/15 text-tertiary">
                        {job.conversationsImported} Imported
                      </span>
                      {job.DuplicatesSkipped > 0 && (
                        <span className="px-2 py-0.5 rounded bg-surface-container-highest text-outline">
                          {job.DuplicatesSkipped} Skipped
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Ingestion Parameters & How to Export Guide */}
        <aside className="lg:col-span-4 space-y-space-md">
          <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/15 space-y-4">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <MaterialIcon name="tune" className="text-secondary text-[20px]" />
              <span>Ingestion Rules</span>
            </h3>

            <div className="space-y-1.5">
              <label
                htmlFor="target-collection-select"
                className="font-label-sm text-label-sm text-outline uppercase block"
              >
                Assign to Subject Collection
              </label>
              <select
                id="target-collection-select"
                value={targetCollectionId}
                onChange={(e) => setTargetCollectionId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface font-body-sm text-body-sm border border-outline-variant/25"
              >
                <option value="">Leave Unassigned (Auto-Tag Only)</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="duplicate-strategy-select"
                className="font-label-sm text-label-sm text-outline uppercase block"
              >
                Duplicate Conversation Handling
              </label>
              <select
                id="duplicate-strategy-select"
                value={duplicateStrategy}
                onChange={(e) =>
                  setDuplicateStrategy(e.target.value as DuplicateResolutionStrategy)
                }
                className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface font-body-sm text-body-sm border border-outline-variant/25"
              >
                <option value="skip">Skip Existing Conversations (Recommended)</option>
                <option value="overwrite">Overwrite Existing Transcripts</option>
                <option value="keep_both">Import as Separate Copy</option>
              </select>
            </div>
          </div>

          {/* Step-by-Step Guide to Export from ChatGPT */}
          <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/15 space-y-3">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <MaterialIcon name="help" className="text-primary text-[20px]" />
              <span>How to Export from ChatGPT</span>
            </h3>
            <ol className="space-y-2.5 font-body-sm text-body-sm text-on-surface-variant list-decimal pl-4">
              <li>
                Open ChatGPT and navigate to <strong>Settings → Data Controls</strong>.
              </li>
              <li>
                Click <strong>Export Data</strong> and confirm the export request in your email.
              </li>
              <li>
                Download the `.zip` archive from OpenAI and drop it directly into the box on this
                page.
              </li>
            </ol>
            <div className="pt-2">
              <Link
                href="/settings"
                className="font-label-sm text-label-sm text-secondary hover:underline flex items-center gap-1"
              >
                <span>Need to restore a ChatVault backup JSON instead?</span>
                <MaterialIcon name="arrow_forward" className="text-[14px]" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
