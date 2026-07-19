"use client";

import { Plus, Trash2 } from "lucide-react";
import ActionTooltip from "@/components/ui/ActionTooltip";
import {
  ACTION_CATALOG,
  CONDITION_OPERATOR_LABELS,
  CONDITION_OPERATORS,
  TRIGGER_CATALOG,
  getActionParams,
  getTriggerFields,
} from "@/lib/workflows/catalog";
import type {
  ConditionOperator,
  WorkflowAction,
  WorkflowActionType,
  WorkflowCondition,
  WorkflowDraft,
  WorkflowTriggerType,
} from "@/lib/workflows/types";

type WorkflowBuilderProps = {
  draft: WorkflowDraft;
  onChange: (draft: WorkflowDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  saveDisabled: boolean;
  saveDisabledReason?: string;
  saveLabel?: string;
};

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const selectClass =
  "h-11 w-full rounded-xl border-0 bg-[#F8FAFC] px-3 text-[14px] text-slate-900 outline-none ring-1 ring-[#E2E8F0] transition focus:bg-white focus:ring-2 focus:ring-[#2563EB]/35";
const inputClass =
  "h-11 w-full rounded-xl border-0 bg-[#F8FAFC] px-3 text-[14px] text-slate-900 outline-none ring-1 ring-[#E2E8F0] transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#2563EB]/35";

export default function WorkflowBuilder({
  draft,
  onChange,
  onSave,
  onCancel,
  saveDisabled,
  saveDisabledReason,
  saveLabel = "Save workflow",
}: WorkflowBuilderProps) {
  const fields = getTriggerFields(draft.trigger.type);
  const needsValue = (op: ConditionOperator) =>
    op !== "is_empty" && op !== "is_not_empty";

  function update(partial: Partial<WorkflowDraft>) {
    onChange({ ...draft, ...partial });
  }

  function setTrigger(type: WorkflowTriggerType) {
    const nextConditions = draft.conditions.map((condition) => {
      const stillValid = getTriggerFields(type).some(
        (field) => field.key === condition.field,
      );
      if (stillValid) return condition;
      const first = getTriggerFields(type)[0];
      return {
        ...condition,
        field: first?.key ?? "",
        value: "",
      };
    });
    update({
      trigger: { type },
      conditions: nextConditions,
    });
  }

  function addCondition() {
    const first = fields[0];
    const condition: WorkflowCondition = {
      id: newId("cond"),
      field: first?.key ?? "",
      operator: "equals",
      value: "",
    };
    update({ conditions: [...draft.conditions, condition] });
  }

  function updateCondition(id: string, partial: Partial<WorkflowCondition>) {
    update({
      conditions: draft.conditions.map((condition) =>
        condition.id === id ? { ...condition, ...partial } : condition,
      ),
    });
  }

  function removeCondition(id: string) {
    update({
      conditions: draft.conditions.filter((condition) => condition.id !== id),
    });
  }

  function addAction() {
    const action: WorkflowAction = {
      id: newId("act"),
      type: "create_notification",
      params: { title: "", body: "" },
    };
    update({ actions: [...draft.actions, action] });
  }

  function updateAction(id: string, partial: Partial<WorkflowAction>) {
    update({
      actions: draft.actions.map((action) =>
        action.id === id ? { ...action, ...partial } : action,
      ),
    });
  }

  function setActionType(id: string, type: WorkflowActionType) {
    const params: Record<string, string> = {};
    for (const param of getActionParams(type)) {
      params[param.key] = "";
    }
    updateAction(id, { type, params });
  }

  function setActionParam(id: string, key: string, value: string) {
    const action = draft.actions.find((item) => item.id === id);
    if (!action) return;
    updateAction(id, {
      params: { ...(action.params ?? {}), [key]: value },
    });
  }

  function removeAction(id: string) {
    update({ actions: draft.actions.filter((action) => action.id !== id) });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[18px] bg-white p-5 ring-1 ring-[#EEF2F7] sm:p-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Basics
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-[13px] font-medium text-slate-700">Name</span>
            <input
              value={draft.name}
              onChange={(event) => update({ name: event.target.value })}
              placeholder="e.g. Delivery → Invoice"
              className={inputClass}
            />
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-[13px] font-medium text-slate-700">
              Description
            </span>
            <textarea
              value={draft.description}
              onChange={(event) => update({ description: event.target.value })}
              placeholder="What should this workflow do?"
              rows={2}
              className="w-full rounded-xl border-0 bg-[#F8FAFC] px-3 py-3 text-[14px] text-slate-900 outline-none ring-1 ring-[#E2E8F0] transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#2563EB]/35"
            />
          </label>
          <label className="flex items-center gap-3 sm:col-span-2">
            <input
              type="checkbox"
              checked={draft.enabled}
              onChange={(event) => update({ enabled: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span className="text-[14px] font-medium text-slate-700">
              Enable after saving
            </span>
          </label>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Trigger */}
        <section className="rounded-[18px] bg-white p-5 ring-1 ring-[#EEF2F7] sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#EFF6FF] text-[13px] font-bold text-[#2563EB]">
              1
            </span>
            <div>
              <h2 className="text-[16px] font-semibold text-slate-900">
                Trigger
              </h2>
              <p className="text-[13px] text-slate-500">When this happens…</p>
            </div>
          </div>
          <label className="mt-5 block space-y-1.5">
            <span className="text-[13px] font-medium text-slate-700">
              Event
            </span>
            <select
              value={draft.trigger.type}
              onChange={(event) =>
                setTrigger(event.target.value as WorkflowTriggerType)
              }
              className={selectClass}
            >
              {TRIGGER_CATALOG.map((entry) => (
                <option key={entry.type} value={entry.type}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-3 text-[13px] leading-relaxed text-slate-500">
            {
              TRIGGER_CATALOG.find((entry) => entry.type === draft.trigger.type)
                ?.description
            }
          </p>
        </section>

        {/* Conditions */}
        <section className="rounded-[18px] bg-white p-5 ring-1 ring-[#EEF2F7] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#EFF6FF] text-[13px] font-bold text-[#2563EB]">
                2
              </span>
              <div>
                <h2 className="text-[16px] font-semibold text-slate-900">
                  Conditions
                </h2>
                <p className="text-[13px] text-slate-500">
                  Only if all match (AND)
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {draft.conditions.length === 0 ? (
              <p className="rounded-xl bg-[#F8FAFC] px-3 py-4 text-[13px] text-slate-500">
                No conditions — runs on every matching trigger.
              </p>
            ) : (
              draft.conditions.map((condition) => {
                const fieldDef = fields.find((f) => f.key === condition.field);
                return (
                  <div
                    key={condition.id}
                    className="space-y-2 rounded-xl bg-[#F8FAFC] p-3"
                  >
                    <div className="flex items-start gap-2">
                      <select
                        value={condition.field}
                        onChange={(event) =>
                          updateCondition(condition.id, {
                            field: event.target.value,
                            value: "",
                          })
                        }
                        className={selectClass}
                      >
                        {fields.map((field) => (
                          <option key={field.key} value={field.key}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeCondition(condition.id)}
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-[#DC2626]"
                        aria-label="Remove condition"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                    <select
                      value={condition.operator}
                      onChange={(event) =>
                        updateCondition(condition.id, {
                          operator: event.target.value as ConditionOperator,
                        })
                      }
                      className={selectClass}
                    >
                      {CONDITION_OPERATORS.map((op) => (
                        <option key={op} value={op}>
                          {CONDITION_OPERATOR_LABELS[op]}
                        </option>
                      ))}
                    </select>
                    {needsValue(condition.operator) ? (
                      fieldDef?.valueType === "enum" && fieldDef.enumOptions ? (
                        <select
                          value={condition.value}
                          onChange={(event) =>
                            updateCondition(condition.id, {
                              value: event.target.value,
                            })
                          }
                          className={selectClass}
                        >
                          <option value="">Select…</option>
                          {fieldDef.enumOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={condition.value}
                          onChange={(event) =>
                            updateCondition(condition.id, {
                              value: event.target.value,
                            })
                          }
                          placeholder="Value"
                          className={inputClass}
                        />
                      )
                    ) : null}
                  </div>
                );
              })
            )}
            <button
              type="button"
              onClick={addCondition}
              disabled={fields.length === 0}
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-4 w-4" strokeWidth={2.2} />
              Add condition
            </button>
          </div>
        </section>

        {/* Actions */}
        <section className="rounded-[18px] bg-white p-5 ring-1 ring-[#EEF2F7] sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#EFF6FF] text-[13px] font-bold text-[#2563EB]">
              3
            </span>
            <div>
              <h2 className="text-[16px] font-semibold text-slate-900">
                Actions
              </h2>
              <p className="text-[13px] text-slate-500">Do these next…</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {draft.actions.length === 0 ? (
              <p className="rounded-xl bg-[#F8FAFC] px-3 py-4 text-[13px] text-slate-500">
                Add at least one action to save.
              </p>
            ) : (
              draft.actions.map((action) => {
                const params = getActionParams(action.type);
                return (
                  <div
                    key={action.id}
                    className="space-y-2 rounded-xl bg-[#F8FAFC] p-3"
                  >
                    <div className="flex items-start gap-2">
                      <select
                        value={action.type}
                        onChange={(event) =>
                          setActionType(
                            action.id,
                            event.target.value as WorkflowActionType,
                          )
                        }
                        className={selectClass}
                      >
                        {ACTION_CATALOG.map((entry) => (
                          <option key={entry.type} value={entry.type}>
                            {entry.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeAction(action.id)}
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-[#DC2626]"
                        aria-label="Remove action"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                    {params.map((param) => (
                      <label key={param.key} className="block space-y-1">
                        <span className="text-[12px] font-medium text-slate-500">
                          {param.label}
                          {param.required ? " *" : ""}
                        </span>
                        <input
                          value={action.params?.[param.key] ?? ""}
                          onChange={(event) =>
                            setActionParam(
                              action.id,
                              param.key,
                              event.target.value,
                            )
                          }
                          placeholder={param.placeholder}
                          className={inputClass}
                        />
                      </label>
                    ))}
                  </div>
                );
              })
            )}
            <button
              type="button"
              onClick={addAction}
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF]"
            >
              <Plus className="h-4 w-4" strokeWidth={2.2} />
              Add action
            </button>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center justify-center rounded-full px-5 text-[13px] font-semibold text-slate-600 transition hover:bg-[#F1F5F9]"
        >
          Cancel
        </button>
        <ActionTooltip
          label={saveLabel}
          reason={saveDisabledReason}
          disabled={saveDisabled}
        >
          <button
            type="button"
            disabled={saveDisabled}
            onClick={onSave}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
          >
            {saveLabel}
          </button>
        </ActionTooltip>
      </div>
    </div>
  );
}
