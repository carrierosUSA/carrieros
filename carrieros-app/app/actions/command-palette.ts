"use server";

import { searchCommandPalette } from "@/lib/command-palette/search";
import type { CommandPaletteResult } from "@/lib/command-palette/types";
import { getActiveTenantId } from "@/lib/data/tenant";

export async function searchCommandPaletteAction(
  query: string,
): Promise<CommandPaletteResult[]> {
  const tenantId = getActiveTenantId();
  return searchCommandPalette(tenantId, query);
}
