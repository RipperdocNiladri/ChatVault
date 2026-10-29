import JSZip from "jszip";
import { MAX_EXPANDED_JSON_BYTES } from "../file-validation";
import {
  normalizeChatGPTConversation,
  type NormalizedConversationBundle,
  type RawChatGPTConversation,
} from "./normalizer";

export interface ParseArchiveResult {
  bundles: NormalizedConversationBundle[];
  totalFound: number;
  invalidSkipped: number;
  errors: string[];
}

export function parseChatGPTJsonString(
  jsonText: string,
  targetCollectionIds: string[] = []
): ParseArchiveResult {
  if (jsonText.length > MAX_EXPANDED_JSON_BYTES) {
    return {
      bundles: [],
      totalFound: 0,
      invalidSkipped: 0,
      errors: ["Expanded JSON content exceeds the 250 MB safety threshold."],
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    return {
      bundles: [],
      totalFound: 0,
      invalidSkipped: 0,
      errors: [
        `Malformed JSON file: ${err instanceof Error ? err.message : "Unable to parse JSON"}`,
      ],
    };
  }

  let rawList: RawChatGPTConversation[] = [];
  if (Array.isArray(parsed)) {
    rawList = parsed as RawChatGPTConversation[];
  } else if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray((parsed as { conversations?: unknown[] }).conversations)
  ) {
    rawList = (parsed as { conversations: RawChatGPTConversation[] }).conversations;
  } else if (
    parsed &&
    typeof parsed === "object" &&
    ("mapping" in parsed || "messages" in parsed)
  ) {
    rawList = [parsed as RawChatGPTConversation];
  } else {
    return {
      bundles: [],
      totalFound: 0,
      invalidSkipped: 0,
      errors: [
        "Unrecognized JSON structure. Expected an array of ChatGPT conversations with `mapping` or `messages`.",
      ],
    };
  }

  const bundles: NormalizedConversationBundle[] = [];
  let invalidSkipped = 0;

  for (let i = 0; i < rawList.length; i++) {
    const normalized = normalizeChatGPTConversation(rawList[i], i, targetCollectionIds);
    if (normalized) {
      bundles.push(normalized);
    } else {
      invalidSkipped++;
    }
  }

  return {
    bundles,
    totalFound: rawList.length,
    invalidSkipped,
    errors: [],
  };
}

export async function parseChatGPTArchiveFile(
  file: File,
  targetCollectionIds: string[] = []
): Promise<ParseArchiveResult> {
  const lower = file.name.toLowerCase();

  if (lower.endsWith(".json")) {
    const text = await file.text();
    return parseChatGPTJsonString(text, targetCollectionIds);
  }

  if (lower.endsWith(".zip")) {
    try {
      const zip = await JSZip.loadAsync(file);
      const entries = Object.values(zip.files).filter((f) => !f.dir);
      const convEntry =
        entries.find((e) => e.name.toLowerCase().endsWith("conversations.json")) ||
        entries.find((e) => e.name.toLowerCase().endsWith(".json"));

      if (!convEntry) {
        return {
          bundles: [],
          totalFound: 0,
          invalidSkipped: 0,
          errors: [
            "No `conversations.json` file was found inside the uploaded .zip archive.",
          ],
        };
      }

      const text = await convEntry.async("string");
      return parseChatGPTJsonString(text, targetCollectionIds);
    } catch (err) {
      return {
        bundles: [],
        totalFound: 0,
        invalidSkipped: 0,
        errors: [
          `Failed to extract .zip archive: ${
            err instanceof Error ? err.message : "Corrupted archive"
          }`,
        ],
      };
    }
  }

  return {
    bundles: [],
    totalFound: 0,
    invalidSkipped: 0,
    errors: ["Unsupported file type. Upload a .zip or .json file."],
  };
}
