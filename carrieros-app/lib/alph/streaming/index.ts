/**
 * Streaming response foundation for Alph.
 * UI can consume AsyncGenerators; HTTP SSE can wrap the same events later.
 */

export type AlphStreamEvent =
  | { type: "status"; message: string }
  | { type: "token"; text: string }
  | { type: "tool_progress"; toolId: string; message: string }
  | { type: "citation"; citations: Array<{ type: string; id: string; label?: string }> }
  | { type: "approval_preview"; proposalId: string }
  | { type: "done"; model?: string; requestId: string }
  | { type: "error"; message: string }
  | { type: "cancelled" };

export type AlphStreamController = {
  cancelled: boolean;
  cancel: () => void;
};

export function createAlphStreamController(): AlphStreamController {
  const ctrl: AlphStreamController = {
    cancelled: false,
    cancel() {
      ctrl.cancelled = true;
    },
  };
  return ctrl;
}

/** Yield tokens with cancel support. */
export async function* streamTextChunks(
  text: string,
  ctrl?: AlphStreamController,
): AsyncGenerator<AlphStreamEvent> {
  const parts = text.split(/(\s+)/);
  for (const part of parts) {
    if (ctrl?.cancelled) {
      yield { type: "cancelled" };
      return;
    }
    if (!part) continue;
    yield { type: "token", text: part };
  }
}
