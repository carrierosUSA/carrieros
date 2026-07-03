import { mockDocumentService } from "@/lib/services/documents/document-service.mock";
import type { DocumentService } from "@/lib/services/documents/document-service";

export type {
  DocumentPacketChecklistItem,
  DocumentPacketSummary,
  DocumentService,
  CaptureLoadDocumentInput,
  PreparePacketInput,
} from "@/lib/services/documents/document-service";

export function getDocumentService(): DocumentService {
  return mockDocumentService;
}
