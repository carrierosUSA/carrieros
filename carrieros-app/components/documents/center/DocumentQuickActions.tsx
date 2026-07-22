"use client";

import { usePermissions } from "@/hooks/usePermissions";
import type { CarrierOSRole } from "@/lib/auth/session";
import { DENIED_TOOLTIP } from "@/lib/permissions/check";
import {
  checkDocumentPermission,
  type DocumentPermissionAction,
} from "@/lib/documents/document-permissions";
import type { CarrierDocument } from "@/lib/types/documents";

type DocumentQuickActionsProps = {
  document: CarrierDocument;
  role: CarrierOSRole;
  onUpload: () => void;
  onDownload: () => void;
  onPreview: () => void;
  onShare: () => void;
  onRename: () => void;
  onMove: () => void;
  onMerge: () => void;
  onPrint: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onVersionHistory: () => void;
  unavailableActions?: Partial<Record<DocumentPermissionAction, string>>;
};

function ActionButton({
  label,
  onClick,
  primary,
  disabled,
  title,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        primary
          ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          : "bg-[#F8FAFC] text-slate-700 ring-1 ring-[#EAEAEA] hover:bg-white"
      }`}
    >
      {label}
    </button>
  );
}

export default function DocumentQuickActions({
  document,
  role,
  onUpload,
  onDownload,
  onPreview,
  onShare,
  onRename,
  onMove,
  onMerge,
  onPrint,
  onDelete,
  onRestore,
  onVersionHistory,
  unavailableActions,
}: DocumentQuickActionsProps) {
  const { can, cannotReason } = usePermissions();
  const enterpriseDelete = can("button.documents.delete");

  function perm(action: DocumentPermissionAction) {
    return checkDocumentPermission(role, action, document);
  }

  const upload = perm("upload");
  const download = perm("download");
  const preview = perm("preview");
  const share = perm("share");
  const rename = perm("rename");
  const move = perm("move");
  const merge = perm("merge");
  const print = perm("print");
  const del = perm("delete");
  const restore = perm("restore");
  const versions = perm("view_versions");
  const deleteAllowed = del.allowed && enterpriseDelete;
  const deleteReason = !enterpriseDelete
    ? cannotReason("button.documents.delete") ?? DENIED_TOOLTIP
    : (del.reason ?? "Move to trash");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionButton
        label="Upload"
        primary
        disabled={!upload.allowed || Boolean(unavailableActions?.upload)}
        title={unavailableActions?.upload ?? upload.reason ?? "Upload a new version"}
        onClick={onUpload}
      />
      <ActionButton
        label="Download"
        disabled={!download.allowed || Boolean(unavailableActions?.download)}
        title={unavailableActions?.download ?? download.reason ?? "Download file"}
        onClick={onDownload}
      />
      <ActionButton
        label="Preview"
        disabled={!preview.allowed || Boolean(unavailableActions?.preview)}
        title={unavailableActions?.preview ?? preview.reason ?? "Preview document"}
        onClick={onPreview}
      />
      <ActionButton
        label="Share"
        disabled={!share.allowed || Boolean(unavailableActions?.share)}
        title={unavailableActions?.share ?? share.reason ?? "Copy share link"}
        onClick={onShare}
      />
      <ActionButton
        label="Rename"
        disabled={!rename.allowed || Boolean(unavailableActions?.rename)}
        title={unavailableActions?.rename ?? rename.reason ?? "Rename document"}
        onClick={onRename}
      />
      <ActionButton
        label="Move"
        disabled={!move.allowed || Boolean(unavailableActions?.move)}
        title={unavailableActions?.move ?? move.reason ?? "Change category"}
        onClick={onMove}
      />
      <ActionButton
        label="Merge PDFs"
        disabled={!merge.allowed || Boolean(unavailableActions?.merge)}
        title={unavailableActions?.merge ?? merge.reason}
        onClick={onMerge}
      />
      <ActionButton
        label="Print"
        disabled={!print.allowed || Boolean(unavailableActions?.print)}
        title={unavailableActions?.print ?? print.reason ?? "Print document"}
        onClick={onPrint}
      />
      {document.status === "deleted" ? (
        <ActionButton
          label="Restore"
          disabled={!restore.allowed || Boolean(unavailableActions?.restore)}
          title={unavailableActions?.restore ?? restore.reason ?? "Restore from trash"}
          onClick={onRestore}
        />
      ) : (
        <ActionButton
          label="Delete"
          disabled={!deleteAllowed || Boolean(unavailableActions?.delete)}
          title={unavailableActions?.delete ?? deleteReason}
          onClick={onDelete}
        />
      )}
      <ActionButton
        label="Version History"
        disabled={!versions.allowed || Boolean(unavailableActions?.view_versions)}
        title={unavailableActions?.view_versions ?? versions.reason ?? "View versions"}
        onClick={onVersionHistory}
      />
    </div>
  );
}
