"use client";

import {
  SettingsField,
  settingsInputClass,
  settingsTextareaClass,
} from "@/components/settings/SettingsField";
import type { MessageTemplate } from "@/lib/settings/types";

type TemplateEditorProps = {
  templates: MessageTemplate[];
  selectedId: string;
  onSelect: (id: string) => void;
  onChange: (id: string, patch: Partial<MessageTemplate>) => void;
  showSubject?: boolean;
};

export default function TemplateEditor({
  templates,
  selectedId,
  onSelect,
  onChange,
  showSubject = true,
}: TemplateEditorProps) {
  const selected =
    templates.find((t) => t.id === selectedId) ?? templates[0] ?? null;

  if (!selected) {
    return (
      <p className="text-[14px] text-slate-500">No templates available.</p>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="space-y-1 rounded-[14px] bg-[#F8FAFC] p-2 ring-1 ring-[#EAEAEA]">
        {templates.map((template) => {
          const active = template.id === selected.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template.id)}
              className={`flex w-full flex-col rounded-[10px] px-3 py-2.5 text-left transition ${
                active
                  ? "bg-white shadow-sm ring-1 ring-[#EAEAEA]"
                  : "hover:bg-white/70"
              }`}
            >
              <span
                className={`text-[14px] font-semibold ${
                  active ? "text-slate-950" : "text-slate-600"
                }`}
              >
                {template.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3 rounded-[16px] bg-white p-4 ring-1 ring-[#EAEAEA]">
        {showSubject ? (
          <SettingsField label="Subject">
            <input
              className={settingsInputClass}
              value={selected.subject ?? ""}
              onChange={(e) =>
                onChange(selected.id, { subject: e.target.value })
              }
            />
          </SettingsField>
        ) : null}
        <SettingsField
          label="Body"
          hint="Use {{placeholders}} like {{load_ref}} or {{driver_name}}."
        >
          <textarea
            className={settingsTextareaClass}
            value={selected.body}
            onChange={(e) => onChange(selected.id, { body: e.target.value })}
          />
        </SettingsField>
      </div>
    </div>
  );
}
