import type { GatewayBrowserClient } from "../gateway";
import type {
  ConfigSchemaResponse,
  ConfigSnapshot,
  ConfigUiHints,
} from "../types";
import {
  cloneConfigObject,
  getPathValue,
  removePathValue,
  serializeConfigForm,
  setPathValue,
} from "./config/form-utils";

/** 字段保存状态 */
export type FieldSaveStatus = "idle" | "saving" | "saved" | "error";

/** 字段保存状态映射 (path => status) */
export type FieldSaveStatusMap = Map<string, FieldSaveStatus>;

/** 防抖定时器映射 (path => timeoutId) */
type DebounceTimerMap = Map<string, ReturnType<typeof setTimeout>>;

export type ConfigState = {
  client: GatewayBrowserClient | null;
  connected: boolean;
  applySessionKey: string;
  configLoading: boolean;
  configRaw: string;
  configRawOriginal: string;
  configValid: boolean | null;
  configIssues: unknown[];
  configSaving: boolean;
  configApplying: boolean;
  updateRunning: boolean;
  configSnapshot: ConfigSnapshot | null;
  configSchema: unknown | null;
  configSchemaVersion: string | null;
  configSchemaLoading: boolean;
  configUiHints: ConfigUiHints;
  configForm: Record<string, unknown> | null;
  configFormOriginal: Record<string, unknown> | null;
  configFormDirty: boolean;
  configFormMode: "form" | "raw";
  configSearchQuery: string;
  configActiveSection: string | null;
  configActiveSubsection: string | null;
  lastError: string | null;
  /** 字段级别保存状态 */
  fieldSaveStatus: FieldSaveStatusMap;
  /** 是否启用自动保存 */
  autoSaveEnabled: boolean;
};

/** 防抖定时器存储 (模块级别) */
const debounceTimers: DebounceTimerMap = new Map();

/** 自动保存延迟 (毫秒) */
const AUTO_SAVE_DELAY_MS = 1500;

/** 将路径数组转换为字符串键 */
function pathToKey(path: Array<string | number>): string {
  return path.join(".");
}

export async function loadConfig(state: ConfigState) {
  if (!state.client || !state.connected) return;
  state.configLoading = true;
  state.lastError = null;
  try {
    const res = (await state.client.request("config.get", {})) as ConfigSnapshot;
    applyConfigSnapshot(state, res);
  } catch (err) {
    state.lastError = String(err);
  } finally {
    state.configLoading = false;
  }
}

export async function loadConfigSchema(state: ConfigState) {
  if (!state.client || !state.connected) return;
  if (state.configSchemaLoading) return;
  state.configSchemaLoading = true;
  try {
    const res = (await state.client.request(
      "config.schema",
      {},
    )) as ConfigSchemaResponse;
    applyConfigSchema(state, res);
  } catch (err) {
    state.lastError = String(err);
  } finally {
    state.configSchemaLoading = false;
  }
}

export function applyConfigSchema(
  state: ConfigState,
  res: ConfigSchemaResponse,
) {
  state.configSchema = res.schema ?? null;
  state.configUiHints = res.uiHints ?? {};
  state.configSchemaVersion = res.version ?? null;
}

export function applyConfigSnapshot(state: ConfigState, snapshot: ConfigSnapshot) {
  state.configSnapshot = snapshot;
  const rawFromSnapshot =
    typeof snapshot.raw === "string"
      ? snapshot.raw
      : snapshot.config && typeof snapshot.config === "object"
        ? serializeConfigForm(snapshot.config as Record<string, unknown>)
        : state.configRaw;
  if (!state.configFormDirty || state.configFormMode === "raw") {
    state.configRaw = rawFromSnapshot;
  } else if (state.configForm) {
    state.configRaw = serializeConfigForm(state.configForm);
  } else {
    state.configRaw = rawFromSnapshot;
  }
  state.configValid = typeof snapshot.valid === "boolean" ? snapshot.valid : null;
  state.configIssues = Array.isArray(snapshot.issues) ? snapshot.issues : [];

  if (!state.configFormDirty) {
    state.configForm = cloneConfigObject(snapshot.config ?? {});
    state.configFormOriginal = cloneConfigObject(snapshot.config ?? {});
    state.configRawOriginal = rawFromSnapshot;
  }
}

