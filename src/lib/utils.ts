import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "collection";
}

export function formatRelativeDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "Recently";
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return "Recently";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatShortDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "Oct 24";
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return "Oct 24";
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function extractFormulasFromMarkdown(markdown: string): string[] {
  const formulas: string[] = [];
  const blockRegex = /\$\$([\s\S]*?)\$\$/g;
  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(markdown)) !== null) {
    const clean = match[1].trim();
    if (clean && !formulas.includes(clean)) {
      formulas.push(clean);
    }
  }
  const inlineRegex = /(?<!\$)\$([^$\n]+?)\$(?!\$)/g;
  while ((match = inlineRegex.exec(markdown)) !== null) {
    const clean = match[1].trim();
    if (clean.length > 5 && !formulas.includes(clean)) {
      formulas.push(clean);
    }
  }
  return formulas;
}

export function extractCodeBlocksFromMarkdown(
  markdown: string
): Array<{ language: string; code: string }> {
  const blocks: Array<{ language: string; code: string }> = [];
  const codeRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = codeRegex.exec(markdown)) !== null) {
    blocks.push({
      language: match[1] || "text",
      code: match[2].trim(),
    });
  }
  return blocks;
}
