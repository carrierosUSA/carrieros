"use client";

import { useCallback, useMemo, useState } from "react";
import {
  SmartFormField,
  SmartFormSection,
  SmartSelectField,
} from "@/components/forms/SmartFormField";
import {
  emptySmartLoadFormDefaults,
  filterLaneSuggestions,
  getBrokerAutofill,
  getTemperatureForEquipment,
  type LaneSuggestion,
  type SmartLoadFormContext,
  type SmartLoadFormDefaults,
} from "@/lib/forms/smart-load-intelligence";
import type { Broker, Customer, Driver, Load, Trailer, Truck } from "@/lib/types";
import { LOAD_STATUSES, LOAD_STATUS_LABELS } from "@/lib/types";

type SmartLoadFormProps = {
  action: (formData: FormData) => Promise<void>;
  customers: Customer[];
  brokers: Broker[];
  drivers: Driver[];
  trucks: Truck[];
  trailers: Trailer[];
  smartContext: SmartLoadFormContext;
  initialValues?: SmartLoadFormDefaults;
  load?: Load;
  submitLabel: string;
  includeStatus?: boolean;
};

const EQUIPMENT_OPTIONS = [
  { value: "Dry Van", label: "Dry Van" },
  { value: "Reefer", label: "Reefer" },
  { value: "Flatbed", label: "Flatbed" },
  { value: "Step Deck", label: "Step Deck" },
];

