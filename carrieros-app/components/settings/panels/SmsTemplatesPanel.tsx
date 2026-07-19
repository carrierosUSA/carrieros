"use client";

import { useState } from "react";
import TemplateEditor from "@/components/settings/TemplateEditor";
import {
  SettingsPanelFrame,
  SettingsSaveButton,
} from "@/components/settings/SettingsField";
import type { CarrierSettingsState, MessageTemplate } from "@/lib/settings/types";

type SmsTemplatesPanelProps = {
  settings: CarrierSettingsState;
  dirty: boolean;
  saving: boolean;
  savedFlash: boolean;
  onChange: (templates: MessageTemplate[]) => void;
  onSave: () => void;
};

export default function SmsTemplatesPanel({
  settings,
  dirty,
  saving,
  savedFlash,
  onChange,
  onSave,
}: SmsTemplatesPanelProps) {
  const [selectedId, setSelectedId] = useState(
    settings.smsTemplates[0]?.id ?? "check_call",
  );

  return (
    <SettingsPanelFrame
      title="SMS templates"
      description="Short messages for check calls, POD requests, and appointment reminders."
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
      <TemplateEditor
        templates={settings.smsTemplates}
        selectedId={selectedId}
        onSelect={setSelectedId}
        showSubject={false}
        onChange={(id, patch) =>
          onChange(
            settings.smsTemplates.map((t) =>
              t.id === id
                ? { ...t, ...patch, updatedAt: new Date().toISOString() }
                : t,
            ),
          )
        }
      />
    </SettingsPanelFrame>
  );
}
