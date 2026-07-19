import type {
  AlphToolDefinition,
  AlphToolId,
} from "@/lib/alph/tools/types";

const registry = new Map<AlphToolId, AlphToolDefinition>();

export function registerAlphTool(tool: AlphToolDefinition): void {
  if (registry.has(tool.id)) {
    throw new Error(`Alph tool already registered: ${tool.id}`);
  }
  registry.set(tool.id, tool);
}

export function getAlphTool(id: AlphToolId): AlphToolDefinition | undefined {
  return registry.get(id);
}

export function listAlphTools(): AlphToolDefinition[] {
  return Array.from(registry.values());
}

export function listAlphToolsByRisk(
  risk: AlphToolDefinition["risk"],
): AlphToolDefinition[] {
  return listAlphTools().filter((t) => t.risk === risk);
}

/** Idempotent registration for module reload / tests. */
export function registerAlphToolOnce(tool: AlphToolDefinition): void {
  if (!registry.has(tool.id)) {
    registry.set(tool.id, tool);
  }
}

export function clearAlphToolRegistryForTests(): void {
  registry.clear();
}
