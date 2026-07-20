import { createHash } from "node:crypto";
import { INTAKE_MIME_TYPES, type DocumentUpload, type IntakeMimeType } from "@/lib/alph/document-intake/types";

export function validateDocumentFile(file: File, context: { companyId: string; userId: string }): Promise<DocumentUpload> {
  const max = Number(process.env.ALPH_DOCUMENT_MAX_BYTES ?? 15 * 1024 * 1024);
  if (!INTAKE_MIME_TYPES.includes(file.type as IntakeMimeType)) throw new Error("Unsupported file. Upload PDF, JPG, or PNG.");
  if (file.size <= 0 || file.size > max) throw new Error(`File must be between 1 byte and ${max} bytes.`);
  return file.arrayBuffer().then((buffer) => {
    const bytes = new Uint8Array(buffer);
    return { ...context, fileName: file.name, mimeType: file.type as IntakeMimeType, bytes, checksumSha256: createHash("sha256").update(bytes).digest("hex") };
  });
}
