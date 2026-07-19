"use client";

import { usePortal } from "@/components/portal/PortalProvider";
import {
  PortalBadge,
  PortalCard,
  PortalSectionTitle,
} from "@/components/portal/ui";
import { getPortalCompanyProfile } from "@/lib/portal/data";
import { PORTAL_ROLE_LABELS } from "@/lib/portal/types";
import { PORTAL_EDI_INTEGRATIONS } from "@/lib/portal/edi-integrations";
import { formatCompanyAddress } from "@/lib/data/companies";

export default function PortalProfile() {
  const { session } = usePortal();
  if (!session) return null;

  const { portalCompany, directory, users } = getPortalCompanyProfile(session);

  return (
    <div className="space-y-6">
      <PortalSectionTitle
        title="Company Profile"
        subtitle="Contacts, locations, billing, and preferred requirements."
      />

      <PortalCard>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-[#111827]">
              {portalCompany?.name ?? session.companyName}
            </h3>
            <p className="mt-1 text-sm text-[#6B7280]">
              {session.companyType === "broker" ? "Broker" : "Shipper"} ·{" "}
              {portalCompany?.email}
            </p>
          </div>
          <PortalBadge tone="blue">
            {session.companyType === "broker" ? "Broker account" : "Shipper account"}
          </PortalBadge>
        </div>

        {portalCompany ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="carrieros-label text-[#6B7280]">Billing address</p>
              <p className="mt-1 text-sm font-medium text-[#111827]">
                {portalCompany.billingAddress.street}
                <br />
                {portalCompany.billingAddress.city},{" "}
                {portalCompany.billingAddress.state}{" "}
                {portalCompany.billingAddress.zip}
              </p>
            </div>
            <div>
              <p className="carrieros-label text-[#6B7280]">Phone</p>
              <p className="mt-1 text-sm font-medium text-[#111827]">
                {portalCompany.phone}
              </p>
              {portalCompany.website ? (
                <>
                  <p className="mt-3 carrieros-label text-[#6B7280]">Website</p>
                  <p className="mt-1 text-sm font-medium text-[#2563EB]">
                    {portalCompany.website}
                  </p>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </PortalCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <PortalCard>
          <h3 className="carrieros-card-title mb-3">Contacts</h3>
          <ul className="space-y-2">
            {(directory?.contacts ?? []).slice(0, 6).map((c) => (
              <li
                key={c.id}
                className="rounded-xl bg-[#F8F9FB] px-3 py-2.5"
              >
                <p className="text-sm font-semibold text-[#111827]">{c.name}</p>
                <p className="text-sm text-[#6B7280]">
                  {c.position ?? c.role} · {c.email}
                </p>
                {c.phone ? (
                  <p className="text-sm text-[#6B7280]">{c.phone}</p>
                ) : null}
              </li>
            ))}
            {(!directory?.contacts || directory.contacts.length === 0) &&
              users.map((u) => (
                <li
                  key={u.id}
                  className="rounded-xl bg-[#F8F9FB] px-3 py-2.5"
                >
                  <p className="text-sm font-semibold text-[#111827]">{u.name}</p>
                  <p className="text-sm text-[#6B7280]">
                    {PORTAL_ROLE_LABELS[u.role]} · {u.email}
                  </p>
                </li>
              ))}
          </ul>
        </PortalCard>

        <PortalCard>
          <h3 className="carrieros-card-title mb-3">
            Pickup & delivery locations
          </h3>
          <ul className="space-y-2">
            {(directory?.locations ?? []).map((loc) => (
              <li
                key={loc.id}
                className="rounded-xl bg-[#F8F9FB] px-3 py-2.5"
              >
                <p className="text-sm font-semibold text-[#111827]">
                  {loc.name}
                </p>
                <p className="text-sm text-[#6B7280]">
                  {formatCompanyAddress(loc.address)}
                </p>
                {loc.hours ? (
                  <p className="mt-0.5 text-[12px] text-[#6B7280]">{loc.hours}</p>
                ) : null}
              </li>
            ))}
            {(!directory?.locations || directory.locations.length === 0) &&
            portalCompany ? (
              <li className="rounded-xl bg-[#F8F9FB] px-3 py-2.5 text-sm text-[#6B7280]">
                {formatCompanyAddress(portalCompany.billingAddress)}
              </li>
            ) : null}
          </ul>
        </PortalCard>
      </div>

      <PortalCard>
        <h3 className="carrieros-card-title mb-3">Preferred requirements</h3>
        <ul className="flex flex-wrap gap-2">
          {(portalCompany?.preferredRequirements ?? []).map((req) => (
            <li
              key={req}
              className="rounded-full bg-[#EFF6FF] px-3 py-1.5 text-sm font-medium text-[#1D4ED8]"
            >
              {req}
            </li>
          ))}
        </ul>
      </PortalCard>

      <PortalCard>
        <h3 className="carrieros-card-title mb-1">Portal users</h3>
        <p className="mb-3 text-sm text-[#6B7280]">
          Multiple users share this company account with role-based access.
        </p>
        <ul className="divide-y divide-[#F3F4F6]">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3"
            >
              <div>
                <p className="font-semibold text-[#111827]">{u.name}</p>
                <p className="text-sm text-[#6B7280]">{u.email}</p>
              </div>
              <PortalBadge
                tone={u.role === "read_only" ? "gray" : "blue"}
              >
                {PORTAL_ROLE_LABELS[u.role]}
              </PortalBadge>
            </li>
          ))}
        </ul>
      </PortalCard>

      <PortalCard>
        <h3 className="carrieros-card-title mb-1">API & EDI integrations</h3>
        <p className="mb-3 text-sm text-[#6B7280]">
          Connect your TMS for automated tenders and status updates.
        </p>
        <ul className="space-y-2">
          {PORTAL_EDI_INTEGRATIONS.map((intg) => (
            <li
              key={intg.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F8F9FB] px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-semibold text-[#111827]">
                  {intg.name}
                </p>
                <p className="text-sm text-[#6B7280]">{intg.description}</p>
              </div>
              <PortalBadge
                tone={
                  intg.status === "connected"
                    ? "green"
                    : intg.status === "pending"
                      ? "orange"
                      : "gray"
                }
              >
                {intg.status}
              </PortalBadge>
            </li>
          ))}
        </ul>
      </PortalCard>
    </div>
  );
}
