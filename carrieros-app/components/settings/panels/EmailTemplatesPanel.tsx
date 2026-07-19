"use client";

import { useState } from "react";
import TemplateEditor from "@/components/settings/TemplateEditor";
import {
  SettingsPanelFrame,
  SettingsSaveButton,
} from "@/components/settings/SettingsField";
import type { CarrierSettingsState, MessageTemplate } from "@/lib/settings/types";

type EmailTemplatesPanelProps = {
  settings: CarrierSettingsState;
  dirty: boolean;
  saving: boolean;
  savedFlash: boolean;
  onChange: (templates: MessageTemplate[]) => void;
  onSave: () => void;
};

export default function EmailTemplatesPanel({
  settings,
  dirty,
  saving,
  savedFlash,
  onChange,
  onSave,
}: EmailTemplatesPanelProps) {
  const [selectedId, setSelectedId] = useState(
    settings.emailTemplates[0]?.id ?? "invoice",
  );

  return (
    <SettingsPanelFrame
      title="Email templates"
      description="Subjects and bodies for invoice, rate con, POD request, and payment reminders."
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
        templates={settings.emailTemplates}
        selectedId={selectedId}
        onSelect={setSelectedId}
        showSubject
        onChange={(id, patch) =>
          onChange(
            settings.emailTemplates.map((t) =>
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
