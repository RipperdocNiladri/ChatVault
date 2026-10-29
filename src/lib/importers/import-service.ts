import { db } from "@/db/database";
import { validateImportFile } from "./file-validation";
import {
  parseChatGPTArchiveFile,
  parseChatGPTJsonString,
  type ParseArchiveResult,
} from "./chatgpt/parser";
import type { NormalizedConversationBundle } from "./chatgpt/normalizer";
import type { ImportJob } from "@/types/entities";

export type DuplicateResolutionStrategy = "skip" | "overwrite" | "keep_both";

export interface ImportSummary {
  job: ImportJob;
  importedIds: string[];
}

export async function previewImportFile(
  file: File,
  targetCollectionIds: string[] = []
): Promise<ParseArchiveResult & { validationError?: string }> {
  const validation = validateImportFile(file);
  if (!validation.valid) {
    return {
      bundles: [],
      totalFound: 0,
      invalidSkipped: 0,
      errors: [validation.error || "Invalid file"],
      validationError: validation.error,
    };
  }
  return parseChatGPTArchiveFile(file, targetCollectionIds);
}

export async function commitImportBundles(
  bundles: NormalizedConversationBundle[],
  options: {
    fileName: string;
    fileSizeBytes: number;
    sourceType: ImportJob["sourceType"];
    duplicateStrategy?: DuplicateResolutionStrategy;
    selectedConversationIds?: string[];
    targetCollectionIds?: string[];
    invalidSkipped?: number;
    totalFound?: number;
  }
): Promise<ImportSummary> {
  const startedAt = new Date().toISOString();
  const strategy = options.duplicateStrategy || "skip";
  const selectedSet = options.selectedConversationIds
    ? new Set(options.selectedConversationIds)
    : null;

  const filteredBundles = selectedSet
    ? bundles.filter((b) => selectedSet.has(b.conversation.id))
    : bundles;

  let importedCount = 0;
  let duplicatesSkipped = 0;
  const importedIds: string[] = [];

  await db.transaction(
    "rw",
    [db.conversations, db.messages, db.importJobs],
    async () => {
      const existingConvs = await db.conversations.toArray();
      const existingByExternalId = new Map(
        existingConvs
          .filter((c) => c.externalId)
          .map((c) => [c.externalId!, c])
      );
      const existingById = new Map(existingConvs.map((c) => [c.id, c]));

      for (const bundle of filteredBundles) {
        const conv = { ...bundle.conversation };
        if (options.targetCollectionIds && options.targetCollectionIds.length > 0) {
          conv.collectionIds = Array.from(
            new Set([...conv.collectionIds, ...options.targetCollectionIds])
          );
        }

        const existingMatch =
          (conv.externalId && existingByExternalId.get(conv.externalId)) ||
          existingById.get(conv.id);

        if (existingMatch) {
          if (strategy === "skip") {
            duplicatesSkipped++;
            continue;
          } else if (strategy === "keep_both") {
            const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
            conv.id = `${conv.id}-copy-${suffix}`;
            conv.externalId = conv.externalId ? `${conv.externalId}-${suffix}` : null;
            conv.title = `${conv.title} (Copy)`;
          } else if (strategy === "overwrite") {
            conv.id = existingMatch.id;
            await db.messages.where("conversationId").equals(conv.id).delete();
          }
        }

        const messagesForConv = bundle.messages.map((m, idx) => ({
          ...m,
          id: `${conv.id}-msg-${idx + 1}`,
          conversationId: conv.id,
        }));

        await db.conversations.put(conv);
        await db.messages.bulkPut(messagesForConv);
        importedCount++;
        importedIds.push(conv.id);
      }

      const job: ImportJob = {
        id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        fileName: options.fileName,
        fileSizeBytes: options.fileSizeBytes,
        sourceType: options.sourceType,
        status: "completed",
        totalConversationsFound: options.totalFound ?? bundles.length,
        conversationsImported: importedCount,
        DuplicatesSkipped: duplicatesSkipped,
        invalidSkipped: options.invalidSkipped ?? 0,
        errorMessage: null,
        startedAt,
        completedAt: new Date().toISOString(),
        isDemo: false,
      };

      await db.importJobs.put(job);
    }
  );

  const latestJob = (await db.importJobs.orderBy("startedAt").last())!;
  return {
    job: latestJob,
    importedIds,
  };
}