function toDateTimeLocalValue(value: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function markFields(...fields: string[]) {
  return new Set(fields);
}

export default function SmartLoadForm({
  action,
  customers,
  brokers,
  drivers,
  trucks,
  trailers,
  smartContext,
  initialValues,
  submitLabel,
  includeStatus = false,
}: SmartLoadFormProps) {
  const [values, setValues] = useState<SmartLoadFormDefaults>(
    initialValues ?? emptySmartLoadFormDefaults(),
  );
  const [autoFilled, setAutoFilled] = useState<Set<string>>(new Set());

  const updateField = useCallback((field: keyof SmartLoadFormDefaults, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setAutoFilled((current) => {
      const next = new Set(current);
      next.delete(field);
      return next;
    });
  }, []);

  const applyAutofill = useCallback(
    (patch: Partial<SmartLoadFormDefaults>, fields: Set<string>) => {
      setValues((current) => ({ ...current, ...patch }));
      setAutoFilled((current) => new Set([...current, ...fields]));
    },
    [],
  );

  const laneSuggestions = useMemo(
    () =>
      filterLaneSuggestions(
        smartContext,
        values.customerId || undefined,
        values.brokerId || undefined,
      ),
    [smartContext, values.brokerId, values.customerId],
  );

  function handleBrokerChange(brokerId: string) {
    updateField("brokerId", brokerId);

    const profile = getBrokerAutofill(smartContext, brokerId);

    if (profile) {
      applyAutofill(
        {
          brokerContactName: profile.dispatcherName,
          brokerPhone: profile.phone,
          brokerEmail: profile.email,
          paymentTerms: profile.paymentTerms,
        },
        markFields("brokerContactName", "brokerPhone", "brokerEmail", "paymentTerms"),
      );
    }
  }

  function handleCustomerChange(customerId: string) {
    updateField("customerId", customerId);

    const pickup = smartContext.pickupContacts[customerId];
    const delivery = smartContext.deliveryContacts[customerId];
    const patch: Partial<SmartLoadFormDefaults> = {};
    const fields = new Set<string>();

    if (pickup) {
      patch.originCompany = pickup.company;
      patch.originContactName = pickup.contactName;
      patch.originPhone = pickup.phone;
      patch.originEmail = pickup.email;
      fields.add("originCompany");
      fields.add("originContactName");
      fields.add("originPhone");
      fields.add("originEmail");
    }

    if (delivery) {
      patch.destinationCompany = delivery.company;
      patch.destinationContactName = delivery.contactName;
      patch.destinationPhone = delivery.phone;
      patch.destinationEmail = delivery.email;
      fields.add("destinationCompany");
      fields.add("destinationContactName");
      fields.add("destinationPhone");
      fields.add("destinationEmail");
    }

    if (customerId === "customer-gulf-foods") {
      patch.equipmentType = "Reefer";
      patch.temperature = getTemperatureForEquipment(smartContext, "Reefer");
      fields.add("equipmentType");
      fields.add("temperature");
    }

    if (fields.size > 0) {
      applyAutofill(patch, fields);
    }
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
    const fields = markFields("truckId", "trailerId", "equipmentType");

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
      markFields("temperature"),
    );
  }

  function applyLaneSuggestion(lane: LaneSuggestion) {
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

    handleCustomerChange(lane.customerId);
  }

  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: customer.name,
  }));

  const brokerOptions = [
    { value: "", label: "Direct (no broker)" },
    ...brokers.map((broker) => ({
      value: broker.id,
      label: broker.name,
    })),
  ];

  const driverOptions = [
    { value: "", label: "Assign later" },
    ...drivers.map((driver) => ({
      value: driver.id,
      label: driver.name,
    })),
  ];

  const truckOptions = [
    { value: "", label: "Select truck" },
    ...trucks.map((truck) => ({
      value: truck.id,
      label: `Unit ${truck.unitNumber}`,
    })),
  ];

  const trailerOptions = [
    { value: "", label: "Auto from truck" },
    ...trailers.map((trailer) => ({
      value: trailer.id,
      label: `TRL-${trailer.unitNumber} · ${trailer.type.replaceAll("_", " ")}`,
    })),
  ];

  const statusOptions = LOAD_STATUSES.map((status) => ({
    value: status,
    label: LOAD_STATUS_LABELS[status],
  }));

  const selectedTrailerLabel = trailers.find((trailer) => trailer.id === values.trailerId);

  return (
    <form action={action} className="grid gap-5">
      {laneSuggestions.length > 0 ? (
        <section className="rounded-[16px] border border-[#BFDBFE] bg-[#EFF6FF] p-5">
          <div className="mb-3">
            <h2 className="text-[16px] font-semibold text-[#1E3A8A]">Previous lanes</h2>
            <p className="mt-1 text-[13px] text-[#2563EB]">
              Tap a lane to auto-fill customer, stops, rate, and miles.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {laneSuggestions.map((lane) => (
              <button
                key={lane.id}
                type="button"
                onClick={() => applyLaneSuggestion(lane)}
                className="rounded-full border border-[#BFDBFE] bg-white px-3.5 py-2 text-left text-[13px] font-medium text-slate-800 transition hover:border-[#2563EB] hover:shadow-sm"
              >
                <span className="block">{lane.label}</span>
                <span className="mt-0.5 block text-[11px] font-normal text-slate-500">
                  ${lane.rate.toLocaleString()} · {lane.miles} mi · used {lane.count}×
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <SmartFormSection
        title="Load details"
        description="Customer, broker, schedule, and payment."
      >
        <SmartSelectField
          label="Customer"
          name="customerId"
          value={values.customerId}
          onChange={handleCustomerChange}
          options={customerOptions}
          placeholder="Select customer"
          required
          autoFilled={autoFilled.has("customerId")}
        />
        <SmartSelectField
          label="Broker"
          name="brokerId"
          value={values.brokerId}
          onChange={handleBrokerChange}
          options={brokerOptions}
          autoFilled={autoFilled.has("brokerId")}
        />
        <SmartFormField
          label="Pickup Date"
          name="pickupDate"
          type="date"
          value={values.pickupDate}
          onChange={(value) => updateField("pickupDate", value)}
          required
        />
        <SmartFormField
          label="Delivery Date"
          name="deliveryDate"
          type="date"
          value={values.deliveryDate}
          onChange={(value) => updateField("deliveryDate", value)}
          required
        />
        <SmartFormField
          label="Rate (USD)"
          name="rate"
          type="number"
          min="0"
          step="1"
          value={values.rate}
          onChange={(value) => updateField("rate", value)}
          required
          autoFilled={autoFilled.has("rate")}
        />
        <SmartFormField
          label="Miles"
          name="miles"
          type="number"
          min="0"
          step="1"
          value={values.miles}
          onChange={(value) => updateField("miles", value)}
          required
          autoFilled={autoFilled.has("miles")}
        />
        <SmartSelectField
          label="Equipment"
          name="equipmentType"
          value={values.equipmentType}
          onChange={handleEquipmentChange}
          options={EQUIPMENT_OPTIONS}
          autoFilled={autoFilled.has("equipmentType")}
        />
        <SmartFormField
          label="Temperature"
          name="temperature"
          value={values.temperature}
          onChange={(value) => updateField("temperature", value)}
          placeholder="Auto from equipment"
          autoFilled={autoFilled.has("temperature")}
        />
        <SmartFormField
          label="Payment Terms"
          name="paymentTerms"
          value={values.paymentTerms}
          onChange={(value) => updateField("paymentTerms", value)}
          placeholder="Net 30, Quick Pay..."
          autoFilled={autoFilled.has("paymentTerms")}
        />
        {includeStatus ? (
          <SmartSelectField
            label="Status"
            name="status"
            value={values.status}
            onChange={(value) => updateField("status", value)}
            options={statusOptions}
            required
          />
        ) : null}
      </SmartFormSection>

      <SmartFormSection
        title="Broker contact"
        description="Auto-filled when you select a saved broker."
      >
        <SmartFormField
          label="Dispatcher"
          name="brokerContactName"
          value={values.brokerContactName}
          onChange={(value) => updateField("brokerContactName", value)}
          autoFilled={autoFilled.has("brokerContactName")}
        />
        <SmartFormField
          label="Phone"
          name="brokerPhone"
          value={values.brokerPhone}
          onChange={(value) => updateField("brokerPhone", value)}
          autoFilled={autoFilled.has("brokerPhone")}
        />
        <SmartFormField
          label="Email"
          name="brokerEmail"
          type="email"
          value={values.brokerEmail}
          onChange={(value) => updateField("brokerEmail", value)}
          autoFilled={autoFilled.has("brokerEmail")}
        />
      </SmartFormSection>

      <SmartFormSection
        title="Pickup stop"
        description="Location and previously used contact details."
      >
        <SmartFormField
          label="City"
          name="originCity"
          value={values.originCity}
          onChange={(value) => updateField("originCity", value)}
          placeholder="San Antonio"
          required
          autoFilled={autoFilled.has("originCity")}
        />
        <SmartFormField
          label="State"
          name="originState"
          value={values.originState}
          onChange={(value) => updateField("originState", value)}
          placeholder="TX"
          required
          autoFilled={autoFilled.has("originState")}
        />
        <SmartFormField
          label="Scheduled At"
          name="originScheduledAt"
          type="datetime-local"
          value={toDateTimeLocalValue(values.originScheduledAt)}
          onChange={(value) =>
            updateField(
              "originScheduledAt",
              value ? new Date(value).toISOString() : "",
            )
          }
        />
        <SmartFormField
          label="Company"
          name="originCompany"
          value={values.originCompany}
          onChange={(value) => updateField("originCompany", value)}
          autoFilled={autoFilled.has("originCompany")}
        />
        <SmartFormField
          label="Contact Name"
          name="originContactName"
          value={values.originContactName}
          onChange={(value) => updateField("originContactName", value)}
          autoFilled={autoFilled.has("originContactName")}
        />
        <SmartFormField
          label="Phone"
          name="originPhone"
          value={values.originPhone}
          onChange={(value) => updateField("originPhone", value)}
          autoFilled={autoFilled.has("originPhone")}
        />
        <SmartFormField
          label="Email"
          name="originEmail"
          type="email"
          value={values.originEmail}
          onChange={(value) => updateField("originEmail", value)}
          autoFilled={autoFilled.has("originEmail")}
        />
      </SmartFormSection>

      <SmartFormSection
        title="Delivery stop"
        description="Location and previously used contact details."
      >
        <SmartFormField
          label="City"
          name="destinationCity"
          value={values.destinationCity}
          onChange={(value) => updateField("destinationCity", value)}
          required
          autoFilled={autoFilled.has("destinationCity")}
        />
        <SmartFormField
          label="State"
          name="destinationState"
          value={values.destinationState}
          onChange={(value) => updateField("destinationState", value)}
          required
          autoFilled={autoFilled.has("destinationState")}
        />
        <SmartFormField
          label="Scheduled At"
          name="destinationScheduledAt"
          type="datetime-local"
          value={toDateTimeLocalValue(values.destinationScheduledAt)}
          onChange={(value) =>
            updateField(
              "destinationScheduledAt",
              value ? new Date(value).toISOString() : "",
            )
          }
        />
        <SmartFormField
          label="Company"
          name="destinationCompany"
          value={values.destinationCompany}
          onChange={(value) => updateField("destinationCompany", value)}
          autoFilled={autoFilled.has("destinationCompany")}
        />
        <SmartFormField
          label="Contact Name"
          name="destinationContactName"
          value={values.destinationContactName}
          onChange={(value) => updateField("destinationContactName", value)}
          autoFilled={autoFilled.has("destinationContactName")}
        />
        <SmartFormField
          label="Phone"
          name="destinationPhone"
          value={values.destinationPhone}
          onChange={(value) => updateField("destinationPhone", value)}
          autoFilled={autoFilled.has("destinationPhone")}
        />
        <SmartFormField
          label="Email"
          name="destinationEmail"
          type="email"
          value={values.destinationEmail}
          onChange={(value) => updateField("destinationEmail", value)}
          autoFilled={autoFilled.has("destinationEmail")}
        />
      </SmartFormSection>

      <SmartFormSection
        title="Dispatch assignment"
        description="Select a driver to auto-fill truck and trailer."
      >
        <SmartSelectField
          label="Driver"
          name="driverId"
          value={values.driverId}
          onChange={handleDriverChange}
          options={driverOptions}
          autoFilled={autoFilled.has("driverId")}
        />
        <SmartSelectField
          label="Truck"
          name="truckId"
          value={values.truckId}
          onChange={(value) => updateField("truckId", value)}
          options={truckOptions}
          autoFilled={autoFilled.has("truckId")}
        />
        <SmartSelectField
          label="Trailer"
          name="trailerId"
          value={values.trailerId}
          onChange={(value) => updateField("trailerId", value)}
          options={trailerOptions}
          autoFilled={autoFilled.has("trailerId")}
        />
        {selectedTrailerLabel ? (
          <div className="md:col-span-2">
            <p className="text-[13px] text-slate-500">
              Linked equipment:{" "}
              <span className="font-semibold text-slate-800">
                TRL-{selectedTrailerLabel.unitNumber} · {selectedTrailerLabel.type}
              </span>
            </p>
          </div>
        ) : null}
      </SmartFormSection>

      <div className="flex items-center justify-between rounded-[16px] border border-[#EAEAEA] bg-white px-5 py-4 shadow-sm">
        <p className="text-[13px] text-slate-500">
          Smart forms reduce typing — most fields auto-fill from history.
        </p>
        <button
          type="submit"
          className="rounded-xl bg-[#2563EB] px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
