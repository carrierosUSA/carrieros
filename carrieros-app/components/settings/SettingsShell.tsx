"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FadeIn from "@/components/ui/FadeIn";
import SettingsNav from "@/components/settings/SettingsNav";
import SettingsSkeleton from "@/components/settings/SettingsSkeleton";
import AiSafetySettingsPanel from "@/components/ai-safety/AiSafetySettingsPanel";
import AutopilotSettingsPanel from "@/components/alph/AutopilotSettingsPanel";
import ApiKeysPanel from "@/components/settings/panels/ApiKeysPanel";
import AuditLogsPanel from "@/components/settings/panels/AuditLogsPanel";
import AutomationPanel from "@/components/settings/panels/AutomationPanel";
import BackupPanel from "@/components/settings/panels/BackupPanel";
import BillingPanel from "@/components/settings/panels/BillingPanel";
import BrandingPanel from "@/components/settings/panels/BrandingPanel";
import CompanyPanel from "@/components/settings/panels/CompanyPanel";
import DocumentTemplatesPanel from "@/components/settings/panels/DocumentTemplatesPanel";
import EmailTemplatesPanel from "@/components/settings/panels/EmailTemplatesPanel";
import IntegrationsPanel from "@/components/settings/panels/IntegrationsPanel";
import InvoiceTemplatesPanel from "@/components/settings/panels/InvoiceTemplatesPanel";
import NotificationsPanel from "@/components/settings/panels/NotificationsPanel";
import PermissionsPanel from "@/components/settings/panels/PermissionsPanel";
import SecurityPanel from "@/components/settings/panels/SecurityPanel";
import SmsTemplatesPanel from "@/components/settings/panels/SmsTemplatesPanel";
import SubscriptionPanel from "@/components/settings/panels/SubscriptionPanel";
import UsersPanel from "@/components/settings/panels/UsersPanel";
import { useSettings } from "@/hooks/useSettings";
import {
  getSettingsNavItem,
  parseSettingsSection,
} from "@/lib/settings/sections";
import type { CarrierSettingsState, SettingsSectionId } from "@/lib/settings/types";

