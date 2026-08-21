import "server-only";
import { getSupabaseAuthenticatedUserClient } from "@/lib/supabase/server";
import type { LoadStatus } from "@/lib/types/load";
import type { AssignableDriver, ClosureDocumentCandidate, DispatchBoardLoad, DispatchPriority, LoadClosureReadiness, LoadDetail, LoadStopDetail, LoadTimelineEvent } from "@/lib/operations/load-types";

type Row = Record<string, unknown>;
const row = (value: unknown): Row | null => value && typeof value === "object" ? value as Row : null;
const rows = (value: unknown): Row[] => Array.isArray(value) ? value.flatMap((entry) => row(entry) ? [entry as Row] : []) : [];
const text = (value: unknown): string => typeof value === "string" ? value : "";
const optionalText = (value: unknown): string | undefined => text(value) || undefined;
function numberValue(value: unknown): number | undefined { const result = typeof value === "number" ? value : Number(value); return Number.isFinite(result) ? result : undefined; }
function loadStatus(value: unknown): LoadStatus { const candidate = text(value) as LoadStatus; const statuses: LoadStatus[] = ["pending","dispatched","en_route_to_pickup","arrived_pickup","picked_up","in_transit","arrived_delivery","delivered","closed","cancelled"]; return statuses.includes(candidate) ? candidate : "pending"; }
const priority = (value: unknown): DispatchPriority => value === "red" || value === "amber" ? value : "green";
function stopLabel(value: Row | undefined): string | undefined { return value ? [text(value.city), text(value.state)].filter(Boolean).join(", ") || undefined : undefined; }

export class LoadOperationsRepository {
  async getClosureWorkspace(input: { accessToken: string; loadId: string }): Promise<{ documents: ClosureDocumentCandidate[]; readiness: LoadClosureReadiness }> {
    const db = getSupabaseAuthenticatedUserClient(input.accessToken);
    const [documentsResult, readinessResult] = await Promise.all([
      db.rpc("list_verified_closure_documents", { p_load_id: input.loadId }),
      db.rpc("get_load_closure_readiness", { p_load_id: input.loadId }),
    ]);
    if (documentsResult.error || readinessResult.error) throw new Error("Closure verification is not available.");
    const documents = rows(documentsResult.data).flatMap((entry): ClosureDocumentCandidate[] => {
      const id = text(entry.document_id);
      const documentType = text(entry.document_type);
      if (!id || (documentType !== "pod" && documentType !== "invoice")) return [];
      return [{ id, title: text(entry.title) || "Verified document", documentType }];
    });
    const readinessRow = rows(readinessResult.data)[0] ?? row(readinessResult.data) ?? {};
    return {
      documents,
      readiness: {
        hasVerifiedPod: readinessRow.has_verified_pod === true,
        hasVerifiedInvoice: readinessRow.has_verified_invoice === true,
        readyToClose: readinessRow.ready_to_close === true,
      },
    };
  }

  async listCompanyDrivers(input: { accessToken: string }): Promise<AssignableDriver[]> {
    const db = getSupabaseAuthenticatedUserClient(input.accessToken);
    const result = await db.rpc("list_assignable_company_drivers");
    if (result.error) throw new Error("Verified driver accounts are not available.");
    return rows(result.data).flatMap((entry) => {
      const userId = text(entry.user_id);
      const displayName = text(entry.display_name);
      return userId && displayName ? [{ userId, displayName }] : [];
    });
  }

  async findBySourceDocuments(input: {
    companyId: string;
    accessToken: string;
    documentIds: string[];
  }): Promise<Map<string, string>> {
    if (!input.documentIds.length) return new Map();
    const db = getSupabaseAuthenticatedUserClient(input.accessToken);
    const result = await db
      .from("loads")
      .select("id,source_document_id")
      .eq("company_id", input.companyId)
      .in("source_document_id", input.documentIds);
    if (result.error) throw new Error("Load-document links are not available.");
    return new Map(
      rows(result.data).flatMap((entry) => {
        const documentId = text(entry.source_document_id);
        const loadId = text(entry.id);
        return documentId && loadId ? [[documentId, loadId] as const] : [];
      }),
    );
  }

