"use client";

import { portalPermissionDeniedReason, canPortal } from "@/lib/portal/permissions";
import type { PortalPermission, PortalRole } from "@/lib/portal/types";
import { PortalTooltip } from "@/components/portal/ui";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type PermissionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  role: PortalRole | undefined;
  permission: PortalPermission;
  children: ReactNode;
};

export default function PermissionButton({
  role,
  permission,
  children,
  className = "",
  disabled,
  ...rest
}: PermissionButtonProps) {
  const allowed = canPortal(role, permission);
  const reason = portalPermissionDeniedReason(role, permission);
  const isDisabled = Boolean(disabled) || !allowed;

  const button = (
    <button
      type="button"
      {...rest}
      disabled={isDisabled}
      title={!allowed && reason ? reason : rest.title}
      className={`${className} ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {children}
    </button>
  );

  if (!allowed && reason) {
    return <PortalTooltip label={reason}>{button}</PortalTooltip>;
  }

  return button;
}
