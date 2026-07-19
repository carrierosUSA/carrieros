"use client";

import { useCallback, useMemo, useState, useTransition, type FormEvent } from "react";
import NewLoadAlphSection from "@/components/loads/new/NewLoadAlphSection";
import NewLoadAssignSection from "@/components/loads/new/NewLoadAssignSection";
import NewLoadBrokerSection from "@/components/loads/new/NewLoadBrokerSection";
import NewLoadDetailsSection from "@/components/loads/new/NewLoadDetailsSection";
import NewLoadDocumentsSection, {
  type UploadedFile,
} from "@/components/loads/new/NewLoadDocumentsSection";
import NewLoadStickyBar from "@/components/loads/new/NewLoadStickyBar";
import NewLoadStopSection from "@/components/loads/new/NewLoadStopSection";
import { useNewLoadDraft } from "@/hooks/useNewLoadDraft";
import {
  applyExtractionToForm,
  extractRateConfirmation,
  type RateConExtractionResult,
} from "@/lib/forms/rate-con-extraction";
import {
  emptySmartLoadFormDefaults,
  filterLaneSuggestions,
  getBrokerAutofill,
  getDefaultCustomerForBroker,
  getTemperatureForEquipment,
  type SmartLoadFormContext,
  type SmartLoadFormDefaults,
} from "@/lib/forms/smart-load-intelligence";
import type { Broker, Customer, Driver, Trailer, Truck } from "@/lib/types";

type NewLoadFormProps = {
  action: (formData: FormData) => Promise<void>;
  customers: Customer[];
  brokers: Broker[];
  drivers: Driver[];
  trucks: Truck[];
  trailers: Trailer[];
  smartContext: SmartLoadFormContext;
};

function markFields(...fields: string[]) {
  return new Set(fields);
}

