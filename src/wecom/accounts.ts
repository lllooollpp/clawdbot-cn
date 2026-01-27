import type { WeComAccountConfig, WeComConfig } from "../config/types.js";
import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "../routing/session-key.js";
import type { ResolvedWeComAccount } from "./types.js";

export function listWeComAccountIds(cfg: WeComConfig): string[] {
  const ids = new Set<string>();
  if (cfg.corpId) ids.add(DEFAULT_ACCOUNT_ID);
  if (cfg.accounts) {
    for (const id of Object.keys(cfg.accounts)) {
      ids.add(normalizeAccountId(id));
    }
  }
  return Array.from(ids);
}

export function resolveDefaultWeComAccountId(cfg: WeComConfig): string {
  if (cfg.defaultAccount) return normalizeAccountId(cfg.defaultAccount);
  if (cfg.corpId) return DEFAULT_ACCOUNT_ID;
  if (cfg.accounts) {
    const ids = Object.keys(cfg.accounts);
    if (ids.length > 0) return normalizeAccountId(ids[0]);
  }
  return DEFAULT_ACCOUNT_ID;
}

export function resolveWeComAccount(params: {
  cfg: WeComConfig;
  accountId?: string;
}): ResolvedWeComAccount {
  const accountId = normalizeAccountId(
    params.accountId ?? resolveDefaultWeComAccountId(params.cfg),
  );
  const base = params.cfg.accounts?.[accountId];

  const merged: WeComAccountConfig = {
    ...params.cfg,
    ...base,
  };

  return {
    id: accountId,
    name: merged.name ?? accountId,
    enabled: merged.enabled ?? true,
    corpId: merged.corpId ?? "",
    agentId: merged.agentId ?? "",
    secret: merged.secret ?? "",
    token: merged.token ?? "",
    encodingAesKey: merged.encodingAesKey ?? "",
    markdown: merged.markdown ?? { mode: "slack" },
    dmPolicy: merged.dmPolicy ?? "pairing",
    allowFrom: merged.allowFrom ?? [],
    groupPolicy: merged.groupPolicy ?? "allowlist",
    groups: merged.groups ?? {},
    historyLimit: merged.historyLimit ?? 20,
    dmHistoryLimit: merged.dmHistoryLimit ?? 20,
    textChunkLimit: merged.textChunkLimit ?? 2000,
    mediaMaxMb: merged.mediaMaxMb ?? 10,
    heartbeat: merged.heartbeat ?? { showOk: false, showAlerts: true, useIndicator: true },
    webhookPath: merged.webhookPath ?? "/wecom/events",
    dms: merged.dms ?? {},
  };
}