export async function saveConfig(state: ConfigState) {
  if (!state.client || !state.connected) return;
  state.configSaving = true;
  state.lastError = null;
  try {
    const raw =
      state.configFormMode === "form" && state.configForm
        ? serializeConfigForm(state.configForm)
        : state.configRaw;
    const baseHash = state.configSnapshot?.hash;
    if (!baseHash) {
      state.lastError = "Config hash missing; reload and retry.";
      return;
    }
    await state.client.request("config.set", { raw, baseHash });
    state.configFormDirty = false;
    await loadConfig(state);
  } catch (err) {
    state.lastError = String(err);
  } finally {
    state.configSaving = false;
  }
}

export async function applyConfig(state: ConfigState) {
  if (!state.client || !state.connected) return;
  state.configApplying = true;
  state.lastError = null;
  try {
    const raw =
      state.configFormMode === "form" && state.configForm
        ? serializeConfigForm(state.configForm)
        : state.configRaw;
    const baseHash = state.configSnapshot?.hash;
    if (!baseHash) {
      state.lastError = "Config hash missing; reload and retry.";
      return;
    }
    await state.client.request("config.apply", {
      raw,
      baseHash,
      sessionKey: state.applySessionKey,
    });
    state.configFormDirty = false;
    await loadConfig(state);
  } catch (err) {
    state.lastError = String(err);
  } finally {
    state.configApplying = false;
  }
}

export async function runUpdate(state: ConfigState) {
  if (!state.client || !state.connected) return;
  state.updateRunning = true;
  state.lastError = null;
  try {
    await state.client.request("update.run", {
      sessionKey: state.applySessionKey,
    });
  } catch (err) {
    state.lastError = String(err);
  } finally {
    state.updateRunning = false;
  }
}

export function updateConfigFormValue(
  state: ConfigState,
  path: Array<string | number>,
  value: unknown,
) {
  const base = cloneConfigObject(
    state.configForm ?? state.configSnapshot?.config ?? {},
  );
  setPathValue(base, path, value);
  state.configForm = base;
  state.configFormDirty = true;
  if (state.configFormMode === "form") {
    state.configRaw = serializeConfigForm(base);
  }
}

export function removeConfigFormValue(
  state: ConfigState,
  path: Array<string | number>,
) {
  const base = cloneConfigObject(
    state.configForm ?? state.configSnapshot?.config ?? {},
  );
  removePathValue(base, path);
  state.configForm = base;
  state.configFormDirty = true;
  if (state.configFormMode === "form") {
    state.configRaw = serializeConfigForm(base);
  }
}

export async function discoverModels(state: ConfigState, provider: string) {
  if (!state.client || !state.connected || !state.configForm) return;

  // Find the config for this provider
  const modelsConfig = state.configForm.models as Record<string, any>;
  if (!modelsConfig || !modelsConfig.providers) return;

  const providerConfig = modelsConfig.providers[provider];
  if (!providerConfig) return;

  state.configSaving = true; // Use simple state for loading indicator
  state.lastError = null;

  try {
    const res = await state.client.request("models.discover", {
      provider,
      apiKey: providerConfig.apiKey,
      baseUrl: providerConfig.baseUrl,
    });

    if (res && Array.isArray(res.models) && res.models.length > 0) {
      // Update the models list for this provider
      // We merge them or replace? Dify replaces/updates.
      // Let's replace for now, or maybe append new ones. 
      // User likely wants the full list.
      const existingModels = providerConfig.models ?? [];
      const newModels = res.models;
      
      // Update the form
      updateConfigFormValue(state, ["models", "providers", provider, "models"], newModels);
      return { success: true, count: newModels.length };
    } else {
      state.lastError = "No models found or error during discovery.";
      return { success: false, error: state.lastError };
    }
  } catch (err) {
    state.lastError = String(err);
    return { success: false, error: state.lastError };
  } finally {
    state.configSaving = false;
  }
}

