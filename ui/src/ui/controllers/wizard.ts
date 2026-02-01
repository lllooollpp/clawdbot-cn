import type { GatewayBrowserClient } from "../gateway";

export type WizardStepOption = {
  value: unknown;
  label: string;
  hint?: string;
};

export type WizardStep = {
  id: string;
  type: "note" | "select" | "text" | "confirm" | "multiselect" | "progress" | "action";
  title?: string;
  message?: string;
  options?: WizardStepOption[];
  initialValue?: unknown;
  placeholder?: string;
  sensitive?: boolean;
  executor?: "gateway" | "client";
};

export type WizardSessionStatus = "running" | "done" | "cancelled" | "error";

export type WizardStartResult = {
  sessionId: string;
  done: boolean;
  step?: WizardStep;
  status: WizardSessionStatus;
  error?: string;
};

export type WizardNextResult = {
  done: boolean;
  step?: WizardStep;
  status: WizardSessionStatus;
  error?: string;
};

export type WizardCancelResult = {
  status: WizardSessionStatus;
  error?: string;
};

export type WizardState = {
  client: GatewayBrowserClient | null;
  connected: boolean;
  onboardingWizardSessionId: string | null;
  onboardingWizardStep: WizardStep | null;
  onboardingWizardStatus: WizardSessionStatus | null;
  onboardingWizardError: string | null;
  onboardingWizardBusy: boolean;
  onboardingWizardDraft: unknown;
};

export function resolveWizardDraft(step: WizardStep | null): unknown {
  if (!step) return null;
  if (step.type === "select") {
    if (step.initialValue !== undefined) return step.initialValue;
    return step.options?.[0]?.value ?? null;
  }
  if (step.type === "multiselect") {
    return Array.isArray(step.initialValue) ? step.initialValue : [];
  }
  if (step.type === "confirm") {
    return typeof step.initialValue === "boolean" ? step.initialValue : false;
  }
  if (step.type === "text") {
    return typeof step.initialValue === "string" ? step.initialValue : "";
  }
  return step.initialValue ?? null;
}

export function applyWizardStep(state: WizardState, step: WizardStep | null) {
  state.onboardingWizardStep = step;
  state.onboardingWizardDraft = resolveWizardDraft(step);
}

export function applyWizardStartResult(state: WizardState, result: WizardStartResult) {
  state.onboardingWizardSessionId = result.sessionId;
  state.onboardingWizardStatus = result.status;
  state.onboardingWizardError = result.error ?? null;
  if (result.done) {
    state.onboardingWizardSessionId = null;
    applyWizardStep(state, null);
  } else {
    applyWizardStep(state, result.step ?? null);
  }
}

export function applyWizardNextResult(state: WizardState, result: WizardNextResult) {
  state.onboardingWizardStatus = result.status;
  state.onboardingWizardError = result.error ?? null;
  if (result.done) {
    state.onboardingWizardSessionId = null;
    applyWizardStep(state, null);
  } else {
    applyWizardStep(state, result.step ?? null);
  }
}

export async function startWizard(
  state: WizardState,
  params: { mode?: "local" | "remote"; workspace?: string } = { mode: "local" },
) {
  if (!state.client || !state.connected) return;
  state.onboardingWizardBusy = true;
  state.onboardingWizardError = null;
  try {
    const result = (await state.client.request(
      "wizard.start",
      params,
    )) as WizardStartResult;
    applyWizardStartResult(state, result);
  } catch (err) {
    state.onboardingWizardError = String(err);
  } finally {
    state.onboardingWizardBusy = false;
  }
}

export async function advanceWizard(state: WizardState, value?: unknown) {
  if (!state.client || !state.connected) return;
  const sessionId = state.onboardingWizardSessionId;
  const step = state.onboardingWizardStep;
  if (!sessionId || !step) return;
  state.onboardingWizardBusy = true;
  state.onboardingWizardError = null;
  try {
    const result = (await state.client.request("wizard.next", {
      sessionId,
      answer: { stepId: step.id, value },
    })) as WizardNextResult;
    applyWizardNextResult(state, result);
  } catch (err) {
    state.onboardingWizardError = String(err);
  } finally {
    state.onboardingWizardBusy = false;
  }
}

export async function cancelWizard(state: WizardState) {
  if (!state.client || !state.connected) return;
  const sessionId = state.onboardingWizardSessionId;
  if (!sessionId) return;
  state.onboardingWizardBusy = true;
  state.onboardingWizardError = null;
  try {
    const result = (await state.client.request("wizard.cancel", {
      sessionId,
    })) as WizardCancelResult;
    state.onboardingWizardStatus = result.status;
    state.onboardingWizardError = result.error ?? null;
    state.onboardingWizardSessionId = null;
    applyWizardStep(state, null);
  } catch (err) {
    state.onboardingWizardError = String(err);
  } finally {
    state.onboardingWizardBusy = false;
  }
}
