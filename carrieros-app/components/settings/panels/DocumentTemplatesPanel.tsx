"use client";

import {
  SettingsField,
  SettingsPanelFrame,
  SettingsSaveButton,
  settingsInputClass,
} from "@/components/settings/SettingsField";
import type {
  CarrierSettingsState,
  DocumentTemplateSettings,
} from "@/lib/settings/types";

type DocumentTemplatesPanelProps = {
  settings: CarrierSettingsState;
  dirty: boolean;
  saving: boolean;
  savedFlash: boolean;
  onChange: (next: DocumentTemplateSettings) => void;
  onSave: () => void;
};

export default function DocumentTemplatesPanel({
  settings,
  dirty,
  saving,
  savedFlash,
  onChange,
  onSave,
}: DocumentTemplatesPanelProps) {
  const docs = settings.documentTemplates;

  return (
    <SettingsPanelFrame
      title="Document templates"
      description="Packet checklists and naming patterns for delivery and onboarding packs."
      footer={
        <SettingsSaveButton
          onClick={onSave}
          disabled={!dirty}
          saving={saving}
          saved={savedFlash}
          disabledReason="No changes to save."
        />
      }
    >
      <SettingsField
        label="Default naming pattern"
        hint="Available tokens: {{load_ref}}, {{doc_type}}, {{date}}, {{driver_name}}"
      >
        <input
          className={settingsInputClass}
          value={docs.defaultNamingPattern}
          onChange={(e) =>
            onChange({ ...docs, defaultNamingPattern: e.target.value })
          }
        />
      </SettingsField>

      <div className="space-y-3">
        {docs.packets.map((packet) => (
          <article
            key={packet.id}
            className="rounded-[16px] bg-[#F8FAFC] p-4 ring-1 ring-[#EAEAEA]"
          >
            <p className="text-[15px] font-semibold text-slate-950">
              {packet.name}
            </p>
            <SettingsField label="Naming pattern" className="mt-3">
              <input
                className={settingsInputClass}
                value={packet.namingPattern}
                onChange={(e) =>
                  onChange({
                    ...docs,
                    packets: docs.packets.map((p) =>
                      p.id === packet.id
                        ? { ...p, namingPattern: e.target.value }
                        : p,
                    ),
                  })
                }
              />
            </SettingsField>
            <ul className="mt-3 space-y-1.5">
              {packet.items.map((item) => (
                <li
                  key={item}
                  className="rounded-[10px] bg-white px-3 py-2 text-[14px] text-slate-700 ring-1 ring-[#EAEAEA]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </SettingsPanelFrame>
  );
}
