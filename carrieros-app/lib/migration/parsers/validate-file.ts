import type { MigrationFileKind } from "@/lib/migration/types";

const SAFE_EXTENSIONS = new Set([
  "csv",
  "xlsx",
  "xls",
  "pdf",
  "txt",
  "tsv",
  "png",
  "jpg",
  "jpeg",
  "webp",
]);

const UNSAFE_EXTENSIONS = new Set([
  "exe",
  "bat",
  "cmd",
  "msi",
  "scr",
  "js",
  "vbs",
  "ps1",
  "sh",
  "dmg",
  "pkg",
  "apk",
  "dll",
  "com",
  "jar",
]);

const SAFE_MIME_PREFIXES = [
  "text/",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml",
  "application/csv",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/octet-stream", // often used for csv/xlsx downloads
];

export type FileValidationResult =
  | { ok: true; kind: MigrationFileKind; extension: string }
  | { ok: false; reason: string };

export function extensionOf(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? (parts.at(-1) ?? "") : "";
}

export function detectFileKind(
  fileName: string,
  mimeType: string,
): MigrationFileKind {
  const ext = extensionOf(fileName);
  const mime = mimeType.toLowerCase();

  if (ext === "csv" || ext === "tsv" || mime.includes("csv")) return "csv";
  if (ext === "xlsx" || ext === "xls" || mime.includes("spreadsheet") || mime.includes("excel"))
    return "xlsx";
  if (ext === "pdf" || mime === "application/pdf") return "pdf";
  if (mime.startsWith("image/")) return "image";
  if (/quickbooks|qbo|qbw|iif/i.test(fileName)) return "quickbooks";
  if (/sheets\.google|docs\.google/i.test(fileName)) return "google_sheets";
  return "other";
}

/**
 * File validation framing (extension + MIME). Not a substitute for server AV.
 */
export function validateMigrationFile(
  fileName: string,
  mimeType: string,
  sizeBytes: number,
): FileValidationResult {
  const extension = extensionOf(fileName);

  if (!extension) {
    return { ok: false, reason: "File must have a recognized extension." };
  }

  if (UNSAFE_EXTENSIONS.has(extension)) {
    return {
      ok: false,
      reason: `This file type (.${extension}) is not allowed for security reasons.`,
    };
  }

  if (!SAFE_EXTENSIONS.has(extension)) {
    return {
      ok: false,
      reason: `Unsupported file type (.${extension}). Use CSV, Excel, PDF, or common image formats.`,
    };
  }

  const maxBytes = 25 * 1024 * 1024;
  if (sizeBytes > maxBytes) {
    return {
      ok: false,
      reason: "File is larger than 25 MB. Split the export or remove unused sheets.",
    };
  }

  const mime = (mimeType || "").toLowerCase();
  if (
    mime &&
    mime !== "application/octet-stream" &&
    !SAFE_MIME_PREFIXES.some((p) => mime.startsWith(p) || mime.includes(p.replace(/\/$/, "")))
  ) {
    // Soft check — some browsers send empty or odd MIME; extension already gated.
    if (!SAFE_EXTENSIONS.has(extension)) {
      return {
        ok: false,
        reason: "File content type did not pass validation.",
      };
    }
  }

  return {
    ok: true,
    kind: detectFileKind(fileName, mimeType),
    extension,
  };
}