  async listBoard(input: { companyId: string; accessToken: string }): Promise<DispatchBoardLoad[]> {
    const db = getSupabaseAuthenticatedUserClient(input.accessToken);
    const loadsResult = await db.from("loads").select("*").eq("company_id", input.companyId).order("updated_at", { ascending: false }).limit(250);
    if (loadsResult.error) throw new Error("Load operations are not available in this environment.");
    const loadRows = rows(loadsResult.data); if (!loadRows.length) return [];
    const ids = loadRows.map((entry) => text(entry.id)).filter(Boolean);
    const [stopsResult, assignmentsResult, financialsResult] = await Promise.all([
      db.from("load_stops").select("*").eq("company_id", input.companyId).in("load_id", ids).order("stop_sequence", { ascending: true }),
      db.from("load_assignments").select("*").eq("company_id", input.companyId).in("load_id", ids).is("ended_at", null),
      db.from("load_financials").select("*").eq("company_id", input.companyId).in("load_id", ids),
    ]);
    if (stopsResult.error || assignmentsResult.error) throw new Error("Authorized load details could not be loaded.");
    const stopRows = rows(stopsResult.data); const assignmentRows = rows(assignmentsResult.data);
    const financialRows = financialsResult.error ? [] : rows(financialsResult.data);
    return loadRows.map((load) => {
      const id = text(load.id); const stops = stopRows.filter((entry) => text(entry.load_id) === id);
      const assignment = assignmentRows.find((entry) => text(entry.load_id) === id);
      const financial = financialRows.find((entry) => text(entry.load_id) === id);
      const origin = stops.find((entry) => text(entry.stop_type) === "pickup") ?? stops[0];
      const destination = [...stops].reverse().find((entry) => text(entry.stop_type) === "delivery") ?? stops.at(-1);
      const nextStop = stops.find((entry) => !entry.departed_at);
      return { id, createdAt: text(load.created_at), loadNumber: text(load.load_number), status: loadStatus(load.status), pickupNumber: optionalText(load.pickup_number), brokerName: optionalText(load.broker_name), origin: stopLabel(origin), destination: stopLabel(destination), nextStopType: nextStop ? text(nextStop.stop_type) as DispatchBoardLoad["nextStopType"] : undefined, nextAppointmentAt: optionalText(nextStop?.appointment_at), nextAppointmentTimezone: optionalText(nextStop?.appointment_timezone), driverUserId: optionalText(assignment?.driver_user_id), truckUnit: optionalText(assignment?.truck_unit), trailerUnit: optionalText(assignment?.trailer_unit), currentLocation: optionalText(load.current_location), eta: optionalText(load.eta), nextCheckAt: optionalText(load.next_check_at), priority: priority(load.priority), exceptionSummary: optionalText(load.exception_summary), rateCents: numberValue(financial?.rate_cents), currency: optionalText(financial?.currency), miles: numberValue(load.miles) };
    });
  }

  async getDetail(input: { companyId: string; accessToken: string; loadId: string }): Promise<LoadDetail | null> {
    const db = getSupabaseAuthenticatedUserClient(input.accessToken);
    const [loadResult, stopsResult, assignmentsResult, eventsResult, financialResult] = await Promise.all([
      db.from("loads").select("*").eq("company_id", input.companyId).eq("id", input.loadId).maybeSingle(),
      db.from("load_stops").select("*").eq("company_id", input.companyId).eq("load_id", input.loadId).order("stop_sequence", { ascending: true }),
      db.from("load_assignments").select("*").eq("company_id", input.companyId).eq("load_id", input.loadId).is("ended_at", null).maybeSingle(),
      db.from("load_events").select("*").eq("company_id", input.companyId).eq("load_id", input.loadId).order("event_at", { ascending: false }).limit(250),
      db.from("load_financials").select("*").eq("company_id", input.companyId).eq("load_id", input.loadId).maybeSingle(),
    ]);
    if (loadResult.error) throw new Error("Load detail is not available.");
    const load = row(loadResult.data); if (!load) return null;
    if (stopsResult.error || assignmentsResult.error || eventsResult.error) throw new Error("Authorized load detail could not be loaded.");
    const stops = rows(stopsResult.data); const assignment = row(assignmentsResult.data);
    const financial = financialResult.error ? null : row(financialResult.data);
    const board = (await this.listBoard(input)).find((entry) => entry.id === input.loadId); if (!board) return null;
    let driverDisplayName: string | undefined;
    const driverUserId = optionalText(assignment?.driver_user_id);
    if (driverUserId) {
      const drivers = await this.listCompanyDrivers({ accessToken: input.accessToken }).catch(() => []);
      driverDisplayName = drivers.find((driver) => driver.userId === driverUserId)?.displayName;
    }
    return { ...board, brokerContact: optionalText(load.broker_contact), commodity: optionalText(load.commodity), weightLbs: numberValue(load.weight_lbs), equipmentType: optionalText(load.equipment_type), temperatureRequirement: optionalText(load.temperature_requirement), sealNumber: optionalText(load.seal_number), deliveryNumber: optionalText(load.delivery_number), specialInstructions: optionalText(load.special_instructions), emergencyRequirements: optionalText(load.emergency_requirements), rateCents: numberValue(financial?.rate_cents), currency: optionalText(financial?.currency), stops: stops.map((entry): LoadStopDetail => ({ id: text(entry.id), sequence: numberValue(entry.stop_sequence) ?? 0, type: text(entry.stop_type) as LoadStopDetail["type"], facilityName: optionalText(entry.facility_name), address: text(entry.address), city: text(entry.city), state: text(entry.state), appointmentAt: optionalText(entry.appointment_at), appointmentTimezone: optionalText(entry.appointment_timezone), referenceNumber: optionalText(entry.reference_number), arrivedAt: optionalText(entry.arrived_at), checkedInAt: optionalText(entry.checked_in_at), departedAt: optionalText(entry.departed_at) })), timeline: rows(eventsResult.data).map((entry): LoadTimelineEvent => ({ id: text(entry.id), type: text(entry.event_type), status: optionalText(entry.status), location: optionalText(entry.location), eta: optionalText(entry.eta), note: optionalText(entry.factual_note), source: text(entry.source), eventAt: text(entry.event_at) })), driverUserId, driverDisplayName, truckUnit: optionalText(assignment?.truck_unit), trailerUnit: optionalText(assignment?.trailer_unit) };
  }
}
