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
        disabled={!upload.allowed}
        title={upload.reason ?? "Upload a new version"}
        onClick={onUpload}
      />
      <ActionButton
        label="Download"
        disabled={!download.allowed}
        title={download.reason ?? "Download file"}
        onClick={onDownload}
      />
      <ActionButton
        label="Preview"
        disabled={!preview.allowed}
        title={preview.reason ?? "Preview document"}
        onClick={onPreview}
      />
      <ActionButton
        label="Share"
        disabled={!share.allowed}
        title={share.reason ?? "Copy share link"}
        onClick={onShare}
      />
      <ActionButton
        label="Rename"
        disabled={!rename.allowed}
        title={rename.reason ?? "Rename document"}
        onClick={onRename}
      />
      <ActionButton
        label="Move"
        disabled={!move.allowed}
        title={move.reason ?? "Change category"}
        onClick={onMove}
      />
      <ActionButton
        label="Merge PDFs"
        disabled={!merge.allowed}
        title={merge.reason}
        onClick={onMerge}
      />
      <ActionButton
        label="Print"
        disabled={!print.allowed}
        title={print.reason ?? "Print document"}
        onClick={onPrint}
      />
      {document.status === "deleted" ? (
        <ActionButton
          label="Restore"
          disabled={!restore.allowed}
          title={restore.reason ?? "Restore from trash"}
          onClick={onRestore}
        />
      ) : (
        <ActionButton
          label="Delete"
          disabled={!deleteAllowed}
          title={deleteReason}
          onClick={onDelete}
        />
      )}
      <ActionButton
        label="Version History"
        disabled={!versions.allowed}
        title={versions.reason ?? "View versions"}
        onClick={onVersionHistory}
      />
    </div>
  );
}
