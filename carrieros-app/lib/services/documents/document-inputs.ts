import type { LoadDocumentType } from "@/lib/types";

export type CaptureLoadDocumentInput = {
  loadId: string;
  type: LoadDocumentType;
  fileName: string;
};

export type PreparePacketInput = {
  loadId: string;
  destination: "broker" | "accounting" | "factory";
};
