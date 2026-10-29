import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-surface text-on-surface flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary/40 flex items-center justify-center animate-pulse">
          <span className="w-3 h-3 rounded-full bg-primary" />
        </div>
        <span className="font-label-md text-label-md text-outline uppercase tracking-widest">
          Loading Local Vault...
        </span>
      </div>
    </div>
  );
}
