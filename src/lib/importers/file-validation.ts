export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_EXPANDED_JSON_BYTES = 250 * 1024 * 1024; // 250 MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sourceType?: "chatgpt_zip" | "chatgpt_json" | "chatvault_backup";
}

export function validateImportFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: "No file provided." };
  }

  if (file.size === 0) {
    return { valid: false, error: "The selected file is empty (0 bytes)." };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      valid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 100 MB safety limit.`,
    };
  }

  const lower = file.name.toLowerCase();
  if (lower.endsWith(".zip")) {
    return { valid: true, sourceType: "chatgpt_zip" };
  }
  if (lower.endsWith(".json")) {
    return { valid: true, sourceType: "chatgpt_json" };
  }

  return {
    valid: false,
    error: "Unsupported file format. Please upload an official ChatGPT .zip archive or conversations.json file.",
  };
}