/**
 * 使用 config.patch API 保存单个配置路径的值
 * 这会立即保存到磁盘，不需要点击全局保存按钮
 */
export async function patchConfigField(
  state: ConfigState,
  path: Array<string | number>,
  value: unknown,
): Promise<{ success: boolean; error?: string }> {
  if (!state.client || !state.connected) {
    return { success: false, error: "未连接到网关" };
  }

  const baseHash = state.configSnapshot?.hash;
  if (!baseHash) {
    return { success: false, error: "配置哈希缺失，请重新加载" };
  }

  const key = pathToKey(path);
  state.fieldSaveStatus.set(key, "saving");

  try {
    // 构建部分配置对象
    const patchObj: Record<string, unknown> = {};
    let current: Record<string, unknown> = patchObj;
    for (let i = 0; i < path.length - 1; i++) {
      const segment = path[i];
      current[segment] = {};
      current = current[segment] as Record<string, unknown>;
    }
    const lastSegment = path[path.length - 1];
    current[lastSegment] = value;

    const raw = serializeConfigForm(patchObj);

    await state.client.request("config.patch", {
      raw,
      baseHash,
      note: `字段更新: ${key}`,
    });

    // 保存成功后更新状态
    state.fieldSaveStatus.set(key, "saved");
    
    // 重新加载配置以获取最新 hash
    await loadConfig(state);

    // 3 秒后清除 "saved" 状态
    setTimeout(() => {
      if (state.fieldSaveStatus.get(key) === "saved") {
        state.fieldSaveStatus.delete(key);
      }
    }, 3000);

    return { success: true };
  } catch (err) {
    state.fieldSaveStatus.set(key, "error");
    const errorMsg = String(err);
    state.lastError = errorMsg;
    return { success: false, error: errorMsg };
  }
}

/**
 * 调度自动保存 (带防抖)
 * 用户停止输入后延迟保存
 */
export function scheduleAutoSave(
  state: ConfigState,
  path: Array<string | number>,
  value: unknown,
  onSaveComplete?: (result: { success: boolean; error?: string }) => void,
): void {
  if (!state.autoSaveEnabled) return;

  const key = pathToKey(path);

  // 清除之前的定时器
  const existingTimer = debounceTimers.get(key);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  // 设置新的定时器
  const timer = setTimeout(async () => {
    debounceTimers.delete(key);
    const result = await patchConfigField(state, path, value);
    onSaveComplete?.(result);
  }, AUTO_SAVE_DELAY_MS);

  debounceTimers.set(key, timer);
}

/**
 * 取消指定路径的自动保存
 */
export function cancelAutoSave(path: Array<string | number>): void {
  const key = pathToKey(path);
  const timer = debounceTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    debounceTimers.delete(key);
  }
}

/**
 * 获取字段的保存状态
 */
export function getFieldSaveStatus(
  state: ConfigState,
  path: Array<string | number>,
): FieldSaveStatus {
  return state.fieldSaveStatus.get(pathToKey(path)) ?? "idle";
}

/**
 * 清除所有字段保存状态
 */
export function clearAllFieldSaveStatus(state: ConfigState): void {
  state.fieldSaveStatus.clear();
  // 清除所有待处理的自动保存
  for (const timer of debounceTimers.values()) {
    clearTimeout(timer);
  }
  debounceTimers.clear();
}

/**
 * 创建默认的配置状态初始值
 */
export function createDefaultConfigState(): Pick<ConfigState, "fieldSaveStatus" | "autoSaveEnabled"> {
  return {
    fieldSaveStatus: new Map(),
    autoSaveEnabled: true,
  };
}
