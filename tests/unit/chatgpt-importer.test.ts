import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import {
  parseChatGPTArchiveFile,
  parseChatGPTJsonString,
} from "@/lib/importers/chatgpt/parser";
import { createSampleChatGPTExportJson } from "@/lib/importers/import-service";
import { validateImportFile } from "@/lib/importers/file-validation";

describe("ChatGPT Importer & File Validation", () => {
  it("validates supported .zip and .json files and rejects unsupported or empty files", () => {
    const emptyFile = new File([], "empty.zip", { type: "application/zip" });
    expect(validateImportFile(emptyFile).valid).toBe(false);

    const invalidExt = new File(["hello"], "notes.txt", { type: "text/plain" });
    expect(validateImportFile(invalidExt).valid).toBe(false);

    const validJson = new File(["[]"], "conversations.json", {
      type: "application/json",
    });
    const resJson = validateImportFile(validJson);
    expect(resJson.valid).toBe(true);
    expect(resJson.sourceType).toBe("chatgpt_json");
  });

  it("parses valid ChatGPT conversations.json string with mapping tree", () => {
    const sampleJson = createSampleChatGPTExportJson();
    const result = parseChatGPTJsonString(sampleJson, ["col-mathematics"]);

    expect(result.errors).toHaveLength(0);
    expect(result.totalFound).toBe(2);
    expect(result.bundles).toHaveLength(2);

    const first = result.bundles[0];
    expect(first.conversation.title).toContain("Fast Fourier Transform");
    expect(first.conversation.collectionIds).toContain("col-mathematics");
    expect(first.conversation.hasCode).toBe(true);
    expect(first.conversation.hasMath).toBe(true);
    expect(first.messages).toHaveLength(2);
    expect(first.messages[0].role).toBe("user");
    expect(first.messages[1].role).toBe("assistant");
  });

  it("extracts and parses conversations.json from a .zip archive", async () => {
    const zip = new JSZip();
    zip.file("conversations.json", createSampleChatGPTExportJson());
    const blob = await zip.generateAsync({ type: "blob" });
    const zipFile = new File([blob], "chatgpt-export.zip", {
      type: "application/zip",
    });

    const result = await parseChatGPTArchiveFile(zipFile, ["col-dsa"]);
    expect(result.errors).toHaveLength(0);
    expect(result.bundles).toHaveLength(2);
    expect(result.bundles[0].conversation.collectionIds).toContain("col-dsa");
  });

  it("handles malformed JSON gracefully without crashing", () => {
    const badResult = parseChatGPTJsonString("{not-valid-json");
    expect(badResult.bundles).toHaveLength(0);
    expect(badResult.errors.length).toBeGreaterThan(0);
    expect(badResult.errors[0]).toMatch(/Malformed JSON/i);
  });
});
