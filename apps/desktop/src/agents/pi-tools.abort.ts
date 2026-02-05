import type { AnyAgentTool } from "./pi-tools.types.js";

function throwAbortError(): never {
  const err = new Error("Aborted");
  err.name = "AbortError";
  throw err;
}

function combineAbortSignals(a?: AbortSignal, b?: AbortSignal): AbortSignal | undefined {
  if (!a && !b) return undefined;
  if (a && !b) return a;
  if (b && !a) return b;
  if (a?.aborted) return a;
  if (b?.aborted) return b;
  // Validate signals are AbortSignal instances before calling AbortSignal.any
  if (typeof AbortSignal.any === "function") {
    const validSignals = [a, b].filter((sig): sig is AbortSignal => sig instanceof AbortSignal);
    if (validSignals.length === 2) {
      return AbortSignal.any(validSignals);
    }
    // If only one valid signal, return it directly
    if (validSignals.length === 1) return validSignals[0];
  }
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  a?.addEventListener("abort", onAbort, { once: true });
  b?.addEventListener("abort", onAbort, { once: true });
  return controller.signal;
}

export function wrapToolWithAbortSignal(
  tool: AnyAgentTool,
  abortSignal?: AbortSignal,
): AnyAgentTool {
  if (!abortSignal) return tool;
  const execute = tool.execute;
  if (!execute) return tool;
  return {
    ...tool,
    execute: async (toolCallId, params, signal, onUpdate) => {
      const combined = combineAbortSignals(signal, abortSignal);
      if (combined?.aborted) throwAbortError();
      return await execute(toolCallId, params, combined, onUpdate);
    },
  };
}
