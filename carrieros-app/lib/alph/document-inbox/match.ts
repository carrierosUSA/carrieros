import { getBrokerById, listBrokersByTenant } from "@/lib/data/brokers";
import { getDriverById } from "@/lib/data/drivers";
import { getLoadService } from "@/lib/services/loads";
import { getTruckById } from "@/lib/data/trucks";
import type { AlphOcrExtractResult } from "@/lib/alph/ocr/types";
import { fieldValue } from "@/lib/alph/ocr/demo";

export type EntityMatchResult = {
  loadId?: string;
  driverId?: string;
  truckId?: string;
  brokerId?: string;
  issues: string[];
};

export async function matchExtractedEntities(
  tenantId: string,
  extraction: AlphOcrExtractResult,
): Promise<EntityMatchResult> {
  const issues: string[] = [];
  let loadId = extraction.suggestedLinks.loadId;
  let driverId = extraction.suggestedLinks.driverId;
  let truckId = extraction.suggestedLinks.truckId;
  let brokerId = extraction.suggestedLinks.brokerId;

  const loadNumber =
    extraction.loadNumber ?? fieldValue(extraction.fields, "loadNumber");

  if (loadNumber && loadNumber !== "LD-NEW") {
    const loads = await getLoadService().listLoads(tenantId, {
      search: loadNumber,
    });
    const exact = loads.find(
      (l) =>
        l.reference === loadNumber ||
        l.loadNumber === loadNumber ||
        l.id === loadId,
    );
    if (exact) {
      loadId = exact.id;
    } else if (loadId) {
      const byId = await getLoadService().getLoad(tenantId, loadId);
      if (!byId) {
        issues.push(`Suggested load ${loadId} not found for this tenant.`);
        loadId = undefined;
      }
    } else {
      issues.push(`No load matched for ${loadNumber}.`);
    }
  }

  if (brokerId) {
    const broker = getBrokerById(brokerId);
    if (!broker || broker.tenantId !== tenantId) {
      issues.push("Broker match is outside tenant — cleared.");
      brokerId = undefined;
    }
  } else {
    const brokerName = fieldValue(extraction.fields, "broker");
    if (brokerName) {
      const brokers = listBrokersByTenant(tenantId);
      const hit = brokers.find((b) =>
        b.name.toLowerCase().includes(brokerName.toLowerCase().slice(0, 8)),
      );
      if (hit) brokerId = hit.id;
    }
  }

  if (driverId) {
    const driver = getDriverById(driverId);
    if (!driver || driver.tenantId !== tenantId) {
      issues.push("Driver match is outside tenant — cleared.");
      driverId = undefined;
    }
  }

  if (truckId) {
    const truck = getTruckById(truckId);
    if (!truck || truck.tenantId !== tenantId) {
      issues.push("Truck match is outside tenant — cleared.");
      truckId = undefined;
    }
  }

  if (
    extraction.category === "pod" &&
    !loadId
  ) {
    issues.push("POD requires a matched load before invoicing.");
  }

  return { loadId, driverId, truckId, brokerId, issues };
}