export default function SettingsShell() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const section = parseSettingsSection(searchParams.get("section"));
  const navItem = getSettingsNavItem(section);
  const {
    settings,
    hydrated,
    dirty,
    saving,
    savedFlash,
    update,
    persist,
    save,
  } = useSettings();

  function selectSection(next: SettingsSectionId) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "company") {
      params.delete("section");
    } else {
      params.set("section", next);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  if (!hydrated || !settings) {
    return <SettingsSkeleton />;
  }

  return (
    <FadeIn className="w-full rounded-[16px] bg-white p-4 text-[#111827] sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1280px] space-y-5">
        <header className="rounded-[16px] bg-[#F5F7FA] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
            Workspace
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#111827]">
            Settings
          </h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            {navItem?.description ??
              "Company profile, users, roles, notifications, billing, and security prefs. Platform-power tools live in Advanced."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { href: "/advanced", label: "Advanced" },
              { href: "/settings?section=users", label: "Users" },
              { href: "/settings/permissions", label: "Roles" },
              { href: "/settings?section=notifications", label: "Notifications" },
              { href: "/settings?section=billing", label: "Billing" },
              { href: "/settings?section=security", label: "Security" },
              { href: "/settings?section=api-keys", label: "API keys" },
              { href: "/support", label: "Support" },
            ].map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#334155] ring-1 ring-[#E2E8F0] transition hover:text-[#2563EB] hover:ring-[#BFDBFE]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </header>

        <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
          <SettingsNav activeSection={section} onSelect={selectSection} />
          <div className="min-w-0 flex-1 rounded-[16px] bg-white lg:pl-2">
            <SettingsActivePanel
              section={section}
              settings={settings}
              dirty={dirty}
              saving={saving}
              savedFlash={savedFlash}
              update={update}
              persist={persist}
              save={save}
            />
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

type ActivePanelProps = {
  section: SettingsSectionId;
  settings: CarrierSettingsState;
  dirty: boolean;
  saving: boolean;
  savedFlash: boolean;
  update: (updater: (prev: CarrierSettingsState) => CarrierSettingsState) => void;
  persist: (
    next: CarrierSettingsState,
    audit?: { action: string; resource: string; details: string },
  ) => CarrierSettingsState;
  save: (resource: string, details: string) => void;
};

function SettingsActivePanel({
  section,
  settings,
  dirty,
  saving,
  savedFlash,
  update,
  persist,
  save,
}: ActivePanelProps) {
  const saveProps = { dirty, saving, savedFlash };

  switch (section) {
    case "company":
      return (
        <CompanyPanel
          settings={settings}
          {...saveProps}
          onChange={(patch) =>
            update((prev) => ({ ...prev, company: { ...prev.company, ...patch } }))
          }
          onSave={() => save("company", "Updated company profile")}
        />
      );
    case "users":
      return (
        <UsersPanel
          settings={settings}
          {...saveProps}
          onUsersChange={(users) => update((prev) => ({ ...prev, users }))}
          onSave={() => save("users", "Updated users and roles")}
        />
      );
    case "permissions":
      return <PermissionsPanel />;
    case "billing":
      return (
        <BillingPanel
          settings={settings}
          {...saveProps}
          onChange={(patch) =>
            update((prev) => ({ ...prev, billing: { ...prev.billing, ...patch } }))
          }
          onSave={() => save("billing", "Updated billing settings")}
        />
      );
    case "subscription":
      return (
        <SubscriptionPanel
          settings={settings}
          {...saveProps}
          onChange={(patch) =>
            update((prev) => ({
              ...prev,
              subscription: { ...prev.subscription, ...patch },
            }))
          }
          onSave={() => save("subscription", "Updated subscription plan")}
        />
      );
    case "notifications":
      return (
        <NotificationsPanel
          settings={settings}
          {...saveProps}
          onChange={(notifications) =>
            update((prev) => ({ ...prev, notifications }))
          }
          onSave={() => save("notifications", "Updated notification preferences")}
        />
      );
    case "branding":
      return (
        <BrandingPanel
          settings={settings}
          {...saveProps}
          onChange={(patch) =>
            update((prev) => ({
              ...prev,
              branding: { ...prev.branding, ...patch },
            }))
          }
          onSave={() => save("branding", "Updated branding")}
        />
      );
    case "email-templates":
      return (
        <EmailTemplatesPanel
          settings={settings}
          {...saveProps}
          onChange={(emailTemplates) =>
            update((prev) => ({ ...prev, emailTemplates }))
          }
          onSave={() => save("email-templates", "Updated email templates")}
        />
      );
    case "sms-templates":
      return (
        <SmsTemplatesPanel
          settings={settings}
          {...saveProps}
          onChange={(smsTemplates) =>
            update((prev) => ({ ...prev, smsTemplates }))
          }
          onSave={() => save("sms-templates", "Updated SMS templates")}
        />
      );
    case "invoice-templates":
      return (
        <InvoiceTemplatesPanel
          settings={settings}
          {...saveProps}
          onChange={(patch) =>
            update((prev) => ({
              ...prev,
              invoiceTemplate: { ...prev.invoiceTemplate, ...patch },
            }))
          }
          onSave={() => save("invoice-templates", "Updated invoice template")}
        />
      );
    case "document-templates":
      return (
        <DocumentTemplatesPanel
          settings={settings}
          {...saveProps}
          onChange={(documentTemplates) =>
            update((prev) => ({ ...prev, documentTemplates }))
          }
          onSave={() =>
            save("document-templates", "Updated document templates")
          }
        />
      );
    case "automation":
      return <AutomationPanel settings={settings} />;
    case "ai-policy":
      return (
        <div className="space-y-8">
          <AutopilotSettingsPanel />
          <AiSafetySettingsPanel />
        </div>
      );
    case "api-keys":
      return (
        <ApiKeysPanel
          settings={settings}
          onChange={(apiKeys) => update((prev) => ({ ...prev, apiKeys }))}
          onPersist={(apiKeys, details) =>
            persist({ ...settings, apiKeys }, {
              action: "updated",
              resource: "api-keys",
              details,
            })
          }
        />
      );
    case "integrations":
      return (
        <IntegrationsPanel
          settings={settings}
          onChange={(integrations) =>
            update((prev) => ({ ...prev, integrations }))
          }
          onPersist={(integrations, details) =>
            persist(
              { ...settings, integrations },
              { action: "updated", resource: "integrations", details },
            )
          }
        />
      );
    case "backup":
      return (
        <BackupPanel
          settings={settings}
          {...saveProps}
          onChange={(patch) =>
            update((prev) => ({ ...prev, backup: { ...prev.backup, ...patch } }))
          }
          onSave={() => save("backup", "Updated backup schedule")}
          onBackupNow={() => {
            const next = {
              ...settings,
              backup: {
                ...settings.backup,
                lastBackupAt: new Date().toISOString(),
              },
            };
            persist(next, {
              action: "created",
              resource: "backup",
              details: "Ran manual settings backup",
            });
          }}
        />
      );
    case "security":
      return (
        <SecurityPanel
          settings={settings}
          {...saveProps}
          onChange={(patch) =>
            update((prev) => ({
              ...prev,
              security: { ...prev.security, ...patch },
            }))
          }
          onSave={() => save("security", "Updated security policy")}
        />
      );
    case "audit-logs":
      return <AuditLogsPanel settings={settings} />;
    default:
      return null;
  }
}
