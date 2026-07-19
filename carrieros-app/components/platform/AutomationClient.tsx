"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AiAutomationLevelSelect from "@/components/ai-safety/AiAutomationLevelSelect";
import AiPolicyNotice from "@/components/ai-safety/AiPolicyNotice";
import { useAiSafety } from "@/components/ai-safety/AiSafetyProvider";
import EmptyState from "@/components/ui/EmptyState";
import {
  AI_POLICY_SETTINGS_HREF,
  appendAiAudit,
  automationActionToKind,
  canFullyAutomate,
  getAiSafetySettings,
  isCriticalAiAction,
  saveAiSafetySettings,
  type AutomationLevel,
} from "@/lib/ai-safety";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import {
  AUTOMATION_ACTION_LABELS,
  AUTOMATION_TRIGGER_LABELS,
  type AutomationActionId,
  type AutomationTriggerId,
} from "@/lib/platform/types";
import {
  listAutomationRecipes,
  saveAutomationRecipe,
  setRecipeEnabled,
} from "@/lib/platform/store";

const TRIGGERS = Object.keys(AUTOMATION_TRIGGER_LABELS) as AutomationTriggerId[];
const ACTIONS = Object.keys(AUTOMATION_ACTION_LABELS) as AutomationActionId[];

export default function AutomationClient() {
  const { runAiSuggestedAction } = useAiSafety();
  const [tick, setTick] = useState(0);
  const [name, setName] = useState("Custom recipe");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState<AutomationTriggerId>("pod_uploaded");
  const [action, setAction] = useState<AutomationActionId>("create_invoice");
  const [level, setLevel] = useState<AutomationLevel>("semi");
  const [blockMessage, setBlockMessage] = useState<string | null>(null);

  useEffect(() => {
    setLevel(getAiSafetySettings().automationLevel);
  }, []);

  const recipes = useMemo(() => {
    void tick;
    return listAutomationRecipes();
  }, [tick]);

  const selectedKind = automationActionToKind(action);
  const fullCheck = canFullyAutomate(selectedKind);

  async function handleEnable(recipeId: string, enable: boolean, actionId: AutomationActionId) {
    setBlockMessage(null);
    const kind = automationActionToKind(actionId);
    const currentLevel = getAiSafetySettings().automationLevel;

    if (!enable) {
      setRecipeEnabled(recipeId, false);
      appendAiAudit({
        actionKind: kind,
        aiAction: "Disable automation recipe",
        suggestion: recipeId,
        approval: "not_required",
        source: "platform-automation",
      });
      setTick((n) => n + 1);
      return;
    }

    if (currentLevel === "full" && isCriticalAiAction(kind)) {
      setBlockMessage(
        "Fully Automated cannot enable this critical action. Critical recipes stay Semi-Automatic with human approval.",
      );
      appendAiAudit({
        actionKind: "enable_full_automation",
        aiAction: "Blocked full automation for critical recipe",
        suggestion: AUTOMATION_ACTION_LABELS[actionId],
        approval: "blocked",
        reason:
          "Critical actions never bypass approvals — even when company preference is Fully Automated.",
        source: "platform-automation",
      });
      return;
    }

    if (isCriticalAiAction(kind)) {
      const gate = await runAiSuggestedAction({
        kind: "enable_full_automation",
        suggestion: `Enable recipe that can ${AUTOMATION_ACTION_LABELS[actionId]}`,
        confidence: "review_recommended",
        reason:
          "This recipe can affect money, maintenance, or freight. Alph will still require human approval before critical execution.",
        dataUsed: ["AI Automation Center", AUTOMATION_ACTION_LABELS[actionId]],
        source: "platform-automation",
        onConfirm: () => {
          setRecipeEnabled(recipeId, true);
          setTick((n) => n + 1);
        },
      });
      if (!gate.executed) {
        setBlockMessage(gate.reason);
      }
      return;
    }

    setRecipeEnabled(recipeId, true);
    appendAiAudit({
      actionKind: kind,
      aiAction: "Enable automation recipe",
      suggestion: AUTOMATION_ACTION_LABELS[actionId],
      approval: "not_required",
      source: "platform-automation",
    });
    setTick((n) => n + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-[14px] text-[#6B7280]">
          No-code step builder: pick a trigger, pick an action, save. Enable or disable anytime.
          Critical actions never run Fully Automated without your approval.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href={AI_POLICY_SETTINGS_HREF} className="transpo-btn-secondary">
            AI preferences
          </Link>
          <Link href="/workflows" className="transpo-btn-secondary">
            Open Workflows
          </Link>
        </div>
      </div>

      <section className="rounded-[16px] bg-white p-5 shadow-[inset_0_0_0_1px_#EEF2F7]">
        <h2 className="text-[16px] font-semibold text-[#111827]">
          Automation level
        </h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Company preference for Alph Copilot™ and Automation Center.
        </p>
        <div className="mt-4">
          <AiAutomationLevelSelect
            value={level}
            onChange={(next) => {
              setLevel(next);
              saveAiSafetySettings({ automationLevel: next });
              appendAiAudit({
                actionKind: "enable_full_automation",
                aiAction: "Update automation level",
                suggestion: next,
                approval: "approved",
                reason: "Company preference saved",
                source: "platform-automation",
                newValue: next,
              });
            }}
          />
        </div>
        <div className="mt-4">
          <AiPolicyNotice variant="assist" />
        </div>
      </section>

      <section className="rounded-[16px] bg-[#F8F9FB] p-5">
        <h2 className="text-[16px] font-semibold text-[#111827]">Build a recipe</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <label className="block">
            <span className="text-[13px] font-medium text-[#64748B]">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 h-10 w-full rounded-[12px] bg-white px-3 text-[14px] shadow-[inset_0_0_0_1px_#E5E7EB]"
            />
          </label>
          <label className="block">
            <span className="text-[13px] font-medium text-[#64748B]">Description</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 h-10 w-full rounded-[12px] bg-white px-3 text-[14px] shadow-[inset_0_0_0_1px_#E5E7EB]"
              placeholder="What should happen?"
            />
          </label>
          <label className="block">
            <span className="text-[13px] font-medium text-[#64748B]">Trigger</span>
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value as AutomationTriggerId)}
              className="mt-1 h-10 w-full rounded-[12px] bg-white px-3 text-[14px] shadow-[inset_0_0_0_1px_#E5E7EB]"
            >
              {TRIGGERS.map((t) => (
                <option key={t} value={t}>
                  {AUTOMATION_TRIGGER_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[13px] font-medium text-[#64748B]">Action</span>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as AutomationActionId)}
              className="mt-1 h-10 w-full rounded-[12px] bg-white px-3 text-[14px] shadow-[inset_0_0_0_1px_#E5E7EB]"
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {AUTOMATION_ACTION_LABELS[a]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {!fullCheck.allowed ? (
          <p className="mt-3 text-[13px] text-[#EA580C]">{fullCheck.reason}</p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="rounded-[12px] bg-white px-3 py-2 text-[13px] font-medium text-[#334155]">
            {AUTOMATION_TRIGGER_LABELS[trigger]}
          </div>
          <span className="text-[13px] text-[#94A3B8]">→</span>
          <div className="rounded-[12px] bg-white px-3 py-2 text-[13px] font-medium text-[#334155]">
            {AUTOMATION_ACTION_LABELS[action]}
          </div>
          <button
            type="button"
            className="transpo-btn-primary ml-auto"
            onClick={() => {
              saveAutomationRecipe({ name, description, trigger, action });
              setTick((n) => n + 1);
            }}
          >
            Save recipe
          </button>
        </div>
      </section>

      {blockMessage ? (
        <p className="rounded-[12px] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#DC2626]">
          {blockMessage}
        </p>
      ) : null}

      <section>
        <h2 className="text-[16px] font-semibold text-[#111827]">Saved recipes</h2>
        {recipes.length === 0 ? (
          <EmptyState
            className="mt-3"
            title="No recipes yet"
            description="Save a trigger → action pair to get started."
          />
        ) : (
          <ul className="mt-3 space-y-2">
            {recipes.map((recipe) => (
              <li
                key={recipe.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-white px-4 py-4 shadow-[inset_0_0_0_1px_#EEF2F7]"
              >
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-[#111827]">{recipe.name}</p>
                  <p className="mt-1 text-[13px] text-[#6B7280]">{recipe.description}</p>
                  <p className="mt-2 text-[13px] font-medium text-[#334155]">
                    {AUTOMATION_TRIGGER_LABELS[recipe.trigger]} →{" "}
                    {AUTOMATION_ACTION_LABELS[recipe.action]}
                  </p>
                  {isCriticalAiAction(automationActionToKind(recipe.action)) ? (
                    <p className="mt-1 text-[12px] font-medium text-[#EA580C]">
                      Critical — human approval required
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                      recipe.enabled
                        ? `${TRANSPO_COLORS.success.bg} ${TRANSPO_COLORS.success.text}`
                        : `${TRANSPO_COLORS.disabled.bg} ${TRANSPO_COLORS.disabled.text}`
                    }`}
                  >
                    {recipe.enabled ? "Enabled" : "Disabled"}
                  </span>
                  <button
                    type="button"
                    className="transpo-btn-secondary"
                    onClick={() => {
                      void handleEnable(recipe.id, !recipe.enabled, recipe.action);
                    }}
                  >
                    {recipe.enabled ? "Disable" : "Enable"}
                  </button>
                  {recipe.linkedWorkflowHref ? (
                    <Link href={recipe.linkedWorkflowHref} className="transpo-btn-secondary">
                      Open linked
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
