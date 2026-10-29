"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { seedDemoData } from "@/db/repositories";
import { MaterialIcon } from "@/components/ui/material-icon";
import { CollectionCoverArt } from "@/components/collections/collection-cover-art";
import { DEMO_COLLECTIONS } from "@/lib/demo-data";

export default function LandingPage() {
  const router = useRouter();

  const handleExploreDemo = async () => {
    await seedDemoData(true);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col selection:bg-primary-container selection:text-on-primary">
      {/* Sticky Top Glass Navbar */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/15">
        <div className="max-w-7xl mx-auto px-gutter-mobile lg:px-margin h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-container to-inverse-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
              <MaterialIcon name="terminal" className="text-[20px]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-on-surface">
                ChatVault
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-label-sm text-label-sm text-tertiary border border-tertiary/20">
                v2.4 Local-First
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-space-lg font-body-sm text-body-sm text-on-surface-variant">
            <a href="#features" className="hover:text-on-surface transition-colors">
              Features
            </a>
            <a href="#collections-showcase" className="hover:text-on-surface transition-colors">
              Subject Vaults
            </a>
            <a href="#workflow" className="hover:text-on-surface transition-colors">
              How It Works
            </a>
            <a href="#privacy" className="hover:text-on-surface transition-colors">
              Local Privacy
            </a>
          </nav>

          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={handleExploreDemo}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-sm text-body-sm font-medium transition-colors"
            >
              <MaterialIcon name="auto_awesome" className="text-secondary text-[16px]" />
              <span>Explore Demo</span>
            </button>
            <Link
              href="/onboarding"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary font-body-sm text-body-sm font-semibold shadow-lg shadow-primary/20 hover:opacity-95 transition-opacity flex items-center gap-1.5"
            >
              <span>Launch Vault</span>
              <MaterialIcon name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 px-gutter-mobile lg:px-margin">
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[680px] h-[340px] bg-primary-container/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/25 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              <span className="font-label-md text-label-md text-on-surface-variant">
                100% Client-Side IndexedDB • Zero Cloud Upload • Instant Full-Text Search
              </span>
            </div>

            <h1 className="font-display-mobile lg:font-display text-display-mobile lg:text-display text-on-surface max-w-4xl tracking-tight">
              Your AI Conversations.{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
                Beautifully Organized.
              </span>
            </h1>

            <p className="mt-5 font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Transform messy ChatGPT exports into a curated personal library. Organize derivations,
              code blocks, and study notes into customizable subject vaults that live privately in
              your browser.
            </p>

            {/* Primary CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/imports"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-body-lg text-body-lg font-semibold shadow-xl shadow-primary/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <MaterialIcon name="upload_file" className="text-[20px]" />
                <span>Import ChatGPT Archive</span>
              </Link>
              <button
                type="button"
                onClick={handleExploreDemo}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-lg text-body-lg font-medium border border-outline-variant/25 transition-all flex items-center justify-center gap-2"
              >
                <MaterialIcon name="space_dashboard" className="text-secondary text-[20px]" />
                <span>Explore Live Demo Vault</span>
              </button>
              <Link
                href="/onboarding"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-body-md text-body-md transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Guided Setup</span>
                <MaterialIcon name="chevron_right" className="text-[18px]" />
              </Link>
            </div>

            {/* Interactive Preview Mockup Window */}
            <div className="mt-14 w-full max-w-6xl rounded-2xl bg-surface-container-lowest p-3 sm:p-5 shadow-2xl border border-outline-variant/25 text-left">
              <div className="flex items-center justify-between px-3 pb-3 border-b border-outline-variant/15">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-error/70" />
                  <span className="w-3 h-3 rounded-full bg-amber-400/70" />
                  <span className="w-3 h-3 rounded-full bg-tertiary/70" />
                  <span className="ml-2 font-code text-label-sm text-outline">
                    chatvault://workspace/engineering-physics
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-surface-container font-code text-label-sm text-secondary">
                    ⌘K Instant Search
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container font-code text-label-sm text-tertiary">
                    Offline Ready
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-4">
                <div className="lg:col-span-4 rounded-xl bg-surface-container-low p-4 space-y-3 border border-outline-variant/10">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-primary uppercase">
                      Active Subject Vault
                    </span>
                    <span className="font-label-sm text-label-sm text-outline">6 Collections</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Engineering Physics
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Quantum wave equations, electromagnetic field derivations, and Python eigenstate
                    verifications.
                  </p>
                  <div className="p-3 rounded-lg bg-surface-container-lowest font-code text-code text-secondary">
                    -ħ²/2m ∇²ψ(x) + V(x)ψ(x) = Eψ(x)
                  </div>
                </div>

                <div className="lg:col-span-8 rounded-xl bg-surface-container-low p-4 space-y-3 border border-outline-variant/10">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-tertiary">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                      ChatGPT-4o Transcript
                    </span>
                    <span className="font-label-sm text-label-sm text-outline">
                      LaTeX + Code Reader
                    </span>
                  </div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">
                    Understanding Schrödinger&apos;s Wave Equation &amp; Boundary Conditions
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Applying Dirichlet continuity at x = 0 and x = L yields quantized wave numbers
                    k_n = nπ/L and stationary probability density |ψ_n(x)|² = (2/L) sin²(nπx/L).
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-primary">
                        #QuantumPhysics
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-secondary">
                        #WaveMechanics
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleExploreDemo}
                      className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1"
                    >
                      Open in Reader
                      <MaterialIcon name="arrow_forward" className="text-[14px]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Subject Collections Showcase */}
        <section
          id="collections-showcase"
          className="py-16 lg:py-24 px-gutter-mobile lg:px-margin bg-surface-container-lowest/60"
        >
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="font-label-md text-label-md text-primary uppercase tracking-wider">
                  Visual Knowledge Curation
                </span>
                <h2 className="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface mt-1">
                  Curate Subject Vaults Built for Deep Study
                </h2>
              </div>
              <Link
                href="/collections"
                className="font-body-md text-body-md text-secondary hover:underline flex items-center gap-1"
              >
                Browse All Subject Vaults
                <MaterialIcon name="arrow_forward" className="text-[18px]" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {DEMO_COLLECTIONS.map((col) => (
                <Link
                  key={col.id}
                  href={`/collections/${col.id}`}
                  className="group rounded-xl bg-surface-container-low hover:bg-surface-container overflow-hidden border border-outline-variant/15 transition-all shadow-lg hover:shadow-2xl flex flex-col"
                >
                  <CollectionCoverArt
                    coverStyle={col.coverStyle}
                    accentColor={col.accentColor}
                    coverImageUrl={col.coverImageUrl}
                  />
                  <div className="p-space-md space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold group-hover:text-primary transition-colors">
                          {col.name}
                        </h3>
                        <MaterialIcon
                          name={col.icon}
                          className="text-outline group-hover:text-primary text-[20px]"
                        />
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">
                        {col.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-2">
                      {col.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works / Features */}
        <section id="features" className="py-16 lg:py-24 px-gutter-mobile lg:px-margin">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="font-label-md text-label-md text-secondary uppercase tracking-wider">
                Engineered for Students &amp; Builders
              </span>
              <h2 className="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface">
                Everything Needed to Master Your AI Archive
              </h2>
            </div>

            <div
              id="workflow"
              className="grid grid-cols-1 md:grid-cols-3 gap-gutter"
            >
              <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/15 space-y-3">
                <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <MaterialIcon name="folder_zip" className="text-[24px]" />
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  1. Drop Your ChatGPT Export
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Import your official OpenAI `.zip` archive or `conversations.json` directly in the
                  browser. ChatVault reconstructs multi-turn trees, timestamps, code blocks, and
                  LaTeX math locally.
                </p>
              </div>

              <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/15 space-y-3">
                <div className="w-11 h-11 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
                  <MaterialIcon name="palette" className="text-[24px]" />
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  2. Customize Visual Collections
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Group conversations by course, research topic, or systems project. Customize each
                  collection&apos;s SVG cover art, custom image banner, accent color, and tags.
                </p>
              </div>

              <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/15 space-y-3">
                <div className="w-11 h-11 rounded-xl bg-tertiary/15 text-tertiary flex items-center justify-center">
                  <MaterialIcon name="manage_search" className="text-[24px]" />
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  3. Search &amp; Annotate Offline
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Press `⌘K` to search across every prompt, response, code snippet, and formula in
                  milliseconds using MiniSearch, and attach persistent Markdown study notes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Banner */}
        <section id="privacy" className=" pb-20 px-gutter-mobile lg:px-margin">
          <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-r from-surface-container-low via-surface-container-high to-surface-container-low p-space-xl border border-outline-variant/25 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-tertiary font-label-md text-label-md">
                <MaterialIcon name="verified_user" className="text-[18px]" />
                <span>Local-First Architecture</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                Your Conversations Never Leave Your Device
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                ChatVault stores all transcripts, collections, and study notes inside your
                browser&apos;s IndexedDB. Export or restore a full JSON backup anytime.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/dashboard"
                className="px-5 py-3 rounded-xl bg-primary text-on-primary font-body-md text-body-md font-semibold text-center"
              >
                Open Workspace
              </Link>
              <Link
                href="/imports"
                className="px-5 py-3 rounded-xl bg-surface-container text-on-surface font-body-md text-body-md font-medium text-center border border-outline-variant/25"
              >
                Import Archive
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline-variant/15 py-8 px-gutter-mobile lg:px-margin bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-outline font-label-sm text-label-sm">
          <div className="flex items-center gap-2">
            <MaterialIcon name="terminal" className="text-primary text-[18px]" />
            <span>ChatVault Obsidian Archive • Local-First AI Knowledge Organizer</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-on-surface">
              Dashboard
            </Link>
            <Link href="/collections" className="hover:text-on-surface">
              Collections
            </Link>
            <Link href="/search" className="hover:text-on-surface">
              Search
            </Link>
            <Link href="/imports" className="hover:text-on-surface">
              Import
            </Link>
            <Link href="/settings" className="hover:text-on-surface">
              Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