export function createSampleChatGPTExportJson(): string {
  const sample: unknown = [
    {
      id: "chatgpt-sample-fourier-901",
      title: "Fast Fourier Transform (FFT) Cooley-Tukey Derivation & C++ Implementation",
      create_time: 1730040000,
      update_time: 1730041200,
      default_model_slug: "gpt-4o",
      current_node: "node-2",
      mapping: {
        "node-root": {
          id: "node-root",
          parent: null,
          children: ["node-1"],
          message: null,
        },
        "node-1": {
          id: "node-1",
          parent: "node-root",
          children: ["node-2"],
          message: {
            id: "msg-fft-user",
            author: { role: "user", name: "Alex Chen" },
            create_time: 1730040000,
            content: {
              content_type: "text",
              parts: [
                "Derive the Radix-2 Cooley-Tukey Fast Fourier Transform (FFT) recurrence reducing $O(N^2)$ DFT to $O(N \\log N)$, and provide an iterative bit-reversal C++ implementation.",
              ],
            },
          },
        },
        "node-2": {
          id: "node-2",
          parent: "node-1",
          children: [],
          message: {
            id: "msg-fft-assistant",
            author: { role: "assistant", name: "ChatGPT-4o" },
            create_time: 1730040045,
            metadata: { model_slug: "gpt-4o" },
            content: {
              content_type: "text",
              parts: [
                `### Radix-2 Butterfly Decomposition\n\nThe Discrete Fourier Transform (DFT) of sequence $x[n]$ of length $N$ is:\n\n$$X[k] = \\sum_{n=0}^{N-1} x[n] e^{-i 2\\pi k n / N}, \\qquad \\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x) e^{-2\\pi i x \\xi}\\,dx$$\n\nSplitting into even indices $n = 2m$ and odd indices $n = 2m + 1$ with twiddle factor $W_N = e^{-2\\pi i / N}$:\n\n$$X[k] = E[k] + W_N^k O[k], \\qquad X[k + N/2] = E[k] - W_N^k O[k]$$\n\n\`\`\`cpp\n#include <complex>\n#include <vector>\n#include <cmath>\n\nusing cd = std::complex<double>;\nconst double PI = acos(-1);\n\nvoid fft(std::vector<cd>& a, bool invert) {\n    int n = a.size();\n    for (int i = 1, j = 0; i < n; i++) {\n        int bit = n >> 1;\n        for (; j & bit; bit >>= 1) j ^= bit;\n        j ^= bit;\n        if (i < j) std::swap(a[i], a[j]);\n    }\n    for (int len = 2; len <= n; len <<= 1) {\n        double ang = 2 * PI / len * (invert ? -1 : 1);\n        cd wlen(cos(ang), sin(ang));\n        for (int i = 0; i < n; i += len) {\n            cd w(1);\n            for (int j = 0; j < len / 2; j++) {\n                cd u = a[i + j], v = a[i + j + len / 2] * w;\n                a[i + j] = u + v;\n                a[i + j + len / 2] = u - v;\n                w *= wlen;\n            }\n        }\n    }\n}\n\`\`\``,
              ],
            },
          },
        },
      },
    },
    {
      id: "chatgpt-sample-b-tree-902",
      title: "B+ Tree Page Splits & Buffer Pool Pinning in Database Engines",
      create_time: 1730050000,
      update_time: 1730051800,
      default_model_slug: "gpt-4o",
      current_node: "node-b2",
      mapping: {
        "node-b1": {
          id: "node-b1",
          parent: null,
          children: ["node-b2"],
          message: {
            id: "msg-btree-user",
            author: { role: "user", name: "Alex Chen" },
            create_time: 1730050000,
            content: {
              content_type: "text",
              parts: [
                "Explain latch crabbing in B+ Tree concurrent page splits and why leaf sibling pointers make range scans lock-free.",
              ],
            },
          },
        },
        "node-b2": {
          id: "node-b2",
          parent: "node-b1",
          children: [],
          message: {
            id: "msg-btree-assistant",
            author: { role: "assistant", name: "ChatGPT-4o" },
            create_time: 1730050060,
            metadata: { model_slug: "gpt-4o" },
            content: {
              content_type: "text",
              parts: [
                `In **latch crabbing**, a thread traversing down a B+ Tree acquires a latch on the child page and immediately releases the parent latch if the child is deemed **safe** (will not split on insert when \`size < max_size - 1\`, or will not merge on delete).\n\n\`\`\`sql\nEXPLAIN ANALYZE SELECT * FROM conversations WHERE created_at >= '2025-10-01' ORDER BY created_at DESC LIMIT 25;\n\`\`\``,
              ],
            },
          },
        },
      },
    },
  ];
  return JSON.stringify(sample, null, 2);
}

export { parseChatGPTJsonString };