export default function NewLoadForm({
  action,
  customers,
  brokers,
  drivers,
  trucks,
  trailers,
  smartContext,
}: NewLoadFormProps) {
  const defaultCustomerId = customers[0]?.id ?? "";
  const initialValues = useMemo(
    () => ({
      ...emptySmartLoadFormDefaults(),
      customerId: defaultCustomerId,
    }),
    [defaultCustomerId],
  );

  const { values, setValues, draftStatus, clearDraft } = useNewLoadDraft(initialValues);
  const [autoFilled, setAutoFilled] = useState<Set<string>>(new Set());
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [alphStatus, setAlphStatus] = useState<"idle" | "processing" | "ready" | "error">("idle");
  const [extraction, setExtraction] = useState<RateConExtractionResult | null>(null);
  const [alphError, setAlphError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const laneSuggestions = useMemo(
    () =>
      filterLaneSuggestions(
        smartContext,
        values.customerId || undefined,
        values.brokerId || undefined,
      ),
    [smartContext, values.brokerId, values.customerId],
  );

  const updateField = useCallback(
    (field: keyof SmartLoadFormDefaults, value: string) => {
      setValues((current) => ({ ...current, [field]: value }));
      setAutoFilled((current) => {
        const next = new Set(current);
        next.delete(field);
        return next;
      });
    },
    [setValues],
  );

  const applyAutofill = useCallback(
    (patch: Partial<SmartLoadFormDefaults>, fields: Set<string>) => {
      setValues((current) => ({ ...current, ...patch }));
      setAutoFilled((current) => new Set([...current, ...fields]));
    },
    [setValues],
  );

  function handleBrokerChange(brokerId: string) {
    updateField("brokerId", brokerId);

    const profile = getBrokerAutofill(smartContext, brokerId);
    const patch: Partial<SmartLoadFormDefaults> = {};
    const fields = markFields("brokerId");

    if (profile) {
      patch.brokerContactName = profile.dispatcherName;
      patch.brokerPhone = profile.phone;
      patch.brokerEmail = profile.email;
      patch.paymentTerms = profile.paymentTerms;
      fields.add("brokerContactName");
      fields.add("brokerPhone");
      fields.add("brokerEmail");
      fields.add("paymentTerms");
    }

    const customerId = getDefaultCustomerForBroker(smartContext, brokerId) ?? defaultCustomerId;
    if (customerId) {
      patch.customerId = customerId;
      fields.add("customerId");
    }

    applyAutofill(patch, fields);
  }

  function handleDriverChange(driverId: string) {
    updateField("driverId", driverId);

    const equipment = smartContext.driverEquipment[driverId];
    if (!equipment) {
      return;
    }

    const patch: Partial<SmartLoadFormDefaults> = {
      truckId: equipment.truckId ?? "",
      trailerId: equipment.trailerId ?? "",
      equipmentType: equipment.equipmentType ?? values.equipmentType,
    };
    const fields = markFields("truckId", "trailerId", "equipmentType", "driverId");

    if (patch.equipmentType) {
      patch.temperature = getTemperatureForEquipment(smartContext, patch.equipmentType);
      fields.add("temperature");
    }

    applyAutofill(patch, fields);
  }

  function handleEquipmentChange(equipmentType: string) {
    updateField("equipmentType", equipmentType);
    applyAutofill(
      { temperature: getTemperatureForEquipment(smartContext, equipmentType) },
      markFields("temperature", "equipmentType"),
    );
  }

  function applyLaneSuggestion(lane: (typeof laneSuggestions)[number]) {
    applyAutofill(
      {
        customerId: lane.customerId,
        brokerId: lane.brokerId ?? "",
        originCity: lane.originCity,
        originState: lane.originState,
        destinationCity: lane.destinationCity,
        destinationState: lane.destinationState,
        miles: String(lane.miles),
        rate: String(lane.rate),
        equipmentType: lane.equipmentType,
        temperature: getTemperatureForEquipment(smartContext, lane.equipmentType),
      },
      markFields(
        "customerId",
        "brokerId",
        "originCity",
        "originState",
        "destinationCity",
        "destinationState",
        "miles",
        "rate",
        "equipmentType",
        "temperature",
      ),
    );

    if (lane.brokerId) {
      handleBrokerChange(lane.brokerId);
    }
  }

  async function handleFileUpload(file: File, kind: UploadedFile["kind"]) {
    setFiles((current) => [
      ...current,
      { id: `${kind}-${Date.now()}`, name: file.name, kind },
    ]);

    if (kind !== "rate-con") {
      return;
    }

    setAlphStatus("processing");
    setAlphError(undefined);

    try {
      const result = await extractRateConfirmation(file);
      setExtraction(result);
      setAlphStatus("ready");
    } catch (error) {
      setAlphStatus("error");
      setAlphError(error instanceof Error ? error.message : "Extraction failed.");
    }
  }

  function handleApplyExtraction() {
    if (!extraction) {
      return;
    }

    const patch = applyExtractionToForm(extraction);
    const fields = new Set(Object.keys(patch));
    applyAutofill(patch, fields);

    if (patch.brokerId) {
      handleBrokerChange(patch.brokerId);
    }

    setAlphStatus("idle");
    setExtraction(null);
  }

  function handleSaveDraft() {
    setValues((current) => current);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (!values.customerId && defaultCustomerId) {
      formData.set("customerId", defaultCustomerId);
    }

    formData.set("pickupDate", values.pickupDate || values.originDate);
    formData.set("deliveryDate", values.deliveryDate || values.destinationDate);

    startTransition(async () => {
      await action(formData);
      clearDraft();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="pb-24">
      <input type="hidden" name="customerId" value={values.customerId || defaultCustomerId} />

      {laneSuggestions.length > 0 ? (
        <section className="mb-4 rounded-[16px] border border-[#BFDBFE] bg-[#EFF6FF] p-4">
          <h2 className="text-[14px] font-semibold text-[#1E3A8A]">Previous lanes</h2>
          <p className="mt-0.5 text-[13px] text-[#2563EB]">
            One tap to fill broker, stops, rate, and miles.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {laneSuggestions.slice(0, 4).map((lane) => (
              <button
                key={lane.id}
                type="button"
                onClick={() => applyLaneSuggestion(lane)}
                className="rounded-full border border-[#BFDBFE] bg-white px-3 py-1.5 text-[13px] font-medium text-slate-800 transition hover:border-[#2563EB]"
              >
                {lane.label}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <NewLoadBrokerSection
            values={values}
            brokers={brokers}
            autoFilled={autoFilled}
            onBrokerChange={handleBrokerChange}
            onFieldChange={updateField}
          />
          <NewLoadStopSection
            title="Pickup"
            prefix="origin"
            values={values}
            autoFilled={autoFilled}
            onFieldChange={updateField}
            onApplyAutofill={applyAutofill}
          />
          <NewLoadStopSection
            title="Delivery"
            prefix="destination"
            values={values}
            autoFilled={autoFilled}
            onFieldChange={updateField}
            onApplyAutofill={applyAutofill}
          />
        </div>

        <div className="space-y-4">
          <NewLoadDetailsSection
            values={values}
            autoFilled={autoFilled}
            onFieldChange={updateField}
            onEquipmentChange={handleEquipmentChange}
          />
          <NewLoadAssignSection
            values={values}
            drivers={drivers}
            trucks={trucks}
            trailers={trailers}
            autoFilled={autoFilled}
            onDriverChange={handleDriverChange}
            onFieldChange={updateField}
          />
          <NewLoadDocumentsSection files={files} onUpload={handleFileUpload} />
          <NewLoadAlphSection
            status={alphStatus}
            extraction={extraction}
            errorMessage={alphError}
            onApply={handleApplyExtraction}
            onDismiss={() => {
              setAlphStatus("idle");
              setExtraction(null);
            }}
          />
        </div>
      </div>

      <NewLoadStickyBar
        draftStatus={draftStatus}
        onSaveDraft={handleSaveDraft}
        isSubmitting={isPending}
      />
    </form>
  );
}
