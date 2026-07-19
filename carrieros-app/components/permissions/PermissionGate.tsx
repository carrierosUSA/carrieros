"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { DENIED_TOOLTIP } from "@/lib/permissions/check";
import type { PermissionId } from "@/lib/permissions/types";

type PermissionGateProps = {
  permission: PermissionId;
  children: ReactNode;
  /** When denied, render children disabled instead of hiding */
  mode?: "disable" | "hide";
  fallback?: ReactNode;
  className?: string;
};

export function PermissionGate({
  permission,
  children,
  mode = "disable",
  fallback = null,
  className,
}: PermissionGateProps) {
  const { can, cannotReason } = usePermissions();
  const allowed = can(permission);

  if (allowed) {
    return <span className={className}>{children}</span>;
  }

  if (mode === "hide") {
    return <>{fallback}</>;
  }

  const reason = cannotReason(permission) ?? DENIED_TOOLTIP;

  return (
    <span className={`inline-flex ${className ?? ""}`} title={reason}>
      {children}
    </span>
  );
}

type PermissionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  permission: PermissionId;
  children: ReactNode;
};

/** Button that disables + tooltips when the user lacks permission */
export function PermissionButton({
  permission,
  children,
  className = "",
  disabled,
  onClick,
  ...rest
}: PermissionButtonProps) {
  const { can, cannotReason } = usePermissions();
  const allowed = can(permission);
  const reason = cannotReason(permission);
  const isDisabled = Boolean(disabled) || !allowed;

  return (
    <button
      type="button"
      {...rest}
      disabled={isDisabled}
      title={!allowed ? reason ?? DENIED_TOOLTIP : rest.title}
      onClick={allowed ? onClick : undefined}
      className={`${className} ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {children}
    </button>
  );
}

type PermissionLinkProps = {
  permission: PermissionId;
  href: string;
  children: ReactNode;
  className?: string;
};

/** Anchor-style control that becomes a disabled span without permission */
export function PermissionLink({
  permission,
  href,
  children,
  className = "",
}: PermissionLinkProps) {
  const { can, cannotReason } = usePermissions();
  const allowed = can(permission);

  if (!allowed) {
    return (
      <span
        className={`${className} cursor-not-allowed opacity-50`}
        title={cannotReason(permission) ?? DENIED_TOOLTIP}
        aria-disabled="true"
      >
        {children}
      </span>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
