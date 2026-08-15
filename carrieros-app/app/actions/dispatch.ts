"use server";
import { LoadOperationsRepository } from "@/lib/operations/load-repository";
import type { DispatchBoardLoad, LoadDetail } from "@/lib/operations/load-types";
import { requireDocumentAuth } from "@/lib/auth/supabase-server";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function getDispatchBoardAction(): Promise<{ ok: true; loads: DispatchBoardLoad[] } | { ok: false; error: string }> { try { const auth = await requireDocumentAuth(); const loads = await new LoadOperationsRepository().listBoard({ companyId: auth.companyId, accessToken: auth.accessToken }); return { ok: true, loads }; } catch { return { ok: false, error: "Live load data is not configured yet." }; } }
export async function getLoadDetailAction(loadId: string): Promise<{ ok: true; load: LoadDetail | null } | { ok: false; error: string }> { if (!UUID_PATTERN.test(loadId)) return { ok: false, error: "The load reference is invalid." }; try { const auth = await requireDocumentAuth(); const load = await new LoadOperationsRepository().getDetail({ companyId: auth.companyId, accessToken: auth.accessToken, loadId }); return { ok: true, load }; } catch { return { ok: false, error: "Authorized load detail is not available." }; } }
