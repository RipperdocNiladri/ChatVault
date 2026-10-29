import React from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-surface text-on-surface flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl bg-surface-container-low p-space-xl text-center space-y-space-md border border-outline-variant/20 shadow-2xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
          <MaterialIcon name="folder_off" className="text-[30px]" />
        </div>
        <h1 className="font-headline-md text-headline-md text-on-surface font-semibold">
          Archive Record Not Found
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          The requested conversation or collection could not be located in your local browser vault.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:opacity-95 transition-opacity"
          >
            Return to Dashboard
          </Link>
          <Link
            href="/search"
            className="px-4 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-body-sm text-body-sm hover:bg-surface-container-highest transition-colors"
          >
            Search Vault
          </Link>
        </div>
      </div>
    </div>
  );
}
