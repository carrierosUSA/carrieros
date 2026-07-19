"use client";

import SearchCombobox from "@/components/ui/SearchCombobox";
import NewLoadSectionCard from "@/components/loads/new/NewLoadSectionCard";
import type { SmartLoadFormDefaults } from "@/lib/forms/smart-load-intelligence";
import type { Driver, Trailer, Truck } from "@/lib/types";

type NewLoadAssignSectionProps = {
  values: SmartLoadFormDefaults;
  drivers: Driver[];
  trucks: Truck[];
  trailers: Trailer[];
  autoFilled: Set<string>;
  onDriverChange: (driverId: string) => void;
  onFieldChange: (field: keyof SmartLoadFormDefaults, value: string) => void;
};

export default function NewLoadAssignSection({
  values,
  drivers,
  trucks,
  trailers,
  autoFilled,
  onDriverChange,
  onFieldChange,
}: NewLoadAssignSectionProps) {
  const driverOptions = [
    { value: "", label: "Assign later" },
    ...drivers.map((driver) => ({
      value: driver.id,
      label: driver.name,
      description: driver.phone,
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
      label: `TRL-${trailer.unitNumber}`,
      description: trailer.type.replaceAll("_", " "),
    })),
  ];

  const selectedTrailer = trailers.find((trailer) => trailer.id === values.trailerId);

  return (
    <NewLoadSectionCard
      title="Assign"
      description="Pick a driver — truck and trailer suggest automatically."
    >
      <div className="sm:col-span-2">
        <SearchCombobox
          label="Driver"
          name="driverId"
          value={values.driverId}
          onChange={onDriverChange}
          options={driverOptions}
          placeholder="Search drivers…"
          autoFilled={autoFilled.has("driverId")}
        />
      </div>
      <SearchCombobox
        label="Truck"
        name="truckId"
        value={values.truckId}
        onChange={(value) => onFieldChange("truckId", value)}
        options={truckOptions}
        placeholder="Search trucks…"
        autoFilled={autoFilled.has("truckId")}
      />
      <SearchCombobox
        label="Trailer"
        name="trailerId"
        value={values.trailerId}
        onChange={(value) => onFieldChange("trailerId", value)}
        options={trailerOptions}
        placeholder="Search trailers…"
        autoFilled={autoFilled.has("trailerId")}
      />
      {selectedTrailer ? (
        <p className="sm:col-span-2 text-[13px] text-slate-500">
          Linked equipment:{" "}
          <span className="font-semibold text-slate-800">
            TRL-{selectedTrailer.unitNumber} · {selectedTrailer.type}
          </span>
        </p>
      ) : null}
    </NewLoadSectionCard>
  );
}
