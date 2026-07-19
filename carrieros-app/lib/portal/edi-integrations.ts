/**
 * EDI / API integration stubs for the Broker & Shipper Portal.
 * Wire these to real carriers' TMS, EDI 204/214/210, or REST webhooks later.
 */

export type PortalEdiChannel =
  | "edi_204_load_tender"
  | "edi_214_status"
  | "edi_210_invoice"
  | "api_webhook"
  | "sftp_drop";

export type PortalEdiIntegration = {
  id: string;
  name: string;
  channel: PortalEdiChannel;
  status: "connected" | "pending" | "disabled";
  description: string;
  lastSyncAt?: string;
};

export const PORTAL_EDI_INTEGRATIONS: PortalEdiIntegration[] = [
  {
    id: "edi-204",
    name: "Load Tender (EDI 204)",
    channel: "edi_204_load_tender",
    status: "pending",
    description: "Receive load tenders electronically from your TMS.",
  },
  {
    id: "edi-214",
    name: "Shipment Status (EDI 214)",
    channel: "edi_214_status",
    status: "pending",
    description: "Push pickup, in-transit, and delivery events to your system.",
  },
  {
    id: "edi-210",
    name: "Freight Invoice (EDI 210)",
    channel: "edi_210_invoice",
    status: "disabled",
    description: "Receive invoice payloads when billing is ready.",
  },
  {
    id: "api-webhook",
    name: "CarrierOS Webhooks",
    channel: "api_webhook",
    status: "connected",
    description: "HTTPS callbacks for load, document, and invoice events.",
    lastSyncAt: "2026-07-16T18:00:00.000Z",
  },
  {
    id: "sftp",
    name: "Document SFTP Drop",
    channel: "sftp_drop",
    status: "disabled",
    description: "Automated document exchange via secure file drop.",
  },
];

export async function stubPushPortalEdiEvent(
  channel: PortalEdiChannel,
  payload: Record<string, unknown>,
): Promise<{ accepted: boolean; message: string }> {
  // Demo stub — no network. Ready to replace with real connector.
  void payload;
  return {
    accepted: true,
    message: `Queued ${channel} event for partner integration (demo).`,
  };
}
