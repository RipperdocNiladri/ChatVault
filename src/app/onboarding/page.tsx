"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  clearDemoData,
  collectionRepository,
  preferencesRepository,
  seedDemoData,
} from "@/db/repositories";
import { DEMO_COLLECTIONS } from "@/lib/demo-data";
import { MaterialIcon } from "@/components/ui/material-icon";
import { CollectionCoverArt } from "@/components/collections/collection-cover-art";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([
    "col-engineering-physics",
    "col-dsa",
    "col-c-systems",
    "col-ai-ml",
  ]);
  const [userName, setUserName] = useState("Alex Chen");
  const [includeSampleChats, setIncludeSampleChats] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSubject = (id: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCompleteOnboarding = async (destination: "/dashboard" | "/imports") => {
    setIsSubmitting(true);
    try {
      await preferencesRepository.update({
        userName: userName.trim() || "Alex Chen",
        hasCompletedOnboarding: true,
        demoModeActive: includeSampleChats,
      });

      if (includeSampleChats) {
        await seedDemoData(true);
      } else {
        await clearDemoData();
        // Save the chosen starter collections even if sample chats are off
        for (const col of DEMO_COLLECTIONS.filter((c) => selectedSlugs.includes(c.id))) {
          await collectionRepository.save({
            ...col,
            isDemo: false,
          });
        }
      }

      toast.success("Workspace initialized locally!");
      router.push(destination);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between p-gutter-mobile lg:p-margin">
      {/* Top Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-space-sm">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-container to-inverse-primary flex items-center justify-center text-on-primary shadow-md">
            <MaterialIcon name="terminal" className="text-[20px]" />
          </div>
          <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            ChatVault Setup
          </span>
        </Link>

        <button
          type="button"
          onClick={() => handleCompleteOnboarding("/dashboard")}
          className="font-label-md text-label-md text-outline hover:text-on-surface flex items-center gap-1"
        >
          <span>Skip to Dashboard</span>
          <MaterialIcon name="arrow_forward" className="text-[16px]" />
        </button>
      </header>

      {/* Main Onboarding Card */}
      <main className="max-w-5xl w-full mx-auto my-8 space-y-8">
        <div className="rounded-2xl bg-surface-container-low p-space-lg lg:p-space-xl border border-outline-variant/20 shadow-2xl space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-variant/15 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary font-label-sm text-label-sm uppercase tracking-wider">
                <MaterialIcon name="verified_user" className="text-[14px]" />
                <span>Step 1 of 1 • Local Vault Initialization</span>
              </div>
              <h1 className="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface">
                Welcome to Your Personal AI Knowledge Vault
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                Choose the starter subject collections you want in your workspace, or jump straight
                into importing your ChatGPT `.zip` archive.
              </p>
            </div>

            {/* Profile Name Input */}
            <div className="w-full lg:w-72 bg-surface-container p-3.5 rounded-xl border border-outline-variant/20 space-y-1.5">
              <label
                htmlFor="vault-owner-name"
                className="font-label-sm text-label-sm text-outline uppercase block"
              >
                Vault Owner Label
              </label>
              <input
                id="vault-owner-name"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant/30 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Starter Subject Collections Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Select Starter Subject Collections ({selectedSlugs.length} selected)
              </h2>
              <button
                type="button"
                onClick={() =>
                  setSelectedSlugs(
                    selectedSlugs.length === DEMO_COLLECTIONS.length
                      ? []
                      : DEMO_COLLECTIONS.map((c) => c.id)
                  )
                }
                className="font-label-sm text-label-sm text-secondary hover:underline"
              >
                {selectedSlugs.length === DEMO_COLLECTIONS.length
                  ? "Deselect All"
                  : "Select All 6"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEMO_COLLECTIONS.map((col) => {
                const isSelected = selectedSlugs.includes(col.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => toggleSubject(col.id)}
                    className={`group text-left rounded-xl overflow-hidden border transition-all flex flex-col ${
                      isSelected
                        ? "bg-surface-container-high border-primary ring-2 ring-primary/40"
                        : "bg-surface-container border-outline-variant/15 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <CollectionCoverArt
                      coverStyle={col.coverStyle}
                      accentColor={col.accentColor}
                      className="h-24"
                    />
                    <div className="p-3.5 space-y-1.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-body-lg text-body-lg font-semibold text-on-surface">
                          {col.name}
                        </span>
                        <MaterialIcon
                          name={isSelected ? "check_circle" : "radio_button_unchecked"}
                          filled={isSelected}
                          className={
                            isSelected ? "text-primary text-[20px]" : "text-outline text-[20px]"
                          }
                        />
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                        {col.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Demo Data Toggle */}
          <div className="p-4 rounded-xl bg-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-outline-variant/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                <MaterialIcon name="science" className="text-[20px]" />
              </div>
              <div>
                <h3 className="font-body-md text-body-md font-semibold text-on-surface">
                  Preload Sample Academic &amp; Systems Conversations (Demo Mode)
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Includes 8 realistic multi-turn conversations with LaTeX physics derivations, C
                  memory debugging, AVL rotations, and PyTorch self-attention code. You can clear
                  demo data anytime with 1 click.
                </p>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={includeSampleChats}
                onChange={(e) => setIncludeSampleChats(e.target.checked)}
                className="w-5 h-5 rounded accent-primary"
              />
              <span className="font-label-md text-label-md text-on-surface">
                {includeSampleChats ? "Enabled" : "Start Empty"}
              </span>
            </label>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleCompleteOnboarding("/imports")}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-md text-body-md font-medium flex items-center justify-center gap-2 border border-outline-variant/25"
            >
              <MaterialIcon name="upload_file" className="text-secondary text-[20px]" />
              <span>Import ChatGPT .zip First</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleCompleteOnboarding("/dashboard")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-body-md text-body-md font-semibold shadow-lg shadow-primary/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Complete Setup &amp; Open Dashboard</span>
              <MaterialIcon name="arrow_forward" className="text-[18px]" />
            </button>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl w-full mx-auto text-center py-2 font-label-sm text-label-sm text-outline">
        All preferences and collections are stored locally in your browser&apos;s IndexedDB.
      </footer>
    </div>
  );
}
