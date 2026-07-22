import { createHash } from "node:crypto";
import { INTAKE_MIME_TYPES, type DocumentUpload, type IntakeMimeType } from "@/lib/alph/document-intake/types";

const STORAGE_FILE_LIMIT_BYTES = 15 * 1024 * 1024;

function hasExpectedSignature(
  bytes: Uint8Array,
  mimeType: IntakeMimeType,
): boolean {
  if (mimeType === "application/pdf") {
    return (
      bytes.length >= 5 &&
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46 &&
      bytes[4] === 0x2d
    );
  }
  if (mimeType === "image/jpeg") {
    return (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  }
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

export function getDocumentMaxBytes(): number {
  const configured = Number(process.env.ALPH_DOCUMENT_MAX_BYTES);
  if (!Number.isFinite(configured) || configured <= 0) {
    return STORAGE_FILE_LIMIT_BYTES;
  }
  return Math.min(Math.floor(configured), STORAGE_FILE_LIMIT_BYTES);
}

export function validateDocumentBytes(
  input: {
    bytes: Uint8Array;
    fileName: string;
    mimeType: string;
  },
  context: { companyId: string; userId: string },
): DocumentUpload {
  const max = getDocumentMaxBytes();
  if (!INTAKE_MIME_TYPES.includes(input.mimeType as IntakeMimeType)) {
    throw new Error("Unsupported file. Upload PDF, JPG, or PNG.");
  }
  if (input.bytes.byteLength <= 0 || input.bytes.byteLength > max) {
    throw new Error(`File must be between 1 byte and ${max} bytes.`);
  }
  const mimeType = input.mimeType as IntakeMimeType;
  if (!hasExpectedSignature(input.bytes, mimeType)) {
    throw new Error(
      "Unsupported file. The file content does not match its PDF, JPG, or PNG type.",
    );
  }
  return {
    ...context,
    fileName: input.fileName,
    mimeType,
    bytes: input.bytes,
    checksumSha256: createHash("sha256").update(input.bytes).digest("hex"),
  };
}

export async function validateDocumentFile(
  file: File,
  context: { companyId: string; userId: string },
): Promise<DocumentUpload> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return validateDocumentBytes(
    { bytes, fileName: file.name, mimeType: file.type },
    context,
  );
}
