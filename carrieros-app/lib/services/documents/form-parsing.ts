import type {
  CaptureLoadDocumentInput,
  PreparePacketInput,
} from "@/lib/services/documents/document-inputs";
import type { LoadDocumentType } from "@/lib/types";
import { LOAD_DOCUMENT_SEQUENCE } from "@/lib/types";

function isLoadDocumentType(value: string): value is LoadDocumentType {
  return LOAD_DOCUMENT_SEQUENCE.some((item) => item.type === value);
}

export function parseCaptureLoadDocumentInput(
  loadId: string,
  formData: FormData,
): CaptureLoadDocumentInput {
  const typeValue = String(formData.get("type") ?? "").trim();
  const file = formData.get("file");
  const fileName =
    file instanceof File && file.name
      ? file.name
      : String(formData.get("fileName") ?? "").trim();

  if (!isLoadDocumentType(typeValue)) {
    throw new Error("Invalid document type.");
  }

  return {
    loadId,
    type: typeValue,
    fileName: fileName || `${loadId}-${typeValue}.jpg`,
  };
}

export function parsePreparePacketInput(
  loadId: string,
  formData: FormData,
): PreparePacketInput {
  const destination = String(formData.get("destination") ?? "broker").trim();

  return {
    loadId,
    destination:
      destination === "accounting" || destination === "factory"
        ? destination
        : "broker",
  };
}
